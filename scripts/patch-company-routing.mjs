import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const oldOpenAsset=`function openAsset(k){
  recordMarketView(k);
 const a=assets.find(x=>x.k===k);
 if(!a)return;
 modal(a.n,\`${'${a.sector}'} · ${'${a.k}'}\`,\`<div class="detail"><div><span>Price</span><b>${'${a.p}'}</b></div><div><span>Move</span><b class="${'${a.c}'}">${'${a.m}'}</b></div><div><span>MOVA read</span><b>${'${a.signal}'}</b></div></div><p>${'${a.why}'}</p><button class="btn primary" style="width:100%" onclick="closeModal();go('pulse');pulseInput.value='${'${a.k}'}';searchPulse()">Open in Pulse →</button>\`);
}`;
const newOpenAsset=`function openAsset(k){
  const a=assets.find(x=>x.k===k);if(!a)return;
  closeModal();
  openCompanyResearch(k);
}`;
if(!html.includes(oldOpenAsset))throw new Error('openAsset block not found');
html=html.replace(oldOpenAsset,newOpenAsset);

const openMarker="function openCompanyResearch(k){\n  recordMarketView(k);";
if(!html.includes(openMarker))throw new Error('openCompanyResearch marker not found');
html=html.replace(openMarker,`function openCompanyResearch(k,restoreTab='overview'){
  recordMarketView(k);`);
html=html.replace("  initResearchChart(k);hydrateCompanyHistoryLive(k,a);hydrateCompanyFinancialsLive(k);switchCRTab('overview');window.scrollTo({top:0,behavior:'auto'});updateTopButton();","  initResearchChart(k);hydrateCompanyHistoryLive(k,a);hydrateCompanyFinancialsLive(k);switchCRTab(restoreTab||'overview');history.replaceState(null,'',`#company=${encodeURIComponent(k)}&tab=${encodeURIComponent(restoreTab||'overview')}`);window.scrollTo({top:0,behavior:'auto'});updateTopButton();");

html=html.replace("function closeCompanyResearch(){\n  companyResearchView.classList.remove('open');","function closeCompanyResearch(){\n  history.replaceState(null,'','#pulse');\n  companyResearchView.classList.remove('open');");

html=html.replace("function switchCRTab(t){\n  document.querySelectorAll('.cr-panel').forEach(x=>x.classList.remove('active'));","function switchCRTab(t){\n  document.querySelectorAll('.cr-panel').forEach(x=>x.classList.remove('active'));");
html=html.replace("  document.querySelectorAll('[data-crtab]').forEach(b=>b.classList.toggle('active',b.dataset.crtab===t));\n  if(t==='market')","  document.querySelectorAll('[data-crtab]').forEach(b=>b.classList.toggle('active',b.dataset.crtab===t));\n  if(typeof activeResearchTicker!=='undefined'&&activeResearchTicker)history.replaceState(null,'',`#company=${encodeURIComponent(activeResearchTicker)}&tab=${encodeURIComponent(t)}`);\n  if(t==='market')");

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
console.log('Patched direct company Research routing and refresh state restoration.');
