import { readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/index.html';
let html = readFileSync(file, 'utf8');

// Remove the two earlier preview controllers so only the final controllers below own
// News Top 10 and Watch List state. Keep their CSS patches intact.
html = html.replace(/<script id="mova-news-top10-hardfix-v5">[\s\S]*?<\/script>/g, '');
html = html.replace(/<script id="mova-watchlist-sourcefix-v8">[\s\S]*?<\/script>/g, '');

// Put Watch List structurally between Investments and Alerts in the native Account sidebar.
// This edits the helper template that creates the Account UI at runtime.
const accountNeedle = '<button class="mna-nav" data-mna="investments">Investments</button><button class="mna-nav" data-mna="alerts">Alerts</button>';
const accountReplacement = '<button class="mna-nav" data-mna="investments">Investments</button><button class="mna-nav" data-mna="watchlist">Watch List</button><button class="mna-nav" data-mna="alerts">Alerts</button>';
if (html.includes(accountNeedle)) html = html.replace(accountNeedle, accountReplacement);

// Colour the live Trade Lab scan percentage using MOVA's existing up/down classes.
const scanOld = `list.innerHTML=a.slice(0,8).map(function(x){return '<div class="mova-clean-row"><span><b>'+String(x.ticker||'')+'</b><small>'+String(x.name||'Live market')+'</small></span><span style="text-align:right"><b>'+String(x.priceText||movaNativeMoney(x.priceNative))+'</b><small>'+((Number(x.changePct)>=0?'+':'')+Number(x.changePct||0).toFixed(2)+'%')+'</small></span></div>'}).join('')||'<small>No live data returned.</small>';`;
const scanNew = `list.innerHTML=a.slice(0,8).map(function(x){var pct=Number(x.changePct||0),cls=pct>0?'up':pct<0?'down':'';return '<div class="mova-clean-row"><span><b>'+String(x.ticker||'')+'</b><small>'+String(x.name||'Live market')+'</small></span><span style="text-align:right"><b>'+String(x.priceText||movaNativeMoney(x.priceNative))+'</b><small class="'+cls+'">'+((pct>=0?'+':'')+pct.toFixed(2)+'%')+'</small></span></div>'}).join('')||'<small>No live data returned.</small>';`;
if (html.includes(scanOld)) html = html.replace(scanOld, scanNew);

const runtime = `<script id="mova-preview-followup-fixes-v1">(function(){
  const WATCH_KEY='movaUnifiedWatchlistV2';
  const LEGACY_KEY='movaUnifiedWatchlistV1';
  const MODE_KEY='movaTickerModeV1';
  let watchBooted=false,watchSig='',newsBusy=false;

  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function assetsList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}
  function symbol(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\\-]{1,12}$/.test(v)?v:''}

  // ---------- Watch List: one canonical state bridged back into native app collections ----------
  function collectState(value,out){
    if(value==null)return;
    if(value instanceof Set){value.forEach(v=>collectState(v,out));return}
    if(value instanceof Map){value.forEach((v,k)=>{const s=symbol(k);if(s)out.set(s,!!v)});return}
    if(Array.isArray(value)){value.forEach(v=>collectState(v,out));return}
    if(typeof value==='string'){const s=symbol(value);if(s)out.set(s,true);return}
    if(typeof value!=='object')return;
    const direct=symbol(value.symbol||value.ticker||value.k||value.code||'');
    const explicit=value.watching??value.watched??value.inWatchlist??value.inWatchList??value.active??value.enabled??value.selected;
    if(direct)out.set(direct,!(explicit===false||explicit===0||String(explicit).toLowerCase()==='false'||String(explicit).toLowerCase()==='removed'));
    Object.entries(value).forEach(([k,v])=>{
      const s=symbol(k);if(!s)return;
      const text=String(v).toLowerCase();
      if(v===true||v===1||text==='watching'||text==='watched'||text==='active')out.set(s,true);
      if(v===false||v===0||text==='false'||text==='removed')out.set(s,false);
    });
  }
  function parseState(raw){const out=new Map();if(!raw)return out;try{collectState(JSON.parse(raw),out)}catch(e){collectState(raw,out)}return out}
  function discoverWatchlist(){
    const known=new Set(assetsList().map(a=>symbol(a.k)).filter(Boolean)),choices=[];
    function push(map,priority){
      const active=[...map.entries()].filter(([s,on])=>on&&(!known.size||known.has(s))).map(([s])=>s);
      choices.push({active,priority});
    }
    try{if(typeof watchlist!=='undefined'){const m=new Map();collectState(watchlist,m);push(m,1000)}}catch(e){}
    try{if(typeof watchList!=='undefined'){const m=new Map();collectState(watchList,m);push(m,1000)}}catch(e){}
    try{if(typeof watchedAssets!=='undefined'){const m=new Map();collectState(watchedAssets,m);push(m,950)}}catch(e){}
    try{
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||'';
        if(k===WATCH_KEY||k===LEGACY_KEY||/alert|setting|pref|notification/i.test(k)||!/watch|fav|follow|track/i.test(k))continue;
        const m=parseState(localStorage.getItem(k));
        let priority=/watchlist/i.test(k)?850:/watch/i.test(k)?800:700;
        if(/mova/i.test(k))priority+=50;
        push(m,priority);
      }
    }catch(e){}
    choices.sort((a,b)=>b.priority-a.priority||b.active.length-a.active.length);
    return choices.length?choices[0].active:[];
  }
  function readWatch(){
    try{
      const v=JSON.parse(localStorage.getItem(WATCH_KEY)||'null');
      return Array.isArray(v)?[...new Set(v.map(symbol).filter(Boolean))]:null;
    }catch(e){return null}
  }
  function bridgeCollection(value,list){
    try{
      if(value instanceof Set){value.clear();list.forEach(s=>value.add(s));return}
      if(value instanceof Map){
        const vals=[...value.values()];
        if(!vals.length||vals.every(v=>typeof v==='boolean'||v===0||v===1)){value.clear();list.forEach(s=>value.set(s,true))}
        return;
      }
      if(Array.isArray(value)&&(value.length===0||value.every(v=>typeof v==='string'))){value.splice(0,value.length,...list)}
    }catch(e){}
  }
  function bridgeNative(list){
    try{if(typeof watchlist!=='undefined')bridgeCollection(watchlist,list)}catch(e){}
    try{if(typeof watchList!=='undefined')bridgeCollection(watchList,list)}catch(e){}
    try{if(typeof watchedAssets!=='undefined')bridgeCollection(watchedAssets,list)}catch(e){}
  }
  function saveWatch(list){
    const clean=[...new Set((list||[]).map(symbol).filter(Boolean))];
    try{localStorage.setItem(WATCH_KEY,JSON.stringify(clean))}catch(e){}
    bridgeNative(clean);
    return clean;
  }
  function watched(){
    const current=readWatch();
    return current!==null?current:saveWatch(discoverWatchlist());
  }
  function currentResearchSymbol(){
    try{if(typeof activeResearchTicker!=='undefined'){const s=symbol(activeResearchTicker);if(s)return s}}catch(e){}
    const h=String(location.hash||'').match(/#company=([A-Z0-9.\\-]+)/i);if(h)return h[1].toUpperCase();
    const e=document.getElementById('crEyebrow'),m=e&&String(e.textContent||'').match(/·\\s*([A-Z0-9.\\-]+)\\s*$/i);
    return m?m[1].toUpperCase():'';
  }
  function setWatching(s,on){
    s=symbol(s);if(!s)return;
    const next=watched().filter(x=>x!==s);if(on)next.push(s);
    saveWatch(next);refreshWatch(true);
  }
  function homeWatchSelect(){
    return [...document.querySelectorAll('select')].find(sel=>{
      let n=sel;
      for(let i=0;i<7&&n;i++,n=n.parentElement){
        if(/YOUR WATCHED STOCKS\\s*&\\s*MARKETS|WATCH LIST/i.test(n.textContent||''))return true;
      }
      return false;
    })||null;
  }
  function fillHomeWatch(){
    const sel=homeWatchSelect();if(!sel)return;
    const list=watched(),all=assetsList(),cur=String(sel.value||'').toUpperCase(),sig=list.join('|');
    if(sig===sel.dataset.movaWatchSig)return;
    sel.dataset.movaWatchSig=sig;sel.innerHTML='';
    const p=document.createElement('option');p.value='';p.textContent=list.length?'Select a watched market':'No watched markets yet';sel.appendChild(p);
    list.forEach(s=>{const a=all.find(x=>symbol(x.k)===s),o=document.createElement('option');o.value=s;o.textContent=(a&&a.n?a.n:s)+' · '+s;sel.appendChild(o)});
    if(list.includes(cur))sel.value=cur;
  }
  function ensureAccountWatch(){
    const side=document.querySelector('#movaNativeAccount .mna-side');if(!side)return;
    const alerts=side.querySelector('[data-mna="alerts"]'),investments=side.querySelector('[data-mna="investments"]');
    if(!alerts)return;
    let b=side.querySelector('[data-mna="watchlist"]');
    if(!b){
      b=document.createElement('button');b.className='mna-nav';b.dataset.mna='watchlist';b.textContent='Watch List';
      side.insertBefore(b,alerts);
    }else if(investments&&b.previousElementSibling!==investments){
      side.insertBefore(b,alerts);
    }
    b.onclick=renderAccountWatch;
  }
  function renderAccountWatch(){
    const c=document.getElementById('mnaCanvas');if(!c)return;
    document.querySelectorAll('#movaNativeAccount [data-mna]').forEach(b=>b.classList.toggle('active',b.dataset.mna==='watchlist'));
    const list=watched(),all=assetsList();
    const rows=list.map(s=>{
      const a=all.find(x=>symbol(x.k)===s);
      return '<div class="mova-watch-account-row"><div><b>'+esc(s)+'</b><small>'+esc(a&&a.n||'Watched market')+'</small></div><button type="button" class="mova-watch-account-open" data-watch-open="'+esc(s)+'">Open</button></div>';
    }).join('');
    c.innerHTML='<span class="mna-kicker">WATCH LIST</span><h1>Your Watch List</h1><p class="mna-copy">Markets currently marked as Watching in MOVA.</p><div class="mova-watch-account-list">'+(rows||'<div class="mova-watch-empty">You are not watching any markets right now.</div>')+'</div>';
    c.querySelectorAll('[data-watch-open]').forEach(b=>b.onclick=()=>{
      const s=b.dataset.watchOpen;
      try{movaNACloseWorkspace()}catch(e){}
      try{if(typeof openAsset==='function')openAsset(s);else if(typeof openCompanyResearch==='function')openCompanyResearch(s)}catch(e){}
    });
  }
  function tickerRoot(){
    const buttons=[...document.querySelectorAll('button')].filter(x=>/^(Watchlist|Trending)$/i.test((x.textContent||'').trim())&&x.offsetParent!==null);
    const button=buttons.find(x=>/^Watchlist$/i.test((x.textContent||'').trim()));if(!button)return null;
    let best=button.parentElement;
    for(let p=button.parentElement,i=0;p&&p!==document.body&&i<7;p=p.parentElement,i++){
      const r=p.getBoundingClientRect(),t=p.innerText||'';
      if(/Trending/i.test(t)&&/Watchlist/i.test(t)&&r.height>35&&r.height<260&&r.width>window.innerWidth*.5)best=p;
    }
    return {root:best,button,trending:buttons.find(x=>/^Trending$/i.test((x.textContent||'').trim()))||null};
  }
  function isSelected(b){
    if(!b)return false;
    const cls=' '+String(b.className||'')+' ';
    return /\\b(active|selected|current|on|is-active|is-selected)\\b/i.test(cls)||b.getAttribute('aria-selected')==='true'||b.getAttribute('aria-pressed')==='true'||b.dataset.active==='true'||b.dataset.selected==='true';
  }
  function watchMode(hit){
    try{const saved=sessionStorage.getItem(MODE_KEY);if(saved==='watchlist'||saved==='trending')return saved==='watchlist'}catch(e){}
    if(isSelected(hit.button))return true;if(isSelected(hit.trending))return false;
    return false;
  }
  function cardSymbol(el){
    const text=' '+String(el.innerText||'').toUpperCase().replace(/[^A-Z0-9.\\-$% ]/g,' ')+' ';
    return assetsList().map(a=>symbol(a.k)).filter(Boolean).find(s=>text.includes(' '+s+' '))||'';
  }
  function syncTopTicker(){
    const hit=tickerRoot();if(!hit)return;
    const list=watched(),active=watchMode(hit);
    hit.root.querySelectorAll('[data-mova-watch-hidden="1"]').forEach(el=>{el.style.display=el.dataset.movaWatchPrevDisplay||'';delete el.dataset.movaWatchHidden;delete el.dataset.movaWatchPrevDisplay});
    if(!active)return;
    const candidates=[...hit.root.querySelectorAll('div,button,a')].filter(el=>{
      if(el===hit.button||el===hit.trending)return false;
      const r=el.getBoundingClientRect(),t=el.innerText||'';
      if(!/\\$\\s*[0-9]/.test(t)||r.height<24||r.height>120||r.width<60||r.width>460)return false;
      return ![...el.children].some(c=>/\\$\\s*[0-9]/.test(c.innerText||''));
    });
    candidates.forEach(el=>{
      const s=cardSymbol(el),show=s&&list.includes(s);
      if(!show){el.dataset.movaWatchPrevDisplay=el.style.display||'';el.dataset.movaWatchHidden='1';el.style.display='none'}
    });
    const status=[...hit.root.querySelectorAll('span,small,div')].find(el=>/^\\s*\\d+\\s+saved\\b/i.test((el.textContent||'').trim()));
    if(status)status.textContent=list.length+' saved · your actual Watchlist';
  }
  function refreshWatch(force){
    const list=watched();bridgeNative(list);
    const sig=list.slice().sort().join('|');
    if(force||sig!==watchSig){
      watchSig=sig;
      if(document.querySelector('#movaNativeAccount [data-mna="watchlist"].active'))renderAccountWatch();
    }
    fillHomeWatch();ensureAccountWatch();syncTopTicker();
  }
  function watchButtonIntent(text){
    const t=String(text||'').trim();
    if(/^Watchlist$/i.test(t))return null;
    if(/Remove from Watch\\s*List|Unwatch|^\\s*★?\\s*Watching\\s*$/i.test(t))return false;
    if(/Add to Watch\\s*List|^\\s*[☆★]?\\s*Watch\\s*$/i.test(t))return true;
    return null;
  }

  // ---------- News Top 10: one explicit delegated controller, no DOM rewrite loop ----------
  function controlText(el){return String(el&&((el.textContent||el.value||el.getAttribute('aria-label')))||'').trim()}
  function isTop10(el){return !!el&&/find\\s*top\\s*10/i.test(controlText(el))}
  function top10Controls(){return [...document.querySelectorAll('button,a,input[type="submit"],input[type="button"]')].filter(isTop10)}
  function visibleTop10(){return top10Controls().find(el=>el.offsetParent!==null)||top10Controls()[0]||null}
  function nearbyNewsInput(button){
    let n=button;
    for(let i=0;i<8&&n;i++,n=n.parentElement){
      const inputs=[...n.querySelectorAll('input')].filter(x=>x.type!=='hidden'&&x.id!=='headerSearch');
      const preferred=inputs.find(x=>/search a stock|company|ticker/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')));
      if(preferred)return preferred;
    }
    return [...document.querySelectorAll('input')].find(x=>x.offsetParent!==null&&x.id!=='headerSearch'&&/search a stock|company|ticker/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))||null;
  }
  function newsGrid(){
    return document.getElementById('newsGrid')||[...document.querySelectorAll('section,div')].find(x=>x.offsetParent!==null&&x.querySelector&&x.querySelector('.mna-news'))||null;
  }
  function resolveAsset(raw){
    const q=String(raw||'').trim().toLowerCase();if(!q)return null;
    const all=assetsList();
    return all.find(a=>String(a.k||'').toLowerCase()===q)
      ||all.find(a=>String(a.n||'').toLowerCase()===q)
      ||all.find(a=>String(a.k||'').toLowerCase().startsWith(q))
      ||all.find(a=>String(a.n||'').toLowerCase().startsWith(q))
      ||null;
  }
  function marketContext(a,q){
    if(!q)return'';
    const pct=Number(q.changePct||0),cls=pct>0?'up':pct<0?'down':'flat';
    const px=Number.isFinite(Number(q.priceNative))?'$'+Number(q.priceNative).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}):'';
    const mv=(pct>0?'+':'')+pct.toFixed(2)+'%';
    return '<div class="mova-news-context"><strong>'+esc(a.n)+' · '+esc(a.k)+'</strong><span>Current market position: <b class="'+cls+'">'+esc(px)+' · '+esc(mv)+'</b>. Stories below are ranked for company relevance, recency and likely market impact.</span></div>';
  }
  function stopEvent(e){if(!e)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}
  async function runTop10(button){
    if(newsBusy)return false;
    button=button||visibleTop10();
    const input=nearbyNewsInput(button),target=newsGrid();
    if(!input||!target)return false;
    const a=resolveAsset(input.value);
    if(!a){target.innerHTML='<div class="mova-news-search-status">Select a recognised MOVA company or ticker first.</div>';return false}
    newsBusy=true;
    const oldDisabled=('disabled'in button)?button.disabled:false;
    if(button&&'disabled'in button)button.disabled=true;
    input.value=String(a.k||'').toUpperCase();
    target.innerHTML='<div class="mova-news-search-status">Finding the 10 most relevant stories for '+esc(a.n)+'…</div>';
    try{
      const [nr,mr]=await Promise.all([
        fetch('/api/news?symbol='+encodeURIComponent(a.k)+'&name='+encodeURIComponent(a.n)+'&ts='+Date.now(),{cache:'no-store'}),
        fetch('/api/market?symbols='+encodeURIComponent(a.k)+'&ts='+Date.now(),{cache:'no-store'})
      ]);
      const nd=await nr.json().catch(()=>({})),md=await mr.json().catch(()=>({}));
      if(!nr.ok)throw new Error(nd.error||'News request failed');
      const items=(nd.items||[]).filter(x=>x&&x.url&&(x.title||x.headline)).slice(0,10),q=(md.assets||[])[0]||null;
      if(!items.length)throw new Error('No relevant stories returned');
      target.innerHTML=marketContext(a,q)+items.map((n,i)=>{
        const img=n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':'';
        return '<a class="mna-news" href="'+esc(n.url)+'" target="_blank" rel="noopener noreferrer">'+img+'<div class="mna-news-body"><span class="eyebrow"><span class="mova-news-rank">'+(i+1)+'</span>'+esc(n.source||'MARKET NEWS')+'</span><h3>'+esc(n.title||n.headline)+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="mna-news-meta">Open full article ↗</div></div></a>';
      }).join('');
    }catch(err){
      target.innerHTML='<div class="mova-news-search-status">Top stories could not be loaded right now. '+esc(err&&err.message||'Please try again shortly.')+'</div>';
    }finally{
      newsBusy=false;
      if(button&&'disabled'in button)button.disabled=oldDisabled;
    }
    return false;
  }
  function bindTop10Controls(){
    top10Controls().forEach(b=>{
      b.dataset.movaNewsTop10='1';
      b.removeAttribute('onclick');b.removeAttribute('href');b.removeAttribute('formaction');b.removeAttribute('target');
      if((b.tagName==='BUTTON'||b.tagName==='INPUT')&&b.type!=='button')b.type='button';
    });
  }

  window.movaNewsTop10Search=function(e){stopEvent(e);return runTop10(visibleTop10())};
  window.movaWatchlistRefresh=function(){refreshWatch(true)};

  document.addEventListener('click',e=>{
    const target=e.target.closest&&e.target.closest('button,a,input[type="submit"],input[type="button"]');
    if(target&&isTop10(target)){stopEvent(e);runTop10(target);return}
    if(!(target instanceof HTMLElement))return;
    const text=controlText(target),intent=watchButtonIntent(text),s=currentResearchSymbol();
    if(intent!==null&&s){
      // Record the user's intended state immediately; native handlers may still update their own UI.
      setWatching(s,intent);
      setTimeout(()=>refreshWatch(true),0);setTimeout(()=>refreshWatch(true),120);
    }
    if(/^Watchlist$/i.test(text)){try{sessionStorage.setItem(MODE_KEY,'watchlist')}catch(err){};[0,60,180,500].forEach(ms=>setTimeout(()=>syncTopTicker(),ms))}
    if(/^Trending$/i.test(text)){try{sessionStorage.setItem(MODE_KEY,'trending')}catch(err){};[0,60,180].forEach(ms=>setTimeout(()=>syncTopTicker(),ms))}
  },true);

  document.addEventListener('submit',e=>{
    const f=e.target;if(!(f instanceof HTMLFormElement))return;
    const b=[...f.querySelectorAll('button,a,input[type="submit"],input[type="button"]')].find(isTop10);
    if(!b)return;stopEvent(e);runTop10(b);
  },true);

  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return;
    const b=visibleTop10();if(!b)return;
    const input=nearbyNewsInput(b);if(e.target!==input)return;
    stopEvent(e);runTop10(b);
  },true);

  window.addEventListener('storage',e=>{if(e.key===WATCH_KEY)refreshWatch(true)});

  let refreshQueued=false;
  const mo=new MutationObserver(()=>{
    if(refreshQueued)return;refreshQueued=true;
    requestAnimationFrame(()=>{refreshQueued=false;bindTop10Controls();refreshWatch(false)});
  });
  function boot(){
    if(watchBooted)return;watchBooted=true;
    try{localStorage.removeItem(LEGACY_KEY)}catch(e){}
    watched();bindTop10Controls();refreshWatch(true);
    mo.observe(document.body,{subtree:true,childList:true});
    [250,700,1500,3000].forEach(ms=>setTimeout(()=>{bindTop10Controls();refreshWatch(true)},ms));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;

html = html.replace('</body>', runtime + '</body>');
writeFileSync(file, html);
console.log('MOVA preview follow-up: Watch List sync/account placement, News Top 10 controller, and live-scan colours fixed.');
