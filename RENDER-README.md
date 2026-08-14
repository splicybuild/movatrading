# MOVA Trading — Render Web Service adapter

This package keeps MOVA's existing Vercel-compatible project structure and adds only
`render-server.js` for Render.

## Required Render service type
Create a **Web Service**, not a Static Site.

## Render settings
- Runtime / Language: Node
- Branch: main
- Root Directory: leave blank
- Build Command: leave blank
- Start Command: `node render-server.js`
- Health Check Path (optional): `/health`

## Environment variables
Add the same secret API keys you use on Vercel:
- `FINNHUB_API_KEY`
- `TWELVE_DATA_API_KEY`

Do not put their values in GitHub.

The server binds to `0.0.0.0` and uses Render's `PORT` environment variable automatically.

## Existing files
Keep your existing `package.json` unchanged. It already contains `"type": "module"`,
which is what this adapter needs.

## What the adapter does
- serves `index.html` and `assets/`
- preserves the existing `/api/market`, `/api/news`, `/api/history`, `/api/sector`,
  `/api/company-history`, `/api/fundamentals`, `/api/company-visual`, and
  `/api/news-visual` URLs
- adapts the existing Web `Request`/`Response` API handlers to Node's HTTP server
- keeps Vercel compatibility because the original API files are unchanged
