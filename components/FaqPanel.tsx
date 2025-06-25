
import React from 'react';
import { FaqItemType } from '../types';
import FaqItem from './FaqItem';
import { X, HelpCircle } from 'lucide-react';
import { BRAND_CONFIG, FAQS } from '../constants'; // Import FAQS from constants

interface FaqPanelProps {
  isVisible: boolean;
  onClose: () => void;
  isDark: boolean;
}

const FaqPanel: React.FC<FaqPanelProps> = ({ isVisible, onClose, isDark }) => {
  if (!isVisible) {
    return null;
  }

  const panelBgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? `text-[${BRAND_CONFIG.colors.primary}]` : `text-[${BRAND_CONFIG.colors.secondary}]`;
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const closeButtonHoverBg = isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose} // Close on backdrop click
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-panel-title"
    >
      <div 
        className={`absolute inset-0 bg-black opacity-50`}
      />
      <div
        className={`relative ${panelBgColor} w-full max-w-2xl max-h-[80vh] m-4 rounded-lg shadow-2xl flex flex-col overflow-hidden transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
      >
        <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
          <div className="flex items-center">
            <HelpCircle size={24} className={`mr-3 ${textColor}`} />
            <h2 id="faq-panel-title" className={`text-lg font-semibold ${textColor}`}>
              Frequently Asked Questions
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${closeButtonHoverBg} ${textColor} transition-colors`}
            aria-label="Close FAQ Panel"
          >
            <X size={22} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-2">
          {FAQS.map(faq => (
            <FaqItem key={faq.id} faq={faq} isDark={isDark} />
          ))}
          {FAQS.length === 0 && (
            <p className={`p-4 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No FAQs available at the moment.</p>
          )}
        </div>
        
        <div className={`p-3 border-t ${borderColor} text-center`}>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Can't find your answer? Ask the HR Assistant directly!
            </p>
        </div>
      </div>
    </div>
  );
};

export default FaqPanel;
