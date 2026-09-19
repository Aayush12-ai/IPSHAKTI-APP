import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type LanguageCode = 'en' | 'hi' | 'sa' | 'ta' | 'te' | 'bn' | 'gu' | 'mr';

export type LanguageInfo = {
  code: LanguageCode;
  name: string;
  nativeName: string;
  badge: string;
  region: string;
  ayurvedicTradition: string;
};

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    badge: 'EN',
    region: 'International & India',
    ayurvedicTradition: 'Statutory & Global IP',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    badge: 'HI',
    region: 'भारत (राष्ट्रीय)',
    ayurvedicTradition: 'आयुर्वेदिक विधिक सहायता',
  },
  {
    code: 'sa',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    badge: 'SA',
    region: 'शास्त्रीय संहिता',
    ayurvedicTradition: 'चरक सुश्रुत वाग्भट मूल ज्ञान',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    badge: 'TA',
    region: 'தமிழ்நாடு & இலங்கை',
    ayurvedicTradition: 'சித்த மருத்துவம் & ஆயுர்வேதம்',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    badge: 'TE',
    region: 'ఆంధ్రప్రదేశ్ & తెలంగాణ',
    ayurvedicTradition: 'ఆయుర్వేద శాస్త్ర మేధస్సు',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    badge: 'BN',
    region: 'পশ্চিমবঙ্গ ও ত্রিপুরা',
    ayurvedicTradition: 'আয়ুর্বেদিক পেটেন্ট জ্ঞান',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    badge: 'GU',
    region: 'ગુજરાત (આયુર્વેદ યુનિવર્સિટી)',
    ayurvedicTradition: 'આયુર્વેદિક કાયદાકીય માર્ગદર્શન',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    badge: 'MR',
    region: 'महाराष्ट्र',
    ayurvedicTradition: 'आयुर्वेद संशोधन व पेटंट',
  },
];

