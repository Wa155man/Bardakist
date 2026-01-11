
import { GoogleGenAI, Type } from "@google/genai";
import { GameQuestion, VowelType, SentenceQuestion, RhymeQuestion, ReadingQuestion } from "../types";
import { VOWEL_SPECIFIC_FALLBACKS, FALLBACK_TWISTERS, FALLBACK_SENTENCES, FALLBACK_SENTENCES_ENGLISH, FALLBACK_RHYMES, FALLBACK_HANGMAN_WORDS, FALLBACK_HANGMAN_WORDS_ENGLISH, FALLBACK_READING_QUESTIONS, FALLBACK_READING_QUESTIONS_ENGLISH } from "../constants";

// Rule: API key must be obtained exclusively from process.env.API_KEY
const initializeGenAI = () => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return null;
  if (!process.env.API_KEY) return null;
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// --- SILENT RESILIENCY WRAPPER ---
/**
 * Executes an AI call but catches Quota/Rate Limit errors and returns a default "Success" state.
 * This ensures children never see a technical error message.
 */
async function safeAICall<T>(call: () => Promise<T>, fallback: T): Promise<T> {
    try {
        return await call();
    } catch (error: any) {
        console.warn("AI Service unavailable or limited. Using silent fallback.", error?.message);
        return fallback;
    }
}

// --- BINARY IMAGE CACHE SYSTEM ---
const imageBlobCache = new Map<string, string>();
const pendingImageFetches = new Map<string, Promise<string>>();

/**
 * Downloads an image as a Blob and stores a local Object URL.
 * Added a dynamic seed to bypass anonymous tier cache limits.
 */
export const prefetchImage = async (prompt: string): Promise<string> => {
    const cacheKey = prompt.trim().toLowerCase();
    if (imageBlobCache.has(cacheKey)) return imageBlobCache.get(cacheKey)!;
    if (pendingImageFetches.has(cacheKey)) return pendingImageFetches.get(cacheKey)!;

    const fetchPromise = (async () => {
        try {
            // Random seed helps bypass some "anonymous tier" throttling
            const randomSeed = Math.floor(Math.random() * 1000000);
            const url = `https://image.pollinations.ai/prompt/simple%20cartoon%20sticker%20${encodeURIComponent(prompt)}?width=400&height=400&model=flux&nologo=true&nofeed=true&safe=true&seed=${randomSeed}`;
            const response = await fetch(url);
            if (!response.ok) throw new Error("Fetch failed");
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            imageBlobCache.set(cacheKey, blobUrl);
            return blobUrl;
        } catch (e) {
            console.warn("Image prefetch failed:", e);
            return "";
        }
    })();

    pendingImageFetches.set(cacheKey, fetchPromise);
    return fetchPromise;
};

export const getCachedImageUrl = (prompt: string): string => {
    const cacheKey = prompt.trim().toLowerCase();
    const cached = imageBlobCache.get(cacheKey);
    if (cached) return cached;
    
    // If not cached, provide a URL with a stable seed based on the string
    const stableSeed = Array.from(prompt).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://image.pollinations.ai/prompt/simple%20cartoon%20sticker%20${encodeURIComponent(prompt)}?width=400&height=400&model=flux&nologo=true&nofeed=true&safe=true&seed=${stableSeed}`;
};

export const getMiniGameImageUrl = (prompt: string): string => getCachedImageUrl(prompt);
export const getHangmanImageUrl = (prompt: string): string => getCachedImageUrl(prompt);

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
    } catch (e) {}
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

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) return null;

      const ctx = getAudioContext();
      if (!ctx) return null;

      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      ttsCache.set(text, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn("TTS Quota or Error reached. Falling back to local.", error?.message);
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

export const playTextToSpeech = async (text: string) => {
  if (!text) return;
  const ctx = getAudioContext();
  
  if (ctx && ttsCache.has(text)) {
      if (ctx.state === 'suspended') try { await ctx.resume(); } catch(e){}
      const buffer = ttsCache.get(text)!;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      return;
  }

  // Fallback to browser TTS if Gemini TTS is unavailable or fetching
  if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = /[א-ת]/.test(text) ? 'he-IL' : 'en-US';
      window.speechSynthesis.speak(u);
  }
  prefetchTTS(text);
};

