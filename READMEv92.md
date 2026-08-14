# MOVA TRADING — README

## Current build
**Version:** v92 — Mobile Asset UX

### v92 changes
- Mobile-only redesign of the Asset Detail experience; desktop styling and layout are intentionally unchanged.
- Added a sticky horizontal quick-navigation strip for Overview, Chart, Research, News and Buy.
- Reduced mobile card padding, chart height and spacing to improve information density without making text cramped.
- Kept primary company overview and key facts visible while making secondary fundamentals, watch points and long company-history sections expandable.
- Company History on mobile now uses compact facts, tighter timelines and collapsible supporting sections to reduce excessive vertical scrolling.
- Price-history and News tabs are horizontally scrollable on small screens instead of wrapping awkwardly.
- Buy controls are more compact and the final actions remain easier to reach on a phone.
- v91 company timeline coverage and all prior desktop behaviour are retained.

### v91 changes
- Added a full Apple historical timeline instead of the empty “No reliable dated milestones” panel.
- Added/strengthened durable timelines for NVIDIA, Alphabet/Google, Broadcom and Tesla so major technology companies do not depend on an inconsistent external history response.
- Apple now has a richer curated company profile including full headquarters, founding date, founders, business description, key information and origins.
- Preserved all v90 Trade Jargon Capital Discipline fixes.

### v90 changes
- Fixed the generic **Capital Discipline** panel in every A–Z Trading Jargon deep-dive.
- Capital Discipline guidance now changes according to the actual term being viewed.
- Execution terms focus on spread, slippage and order-price control.
- Leveraged instruments focus on amplified loss and exposure limits.
- Portfolio terms focus on concentration, allocation and position sizing.
- Technical terms focus on pre-defined invalidation and risk.
- Fundamental/valuation terms focus on evidence, valuation and business quality.
- Market-regime terms focus on avoiding overexposure and chasing.
- Process/performance terms now give relevant capital-management guidance.
- Removed an old unreachable Capital Discipline override block that could never execute.

### v89 changes
- Fixed the actual Asset Research rendering bug: the page now displays the merged company-specific overview instead of the generic local placeholder.
- Prevented live fundamentals country codes such as `US`, `GB` and `ES` from overwriting richer headquarters locations.
- Added full company-specific profiles for JPMorgan Chase, Lloyds Banking Group, HSBC, Banco Santander, Microsoft and Meta Platforms.
- Added durable historical timelines for JPMorgan Chase, Lloyds Banking Group, HSBC, Banco Santander, Microsoft and Meta Platforms.
- Added ticker aliases so curated company data still resolves when a feed returns exchange-qualified symbols.
- Asset Research “What to know” now uses the same curated company-specific information as Company History where available.
- Preserved the AMD and Amazon profile/timeline fixes from v88.

### v88 changes
- Fixed AMD so Asset Research and Company History no longer show generic placeholder content.
- Added AMD founding date, co-founders, full Santa Clara headquarters, business description, key-company information and a meaningful historical timeline.
- Added a durable Amazon historical timeline fallback so Amazon no longer shows “No reliable dated milestones”.
- Preserved Amazon's richer overview and key-company information.
- Changed company-history loading so a shallow API response cannot override richer direct or curated company data.
- Curated identity data now wins over weak values such as bare `US` headquarters codes and missing founder/founded fields.
- Company History and Asset Research now share the same reliable fallback data, reducing contradictory company information between the two sections.
- JPMorgan Chase's existing curated formation/founder information remains available to Asset Research instead of being replaced by the generic profile sentence.

