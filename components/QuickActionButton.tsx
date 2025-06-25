import React from 'react';
import { QuickAction } from '../types';

interface QuickActionButtonProps {
  action: QuickAction;
  onClick: (query: string) => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ action, onClick }) => {
  return (
    <button
      onClick={() => onClick(action.query)}
      className="bg-[#004040] hover:bg-[#003030] text-[#FFDF00] text-sm font-medium py-2 px-3 rounded-lg shadow-md transition-colors duration-150 ease-in-out whitespace-nowrap"
    >
      {action.label}
    </button>
  );
};

export default QuickActionButton;