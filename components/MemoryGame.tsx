import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { HEBREW_ALPHABET } from '../constants';
import { HebrewLetter } from '../types';

interface MemoryGameProps {
  onBack: () => void;
  onEarnPoints?: (amount: number) => void;
}

interface Card {
  id: string;
  char: string; // Can be Hebrew or English
  isFlipped: boolean;
  isMatched: boolean;
}

type PlayerMode = '1p' | '2p';
type ContentType = 'hebrew' | 'english';
type Turn = 'blue' | 'green';

const ENGLISH_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('').map(char => ({ char, name: char, nameHebrew: char }));

export const MemoryGame: React.FC<MemoryGameProps> = ({ onBack, onEarnPoints }) => {
  // Game Setup States
  const [gameState, setGameState] = useState<'setup' | 'play' | 'victory'>('setup');
  const [playerMode, setPlayerMode] = useState<PlayerMode>('1p');
  const [contentType, setContentType] = useState<ContentType>('hebrew');

  // Gameplay States
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  
  // Multiplayer States
  const [currentTurn, setCurrentTurn] = useState<Turn>('blue');
  const [scores, setScores] = useState({ blue: 0, green: 0 });

  const startGame = () => {
    // 1. Select Source Data
    const sourceData = contentType === 'hebrew' ? HEBREW_ALPHABET : ENGLISH_LETTERS;

    // 2. Select 12 random letters
    const selectedLetters = [...sourceData]
        .sort(() => Math.random() - 0.5)
        .slice(0, 12);

    // 3. Create pairs (Total 24 cards)
    const gameCards: Card[] = [...selectedLetters, ...selectedLetters].map((item, index) => ({
        id: `card-${index}`,
        char: item.char,
        isFlipped: false,
        isMatched: false
    }));

    // 4. Shuffle and Initialize
    setCards(gameCards.sort(() => Math.random() - 0.5));
    setGameState('play');
    setScores({ blue: 0, green: 0 });
    setCurrentTurn('blue'); // Blue always starts
    setFlippedIndices([]);
    setIsLocked(false);
  };

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    // Flip the card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    // Check for match (2 cards flipped)
    if (newFlippedIndices.length === 2) {
        setIsLocked(true);
        const [firstIndex, secondIndex] = newFlippedIndices;
        
        if (newCards[firstIndex].char === newCards[secondIndex].char) {
            // MATCH!
            if (onEarnPoints && playerMode === '1p') onEarnPoints(3); // Changed from 10 to 3
            
            // Update Scores for 2P (Using +3 here too, although usually in VS it's count of pairs)
            // Prompt said "In all positive score, add +3 for every correct answer"
            if (playerMode === '2p') {
                setScores(prev => ({
                    ...prev,
                    [currentTurn]: prev[currentTurn] + 3 
                }));
                // Keep turn if match found
            }

            setTimeout(() => {
                newCards[firstIndex].isMatched = true;
                newCards[secondIndex].isMatched = true;
                setCards([...newCards]);
                setFlippedIndices([]);
                setIsLocked(false);
                
                // Check Victory
                if (newCards.every(c => c.isMatched)) {
                    setGameState('victory');
                }
            }, 500);
        } else {
            // NO MATCH
            setTimeout(() => {
                newCards[firstIndex].isFlipped = false;
                newCards[secondIndex].isFlipped = false;
                setCards([...newCards]);
                setFlippedIndices([]);
                setIsLocked(false);
                
                // Switch Turn if 2P
                if (playerMode === '2p') {
                    setCurrentTurn(prev => prev === 'blue' ? 'green' : 'blue');
                }
            }, 1000);
        }
    }
  };

  // --- SETUP SCREEN ---
  if (gameState === 'setup') {
      return (
        <div className="h-full w-full bg-yellow-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-[54px] left-8 z-10">
                <Button onClick={onBack} color="red" size="sm">Back</Button>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-2xl text-center max-w-md w-full border-4 border-yellow-300">
                <h1 className="text-4xl font-black text-yellow-600 mb-8 font-dynamic">Memory Game Setup</h1>
                
                {/* Players Selection */}
                <div className="mb-6">
                    <p className="text-gray-500 font-bold mb-2">Players:</p>
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={() => setPlayerMode('1p')}
                            className={`flex-1 p-4 rounded-xl border-b-4 font-bold text-xl transition-all ${playerMode === '1p' ? 'bg-blue-500 border-blue-700 text-white scale-105' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                        >
                            👤 1 Player
                        </button>
                        <button 
                            onClick={() => setPlayerMode('2p')}
                            className={`flex-1 p-4 rounded-xl border-b-4 font-bold text-xl transition-all ${playerMode === '2p' ? 'bg-green-500 border-green-700 text-white scale-105' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                        >
                            👥 2 Players
                        </button>
                    </div>
                </div>

                {/* Content Selection */}
                <div className="mb-8">
                    <p className="text-gray-500 font-bold mb-2">Letters:</p>
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={() => setContentType('hebrew')}
                            className={`flex-1 p-4 rounded-xl border-b-4 font-bold text-xl transition-all font-dynamic ${contentType === 'hebrew' ? 'bg-orange-500 border-orange-700 text-white scale-105' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                        >
                            אבג (Hebrew)
                        </button>
                        <button 
                            onClick={() => setContentType('english')}
                            className={`flex-1 p-4 rounded-xl border-b-4 font-bold text-xl transition-all ${contentType === 'english' ? 'bg-purple-500 border-purple-700 text-white scale-105' : 'bg-gray-100 border-gray-300 text-gray-500'}`}
                        >
                            ABC (English)
                        </button>
                    </div>
                </div>

                <Button onClick={startGame} color="yellow" size="lg" className="w-full text-2xl">
                    Start Game! 🚀
                </Button>
            </div>
        </div>
      );
  }

  // --- PLAY SCREEN ---
  return (
    <div className="h-full w-full bg-yellow-100 flex flex-col items-center p-2 md:p-4 relative overflow-hidden">
       <div className="absolute top-[54px] left-8 z-10">
         <Button onClick={() => setGameState('setup')} color="red" size="sm">Back</Button>
      </div>

      {/* Scoreboard Area */}
      <div className="mt-16 flex items-center gap-8 shrink-0 mb-2">
          {playerMode === '1p' ? (
              <h1 className="text-2xl md:text-4xl font-black text-yellow-600 font-dynamic drop-shadow-sm">
                  Memory Game
              </h1>
          ) : (
              <div className="flex items-center gap-4 md:gap-8 bg-white px-6 py-2 rounded-full shadow-lg border-2 border-yellow-200">
                  <div className={`flex flex-col items-center px-4 py-1 rounded-xl transition-all ${currentTurn === 'blue' ? 'bg-blue-100 scale-110 ring-2 ring-blue-400' : 'opacity-60'}`}>
                      <span className="text-blue-600 font-black text-lg">Blue Team</span>
                      <span className="text-3xl font-bold text-blue-800">{scores.blue}</span>
                  </div>
                  <div className="text-gray-300 font-bold text-xl">VS</div>
                  <div className={`flex flex-col items-center px-4 py-1 rounded-xl transition-all ${currentTurn === 'green' ? 'bg-green-100 scale-110 ring-2 ring-green-400' : 'opacity-60'}`}>
                      <span className="text-green-600 font-black text-lg">Green Team</span>
                      <span className="text-3xl font-bold text-green-800">{scores.green}</span>
                  </div>
              </div>
          )}
      </div>

      <div className="flex-1 w-full max-w-5xl flex items-center justify-center min-h-0">
        {/* Grid: 4x6 for 24 cards */}
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 md:gap-3 w-full h-full max-h-[80vh] content-center p-1">
            {cards.map((card, index) => (
                <button
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    className={`
                        aspect-square rounded-lg md:rounded-xl shadow-sm md:shadow-md transition-all duration-300 transform perspective-1000 relative
                        ${card.isMatched ? 'opacity-40 scale-90 cursor-default' : 'hover:scale-105 cursor-pointer'}
                    `}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front (Letter) */}
                    <div className={`
                        absolute inset-0 bg-white rounded-lg md:rounded-xl border-b-2 md:border-b-4 border-yellow-300 flex items-center justify-center
                        transition-all duration-300 backface-hidden
                        ${card.isFlipped ? 'rotate-y-0 z-10' : 'rotate-y-180 z-0'}
                    `}>
                        <span className="text-2xl md:text-5xl font-bold text-gray-800 font-dynamic">{card.char}</span>
                    </div>

                    {/* Back (Cover) */}
                    <div className={`
                        absolute inset-0 bg-yellow-400 rounded-lg md:rounded-xl border-b-2 md:border-b-4 border-yellow-600 flex items-center justify-center
                        transition-all duration-300 backface-hidden
                        ${card.isFlipped ? 'rotate-y-180 z-0' : 'rotate-y-0 z-10'}
                    `}>
                        <span className="text-xl md:text-3xl text-yellow-700">❓</span>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {gameState === 'victory' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-white p-8 rounded-3xl text-center pop-in shadow-2xl border-4 border-yellow-400 max-w-md w-full">
                  <h2 className="text-6xl mb-4">🎉</h2>
                  {playerMode === '1p' ? (
                      <h2 className="text-3xl font-black text-gray-800 mb-4 font-dynamic">You Found Them All!</h2>
                  ) : (
                      <div className="mb-6">
                          <h2 className="text-3xl font-black text-gray-800 mb-2">Game Over!</h2>
                          {scores.blue > scores.green ? (
                              <p className="text-2xl font-bold text-blue-600">Blue Team Wins! 🏆</p>
                          ) : scores.green > scores.blue ? (
                              <p className="text-2xl font-bold text-green-600">Green Team Wins! 🏆</p>
                          ) : (
                              <p className="text-2xl font-bold text-purple-600">It's a Tie! 🤝</p>
                          )}
                          <p className="text-gray-500 mt-2">Blue: {scores.blue} - Green: {scores.green}</p>
                      </div>
                  )}
                  
                  <div className="flex gap-4 justify-center">
                      <Button onClick={startGame} color="green">Play Again</Button>
                      <Button onClick={() => setGameState('setup')} color="orange">Setup</Button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};