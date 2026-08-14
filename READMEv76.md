# MOVA TRADING — README

## Current build
**Version:** v76 — Search Universe Audit

MOVA's promoted product focus remains **Nasdaq 100 + major commodities**. The searchable research universe is deliberately broader so you can look up banks, retailers, ecommerce companies, energy companies, healthcare companies and a larger set of major technology names without making those industries the focus of Home, Pulse, Radar, Trending or Hot/Not.

## What v76 fixes
- Audited the actual frontend asset list against previous documentation.
- Fixed the inconsistency where companies such as **AMD** were mentioned in documentation/sector logic but were not actually present in the searchable `assets` dataset.
- Added every stock already referenced by MOVA's sector/breadth configuration that was missing from Search.
- Added an additional curated group of major technology, software and semiconductor companies for explicit search/research.
- Added an **on-demand current quote request** whenever a company is opened, so search-only assets do not depend on being part of the Home live-data batch.
- Retained the v75 Company History, fundamentals, News search and full research experience.
- Search-only expansion does **not** promote these names into MOVA's primary feeds.

## Dataset totals
- **Total searchable/test assets:** 72
- **Core/promoted assets:** 14
- **Secondary/search-only assets:** 58
- **Major technology/technology-adjacent names represented:** 33

## Core / promoted universe
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

## Secondary searchable universe
These receive full quote/history/news/fundamentals/company-history treatment when opened, but are not intended to dominate MOVA's main feeds.
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
- **AMD** — Advanced Micro Devices (stock)
- **AMGN** — Amgen (stock)
- **BKNG** — Booking Holdings (stock)
- **COP** — ConocoPhillips (stock)
- **CVX** — Chevron (stock)
- **DUK** — Duke Energy (stock)
- **GILD** — Gilead Sciences (stock)
- **ISRG** — Intuitive Surgical (stock)
- **MA** — Mastercard (stock)
- **MAR** — Marriott International (stock)
- **NEE** — NextEra Energy (stock)
- **NFLX** — Netflix (stock)
- **OXY** — Occidental Petroleum (stock)
- **REGN** — Regeneron Pharmaceuticals (stock)
- **SLB** — SLB (stock)
- **SO** — Southern Company (stock)
- **SRE** — Sempra (stock)
- **TMUS** — T-Mobile US (stock)
- **V** — Visa (stock)
- **VRTX** — Vertex Pharmaceuticals (stock)
- **WBD** — Warner Bros. Discovery (stock)
- **XOM** — Exxon Mobil (stock)
- **AEP** — American Electric Power (stock)
- **ADBE** — Adobe (stock)
- **CSCO** — Cisco Systems (stock)
- **ORCL** — Oracle (stock)
- **QCOM** — Qualcomm (stock)
- **MU** — Micron Technology (stock)
- **AMAT** — Applied Materials (stock)
- **LRCX** — Lam Research (stock)
- **INTU** — Intuit (stock)
- **PANW** — Palo Alto Networks (stock)
- **CRWD** — CrowdStrike (stock)
- **PLTR** — Palantir Technologies (stock)
- **ARM** — Arm Holdings (stock)
- **INTC** — Intel (stock)
- **ADI** — Analog Devices (stock)
- **KLAC** — KLA (stock)
- **MCHP** — Microchip Technology (stock)
- **NXPI** — NXP Semiconductors (stock)
- **SNPS** — Synopsys (stock)
- **CDNS** — Cadence Design Systems (stock)
- **MRVL** — Marvell Technology (stock)
- **FTNT** — Fortinet (stock)
- **ADSK** — Autodesk (stock)

## Major technology / technology-adjacent names currently searchable
- **NVDA** — NVIDIA
- **MSFT** — Microsoft
- **AAPL** — Apple
- **AMZN** — Amazon
- **GOOGL** — Alphabet (Google)
- **META** — Meta Platforms
- **AVGO** — Broadcom
- **TSLA** — Tesla
- **AMD** — Advanced Micro Devices
- **NFLX** — Netflix
- **TMUS** — T-Mobile US
- **ADBE** — Adobe
- **CSCO** — Cisco Systems
- **ORCL** — Oracle
- **QCOM** — Qualcomm
- **MU** — Micron Technology
- **AMAT** — Applied Materials
- **LRCX** — Lam Research
- **INTU** — Intuit
- **PANW** — Palo Alto Networks
- **CRWD** — CrowdStrike
- **PLTR** — Palantir Technologies
- **ARM** — Arm Holdings
- **INTC** — Intel
- **ADI** — Analog Devices
- **KLAC** — KLA
- **MCHP** — Microchip Technology
- **NXPI** — NXP Semiconductors
- **SNPS** — Synopsys
- **CDNS** — Cadence Design Systems
- **MRVL** — Marvell Technology
- **FTNT** — Fortinet
- **ADSK** — Autodesk

## Commodities currently represented
- **GOLD** — Gold
- **SILVER** — Silver
- **OIL** — Crude Oil
- **NG** — Natural Gas


## Important scope note
This is now a substantially broader testing/search universe, but it is still **not a promise that every listed company in the world or every Nasdaq-100 constituent is present**. The README is generated from the actual frontend dataset so the documented list matches what Search can see.

## Relevant files in this build
- `index.html`
- `api/market.js`
- `api/news.js`
- `api/fundamentals.js`
- `api/company-history.js`
- `README.md`

Other API files already in your repository, such as the existing history endpoint, remain in place and do not need replacing unless separately supplied in a future update.

## Product positioning
- **Official brand tagline:** `MOVE. TRADE. GROW.`
- **Home hero message:** `SMARTER TRADES. BETTER OPPORTUNITIES.`
- **Primary product focus:** Nasdaq 100 + commodities
- **Extended coverage:** searchable research/news universe only
