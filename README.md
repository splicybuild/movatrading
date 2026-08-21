# MOVA Trading — v148 Verified Market Navigation & Compact Research

## What changed in v148

This build fixes the issues reported after v147 by changing the **original source handlers**, rather than relying on a late JavaScript override.

- Explore Markets rows now resolve S&P 500 (`SPX`), Dow Jones (`DJI`), EUR/USD, GBP/USD, USD/JPY and USD/CHF into real asset-detail pages instead of silently doing nothing.
- `openAssetDetail()` now has a built-in fallback that creates a researchable market asset from the Explore Markets definition if it is not already in the live `assets` array.
- The asset research layout no longer uses a two-column equal-height grid for Price History vs Why It's Moving. Price History is full width; the driver analysis sits underneath it in a compact collapsed state.
- Detailed drivers, Pulse/Radar/Momentum/volume/volatility metrics and the explainer expand only when **Expand full driver analysis** is selected.
- Company & market profile now follows directly underneath the compact analysis block, eliminating the large blank vertical gap.
- Premium Stock Screener is visible directly beside the Explore Markets heading and is **unlocked for testing**.
- A visible **MOVA v148** badge appears at the bottom-right of the deployed site. This is intentional for verification: if you do not see it, Vercel is still serving an older deployment.

## Deployment

Replace the repository files with the contents of this bundle, preserving the `/api` folder structure. Commit to the branch Vercel deploys (normally `main`) and wait for the deployment to complete.

After deployment, hard refresh the browser. Confirm the bottom-right badge says **MOVA v148** before testing.

## Regression checks performed

- Inline JavaScript blocks passed `node --check`.
- Direct market handlers no longer gate opening on prior membership of the `assets` array.
- `SPX`, `DJI`, `EURUSD`, `GBPUSD`, `USDJPY`, and `USDCHF` aliases are defined.
- Stock Screener markup and launch control are present in static HTML.
- Asset-detail layout is forced to sequential full-width blocks to prevent the right-column height from producing blank space.

## Existing v146/v147 features retained

The weighted AI Scan, catalyst/news analysis, live driver charts, responsive fixes and existing API files are carried forward.

> MOVA is a research/testing application and does not provide personalised investment advice.
