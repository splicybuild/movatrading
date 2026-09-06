import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

// One final owner for News and Watch List.
html=html.replace(/<script id="mova-preview-followup-fixes-v3">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-live-news-loader-v1">[\s\S]*?<\/script>/g,'');

// Bind the real News controls directly to the final controller.
html=html.replace(/onclick="return window\.movaNewsTop10Search\(event\)"/g,'onclick="return window.movaNewsTop10Search(event)"');
html=html.replace(/onclick="resetNews\(\)"/g,'onclick="return window.movaShowMarketNews(event)"');
html=html.replace(/onkeydown="if\(event\.key==='Enter'\)\{event\.preventDefault\(\);return window\.movaNewsTop10Search\(event\)\}"/g,'onkeydown="if(event.key===\'Enter\'){event.preventDefault();return window.movaNewsTop10Search(event)}"');

const runtime=`<script id="mova-preview-followup-fixes-v4">(function(){
  var WATCH_KEY='movaUnifiedWatchlistV2';
  var LEGACY_KEY='movaUnifiedWatchlistV1';
  var INIT_KEY='movaUnifiedWatchlistV2Initialised';
  var MODE_KEY='movaTickerModeV1';
  var watchSig='',watchQueued=false;
  var newsSeq=0,newsAbort=null,newsMode='market',newsHtml='',newsWriting=false;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function sym(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\\-]{1,16}$/.test(v)?v:''}
  function norm(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim()}
  function assetsList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}

  // ---------------- Watch List ----------------
  function readWatch(){try{var v=JSON.parse(localStorage.getItem(WATCH_KEY)||'null');return Array.isArray(v)?Array.from(new Set(v.map(sym).filter(Boolean))):null}catch(e){return null}}
  function initialised(){try{return localStorage.getItem(INIT_KEY)==='1'}catch(e){return false}}
  function parseLegacy(){
    var out=[];try{var v=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(Array.isArray(v))out=v.map(sym).filter(Boolean)}catch(e){}
    return Array.from(new Set(out));
  }
  function bridgeCollection(value,list){
    try{
      if(value instanceof Set){value.clear();list.forEach(function(s){value.add(s)});return}
      if(value instanceof Map){var vals=Array.from(value.values());if(!vals.length||vals.every(function(v){return typeof v==='boolean'||v===0||v===1})){value.clear();list.forEach(function(s){value.set(s,true)})}return}
      if(Array.isArray(value)&&(value.length===0||value.every(function(v){return typeof v==='string'}))){value.splice.apply(value,[0,value.length].concat(list))}
    }catch(e){}
  }
  function mirrorNative(list){
    try{if(typeof watchlist!=='undefined')bridgeCollection(watchlist,list)}catch(e){}
    try{if(typeof watchList!=='undefined')bridgeCollection(watchList,list)}catch(e){}
    try{if(typeof watchedAssets!=='undefined')bridgeCollection(watchedAssets,list)}catch(e){}
  }
  function saveWatch(list,mark){
    var clean=Array.from(new Set((list||[]).map(sym).filter(Boolean)));
    try{localStorage.setItem(WATCH_KEY,JSON.stringify(clean));if(mark!==false)localStorage.setItem(INIT_KEY,'1')}catch(e){}
    mirrorNative(clean);return clean;
  }
  function currentTicker(){
    try{if(typeof activeResearchTicker!=='undefined'&&sym(activeResearchTicker))return sym(activeResearchTicker)}catch(e){}
    try{var saved=sym(sessionStorage.getItem('movaCurrentCompanyV1'));if(saved)return saved}catch(e){}
    var m=String(location.hash||'').match(/#company=([A-Z0-9.\\-]+)/i);if(m)return sym(m[1]);
    var e=document.getElementById('crEyebrow');if(e){var q=String(e.textContent||'').match(/·\\s*([A-Z0-9.\\-]+)\\s*$/i);if(q)return sym(q[1])}
    return '';
  }
  function selected(b){if(!b)return false;var cls=' '+String(b.className||'')+' ';return /\\b(active|selected|current|on|is-active|is-selected)\\b/i.test(cls)||b.getAttribute('aria-selected')==='true'||b.getAttribute('aria-pressed')==='true'||b.dataset.active==='true'||b.dataset.selected==='true'}
  function tickerHit(){
    var buttons=Array.from(document.querySelectorAll('button')).filter(function(x){return /^(Watchlist|Trending)$/i.test((x.textContent||'').trim())&&x.offsetParent!==null});
    var watch=buttons.find(function(x){return /^Watchlist$/i.test((x.textContent||'').trim())});if(!watch)return null;
    var trend=buttons.find(function(x){return /^Trending$/i.test((x.textContent||'').trim())})||null,best=watch.parentElement,p=watch.parentElement;
    for(var i=0;p&&p!==document.body&&i<7;p=p.parentElement,i++){var r=p.getBoundingClientRect(),t=p.innerText||'';if(/Trending/i.test(t)&&/Watchlist/i.test(t)&&r.height>35&&r.height<300&&r.width>window.innerWidth*.5)best=p}
    return {root:best,watch:watch,trend:trend};
  }
  function watchMode(hit){
    try{var m=sessionStorage.getItem(MODE_KEY);if(m==='watchlist'||m==='trending')return m==='watchlist'}catch(e){}
    if(selected(hit&&hit.watch))return true;if(selected(hit&&hit.trend))return false;return false;
  }
  function symbolFromCard(el){
    if(!el)return '';
    var data=sym(el.dataset&& (el.dataset.symbol||el.dataset.ticker||el.dataset.asset||el.dataset.key));if(data)return data;
    var aa=assetsList(),raw=String(el.innerText||''),lines=raw.split(/\\n+/).map(function(x){return x.trim()}).filter(Boolean);
    var label=lines.find(function(x){return !/[$£€]\\s*[0-9]/.test(x)&&!/%/.test(x)&&!/^(LIVE|Trending|Watchlist)$/i.test(x)})||'';
    var nl=norm(label),all=norm(raw);
    var exact=aa.find(function(a){return norm(a.k)===nl||norm(a.n)===nl});if(exact)return sym(exact.k);
    var contains=aa.find(function(a){var k=norm(a.k),n=norm(a.n);return (k&&new RegExp('(^| )'+k+'( |$)').test(all))||(n&&nl&&(n.indexOf(nl)>=0||nl.indexOf(n)>=0))});
    return contains?sym(contains.k):'';
  }
  function tickerCards(hit){
    if(!hit||!watchMode(hit))return [];
    var out=new Set(),price=/[$£€]\\s*[0-9]/;
    Array.from(hit.root.querySelectorAll('div,button,a')).forEach(function(el){
      if(el===hit.watch||el===hit.trend||el.dataset.movaWatchHidden==='1')return;
      var r=el.getBoundingClientRect(),t=el.innerText||'';
      if(!price.test(t)||r.height<22||r.height>145||r.width<50||r.width>520)return;
      if(Array.from(el.children).some(function(c){return price.test(c.innerText||'')}))return;
      var s=symbolFromCard(el);if(s)out.add(s);
    });
    return Array.from(out);
  }
  function bootstrapWatch(){
    var current=readWatch();
    if(current&&current.length){if(!initialised()){try{localStorage.setItem(INIT_KEY,'1')}catch(e){}}return current}
    if(initialised())return current||[];
    var legacy=parseLegacy();if(legacy.length)return saveWatch(legacy,true);
    var cards=tickerCards(tickerHit());if(cards.length)return saveWatch(cards,true);
    return current||[];
  }
  function watched(){var list=readWatch();if(!list||(!list.length&&!initialised()))list=bootstrapWatch();return list||[]}
  function setWatch(ticker,on){ticker=sym(ticker);if(!ticker)return;var list=watched().filter(function(x){return x!==ticker});if(on)list.push(ticker);saveWatch(list,true);refreshWatch(true)}
  function homeWatchSelect(){return Array.from(document.querySelectorAll('select')).find(function(sel){var n=sel;for(var i=0;i<7&&n;i++,n=n.parentElement){if(/YOUR WATCHED STOCKS\\s*&\\s*MARKETS|WATCH LIST/i.test(n.textContent||''))return true}return false})||null}
  function fillHomeWatch(){
    var sel=homeWatchSelect();if(!sel)return;var list=watched(),aa=assetsList(),cur=sym(sel.value),sig=list.join('|');if(sel.dataset.movaWatchV4===sig)return;
    sel.dataset.movaWatchV4=sig;sel.innerHTML='';var p=document.createElement('option');p.value='';p.textContent=list.length?'Select a watched market':'No watched markets yet';sel.appendChild(p);
    list.forEach(function(s){var a=aa.find(function(x){return sym(x.k)===s}),o=document.createElement('option');o.value=s;o.textContent=(a&&a.n?a.n:s)+' · '+s;sel.appendChild(o)});if(list.includes(cur))sel.value=cur;
  }
  function ensureAccountWatch(){
    var side=document.querySelector('#movaNativeAccount .mna-side');if(!side)return;var alerts=side.querySelector('[data-mna="alerts"]'),invest=side.querySelector('[data-mna="investments"]');if(!alerts)return;
    var b=side.querySelector('[data-mna="watchlist"]');if(!b){b=document.createElement('button');b.type='button';b.className='mna-nav';b.dataset.mna='watchlist';b.textContent='Watch List';side.insertBefore(b,alerts)}else if(invest&&b.previousElementSibling!==invest)side.insertBefore(b,alerts);b.onclick=renderAccountWatch;
  }
  function renderAccountWatch(){
    var c=document.getElementById('mnaCanvas');if(!c)return;document.querySelectorAll('#movaNativeAccount [data-mna]').forEach(function(b){b.classList.toggle('active',b.dataset.mna==='watchlist')});
    var list=watched(),aa=assetsList(),rows=list.map(function(s){var a=aa.find(function(x){return sym(x.k)===s});return '<div class="mova-watch-account-row"><div><b>'+esc(s)+'</b><small>'+esc(a&&a.n||'Watched market')+'</small></div><button type="button" class="mova-watch-account-open" data-watch-open="'+esc(s)+'">Open</button></div>'}).join('');
    c.innerHTML='<span class="mna-kicker">WATCH LIST</span><h1>Your Watch List</h1><p class="mna-copy">Markets you have saved as Watching across MOVA.</p><div class="mova-watch-account-list">'+(rows||'<div class="mova-watch-empty">You are not watching any markets right now.</div>')+'</div>';
    c.querySelectorAll('[data-watch-open]').forEach(function(b){b.onclick=function(){var s=b.dataset.watchOpen;try{movaNACloseWorkspace()}catch(e){};try{if(typeof openAsset==='function')openAsset(s);else if(typeof openCompanyResearch==='function')openCompanyResearch(s)}catch(e){}}});
  }
  function syncTopTicker(){
    var hit=tickerHit();if(!hit)return;var list=watched(),active=watchMode(hit);hit.root.querySelectorAll('[data-mova-watch-hidden="1"]').forEach(function(el){el.style.display=el.dataset.movaWatchPrevDisplay||'';delete el.dataset.movaWatchHidden;delete el.dataset.movaWatchPrevDisplay});
    if(!active||(!initialised()&&!list.length))return;
    var price=/[$£€]\\s*[0-9]/;
    Array.from(hit.root.querySelectorAll('div,button,a')).forEach(function(el){if(el===hit.watch||el===hit.trend)return;var r=el.getBoundingClientRect(),t=el.innerText||'';if(!price.test(t)||r.height<22||r.height>145||r.width<50||r.width>520)return;if(Array.from(el.children).some(function(c){return price.test(c.innerText||'')}))return;var s=symbolFromCard(el);if(!s||!list.includes(s)){el.dataset.movaWatchPrevDisplay=el.style.display||'';el.dataset.movaWatchHidden='1';el.style.display='none'}});
  }
  function syncCompanyWatchButton(){var t=currentTicker();if(!t)return;var list=watched();document.querySelectorAll('button').forEach(function(btn){var text=(btn.textContent||'').trim();if(/^Watching$/i.test(text)||/Remove from Watch\\s*List/i.test(text)){if(!list.includes(t))btn.textContent=text.replace(/Watching/i,'Watch').replace(/Remove from Watch\\s*List/i,'Add to Watch List')}else if(/^Watch$/i.test(text)||/Add to Watch\\s*List/i.test(text)){if(list.includes(t))btn.textContent=text.replace(/^Watch$/i,'Watching').replace(/Add to Watch\\s*List/i,'Remove from Watch List')}})}
  function refreshWatch(force){var list=watched();mirrorNative(list);var sig=list.slice().sort().join('|');if(force||sig!==watchSig){watchSig=sig;var b=document.querySelector('#movaNativeAccount [data-mna="watchlist"]');if(b&&b.classList.contains('active'))renderAccountWatch()}ensureAccountWatch();fillHomeWatch();syncTopTicker();syncCompanyWatchButton()}

  // ---------------- News: one controller, no competing market reload ----------------
  function newsInput(){return document.getElementById('newsSearchInput')}
  function newsGrid(){return document.getElementById('newsGrid')}
  function newsButton(){return Array.from(document.querySelectorAll('button')).find(function(b){return /find\\s*top\\s*10/i.test((b.textContent||'').trim())})||null}
  function resolveNews(raw){
    var q=String(raw||'').trim();if(!q)return null;var aa=assetsList(),low=q.toLowerCase();
    var a=aa.find(function(x){return String(x.k||'').toLowerCase()===low})||aa.find(function(x){return String(x.n||'').toLowerCase()===low})||aa.find(function(x){return String(x.k||'').toLowerCase().indexOf(low)===0})||aa.find(function(x){return String(x.n||'').toLowerCase().indexOf(low)===0});
    if(a)return {symbol:sym(a.k),name:String(a.n||a.k||q)};var direct=sym(q);if(direct)return {symbol:direct,name:direct};return null;
  }
  function renderNewsHtml(htmlText){var grid=newsGrid();if(!grid)return;newsWriting=true;grid.innerHTML=htmlText;requestAnimationFrame(function(){newsWriting=false})}
  function cardsHtml(items,company){
    var head=company?'<div class="mova-news-context"><strong>'+esc(company.name)+' · '+esc(company.symbol)+'</strong><span>Top '+items.length+' company stories ranked by relevance and recency.</span></div>':'';
    return head+items.map(function(n,i){var img=n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':'';return '<a class="mna-news" href="'+esc(n.url)+'" target="_blank" rel="noopener noreferrer">'+img+'<div class="mna-news-body"><span class="eyebrow">'+(company?'<span class="mova-news-rank">'+(i+1)+'</span>':'')+esc(n.source||'MARKET NEWS')+'</span><h3>'+esc(n.title||n.headline)+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="mna-news-meta">Open full article ↗</div></div></a>'}).join('');
  }
  function cancelNews(){newsSeq++;if(newsAbort){try{newsAbort.abort()}catch(e){};newsAbort=null}return newsSeq}
  async function loadCompany(){
    var input=newsInput(),grid=newsGrid();if(!input||!grid)return false;var company=resolveNews(input.value);if(!company){renderNewsHtml('<div class="mova-news-search-status">Enter or choose a recognised ticker, for example AMD, AAPL or NVDA.</div>');return false}
    var seq=cancelNews();newsMode='company';newsHtml='';newsAbort=typeof AbortController!=='undefined'?new AbortController():null;var btn=newsButton();if(btn)btn.disabled=true;input.value=company.symbol;renderNewsHtml('<div class="mova-news-search-status">Finding the 10 most relevant stories for '+esc(company.name)+'…</div>');
    try{var r=await fetch('/api/news?symbol='+encodeURIComponent(company.symbol)+'&name='+encodeURIComponent(company.name)+'&ts='+Date.now(),{cache:'no-store',signal:newsAbort&&newsAbort.signal});var d=await r.json().catch(function(){return {}});if(seq!==newsSeq)return false;if(!r.ok)throw new Error(d.error||'News request failed');var items=(d.items||[]).filter(function(x){return x&&x.url&&(x.title||x.headline)}).slice(0,10);if(!items.length)throw new Error('No relevant stories returned');newsHtml=cardsHtml(items,company);renderNewsHtml(newsHtml)}catch(err){if(seq!==newsSeq)return false;if(err&&err.name==='AbortError')return false;newsHtml='<div class="mova-news-search-status">Top stories could not be loaded. '+esc(err&&err.message||'Please try again.')+'</div>';renderNewsHtml(newsHtml)}finally{if(seq===newsSeq&&btn)btn.disabled=false}return false;
  }
  async function loadMarket(force){
    var grid=newsGrid();if(!grid)return false;var seq=cancelNews();newsMode='market';newsHtml='';newsAbort=typeof AbortController!=='undefined'?new AbortController():null;var input=newsInput();if(input&&force)input.value='';renderNewsHtml('<div class="mova-news-search-status">Loading latest market stories…</div>');
    try{var r=await fetch('/api/news?ts='+Date.now(),{cache:'no-store',signal:newsAbort&&newsAbort.signal});var d=await r.json().catch(function(){return {}});if(seq!==newsSeq)return false;if(!r.ok)throw new Error(d.error||'News request failed');var items=(d.items||[]).filter(function(x){return x&&x.url&&(x.title||x.headline)}).slice(0,10);if(!items.length)throw new Error('No market stories returned');newsHtml=cardsHtml(items,null);renderNewsHtml(newsHtml)}catch(err){if(seq!==newsSeq)return false;if(err&&err.name==='AbortError')return false;newsHtml='<div class="mova-news-search-status">Latest market stories could not be loaded. '+esc(err&&err.message||'Please try again.')+'</div>';renderNewsHtml(newsHtml)}return false;
  }
  window.movaNewsTop10Search=function(e){if(e){e.preventDefault();e.stopPropagation()}return loadCompany()};
  window.movaShowMarketNews=function(e){if(e){e.preventDefault();e.stopPropagation()}return loadMarket(true)};
  window.movaRenderNewsFinal=function(){if(newsMode==='company'&&newsHtml){renderNewsHtml(newsHtml);return false}return loadMarket(false)};
  window.movaWatchlistRefresh=function(){refreshWatch(true)};

  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var text=String(b.textContent||'').trim();if(/^Watchlist$/i.test(text)){try{sessionStorage.setItem(MODE_KEY,'watchlist')}catch(x){};setTimeout(function(){bootstrapWatch();refreshWatch(true)},0)}else if(/^Trending$/i.test(text)){try{sessionStorage.setItem(MODE_KEY,'trending')}catch(x){};setTimeout(function(){refreshWatch(true)},0)}},true);
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var text=String(b.textContent||'').trim(),t=currentTicker(),on=null;if(/Add to Watch\\s*List|^Watch$/i.test(text))on=true;else if(/Remove from Watch\\s*List|^Watching$/i.test(text))on=false;else return;if(!t)return;setTimeout(function(){setWatch(t,on)},0)},true);
  window.addEventListener('storage',function(e){if(e.key===WATCH_KEY||e.key===LEGACY_KEY)refreshWatch(true)});

  function boot(){
    [0,120,350,800,1600].forEach(function(ms){setTimeout(function(){bootstrapWatch();refreshWatch(true)},ms)});
    var grid=newsGrid();if(grid){new MutationObserver(function(){if(newsWriting)return;if(newsMode==='company'&&newsHtml&&grid.innerHTML!==newsHtml)renderNewsHtml(newsHtml)}).observe(grid,{childList:true,subtree:false})}
    var page=document.getElementById('news');if(page&&page.classList.contains('active'))setTimeout(function(){if(newsMode==='market')loadMarket(false)},80);
    var bodyObserver=new MutationObserver(function(){if(watchQueued)return;watchQueued=true;requestAnimationFrame(function(){watchQueued=false;refreshWatch(false)})});bodyObserver.observe(document.body,{subtree:true,childList:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;

if(!html.includes('</body>'))throw new Error('v4 follow-up: </body> not found');
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA preview follow-up v4: persistent company News + first-load Watch List bootstrap installed.');
