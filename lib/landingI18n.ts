export type LandingLang = "ar" | "en";

export interface LandingDict {
  // Nav
  navFeatures: string;
  navTech: string;
  navPricing: string;
  navFounder: string;
  navCta: string;
  langToggle: string;

  // Hero
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  storeDownloadFrom: string;
  storeGoogle: string;
  storeApple: string;
  phoneGreeting: string;
  phoneStatus: string;
  phoneShield: string;
  phoneScanTitle: string;
  phoneScanProgress: string;
  phoneOilLabel: string;
  phoneOilValue: string;
  phoneSpendLabel: string;
  phoneSpendValue: string;
  phoneOkTitle: string;
  phoneOkDesc: string;

  // Floating badges
  floatVoice: string;
  floatWallet: string;
  floatSos: string;
  floatGps: string;
  floatGuard: string;
  floatRoute: string;

  // Pain points
  painBadge: string;
  painTitle: string;
  painTitleAccent: string;
  painSubtitle: string;
  painProblemLabel: string;
  painSolutionLabel: string;
  pain1Problem: string;
  pain1Solution: string;
  pain2Problem: string;
  pain2Solution: string;
  pain3Problem: string;
  pain3Solution: string;
  pain4Problem: string;
  pain4Solution: string;
  pain5Problem: string;
  pain5Solution: string;
  pain6Problem: string;
  pain6Solution: string;
  pain7Problem: string;
  pain7Solution: string;
  pain8Problem: string;
  pain8Solution: string;

  // Features
  featBadge: string;
  featTitle: string;
  featTitleAccent: string;
  featSubtitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;
  feat5Title: string;
  feat5Desc: string;
  feat6Title: string;
  feat6Desc: string;

  // How it works
  howBadge: string;
  howTitle: string;
  howTitleAccent: string;
  howSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;

  // Download
  downloadBadge: string;
  downloadTitle: string;
  downloadTitleAccent: string;
  downloadSubtitle: string;

  // Pricing
  priceBadge: string;
  priceTitle: string;
  priceTitleAccent: string;
  priceSubtitle: string;
  priceBasicName: string;
  priceBasicAmount: string;
  priceBasicDesc: string;
  priceBasicCta: string;
  priceBasicF1: string;
  priceBasicF2: string;
  priceBasicF3: string;
  priceBasicF4: string;
  priceProName: string;
  priceProAmount: string;
  priceProPeriod: string;
  priceProDesc: string;
  priceProCta: string;
  priceProBadge: string;
  priceProF1: string;
  priceProF2: string;
  priceProF3: string;
  priceProF4: string;
  priceProF5: string;
  priceProF6: string;
  priceFootnote: string;

  // Contact
  navContact: string;
  contactBadge: string;
  contactTitle: string;
  contactTitleAccent: string;
  contactSubtitle: string;
  contactWhatsTitle: string;
  contactWhatsDesc: string;
  contactWhatsCta: string;
  contactBookTitle: string;
  contactBookDesc: string;
  contactBookCta: string;
  contactPerk1: string;
  contactPerk2: string;
  contactPerk3: string;
  footerContact: string;

  // Founder
  founderBadge: string;
  founderTitle: string;
  founderTitleAccent: string;
  founderRole: string;
  founderBio: string;
  founderCta: string;
  founderQuote: string;
  founderStat1Label: string;
  founderStat1Value: string;
  founderStat2Label: string;
  founderStat2Value: string;
  founderStat3Label: string;
  founderStat3Value: string;
  founderSkill1: string;
  founderSkill2: string;
  founderSkill3: string;
  founderSkill4: string;

  // Footer
  footerTagline: string;
  footerFeatures: string;
  footerPricing: string;
  footerDownload: string;
  footerFounder: string;
  footerRights: string;
  footerBuilt: string;
  footerDesignedBy: string;

