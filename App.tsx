
import React, { useState, useEffect } from 'react';
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
import { generateLevelContent, generateSentenceQuestions, generateHangmanWords, generateRhymeQuestions, generateReadingQuestions, getMiniGameImageUrl, getHangmanImageUrl, resumeAudioContext } from './services/geminiService';
import { LEVEL_NODES, GURI_REWARDS, PETS } from './constants';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [returnScreen, setReturnScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [currentLevel, setCurrentLevel] = useState<LevelNode | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [nextQuestion, setNextQuestion] = useState<GameQuestion | undefined>(undefined);

  const [sentenceQuestions, setSentenceQuestions] = useState<SentenceQuestion[]>([]);
  const [sentenceHistory, setSentenceHistory] = useState<Set<string>>(() => {
      try { const saved = localStorage.getItem('sentenceHistory'); return saved ? new Set(JSON.parse(saved) as string[]) : new Set(); } catch (e) { return new Set(); }
  });

  const [hangmanWords, setHangmanWords] = useState<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]>([]);
  const [hangmanHistory, setHangmanHistory] = useState<Set<string>>(() => {
      try { const saved = localStorage.getItem('hangmanHistory'); return saved ? new Set(JSON.parse(saved) as string[]) : new Set(); } catch (e) { return new Set(); }
  });
  
  const [rhymeQuestions, setRhymeQuestions] = useState<RhymeQuestion[]>([]);
  const [rhymeHistory, setRhymeHistory] = useState<Set<string>>(() => {
      try { const saved = localStorage.getItem('rhymeHistory'); return saved ? new Set(JSON.parse(saved) as string[]) : new Set(); } catch (e) { return new Set(); }
  });

  const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>([]);
  const [readingHistory, setReadingHistory] = useState<Set<string>>(() => {
      try { const saved = localStorage.getItem('readingHistory'); return saved ? new Set(JSON.parse(saved) as string[]) : new Set(); } catch (e) { return new Set(); }
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRhymes, setIsLoadingRhymes] = useState(false);
  
  const [snowmanLanguage, setSnowmanLanguage] = useState<'hebrew' | 'english'>('hebrew');
  const [hangmanLanguage, setHangmanLanguage] = useState<'hebrew' | 'english'>('hebrew');
  const [currentReward, setCurrentReward] = useState<GuriReward | null>(null);

  // UNLOCK AUDIO CONTEXT ON FIRST INTERACTION
  useEffect(() => {
    const unlockAudio = () => {
      resumeAudioContext();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('keydown', unlockAudio);

    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Persist Histories
  useEffect(() => { localStorage.setItem('sentenceHistory', JSON.stringify(Array.from(sentenceHistory))); }, [sentenceHistory]);
  useEffect(() => { localStorage.setItem('hangmanHistory', JSON.stringify(Array.from(hangmanHistory))); }, [hangmanHistory]);
  useEffect(() => { localStorage.setItem('rhymeHistory', JSON.stringify(Array.from(rhymeHistory))); }, [rhymeHistory]);
  useEffect(() => { localStorage.setItem('readingHistory', JSON.stringify(Array.from(readingHistory))); }, [readingHistory]);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
        const saved = localStorage.getItem('userProgress');
        return saved ? JSON.parse(saved) : { totalCoins: 0, completedLevels: [] };
    } catch (e) {
        console.error("Corrupted userProgress in localStorage", e);
        return { totalCoins: 0, completedLevels: [] };
    }
  });
  
  useEffect(() => { localStorage.setItem('userProgress', JSON.stringify(userProgress)); }, [userProgress]);

  const handleResetScore = () => { setUserProgress(prev => ({ ...prev, totalCoins: 0 })); };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  useEffect(() => {
      const hasSelectedPet = localStorage.getItem('has_selected_pet');
      if (!hasSelectedPet) {
          setScreen(ScreenState.PET_SELECTION);
      }
  }, []);

  const getSelectedPet = (): PetProfile => PETS.find(p => p.id === settings.selectedPetId) || PETS[0];

  const handlePetSelection = (petId: string) => {
      handleSaveSettings({ ...settings, selectedPetId: petId });
      localStorage.setItem('has_selected_pet', 'true');
      setScreen(ScreenState.LEVEL_SELECT);
      const hasSeenMapTutorial = localStorage.getItem('tutorial_map_completed');
      if (!hasSeenMapTutorial) {
        setTimeout(() => {
            const pet = PETS.find(p => p.id === petId) || PETS[0];
            startTutorial([{ message: `שלום! אני ${pet.nameHebrew}. ברוכים הבאים להרפתקאות בעברית!` }, { message: "טיילו בשביל האבנים הצהובות כדי לפתוח שלבים ולהרוויח מטבעות." }, { message: "לחצו על השלב הראשון כדי להתחיל במסע!" }]);
            localStorage.setItem('tutorial_map_completed', 'true');
        }, 500);
      }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };
  
  const handleLoadProgress = (newProgress: UserProgress) => { setUserProgress(newProgress); };

  useEffect(() => {
    const root = document.documentElement;
    let fontVal = "'Varela Round', sans-serif"; 
    if (settings.fontStyle === 'hand1') fontVal = "'Gveret Levin', cursive"; 
    if (settings.fontStyle === 'playpen') fontVal = "'Playpen Sans Hebrew', cursive"; 
    if (settings.fontStyle === 'alef') fontVal = "'Alef', sans-serif";
    root.style.setProperty('--dynamic-font', fontVal);
  }, [settings.fontStyle]);

  const handleResetProgress = () => {
    localStorage.clear();
    location.reload();
  };

  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  const startTutorial = (steps: TutorialStep[]) => {
    setTutorialSteps(steps);
    setTutorialStepIndex(0);
    setTutorialActive(true);
  };

  const handleTutorialNext = () => {
    if (tutorialStepIndex < tutorialSteps.length - 1) setTutorialStepIndex(prev => prev + 1);
    else setTutorialActive(false);
  };

  const handleSelectLevel = async (level: LevelNode) => {
    setCurrentLevel(level);
    setIsLoading(true);
    setScreen(ScreenState.GAME_SESSION); 
    try {
      // Use basic random selection for level content, not strictly history-bound to allow mastery repetition
      const generatedQuestions = await generateLevelContent(level.vowel);
      setQuestions(generatedQuestions);
      setNextQuestion(generatedQuestions.length > 1 ? generatedQuestions[1] : undefined);
      setCurrentQuestionIndex(0);
      if (generatedQuestions.length > 0) {
          const imgPromise = new Promise<void>((resolve) => {
              const firstImg = new Image();
              firstImg.onload = () => resolve();
              firstImg.onerror = () => resolve();
              firstImg.src = getMiniGameImageUrl(generatedQuestions[0].correctTranslation);
          });
          const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 1000));
          await Promise.race([imgPromise, timeoutPromise]);
          generatedQuestions.slice(1).forEach(q => { new Image().src = getMiniGameImageUrl(q.correctTranslation); });
      }
      const hasSeenGameTutorial = localStorage.getItem('tutorial_game_completed');
      if (!hasSeenGameTutorial) {
        setTimeout(() => {
          startTutorial([{ message: "הנה האתגר הראשון שלכם!" }, { message: "לחצו על המילה הגדולה כדי לשמוע איך אומרים אותה." }, { message: "לאחר מכן, בחרו את התרגום הנכון באנגלית מהכפתורים למטה." }]);
          localStorage.setItem('tutorial_game_completed', 'true');
        }, 500);
      }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleQuickPlay = async () => {
    setScreen(ScreenState.SNOWMAN_GAME);
    const hasSeen = localStorage.getItem('tutorial_sentences_completed');
    if (!hasSeen) {
        setTimeout(() => { startTutorial([{ message: "ברוכים הבאים למשחק המשפטים!" }, { message: "השלימו את המילה החסרה במשפט כדי לבנות את איש השלג." }]); localStorage.setItem('tutorial_sentences_completed', 'true'); }, 500);
    }
  };
  
  const handleSentenceGameStart = async (language: 'hebrew' | 'english') => {
      setIsLoading(true);
      setSnowmanLanguage(language);
      try {
          const historyArray: string[] = Array.from(sentenceHistory);
          const data = await generateSentenceQuestions(language, historyArray);
          const newHistory = new Set(sentenceHistory);
          data.forEach(q => newHistory.add(q.fullSentence));
          setSentenceHistory(newHistory);
          setSentenceQuestions(data);
      } catch (e) { console.error("Failed to start sentence game", e); } finally { setIsLoading(false); }
  };

  const handleLoadMoreSentences = async (language: 'hebrew' | 'english') => {
    try {
      const historyArray: string[] = Array.from(sentenceHistory);
      const newQuestions = await generateSentenceQuestions(language, historyArray);
      const newHistory = new Set(sentenceHistory);
      newQuestions.forEach(q => newHistory.add(q.fullSentence));
      setSentenceHistory(newHistory);
      setSentenceQuestions(prev => [...prev, ...newQuestions]);
    } catch (e) { console.error(e); }
  };

  const handleOpenMiniPractice = () => { setScreen(ScreenState.MINI_PRACTICE_SELECT); };

  const handleStartHangman = async (language: 'hebrew' | 'english') => {
      setIsLoading(true);
      setHangmanLanguage(language);
      try {
          // Pass current history to avoid repeating even on start if not cleared
          const historyArray: string[] = Array.from(hangmanHistory);
          const newWords = await generateHangmanWords(language, historyArray);
          const newHistory = new Set(hangmanHistory);
          newWords.forEach(w => newHistory.add(w.word));
          setHangmanHistory(newHistory);
          
          setHangmanWords(newWords);
          
          newWords.forEach(w => { 
              const imgPrompt = w.imagePrompt || w.hint;
              new Image().src = getHangmanImageUrl(imgPrompt); 
          });
      } catch (e) { 
          console.error(e); 
      } finally { 
          setIsLoading(false); 
      }
  };

  const handleLoadMoreHangman = async (language: 'hebrew' | 'english') => {
      try {
          const historyArray: string[] = Array.from(hangmanHistory);
          const newWords = await generateHangmanWords(language, historyArray);
          const newHistory = new Set(hangmanHistory);
          newWords.forEach(w => newHistory.add(w.word));
          setHangmanHistory(newHistory);
          
          newWords.forEach(w => { 
              const imgPrompt = w.imagePrompt || w.hint;
              new Image().src = getHangmanImageUrl(imgPrompt); 
          });
          setHangmanWords(prev => [...prev, ...newWords]);
      } catch (e) { console.error(e); }
  };

  const handleLoadMoreRhymes = async () => {
    if (isLoadingRhymes) return;
    setIsLoadingRhymes(true);
    try {
        const historyArray: string[] = Array.from(rhymeHistory);
        const newQuestions = await generateRhymeQuestions(historyArray);
        const newHistory = new Set(rhymeHistory);
        newQuestions.forEach(q => newHistory.add(q.targetWord));
        setRhymeHistory(newHistory);
        setRhymeQuestions(prev => [...prev, ...newQuestions]);
    } catch (e) { console.error(e); } finally { setIsLoadingRhymes(false); }
  };

  const handleMiniPracticeSelect = async (optionId: string) => {
    const tutorials: Record<string, TutorialStep[]> = {
      matching: [{ message: "התאימו בין אות בכתב יד לאות בדפוס." }],
      naming: [{ message: "בחרו את האות בדפוס שמתאימה לאות בכתב יד." }],
      writing: [{ message: "כתבו את האותיות בין השורות הכחולות." }, { message: "החליפו בין תרגול דפוס וכתב יד!" }],
      memory: [{ message: "מצאו את זוגות האותיות הזהות." }],
      dictation: [{ message: "הזינו מילים, שננו אותן, ונסו לכתוב אותן נכון." }],
      hangman: [{ message: "נחשו אותיות כדי לגלות את המילה. אל תתנו לרובוט להיבנות!" }],
      rhymes: [{ message: "בחרו את המילה שמתחרזת." }],
      reading: [{ message: "קראו את הסיפור וענו על השאלה." }]
    };

    if (optionId === 'sentences') { setReturnScreen(ScreenState.MINI_PRACTICE_SELECT); handleQuickPlay(); return; }
    
    const screenMap: Record<string, ScreenState> = {
      matching: ScreenState.MATCHING_GAME,
      naming: ScreenState.NAMING_GAME,
      writing: ScreenState.WRITING_GAME,
      memory: ScreenState.MEMORY_GAME,
      dictation: ScreenState.DICTATION_GAME,
      hangman: ScreenState.HANGMAN_GAME,
      rhymes: ScreenState.RHYME_GAME,
      reading: ScreenState.READING_GAME,
    };

    if (screenMap[optionId]) {
      setScreen(screenMap[optionId]);
      const tutorialKey = `tutorial_${optionId}_completed`;
      if (!localStorage.getItem(tutorialKey) && tutorials[optionId]) {
          setTimeout(() => { startTutorial(tutorials[optionId]); localStorage.setItem(tutorialKey, 'true'); }, 500);
      }
      
      if (optionId === 'hangman' || optionId === 'rhymes' || optionId === 'reading') {
        setIsLoading(true);
        try {
          if (optionId === 'hangman') {
            await handleStartHangman('hebrew'); 
          } else if (optionId === 'rhymes') {
            const historyArray: string[] = Array.from(rhymeHistory);
            const data = await generateRhymeQuestions(historyArray);
            const newHistory = new Set(rhymeHistory);
            data.forEach(q => newHistory.add(q.targetWord));
            setRhymeHistory(newHistory);
            setRhymeQuestions(data);
          } else if (optionId === 'reading') {
            const historyArray: string[] = Array.from(readingHistory);
            const data = await generateReadingQuestions(historyArray, 'hebrew');
            const newHistory = new Set(readingHistory);
            data.forEach(q => newHistory.add(q.id));
            setReadingHistory(newHistory);
            setReadingQuestions(data);
          }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
      }
    }
  };
  
  const handleReadingGameAction = async (action: 'more' | 'restart', language: 'hebrew' | 'english' = 'hebrew') => {
    try { 
      // Always pass history to ensure non-repetition
      const historyArray: string[] = Array.from(readingHistory);
      const moreQuestions = await generateReadingQuestions(historyArray, language);
      
      const newHistory = new Set(readingHistory);
      moreQuestions.forEach(q => newHistory.add(q.id));
      setReadingHistory(newHistory);

      if (action === 'restart') {
          setIsLoading(true);
          setReadingQuestions(moreQuestions);
          setIsLoading(false);
      } else {
          setReadingQuestions(prev => [...prev, ...moreQuestions]); 
      }
    } catch (e) { console.error(e); setIsLoading(false); }
  };
  
  const handleOpenTongueTwisters = () => { setScreen(ScreenState.TONGUE_TWISTERS); };

  const handleLoadMorePractice = async () => {
      if (!currentLevel) return;
      setIsLoading(true);
      try {
          const currentWords = questions.map(q => q.word);
          const newQuestions = await generateLevelContent(currentLevel.vowel, currentWords);
          if (newQuestions.length > 0) {
                const imgPromise = new Promise<void>(resolve => { const img = new Image(); img.onload = () => resolve(); img.onerror = () => resolve(); img.src = getMiniGameImageUrl(newQuestions[0].correctTranslation); });
                await Promise.race([imgPromise, new Promise<void>(resolve => setTimeout(resolve, 1000))]);
                newQuestions.slice(1).forEach(q => { new Image().src = getMiniGameImageUrl(q.correctTranslation); });
          }
          setQuestions(prev => [...prev, ...newQuestions]);
          setCurrentQuestionIndex(prev => prev + 1);
          setNextQuestion(newQuestions.length > 0 ? newQuestions[0] : undefined);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleCorrectAnswer = async () => {
    handleEarnPoints(3);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setNextQuestion(questions[currentQuestionIndex + 2]);
    } else {
      await handleLoadMorePractice();
    }
  };

  const handleWrongAnswer = () => {};
  const handleLevelComplete = () => { setScreen(ScreenState.VICTORY); };
  const handleSnowmanComplete = () => { handleLevelComplete(); };
  const handleBackToMap = () => { setScreen(ScreenState.LEVEL_SELECT); setQuestions([]); setSentenceQuestions([]); setHangmanWords([]); setRhymeQuestions([]); setReadingQuestions([]); setCurrentLevel(null); };
  const handleBackToMiniPractice = () => { setScreen(ScreenState.MINI_PRACTICE_SELECT); };
  const showTopBar = ([ScreenState.LEVEL_SELECT, ScreenState.GAME_SESSION] as ScreenState[]).includes(screen);

  return (
    // UPDATED: Full screen on mobile, Framed on Desktop
    <div className="relative w-full h-[100dvh] md:w-[95vw] md:h-[95dvh] md:max-h-[100dvh] md:max-w-[1400px] bg-white md:rounded-[2rem] shadow-2xl overflow-hidden md:border-[8px] border-slate-800 md:ring-4 ring-slate-900/50 select-none flex flex-col mx-auto my-auto transition-all duration-300">
      {showTopBar && <TopBar progress={userProgress} onHome={handleBackToMap} onOpenSettings={() => setIsSettingsOpen(true)} />}
      
      {screen === ScreenState.PET_SELECTION && <PetSelection onSelect={handlePetSelection} />}
      {screen === ScreenState.LEVEL_SELECT && <LevelMap onSelectLevel={handleSelectLevel} onQuickPlay={() => { setReturnScreen(ScreenState.LEVEL_SELECT); handleQuickPlay(); }} onOpenTongueTwisters={handleOpenTongueTwisters} onOpenMiniPractice={handleOpenMiniPractice} />}
      {screen === ScreenState.MINI_PRACTICE_SELECT && <MiniPracticeGrid onSelectOption={handleMiniPracticeSelect} onBack={handleBackToMap} />}
      
      {screen === ScreenState.MATCHING_GAME && <MatchingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.NAMING_GAME && <NamingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.WRITING_GAME && <WritingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.MEMORY_GAME && <MemoryGame onBack={handleBackToMiniPractice} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.DICTATION_GAME && <DictationGame onBack={handleBackToMiniPractice} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.HANGMAN_GAME && !isLoading && <HangmanGame words={hangmanWords} onBack={handleBackToMiniPractice} onLoadMore={handleLoadMoreHangman} onEarnPoints={handleEarnPoints} onStartGame={handleStartHangman} language={hangmanLanguage} />}
      {screen === ScreenState.RHYME_GAME && !isLoading && <RhymeGame questions={rhymeQuestions} onBack={handleBackToMiniPractice} onLoadMore={handleLoadMoreRhymes} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.READING_GAME && !isLoading && <ReadingGame questions={readingQuestions} onBack={handleBackToMiniPractice} onGameAction={handleReadingGameAction} onEarnPoints={handleEarnPoints} />}
      {screen === ScreenState.TONGUE_TWISTERS && <TongueTwisters onBack={handleBackToMap} />}
      {screen === ScreenState.SNOWMAN_GAME && !isLoading && <SnowmanGame questions={sentenceQuestions} onComplete={handleSnowmanComplete} onBack={() => { if (returnScreen === ScreenState.LEVEL_SELECT) { handleBackToMap(); } else { handleBackToMiniPractice(); } }} onLoadMore={handleLoadMoreSentences} onStartGame={handleSentenceGameStart} settings={settings} onEarnPoints={handleEarnPoints} language={snowmanLanguage} />}

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full bg-green-50 md:rounded-[2.5rem]">
          <div className="w-24 h-24 border-8 border-green-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-3xl font-bold text-green-700 animate-pulse">...טוען</h2>
        </div>
      )}

      {screen === ScreenState.GAME_SESSION && currentLevel && questions[currentQuestionIndex] && (
        <div className="h-full w-full bg-indigo-50 pt-16 md:pt-20 relative overflow-hidden flex flex-col">
           <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col">
             <div className="text-center mb-1 md:mb-2 shrink-0">
               <h1 className="text-xl md:text-2xl font-bold text-gray-700">{currentLevel.name}</h1>
               <p className="text-gray-500 text-xs md:text-sm">{currentLevel.description}</p>
             </div>
             <div className="flex-1 min-h-0">
                 <MiniGame question={questions[currentQuestionIndex]} nextQuestion={questions[currentQuestionIndex+1]} totalQuestions={questions.length} questionNumber={currentQuestionIndex + 1} onCorrect={handleCorrectAnswer} onWrong={handleWrongAnswer} isTutorialActive={tutorialActive} settings={settings} />
             </div>
           </div>
        </div>
      )}

      {screen === ScreenState.VICTORY && (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-yellow-100 to-orange-100 p-4 text-center overflow-hidden">
          <div className="mb-8 pop-in"><span className="text-9xl filter drop-shadow-lg">🏆</span></div>
          <h1 className="text-5xl md:text-6xl font-black text-orange-500 mb-4 drop-shadow-sm font-round">כָּל הַכָּבוֹד!</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">{settings.childName ? `Amazing job, ${settings.childName}!` : "You did an amazing job!"}</p>
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex items-center gap-4">
            <span className="text-yellow-500 text-4xl">💰</span>
            <span className="text-4xl font-bold text-gray-800">Total: {userProgress.totalCoins}</span>
          </div>
          <Button onClick={handleBackToMap} color="green" size="lg">חזרה לתפריט</Button>
        </div>
      )}
      
      {tutorialActive && <TutorialOverlay steps={tutorialSteps} currentStepIndex={tutorialStepIndex} onNext={handleTutorialNext} onComplete={() => setTutorialActive(false)} pet={getSelectedPet()} />}
      {currentReward && <RewardOverlay reward={currentReward} onClose={() => setCurrentReward(null)} pet={getSelectedPet()} />}
      {isSettingsOpen && <SettingsModal settings={settings} userProgress={userProgress} onSave={handleSaveSettings} onClose={() => setIsSettingsOpen(false)} onResetProgress={handleResetProgress} onLoadProgress={handleLoadProgress} onResetScore={handleResetScore} pets={PETS} />}
      
      <FontControl currentFont={settings.fontStyle} onChange={(f) => handleSaveSettings({...settings, fontStyle: f})} />
      <button onClick={() => setIsSettingsOpen(true)} className={`absolute z-[200] bg-white/90 p-3 rounded-full shadow-md border-2 border-gray-200 hover:rotate-90 transition-transform duration-300 ${screen === ScreenState.HANGMAN_GAME ? 'top-4 right-4 md:top-8 md:right-8' : 'bottom-4 right-4 md:bottom-8 md:right-8'}`} title="הגדרות">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>
    </div>
  );
};
