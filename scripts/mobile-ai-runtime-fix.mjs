import { readFileSync, writeFileSync } from 'node:fs';

const path = 'dist/index.html';
let html = readFileSync(path, 'utf8');

const marker = 'MOVA AI MOBILE STABLE v177';
if (html.includes(marker)) {
  console.log('MOVA mobile AI runtime patch already applied.');
  process.exit(0);
}

const patch = String.raw`
<style id="mova-ai-mobile-stable-v177">
@media(max-width:800px){
  html,
  body{
    background:#05080c!important;
  }
  body.mova-ai-modal-open{
    overflow:hidden!important;
    overscroll-behavior:none!important;
    background:#05080c!important;
  }

  /* The AI window occupies only the visible mobile viewport above the fixed MOVA dock. */
  #movaAiModal.mova-ai-modal{
    position:fixed!important;
    left:0!important;
    right:0!important;
    top:var(--mova-ai-vv-top,0px)!important;
    bottom:auto!important;
    width:100%!important;
    height:calc(var(--mova-ai-vv-height,100dvh) - 82px - env(safe-area-inset-bottom))!important;
    min-height:0!important;
    max-height:none!important;
    padding:max(6px,env(safe-area-inset-top)) 7px 0!important;
    align-items:stretch!important;
    justify-content:flex-start!important;
    overflow:hidden!important;
    z-index:2147483000!important;
    background:rgba(1,6,10,.90)!important;
  }
  #movaAiModal .mova-ai-dialog{
    display:flex!important;
    flex-direction:column!important;
    width:100%!important;
    height:100%!important;
    min-height:0!important;
    max-height:100%!important;
    margin:0!important;
    overflow:hidden!important;
    border-radius:18px 18px 0 0!important;
    background:#071018!important;
  }

  /* Always keep the MOVA AI title and close control on screen. */
  #movaAiModal .mova-ai-dialog-head{
    position:relative!important;
    top:0!important;
    z-index:40!important;
    flex:0 0 auto!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    min-height:64px!important;
    padding:11px 12px!important;
    background:#0a141e!important;
    border-bottom:1px solid rgba(255,255,255,.08)!important;
  }
  #movaAiModal .mova-ai-dialog-brand{
    min-width:0!important;
    flex:1 1 auto!important;
  }
  #movaAiModal .mova-ai-dialog-head h2{
    margin:0!important;
    font-size:18px!important;
    line-height:1.1!important;
  }
  #movaAiModal .mova-ai-dialog-head p{
    margin:3px 0 0!important;
    font-size:8.5px!important;
    line-height:1.25!important;
    white-space:normal!important;
  }
  #movaAiModal .mova-ai-close{
    display:grid!important;
    place-items:center!important;
    flex:0 0 42px!important;
    width:42px!important;
    height:42px!important;
    min-width:42px!important;
    min-height:42px!important;
    margin-left:8px!important;
    padding:0!important;
    visibility:visible!important;
    opacity:1!important;
    pointer-events:auto!important;
    border:1px solid rgba(98,200,255,.32)!important;
    border-radius:12px!important;
    background:#0b1a25!important;
    color:#e5f3fb!important;
    font-size:27px!important;
    font-weight:500!important;
    line-height:1!important;
    z-index:50!important;
  }

  #movaAiModal .mova-ai-suggestion-wrap{
    flex:0 0 auto!important;
    padding:8px 12px 5px!important;
  }
  #movaAiModal .mova-ai-dialog .mova-ai-thread,
  #movaAiModal .mova-ai-thread{
    flex:1 1 auto!important;
    min-height:0!important;
    max-height:none!important;
    height:auto!important;
    overflow-y:auto!important;
    overflow-x:hidden!important;
    -webkit-overflow-scrolling:touch!important;
    overscroll-behavior:contain!important;
    padding:9px 12px 12px!important;
  }
  #movaAiModal .mova-ai-composer{
    position:relative!important;
    z-index:30!important;
    flex:0 0 auto!important;
    padding:9px 12px!important;
    background:#08121a!important;
    border-top:1px solid rgba(255,255,255,.07)!important;
  }
  #movaAiModal .mova-ai-footer-note{
    flex:0 0 auto!important;
    margin:0!important;
    padding:0 12px 8px!important;
    background:#08121a!important;
  }

  /* Keep the app navigation as a root-level layer above the AI window. */
  body.mova-ai-modal-open .nav{
    display:grid!important;
    position:fixed!important;
    z-index:2147483647!important;
    bottom:calc(var(--mova-ai-keyboard-offset,0px) + max(6px,env(safe-area-inset-bottom)))!important;
    visibility:visible!important;
    opacity:1!important;
    pointer-events:auto!important;
  }

  /* When the software keyboard is open, free space for the answer and composer. */
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-suggestion-wrap,
  body.mova-ai-keyboard-open #movaAiModal .mova-ai-footer-note{
    display:none!important;
  }
  body.mova-ai-keyboard-open #movaAiModal.mova-ai-modal{
    height:calc(var(--mova-ai-vv-height,100dvh) - 76px)!important;
    padding-top:2px!important;
  }
}
</style>
<script id="mova-ai-mobile-stable-v177-js">
(function(){
  if(window.__movaAiMobileStable177)return;
  window.__movaAiMobileStable177=true;

  var navHome=null, navNext=null, navEl=null;

  function mobile(){return window.matchMedia && window.matchMedia('(max-width:800px)').matches;}

  function syncViewport(){
    if(!mobile())return;
    var vv=window.visualViewport;
    var height=vv?vv.height:window.innerHeight;
    var top=vv?vv.offsetTop:0;
    var keyboard=vv?Math.max(0,window.innerHeight-vv.height-vv.offsetTop):0;
    document.documentElement.style.setProperty('--mova-ai-vv-height',Math.max(240,Math.round(height))+'px');
    document.documentElement.style.setProperty('--mova-ai-vv-top',Math.max(0,Math.round(top))+'px');
    document.documentElement.style.setProperty('--mova-ai-keyboard-offset',Math.max(0,Math.round(keyboard))+'px');
    if(document.body)document.body.classList.toggle('mova-ai-keyboard-open',keyboard>120);
  }

  function ensureClose(){
    var head=document.querySelector('#movaAiModal .mova-ai-dialog-head');
    if(!head)return;
    var close=head.querySelector('.mova-ai-close');
    if(!close){
      close=document.createElement('button');
      close.type='button';
      close.className='mova-ai-close';
      head.appendChild(close);
    }
    close.type='button';
    close.textContent='×';
    close.setAttribute('aria-label','Close MOVA AI');
    close.onclick=function(ev){
      if(ev){ev.preventDefault();ev.stopPropagation();}
      if(typeof window.movaAiCloseModal==='function')window.movaAiCloseModal();
      return false;
    };
  }

  function liftNav(){
    if(!mobile())return;
    navEl=document.querySelector('.nav');
    if(!navEl)return;
    if(!navHome){navHome=navEl.parentNode;navNext=navEl.nextSibling;}
    if(navEl.parentNode!==document.body)document.body.appendChild(navEl);
    navEl.style.visibility='visible';
    navEl.style.opacity='1';
    navEl.style.pointerEvents='auto';
  }

  function restoreNav(){
    if(navEl&&navHome&&navEl.parentNode===document.body){
      if(navNext&&navNext.parentNode===navHome)navHome.insertBefore(navEl,navNext);
      else navHome.appendChild(navEl);
    }
    if(document.body)document.body.classList.remove('mova-ai-keyboard-open');
    document.documentElement.style.removeProperty('--mova-ai-keyboard-offset');
  }

  function prepareOpen(){
    if(!mobile())return;
    syncViewport();
    ensureClose();
    liftNav();
    setTimeout(function(){syncViewport();ensureClose();liftNav();},40);
  }

  var previousOpen=window.movaAiOpenModal;
  if(typeof previousOpen==='function'){
    window.movaAiOpenModal=function(prefill){
      var result=previousOpen(prefill||'');
      prepareOpen();
      return result;
    };
  }

  var previousClose=window.movaAiCloseModal;
  if(typeof previousClose==='function'){
    window.movaAiCloseModal=function(){
      var result=previousClose.apply(this,arguments);
      restoreNav();
      return result;
    };
  }

  document.addEventListener('click',function(ev){
    if(!mobile())return;
    var button=ev.target&&ev.target.closest?ev.target.closest('.nav button'):null;
    var modal=document.getElementById('movaAiModal');
    if(button&&modal&&modal.classList.contains('open')&&typeof window.movaAiCloseModal==='function')window.movaAiCloseModal();
  },true);

  document.addEventListener('focusin',function(ev){
    if(!mobile())return;
    if(ev.target&&ev.target.closest&&ev.target.closest('#movaAiModal'))setTimeout(syncViewport,30);
  });

  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',syncViewport);
    window.visualViewport.addEventListener('scroll',syncViewport);
  }
  window.addEventListener('resize',syncViewport);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){syncViewport();ensureClose();});
  else{syncViewport();ensureClose();}
})();
</script>
<!-- MOVA AI MOBILE STABLE v177 -->
`;

if (html.includes('</body>')) html = html.replace('</body>', patch + '\n</body>');
else html += patch;

writeFileSync(path, html, 'utf8');
console.log('MOVA mobile AI navigation/viewport patch applied.');
