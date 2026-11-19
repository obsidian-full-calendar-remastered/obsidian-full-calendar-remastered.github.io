# Full Calendar Remastered — Website (`full-calendar-remastered.in`)

Static marketing, AI plans, legal, and Paddle.js checkout website for **Full Calendar Remastered**, built with **Vite + TypeScript + modular CSS** and deployed to **GitHub Pages**.

## Pages
- `/` — Product overview & Obsidian calendar highlights
- `/ai/` — AI Calendar Agent deep-dive (GDPR, Zero Data Retention, WTC transparency, BYOK vs Managed)
- `/pricing/` — Free Trial ($0), Pro ($7/mo), and Power ($11/mo) plans with Paddle.js `PricePreview` localized pricing & overlay checkout
- `/success/` — Post-checkout 3-step Obsidian license activation guide
- `/privacy/`, `/terms/`, `/refunds/` — Legal pages required for Paddle live approval

## Local Development
1. Copy `.env.example` to `.env` and fill in your Paddle **Sandbox** values:
   ```env
   VITE_PADDLE_ENV=sandbox
   VITE_PADDLE_CLIENT_TOKEN=test_...
   VITE_PADDLE_PRICE_ID_PRO=pri_...
   VITE_PADDLE_PRICE_ID_POWER=pri_...
   ```
2. Install and run:
   ```bash
   npm install
   npm run dev
   ```
3. Build production bundle:
   ```bash
   npm run build
   ```

## Support Email
When you have a support email ready, set `supportEmail` in `src/config/site.ts` — it automatically populates the footer and all legal pages.
