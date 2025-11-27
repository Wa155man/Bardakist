
import React from 'react';
import { Button } from './Button';
import { PetProfile } from '../types';

export interface TutorialStep {
  message: string;
  targetId?: string;
}

interface TutorialOverlayProps {
  steps: TutorialStep[];
  currentStepIndex: number;
  onNext: () => void;
  onComplete: () => void;
  pet?: PetProfile; // Optional to not break old usages, but App handles logic
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ 
  steps, 
  currentStepIndex, 
  onNext, 
  onComplete,
  pet 
}) => {
  const step = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;

  // Fallback if no pet provided (should not happen with new App logic)
  const petImage = pet ? `https://image.pollinations.ai/prompt/${encodeURIComponent(pet.imagePrompt)}?width=400&height=400&nologo=true&seed=${pet.id}_avatar` 
                       : "https://image.pollinations.ai/prompt/cute%20white%20maltipoo%20puppy%20happy%20face%20cartoon%20sticker%20white%20background?width=400&height=400&nologo=true&seed=guri_sticker_v3";
  
  const petName = pet ? pet.nameHebrew : "גורי";

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center pointer-events-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500" />

      {/* Character Container */}
      <div className="relative z-10 w-full max-w-lg p-6 mb-8 sm:mb-0 animate-float">
        <div className="flex flex-col items-center">
          
          {/* Speech Bubble */}
          <div className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-blue-100 mb-6 relative w-full pop-in">
            <h3 className="text-xl font-bold text-blue-600 mb-2 font-dynamic text-right" dir="rtl">{petName}:</h3>
            <p className="text-2xl text-gray-800 font-medium leading-relaxed font-dynamic text-right" dir="rtl">
              "{step.message}"
            </p>
            
            {/* Triangle pointer */}
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-r-4 border-b-4 border-blue-100 rotate-45"></div>
            
            {/* Controls */}
            <div className="mt-6 flex justify-end">
              <Button 
                onClick={isLastStep ? onComplete : onNext} 
                color="yellow"
                size="sm"
              >
                {isLastStep ? "מַתְחִילִים!" : "הַבָּא"}
              </Button>
            </div>
          </div>

          {/* Character */}
          <div className="w-48 h-48 relative">
             <img 
               src={petImage}
               alt={petName}
               className="w-full h-full object-cover rounded-full border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.3)]"
               onError={(e) => {
                 e.currentTarget.onerror = null;
                 e.currentTarget.src = "https://image.pollinations.ai/prompt/cute%20dog%20cartoon?width=400&height=400&nologo=true";
               }}
             />
          </div>

        </div>
      </div>
    </div>
  );
};
