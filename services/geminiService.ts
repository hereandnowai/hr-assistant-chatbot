
import { GoogleGenAI, Chat, GenerateContentResponse, Part, GroundingChunk as GenAIGroundingChunk } from "@google/genai";
import { GEMINI_SYSTEM_INSTRUCTION, GEMINI_API_KEY_ERROR_MESSAGE, getLanguageName, SUPPORTED_LANGUAGES } from '../constants';
import { GeminiMessageContent } from "../types";

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

// Function to safely get API_KEY
const getApiKey = (): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env && typeof process.env.API_KEY === 'string') {
      return process.env.API_KEY;
    }
    return undefined;
  } catch (e) {
    console.warn("Error accessing process.env.API_KEY:", e);
    return undefined;
  }
};


export const isGeminiAvailable = (): boolean => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return false;
  }
  return true;
};

export const initializeChat = async (): Promise<boolean> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    chatSession = null; 
    return false;
  }
  try {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: apiKey });
    }
    
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash-preview-04-17',
      config: {
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
      },
    });
    console.log("Gemini chat session initialized or re-initialized.");
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini chat:", error);
    ai = null; 
    chatSession = null; 
    return false;
  }
};

export async function* sendMessageToGeminiStream(
  messageContent: GeminiMessageContent
): AsyncGenerator<{ text?: string; error?: string; groundingChunks?: GenAIGroundingChunk[] }> {
  if (!chatSession) {
    yield { error: "Chat session not initialized. Please try initializing or refreshing." };
    return;
  }

  try {
    const result = await chatSession.sendMessageStream({ message: messageContent });
    for await (const chunk of result) {
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      yield { text: chunk.text, groundingChunks: groundingChunks };
    }
  } catch (error: unknown) {
    console.error("Error sending message to Gemini:", error);
    if (error instanceof Error) {
      yield { error: `Gemini API Error: ${error.message}` };
    } else {
      yield { error: "An unknown error occurred with the Gemini API." };
    }
  }
}

export const fileToGenerativePart = async (file: File): Promise<Part | null> => {
  const supportedImageTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'];
  if (!supportedImageTypes.includes(file.type)) {
    console.warn(`File type ${file.type} may not be supported for direct image embedding.`);
  }
  
  const base64String = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      mimeType: file.type,
      data: base64String,
    },
  };
};

export const translateText = async (
  text: string,
  targetGeminiLangCode: string,
  sourceGeminiLangCode?: string
): Promise<string> => {
  if (!ai) {
    // Attempt to initialize ai if not already (e.g. if translate is called before chat)
    const apiKey = getApiKey();
    if (!apiKey) {
      console.error("API Key not available for translation service.");
      throw new Error("API Key not available for translation.");
    }
    ai = new GoogleGenAI({ apiKey });
  }

  const targetLangInfo = SUPPORTED_LANGUAGES.find(l => l.geminiLangCode === targetGeminiLangCode);
  const targetBcp47ForName = targetLangInfo ? targetLangInfo.code : targetGeminiLangCode;
  const targetLanguageName = getLanguageName(targetBcp47ForName) || targetGeminiLangCode;

  let prompt = `Translate the following text to ${targetLanguageName}. Output ONLY the translated text, without any additional explanations or conversation. Text to translate: "${text}"`;
  
  if (sourceGeminiLangCode) {
    const sourceLangInfo = SUPPORTED_LANGUAGES.find(l => l.geminiLangCode === sourceGeminiLangCode);
    const sourceBcp47ForName = sourceLangInfo ? sourceLangInfo.code : sourceGeminiLangCode;
    const sourceLanguageName = getLanguageName(sourceBcp47ForName) || sourceGeminiLangCode;
    prompt = `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. Output ONLY the translated text, without any additional explanations or conversation. Text to translate: "${text}"`;
  }
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17', // Or another suitable model for translation
      contents: prompt,
    });
    
    let translatedText = response.text.trim();
    
    const fenceRegex = /^```(?:\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = translatedText.match(fenceRegex);
    if (match && match[1]) {
      translatedText = match[1].trim();
    }

    return translatedText;
  } catch (error) {
    console.error(`Error translating text to ${targetGeminiLangCode}:`, error);
    throw new Error(`Failed to translate text. ${error instanceof Error ? error.message : ''}`);
  }
};
