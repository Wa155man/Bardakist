

import { LevelNode, VowelType, HebrewLetter, GameQuestion, RhymeQuestion, GuriReward, PetProfile } from './types';

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
    x: 80, // Moved Left (85->80)
    y: 50, // Moved Higher (60->50) to avoid overlapping Games button
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

// Organized by VowelType for correct fallback content
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
  [VowelType.PATACH]: [
    { id: 'p1', word: 'גַּג', correctTranslation: 'Roof', distractors: ['Wall', 'Door', 'Floor'], imagePrompt: 'red roof house', hebrewHint: 'החלק העליון של הבית שמגן עלינו מהגשם' },
    { id: 'p2', word: 'דַּף', correctTranslation: 'Page', distractors: ['Book', 'Pen', 'Pencil'], imagePrompt: 'paper sheet', hebrewHint: 'חלק מספר או ממחברת שאפשר לכתוב עליו' },
    { id: 'p3', word: 'בַּיִת', correctTranslation: 'House', distractors: ['Garden', 'Room', 'Roof'], imagePrompt: 'small house', hebrewHint: 'המקום שבו אנחנו גרים וישנים' },
    { id: 'p4', word: 'יַם', correctTranslation: 'Sea', distractors: ['Pool', 'River', 'Bath'], imagePrompt: 'blue ocean sea', hebrewHint: 'מקום גדול עם המון מים מלוחים וחול' },
    { id: 'p5', word: 'כַּף', correctTranslation: 'Spoon', distractors: ['Fork', 'Knife', 'Plate'], imagePrompt: 'silver spoon', hebrewHint: 'אוכלים איתה מרק או קורנפלקס' },
    { id: 'p6', word: 'סַל', correctTranslation: 'Basket', distractors: ['Box', 'Bag', 'Bucket'], imagePrompt: 'wicker basket', hebrewHint: 'אפשר לשים בתוכו דברים ולקחת לקניות' },
    { id: 'p7', word: 'פַּרְפַּר', correctTranslation: 'Butterfly', distractors: ['Bird', 'Bee', 'Fly'], imagePrompt: 'colorful butterfly', hebrewHint: 'חרק יפה עם כנפיים צבעוניות שעף בין פרחים' },
    { id: 'p8', word: 'מַסְרֵק', correctTranslation: 'Comb', distractors: ['Brush', 'Soap', 'Towel'], imagePrompt: 'hair comb', hebrewHint: 'מסדרים איתו את השיער בבוקר' },
    { id: 'p9', word: 'אַרְנָב', correctTranslation: 'Rabbit', distractors: ['Cat', 'Dog', 'Mouse'], imagePrompt: 'cute rabbit bunny', hebrewHint: 'חיה חמודה עם אוזניים ארוכות שאוהבת גזר' },
    { id: 'p10', word: 'גַּמָּל', correctTranslation: 'Camel', distractors: ['Horse', 'Donkey', 'Cow'], imagePrompt: 'desert camel', hebrewHint: 'חיה גבוהה שחיה במדבר ויש לה דבשת' }
  ],
  [VowelType.CHIRIK]: [
    { id: 'c1', word: 'אִמָּא', correctTranslation: 'Mom', distractors: ['Dad', 'Sister', 'Grandma'], imagePrompt: 'mother smiling', hebrewHint: 'האישה שילדה אותנו ואוהבת אותנו מאוד' },
    { id: 'c2', word: 'עִיר', correctTranslation: 'City', distractors: ['Village', 'Park', 'Forest'], imagePrompt: 'city buildings', hebrewHint: 'מקום מגורים גדול עם הרבה בניינים וכבישים' },
    { id: 'c3', word: 'גִּיר', correctTranslation: 'Chalk', distractors: ['Pen', 'Pencil', 'Marker'], imagePrompt: 'chalk board', hebrewHint: 'כותבים איתו על הלוח בכיתה, בדרך כלל בלבן' },
    { id: 'c4', word: 'שִׁיר', correctTranslation: 'Song', distractors: ['Story', 'Picture', 'Game'], imagePrompt: 'music notes', hebrewHint: 'מילים ומנגינה שאפשר לשיר ביחד' },
    { id: 'c5', word: 'קִיר', correctTranslation: 'Wall', distractors: ['Floor', 'Roof', 'Door'], imagePrompt: 'brick wall', hebrewHint: 'חלק מהבית שמפריד בין חדרים' },
    { id: 'c6', word: 'מְעִיל', correctTranslation: 'Coat', distractors: ['Shirt', 'Pants', 'Hat'], imagePrompt: 'winter coat', hebrewHint: 'בגד חם שלובשים בחורף כשיורד גשם' },
    { id: 'c7', word: 'סִיר', correctTranslation: 'Pot', distractors: ['Pan', 'Bowl', 'Cup'], imagePrompt: 'cooking pot', hebrewHint: 'מבשלים בתוכו אוכל כמו מרק או פסטה' },
    { id: 'c8', word: 'כִּסֵּא', correctTranslation: 'Chair', distractors: ['Table', 'Bed', 'Desk'], imagePrompt: 'wooden chair', hebrewHint: 'יושבים עליו ליד השולחן' },
    { id: 'c9', word: 'פִּיל', correctTranslation: 'Elephant', distractors: ['Lion', 'Tiger', 'Bear'], imagePrompt: 'grey elephant', hebrewHint: 'חיה ענקית ואפורה עם חדק ארוך' },
    { id: 'c10', word: 'מִטָּה', correctTranslation: 'Bed', distractors: ['Chair', 'Table', 'Sofa'], imagePrompt: 'bedroom bed', hebrewHint: 'ישנים עליה בלילה בחדר השינה' },
    { id: 'c11', word: 'אִישׁ', correctTranslation: 'Man', distractors: ['Boy', 'Girl', 'Woman'], imagePrompt: 'standing man', hebrewHint: 'בן אדם מבוגר, זכר' },
    { id: 'c12', word: 'פִּיָּה', correctTranslation: 'Fairy', distractors: ['Witch', 'Queen', 'Princess'], imagePrompt: 'magical fairy', hebrewHint: 'דמות קסומה מסיפורים, בדרך כלל עם כנפיים' }
  ],
  [VowelType.SEGOL]: [
    { id: 's1', word: 'יֶלֶד', correctTranslation: 'Boy', distractors: ['Girl', 'Man', 'Woman'], imagePrompt: 'young boy', hebrewHint: 'בן צעיר, לא מבוגר' },
    { id: 's2', word: 'כֶּלֶב', correctTranslation: 'Dog', distractors: ['Cat', 'Mouse', 'Bird'], imagePrompt: 'happy dog', hebrewHint: 'חיה שנובחת והיא החבר הכי טוב של האדם' },
    { id: 's3', word: 'סֵפֶר', correctTranslation: 'Book', distractors: ['Paper', 'Pencil', 'Bag'], imagePrompt: 'reading book', hebrewHint: 'קוראים בו סיפורים ולומדים ממנו דברים' },
    { id: 's4', word: 'דֶּלֶת', correctTranslation: 'Door', distractors: ['Window', 'Wall', 'Roof'], imagePrompt: 'house door', hebrewHint: 'פותחים וסוגרים אותה כדי להיכנס לחדר' },
    { id: 's5', word: 'לֶחֶם', correctTranslation: 'Bread', distractors: ['Cake', 'Cookie', 'Pie'], imagePrompt: 'loaf of bread', hebrewHint: 'אוכל בסיסי שעשוי מקמח, מכינים ממנו כריכים' },
    { id: 's6', word: 'עֵט', correctTranslation: 'Pen', distractors: ['Pencil', 'Marker', 'Brush'], imagePrompt: 'writing pen', hebrewHint: 'כלי כתיבה עם דיו שלא נמחק' },
    { id: 's7', word: 'חֶדֶר', correctTranslation: 'Room', distractors: ['House', 'Garden', 'Street'], imagePrompt: 'bedroom interior', hebrewHint: 'חלק בתוך הבית, כמו סלון או מקום שינה' },
    { id: 's8', word: 'מֶלֶךְ', correctTranslation: 'King', distractors: ['Queen', 'Prince', 'Knight'], imagePrompt: 'king crown', hebrewHint: 'שליט של ממלכה, חובש כתר על הראש' },
    { id: 's9', word: 'שֶׁמֶשׁ', correctTranslation: 'Sun', distractors: ['Moon', 'Star', 'Cloud'], imagePrompt: 'bright sun', hebrewHint: 'מאירה ומחממת אותנו ביום בשמיים' },
    { id: 's10', word: 'דֶּשֶׁא', correctTranslation: 'Grass', distractors: ['Tree', 'Flower', 'Bush'], imagePrompt: 'green grass', hebrewHint: 'צמח ירוק ונמוך שגדל בגינה ואפשר לדרוך עליו' },
    { id: 's11', word: 'גֶּשֶׁם', correctTranslation: 'Rain', distractors: ['Snow', 'Wind', 'Sun'], imagePrompt: 'rain cloud', hebrewHint: 'טיפות מים שיורדות מהעננים בחורף' },
    { id: 's12', word: 'נֶכֶד', correctTranslation: 'Grandson', distractors: ['Son', 'Father', 'Grandpa'], imagePrompt: 'happy grandson', hebrewHint: 'הבן של הבן או הבת של סבא וסבתא' }
  ],
  [VowelType.CHOLAM]: [
    { id: 'o1', word: 'שָׁלוֹם', correctTranslation: 'Hello', distractors: ['Goodbye', 'Thanks', 'Please'], imagePrompt: 'waving hello', hebrewHint: 'מילה שאומרים כשפוגשים מישהו או נפרדים ממנו' },
    { id: 'o2', word: 'אוֹר', correctTranslation: 'Light', distractors: ['Dark', 'Night', 'Sun'], imagePrompt: 'light bulb', hebrewHint: 'ההפך מחושך, עוזר לנו לראות' },
    { id: 'o3', word: 'דֹּב', correctTranslation: 'Bear', distractors: ['Lion', 'Tiger', 'Cat'], imagePrompt: 'brown bear', hebrewHint: 'חיה גדולה וחזקה שאוהבת דבש' },
    { id: 'o4', word: 'חָלוֹן', correctTranslation: 'Window', distractors: ['Door', 'Wall', 'Floor'], imagePrompt: 'house window', hebrewHint: 'פתח בקיר עם זכוכית שדרכו נכנס אור' },
    { id: 'o5', word: 'יוֹם', correctTranslation: 'Day', distractors: ['Night', 'Morning', 'Evening'], imagePrompt: 'sunny day', hebrewHint: 'הזמן שיש אור בחוץ, ההפך מלילה' },
    { id: 'o6', word: 'קוֹל', correctTranslation: 'Voice', distractors: ['Sound', 'Music', 'Noise'], imagePrompt: 'singing mouth', hebrewHint: 'מה ששומעים כשמישהו מדבר או שר' },
    { id: 'o7', word: 'חוֹל', correctTranslation: 'Sand', distractors: ['Dirt', 'Mud', 'Grass'], imagePrompt: 'beach sand', hebrewHint: 'גרגירים צהובים שיש בחוף הים ובארגז המשחקים' },
    { id: 'o8', word: 'אֲדוֹם', correctTranslation: 'Red', distractors: ['Blue', 'Green', 'Yellow'], imagePrompt: 'red color splash', hebrewHint: 'צבע של תות, עגבניה ודם' },
    { id: 'o9', word: 'שָׁעוֹן', correctTranslation: 'Clock', distractors: ['Watch', 'Time', 'Hour'], imagePrompt: 'wall clock', hebrewHint: 'מכשיר שמראה לנו מה השעה' },
    { id: 'o10', word: 'בַּלּוֹן', correctTranslation: 'Balloon', distractors: ['Ball', 'Kite', 'Toy'], imagePrompt: 'red balloon', hebrewHint: 'צעצוע מתנפח וצבעוני שיש בימי הולדת' },
    { id: 'o11', word: 'מָטוֹס', correctTranslation: 'Airplane', distractors: ['Car', 'Bus', 'Train'], imagePrompt: 'flying airplane', hebrewHint: 'כלי תחבורה עם כנפיים שטס בשמיים' },
    { id: 'o12', word: 'אֲרוֹן', correctTranslation: 'Closet', distractors: ['Table', 'Chair', 'Bed'], imagePrompt: 'wooden closet', hebrewHint: 'רהיט שבו שומרים את הבגדים שלנו' }
  ],
  [VowelType.SHURUK]: [
    { id: 'u1', word: 'סוּס', correctTranslation: 'Horse', distractors: ['Cow', 'Sheep', 'Donkey'], imagePrompt: 'running horse', hebrewHint: 'חיה גדולה וחזקה שאפשר לרכוב עליה' },
    { id: 'u2', word: 'לוּל', correctTranslation: 'Coop', distractors: ['House', 'Barn', 'Field'], imagePrompt: 'chicken coop', hebrewHint: 'הבית של התרנגולות או מיטה לתינוק' },
    { id: 'u3', word: 'שׁוּק', correctTranslation: 'Market', distractors: ['School', 'Park', 'Home'], imagePrompt: 'fruit market', hebrewHint: 'מקום פתוח שבו קונים פירות וירקות טריים' },
    { id: 'u4', word: 'חָתוּל', correctTranslation: 'Cat', distractors: ['Dog', 'Mouse', 'Bird'], imagePrompt: 'orange cat', hebrewHint: 'חיה שאומרת "מיאו" ואוהבת חלב' },
    { id: 'u5', word: 'כְּלוּב', correctTranslation: 'Cage', distractors: ['Box', 'Bag', 'Room'], imagePrompt: 'bird cage', hebrewHint: 'בית סגור לחיות מחמד כמו אוגר או ציפור' },
    { id: 'u6', word: 'חֲנוּת', correctTranslation: 'Store', distractors: ['Market', 'Mall', 'Shop'], imagePrompt: 'store front', hebrewHint: 'מקום שבו קונים דברים כמו בגדים או משחקים' },
    { id: 'u7', word: 'סִפּוּר', correctTranslation: 'Story', distractors: ['Song', 'Poem', 'Book'], imagePrompt: 'open storybook', hebrewHint: 'מה שאבא או אמא קוראים לנו לפני השינה' },
    { id: 'u8', word: 'כַּדּוּר', correctTranslation: 'Ball', distractors: ['Bat', 'Glove', 'Net'], imagePrompt: 'soccer ball', hebrewHint: 'חפץ עגול שבועטים בו או זורקים אותו' },
    { id: 'u9', word: 'זְבוּב', correctTranslation: 'Fly', distractors: ['Bee', 'Ant', 'Bug'], imagePrompt: 'house fly', hebrewHint: 'חרק קטן ומעצבן שמזמזם ועף באוויר' },
    { id: 'u10', word: 'תַּנּוּר', correctTranslation: 'Oven', distractors: ['Stove', 'Microwave', 'Fridge'], imagePrompt: 'kitchen oven', hebrewHint: 'מכשיר במטבח שאופים בו עוגות' },
    { id: 'u11', word: 'שׁוּעָל', correctTranslation: 'Fox', distractors: ['Wolf', 'Dog', 'Cat'], imagePrompt: 'orange fox', hebrewHint: 'חיה ערמומית עם זנב ארוך שחיה ביער' },
    { id: 'u12', word: 'בַּקְבּוּק', correctTranslation: 'Bottle', distractors: ['Cup', 'Glass', 'Jug'], imagePrompt: 'water bottle', hebrewHint: 'כלי שיש בו מים או מיץ ואפשר לשתות ממנו' }
  ]
};

