import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-news-top10-v3-style">
.mova-news-context{grid-column:1/-1;border:1px solid #1b465d;border-radius:14px;background:#07131d;padding:14px 16px;margin:4px 0 2px}.mova-news-context strong{display:block;font-size:15px}.mova-news-context span{display:block;margin-top:5px;color:#8fa5b4;font-size:12px;line-height:1.45}.mova-news-context .up{color:#66ff8a}.mova-news-context .down{color:#ff7d8a}.mova-news-context .flat{color:#42bbff}.mova-news-search-status{grid-column:1/-1;color:#8299aa;padding:18px 0}.mova-news-rank{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;border:1px solid #28546a;border-radius:999px;margin-right:7px;color:#66ff8a;font-size:10px;font-weight:1000}
body.mova-light-theme .mova-news-context{background:#fff;border-color:#c8d7df}.mova-light-theme .mova-news-context span{color:#5d7381}
</style>`;
html=html.replace('</head>',css+'</head>');

const runtime=`<script id="mova-news-top10-v3-runtime">(function(){
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let searching=false;
  function assetList(){try{return Array.isArray(assets)?assets:[]}catch(e){return[]}}
  function resolveAsset(raw){const q=String(raw||'').trim().toLowerCase();if(!q)return null;const list=assetList();return list.find(a=>String(a.k||'').toLowerCase()===q)||list.find(a=>String(a.n||'').toLowerCase()===q)||list.find(a=>String(a.k||'').toLowerCase().startsWith(q))||list.find(a=>String(a.n||'').toLowerCase().startsWith(q))||null}
  function top10ControlFrom(el){const c=el&&el.closest?el.closest('button,a,input[type="submit"],input[type="button"]'):null;if(!c)return null;const label=(c.textContent||c.value||c.getAttribute('aria-label')||'').trim();return /find\s*top\s*10/i.test(label)?c:null}
  function top10Button(){return [...document.querySelectorAll('button,a,input[type="submit"],input[type="button"]')].find(c=>/find\s*top\s*10/i.test((c.textContent||c.value||c.getAttribute('aria-label')||'').trim()))||null}
  function searchInput(button){
    if(!button)button=top10Button();
    let n=button;for(let i=0;i<6&&n;i++,n=n.parentElement){const inputs=[...n.querySelectorAll('input')];const hit=inputs.find(x=>/search a stock|company|ticker|stock/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')));if(hit)return hit}
    return [...document.querySelectorAll('input')].find(x=>/search a stock|company|ticker|stock/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))||null;
  }
  function resultsGrid(button){
    const byId=document.getElementById('newsGrid');if(byId)return byId;
    let n=button;for(let i=0;i<8&&n;i++,n=n.parentElement){
      const grids=[...n.querySelectorAll('div,section')].filter(x=>x.children.length>=2&&[...x.children].some(c=>c.matches&&c.matches('article,a')));
      if(grids.length)return grids[grids.length-1];
    }
    const story=[...document.querySelectorAll('article,a')].find(x=>/Open full article|MARKET NEWS|AUSTRALIAN FINANCIAL REVIEW|CRYPTO BRIEFING/i.test(x.textContent||''));return story?story.parentElement:null;
  }
  function marketContext(asset,q){if(!q)return '';const pct=Number(q.changePct||0),cls=pct>0?'up':pct<0?'down':'flat',word=pct>0?'up':pct<0?'down':'flat';const price=Number.isFinite(Number(q.priceNative))?'$'+Number(q.priceNative).toLocaleString(undefined,{maximumFractionDigits:2}):'';const move=(pct>0?'+':'')+pct.toFixed(2)+'%';const momentum=q.analysis&&q.analysis.momentum?String(q.analysis.momentum):'current';return '<div class="mova-news-context"><strong>'+esc(asset.n)+' · '+esc(asset.k)+'</strong><span>Current market position: <b class="'+cls+'">'+esc(price)+' · '+esc(move)+' '+word+'</b>. Stories are ranked for company relevance, recency and market-moving context. Current momentum: '+esc(momentum)+'.</span></div>'}
  async function runSearch(button){
    if(searching)return;const input=searchInput(button),grid=resultsGrid(button);if(!input||!grid)return;
    const asset=resolveAsset(input.value);if(!asset){grid.innerHTML='<div class="mova-news-search-status">Select a recognised MOVA company or ticker first.</div>';return}
    searching=true;input.value=String(asset.k||'').toUpperCase();grid.innerHTML='<div class="mova-news-search-status">Finding the 10 most relevant stories for '+esc(asset.n)+'…</div>';
    try{
      const [nr,mr]=await Promise.all([fetch('/api/news?symbol='+encodeURIComponent(asset.k)+'&name='+encodeURIComponent(asset.n)+'&ts='+Date.now(),{cache:'no-store'}),fetch('/api/market?symbols='+encodeURIComponent(asset.k)+'&ts='+Date.now(),{cache:'no-store'})]);
      const nd=await nr.json(),md=await mr.json().catch(()=>({}));if(!nr.ok)throw new Error(nd.error||'News request failed');const items=(nd.items||[]).filter(x=>x&&x.url&&(x.title||x.headline)).slice(0,10),quote=(md.assets||[])[0]||null;if(!items.length)throw new Error('No relevant stories returned');
      grid.innerHTML=marketContext(asset,quote)+items.map((n,i)=>{const img=n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':'';return '<a class="mna-news" href="'+esc(n.url)+'" target="_blank" rel="noopener noreferrer">'+img+'<div class="mna-news-body"><span class="eyebrow"><span class="mova-news-rank">'+(i+1)+'</span>'+esc(n.source||'MARKET NEWS')+'</span><h3>'+esc(n.title||n.headline)+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="mna-news-meta">Open full article ↗</div></div></a>'}).join('');
    }catch(e){grid.innerHTML='<div class="mova-news-search-status">Top stories could not be loaded right now. Please try again shortly.</div>'}finally{searching=false}
  }
  document.addEventListener('click',function(e){const b=top10ControlFrom(e.target);if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();runSearch(b)},true);
  document.addEventListener('submit',function(e){const f=e.target;if(!(f instanceof HTMLFormElement))return;const b=[...f.querySelectorAll('button,input[type="submit"],input[type="button"]')].find(c=>/find\s*top\s*10/i.test((c.textContent||c.value||'').trim()));if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();runSearch(b)},true);
  document.addEventListener('keydown',function(e){if(e.key!=='Enter')return;const b=top10Button(),input=searchInput(b);if(!b||e.target!==input)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();runSearch(b)},true);
  function neutralise(){const b=top10Button();if(!b)return;b.removeAttribute('onclick');b.removeAttribute('href');if('type'in b)b.type='button'}
  const mo=new MutationObserver(neutralise);function start(){neutralise();mo.observe(document.body,{subtree:true,childList:true})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();</script>`;
html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA News Find Top 10 v3: bind by visible control and nearby search/results instead of fragile page id.');
