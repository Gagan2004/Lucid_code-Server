// // src/routes/ask-ai.ts
// import { Router, Request, Response, NextFunction } from 'express';
// import dotenv from 'dotenv';
// import { Groq } from 'groq-sdk'; // Import Groq SDK
// // Import the specific message type from the SDK
// import { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';


// dotenv.config();

// const router = Router();

// // Initialize Groq client
// const groq = new Groq();

// // Define interfaces for the expected Groq API response structure (OpenAI-compatible)
// // These interfaces remain largely the same as the SDK returns compatible structures
// interface GroqMessage {
//   role: string;
//   content: string;
// }

// interface GroqChoice {
//   message: GroqMessage;
//   finish_reason: string;
//   index: number;
// }

// interface GroqCompletionResponse {
//   choices: GroqChoice[]; 
//   created: number;
//   id: string;
//   model: string;
//   object: string;
//   usage?: { // Usage might be optional in streaming chunks until final message
//     completion_tokens: number;
//     prompt_tokens: number;
//     total_tokens: number;
//   };
// }

// // Changed to a Groq-supported model.
// const GROQ_MODEL = 'llama3-8b-8192'; 

// // Guard clause if key is missing (Groq SDK will also throw if key is missing/invalid)
// if (!process.env.GROQ_API_KEY) {
//   console.warn('⚠️ Groq API key is missing. Set GROQ_API_KEY in your .env file');
// }

// router.post(
//   '/ask-ai',
//   async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//     const { prompt, mode } = req.body;

//     // Basic payload validation
//     if (typeof prompt !== 'string' || typeof mode !== 'string') {
//       res.status(400).json({ error: 'Invalid payload. "prompt" and "mode" must be strings.' });
//       return;
//     }

//     // Add client-side prompt length validation (rough estimate for token limit)
//     // Llama-3-8B-Instruct has an 8192 token context window.
//     const MAX_PROMPT_CHARS = 30000; 
//     if (prompt.length > MAX_PROMPT_CHARS) {
//       res.status(400).json({ error: `Prompt too long. Maximum allowed characters is ${MAX_PROMPT_CHARS}.` });
//       return;
//     }

//     // Construct messages array for instruction-tuned models (OpenAI-compatible format)
//     // IMPORTANT: Explicitly type `messages` using the imported type
//     const messages: ChatCompletionMessageParam[] = [
//       { role: 'system', content: `You are an AI assistant operating in ${mode} mode.` },
//       { role: 'user', content: prompt },
//     ];

//     try {
//       // Use the Groq SDK's chat completions API
//       const chatCompletion = await groq.chat.completions.create({
//         model: GROQ_MODEL,
//         messages: messages, // Now 'messages' correctly matches the expected type
//         temperature: 0.7, 
//         max_tokens: 200,    
//         stream: true,     
//         stop: null        
//       });

//       let generatedText = '';
//       // Iterate over the streamed chunks and append content
//       for await (const chunk of chatCompletion) {
//         generatedText += chunk.choices[0]?.delta?.content || '';
//       }

//       res.status(200).json({ reply: generatedText.trim() });

//     } catch (err: any) {
//       const statusCode = err.status || 500; 
//       const errorMessage = err.message || 'Unknown error from Groq API';

//       console.error('🧠 Groq API Error:', errorMessage);
//       console.error('🧠 Groq API Error Details:', err); 

//       if (statusCode === 400) {
//         res.status(400).json({
//           error: 'Bad Request to AI service',
//           detail: `The AI service received an invalid request: ${errorMessage}. Please check your prompt and parameters.`,
//         });
//       } else if (statusCode === 401) {
//         res.status(401).json({
//           error: 'Unauthorized: Invalid Groq API Key',
//           detail: `Your Groq API key is invalid or missing. Please check your GROQ_API_KEY environment variable. Detail: ${errorMessage}.`
//         });
//       } else if (statusCode === 404) {
//         res.status(404).json({
//           error: 'AI Model Not Found or Unsupported',
//           detail: `The specified AI model (${GROQ_MODEL}) could not be found or is not supported by Groq. Detail: ${errorMessage}.` 
//         });
//       } else if (statusCode === 429) {
//         res.status(429).json({
//           error: 'Too Many Requests to AI service',
//           detail: `You have exceeded the rate limits for the Groq API. Please try again later. Detail: ${errorMessage}.` 
//         });
//       } else {
//         res.status(statusCode).json({
//           error: 'AI request failed',
//           detail: errorMessage,
//         });
//       }
//     }
//   }
// );

