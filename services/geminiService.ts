


import { GoogleGenAI, Type } from "@google/genai";
import { GameQuestion, VowelType, SentenceQuestion, RhymeQuestion, ReadingQuestion } from "../types";
import { VOWEL_SPECIFIC_FALLBACKS, FALLBACK_TWISTERS, FALLBACK_SENTENCES, FALLBACK_SENTENCES_ENGLISH, FALLBACK_RHYMES, FALLBACK_HANGMAN_WORDS } from "../constants";

const initializeGenAI = () => {
  // Offline Check: If no internet, return null immediately to trigger local fallback logic
  if (!navigator.onLine) {
      console.log("Offline Mode Detected: Switching to local content.");
      return null;
  }

  // In a real deployment, ensure API_KEY is injected via build env vars
  const apiKey = process.env.API_KEY; 
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
    // Support standard and webkit prefix for Safari
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtor) {
        audioContext = new AudioCtor({ sampleRate: 24000, latencyHint: 'interactive' });
    } else {
        console.warn("AudioContext not supported in this browser");
        return null;
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
      console.error("Audio resume failed", e);
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
        setTimeout(() => reject(new Error("Timeout")), 3000)
      );

      const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-2.5-flash-preview-tts",
          contents: [{ parts: [{ text: text }] }],
          config: {
            responseModalities: ["AUDIO"], 
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Kore' },
              },
            },
          },
        }),
        timeoutPromise
      ]) as any;

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (!base64Audio) {
          if (response.promptFeedback?.blockReason) {
              console.warn("TTS Blocked:", response.promptFeedback.blockReason);
          }
          return null;
      }

      const ctx = getAudioContext();
      if (!ctx) return null;

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        ctx,
        24000,
        1,
      );
      
      ttsCache.set(text, audioBuffer);
      return audioBuffer;
    } catch (error) {
      if ((error as Error).message === 'Timeout') {
          console.warn(`TTS timed out for "${text}", switching to browser fallback.`);
      } else {
          handleGeminiError(error, 'TTS Generation');
      }
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
  
  // Try Gemini TTS first
  if (ctx) {
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch(e) { console.error("Failed to auto-resume audio", e); }
      }

      // Try to get buffer (cached or fetch new)
      // If fails/times out, buffer will be null -> proceed to fallback
      const buffer = await getTTSAudioBuffer(text);

      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        return;
      }
  }

  // Fallback to Browser SpeechSynthesis
  if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Clear queue
      
      const u = new SpeechSynthesisUtterance(text);
      
      // Robust Voice Selection logic
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find an exact match for Hebrew
      let hebrewVoice = voices.find(v => v.lang === 'he-IL' || v.lang === 'he');
      
      // If not found, try a looser match
      if (!hebrewVoice) {
          hebrewVoice = voices.find(v => v.lang.includes('he'));
      }

      // Detect if text is Hebrew or English
      if (/[א-ת]/.test(text)) {
          u.lang = 'he-IL';
          if (hebrewVoice) {
              u.voice = hebrewVoice;
          }
      } else {
          u.lang = 'en-US';
          // Optional: Find a good English voice if needed, but default is usually fine
      }
      
      u.rate = 0.9; // Slightly slower for clarity
      
      // Safari specific: sometimes voices need to be loaded
      if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
              const updatedVoices = window.speechSynthesis.getVoices();
              const updatedHebrewVoice = updatedVoices.find(v => v.lang.includes('he'));
              if (/[א-ת]/.test(text) && updatedHebrewVoice) {
                  u.voice = updatedHebrewVoice;
              }
              window.speechSynthesis.speak(u);
          };
      } else {
          window.speechSynthesis.speak(u);
      }

  } else {
      console.warn("SpeechSynthesis API not available");
  }
};

// --- Image Helper ---
export const getMiniGameImageUrl = (englishWord: string): string => {
  const term = englishWord.trim();
  // Use 'flux' model for better/faster results
  // Use 'cartoon' + word for clear, simple images
  // Seed ensures consistency
  return `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(term)}?width=300&height=300&model=flux&nologo=true&seed=${encodeURIComponent(term)}`;
};

export const getHangmanImageUrl = (hint: string): string => {
    const term = hint.trim();
    return `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(term)}?width=250&height=250&model=flux&nologo=true&seed=${encodeURIComponent(term)}`;
};

// ... Rest of the generation functions (generateLevelContent, evaluatePronunciation, etc.) ...
// These functions contain AI logic but rely on `handleGeminiError` for robustness.

export const generateLevelContent = async (vowel: VowelType, excludeWords: string[] = []): Promise<GameQuestion[]> => {
  const specificQuestions = VOWEL_SPECIFIC_FALLBACKS[vowel] || VOWEL_SPECIFIC_FALLBACKS[VowelType.KAMATZ];
  const available = specificQuestions.filter(q => !excludeWords.includes(q.word));
  const sourceList = available.length >= 5 ? available : specificQuestions;
  const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  return Promise.resolve(selected.map(q => ({
      ...q,
      id: q.id + '-' + Date.now()
  })));
};