export const FALLBACK_RHYMES: RhymeQuestion[] = [
    { id: 'fr1', targetWord: 'חַלּוֹן', rhymeWord: 'בַּלּוֹן', distractors: ['שֻׁלְחָן', 'כִּסֵּא', 'בַּיִת'], hint: 'Window' },
    { id: 'fr2', targetWord: 'גַּג', rhymeWord: 'דָּג', distractors: ['סוּס', 'פַּרְפַּר', 'יָד'], hint: 'Roof' },
    { id: 'fr3', targetWord: 'קָטָן', rhymeWord: 'לָבָן', distractors: ['גָּדוֹל', 'אָדֹם', 'שָׁחֹר'], hint: 'Small' },
    { id: 'fr4', targetWord: 'פִּיל', rhymeWord: 'חָלִיל', distractors: ['קִיר', 'סִיר', 'שִׁיר'], hint: 'Elephant' },
    { id: 'fr5', targetWord: 'יָד', rhymeWord: 'כַּד', distractors: ['רֶגֶל', 'רֹאשׁ', 'בֶּטֶן'], hint: 'Hand' },
    { id: 'fr6', targetWord: 'שָׁעוֹן', rhymeWord: 'סַבּוֹן', distractors: ['בַּיִת', 'וִילוֹן', 'חַלּוֹן'], hint: 'Clock' },
    { id: 'fr7', targetWord: 'גִּיר', rhymeWord: 'שִׁיר', distractors: ['נְיָר', 'טּוּשׁ', 'צֶבַע'], hint: 'Chalk' },
    { id: 'fr8', targetWord: 'חָתוּל', rhymeWord: 'טִיּוּל', distractors: ['כֶּלֶב', 'בַּיִת', 'עֵץ'], hint: 'Cat' },
    { id: 'fr9', targetWord: 'כַּדּוּר', rhymeWord: 'תַּנּוּר', distractors: ['בַּלּוֹן', 'גַּלְגַּל', 'סִפּוּר'], hint: 'Ball' },
    { id: 'fr10', targetWord: 'מַפִּית', rhymeWord: 'כַּפִּית', distractors: ['צַלַּחַת', 'מַזְלֵג', 'סַכִּין'], hint: 'Napkin' },
    { id: 'fr11', targetWord: 'מַיִם', rhymeWord: 'שָׁמַיִם', distractors: ['אֲדָמָה', 'חוֹל', 'אֵשׁ'], hint: 'Water' },
    { id: 'fr12', targetWord: 'יָרֵחַ', rhymeWord: 'אוֹרֵחַ', distractors: ['שֶׁמֶשׁ', 'כּוֹכָב', 'לַיְלָה'], hint: 'Moon' },
    { id: 'fr13', targetWord: 'מָטוֹס', rhymeWord: 'כּוֹס', distractors: ['אוֹטוֹ', 'רַכֶּבֶת', 'סְפִינָה'], hint: 'Airplane' },
    { id: 'fr14', targetWord: 'גֶּזֶר', rhymeWord: 'סְוֶדֶר', distractors: ['מְלָפְפוֹן', 'עַגְבָנִיָּה', 'חַסָּה'], hint: 'Carrot' },
    { id: 'fr15', targetWord: 'סִיר', rhymeWord: 'קִיר', distractors: ['צַלַּחַת', 'כַּף', 'מַחֲבַת'], hint: 'Pot' },
    { id: 'fr16', targetWord: 'נֵר', rhymeWord: 'חָצֵר', distractors: ['אֵשׁ', 'עוּגָה', 'שֻׁלְחָן'], hint: 'Candle' },
    { id: 'fr17', targetWord: 'קַר', rhymeWord: 'הַר', distractors: ['חַם', 'יָם', 'חוֹל'], hint: 'Cold' },
    { id: 'fr18', targetWord: 'זַיִת', rhymeWord: 'בַּיִת', distractors: ['לֶחֶם', 'גְּבִינָה', 'בֵּיצָה'], hint: 'Olive' },
    { id: 'fr19', targetWord: 'שׁוֹפָר', rhymeWord: 'פַּרְפַּר', distractors: ['חֲצוֹצְרָה', 'תֹּף', 'גִּיטָרָה'], hint: 'Shofar' },
    { id: 'fr20', targetWord: 'בָּצָל', rhymeWord: 'צֵל', distractors: ['שׁוּם', 'פִּלְפֵּל', 'גֶּזֶר'], hint: 'Onion' },
    { id: 'fr21', targetWord: 'מַלְכָּה', rhymeWord: 'בְּרֵכָה', distractors: ['נְסִיכָה', 'כֶּתֶר', 'אַרְמוֹן'], hint: 'Queen' },
    { id: 'fr22', targetWord: 'חוֹל', rhymeWord: 'מִכְחוֹל', distractors: ['יָם', 'בּוֹץ', 'דֶּשֶׁא'], hint: 'Sand' },
    { id: 'fr23', targetWord: 'דֹּב', rhymeWord: 'רֹב', distractors: ['אֲרִי', 'נָמֵר', 'פִּיל'], hint: 'Bear' },
    { id: 'fr24', targetWord: 'סַפְסָל', rhymeWord: 'סַנְדָּל', distractors: ['כִּסֵּא', 'מִטָּה', 'שֻׁלְחָן'], hint: 'Bench' },
    { id: 'fr25', targetWord: 'שְׁבִיל', rhymeWord: 'מְעִיל', distractors: ['דֶּרֶךְ', 'כְּבִישׁ', 'רְחוֹב'], hint: 'Path' },
    { id: 'fr26', targetWord: 'שׁוֹמֵר', rhymeWord: 'נָמֵר', distractors: ['כֶּלֶב', 'חָתוּל', 'אַרְיֵה'], hint: 'Guard' },
    { id: 'fr27', targetWord: 'גַּמָּד', rhymeWord: 'יָד', distractors: ['רֹאשׁ', 'בֶּטֶן', 'גַּב'], hint: 'Dwarf' },
    { id: 'fr28', targetWord: 'מָרָק', rhymeWord: 'בָּרָק', distractors: ['עוּגָה', 'גֶּשֶׁם', 'רוּחַ'], hint: 'Soup' },
    { id: 'fr29', targetWord: 'חָלוֹם', rhymeWord: 'שָׁלוֹם', distractors: ['סִפּוּר', 'לַיְלָה', 'מִטָּה'], hint: 'Dream' },
    { id: 'fr30', targetWord: 'בָּנָה', rhymeWord: 'יְשֵׁנָה', distractors: ['אָכְלָה', 'רָצָה', 'שָׁרָה'], hint: 'Built' },
    { id: 'fr31', targetWord: 'שָׁקֵד', rhymeWord: 'רוֹקֵד', distractors: ['אֱגוֹז', 'יוֹשֵׁב', 'הוֹלֵךְ'], hint: 'Almond' },
    { id: 'fr32', targetWord: 'תּוֹת', rhymeWord: 'אוֹת', distractors: ['תַּפּוּחַ', 'סֵפֶר', 'מִילָה'], hint: 'Strawberry' },
    { id: 'fr33', targetWord: 'סֻכָּר', rhymeWord: 'יָקָר', distractors: ['מֶלַח', 'זָוֹל', 'מָתוֹק'], hint: 'Sugar' },
    { id: 'fr34', targetWord: 'גַּן', rhymeWord: 'עָנָן', distractors: ['בַּיִת', 'שֶׁמֶשׁ', 'אֲדָמָה'], hint: 'Garden' },
    { id: 'fr35', targetWord: 'שׁוּעָל', rhymeWord: 'מַעְגָּל', distractors: ['זְאֵב', 'רִבּוּעַ', 'מְשֻׁלָּשׁ'], hint: 'Fox' }
];

