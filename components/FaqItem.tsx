
import React, { useState } from 'react';
import { FaqItemType } from '../types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { BRAND_CONFIG } from '../constants';

interface FaqItemProps {
  faq: FaqItemType;
  isDark: boolean;
}

const FaqItem: React.FC<FaqItemProps> = ({ faq, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);

  const questionColor = isDark ? `text-[${BRAND_CONFIG.colors.primary}]` : `text-[${BRAND_CONFIG.colors.secondary}]`;
  const answerColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const hoverBgColor = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  const borderColor = isDark ? 'border-gray-600' : 'border-gray-300';

  const formatAnswer = (text: string) => {
    // Basic formatting for newlines and simple emphasis
    text = text.replace(/\n/g, '<br />');
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Bold
    text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>'); // Italic
    // Convert URLs to clickable links (simple version)
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    text = text.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-80" style="color: ${isDark ? BRAND_CONFIG.colors.primary : BRAND_CONFIG.colors.secondary};">${url}</a>`);
    return { __html: text };
  };


  return (
    <div className={`border-b ${borderColor}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex justify-between items-center py-4 px-2 text-left focus:outline-none ${hoverBgColor} transition-colors duration-150`}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <span className={`text-sm font-medium ${questionColor}`}>{faq.question}</span>
        {isOpen ? <ChevronUp size={20} className={questionColor} /> : <ChevronDown size={20} className={questionColor} />}
      </button>
      {isOpen && (
        <div 
          id={`faq-answer-${faq.id}`} 
          className={`p-4 pt-0 text-sm ${answerColor} prose prose-sm max-w-none`}
          dangerouslySetInnerHTML={formatAnswer(faq.answer)}
        />
      )}
    </div>
  );
};

export default FaqItem;
