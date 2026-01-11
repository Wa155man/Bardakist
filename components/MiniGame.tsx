
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

// Helper for high-quality emoji fallbacks
const getEmojiFallback = (word: string): string => {
    const map: Record<string, string> = {
        'dad': '👨', 'father': '👨', 'mom': '👩', 'mother': '👩',
        'garden': '🏡', 'flower': '🌸', 'hand': '✋', 'leg': '🦵',
        'milk': '🥛', 'candle': '🕯️', 'horse': '🐎', 'bottle': '🍼',
        'cat': '🐱', 'dog': '🐶', 'sun': '☀️', 'moon': '🌙', 'bread': '🍞'
    };
    return map[word.toLowerCase()] || '📦';
};

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
  const [isExcellent, setIsExcellent] = useState(false);
  
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

  const playSfx = useCallback((type: 'correct' | 'wrong' | 'excellent') => {
    if (!settings.soundEffects) return;
    const urls = {
        correct: 'https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3',
        wrong: 'https://codeskulptor-demos.commondatastorage.googleapis.com/assets/sounddogs/explosion.mp3',
        excellent: 'https://codeskulptor-demos.commondatastorage.googleapis.com/utils/zoom.mp3'
    };
    const audio = new Audio(urls[type]);
    audio.volume = type === 'excellent' ? 0.7 : 0.5;
    audio.play().catch(() => {});
  }, [settings.soundEffects]);

  useEffect(() => {
    const options = [...question.distractors, question.correctTranslation];
    setShuffledOptions(options.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
    setIsAnswered(false);
    setActivityState('answering');
    setFeedbackText('');
    setIsExcellent(false);
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
    if (activityState === 'feedback' && feedbackText) {
      speak(feedbackText);
      const timer = setTimeout(() => {
        onCorrect(); 
      }, isExcellent ? 2500 : 4000); 
      return () => clearTimeout(timer);
    }
  }, [activityState, feedbackText, onCorrect, speak, isExcellent]);

  const handleRecordingStop = async () => {
    const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
    const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
    setActivityState('evaluating');
    
    const evaluation = await evaluatePronunciation(audioBlob, question.word);
    setFeedbackText(evaluation.grade);
    setIsExcellent(evaluation.isExcellent);
    
    if (evaluation.isExcellent) playSfx('excellent');
    
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
      alert("Microphone needed for pronunciation check!");
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
      setTimeout(() => setActivityState('speak_prompt'), 1200); 
    } else {
       playSfx('wrong');
       setTimeout(() => {
         setIsAnswered(false);
         setSelectedAnswer(null);
         onWrong();
      }, 1000);
    }
  };

  const imageSrc = useMemo(() => {
    return getMiniGameImageUrl(question.correctTranslation);
  }, [question.correctTranslation]);

  const renderSpeakActivity = () => {
    if (activityState === 'answering') return null;
    let content;
    switch(activityState) {
      case 'speak_prompt':
      case 'listening':
        content = (
          <>
            <p className="text-xl md:text-2xl text-gray-700 mb-2 font-black font-dynamic">
              {activityState === 'listening' ? 'מַקְשִׁיב... (Listening...)' : 'אִמְרוּ אֶת הַמִּילָּה! (Say the word!)'}
            </p>
            <div className="mb-4 md:mb-6 text-6xl md:text-7xl text-purple-700">
              <HandwrittenLetter 
                text={question.word} 
                fontStyle={settings.fontStyle} 
                className="font-black tracking-wide drop-shadow-sm"
              />
            </div>
            <button
              onMouseDown={handleRecordButtonPress}
              onMouseUp={handleRecordButtonRelease}
              onMouseLeave={handleRecordButtonRelease}
              onTouchStart={handleRecordButtonPress}
              onTouchEnd={handleRecordButtonRelease}
              onTouchCancel={handleRecordButtonRelease}
              className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl select-none ${activityState === 'listening' ? 'bg-red-500 text-white animate-pulse scale-110 ring-8 ring-red-100' : 'bg-purple-600 text-white hover:bg-purple-700 active:scale-95'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 md:h-18 md:w-18 pointer-events-none" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        );
        break;
      case 'evaluating':
        content = (
          <>
            <div className="w-20 h-20 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl md:text-3xl font-black text-purple-700 animate-pulse font-dynamic">...בּוֹדֵק (Checking)</h2>
          </>
        );
        break;
      case 'feedback':
        content = (
          <div className="pop-in flex flex-col items-center">
            {isExcellent && <div className="text-7xl md:text-9xl mb-4 animate-bounce drop-shadow-md">✨</div>}
            <h2 className={`text-3xl md:text-5xl font-black ${isExcellent ? 'text-green-600' : 'text-purple-700'} font-dynamic leading-tight`}>
                {feedbackText}
            </h2>
            {isExcellent && <p className="text-green-500 font-bold mt-2">Metsuyan! Perfect!</p>}
          </div>
        );
        break;
    }
    return (
      <div className="absolute inset-0 bg-white/98 backdrop-blur-md flex flex-col items-center justify-center z-50 pop-in rounded-3xl border-4 border-purple-200 p-6 text-center shadow-inner">
        {content}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto h-full overflow-hidden relative pb-1">
      <div className="bg-white rounded-3xl shadow-2xl p-2 md:p-4 w-full text-center relative border-b-8 border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">
        {renderSpeakActivity()}
        <div className="absolute top-2 left-2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs md:text-sm font-bold shadow-md z-10 font-dynamic">
          {questionNumber} / {totalQuestions}
        </div>

        <div className="shrink-0 mt-1 mb-1 md:mt-2 md:mb-2">
            <button 
              className="text-5xl md:text-6xl text-gray-800 mb-1 cursor-pointer hover:text-purple-600 transition-colors drop-shadow-sm select-none pop-in flex justify-center w-full outline-none focus:scale-105 active:scale-95"
              onClick={(e) => { 
                e.preventDefault(); 
                speak(question.word); 
              }}
            >
              <HandwrittenLetter text={question.word} fontStyle={settings.fontStyle} className="font-black tracking-wide" />
            </button>
        </div>

        <div className="relative rounded-2xl shadow-inner border-4 border-purple-100 bg-gray-50 overflow-hidden flex items-center justify-center mb-1 md:mb-2 flex-1 min-h-0 w-full mx-auto group">
           {!imageLoaded && !imageError && (
             <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center rounded-2xl z-10 p-4 text-center">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin"></div>
             </div>
           )}

           {imageError ? (
               <div className="flex flex-col items-center justify-center p-8 bg-white w-full h-full">
                   <div className="text-9xl animate-float filter drop-shadow-md">
                       {getEmojiFallback(question.correctTranslation)}
                   </div>
                   <p className="mt-4 text-purple-600 font-black text-xl font-dynamic">{question.correctTranslation.toUpperCase()}</p>
               </div>
           ) : (
               <img 
                   key={question.id} 
                   src={imageSrc} 
                   alt={question.correctTranslation}
                   className={`w-full h-full object-contain rounded-xl transition-all duration-300 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                   onLoad={() => setImageLoaded(true)}
                   onError={() => { setImageError(true); setImageLoaded(true); }}
                   crossOrigin="anonymous"
               />
           )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 md:gap-4 shrink-0 w-full h-auto pb-1">
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
                className={`w-full h-auto min-h-[44px] md:min-h-[64px] text-xl md:text-2xl font-black ${isSelected ? "ring-4 ring-offset-2 ring-purple-400 z-10" : ""}`}
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
