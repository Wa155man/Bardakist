

import { GoogleGenAI, Type } from "@google/genai";
import { GameQuestion, VowelType, SentenceQuestion, RhymeQuestion, ReadingQuestion } from "../types";
import { VOWEL_SPECIFIC_FALLBACKS, FALLBACK_TWISTERS, FALLBACK_SENTENCES, FALLBACK_SENTENCES_ENGLISH, FALLBACK_RHYMES } from "../constants";

const initializeGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Using fallback data.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to handle API errors gracefully (especially Quota Exceeded)
const handleGeminiError = (error: any, context: string) => {
    const msg = error?.message || error?.toString() || "";
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || error?.status === 'RESOURCE_EXHAUSTED') {
        console.warn(`Gemini Quota Exceeded in [${context}]. Switching to fallback/offline mode.`);
    } else {
        console.error(`Gemini Error in [${context}]:`, error);
    }
};

// Helper to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      // remove the prefix e.g. "data:audio/webm;base64,"
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
        audioContext = new AudioCtor({ sampleRate: 24000 });
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

// Helper to get buffer (cached or fetched)
const getTTSAudioBuffer = async (text: string): Promise<AudioBuffer | null> => {
  if (!text || !text.trim()) return null;

  // 1. Check Cache
  if (ttsCache.has(text)) return ttsCache.get(text)!;
  
  // 2. Check Pending Requests (Deduplication)
  if (pendingTTS.has(text)) return pendingTTS.get(text)!;

  const ai = initializeGenAI();
  if (!ai) return null; // Use fallback

  const fetchPromise = (async () => {
    try {
      const response = await ai.models.generateContent({
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
      });

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
      handleGeminiError(error, 'TTS Generation');
      return null;
    }
  })();

  pendingTTS.set(text, fetchPromise);
  
  // Cleanup pending map after completion
  fetchPromise.finally(() => pendingTTS.delete(text));
  
  return fetchPromise;
};

export const prefetchTTS = (text: string) => {
    getTTSAudioBuffer(text).catch(() => {});
};

export const playTextToSpeech = async (text: string) => {
  if (!text) return;
  
  const ctx = getAudioContext();
  
  // Try Gemini TTS if AudioContext is available
  if (ctx) {
      if (ctx.state === 'suspended') {
        try { await ctx.resume(); } catch(e) { console.error("Failed to auto-resume audio", e); }
      }

      const buffer = await getTTSAudioBuffer(text);

      if (buffer) {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
        return;
      }
  }

  // Fallback to browser TTS
  console.log("Using browser TTS fallback for:", text);
  
  if ('speechSynthesis' in window) {
      // Ensure previous speech is cancelled to prevent queueing issues
      window.speechSynthesis.cancel();
      
      const u = new SpeechSynthesisUtterance(text);
      u.lang = /[א-ת]/.test(text) ? 'he-IL' : 'en-US';
      window.speechSynthesis.speak(u);
  } else {
      console.warn("SpeechSynthesis API not available");
  }
};

// --- End Audio Helpers ---

// --- Image Helper ---
export const getMiniGameImageUrl = (englishWord: string): string => {
  const term = englishWord.trim();
  // Use 'flux' model for better/faster results
  // Use 'cartoon' + word for clear, simple images
  // Seed ensures consistency
  return `https://image.pollinations.ai/prompt/cartoon%20${encodeURIComponent(term)}?width=300&height=300&model=flux&nologo=true&seed=${encodeURIComponent(term)}`;
};
// --------------------

export const generateLevelContent = async (vowel: VowelType, excludeWords: string[] = []): Promise<GameQuestion[]> => {
  // To ensure instant loading as requested, we prioritize the local curated list.
  // This avoids the 3-5 second latency of the AI call.
  // The local lists in constants.ts are robust and error-free.
  
  const specificQuestions = VOWEL_SPECIFIC_FALLBACKS[vowel] || VOWEL_SPECIFIC_FALLBACKS[VowelType.KAMATZ];
  
  // Filter out already played words
  const available = specificQuestions.filter(q => !excludeWords.includes(q.word));
  
  // If we ran out of words, reset and use all of them again (circular buffer)
  const sourceList = available.length >= 5 ? available : specificQuestions;

  // Shuffle and pick unique 5
  const shuffled = [...sourceList].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 5);
  
  // Ensure new IDs so React re-renders components
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
      You are a friendly Hebrew teacher for children. 
      The child named "${childName}" is trying to say the word: "${targetWord}".
      Listen to the audio. 
      If it sounds reasonably close, give a very short, encouraging compliment in Hebrew (Nikud optional).
      Example: "כֹּל הַכָּבוֹד!" or "מְצוּיָן!" or "אַלּוּף!".
      If it is not clear, say "נְסֵה שׁוּב" (Try again) gently.
      Keep it under 4 words.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "audio/webm",
            data: base64Audio
          }
        },
        { text: prompt }
      ]
    });

    const feedback = response.text;
    return feedback || "יָפֶה מְאוֹד!";
  } catch (error) {
    handleGeminiError(error, 'Pronunciation Evaluation');
    return "כל הכבוד!"; // Fallback positive feedback
  }
};

