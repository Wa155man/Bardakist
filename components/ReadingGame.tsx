
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ReadingQuestion } from '../types';
import { playTextToSpeech } from '../services/geminiService';

interface ReadingGameProps {
  questions: ReadingQuestion[];
  onBack: () => void;
  onGameAction: (action: 'more' | 'restart', lang: 'hebrew' | 'english') => Promise<void>;
  onEarnPoints?: (amount: number) => void;
}

export const ReadingGame: React.FC<ReadingGameProps> = ({ questions, onBack, onGameAction, onEarnPoints }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [language, setLanguage] = useState<'hebrew' | 'english'>('hebrew');
  
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasAttemptedWrong, setHasAttemptedWrong] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  const currentQ = questions[currentIndex];

  useEffect(() => {
    setIsAnswered(false);
    setSelectedOption(null);
    setIsCorrect(false);
    setHasAttemptedWrong(false);
    setIsLoadingNext(false);
  }, [currentIndex]);

  const handleLanguageChange = async (lang: 'hebrew' | 'english') => {
      if (lang === language) return;
      setLanguage(lang);
      // Reset local state
      setCurrentIndex(0);
      setCorrectCount(0);
      setTotalCount(0);
      // Trigger data fetch for new language
      setIsLoadingNext(true);
      await onGameAction('restart', lang);
      setIsLoadingNext(false);
  };

  const handleOptionClick = async (option: string) => {
    if (isAnswered || isLoadingNext) return;
    
    setSelectedOption(option);

    if (option === currentQ.correctAnswer) {
      setIsAnswered(true);
      setIsCorrect(true);
      
      if (!hasAttemptedWrong) {
        setCorrectCount(prev => prev + 1);
        if (onEarnPoints) onEarnPoints(3); 
      }
      setTotalCount(prev => prev + 1);
      
      playTextToSpeech("Excellent!");

      setTimeout(async () => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          setIsLoadingNext(true);
          await onGameAction('more', language);
          setCurrentIndex(prev => prev + 1);
        }
      }, 1500);

    } else {
      setIsCorrect(false);
      setHasAttemptedWrong(true);
      playTextToSpeech("Try again");
    }
  };

  const handleReset = () => {
      setCurrentIndex(0);
      setCorrectCount(0);
      setTotalCount(0);
  };

  return (
    <div className="h-full w-full bg-cyan-50 flex flex-col relative overflow-hidden items-center">
      <div className="absolute top-[46px] left-4 z-20 flex gap-2">
         <Button onClick={onBack} color="red" size="sm">Back</Button>
         <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
      </div>
      
      <div className="absolute top-[46px] right-4 z-20">
         <div className="bg-white px-4 py-2 rounded-full shadow-md border-2 border-cyan-100">
            <span className="font-bold text-cyan-700 font-dynamic text-lg">Score: {correctCount}</span>
         </div>
      </div>

      {/* Language Toggle */}
      <div className="absolute top-[100px] left-1/2 transform -translate-x-1/2 z-20 flex bg-white/90 backdrop-blur shadow-md rounded-xl border-2 border-cyan-200 overflow-hidden w-48">
            <button 
                onClick={() => handleLanguageChange('hebrew')}
                className={`flex-1 py-1 text-sm font-bold ${language === 'hebrew' ? 'bg-cyan-500 text-white' : 'text-gray-500 hover:bg-cyan-50'}`}
            >
                עברית 🇮🇱
            </button>
            <button 
                onClick={() => handleLanguageChange('english')}
                className={`flex-1 py-1 text-sm font-bold ${language === 'english' ? 'bg-cyan-500 text-white' : 'text-gray-500 hover:bg-cyan-50'}`}
            >
                English 🇺🇸
            </button>
      </div>

      <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col justify-center pt-[140px] pb-4 px-4 gap-4">
        
        <h1 className="text-3xl font-black text-cyan-600 mb-0 font-dynamic text-center shrink-0 leading-none">
          {language === 'hebrew' ? 'הֲבָנַת הַנִּקְרָא' : 'Reading Comprehension'}
        </h1>

        {!currentQ ? (
            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin mb-4"></div>
                <p className="text-cyan-600 font-bold animate-pulse text-xl">Loading story...</p>
            </div>
        ) : (
            <>
                <div className="bg-white rounded-2xl shadow-lg p-4 w-full border-l-8 border-cyan-400 relative flex flex-col max-h-[40vh] shrink-0">
                {isLoadingNext && (
                    <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center z-20 rounded-2xl">
                        <div className="w-12 h-12 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                        <span className="text-cyan-600 font-bold animate-pulse text-xl">Loading...</span>
                    </div>
                )}
                
                <div className="flex justify-between items-start mb-2 shrink-0">
                    <button 
                        onClick={() => playTextToSpeech(currentQ.passage)}
                        className="text-cyan-500 hover:text-cyan-700 p-2 rounded-full hover:bg-cyan-50 transition-colors ml-auto"
                        title="Listen to text"
                    >
                        <span className="text-2xl">🔊</span>
                    </button>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar pr-2">
                    <p className="text-xl md:text-2xl leading-relaxed text-gray-800 font-dynamic w-full text-center" dir={language === 'hebrew' ? "rtl" : "ltr"}>
                        {currentQ.passage}
                    </p>
                </div>
                </div>

                <div className="shrink-0 w-full flex flex-col gap-2">
                    <div className="w-full">
                        <div className="inline-block bg-cyan-100 px-4 py-2 rounded-xl border border-cyan-200 w-full">
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 font-dynamic text-center" dir={language === 'hebrew' ? "rtl" : "ltr"}>
                            {currentQ.question}
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full">
                    {currentQ.options.map((opt, idx) => {
                        let btnClass = "bg-white border-gray-300 hover:bg-cyan-50 text-gray-700";
                        
                        if (isAnswered && isCorrect) {
                            if (opt === currentQ.correctAnswer) {
                                btnClass = "bg-green-500 border-green-700 text-white";
                            } else {
                                btnClass = "bg-gray-100 border-gray-200 text-gray-400 opacity-40";
                            }
                        } else if (opt === selectedOption && !isCorrect) {
                            btnClass = "bg-red-500 border-red-700 text-white";
                        }

                        return (
                            <button
                                key={idx}
                                onClick={() => handleOptionClick(opt)}
                                disabled={isAnswered}
                                className={`
                                    p-3 rounded-xl border-b-4 text-lg md:text-xl font-bold text-center font-dynamic transition-all shadow-sm
                                    flex items-center justify-center min-h-[50px]
                                    ${btnClass}
                                    ${isAnswered && opt === currentQ.correctAnswer ? 'scale-105 shadow-lg z-10' : 'active:translate-y-1 active:border-b-0'}
                                `}
                                dir={language === 'hebrew' ? "rtl" : "ltr"}
                            >
                                {opt}
                            </button>
                        );
                    })}
                    </div>
                </div>
            </>
        )}

      </div>
    </div>
  );
};