### v87 changes
- Fixed the **Asset Research → Company & market profile** card so it is no longer generic for secondary/search-only companies.
- The profile now merges available data from fundamentals, company history, curated fallbacks and MOVA's existing local company profiles.
- Sector, industry, founded date, founders, headquarters, type and website now populate dynamically for every company where data exists.
- The top company overview no longer falls back to the generic `MOVA is building a broader research profile...` sentence when better company data is already available elsewhere in the app.
- When company-history data finishes loading, the Asset Research profile is refreshed automatically so richer location/founder/history data appears there too.
- Country codes such as `US` are normalised to readable country names such as `United States` when a more detailed headquarters value is not available.
- Existing richer profiles such as Amazon remain intact, while banks and other extended-search companies now receive the same style of populated profile.

### v86 changes
- Fixed the regression where companies such as Lloyds Banking Group could fall all the way back to the generic “MOVA is building a broader research profile” text.
- Added curated fallback profiles for the banking companies most likely to be tested, including Lloyds Banking Group, NatWest Group, Santander, JPMorgan Chase, Barclays and HSBC.
- Curated fallbacks contain company overview, founding/formation context, founders or predecessor context, complete headquarters, official website, business description and meaningful timeline events.
- External Wikipedia/Wikidata data still remains the first source; curated information fills gaps rather than replacing good external data.
- Restored richer **Key Company Information** bullets in the top Company Overview card. Existing detailed local profiles such as Amazon, NVIDIA and Microsoft now keep their useful key points instead of being reduced to one short paragraph.
- Company Business fields now also use MOVA's existing local industry profile when the external source only returns “Listed company”.

### v85 changes
- Added a much stricter wiki/source-text sanitation pass across all company history content.
- Removes residual pipe (`|`) symbols, image/caption parameters such as `left|200px|`, file/image markup, template fields and leaked infobox parameters.
- Timeline extraction now rejects logo/image/caption sentences and only keeps clean business-history events.
- Added official-website validation: malformed template residue is rejected; plausible domains/URLs are normalized before display.
- Added verified website overrides for Barclays, JPMorgan Chase, Lloyds Banking Group, NatWest Group and Santander.
- Clarified Lloyds Banking Group founding context: the current group was formed in 2009, while Lloyds Bank traces its roots to John Taylor and Sampson Lloyd in 1765.
- The same sanitization/validation logic runs in both the Vercel company-history API and browser fallback.

### v84 changes
- Headquarters now attempts to resolve the full Wikidata location hierarchy (building/locality/city/country) rather than showing only a building name such as `270 Park Avenue`.
- Wikipedia infobox fallbacks now combine headquarters address, city and country fields.
- Added stronger modern location normalisation for United States, United Kingdom, Canada, Spain, Switzerland, Germany, Japan and the Netherlands.
- Removed residual pipe (`|`) and leaked infobox parameter text from company paragraphs and founder fields.
- JPMorgan Chase now clearly explains that the present company was formed by merger rather than presenting garbage as a founder.
- Added major searchable banking groups including Lloyds Banking Group, NatWest Group, Santander, UBS, Deutsche Bank, RBC, TD, BMO, Scotiabank, CIBC, MUFG, SMFG, Mizuho, ING and BBVA.
- `Chase Bank` searches resolve to JPMorgan Chase rather than creating a duplicate listed asset.

### v83 changes
- Added strict validation so the **Founded / Established** field must contain a real year; location fragments can no longer be displayed as founding dates.
- Added modern location normalisation for UK company locations, including `Kingdom of England` / `England` / `London, UK` → modern `United Kingdom` formatting.
- Normalises London headquarters so the country is included when missing.
- Added a verified Barclays override: founded **1690**, founders **John Freame and Thomas Gould**, headquarters **1 Churchill Place, Canary Wharf, London, United Kingdom**.
- The same validation runs in both the Vercel company-history API and the browser fallback.

### v82 changes
- Added extra fallback extraction for **founded/established date** when Wikidata and Wikipedia infobox data are incomplete.
- Added extra fallback extraction for **founder/co-founder names** from the company intro/history text.
- The same fallback logic now runs in both `api/company-history.js` and the browser-side Wikipedia fallback.
- If a source genuinely does not expose the information, MOVA now says `Not available from current source` rather than implying the field should exist.

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
