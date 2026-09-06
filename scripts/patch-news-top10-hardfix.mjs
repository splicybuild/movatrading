import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Find the actual rendered "Find Top 10" control at build time and strip any legacy submit/navigation behaviour.
const marker=/Find\s*Top\s*10/i;
const hit=html.search(marker);
if(hit<0) throw new Error('News hardfix: Find Top 10 text not found');

const openButton=Math.max(html.lastIndexOf('<button',hit),html.lastIndexOf('<a ',hit),html.lastIndexOf('<input',hit));
if(openButton<0) throw new Error('News hardfix: control start not found');
const openEnd=html.indexOf('>',openButton);
if(openEnd<0) throw new Error('News hardfix: control end not found');
let openTag=html.slice(openButton,openEnd+1);
openTag=openTag
  .replace(/\s+onclick=("[^"]*"|'[^']*')/gi,'')
  .replace(/\s+href=("[^"]*"|'[^']*')/gi,'')
  .replace(/\s+type=("[^"]*"|'[^']*')/gi,'')
  .replace(/\s+id=("movaNewsTop10Button"|'movaNewsTop10Button')/gi,'');
if(/^<button/i.test(openTag)) openTag=openTag.replace(/^<button/i,'<button type="button" id="movaNewsTop10Button"');
else if(/^<a\b/i.test(openTag)) openTag=openTag.replace(/^<a\b/i,'<a id="movaNewsTop10Button" href="#" role="button"');
else openTag=openTag.replace(/^<input/i,'<input type="button" id="movaNewsTop10Button"');
html=html.slice(0,openButton)+openTag+html.slice(openEnd+1);

// Disable submission on the form containing the control, if there is one.
const formStart=html.lastIndexOf('<form',hit);
const formClose=formStart>=0?html.indexOf('</form>',hit):-1;
if(formStart>=0&&formClose>hit){
  const formOpenEnd=html.indexOf('>',formStart);
  let formTag=html.slice(formStart,formOpenEnd+1).replace(/\s+onsubmit=("[^"]*"|'[^']*')/gi,'');
  formTag=formTag.replace(/^<form/i,'<form onsubmit="return false"');
  html=html.slice(0,formStart)+formTag+html.slice(formOpenEnd+1);
}

const runtime=`<script id="mova-news-top10-hardfix-v3">(function(){
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let busy=false;
  function list(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}
  function resolve(raw){const q=String(raw||'').trim().toLowerCase();if(!q)return null;return list().find(a=>String(a.k||'').toLowerCase()===q)||list().find(a=>String(a.n||'').toLowerCase()===q)||list().find(a=>String(a.k||'').toLowerCase().startsWith(q))||list().find(a=>String(a.n||'').toLowerCase().startsWith(q))||null}
  function input(){const root=document.getElementById('news');if(!root)return null;return [...root.querySelectorAll('input')].find(i=>/search a stock|ticker|company/i.test((i.placeholder||'')+' '+(i.getAttribute('aria-label')||'')))||null}
  function context(a,q){if(!q)return'';const pct=Number(q.changePct||0),cls=pct>0?'up':pct<0?'down':'flat';const px=Number.isFinite(Number(q.priceNative))?'$'+Number(q.priceNative).toLocaleString(undefined,{maximumFractionDigits:2}):'';const mv=(pct>0?'+':'')+pct.toFixed(2)+'%';return '<div class="mova-news-context"><strong>'+esc(a.n)+' · '+esc(a.k)+'</strong><span>Current market position: <b class="'+cls+'">'+esc(px)+' · '+esc(mv)+'</b>. Ranked by company relevance, recency and market-moving importance.</span></div>'}
  async function run(e){
    if(e){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}
    if(busy)return false;
    const i=input(),grid=document.getElementById('newsGrid');if(!i||!grid)return false;
    const a=resolve(i.value);if(!a){grid.innerHTML='<div class="mova-news-search-status">Select a recognised MOVA company or ticker first.</div>';return false}
    busy=true;i.value=String(a.k||'').toUpperCase();grid.innerHTML='<div class="mova-news-search-status">Finding the 10 most relevant stories for '+esc(a.n)+'…</div>';
    try{
      const [nr,mr]=await Promise.all([fetch('/api/news?symbol='+encodeURIComponent(a.k)+'&name='+encodeURIComponent(a.n)+'&ts='+Date.now(),{cache:'no-store'}),fetch('/api/market?symbols='+encodeURIComponent(a.k)+'&ts='+Date.now(),{cache:'no-store'})]);
      const nd=await nr.json(),md=await mr.json().catch(()=>({}));if(!nr.ok)throw new Error(nd.error||'News request failed');
      const items=(nd.items||[]).filter(x=>x&&x.url&&(x.title||x.headline)).slice(0,10),q=(md.assets||[])[0]||null;if(!items.length)throw new Error('No relevant stories returned');
      grid.innerHTML=context(a,q)+items.map((n,x)=>{const img=n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':'';return '<a class="mna-news" href="'+esc(n.url)+'" target="_blank" rel="noopener noreferrer">'+img+'<div class="mna-news-body"><span class="eyebrow"><span class="mova-news-rank">'+(x+1)+'</span>'+esc(n.source||'MARKET NEWS')+'</span><h3>'+esc(n.title||n.headline)+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="mna-news-meta">Open full article ↗</div></div></a>'}).join('');
    }catch(err){grid.innerHTML='<div class="mova-news-search-status">Top stories could not be loaded right now. Please try again shortly.</div>'}finally{busy=false}
    return false;
  }
  window.movaNewsTop10Search=run;
  function bind(){const b=document.getElementById('movaNewsTop10Button'),i=input();if(b&&!b.dataset.movaHardBound){b.dataset.movaHardBound='1';b.onclick=run;b.addEventListener('click',run,true)}if(i&&!i.dataset.movaNewsEnter){i.dataset.movaNewsEnter='1';i.addEventListener('keydown',e=>{if(e.key==='Enter')run(e)},true)}}
  const mo=new MutationObserver(bind);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{bind();mo.observe(document.body,{subtree:true,childList:true})});else{bind();mo.observe(document.body,{subtree:true,childList:true})}
})();</script>`;
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA News hardfix v3 applied: static control binding, no page submit.');
