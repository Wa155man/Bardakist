
import { LevelNode, VowelType, HebrewLetter, GameQuestion, RhymeQuestion, GuriReward, PetProfile, ReadingQuestion, SentenceQuestion } from './types';

// ... (Keep existing LEVEL_NODES, GURI_REWARDS, PETS, HEBREW_ALPHABET, ENGLISH_ALPHABET, VOWEL_SPECIFIC_FALLBACKS, FALLBACK_RHYMES, FALLBACK_TWISTERS, FALLBACK_SENTENCES, FALLBACK_SENTENCES_ENGLISH, FALLBACK_HANGMAN_WORDS, FALLBACK_HANGMAN_WORDS_ENGLISH as they were) ...

export const LEVEL_NODES: LevelNode[] = [
  {
    id: '1',
    name: 'קָמָץ - פַּתָח',
    vowel: VowelType.KAMATZ,
    description: 'לִמְדוּ אֶת הַצְּלִיל "אַ"',
    x: 50,
    y: 85,
    color: 'bg-orange-400',
    unlocked: true,
    stars: 0
  },
  {
    id: '2',
    name: 'חִירִיק',
    vowel: VowelType.CHIRIK,
    description: 'הַצְּלִיל הַמְּחַיֵּךְ "אִי"',
    x: 85,
    y: 60,
    color: 'bg-green-500',
    unlocked: true,
    stars: 0
  },
  {
    id: '3',
    name: 'סֶגּוֹל - צֵירֶה',
    vowel: VowelType.SEGOL,
    description: 'הַצְּלִיל "אֶ"',
    x: 50,
    y: 55,
    color: 'bg-blue-400',
    unlocked: true,
    stars: 0
  },
  {
    id: '4',
    name: 'חוֹלָם',
    vowel: VowelType.CHOLAM,
    description: 'הַצְּלִיל הָעָגֹל "אוֹ"',
    x: 30,
    y: 36,
    color: 'bg-yellow-400',
    unlocked: true,
    stars: 0
  },
  {
    id: '5',
    name: 'שׁוּרוּק - קֻבּוּץ',
    vowel: VowelType.SHURUK,
    description: 'הַצְּלִיל "אוּ"',
    x: 75,
    y: 30,
    color: 'bg-red-400',
    unlocked: true,
    stars: 0
  }
];

export const GURI_REWARDS: GuriReward[] = [
    { milestone: 100, message: "אוף, הייתי כל כך צמא! תודה על המשקה!", imagePrompt: "cute white maltipoo dog drinking water from a bowl happy cartoon style" },
    { milestone: 200, message: "הייתי ממש רעב, תודה רבה על האוכל!", imagePrompt: "cute white maltipoo dog eating a bone happy cartoon style" },
    { milestone: 300, message: "וואי אני עייף... אני הולך לישון עד ה-100 הבא.", imagePrompt: "cute white maltipoo dog sleeping in a bed cozy cartoon style" },
    { milestone: 400, message: "איזה כיף! בוא נשחק בכדור!", imagePrompt: "cute white maltipoo dog playing with a colorful ball cartoon style" },
    { milestone: 500, message: "אני מרגיש כמו מלך! תודה!", imagePrompt: "cute white maltipoo dog wearing a crown king cartoon style" },
    { milestone: 600, message: "וואו! אני טס לחלל! תראה אותי!", imagePrompt: "cute white maltipoo dog wearing astronaut suit in space cartoon style" },
    { milestone: 700, message: "אני צולל בים עם הדגים! איזה יופי!", imagePrompt: "cute white maltipoo dog scuba diving underwater with fish cartoon style" },
    { milestone: 800, message: "אני גיבור על! אני עף בשמיים!", imagePrompt: "cute white maltipoo dog wearing superhero cape flying cartoon style" },
    { milestone: 900, message: "מסיבת ריקודים! בואו לרקוד איתי!", imagePrompt: "cute white maltipoo dog dancing with disco ball party cartoon style" }
];

