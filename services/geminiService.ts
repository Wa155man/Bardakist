// ... existing imports ...
import { GoogleGenAI, Type } from "@google/genai";
import { GameQuestion, VowelType, SentenceQuestion, RhymeQuestion, ReadingQuestion } from "../types";
import { VOWEL_SPECIFIC_FALLBACKS, FALLBACK_TWISTERS, FALLBACK_SENTENCES, FALLBACK_SENTENCES_ENGLISH, FALLBACK_RHYMES, FALLBACK_HANGMAN_WORDS, FALLBACK_HANGMAN_WORDS_ENGLISH, FALLBACK_READING_QUESTIONS, FALLBACK_READING_QUESTIONS_ENGLISH } from "../constants";

// ... existing initializeGenAI, handleGeminiError, blobToBase64, Audio Helpers ...

const initializeGenAI = () => {
  // Safe check for offline mode
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return null;
  }

  // 1. Check LocalStorage (User provided key)
  try {
    const userKey = localStorage.getItem('user_api_key');
    if (userKey && userKey.trim().length > 0) {
      return new GoogleGenAI({ apiKey: userKey.trim() });
    }
  } catch (e) {}

  // 2. Check Environment Variables
  let apiKey = '';
  try {
      if (typeof process !== 'undefined' && process.env) {
          // @ts-ignore
          apiKey = process.env.API_KEY || '';
      }
      else if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_KEY) {
          apiKey = (import.meta as any).env.VITE_API_KEY;
      }
  } catch (e) {}
  
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// ... existing handleGeminiError ...
const handleGeminiError = (error: any, context: string) => {
    console.warn(`Gemini Error in [${context}]:`, error);
};

// ... existing blobToBase64 ...
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      resolve(base64data.split(',')[1]); 
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- Audio Helpers for TTS ---
let audioContext: AudioContext | null = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtor) {
        audioContext = new AudioCtor({ sampleRate: 24000, latencyHint: 'interactive' });
    }
  }
  return audioContext;
}

export const resumeAudioContext = async () => {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch (e) {
      // ignore
    }
  }
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- TTS Caching & Prefetching ---
const ttsCache = new Map<string, AudioBuffer>();
const pendingTTS = new Map<string, Promise<AudioBuffer | null>>();

const getTTSAudioBuffer = async (text: string): Promise<AudioBuffer | null> => {
  if (!text || !text.trim()) return null;
  if (ttsCache.has(text)) return ttsCache.get(text)!;
  if (pendingTTS.has(text)) return pendingTTS.get(text)!;

  const ai = initializeGenAI();
  if (!ai) return null; 

  const fetchPromise = (async () => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
          responseModalities: ["AUDIO"], 
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Aoede' },
            },
          },
        },
      });

      // @ts-ignore
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      const ctx = getAudioContext();
      if (!ctx) return null;

      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      ttsCache.set(text, audioBuffer);
      return audioBuffer;
    } catch (error) {
      return null;
    }
  })();

  pendingTTS.set(text, fetchPromise);
  fetchPromise.finally(() => pendingTTS.delete(text));
  return fetchPromise;
};

export const prefetchTTS = (text: string) => {
    getTTSAudioBuffer(text).catch(() => {});
};

const speakBrowser = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => (v.lang === 'he-IL' || v.lang === 'he') && v.name.includes('Google'));
    if (!voice) voice = voices.find(v => v.lang === 'he-IL' || v.lang === 'he');

    if (/[א-ת]/.test(text)) {
        u.lang = 'he-IL';
        if (voice) u.voice = voice;
    } else {
        u.lang = 'en-US';
    }
    
    u.rate = 1.0; 
    u.pitch = 1.0; 
    
    window.speechSynthesis.speak(u);
};

export const playTextToSpeech = async (text: string) => {
  if (!text) return;
  const ctx = getAudioContext();
  
  // 1. Check Cache - If we have High Quality Audio, use it immediately
  if (ctx && ttsCache.has(text)) {
      if (ctx.state === 'suspended') try { await ctx.resume(); } catch(e){}
      const buffer = ttsCache.get(text)!;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      return;
  }

  // 2. Instant Fallback to Browser TTS
  // If the audio isn't cached, we do NOT wait for the API call. 
  // We play the robot voice immediately to prevent lag.
  speakBrowser(text);

  // 3. Prefetch for next time (Background)
  // We start the fetch in the background so next time it might be ready.
  prefetchTTS(text);
};

