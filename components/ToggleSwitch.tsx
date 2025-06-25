import React from 'react';
import { BRAND_CONFIG } from '../constants';

interface ToggleSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ id, label, checked, onChange, disabled }) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  // Dynamically set colors based on BRAND_CONFIG
  const switchBgColor = checked ? BRAND_CONFIG.colors.secondary : 'bg-gray-300';
  const switchHoverBgColor = checked ? BRAND_CONFIG.colors.secondary : 'bg-gray-400'; // Darken secondary for hover if needed or use a fixed hover
  const knobColor = 'bg-white';
  const labelColor = `text-gray-700 ${disabled ? 'opacity-50' : ''}`; // Adjust label color based on theme if needed

  return (
    <label htmlFor={id} className={`flex items-center justify-between cursor-pointer py-2 ${disabled ? 'cursor-not-allowed' : ''}`}>
      <span className={`mr-3 text-sm font-medium ${labelColor}`}>{label}</span>
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          className="sr-only"
          checked={checked}
          onChange={handleToggle}
          disabled={disabled}
        />
        <div
          className={`block w-10 h-6 rounded-full transition-colors ${switchBgColor} ${!disabled ? `hover:${switchHoverBgColor}` : ''}`}
          style={{ backgroundColor: checked && !disabled ? BRAND_CONFIG.colors.secondary : (disabled ? '#E0E0E0' : '#CBD5E0') }}
        ></div>
        <div
          className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${knobColor}`}
          style={{ transform: checked ? 'translateX(100%)' : 'translateX(0)' }}
        ></div>
      </div>
    </label>
  );
};

export default ToggleSwitch;
