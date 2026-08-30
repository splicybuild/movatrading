MOVA V2.4.1 DEPLOY PATCH

Replace only these files in your repo:

1. /index.html
   Replace the existing root index.html with this one.

2. /api/company-financials.js
   Add or replace this file inside your existing api folder.

KEEP all existing:
- assets/
- favicon files
- manifest.webmanifest
- mova-favicon.svg
- other api/ files
- scripts/build-v2.mjs
- package.json
- vercel.json

Do not replace branding/icon assets with anything from older ZIPs.

After upload/commit, Vercel should redeploy automatically.
