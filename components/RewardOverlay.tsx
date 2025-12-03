
import React, { useEffect } from 'react';
import { Button } from './Button';
import { GuriReward, PetProfile } from '../types';
import { playTextToSpeech } from '../services/geminiService';

interface RewardOverlayProps {
  reward: GuriReward;
  onClose: () => void;
  pet?: PetProfile;
}

export const RewardOverlay: React.FC<RewardOverlayProps> = ({ reward, onClose, pet }) => {
  useEffect(() => {
    // Play fanfare
    const sfx = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
    sfx.play().catch(() => {});
    
    // Custom Voice Logic
    if ('speechSynthesis' in window) {
       window.speechSynthesis.cancel();
       const u = new SpeechSynthesisUtterance();
       
       // Add sound effect prefix (Hav Hav / Squawk)
       const soundEffect = pet?.voiceConfig.soundEffect || "הַב הַב!";
       u.text = `${soundEffect} ${reward.message}`;
       u.lang = 'he-IL';
       
       // Apply voice characteristics
       u.pitch = pet?.voiceConfig.pitch || 1.5;
       u.rate = pet?.voiceConfig.rate || 1.1;
       
       // Delay slightly to let fanfare play
       setTimeout(() => {
           window.speechSynthesis.speak(u);
       }, 500);
    } else {
        // Fallback to standard service if API missing
        setTimeout(() => {
            playTextToSpeech(reward.message);
        }, 500);
    }
  }, [reward, pet]);

  // Use the pet's specific image prompt combined with the reward action
  // We substitute "cute white maltipoo dog" in the reward prompt with our pet's specific look
  // Or better, we construct a new prompt. The reward prompts in constants.ts are specific to Guri currently.
  // We need to dynamically construct the prompt.
  
  // Base prompt from pet + Action from reward (extracting the action part)
  // Since Guri rewards are hardcoded strings like "cute white maltipoo dog drinking...", 
  // we will replace "cute white maltipoo dog" with the pet's image prompt description keywords.
  
  const basePetDesc = pet ? pet.imagePrompt.replace('cartoon sticker white background', '') : "cute white maltipoo dog";
  // Simple heuristic: Take the reward prompt, remove the specific dog description if it exists, otherwise just append action.
  // Actually, let's just append the reward action keyword to the pet prompt for best results.
  
  // Extract action keyword from reward.imagePrompt (simplified approach for now: just use reward text context or hardcoded map in constants could be better, but let's try combining)
  // Let's assume we want the Pet to do the action.
  // Since the reward prompts in constants are full descriptions, we might need to adjust constants.ts to be templates or just override here.
  // For now, let's replace "cute white maltipoo dog" with the pet's specific visual description if possible.
  
  let finalPrompt = reward.imagePrompt;
  if (pet && pet.id !== 'guri') {
      const guriDesc = "cute white maltipoo dog";
      const petDesc = pet.imagePrompt.split(' happy')[0]; // Extract main visual
      finalPrompt = finalPrompt.replace(guriDesc, petDesc);
  }

  const imageUrl = `https://image.pollinations.ai/prompt/action%20shot%20dynamic%20motion%20${encodeURIComponent(finalPrompt)}?width=400&height=400&model=flux&nologo=true&seed=${reward.milestone}_${pet?.id || 'guri'}`;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        <style>{`
          @keyframes jump {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          .animate-jump {
            animation: jump 0.6s infinite ease-in-out;
          }
          .animate-wiggle {
            animation: wiggle 0.4s infinite ease-in-out;
          }
        `}</style>
        
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative bg-white rounded-[2rem] shadow-2xl p-8 max-w-lg w-full text-center border-8 border-yellow-300 animate-float pop-in">
            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-yellow-900 px-8 py-2 rounded-full border-4 border-white shadow-lg font-black text-2xl whitespace-nowrap">
                {reward.milestone} Points!
            </div>

            <div className="my-6 relative w-64 h-64 mx-auto rounded-full border-4 border-yellow-100 shadow-inner overflow-hidden bg-yellow-50 animate-jump">
                <img 
                    src={imageUrl} 
                    alt="Pet Reward" 
                    className="w-full h-full object-cover animate-wiggle"
                />
            </div>

            <h2 className="text-3xl font-black text-purple-600 mb-4 font-dynamic" dir="rtl">
                {reward.message}
            </h2>
            
            <p className="text-gray-500 font-bold text-lg mb-6">
                Keep going for the next reward!
            </p>

            <Button onClick={onClose} color="green" size="lg" className="w-full">
                Awesome!
            </Button>
        </div>
    </div>
  );
};
