import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

function replaceBetween(startMarker,endMarker,replacement,label){
  const start=html.indexOf(startMarker);
  const end=start>=0?html.indexOf(endMarker,start):-1;
  if(start<0||end<0)throw new Error('Could not locate '+label);
  html=html.slice(0,start)+replacement+html.slice(end);
}

replaceBetween('function openAsset(k){','\nfunction headerSearchGo',`function openAsset(k){
  const a=assets.find(x=>x.k===k);if(!a)return;
  closeModal();
  const nonEquity=['Commodity','Index','Macro','Volatility'];
  if(nonEquity.includes(a.sector)){
    go('pulse');
    pulseInput.value=a.k;
    searchPulse();
    return;
  }
  openCompanyResearch(k);
}
`,'openAsset');

const openMarker="function openCompanyResearch(k){\n  recordMarketView(k);";
if(!html.includes(openMarker))throw new Error('openCompanyResearch marker not found');
html=html.replace(openMarker,`function openCompanyResearch(k,restoreTab='overview'){
  recordMarketView(k);`);
html=html.replace("  const a=assets.find(x=>x.k===k),p=getProfile(k);if(!a||!p)return;","  const a=assets.find(x=>x.k===k),p=getProfile(k);if(!a||!p)return;\n  if(['Commodity','Index','Macro','Volatility'].includes(a.sector)){go('pulse');pulseInput.value=a.k;searchPulse();return;}");
html=html.replace("  initResearchChart(k);hydrateCompanyHistoryLive(k,a);hydrateCompanyFinancialsLive(k);switchCRTab('overview');window.scrollTo({top:0,behavior:'auto'});updateTopButton();","  initResearchChart(k);hydrateCompanyHistoryLive(k,a);hydrateCompanyFinancialsLive(k);switchCRTab(restoreTab||'overview');history.replaceState(null,'',`#company=${encodeURIComponent(k)}&tab=${encodeURIComponent(restoreTab||'overview')}`);window.scrollTo({top:0,behavior:'auto'});updateTopButton();");

html=html.replace("function closeCompanyResearch(){\n  companyResearchView.classList.remove('open');","function closeCompanyResearch(){\n  history.replaceState(null,'','#pulse');\n  companyResearchView.classList.remove('open');");

html=html.replace("function switchCRTab(t){\n  document.querySelectorAll('.cr-panel').forEach(x=>x.classList.remove('active'));","function switchCRTab(t){\n  document.querySelectorAll('.cr-panel').forEach(x=>x.classList.remove('active'));");
html=html.replace("  document.querySelectorAll('[data-crtab]').forEach(b=>b.classList.toggle('active',b.dataset.crtab===t));\n  if(t==='market')","  document.querySelectorAll('[data-crtab]').forEach(b=>b.classList.toggle('active',b.dataset.crtab===t));\n  if(typeof activeResearchTicker!=='undefined'&&activeResearchTicker)history.replaceState(null,'',`#company=${encodeURIComponent(activeResearchTicker)}&tab=${encodeURIComponent(t)}`);\n  if(t==='market')");

replaceBetween('function searchPulse(){','\n\nconst companyProfiles=',`function searchPulse(){
  const q=pulseInput.value.trim().toUpperCase();if(!q)return;
  const exact=assets.find(x=>x.k===q||x.n.toUpperCase()===q);
  const a=exact||assets.find(x=>x.n.toUpperCase().includes(q));
  if(a){
    const nonEquity=['Commodity','Index','Macro','Volatility'].includes(a.sector);
    if(nonEquity){
      const quote=quoteFor(a.k)||{priceText:a.p,changeText:a.m,className:a.c};
      pulseSearchResult.innerHTML=\`<div class="card pulse-market-card" style="padding:16px">
        <div class="section-head" style="margin-bottom:8px">
          <div><span class="eyebrow">\${a.sector} · \${a.k}</span><h2>\${a.n}</h2></div>
          <button class="btn" onclick="renderFeaturedHomeMarket('\${a.k}')">View market chart →</button>
        </div>
        <div class="detail">
          <div><span>Price</span><b>\${quote.priceText||a.p}</b></div>
          <div><span>Move</span><b class="\${quote.className||a.c}">\${quote.changeText||a.m}</b></div>
          <div><span>MOVA read</span><b>\${a.signal}</b></div>
        </div>
        <p style="color:#8ca0af;font-size:10px;line-height:1.6">\${a.why}</p>
        <div class="company-card-hint">Market instrument · not a company security</div>
      </div>\`;
      return;
    }
    pulseSearchResult.innerHTML=\`<div class="card pulse-company-card" style="padding:16px;cursor:pointer" onclick="openCompanyResearch('\${a.k}')">
      <div class="section-head" style="margin-bottom:8px">
        <div><span class="eyebrow">\${a.sector} · \${a.k}</span><h2>\${a.n}</h2></div>
        <button class="btn primary" onclick="event.stopPropagation();openCompanyResearch('\${a.k}')">Open company research →</button>
      </div>
      <div class="detail">
        <div><span>Price</span><b>\${a.p}</b></div>
        <div><span>Move</span><b class="\${a.c}">\${a.m}</b></div>
        <div><span>MOVA read</span><b>\${a.signal}</b></div>
      </div>
      <p style="color:#8ca0af;font-size:10px;line-height:1.6">\${a.why}</p>
      <div class="company-card-hint">Click anywhere on this company card for deeper research →</div>
    </div>\`;
  }else{
    const safe=encodeURIComponent(q);
    pulseSearchResult.innerHTML=\`<div class="card" style="padding:16px"><span class="eyebrow">EXTERNAL STOCK LOOKUP</span><h2>\${q}</h2><p style="color:#8ca0af;font-size:10px;line-height:1.6">This single-file prototype has no live quote API, so \${q} is not in its local test universe. The production Pulse search can use the same interface with a live market-data provider.</p><button class="btn primary" onclick="window.open('https://finance.yahoo.com/quote/\${safe}','_blank','noopener')">Open external quote →</button></div>\`;
  }
}
`,'searchPulse');

const goMarker="function go(page){\n  if(!pages.includes(page))page='home';";
if(!html.includes(goMarker))throw new Error('go() marker not found');
html=html.replace(goMarker,`function go(page){
  if(!pages.includes(page))page='home';
  if(page==='home')history.replaceState(null,'','#home');else history.replaceState(null,'','#'+page);`);

const loadMarker="window.addEventListener('load',()=>{renderHomeWatchlist();tickerBuild();loadLiveTickerData();loadHomeMarketCharts();});";
if(!html.includes(loadMarker))throw new Error('load handler marker not found');
html=html.replace(loadMarker,`window.addEventListener('load',()=>{
  renderHomeWatchlist();tickerBuild();loadLiveTickerData();loadHomeMarketCharts();
  const h=location.hash||'#home';
  const companyMatch=h.match(/^#company=([^&]+)(?:&tab=([^&]+))?/);
  if(companyMatch){
    const k=decodeURIComponent(companyMatch[1]).toUpperCase(),tab=decodeURIComponent(companyMatch[2]||'overview');
    setTimeout(()=>openCompanyResearch(k,tab),0);
  }else{
    const page=h.replace(/^#/,'');
    if(pages.includes(page)&&page!=='home')setTimeout(()=>go(page),0);
  }
});`);

fs.writeFileSync(file,html);
console.log('Patched resilient direct equity routing, market Pulse results and refresh restoration.');
