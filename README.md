# AI DriveX — مساعد سيارتك الذكي

> A privacy-first, offline-capable car assistant that runs entirely on your device.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## ✨ Features

- 🤖 **AI Chat** — Multi-provider (Anthropic Claude / Google Gemini / mock fallback)
- 🎙️ **Acoustic Scanner** — Record 5s of engine sound, simulate diagnostic
- 🔧 **OBD-II Code Advisor** — Local database of 5 common codes + AI for unknown ones
- 💰 **Smart Wallet** — Expense tracking + receipt OCR (mock) + AI-generated summaries
- ⛽ **Fuel Log** — Track fill-ups, compute L/100km efficiency, trend analysis
- 🅿️ **Parking Memory** — Save GPS coords, Haversine return compass
- 🚨 **SOS System** — Shake-detect emergency (3 shakes in 1.5s) + countdown + sms: link
- 🔧 **Maintenance Log** — Mark service done, gauges recompute from real history
- 📥 **Full Data Portability** — Export JSON/CSV, restore with merge/replace
- 🌐 **3 Languages** — Arabic / English / French with automatic RTL/LTR

## 🛡️ Privacy

- 100% local-first — IndexedDB only
- No analytics, no cookies, no tracking
- AI requests sent only when user explicitly triggers them
- Optional Supabase sync (user-controlled)

## 🚀 Quick start

```bash
npm install
cp .env.example .env.local   # fill in optional AI keys
npm run dev                  # → http://localhost:3000
```

App works fully without any keys (clean mock mode).

## 🔑 Optional environment variables

| Variable | Purpose | Cost |
|----------|---------|------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini AI fallback | Free (1500/day) |
| `ANTHROPIC_API_KEY` | Claude streaming chat | Paid |
| `OPENAI_API_KEY` | OpenAI (scaffold only) | Paid |
| `NEXT_PUBLIC_SUPABASE_URL` | Cloud sync | Free tier |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cloud sync auth | — |

Get a free Gemini key: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## 🏗️ Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript strict
- **Styling:** Tailwind CSS + Framer Motion
- **Storage:** Dexie (IndexedDB) v5 schema with 6 tables
- **AI:** Vercel AI SDK + Anthropic/Google providers
- **PWA:** Manifest + service worker + offline shell cache
- **Validation:** Zod on every API boundary

## 📂 Routes

| Path | What it does |
|------|--------------|
| `/` | Home — AI chat |
| `/ai-test` | Cost-free mock chat lab with persisted history |
| `/diagnostics` | Acoustic scanner + OBD-II advisor + sound description AI |
| `/wallet` | Expenses + OCR receipts + AI summary + fuel log + maintenance gauges |
| `/emergency` | Parking + return compass + SOS shake detection |
| `/settings` | Storage stats + JSON/CSV export + restore + language |
| `/privacy`, `/terms` | Legal pages |

## 🚢 Deploy on Vercel

1. Push to GitHub
2. Import on [vercel.com/new](https://vercel.com/new)
3. Add the env vars you have (optional)
4. Deploy

App works at 100% with zero env vars (mock mode).

## 📝 License

MIT