export const PETS: PetProfile[] = [
  {
    id: 'guri',
    name: 'Guri',
    nameHebrew: 'גּוּרִי',
    description: 'הכלבלב השמח',
    imagePrompt: 'cute white maltipoo puppy happy face cartoon sticker white background',
    voiceConfig: { pitch: 1.2, rate: 1.1, soundEffect: 'הַב הַב!' },
    rewards: GURI_REWARDS
  },
  {
    id: 'albert',
    name: 'Albert',
    nameHebrew: 'אַלְבֶּרְט',
    description: 'התוכי החכם',
    imagePrompt: 'cute white cockatoo parrot with yellow crest happy face cartoon sticker white background',
    voiceConfig: { pitch: 1.6, rate: 1.2, soundEffect: 'קְוָה קְוָה!' },
    rewards: GURI_REWARDS
  },
  {
    id: 'bungee',
    name: 'Bungee',
    nameHebrew: 'בַּנְגִ\'י',
    description: 'שועל הפנק המהיר',
    imagePrompt: 'cute fennec fox with large ears happy face cartoon sticker white background',
    voiceConfig: { pitch: 1.4, rate: 1.3, soundEffect: 'סְקְוִויק!' },
    rewards: GURI_REWARDS
  },
  {
    id: 'tedi',
    name: 'Tedi',
    nameHebrew: 'טֶדִי',
    description: 'הפנדה המתוק',
    imagePrompt: 'cute baby panda bear eating bamboo happy face cartoon sticker white background',
    voiceConfig: { pitch: 0.8, rate: 0.9, soundEffect: 'נְהָם!' },
    rewards: GURI_REWARDS
  }
];

export const HEBREW_ALPHABET: HebrewLetter[] = [
  { char: 'א', name: 'Aleph', nameHebrew: 'אָלֶף' },
  { char: 'ב', name: 'Bet', nameHebrew: 'בֵּית' },
  { char: 'ג', name: 'Gimel', nameHebrew: 'גִּימֶל' },
  { char: 'ד', name: 'Dalet', nameHebrew: 'דָּלֶת' },
  { char: 'ה', name: 'Hey', nameHebrew: 'הֵא' },
  { char: 'ו', name: 'Vav', nameHebrew: 'וָיו' },
  { char: 'ז', name: 'Zayin', nameHebrew: 'זַיִן' },
  { char: 'ח', name: 'Het', nameHebrew: 'חֵית' },
  { char: 'ט', name: 'Tet', nameHebrew: 'טֵית' },
  { char: 'י', name: 'Yud', nameHebrew: 'יוֹד' },
  { char: 'כ', name: 'Kaf', nameHebrew: 'כַּף' },
  { char: 'ל', name: 'Lamed', nameHebrew: 'לָמֶד' },
  { char: 'מ', name: 'Mem', nameHebrew: 'מֵם' },
  { char: 'נ', name: 'Nun', nameHebrew: 'נוּן' },
  { char: 'ס', name: 'Samekh', nameHebrew: 'סָמֶךְ' },
  { char: 'ע', name: 'Ayin', nameHebrew: 'עַיִן' },
  { char: 'פ', name: 'Pe', nameHebrew: 'פֵּא' },
  { char: 'צ', name: 'Tsadik', nameHebrew: 'צַדִּיק' },
  { char: 'ק', name: 'Kuf', nameHebrew: 'קוֹף' },
  { char: 'ר', name: 'Resh', nameHebrew: 'רֵישׁ' },
  { char: 'ש', name: 'Shin', nameHebrew: 'שִׁין' },
  { char: 'ת', name: 'Tav', nameHebrew: 'תָּיו' }
];

export const ENGLISH_ALPHABET: HebrewLetter[] = [
  ...Array.from({ length: 26 }, (_, i) => { const char = String.fromCharCode(65 + i); return { char, name: char, nameHebrew: char }; }),
  ...Array.from({ length: 26 }, (_, i) => { const char = String.fromCharCode(97 + i); return { char, name: char, nameHebrew: char }; })
];

