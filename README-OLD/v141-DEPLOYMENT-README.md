# MOVA Trading v141 — Complete AI Monitor Deployment Package

This is the complete deployable MOVA project package. It combines the latest full frontend/build with the AI Monitor backend endpoint that was accidentally omitted from the previous full deployment ZIP.

## Deploy the whole folder
Upload/deploy the entire contents of this folder together, preserving the directory structure.

### Required top-level files
- `index.html` — latest MOVA frontend, including the AI Monitor / analysis interface
- `package.json` — Vercel Node runtime package metadata
- `vercel.json` — Vercel routing configuration
- `README.md`
- `MOVA-PROJECT-WORKFLOW.html`
- `MOVA-PROJECT-WORKFLOW.md`

### Required API functions in `/api`
- `monitor.js` — AI Monitor / market analysis endpoint
- `market.js`
- `history.js`
- `fundamentals.js`
- `sector.js`
- `news.js`
- `news-visual.js`
- `company-history.js`
- `company-logo.js`
- `company-visual.js`

### Required local assets in `/assets`
- local company logo SVG fallbacks
- Tesla local hero image

## Environment variables
The AI Monitor requires `TWELVE_DATA_API_KEY`. `FINNHUB_API_KEY` is used for company-news driver context when available. Keep the existing environment variables used by the other MOVA API endpoints as well.

## Important
Do not deploy only `index.html`. The AI Monitor frontend calls `/api/monitor`, and the rest of MOVA relies on the other `/api/*` functions and `/assets/*` files.
