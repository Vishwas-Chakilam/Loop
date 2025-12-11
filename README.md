<div align="center">
  <img width="1200" height="475" alt="Loop Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Loop — by Vishwas Chakilam

I built Loop as a clean, Apple-inspired habit tracker that actually nudges me to stay consistent. It pairs daily tracking with gentle reminders, streaks, analytics, and AI-powered insights (Gemini) so I get quick, encouraging feedback without extra effort.

## What I focused on
- Fast PWA that installs cleanly on mobile/desktop
- Simple onboarding with a first habit to get momentum
- Reminders + streaks to keep consistency front and center
- Light, readable UI and offline-friendly caching via service worker
- AI insights (Gemini) that summarize the last two weeks and motivate with short tips

## Stack
- React + Vite
- Tailwind (CDN) + custom components
- Service worker + manifest for PWA install/offline
- Gemini API for insights

## Run locally
**Prerequisites:** Node.js

1) Install deps: `npm install`  
2) Add `GEMINI_API_KEY` to `.env.local`  
3) Start dev server: `npm run dev`  

Then open http://localhost:3000. To install as a PWA, use the browser’s install/add-to-home-screen prompt (icons and manifest are included).

## Deploy / preview
- AI Studio preview: https://ai.studio/apps/drive/1xVgnpo5nqaVlLRptswnWNzLOmZ4YtjmO
- Static build: `npm run build` then serve `dist/`
