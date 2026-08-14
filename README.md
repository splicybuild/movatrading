# MOVA Trading v107

Index-only patch. Keep package.json, api/, assets/ and deployment settings untouched.

Changes:
- "Why it's moving" now pulls the current asset's latest live market move and latest news headlines from MOVA's existing live APIs.
- MOVA no longer invents a generic cause when no current headline is available; it states that no fresh cause can be confirmed.
- The panel shows up to four current news drivers with source/time alongside the live percentage move.
- All 49 A–Z Trading Jargon terms now have genuinely term-specific:
  - What to look for
  - What can mislead you
  - How it can protect capital
  - When to review it
- The previous generic text that simply swapped the chosen term into the same sentence is no longer used for these four guidance cards.
- Existing term-specific Capital Discipline, scenarios and visual explainers remain in place.

Replace only index.html.