export const generateLevelContent = async (vowel: VowelType, excludeWords: string[] = []): Promise<GameQuestion[]> => {
  const specificQuestions = VOWEL_SPECIFIC_FALLBACKS[vowel] || VOWEL_SPECIFIC_FALLBACKS[VowelType.KAMATZ];
  let available = specificQuestions.filter(q => !excludeWords.includes(q.word));
  if (available.length < 5) {
      available = specificQuestions.filter(q => !excludeWords.slice(-3).includes(q.word));
      if (available.length === 0) available = specificQuestions;
  }
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  selected.forEach(q => prefetchImage(q.correctTranslation));
  return Promise.resolve(selected.map(q => ({ ...q, id: q.id + '-' + Date.now() })));
};

/**
 * Silent safety for pronunciation.
 */
export const evaluatePronunciation = async (audioBlob: Blob, targetWord: string): Promise<{grade: string, isExcellent: boolean}> => {
  const ai = initializeGenAI();
  if (!ai) return { grade: "מַאֲמָץ נֶהְדָּר!", isExcellent: true };

  return safeAICall(async () => {
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
            const base64data = (reader.result as string).split(',')[1];
            resolve(base64data);
        };
    });
    reader.readAsDataURL(audioBlob);
    const base64Audio = await base64Promise;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Audio, mimeType: audioBlob.type } },
            { text: `Evaluate child pronunciation for the Hebrew word: "${targetWord}". JSON: { isExcellent: boolean, feedback: string }` }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isExcellent: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          },
          required: ["isExcellent", "feedback"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return {
        grade: result.feedback || "מַאֲמָץ יָפֶה!",
        isExcellent: result.isExcellent ?? false
    };
  }, { grade: "יוֹפִי שֶׁל מַאֲמָץ!", isExcellent: true });
};

export const generateSentenceQuestions = async (language: 'hebrew' | 'english' = 'hebrew', excludeList: string[] = []): Promise<SentenceQuestion[]> => {
  const sourceList = language === 'english' ? FALLBACK_SENTENCES_ENGLISH : FALLBACK_SENTENCES;
  let available = sourceList.filter(s => !excludeList.includes(s.fullSentence));
  if (available.length < 5) available = sourceList;
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 5).map((s, i) => ({ id: `fallback-${Date.now()}-${i}`, ...s }));
};

export const generateHangmanWords = async (language: 'hebrew' | 'english' = 'hebrew', excludeList: string[] = []): Promise<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]> => {
  const fallbackSource = language === 'english' ? FALLBACK_HANGMAN_WORDS_ENGLISH : FALLBACK_HANGMAN_WORDS;
  let available = fallbackSource.filter(w => !excludeList.includes(w.word));
  if (available.length < 5) available = fallbackSource;
  const shuffled = [...available].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  selected.forEach(w => prefetchImage(w.imagePrompt || w.hint));
  return selected;
};

export const generateRhymeQuestions = async (excludeWords: string[] = []): Promise<RhymeQuestion[]> => {
    let available = FALLBACK_RHYMES.filter(q => !excludeWords.includes(q.targetWord));
    if (available.length < 5) available = FALLBACK_RHYMES;
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 20).map((q, i) => ({ ...q, id: `rhyme-${Date.now()}-${i}` }));
};

export const generateReadingQuestions = async (excludeIds: string[] = [], language: 'hebrew' | 'english' = 'hebrew'): Promise<ReadingQuestion[]> => {
    const sourceList = language === 'english' ? FALLBACK_READING_QUESTIONS_ENGLISH : FALLBACK_READING_QUESTIONS;
    let available = sourceList.filter(q => !excludeIds.includes(q.id));
    if (available.length < 5) available = sourceList;
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
};

export const generateTongueTwister = async (): Promise<{hebrew: string, english: string}> => {
    return FALLBACK_TWISTERS[Math.floor(Math.random() * FALLBACK_TWISTERS.length)];
};

export const evaluateHandwriting = async (imageDataUrl: string, targetChar: string): Promise<{isCorrect: boolean, feedback: string}> => {
    const ai = initializeGenAI();
    if (!ai) return { isCorrect: true, feedback: "מַאֲמָץ נֶהְדָּר!" };

    return safeAICall(async () => {
        const base64Data = imageDataUrl.split(',')[1];
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [
                {
                    parts: [
                        { text: `Grade child handwriting of letter: "${targetChar}". JSON: {isCorrect: boolean, feedback: string}` },
                        { inlineData: { mimeType: "image/png", data: base64Data } }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isCorrect: { type: Type.BOOLEAN },
                        feedback: { type: Type.STRING }
                    },
                    required: ["isCorrect", "feedback"]
                }
            }
        });

        const result = JSON.parse(response.text);
        return { isCorrect: result.isCorrect ?? true, feedback: result.feedback ?? "מְצֻיָּן!" };
    }, { isCorrect: true, feedback: "מַאֲמָץ יָפֶה!" });
};
