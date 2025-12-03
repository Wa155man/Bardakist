
import { LevelNode, VowelType, HebrewLetter, GameQuestion, RhymeQuestion, GuriReward, PetProfile, ReadingQuestion } from './types';

// ... existing LEVEL_NODES ...
export const LEVEL_NODES: LevelNode[] = [
  {
    id: '1',
    name: 'קָמָץ - פַּתָח',
    vowel: VowelType.KAMATZ,
    description: 'לִמְדוּ אֶת הַצְּלִיל "אַ"',
    x: 50, // Center bottom
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
    x: 85, // Moved Right
    y: 60, // Moved Higher
    color: 'bg-green-500',
    unlocked: true,
    stars: 0
  },
  {
    id: '3',
    name: 'סֶגּוֹל - צֵירֶה',
    vowel: VowelType.SEGOL,
    description: 'הַצְּלִיל "אֶ"',
    x: 50, // Center
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
    x: 30, // Left
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
    x: 75, // Right
    y: 30, // Lower
    color: 'bg-red-400',
    unlocked: true,
    stars: 0
  }
];

export const PETS: PetProfile[] = [
  {
    id: 'guri',
    name: 'Guri',
    nameHebrew: 'גּוּרִי',
    description: 'הכלבלב השמח',
    imagePrompt: 'cute white maltipoo puppy happy face cartoon sticker white background',
    voiceConfig: {
      pitch: 1.2,
      rate: 1.1,
      soundEffect: 'הַב הַב!'
    },
    rewards: [
        { milestone: 100, message: "אוף, הייתי כל כך צמא! תודה על המשקה!", imagePrompt: "cute white maltipoo dog drinking water from a bowl happy cartoon style" },
        { milestone: 200, message: "הייתי ממש רעב, תודה רבה על האוכל!", imagePrompt: "cute white maltipoo dog eating a bone happy cartoon style" },
        { milestone: 300, message: "וואי אני עייף... אני הולך לישון עד ה-100 הבא.", imagePrompt: "cute white maltipoo dog sleeping in a bed cozy cartoon style" },
        { milestone: 400, message: "איזה כיף! בוא נשחק בכדור!", imagePrompt: "cute white maltipoo dog playing with a colorful ball cartoon style" },
        { milestone: 500, message: "אני מרגיש כמו מלך! תודה!", imagePrompt: "cute white maltipoo dog wearing a crown king cartoon style" },
        { milestone: 600, message: "וואו! אני טס לחלל! תראה אותי!", imagePrompt: "cute white maltipoo dog wearing astronaut suit in space cartoon style" },
        { milestone: 700, message: "אני צולל בים עם הדגים! איזה יופי!", imagePrompt: "cute white maltipoo dog scuba diving underwater with fish cartoon style" },
        { milestone: 800, message: "אני גיבור על! אני עף בשמיים!", imagePrompt: "cute white maltipoo dog wearing superhero cape flying cartoon style" },
        { milestone: 900, message: "מסיבת ריקודים! בואו לרקוד איתי!", imagePrompt: "cute white maltipoo dog dancing with disco ball party cartoon style" }
    ]
  },
  {
    id: 'albert',
    name: 'Albert',
    nameHebrew: 'אַלְבֶּרְט',
    description: 'התוכי החכם',
    imagePrompt: 'cute white cockatoo parrot with yellow crest happy face cartoon sticker white background',
    voiceConfig: {
      pitch: 1.6,
      rate: 1.2,
      soundEffect: 'קְוָה קְוָה!'
    },
    rewards: [
      { milestone: 100, message: "קווה! מים קרים! תודה!", imagePrompt: "cute white cockatoo parrot drinking water cartoon style" },
      { milestone: 200, message: "גרעינים! האוכל האהוב עליי!", imagePrompt: "cute white cockatoo parrot eating seeds cartoon style" },
      { milestone: 300, message: "ששש... התוכי ישן...", imagePrompt: "cute white cockatoo parrot sleeping on perch cartoon style" },
      { milestone: 400, message: "אני עף גבוה בשמיים!", imagePrompt: "cute white cockatoo parrot flying in sky cartoon style" },
      { milestone: 500, message: "אני מלך התוכים!", imagePrompt: "cute white cockatoo parrot wearing golden crown cartoon style" },
      { milestone: 600, message: "תוכי בחלל! 3... 2... 1... המראה!", imagePrompt: "cute white cockatoo parrot in space suit cartoon style" },
      { milestone: 700, message: "צוללת צהובה ותוכי לבן!", imagePrompt: "cute white cockatoo parrot underwater with snorkel cartoon style" },
      { milestone: 800, message: "סופר-תוכי להצלה!", imagePrompt: "cute white cockatoo parrot with red cape flying hero cartoon style" },
      { milestone: 900, message: "קווה קווה! מסיבת ריקודים!", imagePrompt: "cute white cockatoo parrot dancing disco cartoon style" }
    ]
  },
  {
    id: 'bungee',
    name: 'Bungee',
    nameHebrew: 'בַּנְגִ\'י',
    description: 'שועל הפנק המהיר',
    imagePrompt: 'cute fennec fox with large ears happy face cartoon sticker white background',
    voiceConfig: {
      pitch: 1.4,
      rate: 1.3,
      soundEffect: 'סְקְוִויק!'
    },
    rewards: [
      { milestone: 100, message: "מים במדבר! תודה רבה!", imagePrompt: "cute fennec fox drinking water desert cartoon style" },
      { milestone: 200, message: "יאמי! חרקים טעימים!", imagePrompt: "cute fennec fox eating snack cartoon style" },
      { milestone: 300, message: "אני מתחפר בחול לישון...", imagePrompt: "cute fennec fox sleeping curled up cartoon style" },
      { milestone: 400, message: "תראו אותי רץ מהר!", imagePrompt: "cute fennec fox running fast blur cartoon style" },
      { milestone: 500, message: "אני שליט הדיונות!", imagePrompt: "cute fennec fox wearing crown desert cartoon style" },
      { milestone: 600, message: "שועל חלל! האוזניים שלי קולטות חייזרים!", imagePrompt: "cute fennec fox astronaut cartoon style" },
      { milestone: 700, message: "שועל ים! אני שוחה!", imagePrompt: "cute fennec fox swimming underwater cartoon style" },
      { milestone: 800, message: "סופר-בנג'י! אני טס!", imagePrompt: "cute fennec fox superhero flying cartoon style" },
      { milestone: 900, message: "מסיבת דיונות!", imagePrompt: "cute fennec fox dancing party cartoon style" }
    ]
  },
  {
    id: 'tedi',
    name: 'Tedi',
    nameHebrew: 'טֶדִי',
    description: 'הפנדה המתוק',
    imagePrompt: 'cute baby panda bear eating bamboo happy face cartoon sticker white background',
    voiceConfig: {
      pitch: 0.8,
      rate: 0.9,
      soundEffect: 'נְהָם!' 
    },
    rewards: [
      { milestone: 100, message: "מים צוננים! תודה!", imagePrompt: "cute panda bear drinking water bamboo cup cartoon style" },
      { milestone: 200, message: "במבוק! האוכל הכי טעים בעולם!", imagePrompt: "cute panda bear eating bamboo stalks cartoon style" },
      { milestone: 300, message: "שנת דובים... לילה טוב...", imagePrompt: "cute panda bear sleeping on tree branch cartoon style" },
      { milestone: 400, message: "אני מתגלגל ומשחק!", imagePrompt: "cute panda bear rolling on grass cartoon style" },
      { milestone: 500, message: "מלך היער!", imagePrompt: "cute panda bear wearing crown cartoon style" },
      { milestone: 600, message: "פנדה בחלל! אני מרחף!", imagePrompt: "cute panda bear astronaut gravity cartoon style" },
      { milestone: 700, message: "פנדה צוללן! בלוב בלוב!", imagePrompt: "cute panda bear scuba diving cartoon style" },
      { milestone: 800, message: "סופר-פנדה! מציל את הבמבוק!", imagePrompt: "cute panda bear superhero cape cartoon style" },
      { milestone: 900, message: "ריקוד הפנדה!", imagePrompt: "cute panda bear dancing disco cartoon style" }
    ]
  }
];

