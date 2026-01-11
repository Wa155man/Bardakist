
import React, { useState, useEffect, useCallback } from 'react';
import { LevelMap } from './components/LevelMap';
import { TopBar } from './components/TopBar';
import { MiniGame } from './components/MiniGame';
import { Button } from './components/Button';
import { TutorialOverlay, TutorialStep } from './components/TutorialOverlay';
import { TongueTwisters } from './components/TongueTwisters';
import { SettingsModal } from './components/SettingsModal';
import { SnowmanGame } from './components/SnowmanGame';
import { MiniPracticeGrid } from './components/MiniPracticeGrid';
import { MatchingGame } from './components/MatchingGame';
import { NamingGame } from './components/NamingGame';
import { MemoryGame } from './components/MemoryGame';
import { HangmanGame } from './components/HangmanGame';
import { RhymeGame } from './components/RhymeGame';
import { ReadingGame } from './components/ReadingGame';
import { WritingGame } from './components/WritingGame';
import { DictationGame } from './components/DictationGame';
import { FontControl } from './components/FontControl';
import { RewardOverlay } from './components/RewardOverlay'; 
import { PetSelection } from './components/PetSelection'; 
import { ScreenState, LevelNode, UserProgress, GameQuestion, AppSettings, SentenceQuestion, RhymeQuestion, ReadingQuestion, GuriReward, PetProfile } from './types';
import { generateLevelContent, generateSentenceQuestions, generateHangmanWords, generateRhymeQuestions, generateReadingQuestions, resumeAudioContext } from './services/geminiService';
import { LEVEL_NODES, GURI_REWARDS, PETS } from './constants';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [currentLevel, setCurrentLevel] = useState<LevelNode | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [sessionUsedWords, setSessionUsedWords] = useState<Set<string>>(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentReward, setCurrentReward] = useState<GuriReward | null>(null);

  // Mini Game Datasets
  const [hangmanWords, setHangmanWords] = useState<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]>([]);
  const [rhymeQuestions, setRhymeQuestions] = useState<RhymeQuestion[]>([]);
  const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>([]);
  const [sentenceQuestions, setSentenceQuestions] = useState<SentenceQuestion[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<'hebrew' | 'english'>('hebrew');

  useEffect(() => {
    const unlockAudio = () => {
      resumeAudioContext();
      window.removeEventListener('click', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    return () => window.removeEventListener('click', unlockAudio);
  }, []);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem('userProgress');
    return saved ? JSON.parse(saved) : { totalCoins: 0, completedLevels: [] };
  });
  
  useEffect(() => { localStorage.setItem('userProgress', JSON.stringify(userProgress)); }, [userProgress]);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    const defaults: AppSettings = { childName: 'Tommy', soundEffects: true, autoPlayAudio: true, fontStyle: 'print', selectedPetId: 'guri' };
    if (!saved) return defaults;
    try { return { ...defaults, ...JSON.parse(saved) }; } catch (e) { return defaults; }
  });

  const handleEarnPoints = (amount: number) => {
    setUserProgress(prev => {
      const newTotal = prev.totalCoins + amount;
      const oldMilestone = Math.floor(prev.totalCoins / 100);
      const newMilestone = Math.floor(newTotal / 100);
      if (newMilestone > oldMilestone && newMilestone > 0) {
          const milestoneTarget = newMilestone * 100;
          const currentPet = PETS.find(p => p.id === settings.selectedPetId) || PETS[0];
          const rewardsList = currentPet.rewards || GURI_REWARDS;
          const rewardIndex = (newMilestone - 1) % rewardsList.length;
          const reward = rewardsList[rewardIndex];
          setTimeout(() => { setCurrentReward({ ...reward, milestone: milestoneTarget }); }, 500);
      }
      return { ...prev, totalCoins: newTotal };
    });
  };

  const handleSelectLevel = async (level: LevelNode) => {
    setCurrentLevel(level);
    setIsLoading(true);
    setScreen(ScreenState.GAME_SESSION);
    
    try {
      const generatedQuestions = await generateLevelContent(level.vowel, Array.from(sessionUsedWords));
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      const newUsed = new Set(sessionUsedWords);
      generatedQuestions.forEach(q => newUsed.add(q.word));
      setSessionUsedWords(newUsed);
    } catch (e) { 
      console.error("Critical level loading error", e); 
    } finally { 
      setIsLoading(false); 
    }
  };

  const handleCorrectAnswer = useCallback(async () => {
    handleEarnPoints(3);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsLoading(true);
      try {
        const newQuestions = await generateLevelContent(currentLevel!.vowel, Array.from(sessionUsedWords));
        setQuestions(prev => [...prev, ...newQuestions]);
        setCurrentQuestionIndex(prev => prev + 1);
        const newUsed = new Set(sessionUsedWords);
        newQuestions.forEach(q => newUsed.add(q.word));
        setSessionUsedWords(newUsed);
      } catch(e) { 
        console.error(e); 
      } finally { 
        setIsLoading(false); 
      }
    }
  }, [questions, currentQuestionIndex, currentLevel, sessionUsedWords]);

  const handleBackToMap = () => { 
    setScreen(ScreenState.LEVEL_SELECT); 
    setQuestions([]); 
    setCurrentLevel(null); 
  };

  // Mini-Game Handlers
  const handleStartHangman = async (lang: 'hebrew' | 'english') => {
    setIsLoading(true);
    setActiveLanguage(lang);
    try {
        const words = await generateHangmanWords(lang);
        setHangmanWords(words);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const handleLoadMoreRhymes = async () => {
      const newRhymes = await generateRhymeQuestions();
      setRhymeQuestions(prev => [...prev, ...newRhymes]);
  };

  const handleStartRhymes = async () => {
      setIsLoading(true);
      const rhymes = await generateRhymeQuestions();
      setRhymeQuestions(rhymes);
      setScreen(ScreenState.RHYME_GAME);
      setIsLoading(false);
  };

  const handleStartReading = async (action: 'more' | 'restart', lang: 'hebrew' | 'english') => {
      setIsLoading(true);
      setActiveLanguage(lang);
      const questions = await generateReadingQuestions([], lang);
      if (action === 'restart') setReadingQuestions(questions);
      else setReadingQuestions(prev => [...prev, ...questions]);
      setIsLoading(false);
  };

  const handleStartSentences = async (lang: 'hebrew' | 'english') => {
      setIsLoading(true);
      setActiveLanguage(lang);
      const q = await generateSentenceQuestions(lang);
      setSentenceQuestions(q);
      setIsLoading(false);
  };

  const showTopBar = ([ScreenState.LEVEL_SELECT, ScreenState.GAME_SESSION] as ScreenState[]).includes(screen);

  return (
    <div className="relative w-full h-[100dvh] md:w-[95vw] md:h-[95dvh] bg-white md:rounded-[2rem] shadow-2xl overflow-hidden md:border-[8px] border-slate-800 flex flex-col mx-auto my-auto">
      {showTopBar && <TopBar progress={userProgress} onHome={handleBackToMap} onOpenSettings={() => {}} />}
      
      {screen === ScreenState.LEVEL_SELECT && (
        <LevelMap 
          onSelectLevel={handleSelectLevel} 
          onQuickPlay={() => {}} 
          onOpenTongueTwisters={() => setScreen(ScreenState.TONGUE_TWISTERS)} 
          onOpenMiniPractice={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)} 
        />
      )}

      {screen === ScreenState.MINI_PRACTICE_SELECT && (
        <MiniPracticeGrid onSelectOption={(id) => {
            // Routing Logic for Mini Games
            switch(id) {
                case 'hangman': handleStartHangman('hebrew'); setScreen(ScreenState.HANGMAN_GAME); break;
                case 'rhymes': handleStartRhymes(); break;
                case 'memory': setScreen(ScreenState.MEMORY_GAME); break;
                case 'matching': setScreen(ScreenState.MATCHING_GAME); break;
                case 'naming': setScreen(ScreenState.NAMING_GAME); break;
                case 'sentences': setScreen(ScreenState.SNOWMAN_GAME); break;
                case 'reading': handleStartReading('restart', 'hebrew'); setScreen(ScreenState.READING_GAME); break;
                case 'writing': setScreen(ScreenState.WRITING_GAME); break;
                case 'dictation': setScreen(ScreenState.DICTATION_GAME); break;
                default: setScreen(id as any);
            }
        }} onBack={handleBackToMap} />
      )}

      {/* MINI GAME SCREENS */}
      {screen === ScreenState.HANGMAN_GAME && (
          <HangmanGame 
            words={hangmanWords} 
            language={activeLanguage} 
            onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)}
            onStartGame={handleStartHangman}
            onEarnPoints={handleEarnPoints}
          />
      )}

      {screen === ScreenState.RHYME_GAME && (
          <RhymeGame 
            questions={rhymeQuestions} 
            onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)}
            onLoadMore={handleLoadMoreRhymes}
            onEarnPoints={handleEarnPoints}
          />
      )}

      {screen === ScreenState.MEMORY_GAME && (
          <MemoryGame onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)} onEarnPoints={handleEarnPoints} />
      )}

      {screen === ScreenState.MATCHING_GAME && (
          <MatchingGame onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)} onEarnPoints={handleEarnPoints} settings={settings} />
      )}

      {screen === ScreenState.NAMING_GAME && (
          <NamingGame onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)} onEarnPoints={handleEarnPoints} settings={settings} />
      )}

      {screen === ScreenState.SNOWMAN_GAME && (
          <SnowmanGame 
            questions={sentenceQuestions} 
            language={activeLanguage}
            onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)}
            onStartGame={handleStartSentences}
            onLoadMore={handleStartSentences}
            onEarnPoints={handleEarnPoints}
            settings={settings}
            onComplete={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)}
          />
      )}

      {screen === ScreenState.READING_GAME && (
          <ReadingGame 
            questions={readingQuestions} 
            onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)}
            onGameAction={handleStartReading}
            onEarnPoints={handleEarnPoints}
          />
      )}

      {screen === ScreenState.WRITING_GAME && (
          <WritingGame onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)} onEarnPoints={handleEarnPoints} settings={settings} />
      )}

      {screen === ScreenState.DICTATION_GAME && (
          <DictationGame onBack={() => setScreen(ScreenState.MINI_PRACTICE_SELECT)} onEarnPoints={handleEarnPoints} />
      )}

      {screen === ScreenState.TONGUE_TWISTERS && (
          <TongueTwisters onBack={() => setScreen(ScreenState.LEVEL_SELECT)} />
      )}

      {/* LEVEL GAME SESSION */}
      {screen === ScreenState.GAME_SESSION && currentLevel && questions.length > 0 && (
        <div className="h-full w-full bg-indigo-50 pt-16 md:pt-20 relative overflow-hidden flex flex-col">
           <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col">
             <div className="text-center mb-1 shrink-0">
               <h1 className="text-xl md:text-2xl font-black text-indigo-700 font-dynamic">{currentLevel.name}</h1>
             </div>
             <div className="flex-1 min-h-0">
                 <MiniGame 
                   key={questions[currentQuestionIndex]?.id}
                   question={questions[currentQuestionIndex]} 
                   totalQuestions={questions.length} 
                   questionNumber={currentQuestionIndex + 1} 
                   onCorrect={handleCorrectAnswer} 
                   onWrong={() => {}} 
                   settings={settings} 
                 />
             </div>
           </div>
        </div>
      )}

      {isLoading && questions.length === 0 && screen !== ScreenState.HANGMAN_GAME && screen !== ScreenState.READING_GAME && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-50/90 backdrop-blur-sm z-[100]">
          <div className="w-16 h-16 border-8 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
          <h2 className="text-2xl font-black text-indigo-700 font-dynamic">טוען... (Loading)</h2>
        </div>
      )}

      {currentReward && <RewardOverlay reward={currentReward} onClose={() => setCurrentReward(null)} pet={PETS[0]} />}
    </div>
  );
};