export const VOWEL_SPECIFIC_FALLBACKS: Record<string, GameQuestion[]> = {
  [VowelType.KAMATZ]: [
    { id: 'k1', word: 'אַבָּא', correctTranslation: 'Dad', distractors: ['Mom', 'Brother', 'Grandpa'], imagePrompt: 'smiling father', hebrewHint: 'הוא ראש המשפחה, בן הזוג של אמא' },
    { id: 'k2', word: 'גַּן', correctTranslation: 'Garden', distractors: ['House', 'School', 'Street'], imagePrompt: 'flower garden', hebrewHint: 'מקום עם הרבה פרחים, עצים ודשא' },
    { id: 'k3', word: 'יָד', correctTranslation: 'Hand', distractors: ['Leg', 'Head', 'Finger'], imagePrompt: 'waving hand', hebrewHint: 'יש לנו שתיים כאלה, ובכל אחת חמש אצבעות' },
    { id: 'k4', word: 'חָלָב', correctTranslation: 'Milk', distractors: ['Water', 'Juice', 'Tea'], imagePrompt: 'milk carton glass', hebrewHint: 'משקה לבן שמגיע מהפרה, טוב לקורנפלקס' },
    { id: 'k5', word: 'נֵר', correctTranslation: 'Candle', distractors: ['Light', 'Sun', 'Fire'], imagePrompt: 'burning candle', hebrewHint: 'מדליקים אותו בשבת או ביום הולדת' }
  ],
  [VowelType.SHURUK]: [
    { id: 'u1', word: 'סוּס', correctTranslation: 'Horse', distractors: ['Cow', 'Sheep', 'Donkey'], imagePrompt: 'running horse', hebrewHint: 'חיה גדולה וחזקה שאפשר לרכוב עליה' },
    { id: 'u12', word: 'בַּקְבּוּק', correctTranslation: 'Bottle', distractors: ['Cup', 'Glass', 'Jug'], imagePrompt: 'water bottle', hebrewHint: 'כלי שיש בו מים או מיץ ואפשר לשתות ממנו' }
  ]
};

export const FALLBACK_RHYMES: RhymeQuestion[] = [
  { id: 'fr1', targetWord: 'חַלּוֹן', rhymeWord: 'בַּלּוֹן', distractors: ['שֻׁלְחָן', 'כִּסֵּא', 'בַּיִת'], hint: 'Window' },
  { id: 'fr2', targetWord: 'שׁוּעָל', rhymeWord: 'מַעְגָּל', distractors: ['זְאֵב', 'רִבּוּעַ', 'מְשֻׁלָּשׁ'], hint: 'Fox' },
  { id: 'fr3', targetWord: 'יָד', rhymeWord: 'כַּד', distractors: ['רֶגֶל', 'רֹאשׁ', 'בֶּטֶן'], hint: 'Hand' },
  { id: 'fr4', targetWord: 'פֶּרַח', rhymeWord: 'קֶרַח', distractors: ['עֵץ', 'דֶּשֶׁא', 'שֶׁמֶשׁ'], hint: 'Flower' },
  { id: 'fr5', targetWord: 'בַּיִת', rhymeWord: 'זַיִת', distractors: ['רְחוֹב', 'גַּג', 'דֶּלֶת'], hint: 'House' }
];

export const FALLBACK_TWISTERS = [
  { hebrew: 'שָׂרָה שָׁרָה שִׁיר שָׂמֵחַ', english: 'Sarah sang a happy song' },
  { hebrew: 'בַּקְבּוּק בְּלִי פְּקָק', english: 'A bottle without a cap' },
  { hebrew: 'גַּנָּן גִּדֵּל דָּגָן בַּגַּן', english: 'A gardener grew grain in the garden' },
  { hebrew: 'סָשָׁה שָׂם שׁוּם בַּסּוּשִׁי', english: 'Sasha put garlic in the sushi' }
];

export const FALLBACK_HANGMAN_WORDS = [
  { word: 'שָׁלוֹם', hint: 'Hello', hebrewHint: 'מילה שאומרים כשנפגשים', imagePrompt: 'waving hand hello' },
  { word: 'בַּיִת', hint: 'House', hebrewHint: 'מקום שגרים בו', imagePrompt: 'house' },
  { word: 'כֶּלֶב', hint: 'Dog', hebrewHint: 'חיה שנובחת', imagePrompt: 'dog' },
  { word: 'חָתוּל', hint: 'Cat', hebrewHint: 'חיה שמייללת', imagePrompt: 'cat' },
  { word: 'סֵפֶר', hint: 'Book', hebrewHint: 'קוראים בו סיפורים', imagePrompt: 'book' }
];

