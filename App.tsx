

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import HomePage from './components/HomePage';
import SettingsPage from './components/SettingsPage';
import HistoryPage from './components/HistoryPage';
import ToastNotification from './components/ToastNotification';
import { 
  BRAND_CONFIG, 
  SETTINGS_STORAGE_KEY, 
  DEFAULT_SETTINGS, 
  CHAT_HISTORY_STORAGE_KEY,
  getInitialBotMessage,
  BASE_INITIAL_BOT_MESSAGE_TEXT,
  GEMINI_API_KEY_ERROR_MESSAGE,
  FAILED_TO_INITIALIZE_ERROR_MESSAGE,
  SUPPORTED_LANGUAGES,
  getGeminiLangCode,
  TRANSLATION_ERROR_MESSAGE,
  // TTS_ERROR_MESSAGE, // No longer used directly for toast
  SPEECH_SYNTHESIS_NOT_SUPPORTED
} from './constants';
import { 
  ApplicationSettings, 
  Page, 
  ChatMessage, 
  MessageSender, 
  ChatHistory, 
  HistoricalChatSession,
  GeminiMessageContent,
  TextPart,
  InlineDataPart,
  GroundingChunk as AppGroundingChunk,
  SerializableChatHistory
} from './types';
import * as GeminiService from './services/geminiService';
import { GroundingChunk as GenAIGroundingChunk } from "@google/genai";
import { Linkedin, Instagram, Github, Twitter, Youtube, BookOpen } from 'lucide-react';

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-[#004040] hover:text-[#FFDF00] transition-colors"
  >
    {icon}
  </a>
);

const serializeChatHistory = (history: ChatHistory): SerializableChatHistory => {
  return {
    sessions: history.sessions.map(session => ({
      ...session,
      messages: session.messages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
    })),
  };
};

const deserializeChatHistory = (serializedHistory: SerializableChatHistory): ChatHistory => {
  return {
    sessions: serializedHistory.sessions.map(session => ({
      ...session,
      messages: session.messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    })),
  };
};


