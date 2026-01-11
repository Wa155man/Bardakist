
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
          onEarnPoints(correctCount * 3); 
          setHasAwardedPoints(true);
      }
    }
  }, [mode, hasAwardedPoints, items, userAnswers, onEarnPoints]);

  // Helper to strip Nikud for flexible grading
  const removeNikud = (str: string) => {
    return str.replace(/[\u0591-\u05C7]/g, "");
  };

  const handleModeSelect = (type: DictationType) => {
    setDictationType(type);
    setMode('setup');
    setHasAwardedPoints(false);
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
          const parts = line.split('-');
          const word = parts[0].trim();
          const meaning = (dictationType === 'translation' && parts.length > 1) ? parts[1].trim() : '';
          return { id: `paste-${idx}`, word, meaning };
      });
    } else if (inputType === 'file') {
      currentItems = items; 
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
    const payload = { type: dictationType, items: currentItems };
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
            if (Array.isArray(parsed)) {
                setDictationType('standard');
                setItems(parsed.map((w, i) => ({ id: `load-${i}`, word: w, meaning: '' })));
            } else if (parsed.items && Array.isArray(parsed.items)) {
                setDictationType(parsed.type || 'standard');
                setItems(parsed.items);
            } else {
                alert("קובץ לא תקין");
            }
        } catch (err) { alert("שגיאה בקריאת הקובץ"); }
    };
    reader.readAsText(file);
  };

  const goToMemorize = async () => {
    const finalItems = getItemsFromInput();
    if (finalItems.length === 0) {
      alert("נא להזין מילים תחילה");
      return;
    }
    setItems(finalItems);
    setMode('memorize');
    if (finalItems.length > 0) prefetchTTS(finalItems[0].word);
    if (finalItems.length > 1) prefetchTTS(finalItems[1].word);
  };

  const startQuiz = () => {
    resumeAudioContext();
    setUserAnswers(Array(items.length).fill(''));
    setCurrentIndex(0);
    setMode('play');
    setHasStarted(true);
    setHasAwardedPoints(false);
    
    // Play immediately and synchronously
    if (dictationType === 'standard' && items[0]) {
        playTextToSpeech(items[0].word);
    }
    if (items.length > 1) prefetchTTS(items[1].word);
  };

  const handleUserTyping = (val: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentIndex] = val;
    setUserAnswers(newAnswers);
  };

  const handleNextItem = () => {
    if (currentIndex < items.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (dictationType === 'standard') {
          playTextToSpeech(items[nextIdx].word);
      }
      if (nextIdx + 1 < items.length) prefetchTTS(items[nextIdx + 1].word);
    } else {
      setMode('results');
    }
  };

  const handleReplayAudio = () => {
    // Synchronous trigger - essential for browser compatibility
    resumeAudioContext(); 
    const item = items[currentIndex];
    if (item && item.word.trim().length > 0) {
        playTextToSpeech(item.word);
    }
  };
  
  const calculateScore = () => {
    let correct = 0;
    items.forEach((item, i) => {
        if (removeNikud(item.word).trim() === removeNikud(userAnswers[i] || "").trim()) correct++;
    });
    return Math.round((correct / items.length) * 100);
  };

  const handleReset = () => {
      setMode('menu');
      setItems([]);
      setUserAnswers([]);
      setCurrentIndex(0);
  };

  // --- RENDERING SCREENS ---
  if (mode === 'menu') {
    return (
        <div className="h-full w-full bg-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[54px] left-8 z-10 flex gap-2">
                <Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button>
            </div>
            <h1 className="text-4xl font-black text-pink-600 mb-8 font-dynamic text-center">הַכְתָּבָה</h1>
            <p className="text-xl text-gray-600 mb-8 font-bold">בחר את סוג המבחן:</p>
            <div className="flex flex-col gap-4 w-full max-w-md">
                <button onClick={() => handleModeSelect('standard')} className="bg-white border-4 border-pink-200 hover:border-pink-500 hover:bg-pink-50 rounded-2xl p-6 shadow-lg transition-all group text-right">
                    <h2 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-pink-600">מילים בלבד</h2>
                    <p className="text-gray-500">שומעים מילה וכותבים אותה</p>
                </button>
                <button onClick={() => handleModeSelect('translation')} className="bg-white border-4 border-pink-200 hover:border-pink-500 hover:bg-pink-50 rounded-2xl p-6 shadow-lg transition-all group text-right">
                    <h2 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-pink-600">מילה ופירוש</h2>
                    <p className="text-gray-500">רואים פירוש וכותבים את המילה</p>
                </button>
            </div>
        </div>
    );
  }

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
              <button onClick={() => setInputType('manual')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${inputType === 'manual' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>הקלדה</button>
              <button onClick={() => setInputType('paste')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${inputType === 'paste' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>הדבקה</button>
              <button onClick={() => setInputType('file')} className={`flex-1 py-2 rounded-lg font-bold text-sm transition-colors ${inputType === 'file' ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600'}`}>טען קובץ</button>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
             {inputType === 'manual' && (
               <div className="flex flex-col gap-2 pb-2">
                  {manualInputs.map((item, i) => (
                      <div key={item.id} className="flex gap-2 items-center" dir="rtl">
                         <input type="text" value={item.word} onChange={(e) => handleManualChange(i, 'word', e.target.value)} placeholder={`מילה ${i + 1}`} className="flex-1 border-2 border-gray-200 rounded-lg p-2 text-right focus:border-pink-400 outline-none" />
                         {dictationType === 'translation' && (
                             <input type="text" value={item.meaning} onChange={(e) => handleManualChange(i, 'meaning', e.target.value)} placeholder="פירוש" className="flex-1 border-2 border-gray-200 rounded-lg p-2 text-right focus:border-pink-400 outline-none" />
                         )}
                      </div>
                  ))}
                  <Button onClick={handleAddMoreManual} color="blue" size="sm">הוסף שורות</Button>
               </div>
             )}
             {inputType === 'paste' && (
                  <textarea value={pastedText} onChange={(e) => setPastedText(e.target.value)} placeholder={dictationType === 'translation' ? "הדבק: מילה - פירוש" : "הדבק רשימת מילים"} className="w-full flex-1 border-2 border-gray-200 rounded-lg p-4 text-right focus:border-pink-400 outline-none resize-none h-full" dir="rtl" />
             )}
             {inputType === 'file' && (
               <div className="flex flex-col items-center justify-center gap-4 py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 min-h-full">
                  {items.length > 0 ? (
                      <div className="w-full px-4 flex flex-col h-full text-center">
                         <p className="text-green-600 font-bold mb-2">נטענו {items.length} פריטים!</p>
                         <div className="bg-white p-2 rounded border border-gray-200 flex-1 overflow-y-auto text-right" dir="rtl">
                            {items.map((it, i) => <div key={i} className="text-sm">{it.word} {it.meaning && `- ${it.meaning}`}</div>)}
                         </div>
                         <button onClick={() => setItems([])} className="text-red-500 underline text-sm mt-2">טען קובץ אחר</button>
                      </div>
                  ) : (
                      <>
                          <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                          <Button onClick={() => fileInputRef.current?.click()} color="blue">בחר קובץ JSON</Button>
                      </>
                  )}
               </div>
             )}
           </div>
           <div className="mt-4 flex justify-center gap-4 pt-2 border-t">
              <Button onClick={handleSaveList} color="orange" size="md">שמור 💾</Button>
              <Button onClick={goToMemorize} color="green" size="md">הבא ➡️</Button>
           </div>
        </div>
      </div>
    );
  }

  if (mode === 'memorize') {
    return (
      <div className="h-full w-full bg-pink-50 flex flex-col items-center p-4 relative overflow-hidden">
         <div className="absolute top-[54px] left-8 z-10 flex gap-2">
            <Button onClick={() => setMode('setup')} color="blue" size="sm">חזרה</Button>
         </div>
         <h1 className="text-3xl font-black text-pink-600 mt-16 mb-2 text-center font-dynamic">זִכְרוּ אֶת הַמִּילִים</h1>
         <div className="flex-1 w-full max-w-4xl bg-white rounded-3xl shadow-xl p-4 overflow-y-auto custom-scrollbar border-b-8 border-pink-200">
             <div className="grid gap-3" dir="rtl">
                 {items.map((item, idx) => (
                     <div key={idx} className="bg-gray-50 border-2 border-gray-100 rounded-xl p-3 flex items-center justify-between px-6">
                         <span className="text-xl font-bold">{item.word}</span>
                         {item.meaning && <span className="text-blue-600">{item.meaning}</span>}
                     </div>
                 ))}
             </div>
         </div>
         <Button onClick={startQuiz} color="green" size="lg" className="mt-4 animate-bounce">הַתְחֵל הַכְתָּבָה!</Button>
      </div>
    );
  }

  if (mode === 'play') {
      const currentItem = items[currentIndex];
      return (
        <div className="h-full w-full bg-pink-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
           <div className="absolute top-[54px] left-8 z-10 flex gap-2"><Button onClick={onBack} color="red" size="sm">חֲזָרָה</Button></div>
           <div className="absolute top-[54px] right-8 z-10 bg-white px-4 py-2 rounded-full font-bold text-pink-600 shadow">{currentIndex + 1} / {items.length}</div>
           <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg text-center flex flex-col gap-6 border-b-8 border-pink-200">
               {dictationType === 'translation' && <div className="bg-blue-50 p-4 rounded-xl border border-blue-100"><h2 className="text-2xl font-bold text-blue-800">{currentItem.meaning}</h2></div>}
               <div className="flex justify-center">
                  <button type="button" onClick={handleReplayAudio} className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg transition-transform bg-pink-500 hover:scale-105 active:scale-95 border-4 border-pink-100">
                      <span className="text-6xl">🔊</span>
                  </button>
               </div>
               <input type="text" autoFocus value={userAnswers[currentIndex]} onChange={(e) => handleUserTyping(e.target.value)} className="w-full p-4 text-4xl text-center border-b-4 border-pink-300 focus:border-pink-600 outline-none bg-pink-50 rounded-xl" placeholder="..." dir="rtl" onKeyDown={(e) => { if (e.key === 'Enter') handleNextItem(); }} />
               <Button onClick={handleNextItem} color="green" size="lg" className="w-full">{currentIndex < items.length - 1 ? 'הבא' : 'סיום'}</Button>
           </div>
        </div>
      );
  }

  const percentage = calculateScore();
  return (
    <div className="h-full w-full bg-pink-50 flex flex-col p-4 relative overflow-hidden">
       <div className="absolute top-[54px] left-8 z-10 flex gap-2"><Button onClick={handleReset} color="yellow" size="sm">🔄</Button></div>
       <div className="mt-20 max-w-3xl mx-auto w-full bg-white rounded-3xl shadow-2xl p-6 border-b-8 border-pink-200 flex-1 flex flex-col min-h-0 overflow-hidden text-right" dir="rtl">
           <div className="text-center mb-4 shrink-0">
               <h1 className="text-3xl font-black mb-2">תוצאות</h1>
               <div className={`text-6xl font-black ${percentage >= 70 ? 'text-green-500' : 'text-red-500'}`}>{percentage}%</div>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar border rounded-xl">
               <table className="w-full text-right border-collapse">
                   <thead className="bg-pink-100 text-pink-800 sticky top-0">
                       <tr><th className="p-3">נכון</th><th className="p-3">שלך</th><th className="p-3 text-center">X/V</th></tr>
                   </thead>
                   <tbody>
                       {items.map((item, i) => {
                           const isCorrect = removeNikud(item.word).trim() === removeNikud(userAnswers[i] || "").trim();
                           return (
                               <tr key={i} className="border-b border-gray-100">
                                   <td className="p-3 font-bold">{item.word}</td>
                                   <td className={`p-3 ${isCorrect ? 'text-green-600' : 'text-red-600 line-through'}`}>{userAnswers[i]}</td>
                                   <td className="p-3 text-center">{isCorrect ? '✅' : '❌'}</td>
                               </tr>
                           );
                       })}
                   </tbody>
               </table>
           </div>
           <Button onClick={() => setMode('menu')} color="blue" size="md" className="mt-4 mx-auto">מבחן חדש</Button>
       </div>
    </div>
  );
};
