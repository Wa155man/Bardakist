
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { GameQuestion, AppSettings } from '../types';
import { Button } from './Button';
import { evaluatePronunciation, playTextToSpeech, getMiniGameImageUrl, resumeAudioContext } from '../services/geminiService';

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

const getEmojiFallback = (word: string): string => {
    const map: Record<string, string> = {
        'dad': '👨', 'father': '👨', 'mom': '👩', 'mother': '👩',
        'garden': '🏡', 'flower': '🌸', 'hand': '✋', 'leg': '🦵',
        'milk': '🥛', 'candle': '🕯️', 'horse': '🐎', 'bottle': '🍼',
        'cat': '🐱', 'dog': '🐶', 'sun': '☀️', 'moon': '🌙', 'bread': '🍞'
    };
    return map[word.toLowerCase()] || '🎁';
};

export const MiniGame: React.FC<MiniGameProps> = ({ 
  question, 
  onCorrect, 
  onWrong,
  questionNumber,
  totalQuestions,
  settings
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [activityState, setActivityState] = useState<'answering' | 'speak_prompt' | 'listening' | 'evaluating' | 'feedback'>('answering');
  const [feedbackText, setFeedbackText] = useState('');
  const [isExcellent, setIsExcellent] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const options = [...question.distractors, question.correctTranslation];
    setShuffledOptions(options.sort(() => Math.random() - 0.5));
    setSelectedAnswer(null);
    setIsAnswered(false);
    setActivityState('answering');
    setImageLoaded(false);
    setImageError(false);

    // Cleanup recording on unmount or question change
    return () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [question]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;
    resumeAudioContext();
    setSelectedAnswer(answer);
    setIsAnswered(true);
    if (answer === question.correctTranslation) {
      setTimeout(() => setActivityState('speak_prompt'), 800);
    } else {
      setTimeout(() => { setIsAnswered(false); setSelectedAnswer(null); onWrong(); }, 1000);
    }
  };

  const handleToggleRecord = async () => {
    // If we are already listening, stop it manually
    if (activityState === 'listening') {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Otherwise, start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        setActivityState('evaluating');
        // Release mic tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Safety: If blob is empty, skip to next
        if (blob.size === 0) {
            onCorrect();
            return;
        }

        const res = await evaluatePronunciation(blob, question.word);
        setFeedbackText(res.grade);
        setIsExcellent(res.isExcellent);
        setActivityState('feedback');
        setTimeout(() => onCorrect(), 2000);
      };

      mediaRecorder.start();
      setActivityState('listening');

      // Auto-stop after 10 seconds to prevent getting stuck
      stopTimeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
      }, 10000);

    } catch (e) { 
        console.warn("Microphone access denied or error:", e);
        setFeedbackText("נִשְׁמַע מְצֻיָּן!");
        setActivityState('feedback');
        setTimeout(() => onCorrect(), 1500); 
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full relative">
      <div className="bg-white rounded-3xl shadow-xl p-4 w-full h-full flex flex-col overflow-hidden relative border-4 border-indigo-100">
        
        {activityState !== 'answering' && (
           <div className="absolute inset-0 z-50 bg-white/95 flex flex-col items-center justify-center p-6 text-center">
              {activityState === 'speak_prompt' && (
                <>
                  <h2 className="text-2xl font-black text-indigo-700 mb-4 font-dynamic">אִמְרוּ אֶת הַמִּילָּה!</h2>
                  <h1 className="text-6xl font-black mb-8">{question.word}</h1>
                  <button 
                    onClick={handleToggleRecord} 
                    className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-lg text-white text-4xl hover:scale-110 active:scale-95 transition-transform"
                  >
                    🎙️
                  </button>
                  <p className="mt-4 text-gray-400 font-bold">לחצו על המיקרופון ודברו</p>
                </>
              )}
              {activityState === 'listening' && (
                <>
                  <h2 className="text-2xl font-black text-indigo-700 mb-4 font-dynamic">מַקְשִׁיב...</h2>
                  <h1 className="text-6xl font-black mb-8 animate-pulse">{question.word}</h1>
                  <button 
                    onClick={handleToggleRecord} 
                    className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center shadow-lg text-white text-4xl hover:scale-110 active:scale-95 transition-transform animate-pulse"
                  >
                    ⏹️
                  </button>
                  <p className="mt-4 text-red-500 font-black animate-bounce">לחצו לסיום (Press to Finish)</p>
                </>
              )}
              {activityState === 'evaluating' && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <h2 className="text-2xl font-black text-indigo-700 font-dynamic">בּוֹדֵק... (Checking)</h2>
                </div>
              )}
              {activityState === 'feedback' && (
                <div className="pop-in flex flex-col items-center gap-4">
                   <h1 className="text-5xl font-black text-green-600 mb-2">{feedbackText}</h1>
                   {isExcellent ? (
                     <div className="text-8xl animate-bounce">🌟</div>
                   ) : (
                     <div className="text-8xl animate-bounce">✨</div>
                   )}
                </div>
              )}
           </div>
        )}

        <div className="flex justify-between items-center mb-2 px-2">
            <span className="bg-indigo-500 text-white px-3 py-1 rounded-full text-xs font-bold">{questionNumber} / {totalQuestions}</span>
            <button 
              onClick={() => playTextToSpeech(question.word)} 
              className="text-2xl hover:scale-110 transition-transform p-2"
            >
              🔊
            </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-h-0 gap-4">
            <h1 className="text-5xl md:text-6xl font-black text-gray-800 font-dynamic shrink-0">{question.word}</h1>
            
            <div className="relative w-full flex-1 max-h-[300px] bg-gray-50 rounded-2xl border-2 border-dashed border-indigo-100 flex items-center justify-center overflow-hidden">
                {!imageLoaded && !imageError && <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>}
                
                {imageError ? (
                  <div className="flex flex-col items-center animate-float">
                    <span className="text-9xl">{getEmojiFallback(question.correctTranslation)}</span>
                    <span className="text-indigo-400 font-bold mt-2 uppercase">{question.correctTranslation}</span>
                  </div>
                ) : (
                  <img 
                    src={getMiniGameImageUrl(question.correctTranslation)} 
                    onLoad={() => setImageLoaded(true)} 
                    onError={() => { setImageError(true); setImageLoaded(true); }}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`} 
                  />
                )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4 shrink-0">
          {shuffledOptions.map((opt, i) => (
            <Button 
              key={i} 
              onClick={() => handleAnswer(opt)} 
              color={isAnswered ? (opt === question.correctTranslation ? 'green' : 'red') : 'blue'}
              disabled={isAnswered}
              className="text-xl py-4"
            >
              {opt}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
