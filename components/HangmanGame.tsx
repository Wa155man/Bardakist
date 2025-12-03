
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { playTextToSpeech, getHangmanImageUrl, resumeAudioContext } from '../services/geminiService';

interface HangmanGameProps {
  words: { word: string, hint: string, hebrewHint: string, imagePrompt: string }[];
  onBack: () => void;
  onLoadMore?: (lang: 'hebrew' | 'english') => Promise<void>;
  onStartGame?: (lang: 'hebrew' | 'english') => Promise<void>;
  onEarnPoints?: (amount: number) => void;
  language: 'hebrew' | 'english';
}

// Hebrew Alphabet
const HEBREW_KEYS = [
  'א','ב','ג','ד','ה','ו','ז','ח','ט','י',
  'כ','ך','ל','מ','ם','נ','ן','ס','ע','פ',
  'ף','צ','ץ','ק','ר','ש','ת'
];

// English Alphabet
const ENGLISH_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

const MAX_WRONG = 6;

export const HangmanGame: React.FC<HangmanGameProps> = ({ words, onBack, onLoadMore, onStartGame, onEarnPoints, language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Normalize word by removing Nikud for checking (Hebrew only)
  const removeNikud = (str: string) => {
    if (!str) return "";
    return str.replace(/[\u0591-\u05C7]/g, "");
  };
  
  const fallbackWord = { word: 'תּוֹדָה', hint: 'Thanks', hebrewHint: 'מילה שאומרים כשמקבלים משהו', imagePrompt: 'thank you' };
  const currentWordObj = (words && words.length > 0) ? words[currentIndex] : fallbackWord;
  
  // Safe check to avoid crash if words is empty temporarily during switch
  const wordToPlay = currentWordObj ? currentWordObj.word : (language === 'hebrew' ? 'תּוֹדָה' : 'THANKS');
  
  // Prepare clean word for checking
  // Hebrew: Remove Nikud. English: Ensure Uppercase.
  const cleanWord = language === 'hebrew' ? removeNikud(wordToPlay) : wordToPlay.toUpperCase();

  // Use imagePrompt for generation if available (faster/better for English), otherwise hint
  const imgPrompt = currentWordObj ? (currentWordObj.imagePrompt || currentWordObj.hint) : '';
  const imageUrl = getHangmanImageUrl(imgPrompt);

  useEffect(() => {
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setStatus('playing');
    setImageLoaded(false);
    setImageError(false);
  }, [currentIndex, language, words]); 

  const handleLanguageChange = async (lang: 'hebrew' | 'english') => {
      if (lang === language) return;
      
      setScore(0);
      setGuessedLetters(new Set());
      setWrongGuesses(0);
      setCurrentIndex(0); // Reset index immediately
      
      if (onStartGame) {
          await onStartGame(lang);
          // Parent handles loading and unmount, so no local loading needed typically.
      } else if (onLoadMore) {
          setIsLoadingNext(true);
          await onLoadMore(lang);
          setIsLoadingNext(false);
      }
  };

  useEffect(() => {
    if (status !== 'playing') return;

    if (wrongGuesses >= MAX_WRONG) {
      setStatus('lost');
      playTextToSpeech("Oh no!");
      setScore(prev => Math.max(0, prev - 5));
    } else {
      const isWon = cleanWord.split('').every(char => guessedLetters.has(char));
      if (isWon && cleanWord.length > 0) {
        setStatus('won');
        playTextToSpeech("You did it!");
        setScore(prev => prev + 3); 
        if (onEarnPoints) onEarnPoints(3); 
        
        const handleWinTransition = async () => {
             if (currentIndex < words.length - 1) {
                setTimeout(() => {
                  setCurrentIndex(prev => prev + 1);
                }, 2500);
              } else if (onLoadMore) {
                setIsLoadingNext(true);
                await onLoadMore(language);
                setTimeout(() => {
                    setIsLoadingNext(false);
                    setCurrentIndex(prev => prev + 1);
                }, 2500);
              }
        };
        handleWinTransition();
      }
    }
  }, [guessedLetters, wrongGuesses, cleanWord, currentIndex, words.length, status, onLoadMore, onEarnPoints, language]);

  const handleGuess = (char: string) => {
    if (status !== 'playing' || guessedLetters.has(char)) return;

    resumeAudioContext();

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(char);
    setGuessedLetters(newGuessed);

    if (!cleanWord.includes(char)) {
      setWrongGuesses(prev => prev + 1);
    }
  };

  const handleRetry = () => {
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setStatus('playing');
    setImageLoaded(false);
    setImageError(false);
  };

  const handleReset = () => {
      handleRetry();
      setCurrentIndex(0);
      setScore(0);
  };

  const renderWord = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 my-4 shrink-0" dir={language === 'hebrew' ? "rtl" : "ltr"}>
        {cleanWord.split('').map((char, idx) => {
          const isGuessed = guessedLetters.has(char) || status !== 'playing';
          return (
            <div 
              key={idx} 
              className={`
                w-8 h-12 md:w-10 md:h-14 border-b-4 flex items-center justify-center text-2xl md:text-3xl font-bold transition-all font-dynamic
                ${isGuessed ? 'border-indigo-500 text-indigo-700' : 'border-gray-300 text-transparent'}
              `}
            >
              {isGuessed ? char : '_'} 
            </div>
          );
        })}
      </div>
    );
  };

  const renderRobot = () => {
    const isLost = status === 'lost';
    // Animation style for falling apart
    const fallStyle = (delay: string, rotate: string, x: string): React.CSSProperties => isLost ? {
        transition: `all 0.8s ease-in ${delay}`,
        transform: `translate(${x}, 150px) rotate(${rotate})`,
        opacity: 0,
        transformBox: 'fill-box' as const,
        transformOrigin: 'center'
    } : {};

    const parts = [
        // Feet
        <rect key="feet" x="70" y="220" width="60" height="20" fill="#374151" rx="5" 
            style={fallStyle('0s', '45deg', '20px')} 
        />,
        // Legs
        <rect key="legs" x="90" y="180" width="20" height="40" fill="#9ca3af" 
            style={fallStyle('0.1s', '-90deg', '-30px')}
        />,
        // Body
        <rect key="body" x="75" y="100" width="50" height="80" fill="#60a5fa" rx="8" 
            style={fallStyle('0.2s', '10deg', '0px')}
        />,
        // Arms
        <path key="arms" d="M55 120 L75 120 M125 120 L145 120" stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" 
            style={fallStyle('0.1s', '180deg', '0px')}
        />,
        // Head
        <rect key="head" x="80" y="60" width="40" height="35" fill="#e5e7eb" stroke="#374151" strokeWidth="2" rx="4" 
            style={fallStyle('0.3s', '120deg', '50px')}
        />,
        // Face
        <g key="face" style={fallStyle('0.3s', '120deg', '50px')}>
            <circle cx="92" cy="75" r="3" fill="#ef4444" className="animate-pulse" /> 
            <circle cx="108" cy="75" r="3" fill="#ef4444" className="animate-pulse" />
            <rect x="95" y="40" width="10" height="20" fill="#fbbf24" />
            <circle cx="100" cy="35" r="5" fill="#fbbf24" />
        </g>
    ];

    return (
        <svg viewBox="0 0 200 250" className="w-32 h-40 md:w-40 md:h-48 drop-shadow-xl bg-white rounded-xl border-2 border-indigo-100 overflow-hidden">
           {parts.slice(0, wrongGuesses)}
        </svg>
    );
  };

  const keysToRender = language === 'hebrew' ? HEBREW_KEYS : ENGLISH_KEYS;

  return (
    <div className="h-full w-full bg-indigo-50 flex flex-col items-center p-2 md:p-4 relative overflow-hidden">
      {/* Look-Ahead Preloader: Load next 3 images invisibly using imagePrompt */}
      <div style={{ display: 'none' }}>
          {words.slice(currentIndex + 1, currentIndex + 4).map((w, i) => (
              <img key={`preload-${i}`} src={getHangmanImageUrl(w.imagePrompt || w.hint)} alt="preload" />
          ))}
      </div>

      <div className="absolute top-[54px] left-8 z-10 flex gap-2">
         <Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button>
         <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
      </div>

      <div className="absolute top-[54px] right-8 flex flex-col items-end gap-1 z-10">
        <div className="bg-white px-4 py-2 rounded-full shadow font-bold text-indigo-700 border-2 border-indigo-100 text-sm">
           Score: {score}
        </div>
      </div>

      {/* Language Toggle */}
      <div className="absolute top-[110px] left-1/2 transform -translate-x-1/2 z-20 flex bg-white/90 backdrop-blur shadow-md rounded-xl border-2 border-indigo-200 overflow-hidden w-48">
            <button 
                onClick={() => handleLanguageChange('hebrew')}
                className={`flex-1 py-1 text-sm font-bold ${language === 'hebrew' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-indigo-50'}`}
            >
                עברית 🇮🇱
            </button>
            <button 
                onClick={() => handleLanguageChange('english')}
                className={`flex-1 py-1 text-sm font-bold ${language === 'english' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-indigo-50'}`}
            >
                English 🇺🇸
            </button>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-indigo-600 mt-32 md:mt-20 mb-2 font-round text-center shrink-0">
        {language === 'hebrew' ? 'גַלֵּה אֶת הַמִּילָּה' : 'GUESS THE WORD'}
      </h1>
      
      <div className="flex-1 w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 min-h-0 shrink-0">
        <div className="flex flex-col items-center">
           {renderRobot()}
           <p className={`text-indigo-400 text-xs md:text-sm mt-1 font-bold transition-opacity duration-500 ${status === 'lost' ? 'opacity-0' : 'opacity-100'}`}>
               {status === 'playing' ? (language === 'hebrew' ? "אל תתנו לרובוט להשלים את עצמו - אחרת תיפסלו" : "Don't let the robot complete itself!") : ""}
           </p>
        </div>

        <div className="flex flex-col items-center">
             {/* Image Container */}
             <div className="relative w-40 h-32 md:w-56 md:h-40 mb-2 rounded-2xl overflow-hidden shadow-md border-4 border-indigo-100 bg-white group">
                
                {/* Skeleton / Loading State - Display Hebrew Hint while loading! */}
                {(!imageLoaded || isLoadingNext) && !imageError && (
                    <div className="absolute inset-0 z-20 bg-indigo-50 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-400 rounded-full animate-spin mb-2 shrink-0"></div>
                        <p className="text-indigo-600 text-sm font-bold font-dynamic leading-tight overflow-y-auto max-h-full">
                            {currentWordObj?.hebrewHint || "..."}
                        </p>
                    </div>
                )}

                {/* Error State - Fallback to Hebrew Hint */}
                {imageError && (
                    <div className="absolute inset-0 z-20 bg-indigo-50 flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-4xl mb-1 opacity-50">🎨</span>
                        <span className="text-indigo-600 text-xs font-bold font-dynamic leading-tight line-clamp-3">
                            {currentWordObj?.hebrewHint || "Image unavailable"}
                        </span>
                    </div>
                )}

                {/* Actual Image */}
                {currentWordObj && (
                    <img 
                        key={currentWordObj.word}
                        src={imageUrl}
                        alt={currentWordObj.hint}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => {
                            setImageError(true);
                            setImageLoaded(true);
                        }}
                        className={`w-full h-full object-cover transition-all duration-700 ease-out ${imageLoaded && !imageError ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                        crossOrigin="anonymous"
                    />
                )}
             </div>
             
             {/* Hint Display */}
             <div className="text-center mb-2">
                {/* Primary Hint (Translation or Clue) */}
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-sm border border-indigo-200 block mb-1">
                    {currentWordObj?.hint || ""}
                </span>
                {/* Secondary Hint (Description) */}
                <span className="text-indigo-500 text-xs md:text-sm font-bold block max-w-[200px] leading-tight" dir={language === 'hebrew' ? "rtl" : "ltr"}>
                    {currentWordObj?.hebrewHint || ""}
                </span>
             </div>
        </div>
      </div>

      {/* Word & Status */}
      <div className="w-full max-w-2xl shrink-0 text-center">
         {renderWord()}

         {status === 'won' && (
             <div className="mb-2 animate-bounce">
                 <span className="text-green-500 font-black text-xl md:text-2xl">
                     {language === 'hebrew' ? 'כל הכבוד! (+3)' : 'Well Done! (+3)'}
                 </span>
             </div>
         )}
         {status === 'lost' && (
             <div className="mb-2">
                 <span className="text-red-500 font-black text-lg md:text-xl">
                    {language === 'hebrew' ? 'הסתיים המשחק! המילה: ' : 'Game Over! Word: '} {wordToPlay}
                 </span>
                 <div className="mt-1">
                    <Button onClick={handleRetry} color="blue" size="sm">{language === 'hebrew' ? 'נסה שוב' : 'Try Again'}</Button>
                 </div>
             </div>
         )}
      </div>

      {/* Keyboard */}
      <div className={`grid ${language === 'hebrew' ? 'grid-cols-7' : 'grid-cols-7'} gap-1 md:gap-2 max-w-3xl w-full shrink-0 mb-2`} dir={language === 'hebrew' ? "rtl" : "ltr"}>
        {keysToRender.map((char) => {
            const isUsed = guessedLetters.has(char);
            const isWrong = isUsed && !cleanWord.includes(char);
            const isCorrect = isUsed && cleanWord.includes(char);

            return (
                <button
                    key={char}
                    onClick={() => handleGuess(char)}
                    disabled={isUsed || status !== 'playing'}
                    className={`
                        h-8 md:h-10 rounded-lg font-bold text-lg transition-all shadow-sm
                        ${isCorrect ? 'bg-green-500 text-white' : ''}
                        ${isWrong ? 'bg-gray-300 text-gray-500 opacity-50' : ''}
                        ${!isUsed ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border border-indigo-200' : ''}
                    `}
                >
                    {char}
                </button>
            );
        })}
      </div>
    </div>
  );
};
