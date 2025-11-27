
import React from 'react';
import { LEVEL_NODES } from '../constants';
import { LevelNode } from '../types';

interface LevelMapProps {
  onSelectLevel: (level: LevelNode) => void;
  onQuickPlay: () => void;
  onOpenTongueTwisters: () => void;
  onOpenMiniPractice: () => void;
}

export const LevelMap: React.FC<LevelMapProps> = ({ onSelectLevel, onQuickPlay, onOpenTongueTwisters, onOpenMiniPractice }) => {
  // Snakes and Ladders / Board Game Theme
  const bgImage = "https://image.pollinations.ai/prompt/kids%20snakes%20and%20ladders%20board%20game%20background%20vector%20cartoon%20style%20green%20grass%20blue%20sky%20path%20top%20view%20no%20text?width=540&height=960&nologo=true";

  return (
    <div className="relative w-full h-full overflow-hidden bg-green-100">
      {/* Background Image - Stretched to fill container so drawing is fully visible */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: '100% 100%', // Stretch to fit the game container exactly
            backgroundPosition: 'center',
            filter: 'brightness(1.05) contrast(0.95)'
        }}
      />

      {/* Title */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-10 text-center w-full pointer-events-none">
        <h1 
          className="text-5xl font-black text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] font-dynamic tracking-wide"
          style={{ WebkitTextStroke: '2px #166534' }}
        >
          הַמַּסָּע שֶׁלִּי
        </h1>
      </div>

      {/* Game Path SVG (Winding Snake Path) */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
        <defs>
          <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/>
          </filter>
        </defs>
        
        {/* 
          Path Logic matches constants.ts coordinates:
          Start: 50,85 -> Right: 80,50 -> Center: 50,55 -> Left: 30,36 -> Top Right: 75,30
        */}
        <path
          d="M 50% 85% Q 90% 80% 80% 50% Q 65% 45% 50% 55% Q 30% 55% 30% 36% Q 50% 25% 75% 30%"
          fill="none"
          stroke="#fcd34d" // Yellow-300
          strokeWidth="40"
          strokeLinecap="round"
          filter="url(#path-glow)"
          className="opacity-90"
        />
        
        {/* Dashed Line overlay for "Spaces" effect */}
        <path
          d="M 50% 85% Q 90% 80% 80% 50% Q 65% 45% 50% 55% Q 30% 55% 30% 36% Q 50% 25% 75% 30%"
          fill="none"
          stroke="#d97706" // Dark Amber
          strokeWidth="36"
          strokeLinecap="round"
          strokeDasharray="20 10"
          className="opacity-60"
        />
      </svg>

      {/* Level Nodes */}
      {LEVEL_NODES.map((level) => (
        <div
          key={level.id}
          style={{ left: `${level.x}%`, top: `${level.y}%` }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <button
            onClick={() => level.unlocked && onSelectLevel(level)}
            disabled={!level.unlocked}
            className={`
              relative group transition-all duration-300
              ${level.unlocked ? 'hover:scale-110 cursor-pointer' : 'opacity-60 grayscale cursor-not-allowed'}
            `}
          >
            {/* Active Indicator */}
            {level.unlocked && (
              <span className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></span>
            )}
            
            {/* Main Node Circle */}
            <div className={`
              w-24 h-24 rounded-full border-[6px] border-white shadow-2xl flex flex-col items-center justify-center
              ${level.color} relative overflow-hidden transform transition-transform
            `}>
               {/* Glossy Effect */}
               <div className="absolute top-0 left-0 w-full h-1/3 bg-white/40 rounded-b-full"></div>

               {/* Lock Icon if locked */}
               {!level.unlocked && (
                 <svg className="w-8 h-8 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
               )}
               
               {/* Number if unlocked */}
               {level.unlocked && (
                  <div className="text-white font-black text-5xl drop-shadow-md z-10 font-dynamic">
                    {level.id}
                  </div>
               )}
            </div>

            {/* Level Label (Only visible on hover or active for cleaner look) */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-white/90 px-3 py-1 rounded-full shadow-md border border-yellow-400 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-bold text-gray-800 font-dynamic">{level.name}</span>
            </div>
          </button>
        </div>
      ))}
      
      {/* Controls - Split Layout to clear center */}
      
      {/* Quick Play (Left) */}
      <div className="absolute bottom-8 left-4 pointer-events-auto z-[100]">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onQuickPlay();
            }}
            className="group relative cursor-pointer hover:scale-110 transition-transform duration-300"
          >
             <div className="w-28 h-28 relative animate-float">
                {/* Character Body */}
                <div className="w-20 h-20 bg-red-500 rounded-2xl relative shadow-xl border-b-4 border-red-700 mx-auto flex items-center justify-center">
                    <span className="text-4xl">🎲</span>
                </div>
                
                {/* Speech Bubble */}
                <div className="bg-white px-3 py-1 rounded-xl shadow-md absolute -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap border-2 border-gray-100">
                    <p className="text-sm font-bold text-gray-800 font-dynamic">Play</p>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 rotate-45 w-3 h-3 bg-white border-r-2 border-b-2 border-gray-100"></div>
                </div>
             </div>
          </button>
      </div>

      {/* Mini Games & Fun Zone (Right) - Moved UP to avoid blocking Level 1 */}
      <div className="absolute bottom-40 right-4 flex gap-4 pointer-events-auto z-[100]">
        <div className="flex items-end gap-4">
           {/* Mini Games */}
           <button 
              onClick={onOpenMiniPractice}
              className="group relative cursor-pointer hover:scale-105 transition-transform duration-300"
            >
               <div className="bg-blue-500 text-white p-3 rounded-2xl shadow-xl border-b-4 border-blue-700 flex flex-col items-center gap-1 w-20">
                  <div className="grid grid-cols-2 gap-1 mb-1 opacity-80">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div className="flex flex-col text-center">
                     <span className="font-black text-3xl leading-none font-dynamic">🎮</span>
                     <span className="text-[10px] font-bold text-blue-100 mt-1 font-dynamic">GAMES</span>
                  </div>
               </div>
            </button>

            {/* Fun Zone */}
            <button 
              onClick={onOpenTongueTwisters}
              className="group relative cursor-pointer hover:scale-105 transition-transform duration-300"
            >
               <div className="bg-purple-600 text-white p-3 rounded-2xl shadow-xl border-b-4 border-purple-800 flex flex-col items-center gap-1 w-20">
                  <span className="text-3xl mb-1">🤪</span>
                  <div className="flex flex-col text-center">
                     <span className="text-[10px] font-bold text-purple-100 font-dynamic">FUN ZONE</span>
                  </div>
               </div>
            </button>
        </div>
      </div>

    </div>
  );
};
