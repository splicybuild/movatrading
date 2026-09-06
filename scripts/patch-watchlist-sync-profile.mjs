import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-watchlist-sync-v1-style">
.mova-watch-account-list{display:grid;gap:10px;margin-top:18px}.mova-watch-account-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #153446;border-radius:13px;background:#05111a;padding:13px 14px}.mova-watch-account-row b{display:block;font-size:15px}.mova-watch-account-row small{display:block;color:#7890a1;margin-top:3px}.mova-watch-account-open{min-height:38px;border:1px solid #24536a;border-radius:10px;background:#0a2230;color:#eef5f8;font-weight:900;padding:0 13px;cursor:pointer}.mova-watch-empty{color:#8299aa;line-height:1.55;padding:8px 0}.mna-nav[data-mna="watchlist"]{display:block!important}
body.mova-light-theme .mova-watch-account-row{background:#fff;border-color:#c8d7df;color:#14212b}body.mova-light-theme .mova-watch-account-open{background:#eef6f9;color:#14212b;border-color:#aac2ce}
@media(max-width:740px){.mova-watch-account-row{grid-template-columns:minmax(0,1fr) auto}.mna-side{grid-template-columns:repeat(6,minmax(0,1fr))!important}.mna-nav[data-mna="watchlist"]{font-size:8px!important}}
</style>`;
html=html.replace('</head>',css+'</head>');

// Styling only. Runtime deliberately disabled: patch-watchlist-sourcefix.mjs is now the sole Watch List state controller.
writeFileSync(file,html);
console.log('MOVA legacy Watch List sync runtime disabled; styles retained.');