export const FALLBACK_TWISTERS = [
  {
    hebrew: 'שָׂרָה שָׁרָה שִׁיר שָׂמֵחַ',
    english: 'Sarah sang a happy song'
  },
  {
    hebrew: 'בַּקְבּוּק בְּלִי פְּקָק',
    english: 'A bottle without a cap'
  },
  {
    hebrew: 'גַּנָּן גִּדֵּל דָּגָן בַּגַּן',
    english: 'A gardener grew grain in the garden'
  },
  {
    hebrew: 'שִׁשָּׁה שְׁזִיפִים שְׁזוּפִים',
    english: 'Six tanned plums'
  },
  {
    hebrew: 'סוּס סִינִי סוֹחֵב שַׂק סוּכָּר',
    english: 'A Chinese horse carries a sack of sugar'
  },
  {
    hebrew: 'שׁוֹטֵר שׁוֹטֶה שׁוֹתֶה שׁוֹקוֹ',
    english: 'A foolish policeman drinks hot cocoa'
  },
  {
    hebrew: 'גַּד גִּדֵּל גְּדִי בַּגִּנָּה',
    english: 'Gad raised a goat in the garden'
  },
  {
    hebrew: 'זְבוּב זִמְזֵם בְּאָזְנֵי זִיזִי',
    english: 'A fly buzzed in Zizi\'s ears'
  },
  {
    hebrew: 'צִפּוֹר צִיְּצָה צִיּוּץ בְּצָהֳרַיִם',
    english: 'A bird chirped at noon'
  },
  {
    hebrew: 'טַבָּח מְבַשֵּׁל בַּמִּטְבָּח',
    english: 'A cook cooks in the kitchen'
  }
];

