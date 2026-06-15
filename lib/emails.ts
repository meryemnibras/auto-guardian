/**
 * Branded HTML email templates.
 *
 * All templates use inline styles (the only thing email clients reliably
 * support), dark-on-light to match Gmail / Outlook defaults, and a single
 * cyan→violet accent that mirrors the brand on the Landing.
 */

import type { Currency } from "@/lib/currency";

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://auto-guardian-kappa.vercel.app";

const LOGO_URL = `${APP_URL}/logo.png`;

function shell({
  title,
  preheader,
  body,
}: {
  title: string;
  preheader: string;
  body: string;
}): string {
  return `<!doctype html>
<html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:'Segoe UI',Tahoma,Helvetica,Arial,sans-serif;color:#0f172a;">
<div style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f7fb;padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border-radius:20px;box-shadow:0 10px 30px -12px rgba(15,23,42,.12);overflow:hidden;">
      <tr><td style="padding:28px 32px 0 32px;text-align:center;">
        <img src="${LOGO_URL}" alt="AI DriveX" width="56" height="56" style="display:inline-block;height:56px;width:56px;border-radius:14px;background:linear-gradient(135deg,#22d3ee,#3b82f6,#a78bfa);"/>
        <h1 style="margin:14px 0 0;font-size:18px;letter-spacing:.5px;color:#0f172a;">AI <span style="background:linear-gradient(90deg,#22d3ee,#3b82f6,#a78bfa);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;">DriveX</span></h1>
      </td></tr>
      <tr><td style="padding:24px 32px 32px;">
        ${body}
      </td></tr>
      <tr><td style="padding:0 32px 28px;border-top:1px solid #eef1f6;">
        <p style="margin:18px 0 4px;font-size:11px;color:#94a3b8;text-align:center;">
          © ${new Date().getFullYear()} AI DriveX · Smart car assistant for GCC &amp; MENA drivers
        </p>
        <p style="margin:0;font-size:11px;color:#cbd5e1;text-align:center;">
          <a href="${APP_URL}/landing" style="color:#94a3b8;text-decoration:none;">${APP_URL.replace(/^https?:\/\//, "")}</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const button = (label: string, href: string) =>
  `<a href="${href}" style="display:inline-block;background:linear-gradient(90deg,#22d3ee,#3b82f6,#a78bfa);color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;font-size:14px;">${escapeHtml(label)}</a>`;

/* ---------------- WAITLIST WELCOME ---------------- */

export function waitlistWelcomeEmail(args: {
  email: string;
  language: "ar" | "en";
}): { subject: string; html: string } {
  const ar = args.language === "ar";
  const subject = ar
    ? "تأكيد التسجيل — مرحباً بكِ في AI DriveX 🚘"
    : "You're on the list — welcome to AI DriveX 🚘";

  const body = ar
    ? `
    <h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;text-align:right;" dir="rtl">مرحباً بك!</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;text-align:right;" dir="rtl">
      شكراً لتسجيلك في قائمة الانتظار لـ <strong>AI DriveX</strong> — مساعد سيارتك الذكي
      الذي يستمع لمحركك، يتتبّع مصاريفك، ويحمي سيارتك حتى بدون إنترنت.
    </p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#334155;text-align:right;" dir="rtl">
      احتفظ بهذا الإيميل — سترسلين لك أول من ينطلق التطبيق إلى جانب
      <strong>خصم 30%</strong> على أول 3 أشهر.
    </p>
    <p style="margin:0;text-align:right;" dir="rtl">${button("استكشف الموقع", `${APP_URL}/landing`)}</p>
    `
    : `
    <h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;">Welcome aboard!</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">
      Thanks for joining the waitlist for <strong>AI DriveX</strong> — the smart car
      assistant that listens to your engine, tracks expenses, and guards your car
      even offline.
    </p>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#334155;">
      Keep this email — you'll be among the first to get the launch invite,
      plus <strong>30% off your first 3 months</strong>.
    </p>
    <p style="margin:0;">${button("Explore the site", `${APP_URL}/landing`)}</p>
    `;

  return {
    subject,
    html: shell({
      title: subject,
      preheader: ar
        ? "تأكيد تسجيلك في قائمة انتظار AI DriveX."
        : "Your spot on the AI DriveX waitlist is reserved.",
      body,
    }),
  };
}

/* ---------------- SUBSCRIPTION RECEIPT ---------------- */

export function subscriptionReceiptEmail(args: {
  email: string;
  fullName: string | null;
  currency: Currency;
  totalAmount: number;
  vatAmount: number;
  subscriptionId: string;
  language: "ar" | "en";
}): { subject: string; html: string } {
  const ar = args.language === "ar";
  const symbol = args.currency === "SAR" ? (ar ? "ر.س" : "SAR") : args.currency === "USD" ? "$" : "€";
  const totalLabel =
    args.currency === "SAR"
      ? `${args.totalAmount} ${symbol}`
      : `${symbol}${args.totalAmount}`;

  const subject = ar
    ? `إيصال الاشتراك — ${totalLabel}`
    : `Subscription receipt — ${totalLabel}`;

  const greeting = args.fullName
    ? ar
      ? `مرحباً ${args.fullName}،`
      : `Hi ${args.fullName},`
    : ar
    ? "مرحباً،"
    : "Hi there,";

  const body = ar
    ? `
    <h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;text-align:right;" dir="rtl">تم الدفع بنجاح ✓</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;text-align:right;" dir="rtl">${greeting}</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;text-align:right;" dir="rtl">
      أهلاً بك في <strong>AI Pro</strong>. حسابك مفعّل ويمكنك البدء فوراً.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;border-radius:14px;margin:0 0 22px;">
      <tr><td style="padding:16px 18px;font-size:14px;color:#475569;" dir="rtl">
        <div style="display:flex;justify-content:space-between;padding:4px 0;">
          <span>الباقة</span><strong style="color:#0f172a;">AI Pro</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;">
          <span>ضريبة القيمة المضافة</span><span>${args.vatAmount > 0 ? `${args.vatAmount} ${symbol}` : "—"}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:1px solid #e2e8f0;margin-top:8px;font-weight:700;color:#0f172a;">
          <span>المبلغ المدفوع</span><span>${totalLabel}</span>
        </div>
      </td></tr>
    </table>
    <p style="margin:0;text-align:right;" dir="rtl">${button("افتح حسابي", `${APP_URL}/`)}</p>
    <p style="margin:18px 0 0;font-size:11px;color:#94a3b8;text-align:right;" dir="rtl">
      رقم الاشتراك: ${escapeHtml(args.subscriptionId)}
    </p>
    `
    : `
    <h2 style="margin:0 0 12px;font-size:22px;color:#0f172a;">Payment successful ✓</h2>
    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155;">${greeting}</p>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#334155;">
      Welcome to <strong>AI Pro</strong>. Your account is active — you can start right now.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;border-radius:14px;margin:0 0 22px;">
      <tr><td style="padding:16px 18px;font-size:14px;color:#475569;">
        <div style="display:flex;justify-content:space-between;padding:4px 0;">
          <span>Plan</span><strong style="color:#0f172a;">AI Pro</strong>
        </div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;">
          <span>VAT</span><span>${args.vatAmount > 0 ? `${symbol}${args.vatAmount}` : "—"}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:8px 0 0;border-top:1px solid #e2e8f0;margin-top:8px;font-weight:700;color:#0f172a;">
          <span>Total paid</span><span>${totalLabel}</span>
        </div>
      </td></tr>
    </table>
    <p style="margin:0;">${button("Open my account", `${APP_URL}/`)}</p>
    <p style="margin:18px 0 0;font-size:11px;color:#94a3b8;">
      Subscription ID: ${escapeHtml(args.subscriptionId)}
    </p>
    `;

  return {
    subject,
    html: shell({
      title: subject,
      preheader: ar
        ? "إيصال الاشتراك في AI Pro — أهلاً بك."
        : "Your AI Pro subscription receipt — welcome.",
      body,
    }),
  };
}

/* ---------------- FOUNDER NOTIFY ---------------- */

export function founderNotifyEmail(args: {
  kind: "waitlist" | "subscription";
  email: string;
  fullName?: string | null;
  currency?: Currency;
  totalAmount?: number;
  subscriptionId?: string;
}): { subject: string; html: string } {
  const isSub = args.kind === "subscription";
  const subject = isSub
    ? `🚀 New AI Pro subscription — ${args.email}`
    : `📩 New waitlist signup — ${args.email}`;

  const rows: string[] = [
    `<tr><td style="padding:6px 0;color:#64748b;">Email</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${escapeHtml(args.email)}</td></tr>`,
  ];
  if (args.fullName) {
    rows.push(
      `<tr><td style="padding:6px 0;color:#64748b;">Name</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${escapeHtml(args.fullName)}</td></tr>`
    );
  }
  if (isSub) {
    const symbol = args.currency === "SAR" ? "SAR" : args.currency === "USD" ? "$" : "€";
    const totalLabel =
      args.currency === "SAR"
        ? `${args.totalAmount} ${symbol}`
        : `${symbol}${args.totalAmount}`;
    rows.push(
      `<tr><td style="padding:6px 0;color:#64748b;">Amount</td><td style="padding:6px 0;font-weight:600;color:#0f172a;">${escapeHtml(totalLabel)}</td></tr>`
    );
    if (args.subscriptionId) {
      rows.push(
        `<tr><td style="padding:6px 0;color:#64748b;">Sub ID</td><td style="padding:6px 0;font-family:monospace;color:#475569;font-size:12px;">${escapeHtml(args.subscriptionId)}</td></tr>`
      );
    }
  }

  const body = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#0f172a;">${isSub ? "💰 New paying subscriber" : "🎉 New waitlist signup"}</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:13px;">${rows.join("")}</table>
    <p style="margin:20px 0 0;font-size:12px;color:#94a3b8;">
      Sent automatically from AI DriveX backend.
    </p>
  `;

  return {
    subject,
    html: shell({
      title: subject,
      preheader: isSub ? "A new AI Pro subscriber came in." : "Someone joined the waitlist.",
      body,
    }),
  };
}
