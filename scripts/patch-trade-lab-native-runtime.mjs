import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Enforce Trade Lab label in the actual navigation markup.
html=html.replace(/(<button[^>]*data-nav="portfolio"[^>]*>[\s\S]*?)(Portfolio)([\s\S]*?<\/button>)/g,'$1Trade Lab$3');
html=html.replace(/(<button[^>]*data-mob="portfolio"[^>]*>[\s\S]*?)(Portfolio)([\s\S]*?<\/button>)/g,'$1Trade Lab$3');

// Wire the already-rendered clean Trade Lab buttons using inline calls to functions
// inserted into MOVA's existing/native application script (not a new script tag).
html=html.replace(/<button class="mova-clean-btn" id="movaV2Scan"[^>]*>Run live scan<\/button>/,
  '<button class="mova-clean-btn" id="movaV2Scan" type="button" onclick="movaNativeScan()">Run live scan</button>');
html=html.replace(/<button class="mova-clean-btn" id="movaV2Training"[^>]*>Open Training Account<\/button>/,
  '<button class="mova-clean-btn" id="movaV2Training" type="button" onclick="movaNativeOpenAccount(\'training\')">Open Training Account</button>');

// Make the account overlay self-contained and directly callable.
const nativeOverlay=`<div id="movaNativeAccount" class="mova-native-account">
  <aside class="mova-native-sidebar">
    <div class="mova-native-head"><span>MOVA ACCOUNT</span><strong>Account</strong></div>
    <button type="button" onclick="movaNativeAccountSection('profile')">Profile</button>
    <button type="button" onclick="movaNativeAccountSection('training')">Training Account</button>
    <button type="button" onclick="movaNativeAccountSection('funds')">Manage Funds</button>
    <button type="button" onclick="movaNativeAccountSection('settings')">Settings</button>
  </aside>
  <main class="mova-native-main">
    <button type="button" class="mova-native-close" onclick="movaNativeCloseAccount()">×</button>
    <div id="movaNativeCanvas" class="mova-native-canvas"></div>
  </main>
</div>`;

const css=`<style id="mova-native-account-style">
.mova-native-account{display:none;position:fixed;inset:0;z-index:2147483647;background:#041018;color:#eef5f8}.mova-native-account.open{display:flex}.mova-native-sidebar{width:230px;flex:0 0 230px;background:#06131d;border-right:1px solid #153446;padding:22px 14px;display:flex;flex-direction:column;gap:8px}.mova-native-head{padding:4px 8px 18px;border-bottom:1px solid #153446;margin-bottom:6px}.mova-native-head span{display:block;color:#66ff8a;font-size:10px;font-weight:1000;letter-spacing:.12em}.mova-native-head strong{display:block;margin-top:6px;font-size:20px}.mova-native-sidebar button{min-height:48px;border:1px solid transparent;border-radius:12px;background:transparent;color:#8fa5b4;text-align:left;padding:0 13px;font:inherit;font-weight:900;cursor:pointer}.mova-native-sidebar button:hover{background:#0a2230;border-color:#1d4a61;color:#fff}.mova-native-main{position:relative;flex:1;overflow:auto;min-width:0}.mova-native-close{position:absolute;right:18px;top:18px;width:40px;height:40px;border-radius:50%;border:1px solid #21475b;background:#071722;color:#fff;font-size:20px;cursor:pointer}.mova-native-canvas{padding:72px 38px 40px;max-width:1080px}.mova-native-canvas h1{font-size:34px;margin:8px 0}.mova-native-copy{color:#8299aa;max-width:760px;line-height:1.6}.mova-native-panel{border:1px solid #153446;border-radius:15px;background:#06131c;padding:16px;margin-top:16px}.mova-native-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin-top:18px}.mova-native-stat{border:1px solid #153446;border-radius:15px;background:#06131c;padding:16px}.mova-native-stat span{display:block;color:#718b9d;font-size:9px;font-weight:900}.mova-native-stat b{display:block;margin-top:5px;font-size:18px}@media(max-width:740px){.mova-native-account{flex-direction:column}.mova-native-sidebar{width:auto;flex:0 0 auto;border-right:0;border-bottom:1px solid #153446;padding:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.mova-native-head{grid-column:1/-1;margin:0;padding:2px 4px 8px}.mova-native-sidebar button{text-align:center;min-height:42px;padding:0 4px;font-size:10px}.mova-native-canvas{padding:66px 14px 92px}.mova-native-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>`;

