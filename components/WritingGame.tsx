import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { HEBREW_ALPHABET, ENGLISH_ALPHABET } from '../constants';
import { HebrewLetter, AppSettings } from '../types';
import { evaluateHandwriting, playTextToSpeech } from '../services/geminiService';
import { HandwrittenLetter } from './HandwrittenLetter';

interface WritingGameProps {
  onBack: () => void;
  settings?: AppSettings;
  onEarnPoints?: (amount: number) => void;
}

type PracticeMode = 'to_handwriting' | 'to_print';
type Language = 'hebrew' | 'english';
type EnglishCase = 'upper' | 'lower';

export const WritingGame: React.FC<WritingGameProps> = ({ onBack, settings, onEarnPoints }) => {
  const [currentLetter, setCurrentLetter] = useState<HebrewLetter | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [score, setScore] = useState(0);
  
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('to_handwriting');
  const [language, setLanguage] = useState<Language>('hebrew');
  const [englishCase, setEnglishCase] = useState<EnglishCase>('upper');

  // Determine font
  const handwrittenFontStyle = (settings?.fontStyle === 'hand1') ? 'hand1' : 'playpen';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    startRound();
  }, [practiceMode, language, englishCase]);

  const startRound = () => {
    let sourceAlphabet = HEBREW_ALPHABET;
    
    if (language === 'english') {
        if (englishCase === 'upper') {
            sourceAlphabet = ENGLISH_ALPHABET.slice(0, 26); // A-Z
        } else {
            sourceAlphabet = ENGLISH_ALPHABET.slice(26, 52); // a-z
        }
    }

    const randomLetter = sourceAlphabet[Math.floor(Math.random() * sourceAlphabet.length)];
    setCurrentLetter(randomLetter);
    setFeedback(null);
    setIsSuccess(false);
    setShowGuide(true);
    clearCanvas();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawing.current = true;
    lastPos.current = getPos(e);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || !lastPos.current || !canvasRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const newPos = getPos(e);

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(newPos.x, newPos.y);
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = newPos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  const checkDrawing = async () => {
    if (!currentLetter || !canvasRef.current) return;

    setIsEvaluating(true);
    setFeedback("Thinking...");
    
    const dataUrl = canvasRef.current.toDataURL('image/png');
    
    let targetDesc = '';
    if (language === 'hebrew') {
        targetDesc = practiceMode === 'to_handwriting' ? 'Hebrew handwritten cursive' : 'Hebrew standard printed';
    } else {
        // English logic
        targetDesc = `English letter "${currentLetter.char}"`;
    }
    
    const promptSuffix = ` in ${targetDesc} style. Please be lenient for a child.`;

    try {
      const result = await evaluateHandwriting(dataUrl, currentLetter.char + promptSuffix);
      
      if (result.isCorrect) {
        setIsSuccess(true);
        setScore(s => s + 3); // Changed from 10 to 3
        if (onEarnPoints) onEarnPoints(3); // Changed from 10 to 3
        playTextToSpeech("Excellent!");
        setFeedback(result.feedback);
        setTimeout(() => {
            startRound();
        }, 2500);
      } else {
        setIsSuccess(false);
        playTextToSpeech("Try again");
        setFeedback(result.feedback || "Try again!");
      }
    } catch (e) {
      console.error(e);
      setFeedback("Could not check. Try again.");
    } finally {
      setIsEvaluating(false);
    }
  };

  const toggleMode = () => {
    setPracticeMode(prev => prev === 'to_handwriting' ? 'to_print' : 'to_handwriting');
  };

  if (!currentLetter) return null;

  return (
    <div className="h-full w-full bg-purple-50 flex flex-col items-center overflow-hidden relative p-4">
      <div className="absolute top-[54px] left-8 z-20 flex items-center gap-2">
         <Button onClick={onBack} color="red" size="sm">Back</Button>
      </div>
      <div className="absolute top-[54px] right-8 z-20 bg-white px-4 py-2 rounded-full shadow font-bold text-purple-700">
         Score: {score}
      </div>

      <div className="absolute top-[110px] left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4 flex flex-col gap-2">
        {/* Language Toggle */}
        <div className="flex bg-white/90 backdrop-blur shadow-md rounded-xl border-2 border-purple-200 overflow-hidden">
            <button 
                onClick={() => setLanguage('hebrew')}
                className={`flex-1 py-1 text-sm font-bold ${language === 'hebrew' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:bg-purple-50'}`}
            >
                עברית 🇮🇱
            </button>
            <button 
                onClick={() => setLanguage('english')}
                className={`flex-1 py-1 text-sm font-bold ${language === 'english' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:bg-purple-50'}`}
            >
                English 🇺🇸
            </button>
        </div>

        {/* English Case Toggle (Only shown if English) */}
        {language === 'english' && (
            <div className="flex bg-white/90 backdrop-blur shadow-md rounded-xl border-2 border-blue-200 overflow-hidden">
                <button 
                    onClick={() => setEnglishCase('upper')}
                    className={`flex-1 py-1 text-sm font-bold ${englishCase === 'upper' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-blue-50'}`}
                >
                    Capital (A)
                </button>
                <button 
                    onClick={() => setEnglishCase('lower')}
                    className={`flex-1 py-1 text-sm font-bold ${englishCase === 'lower' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:bg-blue-50'}`}
                >
                    Small (a)
                </button>
            </div>
        )}

        {/* Mode Toggle (Print <-> Handwriting) */}
        <button 
          onClick={toggleMode}
          className="w-full bg-white/80 backdrop-blur shadow-md rounded-xl p-1 md:p-2 flex items-center justify-between border-2 border-purple-200"
        >
          <span className={`flex-1 text-center py-1 rounded-lg text-xs md:text-sm font-bold transition-colors ${practiceMode === 'to_handwriting' ? 'bg-purple-500 text-white' : 'text-gray-500'}`}>
            {language === 'hebrew' ? 'דפוס ➜ כתב יד' : 'Print ➜ Cursive'}
          </span>
          {/* Arrow Direction logic */}
          <span className="text-purple-300 px-2 text-lg">
             {language === 'hebrew' ? '←' : '➜'}
          </span>
          <span className={`flex-1 text-center py-1 rounded-lg text-xs md:text-sm font-bold transition-colors ${practiceMode === 'to_print' ? 'bg-purple-500 text-white' : 'text-gray-500'}`}>
            {language === 'hebrew' ? 'כתב יד ➜ דפוס' : 'Cursive ➜ Print'}
          </span>
        </button>
      </div>

      <h1 className="text-xl md:text-2xl font-black text-purple-600 mt-44 md:mt-52 mb-2 font-dynamic text-center shrink-0">
        {language === 'hebrew' 
            ? (practiceMode === 'to_handwriting' ? 'כיתבו בכתב יד' : 'כיתבו בכתב דפוס')
            : (practiceMode === 'to_handwriting' ? 'Write in Cursive' : 'Write in Print')
        }
      </h1>
      
      <div className="flex gap-4 md:gap-8 items-center justify-center mb-2 shrink-0">
          <div className="flex flex-col items-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow border-2 border-purple-100 flex items-center justify-center">
                {practiceMode === 'to_handwriting' ? (
                  <span className="text-5xl md:text-6xl font-print">{currentLetter.char}</span>
                ) : (
                  language === 'hebrew' ? (
                      <HandwrittenLetter char={currentLetter.char} className="text-5xl md:text-6xl" fontStyle={handwrittenFontStyle} />
                  ) : (
                      <span className="text-5xl md:text-6xl font-hand text-gray-800">{currentLetter.char}</span>
                  )
                )}
              </div>
              <span className="text-xs text-gray-400 uppercase font-bold mt-1">
                {practiceMode === 'to_handwriting' ? 'Print' : 'Cursive'}
              </span>
          </div>

          <div className="text-4xl text-gray-300">{language === 'hebrew' ? '←' : '➜'}</div>

          <div className="flex flex-col items-center relative">
              <div className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-opacity duration-300 ${showGuide ? 'opacity-100' : 'opacity-0 blur-sm'}`}>
                 {practiceMode === 'to_handwriting' ? (
                    language === 'hebrew' ? (
                        <HandwrittenLetter 
                          char={currentLetter.char} 
                          fontStyle={handwrittenFontStyle}
                          className="text-purple-600 text-5xl md:text-6xl"
                        />
                    ) : (
                        <span className="text-5xl md:text-6xl font-hand text-purple-600">{currentLetter.char}</span>
                    )
                 ) : (
                    <span className="text-5xl md:text-6xl font-print text-purple-600">{currentLetter.char}</span>
                 )}
              </div>
              <span className="text-xs text-gray-400 uppercase font-bold mt-1">
                {practiceMode === 'to_handwriting' ? 'Cursive' : 'Print'}
              </span>
              <button 
                onClick={() => setShowGuide(!showGuide)}
                className="absolute -bottom-6 text-xs text-blue-500 underline whitespace-nowrap"
              >
                {showGuide ? 'הסתר' : 'הצג'}
              </button>
          </div>
      </div>

      <div className="relative flex-1 min-h-0 w-full max-w-[350px] aspect-square mx-auto border-4 border-dashed border-purple-200 rounded-2xl bg-white shadow-lg overflow-hidden touch-none mt-2">
         
         <div className="absolute inset-0 pointer-events-none">
             <div className="absolute top-[25%] left-0 w-full h-0.5 bg-blue-100"></div>
             <div className="absolute top-[50%] left-0 w-full h-0.5 border-t-2 border-dashed border-red-100"></div>
             <div className="absolute top-[75%] left-0 w-full h-0.5 bg-blue-100"></div>
         </div>
         
         {showGuide && (
             <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                {practiceMode === 'to_handwriting' ? (
                   language === 'hebrew' ? (
                       <HandwrittenLetter 
                         char={currentLetter.char} 
                         className="text-black text-8xl md:text-9xl" 
                         fontStyle={handwrittenFontStyle}
                         showDirection={true} // Enable arrows
                       />
                   ) : (
                       <span className="text-8xl md:text-9xl font-hand text-black">{currentLetter.char}</span>
                   )
                ) : (
                   <span className="text-8xl md:text-9xl font-print text-black">{currentLetter.char}</span>
                )}
             </div>
         )}

         <canvas 
            ref={canvasRef}
            width={350}
            height={350}
            className="absolute inset-0 w-full h-full touch-none cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
         />
         
         {isSuccess && (
             <div className="absolute inset-0 bg-green-100/80 flex items-center justify-center z-10 pop-in pointer-events-none">
                 <div className="text-8xl animate-bounce">🌟</div>
             </div>
         )}
      </div>

      <div className="h-8 md:h-12 mt-2 flex items-center justify-center w-full px-4 shrink-0">
          {isEvaluating ? (
              <div className="flex items-center gap-2 text-purple-600 font-bold animate-pulse text-sm md:text-base">
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  בודק...
              </div>
          ) : (
              <p className={`text-lg md:text-xl font-bold text-center ${isSuccess ? 'text-green-600' : 'text-purple-600'}`}>
                  {feedback || "כתבו יפה!"}
              </p>
          )}
      </div>

      <div className="flex gap-4 mt-1 pb-2 shrink-0">
          <Button onClick={clearCanvas} color="yellow" size="sm" disabled={isEvaluating}>
              נקה
          </Button>
          <Button onClick={checkDrawing} color="green" size="md" disabled={isEvaluating}>
              בדוק
          </Button>
      </div>
    </div>
  );
};