// ... existing HEBREW_ALPHABET ...
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
  // Uppercase A-Z
  ...Array.from({ length: 26 }, (_, i) => {
    const char = String.fromCharCode(65 + i);
    return { char, name: char, nameHebrew: char };
  }),
  // Lowercase a-z
  ...Array.from({ length: 26 }, (_, i) => {
    const char = String.fromCharCode(97 + i);
    return { char, name: char, nameHebrew: char };
  })
];

// ... existing VOWEL_SPECIFIC_FALLBACKS ...
export const VOWEL_SPECIFIC_FALLBACKS: Record<string, GameQuestion[]> = {
  [VowelType.KAMATZ]: [
    { id: 'k1', word: 'אַבָּא', correctTranslation: 'Dad', distractors: ['Mom', 'Brother', 'Grandpa'], imagePrompt: 'smiling father', hebrewHint: 'הוא ראש המשפחה, בן הזוג של אמא' },
    { id: 'k2', word: 'גַּן', correctTranslation: 'Garden', distractors: ['House', 'School', 'Street'], imagePrompt: 'flower garden', hebrewHint: 'מקום עם הרבה פרחים, עצים ודשא' },
    { id: 'k3', word: 'יָד', correctTranslation: 'Hand', distractors: ['Leg', 'Head', 'Finger'], imagePrompt: 'waving hand', hebrewHint: 'יש לנו שתיים כאלה, ובכל אחת חמש אצבעות' },
    { id: 'k4', word: 'חָלָב', correctTranslation: 'Milk', distractors: ['Water', 'Juice', 'Tea'], imagePrompt: 'milk carton glass', hebrewHint: 'משקה לבן שמגיע מהפרה, טוב לקורנפלקס' },
    { id: 'k5', word: 'נֵר', correctTranslation: 'Candle', distractors: ['Light', 'Sun', 'Fire'], imagePrompt: 'burning candle', hebrewHint: 'מדליקים אותו בשבת או ביום הולדת' },
    { id: 'k6', word: 'חַלָּה', correctTranslation: 'Challah', distractors: ['Bread', 'Cake', 'Cookie'], imagePrompt: 'braided challah bread', hebrewHint: 'לחם קלוע ומיוחד שאוכלים בשבת' },
    { id: 'k7', word: 'מַתָּנָה', correctTranslation: 'Gift', distractors: ['Box', 'Toy', 'Ball'], imagePrompt: 'wrapped gift box', hebrewHint: 'מקבלים אותה ביום הולדת, עטופה בנייר יפה' },
    { id: 'k8', word: 'צַלַּחַת', correctTranslation: 'Plate', distractors: ['Cup', 'Fork', 'Spoon'], imagePrompt: 'dinner plate', hebrewHint: 'שמים עליה את האוכל לפני שאוכלים' },
    { id: 'k9', word: 'אַף', correctTranslation: 'Nose', distractors: ['Ear', 'Eye', 'Mouth'], imagePrompt: 'nose face', hebrewHint: 'נמצא באמצע הפנים, מריחים איתו ריחות' },
    { id: 'k10', word: 'הַר', correctTranslation: 'Mountain', distractors: ['Hill', 'Valley', 'River'], imagePrompt: 'snowy mountain', hebrewHint: 'מקום גבוה מאוד בטבע, לפעמים יש עליו שלג' },
    { id: 'k11', word: 'דָּג', correctTranslation: 'Fish', distractors: ['Cat', 'Dog', 'Bird'], imagePrompt: 'swimming fish', hebrewHint: 'חיה ששוחה במים ונושמת בעזרת זימים' },
    { id: 'k12', word: 'גַּל', correctTranslation: 'Wave', distractors: ['Sand', 'Sun', 'Sea'], imagePrompt: 'ocean wave', hebrewHint: 'תנועה של מים בים שעולה ויורדת' }
  ],
  // ... other vowels kept as is (omitted for brevity, but assume they are there)
  [VowelType.SHURUK]: [
    { id: 'u1', word: 'סוּס', correctTranslation: 'Horse', distractors: ['Cow', 'Sheep', 'Donkey'], imagePrompt: 'running horse', hebrewHint: 'חיה גדולה וחזקה שאפשר לרכוב עליה' },
    { id: 'u12', word: 'בַּקְבּוּק', correctTranslation: 'Bottle', distractors: ['Cup', 'Glass', 'Jug'], imagePrompt: 'water bottle', hebrewHint: 'כלי שיש בו מים או מיץ ואפשר לשתות ממנו' }
  ]
};

