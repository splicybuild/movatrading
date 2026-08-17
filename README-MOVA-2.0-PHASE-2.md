# MOVA 2.0 — Phase 2 Visual Learning Curriculum

Baseline: MOVA 2.0 Phase 1, originally built from the user-supplied v125 project.

## Phase 2 additions
- Expanded Learn from 6 prototype modules to 38 structured modules across 8 learning paths.
- Learning paths: Getting Started, Understanding Stocks, Reading Charts, Company Research, Risk Management, ETFs & Portfolios, Market Context, From Idea to Plan.
- Every module contains:
  1. Concept teaching
  2. Subject-specific visual explainer
  3. A realistic scenario
  4. A five-question knowledge check
  5. Answer explanations
  6. A completion/result screen
- Replaced the generic gradient-bar learning visual with topic-specific HTML/CSS visuals: candlesticks, order book, trend chart, support/resistance zones, volume, moving averages, RSI, financial statements, balance sheet, cash flow, valuation, risk/reward, diversification, allocation, interest rates, inflation, FX, commodities, thesis and more.
- Module progress and scores are saved locally on the user's device.
- Learning-path completion counts and average score are shown in the Tools learning centre.
- 60% is the prototype completion threshold.
- Existing MOVA Home, Pulse, company research, Training Tools, A-Z Trading Jargon, Compare Brokers, Portfolio, News and mobile login remain intact.

## Design intent
Phase 2 keeps the existing MOVA black / blue / green visual language. The emphasis is on visual teaching and practical decision scenarios rather than marketing content.

## Deployment
This is a full package. For a GitHub/Vercel deployment, the primary changed frontend file is `index.html`; the rest of the package is included to keep deployment straightforward.
