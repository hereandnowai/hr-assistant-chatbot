
import React from 'react';
import { BRAND_CONFIG } from '../constants';
import { Page } from '../types';
import { Settings as SettingsIcon, Home, History as HistoryIcon } from 'lucide-react'; // Using lucide-react Settings icon

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  
  const NavButton: React.FC<{targetPage: Page, icon: React.ReactNode, label: string, isCurrent: boolean}> = 
  ({targetPage, icon, label, isCurrent}) => (
    <button
      onClick={() => onNavigate(targetPage)}
      disabled={isCurrent}
      className={`p-2 rounded-full transition-colors duration-150 ease-in-out
                  ${isCurrent ? 'text-opacity-50 cursor-default' : 'hover:bg-white/10 focus:bg-white/20'}
                  focus:outline-none focus:ring-2 focus:ring_inset focus:ring-[${BRAND_CONFIG.colors.primary}]`}
      aria-label={label}
      title={label}
      style={{ color: BRAND_CONFIG.colors.primary }}
    >
      {icon}
    </button>
  );

  return (
    <header className="bg-[#004040] text-white p-3 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div 
          onClick={() => currentPage !== 'home' && onNavigate('home')} 
          className={`flex items-center ${currentPage !== 'home' ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
          role={currentPage !== 'home' ? "button" : undefined}
          aria-label={currentPage !== 'home' ? "Go to Home Page" : undefined}
          tabIndex={currentPage !== 'home' ? 0 : undefined}
          onKeyDown={currentPage !== 'home' ? (e) => (e.key === 'Enter' || e.key === ' ') && onNavigate('home') : undefined}
        >
          <img 
            src={BRAND_CONFIG.logo.title} 
            alt={`${BRAND_CONFIG.organizationShortName} Logo`} 
            className="h-10 mr-3"
          />
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#FFDF00]">{BRAND_CONFIG.organizationShortName} HR Assistant</h1>
            <p className="text-xs text-gray-300 hidden sm:block">{BRAND_CONFIG.slogan}</p>
          </div>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2">
          <NavButton 
            targetPage="home" 
            icon={<Home size={22} />} 
            label="Home" 
            isCurrent={currentPage === 'home'} 
          />
          <NavButton 
            targetPage="history" 
            icon={<HistoryIcon size={22} />} 
            label="Chat History" 
            isCurrent={currentPage === 'history'} 
          />
          <NavButton 
            targetPage="settings" 
            icon={<SettingsIcon size={22} />} 
            label="Settings" 
            isCurrent={currentPage === 'settings'} 
          />
        </nav>
      </div>
    </header>
  );
};

export default Header;
