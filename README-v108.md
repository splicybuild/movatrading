# MOVA Trading v108

Index-only patch. Replace only `index.html`.

## Trading A–Z
- Expanded from 49 terms to **336 terms**.
- Coverage now includes global equities, market structure, execution, technical analysis, fundamental analysis, portfolio/risk, options, derivatives, commodities, bonds/fixed income, forex, macroeconomics, corporate actions, strategies, psychology and international indices/exchanges.
- Existing hand-written term guides remain.
- New terms use category-aware, concept-aware guidance rather than the old sentence template.
- Deep dives include five guidance cards, practical scenarios and visual explainers.

## MOVA Analysis
- The asset panel is company/asset-specific immediately.
- It states the actual latest percentage move and the current Pulse, Momentum, Relative Volume and Volatility scores.
- The heading becomes `What is moving <company>`.
- It loads the latest asset-specific news from the existing `/api/news` endpoint.
- When fundamentals arrive, sector/industry, trailing P/E and dividend-yield context are added where available.
- If live news is unavailable, MOVA does not invent a cause.

No changes to `package.json`, `api/`, `assets/` or deployment settings.
