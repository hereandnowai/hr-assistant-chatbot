
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, XCircle, Image as ImageIcon, Mic, MicOff, Languages } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { SUPPORTED_LANGUAGES, SPEECH_RECOGNITION_NOT_SUPPORTED, MICROPHONE_PERMISSION_DENIED } from '../constants';
import { SupportedLanguage } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, file?: File) => void;
  isLoading: boolean;
  selectedLanguageCode: string;
  onLanguageChange: (languageCode: string) => void;
  onSpeechError: (errorMessage: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  selectedLanguageCode, 
  onLanguageChange,
  onSpeechError 
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any | null>(null); // Changed SpeechRecognition to any

  useEffect(() => {
    // @ts-ignore SpeechRecognition may not be on window type for all browsers
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true; // Get interim results for faster feedback

      recognitionRef.current.onresult = (event: any) => { // Explicitly type event as any if needed
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInputText(finalTranscript || interimTranscript);
         // Auto-adjust height while typing/recognizing
        const textarea = document.getElementById('chat-input-textarea') as HTMLTextAreaElement;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => { // Explicitly type event as any if needed
        console.error("Speech recognition error", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          onSpeechError(MICROPHONE_PERMISSION_DENIED);
        } else if (event.error === 'no-speech') {
          // Do nothing, user might just be silent
        } else {
          onSpeechError(`Speech recognition error: ${event.error}`);
        }
      };
    } else {
      console.warn(SPEECH_RECOGNITION_NOT_SUPPORTED);
      // Don't show mic button or disable it - handled by button presence
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onSpeechError]);
  
  // Update recognition language when selectedLanguageCode changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = selectedLanguageCode;
    }
  }, [selectedLanguageCode]);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleSend = () => {
    if (isLoading) return;
    if (inputText.trim() || selectedFile) {
      onSendMessage(inputText.trim(), selectedFile || undefined);
      setInputText('');
      setSelectedFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      const textarea = document.getElementById('chat-input-textarea') as HTMLTextAreaElement;
      if (textarea) textarea.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      onSpeechError(SPEECH_RECOGNITION_NOT_SUPPORTED);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = selectedLanguageCode; // Ensure lang is set before start
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        // This catch might be for "already started" or other immediate errors.
        // The .onerror handler deals with permission/service issues.
        setIsListening(false); 
        if (err instanceof DOMException && err.name === "NotAllowedError") {
             onSpeechError(MICROPHONE_PERMISSION_DENIED);
        } else if (err instanceof DOMException && err.name === "InvalidStateError"){
            // Usually means it's already started or in a bad state. Try to reset.
            recognitionRef.current.abort(); // Try aborting
            setIsListening(false); // Ensure UI reflects it's off
        } else {
            onSpeechError("Could not start voice input. Please try again.");
        }
      }
    }
  };
  
  // @ts-ignore
  const speechAPIAvailable = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="bg-gray-100 p-3 md:p-4 shadow-sm">
      {selectedFile && (
        <div className="mb-2 p-2 border border-gray-300 rounded-md bg-white flex justify-between items-center">
          <div className="flex items-center space-x-2 overflow-hidden">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="h-10 w-10 rounded object-cover" />
            ) : (
              <ImageIcon size={20} className="text-gray-500 flex-shrink-0" />
            )}
            <span className="text-sm text-black truncate">{selectedFile.name}</span>
          </div>
          <button onClick={removeSelectedFile} className="p-1 text-gray-500 hover:text-red-500">
            <XCircle size={18} />
          </button>
        </div>
      )}
      <div className="flex items-end space-x-2">
        <button
          onClick={triggerFileInput}
          className="p-2 text-gray-500 hover:text-[#004040] transition-colors duration-150"
          aria-label="Attach file"
        >
          <Paperclip size={22} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        <div className="relative flex-grow">
          <textarea
            id="chat-input-textarea"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Type your message or ask a question..."}
            className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFDF00] focus:border-[#FFDF00] resize-none overflow-y-auto max-h-32 transition-shadow duration-150 bg-white text-black placeholder-gray-500"
            rows={1}
            disabled={isLoading}
          />
        </div>
        
        {speechAPIAvailable && (
          <button
            onClick={toggleListening}
            className={`p-2 rounded-lg transition-colors duration-150 h-[50px] w-[50px] flex items-center justify-center
                        ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'}`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
        )}

        <div className="relative group">
          <button
            className="p-2 text-gray-500 hover:text-[#004040] transition-colors duration-150 h-[50px] w-[50px] flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg"
            aria-label="Select language"
          >
            <Languages size={22} />
          </button>
          <div className="absolute bottom-full mb-2 right-0 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
            {SUPPORTED_LANGUAGES.map((lang: SupportedLanguage) => (
              <button
                key={lang.code}
                onClick={() => onLanguageChange(lang.code)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  selectedLanguageCode === lang.code ? 'bg-[#FFDF00] text-[#004040]' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={isLoading || (!inputText.trim() && !selectedFile)}
          className="bg-[#004040] hover:bg-[#003030] text-[#FFDF00] font-semibold py-3 px-4 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out flex items-center justify-center h-[50px] w-[50px] min-w-[50px]"
          aria-label="Send message"
        >
          {isLoading ? <LoadingSpinner /> : <Send size={22} />}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