export const FALLBACK_RHYMES: RhymeQuestion[] = [
    { id: 'fr1', targetWord: 'חַלּוֹן', rhymeWord: 'בַּלּוֹן', distractors: ['שֻׁלְחָן', 'כִּסֵּא', 'בַּיִת'], hint: 'Window' },
    // ... existing rhymes
    { id: 'fr35', targetWord: 'שׁוּעָל', rhymeWord: 'מַעְגָּל', distractors: ['זְאֵב', 'רִבּוּעַ', 'מְשֻׁלָּשׁ'], hint: 'Fox' }
];

export const FALLBACK_READING_QUESTIONS: ReadingQuestion[] = [
    {
      id: 'read-1',
      passage: 'דָּנִי הָלַךְ לַגַּן. הוּא רָאָה פַּרְפַּר כָּחֹל. הַפַּרְפַּר עָף לַפֶּרַח הָאָדֹם.',
      question: 'לְאָן עָף הַפַּרְפַּר?',
      options: ['לַפֶּרַח הָאָדֹם', 'לַעֵץ הַגָּבוֹהַ', 'לַבַּיִת שֶׁל דָּנִי', 'לַשָּׁמַיִם'],
      correctAnswer: 'לַפֶּרַח הָאָדֹם'
    },
    {
      id: 'read-2',
      passage: 'רִינָה אוֹהֶבֶת תַּפּוּחִים. הִיא אָכְלָה תַּפּוּחַ יָרֹק וְטָעִים. אִמָּא שָׂמְחָה מְאוֹד.',
      question: 'מָה אָכְלָה רִינָה?',
      options: ['תַּפּוּחַ', 'בָּנָנָה', 'עוּגָה', 'גְּלִידָה'],
      correctAnswer: 'תַּפּוּחַ'
    },
    {
      id: 'read-3',
      passage: 'הַכֶּלֶב רָץ בַּחָצֵר. הוּא מָצָא עֶצֶם גְּדוֹלָה. הַכֶּלֶב כִּשְׁכֵּשׁ בַּזָּנָב.',
      question: 'מָה מָצָא הַכֶּלֶב?',
      options: ['עֶצֶם', 'כַּדּוּר', 'חָתוּל', 'מַיִם'],
      correctAnswer: 'עֶצֶם'
    },
    {
      id: 'read-4',
      passage: 'יוֹסִי בָּנָה אַרְמוֹן בַּחוֹל. הַגַּלִּים הִגִּיעוּ וְהָרְסוּ אֶת הָאַרְמוֹן. יוֹסִי בָּנָה חָדָשׁ.',
      question: 'מָה בָּנָה יוֹסִי?',
      options: ['אַרְמוֹן בַּחוֹל', 'בַּיִת', 'סְפִינָה', 'גֶּשֶׁר'],
      correctAnswer: 'אַרְמוֹן בַּחוֹל'
    },
    {
      id: 'read-5',
      passage: 'הַשֶּׁמֶשׁ זָרְחָה בַּבֹּקֶר. הַצִּפּוֹרִים צִיְּצוּ עַל הָעֵץ. דָּנָה קָמָה לְבֵית הַסֵּפֶר.',
      question: 'מָתַי זָרְחָה הַשֶּׁמֶשׁ?',
      options: ['בַּבֹּקֶר', 'בַּלַּיְלָה', 'בַּצָּהֳרַיִם', 'בָּעֶרֶב'],
      correctAnswer: 'בַּבֹּקֶר'
    },
    {
      id: 'read-6',
      passage: 'תָּמָר קִבְּלָה בֻּבָּה חֲדָשָׁה. הַבֻּבָּה לוֹבֶשֶׁת שִׂמְלָה וְרֻדָּה. תָּמָר קָרְאָה לַבֻּבָּה מִיכָל.',
      question: 'מָה צֶבַע הַשִּׂמְלָה שֶׁל הַבֻּבָּה?',
      options: ['וָרֹד', 'כָּחֹל', 'יָרֹק', 'אָדֹם'],
      correctAnswer: 'וָרֹד'
    },
    {
      id: 'read-7',
      passage: 'גִּיל נָסַע בָּאוֹפַנַּיִם לַפָּארְק. הוּא פָּגַשׁ שָׁם אֶת הֶחָבֵר שֶׁלּוֹ דָּוִד. הֵם שִׂחֲקוּ יַחַד.',
      question: 'אֵיךְ נָסַע גִּיל לַפָּארְק?',
      options: ['בְּאוֹפַנַּיִם', 'בְּאוֹטוֹבּוּס', 'בְּרֶגֶל', 'בְּמְכוֹנִית'],
      correctAnswer: 'בְּאוֹפַנַּיִם'
    }
];

