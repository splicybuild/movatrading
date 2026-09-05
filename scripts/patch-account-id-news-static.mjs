import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// The older Trade Lab runtime uses the same ID as the new account workspace.
// Rename only that legacy overlay so the new account code can create its own workspace.
const legacy='<div id="movaNativeAccount" class="mova-native-account">';
if(!html.includes(legacy)) throw new Error('legacy account overlay not found');
html=html.replace(legacy,'<div id="movaLegacyNativeAccount" class="mova-native-account" style="display:none!important">');

// Seed the News grid directly in the built HTML. The native renderNews() may replace
// these with live stories later, but the page will never start completely blank.
const empty='<section id="newsGrid" class="section news-grid"></section>';
if(!html.includes(empty)) throw new Error('empty news grid not found');
const img='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80';
const stories=[
 ['AI and semiconductor shares remain in focus','Technology leadership and chip demand remain important drivers of Nasdaq sentiment.'],
 ['US markets track rate expectations','Bond yields and interest-rate expectations continue to influence growth stocks.'],
 ['Oil reacts to global supply expectations','Energy markets remain sensitive to changes in supply, demand and geopolitics.'],
 ['Gold remains sensitive to yields and the dollar','Precious metals continue to respond to real yields and currency moves.'],
 ['Big Tech expectations shape index positioning','Large-cap technology remains a major influence on US index direction.'],
 ['High-beta growth shares remain volatile','Growth stocks can show larger daily moves as risk appetite changes.'],
 ['Market breadth stays important for traders','Participation across sectors can help confirm or weaken headline index moves.'],
 ['Investors watch economic data for policy clues','Inflation, employment and growth data can quickly alter rate expectations.'],
 ['Commodity markets remain sensitive to demand signals','Industrial and energy commodities continue to react to global growth expectations.'],
 ['Volatility remains a key risk signal','Changes in volatility can reveal shifts in market confidence and positioning.']
];
const cards=stories.map(([title,desc])=>'<article class="mna-news"><img src="'+img+'" alt=""><div class="mna-news-body"><span class="eyebrow">MARKET NEWS</span><h3>'+title+'</h3><p>'+desc+'</p><div class="mna-news-meta">Market context</div></div></article>').join('');
html=html.replace(empty,'<section id="newsGrid" class="section news-grid">'+cards+'</section>');

writeFileSync(file,html);
console.log('MOVA legacy account ID resolved and News grid seeded.');
