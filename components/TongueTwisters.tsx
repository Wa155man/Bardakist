
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { generateTongueTwister, playTextToSpeech } from '../services/geminiService';

interface TongueTwistersProps {
  onBack: () => void;
}

export const TongueTwisters: React.FC<TongueTwistersProps> = ({ onBack }) => {
  const [twister, setTwister] = useState<{hebrew: string, english: string} | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTwister = async () => {
    setLoading(true);
    const data = await generateTongueTwister();
    setTwister(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTwister();
  }, []);

  const speak = () => {
    if (!twister) return;
    playTextToSpeech(twister.hebrew);
  };

  return (
    <div className="h-full w-full bg-purple-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none"
           style={{ backgroundImage: 'radial-gradient(#a855f7 2px, transparent 2px)', backgroundSize: '30px 30px' }}>
      </div>

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 text-center relative z-10 border-b-8 border-purple-200">
        <h1 className="text-4xl font-black text-purple-600 mb-8 font-round drop-shadow-sm">
          צֵירוּפֵי לָשׁוֹן
          <span className="block text-xl text-gray-400 mt-2 font-medium">(Tongue Twisters)</span>
        </h1>

        <div className="min-h-[200px] flex flex-col items-center justify-center mb-8">
          {loading ? (
            <div className="flex flex-col items-center">
               <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
               <p className="text-purple-500 animate-pulse">Thinking of something tricky...</p>
            </div>
          ) : (
            <div className="pop-in">
              <h2 
                className="text-5xl font-black text-gray-800 mb-6 leading-tight font-dynamic cursor-pointer hover:text-purple-600 transition-colors"
                onClick={speak}
              >
                {twister?.hebrew}
              </h2>
              <p className="text-xl text-gray-500 italic">
                "{twister?.english}"
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={speak} color="blue" disabled={loading} className="flex-1">
            👂 Listen
          </Button>
          <Button onClick={fetchTwister} color="green" disabled={loading} className="flex-1">
            🔄 New One
          </Button>
        </div>
      </div>

      <div className="mt-8">
         <Button onClick={onBack} color="red">Back to Map</Button>
      </div>
    </div>
  );
};