// ... existing Image Helpers ...
export const getMiniGameImageUrl = (englishWord: string): string => {
  const term = englishWord.trim();
  return `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(term)}?width=300&height=300&model=flux&nologo=true&seed=${encodeURIComponent(term)}`;
};

export const getHangmanImageUrl = (hint: string): string => {
    const term = hint.trim();
    return `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(term)}?width=250&height=250&model=flux&nologo=true&seed=${encodeURIComponent(term)}`;
};

// ... Content Generators ...

// 1. Level Content Generator (Recycles if exhausted)
export const generateLevelContent = async (vowel: VowelType, excludeWords: string[] = []): Promise<GameQuestion[]> => {
  const specificQuestions = VOWEL_SPECIFIC_FALLBACKS[vowel] || VOWEL_SPECIFIC_FALLBACKS[VowelType.KAMATZ];
  let available = specificQuestions.filter(q => !excludeWords.includes(q.word));
  
  if (available.length < 5) {
      available = specificQuestions; 
  }
  
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  return Promise.resolve(selected.map(q => ({ ...q, id: q.id + '-' + Date.now() })));
};

export const evaluatePronunciation = async (audioBlob: Blob, targetWord: string, childName: string = "Friend"): Promise<string> => {
  return "מְצוּיָן!";
};

// 2. Sentence Generator (Recycles if exhausted, 100+ pool)
export const generateSentenceQuestions = async (language: 'hebrew' | 'english' = 'hebrew', excludeList: string[] = []): Promise<SentenceQuestion[]> => {
  const getFallback = () => {
      const sourceList = language === 'english' ? FALLBACK_SENTENCES_ENGLISH : FALLBACK_SENTENCES;
      let available = sourceList.filter(s => !excludeList.includes(s.fullSentence));
      
      if (available.length < 5) {
          available = sourceList;
      }
      
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      
      return shuffled.slice(0, 5).map((s, i) => ({ id: `fallback-${Date.now()}-${i}`, ...s }));
  };
  return getFallback();
};

// 3. Hangman Words Generator (Recycles)
export const generateHangmanWords = async (language: 'hebrew' | 'english' = 'hebrew', excludeList: string[] = []): Promise<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]> => {
  const getFallback = () => {
      const fallbackSource = language === 'english' ? FALLBACK_HANGMAN_WORDS_ENGLISH : FALLBACK_HANGMAN_WORDS;
      let available = fallbackSource.filter(w => !excludeList.includes(w.word));
      
      if (available.length < 5) {
          available = fallbackSource;
      }
      
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
  };
  return getFallback();
};

// 4. Rhymes Generator (Recycles)
export const generateRhymeQuestions = async (excludeWords: string[] = []): Promise<RhymeQuestion[]> => {
    const getFallback = () => {
        let available = FALLBACK_RHYMES.filter(q => !excludeWords.includes(q.targetWord));
        if (available.length < 5) {
            available = FALLBACK_RHYMES;
        }
        const shuffled = [...available].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 20).map((q, i) => ({ ...q, id: `rhyme-${Date.now()}-${i}` }));
    };
    return getFallback();
};

// 5. Reading Generator (Recycles, Shuffles, 100+ Questions)
export const generateReadingQuestions = async (excludeIds: string[] = [], language: 'hebrew' | 'english' = 'hebrew'): Promise<ReadingQuestion[]> => {
    // 1. Select source based on language
    const sourceList = language === 'english' ? FALLBACK_READING_QUESTIONS_ENGLISH : FALLBACK_READING_QUESTIONS;

    // 2. Filter out questions that have already been played (excludeIds)
    // IMPORTANT: Compare pure IDs if the IDs in history were modified with timestamps previously, though here we use stable IDs from constants
    let available = sourceList.filter(q => !excludeIds.includes(q.id));
    
    // 3. If exhausted (or too few for a batch), recycle the full list
    if (available.length < 5) {
        available = sourceList;
        // NOTE: In a real recycle scenario, we might want to clear the excludeIds in the parent component 
        // to restart the cycle cleanly, but strictly here we just serve from full list randomized.
    }
    
    // 4. Shuffle the pool completely
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    
    // 5. Return a batch (e.g., 5 at a time)
    return shuffled.slice(0, 5);
};

export const generateTongueTwister = async (): Promise<{hebrew: string, english: string}> => {
    return FALLBACK_TWISTERS[Math.floor(Math.random() * FALLBACK_TWISTERS.length)];
};

export const evaluateHandwriting = async (imageDataUrl: string, promptText: string): Promise<{isCorrect: boolean, feedback: string}> => {
    return { isCorrect: true, feedback: "Great effort!" };
};