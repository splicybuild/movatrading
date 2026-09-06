import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

if(!html.includes('mova-preview-watch-marquee-v8')) throw new Error('Watch native v9: marquee v8 runtime missing');
if(!html.includes('id="tickerTrack"')) throw new Error('Watch native v9: native ticker track missing');

// v9 replaces v8's separate visible Watchlist layer. The canonical Watchlist
// renderer from v4/v5 remains the data source, but the visible cards now use
// the same native #tickerTrack shell as Trending.
html=html.replace(/<style id="mova-preview-watch-marquee-v8-style">[\s\S]*?<\/style>/g,'');
html=html.replace(/<script id="mova-preview-watch-marquee-v8">[\s\S]*?<\/script>/g,'');

const css=`<style id="mova-preview-watch-native-v9-style">
/* The canonical strip remains a hidden data source only. */
[data-mova-canonical-watch-strip="1"]{display:none!important}

#tickerTrack.mova-native-watch-active{
  display:flex!important;
  flex-direction:row!important;
  flex-wrap:nowrap!important;
  align-items:stretch!important;
  width:max-content!important;
  min-width:max-content!important;
  max-width:none!important;
  pointer-events:auto!important;
  position:relative!important;
  z-index:2!important;
  will-change:transform!important;
  animation:movaNativeWatchV9 var(--mova-watch-native-duration,32s) linear infinite!important;
}
#tickerTrack.mova-native-watch-empty{display:none!important}
#tickerTrack.mova-native-watch-active:hover{animation-play-state:paused!important}
#tickerTrack.mova-native-watch-active.mova-native-watch-single{
  animation:none!important;
  transform:none!important;
}
.mova-native-watch-half{
  display:flex!important;
  flex:0 0 auto!important;
  flex-direction:row!important;
  flex-wrap:nowrap!important;
  align-items:stretch!important;
  gap:8px!important;
  padding-right:8px!important;
  box-sizing:border-box!important;
}
#tickerTrack.mova-native-watch-active .mova-canonical-watch-card{
  flex:0 0 154px!important;
  min-width:154px!important;
  max-width:154px!important;
  pointer-events:auto!important;
  cursor:pointer!important;
  touch-action:manipulation!important;
  position:relative!important;
  z-index:3!important;
}
@keyframes movaNativeWatchV9{
  from{transform:translate3d(0,0,0)}
  to{transform:translate3d(-50%,0,0)}
}
</style>`;

