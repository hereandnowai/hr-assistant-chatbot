
import React, { useState, useEffect } from 'react';
import { ApplicationSettings, SupportedLanguage } from '../types';
import ToggleSwitch from './ToggleSwitch';
import { BRAND_CONFIG, SUPPORTED_LANGUAGES } from '../constants';
import { Trash2, Save, Languages } from 'lucide-react';

interface SettingsPageProps {
  currentSettings: ApplicationSettings;
  onSaveSettings: (newSettings: ApplicationSettings) => void;
  onClearChatHistory: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({
  currentSettings,
  onSaveSettings,
  onClearChatHistory,
}) => {
  const [settings, setSettings] = useState<ApplicationSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleToggleChange = (key: keyof ApplicationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSettings(prev => ({ ...prev, selectedLanguageCode: e.target.value }));
  };

  const handleSave = () => {
    onSaveSettings(settings);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear the current chat session and save it to history? This will start a new chat.")) {
      onClearChatHistory();
    }
  };

  return (
    <div className="p-4 md:p-8 bg-white shadow-xl rounded-lg flex-grow w-full">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center" style={{ color: BRAND_CONFIG.colors.secondary }}>
        Application Settings
      </h1>

      <div className="space-y-6 max-w-lg mx-auto">
        <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-lg font-semibold mb-3" style={{ color: BRAND_CONFIG.colors.secondary }}>Preferences</h2>
          <ToggleSwitch
            id="showQuickActions"
            label="Show Quick Questions Bar in Chat"
            checked={settings.showQuickActions}
            onChange={(value) => handleToggleChange('showQuickActions', value)}
          />
          <ToggleSwitch
            id="preferDarkBackground"
            label="Prefer Dark Background (Applies to main container)"
            checked={settings.preferDarkBackground}
            onChange={(value) => handleToggleChange('preferDarkBackground', value)}
          />
        </div>
        
        <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-lg font-semibold mb-3 flex items-center" style={{ color: BRAND_CONFIG.colors.secondary }}>
            <Languages size={20} className="mr-2" /> Language
          </h2>
          <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
            Preferred Language for Chat & Voice:
          </label>
          <select
            id="language-select"
            value={settings.selectedLanguageCode}
            onChange={handleLanguageChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#FFDF00] focus:border-[#FFDF00] sm:text-sm rounded-md bg-white text-black"
          >
            {SUPPORTED_LANGUAGES.map((lang: SupportedLanguage) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
           <p className="text-xs text-gray-500 mt-2">Bot responses will be spoken in this language. Microphone input will also use this language.</p>
        </div>

        <div className="p-4 border rounded-lg shadow-sm bg-gray-50">
          <h2 className="text-lg font-semibold mb-3" style={{ color: BRAND_CONFIG.colors.secondary }}>Data Management</h2>
          <button
            onClick={handleClearHistory}
            className="w-full flex items-center justify-center text-sm px-4 py-2.5 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50 transition-colors duration-150"
          >
            <Trash2 size={16} className="mr-2" />
            End Current Chat Session & Start New
          </button>
          <p className="text-xs text-gray-500 mt-2">This will save the current chat to history (if not empty) and start a fresh session.</p>
        </div>
        
        <div className="mt-8 pt-6 border-t">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center px-6 py-3 font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out text-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transform hover:scale-105"
            style={{ 
              backgroundColor: BRAND_CONFIG.colors.secondary, 
              color: BRAND_CONFIG.colors.primary,
              borderColor: BRAND_CONFIG.colors.primary,
            }}
          >
            <Save size={20} className="mr-2" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;