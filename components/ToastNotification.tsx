import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../constants';

interface ToastNotificationProps {
  message: string;
  isVisible: boolean;
  onDismiss: () => void;
  duration?: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  isVisible,
  onDismiss,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-5 right-5 md:bottom-10 md:right-10 z-[100] p-4 rounded-lg shadow-xl text-sm font-medium flex items-center transition-all duration-300 ease-in-out transform animate-fadeInUp"
      style={{
        backgroundColor: BRAND_CONFIG.colors.secondary, // Teal background
        color: BRAND_CONFIG.colors.primary, // Golden text
      }}
      role="alert"
      aria-live="assertive"
    >
      <CheckCircle size={20} className="mr-3 flex-shrink-0" style={{ color: BRAND_CONFIG.colors.primary }} />
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-4 text-sm font-semibold hover:opacity-80"
        aria-label="Dismiss notification"
        style={{ color: BRAND_CONFIG.colors.primary }}
      >
        Dismiss
      </button>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}} />
    </div>
  );
};

export default ToastNotification;