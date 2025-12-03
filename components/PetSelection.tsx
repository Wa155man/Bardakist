
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

  return (
    <div className="h-full w-full bg-indigo-50 flex flex-col items-center p-2 md:p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
         <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col items-center">
        <div className="shrink-0 text-center mb-2 md:mb-6">
            <h1 className="text-2xl md:text-4xl font-black text-indigo-700 font-dynamic drop-shadow-sm leading-tight">
              בַּחֲרוּ חָבֵר לַמַּסָּע!
            </h1>
            <p className="text-sm md:text-lg text-indigo-500 font-bold">
              Choose your pet companion
            </p>
        </div>

        {/* Grid Container - Flex-1 to take available space, min-h-0 to allow shrinking */}
        <div className="flex-1 w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 min-h-0 mb-4 px-1 content-center overflow-y-auto md:overflow-hidden">
          {PETS.map((pet) => {
            const isSelected = selected === pet.id;
            return (
              <button
                key={pet.id}
                onClick={() => setSelected(pet.id)}
                className={`
                  relative bg-white rounded-2xl p-2 shadow-md border-2 transition-all duration-200 transform
                  flex flex-col items-center justify-between h-auto md:h-full
                  ${isSelected ? 'border-green-500 ring-2 ring-green-200 scale-[1.02] z-10' : 'border-white hover:border-indigo-200 hover:scale-[1.01]'}
                `}
              >
                {isSelected && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center shadow-md animate-bounce z-20">
                    <span className="text-xs md:text-base font-bold">✓</span>
                  </div>
                )}
                
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50 border border-gray-100 relative shrink-0 max-h-[160px]">
                   <img 
                     src={`https://image.pollinations.ai/prompt/${encodeURIComponent(pet.imagePrompt)}?width=300&height=300&nologo=true&seed=${pet.id}_avatar`}
                     alt={pet.name}
                     className="w-full h-full object-cover"
                   />
                </div>

                <div className="text-center w-full flex-1 flex flex-col justify-center">
                    <h3 className="text-lg md:text-xl font-black text-gray-800 leading-none mb-1 font-dynamic truncate w-full">{pet.nameHebrew}</h3>
                    <p className="text-indigo-500 font-bold text-xs mb-1">{pet.name}</p>
                    <p className="text-gray-500 text-[10px] md:text-xs font-medium leading-tight line-clamp-2 md:line-clamp-3">
                    {pet.description}
                    </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="shrink-0 mb-2">
            <Button 
              onClick={handleConfirm} 
              color="green" 
              size="md"
              className="px-8 py-3 text-lg md:text-xl shadow-xl animate-pulse"
            >
              מַתְחִילִים! (Start)
            </Button>
        </div>
      </div>
    </div>
  );
};