export const FALLBACK_READING_QUESTIONS_ENGLISH: ReadingQuestion[] = [
    {
      id: 'read-en-1',
      passage: 'The cat sat on the mat. The cat is fat and happy. It likes to sleep.',
      question: 'Where did the cat sit?',
      options: ['On the mat', 'On the chair', 'On the bed', 'In the box'],
      correctAnswer: 'On the mat'
    },
    {
      id: 'read-en-2',
      passage: 'Tom has a red ball. He plays with the ball in the park. His dog runs after the ball.',
      question: 'What color is the ball?',
      options: ['Red', 'Blue', 'Green', 'Yellow'],
      correctAnswer: 'Red'
    },
    {
      id: 'read-en-3',
      passage: 'Sara loves apples. She eats a green apple every day. Apples are good for you.',
      question: 'What does Sara eat?',
      options: ['A green apple', 'A banana', 'A cookie', 'A pizza'],
      correctAnswer: 'A green apple'
    },
    {
      id: 'read-en-4',
      passage: 'The sun is hot. We go to the beach to swim. The water is cool and blue.',
      question: 'Where do we go to swim?',
      options: ['To the beach', 'To school', 'To the store', 'To the moon'],
      correctAnswer: 'To the beach'
    },
    {
      id: 'read-en-5',
      passage: 'My car is blue. It goes very fast. I drive it to work every morning.',
      question: 'When do I drive to work?',
      options: ['Every morning', 'At night', 'On Sunday', 'Never'],
      correctAnswer: 'Every morning'
    }
];

