// Prototype gesture vocabulary — intended for demonstration. NOT a real sign-language standard.
// f = finger pattern [thumb, index, middle, ring, pinky] (1 = extended). Add a new entry to add a gesture.
// Assumes the hand is roughly upright and facing the camera.
export const GESTURES = [
  { id: 'HELLO', text: 'Hello', f: [1,1,1,1,1], hint: 'Open palm, all fingers spread', suggest: ['Hello, how are you?', 'Hello.'] },
  { id: 'STOP', text: 'Stop', f: [0,1,1,1,1], hint: 'Four fingers up, thumb tucked', suggest: ['Stop.', 'Please wait.'] },
  { id: 'YES', text: 'Yes', f: [1,0,0,0,0], thumb: 'up', hint: 'Thumbs up', suggest: ['Yes.', 'Good.'] },
  { id: 'BAD', text: 'Bad', f: [1,0,0,0,0], thumb: 'down', hint: 'Thumbs down', suggest: ['Bad.', 'I do not feel well.'] },
  { id: 'NO', text: 'No', f: [0,1,1,0,0], hint: 'Index + middle finger up', suggest: ['No.', 'No, thank you.'] },
  { id: 'HELP', text: 'Help', f: [0,1,0,0,0], hint: 'Index finger up', suggest: ['I need help.', 'Please call someone.', 'I need assistance.'] },
  { id: 'WATER', text: 'Water', f: [0,1,1,1,0], hint: 'Three fingers up (W)', suggest: ['I need water.', 'Can I have some water?'] },
  { id: 'PLEASE', text: 'Please', f: [0,0,0,0,0], hint: 'Closed fist', suggest: ['Please.', 'Please help me.'] },
  { id: 'THANKS', text: 'Thank you', f: [1,1,0,0,0], hint: 'Thumb + index (L shape)', suggest: ['Thank you.'] },
  { id: 'LOVE', text: 'I love you', f: [1,1,0,0,1], hint: 'Thumb, index and pinky up', suggest: ['I love you.'] },
  { id: 'GOODBYE', text: 'Goodbye', f: [0,0,0,0,1], hint: 'Pinky finger up', suggest: ['Goodbye.', 'See you later.'] },
  { id: 'OK', text: 'Okay', f: null, hint: 'Thumb + index pinch, other fingers up', suggest: ['Okay.', 'I understand.'] },
];
export const byId = (id) => GESTURES.find((g) => g.id === id);

// ---------------------------------------------------------------------------
// Sign OUTPUT languages (only the recognized-gesture text is translated; speech recognition is separate).
// Translations are stored locally: no API, no key. Only the fixed prototype vocabulary is translated.
// ---------------------------------------------------------------------------
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'mr', name: 'मराठी' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'ଓଡ଼ିଆ' },
];

