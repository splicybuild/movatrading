# MOVA TRADING v37 — Vercel Live Market Test

This build keeps the working v36 navigation and adds a secure Vercel backend for live market data.

## What is live in v37

The first test universe is:

- NVDA
- MSFT
- AAPL
- AMZN
- META
- GOOGL
- TSLA
- AVGO
- QQQ

The Vercel `/api/market` function requests current Twelve Data quotes and calculates prototype MOVA metrics for:

- Pulse Score
- Radar Score
- Momentum
- Relative Volume
- Intraday Volatility
- Home Heatmap
- Market Sentiment
- Market Breadth

If live data is unavailable, the app keeps the existing demo values instead of breaking.

## Deployment

1. Import/connect the GitHub repository `splicybuild/movatrading` to a Vercel project.
2. Use the repository root as the project root. No framework is required.
3. In Vercel go to **Project → Settings → Environment Variables**.
4. Add:
   `TWELVE_DATA_API_KEY = your Twelve Data API key`
5. Apply it to Production (and Preview if desired).
6. Redeploy the project.
7. Open:
   `/api/market?symbols=NVDA,AAPL,MSFT`
   on your Vercel domain. You should receive JSON.
8. Open the app on the Vercel domain. The Home page status changes from **Demo market data** to **Live market analysis** when the endpoint succeeds.

## Important

GitHub Pages cannot run the `/api` serverless functions. For v37 live-data testing, use the **Vercel deployment URL** as the app URL.

The Twelve Data API key is read only on the server from `process.env.TWELVE_DATA_API_KEY`; it is not included in `index.html` or committed to GitHub.

## Files

- `index.html` — MOVA frontend
- `api/market.js` — live quote + prototype Pulse/Radar analysis
- `api/history.js` — OHLCV historical data endpoint for deeper Radar analysis later
- `package.json` — marks the functions as modern ES modules
