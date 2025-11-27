
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
import { generateLevelContent, generateSentenceQuestions, generateHangmanWords, generateRhymeQuestions, generateReadingQuestions, getMiniGameImageUrl } from './services/geminiService';
import { LEVEL_NODES, GURI_REWARDS, PETS } from './constants';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [returnScreen, setReturnScreen] = useState<ScreenState>(ScreenState.LEVEL_SELECT);
  const [currentLevel, setCurrentLevel] = useState<LevelNode | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [sentenceQuestions, setSentenceQuestions] = useState<SentenceQuestion[]>([]);
  const [hangmanWords, setHangmanWords] = useState<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]>([]);
  const [hangmanHistory, setHangmanHistory] = useState<Set<string>>(new Set());
  
  const [rhymeQuestions, setRhymeQuestions] = useState<RhymeQuestion[]>([]);
  const [rhymeHistory, setRhymeHistory] = useState<Set<string>>(new Set());
  const [isLoadingRhymes, setIsLoadingRhymes] = useState(false);

  const [readingQuestions, setReadingQuestions] = useState<ReadingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [snowmanLanguage, setSnowmanLanguage] = useState<'hebrew' | 'english'>('hebrew');
  
  const [currentReward, setCurrentReward] = useState<GuriReward | null>(null);

  const [sentenceHistory, setSentenceHistory] = useState<Set<string>>(() => {
      try {
          const saved = localStorage.getItem('sentenceHistory');
          return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch (e) {
          console.error("Failed to load sentence history", e);
          return new Set();
      }
  });

  useEffect(() => {
      localStorage.setItem('sentenceHistory', JSON.stringify(Array.from(sentenceHistory)));
  }, [sentenceHistory]);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    try {
        const saved = localStorage.getItem('userProgress');
        return saved ? JSON.parse(saved) : { totalCoins: 0, completedLevels: [] };
    } catch (e) {
        console.error("Failed to load user progress", e);
        return { totalCoins: 0, completedLevels: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  // NEW: Handle resetting only the score to 0
  const handleResetScore = () => {
      setUserProgress(prev => ({
          ...prev,
          totalCoins: 0
      }));
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('appSettings');
    const defaults: AppSettings = { 
      childName: 'Tommy', 
      soundEffects: true, 
      autoPlayAudio: true,
      fontStyle: 'print',
      selectedPetId: 'guri' // Default pet
    };

    if (!saved) return defaults;

    try {
        const parsed = JSON.parse(saved);
        const merged = { ...defaults, ...parsed };
        if (merged.fontStyle === 'marker') merged.fontStyle = 'playpen';
        return merged;
    } catch (e) {
        console.error("Failed to parse settings", e);
        return defaults;
    }
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
          
          setTimeout(() => {
             setCurrentReward({
                 ...reward,
                 milestone: milestoneTarget
             });
          }, 500);
      }

      return {
        ...prev,
        totalCoins: newTotal
      };
    });
  };

  // Check for initial pet selection
  useEffect(() => {
      const hasSelectedPet = localStorage.getItem('has_selected_pet');
      if (!hasSelectedPet) {
          setScreen(ScreenState.PET_SELECTION);
      }
  }, []);

  const getSelectedPet = (): PetProfile => {
      return PETS.find(p => p.id === settings.selectedPetId) || PETS[0];
  };

  const handlePetSelection = (petId: string) => {
      handleSaveSettings({ ...settings, selectedPetId: petId });
      localStorage.setItem('has_selected_pet', 'true');
      setScreen(ScreenState.LEVEL_SELECT);
      
      // Trigger welcome tutorial with new pet immediately if map tutorial not done
      const hasSeenMapTutorial = localStorage.getItem('tutorial_map_completed');
      if (!hasSeenMapTutorial) {
        setTimeout(() => {
            const pet = PETS.find(p => p.id === petId) || PETS[0];
            startTutorial([
                { message: `שלום! אני ${pet.nameHebrew}. ברוכים הבאים להרפתקאות בעברית!` },
                { message: "טיילו בשביל האבנים הצהובות כדי לפתוח שלבים ולהרוויח מטבעות." },
                { message: "לחצו על השלב הראשון כדי להתחיל במסע!" }
            ]);
            localStorage.setItem('tutorial_map_completed', 'true');
        }, 500);
      }
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('appSettings', JSON.stringify(newSettings));
  };
  
  const handleLoadProgress = (newProgress: UserProgress) => {
    setUserProgress(newProgress);
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
  };

  useEffect(() => {
    const root = document.documentElement;
    let fontVal = "'Varela Round', sans-serif"; 
    if (settings.fontStyle === 'hand1') fontVal = "'Gveret Levin', cursive"; 
    if (settings.fontStyle === 'playpen') fontVal = "'Playpen Sans Hebrew', cursive"; 
    if (settings.fontStyle === 'alef') fontVal = "'Alef', sans-serif";
    
    root.style.setProperty('--dynamic-font', fontVal);
  }, [settings.fontStyle]);

  const handleResetProgress = () => {
    const resetProgress = { totalCoins: 0, completedLevels: [] };
    setUserProgress(resetProgress);
    localStorage.setItem('userProgress', JSON.stringify(resetProgress));
    
    localStorage.removeItem('sentenceHistory');
    localStorage.removeItem('hangmanHistory');
    localStorage.removeItem('rhymeHistory');
    localStorage.removeItem('has_selected_pet'); // Reset pet selection too
    
    localStorage.removeItem('tutorial_map_completed');
    localStorage.removeItem('tutorial_game_completed');
    localStorage.removeItem('tutorial_writing_completed');
    localStorage.removeItem('tutorial_sentences_completed');
    localStorage.removeItem('tutorial_matching_completed');
    localStorage.removeItem('tutorial_naming_completed');
    localStorage.removeItem('tutorial_memory_completed');
    localStorage.removeItem('tutorial_dictation_completed');
    localStorage.removeItem('tutorial_hangman_completed');
    localStorage.removeItem('tutorial_rhymes_completed');
    localStorage.removeItem('tutorial_reading_completed');
    location.reload();
  };

  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<TutorialStep[]>([]);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);

  useEffect(() => {
    const hasSeenMapTutorial = localStorage.getItem('tutorial_map_completed');
    const hasSelectedPet = localStorage.getItem('has_selected_pet');
    
    if (!hasSeenMapTutorial && hasSelectedPet) {
      const pet = getSelectedPet();
      startTutorial([
        { message: `שלום! אני ${pet.nameHebrew}. ברוכים הבאים להרפתקאות בעברית!` },
        { message: "טיילו בשביל האבנים הצהובות כדי לפתוח שלבים ולהרוויח מטבעות." },
        { message: "לחצו על השלב הראשון כדי להתחיל במסע!" }
      ]);
      localStorage.setItem('tutorial_map_completed', 'true');
    }
  }, []);

  const startTutorial = (steps: TutorialStep[]) => {
    setTutorialSteps(steps);
    setTutorialStepIndex(0);
    setTutorialActive(true);
  };

  const handleTutorialNext = () => {
    if (tutorialStepIndex < tutorialSteps.length - 1) {
      setTutorialStepIndex(prev => prev + 1);
    } else {
      setTutorialActive(false);
    }
  };

  const handleSelectLevel = async (level: LevelNode) => {
    setCurrentLevel(level);
    setIsLoading(true);
    setScreen(ScreenState.GAME_SESSION); 
    
    try {
      const generatedQuestions = await generateLevelContent(level.vowel);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);

      if (generatedQuestions.length > 0) {
          const imgPromise = new Promise<void>((resolve) => {
              const firstImg = new Image();
              firstImg.onload = () => resolve();
              firstImg.onerror = () => resolve();
              firstImg.src = getMiniGameImageUrl(generatedQuestions[0].correctTranslation);
          });
          
          const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 2000));
          await Promise.race([imgPromise, timeoutPromise]);
          
          generatedQuestions.slice(1).forEach(q => {
            const img = new Image();
            img.src = getMiniGameImageUrl(q.correctTranslation);
          });
      }

      const hasSeenGameTutorial = localStorage.getItem('tutorial_game_completed');
      if (!hasSeenGameTutorial) {
        setTimeout(() => {
          startTutorial([
            { message: "הנה האתגר הראשון שלכם!" },
            { message: "לחצו על המילה הגדולה כדי לשמוע איך אומרים אותה." },
            { message: "לאחר מכן, בחרו את התרגום הנכון באנגלית מהכפתורים למטה." }
          ]);
          localStorage.setItem('tutorial_game_completed', 'true');
        }, 500);
      }

    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPlay = async () => {
    setIsLoading(true);
    setScreen(ScreenState.SNOWMAN_GAME);
    const hasSeenSentencesTutorial = localStorage.getItem('tutorial_sentences_completed');
    if (!hasSeenSentencesTutorial) {
        setTimeout(() => {
            startTutorial([
                { message: "ברוכים הבאים למשחק המשפטים!" },
                { message: "השלימו את המילה החסרה במשפט כדי לבנות את איש השלג." },
                { message: "קראו את המשפט, בחרו את המילה הנכונה, ובהצלחה!" }
            ]);
            localStorage.setItem('tutorial_sentences_completed', 'true');
        }, 500);
    }
    setIsLoading(false);
  };
  
  const handleSentenceGameStart = async (language: 'hebrew' | 'english') => {
      setIsLoading(true);
      setSnowmanLanguage(language);
      try {
          const historyArray = Array.from(sentenceHistory) as string[];
          const data = await generateSentenceQuestions(language, historyArray);
          
          const newHistory = new Set(sentenceHistory);
          data.forEach(q => newHistory.add(q.fullSentence)); 
          setSentenceHistory(newHistory);

          setSentenceQuestions(data);
      } catch (e) {
          console.error("Failed to start sentence game", e);
      } finally {
          setIsLoading(false);
      }
  };

  const handleLoadMoreSentences = async (language: 'hebrew' | 'english') => {
    try {
      const historyArray = Array.from(sentenceHistory) as string[];
      const newQuestions = await generateSentenceQuestions(language, historyArray);
      
      const newHistory = new Set(sentenceHistory);
      newQuestions.forEach(q => newHistory.add(q.fullSentence));
      setSentenceHistory(newHistory);

      setSentenceQuestions(prev => [...prev, ...newQuestions]);
    } catch (e) {
      console.error("Failed to load more sentence questions", e);
    }
  };

  const handleOpenMiniPractice = () => {
    setScreen(ScreenState.MINI_PRACTICE_SELECT);
  };

  const handleLoadMoreHangman = async () => {
      try {
          const currentHistory = Array.from(hangmanHistory) as string[];
          const newWords = await generateHangmanWords(currentHistory);
          
          const newHistory = new Set(hangmanHistory);
          newWords.forEach(w => newHistory.add(w.word));
          setHangmanHistory(newHistory);

          newWords.forEach(w => {
                const img = new Image();
                const cleanPrompt = w.hint; 
                const seed = w.hint; 
                img.src = `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(cleanPrompt)}?width=250&height=250&model=flux&nologo=true&seed=${encodeURIComponent(seed)}`;
          });
          setHangmanWords(prev => [...prev, ...newWords]);
      } catch (e) {
          console.error("Failed to load more hangman words", e);
      }
  };

  const handleLoadMoreRhymes = async () => {
    if (isLoadingRhymes) return;
    setIsLoadingRhymes(true);
    try {
        const history = Array.from(rhymeHistory) as string[];
        const newQuestions = await generateRhymeQuestions(history);
        
        const newHistory = new Set(rhymeHistory);
        newQuestions.forEach(q => newHistory.add(q.targetWord));
        setRhymeHistory(newHistory);

        setRhymeQuestions(prev => [...prev, ...newQuestions]);
    } catch (e) {
        console.error("Failed to load more rhyme questions", e);
    } finally {
        setIsLoadingRhymes(false);
    }
  };

  const handleMiniPracticeSelect = async (optionId: string) => {
    if (optionId === 'sentences') {
      setReturnScreen(ScreenState.MINI_PRACTICE_SELECT);
      handleQuickPlay();
      return;
    }
    if (optionId === 'matching') {
      setScreen(ScreenState.MATCHING_GAME);
      const hasSeen = localStorage.getItem('tutorial_matching_completed');
      if (!hasSeen) {
          setTimeout(() => {
              startTutorial([
                  { message: "במשחק זה עליכם להתאים בין האותיות." },
                  { message: "למעלה תופיע אות בכתב יד, ולמטה אפשרויות בדפוס." },
                  { message: "מצאו את הזוג הנכון!" }
              ]);
              localStorage.setItem('tutorial_matching_completed', 'true');
          }, 500);
      }
      return;
    }
    if (optionId === 'naming') {
      setScreen(ScreenState.NAMING_GAME);
      const hasSeen = localStorage.getItem('tutorial_naming_completed');
      if (!hasSeen) {
          setTimeout(() => {
              startTutorial([
                  { message: "בואו נלמד את שמות האותיות!" },
                  { message: "הביטו באות הכתובה בכתב יד." },
                  { message: "בחרו את האות המתאימה לה בדפוס מהאפשרויות למטה." }
              ]);
              localStorage.setItem('tutorial_naming_completed', 'true');
          }, 500);
      }
      return;
    }
    if (optionId === 'writing') {
        setScreen(ScreenState.WRITING_GAME);
        const hasSeenWritingTutorial = localStorage.getItem('tutorial_writing_completed');
        if (!hasSeenWritingTutorial) {
          setTimeout(() => {
            startTutorial([
              { message: "ברוכים הבאים למשחק הכתיבה!" }, 
              { message: "כאן תוכלו לתרגל כתיבת אותיות: גם בדפוס וגם בכתב יד." }, 
              { message: "שימו לב: יש לכתוב את האות בין השורות הכחולות." }, 
              { message: "רוצים לשנות? לחצו על הכפתור למעלה כדי להחליף בין סוגי הכתב." }
            ]);
            localStorage.setItem('tutorial_writing_completed', 'true');
          }, 500);
        }
        return;
    }
    if (optionId === 'memory') {
      setScreen(ScreenState.MEMORY_GAME);
      const hasSeen = localStorage.getItem('tutorial_memory_completed');
      if (!hasSeen) {
          setTimeout(() => {
              startTutorial([
                  { message: "משחק הזיכרון!" },
                  { message: "הפכו את הקלפים ומצאו את הזוגות של האותיות הזהות." },
                  { message: "נסו לזכור היכן נמצאת כל אות." }
              ]);
              localStorage.setItem('tutorial_memory_completed', 'true');
          }, 500);
      }
      return;
    }
    if (optionId === 'dictation') {
      setScreen(ScreenState.DICTATION_GAME);
      const hasSeen = localStorage.getItem('tutorial_dictation_completed');
      if (!hasSeen) {
          setTimeout(() => {
              startTutorial([
                  { message: "ברוכים הבאים להכתבה!" },
                  { message: "כאן תוכלו ליצור רשימות מילים ולבחון את עצמכם." },
                  { message: "הזינו מילים, שננו אותן, ואז נסו לכתוב אותן נכון." }
              ]);
              localStorage.setItem('tutorial_dictation_completed', 'true');
          }, 500);
      }
      return;
    }
    if (optionId === 'hangman') {
      setIsLoading(true);
      setScreen(ScreenState.HANGMAN_GAME);
      const hasSeen = localStorage.getItem('tutorial_hangman_completed');
      if (!hasSeen) {
          setTimeout(() => {
              startTutorial([
                  { message: "גלו את המילה המסתתרת!" },
                  { message: "נחשו אותיות כדי להשלים את המילה." },
                  { message: "היזהרו! אל תתנו למשחק להשלים את הרובוט" }
              ]);
              localStorage.setItem('tutorial_hangman_completed', 'true');
          }, 500);
      }
      try {
        const history = Array.from(hangmanHistory) as string[];
        const words = await generateHangmanWords(history);
        setHangmanWords(words);
        const newHistory = new Set(hangmanHistory);
        words.forEach(w => newHistory.add(w.word));
        setHangmanHistory(newHistory);
        words.forEach(w => {
             const img = new Image();
             const cleanPrompt = w.hint; 
             const seed = w.hint; 
             img.src = `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(cleanPrompt)}?width=250&height=250&model=flux&nologo=true&seed=${encodeURIComponent(seed)}`;
        });
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
      return;
    }
    if (optionId === 'rhymes') {
      setIsLoading(true);
      setScreen(ScreenState.RHYME_GAME);
      const hasSeen = localStorage.getItem('tutorial_rhymes_completed');
      if (!hasSeen) {
          setTimeout(() => {
              startTutorial([
                  { message: "זמן לחרוזים!" },
                  { message: "הקשיבו למילה." },
                  { message: "בחרו את המילה שמתחרזת איתה מהאפשרויות." }
              ]);
              localStorage.setItem('tutorial_rhymes_completed', 'true');
          }, 500);
      }
      try {
        const history = Array.from(rhymeHistory) as string[];
        const data = await generateRhymeQuestions(history);
        const newHistory = new Set(rhymeHistory);
        data.forEach(q => newHistory.add(q.targetWord));
        setRhymeHistory(newHistory);
        setRhymeQuestions(data);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
      return;
    }
    if (optionId === 'reading') {
        setIsLoading(true);
        setScreen(ScreenState.READING_GAME);
        const hasSeen = localStorage.getItem('tutorial_reading_completed');
        if (!hasSeen) {
            setTimeout(() => {
                startTutorial([
                    { message: "בואו נתרגל קריאה והבנה." },
                    { message: "קראו את הסיפור הקצרצר למעלה." },
                    { message: "לאחר מכן, ענו על השאלה שמופיעה מתחתיו." }
                ]);
                localStorage.setItem('tutorial_reading_completed', 'true');
            }, 500);
        }
        try {
            const data = await generateReadingQuestions();
            setReadingQuestions(data);
        } catch(e) { console.error(e); } finally { setIsLoading(false); }
        return;
    }

    setIsLoading(true);
    const practiceLevel = LEVEL_NODES[0]; 
    setCurrentLevel({ ...practiceLevel, name: 'Practice Mode' });
    setScreen(ScreenState.GAME_SESSION);

    try {
      const generatedQuestions = await generateLevelContent(practiceLevel.vowel);
      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      if (generatedQuestions.length > 0) {
          const imgPromise = new Promise<void>((resolve) => {
              const img = new Image();
              img.onload = () => resolve();
              img.onerror = () => resolve();
              img.src = getMiniGameImageUrl(generatedQuestions[0].correctTranslation);
          });
          const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 2000));
          await Promise.race([imgPromise, timeoutPromise]);
          generatedQuestions.slice(1).forEach(q => {
            const img = new Image();
            img.src = getMiniGameImageUrl(q.correctTranslation);
          });
      }
    } catch(e) {
      console.error(e);
      setScreen(ScreenState.MINI_PRACTICE_SELECT);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleLoadMoreReading = async () => {
    try {
      const newQuestions = await generateReadingQuestions();
      setReadingQuestions(prev => [...prev, ...newQuestions]);
    } catch (e) { console.error(e); }
  };
  
  const handleOpenTongueTwisters = () => {
    setScreen(ScreenState.TONGUE_TWISTERS);
  };

  const handleLoadMorePractice = async () => {
      if (!currentLevel) return;
      setIsLoading(true);
      try {
          const currentWords = questions.map(q => q.word);
          const newQuestions = await generateLevelContent(currentLevel.vowel, currentWords);
          if (newQuestions.length > 0) {
                const imgPromise = new Promise<void>((resolve) => {
                    const img = new Image();
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                    img.src = getMiniGameImageUrl(newQuestions[0].correctTranslation);
                });
                const timeoutPromise = new Promise<void>((resolve) => setTimeout(resolve, 2000));
                await Promise.race([imgPromise, timeoutPromise]);
                newQuestions.slice(1).forEach(q => {
                    const i = new Image();
                    i.src = getMiniGameImageUrl(q.correctTranslation);
                });
          }
          setQuestions(prev => [...prev, ...newQuestions]);
          setCurrentQuestionIndex(prev => prev + 1);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleCorrectAnswer = async () => {
    handleEarnPoints(3);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      if (screen === ScreenState.GAME_SESSION) {
          await handleLoadMorePractice();
      } else {
          handleLevelComplete();
      }
    }
  };

  const handleWrongAnswer = () => {};

  const handleLevelComplete = () => {
    setScreen(ScreenState.VICTORY);
    if (currentLevel && !userProgress.completedLevels.includes(currentLevel.id)) {
      setUserProgress(prev => ({
        ...prev,
        completedLevels: [...prev.completedLevels, currentLevel.id],
        totalCoins: prev.totalCoins + 50 
      }));
    }
  };
  
  const handleSnowmanComplete = () => {
    setUserProgress(prev => ({ ...prev, totalCoins: prev.totalCoins + 100 }));
    setScreen(ScreenState.VICTORY);
  }

  const handleBackToMap = () => {
    setScreen(ScreenState.LEVEL_SELECT);
    setQuestions([]);
    setSentenceQuestions([]);
    setHangmanWords([]);
    setRhymeQuestions([]);
    setReadingQuestions([]);
    setCurrentLevel(null);
  };

  const handleBackToMiniPractice = () => {
    setScreen(ScreenState.MINI_PRACTICE_SELECT);
  };

  const showTopBar = [ScreenState.LEVEL_SELECT, ScreenState.GAME_SESSION].includes(screen);

  const renderContent = () => {
    if (screen === ScreenState.PET_SELECTION) {
        return <PetSelection onSelect={handlePetSelection} />;
    }
    
    if (screen === ScreenState.LEVEL_SELECT) {
      return (
        <LevelMap 
          onSelectLevel={handleSelectLevel} 
          onQuickPlay={() => {
             setReturnScreen(ScreenState.LEVEL_SELECT);
             handleQuickPlay();
          }} 
          onOpenTongueTwisters={handleOpenTongueTwisters} 
          onOpenMiniPractice={handleOpenMiniPractice}
        />
      );
    }
    if (screen === ScreenState.MINI_PRACTICE_SELECT) {
      return <MiniPracticeGrid onSelectOption={handleMiniPracticeSelect} onBack={handleBackToMap} />;
    }
    if (screen === ScreenState.MATCHING_GAME) {
      return <MatchingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />;
    }
    if (screen === ScreenState.NAMING_GAME) {
      return <NamingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />;
    }
    if (screen === ScreenState.WRITING_GAME) {
        return <WritingGame onBack={handleBackToMiniPractice} settings={settings} onEarnPoints={handleEarnPoints} />;
    }
    if (screen === ScreenState.MEMORY_GAME) {
      return <MemoryGame onBack={handleBackToMiniPractice} onEarnPoints={handleEarnPoints} />;
    }
    if (screen === ScreenState.DICTATION_GAME) {
        return <DictationGame onBack={handleBackToMiniPractice} onEarnPoints={handleEarnPoints} />;
    }
    if (screen === ScreenState.HANGMAN_GAME && !isLoading) {
      return <HangmanGame words={hangmanWords} onBack={handleBackToMiniPractice} onLoadMore={handleLoadMoreHangman} onEarnPoints={handleEarnPoints} />;
    }
    if (screen === ScreenState.RHYME_GAME && !isLoading) {
      return <RhymeGame questions={rhymeQuestions} onBack={handleBackToMiniPractice} onLoadMore={handleLoadMoreRhymes} onEarnPoints={handleEarnPoints} />;
    }
    if (screen === ScreenState.READING_GAME && !isLoading) {
      return <ReadingGame questions={readingQuestions} onBack={handleBackToMiniPractice} onLoadMore={handleLoadMoreReading} onEarnPoints={handleEarnPoints} />;
    }
    if (screen === ScreenState.TONGUE_TWISTERS) {
      return <TongueTwisters onBack={handleBackToMap} />;
    }
    if (screen === ScreenState.SNOWMAN_GAME && !isLoading) {
      return <SnowmanGame questions={sentenceQuestions} onComplete={handleSnowmanComplete} onBack={() => { if (returnScreen === ScreenState.LEVEL_SELECT) { handleBackToMap(); } else { handleBackToMiniPractice(); } }} onLoadMore={handleLoadMoreSentences} onStartGame={handleSentenceGameStart} settings={settings} onEarnPoints={handleEarnPoints} language={snowmanLanguage} />;
    }
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full bg-green-50 rounded-[2.5rem]">
          <div className="w-24 h-24 border-8 border-green-200 border-t-green-500 rounded-full animate-spin mb-4"></div>
          <h2 className="text-3xl font-bold text-green-700 animate-pulse">...טוען</h2>
          <p className="text-green-600 mt-2">!מכינים את המשחק</p>
        </div>
      );
    }
    if (screen === ScreenState.GAME_SESSION && currentLevel) {
      return (
        <div className="h-full w-full bg-indigo-50 pt-14 md:pt-20 relative overflow-hidden flex flex-col">
           <div className="absolute -left-10 top-20 w-40 h-40 bg-yellow-300 rounded-full opacity-50 mix-blend-multiply filter blur-xl animate-blob"></div>
           <div className="absolute -right-10 top-40 w-40 h-40 bg-purple-300 rounded-full opacity-50 mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
           <div className="container mx-auto px-4 relative z-10 flex-1 flex flex-col">
             <div className="text-center mb-1 md:mb-2 shrink-0">
               <h1 className="text-xl md:text-2xl font-bold text-gray-700">{currentLevel.name}</h1>
               <p className="text-gray-500 text-xs md:text-sm">{currentLevel.description}</p>
             </div>
             {questions.length > 0 && (
               <div className="flex-1 min-h-0">
                 <MiniGame 
                    question={questions[currentQuestionIndex]} 
                    nextQuestion={questions[currentQuestionIndex + 1]} // PASS NEXT QUESTION HERE
                    totalQuestions={questions.length} 
                    questionNumber={currentQuestionIndex + 1} 
                    onCorrect={handleCorrectAnswer} 
                    onWrong={handleWrongAnswer} 
                    isTutorialActive={tutorialActive} 
                    settings={settings} 
                 />
               </div>
             )}
           </div>
        </div>
      );
    }
    if (screen === ScreenState.VICTORY) {
      return (
        <div className="h-full flex flex-col items-center justify-center bg-gradient-to-b from-yellow-100 to-orange-100 p-4 text-center overflow-hidden">
          <div className="mb-8 pop-in">
            <span className="text-9xl filter drop-shadow-lg">🏆</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-orange-500 mb-4 drop-shadow-sm font-round">כָּל הַכָּבוֹד!</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">{settings.childName ? `Amazing job, ${settings.childName}!` : "You did an amazing job!"}</p>
          <div className="bg-white p-6 rounded-2xl shadow-xl mb-8 flex items-center gap-4">
            <span className="text-yellow-500 text-4xl">💰</span>
            <span className="text-4xl font-bold text-gray-800">Total: {userProgress.totalCoins}</span>
          </div>
          <Button onClick={handleBackToMap} color="green" size="lg">חזרה לתפריט</Button>
        </div>
      );
    }
    return null;
  };

  const selectedPet = getSelectedPet();

  return (
    <div className="relative w-[95vw] h-[95vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden border-[8px] border-slate-800 ring-4 ring-slate-900/50 select-none flex flex-col">
      {showTopBar && <TopBar progress={userProgress} onHome={handleBackToMap} onOpenSettings={() => {}} />}
      
      {renderContent()}
      
      {tutorialActive && (
        <TutorialOverlay 
          steps={tutorialSteps}
          currentStepIndex={tutorialStepIndex}
          onNext={handleTutorialNext}
          onComplete={() => setTutorialActive(false)}
          pet={selectedPet} 
        />
      )}
      
      {currentReward && (
          <RewardOverlay 
            reward={currentReward} 
            onClose={() => setCurrentReward(null)} 
            pet={selectedPet} 
          />
      )}

      {isSettingsOpen && (
        <SettingsModal 
          settings={settings} 
          userProgress={userProgress} 
          onSave={handleSaveSettings} 
          onClose={() => setIsSettingsOpen(false)} 
          onResetProgress={handleResetProgress} 
          onLoadProgress={handleLoadProgress} 
          onResetScore={handleResetScore} 
          pets={PETS} 
        />
      )}
      
      <FontControl currentFont={settings.fontStyle} onChange={(f) => handleSaveSettings({...settings, fontStyle: f})} />

      <button onClick={() => setIsSettingsOpen(true)} className={`absolute z-[200] bg-white/90 p-3 rounded-full shadow-md border-2 border-gray-200 hover:rotate-90 transition-transform duration-300 ${screen === ScreenState.HANGMAN_GAME ? 'top-4 right-4' : 'bottom-4 right-4'}`} title="הגדרות">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
};
