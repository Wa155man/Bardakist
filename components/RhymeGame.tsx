
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { RhymeQuestion } from '../types';
import { playTextToSpeech, prefetchTTS, resumeAudioContext } from '../services/geminiService';

interface RhymeGameProps {
  questions: RhymeQuestion[];
  onBack: () => void;
  onLoadMore?: () => Promise<void>;
  onEarnPoints?: (amount: number) => void;
}

export const RhymeGame: React.FC<RhymeGameProps> = ({ questions, onBack, onLoadMore, onEarnPoints }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    if (currentQuestion) {
      const allOptions = [...currentQuestion.distractors, currentQuestion.rhymeWord];
      setOptions(allOptions.sort(() => Math.random() - 0.5));
      setIsAnswered(false);
      setIsCorrect(false);
      setIsLoadingNext(false);
      
      // Play target word immediately (after short delay for transition)
      setTimeout(() => playTextToSpeech(currentQuestion.targetWord), 500);

      // Prefetch audio for all options so they play instantly on click
      allOptions.forEach(opt => prefetchTTS(opt));
    }
  }, [currentQuestion]);

  // Prefetch logic
  useEffect(() => {
    if (onLoadMore && questions.length > 0 && currentIndex === questions.length - 3 && !isLoadingNext) {
       onLoadMore();
    }
  }, [currentIndex, questions.length, onLoadMore, isLoadingNext]);

  const handleOptionClick = async (option: string) => {
    if (isAnswered || isLoadingNext) return;

    // Ensure Audio Context is active on user interaction
    resumeAudioContext();

    setIsAnswered(true);
    const correct = option === currentQuestion.rhymeWord;
    setIsCorrect(correct);

    if (correct) {
      setScore(s => s + 3); 
      if (onEarnPoints) onEarnPoints(3);
      playTextToSpeech("Metsuyan! Excellent!");
      
      // Reduced delay from 2000ms to 1200ms for faster feel
      setTimeout(async () => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else if (onLoadMore) {
          setIsLoadingNext(true);
          await onLoadMore();
          setTimeout(() => {
             setIsLoadingNext(false);
             // Safety check: ensure we actually have a next question
             setCurrentIndex(prev => prev + 1);
          }, 100); // Reduced transition delay
        } else {
          playTextToSpeech("You finished all rhymes!");
        }
      }, 1200);
    } else {
      playTextToSpeech("Try again");
      setTimeout(() => {
        setIsAnswered(false);
      }, 1000);
    }
  };

  const playWord = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent focus/other defaults
    resumeAudioContext(); // Crucial for mobile/Safari
    playTextToSpeech(word);
  };

  const handleReset = () => {
      setCurrentIndex(0);
      setScore(0);
  };

  // Initial Loading Screen
  if (!currentQuestion) return (
      <div className="h-full w-full bg-blue-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute top-[54px] left-8 z-20">
             <Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
             <div className="text-9xl text-blue-500 animate-spin mb-4 drop-shadow-md origin-center">
                🎵
             </div>
             <p className="text-blue-600 font-bold text-2xl animate-pulse">טוען חרוזים...</p>
          </div>
      </div>
  );

  return (
    <div className="h-full w-full bg-blue-50 flex flex-col items-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute text-blue-200 animate-float"
                 style={{
                   fontSize: Math.random() * 40 + 40 + 'px',
                   top: Math.random() * 100 + '%',
                   left: Math.random() * 100 + '%',
                   animationDuration: Math.random() * 5 + 4 + 's'
                 }}
            >
              {['♪', '♫', '♬', '♩'][i % 4]}
            </div>
         ))}
      </div>

      <div className="absolute top-[54px] left-8 z-10 flex gap-2">
         <Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button>
         <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
      </div>
      
      <div className="absolute top-[54px] right-8 bg-white px-4 py-2 rounded-full shadow font-bold text-blue-700 z-10">
        ניקוד: {score}
      </div>

      {/* Adjusted marginTop for mobile (mt-24 -> mt-32) to lower it */}
      <h1 className="text-3xl md:text-4xl font-black text-blue-600 mt-32 md:mt-24 mb-2 font-round text-center drop-shadow-sm shrink-0">
        זמן לחרוזים!
      </h1>
      <p className="text-gray-500 mb-6 font-bold shrink-0">מה מתחרז עם...</p>

      {/* Target Word Card - Flexible Height */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0 mb-6">
        <div className="relative bg-white rounded-3xl shadow-2xl p-4 md:p-6 border-b-8 border-blue-200 w-full max-w-md flex flex-col items-center animate-float cursor-pointer hover:scale-105 transition-transform shrink-0 relative overflow-hidden"
            onClick={(e) => playWord(e, currentQuestion.targetWord)}>
            
            {isLoadingNext && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-20 rounded-3xl">
                    <div className="text-7xl text-blue-500 animate-spin mb-2 origin-center">
                        ♫
                    </div>
                    <span className="text-blue-600 font-bold animate-pulse text-lg mb-4">מכין עוד חרוזים...</span>
                    {/* Back button inside overlay for safety if loading hangs */}
                    <Button onClick={onBack} color="red" size="sm" className="pointer-events-auto">חֲזָרָה</Button>
                </div>
            )}

            <div className="absolute -top-6 bg-blue-500 text-white px-6 py-2 rounded-full font-bold shadow-md">
                {currentQuestion.hint}
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-gray-800 font-dynamic mt-4">{currentQuestion.targetWord}</h2>
            <span className="text-blue-400 mt-2 text-sm">לחץ לשמיעה</span>
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 gap-4 max-w-md w-full shrink-0 mb-4">
        {options.map((opt, idx) => {
          let btnColor = 'bg-white border-blue-100 text-gray-700 hover:bg-blue-50';
          if (isAnswered) {
            if (opt === currentQuestion.rhymeWord) btnColor = 'bg-green-500 border-green-700 text-white';
            else if (opt === currentQuestion.targetWord) {/* shouldn't happen */}
            else if (isCorrect === false) btnColor = 'bg-white border-blue-100 text-gray-300'; 
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              // Remove disabled attribute to allow audio click on speaker icon even if answered
              // Logic for answering is handled inside handleOptionClick
              className={`
                relative h-20 md:h-24 rounded-2xl border-b-4 text-2xl md:text-3xl font-bold font-dynamic shadow-lg transition-all duration-300
                ${btnColor}
                ${isAnswered && opt === currentQuestion.rhymeWord ? 'scale-110 z-10' : ''}
                ${!isAnswered ? 'active:scale-95' : 'cursor-default'}
              `}
            >
              {opt}
              <div 
                className="absolute top-1 right-1 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center shadow-sm hover:bg-blue-200 cursor-pointer z-20 active:scale-95"
                onClick={(e) => playWord(e, opt)}
              >
                <span className="text-sm">🔊</span>
              </div>
            </button>
          );
        })}
      </div>

      {isCorrect && (
         <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
            <div className="text-9xl animate-bounce">🎵</div>
         </div>
      )}

    </div>
  );
};
