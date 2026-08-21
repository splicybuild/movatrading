# MOVA Trading v146

## Weighted AI Scan + Catalyst Graphs

This bundle is the latest MOVA build based on the v145 interaction/news/responsive version, upgraded with a deeper AI Scan and clearer visual evidence.

### What's new in v146

The **Run AI Scan** is no longer just a short narrative summary. The interface now builds an evidence-weighted confidence score from ten factors:

- Price Momentum — 15%
- Technical Structure — 15%
- Volume / Money Flow — 10%
- High-Impact News — 15%
- Fundamentals — 10%
- Macro / Yields — 10%
- Market Sentiment — 10%
- Sector / Peer Strength — 5%
- Analyst Activity — 5%
- Risk / Volatility — 5%

The frontend applies a **conflict penalty** when bullish and bearish signals disagree strongly, and shows separate **Intraday**, **Swing**, and **Overall** confidence views. The score is an evidence-weighted indicator from 0–100; it is **not** presented as a statistically proven probability that a stock will rise.

### Visual analysis

The AI Scan now includes:

- Factor contribution bars showing which inputs are helping or hurting confidence.
- Supporting factors vs risk/headwind panels.
- Recent price-history charts in the driver analysis.
- 20/80 stochastic momentum reference levels.
- High-impact news/catalyst markers over the price chart when timestamps can be matched to returned price-history data.
- Clear wording that a timestamp match shows correlation/context, not proof that a single article caused a price move.

### News changes

Company news is condensed instead of producing an endless scroll. MOVA:

- Removes duplicate or near-duplicate stories.
- Scores stories by recency, likely price impact, direction and relevance.
- Prioritises earnings/guidance, analyst changes, regulation, major contracts, product/AI demand, management, M&A and macro-sensitive developments.
- Shows the most relevant stories first rather than every returned headline.
- Adds a short reason explaining why a story was ranked as important.

### Files in this ZIP

```text
MOVA-v146-FULL/
├── index.html          # Latest MOVA v146 frontend
├── api/
│   ├── market.js       # Market quote endpoint
│   ├── monitor.js      # AI Scan + driver-analysis market-data endpoint
│   └── news.js         # Company-news endpoint used by condensed news
├── package.json
├── vercel.json
├── .env.example
└── README.md
```

## Deployment

### 1. Upload all files

Upload the **contents** of this folder to the root of your repository. Do not upload only `index.html`; v146 also calls `/api/monitor` and `/api/news`.

### 2. Environment variables

In Vercel, open **Project → Settings → Environment Variables** and configure:

- `FINNHUB_API_KEY` — required for US stock quotes and company news.
- `TWELVE_DATA_API_KEY` — recommended for commodities and additional historical-price fallback.

Never put API keys directly into `index.html` or commit real keys to GitHub.

### 3. Deploy

Commit the files to the branch used by Vercel (normally `main`). Vercel should redeploy automatically.

### 4. Test these endpoints

After deployment, confirm these paths return JSON rather than a 404/error page:

```text
/api/market?symbols=NVDA,AAPL
/api/monitor?symbols=NVDA,QQQ,GOLD,OIL
/api/monitor?mode=driver&ticker=NVDA&driver=Momentum
/api/news?mode=watchlist&symbols=NVDA,AAPL,MSFT
```

Then load the site and press **Run AI Scan**.

## Important scoring note

The v146 frontend can display all ten factors, but the quality of individual factor scores depends on what live evidence is available from the configured APIs. Price, momentum, technical structure, volume, news, peer/breadth context and volatility can be supported by returned market data. Fundamentals, analyst activity and some macro inputs require richer provider data to become fully backend-calculated.

Where evidence is unavailable or incomplete, MOVA should reduce evidence quality rather than pretend the missing factor is known. This is intentional.

## Current backend behaviour

`api/monitor.js` supplies:

- Current/latest price
- Open/high/low/previous close
- Change vs previous close
- Change from session open
- Recent daily history
- Relative-volume context when volume history is available
- 14-period stochastic momentum
- 20/80 overbought/oversold reference zones
- Driver evidence text
- Technology breadth for relevant drivers
- Current company headlines for supported US equities

`api/news.js` supplies recent company news and deduplicates it before the frontend performs its more detailed relevance/impact ranking.

## Preserved v145 fixes

This build keeps the v145 fixes including responsive search sizing, working market-category interactions, full-analysis/setup buttons, company-page navigation, news-card deduplication and thumbnail handling.

## Recommended next upgrade

The next backend revision should add dedicated live datasets for:

1. US 10Y / real yields and Fed-rate expectations.
2. Nasdaq and sector breadth.
3. Fundamental growth/valuation metrics.
4. Analyst upgrades/downgrades and target revisions.
5. Earnings-estimate revisions.
6. Historical AI Scan outcomes so confidence scores can eventually be calibrated against real subsequent performance.

That would move more of the ten-factor model from frontend inference to directly measured backend evidence.

---

**Version:** MOVA v146  
**Build focus:** Weighted AI confidence + high-impact news + catalyst-aware visual analysis  
**Currency focus:** USD / US market

## v147 — Explore click fixes, compact asset details, Premium Stock Screener

### Fixed market rows
- Explore Markets rows now open research for all listed Stocks, Indices, Commodities and Forex rows, including previously silent rows such as S&P 500, Dow Jones, EUR/USD and GBP/USD.
- If a cross-asset ticker is not already present in the live in-memory asset universe, MOVA creates a research-safe fallback shell so the row opens instead of doing nothing. Existing live APIs are still used where supported.

### Compact asset-detail layout
- The right-hand **Why it's moving** analysis is now collapsed by default.
- The page initially shows the concise driver summary; detailed drivers, scores and explanation are available through **Expand full driver analysis**.
- This removes the large empty vertical gap between the price-history card and Company & Market Profile caused by the taller right-hand column.

### Premium Stock Screener — test access unlocked
- Added **MOVA Stock Screener** to Explore Markets.
- Marked as a Premium research tool, but deliberately unlocked for current testing.
- Filters include ticker/company search, gainers/decliners, minimum price, minimum absolute daily move and sorting by move/price/ticker.
- Screener rows open directly into full asset research.
- The current prototype screens the stocks available in MOVA's loaded market universe. A later backend expansion can broaden this to the Nasdaq-100/S&P 500/full US universe with server-side fundamentals and technical filters.

### Deploy v147
Replace the same files as v146 with the contents of this bundle. The key UI change is in `index.html`; the included API files are carried forward from v146 for a complete deployment bundle.
