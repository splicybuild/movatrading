import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

// Replace the legacy desktop account opener itself so signed-in users cannot fall back to the small modal.
const legacy="function openAccount(){if(innerWidth<=740)return;ensureAccountModal();getProfile()?profileAccount():guestAccount();accountModal.classList.add('open')}";
const replacement="function openAccount(){if(innerWidth<=740)return;const p=getProfile();if(p&&typeof window.movaOpenAccountWorkspaceV2==='function'){accountModal?.classList.remove('open');window.movaOpenAccountWorkspaceV2('profile');return}ensureAccountModal();p?profileAccount():guestAccount();accountModal.classList.add('open')}";
if(!html.includes(legacy)) throw new Error('legacy openAccount function not found');
html=html.replace(legacy,replacement);

// Also redirect any legacy profile renderer to the full workspace if it is invoked by another existing path.
const profileStart="function profileAccount(){\n    const p=getProfile();if(!p){guestAccount();return}";
const profileNew="function profileAccount(){\n    const p=getProfile();if(!p){guestAccount();return}\n    if(typeof window.movaOpenAccountWorkspaceV2==='function'){accountModal?.classList.remove('open');window.movaOpenAccountWorkspaceV2('profile');return}";
if(html.includes(profileStart)) html=html.replace(profileStart,profileNew);

const css=`<style id="mova-news-grid-v4-style">
#newsGrid.mova-news-v4-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:14px!important;margin-top:18px!important}
#newsGrid .mova-news-v4-card{display:block!important;border:1px solid #153446!important;border-radius:15px!important;background:#06131c!important;overflow:hidden!important;text-decoration:none!important;color:#eef5f8!important;min-width:0!important}
#newsGrid .mova-news-v4-card img{display:block!important;width:100%!important;height:185px!important;object-fit:cover!important;background:#0a1923!important}
#newsGrid .mova-news-v4-body{padding:14px!important}
#newsGrid .mova-news-v4-card h3{margin:0 0 8px!important;font-size:16px!important;color:#eef5f8!important;line-height:1.3!important}
#newsGrid .mova-news-v4-card p{margin:0!important;color:#8299aa!important;font-size:12px!important;line-height:1.5!important}
#newsGrid .mova-news-v4-card small{display:block!important;color:#66ff8a!important;margin-top:9px!important}
#newsGrid .mova-news-v4-status{grid-column:1/-1;color:#8299aa;padding:12px 0}
@media(max-width:740px){#newsGrid.mova-news-v4-grid{grid-template-columns:1fr!important}}
</style>`;
html=html.replace('</head>',css+'</head>');

const runtime=`<script id="mova-account-news-v4-runtime">(function(){
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  let token=0;
  async function loadTopNews(force){
    const grid=document.getElementById('newsGrid');
    if(!grid)return;
    if(!force&&grid.dataset.movaNewsV4==='loaded'&&grid.children.length)return;
    const my=++token;
    grid.classList.add('mova-news-v4-grid');
    grid.dataset.movaNewsV4='loading';
    grid.innerHTML='<div class="mova-news-v4-status">Loading latest market stories…</div>';
    try{
      const r=await fetch('/api/news?symbols=NVDA,MSFT,AAPL,AMZN,META,GOOGL,TSLA,AVGO,AMD,NFLX',{cache:'no-store'});
      const d=await r.json();
      if(my!==token)return;
      if(!r.ok)throw new Error(d.error||'news');
      const items=(d.items||[]).slice(0,10);
      if(!items.length){grid.innerHTML='<div class="mova-news-v4-status">No market stories available right now.</div>';grid.dataset.movaNewsV4='empty';return}
      grid.innerHTML=items.map(x=>{
        const img=x.image?'<img src="'+esc(x.image)+'" alt="" onerror="this.remove()">':'';
        const summary=esc((x.summary||x.body||'').slice(0,200));
        const href=x.url?' href="'+esc(x.url)+'" target="_blank" rel="noopener"':'';
        return '<a class="mova-news-v4-card"'+href+'>'+img+'<div class="mova-news-v4-body"><h3>'+esc(x.title||x.headline||'Market story')+'</h3><p>'+summary+'</p><small>'+esc(x.source||'Market news')+'</small></div></a>';
      }).join('');
      grid.dataset.movaNewsV4='loaded';
    }catch(e){
      if(my!==token)return;
      grid.innerHTML='<div class="mova-news-v4-status">Market stories could not be loaded right now.</div>';
      grid.dataset.movaNewsV4='error';
    }
  }
  document.addEventListener('click',e=>{
    const n=e.target.closest&&e.target.closest('[data-nav="news"],[data-mob="news"]');
    if(n)setTimeout(()=>loadTopNews(true),160);
  },true);
  const mo=new MutationObserver(()=>{
    const page=document.getElementById('news'),grid=document.getElementById('newsGrid');
    if(page&&grid&&page.classList.contains('active')&&!grid.children.length)setTimeout(()=>loadTopNews(true),0);
  });
  mo.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>loadTopNews(false),300));else setTimeout(()=>loadTopNews(false),300);
  window.movaLoadTopNewsV4=loadTopNews;
})();</script>`;
html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA direct profile workspace + News grid v4 complete.');
