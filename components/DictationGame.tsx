
import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { playTextToSpeech, prefetchTTS, resumeAudioContext } from '../services/geminiService';

interface DictationGameProps {
  onBack: () => void;
  onEarnPoints?: (amount: number) => void;
}

type GameMode = 'menu' | 'setup' | 'memorize' | 'play' | 'results';
type InputType = 'manual' | 'paste' | 'file';
type DictationType = 'standard' | 'translation'; // 'standard' = word list, 'translation' = word + meaning

interface DictationItem {
  id: string;
  word: string;
  meaning: string; // Empty if standard mode
}

export const DictationGame: React.FC<DictationGameProps> = ({ onBack, onEarnPoints }) => {
  const [mode, setMode] = useState<GameMode>('menu');
  const [dictationType, setDictationType] = useState<DictationType>('standard');
  const [inputType, setInputType] = useState<InputType>('manual');
  
  // Main Data
  const [items, setItems] = useState<DictationItem[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false); 
  const [hasAwardedPoints, setHasAwardedPoints] = useState(false); // Safety flag

  // Manual Input States
  const [manualInputs, setManualInputs] = useState<DictationItem[]>(
    Array(10).fill(null).map((_, i) => ({ id: `new-${i}`, word: '', meaning: '' }))
  );
  const [pastedText, setPastedText] = useState('');
  
  const [audioLoading, setAudioLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Safety check: redirect to setup if play mode is invalid
  useEffect(() => {
    if (mode === 'play' && !hasStarted) {
        setMode('setup');
    }
  }, [mode, hasStarted]);

  // Auto-calculate and award points when entering 'results' mode
  useEffect(() => {
    if (mode === 'results' && onEarnPoints && !hasAwardedPoints) {
      let correctCount = 0;
      items.forEach((item, i) => {
          if (removeNikud(item.word).trim() === removeNikud(userAnswers[i] || "").trim()) {
              correctCount++;
          }
      });
      
      if (correctCount > 0) {
          onEarnPoints(correctCount * 3); // Changed from 10 to 3
          setHasAwardedPoints(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, hasAwardedPoints]);

  // Helper to strip Nikud for flexible grading
  const removeNikud = (str: string) => {
    return str.replace(/[\u0591-\u05C7]/g, "");
  };

  const handleModeSelect = (type: DictationType) => {
    setDictationType(type);
    setMode('setup');
    setHasAwardedPoints(false);
    // Reset manual inputs
    setManualInputs(Array(10).fill(null).map((_, i) => ({ id: `new-${i}`, word: '', meaning: '' })));
    setItems([]);
  };

  const handleManualChange = (idx: number, field: 'word' | 'meaning', val: string) => {
    const newInputs = [...manualInputs];
    newInputs[idx] = { ...newInputs[idx], [field]: val };
    setManualInputs(newInputs);
  };

  const handleAddMoreManual = () => {
    setManualInputs(prev => [
        ...prev, 
        ...Array(10).fill(null).map((_, i) => ({ id: `extra-${Date.now()}-${i}`, word: '', meaning: '' }))
    ]);
  };

  // Extract valid items from current input method
  const getItemsFromInput = (): DictationItem[] => {
    let currentItems: DictationItem[] = [];
    
    if (inputType === 'manual') {
      currentItems = manualInputs.filter(item => item.word.trim().length > 0);
    } else if (inputType === 'paste') {
      const lines = pastedText.split(/[\n]+/).map(l => l.trim()).filter(l => l.length > 0);
      currentItems = lines.map((line, idx) => {
          // Try to split by hyphen for meaning
          const parts = line.split('-');
          const word = parts[0].trim();
          // If standard mode, meaning is ignored/empty. If translation mode, try to get 2nd part
          const meaning = (dictationType === 'translation' && parts.length > 1) ? parts[1].trim() : '';
          return { id: `paste-${idx}`, word, meaning };
      });
    } else if (inputType === 'file') {
      currentItems = items; // Already populated
    }
    return currentItems;
  };

  const handleSaveList = () => {
    const currentItems = getItemsFromInput();
    if (currentItems.length === 0) {
        alert("הרשימה ריקה! (List is empty)");
        return;
    }
    
    const date = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const typeStr = dictationType === 'translation' ? 'pairs' : 'words';
    const fileName = `dictation_${typeStr}_${date}.json`;
    
    // Save the dictation type inside the JSON to restore correct mode later
    const payload = {
        type: dictationType,
        items: currentItems
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload));
    
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const content = ev.target?.result as string;
            const parsed = JSON.parse(content);
            
            // Check if it's the new format { type, items } or old array format
            if (Array.isArray(parsed)) {
                // Old format (array of strings)
                setDictationType('standard');
                setItems(parsed.map((w, i) => ({ id: `load-${i}`, word: w, meaning: '' })));
            } else if (parsed.items && Array.isArray(parsed.items)) {
                // New format
                setDictationType(parsed.type || 'standard');
                setItems(parsed.items);
            } else {
                alert("קובץ לא תקין (Invalid file format)");
            }
        } catch (err) {
            alert("שגיאה בקריאת הקובץ (Error reading file)");
        }
    };
    reader.readAsText(file);
  };

  const goToMemorize = async () => {
    const finalItems = getItemsFromInput();

    if (finalItems.length === 0) {
      alert("נא להזין מילים תחילה (Please enter words first)");
      return;
    }

    setItems(finalItems);
    setMode('memorize');
    
    // Aggressively prefetch audio for the Hebrew words
    if (finalItems.length > 0) prefetchTTS(finalItems[0].word);
    if (finalItems.length > 1) prefetchTTS(finalItems[1].word);
    if (finalItems.length > 2) prefetchTTS(finalItems[2].word);
  };

  const startQuiz = async () => {
    resumeAudioContext().catch(e => console.error("Audio resume failed", e));

    setUserAnswers(Array(items.length).fill(''));
    setCurrentIndex(0);
    setMode('play');
    setHasStarted(true);
    setHasAwardedPoints(false);
    
    // Only play audio automatically if it's STANDARD mode.
    // In Translation mode, we wait for the user to ask for a hint.
    if (dictationType === 'standard') {
        setAudioLoading(true);
        try {
            if (items[0]) await playTextToSpeech(items[0].word);
        } catch (e) {
            console.error("Initial play failed", e);
        } finally {
            setAudioLoading(false);
        }
    }
    
    if (items.length > 1) prefetchTTS(items[1].word);
    if (items.length > 2) prefetchTTS(items[2].word);
  };

  const handleUserTyping = (val: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = val;
    setUserAnswers(newAnswers);
  };

  const handleNextItem = async () => {
    if (currentIndex < items.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      
      // Only play audio automatically in standard mode
      if (dictationType === 'standard') {
        setAudioLoading(true);
        try {
            await playTextToSpeech(items[nextIdx].word);
        } catch (e) { console.error(e); }
        finally { setAudioLoading(false); }
      }

      // Prefetch upcoming
      if (nextIdx + 1 < items.length) prefetchTTS(items[nextIdx + 1].word);
    } else {
      setMode('results');
    }
  };

  const handleReplayAudio = async () => {
    if (audioLoading) return;
    setAudioLoading(true);
    try {
        await resumeAudioContext(); 
        const item = items[currentIndex];
        if (item && item.word.trim().length > 0) await playTextToSpeech(item.word);
    } catch(e) { console.error("Replay failed", e); } 
    finally { setAudioLoading(false); }
  };
  
  const calculateScore = () => {
    let correct = 0;
    items.forEach((item, i) => {
        if (removeNikud(item.word).trim() === removeNikud(userAnswers[i]).trim()) correct++;
    });
    return Math.round((correct / items.length) * 100);
  };

  const handleReset = () => {
      setMode('menu');
      setItems([]);
      setUserAnswers([]);
      setCurrentIndex(0);
  };

  // --- MENU SCREEN ---
  if (mode === 'menu') {
    return (
        <div className="h-full w-full bg-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[54px] left-8 z-10 flex gap-2">
                <Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button>
            </div>
            
            <h1 className="text-4xl font-black text-pink-600 mb-8 font-dynamic text-center">הַכְתָּבָה (Dictation)</h1>
            <p className="text-xl text-gray-600 mb-8 font-bold">בחר את סוג המבחן:</p>

            <div className="flex flex-col gap-4 w-full max-w-md">
                <button 
                    onClick={() => handleModeSelect('standard')}
                    className="bg-white border-4 border-pink-200 hover:border-pink-500 hover:bg-pink-50 rounded-2xl p-6 shadow-lg transition-all group"
                >
                    <h2 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-pink-600">מילים בלבד</h2>
                    <p className="text-gray-500">שומעים מילה וכותבים אותה (Words List)</p>
                </button>

                <button 
                    onClick={() => handleModeSelect('translation')}
                    className="bg-white border-4 border-pink-200 hover:border-pink-500 hover:bg-pink-50 rounded-2xl p-6 shadow-lg transition-all group"
                >
                    <h2 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-pink-600">מילה ופירוש</h2>
                    <p className="text-gray-500">רואים פירוש וכותבים את המילה (Word & Meaning)</p>
                </button>
            </div>
        </div>
    );
  }

  // --- SETUP SCREEN ---
  if (mode === 'setup') {
    return (
      <div className="h-full w-full bg-pink-50 flex flex-col p-4 relative overflow-hidden">
        <div className="absolute top-[54px] left-8 z-10 flex gap-2">
           <Button onClick={() => setMode('menu')} color="red" size="sm">חזרה</Button>
           <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
        </div>

        <h1 className="text-3xl font-black text-pink-600 mt-16 mb-4 text-center font-dynamic shrink-0">
            {dictationType === 'translation' ? 'הוספת מילים ופירושים' : 'הוספת מילים להכתבה'}
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-4 max-w-3xl mx-auto w-full flex-1 flex flex-col min-h-0 overflow-hidden mb-2">
           
           <div className="flex gap-2 mb-4 shrink-0">
              <button 
                 onClick={() => setInputType('manual')}
                 className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors font-dynamic ${inputType === 'manual' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-100'}`}
              >
                 הקלדה (Type)
              </button>
              <button 
                 onClick={() => setInputType('paste')}
                 className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors font-dynamic ${inputType === 'paste' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-100'}`}
              >
                 הדבקה (Paste)
              </button>
              <button 
                 onClick={() => setInputType('file')}
                 className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors font-dynamic ${inputType === 'file' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-pink-100'}`}
              >
                 טען קובץ (Load)
              </button>
           </div>

           {/* Scrollable Input Area */}
           <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
             {inputType === 'manual' && (
               <div className="flex flex-col gap-2 pb-2">
                  {/* Header Row for Translation Mode */}
                  {dictationType === 'translation' && (
                      <div className="flex gap-2 px-2 text-gray-500 font-bold text-xs">
                          <span className="flex-1 text-center">מילה (Word)</span>
                          <span className="w-4"></span>
                          <span className="flex-1 text-center">פירוש (Meaning)</span>
                      </div>
                  )}

                  {manualInputs.map((item, i) => (
                      <div key={item.id} className="flex gap-2 items-center" dir="rtl">
                         <div className="flex-1">
                             <input 
                                type="text"
                                value={item.word}
                                onChange={(e) => handleManualChange(i, 'word', e.target.value)}
                                placeholder={dictationType === 'translation' ? 'מילה' : `מילה ${i + 1}`}
                                className="w-full border-2 border-gray-200 rounded-lg p-2 font-dynamic text-base text-right focus:border-pink-400 outline-none"
                             />
                         </div>
                         {dictationType === 'translation' && (
                             <>
                                <span className="text-gray-400 font-bold">-</span>
                                <div className="flex-1">
                                    <input 
                                        type="text"
                                        value={item.meaning}
                                        onChange={(e) => handleManualChange(i, 'meaning', e.target.value)}
                                        placeholder="פירוש"
                                        className="w-full border-2 border-gray-200 rounded-lg p-2 font-dynamic text-base text-right focus:border-pink-400 outline-none"
                                    />
                                </div>
                             </>
                         )}
                      </div>
                  ))}
                  <Button onClick={handleAddMoreManual} color="blue" size="sm">הוסף שורות</Button>
               </div>
             )}

             {inputType === 'paste' && (
               <div className="flex flex-col gap-2 h-full">
                  <textarea
                     value={pastedText}
                     onChange={(e) => setPastedText(e.target.value)}
                     placeholder={dictationType === 'translation' ? "הדבק: מילה - פירוש (בשורה חדשה)" : "הדבק רשימת מילים (בשורה חדשה)"}
                     className="w-full flex-1 border-2 border-gray-200 rounded-lg p-4 font-dynamic text-lg text-right focus:border-pink-400 outline-none resize-none"
                     dir="rtl"
                  />
                  <p className="text-xs text-gray-500 text-right">
                      {dictationType === 'translation' 
                        ? "פורמט: מילה - פירוש (לדוגמה: כלב - Dog)" 
                        : "הפרד מילים בשורות חדשות"}
                  </p>
               </div>
             )}

             {inputType === 'file' && (
               <div className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-full">
                  {items.length > 0 ? (
                      <div className="w-full px-4 flex flex-col h-full">
                         <p className="text-green-600 font-bold mb-2 text-center">נטענו {items.length} פריטים!</p>
                         <p className="text-gray-500 text-xs text-center mb-2">סוג: {dictationType === 'translation' ? 'מילה ופירוש' : 'מילים בלבד'}</p>
                         
                         <div className="bg-white p-4 rounded border border-gray-200 flex-1 overflow-y-auto grid grid-cols-1 gap-2 text-right content-start" dir="rtl">
                            {items.map((item, i) => (
                                <div key={i} className="bg-gray-100 px-2 py-1 rounded text-sm font-dynamic flex justify-between">
                                    <span className="font-bold">{item.word}</span>
                                    {item.meaning && <span className="text-gray-500">{item.meaning}</span>}
                                </div>
                            ))}
                         </div>
                         <div className="mt-4 text-center">
                            <button onClick={() => { setItems([]); if(fileInputRef.current) fileInputRef.current.value = ''; }} className="text-red-500 underline text-sm font-bold">טען קובץ אחר</button>
                         </div>
                      </div>
                  ) : (
                      <>
                          <div className="text-5xl">📂</div>
                          <p className="text-gray-500 font-medium text-center font-dynamic">בחר קובץ רשימה שנשמר (JSON)</p>
                          <input 
                              type="file" 
                              accept=".json" 
                              className="hidden" 
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                          />
                          <Button onClick={() => fileInputRef.current?.click()} color="blue">בחר קובץ</Button>
                      </>
                  )}
               </div>
             )}
           </div>
           
           <div className="mt-4 flex justify-center gap-4 shrink-0 pt-2 border-t border-gray-100">
              <Button 
                 onClick={handleSaveList} 
                 color="orange" 
                 size="md"
              >
                 שמור 💾
              </Button>
              
              <Button 
                 onClick={goToMemorize} 
                 color="green" 
                 size="md"
                 disabled={inputType === 'file' && items.length === 0}
              >
                 הבא ➡️
              </Button>
           </div>
        </div>
      </div>
    );
  }

  // --- MEMORIZE SCREEN ---
  if (mode === 'memorize') {
    return (
      <div className="h-full w-full bg-pink-50 flex flex-col items-center p-4 relative overflow-hidden">
         <div className="absolute top-[54px] left-8 z-10 flex gap-2">
            <Button onClick={() => setMode('setup')} color="blue" size="sm">חזרה</Button>
            <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
         </div>

         <h1 className="text-3xl font-black text-pink-600 mt-16 mb-2 text-center font-dynamic shrink-0">זִכְרוּ אֶת הַמִּילִים</h1>
         <p className="text-gray-500 mb-4 font-bold text-center">Memorize before starting!</p>

         <div className="flex-1 w-full max-w-4xl bg-white rounded-3xl shadow-xl p-4 overflow-y-auto custom-scrollbar border-b-8 border-pink-200">
             <div className={`grid gap-3 ${dictationType === 'translation' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'}`} dir="rtl">
                 {items.map((item, idx) => (
                     <div key={idx} className="bg-gray-50 border-2 border-gray-100 rounded-xl p-3 flex items-center justify-between px-6">
                         <span className="text-xl md:text-2xl font-bold text-gray-800 font-dynamic">{item.word}</span>
                         {dictationType === 'translation' && (
                             <>
                                <span className="text-gray-300 mx-4">|</span>
                                <span className="text-lg md:text-xl text-blue-600 font-medium">{item.meaning}</span>
                             </>
                         )}
                     </div>
                 ))}
             </div>
         </div>

         <div className="mt-4 shrink-0 animate-bounce">
             <Button onClick={startQuiz} color="green" size="lg" className="text-2xl px-12 py-4 shadow-xl">
                הַתְחֵל הַכְתָּבָה! 📝
             </Button>
         </div>
      </div>
    );
  }

  // --- PLAY SCREEN ---
  if (mode === 'play') {
      if (!hasStarted) { 
          // Prevent render if state isn't ready, let useEffect handle redirect
          return <div className="h-full w-full bg-pink-50"></div>; 
      }
      
      const currentItem = items[currentIndex];

      return (
        <div className="h-full w-full bg-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
           <div className="absolute top-[54px] left-8 z-10 flex gap-2">
             <Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button>
             <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
           </div>
           
           <div className="absolute top-[54px] right-8 z-10 bg-white px-4 py-2 rounded-full shadow font-bold text-pink-600">
              {currentIndex + 1} / {items.length}
           </div>

           <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg text-center flex flex-col gap-6 border-b-8 border-pink-200">
               
               {/* Display Meaning if Translation Mode */}
               {dictationType === 'translation' && (
                   <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                       <h2 className="text-2xl md:text-3xl font-bold text-blue-800 font-dynamic">{currentItem.meaning}</h2>
                   </div>
               )}

               <div className="flex justify-center">
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReplayAudio(); }}
                    disabled={audioLoading}
                    className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-transform cursor-pointer border-4 border-pink-100
                       ${audioLoading ? 'bg-pink-300 scale-95' : 'bg-pink-500 hover:scale-105 active:scale-95'}
                    `}
                  >
                      {audioLoading ? (
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span className="text-6xl">🔊</span>
                      )}
                  </button>
               </div>
               <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">
                   {dictationType === 'translation' ? 'לחץ לרמז (שמיעת המילה)' : 'לחץ לשמיעה חוזרת'}
               </p>

               <input 
                  type="text"
                  autoFocus
                  value={userAnswers[currentIndex]}
                  onChange={(e) => handleUserTyping(e.target.value)}
                  className="w-full p-4 text-4xl text-center font-dynamic border-b-4 border-pink-300 focus:border-pink-600 outline-none bg-pink-50 rounded-xl"
                  placeholder="הקלד את המילה..."
                  dir="rtl"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleNextItem(); }}
               />
               
               <Button onClick={handleNextItem} color="green" size="lg" className="w-full" disabled={audioLoading}>
                  {currentIndex < items.length - 1 ? 'הבא (Next)' : 'סיום (Finish)'}
               </Button>
           </div>
        </div>
      );
  }

  // --- RESULTS SCREEN ---
  const percentage = calculateScore();
  
  return (
    <div className="h-full w-full bg-pink-50 flex flex-col p-4 relative overflow-hidden">
       <div className="absolute top-[54px] left-8 z-10 flex gap-2">
         <Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button>
         <Button onClick={handleReset} color="yellow" size="sm">🔄</Button>
       </div>

       <div className="mt-20 max-w-3xl mx-auto w-full bg-white rounded-3xl shadow-2xl p-6 border-b-8 border-pink-200 flex-1 flex flex-col min-h-0 overflow-hidden">
           <div className="text-center mb-4 shrink-0">
               <h1 className="text-3xl font-black text-gray-800 mb-2 font-dynamic">תוצאות (Results)</h1>
               <div className={`text-6xl font-black ${percentage === 100 ? 'text-green-500' : percentage >= 70 ? 'text-yellow-500' : 'text-red-500'}`}>
                   {percentage}%
               </div>
               <p className="text-gray-500 mt-2 font-bold">
                 צדקת ב-
                 {items.filter((item, i) => removeNikud(item.word).trim() === removeNikud(userAnswers[i]).trim()).length} 
                 מתוך {items.length} מילים!
               </p>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar border rounded-xl">
               <table className="w-full text-right border-collapse" dir="rtl">
                   <thead className="sticky top-0 bg-pink-100 text-pink-800 z-10 shadow-sm">
                       <tr>
                           <th className="p-3 font-bold">המילה הנכונה</th>
                           {dictationType === 'translation' && <th className="p-3 font-bold">פירוש</th>}
                           <th className="p-3 font-bold">המילה שלך</th>
                           <th className="p-3 font-bold text-center">סטטוס</th>
                       </tr>
                   </thead>
                   <tbody>
                       {items.map((item, i) => {
                           const isCorrect = removeNikud(item.word).trim() === removeNikud(userAnswers[i]).trim();
                           return (
                               <tr key={i} className="border-b border-gray-100 last:border-0">
                                   <td className="p-3 font-dynamic text-xl font-bold text-gray-700">{item.word}</td>
                                   {dictationType === 'translation' && (
                                       <td className="p-3 font-dynamic text-lg text-gray-500">{item.meaning}</td>
                                   )}
                                   <td className={`p-3 font-dynamic text-xl ${isCorrect ? 'text-green-600' : 'text-red-600 line-through decoration-2'}`}>
                                       {userAnswers[i]}
                                   </td>
                                   <td className="p-3 text-center text-2xl">
                                       {isCorrect ? '✅' : '❌'}
                                   </td>
                               </tr>
                           );
                       })}
                   </tbody>
               </table>
           </div>
           
           <div className="mt-4 flex justify-center shrink-0">
               <Button onClick={() => setMode('menu')} color="blue" size="md">מבחן חדש</Button>
           </div>
       </div>
    </div>
  );
};
