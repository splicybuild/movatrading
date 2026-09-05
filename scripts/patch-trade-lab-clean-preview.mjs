import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const startTag='<main id="portfolio" class="page">';
const start=html.indexOf(startTag);
if(start<0) throw new Error('portfolio page not found');
const end=html.indexOf('</main>',start);
if(end<0) throw new Error('portfolio closing tag not found');

const replacement=`<main id="portfolio" class="page">
  <section class="mova-clean-lab">
    <span class="mova-clean-kicker">MOVA TRADE LAB</span>
    <h1>Analyse. Plan. Simulate. Improve.</h1>
    <p class="mova-clean-intro">Your dedicated market-analysis workspace. Use live data to find opportunities, structure trade ideas and practise before risking real money.</p>
    <div class="mova-clean-grid">
      <article class="mova-clean-card">
        <span class="mova-clean-kicker">LIVE MARKET SCANNER</span>
        <h2>What is moving?</h2>
        <p>Scan MOVA's core US names using live market data and rank the strongest daily moves.</p>
        <button class="mova-clean-btn" id="movaCleanScan" type="button">Run live scan</button>
        <div id="movaCleanScanList" class="mova-clean-list"></div>
      </article>
      <article class="mova-clean-card">
        <span class="mova-clean-kicker">TRAINING MODE</span>
        <h2>Virtual Trading Account</h2>
        <p>Practise with virtual funds using live prices. Account controls sit under your profile workspace.</p>
        <button class="mova-clean-btn" id="movaCleanTraining" type="button">Open Training Account</button>
      </article>
      <article class="mova-clean-card wide">
        <span class="mova-clean-kicker">SETUP BUILDER</span>
        <h2>Build a trading idea</h2>
        <form id="movaCleanSetupForm" class="mova-clean-form">
          <label>TICKER<input id="movaCleanTicker" class="mova-clean-input" required></label>
          <label>DIRECTION<select id="movaCleanDirection" class="mova-clean-input"><option>Long</option><option>Short</option><option>Watch only</option></select></label>
          <label>ENTRY ZONE<input id="movaCleanEntry" class="mova-clean-input"></label>
          <label>STOP / INVALIDATION<input id="movaCleanStop" class="mova-clean-input"></label>
          <label>SUPPORT<input id="movaCleanSupport" class="mova-clean-input"></label>
          <label>RESISTANCE / TARGET<input id="movaCleanTarget" class="mova-clean-input"></label>
          <label class="full">THESIS<textarea id="movaCleanThesis" class="mova-clean-input" rows="4" required></textarea></label>
          <div class="full"><button class="mova-clean-btn" type="submit">Save setup</button></div>
        </form>
        <div id="movaCleanSetups" class="mova-clean-list"></div>
      </article>
    </div>
  </section>
</main>`;
html=html.slice(0,start)+replacement+html.slice(end+7);

const overlay=`<div id="movaCleanAccount" class="mova-clean-account">
  <aside class="mova-clean-sidebar">
    <div class="mova-clean-sidehead"><span>MOVA ACCOUNT</span><strong>Account</strong></div>
    <button type="button" class="mova-clean-nav" data-clean-section="profile">Profile</button>
    <button type="button" class="mova-clean-nav" data-clean-section="training">Training Account</button>
    <button type="button" class="mova-clean-nav" data-clean-section="funds">Manage Funds</button>
    <button type="button" class="mova-clean-nav" data-clean-section="settings">Settings</button>
  </aside>
  <section class="mova-clean-accountmain">
    <button id="movaCleanClose" type="button" class="mova-clean-close">×</button>
    <div id="movaCleanCanvas" class="mova-clean-canvas"></div>
  </section>
</div>`;

