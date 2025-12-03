
import { GoogleGenAI, Type } from "@google/genai";
import { GameQuestion, VowelType, SentenceQuestion, RhymeQuestion, ReadingQuestion } from "../types";
import { VOWEL_SPECIFIC_FALLBACKS, FALLBACK_TWISTERS, FALLBACK_SENTENCES, FALLBACK_SENTENCES_ENGLISH, FALLBACK_RHYMES, FALLBACK_HANGMAN_WORDS, FALLBACK_HANGMAN_WORDS_ENGLISH, FALLBACK_READING_QUESTIONS, FALLBACK_READING_QUESTIONS_ENGLISH } from "../constants";

const initializeGenAI = () => {
  // Safe check for offline mode
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn("Offline. Using fallback data.");
      return null;
  }

  // Safely access environment variables to prevent startup crash
  let apiKey = '';
  try {
      // @ts-ignore - This is a common pattern for accessing env vars in different environments
      if (typeof process !== 'undefined' && process.env) {
          // @ts-ignore
          apiKey = process.env.API_KEY;
      }
  } catch (e) {
      // process is not defined
  }
  
  if (!apiKey) {
    console.warn("API_KEY is missing. Using fallback data.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to handle API errors gracefully
const handleGeminiError = (error: any, context: string) => {
    const msg = error?.message || error?.toString() || "";
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || error?.status === 'RESOURCE_EXHAUSTED') {
        console.warn(`Gemini Quota Exceeded in [${context}]. Switching to fallback/offline mode.`);
    } else if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        console.warn(`Network Error in [${context}]. Switching to fallback.`);
    } else {
        console.error(`Gemini Error in [${context}]:`, error);
    }
};

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
      // ignore resume errors
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
      const timeoutPromise = new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error("Timeout")), 1200) // 1.2s timeout
      );

      const response = await Promise.race([
        ai.models.generateContent({
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
        }),
        timeoutPromise
      ]) as any;

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
    // High pitch + Fast rate = Young, lively, fun voice (less robotic)
    u.rate = 1.2; 
    u.pitch = 1.4; 
    window.speechSynthesis.speak(u);
};

export const playTextToSpeech = async (text: string) => {
  if (!text) return;
  const ctx = getAudioContext();
  
  // 1. Check Cache
  if (ctx && ttsCache.has(text)) {
      if (ctx.state === 'suspended') try { await ctx.resume(); } catch(e){}
      const buffer = ttsCache.get(text)!;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      return;
  }

  // 2. Check Pending - Wait for prefetch to finish
  if (ctx && pendingTTS.has(text)) {
      try {
          const buffer = await pendingTTS.get(text);
          if (buffer) {
            if (ctx.state === 'suspended') try { await ctx.resume(); } catch(e){}
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start();
            return;
          }
      } catch (e) { /* ignore */ }
  }

  // 3. Try to fetch fresh (GenAI) - Prioritize quality/consistency over browser TTS unless failed
  if (ctx) {
      if (ctx.state === 'suspended') try { await ctx.resume(); } catch(e){}
      const buffer = await getTTSAudioBuffer(text);
      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        return;
      }
  }

  // 4. Fallback to Browser
  if ('speechSynthesis' in window) {
      speakBrowser(text);
      return;
  }
};

// --- Image Helpers ---
export const getMiniGameImageUrl = (englishWord: string): string => {
  const term = englishWord.trim();
  return `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(term)}?width=300&height=300&model=flux&nologo=true&seed=${encodeURIComponent(term)}`;
};

export const getHangmanImageUrl = (hint: string): string => {
    const term = hint.trim();
    return `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(term)}?width=250&height=250&model=flux&nologo=true&seed=${encodeURIComponent(term)}`;
};

// --- Content Generators ---

export const generateLevelContent = async (vowel: VowelType, excludeWords: string[] = []): Promise<GameQuestion[]> => {
  const specificQuestions = VOWEL_SPECIFIC_FALLBACKS[vowel] || VOWEL_SPECIFIC_FALLBACKS[VowelType.KAMATZ];
  const available = specificQuestions.filter(q => !excludeWords.includes(q.word));
  const sourceList = available.length >= 5 ? available : specificQuestions;
  const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  return Promise.resolve(selected.map(q => ({ ...q, id: q.id + '-' + Date.now() })));
};

export const evaluatePronunciation = async (audioBlob: Blob, targetWord: string, childName: string = "Friend"): Promise<string> => {
  return "מְצוּיָן!";
};

export const generateSentenceQuestions = async (language: 'hebrew' | 'english' = 'hebrew', excludeList: string[] = []): Promise<SentenceQuestion[]> => {
  const getFallback = () => {
      const sourceList = language === 'english' ? FALLBACK_SENTENCES_ENGLISH : FALLBACK_SENTENCES;
      const available = sourceList.filter(s => !excludeList.includes(s.fullSentence));
      const pool = available.length >= 5 ? available : sourceList;
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5).map((s, i) => ({ id: `fallback-${Date.now()}-${i}`, ...s }));
  };
  return getFallback();
};

export const generateHangmanWords = async (language: 'hebrew' | 'english' = 'hebrew', excludeList: string[] = []): Promise<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]> => {
  const getFallback = () => {
      const fallbackSource = language === 'english' ? FALLBACK_HANGMAN_WORDS_ENGLISH : FALLBACK_HANGMAN_WORDS;
      const available = fallbackSource.filter(w => !excludeList.includes(w.word));
      const source = available.length >= 5 ? available : fallbackSource;
      const shuffled = [...source].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
  };
  return getFallback();
};

export const generateRhymeQuestions = async (excludeWords: string[] = []): Promise<RhymeQuestion[]> => {
    const getFallback = () => {
        // Filter out recent words
        let available = FALLBACK_RHYMES.filter(q => !excludeWords.includes(q.targetWord));
        
        // RECYCLE: If we ran out of unique rhymes, reset and use the full list again
        if (available.length === 0) {
            available = FALLBACK_RHYMES;
        }

        const shuffled = [...available].sort(() => 0.5 - Math.random());
        // Append unique ID to ensure React handles them as new questions
        return shuffled.slice(0, 5).map((q, i) => ({ ...q, id: `rhyme-${Date.now()}-${i}` }));
    };
    return getFallback();
};

export const generateReadingQuestions = async (excludeIds: string[] = [], language: 'hebrew' | 'english' = 'hebrew'): Promise<ReadingQuestion[]> => {
    // Select source based on language
    const sourceList = language === 'english' ? FALLBACK_READING_QUESTIONS_ENGLISH : FALLBACK_READING_QUESTIONS;

    // Filter out previously seen questions
    const available = sourceList.filter(q => !excludeIds.includes(q.id));
    
    // If all used, recycle from full list to prevent empty state
    const source = available.length > 0 ? available : sourceList;
    
    // Pick one random story
    const random = source[Math.floor(Math.random() * source.length)];
    
    return [random];
};

export const generateTongueTwister = async (): Promise<{hebrew: string, english: string}> => {
    return FALLBACK_TWISTERS[Math.floor(Math.random() * FALLBACK_TWISTERS.length)];
};

export const evaluateHandwriting = async (imageDataUrl: string, promptText: string): Promise<{isCorrect: boolean, feedback: string}> => {
    return { isCorrect: true, feedback: "Great effort!" };
};