const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    brandSub: 'TRADITIONAL WISDOM · LEGAL CLARITY',
    aiSahayak: 'AI SAHAYAK',
    goodMorning: 'Good morning, Aayush',
    heroGreeting: 'Make your next move\nwith clarity & confidence.',
    heroSubtitle: 'Evidence-grounded Ayurvedic IP & regulatory decision intelligence.',
    heroCardTitle: 'What formulation or patent are you developing?',
    suggestedExplorations: 'SUGGESTED EXPLORATIONS',
    coreToolsTitle: 'Core IP & Regulatory Tools',
    seeAll: 'See all 9',
    recentAnalysis: 'Recent Analysis & History',
    myResearch: 'My Research',
    askAiTitle: 'Ask IP-SAKTI',
    askAiSubtitle: 'Evidence-grounded Ayurvedic regulatory & patent intelligence.',
    welcomeHeader: 'Namaste! I am your IP-SAKTI Sahayak.',
    welcomeMessage: 'Ask any question regarding Ayurvedic patentability under Section 3(p)/3(d), Rule 158B licensing, or NBA Access and Benefit Sharing.',
    composerPlaceholder: 'Ask anything on Ayurvedic IP, formulations, patents or ABS...',
    toolsTitle: 'IP Tools',
    toolsSubtitle: 'Focused tools for every step from idea to market.',
    yourToolkit: 'Your toolkit',
    passportTitle: 'IP Readiness Passport',
    passportSubtitle: 'Comprehensive IP & Statutory Diagnostic',
    profileTitle: 'Innovator Profile',
    profileSubtitle: 'Your dedicated workspace for responsible Ayurvedic innovation.',
    appearanceTitle: 'App Appearance & Theme',
    languageTitle: 'Language & Script (भाषा)',
    selectLanguagePrompt: 'Select your preferred working language:',
    saveFinding: 'Save Finding',
    savedToResearch: 'Saved to Research',
    copy: 'Copy',
    copied: 'Copied',
    traceEvidence: 'Trace 5-Stage Evidence Chain',
    classified: 'Classify Product',
    runAbsCheck: 'Run ABS Check',
    analyzeFormula: 'Analyze Formulation',
  },
  hi: {
    brandSub: 'पारंपरिक ज्ञान · विधिक स्पष्टता',
    aiSahayak: 'एआई सहायक',
    goodMorning: 'नमस्ते, आयुष',
    heroGreeting: 'अपने नवाचार को\nस्पष्टता और आत्मविश्वास दें।',
    heroSubtitle: 'प्रमाण-आधारित आयुर्वेदिक बौद्धिक संपदा एवं विधिक निर्णय प्रणाली।',
    heroCardTitle: 'आप किस योग अथवा पेटेंट पर कार्य कर रहे हैं?',
    suggestedExplorations: 'सुझाए गए विषय',
    coreToolsTitle: 'प्रमुख बौद्धिक संपदा एवं विधिक उपकरण',
    seeAll: 'सभी 9 देखें',
    recentAnalysis: 'हाल के विश्लेषण व इतिहास',
    myResearch: 'मेरा शोध',
    askAiTitle: 'आईपी-शक्ति से पूछें',
    askAiSubtitle: 'प्रमाण-आधारित आयुर्वेदिक विनियामक एवं पेटेंट परामर्श।',
    welcomeHeader: 'नमस्ते! मैं आपका आईपी-शक्ति सहायक हूँ।',
    welcomeMessage: 'धारा 3(p)/3(d) के तहत पेटेंट योग्यता, नियम 158B लाइसेंसिंग, अथवा एनबीए जैविक विविधता अनुपालन पर कोई भी प्रश्न पूछें।',
    composerPlaceholder: 'आयुर्वेदिक पेटेंट, योग, अथवा जैविक विविधता पर पूछें...',
    toolsTitle: 'विधिक उपकरण',
    toolsSubtitle: 'विचार से लेकर बाजार तक प्रत्येक चरण के लिए समर्पित साधन।',
    yourToolkit: 'आपकी साधन पेटी',
    passportTitle: 'आईपी तत्परता पासपोर्ट',
    passportSubtitle: 'विस्तृत बौद्धिक संपदा एवं विधिक निदान',
    profileTitle: 'नवाचारकर्ता प्रोफ़ाइल',
    profileSubtitle: 'उत्तरदायी आयुर्वेदिक नवाचार के लिए आपका समर्पित कार्यक्षेत्र।',
    appearanceTitle: 'ऐप का स्वरूप एवं थीम',
    languageTitle: 'भाषा एवं लिपि (Language)',
    selectLanguagePrompt: 'अपनी पसंदीदा कार्य भाषा चुनें:',
    saveFinding: 'निष्कर्ष सहेजें',
    savedToResearch: 'शोध में सहेजा गया',
    copy: 'कॉपी करें',
    copied: 'कॉपी हो गया',
    traceEvidence: '5-चरणीय प्रमाण श्रृंखला देखें',
    classified: 'उत्पाद वर्गीकरण करें',
    runAbsCheck: 'एबीएस जांचें',
    analyzeFormula: 'योग का विश्लेषण करें',
  },
  sa: {
    brandSub: 'पारम्परिकं ज्ञानम् · विधिकी स्पष्टता',
    aiSahayak: 'एआई सहायकः',
    goodMorning: 'सुप्रभातम्, आयुष',
    heroGreeting: 'आयुर्वेद-नवाचारं\nविधिक-सामर्थ्येन वर्धयन्तु।',
    heroSubtitle: 'प्रमाण-आधारिता आयुर्वेद-स्वामित्व-नियामक-बुद्धिमत्ता।',
    heroCardTitle: 'कां संहिता-आधारितां कृतिं वा पेटेण्टं रचयन्ति?',
    suggestedExplorations: 'प्रस्तावित-विषयाः',
    coreToolsTitle: 'मुख्यानि विधिक-साधनानि',
    seeAll: 'सर्वं पश्यन्तु',
    recentAnalysis: 'पूर्वे विश्लेषणाः',
    myResearch: 'मम अनुसन्धानम्',
    askAiTitle: 'आईपी-शक्तिं पृच्छतु',
    askAiSubtitle: 'प्रमाण-प्रतिष्ठिता आयुर्वेद-स्वामित्व-परामर्श-व्यवस्था।',
    welcomeHeader: 'नमस्ते! अहम् भवतः आईपी-शक्ति-सहायकः अस्मि।',
    welcomeMessage: 'धारा ३(p)/३(d) पेटेण्ट-योग्यता, नियम १५८B, अथवा जैवविविधता-अनुपालन-विषये पृच्छन्तु।',
    composerPlaceholder: 'योग-पेटेण्ट-जैवविविधता-विषये अत्र लिखन्तु...',
    toolsTitle: 'आईपी-साधनानि',
    toolsSubtitle: 'कल्पनायाः विपणनं यावत् सर्वेषां चरणानां साधनानि।',
    yourToolkit: 'भवतः साधन-मञ्जूषा',
    passportTitle: 'स्वामित्व-सिद्धता-पत्रम्',
    passportSubtitle: 'सम्पूर्णा विधिकी परीक्षा',
    profileTitle: 'आविष्कारक-परिचयः',
    profileSubtitle: 'आयुर्वेद-नवाचाराय समर्पितं कार्यक्षेत्रम्।',
    appearanceTitle: 'दृश्य-सौन्दर्यम्',
    languageTitle: 'भाषा लिपिः च',
    selectLanguagePrompt: 'अभीष्टां भाषां चिनोतु:',
    saveFinding: 'संगृह्यताम्',
    savedToResearch: 'संगृहीतम्',
    copy: 'प्रतिलिपिः',
    copied: 'प्रतिलिपिः कृता',
    traceEvidence: 'प्रमाण-परम्परां पश्यतु',
    classified: 'उत्पादं वर्गीकरोतु',
    runAbsCheck: 'जैवविविधतां परीक्षतु',
    analyzeFormula: 'योगं परीक्षतु',
  },
  ta: {
    brandSub: 'பாரம்பரிய அறிவு · சட்டத் தெளிவு',
    aiSahayak: 'ஏஐ உதவியாளர்',
    goodMorning: 'வணக்கம், ஆயுஷ்',
    heroGreeting: 'உங்கள் கண்டுபிடிப்பை\nதெளிவுடனும் நம்பிக்கையுடனும் தொடங்குங்கள்.',
    heroSubtitle: 'ஆதார அடிப்படையிலான ஆயுர்வேத & சித்த அறிவுசார் சொத்து ஆலோசனை.',
    heroCardTitle: 'நீங்கள் எந்த மருந்து அல்லது காப்புரிமையை உருவாக்குகிறீர்கள்?',
    suggestedExplorations: 'பரிந்துரைக்கப்பட்ட தலைப்புகள்',
    coreToolsTitle: 'முக்கிய அறிவுசார் சொத்துக் கருவிகள்',
    seeAll: 'அனைத்தையும் காண்க',
    recentAnalysis: 'சமீபத்திய ஆய்வுகள்',
    myResearch: 'என் ஆராய்ச்சி',
    askAiTitle: 'ஐபி-சக்தியிடம் கேளுங்கள்',
    askAiSubtitle: 'ஆதாரபூர்வ ஆயுர்வேத ஒழுங்குமுறை & காப்புரிமை ஆலோசனை.',
    welcomeHeader: 'வணக்கம்! நான் உங்கள் ஐபி-சக்தி உதவியாளர்.',
    welcomeMessage: 'பிரிவு 3(p)/3(d) காப்புரிமை தகுதி, விதி 158B உரிமம் அல்லது NBA பல்லுயிர் சட்டம் பற்றி கேளுங்கள்.',
    composerPlaceholder: 'ஆயுர்வேத காப்புரிமை அல்லது மூலிகைகள் பற்றி கேளுங்கள்...',
    toolsTitle: 'ஐபி கருவிகள்',
    toolsSubtitle: 'யோசனை முதல் சந்தை வரை ஒவ்வொரு படிக்கும் கருவிகள்.',
    yourToolkit: 'உங்கள் கருவித்தொகுப்பு',
    passportTitle: 'ஐபி தயார்நிலை பாஸ்போர்ட்',
    passportSubtitle: 'விரிவான அறிவுசார் சொத்து சோதனை',
    profileTitle: 'கண்டுபிடிப்பாளர் சுயவிவரம்',
    profileSubtitle: 'பொறுப்பான ஆயுர்வேத கண்டுபிடிப்புக்கான அர்ப்பணிக்கப்பட்ட பணியிடம்.',
    appearanceTitle: 'தோற்றம் & தீம்',
    languageTitle: 'மொழி (Language)',
    selectLanguagePrompt: 'உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்:',
    saveFinding: 'சேமிக்கவும்',
    savedToResearch: 'ஆராய்ச்சியில் சேமிக்கப்பட்டது',
    copy: 'நகலெடு',
    copied: 'நகலெடுக்கப்பட்டது',
    traceEvidence: '5-நிலை ஆதார சங்கிலி',
    classified: 'தயாரிப்பை வகைப்படுத்து',
    runAbsCheck: 'பல்லுயிர் சரிபார்ப்பு',
    analyzeFormula: 'சூத்திரத்தை பகுப்பாய்வு செய்',
  },
  te: {
    brandSub: 'సాంప్రదాయ విజ్ఞానం · చట్టపరమైన స్పష్టత',
    aiSahayak: 'AI సహాయకుడు',
    goodMorning: 'నమస్కారం, ఆయుష్',
    heroGreeting: 'మీ ఆవిష్కరణను\nస్పష్టత మరియు విశ్వాసంతో ముందుకు తీసుకెళ్లండి.',
    heroSubtitle: 'ఆధార ఆధారిత ఆయుర్వేద మేధో సంపత్తి & నియంత్రణ నిర్ణయ వ్యవస్థ.',
    heroCardTitle: 'మీరు ఏ ఫార్ములేషన్ లేదా పేటెంట్‌ను అభివృద్ధి చేస్తున్నారు?',
    suggestedExplorations: 'సూచించిన అంశాలు',
    coreToolsTitle: 'ప్రధాన IP & నియంత్రణ సాధనాలు',
    seeAll: 'అన్నీ చూడండి',
    recentAnalysis: 'ఇటీవలి విశ్లేషణలు',
    myResearch: 'నా పరిశోధన',
    askAiTitle: 'IP-SAKTI ని అడగండి',
    askAiSubtitle: 'ఆయుర్వేద పేటెంట్ & రెగ్యులేటరీ మేధస్సు.',
    welcomeHeader: 'నమస్తే! నేను మీ IP-SAKTI సహాయకుడిని.',
    welcomeMessage: 'సెక్షన్ 3(p)/3(d) పేటెంట్ అర్హత, రూల్ 158B లైసెన్సింగ్ లేదా NBA జీవవైవిధ్యం గురించి ఏదైనా అడగండి.',
    composerPlaceholder: 'ఆయుర్వేద పేటెంట్ లేదా సూత్రీకరణల గురించి అడగండి...',
    toolsTitle: 'IP సాధనాలు',
    toolsSubtitle: 'ఆలోచన నుండి మార్కెట్ వరకు ప్రతి దశకు సాధనాలు.',
    yourToolkit: 'మీ సాధన కిట్',
    passportTitle: 'IP సంసిద్ధత పాస్‌పోర్ట్',
    passportSubtitle: 'సమగ్ర చట్టపరమైన నిర్ధారణ',
    profileTitle: 'ఆవిష్కర్త ప్రొఫైల్',
    profileSubtitle: 'ఆయుర్వేద ఆవిష్కరణకు ప్రత్యేక వర్క్‌స్పేస్.',
    appearanceTitle: 'యాప్ ప్రదర్శన & థీమ్',
    languageTitle: 'భాష (Language)',
    selectLanguagePrompt: 'మీ ప్రాధాన్యత గల భాషను ఎంచుకోండి:',
    saveFinding: 'సేవ్ చేయండి',
    savedToResearch: 'సేవ్ చేయబడింది',
    copy: 'కాపీ',
    copied: 'కాపీ చేయబడింది',
    traceEvidence: '5-దశల సాక్ష్య గొలుసు',
    classified: 'ఉత్పత్తి వర్గీకరణ',
    runAbsCheck: 'జీవవైవిధ్య తనిఖీ',
    analyzeFormula: 'ఫార్ములా విశ్లేషణ',
  },
  bn: {
    brandSub: 'ঐতিহ্যগত জ্ঞান · আইনি স্বচ্ছতা',
    aiSahayak: 'এআই সহায়ক',
    goodMorning: 'নমস্কার, আয়ুষ',
    heroGreeting: 'আপনার উদ্ভাবনকে\nস্পষ্টতা ও আত্মবিশ্বাসের সাথে এগিয়ে নিন।',
    heroSubtitle: 'প্রমাণ-ভিত্তিক আয়ুর্বেদিক বুদ্ধিবৃত্তিক সম্পত্তি ও নিয়ন্ত্রক গোয়েন্দা ব্যবস্থা।',
    heroCardTitle: 'আপনি কোন ফর্মুলেশন বা পেটেন্ট তৈরি করছেন?',
    suggestedExplorations: 'প্রস্তাবিত অন্বেষণ',
    coreToolsTitle: 'মূল আইপি ও নিয়ন্ত্রক সরঞ্জাম',
    seeAll: 'সব ৯টি দেখুন',
    recentAnalysis: 'সাম্প্রতিক বিশ্লেষণ ও ইতিহাস',
    myResearch: 'আমার গবেষণা',
    askAiTitle: 'আইপি-শক্তি কে জিজ্ঞাসা করুন',
    askAiSubtitle: 'প্রমাণ-ভিত্তিক আয়ুর্বেদিক নিয়ন্ত্রক ও পেটেন্ট পরামর্শ।',
    welcomeHeader: 'নমস্কার! আমি আপনার আইপি-শক্তি সহায়ক।',
    welcomeMessage: 'ধারা 3(p)/3(d) পেটেন্ট যোগ্যতা, নিয়ম 158B লাইসেন্সিং বা NBA জীববৈচিত্র্য আইন সম্পর্কে জিজ্ঞাসা করুন।',
    composerPlaceholder: 'আয়ুর্বেদিক পেটেন্ট বা ফর্মুলেশন সম্পর্কে জিজ্ঞাসা করুন...',
    toolsTitle: 'আইপি সরঞ্জাম',
    toolsSubtitle: 'ধারণা থেকে বাজার পর্যন্ত প্রতিটি পদক্ষেপের জন্য সরঞ্জাম।',
    yourToolkit: 'আপনার টুলকিট',
    passportTitle: 'আইপি প্রস্তুতি পাসপোর্ট',
    passportSubtitle: 'ব্যাপক বৌদ্ধিক সম্পত্তি নির্ণয়',
    profileTitle: 'উদ্ভাবক প্রোফাইল',
    profileSubtitle: 'দায়িত্বশীল আয়ুর্বেদিক উদ্ভাবনের জন্য আপনার ডেডিকেটেড কর্মক্ষেত্র।',
    appearanceTitle: 'অ্যাপ চেহারা ও থিম',
    languageTitle: 'ভাষা (Language)',
    selectLanguagePrompt: 'আপনার পছন্দের ভাষা নির্বাচন করুন:',
    saveFinding: 'সংরক্ষণ করুন',
    savedToResearch: 'গবেষণায় সংরক্ষিত',
    copy: 'কপি',
    copied: 'কপি হয়েছে',
    traceEvidence: '৫-স্তরের প্রমাণ শৃঙ্খল',
    classified: 'পণ্য শ্রেণীবদ্ধ করুন',
    runAbsCheck: 'জীববৈচিত্র্য যাচাই',
    analyzeFormula: 'ফর্মুলা বিশ্লেষণ করুন',
  },
  gu: {
    brandSub: 'પરંપરાગત જ્ઞાન · કાનૂની સ્પષ્ટતા',
    aiSahayak: 'એઆઈ સહાયક',
    goodMorning: 'નમસ્તે, આયુષ',
    heroGreeting: 'તમારી શોધને\nસ્પષ્ટતા અને આત્મવિશ્વાસ સાથે આગળ વધારો.',
    heroSubtitle: 'પુરાવા-આધારિત આયુર્વેદિક બૌદ્ધિક સંપદા અને નિયમનકારી માર્ગદર્શન.',
    heroCardTitle: 'તમે કઈ ફોર્મ્યુલેશન અથવા પેટન્ટ વિકસાવી રહ્યા છો?',
    suggestedExplorations: 'સૂચવેલ વિષયો',
    coreToolsTitle: 'મુખ્ય આઈપી અને નિયમનકારી સાધનો',
    seeAll: 'બધા 9 જુઓ',
    recentAnalysis: 'તાજેતરના વિશ્લેષણ',
    myResearch: 'મારું સંશોધન',
    askAiTitle: 'આઈપી-શક્તિને પૂછો',
    askAiSubtitle: 'પુરાવા-આધારિત આયુર્વેદિક નિયમનકારી અને પેટન્ટ ઇન્ટેલિજન્સ.',
    welcomeHeader: 'નમસ્તે! હું તમારો આઈપી-શક્તિ સહાયક છું.',
    welcomeMessage: 'કલમ 3(p)/3(d) હેઠળ પેટન્ટ પાત્રતા, નિયમ 158B લાયસન્સિંગ અથવા NBA જૈવવિવિધતા પાલન અંગે પૂછો.',
    composerPlaceholder: 'આયુર્વેદિક પેટન્ટ અથવા ફોર્મ્યુલેશન વિશે પૂછો...',
    toolsTitle: 'આઈપી સાધનો',
    toolsSubtitle: 'વિચારથી લઈને બજાર સુધીના દરેક પગલા માટે સમર્પિત સાધનો.',
    yourToolkit: 'તમારી ટૂલકીટ',
    passportTitle: 'આઈપી સજ્જતા પાસપોર્ટ',
    passportSubtitle: 'સંપૂર્ણ કાનૂની નિદાન',
    profileTitle: 'સંશોધક પ્રોફાઇલ',
    profileSubtitle: 'જવાબદાર આયુર્વેદિક સંશોધન માટેનું તમારું સમર્પિત કાર્યક્ષેત્ર.',
    appearanceTitle: 'એપ દેખાવ અને થીમ',
    languageTitle: 'ભાષા (Language)',
    selectLanguagePrompt: 'તમારી પસંદગીની કાર્યકારી ભાષા પસંદ કરો:',
    saveFinding: 'સાચવો',
    savedToResearch: 'સંશોધનમાં સાચવવામાં આવ્યું',
    copy: 'કૉપિ કરો',
    copied: 'કૉપિ થઈ ગયું',
    traceEvidence: '5-તબક્કાની પુરાવા શૃંખલા',
    classified: 'ઉત્પાદન વર્ગીકરણ કરો',
    runAbsCheck: 'જૈવવિવિધતા તપાસો',
    analyzeFormula: 'ફોર્મ્યુલેશન વિશ્લેષણ',
  },
  mr: {
    brandSub: 'पारंपरिक ज्ञान · कायदेशीर स्पष्टता',
    aiSahayak: 'एआय सहाय्यक',
    goodMorning: 'शुभ सकाळ, आयुष',
    heroGreeting: 'तुमच्या नवोपक्रमाला\nस्पष्टता आणि आत्मविश्वासाने पुढे न्या.',
    heroSubtitle: 'पुरावा-आधारित आयुर्वेदिक बौद्धिक संपदा आणि नियामक निर्णय प्रणाली.',
    heroCardTitle: 'तुम्ही कोणते फॉर्म्युलेशन किंवा पेटंट विकसित करत आहात?',
    suggestedExplorations: 'सुचवलेले विषय',
    coreToolsTitle: 'प्रमुख बौद्धिक संपदा आणि नियामक साधने',
    seeAll: 'सर्व ९ पहा',
    recentAnalysis: 'अलीकडील विश्लेषण आणि इतिहास',
    myResearch: 'माझे संशोधन',
    askAiTitle: 'आयपी-शक्तीला विचारा',
    askAiSubtitle: 'पुरावा-आधारित आयुर्वेदिक नियामक आणि पेटंट सल्लागार.',
    welcomeHeader: 'नमस्ते! मी तुमचा आयपी-शक्ती सहाय्यक आहे.',
    welcomeMessage: 'कलम 3(p)/3(d) अंतर्गत पेटंट पात्रता, नियम 158B लायસन्सिंग किंवा NBA जैवविविધता कायद्याबद्दल विचारा.',
    composerPlaceholder: 'आयुर्वेदिक पेटंट किंवा फॉर्म्युलेशनबद्दल विचारा...',
    toolsTitle: 'आयपी साधने',
    toolsSubtitle: 'कल्पनेपासून बाजारापर्यंत प्रत्येक टप्प्यासाठी साधने.',
    yourToolkit: 'तुमचा टूलकिट',
    passportTitle: 'आयपी सज्जता पासपोर्ट',
    passportSubtitle: 'सर्वसमावेशक कायदेशीर निदान',
    profileTitle: 'संशोधक प्रोफाइल',
    profileSubtitle: 'जबाबदार आयुर्वेदिक नवोपक्रमासाठी तुमची समर्पित जागा.',
    appearanceTitle: 'अॅप देखावा आणि थीम',
    languageTitle: 'भाषा (Language)',
    selectLanguagePrompt: 'तुमची पसंतीची भाषा निवडा:',
    saveFinding: 'जतन करा',
    savedToResearch: 'संशोधनात जतन केले',
    copy: 'कॉपी करा',
    copied: 'कॉपी झाले',
    traceEvidence: '५-टप्प्यांची पुरावा साखळी',
    classified: 'उत्पादन वर्गीकरण करा',
    runAbsCheck: 'जैवविविधता तपासा',
    analyzeFormula: 'फॉर्म्युलेशन विश्लेषण',
  },
};