export const generateSentenceQuestions = async (language: 'hebrew' | 'english' = 'hebrew', excludeList: string[] = []): Promise<SentenceQuestion[]> => {
  const ai = initializeGenAI();
  
  const getFallback = () => {
      const sourceList = language === 'english' ? FALLBACK_SENTENCES_ENGLISH : FALLBACK_SENTENCES;
      const safeList = sourceList || FALLBACK_SENTENCES; 
      
      const available = safeList.filter(s => !excludeList.includes(s.fullSentence));
      const listToUse = available.length >= 5 ? available : safeList;

      const shuffled = [...listToUse].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5).map((s, i) => ({ id: `fallback-${i}`, ...s }));
  };

  if (!ai) return getFallback();

  const exclusionText = excludeList.length > 0 ? `Do not use these sentences: ${excludeList.slice(-20).join('; ')}` : '';

  const prompt = language === 'english' ? `
    Generate 5 simple English sentences for children.
    Each sentence should have one missing word (fill in the blank).
    ${exclusionText}
    Provide: fullSentence, sentenceWithBlank (use ___), missingWord, distractors (3 wrong words), and translation (in Hebrew).
    Return JSON.
  ` : `
    Generate 5 simple Hebrew sentences for children.
    Each sentence should have one missing word (fill in the blank).
    ${exclusionText}
    Provide the full sentence, the sentence with "___" for the blank, the missing word, and 3 distractors (wrong words).
    Also provide English translation.
    Topics: Animals, Family, School, Nature, Emotions.
    Ensure strict Hebrew grammar and correct Nikud.
    Return JSON.
  `;

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
    if (!text) throw new Error("Empty response");
    const data = JSON.parse(text);
    return data.map((item: any, i: number) => ({ id: `sent-${Date.now()}-${i}`, ...item }));

  } catch (error) {
    handleGeminiError(error, 'Sentence Generation');
    return getFallback();
  }
};

export const generateHangmanWords = async (excludeList: string[] = []): Promise<{word: string, hint: string, hebrewHint: string, imagePrompt: string}[]> => {
  const ai = initializeGenAI();
  
  // Simple fallback if AI fails
  if (!ai) {
      return [
          { word: 'שֶׁמֶשׁ', hint: 'Sun', hebrewHint: 'כדור צהוב גדול בשמיים שמאיר ביום ומחמם אותנו', imagePrompt: 'sun' },
          { word: 'פַּרְפַּר', hint: 'Butterfly', hebrewHint: 'חיה קטנה עם כנפיים צבעוניות שעפה בין פרחים בגינה', imagePrompt: 'butterfly' },
          { word: 'כַּדּוּר', hint: 'Ball', hebrewHint: 'חפץ עגול שבועטים בו או זורקים אותו במשחק', imagePrompt: 'ball' },
          { word: 'בַּיִת', hint: 'House', hebrewHint: 'מקום עם קירות וגג שבו גרים אנשים ומשפחות', imagePrompt: 'house' },
          { word: 'גְּלִידָה', hint: 'Ice Cream', hebrewHint: 'קינוח קר, מתוק וטעים שאוכלים בגביע או בכוס בקיץ', imagePrompt: 'ice cream' }
      ].filter(w => !excludeList.includes(w.word));
  }

  const prompt = `
    Generate 5 simple Hebrew words for a Hangman game for kids.
    Words should be 3-6 letters long.
    Exclude these words: ${excludeList.join(', ')}.
    For each word provide:
    1. "word": The Hebrew word with Nikud.
    2. "hint": One word English hint (e.g. "Sun").
    3. "hebrewHint": A descriptive, child-friendly clue in Hebrew (with Nikud). Describe appearance, function, or context clearly so a child can guess it. It should be like a simple riddle. STRICTLY DO NOT use the target word or its root in the hint.
    4. "imagePrompt": A very simple English image prompt (3-4 words max, e.g. "yellow sun").
    Return JSON array.
  `;

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
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    handleGeminiError(error, 'Hangman Generation');
    // Return static fallback on error
    return [
       { word: 'פֶּרַח', hint: 'Flower', hebrewHint: 'הוא צומח באדמה, יש לו עלי כותרת צבעוניים וריח נעים', imagePrompt: 'flower' },
       { word: 'עֵץ', hint: 'Tree', hebrewHint: 'הוא גבוה וחזק, יש לו גזע וענפים ירוקים, וציפורים גרות בו', imagePrompt: 'tree' },
       { word: 'סֵפֶר', hint: 'Book', hebrewHint: 'יש לו דפים וכריכה, ואנחנו קוראים בו סיפורים מעניינים', imagePrompt: 'book' },
       { word: 'תַּפּוּחַ', hint: 'Apple', hebrewHint: 'פרי עגול ומתוק שגדל על העץ, יכול להיות אדום או ירוק', imagePrompt: 'apple' },
       { word: 'מְכוֹנִית', hint: 'Car', hebrewHint: 'כלי תחבורה עם ארבעה גלגלים שלוקח אותנו ממקום למקום', imagePrompt: 'car' }
    ];
  }
};