// // export default router;
// import express from 'express';
// // THIS LINE IS CRITICAL - ENSURE IT MATCHES EXACTLY:
// import { InferenceClient, InferenceOutputError } from "@huggingface/inference";
// import dotenv from 'dotenv';

// dotenv.config();

// const router = express.Router();

// // Initialize Hugging Face Inference Client
// // Ensure HF_TOKEN is set in your .env file
// const HF_TOKEN = process.env.HF_TOKEN;
// if (!HF_TOKEN) {
//     console.error("HF_TOKEN environment variable is not set.");
//     process.exit(1); // Exit or handle this more gracefully in a real app
// }

// const inference = new InferenceClient(HF_TOKEN);

// // Define the model to use and its provider
// // Using 'deepseek-ai/DeepSeek-R1-0528' and 'novita' provider as per your working example.
// // Ensure this model/provider combination is supported and available.
// const HF_CHAT_MODEL = "deepseek-ai/DeepSeek-R1-0528";
// const HF_PROVIDER = "novita";

// // THIS LINE IS CRITICAL - ENSURE IT MATCHES EXACTLY WITH EXPLICIT TYPES:
// router.post('/ask-ai', async (req: express.Request, res: express.Response) => {
//     const { prompt, mode } = req.body;

//     if (!prompt) {
//         return res.status(400).json({ error: 'Prompt is required.' });
//     }

//     let messages: { role: string; content: string }[] = [];

//     // Construct messages based on mode
//     switch (mode) {
//         case 'pseudocode':
//             messages.push(
//                 { role: "system", content: "You are an AI assistant that generates pseudocode for programming concepts. Provide clear, concise, and standard pseudocode. Do not include explanations, just the pseudocode." },
//                 { role: "user", content: prompt }
//             );
//             break;
//         case 'code':
//             messages.push(
//                 { role: "system", content: "You are an AI assistant that generates code snippets. Provide clean, functional code in a language appropriate for the prompt. Do not include explanations or extra text, just the code." },
//                 { role: "user", content: prompt }
//             );
//             break;
//         case 'explanation':
//             messages.push(
//                 { role: "system", content: "You are an AI assistant that provides clear and concise explanations of programming concepts. Focus on the core idea and avoid jargon where possible. Answer in plain language." },
//                 { role: "user", content: prompt }
//             );
//             break;
//         case 'text_generation':
//             messages.push(
//                 { role: "user", content: prompt } // For general text generation, no specific system role
//             );
//             break;
//         default:
//             return res.status(400).json({ error: 'Invalid mode specified. Supported modes: pseudocode, code, explanation, text_generation.' });
//     }

//     try {
//         const chatCompletion = await inference.chatCompletion({
//             provider: HF_PROVIDER,
//             model: HF_CHAT_MODEL,
//             messages: messages,
//             // You can add other parameters here if needed, e.g., max_tokens, temperature
//             // max_tokens: 200,
//             // temperature: 0.7,
//         });

//         // Robust check for chatCompletion content before processing
//         let desiredContent: string = '[No content generated or unexpected response format]';
//         if (chatCompletion && chatCompletion.choices && chatCompletion.choices.length > 0 && chatCompletion.choices[0].message && typeof chatCompletion.choices[0].message.content === 'string') {
//             const fullContent = chatCompletion.choices[0].message.content;
//             const endThinkTag = '</think>';
//             const startIndex = fullContent.indexOf(endThinkTag);

//             if (startIndex !== -1) {
//                 desiredContent = fullContent.substring(startIndex + endThinkTag.length).trim();
//             } else {
//                 desiredContent = fullContent.trim(); // Use full content if no tag
//             }
//         } else {
//             console.error("AI response data structure was unexpected:", JSON.stringify(chatCompletion));
//             return res.status(500).json({ error: "AI response content was empty or malformed." });
//         }

//         // CRITICAL: Ensure 'return' is here for consistency
//         return res.json({ response: desiredContent });

//     } catch (error: any) {
//         console.error("Error calling Hugging Face Inference API:", error);