export const FALLBACK_SENTENCES = [
  {
    fullSentence: 'הַכֶּלֶב נוֹבֵחַ בֶּחָצֵר',
    sentenceWithBlank: 'הַכֶּלֶב ___ בֶּחָצֵר',
    missingWord: 'נוֹבֵחַ',
    distractors: ['יָשֵׁן', 'אוֹכֵל', 'קוֹפֵץ'],
    translation: 'The dog barks in the yard'
  },
  {
    fullSentence: 'הַחָתוּל שׁוֹתֶה חָלָב',
    sentenceWithBlank: 'הַחָתוּל ___ חָלָב',
    missingWord: 'שׁוֹתֶה',
    distractors: ['רוֹקֵד', 'נוֹפֵל', 'כּוֹתֵב'],
    translation: 'The cat drinks milk'
  },
  {
    fullSentence: 'הַיַּלְדָּה קוֹרֵאת סֵפֶר',
    sentenceWithBlank: 'הַיַּלְדָּה ___ סֵפֶר',
    missingWord: 'קוֹרֵאת',
    distractors: ['אוֹכֶלֶת', 'רָצָה', 'יוֹשֶׁבֶת'],
    translation: 'The girl reads a book'
  },
  {
    fullSentence: 'הַשֶּׁמֶשׁ זוֹרַחַת בַּשָּׁמַיִם',
    sentenceWithBlank: 'הַשֶּׁמֶשׁ ___ בַּשָּׁמַיִם',
    missingWord: 'זוֹרַחַת',
    distractors: ['נוֹפֶלֶת', 'בּוֹכָה', 'יְשֵׁנָה'],
    translation: 'The sun shines in the sky'
  },
  {
    fullSentence: 'הַצִּפּוֹר עָפָה בָּאֲוִיר',
    sentenceWithBlank: 'הַצִּפּוֹר ___ בָּאֲוִיר',
    missingWord: 'עָפָה',
    distractors: ['הוֹלֶכֶת', 'שׂוֹחָה', 'יְשֵׁנָה'],
    translation: 'The bird flies in the air'
  },
  {
    fullSentence: 'אַבָּא נוֹהֵג בָּאוֹטוֹ',
    sentenceWithBlank: 'אַבָּא ___ בָּאוֹטוֹ',
    missingWord: 'נוֹהֵג',
    distractors: ['אוֹכֵל', 'יָשֵׁן', 'קוֹרֵא'],
    translation: 'Dad drives the car'
  },
  {
    fullSentence: 'הַתִּינוֹק בּוֹכֶה בָּעֲרִיסָה',
    sentenceWithBlank: 'הַתִּינוֹק ___ בָּעֲרִיסָה',
    missingWord: 'בּוֹכֶה',
    distractors: ['צוֹחֵק', 'רָץ', 'שָׁר'],
    translation: 'The baby cries in the crib'
  },
  {
    fullSentence: 'הַדָּג שׂוֹחֶה בַּמַּיִם',
    sentenceWithBlank: 'הַדָּג ___ בַּמַּיִם',
    missingWord: 'שׂוֹחֶה',
    distractors: ['עָף', 'הוֹלֵךְ', 'מְדַבֵּר'],
    translation: 'The fish swims in the water'
  },
  {
    fullSentence: 'אִמָּא מְבַשֶּׁלֶת מָרָק',
    sentenceWithBlank: 'אִמָּא ___ מָרָק',
    missingWord: 'מְבַשֶּׁלֶת',
    distractors: ['נוֹהֶגֶת', 'קוֹרֵאת', 'יְשֵׁנָה'],
    translation: 'Mom cooks soup'
  },
  {
    fullSentence: 'הַיֶּלֶד מְשַׂחֵק בַּכַּדּוּר',
    sentenceWithBlank: 'הַיֶּלֶד ___ בַּכַּדּוּר',
    missingWord: 'מְשַׂחֵק',
    distractors: ['אוֹכֵל', 'יָשֵׁן', 'כּוֹתֵב'],
    translation: 'The boy plays with the ball'
  },
  {
    fullSentence: 'הַפֶּרַח פּוֹרֵחַ בַּגִּנָּה',
    sentenceWithBlank: 'הַפֶּרַח ___ בַּגִּנָּה',
    missingWord: 'פּוֹרֵחַ',
    distractors: ['עָף', 'בּוֹכֶה', 'נוֹפֵל'],
    translation: 'The flower blooms in the garden'
  },
  {
    fullSentence: 'אֲנִי אוֹהֵב גְּלִידָה',
    sentenceWithBlank: 'אֲנִי ___ גְּלִידָה',
    missingWord: 'אוֹהֵב',
    distractors: ['כּוֹעֵס', 'יוֹשֵׁב', 'רָץ'],
    translation: 'I love ice cream'
  },
  {
    fullSentence: 'הַסּוּס דּוֹהֵר בַּשָּׂדֶה',
    sentenceWithBlank: 'הַסּוּס ___ בַּשָּׂדֶה',
    missingWord: 'דּוֹהֵר',
    distractors: ['שׂוֹחֶה', 'יוֹשֵׁב', 'קוֹרֵא'],
    translation: 'The horse gallops in the field'
  },
  {
    fullSentence: 'הַמּוֹרָה כּוֹתֶבֶת עַל הַלּוּחַ',
    sentenceWithBlank: 'הַמּוֹרָה ___ עַל הַלּוּחַ',
    missingWord: 'כּוֹתֶבֶת',
    distractors: ['אוֹכֶלֶת', 'רָצָה', 'יְשֵׁנָה'],
    translation: 'The teacher writes on the board'
  },
  {
    fullSentence: 'הַגֶּשֶׁם יוֹרֵד מֵהֶעָנָן',
    sentenceWithBlank: 'הַגֶּשֶׁם ___ מֵהֶעָנָן',
    missingWord: 'יוֹרֵד',
    distractors: ['עוֹלֶה', 'בּוֹכָה', 'יָשֵׁן'],
    translation: 'The rain falls from the cloud'
  },
  {
    fullSentence: 'הַיֶּלֶד רָץ בַּפָּארְק',
    sentenceWithBlank: 'הַיֶּלֶד ___ בַּפָּארְק',
    missingWord: 'רָץ',
    distractors: ['יָשֵׁן', 'אוֹכֵל', 'יוֹשֵׁב'],
    translation: 'The boy runs in the park'
  },
  {
    fullSentence: 'הַיַּלְדָּה שָׁרָה שִׁיר',
    sentenceWithBlank: 'הַיַּלְדָּה ___ שִׁיר',
    missingWord: 'שָׁרָה',
    distractors: ['אוֹכֶלֶת', 'רָצָה', 'נוֹהֶגֶת'],
    translation: 'The girl sings a song'
  },
  {
    fullSentence: 'סָבְתָא אוֹפָה עוּגָה',
    sentenceWithBlank: 'סָבְתָא ___ עוּגָה',
    missingWord: 'אוֹפָה',
    distractors: ['רָצָה', 'יְשֵׁנָה', 'שׁוֹתָה'],
    translation: 'Grandma bakes a cake'
  },
  {
    fullSentence: 'הַשָּׁמַיִם כְּחֻלִּים וִיפִים',
    sentenceWithBlank: 'הַשָּׁמַיִם ___ וִיפִים',
    missingWord: 'כְּחֻלִּים',
    distractors: ['יְרֻקִּים', 'אֲדֻמִּים', 'קְטַנִּים'],
    translation: 'The sky is blue and beautiful'
  },
  {
    fullSentence: 'אֲנִי אוֹכֵל תַּפּוּחַ',
    sentenceWithBlank: 'אֲנִי ___ תַּפּוּחַ',
    missingWord: 'אוֹכֵל',
    distractors: ['שׁוֹתֶה', 'רָץ', 'יוֹשֵׁב'],
    translation: 'I eat an apple'
  },
  {
    fullSentence: 'הַכֶּלֶב יָשֵׁן עַל הַשָּׁטִיחַ',
    sentenceWithBlank: 'הַכֶּלֶב ___ עַל הַשָּׁטִיחַ',
    missingWord: 'יָשֵׁן',
    distractors: ['רָץ', 'אוֹכֵל', 'נוֹבֵחַ'],
    translation: 'The dog sleeps on the rug'
  },
  {
    fullSentence: 'הַחָתוּל מְטַפֵּס עַל הָעֵץ',
    sentenceWithBlank: 'הַחָתוּל ___ עַל הָעֵץ',
    missingWord: 'מְטַפֵּס',
    distractors: ['שׂוֹחֶה', 'נוֹפֵל', 'הוֹלֵךְ'],
    translation: 'The cat climbs the tree'
  },
  {
    fullSentence: 'הַצִּפּוֹר מְצַיֶּצֶת בַּבֹּקֶר',
    sentenceWithBlank: 'הַצִּפּוֹר ___ בַּבֹּקֶר',
    missingWord: 'מְצַיֶּצֶת',
    distractors: ['נוֹבַחַת', 'מְדַבֶּרֶת', 'רָצָה'],
    translation: 'The bird chirps in the morning'
  },
  {
    fullSentence: 'אֲנַחְנוּ הוֹלְכִים לְבֵית הַסֵּפֶר',
    sentenceWithBlank: 'אֲנַחְנוּ ___ לְבֵית הַסֵּפֶר',
    missingWord: 'הוֹלְכִים',
    distractors: ['יְשֵׁנִים', 'אוֹכְלִים', 'עָפִים'],
    translation: 'We go to school'
  },
  {
    fullSentence: 'הַמּוֹרָה מְלַמֶּדֶת חֶשְׁבּוֹן',
    sentenceWithBlank: 'הַמּוֹרָה ___ חֶשְׁבּוֹן',
    missingWord: 'מְלַמֶּדֶת',
    distractors: ['אוֹכֶלֶת', 'יְשֵׁנָה', 'נוֹהֶגֶת'],
    translation: 'The teacher teaches math'
  },
  {
    fullSentence: 'הַתִּינוֹק שׁוֹתֶה מַיִם',
    sentenceWithBlank: 'הַתִּינוֹק ___ מַיִם',
    missingWord: 'שׁוֹתֶה',
    distractors: ['אוֹכֵל', 'הוֹלֵךְ', 'מְדַבֵּר'],
    translation: 'The baby drinks water'
  },
  {
    fullSentence: 'הַמְּכוֹנִית נוֹסַעַת מַהֵר',
    sentenceWithBlank: 'הַמְּכוֹנִית ___ מַהֵר',
    missingWord: 'נוֹסַעַת',
    distractors: ['הוֹלֶכֶת', 'עָפָה', 'יְשֵׁנָה'],
    translation: 'The car drives fast'
  },
  {
    fullSentence: 'הַפֶּרַח אָדוֹם וְיָפֶה',
    sentenceWithBlank: 'הַפֶּרַח ___ וְיָפֶה',
    missingWord: 'אָדוֹם',
    distractors: ['כָּחֹל', 'גָּדוֹל', 'עָצוּב'],
    translation: 'The flower is red and beautiful'
  },
  {
    fullSentence: 'הַדֶּשֶׁא יָרֹק בַּגִּנָּה',
    sentenceWithBlank: 'הַדֶּשֶׁא ___ בַּגִּנָּה',
    missingWord: 'יָרֹק',
    distractors: ['אָדוֹם', 'כָּחֹל', 'לָבָן'],
    translation: 'The grass is green in the garden'
  },
  {
    fullSentence: 'אֲנִי רוֹחֵץ יָדַיִם',
    sentenceWithBlank: 'אֲנִי ___ יָדַיִם',
    missingWord: 'רוֹחֵץ',
    distractors: ['אוֹכֵל', 'רָץ', 'יָשֵׁן'],
    translation: 'I wash my hands'
  },
  {
    fullSentence: 'אֲנִי מְצַחְצֵחַ שִׁנַּיִם',
    sentenceWithBlank: 'אֲנִי ___ שִׁנַּיִם',
    missingWord: 'מְצַחְצֵחַ',
    distractors: ['אוֹכֵל', 'שׁוֹתֶה', 'רוֹחֵץ'],
    translation: 'I brush my teeth'
  },
  {
    fullSentence: 'הָרוּחַ נוֹשֶׁבֶת חָזָק',
    sentenceWithBlank: 'הָרוּחַ ___ חָזָק',
    missingWord: 'נוֹשֶׁבֶת',
    distractors: ['הוֹלֶכֶת', 'יוֹשֶׁבֶת', 'אוֹכֶלֶת'],
    translation: 'The wind blows hard'
  },
  {
    fullSentence: 'הַיָּרֵחַ מֵאִיר בַּלַּיְלָה',
    sentenceWithBlank: 'הַיָּרֵחַ ___ בַּלַּיְלָה',
    missingWord: 'מֵאִיר',
    distractors: ['יָשֵׁן', 'בּוֹכֶה', 'אוֹכֵל'],
    translation: 'The moon shines at night'
  },
  {
    fullSentence: 'הַכּוֹכָבִים מְנַצְנְצִים בַּשָּׁמַיִם',
    sentenceWithBlank: 'הַכּוֹכָבִים ___ בַּשָּׁמַיִם',
    missingWord: 'מְנַצְנְצִים',
    distractors: ['נוֹפְלִים', 'בּוֹכִים', 'הוֹלְכִים'],
    translation: 'The stars twinkle in the sky'
  },
  {
    fullSentence: 'אֲנִי חוֹבֵשׁ כּוֹבַע',
    sentenceWithBlank: 'אֲנִי ___ כּוֹבַע',
    missingWord: 'חוֹבֵשׁ',
    distractors: ['לוֹבֵשׁ', 'נוֹעֵל', 'אוֹכֵל'],
    translation: 'I wear a hat'
  },
  {
    fullSentence: 'הִיא לוֹבֶשֶׁת שִׂמְלָה',
    sentenceWithBlank: 'הִיא ___ שִׂמְלָה',
    missingWord: 'לוֹבֶשֶׁת',
    distractors: ['חוֹבֶשֶׁת', 'נוֹעֶלֶת', 'אוֹכֶלֶת'],
    translation: 'She wears a dress'
  },
  {
    fullSentence: 'הוּא נוֹעֵל נַעֲלַיִם',
    sentenceWithBlank: 'הוּא ___ נַעֲלַיִם',
    missingWord: 'נוֹעֵל',
    distractors: ['לוֹבֵשׁ', 'חוֹבֵשׁ', 'שׁוֹתֶה'],
    translation: 'He puts on shoes'
  },
  {
    fullSentence: 'הַכַּדּוּר עָגֹל',
    sentenceWithBlank: 'הַכַּדּוּר ___',
    missingWord: 'עָגֹל',
    distractors: ['מְרֻבָּע', 'יָשָׁר', 'שָׁטוּחַ'],
    translation: 'The ball is round'
  },
  {
    fullSentence: 'הַשֻּׁלְחָן גָּדוֹל',
    sentenceWithBlank: 'הַשֻּׁלְחָן ___',
    missingWord: 'גָּדוֹל',
    distractors: ['קָטָן', 'שָׂמֵחַ', 'עָצוּב'],
    translation: 'The table is big'
  },
  {
    fullSentence: 'הַכִּיסֵא קָטָן',
    sentenceWithBlank: 'הַכִּיסֵא ___',
    missingWord: 'קָטָן',
    distractors: ['גָּדוֹל', 'גָּבוֹהַּ', 'מַהֵר'],
    translation: 'The chair is small'
  },
  {
    fullSentence: 'אֲנִי אוֹהֵב שׁוֹקוֹלָד',
    sentenceWithBlank: 'אֲנִי ___ שׁוֹקוֹלָד',
    missingWord: 'אוֹהֵב',
    distractors: ['שׂוֹנֵא', 'בּוֹכֶה', 'רָץ'],
    translation: 'I like chocolate'
  },
  {
    fullSentence: 'הַפִּיצָה טְעִימָה',
    sentenceWithBlank: 'הַפִּיצָה ___',
    missingWord: 'טְעִימָה',
    distractors: ['עֲצוּבָה', 'מְהִירָה', 'כְּחֻלָּה'],
    translation: 'The pizza is tasty'
  },
  {
    fullSentence: 'הַמַּיִם קָרִים',
    sentenceWithBlank: 'הַמַּיִם ___',
    missingWord: 'קָרִים',
    distractors: ['חַמִּים', 'יְבֵשִׁים', 'מְתוּקִים'],
    translation: 'The water is cold'
  },
  {
    fullSentence: 'הַתֵּה חַם',
    sentenceWithBlank: 'הַתֵּה ___',
    missingWord: 'חַם',
    distractors: ['קַר', 'קָשֶׁה', 'גָּדוֹל'],
    translation: 'The tea is hot'
  },
  {
    fullSentence: 'הָאַרְיֵה שׁוֹאֵג בַּיַּעַר',
    sentenceWithBlank: 'הָאַרְיֵה ___ בַּיַּעַר',
    missingWord: 'שׁוֹאֵג',
    distractors: ['מְיַלֵּל', 'נוֹבֵחַ', 'מְצַיֵּץ'],
    translation: 'The lion roars in the forest'
  },
  {
    fullSentence: 'הַפִּיל עֲנָקִי',
    sentenceWithBlank: 'הַפִּיל ___',
    missingWord: 'עֲנָקִי',
    distractors: ['קְטַנְטַן', 'מָהִיר', 'קַל'],
    translation: 'The elephant is huge'
  },
  {
    fullSentence: 'הָעַכְבָּר קְטַנְטַן',
    sentenceWithBlank: 'הָעַכְבָּר ___',
    missingWord: 'קְטַנְטַן',
    distractors: ['גָּדוֹל', 'כָּבֵד', 'גָּבוֹהַּ'],
    translation: 'The mouse is tiny'
  },
  {
    fullSentence: 'הַנָּחָשׁ זוֹחֵל עַל הָאֲדָמָה',
    sentenceWithBlank: 'הַנָּחָשׁ ___ עַל הָאֲדָמָה',
    missingWord: 'זוֹחֵל',
    distractors: ['הוֹלֵךְ', 'עָף', 'רָץ'],
    translation: 'The snake crawls on the ground'
  },
  {
    fullSentence: 'הַפַּרְפַּר עָף לַפֶּרַח',
    sentenceWithBlank: 'הַפַּרְפַּר ___ לַפֶּרַח',
    missingWord: 'עָף',
    distractors: ['שׂוֹחֶה', 'זוֹחֵל', 'נוֹבֵחַ'],
    translation: 'The butterfly flies to the flower'
  },
  {
    fullSentence: 'אֲנִי קוֹרֵא סִפּוּר',
    sentenceWithBlank: 'אֲנִי ___ סִפּוּר',
    missingWord: 'קוֹרֵא',
    distractors: ['אוֹכֵל', 'יָשֵׁן', 'רָץ'],
    translation: 'I read a story'
  },
  {
    fullSentence: 'הִיא מְצַיֶּרֶת צִיּוּר',
    sentenceWithBlank: 'הִיא ___ צִיּוּר',
    missingWord: 'מְצַיֶּרֶת',
    distractors: ['אוֹכֶלֶת', 'קוֹרֵאת', 'יְשֵׁנָה'],
    translation: 'She draws a picture'
  },
  {
    fullSentence: 'אֲנַחְנוּ מְשַׂחֲקִים מִשְׂחָק',
    sentenceWithBlank: 'אֲנַחְנוּ ___ מִשְׂחָק',
    missingWord: 'מְשַׂחֲקִים',
    distractors: ['יְשֵׁנִים', 'אוֹכְלִים', 'בּוֹכִים'],
    translation: 'We play a game'
  },
  {
    fullSentence: 'הַשָּׁעוֹן מְתַקְתֵּק',
    sentenceWithBlank: 'הַשָּׁעוֹן ___',
    missingWord: 'מְתַקְתֵּק',
    distractors: ['נוֹבֵחַ', 'מְיַלֵּל', 'שָׁר'],
    translation: 'The clock ticks'
  },
  {
    fullSentence: 'הַנֵּר דּוֹלֵק',
    sentenceWithBlank: 'הַנֵּר ___',
    missingWord: 'דּוֹלֵק',
    distractors: ['רָטֹב', 'יָשֵׁן', 'קַר'],
    translation: 'The candle is burning'
  },
  {
    fullSentence: 'הַמַּגֶּבֶת יְבֵשָׁה',
    sentenceWithBlank: 'הַמַּגֶּבֶת ___',
    missingWord: 'יְבֵשָׁה',
    distractors: ['רְטֻבָּה', 'מְהִירָה', 'עֲצוּבָה'],
    translation: 'The towel is dry'
  },
  {
    fullSentence: 'אֲנִי מַרְגִּישׁ שָׂמֵחַ',
    sentenceWithBlank: 'אֲנִי מַרְגִּישׁ ___',
    missingWord: 'שָׂמֵחַ',
    distractors: ['עָצוּב', 'כּוֹעֵס', 'עָיֵף'],
    translation: 'I feel happy'
  }
];

