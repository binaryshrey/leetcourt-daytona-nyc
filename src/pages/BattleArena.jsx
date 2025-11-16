import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Mic, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ArgumentBubble from "@/components/battle/ArgumentBubble";
import JudgeReaction from "@/components/battle/JudgeReaction";
import ScoreTracker from "@/components/battle/ScoreTracker";
import CaseTimeline from "@/components/battle/CaseTimeline";
import ToolsPanel from "@/components/battle/ToolsPanel";
import { analyzeUserPerformance, analyzeAIStrategy } from "@/utils/performanceAnalyzer";
import { generateBattleInsights } from "@/utils/battleAnalyzer";

const STAGE_CONFIGS = {
  opening: {
    title: "Opening Statements",
    description: "Present your theory of the case and what you intend to prove",
    aiPrompt: (caseData, userArgument) => `You are an expert AI prosecutor in a legal case. The case is: "${caseData?.title}" with issue: "${caseData?.issue}".

This is the OPENING STATEMENT phase. The defense just argued: "${userArgument}"

Provide a strong prosecutorial opening statement in 2-3 sentences. Focus on:
- Your theory of the case
- What the evidence will show
- Why the defendant's actions were wrong

Be persuasive and cite legal principles. Format: plain text only.`,
    turnsRequired: 2, // Both sides need to give opening statements
  },
  direct: {
    title: "Direct Examination",
    description: "Question your witnesses to establish facts favorable to your case",
    aiPrompt: (caseData, userArgument) => `You are an expert AI prosecutor conducting DIRECT EXAMINATION in the case: "${caseData?.title}".

The defense just made this statement/question: "${userArgument}"

As the prosecutor, ask a direct examination question to YOUR OWN witness. The question should:
- Be open-ended to let the witness explain
- Establish key facts for your case
- Build on previous testimony
- Reference specific evidence

Format your response as a question to the witness. Keep it 1-2 sentences. Plain text only.`,
    turnsRequired: 999, // User controls when to end with "That's all Your Honor"
  },
  cross: {
    title: "Cross Examination",
    description: "Challenge the opposing side's witnesses and evidence",
    aiPrompt: (caseData, userArgument) => `You are an expert AI prosecutor conducting CROSS EXAMINATION in the case: "${caseData?.title}".

The defense just asked: "${userArgument}"

Now ask YOUR cross-examination question to the DEFENSE's witness. Your question should:
- Be leading (suggesting the answer)
- Challenge credibility or expose inconsistencies
- Limit the witness's ability to explain
- Undermine the defense's case

Format your response as a pointed cross-examination question. Keep it 1-2 sentences. Plain text only.`,
    turnsRequired: 999, // User controls when to end with "That's all Your Honor"
  },
  closing: {
    title: "Closing Arguments",
    description: "Summarize your case and persuade the jury",
    aiPrompt: (caseData, userArgument) => `You are an expert AI prosecutor giving your CLOSING ARGUMENT in the case: "${caseData?.title}".

The defense just gave their closing: "${userArgument}"

Provide a powerful closing argument in 2-3 sentences:
- Summarize the key evidence
- Connect the dots for the jury
- Appeal to justice and legal principles
- Counter the defense's narrative

This is your final chance to persuade. Be compelling and cite case law. Format: plain text only.`,
    turnsRequired: 2,
  },
};

