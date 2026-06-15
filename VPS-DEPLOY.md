# 🚀 دليل رفع AI DriveX على الـ VPS وربط دومين aidrivex.agency

> دليل عملي كامل. كل ما تجهّز من جهتي — أنتِ فقط تنفّذين الأوامر على سيرفركِ.
> الوقت المتوقّع: **20-30 دقيقة** + انتظار انتشار الـ DNS.

---

## ⚠️ قبل أي شيء — الأمان

1. **غيّري كلمة سرّ الـ VPS الآن** — الكلمة التي شاركتِها سابقاً أصبحت مكشوفة.
2. لا تشاركي كلمات السرّ في أي محادثة بعد الآن.

---

## 📋 ما ستفعلينه (3 خطوات رئيسية)

```
1) ضبط سجلّات DNS في Namecheap  ← يوجّه الدومين لسيرفركِ
2) الدخول للسيرفر + جلب المشروع   ← أمر واحد
3) تشغيل سكريبت النشر التلقائي     ← يفعل كل الباقي وحده
```

---

## 🌐 الخطوة 1 — سجلّات DNS في Namecheap

### 1.1 — احصلي على IP السيرفر
من لوحة تحكّم مزوّد الـ VPS، انسخي **IPv4 address** (مثل `123.45.67.89`).

