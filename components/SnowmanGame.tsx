
import React, { useState, useEffect } from 'react';
import { SentenceQuestion, AppSettings } from '../types';
import { Button } from './Button';
import { playTextToSpeech } from '../services/geminiService';

interface SnowmanGameProps {
  questions: SentenceQuestion[];
  onComplete: () => void;
  onBack: () => void;
  onLoadMore: (lang: 'hebrew' | 'english') => Promise<void>;
  onStartGame: (lang: 'hebrew' | 'english') => Promise<void>;
  settings: AppSettings;
  onEarnPoints?: (amount: number) => void;
  language: 'hebrew' | 'english';
}

export const SnowmanGame: React.FC<SnowmanGameProps> = ({ 
  questions, 
  onComplete, 
  onBack,
  onLoadMore,
  onStartGame,
  settings,
  onEarnPoints,
  language
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [partsBuilt, setPartsBuilt] = useState(0); 
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  const currentQuestion = questions[currentIndex];

  // Reset game if language changes or questions are cleared
  useEffect(() => {
      if (questions.length === 0) {
          setPartsBuilt(0);
          setCurrentIndex(0);
      }
  }, [questions.length]);

  useEffect(() => {
    if (currentQuestion) {
      const opts = [...currentQuestion.distractors, currentQuestion.missingWord];
      setShuffledOptions(opts.sort(() => Math.random() - 0.5));
      setIsAnswered(false);
      setIsCorrect(false);
      setIsLoadingNext(false);
    }
  }, [currentQuestion]);

  const playSfx = (type: 'correct' | 'wrong' | 'build') => {
    if (!settings.soundEffects) return;
    const urls = {
      correct: 'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3',
      wrong: 'https://codeskulptor-demos.commondatastorage.googleapis.com/assets/sounddogs/explosion.mp3',
      build: 'https://codeskulptor-demos.commondatastorage.googleapis.com/utils/zoom.mp3'
    };
    new Audio(urls[type]).play().catch(() => {});
  };

  const handleOptionClick = async (option: string) => {
    if (isAnswered || isLoadingNext) return;
    
    setIsAnswered(true);
    
    if (option === currentQuestion.missingWord) {
      setIsCorrect(true);
      playSfx('correct');
      if (onEarnPoints) onEarnPoints(3); // Changed from 10 to 3
      setTimeout(() => playSfx('build'), 300);
      
      let nextParts = partsBuilt + 1;
      if (nextParts > 5) nextParts = 5; 
      setPartsBuilt(nextParts);
      
      if (settings.autoPlayAudio) {
        playTextToSpeech(currentQuestion.fullSentence);
      }

      setTimeout(async () => {
        let shouldResetSnowman = false;
        if (nextParts >= 5) {
             shouldResetSnowman = true;
        }

        if (currentIndex < questions.length - 1) {
          if (shouldResetSnowman) setPartsBuilt(0);
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsLoadingNext(true);
          await onLoadMore(language);
          if (shouldResetSnowman) setPartsBuilt(0);
          setCurrentIndex(prev => prev + 1);
        }
      }, 2500);
    } else {
      setIsCorrect(false);
      playSfx('wrong');
      setTimeout(() => {
        setIsAnswered(false);
      }, 1000);
    }
  };

  const handleReset = () => {
      setPartsBuilt(0);
      setCurrentIndex(0);
  };

  const renderSnowman = () => {
    return (
      <svg viewBox="0 0 200 300" className="w-full h-full filter drop-shadow-xl">
        <ellipse cx="100" cy="280" rx="80" ry="15" fill="#e2e8f0" opacity="0.5" />
        <circle cx="100" cy="230" r="50" fill="white" stroke="#cbd5e1" strokeWidth="2" 
          className={`transition-all duration-500 ${partsBuilt >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0 origin-bottom'}`} 
        />
        <circle cx="100" cy="160" r="40" fill="white" stroke="#cbd5e1" strokeWidth="2" 
          className={`transition-all duration-500 delay-100 ${partsBuilt >= 2 ? 'scale-100 opacity-100' : 'scale-0 opacity-0 origin-center'}`}
        />
        {partsBuilt >= 2 && (
          <g fill="#1e293b">
            <circle cx="100" cy="150" r="3" />
            <circle cx="100" cy="165" r="3" />
            <circle cx="100" cy="180" r="3" />
          </g>
        )}
        <circle cx="100" cy="100" r="30" fill="white" stroke="#cbd5e1" strokeWidth="2" 
          className={`transition-all duration-500 delay-200 ${partsBuilt >= 3 ? 'scale-100 opacity-100' : 'scale-0 opacity-0 origin-center'}`}
        />
        <g className={`transition-opacity duration-500 delay-300 ${partsBuilt >= 4 ? 'opacity-100' : 'opacity-0'}`}>
           <circle cx="90" cy="95" r="3" fill="#1e293b" />
           <circle cx="110" cy="95" r="3" fill="#1e293b" />
           <path d="M100 100 L130 105 L100 110 Z" fill="#f97316" /> 
           <path d="M90 115 Q100 125 110 115" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g className={`transition-all duration-500 delay-400 ${partsBuilt >= 5 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
           <rect x="80" y="70" width="40" height="5" fill="#1e293b" />
           <rect x="85" y="45" width="30" height="25" fill="#1e293b" />
           <rect x="85" y="60" width="30" height="5" fill="#ef4444" />
           <path d="M140 160 L180 130" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
           <path d="M60 160 L20 130" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
        </g>
      </svg>
    );
  };

  // --- MENU MODE (No Questions Loaded) ---
  if (questions.length === 0) {
      return (
        <div className="h-full w-full bg-sky-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[54px] left-8 z-20">
                <Button onClick={onBack} color="red" size="sm">Back</Button>
            </div>

            <h1 className="text-4xl font-black text-blue-800 mb-8 font-dynamic text-center drop-shadow-md">
                משחק משפטים
            </h1>
            
            <div className="bg-white/90 backdrop-blur p-8 rounded-3xl shadow-2xl max-w-md w-full border-4 border-blue-100 flex flex-col gap-4">
                <p className="text-xl text-center text-gray-600 font-bold mb-4">בחר שפה / Select Language</p>
                
                <button 
                    onClick={() => onStartGame('hebrew')}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                    <span>🇮🇱</span> עברית
                </button>

                <button 
                    onClick={() => onStartGame('english')}
                    className="w-full bg-red-500 hover:bg-red-600 text-white text-2xl font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                >
                    <span>🇺🇸</span> English
                </button>
            </div>
        </div>
      );
  }

  // --- PLAY MODE ---
  if (!currentQuestion) return (
      <div className="h-full w-full bg-sky-200 flex flex-col items-center justify-center p-4">
          <div className="w-12 h-12 border-4 border-white border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-blue-600 font-bold animate-pulse">Building questions...</p>
      </div>
  );

  return (
    <div className="h-full w-full bg-sky-200 flex flex-col items-center p-2 md:p-4 relative overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none">
         {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute bg-white rounded-full opacity-80 animate-float"
                 style={{
                   width: Math.random() * 10 + 5 + 'px',
                   height: Math.random() * 10 + 5 + 'px',
                   top: Math.random() * 10 + '%',
                   left: Math.random() * 10 + '%',
                   animationDuration: Math.random() * 5 + 3 + 's'
                 }}
            ></div>
         ))}
      </div>

      <div className="absolute top-[54px] left-8 z-20 flex gap-2">
         <Button onClick={onBack} color="red" size="sm">Back</Button>
         <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
      </div>
      
      <div className="absolute top-[54px] right-8 z-20">
         <div className="bg-white/80 backdrop-blur px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-blue-800 shadow-sm text-xs md:text-base">
            Snowman! {partsBuilt}/5
         </div>
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-5xl flex-1 gap-2 md:gap-6 items-center justify-center z-10 pt-16 md:pt-20 min-h-0">
        
        <div className="w-full md:w-1/3 h-40 md:h-96 flex items-center justify-center relative shrink-0">
           {renderSnowman()}
        </div>

        <div className="w-full md:w-2/3 bg-white/95 backdrop-blur rounded-3xl p-4 md:p-6 shadow-2xl border-4 border-blue-100 flex flex-col items-center flex-1 min-h-0 relative overflow-hidden">
           
           {isLoadingNext && (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 rounded-3xl">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mb-2"></div>
                    <span className="text-blue-600 font-bold animate-pulse">Making more snow...</span>
                </div>
           )}

           <div className="flex-1 flex flex-col items-center justify-center w-full min-h-0">
              <p className="text-gray-500 font-medium mb-1 md:mb-2 uppercase tracking-wider text-xs md:text-sm shrink-0">
                  {language === 'hebrew' ? 'השלימו את המשפט' : 'Fill in the blank'}
              </p>
              
              <div className="flex-1 flex items-center justify-center w-full my-2">
                <div 
                    className="text-2xl md:text-5xl font-black text-gray-800 text-center leading-relaxed font-dynamic w-full" 
                    dir={language === 'hebrew' ? "rtl" : "ltr"}
                >
                    {isCorrect || isAnswered ? (
                        <span>
                            {currentQuestion.fullSentence.split(currentQuestion.missingWord).map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span className="text-green-600 inline-block border-b-4 border-green-400 px-2 mx-1 bg-green-50 rounded-t-lg animate-bounce">
                                            {currentQuestion.missingWord}
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </span>
                    ) : (
                        <span>
                            {currentQuestion.sentenceWithBlank.split('___').map((part, i, arr) => (
                                <React.Fragment key={i}>
                                    {part}
                                    {i < arr.length - 1 && (
                                        <span className="inline-block w-16 md:w-24 border-b-4 border-gray-300 mx-2 animate-pulse bg-gray-100 rounded h-8 md:h-12 align-middle"></span>
                                    )}
                                </React.Fragment>
                            ))}
                        </span>
                    )}
                </div>
              </div>

              {/* Hint Sentence (Opposite Language) */}
              <p className="text-sm md:text-lg text-blue-500 font-medium italic mb-4 md:mb-8 shrink-0" dir={language === 'hebrew' ? "ltr" : "rtl"}>
                "{currentQuestion.translation}"
              </p>

              <div className="grid grid-cols-2 gap-2 md:gap-4 w-full shrink-0" dir={language === 'hebrew' ? "rtl" : "ltr"}>
                 {shuffledOptions.map((option, idx) => {
                    const isSelected = isAnswered && option === currentQuestion.missingWord;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionClick(option)}
                        disabled={isAnswered}
                        className={`
                           p-2 md:p-4 text-lg md:text-2xl font-bold rounded-2xl border-b-4 transition-all duration-200
                           ${isAnswered && option === currentQuestion.missingWord 
                              ? 'bg-green-500 border-green-700 text-white scale-105 shadow-lg' 
                              : isAnswered 
                                ? 'bg-gray-100 border-gray-300 text-gray-400' 
                                : 'bg-white hover:bg-blue-50 border-blue-200 text-gray-700 hover:-translate-y-1 hover:shadow-md'}
                        `}
                      >
                        {option}
                      </button>
                    );
                 })}
              </div>
           </div>

           {isCorrect && (
               <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <span className="text-6xl md:text-9xl animate-ping opacity-50">❄️</span>
               </div>
           )}
        </div>
      </div>
    </div>
  );
};