export const FALLBACK_SENTENCES_ENGLISH = [
  {
    fullSentence: 'The dog barks in the yard',
    sentenceWithBlank: 'The dog ___ in the yard',
    missingWord: 'barks',
    distractors: ['sleeps', 'eats', 'jumps'],
    translation: 'הַכֶּלֶב נוֹבֵחַ בֶּחָצֵר'
  },
  {
    fullSentence: 'The cat drinks milk',
    sentenceWithBlank: 'The cat ___ milk',
    missingWord: 'drinks',
    distractors: ['dances', 'falls', 'writes'],
    translation: 'הַחָתוּל שׁוֹתֶה חָלָב'
  },
  {
    fullSentence: 'The sun shines in the sky',
    sentenceWithBlank: 'The sun ___ in the sky',
    missingWord: 'shines',
    distractors: ['falls', 'cries', 'sleeps'],
    translation: 'הַשֶּׁמֶשׁ זוֹרַחַת בַּשָּׁמַיִם'
  },
  {
    fullSentence: 'I eat an apple',
    sentenceWithBlank: 'I ___ an apple',
    missingWord: 'eat',
    distractors: ['drink', 'run', 'sit'],
    translation: 'אֲנִי אוֹכֵל תַּפּוּחַ'
  },
  {
    fullSentence: 'The ball is round',
    sentenceWithBlank: 'The ball is ___',
    missingWord: 'round',
    distractors: ['square', 'straight', 'flat'],
    translation: 'הַכַּדּוּר עָגֹל'
  }
];