export const FALLBACK_HANGMAN_WORDS_ENGLISH = [
  { word: 'HELLO', hint: 'שלום', hebrewHint: 'Greeting', imagePrompt: 'waving hand hello' },
  { word: 'HOUSE', hint: 'בית', hebrewHint: 'Place to live', imagePrompt: 'house' },
  { word: 'DOG', hint: 'כלב', hebrewHint: 'Barks', imagePrompt: 'dog' },
  { word: 'CAT', hint: 'חתול', hebrewHint: 'Meows', imagePrompt: 'cat' },
  { word: 'BOOK', hint: 'ספר', hebrewHint: 'Read it', imagePrompt: 'book' }
];

export const FALLBACK_SENTENCES: SentenceQuestion[] = [
  { id: 's1', fullSentence: 'הַכַּדּוּר הוּא עָגֹל', sentenceWithBlank: 'הַכַּדּוּר הוּא ___', missingWord: 'עָגֹל', distractors: ['מְרֻבָּע', 'יָשָׁר', 'כָּחֹל'], translation: 'The ball is round' },
  // ... (Abbreviated for brevity)
];

export const FALLBACK_SENTENCES_ENGLISH: SentenceQuestion[] = [
  { id: 'es1', fullSentence: 'The sky is blue', sentenceWithBlank: 'The sky is ___', missingWord: 'blue', distractors: ['green', 'yellow', 'red'], translation: 'השמיים כחולים' },
  // ... (Abbreviated for brevity)
];