export default function BattleArena() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [transcript, setTranscript] = useState([]);
  const [currentCase, setCurrentCase] = useState(null);
  const [currentBattle, setCurrentBattle] = useState(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [showJudge, setShowJudge] = useState(false);
  const [judgeDecision, setJudgeDecision] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [aiStrategy, setAiStrategy] = useState({
    aggression: 0,
    precedentUse: 0,
    confidence: 0
  });
  const [stageTurnCount, setStageTurnCount] = useState(0);
  const [canAdvanceStage, setCanAdvanceStage] = useState(false);
  const [userTurnCount, setUserTurnCount] = useState(0);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const scrollRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const lastAnalysisRef = useRef(0);
  const analysisIntervalRef = useRef(null);

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => api.entities.Case.list(),
  });

  useEffect(() => {
    if (cases.length > 0 && !currentCase) {
      // Check if a specific case ID is provided in URL params
      const caseIdFromUrl = searchParams.get('caseId');
      
      let selectedCase;
      if (caseIdFromUrl) {
        // Use the specific case from URL parameter
        selectedCase = cases.find(c => c.id === caseIdFromUrl);
        if (!selectedCase) {
          selectedCase = cases[Math.floor(Math.random() * cases.length)];
        }
      } else {
        // No case ID specified, select random case
        selectedCase = cases[Math.floor(Math.random() * cases.length)];
      }
      
      setCurrentCase(selectedCase);
      initializeBattle(selectedCase);
    }
  }, [cases, searchParams]);

  useEffect(() => {
    if (currentBattle) {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentBattle]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [transcript]);

  // Poll and analyze conversation with LLM
  useEffect(() => {
    if (!currentBattle) return;

    const analyzeConversationWithLLM = async () => {
      // Get the ElevenLabs widget element
      const widget = document.querySelector('elevenlabs-convai');
      if (!widget) return;

      // Try to get conversation state from widget
      // ElevenLabs widget exposes conversation through shadow DOM or methods
      try {
        // Check if there are new messages since last analysis
        const now = Date.now();
        if (now - lastAnalysisRef.current < 5000) return; // Analyze every 5 seconds max

        // Get all transcript entries that are user messages
        const recentUserMessages = transcript
          .filter(t => t.speaker === "You" && !conversationHistoryRef.current.includes(t.timestamp))
          .slice(-3); // Last 3 user messages

        if (recentUserMessages.length === 0) return;

        // Mark these as analyzed
        recentUserMessages.forEach(msg => {
          conversationHistoryRef.current.push(msg.timestamp);
        });

        lastAnalysisRef.current = now;

        // Analyze with LLM
        const userArguments = recentUserMessages.map(m => m.text).join('\n\n');
        const analysis = await analyzeUserPerformance(userArguments, currentCase, currentBattle);
        
        if (analysis) {
          // Update user strategy display (shown in AI panel)
          setAiStrategy({
            aggression: analysis.aggression || 50,
            precedentUse: analysis.precedent || 50,
            confidence: analysis.confidence || 50
          });

          // Update scores
          if (analysis.category && analysis.score_change) {
            const currentCategoryScore = currentBattle[`score_${analysis.category}`] || 0;
            const newCategoryScore = Math.max(0, Math.min(100, currentCategoryScore + analysis.score_change));
            
            const logic = analysis.category === 'logic' ? newCategoryScore : (currentBattle.score_logic || 0);
            const persuasiveness = analysis.category === 'persuasiveness' ? newCategoryScore : (currentBattle.score_persuasiveness || 0);
            const precedent = analysis.category === 'precedent' ? newCategoryScore : (currentBattle.score_precedent || 0);
            const clarity = analysis.category === 'clarity' ? newCategoryScore : (currentBattle.score_clarity || 0);
            const newTotal = logic + persuasiveness + precedent + clarity;

            await api.entities.Battle.update(currentBattle.id, {
              [`score_${analysis.category}`]: newCategoryScore,
              total_score: newTotal,
            });

            const updatedBattle = await api.entities.Battle.list();
            const latest = updatedBattle.find((b) => b.id === currentBattle.id);
            if (latest) setCurrentBattle(latest);
          }

          // Handle objection detection
          if (analysis.objection_detected && analysis.objection_detected !== 'none') {
            handleObjection(analysis.objection_detected);
          }

          // Handle phase completion
          if (analysis.finish_phase && (currentBattle.stage === 'direct' || currentBattle.stage === 'cross')) {
            setCanAdvanceStage(true);
          }
        }

      } catch (error) {
        console.error('Error analyzing conversation:', error);
      }
    };

    // Start polling
    analysisIntervalRef.current = setInterval(analyzeConversationWithLLM, 3000);

    return () => {
      if (analysisIntervalRef.current) {
        clearInterval(analysisIntervalRef.current);
      }
    };
  }, [currentBattle, transcript]);

  // Listen to ElevenLabs conversation events for real-time transcript updates
  useEffect(() => {
    const handleConversationEvent = (event) => {
      // Handle different event types
      if (event.detail?.type === 'user_transcript' || event.detail?.message?.role === 'user') {
        const userText = event.detail?.text || event.detail?.message?.content;
        if (userText && userText.trim()) {
          handleUserSpeech(userText);
        }
      }
      
      if (event.detail?.type === 'agent_response' || event.detail?.message?.role === 'assistant') {
        const aiText = event.detail?.text || event.detail?.message?.content;
        if (aiText && aiText.trim()) {
          handleAIResponse(aiText);
        }
      }
    };

    // Listen for various ElevenLabs events
    window.addEventListener('elevenlabs-user-message', handleConversationEvent);
    window.addEventListener('elevenlabs-agent-message', handleConversationEvent);
    window.addEventListener('conversationMessage', handleConversationEvent);
    
    return () => {
      window.removeEventListener('elevenlabs-user-message', handleConversationEvent);
      window.removeEventListener('elevenlabs-agent-message', handleConversationEvent);
      window.removeEventListener('conversationMessage', handleConversationEvent);
    };
  }, [currentCase, currentBattle, stageTurnCount]);

  // Generate AI insights from conversation transcript
  const generateInsights = async () => {
    if (!currentCase || !currentBattle || transcript.length < 6) {
      return; // Need at least 3 exchanges to analyze
    }

    try {
      setGeneratingInsights(true);
      
      const insights = await generateBattleInsights(currentCase, transcript);
      
      if (insights) {
        // Update battle with AI-generated insights
        await api.entities.Battle.update(currentBattle.id, {
          battle_notes: insights.notes,
          battle_evidence: insights.evidence,
          battle_precedents: insights.precedents,
          insights_last_updated: new Date().toISOString()
        });

        // Update local battle state
        setCurrentBattle(prev => ({
          ...prev,
          battle_notes: insights.notes,
          battle_evidence: insights.evidence,
          battle_precedents: insights.precedents,
          insights_last_updated: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setGeneratingInsights(false);
    }
  };

  const initializeBattle = async (caseData) => {
    const battle = await api.entities.Battle.create({
      case_id: caseData.id,
      stage: "opening",
      battle_notes: "",
      battle_evidence: [],
      battle_precedents: [],
      insights_last_updated: null
    });
    setCurrentBattle(battle);
    setStageTurnCount(0);
    setUserTurnCount(0);

    const aiOpening = `Your Honor, counsel. In ${caseData.title}, the central issue is ${caseData.issue}. The evidence will clearly show that the defendant's actions were in direct violation of established precedent. The prosecution will prove beyond a reasonable doubt that justice demands accountability.`;
    
    setTranscript([
      { speaker: "AI Opposing Counsel", text: aiOpening, timestamp: new Date().toISOString() },
    ]);

    const strategy = analyzeAIStrategy(aiOpening);
    setAiStrategy(strategy);
  };

  const handleAdvanceStage = async () => {
    const stages = ["opening", "direct", "cross", "closing"];
    const currentIndex = stages.indexOf(currentBattle.stage);
    
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      
      await api.entities.Battle.update(currentBattle.id, {
        stage: nextStage,
      });

      const updatedBattle = { ...currentBattle, stage: nextStage };
      setCurrentBattle(updatedBattle);
      setStageTurnCount(0);
      setCanAdvanceStage(false);

      // Add transition message
      const stageConfig = STAGE_CONFIGS[nextStage];
      const transitionMessage = `--- ${stageConfig.title} Phase Begins ---\n${stageConfig.description}`;
      
      setTranscript((prev) => [
        ...prev,
        { speaker: "Court", text: transitionMessage, timestamp: new Date().toISOString(), isSystem: true },
      ]);

      // AI always starts examination phases with a question
      if (nextStage === "direct" || nextStage === "cross") {
        setTimeout(() => {
          generateAIResponse("I'm ready to begin the examination.", nextStage);
        }, 1000);
      }
    } else {
      // Case complete
      await api.entities.Battle.update(currentBattle.id, {
        status: "completed",
        duration_seconds: elapsedTime,
      });

      setTranscript((prev) => [
        ...prev,
        { 
          speaker: "Court", 
          text: "--- Case Complete ---\nBoth sides have presented their arguments. The court will now deliberate.", 
          timestamp: new Date().toISOString(), 
          isSystem: true 
        },
      ]);
    }
  };

  const handleFinishExamination = () => {
    setTranscript((prev) => [
      ...prev,
      { speaker: "You", text: "That's all, Your Honor.", timestamp: new Date().toISOString() },
    ]);
    
    // Mark stage as ready to advance after user finishes
    setTimeout(() => {
      setCanAdvanceStage(true);
    }, 500);
  };

  const generateAIResponse = async (userArgument, stage = null) => {
    const currentStage = stage || currentBattle.stage;
    const stageConfig = STAGE_CONFIGS[currentStage];

    try {
      const response = await api.integrations.Core.InvokeLLM({
        prompt: stageConfig.aiPrompt(currentCase, userArgument),
      });

      const aiResponse = response?.output || response || "I maintain my position, Your Honor.";

      setTimeout(() => {
        setTranscript((prev) => [
          ...prev,
          { speaker: "AI Opposing Counsel", text: aiResponse, timestamp: new Date().toISOString() },
        ]);
        setAiThinking(false);

        const newStrategy = analyzeAIStrategy(aiResponse);
        setAiStrategy(newStrategy);

        // Track turn count (for opening/closing which have fixed turns)
        const newTurnCount = stageTurnCount + 1;
        setStageTurnCount(newTurnCount);

        // For opening and closing, auto-advance after required turns
        if ((currentStage === 'opening' || currentStage === 'closing') && 
            newTurnCount >= stageConfig.turnsRequired) {
          setCanAdvanceStage(true);
        }
      }, 1500);
    } catch (error) {
      setAiThinking(false);
      console.error("Error generating AI response:", error);
    }
  };

  const handleSendArgument = async () => {
    if (!textInput.trim() || aiThinking) return;

    const userArgument = textInput;
    setTextInput("");

    const updatedTranscript = [
      ...transcript,
      { speaker: "You", text: userArgument, timestamp: new Date().toISOString() },
    ];
    setTranscript(updatedTranscript);
    setAiThinking(true);

    await generateAIResponse(userArgument);
    updateScores(userArgument);
  };

  const analyzeUserPerformance = async (userArguments) => {
    if (!userArguments || !currentBattle) return;

    const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) return;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'LeetCourt Performance Analyzer'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: `You are analyzing a lawyer's courtroom performance in the ${currentBattle.stage} phase of trial.

Case: ${currentCase?.title}
Issue: ${currentCase?.issue}
Current Stage: ${currentBattle.stage}

User's Recent Arguments:
${userArguments}

Analyze the user's performance and respond with ONLY a JSON object (no markdown, no explanation):
{
  "logic": <number 0-100>,
  "persuasiveness": <number 0-100>,
  "precedent": <number 0-100>,
  "clarity": <number 0-100>,
  "aggression": <number 0-100>,
  "confidence": <number 0-100>,
  "legal_reasoning": <number 0-100>,
  "category": "logic" | "persuasiveness" | "precedent" | "clarity",
  "score_change": <number -10 to 20>,
  "objection_detected": "none" | "hearsay" | "relevance" | "leading" | "speculation" | "foundation" | "argumentative",
  "finish_phase": <boolean>
}

Scoring Guidelines:
- Logic: Sound reasoning, cause-effect relationships, logical structure
- Persuasiveness: Emotional appeal, compelling language, conviction
- Precedent: Use of case law, statutes, legal principles
- Clarity: Clear communication, organized thoughts, concise points
- Aggression: Assertiveness, confidence, forceful language
- Confidence: Certainty, decisiveness, lack of hedging
- Legal Reasoning: Legal analysis depth

Detect objections if user says phrases like "objection hearsay", "objection relevance", etc.
Detect finish_phase if user says "that's all your honor", "no further questions", etc.`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        console.error('OpenRouter API error:', response.statusText);
        return;
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) return;

      // Parse JSON response
      const analysis = JSON.parse(content.replace(/```json\n?|```/g, '').trim());

      // Update user strategy display
      setAiStrategy({
        aggression: analysis.aggression || 50,
        precedentUse: analysis.precedent || 50,
        confidence: analysis.confidence || 50
      });

      // Update scores
      if (analysis.category && analysis.score_change) {
        const currentCategoryScore = currentBattle[`score_${analysis.category}`] || 0;
        const newCategoryScore = Math.max(0, Math.min(100, currentCategoryScore + analysis.score_change));
        
        const logic = analysis.category === 'logic' ? newCategoryScore : (currentBattle.score_logic || 0);
        const persuasiveness = analysis.category === 'persuasiveness' ? newCategoryScore : (currentBattle.score_persuasiveness || 0);
        const precedent = analysis.category === 'precedent' ? newCategoryScore : (currentBattle.score_precedent || 0);
        const clarity = analysis.category === 'clarity' ? newCategoryScore : (currentBattle.score_clarity || 0);
        const newTotal = logic + persuasiveness + precedent + clarity;

        await api.entities.Battle.update(currentBattle.id, {
          [`score_${analysis.category}`]: newCategoryScore,
          total_score: newTotal,
        });

        const updatedBattle = await api.entities.Battle.list();
        const latest = updatedBattle.find((b) => b.id === currentBattle.id);
        setCurrentBattle(latest);
      }

      // Handle objection detection
      if (analysis.objection_detected && analysis.objection_detected !== 'none') {
        handleObjection(analysis.objection_detected);
      }

      // Handle phase completion
      if (analysis.finish_phase && (currentBattle.stage === 'direct' || currentBattle.stage === 'cross')) {
        setCanAdvanceStage(true);
      }

    } catch (error) {
      console.error('Error analyzing performance:', error);
    }
  };

  const handleUserSpeech = (userText) => {
    if (!userText || !currentBattle) return;

    // Add to transcript
    setTranscript((prev) => [
      ...prev,
      { speaker: "You", text: userText, timestamp: new Date().toISOString() },
    ]);

    // Increment user turn count and check for auto-advance
    const newUserTurnCount = userTurnCount + 1;
    setUserTurnCount(newUserTurnCount);

    const currentStage = currentBattle.stage;
    
    // Auto-advance stages based on conversation progress
    // Opening: After 3 user turns, move to Direct
    if (currentStage === 'opening' && newUserTurnCount >= 3) {
      setTimeout(() => {
        handleAdvanceStage();
        setUserTurnCount(0);
      }, 3000);
    }
    
    // Direct: After 7 user turns, move to Cross
    if (currentStage === 'direct' && newUserTurnCount >= 7) {
      setTimeout(() => {
        handleAdvanceStage();
        setUserTurnCount(0);
      }, 3000);
    }
    
    // Cross: After 7 user turns, move to Closing
    if (currentStage === 'cross' && newUserTurnCount >= 7) {
      setTimeout(() => {
        handleAdvanceStage();
        setUserTurnCount(0);
      }, 3000);
    }

    // Closing: After 2 user turns, complete the case
    if (currentStage === 'closing' && newUserTurnCount >= 2) {
      setTimeout(() => {
        handleAdvanceStage();
        setUserTurnCount(0);
      }, 3000);
    }

    // Check for objection keywords
    const objectionKeywords = {
      'hearsay': /\b(hearsay|hear say)\b/i,
      'relevance': /\b(relevance|relevant|irrelevant)\b/i,
      'leading': /\b(leading|leading question)\b/i,
      'speculation': /\b(speculation|speculative|speculating)\b/i,
      'foundation': /\b(foundation|lacks foundation)\b/i,
      'argumentative': /\b(argumentative|arguing)\b/i,
    };

    for (const [type, pattern] of Object.entries(objectionKeywords)) {
      if (pattern.test(userText) && /\b(objection|object)\b/i.test(userText)) {
        handleObjection(type);
        return;
      }
    }

    // Check for stage advancement keywords
    const finishPhrases = [
      /that'?s all.*your honor/i,
      /no further questions/i,
      /rest my case/i,
      /nothing further/i,
      /pass the witness/i
    ];

    if (finishPhrases.some(pattern => pattern.test(userText))) {
      if (currentBattle.stage === 'direct' || currentBattle.stage === 'cross') {
        setTranscript((prev) => [
          ...prev,
          { 
            speaker: "Court", 
            text: "The court acknowledges. Please proceed to the next phase.", 
            timestamp: new Date().toISOString(),
            isSystem: true 
          },
        ]);
        setTimeout(() => {
          setCanAdvanceStage(true);
        }, 1000);
      }
      return;
    }

    // Analyze argument quality and update scores
    updateScores(userText);

    // Increment turn count
    const newTurnCount = stageTurnCount + 1;
    setStageTurnCount(newTurnCount);

    // Auto-advance for opening and closing after required turns
    const stageConfig = STAGE_CONFIGS[currentBattle.stage];
    if ((currentBattle.stage === 'opening' || currentBattle.stage === 'closing') && 
        newTurnCount >= stageConfig.turnsRequired) {
      setTimeout(() => {
        setCanAdvanceStage(true);
      }, 2000);
    }
  };

  const handleAIResponse = (aiText) => {
    if (!aiText || !currentBattle) return;

    // Add to transcript
    setTranscript((prev) => [
      ...prev,
      { speaker: "AI Opposing Counsel", text: aiText, timestamp: new Date().toISOString() },
    ]);

    // Analyze AI strategy
    const strategy = analyzeAIStrategy(aiText);
    setAiStrategy(strategy);

    // Generate insights every 5 conversation turns (10 messages total)
    if (transcript.length > 0 && (transcript.length + 1) % 10 === 0) {
      setTimeout(() => generateInsights(), 2000);
    }
  };

  const analyzeArgumentQuality = (argument) => {
    const text = argument.toLowerCase().trim();
    
    // Check for gibberish or very short arguments
    if (text.length < 10) {
      return { quality: 'poor', multiplier: -0.5 };
    }
    
    // Check for repeated characters (like "aaaa" or "111")
    const repeatedChars = /(.)\1{4,}/g;
    if (repeatedChars.test(text)) {
      return { quality: 'poor', multiplier: -0.5 };
    }
    
    // Check for random gibberish (low vowel ratio, random consonants)
    const vowels = text.match(/[aeiou]/g)?.length || 0;
    const consonants = text.match(/[bcdfghjklmnpqrstvwxyz]/g)?.length || 0;
    const vowelRatio = vowels / (vowels + consonants);
    
    if (vowelRatio < 0.15 && text.length > 20) {
      return { quality: 'poor', multiplier: -0.5 };
    }
    
    // Legal terms that indicate good arguments
    const legalTerms = [
      'evidence', 'precedent', 'case law', 'statute', 'amendment', 'court',
      'ruling', 'objection', 'testimony', 'witness', 'defendant', 'plaintiff',
      'your honor', 'counsel', 'establish', 'demonstrate', 'prove', 'violation',
      'constitutional', 'reasonable', 'standard', 'burden', 'duty', 'rights',
      'liability', 'damages', 'negligence', 'intent', 'miranda', 'jurisdiction'
    ];
    
    const legalTermCount = legalTerms.filter(term => text.includes(term)).length;
    
    // Argument structure indicators
    const hasQuestion = text.includes('?');
    const hasBecause = text.includes('because') || text.includes('therefore') || text.includes('thus');
    const hasContrast = text.includes('however') || text.includes('but') || text.includes('although');
    const hasEvidence = text.includes('show') || text.includes('prove') || text.includes('demonstrate');
    
    // Calculate quality score
    let qualityScore = 0;
    
    // Length bonus (up to 2 points)
    if (text.length > 50) qualityScore += 1;
    if (text.length > 100) qualityScore += 1;
    
    // Legal terms (up to 3 points)
    qualityScore += Math.min(legalTermCount * 0.5, 3);
    
    // Structure (up to 2 points)
    if (hasBecause) qualityScore += 0.5;
    if (hasContrast) qualityScore += 0.5;
    if (hasEvidence) qualityScore += 0.5;
    if (hasQuestion && currentBattle?.stage !== 'opening' && currentBattle?.stage !== 'closing') qualityScore += 0.5;
    
    // Determine quality tier
    if (qualityScore >= 5) {
      return { quality: 'excellent', multiplier: 1.5 };
    } else if (qualityScore >= 3) {
      return { quality: 'good', multiplier: 1.0 };
    } else if (qualityScore >= 1.5) {
      return { quality: 'fair', multiplier: 0.5 };
    } else {
      return { quality: 'poor', multiplier: -0.3 };
    }
  };

  const updateScores = async (argument) => {
    const analysis = analyzeArgumentQuality(argument);
    
    // Base score change based on quality
    const baseChange = analysis.multiplier > 0 ? 
      Math.floor(Math.random() * 8) + 5 : // 5-12 points for good arguments
      Math.floor(Math.random() * 5) + 3;   // 3-7 points lost for poor arguments
    
    const scoreChange = Math.floor(baseChange * analysis.multiplier);
    
    // Determine which category to update based on argument content
    const categories = {
      logic: ['because', 'therefore', 'thus', 'consequently', 'follows', 'reason'],
      persuasiveness: ['your honor', 'must', 'clearly', 'undoubtedly', 'compelling', 'justice'],
      precedent: ['case', 'precedent', 'court held', 'ruling', 'established', 'decision'],
      clarity: ['specifically', 'clearly', 'evidence shows', 'facts', 'witness', 'testimony']
    };
    
    const text = argument.toLowerCase();
    let bestCategory = 'logic';
    let maxMatches = 0;
    
    for (const [category, keywords] of Object.entries(categories)) {
      const matches = keywords.filter(word => text.includes(word)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
      }
    }
    
    // If no matches, use random category
    if (maxMatches === 0) {
      const categoryNames = Object.keys(categories);
      bestCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
    }
    
    // Calculate new scores with cap at 100 per category
    const currentCategoryScore = currentBattle[`score_${bestCategory}`] || 0;
    const newCategoryScore = Math.max(0, Math.min(100, currentCategoryScore + scoreChange));
    
    // Calculate new total (max 400 since 4 categories × 100)
    const logic = bestCategory === 'logic' ? newCategoryScore : (currentBattle.score_logic || 0);
    const persuasiveness = bestCategory === 'persuasiveness' ? newCategoryScore : (currentBattle.score_persuasiveness || 0);
    const precedent = bestCategory === 'precedent' ? newCategoryScore : (currentBattle.score_precedent || 0);
    const clarity = bestCategory === 'clarity' ? newCategoryScore : (currentBattle.score_clarity || 0);
    const newTotal = logic + persuasiveness + precedent + clarity;

    await api.entities.Battle.update(currentBattle.id, {
      [`score_${bestCategory}`]: newCategoryScore,
      total_score: newTotal,
    });

    const updatedBattle = await api.entities.Battle.list();
    const latest = updatedBattle.find((b) => b.id === currentBattle.id);
    setCurrentBattle(latest);
    
    // Show feedback for poor arguments
    if (analysis.quality === 'poor' && scoreChange < 0) {
      setTimeout(() => {
        setTranscript((prev) => [
          ...prev,
          { 
            speaker: "Judge", 
            text: "Counsel, that argument lacks substance. Please provide more substantive legal reasoning.", 
            timestamp: new Date().toISOString(),
            isSystem: true 
          },
        ]);
      }, 500);
    }
  };

  const handleObjection = async (objectionType) => {
    const sustained = Math.random() > 0.5;
    setJudgeDecision(sustained);
    setShowJudge(true);

    // Add objection to transcript
    setTranscript((prev) => [
      ...prev,
      { 
        speaker: "Judge", 
        text: sustained ? `Objection sustained. ${objectionType} is not permitted.` : `Objection overruled. You may proceed.`,
        timestamp: new Date().toISOString(),
        isSystem: true 
      },
    ]);

    await api.entities.Battle.update(currentBattle.id, {
      objections_raised: (currentBattle.objections_raised || 0) + 1,
      objections_sustained: sustained
        ? (currentBattle.objections_sustained || 0) + 1
        : currentBattle.objections_sustained || 0,
    });

    // Refresh battle state
    const updatedBattles = await api.entities.Battle.list();
    const latest = updatedBattles.find((b) => b.id === currentBattle.id);
    if (latest) setCurrentBattle(latest);

    if (sustained) {
      // Award points for successful objection
      const currentScore = currentBattle.score_clarity || 0;
      const newScore = Math.min(100, currentScore + 8);
      
      await api.entities.Battle.update(currentBattle.id, {
        score_clarity: newScore,
        total_score: (currentBattle.total_score || 0) + 8,
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStrategyLevel = (value) => {
    if (value >= 75) return "Very High";
    if (value >= 60) return "High";
    if (value >= 40) return "Moderate";
    if (value >= 25) return "Low";
    return "Very Low";
  };

  const getStrategyColor = (value) => {
    if (value >= 75) return "#ef4444";
    if (value >= 60) return "#f97316";
    if (value >= 40) return "#f59e0b";
    if (value >= 25) return "#10b981";
    return "#60a5fa";
  };

  if (!currentCase) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading case arena...</p>
        </div>
      </div>
    );
  }

  const currentStageConfig = STAGE_CONFIGS[currentBattle?.stage || "opening"];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
      <JudgeReaction
        show={showJudge}
        sustained={judgeDecision}
        onComplete={() => setShowJudge(false)}
      />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1f3a] to-[#151a2e] rounded-xl p-6 border border-[#d4af37]/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#f2c94c] mb-1">
              {currentCase.title}
            </h1>
            <p className="text-gray-400 text-sm">{currentCase.issue}</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs px-3 py-1 rounded-full bg-[#4a90e2]/20 text-[#60a5fa] border border-[#4a90e2]/30">
                {currentCase.case_type}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(elapsedTime)}
              </span>
            </div>
          </div>
          <Button
            onClick={() => navigate(createPageUrl("CaseLibrary"))}
            variant="outline"
            className="border-[#d4af37]/50 text-[#f2c94c] hover:bg-[#d4af37]/10"
          >
            Change Case
          </Button>
        </div>

        {/* Current Stage Info */}
        <div className="mb-4 p-4 bg-[#1a1f3a]/50 rounded-lg border border-[#4a90e2]/30">
          <h3 className="text-sm font-bold text-[#60a5fa] mb-1">{currentStageConfig.title}</h3>
          <p className="text-xs text-gray-400">{currentStageConfig.description}</p>
        </div>

        <CaseTimeline 
          currentStage={currentBattle?.stage || "opening"} 
          canAdvance={canAdvanceStage}
          onAdvanceStage={handleAdvanceStage}
        />
      </div>

      {/* Main Battle Area */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left: Case Tools */}
        <div className="lg:col-span-1 space-y-4">
          <ToolsPanel caseData={currentCase} battleData={currentBattle} />
          
          {generatingInsights && (
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent"></div>
              <p className="text-xs text-purple-300">Generating AI insights from conversation...</p>
            </div>
          )}
        </div>

        {/* Center: Voice AI Interface */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1a1f3a]/50 rounded-xl border border-[#d4af37]/20 flex flex-col">

            {/* Voice AI Interface */}
            <div className="p-6 border-t border-[#d4af37]/20 bg-gradient-to-br from-[#4a90e2]/10 to-[#d4af37]/5">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Mic className="w-5 h-5 text-[#f2c94c]" />
                  <h3 className="text-lg font-bold text-[#f2c94c]">Voice Argument Mode</h3>
                  <Mic className="w-5 h-5 text-[#f2c94c]" />
                </div>
                
                <div className="p-3 bg-[#1a1f3a]/50 rounded-lg border border-[#4a90e2]/30">
                  <p className="text-sm text-[#60a5fa] font-semibold mb-1">
                    {currentStageConfig.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {currentStageConfig.description}
                  </p>
                  {(currentBattle?.stage === 'direct' || currentBattle?.stage === 'cross') && (
                    <p className="text-xs text-[#f2c94c] mt-2">
                      💡 Say "That's all, Your Honor" when finished
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    🎙️ Voice commands: Say "Objection [type]" to raise objections
                  </p>
                </div>
                
                <div className="w-full flex justify-center items-center">
                  <div className="max-w-md w-full flex justify-center">
                    <elevenlabs-convai 
                      agent-id="agent_5001ka5q6f5sfbkt7v2ffdw17pkk"
                      dynamic-variables={JSON.stringify({
                        // Case Information
                        "_case_title_": currentCase?.title || "",
                        "_legal_issues_": currentCase?.issue || "",
                        "_case_facts_": currentCase?.facts || "",
                        "_statutes_": currentCase?.statutes || "",
                        "_precedents_": currentCase?.precedents?.join("; ") || "",
                        "_burden_of_proof_": currentCase?.burden_of_proof || "",
                        "_case_type_": currentCase?.case_type || "",
                        "_current_stage_": currentBattle?.stage || "opening",
                        
                        // Role Configuration
                        "_ai_role_": "Judge",
                        "_user_role_": "Prosecutor",
                        "_ai_name_": "The Honorable Margaret Chen",
                        "_user_name_": "Prosecutor",
                        "_judge_name_": "The Honorable Margaret Chen",
                        
                        // Arguments
                        "_user_argument_": currentCase?.user_argument || "",
                        "_one_sentence_thesis_": currentCase?.defense_thesis || "",
                        
                        // Judge Configuration
                        "_judge_temperament_": "balanced",
                        "_verdict_ready_": "false",
                        
                        // Mode Settings
                        "_aggression_mode_": "professional",
                        "_drama_mode_": "off"
                      })}
                    ></elevenlabs-convai>
                  </div>
                </div>
                
                {(currentBattle?.stage === 'direct' || currentBattle?.stage === 'cross') && !canAdvanceStage && (
                  <>
                    <div className="p-3 bg-[#1a1f3a]/50 rounded-lg border border-[#10b981]/30">
                      <p className="text-sm text-gray-300 mb-2">
                        Turns completed: <span className="text-[#10b981] font-bold">{stageTurnCount}</span>
                      </p>
                      {stageTurnCount < 3 ? (
                        <p className="text-xs text-gray-400">
                          Complete at least 3 exchanges (voice or button) to finish this phase
                        </p>
                      ) : (
                        <p className="text-xs text-[#10b981]">
                          ✓ Ready to advance - use voice or button below
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleFinishExamination}
                      disabled={aiThinking || stageTurnCount < 3}
                      className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:opacity-90 text-white disabled:opacity-50"
                    >
                      That's all, Your Honor (Manual)
                    </Button>
                  </>
                )}
                
                <div className="pt-2 border-t border-[#d4af37]/20">
                  <p className="text-xs text-gray-500 italic">
                    Present your arguments naturally with the ElevenLabs AI voice assistant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Performance Scores */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#1a1f3a]/50 rounded-xl p-6 border border-[#d4af37]/20">
            <ScoreTracker
              scores={{
                logic: currentBattle?.score_logic || 0,
                persuasiveness: currentBattle?.score_persuasiveness || 0,
                precedent: currentBattle?.score_precedent || 0,
                clarity: currentBattle?.score_clarity || 0,
              }}
            />

            <div className="mt-6 pt-4 border-t border-[#d4af37]/20">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#10b981]">
                    {currentBattle?.objections_sustained || 0}
                  </p>
                  <p className="text-xs text-gray-400">Sustained</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#ef4444]">
                    {(currentBattle?.objections_raised || 0) -
                      (currentBattle?.objections_sustained || 0)}
                  </p>
                  <p className="text-xs text-gray-400">Overruled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}