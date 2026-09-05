import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Rename the page/navigation from News & Alerts to simply News.
html=html.replace(/News & Alerts/g,'News');
html=html.replace(/NEWS & ALERTS/g,'NEWS');

const css=`<style id="mova-account-news-v3-style">
#movaTopNewsRestored{margin:18px 0 40px}
#movaTopNewsRestored .mova-news-cards{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px!important;margin-top:14px!important}
#movaTopNewsRestored .mova-news-card{display:block!important;border:1px solid #153446!important;border-radius:14px!important;background:#06131c!important;overflow:hidden!important;color:#eef5f8!important;text-decoration:none!important}
#movaTopNewsRestored .mova-news-card img{display:block;width:100%;height:170px;object-fit:cover;background:#0a1923}
#movaTopNewsRestored .mova-news-card-body{padding:14px}
#movaTopNewsRestored .mova-news-card h3{margin:0 0 8px;font-size:16px;color:#eef5f8}
#movaTopNewsRestored .mova-news-card p{margin:0;color:#8299aa;line-height:1.5;font-size:12px}
#movaTopNewsRestored .mova-news-card small{display:block;margin-top:9px;color:#66ff8a}
@media(max-width:740px){#movaTopNewsRestored .mova-news-cards{grid-template-columns:1fr!important}}
</style>`;
html=html.replace('</head>',css+'</head>');

const runtime=`<script id="mova-account-news-v3-runtime">(function(){
  const PROFILE='movaMobileProfileV1';
  function getProfile(){try{return JSON.parse(localStorage.getItem(PROFILE)||'null')}catch(e){return null}}
  function closeLegacyAccount(){
    document.getElementById('movaDesktopAccountModal')?.classList.remove('open');
    document.querySelectorAll('.mova-desktop-account-modal.open').forEach(x=>x.classList.remove('open'));
  }
  document.addEventListener('click',function(e){
    const b=e.target.closest&&e.target.closest('.mova-desktop-account-btn,#mobileProfileChip');
    if(!b||!getProfile()||typeof window.movaOpenAccountWorkspaceV2!=='function')return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    closeLegacyAccount();
    window.movaOpenAccountWorkspaceV2('profile');
  },true);

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function escAttr(v){return esc(v)}
  let loading=false,lastLoad=0;
  async function ensureNews(){
    const heading=[...document.querySelectorAll('h1,h2,h3')].find(x=>/Top 10 market stories/i.test(x.textContent||''));
    if(!heading)return;
    const page=heading.closest('.page')||heading.closest('section')||heading.parentElement;
    if(!page)return;
    let wrap=page.querySelector('#movaTopNewsRestored');
    if(wrap&&wrap.dataset.loaded==='1')return;
    if(!wrap){
      wrap=document.createElement('div');wrap.id='movaTopNewsRestored';
      const search=[...page.querySelectorAll('input')].find(i=>/Search a stock/i.test(i.placeholder||''));
      const anchor=search?.closest('div');
      (anchor?.parentElement||heading.parentElement||page).insertAdjacentElement('afterend',wrap);
    }
    if(loading&&Date.now()-lastLoad<5000)return;
    loading=true;lastLoad=Date.now();
    wrap.innerHTML='<p style="color:#8299aa">Loading latest market stories…</p>';
    try{
      const r=await fetch('/api/news',{cache:'no-store'});
      const d=await r.json();
      const items=(d.items||[]).slice(0,10);
      if(!r.ok)throw new Error(d.error||'News request failed');
      wrap.innerHTML=items.length?'<div class="mova-news-cards">'+items.map(x=>{
        const body=esc((x.summary||x.body||'').slice(0,190));
        const img=x.image?'<img src="'+escAttr(x.image)+'" alt="" onerror="this.remove()">':'';
        const open=x.url?' href="'+escAttr(x.url)+'" target="_blank" rel="noopener"':'';
        return '<a class="mova-news-card"'+open+'>'+img+'<div class="mova-news-card-body"><h3>'+esc(x.title||x.headline||'Market story')+'</h3><p>'+body+'</p><small>'+esc(x.source||'Market news')+'</small></div></a>';
      }).join('')+'</div>':'<p style="color:#8299aa">No market stories available right now.</p>';
      wrap.dataset.loaded='1';
    }catch(err){
      wrap.innerHTML='<p style="color:#8299aa">Market stories could not be loaded right now.</p>';
      wrap.dataset.loaded='0';
    }finally{loading=false}
  }
  const observer=new MutationObserver(()=>setTimeout(ensureNews,0));
  observer.observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-nav="news"],[data-mob="news"]');if(b)setTimeout(ensureNews,120)},true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{ensureNews();setTimeout(ensureNews,500)});else{ensureNews();setTimeout(ensureNews,500)}
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA account/profile interception + News restoration v3 complete.');
