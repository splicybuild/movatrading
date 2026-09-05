import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');
const startTag='<main id="portfolio" class="page">';
const start=html.indexOf(startTag);
if(start<0)throw new Error('Static Trade Lab patch: portfolio main not found');
const end=html.indexOf('</main>',start);
if(end<0)throw new Error('Static Trade Lab patch: portfolio closing main not found');
const replacement=`<main id="portfolio" class="page">
  <section class="mova-static-lab">
    <span class="mova-static-kicker">MOVA TRADE LAB</span>
    <h1>Analyse. Plan. Simulate. Improve.</h1>
    <p class="mova-static-intro">Your dedicated market-analysis workspace. Use live data to find opportunities, structure trade ideas and practise before risking real money.</p>
    <div class="mova-static-grid">
      <article class="mova-static-card">
        <span class="mova-static-kicker">LIVE MARKET SCANNER</span>
        <h2>What is moving?</h2>
        <p>Scan MOVA's core US names using live market data and rank the strongest daily moves.</p>
        <button class="mova-static-btn" id="movaStaticScan">Run live scan</button>
        <div id="movaStaticScanList" class="mova-static-list"></div>
      </article>
      <article class="mova-static-card">
        <span class="mova-static-kicker">TRAINING MODE</span>
        <h2>Virtual Trading Account</h2>
        <p>Practise with virtual funds using live prices. Account controls sit under your profile workspace.</p>
        <button class="mova-static-btn" id="movaStaticTraining">Open Training Account</button>
      </article>
      <article class="mova-static-card wide">
        <span class="mova-static-kicker">SETUP BUILDER</span>
        <h2>Build a trading idea</h2>
        <form id="movaStaticForm" class="mova-static-form">
          <label>TICKER<input id="movaStaticTicker" class="mova-static-input" required></label>
          <label>DIRECTION<select id="movaStaticDirection" class="mova-static-select"><option>Long</option><option>Short</option><option>Watch only</option></select></label>
          <label>ENTRY ZONE<input id="movaStaticEntry" class="mova-static-input"></label>
          <label>STOP / INVALIDATION<input id="movaStaticStop" class="mova-static-input"></label>
          <label>SUPPORT<input id="movaStaticSupport" class="mova-static-input"></label>
          <label>RESISTANCE / TARGET<input id="movaStaticTarget" class="mova-static-input"></label>
          <label class="full">THESIS<textarea id="movaStaticThesis" class="mova-static-text" required></textarea></label>
          <div class="full"><button class="mova-static-btn">Save setup</button></div>
        </form>
        <div id="movaStaticSetups" class="mova-static-list"></div>
      </article>
    </div>
  </section>
</main>`;
html=html.slice(0,start)+replacement+html.slice(end+7);
const css=`<style id="mova-static-trade-lab-v1">
.mova-static-lab{padding:34px 0 10px}.mova-static-lab h1{font-size:clamp(34px,5vw,58px);line-height:1;margin:6px 0 12px;letter-spacing:-.04em}.mova-static-kicker{color:#66ff8a;font-size:10px;font-weight:1000;letter-spacing:.12em}.mova-static-intro{max-width:760px;color:#8ca2b2;line-height:1.65}.mova-static-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin-top:22px}.mova-static-card{border:1px solid rgba(66,187,255,.18);background:linear-gradient(180deg,#0a1721,#07121a);border-radius:20px;padding:18px}.mova-static-card.wide{grid-column:1/-1}.mova-static-card h2{margin:5px 0 7px}.mova-static-card p{color:#7f95a5;font-size:12px;line-height:1.55}.mova-static-btn{border:0;border-radius:11px;padding:10px 13px;font-weight:900;background:linear-gradient(135deg,#42bbff,#66ff8a);color:#041018;cursor:pointer}.mova-static-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mova-static-form .full{grid-column:1/-1}.mova-static-input,.mova-static-select,.mova-static-text{width:100%;box-sizing:border-box;border:1px solid #1a4055;border-radius:11px;background:#041018;color:#eef5f8;padding:10px 11px;font:inherit}.mova-static-text{min-height:92px}.mova-static-list{display:grid;gap:8px;margin-top:12px}.mova-static-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px;border:1px solid #133447;border-radius:12px;background:#041019}.mova-static-row small{display:block;color:#7890a1;margin-top:2px}@media(max-width:740px){.mova-static-lab{padding:22px 0 90px}.mova-static-grid,.mova-static-form{grid-template-columns:1fr}.mova-static-card.wide,.mova-static-form .full{grid-column:auto}}
</style>`;
const js=`(function(){
var KEY='movaStaticTradeLabSetupsV1';
function esc(v){return String(v==null?'':v).replace(/[&<>\"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'}[c]})}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
function write(v){try{localStorage.setItem(KEY,JSON.stringify(v))}catch(e){}}
async function scan(){var l=document.getElementById('movaStaticScanList');if(!l)return;l.textContent='Scanning live market...';try{var r=await fetch('/api/market?symbols='+encodeURIComponent('AMD,AAPL,NVDA,TSLA,AMZN,MSFT,META,GOOGL,NFLX,MU'),{cache:'no-store'});if(!r.ok)throw 0;var d=await r.json(),a=d.assets||[];a.sort(function(x,y){return Math.abs(Number(y.changePct||0))-Math.abs(Number(x.changePct||0))});l.innerHTML=a.slice(0,8).map(function(x){return '<div class="mova-static-row"><span><b>'+esc(x.ticker)+'</b><small>'+esc(x.name||'Live market')+'</small></span><span style="text-align:right"><b>'+esc(x.priceText||'$'+Number(x.priceNative||0).toFixed(2))+'</b><small>'+((Number(x.changePct)>=0?'+':'')+Number(x.changePct||0).toFixed(2)+'%')+'</small></span></div>'}).join('')||'<small>No live data returned.</small>'}catch(e){l.innerHTML='<small>Live scan unavailable right now.</small>'}}
function draw(){var l=document.getElementById('movaStaticSetups');if(!l)return;var a=read();l.innerHTML=a.length?a.map(function(x){return '<div class="mova-static-row"><span><b>'+esc(x.ticker)+' · '+esc(x.direction)+'</b><small>'+esc(x.thesis)+'</small></span><span></span></div>'}).join(''):'<small>No saved setups yet.</small>'}
function save(ev){ev.preventDefault();var a=read();a.unshift({id:Date.now(),ticker:document.getElementById('movaStaticTicker').value.trim().toUpperCase(),direction:document.getElementById('movaStaticDirection').value,entry:document.getElementById('movaStaticEntry').value,stop:document.getElementById('movaStaticStop').value,support:document.getElementById('movaStaticSupport').value,target:document.getElementById('movaStaticTarget').value,thesis:document.getElementById('movaStaticThesis').value});write(a.slice(0,50));ev.target.reset();draw()}
function boot(){var s=document.getElementById('movaStaticScan');if(s)s.onclick=scan;var f=document.getElementById('movaStaticForm');if(f)f.onsubmit=save;var t=document.getElementById('movaStaticTraining');if(t)t.onclick=function(){if(window.MovaAccountWorkspace&&window.MovaAccountWorkspace.open)window.MovaAccountWorkspace.open('training')};draw();document.querySelectorAll('[data-nav="portfolio"],[data-mob="portfolio"]').forEach(function(b){var l=b.querySelector('.nav-label');if(l)l.textContent='Trade Lab';else if(!b.querySelector('svg'))b.textContent='Trade Lab'})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();})();`;
new Function(js);
html=html.replace('</head>',css+'</head>');
html=html.replace('</body>','<script id="mova-static-trade-lab-runtime-v1">'+js+'</script></body>');
if(!html.includes('MOVA TRADE LAB')||html.includes('<span class="eyebrow">MY PORTFOLIO</span><h2>Positions & performance</h2>'))throw new Error('Static Trade Lab verification failed');
writeFileSync(file,html);
console.log('MOVA static Trade Lab final preview complete.');