//         // CRITICAL: Ensure 'return' and correct error class (InferenceOutputError)
//         if (error instanceof InferenceOutputError) {
//             return res.status(503).json({
//                 error: "AI Model Temporary Unavailable",
//                 detail: `The AI model is currently loading or temporarily unavailable or had an output issue. Please try again in a few moments. Detail: ${error.message}.`,
//             });
//         } else if (error && typeof error.statusCode === 'number') { // Check for status code directly on the error object
//             switch (error.statusCode) {
//                 case 400:
//                     return res.status(400).json({
//                         error: "Bad Request to AI Model",
//                         detail: `Invalid request parameters sent to the AI model. Detail: ${error.message}.`,
//                     });
//                 case 401:
//                 case 403:
//                     return res.status(error.statusCode).json({
//                         error: "Authentication Error or Forbidden",
//                         detail: `Check your Hugging Face API token or permissions. Detail: ${error.message}.`,
//                     });
//                 case 404:
//                     return res.status(404).json({
//                         error: "AI Model Not Found or Unsupported",
//                         detail: `The specified AI model (${HF_CHAT_MODEL} with provider ${HF_PROVIDER}) could not be found or is not supported by the Inference API. This may require a configuration change. Detail: ${error.message}.`,
//                     });
//                 case 429:
//                     return res.status(429).json({
//                         error: "Rate Limit Exceeded",
//                         detail: `You have exceeded the rate limits for the Hugging Face Inference API. Please try again later or consider upgrading your plan for higher limits. Detail: ${error.message}.`,
//                     });
//                 case 500:
//                     return res.status(500).json({
//                         error: "AI Service Internal Error",
//                         detail: `The Hugging Face Inference API encountered an internal error. Detail: ${error.message}.`,
//                     });
//                 default:
//                     return res.status(error.statusCode || 500).json({
//                         error: "Unknown AI Service Error",
//                         detail: `An unexpected error occurred with the AI service. Status: ${error.statusCode || 'N/A'}, Detail: ${error.message}.`,
//                     });
//             }
//         } else {
//             return res.status(500).json({
//                 error: "Internal Server Error",
//                 detail: `An unexpected error occurred: ${error.message || "Unknown error"}.`,
//             });
//         }
//     }
// });

// export default router;


// Updated to use Groq API instead of Hugging Face
import express from 'express';
import { Groq } from 'groq-sdk';
import { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';

require('dotenv').config();
const router = express.Router();

if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY environment variable is not set.");
  process.exit(1);
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = 'llama3-8b-8192';

router.post('/ask-ai', async (req: express.Request, res: express.Response) => {
  const { prompt, mode } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required and must be a string.' });
  }

  let messages: ChatCompletionMessageParam[] = [];

  switch (mode) {
    case 'pseudocode':
      messages.push(
        { role: "system", content: "You are an AI assistant that generates pseudocode for programming concepts. Provide clear, concise, and standard pseudocode. Do not include explanations, just the pseudocode." },
        { role: "user", content: prompt }
      );
      break;
    case 'code':
      messages.push(
        { role: "system", content: "You are an AI assistant that generates code snippets. Provide clean, functional code in a language appropriate for the prompt. Do not include explanations or extra text, just the code." },
        { role: "user", content: prompt }
      );
      break;
    case 'explanation':
      messages.push(
        { role: "system", content: "You are an AI assistant that provides clear and concise explanations of programming concepts. Focus on the core idea and avoid jargon where possible. Answer in plain language." },
        { role: "user", content: prompt }
      );
      break;
    case 'text_generation':
      messages.push(
        { role: "user", content: prompt }
      );
      break;
    default:
      return res.status(400).json({ error: 'Invalid mode specified. Supported modes: pseudocode, code, explanation, text_generation.' });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 300,
      stream: true
      
    });

    let responseText = '';
    for await (const chunk of completion) {
      responseText += chunk.choices[0]?.delta?.content || '';
    }

    return res.json({ response: responseText.trim() });
  } catch (error: any) {
    console.error('Error calling Groq API:', error);
    const status = error.status || 500;
    const message = error.message || 'Unexpected error from Groq API';

    return res.status(status).json({
      error: 'AI request failed',
      detail: message
    });
  }
});

export default router;
