
import React from 'react';
import { UserProgress } from '../types';

interface TopBarProps {
  progress: UserProgress;
  onHome: () => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ progress, onHome, onOpenSettings }) => {
  return (
    <div className="absolute top-[40px] left-0 right-0 px-8 flex justify-between items-center z-50 pointer-events-none">
      {/* Left Side: Coin Counter (Dot) - Furthest Left */}
      <div className="pointer-events-auto">
         <div className="bg-slate-800/90 text-white px-6 py-2 rounded-full flex items-center gap-3 border-b-4 border-slate-950 shadow-xl">
          <div className="bg-yellow-400 rounded-full p-1 border-2 border-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-700" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <span className="font-bold text-2xl font-dynamic">{progress.totalCoins}</span>
        </div>
      </div>

      {/* Right Side: Home Button */}
      <div className="pointer-events-auto">
        <button onClick={onHome} className="bg-white/90 backdrop-blur p-3 rounded-full shadow-md border-2 border-gray-200 hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>
    </div>
  );
};
