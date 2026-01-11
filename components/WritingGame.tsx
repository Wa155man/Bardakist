
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

export const WritingGame: React.FC<WritingGameProps> = ({ onBack, settings, onEarnPoints }) => {
  const [currentLetter, setCurrentLetter] = useState<HebrewLetter | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [score, setScore] = useState(0);
  
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('to_handwriting');
  const [language, setLanguage] = useState<Language>('hebrew');

  const handwrittenFontStyle = (settings?.fontStyle === 'hand1') ? 'hand1' : 'playpen';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  useEffect(() => {
    startRound();
  }, [practiceMode, language]);

  const startRound = () => {
    let sourceAlphabet = HEBREW_ALPHABET;
    
    if (language === 'english') {
        sourceAlphabet = ENGLISH_ALPHABET.slice(0, 26); 
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

  /**
   * Resizes the canvas to a smaller thumbnail (256x256) 
   * to make the Gemini upload much faster while maintaining accuracy.
   */
  const getOptimizedImageData = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";
    
    // Create a smaller temporary canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 256;
    tempCanvas.height = 256;
    const ctx = tempCanvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    // Fill with white background for Gemini to see strokes better
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 256, 256);
    ctx.drawImage(canvas, 0, 0, 256, 256);
    
    return tempCanvas.toDataURL('image/png', 0.8);
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
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPos.current = newPos;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    lastPos.current = null;
  };

  let targetChar = currentLetter?.char || '';
  let isEnglish = language === 'english';
  if (currentLetter && isEnglish) {
      targetChar = practiceMode === 'to_handwriting' ? currentLetter.char.toLowerCase() : currentLetter.char.toUpperCase();
  }

  const checkDrawing = async () => {
    if (!currentLetter || !canvasRef.current) return;

    setIsEvaluating(true);
    setFeedback("...מַעֲרִיךְ אֶת הַכְּתִיבָה"); // Assessing...
    
    const dataUrl = getOptimizedImageData(); // FAST UPLOAD
    
    try {
      const result = await evaluateHandwriting(dataUrl, targetChar);
      
      setFeedback(result.feedback);
      playTextToSpeech(result.feedback);

      if (result.isCorrect) {
        setIsSuccess(true);
        setScore(s => s + 3); 
        if (onEarnPoints) onEarnPoints(3); 
        
        setTimeout(() => {
            startRound();
        }, 3500);
      } else {
        setIsSuccess(false);
      }
    } catch (e) {
      console.error(e);
      setFeedback("נַסּוּ שׁוּב בְּבַקָּשָׁה (Please try again)");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleBackToMap = () => onBack();

  if (!currentLetter) return null;

  return (
    <div className="h-full w-full bg-purple-50 flex flex-col items-center overflow-hidden relative p-4">
      <div className="absolute top-[54px] left-8 z-20 flex items-center gap-2">
         <Button onClick={handleBackToMap} color="red" size="sm">Back</Button>
         <Button onClick={startRound} color="yellow" size="sm">🔄</Button>
      </div>
      <div className="absolute top-[54px] right-8 z-20 bg-white px-4 py-2 rounded-full shadow font-bold text-purple-700 font-dynamic">
         Score: {score}
      </div>

      <div className="absolute top-[110px] left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4 flex flex-col gap-2">
        <div className="flex bg-white/90 backdrop-blur shadow-md rounded-xl border-2 border-purple-200 overflow-hidden">
            <button onClick={() => setLanguage('hebrew')} className={`flex-1 py-1 text-sm font-bold ${language === 'hebrew' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:bg-purple-50'}`}>עברית 🇮🇱</button>
            <button onClick={() => setLanguage('english')} className={`flex-1 py-1 text-sm font-bold ${language === 'english' ? 'bg-purple-500 text-white' : 'text-gray-500 hover:bg-purple-50'}`}>English 🇺🇸</button>
        </div>
      </div>

      <h1 className="text-xl md:text-2xl font-black text-purple-600 mt-40 md:mt-44 mb-1 font-dynamic text-center shrink-0 z-10 relative">
        {language === 'hebrew' ? 'כִּתְבוּ אֶת הָאוֹת (Write the Letter)' : 'Write the Letter'}
      </h1>
      
      <div className="flex gap-8 items-center justify-center mb-1 shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow border-2 border-purple-100 flex items-center justify-center">
                <span className="text-5xl md:text-6xl font-print">{currentLetter.char}</span>
          </div>
          <div className="text-4xl text-gray-300 font-bold">➜</div>
          <div className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-500 ${showGuide ? 'opacity-100' : 'opacity-0 scale-90'}`}>
                <HandwrittenLetter char={targetChar} fontStyle={handwrittenFontStyle} className="text-purple-600 text-5xl md:text-6xl" />
          </div>
      </div>

      <div className="relative flex-1 min-h-[250px] w-full max-w-[350px] mx-auto border-4 border-dashed border-purple-200 rounded-2xl bg-white shadow-lg overflow-hidden touch-none mt-1 group">
         <canvas 
            ref={canvasRef}
            width={350}
            height={350}
            className="absolute inset-0 w-full h-full touch-none cursor-crosshair z-10"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
         />
         
         {isSuccess && (
             <div className="absolute inset-0 bg-green-100/60 flex flex-col items-center justify-center z-20 pop-in pointer-events-none">
                 <div className="text-9xl animate-bounce mb-4">✨</div>
             </div>
         )}
      </div>

      <div className="min-h-[70px] md:min-h-[90px] mt-2 flex items-center justify-center w-full px-6 shrink-0 relative">
          {isEvaluating ? (
              <div className="flex flex-col items-center gap-2 text-purple-600 font-bold animate-pulse">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-lg font-dynamic">{feedback}</span>
              </div>
          ) : (
              <div className={`text-xl md:text-2xl font-black text-center leading-tight transition-all duration-700 ${isSuccess ? 'text-green-600 scale-110 drop-shadow-md' : 'text-purple-700'} font-dynamic`}>
                  {feedback || "נָא לִכְתֹּב עַל הַלּוּחַ! (Write on the board!)"}
              </div>
          )}
      </div>

      <div className="flex gap-4 mt-1 pb-4 shrink-0 z-20">
          <Button onClick={clearCanvas} color="yellow" size="sm" disabled={isEvaluating} className="px-6">נַקֵּה (Clear)</Button>
          <Button onClick={checkDrawing} color="green" size="md" disabled={isEvaluating} className="px-12 animate-pulse">בְּדֹק (Check)</Button>
      </div>
    </div>
  );
};