  // Checkout / Payment
  checkoutTitle: string;
  checkoutSubtitle: string;
  checkoutBack: string;
  checkoutSecure: string;
  checkoutCardSection: string;
  checkoutCardholderName: string;
  checkoutCardholderPlaceholder: string;
  checkoutCardNumber: string;
  checkoutCardExpiry: string;
  checkoutCardCvv: string;
  checkoutBillingSection: string;
  checkoutEmail: string;
  checkoutEmailPlaceholder: string;
  checkoutCountry: string;
  checkoutTerms: string;
  checkoutPay: string;
  checkoutProcessing: string;
  checkoutSuccessTitle: string;
  checkoutSuccessDesc: string;
  checkoutSummaryTitle: string;
  checkoutSummaryPlan: string;
  checkoutSummaryBilled: string;
  checkoutSummarySubtotal: string;
  checkoutSummaryVat: string;
  checkoutSummaryTotal: string;
  checkoutTrustEncrypted: string;
  checkoutTrustCancel: string;
  checkoutTrustRefund: string;
  checkoutMoneyBack: string;
  checkoutDemoNote: string;
}

const ar: LandingDict = {
  navFeatures: "الميزات",
  navTech: "التقنية",
  navPricing: "التسعير",
  navFounder: "المؤسس",
  navCta: "ابدأ تجربتك المجانية",
  langToggle: "EN",

  heroBadge: "مساعد سيارة ذكي يعمل بدون إنترنت",
  heroTitleLine1: "الميكانيكي، الحارس،",
  heroTitleLine2: "والمحاسب لسيارتك..",
  heroTitleAccent: "كله في جيبك.",
  heroSubtitle:
    "AI DriveX هو مساعد سيارتك الذكي الذي يعمل حتى بدون إنترنت. يستمع لصوت المحرك، يتتبع مصاريفك، يحفظ موقع سيارتك، وينبهك وقت الخطر — باشتراك شهري أقل من تكلفة فحص كمبيوتر واحد.",
  heroCtaPrimary: "اشترك الآن",
  heroCtaSecondary: "شاهد كيف يعمل",
  storeDownloadFrom: "حمّل من",
  storeGoogle: "Google Play",
  storeApple: "App Store",
  phoneGreeting: "مساء الخير",
  phoneStatus: "سيارتك بحالة جيدة",
  phoneShield: "محمي",
  phoneScanTitle: "فحص صوتي",
  phoneScanProgress: "جارٍ التحليل…",
  phoneOilLabel: "المسافة للزيت",
  phoneOilValue: "1,240 كم",
  phoneSpendLabel: "مصاريف الشهر",
  phoneSpendValue: "320$",
  phoneOkTitle: "✓ لا توجد أعطال خطيرة",
  phoneOkDesc: "آخر فحص قبل 12 دقيقة — المحرك سليم.",

  floatVoice: "فحص صوتي",
  floatWallet: "مصاريف ذكية",
  floatSos: "SOS فوري",
  floatGps: "Parking GPS",
  floatGuard: "حارس المفاتيح",
  floatRoute: "ذاكرة المطبات",

  painBadge: "مشاكل يعرفها كل سائق",
  painTitle: "لماذا يحتاج كل سائق إلى",
  painTitleAccent: "AI DriveX؟",
  painSubtitle:
    "مشاكل واقعية تكلّفك المال وراحة البال — وحلول ذكية تقلب الموازين لصالحك.",
  painProblemLabel: "المشكلة",
  painSolutionLabel: "الحل",
  pain1Problem: "الاستغلال في الورش",
  pain1Solution:
    "افهم العطل قبل أن تدفع. التطبيق يشرح لك المشكلة بلغة بسيطة قبل أن تدخل الورشة.",
  pain2Problem: "نسيان الصيانة",
  pain2Solution:
    "عدادات ذكية تذكرك بالزيت والفلاتر والفحوصات قبل حدوث الأعطال المكلفة.",
  pain3Problem: "الطوارئ والمواقف",
  pain3Solution:
    "احفظ موقع سيارتك تلقائياً، وفعّل بروتوكول SOS عند الحاجة حتى بدون إنترنت.",
  pain4Problem: "أصوات غريبة من المحرك",
  pain4Solution:
    "شغّل التشخيص الصوتي بضغطة واحدة، واحصل على تفسير مبدئي للعطل قبل دفع ريال واحد.",
  pain5Problem: "ضياع مصاريف السيارة",
  pain5Solution:
    "صوّر فاتورة البنزين أو الصيانة، والمحفظة الذكية تسجّل وتصنّف كل مصروف تلقائياً.",
  pain6Problem: "عدم الثقة عند تسليم السيارة",
  pain6Solution:
    "فعّل وضع حارس المفاتيح عند تسليم السيارة للعامل أو المغسلة، وراقب السلوك دون اتصال دائم.",
  pain7Problem: "جهل قطع وأعطال المحرك",
  pain7Solution:
    "وجّه الكاميرا للمحرك، وسيشرح لك الذكاء الاصطناعي كل قطعة ووظيفتها بلغة بسيطة.",
  pain8Problem: "الطرق السيئة والمطبات",
  pain8Solution:
    "ذاكرة المطبات تحفظ المواقع العنيفة تلقائياً، فتعرف ما الذي يستهلك سيارتك بالضبط.",

  featBadge: "ميزات عبقرية",
  featTitle: "ميزات تجعل",
  featTitleAccent: "سيارتك أذكى",
  featSubtitle:
    "ستة أدوات بقوة الذكاء الاصطناعي تعمل خلف الكواليس لتحميك من العطل والمصاريف غير المتوقعة.",
  feat1Title: "التشخيص الصوتي",
  feat1Desc:
    "دع التطبيق يستمع لمحركك، ثم يعطيك قراءة مبدئية للعطل المحتمل خلال ثوانٍ.",
  feat2Title: "حارس المفاتيح",
  feat2Desc:
    "راقب سلوك السيارة عند تسليمها للعمال أو المغسلة، حتى بدون اتصال دائم.",
  feat3Title: "ذاكرة المطبات",
  feat3Desc:
    "احفظ مواقع المطبات العنيفة تلقائياً عبر حساسات الهاتف لتفهم ما يؤثر على سيارتك.",
  feat4Title: "الأشعة السينية للمحرك",
  feat4Desc:
    "وجّه الكاميرا للمحرك، وسيشرح لك الذكاء الاصطناعي أماكن القطع ووظيفة كل منها.",
  feat5Title: "المحفظة الذكية",
  feat5Desc:
    "صوّر فاتورة البنزين أو الصيانة، ودع التطبيق يسجل المصروفات تلقائياً ويصنفها.",
  feat6Title: "SOS الذكي",
  feat6Desc:
    "اهتزاز قوي أو موقف خطر؟ يبدأ عد تنازلي للطوارئ مع إمكانية إرسال موقعك فوراً.",

  howBadge: "التقنية",
  howTitle: "كيف يعمل",
  howTitleAccent: "AI DriveX؟",
  howSubtitle: "ثلاث خطوات بسيطة تفصلك عن قيادة أذكى وأكثر أماناً.",
  step1Title: "حمّل التطبيق",
  step1Desc: "ابدأ خلال دقيقة واحدة بدون إعدادات معقدة ولا تسجيل طويل.",
  step2Title: "دع الذكاء الاصطناعي يراقب",
  step2Desc:
    "الصوت، الموقع، المصاريف، والعدادات تعمل محلياً على هاتفك لحماية خصوصيتك.",
  step3Title: "اتخذ القرار الصحيح",
  step3Desc:
    "اعرف متى تزور الورشة، ومتى تكون المشكلة بسيطة، ومتى تحتاج إجراءً سريعاً.",

  downloadBadge: "متاح للهواتف الذكية",
  downloadTitle: "ابدأ قيادة",
  downloadTitleAccent: "أذكى اليوم",
  downloadSubtitle:
    "حمّل AI DriveX واستمتع بتجربة مساعد سيارة ذكي يعمل معك في الطريق، في المواقف، وفي لحظات الطوارئ.",

  priceBadge: "التسعير",
  priceTitle: "باقة تناسب",
  priceTitleAccent: "كل سائق",
  priceSubtitle:
    "وفّر آلاف الريالات من فواتير الورش والأعطال غير المتوقعة باشتراك شهري بسيط.",
  priceBasicName: "الأساسية",
  priceBasicAmount: "مجانية",
  priceBasicDesc: "ابدأ بحماية سيارتك دون أي تكلفة، وتمتع بالميزات اليومية.",
  priceBasicCta: "ابدأ مجاناً",
  priceBasicF1: "تتبع المصاريف اليومية",
  priceBasicF2: "حفظ موقع المواقف تلقائياً",
  priceBasicF3: "عدادات الصيانة الذكية",
  priceBasicF4: "سجل محلي يعمل Offline",
  priceProName: "AI Pro",
  priceProAmount: "300 ر.س",
  priceProPeriod: "/ شهرياً",
  priceProDesc:
    "كل قوة الذكاء الاصطناعي بين يديك — أرخص من زيارة ورشة واحدة، شهر كامل من الحماية.",
  priceProCta: "اشترك الآن",
  priceProBadge: "الأكثر توفيراً",
  priceProF1: "فحص صوتي للمحرك بلا حدود",
  priceProF2: "مستشار أعطال ذكي بالعربية",
  priceProF3: "وضع حارس المفاتيح المتقدم",
  priceProF4: "تنبيهات SOS فورية للطوارئ",
  priceProF5: "مزامنة سحابية عند الاتصال",
  priceProF6: "وصول مبكر لميزات AI القادمة",
  priceFootnote: "إلغاء الاشتراك في أي وقت — بدون التزامات طويلة الأمد.",

  navContact: "تواصل معنا",
  contactBadge: "تواصل معنا",
  contactTitle: "هل تريد أن تعرف المزيد عن",
  contactTitleAccent: "AI DriveX؟",
  contactSubtitle:
    "احجز موعداً مجانياً لشرح التطبيق، أو راسلنا مباشرة عبر واتساب لأي استفسار. نحن هنا للإجابة على كل أسئلتك خلال دقائق.",
  contactWhatsTitle: "راسلنا على واتساب",
  contactWhatsDesc:
    "ابدأ محادثة فورية معنا واحصل على ردود سريعة على استفساراتك بدون انتظار.",
  contactWhatsCta: "ابدأ المحادثة",
  contactBookTitle: "احجز موعد شرح التطبيق",
  contactBookDesc:
    "جلسة مجانية لمدة 15 دقيقة عبر مكالمة فيديو، نشرح فيها كل ميزات AI DriveX ونجيب على أسئلتك.",
  contactBookCta: "احجز موعدك الآن",
  contactPerk1: "ردّ خلال دقائق",
  contactPerk2: "بدون التزام بالشراء",
  contactPerk3: "متاح بالعربية والإنجليزية",
  footerContact: "تواصل معنا",

  founderBadge: "القصة",
  founderTitle: "وراء",
  founderTitleAccent: "AI DriveX",
  founderRole: "المؤسسة · مطوّرة Full Stack · مصممة UX/UI",
  founderBio:
    "مطوّرة Full Stack مع شغف عميق لمعالجة اللغة العربية، الذكاء التوليدي، وتطبيقات نماذج اللغة الكبيرة. مكرّسة لبناء منصات ذكاء اصطناعي متعددة اللغات تخدم سائقي الخليج والشرق الأوسط بفهم حقيقي لاحتياجاتهم وثقافتهم.",
  founderCta: "تواصل عبر LinkedIn",
  founderQuote:
    "كل خط كود في AI DriveX مكتوب بهاجس واحد: أن نمنح السائق العربي تقنية تشعر وكأنها صُنعت لأجله، لا منقولة عن غيره.",
  founderStat1Label: "سنوات الخبرة",
  founderStat1Value: "15+",
  founderStat2Label: "مشاريع AI",
  founderStat2Value: "10+",
  founderStat3Label: "اللغات المدعومة",
  founderStat3Value: "3",
  founderSkill1: "Full Stack Development",
  founderSkill2: "Arabic NLP",
  founderSkill3: "Generative AI · LLMs",
  founderSkill4: "UX / UI Design",

  footerTagline: "مساعد سيارتك الذكي للقيادة، الصيانة، الأمان، والمصاريف.",
  footerFeatures: "الميزات",
  footerPricing: "التسعير",
  footerDownload: "تحميل التطبيق",
  footerFounder: "المؤسس",
  footerRights: "© 2026 AI DriveX. جميع الحقوق محفوظة.",
  footerBuilt: "صُمم بحب لسائقي الخليج والشرق الأوسط.",
  footerDesignedBy: "تصميم وتطوير: Meryem Boulbassir",

  checkoutTitle: "أكمل اشتراكك",
  checkoutSubtitle: "خطوة واحدة تفصلك عن قيادة أذكى مع AI Pro.",
  checkoutBack: "الرجوع للصفحة الرئيسية",
  checkoutSecure: "اتصال مُشفّر آمن",
  checkoutCardSection: "بيانات البطاقة",
  checkoutCardholderName: "اسم حامل البطاقة",
  checkoutCardholderPlaceholder: "MERYEM BOULBASSIR",
  checkoutCardNumber: "رقم البطاقة",
  checkoutCardExpiry: "تاريخ الانتهاء",
  checkoutCardCvv: "CVV",
  checkoutBillingSection: "بيانات الفواتير",
  checkoutEmail: "البريد الإلكتروني للإيصال",
  checkoutEmailPlaceholder: "you@example.com",
  checkoutCountry: "الدولة",
  checkoutTerms:
    "أوافق على شروط الاستخدام وسياسة الخصوصية، وأقرّ بأنه سيتم تجديد الاشتراك تلقائياً.",
  checkoutPay: "ادفع 300 ر.س الآن",
  checkoutProcessing: "جارٍ المعالجة…",
  checkoutSuccessTitle: "تم الدفع بنجاح!",
  checkoutSuccessDesc:
    "مرحباً بك في AI Pro. أرسلنا إيصالاً إلى بريدك الإلكتروني، وحسابك جاهز للاستخدام فوراً.",
  checkoutSummaryTitle: "ملخّص الطلب",
  checkoutSummaryPlan: "باقة AI Pro",
  checkoutSummaryBilled: "تُحاسَب شهرياً",
  checkoutSummarySubtotal: "المجموع الفرعي",
  checkoutSummaryVat: "ضريبة القيمة المضافة (15%)",
  checkoutSummaryTotal: "الإجمالي اليوم",
  checkoutTrustEncrypted: "تشفير 256-bit SSL",
  checkoutTrustCancel: "إلغاء في أي وقت",
  checkoutTrustRefund: "ضمان استرداد خلال 7 أيام",
  checkoutMoneyBack: "ضمان استرداد كامل خلال 7 أيام — بدون أسئلة.",
  checkoutDemoNote:
    "هذه واجهة تجريبية — لن يتم تنفيذ أي عملية دفع فعلية. للربط الحقيقي استخدم Stripe أو Tap.",
};

