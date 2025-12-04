
import { LevelNode, VowelType, HebrewLetter, GameQuestion, RhymeQuestion, GuriReward, PetProfile, ReadingQuestion, SentenceQuestion } from './types';

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
    voiceConfig: {
      pitch: 1.2,
      rate: 1.1,
      soundEffect: 'הַב הַב!'
    },
    rewards: GURI_REWARDS
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
  ...Array.from({ length: 26 }, (_, i) => {
    const char = String.fromCharCode(65 + i);
    return { char, name: char, nameHebrew: char };
  }),
  ...Array.from({ length: 26 }, (_, i) => {
    const char = String.fromCharCode(97 + i);
    return { char, name: char, nameHebrew: char };
  })
];

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
  { id: 'fr5', targetWord: 'בַּיִת', rhymeWord: 'זַיִת', distractors: ['רְחוֹב', 'גַּג', 'דֶּלֶת'], hint: 'House' },
  { id: 'fr6', targetWord: 'נֵר', rhymeWord: 'חָבֵר', distractors: ['אוֹר', 'עוּגָה', 'מַתָּנָה'], hint: 'Candle' },
  { id: 'fr7', targetWord: 'קִיר', rhymeWord: 'סִיר', distractors: ['רִצְפָּה', 'תִּקְרָה', 'חַלּוֹן'], hint: 'Wall' },
  { id: 'fr8', targetWord: 'בַּקְבּוּק', rhymeWord: 'חִבּוּק', distractors: ['מַיִם', 'כּוֹס', 'צַלַּחַת'], hint: 'Bottle' },
  { id: 'fr9', targetWord: 'תַּפּוּז', rhymeWord: 'חָרוּז', distractors: ['תַּפּוּחַ', 'בָּנָנָה', 'אֲבַטִּיחַ'], hint: 'Orange' },
  { id: 'fr10', targetWord: 'חָלָב', rhymeWord: 'זָהָב', distractors: ['מַיִם', 'מִיץ', 'שׁוֹקוֹ'], hint: 'Milk' },
  { id: 'fr11', targetWord: 'יֶלֶד', rhymeWord: 'וֶרֶד', distractors: ['אַבָּא', 'סַבָּא', 'חָבֵר'], hint: 'Boy' },
  { id: 'fr12', targetWord: 'מַתָּנָה', rhymeWord: 'גְּבִינָה', distractors: ['בָּלוֹן', 'עוּגָה', 'נֵר'], hint: 'Gift' },
  { id: 'fr13', targetWord: 'כּוֹבַע', rhymeWord: 'צֶבַע', distractors: ['חֻלְצָה', 'מִכְנָסַיִם', 'נַעֲלַיִם'], hint: 'Hat' },
  { id: 'fr14', targetWord: 'מְעִיל', rhymeWord: 'חָלִיל', distractors: ['צָעִיף', 'כְּפָפוֹת', 'מַגָּפַיִם'], hint: 'Coat' },
  { id: 'fr15', targetWord: 'סַבּוֹן', rhymeWord: 'אֲרוֹן', distractors: ['מַגֶּבֶת', 'מַיִם', 'אַמְבַּטְיָה'], hint: 'Soap' },
  { id: 'fr16', targetWord: 'גָּמָל', rhymeWord: 'סַרְגֵּל', distractors: ['סוּס', 'חֲמוֹר', 'מִדְבָּר'], hint: 'Camel' },
  { id: 'fr17', targetWord: 'חָתוּל', rhymeWord: 'לוּל', distractors: ['כֶּלֶב', 'עַכְבָּר', 'צִפּוֹר'], hint: 'Cat' },
  { id: 'fr18', targetWord: 'כַּדּוּר', rhymeWord: 'כִּנּוֹר', distractors: ['בֻּבָּה', 'מִשְׂחָק', 'קוּבִיָּה'], hint: 'Ball' },
  { id: 'fr19', targetWord: 'שֶׁמֶשׁ', rhymeWord: 'גֶּשֶׁם', distractors: ['יָרֵחַ', 'כּוֹכָב', 'עָנָן'], hint: 'Sun' },
  { id: 'fr20', targetWord: 'דֹּב', rhymeWord: 'צָהֹב', distractors: ['אַרְיֵה', 'פִּיל', 'קּוֹף'], hint: 'Bear' },
  { id: 'fr21', targetWord: 'פִּיל', rhymeWord: 'חָצִיל', distractors: ['גִּיר', 'שִׁיר', 'קִיר'], hint: 'Elephant' }
];

