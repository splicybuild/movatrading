import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Keep the native MOVA Watch List as the source of truth.
// 1) Brand-new users start with an empty Watch List (blank canvas).
// 2) An explicitly saved [] stays empty instead of restoring demo defaults.
// 3) Mirror every native read/save into the Profile Watch List keys so the
//    Account view can never retain stale symbols after Home/ticker are empty.
const oldGet="function getWatchlist(){try{const v=JSON.parse(wlGet(MOVA_WATCHLIST_KEY)||'null');if(Array.isArray(v)&&v.length)return [...new Set(v.map(x=>String(x).toUpperCase()))].slice(0,20)}catch(_){}return [...DEFAULT_WATCHLIST]}";
const newGet="function movaSyncUnifiedWatchlist(x){try{wlSet('movaUnifiedWatchlistV2',JSON.stringify(x));wlSet('movaUnifiedWatchlistV1',JSON.stringify(x));wlSet('movaUnifiedWatchlistV2Initialised','1')}catch(_){}return x}function getWatchlist(){try{const v=JSON.parse(wlGet(MOVA_WATCHLIST_KEY)||'null');if(Array.isArray(v)){const x=[...new Set(v.map(x=>String(x).toUpperCase()))].slice(0,20);return movaSyncUnifiedWatchlist(x)}}catch(_){}return movaSyncUnifiedWatchlist([])}";

const oldSave="function saveWatchlist(v){const x=[...new Set(v.map(s=>String(s).toUpperCase()))].slice(0,20);wlSet(MOVA_WATCHLIST_KEY,JSON.stringify(x));return x}";
const newSave="function saveWatchlist(v){const x=[...new Set(v.map(s=>String(s).toUpperCase()))].slice(0,20);wlSet(MOVA_WATCHLIST_KEY,JSON.stringify(x));return movaSyncUnifiedWatchlist(x)}";

if(!html.includes(oldGet))throw new Error('Watch List native getWatchlist() source not found');
if(!html.includes(oldSave))throw new Error('Watch List native saveWatchlist() source not found');
html=html.replace(oldGet,newGet).replace(oldSave,newSave);

writeFileSync(file,html);
console.log('MOVA Watch List: new users start empty, saved empty state is preserved, and Profile stays in sync.');
