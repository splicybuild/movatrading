# MOVA Trading v142 — Complete Interactive AI Monitor

This deployment package contains the full MOVA site plus the working AI monitor, interactive driver analysis, company drill-down links, personalised AI signals, watchlist company news, and all required Vercel API routes.

## Fixed in v142
- AI scan cards: company/asset names now open the full research page.
- AI driver chips (Momentum, Volume, AI demand, Yields, USD, Demand, Supply, Breadth, Rates, etc.) are real buttons and open a detailed driver-analysis panel explaining how the factor can affect the asset, what confirms it, and what could reverse it.
- `/api/monitor` now returns structured driver detail alongside the scan.
- Watchlist News now calls an explicit `mode=watchlist` endpoint.
- News schema is normalised (`headline/title`, `summary/body`) so cards no longer show `undefined`.
- Refresh adds a cache-busting timestamp and reloads current company news.

## Required Vercel environment variables
- `TWELVE_DATA_API_KEY` — required for market/history and AI monitor scans.
- `FINNHUB_API_KEY` — required for company news and news-driver context.

## v143 — Live AI Driver Intelligence
The AI Monitor driver buttons now call `/api/monitor?mode=driver&ticker=...&driver=...` and return live/near-live market evidence rather than only static explanatory copy.

Driver panels include current/latest price, open/high/low, move versus previous close, move from session open, volume versus the recent 20-session average when the provider supplies volume, recent price history, and a 14-period Stochastic %K momentum chart. The Stochastic chart uses 20 as a potentially oversold threshold and 80 as a potentially overbought threshold on a normalized 0–100 scale. These are not percentages below/above the opening price and are not automatic trading signals.

Macro and theme drivers use transparent market proxies where a directly tradeable real-time series is not available from the configured data feeds. Examples: IEF as an inverse Treasury-yield proxy, EUR/USD as an inverse USD proxy, and SMH as a semiconductor-sector proxy for AI/chip demand expectations. Supply/demand panels do not infer physical fundamentals from price alone; they combine live WTI behaviour with relevant current headlines when Finnhub returns them.