export const generateRhymeQuestions = async (excludeWords: string[] = []): Promise<RhymeQuestion[]> => {
  const ai = initializeGenAI();
  
  // Get 5 random UNIQUE questions from the large fallback list
  const getFallback = () => {
      // Filter out words already used in the current session (excludeWords)
      const available = FALLBACK_RHYMES.filter(q => !excludeWords.includes(q.targetWord));
      
      // Shuffle and pick 5
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 5).map((q, i) => ({ ...q, id: `fallback-rhyme-${Date.now()}-${i}` }));
  };

  if (!ai) return getFallback();

  const prompt = `
    Generate 5 Hebrew Rhyme questions for children.
    A rhyme is strictly defined linguistically: identity of sounds from the last stressed syllable to the end of the word.
    Prioritize "Superior Rhymes" (חרוז משובח) where at least 2 consonants/vowels match (e.g. Chalon-Balon).
    Accept "Simple Rhymes" (חרוז פשוט) only if accurate (e.g. Katan-Lavan).
    Reject weak rhymes that just end in the same letter but sound different.
    Exclude these target words: ${excludeWords.join(', ')}.
    For each question:
    - targetWord: The main word (with Nikud).
    - rhymeWord: The correct rhyming answer (with Nikud).
    - distractors: 3 words that DO NOT rhyme.
    - hint: English meaning of targetWord.
    Return JSON.
  `;

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
    if (!text) throw new Error("Empty response");
    const data = JSON.parse(text);
    return data.map((item: any, i: number) => ({ id: `rhyme-${Date.now()}-${i}`, ...item }));

  } catch (error) {
    handleGeminiError(error, 'Rhyme Generation');
    return getFallback();
  }
};

export const generateReadingQuestions = async (): Promise<ReadingQuestion[]> => {
  const ai = initializeGenAI();
  
  const fallback: ReadingQuestion[] = [{
      id: 'read-fb',
      passage: 'דָּנִי הָלַךְ לַגַּן. הוּא רָאָה פַּרְפַּר כָּחֹל. הַפַּרְפַּר עָף לַפֶּרַח הָאָדֹם.',
      question: 'לְאָן עָף הַפַּרְפַּר?',
      options: ['לַפֶּרַח הָאָדֹם', 'לַעֵץ הַגָּבוֹהַ', 'לַבַּיִת שֶׁל דָּנִי', 'לַשָּׁמַיִם'],
      correctAnswer: 'לַפֶּרַח הָאָדֹם'
  }];

  if (!ai) return fallback;

  const prompt = `
    Generate a Reading Comprehension task for a Hebrew learner (grade 2-3 level).
    1. "passage": A short story (3-4 sentences) in simple Hebrew with accurate Nikud. Strict grammar.
    2. "question": A simple question about the story.
    3. "options": 4 possible answers (1 correct, 3 wrong).
    4. "correctAnswer": The correct option text.
    Return JSON array with 1 item.
  `;

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
              passage: { type: Type.STRING },
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING }
            },
            required: ["passage", "question", "options", "correctAnswer"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    const data = JSON.parse(text);
    return data.map((item: any, i: number) => ({ id: `read-${Date.now()}-${i}`, ...item }));

  } catch (error) {
    handleGeminiError(error, 'Reading Generation');
    return fallback;
  }
};

export const generateTongueTwister = async (): Promise<{hebrew: string, english: string}> => {
  const ai = initializeGenAI();
  
  const fallback = FALLBACK_TWISTERS[Math.floor(Math.random() * FALLBACK_TWISTERS.length)];

  if (!ai) return fallback;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Generate a funny, difficult Hebrew tongue twister (with Nikud) and its English translation. Return JSON: { \"hebrew\": \"...\", \"english\": \"...\" }",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                hebrew: { type: Type.STRING },
                english: { type: Type.STRING }
            },
            required: ["hebrew", "english"]
        }
      }
    });
    
    const text = response.text;
    if (!text) return fallback;
    return JSON.parse(text);
  } catch (error) {
    handleGeminiError(error, 'Tongue Twister Generation');
    return fallback;
  }
};

export const evaluateHandwriting = async (imageDataUrl: string, promptText: string): Promise<{isCorrect: boolean, feedback: string}> => {
    const ai = initializeGenAI();
    if (!ai) return { isCorrect: true, feedback: "Nice work! (Offline Mode)" };

    try {
        const base64Image = imageDataUrl.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // Flash supports vision
            contents: [
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Image
                    }
                },
                {
                    text: `Analyze this handwriting image. The user was asked to write: "${promptText}". 
                    Is the handwriting legible and reasonably correct for a child? 
                    Return JSON: { "isCorrect": boolean, "feedback": "short hebrew feedback" }`
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

        const text = response.text;
        if (!text) return { isCorrect: false, feedback: "Error checking" };
        return JSON.parse(text);

    } catch (error) {
        handleGeminiError(error, 'Handwriting Evaluation');
        return { isCorrect: true, feedback: "Great effort!" };
    }
};
