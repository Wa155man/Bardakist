
import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { AppSettings, UserProgress, PetProfile } from '../types';

interface SettingsModalProps {
  settings: AppSettings;
  userProgress: UserProgress;
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
  onResetProgress: () => void;
  onLoadProgress: (progress: UserProgress) => void;
  pets?: PetProfile[]; // Added pets prop
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  settings, 
  userProgress,
  onSave, 
  onClose,
  onResetProgress,
  onLoadProgress,
  pets = []
}) => {
  const [name, setName] = useState(settings.childName);
  const [sfx, setSfx] = useState(settings.soundEffects);
  const [autoPlay, setAutoPlay] = useState(settings.autoPlayAudio);
  const [selectedPet, setSelectedPet] = useState(settings.selectedPetId || 'guri');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({
      childName: name,
      soundEffects: sfx,
      autoPlayAudio: autoPlay,
      fontStyle: settings.fontStyle,
      selectedPetId: selectedPet
    });
    onClose();
  };

  const handleReset = () => {
    if (confirm("האם אתם בטוחים שברצונכם לאפס את כל ההתקדמות? פעולה זו אינה הפיכה!")) {
      onResetProgress();
      onClose();
    }
  };

  const handleExportProgress = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProgress));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    
    // Format: Zoharon_Progress_YYYY-MM-DD_HH-MM
    const now = new Date();
    const dateStr = now.toISOString().slice(0,10);
    const timeStr = now.toTimeString().slice(0,5).replace(/:/g, '-');
    
    downloadAnchorNode.setAttribute("download", "Zoharon_Progress_" + dateStr + "_" + timeStr + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed.totalCoins === 'number' && Array.isArray(parsed.completedLevels)) {
          onLoadProgress(parsed);
          alert("ההתקדמות נטענה בהצלחה!");
          onClose();
        } else {
          alert("קובץ לא תקין");
        }
      } catch (error) {
        console.error("Failed to load progress", error);
        alert("שגיאה בטעינת הקובץ");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative z-10 pop-in border-4 border-slate-200 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-100 p-6 border-b-2 border-slate-200 text-center shrink-0">
          <h2 className="text-3xl font-black text-slate-700 font-dynamic">הגדרות (Settings)</h2>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-slate-600 font-bold text-lg font-dynamic">שם הילד/ה (Name)</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: גורי"
              className="w-full p-4 rounded-xl border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none text-xl font-dynamic text-right"
              dir="rtl"
            />
          </div>

          {/* Pet Selection in Settings */}
          {pets.length > 0 && (
              <div className="space-y-2">
                <label className="block text-slate-600 font-bold text-lg font-dynamic">החבר שלי (My Pet)</label>
                <div className="flex gap-2">
                    {pets.map(pet => (
                        <button
                            key={pet.id}
                            onClick={() => setSelectedPet(pet.id)}
                            className={`flex-1 p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedPet === pet.id ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}
                        >
                            <img 
                                src={`https://image.pollinations.ai/prompt/${encodeURIComponent(pet.imagePrompt)}?width=100&height=100&nologo=true&seed=${pet.id}_avatar`} 
                                alt={pet.name} 
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            <span className="text-xs font-bold text-slate-700">{pet.nameHebrew}</span>
                        </button>
                    ))}
                </div>
              </div>
          )}

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
              <span className="font-bold text-slate-700 text-lg font-dynamic">אפקטים קוליים (Sound)</span>
              <button 
                onClick={() => setSfx(!sfx)}
                className={`w-16 h-8 rounded-full relative transition-colors duration-300 ${sfx ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${sfx ? 'left-9' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
              <span className="font-bold text-slate-700 text-lg font-dynamic">הקראה אוטומטית (Auto-Play)</span>
              <button 
                onClick={() => setAutoPlay(!autoPlay)}
                className={`w-16 h-8 rounded-full relative transition-colors duration-300 ${autoPlay ? 'bg-green-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all duration-300 ${autoPlay ? 'left-9' : 'left-1'}`}></div>
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
             <h3 className="font-bold text-slate-600 text-center">ניהול נתונים (Data)</h3>
             <div className="flex gap-2">
                <button 
                  onClick={handleExportProgress}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-3 rounded-xl transition-colors font-dynamic text-sm"
                >
                  💾 שמור התקדמות (Save)
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold py-3 rounded-xl transition-colors font-dynamic text-sm"
                >
                  📂 טען התקדמות (Load)
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".json" 
                  onChange={handleImportProgress}
                />
             </div>
          </div>

          {/* Reset Zone */}
          <div className="pt-2 border-t border-slate-100">
            <button 
              onClick={handleReset}
              className="w-full text-red-500 font-bold hover:bg-red-50 p-3 rounded-xl transition-colors font-dynamic"
            >
              ⚠️ אפס התקדמות (Reset)
            </button>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 border-t-2 border-slate-200 flex gap-4 shrink-0">
          <Button onClick={onClose} color="red" size="sm" className="flex-1">ביטול</Button>
          <Button onClick={handleSave} color="green" size="md" className="flex-1">שמור</Button>
        </div>
      </div>
    </div>
  );
};
