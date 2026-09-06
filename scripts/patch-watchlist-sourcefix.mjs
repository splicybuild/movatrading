import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const runtime=`<script id="mova-watchlist-sourcefix-v3">(function(){
  const LEGACY_KEY='movaUnifiedWatchlistV1';
  function assetsList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}
  function knownSet(){return new Set(assetsList().map(a=>String(a.k||'').toUpperCase()).filter(Boolean))}
  function sym(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\-]{1,12}$/.test(v)?v:''}
  function stateFrom(value,out){
    if(value==null)return;
    if(value instanceof Set){value.forEach(v=>stateFrom(v,out));return}
    if(value instanceof Map){value.forEach((v,k)=>{const s=sym(k);if(s)out.set(s,!!v)});return}
    if(Array.isArray(value)){value.forEach(v=>stateFrom(v,out));return}
    if(typeof value==='string'){const s=sym(value);if(s)out.set(s,true);return}
    if(typeof value!=='object')return;
    const direct=sym(value.symbol||value.ticker||value.k||value.code||'');
    const explicit=value.watching??value.watched??value.inWatchlist??value.inWatchList??value.active??value.enabled??value.selected;
    if(direct){
      if(explicit===false||explicit===0||String(explicit).toLowerCase()==='false'||String(explicit).toLowerCase()==='removed')out.set(direct,false);
      else out.set(direct,true);
    }
    Object.entries(value).forEach(([k,v])=>{
      const s=sym(k);if(!s)return;
      if(v===true||v===1||String(v).toLowerCase()==='watching'||String(v).toLowerCase()==='watched'||String(v).toLowerCase()==='active')out.set(s,true);
      if(v===false||v===0||String(v).toLowerCase()==='false'||String(v).toLowerCase()==='removed')out.set(s,false);
    });
  }
  function parse(raw){const out=new Map();if(!raw)return out;try{stateFrom(JSON.parse(raw),out)}catch(e){stateFrom(raw,out)}return out}
  function candidateSources(){
    const known=knownSet(),arr=[];
    function push(name,map,bonus){
      const active=[...map.entries()].filter(([s,on])=>on&&(!known.size||known.has(s))).map(([s])=>s);
      const negatives=[...map.entries()].filter(([s,on])=>!on&&(!known.size||known.has(s))).length;
      if(active.length||negatives)arr.push({name,active,score:active.length*100+negatives*5+(bonus||0)});
    }
    try{if(typeof watchlist!=='undefined'){const m=new Map();stateFrom(watchlist,m);push('global:watchlist',m,300)}}catch(e){}
    try{if(typeof watchList!=='undefined'){const m=new Map();stateFrom(watchList,m);push('global:watchList',m,300)}}catch(e){}
    try{if(typeof watchedAssets!=='undefined'){const m=new Map();stateFrom(watchedAssets,m);push('global:watchedAssets',m,260)}}catch(e){}
    try{
      Object.keys(window).filter(k=>/watch|follow|fav/i.test(k)).forEach(k=>{
        try{const v=window[k];if(typeof v==='function')return;const m=new Map();stateFrom(v,m);push('window:'+k,m,220)}catch(e){}
      });
    }catch(e){}
    try{
      for(let i=0;i<localStorage.length;i++){
        const k=localStorage.key(i)||'';
        if(k===LEGACY_KEY||/alert|setting|pref|notification/i.test(k))continue;
        if(!/watch|fav|follow|track/i.test(k))continue;
        const m=parse(localStorage.getItem(k));
        let bonus=0;if(/mova/i.test(k))bonus+=60;if(/watchlist/i.test(k))bonus+=100;else if(/watch/i.test(k))bonus+=60;
        push('storage:'+k,m,bonus);
      }
    }catch(e){}
    return arr.sort((a,b)=>b.score-a.score||b.active.length-a.active.length)
  }
  function watched(){const c=candidateSources();return c.length?c[0].active:[]}
  function homeSelect(){return [...document.querySelectorAll('select')].find(sel=>{let n=sel;for(let i=0;i<6&&n;i++,n=n.parentElement){const t=n.textContent||'';if(/YOUR WATCHED STOCKS\s*&\s*MARKETS/i.test(t)||/WATCH LIST/i.test(t))return true}return false})||null}
  function fill(){
    const sel=homeSelect();if(!sel)return;const list=watched(),a=assetsList(),current=String(sel.value||'').toUpperCase();
    sel.innerHTML='';const p=document.createElement('option');p.value='';p.textContent=list.length?'Select a watched market':'No watched markets yet';sel.appendChild(p);
    list.forEach(s=>{const x=a.find(q=>String(q.k||'').toUpperCase()===s),o=document.createElement('option');o.value=s;o.textContent=s+(x&&x.n?' — '+x.n:'');sel.appendChild(o)});if(list.includes(current))sel.value=current;
  }
  function nav(){const side=document.querySelector('#movaNativeAccount .mna-side');if(!side)return;const alerts=side.querySelector('[data-mna="alerts"]');if(!alerts)return;let b=side.querySelector('[data-mna="watchlist"]');if(!b){b=document.createElement('button');b.className='mna-nav';b.dataset.mna='watchlist';b.textContent='Watch List';side.insertBefore(b,alerts)}b.onclick=render}
  function render(){
    const c=document.getElementById('mnaCanvas');if(!c)return;document.querySelectorAll('#movaNativeAccount [data-mna]').forEach(b=>b.classList.toggle('active',b.dataset.mna==='watchlist'));
    const list=watched(),a=assetsList();const rows=list.map(s=>{const x=a.find(q=>String(q.k||'').toUpperCase()===s);return '<div class="mova-watch-account-row"><div><b>'+s+'</b><small>'+String(x&&x.n||'Watched market')+'</small></div><button type="button" class="mova-watch-account-open" data-watch-open="'+s+'">Open</button></div>'}).join('');
    c.innerHTML='<span class="mna-kicker">WATCH LIST</span><h1>Your Watch List</h1><p class="mna-copy">Markets currently marked as Watching in MOVA.</p><div class="mova-watch-account-list">'+(rows||'<div class="mova-watch-empty">You are not watching any markets right now.</div>')+'</div>';
    c.querySelectorAll('[data-watch-open]').forEach(b=>b.onclick=()=>{const s=b.dataset.watchOpen;try{if(typeof movaNACloseWorkspace==='function')movaNACloseWorkspace()}catch(e){};try{if(typeof openAsset==='function')openAsset(s);else if(typeof openCompanyResearch==='function')openCompanyResearch(s)}catch(e){}})
  }
  function refresh(){try{localStorage.removeItem(LEGACY_KEY)}catch(e){};nav();fill();if(document.querySelector('#movaNativeAccount [data-mna="watchlist"].active'))render()}
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(!b)return;const t=(b.textContent||'').trim();if(/Watching|Add to Watchlist|Remove from Watchlist|Watchlist/i.test(t))setTimeout(refresh,140)},true);
  window.addEventListener('storage',e=>{if(/watch|fav|follow|track/i.test(e.key||''))refresh()});
  const mo=new MutationObserver(()=>nav());
  function boot(){try{localStorage.removeItem(LEGACY_KEY)}catch(e){};refresh();mo.observe(document.body,{subtree:true,childList:true});setTimeout(refresh,350);setTimeout(refresh,1100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();</script>`;
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA watchlist sourcefix v3: prefer multi-symbol native source and ignore alert/settings state.');