html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',nativeOverlay+'</body>');

const nativeFns=`
function movaNativeMoney(v){return '$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
async function movaNativeScan(){
  var list=document.getElementById('movaV2ScanList');
  if(!list)return;
  list.innerHTML='<small>Scanning live market…</small>';
  try{
    var r=await fetch('/api/market?symbols='+encodeURIComponent('AMD,AAPL,NVDA,TSLA,AMZN,MSFT,META,GOOGL,NFLX,MU'),{cache:'no-store'});
    if(!r.ok)throw new Error('market');
    var d=await r.json(),a=d.assets||[];
    a.sort(function(x,y){return Math.abs(Number(y.changePct||0))-Math.abs(Number(x.changePct||0))});
    list.innerHTML=a.slice(0,8).map(function(x){return '<div class="mova-clean-row"><span><b>'+String(x.ticker||'')+'</b><small>'+String(x.name||'Live market')+'</small></span><span style="text-align:right"><b>'+String(x.priceText||movaNativeMoney(x.priceNative))+'</b><small>'+((Number(x.changePct)>=0?'+':'')+Number(x.changePct||0).toFixed(2)+'%')+'</small></span></div>'}).join('')||'<small>No live data returned.</small>';
  }catch(e){list.innerHTML='<small>Live scan unavailable right now.</small>'}
}
function movaNativeOpenAccount(section){
  var o=document.getElementById('movaNativeAccount');
  if(!o)return;
  o.classList.add('open');
  movaNativeAccountSection(section||'profile');
}
function movaNativeCloseAccount(){var o=document.getElementById('movaNativeAccount');if(o)o.classList.remove('open')}
function movaNativeTrainingState(){try{return JSON.parse(localStorage.getItem('movaNativeTrainingV1')||'null')||{startingCash:25000,cash:25000,positions:[],closed:[]}}catch(e){return{startingCash:25000,cash:25000,positions:[],closed:[]}}}
function movaNativeAccountSection(section){
  var c=document.getElementById('movaNativeCanvas');if(!c)return;
  if(section==='training'){
    var t=movaNativeTrainingState();
    c.innerHTML='<span class="mova-clean-kicker">TRAINING MODE · VIRTUAL FUNDS</span><h1>Training Account</h1><p class="mova-native-copy">Practise with virtual funds using live market prices. No broker connection and no real money.</p><div class="mova-native-stats"><div class="mova-native-stat"><span>STARTING FUNDS</span><b>'+movaNativeMoney(t.startingCash)+'</b></div><div class="mova-native-stat"><span>VIRTUAL CASH</span><b>'+movaNativeMoney(t.cash)+'</b></div><div class="mova-native-stat"><span>OPEN POSITIONS</span><b>'+t.positions.length+'</b></div><div class="mova-native-stat"><span>CLOSED TRADES</span><b>'+t.closed.length+'</b></div></div><div class="mova-native-panel"><h2>Place virtual trade</h2><p class="mova-native-copy">The account workspace is now opening correctly. Live buy/sell controls can be tested next once this navigation check passes.</p></div>';
    return;
  }
  if(section==='funds')c.innerHTML='<span class="mova-clean-kicker">VIRTUAL FUNDS ONLY</span><h1>Manage Funds</h1><p class="mova-native-copy">Manage the fake cash used by your Training Account.</p>';
  else if(section==='settings')c.innerHTML='<span class="mova-clean-kicker">SETTINGS</span><h1>Settings</h1><p class="mova-native-copy">Account preferences and alerts.</p>';
  else c.innerHTML='<span class="mova-clean-kicker">PROFILE</span><h1>Your MOVA profile</h1><p class="mova-native-copy">Your personal MOVA account area.</p>';
}
`;

// Inject into the native script containing MOVA's own navigation functions.
const marker='function openCompanyResearch(';
const fnPos=html.indexOf(marker);
if(fnPos<0) throw new Error('native MOVA script marker not found');
const scriptEnd=html.indexOf('</script>',fnPos);
if(scriptEnd<0) throw new Error('native MOVA script end not found');
new Function(nativeFns);
html=html.slice(0,scriptEnd)+nativeFns+html.slice(scriptEnd);

writeFileSync(file,html);
console.log('MOVA Trade Lab native-runtime wiring complete.');