export const FALLBACK_TWISTERS = [
  { hebrew: 'שָׂרָה שָׁרָה שִׁיר שָׂמֵחַ', english: 'Sarah sang a happy song' },
  { hebrew: 'בַּקְבּוּק בְּלִי פְּקָק', english: 'A bottle without a cap' }
];

export const FALLBACK_SENTENCES = [
  { fullSentence: 'הַכֶּלֶב נוֹבֵחַ בֶּחָצֵר', sentenceWithBlank: 'הַכֶּלֶב ___ בֶּחָצֵר', missingWord: 'נוֹבֵחַ', distractors: ['יָשֵׁן', 'אוֹכֵל', 'קוֹפֵץ'], translation: 'The dog barks in the yard' },
  { fullSentence: 'הַחָתוּל שׁוֹתֶה חָלָב', sentenceWithBlank: 'הַחָתוּל ___ חָלָב', missingWord: 'שׁוֹתֶה', distractors: ['רוֹקֵד', 'נוֹפֵל', 'כּוֹתֵב'], translation: 'The cat drinks milk' }
];

export const FALLBACK_SENTENCES_ENGLISH = [
  { fullSentence: 'The dog barks in the yard', sentenceWithBlank: 'The dog ___ in the yard', missingWord: 'barks', distractors: ['sleeps', 'eats', 'jumps'], translation: 'הַכֶּלֶב נוֹבֵחַ בֶּחָצֵר' },
  { fullSentence: 'The cat drinks milk', sentenceWithBlank: 'The cat ___ milk', missingWord: 'drinks', distractors: ['dances', 'falls', 'writes'], translation: 'הַחָתוּל שׁוֹתֶה חָלָב' }
];

