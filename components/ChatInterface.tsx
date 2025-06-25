
import React, { useState, useEffect, useRef } from 'react';
import { 
    ChatMessage, 
    // MessageSender, // No longer directly used for logic here
    // GroundingChunk as AppGroundingChunk, // No longer directly used for logic here
} from '../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { FAQS, GEMINI_API_KEY_ERROR_MESSAGE, FAILED_TO_INITIALIZE_ERROR_MESSAGE, BRAND_CONFIG } from '../constants';
import { AlertTriangle, Search, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  isGeminiInitialized: boolean;
  apiKeyError: boolean;
  showQuickActions: boolean;
  chatContainerHeightClass?: string;
  isDark: boolean; 
  selectedLanguageCode: string;
  onLanguageChange: (languageCode: string) => void;
  onSpeechError: (errorMessage: string) => void;
  speakingMessageId: string | null;
  onRequestToSpeak: (message: ChatMessage) => void;
  onStopSpeaking: () => void;
  ttsSupported: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isGeminiInitialized,
  apiKeyError,
  showQuickActions,
  chatContainerHeightClass = "h-full",
  isDark,
  selectedLanguageCode,
  onLanguageChange,
  onSpeechError,
  speakingMessageId,
  onRequestToSpeak,
  onStopSpeaking,
  ttsSupported
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isQuickQuestionsExpanded, setIsQuickQuestionsExpanded] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, searchTerm, isQuickQuestionsExpanded]);

  const handleQuickAction = (query: string) => {
    onSendMessage(query);
    setIsQuickQuestionsExpanded(false);
  };

  const toggleQuickQuestions = () => {
    setIsQuickQuestionsExpanded(!isQuickQuestionsExpanded);
  };

  const filteredMessages = messages.filter(msg => 
    msg.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (msg.fileName && msg.fileName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayError = apiKeyError ? GEMINI_API_KEY_ERROR_MESSAGE : (!isGeminiInitialized && !isLoading ? FAILED_TO_INITIALIZE_ERROR_MESSAGE : null);

  const quickQuestionsBarBgColor = BRAND_CONFIG.colors.primary;
  const quickQuestionsBarTextColor = BRAND_CONFIG.colors.secondary;

  const questionButtonBgColor = BRAND_CONFIG.colors.secondary;
  const questionButtonTextColor = BRAND_CONFIG.colors.primary;
  const questionButtonBorderColor = BRAND_CONFIG.colors.primary;


  return (
    <div className={`flex flex-col flex-grow bg-gray-50 shadow-lg rounded-lg overflow-hidden ${chatContainerHeightClass} ${isDark ? 'dark-theme-chat-interface' : ''}`}>
      <div className="p-3 md:p-4 border-b border-gray-300">
        <div className="relative">
          <input
            type="text"
            placeholder="Search messages in this session..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#FFDF00] focus:border-[#FFDF00] text-sm bg-white text-black placeholder-gray-500"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className={`flex-grow p-3 md:p-6 space-y-4 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        {filteredMessages.length === 0 && searchTerm && (
          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Search size={48} className="mx-auto mb-2" />
            No messages found for "{searchTerm}".
          </div>
        )}
        {filteredMessages.length === 0 && !searchTerm && messages.length <= 1 && isLoading && ( 
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Initializing assistant or loading...</div>
        )}
        {filteredMessages.length === 0 && !searchTerm && displayError && (
             <div className="text-center text-red-500 py-8">{displayError}</div>
         )}
        {filteredMessages.map(msg => (
          <MessageBubble 
            key={msg.id} 
            message={msg}
            speakingMessageId={speakingMessageId}
            onRequestToSpeak={onRequestToSpeak}
            onStopSpeaking={onStopSpeaking}
            ttsSupported={ttsSupported}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {displayError && !apiKeyError && !isLoading && ( 
           <div className={`p-4 border-b text-sm flex items-center ${isDark ? 'bg-red-900 border-red-700 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
             <AlertTriangle size={20} className="mr-2"/> {displayError}
           </div>
        )}

        {isGeminiInitialized && showQuickActions && (
          <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={toggleQuickQuestions}
              className="w-full flex justify-between items-center p-3 text-sm font-medium focus:outline-none"
              style={{
                backgroundColor: quickQuestionsBarBgColor,
                color: quickQuestionsBarTextColor,
                // Apply border radius conditionally based on expanded state
                borderBottomLeftRadius: isQuickQuestionsExpanded ? '0' : '0.5rem', 
                borderBottomRightRadius: isQuickQuestionsExpanded ? '0' : '0.5rem',
              }}
              aria-expanded={isQuickQuestionsExpanded}
              aria-controls="quick-questions-list"
            >
              <span>{isQuickQuestionsExpanded ? 'Hide Quick Questions' : 'Show Quick Questions'}</span>
              {isQuickQuestionsExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {isQuickQuestionsExpanded && (
              <div
                id="quick-questions-list"
                className="p-3 overflow-x-auto whitespace-nowrap no-scrollbar"
                style={{
                  backgroundColor: quickQuestionsBarBgColor,
                  // Ensure bottom radius only if it's the last element shown
                  borderBottomLeftRadius: '0.5rem',
                  borderBottomRightRadius: '0.5rem',
                }}
              >
                <div className="flex space-x-2">
                  {FAQS.slice(0, 10).map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleQuickAction(faq.question)}
                      className="text-xs font-medium py-2 px-4 rounded-full shadow-sm border transition-transform transform hover:scale-105"
                      style={{
                        backgroundColor: questionButtonBgColor,
                        color: questionButtonTextColor,
                        borderColor: questionButtonBorderColor,
                      }}
                    >
                      {faq.question}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <ChatInput 
            onSendMessage={onSendMessage} 
            isLoading={isLoading || !isGeminiInitialized}
            selectedLanguageCode={selectedLanguageCode}
            onLanguageChange={onLanguageChange}
            onSpeechError={onSpeechError}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
