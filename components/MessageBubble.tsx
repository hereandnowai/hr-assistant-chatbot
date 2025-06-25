
import React from 'react';
import { ChatMessage, MessageSender, GroundingChunk } from '../types';
import { User, AlertTriangle, FileText, Link as LinkIcon, Volume2, VolumeX } from 'lucide-react';
import { BRAND_CONFIG } from '../constants';

interface MessageBubbleProps {
  message: ChatMessage;
  speakingMessageId: string | null;
  onRequestToSpeak: (message: ChatMessage) => void;
  onStopSpeaking: () => void;
  ttsSupported: boolean;
}

const formatDate = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const GroundingChunkDisplay: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
  const source = chunk.web || chunk.retrievedPassage;
  if (!source || !source.uri) return null;

  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title || source.uri}
      className="mt-1 flex items-center text-xs text-[#004040] hover:text-[#002b2b] hover:underline"
    >
      <LinkIcon size={12} className="mr-1 flex-shrink-0" />
      <span className="truncate">{source.title || source.uri}</span>
    </a>
  );
};


const MessageBubble: React.FC<MessageBubbleProps> = ({ 
    message, 
    speakingMessageId, 
    onRequestToSpeak, 
    onStopSpeaking,
    ttsSupported
}) => {
  const isUser = message.sender === MessageSender.User;
  const isBot = message.sender === MessageSender.Bot;
  const isSystem = message.sender === MessageSender.System;
  const isError = message.sender === MessageSender.Error;

  const isThisMessageSpeaking = speakingMessageId === message.id;

  const bubbleClasses = React.useMemo(() => {
    let base = "max-w-xl md:max-w-2xl p-3 rounded-xl shadow-sm text-sm break-words";
    if (isUser) base += " bg-[#004040] text-white ml-auto";
    else if (isBot) base += " bg-[#FFDF00] text-[#004040] mr-auto";
    else if (isSystem) base += " bg-yellow-100 text-yellow-700 text-center mx-auto my-2";
    else if (isError) base += " bg-red-100 text-red-700 mr-auto";
    return base;
  }, [isUser, isBot, isSystem, isError]);

  const senderIcon = React.useMemo(() => {
    if (isUser) return <User size={20} className="text-[#FFDF00] flex-shrink-0" />;
    if (isBot) return <img src={BRAND_CONFIG.chatbot.avatar} alt="Bot Avatar" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />;
    if (isError) return <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />;
    return null;
  }, [isUser, isBot, isError]);

  const formatText = (text: string) => {
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    text = text.replace(/\n/g, '<br />');
    text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-2 rounded-md my-1 text-xs overflow-x-auto"><code>$1</code></pre>');
    text = text.replace(/`(.*?)`/g, '<code class="bg-gray-300 text-gray-700 px-1 rounded text-xs">$1</code>');
    
    const linkClass = isBot ? "text-[#004040] hover:underline" : "text-[#FFDF00] hover:underline";
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, `<a href="$2" target="_blank" rel="noopener noreferrer" class="${linkClass}">$1</a>`);
    
    return { __html: text };
  };

  const handleSpeakerClick = () => {
    if (!ttsSupported) return;
    if (isThisMessageSpeaking) {
      onStopSpeaking();
    } else {
      onRequestToSpeak(message);
    }
  };

  const speakerButtonColor = React.useMemo(() => {
    if (isUser) return 'text-[#FFDF00] hover:text-yellow-300'; // Primary color for user msg
    if (isBot) return 'text-[#004040] hover:text-teal-700'; // Secondary color for bot msg
    if (isError) return 'text-red-700 hover:text-red-800';
    if (isSystem) return 'text-yellow-700 hover:text-yellow-800';
    return 'text-gray-500 hover:text-gray-700'; // Default
  }, [isUser, isBot, isError, isSystem]);


  return (
    <div className={`flex my-2 items-start ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && !isSystem && senderIcon && <div className="mr-2 self-start mt-1">{senderIcon}</div>}
      
      <div className="flex flex-col">
        <div className={bubbleClasses}>
          <div dangerouslySetInnerHTML={formatText(message.text)} />
          {message.filePreviewUrl && (
            <div className="mt-2">
              <img src={message.filePreviewUrl} alt={message.fileName || 'Uploaded image'} className="max-w-xs max-h-48 rounded-md border border-gray-300" />
            </div>
          )}
          {message.fileName && !message.filePreviewUrl && (
             <div className={`mt-2 p-2 rounded-md border flex items-center text-xs ${isBot ? 'bg-[#FFDF00] border-[#004040] text-[#004040]' : 'bg-gray-100 border-gray-300 text-gray-700'}`}>
               <FileText size={16} className={`mr-2 flex-shrink-0 ${isBot ? 'text-[#004040]' : 'text-gray-500'}`} />
               <span>{message.fileName}</span>
             </div>
          )}
          {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className={`mt-2 border-t pt-2 ${isBot ? 'border-[#004040]' : 'border-gray-300'}`}>
              <p className={`text-xs font-semibold mb-1 ${isBot ? 'text-[#004040]' : 'text-gray-600'}`}>Sources:</p>
              {message.groundingChunks.map((chunk, index) => (
                <GroundingChunkDisplay key={index} chunk={chunk} />
              ))}
            </div>
          )}
          <div className={`text-xs mt-1 ${isUser ? 'text-yellow-200' : (isBot ? 'text-[#002b2b]' : 'text-gray-500')} ${isSystem ? 'text-yellow-600' : ''} ${isError ? 'text-red-500' : ''}`}>
            {formatDate(message.timestamp)}
          </div>
        </div>
        
        {ttsSupported && message.text && message.text.trim() && (
            <button
                onClick={handleSpeakerClick}
                disabled={!ttsSupported}
                className={`self-start mt-1 p-1 rounded-full transition-colors duration-150 ${speakerButtonColor} ${!ttsSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label={isThisMessageSpeaking ? "Stop speaking" : "Speak message"}
                title={isThisMessageSpeaking ? "Stop speaking" : "Speak message"}
            >
                {isThisMessageSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
        )}
      </div>

      {isUser && !isSystem && senderIcon && <div className="ml-2 self-start mt-1">{senderIcon}</div>}
    </div>
  );
};

export default MessageBubble;
