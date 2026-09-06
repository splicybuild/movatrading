import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

if(!html.includes('mova-light-theme')) throw new Error('Light theme contrast patch: light theme hook missing');
if(!html.includes('mova-clean-card')) throw new Error('Light theme contrast patch: Trade Lab card hook missing');

const css=`<style id="mova-light-theme-contrast-v2">
/* MOVA light theme contrast refinement — visual only, no runtime behaviour */
body.mova-light-theme{background:#eef3f6!important;color:#152630!important}

/* Header, navigation and page surfaces */
body.mova-light-theme header{background:#f9fbfc!important;border-color:#b9cbd4!important;box-shadow:0 1px 0 rgba(25,54,68,.07)!important}
body.mova-light-theme .page,
body.mova-light-theme main,
body.mova-light-theme section{color:#152630!important}
body.mova-light-theme .mobile-nav{background:#f9fbfc!important;border-color:#b9cbd4!important;box-shadow:0 -1px 0 rgba(25,54,68,.06)!important}
body.mova-light-theme .mobile-nav button,
body.mova-light-theme header nav button{color:#425c69!important}
body.mova-light-theme .mobile-nav button.active,
body.mova-light-theme header nav button.active{color:#102832!important}

/* Top live ticker: light native surface rather than dark cards on a pale page */
body.mova-light-theme .ticker-shell,
body.mova-light-theme .ticker{background:#e7eef2!important;border-color:#b7c9d2!important;color:#152630!important}
body.mova-light-theme .ticker-item{background:#fbfdfe!important;border-color:#b9ccd6!important;color:#152630!important;box-shadow:0 3px 10px rgba(28,57,71,.06)!important}
body.mova-light-theme .ticker-item strong,
body.mova-light-theme .ticker-item b{color:#102832!important}
body.mova-light-theme .ticker-item small:not(.up):not(.down),
body.mova-light-theme .ticker-item span:not(.up):not(.down){color:#4d6673!important}
body.mova-light-theme .ticker-item .up{color:#14833b!important}
body.mova-light-theme .ticker-item .down{color:#c53d4d!important}

/* Core cards and content blocks */
body.mova-light-theme .card,
body.mova-light-theme .mova-clean-card,
body.mova-light-theme .mna-card,
body.mova-light-theme .mna-stat,
body.mova-light-theme .news-search-wrap,
body.mova-light-theme .mna-news{background:#fbfdfe!important;color:#152630!important;border-color:#b8ccd6!important;box-shadow:0 5px 16px rgba(26,55,69,.055)!important}
body.mova-light-theme .mova-clean-card h2,
body.mova-light-theme .mova-clean-card h3,
body.mova-light-theme .mna-card h2,
body.mova-light-theme .mna-card h3,
body.mova-light-theme .mna-news h3{color:#102832!important}

/* Trade Lab scanner and setup rows */
body.mova-light-theme .mova-clean-row{background:#f5f9fb!important;border-color:#bfd1da!important;color:#152630!important;box-shadow:none!important}
body.mova-light-theme .mova-clean-row b,
body.mova-light-theme .mova-clean-row strong{color:#102832!important}
body.mova-light-theme .mova-clean-row small:not(.up):not(.down):not(.mova-clean-up):not(.mova-clean-down){color:#506976!important}
body.mova-light-theme .mova-clean-list>small{color:#506976!important}
body.mova-light-theme .mova-clean-card p,
body.mova-light-theme .mova-clean-intro,
body.mova-light-theme .mova-clean-copy,
body.mova-light-theme .mova-clean-note{color:#465f6c!important}
body.mova-light-theme .mova-clean-form label{color:#3f5967!important}
body.mova-light-theme .mova-clean-input{background:#fff!important;color:#142832!important;border-color:#aebfc9!important;box-shadow:inset 0 1px 0 rgba(20,40,50,.02)!important}
body.mova-light-theme .mova-clean-input:focus{border-color:#359fd0!important;box-shadow:0 0 0 3px rgba(53,159,208,.13)!important;outline:none!important}
body.mova-light-theme .mova-clean-up,
body.mova-light-theme .mova-clean-row .up{color:#14833b!important}
body.mova-light-theme .mova-clean-down,
body.mova-light-theme .mova-clean-row .down{color:#c53d4d!important}

/* Account workspace */
body.mova-light-theme #movaNativeAccount,
body.mova-light-theme .mna-main{background:#f3f7f9!important;color:#152630!important}
body.mova-light-theme .mna-side{background:#e9f0f4!important;border-color:#b9cbd4!important}
body.mova-light-theme .mna-brand{border-color:#c4d3da!important}
body.mova-light-theme .mna-nav{color:#405a68!important;background:transparent!important}
body.mova-light-theme .mna-nav:hover{background:#dcebf2!important;color:#102832!important;border-color:#93b7c8!important}
body.mova-light-theme .mna-nav.active{background:#d4e8f1!important;color:#0d2732!important;border-color:#7daec4!important;box-shadow:inset 3px 0 0 #42bbff!important}
body.mova-light-theme .mna-row{background:#f7fafb!important;color:#152630!important;border-color:#c2d2da!important}
body.mova-light-theme .mna-row span,
body.mova-light-theme .mna-copy{color:#48616e!important}
body.mova-light-theme .mna-row b{color:#102832!important}
body.mova-light-theme .mna-input,
body.mova-light-theme input,
body.mova-light-theme select,
body.mova-light-theme textarea{background:#fff!important;color:#142832!important;border-color:#aebfc9!important}
body.mova-light-theme .mna-input:focus,
body.mova-light-theme input:focus,
body.mova-light-theme select:focus,
body.mova-light-theme textarea:focus{border-color:#359fd0!important;box-shadow:0 0 0 3px rgba(53,159,208,.13)!important;outline:none!important}
body.mova-light-theme .mna-x{background:#fff!important;color:#16303b!important;border-color:#9fb7c3!important;box-shadow:0 3px 10px rgba(28,57,71,.07)!important}
body.mova-light-theme .mna-btn.secondary{background:#edf4f7!important;color:#17313d!important;border-color:#a9c1cc!important}

/* Watch List account rows */
body.mova-light-theme .mova-watch-account-row{background:#fbfdfe!important;border-color:#b8ccd6!important;color:#152630!important}
body.mova-light-theme .mova-watch-account-row b{color:#102832!important}
body.mova-light-theme .mova-watch-account-row small,
body.mova-light-theme .mova-watch-empty{color:#4d6673!important}
body.mova-light-theme .mova-watch-account-open{background:#eaf3f7!important;color:#17313d!important;border-color:#99b9c8!important}
body.mova-light-theme .mova-watch-account-open:hover{background:#dcecf3!important;border-color:#73a8bd!important}

/* News search and cards */
body.mova-light-theme .mna-news-body p,
body.mova-light-theme .mna-news-meta,
body.mova-light-theme .mova-news-search-status,
body.mova-light-theme .mova-news-context span{color:#48616e!important}
body.mova-light-theme .mova-news-context{background:#f7fafb!important;border-color:#b8ccd6!important;color:#152630!important}
body.mova-light-theme .mova-news-context strong{color:#102832!important}
body.mova-light-theme .mova-news-context .up{color:#14833b!important}
body.mova-light-theme .mova-news-context .down{color:#c53d4d!important}
body.mova-light-theme .mova-news-context .flat{color:#1477a3!important}
body.mova-light-theme .mova-news-rank{border-color:#8eb5c6!important;color:#147b43!important;background:#eef8f1!important}

/* Autocomplete */
body.mova-light-theme .mova-auto-list{background:#fff!important;border-color:#aebfc9!important;box-shadow:0 14px 34px rgba(28,57,71,.15)!important}
body.mova-light-theme .mova-auto-item{color:#142832!important;border-bottom-color:#d8e3e8!important}
body.mova-light-theme .mova-auto-item:hover,
body.mova-light-theme .mova-auto-item:focus{background:#edf5f8!important}
body.mova-light-theme .mova-auto-item span{color:#4d6673!important}
body.mova-light-theme .mova-auto-empty{color:#536d7a!important}

/* Preserve market direction colours everywhere after contrast overrides */
body.mova-light-theme .up{color:#14833b!important}
body.mova-light-theme .down{color:#c53d4d!important}
body.mova-light-theme .mova-clean-up{color:#14833b!important}
body.mova-light-theme .mova-clean-down{color:#c53d4d!important}

@media(max-width:740px){
  body.mova-light-theme .ticker-shell,
  body.mova-light-theme .ticker{background:#e7eef2!important}
  body.mova-light-theme .mova-clean-card{box-shadow:0 3px 12px rgba(26,55,69,.05)!important}
  body.mova-light-theme .mna-side{background:#e9f0f4!important}
}
</style>`;

html=html.replace('</head>',css+'</head>');
writeFileSync(file,html);
console.log('MOVA light-theme contrast v2 applied: brighter cards, stronger text/borders, readable scanner and ticker.');
