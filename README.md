# MOVA TRADING — README

## Current build
**Version:** v101 — Mobile Home Swipe Fix

### v101 changes
- Fixed the mobile Home-page swipe conflict between the three photographic Home cards and the global Home→News swipe gesture.
- Horizontal swipes that begin inside the Home image carousel now remain inside that carousel, allowing the third image to be reached normally.
- The Home→News page swipe still works when the user swipes from the rest of the Home page.
- Added scroll-snap stopping and horizontal overscroll containment to make the three-card carousel feel more deliberate on phones.
- v100 company-logo and News-image fixes are retained unchanged.

### v100 changes
- Fixed remaining generic-letter company icons by adding explicit scalable brand-logo overrides for many companies that were still falling through the website/favicon pipeline.
- Company visual API now also detects inline SVG logos embedded directly in official company websites.
- Logo extraction still checks JSON-LD, `srcset`, site-logo images and large touch icons, but scalable/vector sources now take priority.
- Generic letter tiles are now a true last-resort state and are visually de-emphasised.
- Reworked News imagery again: MOVA now tries the feed image, then the article's own Open Graph/Twitter image, then a screenshot of the article page.
- News cards no longer show the large blue text placeholder when every image source fails; the image area collapses instead.
- Small non-screenshot images below 640×320 are rejected to avoid blurry publisher logos and tiny thumbnails.
- Home-page rich diagram explainers from v99 are retained unchanged.

### v99 changes
- Reworked company-logo loading to address the blurry icons shown for PDD, Chevron, Marvell and other extended/search-only companies.
- Company visual API now checks JSON-LD organisation logos, `srcset` logo candidates and large site-logo images, heavily preferring SVG and high-resolution files.
- Client rejects raster logo candidates smaller than 96×96 instead of enlarging them into blurry tiles.
- Home-page picture cards now open a richer visual explainer with three diagrams/infographics plus four detailed sections for each topic.
- Added diagrams for watchlist workflow, research journey, research stack, fundamental analysis, news context, signal checks, risk/return balance and capital discipline.
- News image fallbacks remain article-aware; generic publisher/logo imagery continues to be filtered by `news-visual.js`.

### v98 changes
- Fixed blurry company icons by removing CSS upscaling and expanding the crisp SVG brand-icon map for additional companies.
- Company visual API now also looks for real SVG/PNG logo images embedded in the company’s own website, before falling back to touch icons/favicons.
- Home-page investment photographs are now clickable/tappable and open a detailed MOVA information panel explaining exactly what that card covers.
- Added keyboard support and Escape-to-close for the Home visual information panel.
- Added `api/news-visual.js`: News cards now try to fetch the individual article’s own Open Graph/Twitter image instead of blindly accepting a generic publisher image from the feed.
- Generic logo/icon/placeholder image URLs are filtered.
- News images smaller than 500×240 are rejected at render time, reducing low-resolution publisher-logo thumbnails.
- When no relevant editorial photo is available, MOVA shows a clean topic fallback rather than stretching a generic publisher logo.

### v97 changes
- Added explicit official-domain visual coverage for the full current stock/bank/search-only company universe, fixing companies that had no background/logo because their local profile did not expose a website.
- Added crisp SVG brand icons for many major brands (NVIDIA, Apple, Microsoft, Amazon, Google, Meta, Tesla, Netflix, Barclays, NatWest, HSBC, Santander and others), with domain favicon fallback for the rest.
- Company visual mastheads are larger: 330px desktop and 235px mobile.
- Company logos are more eye-catching: 126px desktop and 84px mobile, with the brand mark filling more of the white tile.
- Backgrounds are substantially clearer and less transparent. MOVA now prefers a wide 2:1 screenshot of the company's own official website, with the site's social/OG image as fallback.
- The generic large initial/company-name backdrop automatically fades away whenever a real company image successfully loads.
- Search-only companies use the same domain/logo/background system as core assets.
- Main News page cards now show large editorial story images from the existing Finnhub `image` field in a two-column desktop / one-column mobile layout.
- Company-news search results on the News page also show large story imagery.
- News stories without a usable image receive a clean market-news visual fallback instead of an empty area.

### v96 changes
- Added a new `api/company-visual.js` endpoint so MOVA can retrieve company-specific imagery from each company's own official website metadata.
- Company backgrounds now prefer the official website's `og:image` / `twitter:image`, giving primary and search-only companies a relevant company image instead of a blank generic backdrop.
- If no suitable metadata image exists, MOVA automatically falls back to a screenshot of that company's own website.
- Company icons now prefer the official website's Apple Touch Icon / largest favicon before falling back to the domain favicon service.
- Increased desktop company-logo tile from 82px to 104px and mobile from 58px to 72px; the logo itself now fills more of the tile to avoid tiny icons such as NatWest.
- Increased company background-image visibility substantially while preserving a darker left-side gradient so the company name remains readable.
- Search-only companies use exactly the same visual pipeline as primary assets.
- Home-page real investment photography from v95 is unchanged.

### v95 changes
- Replaced the illustrated Home graphics with real photographic stock/investment imagery: an investor checking market prices, a real multi-monitor stockbroker workstation and a laptop displaying financial charts.
- Home photos are sourced from Wikimedia Commons files with public-domain/CC0/free licensing information on their source pages.
- Removed the identical generic rising-arrow company backdrop.
- Company mastheads now request a live screenshot of each company’s own official website, so Barclays, NVIDIA, Meta and other companies do not intentionally share the same picture.
- Company logos now use the company domain through Google’s favicon service for a more reliable company-specific logo beside the name.
- If a company screenshot cannot load, the fallback is now unique to that company: its own large initial and company name, rather than the same generic stock-market graphic.
- All v94 mobile TOP behaviour and prior functionality are retained.

### v94 changes
- Mobile TOP button is now centred above the bottom navigation.
- While the user is actively scrolling on mobile, TOP becomes highly transparent; about 190 ms after scrolling stops it returns to a solid state.
- Added three local investment/market visuals to the Home page covering market momentum, Nasdaq/technology and commodities.
- Added a large company masthead above the Price History chart on asset pages.
- The masthead displays the company name/ticker with a logo pulled from the company's official-domain favicon when available.
- A large company website preview is used as the masthead image when the external preview service is available, with MOVA's local market artwork as the visual fallback.
- Desktop and mobile layouts both receive the new Home visuals and company masthead; the special TOP transparency behaviour is mobile-only.

### v93 changes
- Added a floating TOP control across both desktop and mobile.
- Appears after scrolling 360px and smoothly returns to the top.
- Uses a rising candlestick/market-arrow icon matching MOVA's trading theme.
- Mobile control sits above the bottom navigation; desktop uses a compact labelled button.
- All v92 functionality is retained.

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
