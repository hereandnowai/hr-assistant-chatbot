
export enum MessageSender {
  User = 'user',
  Bot = 'bot',
  System = 'system',
  Error = 'error',
}

export interface GroundingChunkWeb {
  uri: string;
  title?: string; // Made title optional
}

export interface GroundingChunkRetrievedPassage {
    uri: string;
    title?: string; // Made title optional
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  retrievedPassage?: GroundingChunkRetrievedPassage;
}
export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date; // Keep as Date object for easier manipulation
  imageUrl?: string; // For user-uploaded images (base64)
  fileName?: string; // For other user-uploaded files
  filePreviewUrl?: string; // For image previews client-side
  groundingChunks?: GroundingChunk[];
  lang?: string; // BCP 47 language code for the message text (for TTS)
}

export interface QuickAction {
  label: string;
  query: string;
}

// Define Part type based on Gemini SDK (simplified)
export interface InlineDataPart {
  inlineData: {
    mimeType: string;
    data: string; // base64
  };
}

export interface TextPart {
  text: string;
}

export type GeminiMessageContent = string | Array<TextPart | InlineDataPart>;

// Application Settings
export interface ApplicationSettings {
  showQuickActions: boolean;
  preferDarkBackground: boolean;
  selectedLanguageCode: string; // BCP 47 language code (e.g., 'en-US', 'fr-FR')
}

export type Page = 'home' | 'chat' | 'settings' | 'history';

// Chat History
export interface HistoricalChatSession {
  id: string;
  startTime: number; // Store as timestamp (Date.now()) for easier sorting/JSON
  title: string; // e.g., "Chat from [Date]" or first user message text
  messageCount: number;
  messages: ChatMessage[]; // Store messages with Date objects, convert to string on save if needed
}

export interface ChatHistory {
  sessions: HistoricalChatSession[];
}

// For JSON serialization, we might want a version of ChatMessage with string timestamps
export interface SerializableChatMessage extends Omit<ChatMessage, 'timestamp'> {
  timestamp: string; // ISO string
}

export interface SerializableHistoricalChatSession extends Omit<HistoricalChatSession, 'messages'> {
  messages: SerializableChatMessage[];
}

export interface SerializableChatHistory {
  sessions: SerializableHistoricalChatSession[];
}

// FAQ Types
export interface FaqItemType {
  id: string;
  question: string;
  answer: string;
}

// Language Support
export interface SupportedLanguage {
  code: string; // BCP 47 code (e.g., "en-US", "fr-FR")
  name: string; // Display name (e.g., "English (US)")
  geminiLangCode: string; // Language code for Gemini translation (e.g., "en", "fr")
}