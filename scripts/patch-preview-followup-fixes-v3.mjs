import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

// v3 remains the single final owner for News Top 10 + Watch List.
html=html.replace(/<script id="mova-preview-followup-fixes-v2">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-live-news-loader-v1">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-news-top10-hardfix-v5">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-watchlist-sourcefix-v8">[\s\S]*?<\/script>/g,'');

// Bind the real News controls directly to this controller.
html=html.replace(/onclick="searchCompanyNews\(\)"/g,'onclick="return window.movaNewsTop10Search(event)"');
html=html.replace(/onclick="resetNews\(\)"/g,'onclick="return window.movaShowMarketNews(event)"');
html=html.replace(/onkeydown="if\(event\.key==='Enter'\)searchCompanyNews\(\)"/g,'onkeydown="if(event.key===\'Enter\'){event.preventDefault();return window.movaNewsTop10Search(event)}"');
html=html.replace(/onkeydown="if\(event\.key==='Enter'\)\{event\.preventDefault\(\);return window\.movaNewsTop10Search\(event\)\}"/g,'onkeydown="if(event.key===\'Enter\'){event.preventDefault();return window.movaNewsTop10Search(event)}"');

// Any later app call to renderNews is routed into the final controller once it is installed.
if(html.includes('function renderNews(){')&&!html.includes("function renderNews(){if(window.__movaNewsController)")){
  html=html.replace('function renderNews(){',"function renderNews(){if(window.__movaNewsController)return window.__movaNewsController('market');");
}

const runtime=`<script id="mova-preview-followup-fixes-v3">(function(){
  var WATCH_KEY='movaUnifiedWatchlistV2';
  var LEGACY_KEY='movaUnifiedWatchlistV1';
  var INIT_KEY='movaUnifiedWatchlistV2Initialised';
  var MODE_KEY='movaTickerModeV1';
  var watchSig='',watchQueued=false;
  var newsSeq=0,newsAbort=null;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function sym(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\\-]{1,16}$/.test(v)?v:''}
  function assetsList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}

  // ---------------- Watch List ----------------
  function collect(value,out){
    if(value==null)return;
    if(value instanceof Set){value.forEach(function(v){collect(v,out)});return}
    if(value instanceof Map){value.forEach(function(v,k){var s=sym(k);if(s&&v!==false&&v!==0)out.add(s)});return}
    if(Array.isArray(value)){value.forEach(function(v){collect(v,out)});return}
    if(typeof value==='string'){value.split(/[\\s,|]+/).forEach(function(v){var s=sym(v);if(s)out.add(s)});return}
    if(typeof value!=='object')return;
    var direct=sym(value.symbol||value.ticker||value.k||value.code||'');
    var explicit=value.watching;if(explicit==null)explicit=value.watched;if(explicit==null)explicit=value.inWatchlist;if(explicit==null)explicit=value.inWatchList;
    if(direct&&explicit!==false&&explicit!==0&&String(explicit).toLowerCase()!=='false'&&String(explicit).toLowerCase()!=='removed')out.add(direct);
    if(Array.isArray(value.symbols))collect(value.symbols,out);
    if(Array.isArray(value.watchlist))collect(value.watchlist,out);
    if(Array.isArray(value.watchList))collect(value.watchList,out);
    Object.keys(value).forEach(function(k){var s=sym(k),v=value[k],t=String(v).toLowerCase();if(s&&(v===true||v===1||t==='watching'||t==='watched'||t==='active'||t==='true'))out.add(s)});
  }
  function parseRaw(raw){var out=new Set();if(!raw)return out;try{collect(JSON.parse(raw),out)}catch(e){collect(raw,out)}return out}
  function readCanonical(){try{var v=JSON.parse(localStorage.getItem(WATCH_KEY)||'null');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):null}catch(e){return null}}
  function isInitialised(){try{return localStorage.getItem(INIT_KEY)==='1'}catch(e){return false}}
  function bridgeCollection(value,list){try{if(value instanceof Set){value.clear();list.forEach(function(s){value.add(s)});return}if(value instanceof Map){var vals=Array.from(value.values());if(!vals.length||vals.every(function(v){return typeof v==='boolean'||v===0||v===1})){value.clear();list.forEach(function(s){value.set(s,true)})}return}if(Array.isArray(value)&&(value.length===0||value.every(function(v){return typeof v==='string'})))value.splice.apply(value,[0,value.length].concat(list))}catch(e){}}
  function mirrorNative(list){try{if(typeof watchlist!=='undefined')bridgeCollection(watchlist,list)}catch(e){}try{if(typeof watchList!=='undefined')bridgeCollection(watchList,list)}catch(e){}try{if(typeof watchedAssets!=='undefined')bridgeCollection(watchedAssets,list)}catch(e){}}
  function writeWatch(list){
    var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));
    try{localStorage.setItem(WATCH_KEY,JSON.stringify(clean));localStorage.setItem(LEGACY_KEY,JSON.stringify(clean));localStorage.setItem(INIT_KEY,'1')}catch(e){}
    mirrorNative(clean);return clean;
  }
  function discoverSavedOnce(){
    var out=new Set();
    try{var legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(Array.isArray(legacy))collect(legacy,out)}catch(e){}
    try{if(typeof watchlist!=='undefined')collect(watchlist,out)}catch(e){}
    try{if(typeof watchList!=='undefined')collect(watchList,out)}catch(e){}
    try{if(typeof watchedAssets!=='undefined')collect(watchedAssets,out)}catch(e){}
    try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i)||'';if(k===WATCH_KEY||k===LEGACY_KEY||k===INIT_KEY||/alert|setting|pref|notification/i.test(k)||!/watch|fav|follow|track/i.test(k))continue;parseRaw(localStorage.getItem(k)).forEach(function(s){out.add(s)})}}catch(e){}
    return Array.from(out);
  }
  function tickerRoot(){
    var buttons=Array.from(document.querySelectorAll('button')).filter(function(x){return /^(Watchlist|Trending)$/i.test((x.textContent||'').trim())&&x.offsetParent!==null});
    var button=buttons.find(function(x){return /^Watchlist$/i.test((x.textContent||'').trim())});if(!button)return null;
    var best=button.parentElement,p=button.parentElement;
    for(var i=0;p&&p!==document.body&&i<7;p=p.parentElement,i++){var r=p.getBoundingClientRect(),t=p.innerText||'';if(/Trending/i.test(t)&&/Watchlist/i.test(t)&&r.height>35&&r.height<300&&r.width>window.innerWidth*.5)best=p}
    return {root:best,button:button,trending:buttons.find(function(x){return /^Trending$/i.test((x.textContent||'').trim())})||null};
  }
  function selected(b){if(!b)return false;var cls=' '+String(b.className||'')+' ';return /\\b(active|selected|current|on|is-active|is-selected)\\b/i.test(cls)||b.getAttribute('aria-selected')==='true'||b.getAttribute('aria-pressed')==='true'||b.dataset.active==='true'||b.dataset.selected==='true'}
  function watchMode(hit){try{var m=sessionStorage.getItem(MODE_KEY);if(m==='watchlist'||m==='trending')return m==='watchlist'}catch(e){}if(selected(hit&&hit.button))return true;if(selected(hit&&hit.trending))return false;return false}
  function cardSymbol(el){
    var text=' '+String(el&&el.innerText||'').toUpperCase().replace(/[^A-Z0-9.\\-$% ]/g,' ')+' ',aa=assetsList();
    var found=aa.find(function(a){var s=sym(a.k);return s&&text.indexOf(' '+s+' ')>=0});if(found)return sym(found.k);
    var first=String(el&&el.innerText||'').split(/\\n+/).map(function(x){return x.trim()}).find(function(x){return x&&!/[$£€]\\s*[0-9]/.test(x)&&!/%/.test(x)})||'';
    found=aa.find(function(a){return String(a.n||'').toLowerCase()===first.toLowerCase()});return found?sym(found.k):'';
  }
  function visibleTickerWatch(){
    var hit=tickerRoot();if(!hit||!watchMode(hit))return [];
    var out=new Set(),price=/[$£€]\\s*[0-9]/;
    Array.from(hit.root.querySelectorAll('div,button,a')).forEach(function(el){if(el===hit.button||el===hit.trending)return;var r=el.getBoundingClientRect(),t=el.innerText||'';if(!price.test(t)||r.height<22||r.height>145||r.width<50||r.width>520)return;if(Array.from(el.children).some(function(c){return price.test(c.innerText||'')}))return;var s=cardSymbol(el);if(s)out.add(s)});
    return Array.from(out);
  }
  function bootstrapWatch(){
    var c=readCanonical();if(isInitialised())return c||[];
    if(c&&c.length)return writeWatch(c);
    var visible=visibleTickerWatch();if(visible.length)return writeWatch(visible);
    var saved=discoverSavedOnce();return writeWatch(saved);
  }
  function watched(){if(!isInitialised())return bootstrapWatch();var c=readCanonical();return c||[]}
  function currentTicker(){try{if(typeof activeResearchTicker!=='undefined'&&sym(activeResearchTicker))return sym(activeResearchTicker)}catch(e){}try{var ss=sym(sessionStorage.getItem('movaCurrentCompanyV1'));if(ss)return ss}catch(e){}var m=String(location.hash||'').match(/#company=([A-Z0-9.\\-]+)/i);if(m)return sym(m[1]);var e=document.getElementById('crEyebrow');if(e){var q=String(e.textContent||'').match(/·\\s*([A-Z0-9.\\-]+)\\s*$/i);if(q)return sym(q[1])}return ''}
  function setWatch(ticker,on){ticker=sym(ticker);if(!ticker)return;var list=watched().filter(function(x){return x!==ticker});if(on)list.push(ticker);writeWatch(list);refreshWatch(true)}

  function ensureAccountWatch(){var side=document.querySelector('#movaNativeAccount .mna-side');if(!side)return;var alerts=side.querySelector('[data-mna="alerts"]'),investments=side.querySelector('[data-mna="investments"]');if(!alerts)return;var b=side.querySelector('[data-mna="watchlist"]');if(!b){b=document.createElement('button');b.type='button';b.className='mna-nav';b.dataset.mna='watchlist';b.textContent='Watch List';side.insertBefore(b,alerts)}else if(investments&&b.previousElementSibling!==investments)side.insertBefore(b,alerts);b.onclick=renderAccountWatch}
  function renderAccountWatch(){var c=document.getElementById('mnaCanvas');if(!c)return;document.querySelectorAll('#movaNativeAccount [data-mna]').forEach(function(b){b.classList.toggle('active',b.dataset.mna==='watchlist')});var list=watched(),aa=assetsList();var rows=list.map(function(s){var a=aa.find(function(x){return sym(x.k)===s});return '<div class="mova-watch-account-row"><div><b>'+esc(s)+'</b><small>'+esc(a&&a.n||'Watched market')+'</small></div><button type="button" class="mova-watch-account-open" data-watch-open="'+esc(s)+'">Open</button></div>'}).join('');c.innerHTML='<span class="mna-kicker">WATCH LIST</span><h1>Your Watch List</h1><p class="mna-copy">Markets you have saved as Watching across MOVA.</p><div class="mova-watch-account-list">'+(rows||'<div class="mova-watch-empty">You are not watching any markets right now.</div>')+'</div>';c.querySelectorAll('[data-watch-open]').forEach(function(b){b.onclick=function(){var s=b.dataset.watchOpen;try{movaNACloseWorkspace()}catch(e){};try{if(typeof openAsset==='function')openAsset(s);else if(typeof openCompanyResearch==='function')openCompanyResearch(s)}catch(e){}}})}
  function homeWatchSelect(){return Array.from(document.querySelectorAll('select')).find(function(sel){var n=sel;for(var i=0;i<7&&n;i++,n=n.parentElement){if(/YOUR WATCHED STOCKS\\s*&\\s*MARKETS|WATCH LIST/i.test(n.textContent||''))return true}return false})||null}
  function fillHomeWatch(){var sel=homeWatchSelect();if(!sel)return;var list=watched(),aa=assetsList(),cur=sym(sel.value),sig=list.join('|');if(sel.dataset.movaWatchV3===sig)return;sel.dataset.movaWatchV3=sig;sel.innerHTML='';var p=document.createElement('option');p.value='';p.textContent=list.length?'Select a watched market':'No watched markets yet';sel.appendChild(p);list.forEach(function(s){var a=aa.find(function(x){return sym(x.k)===s}),o=document.createElement('option');o.value=s;o.textContent=(a&&a.n?a.n:s)+' · '+s;sel.appendChild(o)});if(list.includes(cur))sel.value=cur}
  function syncTopTicker(){var hit=tickerRoot();if(!hit)return;var list=watched(),active=watchMode(hit);hit.root.querySelectorAll('[data-mova-watch-hidden="1"]').forEach(function(el){el.style.display=el.dataset.movaWatchPrevDisplay||'';delete el.dataset.movaWatchHidden;delete el.dataset.movaWatchPrevDisplay});if(!active)return;var price=/[$£€]\\s*[0-9]/;Array.from(hit.root.querySelectorAll('div,button,a')).forEach(function(el){if(el===hit.button||el===hit.trending)return;var r=el.getBoundingClientRect(),t=el.innerText||'';if(!price.test(t)||r.height<22||r.height>145||r.width<50||r.width>520)return;if(Array.from(el.children).some(function(c){return price.test(c.innerText||'')}))return;var s=cardSymbol(el);if(!s||!list.includes(s)){el.dataset.movaWatchPrevDisplay=el.style.display||'';el.dataset.movaWatchHidden='1';el.style.display='none'}})}
  function syncCompanyButton(){var t=currentTicker();if(!t)return;var list=watched();document.querySelectorAll('button').forEach(function(btn){var text=(btn.textContent||'').trim();if(/^Watching$/i.test(text)||/Remove from Watch\\s*List/i.test(text)){if(!list.includes(t))btn.textContent=text.replace(/Watching/i,'Watch').replace(/Remove from Watch\\s*List/i,'Add to Watch List')}else if(/^Watch$/i.test(text)||/Add to Watch\\s*List/i.test(text)){if(list.includes(t))btn.textContent=text.replace(/^Watch$/i,'Watching').replace(/Add to Watch\\s*List/i,'Remove from Watch List')}})}
  function refreshWatch(force){var list=watched();mirrorNative(list);var sig=list.slice().sort().join('|');if(force||sig!==watchSig){watchSig=sig;var b=document.querySelector('#movaNativeAccount [data-mna="watchlist"]');if(b&&b.classList.contains('active'))renderAccountWatch()}ensureAccountWatch();fillHomeWatch();syncTopTicker();syncCompanyButton()}

  // ---------------- News: one request owner ----------------
  function newsInput(){return document.getElementById('newsSearchInput')}
  function newsGrid(){return document.getElementById('newsGrid')}
  function newsButton(){return Array.from(document.querySelectorAll('button')).find(function(b){return /find\\s*top\\s*10/i.test((b.textContent||'').trim())})||null}
  function resolveNews(raw){var q=String(raw||'').trim();if(!q)return null;var aa=assetsList(),low=q.toLowerCase();var a=aa.find(function(x){return String(x.k||'').toLowerCase()===low})||aa.find(function(x){return String(x.n||'').toLowerCase()===low})||aa.find(function(x){return String(x.k||'').toLowerCase().indexOf(low)===0})||aa.find(function(x){return String(x.n||'').toLowerCase().indexOf(low)===0});if(a)return {symbol:sym(a.k),name:String(a.n||a.k||q)};var direct=sym(q);if(direct)return {symbol:direct,name:direct};return null}
  function startNews(){newsSeq++;if(newsAbort){try{newsAbort.abort()}catch(e){}}newsAbort=typeof AbortController!=='undefined'?new AbortController():null;return {seq:newsSeq,signal:newsAbort&&newsAbort.signal}}
  function currentNews(req){return req.seq===newsSeq}
  function cards(items,company){var head=company?'<div class="mova-news-context"><strong>'+esc(company.name)+' · '+esc(company.symbol)+'</strong><span>Top '+items.length+' company stories ranked by relevance and recency.</span></div>':'';return head+items.map(function(n,i){var img=n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':'';return '<a class="mna-news" href="'+esc(n.url)+'" target="_blank" rel="noopener noreferrer">'+img+'<div class="mna-news-body"><span class="eyebrow">'+(company?'<span class="mova-news-rank">'+(i+1)+'</span>':'')+esc(n.source||'MARKET NEWS')+'</span><h3>'+esc(n.title||n.headline)+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="mna-news-meta">Open full article ↗</div></div></a>'}).join('')}
  async function runCompanyNews(){
    var input=newsInput(),grid=newsGrid();if(!input||!grid)return false;var company=resolveNews(input.value);if(!company){grid.innerHTML='<div class="mova-news-search-status">Enter or choose a recognised ticker, for example AMD, AAPL or NVDA.</div>';return false}
    var req=startNews(),btn=newsButton();input.value=company.symbol;if(btn)btn.disabled=true;grid.innerHTML='<div class="mova-news-search-status">Finding the 10 most relevant stories for '+esc(company.name)+'…</div>';
    try{var opts={cache:'no-store'};if(req.signal)opts.signal=req.signal;var r=await fetch('/api/news?symbol='+encodeURIComponent(company.symbol)+'&name='+encodeURIComponent(company.name)+'&ts='+Date.now(),opts);var d=await r.json().catch(function(){return {}});if(!currentNews(req))return false;if(!r.ok)throw new Error(d.error||'News request failed');var items=(d.items||[]).filter(function(x){return x&&x.url&&(x.title||x.headline)}).slice(0,10);if(!items.length)throw new Error('No relevant stories returned');grid.innerHTML=cards(items,company)}catch(err){if(!currentNews(req)||err&&err.name==='AbortError')return false;grid.innerHTML='<div class="mova-news-search-status">Top stories could not be loaded. '+esc(err&&err.message||'Please try again.')+'</div>'}finally{if(currentNews(req)&&btn)btn.disabled=false}return false;
  }
  async function runMarketNews(){
    var grid=newsGrid();if(!grid)return false;var req=startNews(),input=newsInput();if(input)input.value='';grid.innerHTML='<div class="mova-news-search-status">Loading latest market stories…</div>';
    try{var opts={cache:'no-store'};if(req.signal)opts.signal=req.signal;var r=await fetch('/api/news?ts='+Date.now(),opts);var d=await r.json().catch(function(){return {}});if(!currentNews(req))return false;if(!r.ok)throw new Error(d.error||'News request failed');var items=(d.items||[]).filter(function(x){return x&&x.url&&(x.title||x.headline)}).slice(0,10);if(!items.length)throw new Error('No market stories returned');grid.innerHTML=cards(items,null)}catch(err){if(!currentNews(req)||err&&err.name==='AbortError')return false;grid.innerHTML='<div class="mova-news-search-status">Latest market stories could not be loaded. '+esc(err&&err.message||'Please try again.')+'</div>'}return false;
  }
  window.__movaNewsController=function(mode){return mode==='market'?runMarketNews():false};
  window.movaNewsTop10Search=function(e){if(e){e.preventDefault();e.stopPropagation()}return runCompanyNews()};
  window.searchCompanyNews=function(){return runCompanyNews()};
  window.movaShowMarketNews=function(e){if(e){e.preventDefault();e.stopPropagation()}return runMarketNews()};
  window.resetNews=function(){return runMarketNews()};
  window.movaLoadLiveNews=function(){return runMarketNews()};
  window.movaWatchlistRefresh=function(){refreshWatch(true)};

  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var text=String(b.textContent||'').trim();if(/^Watchlist$/i.test(text)){try{sessionStorage.setItem(MODE_KEY,'watchlist')}catch(x){};setTimeout(function(){refreshWatch(true)},0);return}if(/^Trending$/i.test(text)){try{sessionStorage.setItem(MODE_KEY,'trending')}catch(x){};setTimeout(function(){refreshWatch(true)},0)}},true);
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var text=String(b.textContent||'').trim(),t=currentTicker(),on=null;if(/Add to Watch\\s*List|^Watch$/i.test(text))on=true;else if(/Remove from Watch\\s*List|^Watching$/i.test(text))on=false;else return;if(!t)return;e.__movaWatch={ticker:t,on:on}},true);
  document.addEventListener('click',function(e){if(e.__movaWatch){var x=e.__movaWatch;setTimeout(function(){setWatch(x.ticker,x.on)},0)}},false);
  window.addEventListener('storage',function(e){if(e.key===WATCH_KEY)refreshWatch(true)});
  var mo=new MutationObserver(function(){if(watchQueued)return;watchQueued=true;requestAnimationFrame(function(){watchQueued=false;refreshWatch(false)})});
  function boot(){bootstrapWatch();refreshWatch(true);mo.observe(document.body,{subtree:true,childList:true});[250,800,1800].forEach(function(ms){setTimeout(function(){refreshWatch(true)},ms)});var p=document.getElementById('news');if(p&&p.classList.contains('active'))runMarketNews()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;

if(!html.includes('</body>'))throw new Error('v3 follow-up: </body> not found');
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA preview follow-up v3: authoritative Watch List + single News controller installed.');
