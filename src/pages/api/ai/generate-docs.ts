import type { APIRoute } from 'astro';
import { verifyToken } from '../../../lib/auth/jwt';

// Hugging Face API function
async function generateWithHuggingFace(apiKey: string, systemPrompt: string, userPrompt: string, chatHistory: any[]) {
  try {
    // Build conversation
    let conversationText = systemPrompt + '\n\n';
    
    // Add chat history
    chatHistory.forEach((msg: any) => {
      conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
    });
    
    // Add current prompt
    conversationText += `User: ${userPrompt}\n\nAssistant:`;

    // Use Mistral-7B-Instruct (good for documentation, free)
    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: conversationText,
          parameters: {
            max_new_tokens: 4096,
            temperature: 0.7,
            top_p: 0.95,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    let generatedText = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      generatedText = data[0].generated_text;
    } else if (data.generated_text) {
      generatedText = data.generated_text;
    } else if (typeof data === 'string') {
      generatedText = data;
    }

    if (!generatedText) {
      throw new Error('No content generated from Hugging Face');
    }

    return {
      success: true,
      markdown: generatedText.trim(),
    };
  } catch (error) {
    console.error('Hugging Face generation error:', error);
    throw error;
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const token = cookies.get('auth_token')?.value;
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const payload = verifyToken(token);
    if (!payload || (payload.role !== 'instructor' && payload.role !== 'super_admin')) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { prompt, chatHistory = [] } = await request.json();
    
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build system prompt first
    const systemPrompt = `You are an expert technical documentation writer. Generate comprehensive, well-structured markdown documentation.

CRITICAL FORMATTING RULES - MUST FOLLOW EXACTLY:

1. Use :::en and :::hi blocks for bilingual content
2. ALWAYS use ## (h2) for main topic headings
3. Write Hindi content in Hinglish (Hindi using ONLY English/Roman letters)
4. NEVER EVER use Devanagari script (हिंदी, वेरिएबल, etc.)

EXACT FORMAT TO FOLLOW:

:::en

## Topic Name

English content here with proper paragraphs.

More English content with blank lines between paragraphs.

### Subtopic

More English content.

\`\`\`javascript
// Code examples
\`\`\`

:::

:::hi

## Topic Name (Hinglish)

Hinglish content yahan likho. Sirf English letters use karo.

Aur content blank lines ke saath.

### Subtopic (Hinglish)

Aur Hinglish content.

\`\`\`javascript
// Code examples (same as English)
\`\`\`

:::

HINGLISH RULES - EXTREMELY IMPORTANT:
- NEVER use Devanagari script (हिंदी, वेरिएबल, कंटेनर, etc.)
- ONLY use English/Roman letters for ALL Hindi content
- Example: "Variables ek container hai" NOT "वेरिएबल एक कंटेनर है"
- Example: "JavaScript mein" NOT "जावास्क्रिप्ट में"
- Example: "Aap variables ko declare kar sakte ho" NOT "आप वेरिएबल को डिक्लेयर कर सकते हो"
- Example: "Yeh function kya karta hai" NOT "यह फंक्शन क्या करता है"

STRUCTURE:
- Start with :::en block
- Write complete English documentation
- End with :::
- Start :::hi block
- Write complete Hinglish translation (same structure, English letters only)
- End with :::

Include:
- Clear explanations
- Code examples (same in both languages)
- Practical use cases
- Best practices
- Proper spacing between sections

REMEMBER: ALL Hindi content must use ONLY English/Roman letters (Hinglish). ABSOLUTELY NO Devanagari script anywhere.

Generate markdown documentation based on the user's request.`;

    // Enhance user prompt automatically
    const enhancedPrompt = `${prompt}

IMPORTANT FORMATTING REQUIREMENTS:
- Use :::en block for all English content
- Use :::hi block for all Hinglish content
- Write Hindi content using ONLY English/Roman letters (Hinglish)
- Example Hinglish: "Variables ek container hai" NOT "वेरिएबल एक कंटेनर है"
- Include code examples in both blocks
- Use ## for main headings
- Add proper spacing between sections

Generate comprehensive bilingual documentation following this format.`;

    const hfApiKey = import.meta.env.HUGGINGFACE_API_KEY;
    const geminiApiKey = import.meta.env.GEMINI_API_KEY;

    // Try Hugging Face first (free, unlimited)
    if (hfApiKey && hfApiKey !== 'your-huggingface-api-key-here') {
      try {
        const result = await generateWithHuggingFace(hfApiKey, systemPrompt, enhancedPrompt, chatHistory);
        if (result.success) {
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } catch (error) {
        console.log('Hugging Face failed, trying Gemini...', error);
      }
    }

    // Fallback to Gemini
    if (!geminiApiKey || geminiApiKey === 'your-gemini-api-key-here') {
      return new Response(JSON.stringify({ 
        error: 'No AI API key configured. Please add HUGGINGFACE_API_KEY or GEMINI_API_KEY to your .env file. Get Hugging Face key (free, unlimited) from https://huggingface.co/settings/tokens' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepare messages for Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I will generate comprehensive markdown documentation following these rules, with proper ## headings for topics and bilingual support when needed.' }]
      }
    ];

    // Add chat history
    chatHistory.forEach((msg: any) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Add current prompt
    contents.push({
      role: 'user',
      parts: [{ text: enhancedPrompt }]
    });

    // Call Gemini API with retry logic and exponential backoff
    const apiKey = geminiApiKey;
    let retries = 5; // Increased from 3 to 5
    let lastError;
    let waitTime = 2000; // Start with 2 seconds
    
    while (retries > 0) {
      try {
        // Try primary model first (gemini-2.5-flash)
        let modelName = 'gemini-2.5-flash';
        
        // If we've already retried twice, try alternative model
        if (retries <= 3) {
          modelName = 'gemini-2.0-flash'; // Fallback to older model
        }
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents,
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error?.message || 'Unknown error';
          const errorCode = errorData.error?.code;
          
          // Check for quota exceeded error (429)
          if (errorCode === 429 || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            return new Response(JSON.stringify({ 
              error: 'API quota exceeded. The free tier has daily limits. Please try again tomorrow or upgrade your API key at https://ai.google.dev/pricing. You can also use manual editing in the meantime.' 
            }), {
              status: 429,
              headers: { 'Content-Type': 'application/json' },
            });
          }
          
          // Check if it's a high demand or overloaded error
          if (errorMessage.includes('high demand') || 
              errorMessage.includes('overloaded') || 
              errorMessage.includes('UNAVAILABLE') ||
              response.status === 503) {
            lastError = errorMessage;
            retries--;
            
            if (retries > 0) {
              console.log(`Gemini API busy, retrying in ${waitTime/1000}s... (${retries} attempts left)`);
              // Wait with exponential backoff
              await new Promise(resolve => setTimeout(resolve, waitTime));
              // Increase wait time for next retry (exponential backoff)
              waitTime = Math.min(waitTime * 2, 30000); // Max 30 seconds
              continue;
            }
          }
          
          console.error('Gemini API error:', errorData);
          return new Response(JSON.stringify({ 
            error: `Gemini API error: ${errorMessage}` 
          }), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const data = await response.json();
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!generatedText) {
          return new Response(JSON.stringify({ error: 'No content generated' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          markdown: generatedText 
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
        
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError.message : 'Network error';
        retries--;
        
        if (retries > 0) {
          console.log(`Network error, retrying in ${waitTime/1000}s... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          waitTime = Math.min(waitTime * 2, 30000);
          continue;
        }
      }
    }
    
    // If all retries failed
    return new Response(JSON.stringify({ 
      error: `The AI service is currently experiencing high demand. We tried 5 times over ${(waitTime * 2 - 2000) / 1000} seconds but couldn't connect. Please try again in a few minutes. Last error: ${lastError}` 
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