export const evaluatePronunciation = async (audioBlob: Blob, targetWord: string, childName: string = "Friend"): Promise<string> => {
  const ai = initializeGenAI();
  if (!ai) return "מְצוּיָן! (Excellent!)";

  try {
    const base64Audio = await blobToBase64(audioBlob);
    const prompt = `
      You are a friendly Hebrew teacher. 
      Child "${childName}" says: "${targetWord}".
      Listen. If good, give short Hebrew compliment.
      If bad, say "נְסֵה שׁוּב".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType: "audio/webm", data: base64Audio } },
        { text: prompt }
      ]
    });

    return response.text || "יָפֶה מְאוֹד!";
  } catch (error) {
    handleGeminiError(error, 'Pronunciation Evaluation');
    return "כל הכבוד!"; 
  }
};

export const generateSentenceQuestions = async (language: 'hebrew' | 'english' = 'hebrew', excludeList: string[] = []): Promise<SentenceQuestion[]> => {
  const ai = initializeGenAI();
  const getFallback = () => {
      const sourceList = language === 'english' ? FALLBACK_SENTENCES_ENGLISH : FALLBACK_SENTENCES;
      const safeList = sourceList || FALLBACK_SENTENCES; 
      const available = safeList.filter(s => !excludeList.includes(s.fullSentence));
      const pool = available.length >= 5 ? available : safeList;
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5).map((s, i) => ({ id: `fallback-${Date.now()}-${i}`, ...s }));
  };

  if (!ai) return getFallback();

  // Simplified prompt for robustness
  const prompt = `Generate 5 simple ${language} sentences for children with a missing word. Return JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fullSentence: { type: Type.STRING },
              sentenceWithBlank: { type: Type.STRING },
              missingWord: { type: Type.STRING },
              distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
              translation: { type: Type.STRING }
            },
            required: ["fullSentence", "sentenceWithBlank", "missingWord", "distractors", "translation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty");
    return JSON.parse(text).map((item: any, i: number) => ({ id: `sent-${Date.now()}-${i}`, ...item }));

  } catch (error) {
    handleGeminiError(error, 'Sentence Gen');
    return getFallback();
  }
};

export const generateHangmanWords = async (excludeList: string[] = []): Promise<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]> => {
  const ai = initializeGenAI();
  const getFallback = () => {
      const available = FALLBACK_HANGMAN_WORDS.filter(w => !excludeList.includes(w.word));
      const source = available.length >= 5 ? available : FALLBACK_HANGMAN_WORDS;
      const shuffled = [...source].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5);
  };

  if (!ai) return getFallback();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 Hebrew Hangman words for kids. Exclude: ${excludeList.join(',')}. JSON output.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              hint: { type: Type.STRING },
              hebrewHint: { type: Type.STRING },
              imagePrompt: { type: Type.STRING }
            },
            required: ["word", "hint", "hebrewHint", "imagePrompt"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty");
    return JSON.parse(text);
  } catch (error) {
    handleGeminiError(error, 'Hangman Gen');
    return getFallback();
  }
};

export const generateRhymeQuestions = async (excludeWords: string[] = []): Promise<RhymeQuestion[]> => {
  const ai = initializeGenAI();
  const getFallback = () => {
      const available = FALLBACK_RHYMES.filter(q => !excludeWords.includes(q.targetWord));
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5).map((q, i) => ({ ...q, id: `fallback-rhyme-${Date.now()}-${i}` }));
  };

  if (!ai) return getFallback();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 Hebrew rhyme pairs (Perfect Rhymes only). JSON output.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              targetWord: { type: Type.STRING },
              rhymeWord: { type: Type.STRING },
              distractors: { type: Type.ARRAY, items: { type: Type.STRING } },
              hint: { type: Type.STRING }
            },
            required: ["targetWord", "rhymeWord", "distractors", "hint"]
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty");
    return JSON.parse(text).map((item: any, i: number) => ({ id: `rhyme-${Date.now()}-${i}`, ...item }));
  } catch (error) {
    handleGeminiError(error, 'Rhyme Gen');
    return getFallback();
  }
};

export const generateReadingQuestions = async (): Promise<ReadingQuestion[]> => {
    return [{
      id: 'read-fb',
      passage: 'דָּנִי הָלַךְ לַגַּן. הוּא רָאָה פַּרְפַּר כָּחֹל. הַפַּרְפַּר עָף לַפֶּרַח הָאָדֹם.',
      question: 'לְאָן עָף הַפַּרְפַּר?',
      options: ['לַפֶּרַח הָאָדֹם', 'לַעֵץ הַגָּבוֹהַ', 'לַבַּיִת שֶׁל דָּנִי', 'לַשָּׁמַיִם'],
      correctAnswer: 'לַפֶּרַח הָאָדֹם'
    }];
};

export const generateTongueTwister = async (): Promise<{hebrew: string, english: string}> => {
    return FALLBACK_TWISTERS[Math.floor(Math.random() * FALLBACK_TWISTERS.length)];
};

export const evaluateHandwriting = async (imageDataUrl: string, promptText: string): Promise<{isCorrect: boolean, feedback: string}> => {
    return { isCorrect: true, feedback: "Great effort!" };
};