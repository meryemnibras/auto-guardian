# 📱 دليل نشر AI DriveX على Google Play Store

> دليل عملي من **صفر إلى تطبيق منشور** على Google Play خلال **يومين** عمل.
> الطريقة: تحويل الـ PWA الحالي إلى **TWA (Trusted Web Activity)** باستخدام
> أداة Google الرسمية **Bubblewrap**.

---

## 🎯 ماذا سينتج عن هذا الدليل

في نهاية الخطوات ستحصلين على:

- 📦 ملف `.aab` (Android App Bundle) جاهز لرفعه على Play Store.
- 🔑 ملف `android.keystore` (مفتاح التوقيع — احفظيه بأمان).
- 🎨 آيقونات بكل المقاسات + Splash Screen.
- ✅ تطبيق على Play Store يفتح بدون شريط متصفح ويعمل **Offline**.

---

## ✅ ما تم إنجازه فعلياً (لا تفعليه أنتِ)

تم في هذا المشروع تجهيز كل ما يلزم على جهة الكود:

| العنصر | الملف | الحالة |
|---|---|---|
| Web App Manifest كامل | `app/manifest.ts` | ✅ |
| آيقونات Android (192/512/maskable) | `public/icons/*.png` | ✅ |
| آيقونة Apple PWA | `public/apple-touch-icon.png` | ✅ |
| نقطة `/.well-known/assetlinks.json` | `app/.well-known/assetlinks.json/route.ts` | ✅ |
| إعدادات Bubblewrap جاهزة | `twa-manifest.json` | ✅ |
| Service Worker (يعمل Offline) | `public/sw.js` + ServiceWorkerRegistrar | ✅ |
| Screenshots metadata | داخل manifest.ts | ⚠️ يحتاج صور حقيقية |

---

## 🛠️ المرحلة 1 — متطلّبات الجهاز (مرة واحدة)

### 1.1 — تثبيت Node.js 20+
موجود لديكِ بالفعل (شرط Bubblewrap).

### 1.2 — تثبيت Java JDK 17
Bubblewrap يحتاج Java لبناء APK/AAB.

**Windows**:
```bash
# نزّلي من
https://adoptium.net/temurin/releases/?version=17
# اختاري Windows x64 → MSI Installer
# بعد التثبيت تحقّقي:
java -version
# يجب أن يطبع: openjdk version "17.x.x"
```

### 1.3 — تثبيت Android SDK Command-Line Tools
**Bubblewrap يقترح أن يثبّتها تلقائياً عند أوّل تشغيل.** قبلي وانتظري ~5 دقائق.

### 1.4 — تثبيت Bubblewrap CLI
```bash
npm install -g @bubblewrap/cli
bubblewrap --version
# يجب أن يطبع: 1.x.x
```

---

## 🏗️ المرحلة 2 — توليد مشروع Android

### 2.1 — في مجلّد جديد منفصل عن مشروع الويب
```bash
cd ~/Desktop
mkdir aidrivex-android && cd aidrivex-android
```

### 2.2 — تشغيل Bubblewrap init
```bash
bubblewrap init --manifest=https://auto-guardian-kappa.vercel.app/manifest.webmanifest
```

سيسألكِ:
- **Domain** → `auto-guardian-kappa.vercel.app` (الافتراضي).
- **Package ID** → `ai.drivex.app` (مهم: لا تغيّريه لاحقاً!).
- **App name** → `AI DriveX`.
- **Display mode** → `standalone`.
- **Orientation** → `portrait`.
- **Theme color** → `#020617`.
- **Background color** → `#020617`.
- **Icon URL** → سيكتشفها تلقائياً من manifest.
- **Maskable icon** → نعم.
- **Notifications** → نعم.
- **Generate signing key** → نعم.
- **Keystore password** → اختاري كلمة سرّ قويّة **واحفظيها** (لن تستطيعي تحديث التطبيق بدونها).
- **Key alias** → `android`.
- **Key password** → نفس الـ keystore password يكفي.

### 2.3 — أو استخدمي الـ config الجاهز
بدل الإجابة على كل الأسئلة، انسخي ملف `twa-manifest.json` من مشروع الويب:
```bash
cp /path/to/auto-guardian/twa-manifest.json ./
bubblewrap update
```

### 2.4 — بناء التطبيق
```bash
bubblewrap build
```

