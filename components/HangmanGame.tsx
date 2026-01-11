
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { playTextToSpeech, getHangmanImageUrl, resumeAudioContext, prefetchImage } from '../services/geminiService';

interface HangmanGameProps {
  words: { word: string, hint: string, hebrewHint: string, imagePrompt: string }[];
  onBack: () => void;
  onLoadMore?: (lang: 'hebrew' | 'english') => Promise<void>;
  onStartGame?: (lang: 'hebrew' | 'english') => Promise<void>;
  onEarnPoints?: (amount: number) => void;
  language: 'hebrew' | 'english';
}

const HEBREW_KEYS = [
  'א','ב','ג','ד','ה','ו','ז','ח','ט','י',
  'כ','ך','ל','מ','ם','נ','ן','ס','ע','פ',
  'ף','צ','ץ','ק','ר','ש','ת'
];

const ENGLISH_KEYS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
const MAX_WRONG = 6;

const getEmojiFallback = (word: string): string => {
    const map: Record<string, string> = {
        'hello': '👋', 'house': '🏠', 'dog': '🐶', 'cat': '🐱', 'book': '📖',
        'thanks': '🙏', 'garden': '🌳', 'apple': '🍎', 'sky': '☁️', 'water': '💧'
    };
    return map[word.toLowerCase()] || '💡';
};

