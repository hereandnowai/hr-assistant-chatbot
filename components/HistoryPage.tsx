
import React from 'react';
import { HistoricalChatSession, ChatHistory, MessageSender, ChatMessage, SerializableChatMessage } from '../types';
import { BRAND_CONFIG } from '../constants';
import MessageBubble from './MessageBubble';
import { ArrowLeft, Trash2, ListChecks, CalendarClock, MessageSquareText, ShieldAlert } from 'lucide-react';

interface HistoryPageProps {
  chatHistory: ChatHistory;
  selectedSession: HistoricalChatSession | null;
  onViewSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteAllSessions: () => void;
  onBackToList: () => void;
  settings: { preferDarkBackground: boolean };
  speakingMessageId: string | null;
  onRequestToSpeak: (message: ChatMessage) => void;
  onStopSpeaking: () => void;
  ttsSupported: boolean;
}

const HistoryPage: React.FC<HistoryPageProps> = ({
  chatHistory,
  selectedSession,
  onViewSession,
  onDeleteSession,
  onDeleteAllSessions,
  onBackToList,
  settings,
  speakingMessageId,
  onRequestToSpeak,
  onStopSpeaking,
  ttsSupported
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this chat session? This action cannot be undone.")) {
      onDeleteSession(sessionId);
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm("Are you sure you want to delete ALL chat history? This action cannot be undone.")) {
      onDeleteAllSessions();
    }
  };
  
  const cardBgColor = settings.preferDarkBackground ? 'bg-gray-700' : 'bg-white';
  const textColor = settings.preferDarkBackground ? 'text-gray-200' : `text-[${BRAND_CONFIG.colors.secondary}]`;
  const subtleTextColor = settings.preferDarkBackground ? 'text-gray-400' : 'text-gray-500';
  const borderColor = settings.preferDarkBackground ? 'border-gray-600' : 'border-gray-300';
  const hoverBgColor = settings.preferDarkBackground ? 'hover:bg-gray-600' : 'hover:bg-gray-50';

  if (selectedSession) {
    // selectedSession.messages from App.tsx should already have Date objects
    // No need for: const deserializedSelectedSessionMessages = deserializeMessages(selectedSession.messages);
    return (
      <div className={`p-4 md:p-6 shadow-xl rounded-lg flex-grow w-full flex flex-col ${cardBgColor} ${textColor}`}>
        <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: borderColor }}>
          <button
            onClick={onBackToList}
            className={`flex items-center text-sm font-medium p-2 rounded-md hover:bg-opacity-20 transition-colors`}
            style={{ color: BRAND_CONFIG.colors.primary, backgroundColor: BRAND_CONFIG.colors.secondary }}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to History List
          </button>
          <h2 className="text-xl font-semibold">
            Chat from: {formatDate(selectedSession.startTime)}
          </h2>
          <button
            onClick={() => handleDeleteSession(selectedSession.id)}
            title="Delete this session"
            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
        <div className="flex-grow space-y-3 overflow-y-auto p-1 pr-2">
          {selectedSession.messages.map(msg => ( // Directly use selectedSession.messages
            <MessageBubble 
                key={msg.id} 
                message={msg}
                speakingMessageId={speakingMessageId}
                onRequestToSpeak={onRequestToSpeak}
                onStopSpeaking={onStopSpeaking}
                ttsSupported={ttsSupported}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 md:p-6 shadow-xl rounded-lg flex-grow w-full ${cardBgColor} ${textColor}`}>
      <div className="flex items-center justify-between mb-6 pb-3 border-b" style={{ borderColor: borderColor }}>
        <h1 className="text-2xl md:text-3xl font-bold">Chat History</h1>
        {chatHistory.sessions.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="flex items-center text-sm px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors"
          >
            <Trash2 size={16} className="mr-2" />
            Delete All History
          </button>
        )}
      </div>

      {chatHistory.sessions.length === 0 ? (
        <div className={`text-center py-10 rounded-md border-2 border-dashed ${borderColor} ${subtleTextColor}`}>
            <ListChecks size={48} className="mx-auto mb-3" />
            <p className="text-lg font-semibold">No chat history yet.</p>
            <p>Your past conversations will appear here once saved.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {chatHistory.sessions.slice().reverse().map(session => ( // Show newest first
            <li
              key={session.id}
              className={`p-4 rounded-lg border ${borderColor} ${hoverBgColor} cursor-pointer transition-all duration-150 ease-in-out shadow-sm hover:shadow-md`}
              onClick={() => onViewSession(session.id)}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-md md:text-lg" style={{color: settings.preferDarkBackground ? BRAND_CONFIG.colors.primary : BRAND_CONFIG.colors.secondary}}>
                  {session.title || `Chat Session ${session.id.substring(0,6)}`}
                </h3>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }}
                  className={`p-1.5 rounded-full ${settings.preferDarkBackground ? 'text-gray-400 hover:text-red-400 hover:bg-gray-600' : 'text-gray-500 hover:text-red-500 hover:bg-red-100'} transition-colors`}
                  title="Delete this session"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className={`text-xs flex items-center space-x-3 ${subtleTextColor}`}>
                <span className="flex items-center"><CalendarClock size={12} className="mr-1"/> {formatDate(session.startTime)}</span>
                <span className="flex items-center"><MessageSquareText size={12} className="mr-1"/> {session.messageCount} messages</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HistoryPage;