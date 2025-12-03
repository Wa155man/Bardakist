
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { HEBREW_ALPHABET, ENGLISH_ALPHABET } from '../constants';
import { playTextToSpeech } from '../services/geminiService';
import { HebrewLetter, AppSettings } from '../types';
import { HandwrittenLetter } from './HandwrittenLetter';

interface MatchingGameProps {
  onBack: () => void;
  settings?: AppSettings;
  onEarnPoints?: (amount: number) => void;
}

const STORAGE_KEY_SCORE = 'MATCHING_GAME_SCORE';
const STORAGE_KEY_STATE = 'MATCHING_GAME_STATE';

type Language = 'hebrew' | 'english';

export const MatchingGame: React.FC<MatchingGameProps> = ({ onBack, settings, onEarnPoints }) => {
  // Initialize score from localStorage
  const [score, setScore] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SCORE);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [language, setLanguage] = useState<Language>('hebrew');
  const [targetLetter, setTargetLetter] = useState<HebrewLetter | null>(null);
  const [correctOption, setCorrectOption] = useState<HebrewLetter | null>(null); 
  const [options, setOptions] = useState<HebrewLetter[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctId, setCorrectId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);

  // Determine which handwritten font to use for the question (Hebrew only)
  const handwrittenFontStyle = (settings?.fontStyle === 'hand1') ? 'hand1' : 'playpen';

  // Persist Score
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SCORE, score.toString());
  }, [score]);

  // Persist Game State (Target & Options)
  useEffect(() => {
    if (targetLetter && options.length > 0) {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify({ targetLetter, options, correctOption, language }));
    }
  }, [targetLetter, options, correctOption, language]);

  // Initialization Logic
  useEffect(() => {
    const savedState = localStorage.getItem(STORAGE_KEY_STATE);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.targetLetter && parsed.options) {
            setLanguage(parsed.language || 'hebrew');
            setTargetLetter(parsed.targetLetter);
            setOptions(parsed.options);
            setCorrectOption(parsed.correctOption || parsed.targetLetter);
            return;
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    generateRound('hebrew');
  }, []);

  const generateRound = (lang: Language = language) => {
    setIsAnswered(false);
    setCorrectId(null);
    setWrongId(null);

    if (lang === 'hebrew') {
        const randomIndex = Math.floor(Math.random() * HEBREW_ALPHABET.length);
        const target = HEBREW_ALPHABET[randomIndex];
        setTargetLetter(target);
        setCorrectOption(target); 

        const distractors = HEBREW_ALPHABET
            .filter(l => l.char !== target.char)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);

        const allOptions = [...distractors, target].sort(() => Math.random() - 0.5);
        setOptions(allOptions);

    } else {
        // English Logic: Capital -> Small
        const upperIndex = Math.floor(Math.random() * 26);
        const target = ENGLISH_ALPHABET[upperIndex]; // Uppercase
        const correct = ENGLISH_ALPHABET[upperIndex + 26]; // Corresponding Lowercase
        
        setTargetLetter(target);
        setCorrectOption(correct);

        const lowerCaseLetters = ENGLISH_ALPHABET.slice(26, 52);
        const distractors = lowerCaseLetters
            .filter(l => l.char !== correct.char)
            .sort(() => Math.random() - 0.5)
            .slice(0, 5);
        
        const allOptions = [...distractors, correct].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
    }
  };

  const handleLanguageChange = (lang: Language) => {
      setLanguage(lang);
      generateRound(lang);
  };

  const handleOptionClick = (letter: HebrewLetter) => {
    if (isAnswered || !correctOption) return;
    setIsAnswered(true);

    const isCorrect = letter.char === correctOption.char;

    if (isCorrect) {
        setCorrectId(letter.char);
        setScore(s => s + 3); 
        if (onEarnPoints) onEarnPoints(3); 
        playTextToSpeech("Correct!"); 
        
        localStorage.removeItem(STORAGE_KEY_STATE);

        setTimeout(() => {
            generateRound(language);
        }, 1500);
    } else {
        setWrongId(letter.char);
        playTextToSpeech("Try again");
        setTimeout(() => {
            setIsAnswered(false); 
            setWrongId(null);
        }, 1000);
    }
  };

  const handleReset = () => {
    setScore(0);
    localStorage.setItem(STORAGE_KEY_SCORE, '0');
    localStorage.removeItem(STORAGE_KEY_STATE);
    generateRound(language);
  };

  if (!targetLetter) return null;

  return (
    <div className="h-full w-full bg-green-100 flex flex-col items-center p-4 relative overflow-hidden">
       <div className="absolute top-[54px] left-8 z-10 flex gap-2">
         <Button onClick={onBack} color="red" size="sm">Back</Button>
         <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
      </div>
      
      <div className="absolute top-[54px] right-8 flex flex-col items-end gap-1 z-10">
        <div className="bg-white px-4 py-2 rounded-full shadow font-bold text-green-700 font-dynamic">
          Score: {score}
        </div>
      </div>

      {/* Language Toggle */}
      <div className="absolute top-[110px] left-1/2 transform -translate-x-1/2 z-20 flex bg-white/90 backdrop-blur shadow-md rounded-xl border-2 border-green-200 overflow-hidden w-48">
            <button 
                onClick={() => handleLanguageChange('hebrew')}
                className={`flex-1 py-1 text-sm font-bold ${language === 'hebrew' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-green-50'}`}
            >
                עברית 🇮🇱
            </button>
            <button 
                onClick={() => handleLanguageChange('english')}
                className={`flex-1 py-1 text-sm font-bold ${language === 'english' ? 'bg-green-500 text-white' : 'text-gray-500 hover:bg-green-50'}`}
            >
                English 🇺🇸
            </button>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-green-700 mt-36 md:mt-40 mb-2 font-dynamic text-center shrink-0">
        {language === 'hebrew' ? 'Match Handwritten to Printed' : 'Match Capital to Small'}
      </h1>

      {/* Target Section - Flexible Height */}
      <div className="flex-1 flex flex-col items-center justify-center w-full shrink-0 mb-2 min-h-0">
         <div 
           className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-3xl shadow-xl border-b-8 border-green-200 flex items-center justify-center p-4 animate-float shrink-0" 
         >
            {language === 'hebrew' ? (
                <HandwrittenLetter 
                    char={targetLetter.char} 
                    className="text-gray-800 text-6xl md:text-8xl" 
                    fontStyle={handwrittenFontStyle} 
                />
            ) : (
                <span className="text-gray-800 text-6xl md:text-8xl font-bold font-sans">
                    {targetLetter.char}
                </span>
            )}
         </div>
         <span className="mt-2 text-sm md:text-base font-bold text-gray-500 bg-white/50 px-4 py-1 rounded-full font-dynamic text-center">
            {language === 'hebrew' 
                ? `Find: ${targetLetter.nameHebrew} (Print)`
                : `Find small letter for: ${targetLetter.char}`
            }
         </span>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-3 gap-3 max-w-md w-full shrink-0 mb-2">
         {options.map((opt, idx) => {
            let bgClass = 'bg-white hover:bg-yellow-50 border-yellow-200';
            if (isAnswered) {
                if (opt.char === correctId) bgClass = 'bg-green-500 border-green-700 text-white';
                else if (opt.char === wrongId) bgClass = 'bg-red-500 border-red-700 text-white';
            }

            return (
                <button
                    key={idx}
                    onClick={() => handleOptionClick(opt)}
                    disabled={isAnswered && correctId !== null}
                    className={`
                        h-16 md:h-24 rounded-xl border-b-4 shadow-md flex items-center justify-center text-3xl md:text-5xl transition-all duration-200 transform
                        ${language === 'hebrew' ? 'font-print' : 'font-sans font-bold'}
                        ${bgClass}
                        ${isAnswered && opt.char === correctId ? 'scale-110' : 'active:scale-95'}
                    `}
                >
                    {opt.char}
                </button>
            );
         })}
      </div>
    </div>
  );
};
