# MOVA TRADING — README

## Current build
**Version:** v81 — Company History Summary + Timeline

### v81 changes
- Long company-history sections are now concise summaries with bullet points for key information.
- Revenue/business-model sections are filtered to relevant business areas instead of raw source dumps.
- Filters obvious source artefacts such as asterisks, `thumb`, office/branch lists, ATM-network details and unrelated leadership lists.
- Company timelines now only include years tied to a real event sentence such as a launch, acquisition, expansion, restructuring, listing or leadership change.
- Removed the generic “important stage of development around YEAR” timeline wording.
- Improved grammar/format cleanup of imported company text before display.

### v80 changes
- Added a three-stage company-history reliability chain: **server API → direct browser Wikipedia fallback → MOVA local curated profile**.
- A weak/short API response is no longer accepted as “success”; MOVA checks whether the result contains enough real history/business depth.
- Amazon and other companies with existing curated MOVA profiles can no longer lose their useful local company information just because the new history API fails.
- Search-only companies such as AMD can load their matching Wikipedia company page directly in the browser when the server endpoint fails.
- Direct fallback also extracts History, Business/Operations, Products/Services and recent-development sections and attempts infobox fields for founders, founded date, headquarters and website.
- Company-history data is merged rather than one source blindly replacing another.

### v79 changes
- Rebuilt `api/company-history.js` so company research no longer depends on a fragile generic Wikidata search.
- Wikipedia company-page search is now the primary discovery method, giving names such as **Advanced Micro Devices** a reliable direct match.
- The exact matched Wikipedia page supplies the Wikidata entity ID, reducing incorrect/missing founder and headquarters lookups.
- Added Wikipedia **infobox fallbacks** for founded date, founders, headquarters and website when Wikidata is incomplete.
- Company history still loads History, Business/Operations, Products/Services/Segments and recent-development sections dynamically.
- Removed the misleading fallback where an IPO date could be displayed as a founding date.
- When rich history genuinely cannot be loaded, MOVA now says so instead of fabricating detail.

### v78 change
- Reworked **Capital Discipline** in Trading Jargon so its Learn More content is genuinely term-specific rather than repeating generic glossary material.
- Added relatable portfolio examples, including position sizing, staged entries, concentration risk, retaining cash, rules for adding capital and avoiding blind averaging-down.
- Added a dedicated Capital Discipline visual explainer and practical pre-investment questions.
- All v77 Deep Company Research functionality is retained.

### Previous v77 changes
- Every searchable equity now uses the same deeper Company History research path.
- Added Company Overview, How It Started, What the Company Does, Revenue & Business Model, Growth & Development, Products/Services/Operations, Recent Company Context, History Timeline and Recent Market Journey.
- The research API dynamically looks for relevant company History, Business/Operations, Products/Services/Segments and recent-development material rather than relying on a short generic introduction.
- Founding date, founders, headquarters and official website use structured Wikidata facts when available.
- Long-form background uses the matching English Wikipedia company article when available.
- MOVA does not fabricate missing revenue percentages or segment figures.
- The v76 searchable universe of 72 assets is retained.

## Product positioning
Primary focus remains **Nasdaq 100 + commodities**. Secondary companies receive full detail when deliberately searched/opened, without becoming the main Home/Pulse/Radar focus.

## Current searchable/test inventory (72)
- **NVDA** — NVIDIA (stock; core)
- **MSFT** — Microsoft (stock; core)
- **AAPL** — Apple (stock; core)
- **AMZN** — Amazon (stock; core)
- **GOOGL** — Alphabet (Google) (stock; core)
- **META** — Meta Platforms (stock; core)
- **AVGO** — Broadcom (stock; core)
- **TSLA** — Tesla (stock; core)
- **QQQ** — Invesco QQQ (etf; core)
- **NDX** — Nasdaq 100 (index; core)
- **GOLD** — Gold (commodity; core)
- **SILVER** — Silver (commodity; core)
- **OIL** — Crude Oil (commodity; core)
- **NG** — Natural Gas (commodity; core)
- **JPM** — JPMorgan Chase (stock; search-only)
- **BAC** — Bank of America (stock; search-only)
- **GS** — Goldman Sachs (stock; search-only)
- **C** — Citigroup (stock; search-only)
- **WFC** — Wells Fargo (stock; search-only)
- **MS** — Morgan Stanley (stock; search-only)
- **HSBC** — HSBC Holdings (stock; search-only)
- **BCS** — Barclays (stock; search-only)
- **PDD** — PDD Holdings (Temu) (stock; search-only)
- **BABA** — Alibaba Group (AliExpress) (stock; search-only)
- **JD** — JD.com (stock; search-only)
- **MELI** — MercadoLibre (stock; search-only)
- **EBAY** — eBay (stock; search-only)
- **AMD** — Advanced Micro Devices (stock; search-only)
- **AMGN** — Amgen (stock; search-only)
- **BKNG** — Booking Holdings (stock; search-only)
- **COP** — ConocoPhillips (stock; search-only)
- **CVX** — Chevron (stock; search-only)
- **DUK** — Duke Energy (stock; search-only)
- **GILD** — Gilead Sciences (stock; search-only)
- **ISRG** — Intuitive Surgical (stock; search-only)
- **MA** — Mastercard (stock; search-only)
- **MAR** — Marriott International (stock; search-only)
- **NEE** — NextEra Energy (stock; search-only)
- **NFLX** — Netflix (stock; search-only)
- **OXY** — Occidental Petroleum (stock; search-only)
- **REGN** — Regeneron Pharmaceuticals (stock; search-only)
- **SLB** — SLB (stock; search-only)
- **SO** — Southern Company (stock; search-only)
- **SRE** — Sempra (stock; search-only)
- **TMUS** — T-Mobile US (stock; search-only)
- **V** — Visa (stock; search-only)
- **VRTX** — Vertex Pharmaceuticals (stock; search-only)
- **WBD** — Warner Bros. Discovery (stock; search-only)
- **XOM** — Exxon Mobil (stock; search-only)
- **AEP** — American Electric Power (stock; search-only)
- **ADBE** — Adobe (stock; search-only)
- **CSCO** — Cisco Systems (stock; search-only)
- **ORCL** — Oracle (stock; search-only)
- **QCOM** — Qualcomm (stock; search-only)
- **MU** — Micron Technology (stock; search-only)
- **AMAT** — Applied Materials (stock; search-only)
- **LRCX** — Lam Research (stock; search-only)
- **INTU** — Intuit (stock; search-only)
- **PANW** — Palo Alto Networks (stock; search-only)
- **CRWD** — CrowdStrike (stock; search-only)
- **PLTR** — Palantir Technologies (stock; search-only)
- **ARM** — Arm Holdings (stock; search-only)
- **INTC** — Intel (stock; search-only)
- **ADI** — Analog Devices (stock; search-only)
- **KLAC** — KLA (stock; search-only)
- **MCHP** — Microchip Technology (stock; search-only)
- **NXPI** — NXP Semiconductors (stock; search-only)
- **SNPS** — Synopsys (stock; search-only)
- **CDNS** — Cadence Design Systems (stock; search-only)
- **MRVL** — Marvell Technology (stock; search-only)
- **FTNT** — Fortinet (stock; search-only)
- **ADSK** — Autodesk (stock; search-only)
