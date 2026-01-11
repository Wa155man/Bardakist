
import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { GuriReward, PetProfile } from '../types';
import { playTextToSpeech } from '../services/geminiService';

interface RewardOverlayProps {
  reward: GuriReward;
  onClose: () => void;
  pet?: PetProfile;
}

export const RewardOverlay: React.FC<RewardOverlayProps> = ({ reward, onClose, pet }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const sfx = new Audio('https://codeskulptor-demos.commondatastorage.googleapis.com/pang/pop.mp3');
    sfx.play().catch(() => {});
    
    if ('speechSynthesis' in window) {
       window.speechSynthesis.cancel();
       const u = new SpeechSynthesisUtterance();
       const soundEffect = pet?.voiceConfig.soundEffect || "הַב הַב!";
       u.text = `${soundEffect} ${reward.message}`;
       u.lang = 'he-IL';
       u.pitch = pet?.voiceConfig.pitch || 1.5;
       u.rate = pet?.voiceConfig.rate || 1.1;
       setTimeout(() => {
           window.speechSynthesis.speak(u);
       }, 500);
    } else {
        setTimeout(() => {
            playTextToSpeech(reward.message);
        }, 500);
    }
  }, [reward, pet]);

  let finalPrompt = reward.imagePrompt;
  if (pet && pet.id !== 'guri') {
      const guriDesc = "cute white maltipoo dog";
      const petDesc = pet.imagePrompt.split(' happy')[0];
      finalPrompt = finalPrompt.replace(guriDesc, petDesc);
  }

  // Stability focused URL
  const imageUrl = `https://image.pollinations.ai/prompt/action%20shot%20dynamic%20motion%20${encodeURIComponent(finalPrompt)}?width=512&height=512&model=flux&nologo=true&nofeed=true&safe=true&seed=${reward.milestone}_${pet?.id || 'guri'}_resilient`;

  const getFallbackEmoji = () => {
    if (reward.message.includes('שתות')) return '🥤';
    if (reward.message.includes('אוכל') || reward.message.includes('רעב')) return '🦴';
    if (reward.message.includes('ישון')) return '😴';
    if (reward.message.includes('כדור')) return '⚽';
    if (reward.message.includes('מלך')) return '👑';
    if (reward.message.includes('חלל')) return '🚀';
    if (reward.message.includes('צולל')) return '🤿';
    if (reward.message.includes('גיבור')) return '🦸';
    if (reward.message.includes('ריקוד')) return '💃';
    return '🌟';
  };

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

            <div className="my-6 relative w-64 h-64 mx-auto rounded-full border-4 border-yellow-100 shadow-inner overflow-hidden bg-yellow-50 animate-jump flex items-center justify-center">
                {imageError ? (
                    <div className="text-9xl animate-wiggle">{getFallbackEmoji()}</div>
                ) : (
                    <img 
                        src={imageUrl} 
                        alt="Pet Reward" 
                        className="w-full h-full object-cover animate-wiggle"
                        onError={() => setImageError(true)}
                    />
                )}
            </div>

            <h2 className="text-3xl font-black text-purple-600 mb-4 font-dynamic leading-tight" dir="rtl">
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
