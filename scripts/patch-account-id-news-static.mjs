import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Keep the account ID conflict fix that made the new account workspace work.
const legacy='<div id="movaNativeAccount" class="mova-native-account">';
if(!html.includes(legacy)) throw new Error('legacy account overlay not found');
html=html.replace(legacy,'<div id="movaLegacyNativeAccount" class="mova-native-account" style="display:none!important">');

// Do NOT seed fake/static News cards. Leave the grid available for the live loader.
const empty='<section id="newsGrid" class="section news-grid"></section>';
if(!html.includes(empty)) throw new Error('empty news grid not found');
html=html.replace(empty,'<section id="newsGrid" class="section news-grid"><div id="movaNewsLoading" style="grid-column:1/-1;color:#8299aa;padding:18px 0">Loading latest market stories…</div></section>');

const runtime=`<script id="mova-live-news-loader-v1">(function(){
  let loading=false,lastLoaded=0;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function loadLiveNews(force){
    const grid=document.getElementById('newsGrid');
    if(!grid||loading)return;
    if(!force && Date.now()-lastLoaded<60000 && grid.querySelector('a.mna-news'))return;
    loading=true;
    grid.innerHTML='<div style="grid-column:1/-1;color:#8299aa;padding:18px 0">Loading latest market stories…</div>';
    try{
      const r=await fetch('/api/news?ts='+Date.now(),{cache:'no-store'});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'News request failed');
      const items=(d.items||[]).filter(x=>x&&x.url&&x.title).slice(0,10);
      if(!items.length)throw new Error('No live market stories returned');
      grid.innerHTML=items.map(n=>{
        const img=n.image?'<img src="'+esc(n.image)+'" alt="" loading="lazy">':'';
        return '<a class="mna-news" href="'+esc(n.url)+'" target="_blank" rel="noopener noreferrer">'+img+'<div class="mna-news-body"><span class="eyebrow">'+esc(n.source||'MARKET NEWS')+'</span><h3>'+esc(n.title||n.headline)+'</h3><p>'+esc(String(n.summary||n.body||'').slice(0,220))+'</p><div class="mna-news-meta">Open full article ↗</div></div></a>';
      }).join('');
      lastLoaded=Date.now();
    }catch(e){
      grid.innerHTML='<div style="grid-column:1/-1;color:#8299aa;padding:18px 0">Latest market stories could not be loaded right now. Please try again shortly.</div>';
    }finally{loading=false}
  }
  window.movaLoadLiveNews=loadLiveNews;
  function newsVisible(){const p=document.getElementById('news');return !!(p&&p.classList.contains('active'))}
  document.addEventListener('click',function(e){
    const t=e.target.closest&&e.target.closest('button,a');
    if(t&&(/^News$/i.test((t.textContent||'').trim())||t.dataset?.mob==='news'))setTimeout(()=>loadLiveNews(true),80);
  },true);
  const mo=new MutationObserver(function(){if(newsVisible())loadLiveNews(false)});
  mo.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(newsVisible())loadLiveNews(true)});else if(newsVisible())loadLiveNews(true);
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA account ID fix retained; News now uses dedicated live clickable loader.');
