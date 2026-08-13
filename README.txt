MOVA TRADING v62 — dual-provider test build

Required Vercel Environment Variables:
- TWELVE_DATA_API_KEY
- FINNHUB_API_KEY

Provider split:
- Finnhub: US stock/ETF quotes, company profiles/basic metrics, sector stock quotes, company news
- Twelve Data: commodities, USD/GBP conversion, historical charts, fallback press releases

Do not place either API key in index.html.
Redeploy after changing environment-variable values.