// To add a gesture: add an entry here AND in GESTURES. Missing languages fall back to English.
export const TRANSLATIONS = {
  HELLO: { en: 'Hello', ta: 'வணக்கம்', hi: 'नमस्ते', te: 'నమస్కారం', kn: 'ನಮಸ್ಕಾರ', ml: 'നമസ്കാരം', bn: 'নমস্কার', mr: 'नमस्कार', gu: 'નમસ્તે', pa: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', or: 'ନମସ୍କାର' },
  STOP: { en: 'Stop', ta: 'நிறுத்து', hi: 'रुको', te: 'ఆగండి', kn: 'ನಿಲ್ಲಿ', ml: 'നിർത്തൂ', bn: 'থামুন', mr: 'थांबा', gu: 'રોકો', pa: 'ਰੁਕੋ', or: 'ରୁହନ୍ତୁ' },
  YES: { en: 'Yes', ta: 'ஆம்', hi: 'हाँ', te: 'అవును', kn: 'ಹೌದು', ml: 'അതെ', bn: 'হ্যাঁ', mr: 'होय', gu: 'હા', pa: 'ਹਾਂ', or: 'ହଁ' },
  BAD: { en: 'Bad', ta: 'மோசம்', hi: 'बुरा', te: 'చెడు', kn: 'ಕೆಟ್ಟದ್ದು', ml: 'മോശം', bn: 'খারাপ', mr: 'वाईट', gu: 'ખરાબ', pa: 'ਮਾੜਾ', or: 'ଖରାପ' },
  NO: { en: 'No', ta: 'இல்லை', hi: 'नहीं', te: 'కాదు', kn: 'ಇಲ್ಲ', ml: 'ഇല്ല', bn: 'না', mr: 'नाही', gu: 'ના', pa: 'ਨਹੀਂ', or: 'ନାହିଁ' },
  HELP: { en: 'Help', ta: 'உதவி', hi: 'मदद', te: 'సహాయం', kn: 'ಸಹಾಯ', ml: 'സഹായം', bn: 'সাহায্য', mr: 'मदत', gu: 'મદદ', pa: 'ਮਦਦ', or: 'ସାହାଯ୍ୟ' },
  WATER: { en: 'Water', ta: 'தண்ணீர்', hi: 'पानी', te: 'నీరు', kn: 'ನೀರು', ml: 'വെള്ളം', bn: 'জল', mr: 'पाणी', gu: 'પાણી', pa: 'ਪਾਣੀ', or: 'ପାଣି' },
  PLEASE: { en: 'Please', ta: 'தயவுசெய்து', hi: 'कृपया', te: 'దయచేసి', kn: 'ದಯವಿಟ್ಟು', ml: 'ദയവായി', bn: 'দয়া করে', mr: 'कृपया', gu: 'કૃપા કરીને', pa: 'ਕਿਰਪਾ ਕਰਕੇ', or: 'ଦୟାକରି' },
  THANKS: { en: 'Thank you', ta: 'நன்றி', hi: 'धन्यवाद', te: 'ధన్యవాదాలు', kn: 'ಧನ್ಯವಾದಗಳು', ml: 'നന്ദി', bn: 'ধন্যবাদ', mr: 'धन्यवाद', gu: 'આભાર', pa: 'ਧੰਨਵਾਦ', or: 'ଧନ୍ୟବାଦ' },
  LOVE: { en: 'I love you', ta: 'நான் உன்னை நேசிக்கிறேன்', hi: 'मैं तुमसे प्यार करता हूँ', te: 'నేను నిన్ను ప్రేమిస్తున్నాను', kn: 'ನಾನು ನಿನ್ನನ್ನು ಪ್ರೀತಿಸುತ್ತೇನೆ', ml: 'ഞാൻ നിന്നെ സ്നേഹിക്കുന്നു', bn: 'আমি তোমাকে ভালোবাসি', mr: 'मी तुझ्यावर प्रेम करतो', gu: 'હું તને પ્રેમ કરું છું', pa: 'ਮੈਂ ਤੁਹਾਨੂੰ ਪਿਆਰ ਕਰਦਾ ਹਾਂ', or: 'ମୁଁ ତୁମକୁ ଭଲ ପାଏ' },
  GOODBYE: { en: 'Goodbye', ta: 'பிரியாவிடை', hi: 'अलविदा', te: 'వీడ్కోలు', kn: 'ವಿದಾಯ', ml: 'വിട', bn: 'বিদায়', mr: 'निरोप', gu: 'આવજો', pa: 'ਅਲਵਿਦਾ', or: 'ବିଦାୟ' },
  OK: { en: 'Okay', ta: 'சரி', hi: 'ठीक है', te: 'సరే', kn: 'ಸರಿ', ml: 'ശരി', bn: 'ঠিক আছে', mr: 'ठीक आहे', gu: 'બરાબર', pa: 'ਠੀਕ ਹੈ', or: 'ଠିକ ଅଛି' },
};

/** Text of a gesture in the chosen output language (falls back to English). */
export const getText = (id, lang = 'en') => TRANSLATIONS[id]?.[lang] ?? byId(id)?.text ?? id;


// ---- Speech / voice language codes (BCP-47). Sign output language and speech-recognition language are separate states. ----
export const BCP = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN', te: 'te-IN', kn: 'kn-IN', ml: 'ml-IN', bn: 'bn-IN', mr: 'mr-IN', gu: 'gu-IN', pa: 'pa-IN', or: 'or-IN' };
export const SPEECH_LANGUAGES = LANGUAGES.map((l) => ({ code: BCP[l.code], name: l.name }));

// ---- 25 additional prototype gestures (recognised by data/engine.js: orientation + motion rules) ----
const N = (id, text, hint) => ({ id, text, f: null, hint, suggest: [text + '.'] });
GESTURES.push(
  N('GOOD', 'Good', 'Thumbs up, bounce up and down'), N('SORRY', 'Sorry', 'Fist, move in a circle'),
  N('WELCOME', 'Welcome', 'Open palm, one sideways sweep'), N('COME', 'Come', 'Index finger, curl and extend (beckon)'),
  N('GO', 'Go', 'Index finger, sweep sideways'), N('WAIT', 'Wait', 'Open palm, bounce up and down'),
  N('EAT', 'Eat', 'Fingertips bunched with thumb (flat-O)'), N('DRINK', 'Drink', 'Thumb + pinky out (Y), others folded'),
  N('SLEEP', 'Sleep', 'Open palm held sideways'), N('HOME', 'Home', 'Thumb, index, middle out'),
  N('FRIEND', 'Friend', 'Index + pinky out (horns), upright'), N('NAME', 'Name', 'Index + middle out, hand sideways'),
  N('WHERE', 'Where', 'Index finger pointing sideways'), N('WHO', 'Who', 'Thumb + index (L), hand sideways'),
  N('WHAT', 'What', 'Open palm, fingers pointing down'), N('WHEN', 'When', 'All fingers out except pinky'),
  N('WHY', 'Why', 'Index + pinky out, hand sideways'), N('HOW', 'How', 'Four fingers out, thumb tucked, hand sideways'),
  N('TODAY', 'Today', 'Fist, press downward'), N('TOMORROW', 'Tomorrow', 'Thumb out, sweep to your right'),
  N('YESTERDAY', 'Yesterday', 'Thumb out, sweep to your left'), N('MORNING', 'Morning', 'Open palm, sweep upward'),
  N('NIGHT', 'Night', 'Open palm, sweep downward'), N('HAPPY', 'Happy', 'Open palm, move in a circle'),
  N('SAD', 'Sad', 'Index + middle out, sweep downward'),
);

// Order: en, ta, hi, te, kn, ml, bn, mr, gu, pa, or  (same as LANGUAGES)
const T = (a) => Object.fromEntries(LANGUAGES.map((l, i) => [l.code, a[i]]));
Object.assign(TRANSLATIONS, {
  GOOD: T(['Good', 'நல்லது', 'अच्छा', 'మంచిది', 'ಒಳ್ಳೆಯದು', 'നല്ലത്', 'ভালো', 'चांगले', 'સારું', 'ਚੰਗਾ', 'ଭଲ']),
  SORRY: T(['Sorry', 'மன்னிக்கவும்', 'माफ़ कीजिए', 'క్షమించండి', 'ಕ್ಷಮಿಸಿ', 'ക്ഷമിക്കണം', 'দুঃখিত', 'माफ करा', 'માફ કરશો', 'ਮੁਆਫ਼ ਕਰਨਾ', 'କ୍ଷମା କରନ୍ତୁ']),
  WELCOME: T(['Welcome', 'வரவேற்கிறோம்', 'स्वागत है', 'స్వాగతం', 'ಸ್ವಾಗತ', 'സ്വാഗതം', 'স্বাগতম', 'स्वागत आहे', 'સ્વાગત છે', 'ਜੀ ਆਇਆਂ ਨੂੰ', 'ସ୍ୱାଗତ']),
  COME: T(['Come', 'வா', 'आइए', 'రండి', 'ಬನ್ನಿ', 'വരൂ', 'আসুন', 'या', 'આવો', 'ਆਓ', 'ଆସନ୍ତୁ']),
  GO: T(['Go', 'போ', 'जाइए', 'వెళ్ళండి', 'ಹೋಗಿ', 'പോകൂ', 'যান', 'जा', 'જાઓ', 'ਜਾਓ', 'ଯାଆନ୍ତୁ']),
  WAIT: T(['Wait', 'காத்திரு', 'प्रतीक्षा करें', 'వేచి ఉండండి', 'ಕಾಯಿರಿ', 'കാത്തിരിക്കൂ', 'অপেক্ষা করুন', 'थोडा थांबा', 'રાહ જુઓ', 'ਉਡੀਕ ਕਰੋ', 'ଅପେକ୍ଷା କରନ୍ତୁ']),
  EAT: T(['Eat', 'சாப்பிடு', 'खाइए', 'తినండి', 'ತಿನ್ನಿ', 'കഴിക്കൂ', 'খান', 'खा', 'ખાઓ', 'ਖਾਓ', 'ଖାଆନ୍ତୁ']),
  DRINK: T(['Drink', 'குடி', 'पीजिए', 'తాగండి', 'ಕುಡಿಯಿರಿ', 'കുടിക്കൂ', 'পান করুন', 'प्या', 'પીઓ', 'ਪੀਓ', 'ପିଅନ୍ତୁ']),
  SLEEP: T(['Sleep', 'தூங்கு', 'सोइए', 'నిద్రపోండి', 'ನಿದ್ರಿಸಿ', 'ഉറങ്ങൂ', 'ঘুমান', 'झोपा', 'સૂઈ જાઓ', 'ਸੌਂ ਜਾਓ', 'ଶୁଅନ୍ତୁ']),
  HOME: T(['Home', 'வீடு', 'घर', 'ఇల్లు', 'ಮನೆ', 'വീട്', 'বাড়ি', 'घर', 'ઘર', 'ਘਰ', 'ଘର']),
  FRIEND: T(['Friend', 'நண்பன்', 'दोस्त', 'స్నేహితుడు', 'ಸ್ನೇಹಿತ', 'സുഹൃത്ത്', 'বন্ধু', 'मित्र', 'મિત્ર', 'ਦੋਸਤ', 'ବନ୍ଧୁ']),
  NAME: T(['Name', 'பெயர்', 'नाम', 'పేరు', 'ಹೆಸರು', 'പേര്', 'নাম', 'नाव', 'નામ', 'ਨਾਮ', 'ନାମ']),
  WHERE: T(['Where', 'எங்கே', 'कहाँ', 'ఎక్కడ', 'ಎಲ್ಲಿ', 'എവിടെ', 'কোথায়', 'कुठे', 'ક્યાં', 'ਕਿੱਥੇ', 'କେଉଁଠି']),
  WHO: T(['Who', 'யார்', 'कौन', 'ఎవరు', 'ಯಾರು', 'ആര്', 'কে', 'कोण', 'કોણ', 'ਕੌਣ', 'କିଏ']),
  WHAT: T(['What', 'என்ன', 'क्या', 'ఏమిటి', 'ಏನು', 'എന്ത്', 'কী', 'काय', 'શું', 'ਕੀ', 'କଣ']),
  WHEN: T(['When', 'எப்போது', 'कब', 'ఎప్పుడు', 'ಯಾವಾಗ', 'എപ്പോൾ', 'কখন', 'केव्हा', 'ક્યારે', 'ਕਦੋਂ', 'କେବେ']),
  WHY: T(['Why', 'ஏன்', 'क्यों', 'ఎందుకు', 'ಏಕೆ', 'എന്തുകൊണ്ട്', 'কেন', 'का', 'કેમ', 'ਕਿਉਂ', 'କାହିଁକି']),
  HOW: T(['How', 'எப்படி', 'कैसे', 'ఎలా', 'ಹೇಗೆ', 'എങ്ങനെ', 'কীভাবে', 'कसे', 'કેવી રીતે', 'ਕਿਵੇਂ', 'କିପରି']),
  TODAY: T(['Today', 'இன்று', 'आज', 'ఈ రోజు', 'ಇಂದು', 'ഇന്ന്', 'আজ', 'आज', 'આજે', 'ਅੱਜ', 'ଆଜି']),
  TOMORROW: T(['Tomorrow', 'நாளை', 'आने वाला कल', 'రేపు', 'ನಾಳೆ', 'നാളെ', 'আগামীকাল', 'उद्या', 'આવતીકાલે', 'ਆਉਣ ਵਾਲਾ ਕੱਲ੍ਹ', 'ଆସନ୍ତାକାଲି']),
  YESTERDAY: T(['Yesterday', 'நேற்று', 'बीता हुआ कल', 'నిన్న', 'ನಿನ್ನೆ', 'ഇന്നലെ', 'গতকাল', 'काल', 'ગઈકાલે', 'ਬੀਤਿਆ ਕੱਲ੍ਹ', 'ଗତକାଲି']),
  MORNING: T(['Morning', 'காலை', 'सुबह', 'ఉదయం', 'ಬೆಳಿಗ್ಗೆ', 'രാവിലെ', 'সকাল', 'सकाळ', 'સવાર', 'ਸਵੇਰ', 'ସକାଳ']),
  NIGHT: T(['Night', 'இரவு', 'रात', 'రాత్రి', 'ರಾತ್ರಿ', 'രാത്രി', 'রাত', 'रात्र', 'રાત', 'ਰਾਤ', 'ରାତି']),
  HAPPY: T(['Happy', 'மகிழ்ச்சி', 'खुश', 'సంతోషం', 'ಸಂತೋಷ', 'സന്തോഷം', 'খুশি', 'आनंदी', 'ખુશ', 'ਖੁਸ਼', 'ଖୁସି']),
  SAD: T(['Sad', 'வருத்தம்', 'दुखी', 'బాధ', 'ದುಃಖ', 'ദുഃഖം', 'দুঃখী', 'दुःखी', 'દુઃખી', 'ਉਦਾਸ', 'ଦୁଃଖୀ']),
});

export const EMERGENCY = ['I need help.', 'Please call someone.', 'I need assistance.'];

const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

/** Rule-based classifier over 21 MediaPipe hand landmarks. Returns a gesture id or null. */
export function classify(l) {
  const palm = d(l[0], l[9]) || 1e-6;
  const ext = [
    d(l[4], l[5]) / palm > 0.62,
    ...[[8, 6], [12, 10], [16, 14], [20, 18]].map(([t, p]) => d(l[t], l[0]) > d(l[p], l[0]) * 1.12),
  ];
  if (d(l[4], l[8]) / palm < 0.35 && ext[2] && ext[3] && ext[4]) return 'OK';
  const up = l[4].y < l[0].y - 0.6 * palm ? 'up' : l[4].y > l[0].y + 0.6 * palm ? 'down' : null;
  for (const g of GESTURES) {
    if (g.f && g.f.every((v, i) => !!v === ext[i]) && (!g.thumb || g.thumb === up)) return g.id;
  }
  return null;
}

/** Smart sentence formation. English: ["WATER","PLEASE"] -> "Water please."  Other languages: words joined in order. */
export function sentence(ids, lang = 'en') {
  if (lang !== 'en') return ids.map((i) => getText(i, lang)).join(' ');
  let s = ids.map((i) => byId(i).text).join(' ').toLowerCase().replace(/\bi\b/g, 'I');
  s = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?]$/.test(s) ? s : s + '.';
}