export const FALLBACK_READING_QUESTIONS: ReadingQuestion[] = [
    // --- ANIMALS ---
    { id: 'he-read-1', passage: 'דָּנִי הָלַךְ לַגַּן. הוּא רָאָה פַּרְפַּר כָּחֹל. הַפַּרְפַּר עָף לַפֶּרַח הָאָדֹם.', question: 'לְאָן עָף הַפַּרְפַּר?', options: ['לַפֶּרַח הָאָדֹם', 'לַעֵץ הַגָּבוֹהַ', 'לַבַּיִת שֶׁל דָּנִי', 'לַשָּׁמַיִם'], correctAnswer: 'לַפֶּרַח הָאָדֹם' },
    { id: 'he-read-2', passage: 'הַכֶּלֶב רָץ בַּחָצֵר. הוּא מָצָא עֶצֶם גְּדוֹלָה. הַכֶּלֶב כִּשְׁכֵּשׁ בַּזָּנָב.', question: 'מָה מָצָא הַכֶּלֶב?', options: ['עֶצֶם', 'כַּדּוּר', 'חָתוּל', 'מַיִם'], correctAnswer: 'עֶצֶם' },
    { id: 'he-read-3', passage: 'לְמָאיָה יֵשׁ חָתוּל קָטָן. לֶחָתוּל קוֹרְאִים מִיצִי. מִיצִי אוֹהֵב לִשְׁתּוֹת חָלָב.', question: 'מָה שֵׁם הֶחָתוּל?', options: ['מִיצִי', 'רֶקְס', "גִּ'ינְגִּ'י", 'בּוֹבִּי'], correctAnswer: 'מִיצִי' },
    { id: 'he-read-4', passage: 'הַצִּפּוֹר בָּנְתָה קֵן. בַּקֵּן יֵשׁ שָׁלוֹשׁ בֵּיצִים. הַגּוֹזָלִים בָּקְעוּ מֵהַבֵּיצִים.', question: 'כַּמָּה בֵּיצִים יֵשׁ בַּקֵּן?', options: ['שָׁלוֹשׁ', 'שְׁתַּיִם', 'אַחַת', 'אַרְבַּע'], correctAnswer: 'שָׁלוֹשׁ' },
    { id: 'he-read-5', passage: 'הָאַרְנָב הַלָּבָן קוֹפֵץ בַּשָּׂדֶה. הוּא מְחַפֵּשׂ גֶּזֶר לֶאֱכֹל. הוּא מָצָא גֶּזֶר כָּתֹם.', question: 'מָה מָצָא הָאַרְנָב?', options: ['גֶּזֶר כָּתֹם', 'תַּפּוּחַ אָדֹם', 'חַסָּה יְרֻקָּה', 'לֶחֶם'], correctAnswer: 'גֶּזֶר כָּתֹם' },
    { id: 'he-read-6', passage: 'בַּחַוָּה יֵשׁ פָּרָה גְּדוֹלָה. הַפָּרָה נוֹתֶנֶת לָנוּ חָלָב. הָעֵגֶל הַקָּטָן עוֹמֵד לְיַד אִמָּא.', question: 'מָה נוֹתֶנֶת הַפָּרָה?', options: ['חָלָב', 'בֵּיצִים', 'דְּבַשׁ', 'צֶמֶר'], correctAnswer: 'חָלָב' },
    { id: 'he-read-7', passage: 'הַדָּג שׂוֹחֶה בַּיָּם. הַיָּם כָּחֹל וְגָדוֹל. הַדָּג שׂוֹחֶה מַהֵר מְאוֹד.', question: 'אֵיפֹה שׂוֹחֶה הַדָּג?', options: ['בַּיָּם', 'בַּבְּרֵכָה', 'בַּנָּהָר', 'בָּאַמְבַּטְיָה'], correctAnswer: 'בַּיָּם' },
    { id: 'he-read-8', passage: 'הַסּוּס דּוֹהֵר בָּאֻרְוָה. יֵשׁ לוֹ רַעֲמָה יָפָה. הַיֶּלֶד רוֹכֵב עַל הַסּוּס בַּשַּׁבָּת.', question: 'מָה יֵשׁ לַסּוּס?', options: ['רַעֲמָה יָפָה', 'כְּנָפַיִם', 'קַרְנַיִם', 'שִׁרְיוֹן'], correctAnswer: 'רַעֲמָה יָפָה' },
    { id: 'he-read-9', passage: 'הַצָּב הוֹלֵךְ לְאַט. יֵשׁ לוֹ בַּיִת עַל הַגַּב. כְּשֶׁהוּא מְפַחֵד, הוּא נִכְנָס פְּנִימָה.', question: 'אֵיפֹה הַבַּיִת שֶׁל הַצָּב?', options: ['עַל הַגַּב', 'בָּעֵץ', 'בַּמַּיִם', 'בַּחוֹל'], correctAnswer: 'עַל הַגַּב' },
    { id: 'he-read-10', passage: 'הַדְּבוֹרָה עָפָה מִפֶּרַח לְפֶרַח. הִיא מְכִינָה דְּבַשׁ מָתוֹק. הַדְּבַשׁ טָעִים מְאוֹד.', question: 'מָה מְכִינָה הַדְּבוֹרָה?', options: ['דְּבַשׁ', 'חָלָב', 'מִיץ', 'רִבָּה'], correctAnswer: 'דְּבַשׁ' },

    // --- FOOD ---
    { id: 'he-read-11', passage: 'רִינָה אוֹהֶבֶת תַּפּוּחִים. הִיא אָכְלָה תַּפּוּחַ יָרֹק וְטָעִים. אִמָּא שָׂמְחָה מְאוֹד.', question: 'מָה אָכְלָה רִינָה?', options: ['תַּפּוּחַ', 'בָּנָנָה', 'עוּגָה', 'גְּלִידָה'], correctAnswer: 'תַּפּוּחַ' },
    { id: 'he-read-12', passage: 'דָּן וְגַל אָכְלוּ פִּיצָה. עַל הַפִּיצָה הָיָה גְּבִינָה וְזֵיתִים. זֶה הָיָה אֲרוּחַת עֶרֶב.', question: 'מָה הָיָה עַל הַפִּיצָה?', options: ['גְּבִינָה וְזֵיתִים', 'שׁוֹקוֹלָד', 'תּוּתִים', 'בָּשָׂר'], correctAnswer: 'גְּבִינָה וְזֵיתִים' },
    { id: 'he-read-13', passage: 'סַבְּתָא הֵכִינָה מָרָק. בַּמָּרָק הָיוּ יְרָקוֹת כְּמוֹ גֶּזֶר וְתַפּוּחַ אֲדָמָה. הַמָּרָק הָיָה חַם.', question: 'מָה הָיָה בַּמָּרָק?', options: ['יְרָקוֹת', 'פֵּרוֹת', 'סֻכָּרִיּוֹת', 'לֶחֶם'], correctAnswer: 'יְרָקוֹת' },
    { id: 'he-read-14', passage: 'בַּבֹּקֶר אֲנִי אוֹכֵל דְּגָנִים עִם חָלָב. זֶה נוֹתֵן לִי כֹּחַ לְשַׂחֵק. אֲנִי שׁוֹתֶה גַּם מִיץ תַּפּוּזִים.', question: 'מָה אֲנִי שׁוֹתֶה?', options: ['מִיץ תַּפּוּזִים', 'קוֹלָה', 'מַיִם', 'תֵּה'], correctAnswer: 'מִיץ תַּפּוּזִים' },
    { id: 'he-read-15', passage: 'יוֹנָתָן קָנָה גְּלִידָה. הוּא בָּחַר גְּלִידָה בְּטַעַם שׁוֹקוֹלָד. הַגְּלִידָה הָיְתָה קָרָה מְאוֹד.', question: 'אֵיזֶה טַעַם גְּלִידָה בָּחַר יוֹנָתָן?', options: ['שׁוֹקוֹלָד', 'וָנִיל', 'תּוּת', 'בָּנָנָה'], correctAnswer: 'שׁוֹקוֹלָד' },
    { id: 'he-read-16', passage: 'בְּיוֹם הֻלֶּדֶת שֶׁל מָאיָה הָיְתָה עוּגָה גְּדוֹלָה. עַל הָעוּגָה הָיוּ נֵרוֹת. כֻּלָּם אָכְלוּ וְשָׂמְחוּ.', question: 'מָה הָיָה עַל הָעוּגָה?', options: ['נֵרוֹת', 'פְּרָחִים', 'בֻּבּוֹת', 'כַּדּוּרִים'], correctAnswer: 'נֵרוֹת' },
    { id: 'he-read-17', passage: 'אַבָּא קָנָה לֶחֶם טָרִי בַּמַּאֲפִיָּה. הַלֶּחֶם הָיָה עֲדַיִן חַם. אָכַלְנוּ אוֹתוֹ עִם חֶמְאָה וְרִבָּה.', question: 'עִם מָה אָכַלְנוּ אֶת הַלֶּחֶם?', options: ['חֶמְאָה וְרִבָּה', 'בָּשָׂר', 'גְּבִינָה', 'שׁוֹקוֹלָד'], correctAnswer: 'חֶמְאָה וְרִבָּה' },
    { id: 'he-read-18', passage: 'הָאֲבַטִּיחַ הוּא פְּרִי קַיִץ. הוּא יָרֹק מִבַּחוּץ וְאָדֹם מִבִּפְנִים. הוּא מָתוֹק וּמְלֵא מִיץ.', question: 'מָה צֶבַע הָאֲבַטִּיחַ מִבִּפְנִים?', options: ['אָדֹם', 'יָרֹק', 'צָהֹב', 'כָּחֹל'], correctAnswer: 'אָדֹם' },
    { id: 'he-read-19', passage: 'אֲנִי אוֹהֵב לֶאֱכֹל בָּנָנָה. לַבָּנָנָה יֵשׁ קְלִפָּה צְהֻבָּה. הַקּוֹף בַּגַּן הַחַיּוֹת גַּם אוֹהֵב בָּנָנוֹת.', question: 'מִי עוֹד אוֹהֵב בָּנָנוֹת?', options: ['הַקּוֹף', 'הָאַרְיֵה', 'הַדָּג', 'הַנָּחָשׁ'], correctAnswer: 'הַקּוֹף' },
    { id: 'he-read-20', passage: 'לְשַׁבָּת הֵכַנּוּ סָלָט. שַׂמְנוּ מְלָפְפוֹן, עַגְבָנִיָּה וּבָצָל. הוספנו שֶׁמֶן וְלִימוֹן לְטַעַם.', question: 'מָה שַׂמְנוּ בַּסָּלָט?', options: ['מְלָפְפוֹן וְעַגְבָנִיָּה', 'תַּפּוּחַ וְאַגָּס', 'לֶחֶם וְחֶמְאָה', 'עוּגָה וְשׁוֹקוֹלָד'], correctAnswer: 'מְלָפְפוֹן וְעַגְבָנִיָּה' },

    // --- ACTIVITIES / PLACES ---
    { id: 'he-read-21', passage: 'יוֹסִי בָּנָה אַרְמוֹן בַּחוֹל. הַגַּלִּים הִגִּיעוּ וְהָרְסוּ אֶת הָאַרְמוֹן. יוֹסִי בָּנָה חָדָשׁ.', question: 'מָה בָּנָה יוֹסִי?', options: ['אַרְמוֹן בַּחוֹל', 'בַּיִת', 'סְפִינָה', 'גֶּשֶׁר'], correctAnswer: 'אַרְמוֹן בַּחוֹל' },
    { id: 'he-read-22', passage: 'גִּיל נָסַע בָּאוֹפַנַּיִם לַפָּארְק. הוּא פָּגַשׁ שָׁם אֶת הֶחָבֵר שֶׁלּוֹ דָּוִד. הֵם שִׂחֲקוּ יַחַד.', question: 'אֵיךְ נָסַע גִּיל לַפָּארְק?', options: ['בְּאוֹפַנַּיִם', 'בְּאוֹטוֹבּוּס', 'בְּרֶגֶל', 'בְּמְכוֹנִית'], correctAnswer: 'בְּאוֹפַנַּיִם' },
    { id: 'he-read-23', passage: 'תָּמָר קִבְּלָה בֻּבָּה חֲדָשָׁה. הַבֻּבָּה לוֹבֶשֶׁת שִׂמְלָה וְרֻדָּה. תָּמָר קָרְאָה לַבֻּבָּה מִיכָל.', question: 'מָה צֶבַע הַשִּׂמְלָה שֶׁל הַבֻּבָּה?', options: ['וָרֹד', 'כָּחֹל', 'יָרֹק', 'אָדֹם'], correctAnswer: 'וָרֹד' },
    { id: 'he-read-24', passage: 'הַכִּתָּה יָצְאָה לְטִיּוּל שְׁנָתִי. הֵם הָלְכוּ בַּיַּעַר וְרָאוּ פְּרָחִים. הַמּוֹרָה סִפְּרָה סִפּוּר.', question: 'אֵיפֹה טִיְּלוּ הַיְּלָדִים?', options: ['בַּיַּעַר', 'בַּיָּם', 'בָּעִיר', 'בַּבַּיִת'], correctAnswer: 'בַּיַּעַר' },
    { id: 'he-read-25', passage: 'רוֹעִי אוֹהֵב לְצַיֵּר. הוּא לָקַח דַּף וּצְבָעִים. הוּא צִיֵּר שֶׁמֶשׁ גְּדוֹלָה וּצְהֻבָּה.', question: 'מָה צִיֵּר רוֹעִי?', options: ['שֶׁמֶשׁ', 'בַּיִת', 'פֶּרַח', 'מְכוֹנִית'], correctAnswer: 'שֶׁמֶשׁ' },
    { id: 'he-read-26', passage: 'נֹעָה קוֹרֵאת סֵפֶר בַּסִּפְרִיָּה. הַסֵּפֶר הוּא עַל נְסִיכָה וְדָרְקוֹן. נֹעָה אוֹהֶבֶת סִפּוּרִים.', question: 'אֵיפֹה נֹעָה קוֹרֵאת?', options: ['בַּסִּפְרִיָּה', 'בַּגַּן', 'בַּמִּטְבָּח', 'בָּאוֹטוֹ'], correctAnswer: 'בַּסִּפְרִיָּה' },
    { id: 'he-read-27', passage: 'בַּחֹרֶף יוֹרֵד גֶּשֶׁם. אֲנַחְנוּ לוֹבְשִׁים מְעִיל וּמַגָּפַיִם. כֵּיף לִקְפֹּץ בַּשְּׁלוּלִיּוֹת.', question: 'מָה לוֹבְשִׁים בַּחֹרֶף?', options: ['מְעִיל וּמַגָּפַיִם', 'בֶּגֶד יָם', 'חֻלְצָה קְצָרָה', 'סַנְדָּלִים'], correctAnswer: 'מְעִיל וּמַגָּפַיִם' },
    { id: 'he-read-28', passage: 'אֲבִיב הִגִּיעַ. הַפְּרָחִים פּוֹרְחִים בַּגִּנָּה. הַצִּפּוֹרִים מְצַיְּצוֹת שִׁירִים שְׂמֵחִים.', question: 'מָה קוֹרֶה בָּאֲבִיב?', options: ['הַפְּרָחִים פּוֹרְחִים', 'יוֹרֵד שֶׁלֶג', 'הֶעָלִים נוֹשְׁרִים', 'קַר מְאוֹד'], correctAnswer: 'הַפְּרָחִים פּוֹרְחִים' },
    { id: 'he-read-29', passage: 'דָּנִיאֵל מְשַׂחֵק כַּדּוּרֶגֶל. הוּא בָּעַט בַּכַּדּוּר חָזָק. הַכַּדּוּר נִכְנַס לַשַּׁעַר. גּוֹל!', question: 'מָה עָשָׂה דָּנִיאֵל?', options: ['בָּעַט בַּכַּדּוּר', 'תָּפַס אֶת הַכַּדּוּר', 'יָשַׁן', 'אָכַל'], correctAnswer: 'בָּעַט בַּכַּדּוּר' },
    { id: 'he-read-30', passage: 'הַתִּינוֹק יָשֵׁן בַּעֲרִיסָה. הוּא חוֹלֵם חֲלוֹמוֹת מְתוּקִים. שֶׁקֶט, לֹא לְהָעִיר אוֹתוֹ.', question: 'אֵיפֹה הַתִּינוֹק יָשֵׁן?', options: ['בַּעֲרִיסָה', 'בַּסָּלוֹן', 'עַל הָרִצְפָּה', 'בַּגַּן'], correctAnswer: 'בַּעֲרִיסָה' },
    { id: 'he-read-31', passage: 'הַמְּכוֹנִית הָאֲדֻמָּה נוֹסַעַת בַּכְּבִישׁ. אַבָּא נוֹהֵג בִּזְהִירוּת. אֲנַחְנוּ נוֹסְעִים לְסַבָּא וְסַבְּתָא.', question: 'מָה צֶבַע הַמְּכוֹנִית?', options: ['אָדֹם', 'כָּחֹל', 'לָבָן', 'שָׁחֹר'], correctAnswer: 'אָדֹם' },
    { id: 'he-read-32', passage: 'בַּלַּיְלָה יֵשׁ יָרֵחַ בַּשָּׁמַיִם. הַכּוֹכָבִים נוֹצְצִים. כֻּלָּם הוֹלְכִים לִישֹׁן.', question: 'מָה יֵשׁ בַּשָּׁמַיִם בַּלַּיְלָה?', options: ['יָרֵחַ וְכוֹכָבִים', 'שֶׁמֶשׁ', 'עֲנָנִים', 'קֶשֶׁת בֶּעָנָן'], correctAnswer: 'יָרֵחַ וְכוֹכָבִים' },
    { id: 'he-read-33', passage: 'שִׁירָה מְנַגֶּנֶת בִּפְסַנְתֵּר. הִיא יוֹדַעַת לְנַגֵּן שִׁיר יָפֶה. כֻּלָּם מוֹחֲאִים לָהּ כַּפַּיִם.', question: 'בְּמָה שִׁירָה מְנַגֶּנֶת?', options: ['בִּפְסַנְתֵּר', 'בְּגִיטָרָה', 'בְּחָלִיל', 'בְּתֹף'], correctAnswer: 'בִּפְסַנְתֵּר' },
    { id: 'he-read-34', passage: 'הָרוֹפֵא בּוֹדֵק אֶת הַיֶּלֶד. הַיֶּלֶד מַרְגִּישׁ לֹא טוֹב. הָרוֹפֵא נוֹתֵן לוֹ תְּרוּפָה.', question: 'מִי בּוֹדֵק אֶת הַיֶּלֶד?', options: ['הָרוֹפֵא', 'הַמּוֹרֶה', 'הַנַּהָג', 'הַטַּבָּח'], correctAnswer: 'הָרוֹפֵא' },
    { id: 'he-read-35', passage: 'בְּפוּרִים אֲנַחְנוּ מִתְחַפְּשִׂים. יָאִיר הִתְחַפֵּשׁ לְלֵיצָן. הוּא שָׂם אַף אָדֹם וְכוֹבַע מַצְחִיק.', question: 'לְמָה הִתְחַפֵּשׁ יָאִיר?', options: ['לְלֵיצָן', 'לְמֶלֶךְ', 'לְאַרְיֵה', 'לְשׁוֹטֵר'], correctAnswer: 'לְלֵיצָן' },
    { id: 'he-read-36', passage: 'הַשָּׁעוֹן מְצַלְצֵל בְּשֶׁבַע בַּבֹּקֶר. אֲנִי קָם, מצחצח שִׁנַּיִם וְלוֹבֵשׁ בְּגָדִים.', question: 'מָתַי מְצַלְצֵל הַשָּׁעוֹן?', options: ['בְּשֶׁבַע בַּבֹּקֶר', 'בְּאַחַת בַּצָּהֳרַיִם', 'בְּעֶשֶׂר בַּלַּיְלָה', 'בְּחָמֵשׁ'], correctAnswer: 'בְּשֶׁבַע בַּבֹּקֶר' },
    { id: 'he-read-37', passage: 'הַמַּיִם בַּבְּרֵכָה קָרִים וּנְעִימִים. אֲנִי לוֹבֵשׁ מַצּוֹפִים וְנִכְנָס לַמַּיִם. אֲנִי שׂוֹחֶה עִם חֲבֵרִים.', question: 'מָה אֲנִי לוֹבֵשׁ בַּבְּרֵכָה?', options: ['מַצּוֹפִים', 'מְעִיל', 'נַעֲלַיִם', 'כּוֹבַע צֶמֶר'], correctAnswer: 'מַצּוֹפִים' },
    { id: 'he-read-38', passage: 'הַמּוֹרָה כּוֹתֶבֶת עַל הַלּוּחַ. הַתַּלְמִידִים מַקְשִׁיבִים. אֲנַחְנוּ לוֹמְדִים לִכְתֹּב אוֹתִיּוֹת.', question: 'עַל מָה כּוֹתֶבֶת הַמּוֹרָה?', options: ['עַל הַלּוּחַ', 'עַל הַקִּיר', 'עַל הַשֻּׁלְחָן', 'עַל הַכִּסֵּא'], correctAnswer: 'עַל הַלּוּחַ' },
    { id: 'he-read-39', passage: 'בַּסֻּפֶּרְמַרְקֶט יֵשׁ הַרְבֵּה דְּבָרִים. אִמָּא קוֹנָה חָלָב, לֶחֶם וּבֵיצִים. אֲנִי עוֹזֵר לָהּ עִם הַסַּל.', question: 'מִי עוֹזֵר לְאִמָּא?', options: ['אֲנִי', 'הַקֻּפָּאִית', 'הַשּׁוֹמֵר', 'אַבָּא'], correctAnswer: 'אֲנִי' },
    { id: 'he-read-40', passage: 'הַטֶּלֶפוֹן מְצַלְצֵל. סַבְּתָא מִתְקַשֶּׁרֶת לְהַגִּיד שַׁבָּת שָׁלוֹם. אֲנִי שָׂמֵחַ לְדַבֵּר אִתָּהּ.', question: 'מִי מִתְקַשֶּׁרֶת?', options: ['סַבְּתָא', 'הַגַּנֶּנֶת', 'דּוֹדָה', 'חֲבֵרָה'], correctAnswer: 'סַבְּתָא' }
];

