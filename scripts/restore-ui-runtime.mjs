import { readFileSync, writeFileSync } from 'node:fs';

const path = 'dist/index.html';
let html = readFileSync(path, 'utf8');

const marker = 'MOVA TOOLS AI + WORDMARK SIZE FIX v179';
if (html.includes(marker)) {
  console.log('MOVA Tools AI / wordmark patch already applied.');
  process.exit(0);
}

const patch = String.raw`
<style id="mova-tools-ai-wordmark-v179">
/* Keep the user's current approved wordmark asset; only size/crop its display box. */
.brand{overflow:visible!important}
.brand-wordmark{
  display:block!important;
  width:min(660px,58vw)!important;
  height:86px!important;
  max-width:none!important;
  object-fit:cover!important;
  object-position:center center!important;
  margin:0 auto!important;
}
@media(max-width:800px){
  body:not(.mova-mobile-welcome) .brand-wordmark{
    display:block!important;
    width:min(420px,88vw)!important;
    height:64px!important;
    max-width:none!important;
    object-fit:cover!important;
    object-position:center center!important;
    margin:0 auto!important;
  }
}

/* Restore Ask MOVA AI as the first control at the top of Tools. */
#tools .tools-tabs .mova-ai-launch{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:7px!important;
  color:#f4fbff!important;
  border-color:rgba(98,200,255,.48)!important;
  background:linear-gradient(135deg,rgba(22,141,255,.22),rgba(121,239,49,.13))!important;
  box-shadow:inset 0 0 0 1px rgba(98,200,255,.07),0 0 22px rgba(22,141,255,.08)!important;
}
#tools .tools-tabs .mova-ai-launch::before{content:"✦";color:#79ef31;font-size:11px}
#tools .tools-tabs .mova-ai-launch:hover{border-color:rgba(121,239,49,.55)!important;color:#fff!important}

.mova-ai-modal{
  position:fixed;
  inset:0;
  z-index:2147483000;
  display:none;
  align-items:center;
  justify-content:center;
  padding:22px;
  background:rgba(1,5,10,.84);
  backdrop-filter:blur(14px);
}
.mova-ai-modal.open{display:flex}
.mova-ai-dialog{
  width:min(96vw,1080px);
  max-height:min(92vh,920px);
  display:flex;
  flex-direction:column;
  overflow:hidden;
  border:1px solid rgba(98,200,255,.32);
  border-radius:24px;
  background:#07111b;
  box-shadow:0 32px 110px rgba(0,0,0,.68);
}
.mova-ai-dialog-head{
  display:flex;
  align-items:center;
  gap:13px;
  flex:0 0 auto;
  padding:18px 20px;
  border-bottom:1px solid rgba(255,255,255,.08);
  background:linear-gradient(180deg,#0a1722,#08131c);
}
.mova-ai-dialog-brand{min-width:0}
.mova-ai-dialog-head h2{margin:0;font-size:24px;line-height:1.05}
.mova-ai-dialog-head p{margin:4px 0 0;color:#90a7b8;font-size:11px;line-height:1.4}
.mova-ai-badge{
  width:48px;height:48px;flex:0 0 48px;
  display:grid;place-items:center;
  border:1px solid #2f86ac;
  border-radius:14px;
  background:#0b2031;
  color:#62c8ff;
  font-size:14px;font-weight:950;
  position:relative;
}
.mova-ai-badge::after{content:"✦";position:absolute;right:6px;top:3px;color:#79ef31;font-size:9px}
.mova-ai-close{
  margin-left:auto;
  width:46px;height:46px;flex:0 0 46px;
  display:grid;place-items:center;
  border:1px solid rgba(255,255,255,.11);
  border-radius:13px;
  background:#0a141e;
  color:#bdd0dd;
  font-size:27px;
  line-height:1;
  cursor:pointer;
}
.mova-ai-suggestion-wrap{
  flex:0 0 auto;
  padding:12px 20px 10px;
  border-bottom:1px solid rgba(255,255,255,.055);
}
.mova-ai-suggestion-label{
  margin:0 0 8px;
  color:#8198aa;
  font-size:8.5px;
  font-weight:900;
  letter-spacing:.12em;
  text-transform:uppercase;
}
.mova-ai-suggestions{display:flex;flex-wrap:wrap;gap:7px}
.mova-ai-suggestions button{
  border:1px solid #17425a;
  border-radius:999px;
  background:#081a28;
  color:#dbeaff;
  padding:7px 10px;
  font:inherit;
  font-size:10px;
  cursor:pointer;
}
.mova-ai-suggestions button:hover{border-color:rgba(121,239,49,.42)}
.mova-ai-thread{
  flex:1 1 auto;
  min-height:220px;
  max-height:60vh;
  overflow:auto;
  padding:16px 20px;
  display:grid;
  align-content:start;
  gap:12px;
  -webkit-overflow-scrolling:touch;
}
.mova-ai-welcome{
  padding:15px 16px;
  border:1px solid rgba(98,200,255,.11);
  border-radius:16px;
  background:#081520;
  color:#a9bdcb;
  font-size:11px;
  line-height:1.55;
}
.mova-ai-msg{
  max-width:92%;
  padding:14px 15px;
  border-radius:16px;
  white-space:pre-wrap;
  overflow-wrap:anywhere;
  font-size:12px;
  line-height:1.58;
}
.mova-ai-msg.user{
  justify-self:end;
  background:#0a2233;
  border:1px solid rgba(98,200,255,.22);
  color:#f5fbff;
}
.mova-ai-msg.assistant{
  justify-self:start;
  margin-right:5%;
  background:#091710;
  border:1px solid rgba(121,239,49,.15);
  color:#dce8ef;
}
.mova-ai-msg.error{
  justify-self:stretch;
  max-width:100%;
  background:#2a1016;
  border:1px solid rgba(255,93,103,.25);
  color:#ffd9dc;
}
.mova-ai-thinking{
  justify-self:start;
  padding:9px 11px;
  color:#8da2b3;
  font-size:10px;
}
.mova-ai-sources{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;padding-top:9px;border-top:1px solid rgba(255,255,255,.06)}
.mova-ai-sources a{
  max-width:100%;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  color:#62c8ff;
  text-decoration:none;
  border:1px solid rgba(98,200,255,.16);
  border-radius:999px;
  padding:5px 8px;
  background:#071019;
  font-size:9px;
}
.mova-ai-composer{
  flex:0 0 auto;
  display:grid;
  grid-template-columns:minmax(0,1fr) 54px;
  gap:9px;
  padding:13px 20px 10px;
  border-top:1px solid rgba(255,255,255,.07);
  background:#08121a;
}
.mova-ai-composer input{
  width:100%;
  min-width:0;
  height:50px;
  border:1px solid #24374a;
  border-radius:15px;
  outline:0;
  background:#050d15;
  color:#fff;
  padding:0 14px;
  font:inherit;
  font-size:12px;
}
.mova-ai-composer input:focus{border-color:#2f86ac;box-shadow:0 0 0 3px rgba(98,200,255,.06)}
.mova-ai-composer button{
  width:54px;height:50px;
  border:0;
  border-radius:15px;
  cursor:pointer;
  background:linear-gradient(135deg,#32a7ff,#79ef31);
  color:#052033;
  font-size:23px;
  font-weight:950;
}
.mova-ai-composer button:disabled{opacity:.52;cursor:default}
.mova-ai-footer-note{
  flex:0 0 auto;
  margin:0;
  padding:0 20px 12px;
  background:#08121a;
  color:#71889a;
  font-size:8.5px;
  line-height:1.4;
}
body.mova-ai-modal-open{overflow:hidden!important}

@media(max-width:800px){
  #tools .tools-tabs{padding-left:1px}
  #tools .tools-tabs .mova-ai-launch{position:sticky;left:0;z-index:3}
  .mova-ai-modal{padding:0;align-items:stretch}
  .mova-ai-dialog{width:100%;height:100%;max-height:none;border-radius:0}
  .mova-ai-dialog-head{padding:13px 14px}
  .mova-ai-dialog-head h2{font-size:19px}
  .mova-ai-dialog-head p{font-size:9px}
  .mova-ai-suggestion-wrap{padding:9px 14px 7px}
  .mova-ai-thread{padding:11px 14px;max-height:none}
  .mova-ai-composer{padding:10px 14px 8px;grid-template-columns:minmax(0,1fr) 50px}
  .mova-ai-composer input{height:48px;font-size:13px}
  .mova-ai-composer button{width:50px;height:48px}
  .mova-ai-footer-note{padding:0 14px 9px}
}
</style>

<div class="mova-ai-modal" id="movaAiModal" aria-hidden="true">
  <section class="mova-ai-dialog" role="dialog" aria-modal="true" aria-labelledby="movaAiTitle">
    <div class="mova-ai-dialog-head">
      <div class="mova-ai-badge" aria-hidden="true">AI</div>
      <div class="mova-ai-dialog-brand">
        <h2 id="movaAiTitle">MOVA AI</h2>
        <p>Company research, market context and portfolio analysis</p>
      </div>
      <button class="mova-ai-close" type="button" aria-label="Close MOVA AI">×</button>
    </div>
    <div class="mova-ai-suggestion-wrap">
      <div class="mova-ai-suggestion-label">Suggested questions</div>
      <div class="mova-ai-suggestions">
        <button type="button" data-mova-ai-prompt="Why is MSFT moving and what matters next?">Why is MSFT moving?</button>
        <button type="button" data-mova-ai-prompt="Give me the bull and bear case for NVDA.">Bull / bear case</button>
        <button type="button" data-mova-ai-prompt="What current news could affect my portfolio?">Portfolio news</button>
        <button type="button" data-mova-ai-prompt="Which of my holdings has the highest concentration risk?">Concentration risk</button>
        <button type="button" data-mova-ai-prompt="Explain support and resistance and how traders use them.">Learn a concept</button>
      </div>
    </div>
    <div class="mova-ai-thread" id="movaAiThread" aria-live="polite">
      <div class="mova-ai-welcome">Ask MOVA AI about a company, ticker, market move, current catalyst, trading concept or your MOVA portfolio.</div>
    </div>
    <form class="mova-ai-composer" id="movaAiForm">
      <input id="movaAiQuestion" autocomplete="off" placeholder="Ask MOVA AI anything about markets or your portfolio…" aria-label="Ask MOVA AI"/>
      <button id="movaAiAskBtn" type="submit" aria-label="Send question">↑</button>
    </form>
    <p class="mova-ai-footer-note">MOVA combines available market, company, news and portfolio data. Research context only — not personalised financial advice.</p>
  </section>
</div>

<script id="mova-tools-ai-wordmark-v179-js">
(function(){
  if(window.__movaToolsAiWordmark179)return;
  window.__movaToolsAiWordmark179=true;

  var modal=document.getElementById('movaAiModal');
  var input=document.getElementById('movaAiQuestion');
  var form=document.getElementById('movaAiForm');

  function ensureLaunchButton(){
    var tabs=document.querySelector('#tools .tools-tabs');
    if(!tabs || tabs.querySelector('.mova-ai-launch'))return;
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='tools-tab mova-ai-launch';
    btn.textContent='ASK MOVA AI';
    btn.setAttribute('aria-label','Open MOVA AI');
    btn.addEventListener('click',function(){window.movaAiOpenModal();});
    tabs.insertBefore(btn,tabs.firstChild);
  }

  window.movaAiHistory=Array.isArray(window.movaAiHistory)?window.movaAiHistory:[];

  window.movaAiPortfolioPayload=function(){
    var rows=[];
    var cash=0;
    try{
      if(typeof holdings!=='undefined' && Array.isArray(holdings)){
        rows=holdings.slice(0,40).map(function(h){
          return {
            ticker:String(h && h.ticker || ''),
            qty:Number(h && h.qty || 0),
            avg:Number(h && h.avg || 0),
            current:Number(h && h.current || 0)
          };
        }).filter(function(h){return h.ticker;});
      }
    }catch(_){}
    try{
      if(typeof walletState!=='undefined' && walletState)cash=Number(walletState.balance)||0;
    }catch(_){}
    return {holdings:rows,cash:cash};
  };

  window.movaAiScroll=function(){
    var host=document.getElementById('movaAiThread');
    if(host)requestAnimationFrame(function(){host.scrollTop=host.scrollHeight;});
  };

  window.movaAiOpenModal=function(prefill){
    modal=document.getElementById('movaAiModal');
    input=document.getElementById('movaAiQuestion');
    if(!modal)return false;
    if(modal.parentNode!==document.body)document.body.appendChild(modal);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('mova-ai-modal-open');
    if(prefill && input)input.value=String(prefill);
    setTimeout(function(){if(input)input.focus();},30);
    return false;
  };

  window.movaAiCloseModal=function(){
    modal=document.getElementById('movaAiModal');
    if(!modal)return false;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('mova-ai-modal-open');
    return false;
  };

  document.querySelectorAll('[data-mova-ai-prompt]').forEach(function(btn){
    btn.addEventListener('click',function(){
      window.movaAiOpenModal(btn.getAttribute('data-mova-ai-prompt')||'');
    });
  });

  var close=document.querySelector('#movaAiModal .mova-ai-close');
  if(close)close.addEventListener('click',function(ev){ev.preventDefault();window.movaAiCloseModal();});

  if(modal)modal.addEventListener('click',function(ev){
    if(ev.target===modal)window.movaAiCloseModal();
  });

  document.addEventListener('keydown',function(ev){
    if(ev.key==='Escape' && document.getElementById('movaAiModal')?.classList.contains('open'))window.movaAiCloseModal();
  });

  if(form)form.addEventListener('submit',function(ev){
    ev.preventDefault();
    if(typeof window.movaAskAiSubmit==='function')return window.movaAskAiSubmit(ev);
    return false;
  });

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureLaunchButton,{once:true});
  else ensureLaunchButton();
})();
</script>
<!-- MOVA TOOLS AI + WORDMARK SIZE FIX v179 -->
`;

html += patch;
writeFileSync(path, html, 'utf8');
console.log('MOVA Tools AI button restored and approved wordmark display enlarged.');
