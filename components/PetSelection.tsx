import React, { useState } from 'react';
import { Button } from './Button';
import { PETS } from '../constants';

interface PetSelectionProps {
  onSelect: (petId: string) => void;
}

export const PetSelection: React.FC<PetSelectionProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string>('guri');

  const handleConfirm = () => {
    onSelect(selected);
  };
  
  const handlePetClick = (petId: string) => {
      setSelected(petId);
      setTimeout(() => {
          onSelect(petId);
      }, 300);
  };

  return (
    <div className="h-full w-full bg-indigo-50 flex flex-col items-center p-2 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center h-full justify-center">
        <div className="shrink-0 text-center mb-4 mt-2">
            <h1 className="text-2xl md:text-4xl font-black text-indigo-700 mb-1 font-dynamic drop-shadow-sm leading-tight">בַּחֲרוּ חָבֵר!</h1>
            <p className="text-sm md:text-lg text-indigo-500 font-bold">Choose your pet companion</p>
        </div>
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar px-1 mb-2 min-h-0 flex items-center justify-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl pb-2">
            {PETS.map((pet) => {
                const isSelected = selected === pet.id;
                return (
                <button
                    key={pet.id}
                    onClick={() => handlePetClick(pet.id)}
                    className={`relative bg-white rounded-xl p-2 md:p-3 shadow-md border-2 transition-all duration-200 transform flex flex-col items-center text-center h-full justify-between ${isSelected ? 'border-green-500 bg-green-50 scale-105 ring-2 ring-green-200 z-10' : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'}`}
                >
                    {isSelected && <div className="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-sm animate-bounce z-20"><span className="text-xs">✓</span></div>}
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200 relative shrink-0 mb-2">
                    <img src={`https://image.pollinations.ai/prompt/${encodeURIComponent(pet.imagePrompt)}?width=200&height=200&model=flux&nologo=true&seed=${pet.id}_avatar`} alt={pet.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col items-center w-full">
                        <h3 className="text-base md:text-lg font-black text-gray-800 mb-0 leading-none font-dynamic truncate w-full">{pet.nameHebrew}</h3>
                        <p className="text-indigo-400 font-bold text-[10px] md:text-xs mb-1">{pet.name}</p>
                    </div>
                </button>
                );
            })}
            </div>
        </div>
        <div className="shrink-0 mb-4 w-full max-w-xs">
            <Button onClick={handleConfirm} color="green" size="md" className="w-full py-3 text-xl shadow-xl animate-pulse">מַתְחִילִים!</Button>
        </div>
      </div>
    </div>
  );
};
