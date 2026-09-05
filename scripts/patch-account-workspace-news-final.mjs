import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// The Trade Lab runtime still contributes an older account overlay using the same ID.
// Rename/hide that legacy overlay so the new account system can create and own #movaNativeAccount.
html=html.replace(
  '<div id="movaNativeAccount" class="mova-native-account">',
  '<div id="movaLegacyNativeAccount" class="mova-native-account" style="display:none!important">'
);

// Expand the new account workspace sidebar and include a persistent Sign Out action.
html=html.replace(
  '<button class="mna-nav" data-mna="settings">Settings</button></aside>',
  '<button class="mna-nav" data-mna="settings">Settings</button><button class="mna-nav" type="button" onclick="movaNADel(\'movaNativeSessionV2\');movaNASyncProfile();movaNACloseWorkspace();movaNAOpenAuth(\'signin\')">Sign Out</button></aside>'
);

// Guarantee visible News content at HTML level even if a runtime/API path fails.
const fallbackImg='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80';
const cards=[
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
const fallbackMarkup=cards.map(([title,desc])=>`<article class="mna-news"><img src="${fallbackImg}" alt=""><div class="mna-news-body"><span class="eyebrow">MARKET NEWS</span><h3>${title}</h3><p>${desc}</p><div class="mna-news-meta">Market context</div></div></article>`).join('');
html=html.replace(
  '<section id="newsGrid" class="section news-grid"></section>',
  '<section id="newsGrid" class="section news-grid">'+fallbackMarkup+'</section>'
);

writeFileSync(file,html);
console.log('MOVA account workspace legacy removal + guaranteed News cards complete.');
