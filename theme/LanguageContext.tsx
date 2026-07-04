import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Translations (bundled in-app — no API call needed to switch language)
// ---------------------------------------------------------------------------
export const TRANSLATIONS = {
  en: {
    // Profile screen
    myProfile: 'My Profile',
    manageAccount: 'Manage your account & preferences',
    savedAddresses: 'Saved Addresses',
    paymentMethods: 'Payment Methods',
    language: 'Language',
    theme: 'Theme',
    helpSupport: 'Help & Support',
    termsConditions: 'Terms & Conditions',
    logOut: 'Log out',
    logOutConfirmTitle: 'Log out',
    logOutConfirmMsg: 'Are you sure you want to log out?',
    cancel: 'Cancel',
    selectLanguage: 'Select Language',
    selectTheme: 'Select Theme',
    done: 'Done',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeAuto: 'System (Auto)',
    version: 'Vahan360 v1.0.0',
    // Home screen
    welcomeBack: 'Welcome Back 👋',
    hi: 'Hi',
    locationLabel: 'Koramangala, Bengaluru',
    heroLine1: 'Book rides & deliveries',
    heroLine2: 'in seconds ⚡',
    trustFast: 'Fast',
    trustSafe: 'Safe',
    trustRated: '4.9 Rated',
    searchHint: 'Where to go or send?',
    categoryRide: 'Ride',
    categoryLogistics: 'Logistics',
    categoryTruck: 'Truck',
    categoryPackersMovers: 'Packers & Movers',
    categoryParcel: 'Parcel',
    // Packers & Movers screen
    packersMoversTitle: 'Packers & Movers',
    packersMoversSubtitle: 'Select your shifting service',
    shiftingMiniTruck: 'Mini Truck',
    shiftingMiniTruckDesc: 'Within city',
    shiftingWithinCity: 'Within City',
    shiftingWithinCityDesc: 'Local home & office shifting',
    shiftingBetweenCities: 'Between Cities',
    shiftingBetweenCitiesDesc: 'Intercity relocation',
    // Truck screen
    truckTitle: 'Truck',
    truckSubtitle: 'Choose your service',
    truckWithinCity: 'Within City',
    truckWithinCityDesc: 'Local goods transport',
    truckInterCities: 'Inter Cities',
    truckInterCitiesDesc: 'City to city transport',
    truckLongTrips: 'Long Trips',
    truckLongTripsDesc: 'Long distance transport',
  },
  kn: {
    myProfile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    manageAccount: 'ನಿಮ್ಮ ಖಾತೆ ಮತ್ತು ಆದ್ಯತೆಗಳನ್ನು ನಿರ್ವಹಿಸಿ',
    savedAddresses: 'ಉಳಿಸಿದ ವಿಳಾಸಗಳು',
    paymentMethods: 'ಪಾವತಿ ವಿಧಾನಗಳು',
    language: 'ಭಾಷೆ',
    theme: 'ಥೀಮ್',
    helpSupport: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
    termsConditions: 'ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು',
    logOut: 'ಲಾಗ್ ಔಟ್',
    logOutConfirmTitle: 'ಲಾಗ್ ಔಟ್',
    logOutConfirmMsg: 'ನೀವು ಖಂಡಿತವಾಗಿಯೂ ಲಾಗ್ ಔಟ್ ಮಾಡಲು ಬಯಸುವಿರಾ?',
    cancel: 'ರದ್ದುಮಾಡಿ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ',
    selectTheme: 'ಥೀಮ್ ಆಯ್ಕೆ ಮಾಡಿ',
    done: 'ಮುಗಿದಿದೆ',
    themeLight: 'ಬೆಳಕು',
    themeDark: 'ಕತ್ತಲೆ',
    themeAuto: 'ಸಿಸ್ಟಮ್ (ಸ್ವಯಂ)',
    version: 'Vahan360 v1.0.0',
    welcomeBack: 'ಮರಳಿ ಸ್ವಾಗತ 👋',
    hi: 'ಹಲೋ',
    locationLabel: 'ಕೋರಮಂಗಲ, ಬೆಂಗಳೂರು',
    heroLine1: 'ರೈಡ್ ಮತ್ತು ಡೆಲಿವರಿಗಳನ್ನು ಬುಕ್ ಮಾಡಿ',
    heroLine2: 'ಸೆಕೆಂಡುಗಳಲ್ಲಿ ⚡',
    trustFast: 'ವೇಗ',
    trustSafe: 'ಸುರಕ್ಷಿತ',
    trustRated: '4.9 ರೇಟಿಂಗ್',
    searchHint: 'ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು ಅಥವಾ ಕಳುಹಿಸಬೇಕು?',
    categoryRide: 'ರೈಡ್',
    categoryLogistics: 'ಲಾಜಿಸ್ಟಿಕ್ಸ್',
    categoryTruck: 'ಟ್ರಕ್',
    categoryPackersMovers: 'ಪ್ಯಾಕರ್ಸ್ & ಮೂವರ್ಸ್',
    categoryParcel: 'ಪಾರ್ಸೆಲ್',
    packersMoversTitle: 'ಪ್ಯಾಕರ್ಸ್ & ಮೂವರ್ಸ್',
    packersMoversSubtitle: 'ನಿಮ್ಮ ಶಿಫ್ಟಿಂಗ್ ಸೇವೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
    shiftingMiniTruck: 'ಮಿನಿ ಟ್ರಕ್',
    shiftingMiniTruckDesc: 'ನಗರದೊಳಗೆ',
    shiftingWithinCity: 'ನಗರದೊಳಗೆ',
    shiftingWithinCityDesc: 'ಸ್ಥಳೀಯ ಮನೆ ಮತ್ತು ಕಚೇರಿ ಶಿಫ್ಟಿಂಗ್',
    shiftingBetweenCities: 'ನಗರಗಳ ನಡುವೆ',
    shiftingBetweenCitiesDesc: 'ಅಂತರ-ನಗರ ಸ್ಥಳಾಂತರ',
    truckTitle: 'ಟ್ರಕ್',
    truckSubtitle: 'ನಿಮ್ಮ ಸೇವೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
    truckWithinCity: 'ನಗರದೊಳಗೆ',
    truckWithinCityDesc: 'ಸ್ಥಳೀಯ ಸರಕು ಸಾಗಣೆ',
    truckInterCities: 'ನಗರಗಳ ನಡುವೆ',
    truckInterCitiesDesc: 'ನಗರದಿಂದ ನಗರಕ್ಕೆ ಸಾಗಣೆ',
    truckLongTrips: 'ದೂರದ ಪ್ರಯಾಣ',
    truckLongTripsDesc: 'ದೂರದ ಸಾಗಣೆ',
  },
  hi: {
    myProfile: 'मेरी प्रोफ़ाइल',
    manageAccount: 'अपना खाता और प्राथमिकताएं प्रबंधित करें',
    savedAddresses: 'सहेजे गए पते',
    paymentMethods: 'भुगतान के तरीके',
    language: 'भाषा',
    theme: 'थीम',
    helpSupport: 'सहायता और समर्थन',
    termsConditions: 'नियम और शर्तें',
    logOut: 'लॉग आउट',
    logOutConfirmTitle: 'लॉग आउट',
    logOutConfirmMsg: 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
    cancel: 'रद्द करें',
    selectLanguage: 'भाषा चुनें',
    selectTheme: 'थीम चुनें',
    done: 'हो गया',
    themeLight: 'लाइट',
    themeDark: 'डार्क',
    themeAuto: 'सिस्टम (स्वचालित)',
    version: 'Vahan360 v1.0.0',
    welcomeBack: 'वापसी पर स्वागत है 👋',
    hi: 'नमस्ते',
    locationLabel: 'कोरमंगला, बेंगलुरु',
    heroLine1: 'राइड और डिलीवरी बुक करें',
    heroLine2: 'सेकंडों में ⚡',
    trustFast: 'तेज़',
    trustSafe: 'सुरक्षित',
    trustRated: '4.9 रेटेड',
    searchHint: 'कहाँ जाना है या भेजना है?',
    categoryRide: 'राइड',
    categoryLogistics: 'लॉजिस्टिक्स',
    categoryTruck: 'ट्रक',
    categoryPackersMovers: 'पैकर्स एंड मूवर्स',
    categoryParcel: 'पार्सल',
    packersMoversTitle: 'पैकर्स एंड मूवर्स',
    packersMoversSubtitle: 'अपनी शिफ्टिंग सेवा चुनें',
    shiftingMiniTruck: 'मिनी ट्रक',
    shiftingMiniTruckDesc: 'शहर के भीतर',
    shiftingWithinCity: 'शहर के भीतर',
    shiftingWithinCityDesc: 'स्थानीय घर और कार्यालय शिफ्टिंग',
    shiftingBetweenCities: 'शहरों के बीच',
    shiftingBetweenCitiesDesc: 'अंतरशहर स्थानांतरण',
    truckTitle: 'ट्रक',
    truckSubtitle: 'अपनी सेवा चुनें',
    truckWithinCity: 'शहर के भीतर',
    truckWithinCityDesc: 'स्थानीय माल परिवहन',
    truckInterCities: 'शहरों के बीच',
    truckInterCitiesDesc: 'शहर से शहर परिवहन',
    truckLongTrips: 'लंबी यात्रा',
    truckLongTripsDesc: 'लंबी दूरी का परिवहन',
  },
  ta: {
    myProfile: 'என் சுயவிவரம்',
    manageAccount: 'உங்கள் கணக்கு மற்றும் விருப்பங்களை நிர்வகிக்கவும்',
    savedAddresses: 'சேமிக்கப்பட்ட முகவரிகள்',
    paymentMethods: 'கட்டண முறைகள்',
    language: 'மொழி',
    theme: 'தீம்',
    helpSupport: 'உதவி மற்றும் ஆதரவு',
    termsConditions: 'விதிமுறைகள் மற்றும் நிபந்தனைகள்',
    logOut: 'வெளியேறு',
    logOutConfirmTitle: 'வெளியேறு',
    logOutConfirmMsg: 'நீங்கள் நிச்சயமாக வெளியேற விரும்புகிறீர்களா?',
    cancel: 'ரத்து செய்',
    selectLanguage: 'மொழியை தேர்ந்தெடுக்கவும்',
    selectTheme: 'தீம் தேர்ந்தெடுக்கவும்',
    done: 'முடிந்தது',
    themeLight: 'வெளிச்சம்',
    themeDark: 'இருட்டு',
    themeAuto: 'கணினி (தானியங்கி)',
    version: 'Vahan360 v1.0.0',
    welcomeBack: 'மீண்டும் வரவேற்கிறோம் 👋',
    hi: 'வணக்கம்',
    locationLabel: 'கோரமங்களா, பெங்களூரு',
    heroLine1: 'ரைடுகள் மற்றும் டெலிவரிகளை',
    heroLine2: 'நொடிகளில் முன்பதிவு செய்யுங்கள் ⚡',
    trustFast: 'வேகம்',
    trustSafe: 'பாதுகாப்பு',
    trustRated: '4.9 மதிப்பீடு',
    searchHint: 'எங்கு செல்ல அல்லது அனுப்ப வேண்டும்?',
    categoryRide: 'ரைடு',
    categoryLogistics: 'லாஜிஸ்டிக்ஸ்',
    categoryTruck: 'லாரி',
    categoryPackersMovers: 'பேக்கர்ஸ் & மூவர்ஸ்',
    categoryParcel: 'பார்சல்',
    packersMoversTitle: 'பேக்கர்ஸ் & மூவர்ஸ்',
    packersMoversSubtitle: 'உங்கள் இடமாற்று சேவையைத் தேர்ந்தெடுக்கவும்',
    shiftingMiniTruck: 'மினி லாரி',
    shiftingMiniTruckDesc: 'நகருக்குள்',
    shiftingWithinCity: 'நகருக்குள்',
    shiftingWithinCityDesc: 'உள்ளூர் வீடு மற்றும் அலுவலக இடமாற்றம்',
    shiftingBetweenCities: 'நகரங்களுக்கு இடையில்',
    shiftingBetweenCitiesDesc: 'நகரம் இடையேயான இடமாற்றம்',
    truckTitle: 'லாரி',
    truckSubtitle: 'உங்கள் சேவையைத் தேர்ந்தெடுக்கவும்',
    truckWithinCity: 'நகருக்குள்',
    truckWithinCityDesc: 'உள்ளூர் சரக்கு போக்குவரத்து',
    truckInterCities: 'நகரங்களுக்கு இடையில்',
    truckInterCitiesDesc: 'நகரம் முதல் நகரம் போக்குவரத்து',
    truckLongTrips: 'நீண்ட பயணங்கள்',
    truckLongTripsDesc: 'நீண்ட தூர போக்குவரத்து',
  },
  te: {
    myProfile: 'నా ప్రొఫైల్',
    manageAccount: 'మీ ఖాతా మరియు ప్రాధాన్యతలను నిర్వహించండి',
    savedAddresses: 'సేవ్ చేసిన చిరునామాలు',
    paymentMethods: 'చెల్లింపు పద్ధతులు',
    language: 'భాష',
    theme: 'థీమ్',
    helpSupport: 'సహాయం మరియు మద్దతు',
    termsConditions: 'నిబంధనలు మరియు షరతులు',
    logOut: 'లాగ్ అవుట్',
    logOutConfirmTitle: 'లాగ్ అవుట్',
    logOutConfirmMsg: 'మీరు నిజంగా లాగ్ అవుట్ చేయాలనుకుంటున్నారా?',
    cancel: 'రద్దు',
    selectLanguage: 'భాషను ఎంచుకోండి',
    selectTheme: 'థీమ్ ఎంచుకోండి',
    done: 'పూర్తయింది',
    themeLight: 'లైట్',
    themeDark: 'డార్క్',
    themeAuto: 'సిస్టమ్ (స్వయంచాలక)',
    version: 'Vahan360 v1.0.0',
    welcomeBack: 'తిరిగి స్వాగతం 👋',
    hi: 'హలో',
    locationLabel: 'కోరమంగళ, బెంగళూరు',
    heroLine1: 'రైడ్‌లు & డెలివరీలను',
    heroLine2: 'సెకన్లలో బుక్ చేయండి ⚡',
    trustFast: 'వేగవంతం',
    trustSafe: 'సురక్షితం',
    trustRated: '4.9 రేటింగ్',
    searchHint: 'ఎక్కడికి వెళ్లాలి లేదా పంపాలి?',
    categoryRide: 'రైడ్',
    categoryLogistics: 'లాజిస్టిక్స్',
    categoryTruck: 'ట్రక్',
    categoryPackersMovers: 'ప్యాకర్స్ & మూవర్స్',
    categoryParcel: 'పార్సెల్',
    packersMoversTitle: 'ప్యాకర్స్ & మూవర్స్',
    packersMoversSubtitle: 'మీ షిఫ్టింగ్ సేవను ఎంచుకోండి',
    shiftingMiniTruck: 'మినీ ట్రక్',
    shiftingMiniTruckDesc: 'నగరంలోనే',
    shiftingWithinCity: 'నగరంలోనే',
    shiftingWithinCityDesc: 'స్థానిక ఇల్లు మరియు ఆఫీసు షిఫ్టింగ్',
    shiftingBetweenCities: 'నగరాల మధ్య',
    shiftingBetweenCitiesDesc: 'ఇంటర్‌సిటీ రీలొకేషన్',
    truckTitle: 'ట్రక్',
    truckSubtitle: 'మీ సేవను ఎంచుకోండి',
    truckWithinCity: 'నగరంలోనే',
    truckWithinCityDesc: 'స్థానిక సరుకు రవాణా',
    truckInterCities: 'నగరాల మధ్య',
    truckInterCitiesDesc: 'నగరం నుండి నగరానికి రవాణా',
    truckLongTrips: 'లాంగ్ ట్రిప్స్',
    truckLongTripsDesc: 'దూర రవాణా',
  },
} as const;

export type LangCode = keyof typeof TRANSLATIONS;
export type TranslationKey = keyof typeof TRANSLATIONS.en;

const LANG_STORAGE_KEY = '@vahan360_language';

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface LanguageContextType {
  lang: LangCode;
  setLang: (code: LangCode) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => TRANSLATIONS.en[key],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('en');
  const [loaded, setLoaded] = useState(false);

  // Restore the user's saved language choice on app start.
  useEffect(() => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((saved) => {
      if (saved && saved in TRANSLATIONS) {
        setLangState(saved as LangCode);
      }
      setLoaded(true);
    });
  }, []);

  // Persist the language choice whenever the user changes it.
  const setLang = (code: LangCode) => {
    setLangState(code);
    AsyncStorage.setItem(LANG_STORAGE_KEY, code);
  };

  const t = (key: TranslationKey): string =>
    (TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS.en[key]) as string;

  // Avoid a flash of the wrong language while AsyncStorage loads.
  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
