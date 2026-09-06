import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Fix the native MOVA Watch List empty-state bug at source.
// Previously an explicitly saved [] was treated as "no saved value" and
// DEFAULT_WATCHLIST was restored. An empty array must remain a valid Watch List.
const oldFn="function getWatchlist(){try{const v=JSON.parse(wlGet(MOVA_WATCHLIST_KEY)||'null');if(Array.isArray(v)&&v.length)return [...new Set(v.map(x=>String(x).toUpperCase()))].slice(0,20)}catch(_){}return [...DEFAULT_WATCHLIST]}";
const newFn="function getWatchlist(){try{const v=JSON.parse(wlGet(MOVA_WATCHLIST_KEY)||'null');if(Array.isArray(v))return [...new Set(v.map(x=>String(x).toUpperCase()))].slice(0,20)}catch(_){}return [...DEFAULT_WATCHLIST]}";

if(!html.includes(oldFn))throw new Error('Watch List native getWatchlist() source not found');
html=html.replace(oldFn,newFn);

writeFileSync(file,html);
console.log('MOVA Watch List: explicit empty saved list now remains empty.');