export const FALLBACK_READING_QUESTIONS_ENGLISH: ReadingQuestion[] = [
    // --- ANIMALS ---
    { id: 'en-read-1', passage: 'The cat sat on the mat. The cat is fat and happy. It likes to sleep.', question: 'Where did the cat sit?', options: ['On the mat', 'On the chair', 'On the bed', 'In the box'], correctAnswer: 'On the mat' },
    { id: 'en-read-2', passage: 'Tom has a red ball. He plays with the ball in the park. His dog runs after the ball.', question: 'What color is the ball?', options: ['Red', 'Blue', 'Green', 'Yellow'], correctAnswer: 'Red' },
    { id: 'en-read-3', passage: 'The bird is in the tree. It sings a song. The song is very sweet.', question: 'Where is the bird?', options: ['In the tree', 'In the house', 'On the car', 'In the water'], correctAnswer: 'In the tree' },
    { id: 'en-read-4', passage: 'A fish swims in the water. It has orange scales. It swims very fast.', question: 'What does the fish do?', options: ['Swims', 'Runs', 'Flies', 'Jumps'], correctAnswer: 'Swims' },
    { id: 'en-read-5', passage: 'The elephant is big and gray. It has a long nose. It likes to eat peanuts.', question: 'What is big and gray?', options: ['The elephant', 'The mouse', 'The ant', 'The cat'], correctAnswer: 'The elephant' },
    { id: 'en-read-6', passage: 'The cow says moo. It lives on a farm. It gives us milk.', question: 'What does the cow give us?', options: ['Milk', 'Eggs', 'Wool', 'Honey'], correctAnswer: 'Milk' },
    { id: 'en-read-7', passage: 'I see a green frog. The frog jumps on a rock. It eats a fly.', question: 'What does the frog eat?', options: ['A fly', 'A cake', 'A fish', 'A bird'], correctAnswer: 'A fly' },
    { id: 'en-read-8', passage: 'The monkey likes bananas. It swings from the trees. It is very funny.', question: 'What does the monkey like?', options: ['Bananas', 'Apples', 'Pizza', 'Bread'], correctAnswer: 'Bananas' },
    { id: 'en-read-9', passage: 'The lion is the king of the jungle. He has a big roar. All the animals are afraid.', question: 'Who is the king of the jungle?', options: ['The lion', 'The rabbit', 'The sheep', 'The duck'], correctAnswer: 'The lion' },
    { id: 'en-read-10', passage: 'My rabbit is white. It has long ears. It hops in the garden.', question: 'What color is the rabbit?', options: ['White', 'Black', 'Brown', 'Blue'], correctAnswer: 'White' },

    // --- FOOD ---
    { id: 'en-read-11', passage: 'Sara loves apples. She eats a green apple every day. Apples are good for you.', question: 'What does Sara eat?', options: ['A green apple', 'A banana', 'A cookie', 'A pizza'], correctAnswer: 'A green apple' },
    { id: 'en-read-12', passage: 'We eat pizza for lunch. It has cheese and tomato sauce. It is yummy.', question: 'What do we eat for lunch?', options: ['Pizza', 'Soup', 'Salad', 'Rice'], correctAnswer: 'Pizza' },
    { id: 'en-read-13', passage: 'I like ice cream. Chocolate is my favorite flavor. It is cold and sweet.', question: 'What is the favorite flavor?', options: ['Chocolate', 'Vanilla', 'Strawberry', 'Lemon'], correctAnswer: 'Chocolate' },
    { id: 'en-read-14', passage: 'Mom bakes a cake. She puts candles on it. It is for my birthday.', question: 'What does Mom bake?', options: ['A cake', 'Bread', 'Cookies', 'Pie'], correctAnswer: 'A cake' },
    { id: 'en-read-15', passage: 'I drink orange juice in the morning. It is orange and cold. It is healthy.', question: 'When do I drink juice?', options: ['In the morning', 'At night', 'At noon', 'Never'], correctAnswer: 'In the morning' },
    { id: 'en-read-16', passage: 'The sandwich has ham and cheese. I eat it at school. I also have an apple.', question: 'Where do I eat the sandwich?', options: ['At school', 'At home', 'In the park', 'In the car'], correctAnswer: 'At school' },
    { id: 'en-read-17', passage: 'We make a salad. We cut lettuce and tomatoes. We add oil and salt.', question: 'What do we cut?', options: ['Lettuce and tomatoes', 'Cake', 'Paper', 'Wood'], correctAnswer: 'Lettuce and tomatoes' },
    { id: 'en-read-18', passage: 'Popcorn is white and crunchy. We eat it at the movies. It tastes salty.', question: 'Where do we eat popcorn?', options: ['At the movies', 'At school', 'In bed', 'In the pool'], correctAnswer: 'At the movies' },
    { id: 'en-read-19', passage: 'Ben eats cereal with milk. He uses a spoon. It is his breakfast.', question: 'What does Ben use?', options: ['A spoon', 'A fork', 'A knife', 'A stick'], correctAnswer: 'A spoon' },
    { id: 'en-read-20', passage: 'Watermelon is a big fruit. It is red inside. It has black seeds.', question: 'What color are the seeds?', options: ['Black', 'White', 'Red', 'Green'], correctAnswer: 'Black' },

    // --- DAILY ROUTINE & PLACES ---
    { id: 'en-read-21', passage: 'The sun is hot. We go to the beach to swim. The water is cool and blue.', question: 'Where do we go to swim?', options: ['To the beach', 'To school', 'To the store', 'To the moon'], correctAnswer: 'To the beach' },
    { id: 'en-read-22', passage: 'My car is blue. It goes very fast. I drive it to work every morning.', question: 'When do I drive to work?', options: ['Every morning', 'At night', 'On Sunday', 'Never'], correctAnswer: 'Every morning' },
    { id: 'en-read-23', passage: 'I brush my teeth before bed. I use a toothbrush and toothpaste. My teeth are clean.', question: 'When do I brush my teeth?', options: ['Before bed', 'After lunch', 'In the car', 'At school'], correctAnswer: 'Before bed' },
    { id: 'en-read-24', passage: 'The school bus is yellow. It stops at my house. I get on the bus with my friends.', question: 'What color is the bus?', options: ['Yellow', 'Red', 'Green', 'Purple'], correctAnswer: 'Yellow' },
    { id: 'en-read-25', passage: 'It is raining today. I wear my raincoat and boots. I hold an umbrella.', question: 'What do I hold?', options: ['An umbrella', 'A ball', 'A book', 'A cat'], correctAnswer: 'An umbrella' },
    { id: 'en-read-26', passage: 'We go to the park. We play on the slide and the swing. We have fun.', question: 'What do we play on?', options: ['Slide and swing', 'Computer', 'TV', 'Table'], correctAnswer: 'Slide and swing' },
    { id: 'en-read-27', passage: 'The library has many books. I read a book about space. It is quiet inside.', question: 'What does the library have?', options: ['Many books', 'Toys', 'Food', 'Clothes'], correctAnswer: 'Many books' },
    { id: 'en-read-28', passage: 'My dad cooks dinner. He makes pasta. It smells very good.', question: 'Who cooks dinner?', options: ['My dad', 'My mom', 'My sister', 'My dog'], correctAnswer: 'My dad' },
    { id: 'en-read-29', passage: 'I draw a picture. I use crayons. I draw a house and a tree.', question: 'What do I use to draw?', options: ['Crayons', 'A spoon', 'A hammer', 'Water'], correctAnswer: 'Crayons' },
    { id: 'en-read-30', passage: 'The baby sleeps in the crib. He is tired. He holds a teddy bear.', question: 'What does the baby hold?', options: ['A teddy bear', 'A ball', 'A car', 'A pen'], correctAnswer: 'A teddy bear' },
    { id: 'en-read-31', passage: 'We visit the zoo. We see a tall giraffe. It eats leaves from the tree.', question: 'What does the giraffe eat?', options: ['Leaves', 'Meat', 'Pizza', 'Fish'], correctAnswer: 'Leaves' },
    { id: 'en-read-32', passage: 'My sister plays the piano. She practices every day. The music is beautiful.', question: 'What instrument does she play?', options: ['Piano', 'Guitar', 'Drums', 'Flute'], correctAnswer: 'Piano' },
    { id: 'en-read-33', passage: 'I wash my hands with soap. I use warm water. My hands are clean now.', question: 'What do I use with water?', options: ['Soap', 'Sand', 'Milk', 'Glue'], correctAnswer: 'Soap' },
    { id: 'en-read-34', passage: 'The doctor helps sick people. He wears a white coat. He gives me medicine.', question: 'What does the doctor wear?', options: ['A white coat', 'A blue hat', 'Red shoes', 'Green pants'], correctAnswer: 'A white coat' },
    { id: 'en-read-35', passage: 'I ride my bike. It has two wheels. I wear a helmet for safety.', question: 'What do I wear for safety?', options: ['A helmet', 'A hat', 'Glasses', 'Gloves'], correctAnswer: 'A helmet' },
    { id: 'en-read-36', passage: 'It is snowing. The ground is white. We make a snowman.', question: 'What do we make?', options: ['A snowman', 'A sandcastle', 'A cake', 'A fire'], correctAnswer: 'A snowman' },
    { id: 'en-read-37', passage: 'My mom reads me a story. It is about a magic dragon. I fall asleep.', question: 'What is the story about?', options: ['A magic dragon', 'A dog', 'A school', 'A car'], correctAnswer: 'A magic dragon' },
    { id: 'en-read-38', passage: 'I help clean the house. I sweep the floor. It looks nice and tidy.', question: 'What do I sweep?', options: ['The floor', 'The wall', 'The ceiling', 'The grass'], correctAnswer: 'The floor' },
    { id: 'en-read-39', passage: 'The flower is red. It grows in the garden. It smells nice.', question: 'Where does the flower grow?', options: ['In the garden', 'In the house', 'In the car', 'In the sky'], correctAnswer: 'In the garden' },
    { id: 'en-read-40', passage: 'We watch a movie. We eat popcorn. It is a funny movie.', question: 'What kind of movie is it?', options: ['Funny', 'Scary', 'Sad', 'Boring'], correctAnswer: 'Funny' }
];

