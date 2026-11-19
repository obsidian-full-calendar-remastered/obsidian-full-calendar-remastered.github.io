# Full Calendar Remastered — Main Website (`full-calendar-remastered.in`)

Marketing, AI Agent overview, legal, and Paddle.js checkout website for **Full Calendar Remastered**, built with **Vite + TypeScript + modular CSS** and deployed to **Cloudflare Pages**.

## Pages
- `/` — Product overview & Obsidian calendar highlights
- `/ai/` — AI Calendar Agent deep-dive (GDPR, Zero Data Retention, WTC transparency, BYOK vs. Managed)
- `/pricing/` — Free Trial ($0), Pro ($7/mo), and Power ($11/mo) plans with Paddle.js `PricePreview` localized pricing & overlay checkout (supports `?plan=pro` / `?plan=power` and `?email=...` deep links)
- `/success/` — Post-checkout instant one-time license key reveal (polls `POST /v1/licenses/claim` on the Gateway Worker) + 3-step Obsidian activation guide
- `/privacy/`, `/terms/`, `/refunds/` — Paddle-compliant legal pages

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
3. Typecheck and build production bundle:
   ```bash
   npm run build
   ```

## Cloudflare Pages Deployment
1. **Build settings** (**Workers & Pages → Project → Settings → Builds & deployments**):
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
2. **Build Environment Variables** (**Settings → Variables and secrets** — set all 4 as **Text** build variables so Vite bakes them into `dist/` at build time):
   - `VITE_PADDLE_ENV`: `sandbox` (for testing) or `production` (for go-live — automatically selects `staging-gateway.full-calendar-remastered.in` vs. `gateway.full-calendar-remastered.in`)
   - `VITE_PADDLE_CLIENT_TOKEN`: `test_...` or `live_...`
   - `VITE_PADDLE_PRICE_ID_PRO`: `pri_...`
   - `VITE_PADDLE_PRICE_ID_POWER`: `pri_...`
   - *(Optional)* `VITE_GATEWAY_URL`: overrides the auto-selected gateway URL if needed
3. **Cache Control (`public/_headers`):** HTML routes revalidate on every request (`max-age=0, must-revalidate`) while hashed `/assets/*` bundles are cached immutably (`max-age=31536000, immutable`).
4. **Support Email:** Configured centrally in `src/config/site.ts` (`support@full-calendar-remastered.in`) and automatically rendered across the footer and legal pages.