// --- 100 HEBREW READING QUESTIONS (GRAMMATICALLY CORRECT & SEMANTICALLY LOGICAL) ---
// Includes two types: Stories (3 sentences) and Riddles (Who am I?)
export const FALLBACK_READING_QUESTIONS: ReadingQuestion[] = (() => {
    const questions: ReadingQuestion[] = [];
    
    // 1. Data Definitions for Stories
    const subjects = [
        { name: 'דָּנִי', gender: 'M' }, { name: 'יוֹסִי', gender: 'M' }, { name: 'עוֹמֶר', gender: 'M' }, { name: 'גַּל', gender: 'M' }, { name: 'אִיתַי', gender: 'M' },
        { name: 'דָּנָה', gender: 'F' }, { name: 'נוֹעָה', gender: 'F' }, { name: 'תָּמָר', gender: 'F' }, { name: 'מָאיָה', gender: 'F' }, { name: 'רְוִיטַל', gender: 'F' }
    ];

    const actions = [
        { 
            verbM: 'אָכַל', verbF: 'אָכְלָה', 
            category: 'food',
            getQuestion: (s:string, gender: string) => `מָה ${gender === 'M' ? 'אָכַל' : 'אָכְלָה'} ${s}?`
        },
        { 
            verbM: 'לָבַשׁ', verbF: 'לָבְשָׁה', 
            category: 'clothes',
            getQuestion: (s:string, gender: string) => `מָה ${gender === 'M' ? 'לָבַשׁ' : 'לָבְשָׁה'} ${s}?`
        },
        { 
            verbM: 'קָנָה', verbF: 'קָנְתָה', 
            category: 'general',
            getQuestion: (s:string, gender: string) => `מָה ${gender === 'M' ? 'קָנָה' : 'קָנְתָה'} ${s}?`
        },
        { 
            verbM: 'רָאָה', verbF: 'רָאֲתָה', 
            category: 'animal',
            getQuestion: (s:string, gender: string) => `אֶת מִי ${gender === 'M' ? 'רָאָה' : 'רָאֲתָה'} ${s}?`
        },
        { 
            verbM: 'שִׂחֵק בְּ', verbF: 'שִׂחֲקָה בְּ', // Played with (using Be-)
            category: 'toy',
            getQuestion: (s:string, gender: string) => `בְּמָה ${gender === 'M' ? 'שִׂחֵק' : 'שִׂחֲקָה'} ${s}?`
        }
    ];

    const objects = [
        { name: 'תַּפּוּחַ', gender: 'M', category: 'food' },
        { name: 'בָּנָנָה', gender: 'F', category: 'food' },
        { name: 'פִּיצָה', gender: 'F', category: 'food' },
        { name: 'גְּלִידָה', gender: 'F', category: 'food' },
        { name: 'חֻלְצָה', gender: 'F', category: 'clothes' },
        { name: 'כּוֹבַע', gender: 'M', category: 'clothes' },
        { name: 'מְעִיל', gender: 'M', category: 'clothes' },
        { name: 'שִׁמְלָה', gender: 'F', category: 'clothes' },
        { name: 'כַּדּוּר', gender: 'M', category: 'toy' },
        { name: 'בֻּבָּה', gender: 'F', category: 'toy' },
        { name: 'מְכוֹנִית', gender: 'F', category: 'toy' },
        { name: 'כֶּלֶב', gender: 'M', category: 'animal' },
        { name: 'חָתוּל', gender: 'M', category: 'animal' },
        { name: 'אַרְנָב', gender: 'M', category: 'animal' },
        { name: 'צִפּוֹר', gender: 'F', category: 'animal' } 
    ];

    const adjectives = [
        { m: 'גָּדוֹל', f: 'גְּדוֹלָה' },
        { m: 'קָטָן', f: 'קְטַנָּה' },
        { m: 'יָפֶה', f: 'יָפָה' },
        { m: 'חָדָשׁ', f: 'חֲדָשָׁה' },
        { m: 'טָעִים', f: 'טְעִימָה' } // Special check needed for non-food
    ];

    const getObjectsByCategory = (cat: string) => objects.filter(o => cat === 'general' || o.category === cat);

    // --- TYPE 1: SHORT STORIES (Action Based) ---
    // Generate 60 Stories
    for (let i = 0; i < 60; i++) {
        const subj = subjects[i % subjects.length];
        const action = actions[i % actions.length];
        
        const validObjects = getObjectsByCategory(action.category);
        const obj = validObjects[i % validObjects.length];
        
        // Filter adjectives: Don't use "Tasty" for non-food
        let validAdjectives = adjectives;
        if (action.category !== 'food') {
            validAdjectives = adjectives.filter(a => a.m !== 'טָעִים');
        }
        const adj = validAdjectives[i % validAdjectives.length];
        
        // Construct Sentence parts
        const verb = subj.gender === 'M' ? action.verbM : action.verbF;
        
        // Object formatting: if verb ends in 'בְּ', join it. Else usually direct object 'אֶת הַ'.
        // "Played with the ball" -> "Shichek Ba-Kadur" (Be + Ha)
        let objectPhrase = `אֶת הַ${obj.name}`;
        if (verb.endsWith('בְּ')) {
             objectPhrase = `בַּ${obj.name}`; // Ba = Be + Ha
        } else if (verb.endsWith('עִם')) {
             objectPhrase = `עִם הַ${obj.name}`;
        }

        // Clean verb for sentence (remove preposition if needed for split, but here we kept them attached in definition except when combining)
        // Actually, if verb is "שִׂחֵק בְּ", and we add "בַּכַּדּוּר", we just remove the standalone 'בְּ' from verb string if we merge, 
        // OR we define verb as "שִׂחֵק" and handle preposition.
        // Simplified approach: The verb definitions above include the preposition.
        // So: "שִׂחֵק בְּ" + "בַּכַּדּוּר" is wrong. It should be "שִׂחֵק" + "בַּכַּדּוּר".
        // Let's strip the preposition from the verb for the sentence if we are using the 'Ba' form.
        
        let sentenceVerb = verb;
        let sentenceObj = `אֶת הַ${obj.name}`;
        
        if (action.category === 'toy') {
            // "Shichek ba-kadur"
            sentenceVerb = subj.gender === 'M' ? 'שִׂחֵק' : 'שִׂחֲקָה';
            sentenceObj = `בַּ${obj.name}`;
        }

        const was = obj.gender === 'M' ? 'הָיָה' : 'הָיְתָה';
        const adjForm = obj.gender === 'M' ? adj.m : adj.f;
        
        const subjHappy = subj.gender === 'M' ? 'שָׂמֵחַ' : 'שְׂמֵחָה';
        const wasSubj = subj.gender === 'M' ? 'הָיָה' : 'הָיְתָה';

        const passage = `${subj.name} ${sentenceVerb} ${sentenceObj}. הַ${obj.name} ${was} ${adjForm}. ${subj.name} ${wasSubj} ${subjHappy}.`;
        
        const question = action.getQuestion(subj.name, subj.gender);

        const correctAnswer = sentenceObj;

        // Distractors
        const otherObjs = objects.filter(o => o.name !== obj.name).sort(() => Math.random() - 0.5).slice(0, 3);
        const options = [correctAnswer, ...otherObjs.map(o => {
             if (action.category === 'toy') return `בַּ${o.name}`;
             return `אֶת הַ${o.name}`;
        })].sort(() => Math.random() - 0.5);

        questions.push({
            id: `story-${i}`,
            passage,
            question,
            options,
            correctAnswer
        });
    }

    // --- TYPE 2: RIDDLES (Logic Based) ---
    // Generate 40 Riddles
    const riddles = [
        { 
            clues: ['אֲנִי צָהֹב', 'אֲנִי זוֹרַחַת בַּשָּׁמַיִם', 'אֲנִי חַמָּה מְאוֹד'], 
            answer: 'שֶׁמֶשׁ', dist: ['יָרֵחַ', 'כּוֹכָב', 'עָנָן'] 
        },
        { 
            clues: ['אֲנִי גָּדוֹל', 'יֵשׁ לִי חֵדֶק אָרֹךְ', 'יֵשׁ לִי אָזְנַיִם גְּדוֹלוֹת'], 
            answer: 'פִּיל', dist: ['אַרְיֵה', 'נָמֵר', 'חָתוּל'] 
        },
        { 
            clues: ['יֵשׁ לִי 4 רַגְלַיִם', 'אֲנִי נוֹבֵחַ', 'אֲנִי הֶחָבֵר שֶׁל הָאָדָם'], 
            answer: 'כֶּלֶב', dist: ['חָתוּל', 'סוּס', 'פָּרָה'] 
        },
        { 
            clues: ['אֲנִי מְיַלֵּל', 'אֲנִי אוֹהֵב חָלָב', 'יֵשׁ לִי שָׂפָם'], 
            answer: 'חָתוּל', dist: ['כֶּלֶב', 'עַכְבָּר', 'צִפּוֹר'] 
        },
        { 
            clues: ['אֲנִי אָדֹם וְעָגֹל', 'יֵשׁ לִי מִיץ', 'אוֹכְלִים אוֹתִי בַּסָּלָט'], 
            answer: 'עַגְבָנִיָּה', dist: ['מְלָפְפוֹן', 'בָּנָנָה', 'לֶחֶם'] 
        },
        { 
            clues: ['אֲנִי יוֹרֵד מֵהַשָּׁמַיִם בַּחֹרֶף', 'אֲנִי רָטֹב', 'אֲנִי מַשְׁקֶה אֶת הַצְּמָחִים'], 
            answer: 'גֶּשֶׁם', dist: ['שֶׁמֶשׁ', 'רוּחַ', 'חוֹל'] 
        },
        { 
            clues: ['נוֹסְעִים בִּי', 'יֵשׁ לִי 4 גַּלְגַּלִּים', 'אֲנִי נוֹסַעַת עַל הַכְּבִישׁ'], 
            answer: 'מְכוֹנִית', dist: ['מָטוֹס', 'אֳנִיָּה', 'אוֹפַנַּיִם'] 
        },
        { 
            clues: ['קוֹרְאִים בִּי', 'יֵשׁ לִי דַּפִּים', 'יֵשׁ בִּי סִפּוּרִים'], 
            answer: 'סֵפֶר', dist: ['מַחְשֵׁב', 'טֵלֶוִיזְיָה', 'טֵלֵפוֹן'] 
        },
        { 
            clues: ['אֲנִי לָבָן וְקַר', 'בּוֹנִים מִמֶּנִּי אִישׁ שֶׁלֶג', 'אֲנִי יוֹרֵד בַּחֶרְמוֹן'], 
            answer: 'שֶׁלֶג', dist: ['גֶּשֶׁם', 'שֶׁמֶשׁ', 'חוֹל'] 
        },
        { 
            clues: ['אֲנִי גָּר בַּיָּם', 'אֲנִי שׂוֹחֶה', 'יֵשׁ לִי סְנַפִּירִים'], 
            answer: 'דָּג', dist: ['צִפּוֹר', 'כֶּלֶב', 'אַרְיֵה'] 
        }
    ];

    for (let i = 0; i < 40; i++) {
        const r = riddles[i % riddles.length];
        const passage = `${r.clues[0]}. ${r.clues[1]}. ${r.clues[2]}.`;
        const question = "מִי אֲנִי?"; // Who am I?
        const options = [r.answer, ...r.dist].sort(() => Math.random() - 0.5);
        
        questions.push({
            id: `riddle-${i}`,
            passage,
            question,
            options,
            correctAnswer: r.answer
        });
    }

    return questions.sort(() => Math.random() - 0.5);
})();

