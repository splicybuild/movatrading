# MOVA v134 — Root Cause Home Fix

The actual causes were found and corrected:

1. The final v117/v127 JavaScript block in v133 was closed with `</style>` instead of `</script>`. The browser therefore never executed the Home runtime functions.
2. The old v131 generic Home binder was still active. Since Watchlist had been moved above Top Movers, it treated Refresh as the first `.m127-link`, rewiring Refresh to Pulse. It also replaced the Explore Markets tab handlers.

v134 fixes those structural issues rather than adding another event layer.

Expected:
- Refresh stays on Home and only reloads Watchlist.
- Why buttons update MOVA Short Analysis.
- Full MOVA analysis and Setup Guide work.
- Stocks / Indices / Commodities / Forex work.
- Explore Markets displays a richer 8-row reference-style default list.
- Latest Drivers opens MOVA news.
- Learning Academy remains.
