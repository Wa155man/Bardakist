
import React, { useState } from 'react';
import { Button } from './Button';
import { PETS } from '../constants';
import { PetProfile } from '../types';

interface PetSelectionProps {
  onSelect: (petId: string) => void;
}

export const PetSelection: React.FC<PetSelectionProps> = ({ onSelect }) => {
  const [selected, setSelected] = useState<string>('guri');

  const handleConfirm = () => {
    onSelect(selected);
  };

  return (
    <div className="h-full w-full bg-indigo-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-30"></div>
         <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-300 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-4xl w-full flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-black text-indigo-700 mb-2 font-dynamic text-center drop-shadow-sm">
          בַּחֲרוּ חָבֵר לַמַּסָּע!
        </h1>
        <p className="text-xl text-indigo-500 mb-8 font-bold text-center">
          Choose your pet companion
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-8 px-4">
          {PETS.map((pet) => {
            const isSelected = selected === pet.id;
            return (
              <button
                key={pet.id}
                onClick={() => setSelected(pet.id)}
                className={`
                  relative bg-white rounded-3xl p-6 shadow-xl border-4 transition-all duration-300 transform hover:-translate-y-2
                  ${isSelected ? 'border-green-500 scale-105 ring-4 ring-green-200' : 'border-white hover:border-indigo-200'}
                `}
              >
                {isSelected && (
                  <div className="absolute -top-4 -right-4 bg-green-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md animate-bounce z-20">
                    <span className="text-xl">✓</span>
                  </div>
                )}
                
                <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-gray-50 border-2 border-gray-100 relative">
                   <img 
                     src={`https://image.pollinations.ai/prompt/${encodeURIComponent(pet.imagePrompt)}?width=400&height=400&nologo=true&seed=${pet.id}_avatar`}
                     alt={pet.name}
                     className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                   />
                </div>

                <h3 className="text-2xl font-black text-gray-800 mb-1 font-dynamic">{pet.nameHebrew}</h3>
                <p className="text-indigo-500 font-bold text-sm mb-2">{pet.name}</p>
                <p className="text-gray-500 text-sm font-medium leading-tight">
                  {pet.description}
                </p>
              </button>
            );
          })}
        </div>

        <Button 
          onClick={handleConfirm} 
          color="green" 
          size="lg" 
          className="px-12 py-4 text-2xl shadow-2xl animate-pulse"
        >
          מַתְחִילִים! (Start)
        </Button>
      </div>
    </div>
  );
};
