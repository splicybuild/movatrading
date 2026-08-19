# MOVA Trading — Project Workflow and Resource Map

This document explains how the current MOVA Trading prototype fits together, from the front-end interface through API/serverless functions, data sources, browser storage and user-facing features.

## High-level workflow

```text
User
  ↓
Browser / Front-end index.html
  ├─ Home: market snapshot, watchlist, top stories and visual learning cards
  ├─ Pulse: movers, Hot or Not, Radar and sentiment views
  ├─ Tools: calculators, training tools and A–Z trading jargon
  ├─ Portfolio: holdings, wallet, allocation and performance views
  └─ News & Alerts: news search, watchlist news and price/move alerts
  ↓
Client logic inside index.html
  ├─ normalises tickers and company aliases
  ├─ renders charts, cards, company profiles and search results
  ├─ stores prototype profile/watchlist/portfolio/alerts in localStorage
  └─ calls backend API routes when live data/news is needed
  ↓
Serverless API routes in /api
  ├─ quotes / market data requests
  ├─ historical price requests
  ├─ company sector/profile/fundamental requests
  └─ news requests
  ↓
External data providers
  ├─ Twelve Data: live quotes and historical price data
  ├─ Finnhub: company profiles, fundamentals and company news
  ├─ MarketAux / news provider routes: broader market and company headlines
  ├─ Wikipedia / public web summaries where present in the prototype
  └─ packaged local assets: logos, Tesla hero image and visual imagery
  ↓
MOVA output
  ├─ live market cards and movement scores
  ├─ asset detail pages with price history and market drivers
  ├─ relevant news headlines and external story links
  ├─ visual training tools and glossary explanations
  └─ user watchlist, portfolio and alert state
```

## Data and resource sources

| Resource | Used for | Where it appears |
|---|---|---|
| Twelve Data API | Live quotes, price changes, history data | Home market strip, asset detail price panel, recent movement charts, Pulse scores |
| Finnhub API | Company profile, fundamentals and company-specific news | Company/asset research cards, market driver cards, news and alerts |
| MarketAux / news API route | Wider market, Nasdaq, commodity and macro headlines | News & Alerts page, Top 10 news stories, market news cards |
| Browser localStorage | Prototype user state | Account profile, watchlist, alerts, wallet and portfolio data |
| Packaged assets folder | Local images and icons that do not depend on remote loading | Brand assets, Tesla hero background, learning imagery, fallback visuals |
| `index.html` | Main single-page application | All UI pages, routing, styles and client-side functions |
| `/api` folder | Backend/serverless bridge | Keeps API calls and keys away from direct front-end exposure |
| `package.json` | Project metadata for deployment | Static/site deployment configuration support |
| Vercel / Render | Hosting and serverless deployment targets | Public live version of MOVA Trading |
| GitHub | Source-control repository | Stores the uploaded project files and deployment source |

## How each function area works

### Home
The Home page gives a visual first impression of the market. It uses live quotes where available, local watchlist state, market cards and top news to show what is happening quickly without requiring the user to open several tools.

### Pulse
Pulse combines live price movement, momentum-style scores, market breadth and Hot or Not lists. Assets can link through to the full company detail view so the user can move from a signal into research.

### Asset detail pages
When a company or commodity is opened, MOVA resolves the ticker, loads quote and history data, renders the recent movement chart, shows company identity assets and summarises live market drivers using relevant headlines.

### News & Alerts
The News page displays top market stories and lets the user search company news. Watchlist news and alerts use stored tickers and live data checks to show whether a watched condition has been triggered.

### Tools and Trading Jargon
The Tools page provides calculators and learning material. The A–Z glossary is stored in the front-end data set and rendered dynamically through search and letter filters.

### Portfolio and Wallet
The Portfolio area uses user-entered/local stored holdings and wallet transactions to calculate current value, allocation and a visual summary of performance. In this prototype, this is browser-stored state rather than a real brokerage connection.

## Deployment flow

1. Edit and test `index.html` locally.
2. Keep supporting files in `/assets`, `/api`, `package.json` and `README.md`.
3. Push the full package to GitHub.
4. Deploy through Vercel or Render.
5. Add API keys as environment variables in the hosting platform.
6. Front-end users load MOVA in the browser.
7. Browser requests live data through `/api` routes.
8. API routes fetch data from external providers and return simplified JSON.
9. MOVA renders market intelligence, company pages, news and portfolio views.

## Environment variables normally required

The exact names depend on the API route code, but the project typically expects keys for:

- `TWELVE_DATA_API_KEY`
- `FINNHUB_API_KEY`
- `MARKETAUX_API_KEY` or the chosen news API key

Never paste real API keys into `index.html`; keep them in Vercel/Render environment variables.