export const FALLBACK_HANGMAN_WORDS = [
    { word: 'מַיִם', hint: 'Water', hebrewHint: 'כשצמאים , שותים אותי', imagePrompt: 'glass of water' },
    { word: 'שֶׁמֶשׁ', hint: 'Sun', hebrewHint: 'כדור צהוב גדול בשמיים שמאיר ביום ומחמם אותנו', imagePrompt: 'sun' },
    { word: 'פַּרְפַּר', hint: 'Butterfly', hebrewHint: 'חיה קטנה עם כנפיים צבעוניות שעפה בין פרחים', imagePrompt: 'butterfly' },
    { word: 'כַּדּוּר', hint: 'Ball', hebrewHint: 'חפץ עגול שבועטים בו או זורקים אותו במשחק', imagePrompt: 'ball' },
    { word: 'בַּיִת', hint: 'House', hebrewHint: 'מקום עם קירות וגג שבו גרים אנשים ומשפחות', imagePrompt: 'house' }
];

// UPDATED: Hint is now the Hebrew translation (not the answer itself), and hebrewHint is the description
export const FALLBACK_HANGMAN_WORDS_ENGLISH = [
    { word: 'WATER', hint: 'מַיִם', hebrewHint: 'כשצמאים שותים אותי', imagePrompt: 'glass of water' },
    { word: 'SUN', hint: 'שֶׁמֶשׁ', hebrewHint: 'כדור צהוב גדול בשמיים', imagePrompt: 'sun' },
    { word: 'BUTTERFLY', hint: 'פַּרְפַּר', hebrewHint: 'חיה קטנה עם כנפיים צבעוניות', imagePrompt: 'butterfly' },
    { word: 'BALL', hint: 'כַּדּוּר', hebrewHint: 'חפץ עגול למשחק', imagePrompt: 'ball' },
    { word: 'HOUSE', hint: 'בַּיִת', hebrewHint: 'מקום בו אנשים גרים', imagePrompt: 'house' },
    { word: 'APPLE', hint: 'תַּפּוּחַ', hebrewHint: 'פרי אדום או ירוק', imagePrompt: 'apple' },
    { word: 'CAT', hint: 'חָתוּל', hebrewHint: 'חיה שאומרת מיאו', imagePrompt: 'cat' },
    { word: 'DOG', hint: 'כֶּלֶב', hebrewHint: 'חיה שנובחת', imagePrompt: 'dog' },
    { word: 'FLOWER', hint: 'פֶּרַח', hebrewHint: 'צמח צבעוני בגינה', imagePrompt: 'flower' },
    { word: 'BOOK', hint: 'סֵפֶר', hebrewHint: 'משהו שקוראים בו', imagePrompt: 'book' }
];

export const GURI_REWARDS: GuriReward[] = [
  // ... kept as is from previous input
  { milestone: 100, message: "אוף, הייתי כל כך צמא! תודה על המשקה!", imagePrompt: "cute white maltipoo dog drinking water from a bowl happy cartoon style" },
];
