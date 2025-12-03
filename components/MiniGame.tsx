
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameQuestion, AppSettings } from '../types';
import { Button } from './Button';
import { evaluatePronunciation, playTextToSpeech, getMiniGameImageUrl, prefetchTTS, resumeAudioContext } from '../services/geminiService';
import { HandwrittenLetter } from './HandwrittenLetter'; 

interface MiniGameProps {
  question: GameQuestion;
  nextQuestion?: GameQuestion; 
  onCorrect: () => void;
  onWrong: () => void;
  questionNumber: number;
  totalQuestions: number;
  isTutorialActive?: boolean;
  settings: AppSettings;
}

type ActivityState = 'answering' | 'speak_prompt' | 'listening' | 'evaluating' | 'feedback';

export const MiniGame: React.FC<MiniGameProps> = ({ 
  question, 
  nextQuestion,
  onCorrect, 
  onWrong,
  questionNumber,
  totalQuestions,
  isTutorialActive = false,
  settings
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);

  const [activityState, setActivityState] = useState<ActivityState>('answering');
  const [feedbackText, setFeedbackText] = useState('');
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isPressedRef = useRef(false); 
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const speak = useCallback(async (text: string) => {
    await playTextToSpeech(text);
  }, []);

  const playSfx = useCallback((type: 'correct' | 'wrong') => {
    if (!settings.soundEffects) return;
    const url = type === 'correct' 
      ? 'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3'
      : 'https://codeskulptor-demos.commondatastorage.googleapis.com/assets/sounddogs/explosion.mp3';
    const audio = new Audio(url);
    audio.volume = type === 'correct' ? 0.5 : 0.2;
    audio.play().catch(() => {});
  }, [settings.soundEffects]);

  useEffect(() => {
    const options = [...question.distractors, question.correctTranslation];
    setShuffledOptions(options.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
    setIsAnswered(false);
    setActivityState('answering');
    setFeedbackText('');
    setImageLoaded(false);
    setImageError(false);
    
    if (!isTutorialActive && settings.autoPlayAudio) {
      const timer = setTimeout(() => speak(question.word), 600);
      return () => clearTimeout(timer);
    }
  }, [question, speak, isTutorialActive, settings.autoPlayAudio]);

  useEffect(() => {
    if (nextQuestion) {
        prefetchTTS(nextQuestion.word);
    }
  }, [nextQuestion]);

  useEffect(() => {
    if (!imageLoaded && !imageError) {
      const timer = setTimeout(() => {
        if (!imageLoaded) setImageError(true);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, imageError, question.id]);

  useEffect(() => {
    if (activityState === 'feedback' && feedbackText) {
      speak(feedbackText);
      const timer = setTimeout(() => {
        onCorrect(); 
      }, 3000); 
      return () => clearTimeout(timer);
    }
  }, [activityState, feedbackText, onCorrect, speak]);

  const handleRecordingStop = async () => {
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
    setActivityState('evaluating');
    const feedback = await evaluatePronunciation(audioBlob, question.word, settings.childName);
    setFeedbackText(feedback);
    setActivityState('feedback');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
    audioChunksRef.current = [];
  };

  const handleRecordButtonPress = async (e: React.SyntheticEvent) => {
    if (activityState !== 'speak_prompt') return;
    
    resumeAudioContext();
    
    isPressedRef.current = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (!isPressedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        return;
      }
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      });
      mediaRecorderRef.current.addEventListener('stop', handleRecordingStop);
      mediaRecorderRef.current.start();
      setActivityState('listening');
    } catch (err) {
      console.error("Microphone access denied:", err);
      isPressedRef.current = false;
      alert("Microphone needed!");
      onCorrect();
    }
  };

  const handleRecordButtonRelease = () => {
    isPressedRef.current = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
    }
  };

  const handleAnswer = (answer: string) => {
    if (isAnswered || isTutorialActive) return;
    
    resumeAudioContext();
    
    setSelectedAnswer(answer);
    setIsAnswered(true);
    const isCorrect = answer === question.correctTranslation;
    if (isCorrect) {
      playSfx('correct');
      setTimeout(() => setActivityState('speak_prompt'), 1500); 
    } else {
       playSfx('wrong');
       setTimeout(() => {
         setIsAnswered(false);
         setSelectedAnswer(null);
         onWrong();
      }, 1200);
    }
  };

  const imageSrc = useMemo(() => {
    return getMiniGameImageUrl(question.correctTranslation);
  }, [question.correctTranslation]);
  
  const nextImageSrc = useMemo(() => {
    if (!nextQuestion) return null;
    return getMiniGameImageUrl(nextQuestion.correctTranslation);
  }, [nextQuestion]);

  const handleReset = () => {
      window.location.reload();
  };

  const renderSpeakActivity = () => {
    if (activityState === 'answering') return null;
    let content;
    switch(activityState) {
      case 'speak_prompt':
      case 'listening':
        content = (
          <>
            <p className="text-lg md:text-xl text-gray-600 mb-2 font-bold">
              {activityState === 'listening' ? 'מקשיב...' : 'לחץ והחזק כדי לומר את המילה!'}
            </p>
            <div className="mb-4 md:mb-6 text-5xl md:text-6xl text-purple-600">
              <HandwrittenLetter 
                text={question.word} 
                fontStyle={settings.fontStyle} 
                className="font-black tracking-wide"
              />
            </div>
            <button
              onMouseDown={handleRecordButtonPress}
              onMouseUp={handleRecordButtonRelease}
              onMouseLeave={handleRecordButtonRelease}
              onTouchStart={handleRecordButtonPress}
              onTouchEnd={handleRecordButtonRelease}
              onTouchCancel={handleRecordButtonRelease}
              className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-200 shadow-xl select-none ${activityState === 'listening' ? 'bg-red-500 text-white animate-pulse scale-110' : 'bg-purple-500 text-white hover:bg-purple-600 active:scale-95'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        );
        break;
      case 'evaluating':
        content = (
          <>
            <div className="w-20 h-20 border-8 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-purple-700 animate-pulse">מקשיב...</h2>
          </>
        );
        break;
      case 'feedback':
        content = (
          <>
            <div className="text-6xl md:text-8xl mb-4 animate-bounce">⭐</div>
            <h2 className="text-4xl md:text-5xl font-bold text-purple-700 font-round">{feedbackText}</h2>
          </>
        );
        break;
    }
    return (
      <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 pop-in rounded-3xl border-4 border-purple-100 p-4 text-center">
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto h-full overflow-hidden relative pb-1">
      
      {/* HIDDEN PRELOADER FOR NEXT QUESTION */}
      {nextImageSrc && (
          <img 
            src={nextImageSrc} 
            alt="preload" 
            style={{ display: 'none' }} 
            crossOrigin="anonymous"
          />
      )}
      
      <div className="w-full flex items-center gap-2 mb-1 md:mb-2 shrink-0">
          <div className="bg-gray-200 rounded-full h-3 md:h-4 flex-1">
            <div className="bg-green-500 h-3 md:h-4 rounded-full transition-all duration-500" style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}></div>
          </div>
          <Button onClick={handleReset} color="yellow" size="sm" className="h-6 w-6 p-0 rounded-full flex items-center justify-center text-xs" title="Reload Level">🔄</Button>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-2 md:p-4 w-full text-center relative border-b-8 border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">
        {renderSpeakActivity()}
        <div className="absolute top-2 left-2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-md z-10">
          {questionNumber} / {totalQuestions}
        </div>

        {/* Word Display - Acts as Button */}
        <div className="shrink-0 mt-1 mb-1 md:mt-2 md:mb-2">
            <button 
              className="text-4xl md:text-4xl text-gray-800 mb-1 cursor-pointer hover:text-purple-600 transition-colors drop-shadow-sm select-none pop-in flex justify-center w-full outline-none focus:scale-105 active:scale-95"
              onClick={(e) => { 
                e.preventDefault(); 
                speak(question.word); 
              }}
              type="button"
            >
              <HandwrittenLetter 
                  text={question.word} 
                  fontStyle={settings.fontStyle} 
                  className="font-black tracking-wide"
              />
            </button>
            
            <div className="flex justify-center mb-1">
                <Button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      e.stopPropagation();
                      speak(question.word); 
                    }} 
                    color="blue" 
                    size="sm"
                    className="shadow-md py-1 px-3 text-xs md:text-sm rounded-full h-8"
                >
                    🔊 השמע שוב
                </Button>
            </div>
        </div>

        {/* Image Container - Flexible Height, shrinks as needed to show buttons */}
        <div className="relative rounded-2xl shadow-inner border-4 border-purple-100 bg-gray-50 overflow-hidden flex items-center justify-center mb-1 md:mb-2 flex-1 min-h-0 w-full mx-auto group">
           
           {/* Skeleton / Loading State */}
           {!imageLoaded && !imageError && (
             <div className="absolute inset-0 bg-gray-100 animate-pulse flex flex-col items-center justify-center rounded-2xl z-10 p-4 text-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-2 shadow-sm shrink-0"></div>
                {question.hebrewHint ? (
                    <span className="text-purple-600 text-sm font-bold font-dynamic overflow-y-auto max-h-[60%] w-full">{question.hebrewHint}</span>
                ) : (
                    <span className="text-purple-500 font-bold text-sm font-round animate-bounce">...מצייר</span>
                )}
             </div>
           )}

           {/* Error State - Fallback to Hint */}
           {imageError && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded-2xl p-4 z-10 text-center">
                <span className="text-5xl mb-2 opacity-50 grayscale">🖼️</span>
                <span className="text-sm font-bold text-indigo-600 font-dynamic overflow-y-auto max-h-full w-full">
                    {question.hebrewHint || "תמונה לא זמינה"}
                </span>
             </div>
           )}

           {/* Actual Image */}
           <img 
               key={question.id} 
               src={imageSrc} 
               alt={question.correctTranslation}
               className={`w-full h-full object-contain rounded-xl transition-all duration-700 ease-in-out transform ${imageLoaded && !imageError ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
               onLoad={() => setImageLoaded(true)}
               onError={() => { setImageLoaded(true); setImageError(true); }}
               crossOrigin="anonymous"
             />
        </div>
        
        {/* Answers Grid - Fixed/Shrink-0 to guarantee visibility */}
        <div className="grid grid-cols-2 gap-1 md:gap-3 shrink-0 w-full h-auto pb-0 md:pb-1">
          {shuffledOptions.map((option, idx) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctTranslation;
            let btnColor: 'blue' | 'green' | 'red' = 'blue';
            if (isAnswered) {
                if (isSelected && isCorrect) btnColor = 'green';
                else if (isSelected && !isCorrect) btnColor = 'red';
                else if (!isSelected && isCorrect) btnColor = 'green';
            }
            
            return (
              <Button
                key={idx}
                onClick={() => handleAnswer(option)}
                color={btnColor}
                disabled={isAnswered || isTutorialActive} 
                className={`w-full h-auto min-h-[40px] md:min-h-[60px] text-lg md:text-xl transition-transform duration-200 ${isSelected ? "ring-4 ring-offset-2 ring-purple-400 z-10" : ""}`}
              >
                {option}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