const css=`<style id="mova-trade-lab-clean-preview-style">
.mova-clean-lab{padding:34px 0 20px}.mova-clean-lab h1{font-size:clamp(36px,5vw,60px);line-height:1;margin:8px 0 14px;letter-spacing:-.04em}.mova-clean-kicker{color:#66ff8a;font-size:10px;font-weight:1000;letter-spacing:.12em}.mova-clean-intro{max-width:780px;color:#8ca2b2;line-height:1.6}.mova-clean-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:24px}.mova-clean-card{border:1px solid rgba(66,187,255,.2);background:#07131c;border-radius:20px;padding:20px}.mova-clean-card.wide{grid-column:1/-1}.mova-clean-card h2{margin:7px 0 9px}.mova-clean-card p{color:#7f95a5}.mova-clean-btn{border:0;border-radius:11px;padding:11px 14px;font-weight:900;background:linear-gradient(135deg,#42bbff,#66ff8a);color:#041018;cursor:pointer}.mova-clean-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mova-clean-form .full{grid-column:1/-1}.mova-clean-form label{display:grid;gap:6px;font-size:11px;color:#a8b8c2}.mova-clean-input{width:100%;box-sizing:border-box;border:1px solid #1a4055;border-radius:11px;background:#041018;color:#eef5f8;padding:10px 11px;font:inherit}.mova-clean-list{display:grid;gap:8px;margin-top:12px}.mova-clean-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px;border:1px solid #133447;border-radius:12px;background:#041019}.mova-clean-row small{display:block;color:#7890a1;margin-top:2px}
.mova-clean-account{display:none;position:fixed;inset:0;z-index:2147483645;background:#041018;color:#eef5f8}.mova-clean-account.open{display:flex}.mova-clean-sidebar{width:230px;flex:0 0 230px;background:#06131d;border-right:1px solid #153446;padding:22px 14px;display:flex;flex-direction:column;gap:8px}.mova-clean-sidehead{padding:4px 8px 18px;border-bottom:1px solid #153446;margin-bottom:6px}.mova-clean-sidehead span{display:block;color:#66ff8a;font-size:10px;font-weight:1000;letter-spacing:.12em}.mova-clean-sidehead strong{display:block;margin-top:6px;font-size:20px}.mova-clean-nav{min-height:48px;border:1px solid transparent;border-radius:12px;background:transparent;color:#8fa5b4;text-align:left;padding:0 13px;font:inherit;font-weight:900;cursor:pointer}.mova-clean-nav.active,.mova-clean-nav:hover{background:#0a2230;border-color:#1d4a61;color:#fff}.mova-clean-accountmain{position:relative;flex:1;overflow:auto;min-width:0}.mova-clean-close{position:absolute;right:18px;top:18px;width:40px;height:40px;border-radius:50%;border:1px solid #21475b;background:#071722;color:#fff;font-size:20px;cursor:pointer}.mova-clean-canvas{padding:72px 38px 40px;max-width:1080px}.mova-clean-canvas h1{font-size:34px;margin:8px 0}.mova-clean-copy{color:#8299aa;max-width:760px;line-height:1.6}.mova-clean-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:18px 0}.mova-clean-stat,.mova-clean-panel{border:1px solid #153446;border-radius:15px;background:#06131c;padding:16px}.mova-clean-stat span{display:block;color:#718b9d;font-size:9px;font-weight:900}.mova-clean-stat b{display:block;margin-top:5px;font-size:18px}.mova-clean-accountgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.mova-clean-panel.wide{grid-column:1/-1}.mova-clean-note{font-size:11px;color:#7890a1}.mova-clean-up{color:#66ff8a}.mova-clean-down{color:#ff7f8e}
@media(max-width:740px){.mova-clean-grid,.mova-clean-form,.mova-clean-accountgrid{grid-template-columns:1fr}.mova-clean-card.wide,.mova-clean-form .full,.mova-clean-panel.wide{grid-column:auto}.mova-clean-account{flex-direction:column}.mova-clean-sidebar{width:auto;flex:0 0 auto;border-right:0;border-bottom:1px solid #153446;padding:12px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}.mova-clean-sidehead{grid-column:1/-1;margin:0;padding:2px 4px 8px}.mova-clean-nav{text-align:center;min-height:42px;padding:0 4px;font-size:10px}.mova-clean-canvas{padding:66px 14px 92px}.mova-clean-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
</style>`;

