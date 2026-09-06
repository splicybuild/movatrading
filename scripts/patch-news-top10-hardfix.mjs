import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const runtime=`<script id="mova-news-top10-hardfix-v4">(function(){
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let busy=false,lastPointer=0;
  function assetsList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}
  function controls(){return [...document.querySelectorAll('button,a,input[type="submit"],input[type="button"]')].filter(el=>/find\s*top\s*10/i.test((el.textContent||el.value||el.getAttribute('aria-label')||'').trim()))}
  function visibleButton(){return controls().find(el=>el.offsetParent!==null)||controls()[0]||null}
  function nearbyInput(b){
    let n=b;for(let i=0;i<7&&n;i++,n=n.parentElement){const a=[...n.querySelectorAll('input')].filter(x=>x.type!=='hidden');const hit=a.find(x=>/search|stock|company|ticker/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))||a[0];if(hit)return hit}
    return [...document.querySelectorAll('input')].find(x=>x.offsetParent!==null&&/search a stock|company|ticker/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))||null;
  }
  function grid(){return document.getElementById('newsGrid')||[...document.querySelectorAll('section,div')].find(x=>x.offsetParent!==null&&x.querySelector&&x.querySelector('.mna-news'))||null}
  function resolve(raw){const q=String(raw||'').trim().toLowerCase();if(!q)return null;return assetsList().find(a=>String(a.k||'').toLowerCase()===q)||assetsList().find(a=>String(a.n||'').toLowerCase()===q)||assetsList().find(a=>String(a.k||'').toLowerCase().startsWith(q))||assetsList().find(a=>String(a.n||'').toLowerCase().startsWith(q))||null}
  function context(a,q){if(!q)return'';const pct=Number(q.changePct||0),cls=pct>0?'up':pct<0?'down':'flat',px=Number.isFinite(Number(q.priceNative))?'$'+Number(q.priceNative).toLocaleString(undefined,{maximumFractionDigits:2}):'',mv=(pct>0?'+':'')+pct.toFixed(2)+'%';return '<div class="mova-news-context"><strong>'+esc(a.n)+' · '+esc(a.k)+'</strong><span>Current market position: <b class="'+cls+'">'+esc(px)+' · '+esc(mv)+'</b>. Stories below are ranked for company relevance, recency and likely market impact.</span></div>'}
  async function run(ev,b){
    if(ev){ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation()}
    if(busy)return false;b=b||visibleButton();const input=nearbyInput(b),target=grid();
    if(!input||!target){if(b)b.textContent='Search unavailable';setTimeout(()=>{if(b)b.textContent='Find top 10 ➜'},1200);return false}
    const a=resolve(input.value);if(!a){target.innerHTML='<div class="mova-news-search-status">Select a recognised MOVA company or ticker first.</div>';return false}
    busy=true;input.value=String(a.k||'').toUpperCase();target.innerHTML='<div class="mova-news-search-status">Finding the 10 most relevant stories for '+esc(a.n)+'…</div>';
    try{
      const [nr,mr]=await Promise.all([fetch('/api/news?symbol='+encodeURIComponent(a.k)+'&name='+encodeURIComponent(a.n)+'&ts='+Date.now(),{cache:'no-store'}),fetch('/api/market?symbols='+encodeURIComponent(a.k)+'&ts='+Date.now(),{cache:'no-store'})]);
      const nd=await nr.json().catch(()=>({})),md=await mr.json().catch(()=>({}));if(!nr.ok)throw new Error(nd.error||'News request failed');
      const items=(nd.items||[]).filter(x=>x&&x.url&&(x.title||x.headline)).slice(0,10),q=(md.assets||[])[0]||null;if(!items.length)throw new Error('No relevant stories returned');
      target.innerHTML=context(a,q)+items.map((n,i)=>{const img=n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':'';return '<a class="mna-news" href="'+esc(n.url)+'" target="_blank" rel="noopener noreferrer">'+img+'<div class="mna-news-body"><span class="eyebrow"><span class="mova-news-rank">'+(i+1)+'</span>'+esc(n.source||'MARKET NEWS')+'</span><h3>'+esc(n.title||n.headline)+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="mna-news-meta">Open full article ↗</div></div></a>'}).join('');
    }catch(err){target.innerHTML='<div class="mova-news-search-status">Top stories could not be loaded right now. '+esc(err&&err.message||'Please try again shortly.')+'</div>'}finally{busy=false}
    return false;
  }
  window.movaNewsTop10Search=function(e){return run(e,visibleButton())};
  function bind(){
    controls().forEach(b=>{
      if(b.dataset.movaDirectNews==='1')return;b.dataset.movaDirectNews='1';b.removeAttribute('onclick');b.removeAttribute('href');if('type'in b)b.type='button';
      b.addEventListener('pointerdown',e=>{lastPointer=Date.now();run(e,b)},true);
      b.addEventListener('click',e=>{if(Date.now()-lastPointer<700){e.preventDefault();e.stopPropagation();return}run(e,b)},true);
    });
    const b=visibleButton(),i=nearbyInput(b);if(i&&!i.dataset.movaDirectNewsEnter){i.dataset.movaDirectNewsEnter='1';i.addEventListener('keydown',e=>{if(e.key==='Enter')run(e,b)},true)}
  }
  const mo=new MutationObserver(bind);function start(){bind();mo.observe(document.body,{subtree:true,childList:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();</script>`;
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA News hardfix v4: visible Find Top 10 control bound directly on pointerdown/click.');
