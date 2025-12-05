import React, { useState } from 'react';
import { AppSettings } from '../types';

interface FontControlProps {
  currentFont: AppSettings['fontStyle'];
  onChange: (font: AppSettings['fontStyle']) => void;
}

export const FontControl: React.FC<FontControlProps> = ({ currentFont, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const options: { id: AppSettings['fontStyle'], label: string, fontClass?: string, style?: React.CSSProperties }[] = [
    { id: 'print', label: 'Print', fontClass: 'font-round' },
    { id: 'hand1', label: 'Ktav Yad (Cursive)', style: { fontFamily: "'Gveret Levin', cursive" } }, 
    { id: 'playpen', label: 'Playpen Sans (Handwriting)', style: { fontFamily: "'Playpen Sans Hebrew', cursive" } },
    { id: 'alef', label: 'Alef', style: { fontFamily: "'Alef', sans-serif" } },
  ];

  return (
    <div 
      className="fixed left-4 z-[200] flex flex-col-reverse gap-2 items-start"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      {/* Main Button */}
      <button
        onClick={toggleOpen}
        className="w-14 h-14 bg-white rounded-full shadow-xl border-4 border-purple-200 flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        title="Change Font"
      >
        <span className="text-2xl font-bold text-purple-600">א</span>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
           <span className="text-[8px] text-white">Aa</span>
        </div>
      </button>

      {/* Options Menu */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-xl border-2 border-purple-100 p-2 flex flex-col gap-2 mb-2 animate-float pop-in">
          <div className="text-xs font-bold text-gray-400 px-2 text-center">Choose Font</div>
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setIsOpen(false);
              }}
              className={`
                px-4 py-2 rounded-xl text-lg text-right transition-colors flex items-center justify-between gap-4
                ${currentFont === opt.id ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'hover:bg-gray-50 text-gray-700'}
              `}
            >
              <span className={opt.fontClass} style={opt.style}>
                אבג
              </span>
              <span className="text-sm font-bold opacity-70 font-sans">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};