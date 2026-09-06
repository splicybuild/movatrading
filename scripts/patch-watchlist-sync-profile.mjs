import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-watchlist-sync-v1-style">
.mova-watch-account-list{display:grid;gap:10px;margin-top:18px}.mova-watch-account-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid #153446;border-radius:13px;background:#05111a;padding:13px 14px}.mova-watch-account-row b{display:block;font-size:15px}.mova-watch-account-row small{display:block;color:#7890a1;margin-top:3px}.mova-watch-account-open{min-height:38px;border:1px solid #24536a;border-radius:10px;background:#0a2230;color:#eef5f8;font-weight:900;padding:0 13px;cursor:pointer}.mova-watch-empty{color:#8299aa;line-height:1.55;padding:8px 0}.mna-nav[data-mna="watchlist"]{display:block!important}
body.mova-light-theme .mova-watch-account-row{background:#fff;border-color:#c8d7df;color:#14212b}body.mova-light-theme .mova-watch-account-open{background:#eef6f9;color:#14212b;border-color:#aac2ce}
@media(max-width:740px){.mova-watch-account-row{grid-template-columns:minmax(0,1fr) auto}.mna-side{grid-template-columns:repeat(6,minmax(0,1fr))!important}.mna-nav[data-mna="watchlist"]{font-size:8px!important}}
</style>`;
html=html.replace('</head>',css+'</head>');

const runtime=`<script id="mova-watchlist-sync-v1">(function(){
  const OWN_KEY='movaUnifiedWatchlistV1';
  function assetList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}
  function validSymbol(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\-]{1,12}$/.test(v)?v:''}
  function addFrom(value,set){
    if(value==null)return;
    if(Array.isArray(value)){value.forEach(function(x){addFrom(x,set)});return}
    if(typeof value==='string'){var s=validSymbol(value);if(s)set.add(s);return}
    if(typeof value==='object'){
      var direct=validSymbol(value.symbol||value.ticker||value.k||value.code||'');if(direct)set.add(direct);
      Object.keys(value).forEach(function(k){if(value[k]===true||value[k]===1||value[k]==='watching'){var s=validSymbol(k);if(s)set.add(s)}});
    }
  }
  function watchedSymbols(){
    var set=new Set();
    try{if(typeof watchlist!=='undefined')addFrom(watchlist,set)}catch(e){}
    try{if(typeof watchList!=='undefined')addFrom(watchList,set)}catch(e){}
    try{addFrom(JSON.parse(localStorage.getItem(OWN_KEY)||'[]'),set)}catch(e){}
    try{
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i)||'';
        if(!/watch/i.test(key))continue;
        var raw=localStorage.getItem(key);if(!raw)continue;
        try{addFrom(JSON.parse(raw),set)}catch(e){addFrom(raw,set)}
      }
    }catch(e){}
    var known=new Set(assetList().map(function(a){return String(a.k||'').toUpperCase()}));
    return Array.from(set).filter(function(s){return !known.size||known.has(s)});
  }
  function saveOwn(list){try{localStorage.setItem(OWN_KEY,JSON.stringify(Array.from(new Set(list.map(validSymbol).filter(Boolean)))))}catch(e){}}
  function inferCurrentSymbol(){
    var m=String(location.hash||'').match(/^#company=([A-Z0-9.\-]+)/i);if(m)return m[1].toUpperCase();
    var e=document.getElementById('crEyebrow');if(e){var t=(e.textContent||'').match(/·\s*([A-Z0-9.\-]+)\s*$/i);if(t)return t[1].toUpperCase()}
    return '';
  }
  function syncOwnFromVisibleWatchButton(){
    var sym=inferCurrentSymbol();if(!sym)return;
    var buttons=Array.from(document.querySelectorAll('button'));
    var watched=buttons.some(function(b){return /★\s*Watching|Watching/i.test((b.textContent||'').trim())&&b.offsetParent!==null});
    var list=watchedSymbols().filter(function(x){return x!==sym});if(watched)list.push(sym);saveOwn(list);
  }
  function findHomeWatchSelect(){
    var sels=Array.from(document.querySelectorAll('select'));
    return sels.find(function(sel){var n=sel;for(var i=0;i<6&&n;i++,n=n.parentElement){var t=(n.textContent||'');if(/YOUR WATCHED STOCKS\s*&\s*MARKETS/i.test(t)||/WATCH LIST/i.test(t))return true}return false})||null;
  }
  function populateHomeWatchlist(){
    var sel=findHomeWatchSelect();if(!sel)return;
    var symbols=watchedSymbols(),list=assetList(),current=sel.value;
    var placeholder=sel.querySelector('option[value=""]')?.textContent||'Select a watched market';
    sel.innerHTML='';var p=document.createElement('option');p.value='';p.textContent=placeholder;sel.appendChild(p);
    symbols.forEach(function(sym){var a=list.find(function(x){return String(x.k||'').toUpperCase()===sym});var o=document.createElement('option');o.value=sym;o.textContent=sym+(a&&a.n?' — '+a.n:'');sel.appendChild(o)});
    if(symbols.includes(String(current||'').toUpperCase()))sel.value=current;
    if(!symbols.length){p.textContent='No watched markets yet'}
  }
  function ensureAccountWatchNav(){
    var side=document.querySelector('#movaNativeAccount .mna-side');if(!side)return;
    var inv=side.querySelector('[data-mna="investments"]'),alerts=side.querySelector('[data-mna="alerts"]');if(!inv||!alerts)return;
    var btn=side.querySelector('[data-mna="watchlist"]');
    if(!btn){btn=document.createElement('button');btn.className='mna-nav';btn.dataset.mna='watchlist';btn.textContent='Watch List';side.insertBefore(btn,alerts)}
    btn.onclick=function(){renderAccountWatchlist()};
  }
  function renderAccountWatchlist(){
    var c=document.getElementById('mnaCanvas');if(!c)return;
    document.querySelectorAll('#movaNativeAccount [data-mna]').forEach(function(b){b.classList.toggle('active',b.dataset.mna==='watchlist')});
    var symbols=watchedSymbols(),list=assetList();
    var rows=symbols.map(function(sym){var a=list.find(function(x){return String(x.k||'').toUpperCase()===sym});return '<div class="mova-watch-account-row"><div><b>'+sym+'</b><small>'+String(a&&a.n||'Watched market')+'</small></div><button type="button" class="mova-watch-account-open" data-watch-open="'+sym+'">Open</button></div>'}).join('');
    c.innerHTML='<span class="mna-kicker">WATCH LIST</span><h1>Your Watch List</h1><p class="mna-copy">Markets you have marked as Watching across MOVA.</p><div class="mova-watch-account-list">'+(rows||'<div class="mova-watch-empty">You are not watching any markets yet. Open a company profile and choose <b>Watching</b> to add it here.</div>')+'</div>';
    c.querySelectorAll('[data-watch-open]').forEach(function(b){b.onclick=function(){var sym=b.dataset.watchOpen;try{if(typeof movaNACloseWorkspace==='function')movaNACloseWorkspace()}catch(e){};try{if(typeof openAsset==='function')openAsset(sym);else if(typeof openCompanyResearch==='function')openCompanyResearch(sym)}catch(e){}}})
  }
  function refresh(){ensureAccountWatchNav();populateHomeWatchlist()}
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('button');if(!b)return;
    var text=(b.textContent||'').trim();
    if(/Watching|Watchlist/i.test(text)){setTimeout(function(){syncOwnFromVisibleWatchButton();refresh();if(document.querySelector('#movaNativeAccount [data-mna="watchlist"].active'))renderAccountWatchlist()},80)}
  },true);
  window.addEventListener('storage',function(e){if(/watch/i.test(e.key||''))refresh()});
  var mo=new MutationObserver(function(){ensureAccountWatchNav()});
  function boot(){refresh();mo.observe(document.body,{childList:true,subtree:true});setTimeout(refresh,300);setTimeout(refresh,1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA watchlist now syncs watched markets into Home and Account.');