const js=`<script id="mova-trade-lab-clean-preview-runtime">
(function(){
  'use strict';
  const SETUPS='movaCleanSetupsV1';
  const TRAIN='movaCleanTrainingV1';
  const get=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return v==null?d:v}catch(e){return d}};
  const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const money=v=>'$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  const esc=v=>String(v==null?'':v).replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const training=()=>get(TRAIN,{startingCash:25000,cash:25000,positions:[],closed:[]});
  async function market(symbols){
    const r=await fetch('/api/market?symbols='+encodeURIComponent(symbols.join(',')),{cache:'no-store'});
    if(!r.ok) throw new Error('market');
    const d=await r.json();
    return d.assets||[];
  }
  async function runScan(){
    const list=document.getElementById('movaCleanScanList');
    list.innerHTML='<small>Scanning live market…</small>';
    try{
      const a=await market(['AMD','AAPL','NVDA','TSLA','AMZN','MSFT','META','GOOGL','NFLX','MU']);
      a.sort((x,y)=>Math.abs(Number(y.changePct||0))-Math.abs(Number(x.changePct||0)));
      list.innerHTML=a.slice(0,8).map(x=>'<div class="mova-clean-row"><span><b>'+esc(x.ticker)+'</b><small>'+esc(x.name||'Live market')+'</small></span><span style="text-align:right"><b>'+esc(x.priceText||money(x.priceNative))+'</b><small>'+((Number(x.changePct)>=0?'+':'')+Number(x.changePct||0).toFixed(2)+'%')+'</small></span></div>').join('')||'<small>No live data returned.</small>';
    }catch(e){list.innerHTML='<small>Live scan unavailable right now.</small>'}
  }
  function drawSetups(){
    const list=document.getElementById('movaCleanSetups'); if(!list) return;
    const a=get(SETUPS,[]);
    list.innerHTML=a.length?a.map(x=>'<div class="mova-clean-row"><span><b>'+esc(x.ticker)+' · '+esc(x.direction)+'</b><small>'+esc(x.thesis)+'</small></span><span></span></div>').join(''):'<small>No saved setups yet.</small>';
  }
  function saveSetup(e){
    e.preventDefault(); const a=get(SETUPS,[]);
    a.unshift({ticker:movaCleanTicker.value.trim().toUpperCase(),direction:movaCleanDirection.value,entry:movaCleanEntry.value,stop:movaCleanStop.value,support:movaCleanSupport.value,target:movaCleanTarget.value,thesis:movaCleanThesis.value});
    put(SETUPS,a.slice(0,50)); e.target.reset(); drawSetups();
  }
  function openAccount(section){document.getElementById('movaCleanAccount').classList.add('open');showSection(section||'profile')}
  function showSection(section){
    document.querySelectorAll('.mova-clean-nav').forEach(b=>b.classList.toggle('active',b.dataset.cleanSection===section));
    if(section==='training') return renderTraining();
    const c=document.getElementById('movaCleanCanvas');
    if(section==='funds') c.innerHTML='<span class="mova-clean-kicker">VIRTUAL FUNDS ONLY</span><h1>Manage Funds</h1><p class="mova-clean-copy">Manage the fake cash used by your Training Account.</p><div class="mova-clean-panel"><label>ADD VIRTUAL FUNDS<input id="movaCleanAddAmount" class="mova-clean-input" type="number" min="1" placeholder="5000"></label><br><br><button id="movaCleanAddFunds" class="mova-clean-btn" type="button">Add virtual funds</button></div>';
    else if(section==='settings') c.innerHTML='<span class="mova-clean-kicker">SETTINGS</span><h1>Settings</h1><p class="mova-clean-copy">Account preferences and alerts.</p><div class="mova-clean-panel"><label><input type="checkbox" checked> Price alerts</label><br><br><label><input type="checkbox" checked> Market alerts</label><br><br><label><input type="checkbox"> Training reminders</label></div>';
    else c.innerHTML='<span class="mova-clean-kicker">PROFILE</span><h1>Your MOVA profile</h1><p class="mova-clean-copy">Your personal MOVA account area.</p><div class="mova-clean-panel"><label>FIRST NAME<input class="mova-clean-input" id="movaCleanProfileName"></label><br><br><label>EMAIL<input class="mova-clean-input" id="movaCleanProfileEmail" type="email"></label></div>';
    const add=document.getElementById('movaCleanAddFunds'); if(add) add.onclick=()=>{const t=training(),amt=Number(movaCleanAddAmount.value);if(amt>0){t.cash+=amt;t.startingCash+=amt;put(TRAIN,t);movaCleanAddAmount.value=''}};
  }
  async function renderTraining(){
    const c=document.getElementById('movaCleanCanvas'),t=training();
    c.innerHTML='<span class="mova-clean-kicker">TRAINING MODE · VIRTUAL FUNDS</span><h1>Training Account</h1><p class="mova-clean-copy">Practise with live market prices and virtual funds only.</p><div id="movaCleanTrainingBody"><span class="mova-clean-note">Loading live values…</span></div>';
    let qs=[]; try{qs=await market([...new Set(t.positions.map(p=>p.ticker))])}catch(e){}
    const map=new Map(qs.map(q=>[q.ticker,q])); let value=0;
    t.positions.forEach(p=>{const q=map.get(p.ticker);p.lastPrice=Number(q&&q.priceNative||p.lastPrice||p.entry);value+=p.lastPrice*p.qty}); put(TRAIN,t);
    const total=t.cash+value,pl=total-t.startingCash;
    document.getElementById('movaCleanTrainingBody').innerHTML='<div class="mova-clean-stats"><div class="mova-clean-stat"><span>VIRTUAL CASH</span><b>'+money(t.cash)+'</b></div><div class="mova-clean-stat"><span>POSITIONS VALUE</span><b>'+money(value)+'</b></div><div class="mova-clean-stat"><span>ACCOUNT VALUE</span><b>'+money(total)+'</b></div><div class="mova-clean-stat"><span>TOTAL P/L</span><b class="'+(pl>=0?'mova-clean-up':'mova-clean-down')+'">'+(pl>=0?'+':'')+money(pl)+'</b></div></div><div class="mova-clean-accountgrid"><div class="mova-clean-panel"><h2>Place virtual trade</h2><div class="mova-clean-form"><label>TICKER<input id="movaCleanBuyTicker" class="mova-clean-input" placeholder="AMD"></label><label>VIRTUAL $ AMOUNT<input id="movaCleanBuyAmount" class="mova-clean-input" type="number" min="1" placeholder="1000"></label><div class="full"><button id="movaCleanBuy" class="mova-clean-btn" type="button">Buy with virtual funds</button> <span id="movaCleanBuyNote" class="mova-clean-note"></span></div></div></div><div class="mova-clean-panel"><h2>Summary</h2><p class="mova-clean-note">Starting funds: '+money(t.startingCash)+'</p><p class="mova-clean-note">Open positions: '+t.positions.length+'</p><p class="mova-clean-note">Closed trades: '+t.closed.length+'</p></div><div class="mova-clean-panel wide"><h2>Open positions</h2><div id="movaCleanPositions"></div></div></div>';
    const list=document.getElementById('movaCleanPositions'); list.innerHTML=t.positions.length?'':'<span class="mova-clean-note">No virtual positions yet.</span>';
    t.positions.forEach(p=>{const row=document.createElement('div');const upl=(p.lastPrice-p.entry)*p.qty;row.className='mova-clean-row';row.innerHTML='<span><b>'+esc(p.ticker)+' · '+p.qty.toFixed(4)+' shares</b><small>Entry '+money(p.entry)+' · Live '+money(p.lastPrice)+'</small><small>'+((upl>=0?'+':'')+money(upl))+' unrealised</small></span><button class="mova-clean-btn" type="button">Close</button>';row.querySelector('button').onclick=()=>closePosition(p.id);list.appendChild(row)});
    document.getElementById('movaCleanBuy').onclick=buyPosition;
  }
  async function buyPosition(){
    const t=training(),ticker=movaCleanBuyTicker.value.trim().toUpperCase(),amt=Number(movaCleanBuyAmount.value),note=document.getElementById('movaCleanBuyNote');
    if(!ticker||amt<=0) return; if(amt>t.cash){note.textContent='Not enough virtual cash.';return} note.textContent='Getting live price…';
    try{const q=(await market([ticker]))[0],px=Number(q&&q.priceNative);if(!px)throw 0;t.cash-=amt;t.positions.unshift({id:Date.now(),ticker,qty:amt/px,entry:px,lastPrice:px});put(TRAIN,t);renderTraining()}catch(e){note.textContent='Live price unavailable.'}
  }
  async function closePosition(id){
    const t=training(),p=t.positions.find(x=>x.id===id);if(!p)return;let px=p.lastPrice||p.entry;try{const q=(await market([p.ticker]))[0];px=Number(q&&q.priceNative||px)}catch(e){}t.cash+=px*p.qty;t.closed.unshift({...p,exit:px,pl:(px-p.entry)*p.qty});t.positions=t.positions.filter(x=>x.id!==id);put(TRAIN,t);renderTraining();
  }
  function bind(){
    const scan=document.getElementById('movaCleanScan'); if(scan) scan.onclick=runScan;
    const train=document.getElementById('movaCleanTraining'); if(train) train.onclick=()=>openAccount('training');
    const form=document.getElementById('movaCleanSetupForm'); if(form) form.onsubmit=saveSetup;
    document.getElementById('movaCleanClose').onclick=()=>document.getElementById('movaCleanAccount').classList.remove('open');
    document.querySelectorAll('.mova-clean-nav').forEach(b=>b.onclick=()=>showSection(b.dataset.cleanSection));
    document.querySelectorAll('[data-nav="portfolio"],[data-mob="portfolio"]').forEach(b=>{const l=b.querySelector('.nav-label');if(l)l.textContent='Trade Lab';else if(!b.querySelector('svg'))b.textContent='Trade Lab'});
    drawSetups();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
</script>`;

html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',overlay+js+'</body>');
writeFileSync(file,html);
console.log('MOVA clean Trade Lab preview complete.');
