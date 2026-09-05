import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`
<style id="mova-trade-lab-preview-v1">
.mova-trade-lab{display:grid;gap:18px}.mova-lab-hero{padding:22px;border:1px solid #17384a;border-radius:20px;background:linear-gradient(135deg,#071722,#09141d 58%,#07131b);box-shadow:0 18px 42px rgba(0,0,0,.22)}.mova-lab-hero h1{margin:4px 0 8px;font-size:clamp(27px,4vw,42px)}.mova-lab-hero p{margin:0;color:#8ea5b5;max-width:760px;line-height:1.6}.mova-lab-kicker{font-size:10px;font-weight:1000;letter-spacing:.12em;color:#66ff8a}.mova-lab-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.mova-lab-card{border:1px solid #16384a;background:#06131c;border-radius:18px;padding:17px;min-width:0}.mova-lab-card h2{margin:3px 0 6px;font-size:19px}.mova-lab-card p{color:#7f97a8;font-size:12px;line-height:1.55}.mova-lab-card.wide{grid-column:1/-1}.mova-lab-row{display:flex;gap:9px;align-items:center;flex-wrap:wrap}.mova-lab-input,.mova-lab-select,.mova-lab-textarea{box-sizing:border-box;width:100%;border:1px solid #1a4055;border-radius:11px;background:#041018;color:#eef5f8;padding:10px 11px;font:inherit}.mova-lab-textarea{min-height:88px;resize:vertical}.mova-lab-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mova-lab-form .full{grid-column:1/-1}.mova-lab-btn{border:1px solid #24536a;background:#0a2230;color:#eaf5fa;border-radius:11px;padding:10px 13px;font-weight:900;cursor:pointer}.mova-lab-btn.primary{border:0;background:linear-gradient(135deg,#42bbff,#66ff8a);color:#041018}.mova-lab-btn.danger{border-color:rgba(255,105,120,.35);color:#ff9aa3;background:rgba(255,105,120,.08)}.mova-lab-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin-top:12px}.mova-lab-stat{padding:11px;border:1px solid #133447;border-radius:12px;background:#041019}.mova-lab-stat span{display:block;color:#718b9d;font-size:9px;font-weight:900;letter-spacing:.06em}.mova-lab-stat b{display:block;margin-top:4px;font-size:15px}.mova-lab-list{display:grid;gap:8px;margin-top:12px}.mova-lab-item{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:11px;border:1px solid #133447;border-radius:12px;background:#041019}.mova-lab-item small{display:block;color:#7890a1;margin-top:2px}.mova-lab-up{color:#66ff8a}.mova-lab-down{color:#ff7f8e}.mova-training-modal{display:none;position:fixed;inset:0;z-index:2147483600;background:rgba(1,6,10,.82);backdrop-filter:blur(10px);padding:18px;align-items:center;justify-content:center}.mova-training-modal.open{display:flex}.mova-training-panel{width:min(760px,calc(100vw - 24px));max-height:calc(100vh - 28px);overflow:auto;border:1px solid #1b4860;border-radius:20px;background:#06131d;padding:18px;box-shadow:0 28px 90px rgba(0,0,0,.6)}.mova-training-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.mova-training-head h2{margin:0}.mova-training-close{width:38px;height:38px;border-radius:50%;border:1px solid #24495d;background:#071722;color:#fff;font-size:20px;cursor:pointer}.mova-training-badge{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(102,255,138,.28);border-radius:999px;padding:6px 9px;color:#66ff8a;font-size:9px;font-weight:1000;letter-spacing:.08em}.mova-account-training-entry{margin-top:8px!important}
@media(max-width:740px){.mova-lab-grid{grid-template-columns:1fr}.mova-lab-form{grid-template-columns:1fr}.mova-lab-form .full{grid-column:auto}.mova-lab-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.mova-training-modal{padding:7px}.mova-training-panel{width:calc(100vw - 14px);max-height:calc(100vh - 14px);padding:14px;border-radius:15px}}
</style>`;