const LANGUAGE_STORAGE_KEY = 'ip_sakti_language_code';

type LanguageContextType = {
  language: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, defaultText?: string) => string;
  availableLanguages: LanguageInfo[];
  isLanguageModalOpen: boolean;
  openLanguageModal: () => void;
  closeLanguageModal: () => void;
};

const defaultLanguageInfo = SUPPORTED_LANGUAGES[0];

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  languageInfo: defaultLanguageInfo,
  setLanguage: () => {},
  t: (_key: string, defaultText?: string) => defaultText ?? '',
  availableLanguages: SUPPORTED_LANGUAGES,
  isLanguageModalOpen: false,
  openLanguageModal: () => {},
  closeLanguageModal: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
      if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
        setLanguageState(stored as LanguageCode);
      }
    });
  }, []);

  const setLanguage = (newLang: LanguageCode) => {
    setLanguageState(newLang);
    void AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
  };

  const openLanguageModal = () => setIsLanguageModalOpen(true);
  const closeLanguageModal = () => setIsLanguageModalOpen(false);

  const languageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) ?? defaultLanguageInfo;

  const t = (key: string, defaultText?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    if (langDict[key]) return langDict[key];
    const enDict = TRANSLATIONS.en;
    if (enDict[key]) return enDict[key];
    return defaultText ?? key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        languageInfo,
        setLanguage,
        t,
        availableLanguages: SUPPORTED_LANGUAGES,
        isLanguageModalOpen,
        openLanguageModal,
        closeLanguageModal,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
