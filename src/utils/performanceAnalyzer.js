/**
 * LLM-powered performance analyzer for courtroom arguments
 */

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const analyzeUserPerformance = async (userArguments, currentCase, currentBattle) => {
  const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  if (!OPENROUTER_API_KEY || !userArguments || !currentBattle) {
    return null;
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
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
      const errorData = await response.json();
      console.error('OpenRouter API error:', errorData);
      return null;
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) return null;

    // Parse JSON response, removing any markdown formatting
    const cleanContent = content.replace(/```json\n?|```/g, '').trim();
    const analysis = JSON.parse(cleanContent);

    return analysis;

  } catch (error) {
    console.error('Error analyzing performance:', error);
    return null;
  }
};

export const analyzeAIStrategy = (aiText) => {
  const text = aiText.toLowerCase();
  
  const aggressiveWords = [
    'clearly', 'undoubtedly', 'absolutely', 'unequivocally', 'categorically',
    'emphatically', 'indisputably', 'patently', 'manifestly', 'obviously',
    'conclusively', 'definitively', 'must', 'shall', 'demand', 'insist',
    'reject', 'refute', 'false', 'wrong', 'fails', 'frivolous'
  ];
  const aggressiveCount = aggressiveWords.filter(word => text.includes(word)).length;
  const aggression = Math.min(100, (aggressiveCount / aggressiveWords.length) * 300 + 30);

  const legalIndicators = [
    'v.', 'vs.', 'precedent', 'case law', 'court held', 'established',
    'ruling', 'decision', 'holding', 'supreme court', 'circuit',
    'doctrine', 'standard', 'test', 'principle', 'statute',
    'section', 'amendment', 'article', 'code', 'regulation'
  ];
  const precedentCount = legalIndicators.filter(indicator => text.includes(indicator)).length;
  const precedentUse = Math.min(100, (precedentCount / legalIndicators.length) * 250 + 20);

  const confidentWords = [
    'will', 'proven', 'demonstrates', 'shows', 'establishes', 'confirms',
    'evidence', 'fact', 'clearly', 'certainly', 'undoubtedly'
  ];
  const hedgingWords = [
    'may', 'might', 'could', 'perhaps', 'possibly', 'arguably',
    'suggests', 'appears', 'seems', 'likely'
  ];
  
  const confidentCount = confidentWords.filter(word => text.includes(word)).length;
  const hedgingCount = hedgingWords.filter(word => text.includes(word)).length;
  
  const baseConfidence = (confidentCount / confidentWords.length) * 100;
  const hedgingPenalty = (hedgingCount / hedgingWords.length) * 40;
  const confidence = Math.max(30, Math.min(100, baseConfidence - hedgingPenalty + 40));

  return {
    aggression: Math.round(aggression),
    precedentUse: Math.round(precedentUse),
    confidence: Math.round(confidence)
  };
};