const en: LandingDict = {
  navFeatures: "Features",
  navTech: "Technology",
  navPricing: "Pricing",
  navFounder: "Founder",
  navCta: "Start Free Trial",
  langToggle: "ع",

  heroBadge: "Offline-First AI Car Assistant",
  heroTitleLine1: "The mechanic, the guard,",
  heroTitleLine2: "and the accountant",
  heroTitleAccent: "all in your pocket.",
  heroSubtitle:
    "AI DriveX is the smart car assistant that works even without internet. It listens to your engine, tracks your expenses, remembers where you parked, and alerts you in emergencies — for less than the price of a single engine diagnostic scan.",
  heroCtaPrimary: "Subscribe Now",
  heroCtaSecondary: "See How It Works",
  storeDownloadFrom: "Download on",
  storeGoogle: "Google Play",
  storeApple: "App Store",
  phoneGreeting: "Good evening",
  phoneStatus: "Your car is healthy",
  phoneShield: "Protected",
  phoneScanTitle: "Acoustic Scan",
  phoneScanProgress: "Analyzing…",
  phoneOilLabel: "Miles until oil",
  phoneOilValue: "1,240 km",
  phoneSpendLabel: "This month",
  phoneSpendValue: "$320",
  phoneOkTitle: "✓ No critical faults",
  phoneOkDesc: "Last scan 12 minutes ago — engine healthy.",

  floatVoice: "Voice Scan",
  floatWallet: "Smart Wallet",
  floatSos: "Instant SOS",
  floatGps: "Parking GPS",
  floatGuard: "Key Guardian",
  floatRoute: "Bump Memory",

  painBadge: "Problems every driver knows",
  painTitle: "Why every driver needs",
  painTitleAccent: "AI DriveX?",
  painSubtitle:
    "Real problems that cost you money and peace of mind — and smart solutions that flip them in your favor.",
  painProblemLabel: "The Problem",
  painSolutionLabel: "The Solution",
  pain1Problem: "Getting overcharged at workshops",
  pain1Solution:
    "Understand the fault before you pay. The app explains the issue in plain language before you walk into the shop.",
  pain2Problem: "Forgetting maintenance",
  pain2Solution:
    "Smart counters remind you about oil, filters, and inspections before expensive failures happen.",
  pain3Problem: "Emergencies & parking",
  pain3Solution:
    "Save your car's location automatically, and trigger the SOS protocol when needed — even offline.",
  pain4Problem: "Strange engine noises",
  pain4Solution:
    "Run an acoustic scan with one tap and get an initial fault explanation before paying a single riyal.",
  pain5Problem: "Lost car expenses",
  pain5Solution:
    "Snap a fuel or service receipt — the smart wallet records and categorizes every expense automatically.",
  pain6Problem: "Trust issues handing over your car",
  pain6Solution:
    "Activate Key Guardian when handing the car to a valet or wash, and monitor its behavior without a constant connection.",
  pain7Problem: "Not knowing engine parts",
  pain7Solution:
    "Point your camera at the engine — AI explains each part and its function in plain language.",
  pain8Problem: "Bad roads and harsh bumps",
  pain8Solution:
    "Bump Memory logs harsh impact locations automatically, so you know exactly what's wearing your car down.",

  featBadge: "Genius features",
  featTitle: "Features that make",
  featTitleAccent: "your car smarter",
  featSubtitle:
    "Six AI-powered tools working behind the scenes to protect you from breakdowns and unexpected costs.",
  feat1Title: "Acoustic Diagnostics",
  feat1Desc:
    "Let the app listen to your engine and deliver an initial fault reading within seconds.",
  feat2Title: "Key Guardian",
  feat2Desc:
    "Monitor your car's behavior when handed to valets or car-wash workers, even without a constant connection.",
  feat3Title: "Bump Memory",
  feat3Desc:
    "Automatically log harsh bumps using phone sensors, so you know exactly what's affecting your car.",
  feat4Title: "Engine X-Ray",
  feat4Desc:
    "Point your camera at the engine — AI explains which part is which and what it does.",
  feat5Title: "Smart Wallet",
  feat5Desc:
    "Snap a fuel or service receipt — the app logs and categorizes the expense automatically.",
  feat6Title: "Smart SOS",
  feat6Desc:
    "Hard impact or risky situation? A countdown triggers an emergency flow that can share your location instantly.",

  howBadge: "Technology",
  howTitle: "How does",
  howTitleAccent: "AI DriveX work?",
  howSubtitle: "Three simple steps stand between you and smarter, safer driving.",
  step1Title: "Install the app",
  step1Desc: "Get started in under a minute — no complex setup, no long signup.",
  step2Title: "Let the AI watch over",
  step2Desc:
    "Audio, location, expenses, and counters run locally on your phone to protect your privacy.",
  step3Title: "Make the right call",
  step3Desc:
    "Know when to visit the workshop, when the issue is minor, and when you need to act fast.",

  downloadBadge: "Available on mobile",
  downloadTitle: "Start driving",
  downloadTitleAccent: "smarter today",
  downloadSubtitle:
    "Download AI DriveX and enjoy a smart car assistant that rides with you on the road, in parking lots, and in emergencies.",

  priceBadge: "Pricing",
  priceTitle: "A plan for",
  priceTitleAccent: "every driver",
  priceSubtitle:
    "Save thousands of riyals in workshop bills and unexpected breakdowns with a simple monthly subscription.",
  priceBasicName: "Basic",
  priceBasicAmount: "Free",
  priceBasicDesc:
    "Start protecting your car at no cost and enjoy the everyday essentials.",
  priceBasicCta: "Start Free",
  priceBasicF1: "Daily expense tracking",
  priceBasicF2: "Automatic parking location",
  priceBasicF3: "Smart maintenance counters",
  priceBasicF4: "Offline-first local log",
  priceProName: "AI Pro",
  priceProAmount: "300 SAR",
  priceProPeriod: "/ month",
  priceProDesc:
    "The full power of AI in your hands — cheaper than a single workshop visit, for a whole month of protection.",
  priceProCta: "Subscribe Now",
  priceProBadge: "Best Value",
  priceProF1: "Unlimited engine acoustic scans",
  priceProF2: "Smart fault advisor (Arabic & English)",
  priceProF3: "Advanced Key Guardian mode",
  priceProF4: "Real-time emergency SOS alerts",
  priceProF5: "Cloud sync when online",
  priceProF6: "Early access to upcoming AI features",
  priceFootnote: "Cancel any time — no long-term commitment.",

  navContact: "Contact",
  contactBadge: "Get in touch",
  contactTitle: "Want to learn more about",
  contactTitleAccent: "AI DriveX?",
  contactSubtitle:
    "Book a free demo call to see how the app works, or message us directly on WhatsApp for any question. We're here to answer everything within minutes.",
  contactWhatsTitle: "Message us on WhatsApp",
  contactWhatsDesc:
    "Start a live conversation with us and get fast answers to your questions — no waiting around.",
  contactWhatsCta: "Start chat",
  contactBookTitle: "Book a demo session",
  contactBookDesc:
    "Free 15-minute video call where we walk you through every AI DriveX feature and answer all your questions.",
  contactBookCta: "Book your slot",
  contactPerk1: "Reply within minutes",
  contactPerk2: "No purchase obligation",
  contactPerk3: "Available in Arabic & English",
  footerContact: "Contact",

  founderBadge: "The story",
  founderTitle: "Behind",
  founderTitleAccent: "AI DriveX",
  founderRole: "Founder · Full Stack Developer · UX/UI Designer",
  founderBio:
    "Full Stack Developer with deep passion for Arabic NLP, Generative AI, and LLM applications. Dedicated to building multilingual AI platforms that serve GCC & MENA drivers with real understanding of their needs and culture.",
  founderCta: "Connect on LinkedIn",
  founderQuote:
    "Every line of code in AI DriveX is written with one obsession: giving Arab drivers technology that feels built for them — not adapted from someone else.",
  founderStat1Label: "Years of experience",
  founderStat1Value: "15+",
  founderStat2Label: "AI projects",
  founderStat2Value: "10+",
  founderStat3Label: "Languages supported",
  founderStat3Value: "3",
  founderSkill1: "Full Stack Development",
  founderSkill2: "Arabic NLP",
  founderSkill3: "Generative AI · LLMs",
  founderSkill4: "UX / UI Design",

  footerTagline: "Your smart car assistant for driving, maintenance, safety, and expenses.",
  footerFeatures: "Features",
  footerPricing: "Pricing",
  footerDownload: "Download",
  footerFounder: "Founder",
  footerRights: "© 2026 AI DriveX. All rights reserved.",
  footerBuilt: "Built with love for GCC & MENA drivers.",
  footerDesignedBy: "Designed & developed by Meryem Boulbassir",

  checkoutTitle: "Complete your subscription",
  checkoutSubtitle: "One step away from driving smarter with AI Pro.",
  checkoutBack: "Back to home",
  checkoutSecure: "Secure encrypted connection",
  checkoutCardSection: "Card details",
  checkoutCardholderName: "Cardholder name",
  checkoutCardholderPlaceholder: "MERYEM BOULBASSIR",
  checkoutCardNumber: "Card number",
  checkoutCardExpiry: "Expiry date",
  checkoutCardCvv: "CVV",
  checkoutBillingSection: "Billing details",
  checkoutEmail: "Email for receipt",
  checkoutEmailPlaceholder: "you@example.com",
  checkoutCountry: "Country",
  checkoutTerms:
    "I agree to the Terms of Service and Privacy Policy, and acknowledge that my subscription will auto-renew.",
  checkoutPay: "Pay 300 SAR now",
  checkoutProcessing: "Processing…",
  checkoutSuccessTitle: "Payment successful!",
  checkoutSuccessDesc:
    "Welcome to AI Pro. We've sent a receipt to your email, and your account is ready to use right now.",
  checkoutSummaryTitle: "Order summary",
  checkoutSummaryPlan: "AI Pro plan",
  checkoutSummaryBilled: "Billed monthly",
  checkoutSummarySubtotal: "Subtotal",
  checkoutSummaryVat: "VAT (15%)",
  checkoutSummaryTotal: "Total today",
  checkoutTrustEncrypted: "256-bit SSL encryption",
  checkoutTrustCancel: "Cancel anytime",
  checkoutTrustRefund: "7-day refund guarantee",
  checkoutMoneyBack: "Full money-back guarantee within 7 days — no questions asked.",
  checkoutDemoNote:
    "This is a demo UI — no real payment will be processed. For live integration use Stripe or Tap.",
};

const DICTS: Record<LandingLang, LandingDict> = { ar, en };

export function getLandingDict(language: string): LandingDict {
  return language === "ar" ? DICTS.ar : DICTS.en;
}
