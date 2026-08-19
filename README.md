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