export const FALLBACK_HANGMAN_WORDS = [
    { word: 'מַיִם', hint: 'Water', hebrewHint: 'כשצמאים , שותים אותי', imagePrompt: 'glass of water' },
    { word: 'שֶׁמֶשׁ', hint: 'Sun', hebrewHint: 'כדור צהוב גדול בשמיים שמאיר ביום ומחמם אותנו', imagePrompt: 'sun' },
    { word: 'פַּרְפַּר', hint: 'Butterfly', hebrewHint: 'חיה קטנה עם כנפיים צבעוניות שעפה בין פרחים', imagePrompt: 'butterfly' },
    { word: 'כַּדּוּר', hint: 'Ball', hebrewHint: 'חפץ עגול שבועטים בו או זורקים אותו במשחק', imagePrompt: 'ball' },
    { word: 'בַּיִת', hint: 'House', hebrewHint: 'מקום עם קירות וגג שבו גרים אנשים ומשפחות', imagePrompt: 'house' },
    { word: 'גְּלִידָה', hint: 'Ice Cream', hebrewHint: 'קינוח קר, מתוק וטעים שאוכלים בגביע או בכוס בקיץ', imagePrompt: 'ice cream' },
    { word: 'פֶּרַח', hint: 'Flower', hebrewHint: 'הוא צומח באדמה, יש לו עלי כותרת צבעוניים וריח נעים', imagePrompt: 'flower' },
    { word: 'עֵץ', hint: 'Tree', hebrewHint: 'הוא גבוה וחזק, יש לו גזע וענפים ירוקים, וציפורים גרות בו', imagePrompt: 'tree' },
    { word: 'סֵפֶר', hint: 'Book', hebrewHint: 'יש לו דפים וכריכה, ואנחנו קוראים בו סיפורים מעניינים', imagePrompt: 'book' },
    { word: 'תַּפּוּחַ', hint: 'Apple', hebrewHint: 'פרי עגול ומתוק שגדל על העץ, יכול להיות אדום או ירוק', imagePrompt: 'apple' },
    { word: 'מְכוֹנִית', hint: 'Car', hebrewHint: 'כלי תחבורה עם ארבעה גלגלים שלוקח אותנו ממקום למקום', imagePrompt: 'car' },
    { word: 'כֶּלֶב', hint: 'Dog', hebrewHint: 'חיה חמודה שנובחת ונחשבת לחבר הכי טוב של האדם', imagePrompt: 'dog' },
    { word: 'חָתוּל', hint: 'Cat', hebrewHint: 'חיה שאומרת מיאו, יש לה שפם והיא אוהבת חלב', imagePrompt: 'cat' },
    { word: 'שָׁעוֹן', hint: 'Clock', hebrewHint: 'מכשיר שמראה לנו מה השעה ויש לו מחוגים', imagePrompt: 'clock' },
    { word: 'נַעַל', hint: 'Shoe', hebrewHint: 'לובשים אותה על הרגל כדי להגן עליה כשהולכים', imagePrompt: 'shoe' },
    { word: 'כִּסֵּא', hint: 'Chair', hebrewHint: 'רהיט שיש לו ארבע רגליים ויושבים עליו', imagePrompt: 'chair' },
    { word: 'מִטָּה', hint: 'Bed', hebrewHint: 'רהיט נוח שישנים עליו בלילה בחדר השינה', imagePrompt: 'bed' },
    { word: 'בָּנָנָה', hint: 'Banana', hebrewHint: 'פרי צהוב וארוך שקופים אוהבים לאכול', imagePrompt: 'banana' },
    { word: 'מַסְרֵק', hint: 'Comb', hebrewHint: 'מסדרים איתו את השיער כדי שיהיה יפה', imagePrompt: 'comb' },
    { word: 'מַטְרִיָּה', hint: 'Umbrella', hebrewHint: 'פותחים אותה מעל הראש כשיורד גשם כדי לא להירטב', imagePrompt: 'umbrella' },
    { word: 'אוֹפַנַּיִם', hint: 'Bicycle', hebrewHint: 'כלי רכב עם שני גלגלים שצריך לדווש בו כדי לנסוע', imagePrompt: 'bicycle' },
    { word: 'טֶלֶפוֹן', hint: 'Phone', hebrewHint: 'מכשיר שאפשר לדבר איתו עם אנשים רחוקים', imagePrompt: 'phone' },
    { word: 'מַחְשֵׁב', hint: 'Computer', hebrewHint: 'מכשיר אלקטרוני שיש לו מסך ומקלדת ואפשר לשחק בו', imagePrompt: 'computer' },
    { word: 'שֻׁלְחָן', hint: 'Table', hebrewHint: 'רהיט שאוכלים עליו ארוחות או מכינים עליו שיעורים', imagePrompt: 'table' },
    { word: 'גִּיר', hint: 'Chalk', hebrewHint: 'אפשר לצייר איתו על הלוח או על המדרכה', imagePrompt: 'chalk' },
    { word: 'עִפָּרוֹן', hint: 'Pencil', hebrewHint: 'כותבים ומציירים איתו על דף, ואפשר למחוק אם טועים', imagePrompt: 'pencil' }
];