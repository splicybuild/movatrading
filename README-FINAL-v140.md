# MOVA Trading v140 — Final QA Build + AI Monitor

Built from the stable v124 application rather than the patched v127–v134 chain.

## Restored / rebuilt
- Mobile welcome/sign-in-first experience retained.
- Existing Pulse, asset research, Portfolio, News, market sentiment/breadth and search retained.
- Home rebuilt with Watchlist first, Top Movers, working Why/Full Analysis/Setup Guide, Explore Markets, Market Overview and AI Monitor entry point.
- Explore Markets: Stocks / Indices / Commodities / Forex are direct controls and rows are explorable.
- Learning Academy restored from the Learning v2 prototype, including visual module cards, in-depth lesson sections, hover/tap term explanations and 10-question tests.
- Compare Brokers removed from the Tools UI/product flow.
- News & Alerts upgraded with MOVA AI Monitor and personalised signal alerts.

## MOVA AI Monitor
`/api/monitor` compares the latest daily close with the previous two sessions, checks recent range highs, classifies breakouts/reversals/large moves and, for supported US stocks, uses recent Finnhub headlines to identify likely driver categories.

It is a signal-and-news reasoning engine, not a prediction system.

## Personalised alerts
Users can create alerts for:
- Breakouts
- Bullish reversals
- Bearish reversals
- Percentage rises/drops
- Price-above / price-below levels
- Sensitivity level
- Personal note

Alerts are stored on-device and evaluated whenever the AI monitor scans. Browser notifications can be enabled while the application is open.

## Vercel environment variables
- `TWELVE_DATA_API_KEY`
- `FINNHUB_API_KEY`

The application falls back to demo AI-monitor data if `/api/monitor` is unavailable, so the UX remains testable.

## Important production note
True notifications while the browser/app is completely closed require a background scheduler plus a push/email provider. This package performs live scanning while the app is open and provides the Vercel monitor endpoint needed for the next production step.