const runtime=`<script id="mova-preview-watch-native-v9">(function(){
  var MODE='movaTickerModeV1';
  var queued=false;

  function sym(v){
    v=String(v||'').trim().toUpperCase();
    return /^[A-Z0-9.\\-]{1,16}$/.test(v)?v:'';
  }

  function selected(b){
    if(!b)return false;
    var c=' '+String(b.className||'')+' ';
    return /\\b(active|selected|current|on|is-active|is-selected)\\b/i.test(c)||
      b.getAttribute('aria-selected')==='true'||
      b.getAttribute('aria-pressed')==='true'||
      b.dataset.active==='true'||b.dataset.selected==='true';
  }

  function controls(){
    var buttons=Array.from(document.querySelectorAll('button')).filter(function(b){
      return /^(Watchlist|Trending)$/i.test((b.textContent||'').trim())&&b.offsetParent!==null;
    });
    return {
      w:buttons.find(function(b){return /^Watchlist$/i.test((b.textContent||'').trim())})||null,
      t:buttons.find(function(b){return /^Trending$/i.test((b.textContent||'').trim())})||null
    };
  }

  function active(c){
    if(selected(c&&c.w))return true;
    if(selected(c&&c.t))return false;
    try{return sessionStorage.getItem(MODE)==='watchlist'}catch(e){return false}
  }

  function speedDuration(){
    var mode='normal';
    try{mode=localStorage.getItem('movaTickerSpeedV1')||'normal'}catch(e){}
    if(mode==='slow')return '46s';
    if(mode==='fast')return '20s';
    return '32s';
  }

  function sourceCards(){
    var strip=document.querySelector('[data-mova-canonical-watch-strip="1"]');
    if(!strip)return [];
    var seen=new Set();
    return Array.from(strip.querySelectorAll('.mova-canonical-watch-card[data-mova-watch-open]')).filter(function(card){
      var s=sym(card.dataset.movaWatchOpen);
      if(!s||seen.has(s))return false;
      seen.add(s);
      return true;
    });
  }

  function openCompany(symbol){
    symbol=sym(symbol);if(!symbol)return;
    try{sessionStorage.setItem('movaCurrentCompanyV1',symbol)}catch(e){}
    try{
      if(typeof window.openAsset==='function'){window.openAsset(symbol);return}
      if(typeof window.openCompanyResearch==='function'){window.openCompanyResearch(symbol);return}
      if(typeof openAsset==='function'){openAsset(symbol);return}
      if(typeof openCompanyResearch==='function'){openCompanyResearch(symbol);return}
    }catch(e){}
    try{location.hash='#company='+encodeURIComponent(symbol)}catch(e){}
  }

  function wire(track){
    track.querySelectorAll('.mova-canonical-watch-card[data-mova-watch-open]').forEach(function(btn){
      btn.onclick=function(e){
        if(e){e.preventDefault();e.stopPropagation()}
        openCompany(btn.dataset.movaWatchOpen);
        return false;
      };
    });
  }

  function restoreNative(track){
    if(!track)return;

    // Never restore a cached copy of Trending. setTickerMode('trending') already
    // rebuilds #tickerTrack; if Watchlist markup is somehow still present,
    // ask the native ticker renderer to rebuild it now.
    track.classList.remove('mova-native-watch-active','mova-native-watch-empty','mova-native-watch-single');
    track.removeAttribute('data-mova-native-watch-sig');
    track.style.removeProperty('--mova-watch-native-duration');

    if(Object.prototype.hasOwnProperty.call(track.dataset,'movaWatchPrevDisplay')){
      track.style.display=track.dataset.movaWatchPrevDisplay||'';
      delete track.dataset.movaWatchPrevDisplay;
      delete track.dataset.movaNativeWatchTrack;
    }

    if(track.querySelector('.mova-canonical-watch-card')){
      try{
        if(typeof window.tickerBuild==='function')window.tickerBuild();
        else if(typeof tickerBuild==='function')tickerBuild();
      }catch(e){}
    }
  }

  function renderWatch(track,cards){
    var base=cards.map(function(card){return card.outerHTML}).join('');
    var single=cards.length===1;
    var sig=cards.map(function(card){return sym(card.dataset.movaWatchOpen)+'|'+card.innerHTML}).join('~')+'|'+(single?'single':'loop');

    if(track.dataset.movaNativeWatchSig!==sig){
      if(single){
        track.innerHTML='<div class="mova-native-watch-half">'+base+'</div>';
      }else{
        track.innerHTML='<div class="mova-native-watch-half">'+base+'</div><div class="mova-native-watch-half" aria-hidden="true">'+base+'</div>';
      }
      track.dataset.movaNativeWatchSig=sig;
      wire(track);
    }

    track.classList.remove('mova-native-watch-empty');
    track.classList.add('mova-native-watch-active');
    track.classList.toggle('mova-native-watch-single',single);
    track.style.setProperty('--mova-watch-native-duration',speedDuration());
  }

  function apply(){
    queued=false;
    var c=controls();
    var track=document.getElementById('tickerTrack');
    if(!c.w||!track)return;

    if(!active(c)){
      restoreNative(track);
      return;
    }

    var cards=sourceCards();
    var empty=document.querySelector('[data-mova-watch-empty="1"]');

    if(!cards.length){
      track.classList.remove('mova-native-watch-active','mova-native-watch-single');
      track.classList.add('mova-native-watch-empty');
      return;
    }

    if(empty)empty.style.display='none';
    renderWatch(track,cards);
  }

  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(apply);
  }

  document.addEventListener('click',function(){setTimeout(queue,0);setTimeout(queue,80)},true);
  document.addEventListener('change',function(e){if(e.target&&e.target.id==='mnaTickerSpeedSelect')queue()},true);
  window.addEventListener('load',queue);
  window.addEventListener('resize',queue);
  window.addEventListener('hashchange',queue);
  new MutationObserver(queue).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-selected','aria-pressed']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue);else queue();
  [100,300,700,1400,2600].forEach(function(ms){setTimeout(queue,ms)});
})();</script>`;

html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA Watchlist native v9 applied: live Trending restore, single-item Watchlist guard, native scrolling and direct clicks.');
