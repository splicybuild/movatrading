import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

if(!html.includes('mova-preview-followup-fixes-v3')) throw new Error('Watch marquee v8: canonical Watch List runtime missing');
if(!html.includes('data-mova-canonical-watch-strip')) throw new Error('Watch marquee v8: canonical strip hook missing');

// Remove the two presentation runtimes from v5 so there is only one owner for
// native-row suppression, marquee cloning and ticker-card clicks.
html=html.replace(/<script id="mova-preview-watch-native-guard-v6">[\s\S]*?<\/script>/g,'');
html=html.replace(/<script id="mova-preview-watch-marquee-v7">[\s\S]*?<\/script>/g,'');

const css=`<style id="mova-preview-watch-marquee-v8-style">
.mova-canonical-watch-strip{
  display:block!important;
  width:100%!important;
  max-width:100%!important;
  overflow:hidden!important;
  overflow-x:hidden!important;
  overflow-y:hidden!important;
  padding:8px 0 7px!important;
  box-sizing:border-box!important;
  position:relative!important;
  white-space:nowrap!important;
  scrollbar-width:none!important;
}
.mova-canonical-watch-strip::-webkit-scrollbar{display:none!important}
.mova-canonical-watch-track{
  display:flex!important;
  flex-direction:row!important;
  flex-wrap:nowrap!important;
  align-items:stretch!important;
  align-content:flex-start!important;
  width:max-content!important;
  min-width:max-content!important;
  max-width:none!important;
  will-change:transform!important;
  transform:translate3d(0,0,0);
  animation:movaCanonicalWatchV8 var(--mova-watch-duration,28s) linear infinite!important;
}
.mova-canonical-watch-group{
  display:flex!important;
  flex-direction:row!important;
  flex-wrap:nowrap!important;
  flex:0 0 auto!important;
  width:max-content!important;
  min-width:max-content!important;
  gap:8px!important;
  align-items:stretch!important;
  padding-right:8px!important;
  box-sizing:border-box!important;
}
.mova-canonical-watch-strip:hover .mova-canonical-watch-track,
.mova-canonical-watch-strip:focus-within .mova-canonical-watch-track{animation-play-state:paused!important}
.mova-canonical-watch-card{flex:0 0 154px!important;min-width:154px!important;max-width:154px!important;pointer-events:auto!important;touch-action:manipulation!important;user-select:none!important}
@keyframes movaCanonicalWatchV8{from{transform:translate3d(0,0,0)}to{transform:translate3d(var(--mova-watch-shift,-900px),0,0)}}
@media(prefers-reduced-motion:reduce){.mova-canonical-watch-track{animation:none!important;transform:none!important}}
</style>`;

