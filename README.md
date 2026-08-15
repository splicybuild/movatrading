# MOVA Trading v113 — Full Package

## News page changes
- The main News page now shows only the **Top 10 current market stories**.
- The old Nasdaq / Commodities / Watchlist / Macro filter row has been removed from the main feed to keep the page focused.
- Specific company news is accessed through the **Search Company News** bar.
- Company search now resolves names/tickers through Finnhub, so it is no longer limited to MOVA's hard-coded asset list.
- Top-story articles are no longer forcibly labelled as NVDA/MSFT/etc. simply because they came from a company-news feed.
- Yahoo feed/logo images are not used as the initial story image; MOVA prefers a real article image or a relevant fallback.

## Previous v112 fixes retained
- Desktop navigation scrolls away with the top of the document.
- Mobile navigation remains fixed at the bottom.
- Why It's Moving story cards are clickable.
- 336 Trading A–Z terms retained.

## Deployment
Replace the full package contents:
- index.html
- api/
- assets/
- README.md
- package.json

Keep your existing Vercel environment variables, including FINNHUB_API_KEY.
