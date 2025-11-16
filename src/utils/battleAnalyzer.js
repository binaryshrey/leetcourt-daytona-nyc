/**
 * Battle Analyzer - Generates strategic insights from conversation analysis
 * Uses GPT-5 to analyze transcript and generate notes, evidence, and precedents
 */

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

/**
 * Analyzes the battle transcript and generates strategic notes, evidence, and precedents
 * using GPT-5 for intelligent legal analysis
 */
export async function generateBattleInsights(caseData, transcript) {
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not configured');
    return null;
  }

  if (!transcript || transcript.length < 3) {
    return null; // Need at least 3 exchanges for meaningful analysis
  }

  try {
    const conversationText = transcript
      .slice(-10) // Last 10 messages for context
      .map(entry => `${entry.speaker}: ${entry.text}`)
      .join('\n\n');

    const prompt = `You are an expert legal analyst reviewing a courtroom battle. Analyze the following conversation and generate strategic insights.

CASE INFORMATION:
Title: ${caseData.title}
Type: ${caseData.case_type}
Legal Issue: ${caseData.issue}
Facts: ${caseData.facts}
Statutes: ${caseData.statutes || 'Not specified'}

RECENT CONVERSATION:
${conversationText}

Based on this conversation, generate a JSON response with the following structure:

{
  "notes": "Strategic analysis of the arguments presented, strengths and weaknesses identified, tactical recommendations (2-3 sentences)",
  "evidence": [
    {
      "name": "Evidence item name",
      "content": "Brief description of what this evidence shows",
      "type": "document|video|testimony|physical",
      "relevance": "How this relates to the discussion (1 sentence)"
    }
  ],
  "precedents": [
    "Case Name v. Defendant (Year) - Brief explanation of how this precedent applies"
  ]
}

REQUIREMENTS:
- Generate 2-4 relevant evidence items based on the conversation topics
- Include 2-3 applicable precedents that relate to arguments made
- Notes should be tactical and specific to what was discussed
- Evidence should be realistic and case-appropriate
- Precedents should be real cases when possible
- Focus on what was actually discussed in the conversation
- Keep descriptions concise but informative

Return ONLY valid JSON, no markdown formatting.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'LeetCourt'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a legal analyst AI that generates strategic insights in JSON format. Always return valid JSON without markdown code blocks.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }
    
    const insights = JSON.parse(jsonText);
    
    return {
      notes: insights.notes || '',
      evidence: Array.isArray(insights.evidence) ? insights.evidence : [],
      precedents: Array.isArray(insights.precedents) ? insights.precedents : []
    };

  } catch (error) {
    console.error('Error generating battle insights:', error);
    return null;
  }
}
