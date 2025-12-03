
import React from 'react';
import { Button } from './Button';

interface PracticeOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  colorHeader: string;
  colorText: string;
}

const PRACTICE_OPTIONS: PracticeOption[] = [
  {
    id: 'naming',
    title: 'שֵׁם הָאוֹת',
    subtitle: 'Name the Letter',
    icon: 'א',
    colorHeader: 'bg-orange-500',
    colorText: 'text-orange-600'
  },
  {
    id: 'writing',
    title: 'כְּתִיבָה',
    subtitle: 'Writing',
    icon: '✍️',
    colorHeader: 'bg-purple-500',
    colorText: 'text-purple-600'
  },
  {
    id: 'matching',
    title: 'הַתְאָמָה',
    subtitle: 'Matching',
    icon: '🧩',
    colorHeader: 'bg-green-500',
    colorText: 'text-green-600'
  },
  {
    id: 'hangman',
    title: 'גַלֵּה אֶת הַמִּילָּה',
    subtitle: 'Hangman',
    icon: '❓',
    colorHeader: 'bg-indigo-500',
    colorText: 'text-indigo-600'
  },
  {
    id: 'rhymes',
    title: 'חֲרוּזִים',
    subtitle: 'Rhymes',
    icon: '🎵',
    colorHeader: 'bg-blue-500',
    colorText: 'text-blue-600'
  },
  {
    id: 'memory',
    title: 'זִכָּרוֹן',
    subtitle: 'Memory Game',
    icon: '🃏',
    colorHeader: 'bg-yellow-400',
    colorText: 'text-yellow-600'
  },
  {
    id: 'sentences',
    title: 'מִשְׁפָּטִים',
    subtitle: 'Sentences',
    icon: '📖',
    colorHeader: 'bg-red-500',
    colorText: 'text-red-600'
  },
  {
    id: 'reading',
    title: 'הֲבָנַת אוֹתִי',
    subtitle: 'Reading',
    icon: '🧠',
    colorHeader: 'bg-cyan-500',
    colorText: 'text-cyan-600'
  },
  {
    id: 'dictation',
    title: 'הַכְתָּבָה',
    subtitle: 'Dictation',
    icon: '📝',
    colorHeader: 'bg-pink-500',
    colorText: 'text-pink-600'
  },
  {
    id: 'sounds', // Placeholder if needed or removed, keeping 10 for symmetry
    title: 'צְלִילִים',
    subtitle: 'Sounds',
    icon: '🔊',
    colorHeader: 'bg-teal-500',
    colorText: 'text-teal-600'
  }
];

interface MiniPracticeGridProps {
  onSelectOption: (optionId: string) => void;
  onBack: () => void;
}

export const MiniPracticeGrid: React.FC<MiniPracticeGridProps> = ({ onSelectOption, onBack }) => {
  return (
    <div className="h-full w-full bg-gray-50 flex flex-col p-2 md:p-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <h1 className="text-2xl md:text-3xl font-black text-gray-700 font-dynamic">Mini Games</h1>
        <Button onClick={onBack} color="red" size="sm">Back</Button>
      </div>

      {/* Grid Container - Uses flex-1 to fill space */}
      <div className="flex-1 overflow-y-auto md:overflow-hidden min-h-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 h-full content-start md:content-center auto-rows-fr">
            {PRACTICE_OPTIONS.map((opt) => (
            <button
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className="group bg-white rounded-xl shadow-sm border-b-4 border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col h-full min-h-[100px]"
            >
                {/* Card Header */}
                <div className={`${opt.colorHeader} py-1 px-1 w-full text-center shrink-0`}>
                  <span className="text-white font-bold text-xs md:text-base block leading-tight font-dynamic drop-shadow-sm truncate">
                      {opt.title}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex-1 p-1 md:p-2 flex flex-col items-center justify-center gap-1 bg-gradient-to-b from-white to-gray-50">
                  <div className="text-2xl md:text-4xl group-hover:scale-110 transition-transform duration-300 filter drop-shadow-sm">
                      {opt.icon}
                  </div>
                  <span className={`text-[10px] md:text-xs font-bold ${opt.colorText} opacity-70 uppercase tracking-wide font-dynamic truncate w-full`}>
                      {opt.subtitle}
                  </span>
                </div>
            </button>
            ))}
          </div>
      </div>
    </div>
  );
};
