
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { playTextToSpeech } from '../services/geminiService';
import { HEBREW_ALPHABET } from '../constants';
import { HebrewLetter, AppSettings } from '../types';
import { HandwrittenLetter } from './HandwrittenLetter';

interface NamingGameProps {
  onBack: () => void;
  settings?: AppSettings;
  onEarnPoints?: (amount: number) => void;
}

const STORAGE_KEY_SCORE = 'NAMING_GAME_SCORE';
const STORAGE_KEY_STATE = 'NAMING_GAME_STATE';

export const NamingGame: React.FC<NamingGameProps> = ({ onBack, settings, onEarnPoints }) => {
  // Initialize score from storage or 0
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCORE);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [target, setTarget] = useState<HebrewLetter | null>(null);
  const [options, setOptions] = useState<HebrewLetter[]>([]);
  const [gameState, setGameState] = useState<'guessing' | 'success'>('guessing');
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine handwritten font
  const handwrittenFontStyle = (settings?.fontStyle === 'hand1') ? 'hand1' : 'playpen';

  // Persist Score
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCORE, score.toString());
  }, [score]);

  // Persist Game State (Target & Options)
  useEffect(() => {
    if (target && options.length > 0 && !isLoading) {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify({ target, options }));
    }
  }, [target, options, isLoading]);

  const startRound = () => {
    setIsLoading(true);
    setGameState('guessing');
    setWrongId(null);
    
    setTimeout(() => {
        const t = HEBREW_ALPHABET[Math.floor(Math.random() * HEBREW_ALPHABET.length)];
        setTarget(t);
        
        const others = HEBREW_ALPHABET.filter(l => l.char !== t.char)
                                      .sort(() => Math.random() - 0.5)
                                      .slice(0, 3); // 3 distractors + 1 correct = 4 options
        
        setOptions([...others, t].sort(() => Math.random() - 0.5));
        setIsLoading(false);
    }, 600);
  };

  // Initialization Logic
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY_STATE);
    if (savedState) {
      try {
        const { target: savedTarget, options: savedOptions } = JSON.parse(savedState);
        setTimeout(() => {
            setTarget(savedTarget);
            setOptions(savedOptions);
            setIsLoading(false);
        }, 600);
      } catch (e) {
        startRound();
      }
    } else {
      startRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOptionClick = (letter: HebrewLetter) => {
    if (gameState !== 'guessing' || isLoading) return;

    if (letter.char === target?.char) {
      setGameState('success');
      setScore(s => s + 3); 
      if (onEarnPoints) onEarnPoints(3); 
      playTextToSpeech(target.nameHebrew); 
      
      localStorage.removeItem(STORAGE_KEY_STATE);
      
      setTimeout(() => startRound(), 2500);
    } else {
      setWrongId(letter.char);
      setTimeout(() => {
        setWrongId(null);
      }, 500);
    }
  };

  const handleReset = () => {
    setScore(0);
    localStorage.setItem(STORAGE_KEY_SCORE, '0');
    localStorage.removeItem(STORAGE_KEY_STATE);
    startRound();
  };

  return (
    <div className="h-full w-full bg-orange-50 flex flex-col items-center p-4 relative overflow-hidden">
       <div className="absolute top-[54px] left-8 z-10 flex gap-2">
         <Button onClick={onBack} color="red" size="sm">Back</Button>
         <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
      </div>
      
      <div className="absolute top-[54px] right-8 flex flex-col items-end gap-1 z-10">
        <div className="bg-white px-4 py-2 rounded-full shadow font-bold text-orange-700 font-dynamic">
          Score: {score}
        </div>
      </div>

      <div className="mt-16 md:mt-24 text-center shrink-0">
        <h1 className="text-3xl font-black text-orange-600 font-dynamic drop-shadow-sm mb-1">
            Name the Letter
        </h1>
        <p className="text-gray-500 font-bold text-sm font-dynamic">Match handwritten to printed</p>
      </div>

      {/* Target Display - Flexible */}
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0 my-4">
        <div className="bg-white rounded-3xl shadow-xl p-4 border-b-8 border-orange-200 flex flex-col items-center justify-center w-48 h-48 md:w-64 md:h-64 animate-float relative overflow-hidden shrink-0">
            {isLoading ? (
                <div className="flex flex-col items-center animate-pulse w-full h-full justify-center">
                    <div className="w-32 h-32 bg-orange-100 rounded-full mb-4"></div>
                    <div className="w-32 h-6 bg-orange-100 rounded"></div>
                </div>
            ) : (
                <>
                    {gameState === 'success' && target ? (
                        <div className="text-center pop-in flex flex-col items-center">
                            <div className="text-6xl font-print text-stencil mb-2 opacity-50">{target.char}</div>
                            <h2 className="text-3xl md:text-4xl font-bold text-purple-600 font-dynamic">{target.nameHebrew}</h2>
                            <p className="text-gray-400 text-lg font-medium font-dynamic">({target.name})</p>
                        </div>
                    ) : target ? (
                        <div className="pop-in w-full h-full flex flex-col items-center justify-center">
                            <div className="w-32 h-32 md:w-40 md:h-40 transform -rotate-2 flex items-center justify-center">
                            <HandwrittenLetter 
                                char={target.char} 
                                className="text-gray-800 text-7xl md:text-8xl" 
                                strokeWidth={8} 
                                fontStyle={handwrittenFontStyle} 
                            />
                            </div>
                            <p className="text-xs text-gray-300 mt-2 font-bold uppercase tracking-widest text-center font-dynamic">Handwritten</p>
                        </div>
                    ) : null}
                </>
            )}
        </div>
      </div>

      {/* Options Grid - Fixed Height Area */}
      <div className="grid grid-cols-2 gap-4 max-w-md w-full shrink-0 mb-4">
        {isLoading ? (
            [...Array(4)].map((_, i) => (
                <div key={i} className="h-20 md:h-24 rounded-xl bg-white border-2 border-orange-100 animate-pulse flex items-center justify-center">
                    <div className="w-12 h-12 bg-orange-50 rounded-full"></div>
                </div>
            ))
        ) : (
            options.map((opt, idx) => {
                const isWrong = wrongId === opt.char;
                const isCorrect = gameState === 'success' && target && opt.char === target.char;
                const isDimmed = gameState === 'success' && !isCorrect;
                
                return (
                    <button
                        key={idx}
                        onClick={() => handleOptionClick(opt)}
                        disabled={gameState !== 'guessing'}
                        className={`
                            h-20 md:h-24 rounded-xl border-b-4 text-4xl md:text-5xl font-print transition-all duration-200 shadow-md
                            ${isCorrect ? 'bg-green-500 border-green-700 text-white scale-105' : 
                              isWrong ? 'bg-red-500 border-red-700 text-white' : 
                              'bg-white border-orange-200 text-gray-800 hover:bg-orange-50 hover:-translate-y-1'}
                            ${isDimmed ? 'opacity-50' : 'opacity-100'}
                        `}
                    >
                        {opt.char}
                    </button>
                )
            })
        )}
      </div>
    </div>
  );
};
