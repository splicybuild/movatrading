import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const oldOpenAsset=`function openAsset(k){
  recordMarketView(k);
 const a=assets.find(x=>x.k===k);
 if(!a)return;
 modal(a.n,\`${'${a.sector}'} · ${'${a.k}'}\`,\`<div class="detail"><div><span>Price</span><b>${'${a.p}'}</b></div><div><span>Move</span><b class="${'${a.c}'}">${'${a.m}'}</b></div><div><span>MOVA read</span><b>${'${a.signal}'}</b></div></div><p>${'${a.why}'}</p><button class="btn primary" style="width:100%" onclick="closeModal();go('pulse');pulseInput.value='${'${a.k}'}';searchPulse()">Open in Pulse →</button>\`);
}`;

if(!html.includes(oldOpenAsset)) throw new Error('Company entry patch: openAsset function not found');
html=html.replace(oldOpenAsset,`function openAsset(k){
  recordMarketView(k);
  const a=assets.find(x=>x.k===k);
  if(!a)return;
  openCompanyResearch(k);
}`);

const heroOld=`<div class="company-research-hero">
      <div>
        <span id="crEyebrow" class="eyebrow">COMPANY RESEARCH</span>
        <h1 id="crName">Company</h1>
        <p id="crIntro"></p>
      </div>`;

const heroNew=`<div class="company-research-hero cr-visual-hero">
      <img id="crCompanyBackground" class="cr-company-background" alt="" aria-hidden="true">
      <div class="cr-company-overlay" aria-hidden="true"></div>
      <div class="cr-company-copy">
        <div class="cr-company-heading-row">
          <img id="crCompanyLogo" class="cr-company-logo" alt="Company logo">
          <div>
            <span id="crEyebrow" class="eyebrow">COMPANY RESEARCH</span>
            <h1 id="crName">Company</h1>
          </div>
        </div>
        <p id="crIntro"></p>
      </div>`;

if(!html.includes(heroOld)) throw new Error('Company entry patch: company research hero markup not found');
html=html.replace(heroOld,heroNew);

const visualFn=`
function loadUsableCompanyBackground(bg,primary,fallback){
  const tryUrl=(url,next)=>{
    if(!url){next();return}
    const probe=new Image();
    probe.onload=()=>{
      const w=probe.naturalWidth||0,h=probe.naturalHeight||0;
      const ratio=h?w/h:0;
      if(w>=700 && h>=220 && ratio>=1.55){bg.src=url;bg.style.display='block'}
      else next();
    };
    probe.onerror=next;
    probe.src=url;
  };
  tryUrl(primary,()=>tryUrl(fallback,()=>{bg.removeAttribute('src');bg.style.display='none'}));
}
async function hydrateCompanyVisual(k){
  const logo=document.getElementById('crCompanyLogo');
  const bg=document.getElementById('crCompanyBackground');
  if(logo){
    logo.removeAttribute('src');
    logo.style.display='none';
    logo.onerror=()=>{logo.style.display='none'};
  }
  if(bg){bg.removeAttribute('src');bg.style.display='none'}
  if(location.protocol==='file:')return;
  try{
    const r=await fetch('/api/fundamentals?symbol='+encodeURIComponent(k),{cache:'no-store'});
    if(!r.ok)return;
    const d=await r.json();
    const site=d?.profile?.website||'';

    if(logo){
      const stableLogo=d?.profile?.logo||('/api/company-logo?symbol='+encodeURIComponent(k)+'&v=190');
      logo.src=stableLogo;
      logo.style.display='block';
      logo.onerror=()=>{
        if(!String(logo.src).includes('/api/company-logo')){
          logo.onerror=()=>{logo.style.display='none'};
          logo.src='/api/company-logo?symbol='+encodeURIComponent(k)+'&v=190';
        }else logo.style.display='none';
      };
    }

    if(!site||!bg)return;
    const vr=await fetch('/api/company-visual?url='+encodeURIComponent(site),{cache:'no-store'});
    if(!vr.ok)return;
    const v=await vr.json();
    loadUsableCompanyBackground(bg,v?.background||'',v?.fallbackBackground||'');
  }catch(_){}
}
`;

const openCompanyMarker='function openCompanyResearch(k){';
if(!html.includes(openCompanyMarker)) throw new Error('Company entry patch: openCompanyResearch not found');
html=html.replace(openCompanyMarker,visualFn+'\n'+openCompanyMarker);

const hydrateCall=`  initResearchChart(k);hydrateCompanyHistoryLive(k,a);hydrateCompanyFinancialsLive(k);switchCRTab('overview');window.scrollTo({top:0,behavior:'auto'});updateTopButton();`;
if(!html.includes(hydrateCall)) throw new Error('Company entry patch: company research hydration line not found');
html=html.replace(hydrateCall,`  hydrateCompanyVisual(k);initResearchChart(k);hydrateCompanyHistoryLive(k,a);hydrateCompanyFinancialsLive(k);switchCRTab('overview');window.scrollTo({top:0,behavior:'auto'});updateTopButton();`);

const css=`
<style id="mova-company-visuals-v191">
.cr-visual-hero{position:relative!important;overflow:hidden!important;isolation:isolate!important;min-height:230px!important}
.cr-company-background{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;z-index:-3;opacity:.30;filter:saturate(.86) contrast(1.04)}
.cr-company-overlay{position:absolute;inset:0;z-index:-2;background:linear-gradient(90deg,rgba(4,12,19,.98) 0%,rgba(4,12,19,.90) 48%,rgba(4,12,19,.62) 100%)}
.cr-company-copy{position:relative;z-index:1;min-width:0}
.cr-company-heading-row{display:flex;align-items:center;gap:16px;min-width:0}
.cr-company-logo{width:72px;height:72px;object-fit:contain;border-radius:16px;padding:8px;background:#fff;border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 28px rgba(0,0,0,.28);flex:0 0 auto}
@media(max-width:740px){
  .cr-visual-hero{min-height:210px!important}
  .cr-company-heading-row{align-items:center!important;gap:12px}
  .cr-company-logo{width:56px;height:56px;border-radius:13px;padding:6px}
  .cr-company-overlay{background:linear-gradient(180deg,rgba(4,12,19,.72),rgba(4,12,19,.97) 72%)}
}
</style>
`;

if(!html.includes('</head>')) throw new Error('Company entry patch: </head> missing');
html=html.replace('</head>',css+'</head>');
writeFileSync(file,html);
console.log('MOVA preview company visuals v191 patch complete.');