const runtime=`<script id="mova-preview-watch-marquee-v8">(function(){
  var queued=false,MODE='movaTickerModeV1';

  function sym(v){v=String(v||'').trim().toUpperCase();return /^[A-Z0-9.\\-]{1,16}$/.test(v)?v:''}
  function selected(b){if(!b)return false;var c=' '+String(b.className||'')+' ';return /\\b(active|selected|current|on|is-active|is-selected)\\b/i.test(c)||b.getAttribute('aria-selected')==='true'||b.getAttribute('aria-pressed')==='true'||b.dataset.active==='true'||b.dataset.selected==='true'}
  function controls(){
    var bs=Array.from(document.querySelectorAll('button')).filter(function(b){return /^(Watchlist|Trending)$/i.test((b.textContent||'').trim())&&b.offsetParent!==null});
    return {w:bs.find(function(b){return /^Watchlist$/i.test((b.textContent||'').trim())})||null,t:bs.find(function(b){return /^Trending$/i.test((b.textContent||'').trim())})||null};
  }
  function active(c){if(selected(c&&c.w))return true;if(selected(c&&c.t))return false;try{return sessionStorage.getItem(MODE)==='watchlist'}catch(e){return false}}
  function priceCount(el){return (String(el&&el.innerText||'').match(/[$£€]\\s*[0-9][0-9,]*(?:\\.[0-9]+)?/g)||[]).length}
  function rootFor(c,strip){
    if(!c||!c.w)return strip&&strip.parentElement;
    var root=c.w.parentElement;
    for(var p=c.w.parentElement,i=0;p&&p!==document.body&&i<10;p=p.parentElement,i++){
      if(strip&&p.contains(strip)){root=p;break}
      var r=p.getBoundingClientRect(),x=String(p.innerText||'');
      if(r.width>=window.innerWidth*.7&&r.height>35&&r.height<300&&/Trending/i.test(x)&&/Watchlist/i.test(x))root=p;
    }
    return root;
  }
  function rememberHide(el){
    if(!el||el.dataset.movaWatchV8Hidden==='1')return;
    el.dataset.movaWatchV8Display=el.style.getPropertyValue('display')||'';
    el.dataset.movaWatchV8Priority=el.style.getPropertyPriority('display')||'';
    el.dataset.movaWatchV8Hidden='1';
    el.style.setProperty('display','none','important');
  }
  function restore(root){
    if(!root)return;
    root.querySelectorAll('[data-mova-watch-v8-hidden="1"]').forEach(function(el){
      var d=el.dataset.movaWatchV8Display||'',p=el.dataset.movaWatchV8Priority||'';
      el.style.removeProperty('display');if(d)el.style.setProperty('display',d,p);
      delete el.dataset.movaWatchV8Display;delete el.dataset.movaWatchV8Priority;delete el.dataset.movaWatchV8Hidden;
    });
  }
  function directBranch(root,node){
    if(!root||!node||!root.contains(node))return null;
    var x=node;while(x.parentElement&&x.parentElement!==root)x=x.parentElement;return x.parentElement===root?x:null;
  }
  function suppressNative(root,c,strip){
    if(!root||!strip)return;
    var controlBranch=directBranch(root,c.w),stripBranch=directBranch(root,strip);
    Array.from(root.children).forEach(function(ch){
      if(ch===controlBranch||ch===stripBranch||ch.contains(c.w)||ch.contains(c.t)||ch.contains(strip))return;
      if(priceCount(ch)>0)rememberHide(ch);
    });
    var node=strip;
    while(node&&node!==root&&node.parentElement){
      var parent=node.parentElement;
      Array.from(parent.children).forEach(function(sib){
        if(sib===node||sib.contains(c.w)||sib.contains(c.t)||sib.contains(strip))return;
        if(priceCount(sib)>0)rememberHide(sib);
      });
      node=parent;
    }
  }
  function cloneGroup(group){
    var c=group.cloneNode(true);c.setAttribute('aria-hidden','true');
    c.querySelectorAll('button').forEach(function(b){b.tabIndex=-1;b.onclick=null});
    return c;
  }
  function size(strip,track,group){
    requestAnimationFrame(function(){
      if(!strip.isConnected||!track.isConnected||!group.isConnected)return;
      var width=Math.ceil(group.getBoundingClientRect().width);if(width<1)return;
      while(track.children.length>2)track.lastElementChild.remove();
      if(track.children.length<2)track.appendChild(cloneGroup(group));
      track.style.setProperty('--mova-watch-shift','-'+width+'px');
      track.style.setProperty('--mova-watch-duration',Math.max(18,Math.min(44,width/32)).toFixed(1)+'s');
    });
  }
  function enhance(strip){
    var track=strip.querySelector(':scope > .mova-canonical-watch-track');
    if(track){
      track.style.setProperty('flex-wrap','nowrap','important');
      var groups=Array.from(track.children).filter(function(x){return x.classList&&x.classList.contains('mova-canonical-watch-group')});
      while(groups.length>2){groups.pop().remove()}
      var g=groups[0];if(g)size(strip,track,g);return;
    }
    var cards=Array.from(strip.children).filter(function(el){return el.classList&&el.classList.contains('mova-canonical-watch-card')});
    if(!cards.length)return;
    var group=document.createElement('div');group.className='mova-canonical-watch-group';
    cards.forEach(function(b){b.onclick=null;group.appendChild(b)});
    track=document.createElement('div');track.className='mova-canonical-watch-track';
    track.appendChild(group);track.appendChild(cloneGroup(group));
    strip.replaceChildren(track);size(strip,track,group);
  }
  function dedupe(root){
    if(!root)return null;
    var strips=Array.from(root.querySelectorAll('[data-mova-canonical-watch-strip="1"]'));
    if(!strips.length)return null;
    var keep=strips[strips.length-1];
    strips.slice(0,-1).forEach(function(s){s.remove()});
    return keep;
  }
  function openCompany(symbol){
    symbol=sym(symbol);if(!symbol)return;
    try{sessionStorage.setItem('movaCurrentCompanyV1',symbol)}catch(e){}
    try{if(typeof window.openCompanyResearch==='function'){window.openCompanyResearch(symbol);return}}catch(e){}
    try{location.hash='#company='+encodeURIComponent(symbol)}catch(e){}
  }
  function apply(){
    queued=false;
    var c=controls();
    var first=document.querySelector('[data-mova-canonical-watch-strip="1"]');
    var root=rootFor(c,first);
    if(!active(c)){restore(root);return}
    var strip=dedupe(root)||first;
    if(!strip)return;
    enhance(strip);suppressNative(root,c,strip);
  }
  function queue(){if(queued)return;queued=true;requestAnimationFrame(apply)}

  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('.mova-canonical-watch-card[data-mova-watch-open]');
    if(b&&b.closest('[data-mova-canonical-watch-strip="1"]')){
      e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
      openCompany(b.dataset.movaWatchOpen);setTimeout(queue,0);setTimeout(queue,100);return;
    }
    setTimeout(queue,0);setTimeout(queue,80);
  },true);
  window.addEventListener('load',queue);window.addEventListener('resize',queue);window.addEventListener('hashchange',queue);
  new MutationObserver(queue).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','aria-selected','aria-pressed']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',queue);else queue();
  [120,350,900,1800].forEach(function(ms){setTimeout(queue,ms)});
})();</script>`;

html=html.replace('</head>',css+'</head>');
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA Watchlist marquee v8 applied: one row, two internal groups, native tracks suppressed, cards clickable.');
