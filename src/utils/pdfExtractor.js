// PDF extraction and case generation using OpenRouter LLM

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Extract text from PDF file using pdf.js
 */
export const extractTextFromPDF = async (file) => {
  try {
    // Dynamically import pdfjs-dist
    const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs?url');
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
};

/**
 * Calculate required max_tokens based on PDF text length
 */
const calculateMaxTokens = (pdfText) => {
  // Rough estimate: 1 token ≈ 4 characters for English text
  // Add 50% buffer for JSON formatting and ensure minimum/maximum bounds
  const estimatedInputTokens = Math.ceil(pdfText.length / 4);
  const outputTokens = Math.min(Math.max(2000, estimatedInputTokens * 0.5), 8000);
  return Math.ceil(outputTokens);
};

/**
 * Generate structured case data from PDF text using OpenRouter LLM with retry logic
 */
export const generateCaseFromText = async (pdfText, retryCount = 0) => {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    throw new Error('OpenRouter API key not configured. Please set VITE_OPENROUTER_API_KEY in .env file');
  }

  // Truncate extremely long PDFs to prevent context overflow
  const maxInputLength = 50000; // Approximately 12,500 tokens
  const truncatedText = pdfText.length > maxInputLength 
    ? pdfText.substring(0, maxInputLength) + '\n\n[Document truncated due to length...]'
    : pdfText;

  const prompt = `You are a legal case analyzer. Extract and structure the following legal case document into a JSON format.

IMPORTANT: You must respond with ONLY a valid JSON object, no additional text or explanation.

Required JSON structure:
{
  "title": "Case name (e.g., 'People v. Carter')",
  "case_type": "One of: criminal, civil, or torts",
  "difficulty": "Number from 1-5 (1=easiest, 5=hardest)",
  "issue": "Main legal issue (concise, under 100 chars)",
  "description": "Brief description of what the case is about",
  "facts": "Detailed case facts (2-3 sentences)",
  "statutes": "Relevant statutes, laws, and regulations cited",
  "burden_of_proof": "The burden of proof standard for this case",
  "user_argument": "A strong prosecution/plaintiff argument (1-2 sentences)",
  "defense_thesis": "A strong defense/defendant counter-argument (1-2 sentences)",
  "notes": "Strategic notes, key points, weaknesses, and tactical considerations for both sides (2-3 sentences)",
  "evidence": [
    {"name": "Evidence name", "content": "Evidence description", "type": "document/video/testimony"}
  ],
  "precedents": [
    "Case citation with year and brief description"
  ]
}

Legal Case Document:
${truncatedText}

Respond with ONLY the JSON object:`;

  // Calculate dynamic max_tokens based on input length
  const maxTokens = calculateMaxTokens(truncatedText);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'LeetCourt Case Analyzer'
      },
      body: JSON.stringify({
        model: 'openai/gpt-5.1', // High-quality model for legal analysis
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent structured output
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || response.statusText;
      
      // Check if it's a token limit error and retry with adjusted tokens
      if ((errorMessage.includes('max_tokens') || errorMessage.includes('context_length')) && retryCount < 2) {
        // Reduce max_tokens by 30% and retry
        const adjustedMaxTokens = Math.floor(maxTokens * 0.7);
        return generateCaseFromText(pdfText, retryCount + 1);
      }
      
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenRouter API');
    }

    // Extract JSON from response (handle cases where LLM adds markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```\n?/g, '');
    }

    const caseData = JSON.parse(jsonContent);

    // Validate required fields
    const requiredFields = ['title', 'case_type', 'issue', 'facts', 'statutes', 'burden_of_proof', 'user_argument', 'defense_thesis'];
    for (const field of requiredFields) {
      if (!caseData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Ensure arrays exist
    if (!Array.isArray(caseData.evidence)) {
      caseData.evidence = [];
    }
    if (!Array.isArray(caseData.precedents)) {
      caseData.precedents = [];
    }

    // Set defaults
    if (!caseData.difficulty) {
      caseData.difficulty = 3;
    }
    if (!caseData.description) {
      caseData.description = caseData.issue;
    }

    return caseData;

  } catch (error) {
    console.error('Error generating case from text:', error);
    throw new Error('Failed to generate case data: ' + error.message);
  }
};

/**
 * Main function to process PDF and generate case
 */
export const processPDFAndGenerateCase = async (file) => {
  try {
    // Step 1: Extract text from PDF
    const pdfText = await extractTextFromPDF(file);
    
    if (!pdfText || pdfText.trim().length < 100) {
      throw new Error('Insufficient text extracted from PDF. The document may be empty or image-based.');
    }

    // Step 2: Generate structured case data from text
    const caseData = await generateCaseFromText(pdfText);
    
    return caseData;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};