export const FALLBACK_TWISTERS = [
  { hebrew: 'שָׂרָה שָׁרָה שִׁיר שָׂמֵחַ', english: 'Sarah sang a happy song' },
  { hebrew: 'בַּקְבּוּק בְּלִי פְּקָק', english: 'A bottle without a cap' }
];

export const FALLBACK_SENTENCES: SentenceQuestion[] = [
  { id: 's1', fullSentence: 'הַכַּדּוּר הוּא עָגֹל', sentenceWithBlank: 'הַכַּדּוּר הוּא ___', missingWord: 'עָגֹל', distractors: ['מְרֻבָּע', 'יָשָׁר', 'כָּחֹל'], translation: 'The ball is round' },
  { id: 's2', fullSentence: 'הַשֶּׁמֶשׁ זוֹרַחַת בַּבֹּקֶר', sentenceWithBlank: 'הַשֶּׁמֶשׁ ___ בַּבֹּקֶר', missingWord: 'זוֹרַחַת', distractors: ['יוֹשֶׁבֶת', 'אוֹכֶלֶת', 'יְשֵׁנָה'], translation: 'The sun shines in the morning' },
  { id: 's3', fullSentence: 'אֲנִי אוֹהֵב גְּלִידָה', sentenceWithBlank: 'אֲנִי אוֹהֵב ___', missingWord: 'גְּלִידָה', distractors: ['כִּסֵּא', 'שֻׁלְחָן', 'רִצְפָּה'], translation: 'I like ice cream' },
  { id: 's4', fullSentence: 'הַכֶּלֶב נוֹבֵחַ', sentenceWithBlank: 'הַכֶּלֶב ___', missingWord: 'נוֹבֵחַ', distractors: ['מְיַלֵּל', 'מְדַבֵּר', 'שָׁר'], translation: 'The dog barks' },
  { id: 's5', fullSentence: 'הַפֶּרַח הוּא אָדֹם', sentenceWithBlank: 'הַפֶּרַח הוּא ___', missingWord: 'אָדֹם', distractors: ['גָּדוֹל', 'שָׁמֵן', 'מַהֵר'], translation: 'The flower is red' }
];

export const FALLBACK_SENTENCES_ENGLISH: SentenceQuestion[] = [
  { id: 'es1', fullSentence: 'The sky is blue', sentenceWithBlank: 'The sky is ___', missingWord: 'blue', distractors: ['green', 'yellow', 'red'], translation: 'השמיים כחולים' },
  { id: 'es2', fullSentence: 'I have a cat', sentenceWithBlank: 'I have a ___', missingWord: 'cat', distractors: ['car', 'hat', 'bat'], translation: 'יש לי חתול' },
  { id: 'es3', fullSentence: 'She eats an apple', sentenceWithBlank: 'She eats an ___', missingWord: 'apple', distractors: ['chair', 'book', 'shoe'], translation: 'היא אוכלת תפוח' },
  { id: 'es4', fullSentence: 'He runs fast', sentenceWithBlank: 'He runs ___', missingWord: 'fast', distractors: ['slow', 'sleep', 'eat'], translation: 'הוא רץ מהר' },
  { id: 'es5', fullSentence: 'We play soccer', sentenceWithBlank: 'We play ___', missingWord: 'soccer', distractors: ['read', 'sleep', 'cook'], translation: 'אנחנו משחקים כדורגל' }
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