### 1.2 — افتحي إعدادات DNS
1. ادخلي [namecheap.com](https://www.namecheap.com) → **Domain List**.
2. بجانب `aidrivex.agency` اضغطي **Manage**.
3. تبويب **Advanced DNS**.

### 1.3 — احذفي السجلّات الافتراضية
احذفي أي **A Record** أو **CNAME** أو **URL Redirect** موجود مسبقاً (مثل
"parking page").

### 1.4 — أضيفي هذين السجلّين

| Type | Host | Value | TTL |
|---|---|---|---|
| **A Record** | `@` | `IP-سيرفركِ` | Automatic |
| **A Record** | `www` | `IP-سيرفركِ` | Automatic |

> استبدلي `IP-سيرفركِ` بالرقم من خطوة 1.1 (نفس الـ IP في السجلّين).

اضغطي **Save All Changes** (علامة ✓ الخضراء).

### 1.5 — انتظري الانتشار
عادةً **10-30 دقيقة** (قد يصل لساعتين). تحقّقي من اكتماله:
- افتحي [dnschecker.org](https://dnschecker.org) → اكتبي `aidrivex.agency` → اختاري **A**.
- عندما يظهر IP سيرفركِ في معظم المواقع حول العالم ✅ → انتقلي للخطوة 2.

---

## 🖥️ الخطوة 2 — الدخول للسيرفر وجلب المشروع

### 2.1 — افتحي SSH
على جهازكِ (Windows) افتحي **PowerShell** أو **Windows Terminal** واكتبي:

```bash
ssh root@IP-سيرفركِ
```

> استبدلي `root` باسم المستخدم لو كان مختلفاً (مثل `ubuntu`)، و `IP-سيرفركِ`
> بالرقم. ستُطلب كلمة السرّ (الجديدة التي غيّرتِها).

### 2.2 — ثبّتي git واجلبي المشروع
بعد الدخول للسيرفر، الصقي:

```bash
apt-get update -y && apt-get install -y git
git clone https://github.com/meryemnibras/auto-guardian.git
cd auto-guardian
```

---

## 🔐 الخطوة 3 — تجهيز المتغيّرات السرّية + التشغيل

### 3.1 — أنشئي ملف الإعدادات
```bash
cp .env.production.example .env.production
nano .env.production
```

### 3.2 — املئي القيم
داخل المحرّر `nano`، استبدلي القيم بمفاتيحكِ الحقيقية:

| المفتاح | من أين تحصلين عليه |
|---|---|
| `NEXT_PUBLIC_APP_URL` | اتركيه `https://aidrivex.agency` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (مجاني) |
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → signing secret |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) |
| `RESEND_FROM_EMAIL` | `AI DriveX <hi@aidrivex.agency>` |
| `NOTIFY_EMAIL` | بريدكِ لاستقبال الإشعارات |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | رقمكِ بصيغة `9665XXXXXXXX` |
| `NEXT_PUBLIC_CALENDLY_URL` | رابط Calendly الخاص بكِ |

> 💡 يكفي للبدء: `NEXT_PUBLIC_APP_URL` + مفاتيح Supabase + مفتاح AI واحد.
> الباقي يمكن إضافته لاحقاً (الموقع يعمل بدونها ويعطّل الميزة المرتبطة فقط).

**للحفظ في nano**: `Ctrl+O` ثم `Enter` ثم `Ctrl+X`.

### 3.3 — شغّلي سكريبت النشر السحري 🪄
```bash
sudo DOMAIN=aidrivex.agency EMAIL=ubcdsg@gmail.com bash deploy.sh
```

هذا الأمر **يفعل كل شيء تلقائياً**:
- ✅ يثبّت Docker + Nginx + Certbot
- ✅ يبني المشروع (يأخذ 3-8 دقائق أوّل مرّة)
- ✅ يشغّل التطبيق
- ✅ يضبط Nginx كوسيط عكسي
- ✅ يصدر شهادة SSL مجانية (HTTPS)
- ✅ يفعّل التجديد التلقائي للشهادة

### 3.4 — تمّ! 🎉
افتحي المتصفّح على:

**https://aidrivex.agency**

---

## ✅ التحقّق من النجاح

```bash
# حالة الحاوية (يجب أن تكون "Up" و "healthy")
docker compose ps

# سجلّات التطبيق المباشرة
docker compose logs -f app

# اختبار سريع من داخل السيرفر
curl -I https://aidrivex.agency/landing
# يجب أن يطبع: HTTP/2 200
```

---

## 🔄 التحديثات المستقبلية

عندما أحدّث الكود وأدفعه على GitHub، لتحديث سيرفركِ:

```bash
cd ~/auto-guardian
git pull
sudo docker compose --env-file .env.production up -d --build
```

3 أوامر فقط، خلال دقيقتين.

---

## 🪝 ربط Stripe Webhook (بعد النشر)

لتفعيل الدفع الحقيقي وتأكيد الاشتراكات:

1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. **Endpoint URL**: `https://aidrivex.agency/api/webhooks/stripe`
3. **Events**: اختاري:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. انسخي **Signing secret** (`whsec_...`) إلى `.env.production` →
   `STRIPE_WEBHOOK_SECRET`.
5. أعيدي التشغيل:
   ```bash
   sudo docker compose --env-file .env.production up -d
   ```

---

## 🆘 حلّ المشاكل الشائعة

### الموقع لا يفتح / Certbot فشل
**السبب الأشيع**: الـ DNS لم ينتشر بعد.
- تأكّدي من dnschecker.org أن الـ A record يشير لسيرفركِ.
- ثم أعيدي تشغيل: `sudo DOMAIN=aidrivex.agency EMAIL=ubcdsg@gmail.com bash deploy.sh`

### "port 80 already in use"
خدمة أخرى تستخدم المنفذ. أوقفيها:
```bash
sudo systemctl stop apache2 2>/dev/null
sudo fuser -k 80/tcp
```
ثم أعيدي تشغيل السكريبت.

### التطبيق يعمل لكن صفحة بيضاء
تحقّقي من السجلّات:
```bash
docker compose logs --tail=50 app
```
غالباً مفتاح env ناقص أو خاطئ في `.env.production`.

### "permission denied" عند docker
أضيفي sudo، أو أضيفي مستخدمكِ لمجموعة docker:
```bash
sudo usermod -aG docker $USER
# ثم سجّلي خروج ودخول من SSH
```

### تريدين تغيير قيمة env
```bash
nano .env.production              # عدّلي
sudo docker compose --env-file .env.production up -d --build   # أعيدي البناء
```

---

## 📊 ملخّص البنية

```
المستخدم → https://aidrivex.agency
              │
              ▼
    ┌──────────────────┐
    │  Nginx (host)    │  :443  ← شهادة SSL من Let's Encrypt
    │  reverse proxy   │
    └────────┬─────────┘
             │ 127.0.0.1:3000
             ▼
    ┌──────────────────┐
    │  Docker container│  ← Next.js standalone
    │  aidrivex-app    │
    └────────┬─────────┘
             │
             ▼
   Supabase · Stripe · Resend · Gemini  (خدمات خارجية)
```

---

## 💰 ملاحظة عن الـ VPS مقابل Vercel

تذكّرة بسيطة: المشروع يعمل أيضاً مجاناً على Vercel
([auto-guardian-kappa.vercel.app](https://auto-guardian-kappa.vercel.app)).
لو أردتِ لاحقاً توجيه الدومين لـ Vercel بدل الـ VPS (لتوفير تكلفة السيرفر
والصيانة)، أخبريني وأعطيكِ سجلّات DNS البديلة خلال دقائق.

---

**بالتوفيق مع الإطلاق! 🚗💨**
كل ملفات النشر جاهزة في المستودع. إن واجهتِ أي خطأ، انسخي رسالته كاملة وأرسليها لي.