const runtime=`
<script id="mova-trade-lab-preview-runtime-v1">
(function(){
  const SETUPS='movaTradeLabSetupsV1',TRAIN='movaTrainingAccountV1',PROFILE='movaMobileProfileV1';
  const jget=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??d}catch(_){return d}};
  const jset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>'$'+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  const profile=()=>jget(PROFILE,null);
  function training(){return jget(TRAIN,{startingCash:25000,cash:25000,positions:[],closed:[],createdAt:Date.now()})}
  function saveTraining(t){jset(TRAIN,t)}
  async function quotes(symbols){if(!symbols.length)return[];try{const r=await fetch('/api/market?symbols='+encodeURIComponent([...new Set(symbols)].join(',')),{cache:'no-store'});if(!r.ok)return[];return (await r.json()).assets||[]}catch(_){return[]}}

  function relabelNav(){
    document.querySelectorAll('[data-nav="portfolio"], [data-mob="portfolio"]').forEach(b=>{
      const label=b.querySelector('.nav-label');if(label)label.textContent='Trade Lab';
      else if(!b.querySelector('svg'))b.textContent='Trade Lab';
      b.setAttribute('aria-label','Trade Lab');
      if(b.dataset.mob==='portfolio'){
        const svg=b.querySelector('svg');if(svg)svg.innerHTML='<path d="M4 18l4-5 4 2 4-7 4 3"/><path d="M4 21h16"/><circle cx="16" cy="8" r="2.3"/>';
      }
    });
  }

  function renderTradeLab(){
    const page=document.getElementById('portfolio');if(!page)return;
    if(page.dataset.movaTradeLab==='1')return;
    page.dataset.movaTradeLab='1';
    page.innerHTML='<div class="mova-trade-lab">\
      <section class="mova-lab-hero"><span class="mova-lab-kicker">MOVA TRADE LAB</span><h1>Analyse. Plan. Simulate. Improve.</h1><p>Your working space for turning live market data into structured trading ideas. Scan momentum, build setups, save your thesis and practise with virtual funds before risking real money.</p></section>\
      <div class="mova-lab-grid">\
        <section class="mova-lab-card"><span class="mova-lab-kicker">LIVE MARKET SCANNER</span><h2>What is moving?</h2><p>Quick live scan of MOVA\'s core US names, ranked by the largest percentage move.</p><div class="mova-lab-row"><button class="mova-lab-btn primary" id="movaRunScanner">Run live scan</button><span id="movaScannerStatus" style="color:#7890a1;font-size:11px"></span></div><div class="mova-lab-list" id="movaScannerList"></div></section>\
        <section class="mova-lab-card"><span class="mova-lab-kicker">TRAINING MODE</span><h2>Virtual trading account</h2><p>Practise with live market prices and fake money. No broker connection, no real funds and no financial risk.</p><div class="mova-lab-stat-grid" id="movaTrainingMini"></div><button class="mova-lab-btn primary" id="movaOpenTraining" style="margin-top:12px">Open Training Account</button></section>\
        <section class="mova-lab-card wide"><span class="mova-lab-kicker">SETUP BUILDER</span><h2>Build a trading idea</h2><p>Write down the thesis before the trade. Define the levels that would prove you right — and the level that proves you wrong.</p><form class="mova-lab-form" id="movaSetupForm"><label>TICKER<input class="mova-lab-input" id="movaSetupTicker" maxlength="8" placeholder="AMD" required></label><label>DIRECTION<select class="mova-lab-select" id="movaSetupDirection"><option>Long</option><option>Short</option><option>Watch only</option></select></label><label>ENTRY ZONE<input class="mova-lab-input" id="movaSetupEntry" placeholder="$ / range"></label><label>STOP / INVALIDATION<input class="mova-lab-input" id="movaSetupStop" placeholder="Price or condition"></label><label>SUPPORT<input class="mova-lab-input" id="movaSetupSupport" placeholder="Key support"></label><label>RESISTANCE / TARGET<input class="mova-lab-input" id="movaSetupTarget" placeholder="Target / resistance"></label><label class="full">THESIS<textarea class="mova-lab-textarea" id="movaSetupThesis" placeholder="Why does this setup make sense? What are you waiting to see?" required></textarea></label><div class="full mova-lab-row"><button class="mova-lab-btn primary" type="submit">Save setup</button></div></form><div class="mova-lab-list" id="movaSetupList"></div></section>\
      </div></div>';
    document.getElementById('movaRunScanner').onclick=runScanner;
    document.getElementById('movaOpenTraining').onclick=openTraining;
    document.getElementById('movaSetupForm').onsubmit=saveSetup;
    renderSetups();refreshTrainingMini();
  }

  async function runScanner(){
    const btn=document.getElementById('movaRunScanner'),status=document.getElementById('movaScannerStatus'),list=document.getElementById('movaScannerList');
    btn.disabled=true;status.textContent='Scanning live market…';list.innerHTML='';
    const qs=await quotes(['AMD','AAPL','NVDA','TSLA','AMZN','MSFT','META','GOOGL','NFLX','MU']);
    qs.sort((a,b)=>Math.abs(Number(b.changePct||0))-Math.abs(Number(a.changePct||0)));
    list.innerHTML=qs.slice(0,8).map(q=>'<button class="mova-lab-item" style="width:100%;text-align:left;color:inherit;cursor:pointer" onclick="openCompanyResearch(\''+esc(q.ticker)+'\')"><span><b>'+esc(q.ticker)+'</b><small>'+esc(q.name||'Live market')+'</small></span><span style="text-align:right"><b>'+esc(q.priceText||money(q.priceNative))+'</b><small class="'+(Number(q.changePct)>=0?'mova-lab-up':'mova-lab-down')+'">'+(Number(q.changePct)>=0?'+':'')+Number(q.changePct||0).toFixed(2)+'%</small></span></button>').join('')||'<small style="color:#7890a1">Live scan unavailable right now.</small>';
    status.textContent=qs.length?'Live · '+new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'No data returned';btn.disabled=false;
  }

  function saveSetup(e){e.preventDefault();const arr=jget(SETUPS,[]);arr.unshift({id:Date.now(),ticker:movaSetupTicker.value.trim().toUpperCase(),direction:movaSetupDirection.value,entry:movaSetupEntry.value.trim(),stop:movaSetupStop.value.trim(),support:movaSetupSupport.value.trim(),target:movaSetupTarget.value.trim(),thesis:movaSetupThesis.value.trim(),createdAt:Date.now()});jset(SETUPS,arr.slice(0,50));e.target.reset();renderSetups()}
  function renderSetups(){const el=document.getElementById('movaSetupList');if(!el)return;const arr=jget(SETUPS,[]);el.innerHTML=arr.length?arr.slice(0,8).map(s=>'<div class="mova-lab-item"><span><b>'+esc(s.ticker)+' · '+esc(s.direction)+'</b><small>'+esc(s.thesis)+'</small><small>'+[s.entry&&'Entry '+s.entry,s.stop&&'Stop '+s.stop,s.target&&'Target '+s.target].filter(Boolean).map(esc).join(' · ')+'</small></span><button class="mova-lab-btn danger" data-del-setup="'+s.id+'">Delete</button></div>').join(''):'<small style="color:#7890a1">No saved setups yet.</small>';el.querySelectorAll('[data-del-setup]').forEach(b=>b.onclick=()=>{jset(SETUPS,arr.filter(x=>String(x.id)!==b.dataset.delSetup));renderSetups()})}

  async function trainingSnapshot(){const t=training(),qs=await quotes(t.positions.map(p=>p.ticker)),map=new Map(qs.map(q=>[q.ticker,q]));let invested=0,value=0,day=0;t.positions.forEach(p=>{const q=map.get(p.ticker),px=Number(q?.priceNative||p.lastPrice||p.entry);p.lastPrice=px;invested+=p.entry*p.qty;value+=px*p.qty;day+=(Number(q?.changePct||0)/100)*px*p.qty});saveTraining(t);return{t,invested,value,day,total:t.cash+value,pl:t.cash+value-t.startingCash,map}}
  async function refreshTrainingMini(){const el=document.getElementById('movaTrainingMini');if(!el)return;const s=await trainingSnapshot();el.innerHTML='<div class="mova-lab-stat"><span>VIRTUAL CASH</span><b>'+money(s.t.cash)+'</b></div><div class="mova-lab-stat"><span>ACCOUNT VALUE</span><b>'+money(s.total)+'</b></div><div class="mova-lab-stat"><span>TOTAL P/L</span><b class="'+(s.pl>=0?'mova-lab-up':'mova-lab-down')+'">'+(s.pl>=0?'+':'')+money(s.pl)+'</b></div><div class="mova-lab-stat"><span>OPEN POSITIONS</span><b>'+s.t.positions.length+'</b></div>'}

  function ensureTrainingModal(){if(document.getElementById('movaTrainingModal'))return;const m=document.createElement('div');m.id='movaTrainingModal';m.className='mova-training-modal';m.innerHTML='<section class="mova-training-panel" role="dialog" aria-modal="true"><div class="mova-training-head"><div><span class="mova-training-badge">● TRAINING MODE · VIRTUAL FUNDS</span><h2 style="margin-top:8px">MOVA Training Account</h2></div><button class="mova-training-close">×</button></div><div id="movaTrainingBody"></div></section>';document.body.appendChild(m);m.querySelector('.mova-training-close').onclick=()=>m.classList.remove('open');m.onclick=e=>{if(e.target===m)m.classList.remove('open')}}
  async function openTraining(){ensureTrainingModal();const m=document.getElementById('movaTrainingModal');m.classList.add('open');await renderTraining()}
  async function renderTraining(){const body=document.getElementById('movaTrainingBody');if(!body)return;const s=await trainingSnapshot();body.innerHTML='<div class="mova-lab-stat-grid"><div class="mova-lab-stat"><span>STARTING FUNDS</span><b>'+money(s.t.startingCash)+'</b></div><div class="mova-lab-stat"><span>VIRTUAL CASH</span><b>'+money(s.t.cash)+'</b></div><div class="mova-lab-stat"><span>ACCOUNT VALUE</span><b>'+money(s.total)+'</b></div><div class="mova-lab-stat"><span>TOTAL RETURN</span><b class="'+(s.pl>=0?'mova-lab-up':'mova-lab-down')+'">'+(s.pl>=0?'+':'')+money(s.pl)+'</b></div></div><section class="mova-lab-card" style="margin-top:14px"><h2>Place virtual trade</h2><form class="mova-lab-form" id="movaTrainingBuyForm"><label>TICKER<input class="mova-lab-input" id="movaTrainTicker" required maxlength="8" placeholder="AAPL"></label><label>VIRTUAL $ AMOUNT<input class="mova-lab-input" id="movaTrainAmount" type="number" min="1" step="1" required placeholder="1000"></label><div class="full mova-lab-row"><button class="mova-lab-btn primary" type="submit">Buy with virtual funds</button><span id="movaTrainNote" style="font-size:11px;color:#7890a1"></span></div></form></section><section class="mova-lab-card" style="margin-top:14px"><h2>Open positions</h2><div class="mova-lab-list">'+(s.t.positions.length?s.t.positions.map(p=>{const q=s.map.get(p.ticker),px=Number(q?.priceNative||p.lastPrice||p.entry),pl=(px-p.entry)*p.qty;return '<div class="mova-lab-item"><span><b>'+esc(p.ticker)+' · '+Number(p.qty).toFixed(4)+' shares</b><small>Entry '+money(p.entry)+' · Live '+money(px)+'</small><small class="'+(pl>=0?'mova-lab-up':'mova-lab-down')+'">'+(pl>=0?'+':'')+money(pl)+' unrealised</small></span><button class="mova-lab-btn" data-close-pos="'+p.id+'">Close</button></div>'}).join(''):'<small style="color:#7890a1">No virtual positions yet.</small>')+'</div></section><div class="mova-lab-row" style="margin-top:14px"><button class="mova-lab-btn danger" id="movaResetTraining">Reset training account</button></div>';
    document.getElementById('movaTrainingBuyForm').onsubmit=buyVirtual;document.querySelectorAll('[data-close-pos]').forEach(b=>b.onclick=()=>closeVirtual(Number(b.dataset.closePos)));document.getElementById('movaResetTraining').onclick=()=>{if(confirm('Reset the virtual account back to $25,000?')){saveTraining({startingCash:25000,cash:25000,positions:[],closed:[],createdAt:Date.now()});renderTraining();refreshTrainingMini()}};
  }
  async function buyVirtual(e){e.preventDefault();const ticker=movaTrainTicker.value.trim().toUpperCase(),amount=Number(movaTrainAmount.value),note=document.getElementById('movaTrainNote'),t=training();if(amount>t.cash){note.textContent='Not enough virtual cash.';return}note.textContent='Getting live price…';const q=(await quotes([ticker]))[0];const px=Number(q?.priceNative);if(!Number.isFinite(px)||px<=0){note.textContent='Live price unavailable.';return}const qty=amount/px;t.cash-=amount;t.positions.unshift({id:Date.now(),ticker,qty,entry:px,lastPrice:px,openedAt:Date.now()});saveTraining(t);await renderTraining();refreshTrainingMini()}
  async function closeVirtual(id){const t=training(),p=t.positions.find(x=>x.id===id);if(!p)return;const q=(await quotes([p.ticker]))[0],px=Number(q?.priceNative||p.lastPrice||p.entry);t.cash+=px*p.qty;t.closed.unshift({...p,exit:px,closedAt:Date.now(),pl:(px-p.entry)*p.qty});t.positions=t.positions.filter(x=>x.id!==id);saveTraining(t);await renderTraining();refreshTrainingMini()}

  function injectAccountTrainingEntry(){if(!profile())return;const targets=[...document.querySelectorAll('.mova-account-actions,.mobile-access-actions,.mobile-profile-actions')];targets.forEach(t=>{if(t.querySelector('.mova-account-training-entry'))return;const b=document.createElement('button');b.type='button';b.className='mova-account-primary mova-account-training-entry';b.textContent='Training Account';b.onclick=openTraining;t.prepend(b)})}

  function boot(){relabelNav();renderTradeLab();injectAccountTrainingEntry();const o=new MutationObserver(()=>{relabelNav();renderTradeLab();injectAccountTrainingEntry()});o.observe(document.body,{childList:true,subtree:true});setInterval(injectAccountTrainingEntry,1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.MovaTraining={open:openTraining};
})();
</script>`;

if(!html.includes('</head>'))throw new Error('Trade Lab preview patch: </head> missing');
if(!html.includes('</body>'))throw new Error('Trade Lab preview patch: </body> missing');
html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA Trade Lab + Training Account preview v1 complete.');