// --- 100 ENGLISH READING QUESTIONS (Mixed Stories and Logic) ---
export const FALLBACK_READING_QUESTIONS_ENGLISH: ReadingQuestion[] = (() => {
    const questions: ReadingQuestion[] = [];
    
    // --- STORIES ---
    const subjects = ['Tom', 'Lisa', 'Ben', 'Anna', 'Sam', 'Kate', 'Max', 'Emma', 'Dan', 'Mia'];
    const actions = [
        { verb: 'ate', cat: 'food' },
        { verb: 'bought', cat: 'item' },
        { verb: 'saw', cat: 'animal' },
        { verb: 'wore', cat: 'clothes' },
        { verb: 'found', cat: 'item' }
    ];
    
    const items = [
        { name: 'apple', cat: 'food' }, { name: 'cake', cat: 'food' }, { name: 'pizza', cat: 'food' },
        { name: 'shirt', cat: 'clothes' }, { name: 'hat', cat: 'clothes' }, { name: 'coat', cat: 'clothes' },
        { name: 'dog', cat: 'animal' }, { name: 'cat', cat: 'animal' }, { name: 'bird', cat: 'animal' },
        { name: 'ball', cat: 'item' }, { name: 'book', cat: 'item' }, { name: 'pen', cat: 'item' }
    ];
    const adjectives = ['big', 'small', 'red', 'blue', 'nice', 'new'];

    for(let i=0; i<60; i++) {
        const s = subjects[i % subjects.length];
        const act = actions[i % actions.length];
        const validItems = items.filter(it => act.cat === 'item' || it.cat === act.cat);
        const obj = validItems[i % validItems.length];
        const adj = adjectives[i % adjectives.length];
        
        const passage = `${s} ${act.verb} a ${obj.name}. The ${obj.name} was ${adj}. ${s} was happy.`;
        const question = `What did ${s} ${act.verb === 'wore' ? 'wear' : act.verb === 'saw' ? 'see' : act.verb === 'ate' ? 'eat' : act.verb === 'bought' ? 'buy' : 'find'}?`;
        
        const answer = `A ${obj.name}`;
        const dists = items.filter(it => it.name !== obj.name).sort(()=>Math.random()-0.5).slice(0,3).map(it => `A ${it.name}`);
        
        questions.push({
            id: `en-story-${i}`,
            passage, question,
            options: [answer, ...dists].sort(()=>Math.random()-0.5),
            correctAnswer: answer
        });
    }

    // --- RIDDLES ---
    const enRiddles = [
        { clues: ["I am hot", "I am in the sky", "I am yellow"], ans: "The Sun", dist: ["The Moon", "A Cloud", "Rain"] },
        { clues: ["I have 4 legs", "I bark", "I like bones"], ans: "A Dog", dist: ["A Cat", "A Bird", "A Fish"] },
        { clues: ["I am a fruit", "I am red or green", "I am round"], ans: "An Apple", dist: ["A Banana", "A Carrot", "Bread"] },
        { clues: ["You wear me", "I go on your head", "I protect from sun"], ans: "A Hat", dist: ["Shoes", "A Shirt", "Pants"] },
        { clues: ["I have pages", "You read me", "I have stories"], ans: "A Book", dist: ["A Phone", "A TV", "A Ball"] }
    ];

    for(let i=0; i<40; i++) {
        const r = enRiddles[i % enRiddles.length];
        questions.push({
            id: `en-riddle-${i}`,
            passage: `${r.clues[0]}. ${r.clues[1]}. ${r.clues[2]}.`,
            question: "Who am I?",
            options: [r.ans, ...r.dist].sort(()=>Math.random()-0.5),
            correctAnswer: r.ans
        });
    }

    return questions.sort(()=>Math.random()-0.5);
})();