يستغرق 3-8 دقائق أوّل مرة (تنزيل Gradle).

**النتيجة**:
- `app-release-bundle.aab` ← هذا الذي ترفعينه لـ Play Store.
- `app-release-signed.apk` ← لتجربيه على هاتفكِ مباشرة.

---

## 🔐 المرحلة 3 — ربط Digital Asset Links

لإخفاء شريط العنوان نهائياً في التطبيق، يجب أن يثبت Google أن هذا الموقع
يأذن للتطبيق بفتحه فل-سكرين.

### 3.1 — استخراج SHA-256 fingerprint من الـ keystore
```bash
keytool -list -v -keystore ./android.keystore -alias android
# انسخي القيمة بعد "SHA256:"
# مثال: 14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:...
```

### 3.2 — أضيفيها لـ Vercel
[vercel.com/ubcdsg-6272s-projects/auto-guardian/settings/environment-variables](https://vercel.com/ubcdsg-6272s-projects/auto-guardian/settings/environment-variables)

أضيفي متغيّرين:
| Name | Value |
|---|---|
| `TWA_SHA256_FINGERPRINT` | `14:6D:E9:83:...` (من خطوة 3.1) |
| `TWA_PACKAGE_NAME` | `ai.drivex.app` |

ثم **Redeploy**. سيخدم Vercel `/.well-known/assetlinks.json` تلقائياً
بالتوقيع الصحيح، و TWA سيتأكّد منه عند أوّل فتح.

### 3.3 — تحقّق
```bash
curl https://auto-guardian-kappa.vercel.app/.well-known/assetlinks.json
# يجب أن يطبع JSON يحتوي على الـ fingerprint
```

---

## 🏪 المرحلة 4 — نشر على Google Play Console

### 4.1 — تسجيل حساب مطوّر
[play.google.com/console/signup](https://play.google.com/console/signup)
- **$25 رسوم لمرّة واحدة** (Visa/Mastercard).
- يحتاج وثائق هوية.
- المراجعة 24-48 ساعة.

### 4.2 — إنشاء تطبيق
في Play Console → **Create app**:
- **App name**: AI DriveX
- **Default language**: Arabic (ar) أو English
- **App or game**: App
- **Free or paid**: Free (المستخدم يدفع داخل التطبيق لاحقاً)
- **Declarations**: وافقي على السياسات.

### 4.3 — معلومات Store Listing
في **Main store listing**:

**Short description (80 حرف)**:
```
مساعد سيارتك الذكي بالـ AI — يستمع للمحرّك، يتتبع المصاريف، ويحرس في الطوارئ.
```

**Full description (4000 حرف)** — استخدمي هذا النص أو طوّريه:
```
AI DriveX هو أوّل مساعد سيارة ذكي بالعربية، مصمّم خصّيصاً لسائقي الخليج
والشرق الأوسط.

🎙️ فحص صوتي للمحرّك
دع التطبيق يستمع لمحركك، ثم يعطيك قراءة مبدئية للعطل المحتمل خلال ثوانٍ.

🛡️ حارس المفاتيح
راقب سلوك السيارة عند تسليمها للعمال أو المغسلة، حتى بدون اتصال دائم.

💰 المحفظة الذكية
صوّر فاتورة البنزين أو الصيانة، ودع التطبيق يسجل المصروفات تلقائياً.

🚨 SOS فوري
اهتزاز قوي أو موقف خطر؟ يبدأ عد تنازلي للطوارئ مع إرسال موقعك.

📍 Parking GPS
احفظ موقع سيارتك تلقائياً — لن تنسى مكانها أبداً.

✨ مميّزات إضافية:
- يعمل بدون إنترنت في الميزات الأساسية
- دعم كامل للعربية والإنجليزية
- متعدّد العملات (ر.س، دولار، يورو)
- تشخيص أكواد الأعطال (OBD-II) بلغة بسيطة

اشتركي في AI Pro بـ 300 ر.س / شهرياً — أرخص من زيارة ورشة واحدة.

تابعونا: https://auto-guardian-kappa.vercel.app
```

**Graphics المطلوبة**:
| النوع | المقاس | المصدر |
|---|---|---|
| App icon | 512×512 | `public/icons/icon-512.png` ✅ |
| Feature graphic | 1024×500 | يجب إنشاؤها (انظري 4.6) |
| Phone screenshots (2-8) | 1080×1920 | يجب إنشاؤها (انظري 4.6) |

**Category**: Auto & Vehicles
**Contact email**: hi@aidrivex.com (أو بريدكِ)
**Privacy Policy URL**: `https://auto-guardian-kappa.vercel.app/privacy`

### 4.4 — Content Rating
أجيبي على الاستبيان (5 دقائق). تطبيقكِ يحصل على **Everyone** أو **Mature 17+** حسب
إذا فيه محتوى عنف أو رهانات (لا يوجد، فستحصلين على Everyone).

### 4.5 — Target audience
- الفئة العمرية: 18+
- **بلدان النشر**: السعودية، الإمارات، الكويت، قطر، البحرين، عُمان، الأردن، مصر، المغرب (بحسب رغبتكِ).

### 4.6 — رفع الـ AAB
في Play Console → **Production → Create new release**:
1. **App signing**: اقبلي Google's recommendation (Google يحتفظ بنسخة من مفتاحكِ).
2. **App bundle**: ارفعي `app-release-bundle.aab` من المرحلة 2.
3. **Release name**: `1.0.0`
4. **Release notes**:
   ```
   ar-SA:
   إطلاق رسمي 🎉
   - مساعد ذكي يستمع للمحرّك
   - محفظة مصاريف ذكية
   - SOS فوري بدون إنترنت

   en-US:
   Official launch 🎉
   - Smart engine acoustic scan
   - Auto expense wallet
   - Instant offline SOS
   ```

### 4.7 — تحضير Screenshots و Feature Graphic
استخدمي أحد هذه الطرق:

**الطريقة الأسهل**: تطبيق Figma/Canva
- Templates → "Google Play Screenshots"
- استخدمي شعار AI DriveX + ألوان `#020617` + `#22d3ee`

**الطريقة العملية**: من المتصفّح
1. افتحي [auto-guardian-kappa.vercel.app](https://auto-guardian-kappa.vercel.app) في Chrome.
2. اضغطي F12 → Toggle Device Toolbar (Ctrl+Shift+M).
3. اختاري **Pixel 7 (1080×1920)**.
4. التقطي screenshots للصفحات:
   - الصفحة الرئيسية (`/landing`)
   - الـ Chat (`/`)
   - Diagnostics (`/diagnostics`)
   - Wallet (`/wallet`)
5. احفظيها في `public/screenshots/`.

### 4.8 — إرسال للمراجعة
بعد ملء كل الأقسام بعلامة ✅ خضراء:
- **Send for review**
- المدّة: 1-3 أيّام أوّل مرة، ساعات للتحديثات اللاحقة.

---

## 🧪 المرحلة 5 — تجربة قبل النشر

### 5.1 — تجربة الـ APK مباشرة على هاتفكِ
1. حوّلي `app-release-signed.apk` لهاتفكِ (USB/Telegram).
2. **Settings → Security → Install unknown apps** للتطبيق الذي تستخدمينه.
3. افتحي الـ APK → تثبيت.
4. افتحي AI DriveX → يجب أن يظهر **بدون شريط متصفح**.
5. إذا ظهر شريط متصفح، فالـ Digital Asset Links لم يُربط بعد (راجعي المرحلة 3).

### 5.2 — Internal Testing track
بدل الإطلاق المباشر، أنصحكِ:
1. في Play Console → **Internal testing** → أنشئي مجموعة اختبار (يصل لـ 100 شخص).
2. ارفعي AAB هناك أوّلاً.
3. شاركي رابط الاختبار مع 5-10 أشخاص لمدّة أسبوع.
4. بعد تأكّدكِ من عدم وجود أخطاء → انقلي الإصدار إلى **Production**.

---

## 🔄 المرحلة 6 — التحديثات اللاحقة (سحرية!)

### 6.1 — للتغييرات على الكود (90% من التحديثات)
**لا تحتاجين رفع AAB جديد!** كل push على GitHub يُحدّث الـ TWA تلقائياً
عبر Vercel — لأن التطبيق يحمّل المحتوى من الويب.

### 6.2 — متى ترفعين AAB جديد
فقط عند:
- تغيير اسم التطبيق أو الآيقونة.
- إضافة صلاحيات Android جديدة (Camera, Location…).
- ترقية إلى Android API جديدة.
- إصلاح bug في الـ TWA wrapper نفسه.

في هذه الحالات:
```bash
cd aidrivex-android
bubblewrap update      # يجلب آخر manifest من Vercel
bubblewrap build       # AAB جديد
# ارفعيه على Play Console → Production → New release
```

---

## 🆘 أخطاء شائعة وحلولها

### "Application not installed"
السبب: التطبيق سبق وثُبّت بـ APK بمفتاح مختلف.
الحل: احذفي التطبيق القديم من الهاتف ثم أعيدي التثبيت.

### "URL bar appears in TWA"
السبب: Digital Asset Links لم يُربط بالشكل الصحيح.
الحل:
1. تحقّقي من قيمة `TWA_SHA256_FINGERPRINT` على Vercel.
2. أعيدي deploy.
3. أعيدي تثبيت التطبيق على الهاتف.
4. اختبري:
   ```
   https://developers.google.com/digital-asset-links/tools/generator
   ```

### "App is offline" داخل التطبيق
السبب: Service Worker لا يعمل.
الحل: تحقّقي أن `public/sw.js` يُخدّم بـ MIME type صحيح (Vercel يفعل
ذلك تلقائياً).

### Play Console يرفض الـ AAB
السبب الأشيع: targetSdkVersion قديم.
الحل: حدّثي Bubblewrap لآخر إصدار:
```bash
npm install -g @bubblewrap/cli@latest
bubblewrap update
bubblewrap build
```

---

## 📊 جدول زمني متوقّع

| اليوم | المهمّة | الوقت |
|---|---|---|
| 1 | تثبيت Java + Bubblewrap | 30 دقيقة |
| 1 | تشغيل `bubblewrap init` + `build` | 30 دقيقة |
| 1 | تجربة APK على هاتفكِ | 15 دقيقة |
| 1 | استخراج SHA + إضافة لـ Vercel | 15 دقيقة |
| 1 | إنشاء Google Play Console account | 30 دقيقة + 24h انتظار |
| 2 | تجهيز Screenshots + Feature Graphic | 1-2 ساعة |
| 2 | ملء Store Listing | 1 ساعة |
| 2 | رفع AAB → Internal Testing | 15 دقيقة |
| 2-5 | Beta test مع 5-10 أشخاص | 2-3 أيّام |
| 6 | نشر على Production | 15 دقيقة + 1-3 أيّام مراجعة Google |

**المجموع**: **أسبوع واحد** من فكرة "أريد التطبيق على Play Store" إلى أن
يجده الناس بالبحث في Play Store.

---

## 💰 التكلفة الإجمالية

| البند | التكلفة |
|---|---|
| Google Play Developer registration | $25 (مرّة واحدة) |
| Bubblewrap CLI | مجاني |
| Vercel Hosting | مجاني (Hobby) |
| Supabase | مجاني |
| Domain (لاحقاً) | $12/سنة |
| **المجموع للإطلاق** | **$25** |

---

## 🚀 ما بعد الإطلاق

### الترقيات الموصى بها بترتيب الأولوية:

1. **App Store Optimization (ASO)** — اختاري keywords ذكيّة لتظهري في
   البحث: "مساعد سيارة", "فحص محرك", "إدارة سيارة".

2. **App Reviews** — اطلبي تقييم من المستخدمين بعد أوّل 3 استخدامات
   ناجحة (يرفع ranking في Play).

3. **In-App Subscriptions** — استبدلي Stripe بـ **Google Play Billing**
   لقبول الاشتراكات داخل التطبيق. (Google يأخذ 15-30% عمولة).

4. **Push Notifications** — مع Firebase Cloud Messaging لتذكير
   المستخدمين بصيانة دورية.

5. **iOS Version** — App Store ($99/سنة + Mac) باستخدام نفس الـ TWA
   approach (Apple أكثر تشدّداً، قد يتطلّب Capacitor).

---

## 📞 لو واجهتِ مشكلة

ارجعي لهذه المصادر:
- **Bubblewrap docs**: [github.com/GoogleChromeLabs/bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
- **PWA Builder**: [pwabuilder.com](https://pwabuilder.com) (بديل بدون terminal)
- **Play Console Help**: [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)

أو راسليني هنا في Claude مع رسالة الخطأ كاملة.

---

**حظّاً موفّقاً مع الإطلاق! 🚗💨**