export const HangmanGame: React.FC<HangmanGameProps> = ({ words, onBack, onLoadMore, onStartGame, onEarnPoints, language }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const removeNikud = (str: string) => {
    if (!str) return "";
    return str.replace(/[\u0591-\u05C7]/g, "");
  };
  
  const currentWordObj = words[currentIndex];
  const wordToPlay = currentWordObj ? currentWordObj.word : (language === 'hebrew' ? 'תּוֹדָה' : 'THANKS');
  const cleanWord = language === 'hebrew' ? removeNikud(wordToPlay) : wordToPlay.toUpperCase();

  // Background Pre-fetching for next words
  useEffect(() => {
    if (words.length > 0 && currentIndex < words.length - 1) {
        const nextWord = words[currentIndex + 1];
        prefetchImage(nextWord.imagePrompt || nextWord.hint);
    }
  }, [currentIndex, words]);

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
      setCurrentIndex(0);
      if (onStartGame) await onStartGame(lang);
  };

  useEffect(() => {
    if (status !== 'playing') return;

    if (wrongGuesses >= MAX_WRONG) {
      setStatus('lost');
      playTextToSpeech("Try again!");
      setScore(prev => Math.max(0, prev - 5));
    } else {
      const isWon = cleanWord.split('').every(char => guessedLetters.has(char));
      if (isWon && cleanWord.length > 0) {
        setStatus('won');
        playTextToSpeech("Metsuyan!");
        setScore(prev => prev + 3); 
        if (onEarnPoints) onEarnPoints(3); 
        
        setTimeout(async () => {
             if (currentIndex < words.length - 1) {
                setCurrentIndex(prev => prev + 1);
              } else if (onLoadMore) {
                setIsLoadingNext(true);
                await onLoadMore(language);
                setIsLoadingNext(false);
                setCurrentIndex(prev => prev + 1);
              }
        }, 2500);
      }
    }
  }, [guessedLetters, wrongGuesses, cleanWord, currentIndex, words.length, status, onLoadMore, onEarnPoints, language]);

  const handleGuess = (char: string) => {
    if (status !== 'playing' || guessedLetters.has(char)) return;
    resumeAudioContext();
    const newGuessed = new Set(guessedLetters);
    newGuessed.add(char);
    setGuessedLetters(newGuessed);
    if (!cleanWord.includes(char)) setWrongGuesses(prev => prev + 1);
  };

  const renderWord = () => {
    return (
      <div className="flex flex-wrap justify-center gap-2 my-4 shrink-0" dir={language === 'hebrew' ? "rtl" : "ltr"}>
        {cleanWord.split('').map((char, idx) => {
          const isGuessed = guessedLetters.has(char) || status !== 'playing';
          return (
            <div key={idx} className={`w-8 h-12 md:w-10 md:h-14 border-b-4 flex items-center justify-center text-2xl md:text-3xl font-bold transition-all font-dynamic ${isGuessed ? 'border-indigo-500 text-indigo-700' : 'border-gray-300 text-transparent'}`}>
              {isGuessed ? char : '_'} 
            </div>
          );
        })}
      </div>
    );
  };

  const keysToRender = language === 'hebrew' ? HEBREW_KEYS : ENGLISH_KEYS;
  const imageUrl = getHangmanImageUrl(currentWordObj?.imagePrompt || currentWordObj?.hint || "");

  return (
    <div className="h-full w-full bg-indigo-50 flex flex-col items-center p-2 md:p-4 relative overflow-hidden">
      <div className="absolute top-[54px] left-8 z-10 flex gap-2">
         <Button onClick={onBack} color="red" size="sm">Back</Button>
      </div>

      <div className="absolute top-[54px] right-8 z-10 bg-white px-4 py-2 rounded-full shadow font-bold text-indigo-700 border-2 border-indigo-100 text-sm">
           Score: {score}
      </div>

      <div className="absolute top-[110px] left-1/2 transform -translate-x-1/2 z-20 flex bg-white/90 backdrop-blur shadow-md rounded-xl border-2 border-indigo-200 overflow-hidden w-48">
            <button onClick={() => handleLanguageChange('hebrew')} className={`flex-1 py-1 text-sm font-bold ${language === 'hebrew' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-indigo-50'}`}>עברית</button>
            <button onClick={() => handleLanguageChange('english')} className={`flex-1 py-1 text-sm font-bold ${language === 'english' ? 'bg-indigo-500 text-white' : 'text-gray-500 hover:bg-indigo-50'}`}>English</button>
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-indigo-600 mt-32 md:mt-24 mb-2 font-round text-center shrink-0">
        גַלֵּה אֶת הַמִּילָּה
      </h1>
      
      <div className="flex-1 w-full max-w-3xl flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 min-h-0 shrink-0">
        <div className="flex flex-col items-center">
             <div className="relative w-48 h-40 md:w-64 md:h-48 mb-2 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-white group flex items-center justify-center">
                {!imageLoaded && !imageError && (
                    <div className="absolute inset-0 z-20 bg-indigo-50 flex flex-col items-center justify-center p-4 text-center">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-400 rounded-full animate-spin"></div>
                    </div>
                )}
                
                {imageError ? (
                    <div className="flex flex-col items-center justify-center p-4 bg-white w-full h-full">
                        <span className="text-8xl animate-float filter drop-shadow-sm">
                            {getEmojiFallback(currentWordObj?.hint || "")}
                        </span>
                    </div>
                ) : (
                    currentWordObj && (
                        <img 
                            key={currentWordObj.word}
                            src={imageUrl}
                            alt={currentWordObj.hint}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => { setImageError(true); setImageLoaded(true); }}
                            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            crossOrigin="anonymous"
                        />
                    )
                )}
             </div>
             <div className="text-center mb-2">
                <span className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-bold shadow-sm border border-indigo-200">
                    {currentWordObj?.hint || ""}
                </span>
             </div>
        </div>
      </div>

      <div className="w-full max-w-2xl shrink-0 text-center">
         {renderWord()}
         {status === 'won' && <div className="mb-2 animate-bounce text-green-500 font-black text-xl md:text-2xl">Excellent! (+3)</div>}
         {status === 'lost' && (
             <div className="mb-2">
                 <span className="text-red-500 font-black text-lg md:text-xl">Game Over! Word: {wordToPlay}</span>
             </div>
         )}
      </div>

      <div className={`grid grid-cols-7 gap-1 md:gap-2 max-w-3xl w-full shrink-0 mb-2`} dir={language === 'hebrew' ? "rtl" : "ltr"}>
        {keysToRender.map((char) => {
            const isUsed = guessedLetters.has(char);
            const isCorrect = isUsed && cleanWord.includes(char);
            return (
                <button
                    key={char}
                    onClick={() => handleGuess(char)}
                    disabled={isUsed || status !== 'playing'}
                    className={`h-8 md:h-10 rounded-lg font-bold text-lg transition-all shadow-sm ${isCorrect ? 'bg-green-500 text-white' : isUsed ? 'bg-gray-200 text-gray-400 opacity-50' : 'bg-white text-indigo-800 border border-indigo-200'}`}
                >
                    {char}
                </button>
            );
        })}
      </div>
    </div>
  );
};
