import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { playTextToSpeech } from '../services/geminiService';

interface HangmanGameProps {
  words: { word: string, hint: string, hebrewHint: string, imagePrompt: string }[];
  onBack: () => void;
  onLoadMore?: () => Promise<void>;
  onEarnPoints?: (amount: number) => void;
}

// Hebrew Alphabet for Keyboard including Sofit letters
const HEBREW_KEYS = [
  'א','ב','ג','ד','ה','ו','ז','ח','ט','י',
  'כ','ך','ל','מ','ם','נ','ן','ס','ע','פ',
  'ף','צ','ץ','ק','ר','ש','ת'
];

const MAX_WRONG = 6;

export const HangmanGame: React.FC<HangmanGameProps> = ({ words, onBack, onLoadMore, onEarnPoints }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Normalize word by removing Nikud for checking
  const removeNikud = (str: string) => {
    if (!str) return "";
    return str.replace(/[\u0591-\u05C7]/g, "");
  };
  
  const fallbackWord = { word: 'תּוֹדָה', hint: 'Thanks', hebrewHint: 'מילה שאומרים כשמקבלים משהו', imagePrompt: 'thank you' };
  const currentWordObj = (words && words[currentIndex]) ? words[currentIndex] : fallbackWord;
  
  const wordToPlay = currentWordObj.word || 'שגיאה';
  const cleanWord = removeNikud(wordToPlay);

  const getImageUrl = (w: typeof currentWordObj) => {
      // USE SIMPLIFIED PROMPT FOR RELIABILITY
      const cleanPrompt = w.hint; // Just use the English word (e.g. "flower")
      const seed = w.hint;        // Use the same for seed
      return `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(cleanPrompt)}?width=250&height=250&model=flux&nologo=true&seed=${encodeURIComponent(seed)}`;
  };

  const imageUrl = getImageUrl(currentWordObj);

  useEffect(() => {
    setGuessedLetters(new Set());
    setWrongGuesses(0);
    setStatus('playing');
    setImageLoaded(false);
    setImageError(false);
  }, [currentIndex]);

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
        setScore(prev => prev + 3); // Changed from 10 to 3
        if (onEarnPoints) onEarnPoints(3); // Changed from 10 to 3
        
        const handleWinTransition = async () => {
             if (currentIndex < words.length - 1) {
                // Next word is available in current batch
                setTimeout(() => {
                  setCurrentIndex(prev => prev + 1);
                }, 2500);
              } else if (onLoadMore) {
                // End of batch, load more
                setIsLoadingNext(true);
                await onLoadMore();
                // After loading, we assume the list has grown. 
                // We advance index after a short delay to show the win state
                setTimeout(() => {
                    setIsLoadingNext(false);
                    setCurrentIndex(prev => prev + 1);
                }, 2500);
              }
        };
        handleWinTransition();
      }
    }
  }, [guessedLetters, wrongGuesses, cleanWord, currentIndex, words.length, status, onLoadMore, onEarnPoints]);

  const handleGuess = (char: string) => {
    if (status !== 'playing' || guessedLetters.has(char)) return;

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

  const renderWord = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 my-4 shrink-0" dir="rtl">
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

  return (
    <div className="h-full w-full bg-indigo-50 flex flex-col items-center p-2 md:p-4 relative overflow-hidden">
      {/* Look-Ahead Preloader: Load next 3 images invisibly */}
      <div style={{ display: 'none' }}>
          {words.slice(currentIndex + 1, currentIndex + 4).map((w, i) => (
              <img key={`preload-${i}`} src={getImageUrl(w)} alt="preload" />
          ))}
      </div>

      <div className="absolute top-[54px] left-8 z-10">
         <Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button>
      </div>

      <div className="absolute top-[110px] left-8 flex flex-col gap-2 z-10 items-start">
         <div className="bg-white px-4 py-2 rounded-full shadow font-bold text-indigo-700 border-2 border-indigo-100 text-sm">
            ניקוד: {score}
         </div>
         <div className="bg-white px-4 py-2 rounded-full shadow font-bold text-indigo-700 border-2 border-indigo-100 text-sm">
            מילים: {currentIndex + 1}
         </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-indigo-600 mt-12 md:mt-16 mb-2 font-round text-center shrink-0">גַלֵּה אֶת הַמִּילָּה</h1>
      
      {/* Game Visuals: Robot + Hint Image */}
      <div className="flex-1 w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 min-h-0 shrink-0">
        <div className="flex flex-col items-center">
           {renderRobot()}
           <p className={`text-indigo-400 text-xs md:text-sm mt-1 font-bold transition-opacity duration-500 ${status === 'lost' ? 'opacity-0' : 'opacity-100'}`}>
               {status === 'playing' ? "אל תתנו לרובוט להשלים את עצמו - אחרת תיפסלו" : ""}
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
                            {currentWordObj.hebrewHint}
                        </p>
                    </div>
                )}

                {/* Error State - Fallback to Hebrew Hint */}
                {imageError && (
                    <div className="absolute inset-0 z-20 bg-indigo-50 flex flex-col items-center justify-center p-2 text-center">
                        <span className="text-4xl mb-1 opacity-50">🎨</span>
                        <span className="text-indigo-600 text-xs font-bold font-dynamic leading-tight line-clamp-3">
                            {currentWordObj.hebrewHint || "תמונה לא זמינה"}
                        </span>
                    </div>
                )}

                {/* Actual Image */}
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
                />
             </div>
             
             {/* English Hint */}
             <div className="text-center mb-2">
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-sm border border-indigo-200 block mb-1">
                    {currentWordObj.hint}
                </span>
                <span className="text-indigo-500 text-xs md:text-sm font-bold block max-w-[200px] leading-tight" dir="rtl">
                    {currentWordObj.hebrewHint}
                </span>
             </div>
        </div>
      </div>

      {/* Word & Status */}
      <div className="w-full max-w-2xl shrink-0 text-center">
         {renderWord()}

         {status === 'won' && (
             <div className="mb-2 animate-bounce">
                 <span className="text-green-500 font-black text-xl md:text-2xl">כל הכבוד! (+3)</span>
             </div>
         )}
         {status === 'lost' && (
             <div className="mb-2">
                 <span className="text-red-500 font-black text-lg md:text-xl">הסתיים המשחק! המילה: {wordToPlay}</span>
                 <div className="mt-1">
                    <Button onClick={handleRetry} color="blue" size="sm">נסה שוב</Button>
                 </div>
             </div>
         )}
      </div>

      {/* Keyboard */}
      <div className="grid grid-cols-7 gap-1 md:gap-2 max-w-3xl w-full shrink-0 mb-2" dir="rtl">
        {HEBREW_KEYS.map((char) => {
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