const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [settings, setSettings] = useState<ApplicationSettings>(DEFAULT_SETTINGS);
  const [chatInterfaceKey, setChatInterfaceKey] = useState<number>(Date.now());
  const [toastInfo, setToastInfo] = useState<{ message: string; isVisible: boolean }>({ message: '', isVisible: false });

  const [currentMessages, setCurrentMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistory>({ sessions: [] });
  const [isAppLoading, setIsAppLoading] = useState(false);
  const [isGeminiInitialized, setIsGeminiInitialized] = useState(false);
  const [apiKeyError, setApiKeyError] = useState(false);
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings) as ApplicationSettings;
        if (!SUPPORTED_LANGUAGES.find(lang => lang.code === parsedSettings.selectedLanguageCode)) {
            parsedSettings.selectedLanguageCode = DEFAULT_SETTINGS.selectedLanguageCode;
        }
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        localStorage.removeItem(SETTINGS_STORAGE_KEY); 
        setSettings(DEFAULT_SETTINGS);
      }
    }

    const storedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory) as SerializableChatHistory;
        setChatHistory(deserializeChatHistory(parsedHistory));
      } catch (error) {
        console.error("Failed to parse chat history from localStorage", error);
        localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
      }
    }
  }, []);
  
  const speakText = useCallback((
    text: string, 
    lang: string, 
    onEndCallback?: () => void, 
    onErrorCallback?: () => void
  ) => {
    if (!('speechSynthesis' in window)) {
      console.warn(SPEECH_SYNTHESIS_NOT_SUPPORTED);
      showToast(SPEECH_SYNTHESIS_NOT_SUPPORTED);
      onErrorCallback?.();
      return;
    }
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    const voices = window.speechSynthesis.getVoices();
    // Ensure voices are loaded (can be async)
    const setVoice = () => {
        const voice = voices.find(v => v.lang === lang) || voices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (voice) {
          utterance.voice = voice;
        } else {
            console.warn(`No specific voice found for language ${lang}. Using default.`);
        }
        speechUtteranceRef.current = utterance; // Store current utterance
        window.speechSynthesis.speak(utterance);
    };

    if (voices.length > 0) {
        setVoice();
    } else {
        // Voices might not be loaded immediately, listen for the event
        window.speechSynthesis.onvoiceschanged = () => {
            const updatedVoices = window.speechSynthesis.getVoices();
            const voice = updatedVoices.find(v => v.lang === lang) || updatedVoices.find(v => v.lang.startsWith(lang.split('-')[0]));
            if (voice) utterance.voice = voice;
            setVoice(); // Attempt to set voice again
            window.speechSynthesis.onvoiceschanged = null; // Clean up listener
        };
    }
    
    utterance.onend = () => {
      onEndCallback?.();
      speechUtteranceRef.current = null;
    };
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      console.error("SpeechSynthesisErrorEvent:", event); // Log the full event object
      
      let errorDetailMessage: string;
      if (typeof event.error === 'string') {
        // This is the expected case, event.error is an error code string like "network", "canceled", etc.
        errorDetailMessage = event.error;
      } else if (event.error && typeof event.error === 'object') {
        // Fallback if event.error is unexpectedly an object
        // Try to get a 'message' property, or stringify (might still be [object Object] but safer)
        errorDetailMessage = (event.error as any).message || JSON.stringify(event.error);
      } else {
        errorDetailMessage = "Unknown speech error occurred";
      }
      
      showToast(`Speech error: ${errorDetailMessage}`);
      onErrorCallback?.();
      speechUtteranceRef.current = null;
    };
  }, []);

  const handleRequestToSpeak = useCallback((messageToSpeak: ChatMessage) => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      // If cancelling the same message, don't immediately restart, effectively stopping it
      if (speakingMessageId === messageToSpeak.id) {
        setSpeakingMessageId(null);
        return;
      }
    }
    setSpeakingMessageId(messageToSpeak.id);
    speakText(
      messageToSpeak.text,
      messageToSpeak.lang || settings.selectedLanguageCode,
      () => setSpeakingMessageId(null),
      () => setSpeakingMessageId(null)
    );
  }, [speakText, settings.selectedLanguageCode, speakingMessageId]);

  const handleStopSpeaking = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  }, []);


  const initializeNewChatSession = useCallback(async (languageCode: string) => {
    console.log("Attempting to initialize new chat session in App.tsx for lang:", languageCode);
    setIsAppLoading(true);
    setApiKeyError(false);
    handleStopSpeaking(); // Stop any TTS from previous session

    let initialMessageText = BASE_INITIAL_BOT_MESSAGE_TEXT;
    if (languageCode !== 'en-US' && getGeminiLangCode(languageCode) !== 'en') {
        try {
            initialMessageText = await GeminiService.translateText(BASE_INITIAL_BOT_MESSAGE_TEXT, getGeminiLangCode(languageCode), 'en');
        } catch (e) {
            console.error("Failed to translate initial bot message:", e);
            // Use base English text if translation fails
        }
    }
    setCurrentMessages([getInitialBotMessage(languageCode, initialMessageText)]);
    // Do not auto-speak initial message based on new requirement


    if (!GeminiService.isGeminiAvailable()) {
      setApiKeyError(true);
      const errorMsg = getInitialBotMessage(languageCode, GEMINI_API_KEY_ERROR_MESSAGE);
      errorMsg.sender = MessageSender.Error;
      setCurrentMessages(prev => [...prev, errorMsg]);
      setIsGeminiInitialized(false);
      setIsAppLoading(false);
      // Do not auto-speak error message
      return;
    }

    const success = await GeminiService.initializeChat();
    if (success) {
      setIsGeminiInitialized(true);
    } else {
      const errorMsg = getInitialBotMessage(languageCode, FAILED_TO_INITIALIZE_ERROR_MESSAGE);
      errorMsg.sender = MessageSender.Error;
      setCurrentMessages(prev => [...prev, errorMsg]);
      setIsGeminiInitialized(false);
      // Do not auto-speak error message
    }
    setIsAppLoading(false);
  }, [handleStopSpeaking]); // Added handleStopSpeaking

  useEffect(() => {
    if (currentPage === 'chat' && currentMessages.length === 0) { 
      initializeNewChatSession(settings.selectedLanguageCode);
    }
  }, [currentPage, chatInterfaceKey, settings.selectedLanguageCode, initializeNewChatSession, currentMessages.length]);


  useEffect(() => {
    const appRoot = document.getElementById('app-container');
    // Body background is now handled by CSS in index.html
    // Only manage app-container classes for component-level theming
    if (appRoot) {
      if (settings.preferDarkBackground) {
        appRoot.classList.add('dark-theme-app-container');
        appRoot.classList.remove('light-theme-app-container');
      } else {
        appRoot.classList.add('light-theme-app-container');
        appRoot.classList.remove('dark-theme-app-container');
      }
    }
  }, [settings.preferDarkBackground]);

  const saveChatHistoryToStorage = useCallback(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(serializeChatHistory(chatHistory)));
    } catch (error) {
      console.error("Error saving chat history to localStorage:", error);
      showToast("Error: Could not save chat history. Storage might be full.");
    }
  }, [chatHistory]);

  useEffect(() => {
    if (chatHistory.sessions.length > 0 || localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)) {
        saveChatHistoryToStorage();
    }
  }, [chatHistory, saveChatHistoryToStorage]);

  const saveCurrentSessionIfNeeded = useCallback(() => {
    const isMeaningfulChat = currentMessages.length > 1 || 
                             (currentMessages.length === 1 && 
                              currentMessages[0].sender !== MessageSender.Bot && 
                              currentMessages[0].sender !== MessageSender.Error);

    if (isMeaningfulChat) {
      const sessionTitle = currentMessages.find(msg => msg.sender === MessageSender.User)?.text.substring(0, 50) + "..." 
                          || `Chat Session - ${new Date().toLocaleTimeString()}`;
      const newHistoricalSession: HistoricalChatSession = {
        id: `session-${Date.now()}`,
        startTime: currentMessages[0]?.timestamp.getTime() || Date.now(),
        title: sessionTitle,
        messageCount: currentMessages.length,
        messages: [...currentMessages],
      };
      setChatHistory(prev => ({ sessions: [...prev.sessions, newHistoricalSession] }));
      console.log('Session marked for saving to history state:', newHistoricalSession.id);
      return true;
    }
    return false;
  }, [currentMessages]);


  const handleNavigation = (page: Page) => {
    if (currentPage === 'chat' && page !== 'chat') {
      saveCurrentSessionIfNeeded();
      setCurrentMessages([]); 
      handleStopSpeaking();
    }
    setSelectedHistorySessionId(null);
    setCurrentPage(page);
    if (page === 'chat') {
        setChatInterfaceKey(Date.now()); 
    }
  };
  
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (currentPage === 'chat') {
        saveCurrentSessionIfNeeded();
        // TTS will be stopped by browser on unload naturally
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentPage, saveCurrentSessionIfNeeded]);


  const showToast = (message: string) => {
    setToastInfo({ message, isVisible: true });
  };

  const handleSaveSettings = (newSettings: ApplicationSettings) => {
    const prevLang = settings.selectedLanguageCode;
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    showToast("Settings saved successfully!");
    if (newSettings.selectedLanguageCode !== prevLang && currentPage === 'chat') {
        saveCurrentSessionIfNeeded(); 
        setCurrentMessages([]); 
        setChatInterfaceKey(Date.now()); 
        handleStopSpeaking();
    }
  };
  
  const handleLanguageChangeInChat = (newLangCode: string) => {
    if (settings.selectedLanguageCode !== newLangCode) {
        handleSaveSettings({...settings, selectedLanguageCode: newLangCode });
    }
  };

  const handleEndCurrentSessionAndStartNew = () => {
    saveCurrentSessionIfNeeded();
    setCurrentMessages([]); 
    setChatInterfaceKey(Date.now()); 
    handleStopSpeaking();
    if (currentPage !== 'chat') setCurrentPage('chat'); 
    showToast("Current chat session ended. New session started.");
  };

  const handleSendMessageInApp = async (text: string, file?: File) => {
    const currentLang = settings.selectedLanguageCode;
    const currentGeminiLang = getGeminiLangCode(currentLang);
    handleStopSpeaking(); // Stop any speaking before sending new message

    if (!isGeminiInitialized && !apiKeyError) {
      const errorMsg = getInitialBotMessage(currentLang, FAILED_TO_INITIALIZE_ERROR_MESSAGE);
      errorMsg.sender = MessageSender.Error;
      setCurrentMessages(prev => [...prev, errorMsg]);
      setIsAppLoading(false); // Ensure loading is stopped
      return;
    }
    if (apiKeyError) {
       const errorMsg = getInitialBotMessage(currentLang, GEMINI_API_KEY_ERROR_MESSAGE);
       errorMsg.sender = MessageSender.Error;
       setCurrentMessages(prev => [...prev, errorMsg]);
       setIsAppLoading(false); // Ensure loading is stopped
       return;
    }

    const userMessageId = 'user-' + Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMessageId,
      text: text,
      sender: MessageSender.User,
      timestamp: new Date(),
      lang: currentLang,
    };

    if (file) {
      userMessage.fileName = file.name;
      if (file.type.startsWith('image/')) {
        userMessage.filePreviewUrl = URL.createObjectURL(file);
      }
    }
    setCurrentMessages(prevMessages => [...prevMessages, userMessage]);
    setIsAppLoading(true);

    const botMessageId = 'bot-' + (Date.now() + 1).toString(); 
    setCurrentMessages(prevMessages => [...prevMessages, {
        id: botMessageId,
        text: "...", 
        sender: MessageSender.Bot,
        timestamp: new Date(),
        lang: currentLang,
    }]);

    let textToSendToGemini = text;
    if (currentGeminiLang !== 'en' && text.trim()) {
        try {
            textToSendToGemini = await GeminiService.translateText(text, 'en', currentGeminiLang);
        } catch (e) {
            console.error("Translation error for user input:", e);
            const errorMsgText = TRANSLATION_ERROR_MESSAGE;
            setCurrentMessages(prev => prev.map(msg => msg.id === botMessageId ? {...msg, text: errorMsgText, sender: MessageSender.Error, timestamp: new Date()} : msg));
            setIsAppLoading(false);
            return;
        }
    }
    
    let messageContent: GeminiMessageContent;
    const parts: Array<TextPart | InlineDataPart> = [];
    if (textToSendToGemini) parts.push({ text: textToSendToGemini });

    if (file) {
      if (file.type.startsWith('image/')) {
        const imagePart = await GeminiService.fileToGenerativePart(file);
        if (imagePart) {
          parts.push(imagePart as InlineDataPart);
           if (!textToSendToGemini) parts.unshift({text: `User attached an image: ${file.name}. Consider this image.`});
        }
      } else {
        const fileReference = `\n\n[User attached a file: ${file.name}. Consider its relevance to the English query above.]`;
        if (parts.length > 0 && typeof parts[0] === 'object' && 'text' in parts[0]) {
           (parts[0] as TextPart).text += fileReference;
        } else {
            parts.unshift({ text: fileReference });
        }
      }
    }
    messageContent = parts.length === 1 && 'text' in parts[0] && !file?.type.startsWith('image/') ? (parts[0] as TextPart).text : parts;

    let fullBotResponseInEnglish = "";
    let finalGroundingChunks: AppGroundingChunk[] | undefined = undefined;

    try {
      for await (const chunk of GeminiService.sendMessageToGeminiStream(messageContent)) {
        if (chunk.error) {
          fullBotResponseInEnglish = chunk.error; 
          break;
        }
        if (chunk.text) {
          fullBotResponseInEnglish += chunk.text;
        }
        if (chunk.groundingChunks && chunk.groundingChunks.length > 0) {
            finalGroundingChunks = chunk.groundingChunks.map((apiChunk: GenAIGroundingChunk): AppGroundingChunk => {
                const mappedChunk: AppGroundingChunk = {};
                if (apiChunk.web && typeof apiChunk.web.uri === 'string') {
                    mappedChunk.web = { uri: apiChunk.web.uri, title: apiChunk.web.title };
                } else if (apiChunk.retrievedContext && typeof apiChunk.retrievedContext.uri === 'string') { 
                    mappedChunk.retrievedPassage = { uri: apiChunk.retrievedContext.uri, title: apiChunk.retrievedContext.title };
                }
                return mappedChunk;
            }).filter(c => !!(c.web || c.retrievedPassage)); 
        }
        let currentDisplayResponse = fullBotResponseInEnglish;
        setCurrentMessages(prev => prev.map(msg => msg.id === botMessageId ? {...msg, text: currentDisplayResponse + "..." , sender: MessageSender.Bot, timestamp: new Date()} : msg));
      }
    } catch (e) {
        console.error("Streaming error in App.tsx:", e);
        fullBotResponseInEnglish = "An error occurred while getting the response from HR Assistant.";
    }

    let finalBotResponseToDisplayAndSpeak = fullBotResponseInEnglish;
    let finalBotSender = MessageSender.Bot;

    if (fullBotResponseInEnglish.startsWith("Error:") || fullBotResponseInEnglish.includes("error occurred") || fullBotResponseInEnglish.includes("Gemini API Error")) {
        finalBotSender = MessageSender.Error;
    }

    if (currentGeminiLang !== 'en' && fullBotResponseInEnglish && finalBotSender === MessageSender.Bot) {
        try {
            finalBotResponseToDisplayAndSpeak = await GeminiService.translateText(fullBotResponseInEnglish, currentGeminiLang, 'en');
        } catch (e) {
            console.error("Translation error for bot response:", e);
            finalBotResponseToDisplayAndSpeak = TRANSLATION_ERROR_MESSAGE; 
            finalBotSender = MessageSender.Error;
        }
    }
    
    setCurrentMessages(prev => prev.map(msg => 
        msg.id === botMessageId ? {
            ...msg, 
            text: finalBotResponseToDisplayAndSpeak || "No response.", 
            sender: finalBotSender,
            timestamp: new Date(),
            groundingChunks: finalGroundingChunks,
            lang: currentLang
        } : msg
    ));
    
    // Do not auto-speak based on new requirement.
    // if (finalBotResponseToDisplayAndSpeak) {
    //     speakText(finalBotResponseToDisplayAndSpeak, currentLang);
    // }

    setIsAppLoading(false);
    if (userMessage.filePreviewUrl) {
        URL.revokeObjectURL(userMessage.filePreviewUrl);
         setCurrentMessages(prev => prev.map(msg => msg.id === userMessage.id ? {...msg, filePreviewUrl: undefined} : msg));
    }
  };


  const handleHistorySessionAction = (action: 'view' | 'delete' | 'deleteAll' | 'back', sessionId?: string) => {
    switch(action) {
      case 'view':
        if(sessionId) {
          setSelectedHistorySessionId(sessionId);
          if (currentPage !== 'history') setCurrentPage('history');
          handleStopSpeaking();
        }
        break;
      case 'delete':
        if(sessionId) {
          setChatHistory(prev => ({ sessions: prev.sessions.filter(s => s.id !== sessionId) }));
          if (selectedHistorySessionId === sessionId) setSelectedHistorySessionId(null);
          showToast("Chat session deleted.");
        }
        break;
      case 'deleteAll':
        setChatHistory({ sessions: [] });
        setSelectedHistorySessionId(null);
        showToast("All chat history deleted.");
        break;
      case 'back':
        setSelectedHistorySessionId(null);
        handleStopSpeaking();
        break;
    }
  };
  
  const mainContentClass = settings.preferDarkBackground ? 'bg-gray-700' : 'bg-white';
  const appContainerFlexClass = 'flex flex-col min-h-screen transition-colors duration-300';
  // The appRootDivClass will be applied to the div with id="app-container" for component-level theming.
  // The global background is handled by CSS in index.html.
  const appRootDivClass = settings.preferDarkBackground ? 'dark-theme-app-container' : 'light-theme-app-container';
  const chatContainerDynamicHeight = `max-h-[calc(100vh-100px)] sm:max-h-[calc(100vh-120px)]`;

  const handleSpeechError = useCallback((errorMessage: string) => {
    showToast(errorMessage);
  }, []);

  const ttsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;


  return (
    <div id="app-container" className={`${appContainerFlexClass} ${appRootDivClass}`}>
      <Header onNavigate={handleNavigation} currentPage={currentPage} />
      <main className="flex-grow container mx-auto p-0 sm:p-4 max-w-4xl w-full flex flex-col">
        {currentPage === 'home' && <HomePage onStartChat={() => handleNavigation('chat')} />}
        {currentPage === 'chat' && (
          <div className={`${mainContentClass} shadow-xl rounded-lg flex flex-col flex-grow ${chatContainerDynamicHeight} transition-colors duration-300`}>
            <ChatInterface 
              key={chatInterfaceKey} 
              messages={currentMessages}
              onSendMessage={handleSendMessageInApp}
              isLoading={isAppLoading}
              isGeminiInitialized={isGeminiInitialized}
              apiKeyError={apiKeyError}
              showQuickActions={settings.showQuickActions}
              chatContainerHeightClass={chatContainerDynamicHeight}
              isDark={settings.preferDarkBackground}
              selectedLanguageCode={settings.selectedLanguageCode}
              onLanguageChange={handleLanguageChangeInChat}
              onSpeechError={handleSpeechError}
              speakingMessageId={speakingMessageId}
              onRequestToSpeak={handleRequestToSpeak}
              onStopSpeaking={handleStopSpeaking}
              ttsSupported={ttsSupported}
            />
          </div>
        )}
        {currentPage === 'settings' && (
          <SettingsPage
            currentSettings={settings}
            onSaveSettings={handleSaveSettings}
            onClearChatHistory={handleEndCurrentSessionAndStartNew}
          />
        )}
        {currentPage === 'history' && (
           <HistoryPage
            chatHistory={chatHistory}
            selectedSession={chatHistory.sessions.find(s => s.id === selectedHistorySessionId) || null}
            onViewSession={(id) => handleHistorySessionAction('view', id)}
            onDeleteSession={(id) => handleHistorySessionAction('delete', id)}
            onDeleteAllSessions={() => handleHistorySessionAction('deleteAll')}
            onBackToList={() => handleHistorySessionAction('back')}
            settings={settings}
            speakingMessageId={speakingMessageId}
            onRequestToSpeak={handleRequestToSpeak}
            onStopSpeaking={handleStopSpeaking}
            ttsSupported={ttsSupported}
          />
        )}
      </main>
      <footer className={`text-center p-3 text-xs ${settings.preferDarkBackground ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-100'} border-t ${settings.preferDarkBackground ? 'border-gray-700' : 'border-gray-200'} mt-auto transition-colors duration-300`}>
        <p className="mb-1">&copy; {new Date().getFullYear()} {BRAND_CONFIG.organizationShortName}. All information is for guidance only. {BRAND_CONFIG.slogan}.</p>
        <p className="mb-2">Developed by Adhithya J [ AI Products Engineering Team ]</p>
        <div className="flex justify-center space-x-4">
          {BRAND_CONFIG.socialMedia.blog && <SocialLink href={BRAND_CONFIG.socialMedia.blog} icon={<BookOpen size={18} />} label="Blog" />}
          {BRAND_CONFIG.socialMedia.linkedin && <SocialLink href={BRAND_CONFIG.socialMedia.linkedin} icon={<Linkedin size={18} />} label="LinkedIn" />}
          {BRAND_CONFIG.socialMedia.instagram && <SocialLink href={BRAND_CONFIG.socialMedia.instagram} icon={<Instagram size={18} />} label="Instagram" />}
          {BRAND_CONFIG.socialMedia.github && <SocialLink href={BRAND_CONFIG.socialMedia.github} icon={<Github size={18} />} label="GitHub" />}
          {BRAND_CONFIG.socialMedia.x && <SocialLink href={BRAND_CONFIG.socialMedia.x} icon={<Twitter size={18} />} label="X (Twitter)" />}
          {BRAND_CONFIG.socialMedia.youtube && <SocialLink href={BRAND_CONFIG.socialMedia.youtube} icon={<Youtube size={18} />} label="YouTube" />}
        </div>
      </footer>
      <ToastNotification
        message={toastInfo.message}
        isVisible={toastInfo.isVisible}
        onDismiss={() => setToastInfo({ message: '', isVisible: false })}
      />
    </div>
  );
};

export default App;
