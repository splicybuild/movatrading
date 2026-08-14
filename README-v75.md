# MOVA TRADING — README

## Current build

**Version:** v75 — Full Company History

MOVA remains primarily focused on **Nasdaq 100 companies and major commodities**, while also supporting a wider searchable universe for research and news. Secondary industries such as banking, financial services and global ecommerce are available on demand without becoming the main focus of Home, Pulse, Radar, Trending or Hot/Not.

## Recent changes

### v75 — Full Company History
- Added a dedicated **Company History** experience for searchable companies, including secondary/search-only companies such as Barclays, HSBC, Alibaba and PDD Holdings.
- Added a new `api/company-history.js` endpoint.
- Company History can now show structured information such as founding/establishment date, founders, headquarters, official website, company overview and key milestones when available.
- Added a **Recent Market Journey** section using the same historical price series already loaded for the company.
- Kept Nasdaq 100 + commodities as MOVA's promoted/core focus.

### v74 — Core Focus + Extended Search
- Banks, retail and ecommerce companies remained fully searchable and researchable.
- Secondary companies were excluded from core MOVA feeds such as Pulse, Radar, Home Trending, Hot/Not and core sentiment.
- Removed promotional wording that made banks/ecommerce appear to be a new primary app focus.
- Kept Market Breadth tighter and more representative.

### v73 — Pulse + Universe Expansion
- Fixed the Pulse score ring so the circular score display renders cleanly.
- Added major banks and global ecommerce names to the searchable universe.
- Added aliases so searches such as **Temu** resolve to **PDD Holdings (PDD)** and **AliExpress** resolves to **Alibaba Group (BABA)**.

### v72 — Research + News Search
- Made Radar assets clickable and able to open full asset research.
- Made the top Nasdaq / Gold / Oil market cards clickable.
- Added richer company financial data: open price, previous close, P/E ratios, dividend yield, market cap, price-to-sales, price-to-book, 52-week range, profit margin and shares outstanding when available.
- Made company website links clickable.
- Added a company/ticker search bar to the News page.

### v71 — Watchlist + Glossary Depth
- Added a dedicated Home Watchlist market-data fetch and Refresh control.
- Added NDX -> QQQ live-data proxy handling.
- Upgraded A-Z Trading Jargon Learn More pages with term-specific scenarios and visual explainers.

### v70 — Stable UX Restore
- Restored the correct Home tagline: **SMARTER TRADES. BETTER OPPORTUNITIES.**
- Fixed News story cards so they open publisher/source links rather than always going to an asset page.
- Moved the Watchlist back near the top of Home.
- Restored A-Z Learn More links.

## Searchable / test dataset

The current frontend dataset contains **27 assets**.

### Primary / core universe (14)
These are the assets intended to drive MOVA's main experience.

- **NVDA** — NVIDIA (stock)
- **MSFT** — Microsoft (stock)
- **AAPL** — Apple (stock)
- **AMZN** — Amazon (stock)
- **GOOGL** — Alphabet (Google) (stock)
- **META** — Meta Platforms (stock)
- **AVGO** — Broadcom (stock)
- **TSLA** — Tesla (stock)
- **QQQ** — Invesco QQQ (etf)
- **NDX** — Nasdaq 100 (index)
- **GOLD** — Gold (commodity)
- **SILVER** — Silver (commodity)
- **OIL** — Crude Oil (commodity)
- **NG** — Natural Gas (commodity)

### Secondary searchable universe
These are fully searchable and can open full research/news/company-history pages, but they are not intended to dominate MOVA's core feeds.

- **JPM** — JPMorgan Chase (stock)
- **BAC** — Bank of America (stock)
- **GS** — Goldman Sachs (stock)
- **C** — Citigroup (stock)
- **WFC** — Wells Fargo (stock)
- **MS** — Morgan Stanley (stock)
- **HSBC** — HSBC Holdings (stock)
- **BCS** — Barclays (stock)
- **PDD** — PDD Holdings (Temu) (stock)
- **BABA** — Alibaba Group (AliExpress) (stock)
- **JD** — JD.com (stock)
- **MELI** — MercadoLibre (stock)
- **EBAY** — eBay (stock)

### Major technology companies currently represented

- **NVDA** — NVIDIA
- **MSFT** — Microsoft
- **AAPL** — Apple
- **AMZN** — Amazon
- **GOOGL** — Alphabet (Google)
- **META** — Meta Platforms
- **AVGO** — Broadcom
- **TSLA** — Tesla

### Commodities currently represented

- **GOLD** — Gold
- **SILVER** — Silver
- **OIL** — Crude Oil
- **NG** — Natural Gas

### Index / ETF representations

- **QQQ** — Invesco QQQ (etf)
- **NDX** — Nasdaq 100 (index)


## Important note about “all major tech companies”

The current v75 dataset includes many of the most important large-cap technology and technology-adjacent names already used by MOVA, including NVIDIA, Microsoft, Apple, Amazon, Meta, Alphabet, Tesla, Broadcom, AMD, Netflix and T-Mobile. However, this README reflects the actual current frontend dataset and should **not** be interpreted as containing every major technology company worldwide or every Nasdaq-100 constituent.

If the testing universe is expanded later, add the new ticker to the frontend dataset and keep this README updated so GitHub always documents exactly what MOVA is testing.

## API files in this build

- `index.html` — frontend application
- `api/market.js` — current market quotes and commodity/equity market data
- `api/news.js` — market and company news
- `api/fundamentals.js` — company profile and financial metrics
- `api/company-history.js` — company-history and structured background information

## Data-source behaviour

- **Finnhub** is used for many US equity quotes, company profiles, basic financials and company news.
- **Twelve Data** remains important for commodities, historical charts and FX conversion / fallback market data.
- Company-history information is loaded separately from the market-price feeds.
- MOVA caches data where practical to reduce unnecessary repeated API usage.

## Brand / product positioning

**Official brand tagline:** `MOVE. TRADE. GROW.`

**Home hero message:** `SMARTER TRADES. BETTER OPPORTUNITIES.`

MOVA's primary product focus remains **Nasdaq 100 + commodities**, with additional sectors available for research rather than promoted as the central product identity.
