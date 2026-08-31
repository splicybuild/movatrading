import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');

const start='async function hydrateCompanyHistoryLive(k,a){';
const end='\nfunction renderReportedRows';
const startAt=html.indexOf(start);
const endAt=startAt>=0?html.indexOf(end,startAt):-1;
if(startAt<0||endAt<0)throw new Error('Could not locate hydrateCompanyHistoryLive in '+file);

const replacement=`async function hydrateCompanyHistoryLive(k,a){
  const root=document.getElementById('crOriginFacts');
  const esc=v=>String(v??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
  const fetchJson=async(url,timeout=7000)=>{
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),timeout);
    try{const r=await fetch(url,{signal:ctrl.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json();}
    finally{clearTimeout(timer)}
  };
  const money=n=>{const v=Number(n);return Number.isFinite(v)?'$'+v.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}):'Live quote unavailable'};
  const factRows=rows=>rows.map(x=>'<div class="cr-fact"><span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b></div>').join('');

  crWho.textContent='Loading live company profile…';
  crWhat.textContent='Loading live company profile…';
  crFacts.innerHTML=factRows([['Industry','Loading…'],['Ticker',k],['Current price','Loading…'],['Exchange','Loading…']]);
  root.innerHTML=factRows([['Founded','Loading verified history…'],['Founder(s)','Loading verified history…'],['Headquarters','Loading verified history…'],['Research source','Finnhub live profile']]);
  crBusinessMix.innerHTML='<div class="cr-fact"><span>SEGMENT DATA</span><b>Loading verified company information…</b></div>';

  if(location.protocol==='file:'){
    root.innerHTML=factRows([['Founded','Unavailable in local file preview'],['Founder(s)','Unavailable in local file preview'],['Headquarters','Unavailable in local file preview'],['Research source','Deploy MOVA to load Finnhub data']]);
    return;
  }

  const [fundResult,marketResult]=await Promise.allSettled([
    fetchJson('/api/fundamentals?symbol='+encodeURIComponent(k),7000),
    fetchJson('/api/market?symbols='+encodeURIComponent(k),7000)
  ]);
  const fundamentals=fundResult.status==='fulfilled'?fundResult.value:null;
  const market=marketResult.status==='fulfilled'?marketResult.value:null;
  const profile=fundamentals?.profile||{};
  const liveMarket=Array.isArray(market?.assets)?market.assets.find(x=>x.ticker===k):null;
  const cachedLive=(typeof liveQuotes!=='undefined'&&liveQuotes?.get)?liveQuotes.get(k):null;
  const quote=liveMarket||cachedLive||null;
  const companyName=profile.name||a.n||k;
  const industry=profile.industry||'Not available from Finnhub';
  const exchange=profile.exchange||'Not available from Finnhub';
  const country=profile.country||'Not available from Finnhub';
  const ticker=profile.ticker||k;
  const website=profile.website||'';
  const ipo=profile.ipo||'Not available from Finnhub';
  const priceText=quote?.priceNative!=null?money(quote.priceNative):'Live quote unavailable';
  const pct=Number(quote?.changePct);
  const moveText=Number.isFinite(pct)?((pct>=0?'+':'')+pct.toFixed(2)+'%'):'—';

  crName.textContent=companyName;
  crWhoTitle.textContent=companyName;
  crEyebrow.textContent=(profile.industry||a.sector||'Company')+' · '+ticker;
  if(quote?.priceNative!=null){crPrice.textContent=priceText;crMove.textContent=moveText;crMove.className=pct>=0?'up':'down'}

  const profileSummary=companyName+' is a publicly traded company'+
    (profile.industry?' in the '+profile.industry+' industry':'')+
    (profile.exchange?' listed on '+profile.exchange:'')+
    (profile.country?' and based in '+profile.country:'')+'.';
  crIntro.textContent=profileSummary;
  crWho.textContent=profileSummary;
  crWhat.textContent=profile.industry
    ?'Finnhub classifies '+companyName+' in the '+profile.industry+' industry. Detailed operating history is loaded separately from verified company reference sources.'
    :'A detailed business classification is not currently available from Finnhub.';
  crFacts.innerHTML=factRows([['Industry',industry],['Ticker',ticker],['Current price',priceText],['Exchange',exchange]]);
  crHistoryStats.innerHTML=factRows([['Current',priceText],['Latest move',moveText],['Industry',industry],['IPO',ipo]]);
  root.innerHTML=factRows([
    ['Founded','Loading verified history…'],
    ['Founder(s)','Loading verified history…'],
    ['Headquarters','Loading verified history…'],
    ['Country',country],
    ['IPO',ipo],
    ['Website',website||'Not available'],
    ['Research source',fundamentals?'Finnhub live profile'+(quote?.provider?' + '+quote.provider+' quote':''):'Finnhub profile temporarily unavailable']
  ]);
  crBusinessMix.innerHTML='<div class="cr-fact"><span>SEGMENT DATA</span><b>Finnhub company profile does not provide audited revenue-by-segment percentages. MOVA will not display estimated splits.</b></div>';

  try{
    const history=await fetchJson('/api/company-profile?ticker='+encodeURIComponent(k)+'&name='+encodeURIComponent(a.n),6500);
    const summary=history?.summary||history?.overview||'';
    const business=history?.sections?.business||history?.business||history?.sections?.products||history?.products||'';
    const origins=history?.sections?.origins||history?.origins||summary;
    if(summary){crIntro.textContent=summary;crWho.textContent=summary}
    if(business)crWhat.textContent=business;
    if(origins)crHistorySummary.textContent=origins;
    const founded=history?.foundedDisplay||history?.founded||'Not available';
    const historyFounders=Array.isArray(history?.founders)?history.founders.filter(Boolean).join(', '):(history?.founders||'');
    const headquarters=history?.headquarters||'Not available';
    root.innerHTML=factRows([
      ['Founded',founded],['Founder(s)',historyFounders||'Not identified'],['Headquarters',headquarters],
      ['Country',country],['IPO',ipo],['Website',website||history?.website||'Not available'],
      ['Research source','Finnhub live profile + '+(history?.sourceLabel||'company reference enrichment')+(quote?.provider?' + '+quote.provider+' quote':'')]
    ]);
    const rev=history?.revenueContext||null;
    const revItems=Array.isArray(rev?.items)?rev.items.filter(x=>x?.description):[];
    if(revItems.length){
      crBusinessMix.innerHTML=(rev?.summary?'<div class="cr-fact"><span>BUSINESS MODEL</span><b>'+esc(rev.summary)+'</b></div>':'')+
        revItems.slice(0,5).map(x=>'<div class="cr-fact"><span>'+esc(x.label||'Business area')+'</span><b>'+esc(x.description)+'</b></div>').join('')+
        '<div class="cr-fact"><span>DATA NOTE</span><b>Qualitative verified information only — no invented segment percentages.</b></div>';
    }
    if(Array.isArray(history?.timeline)&&history.timeline.length){
      crMilestones.innerHTML=history.timeline.map(x=>'<div class="timeline-item"><time>'+esc(x.year||'')+'</time><i class="timeline-dot"></i><p><b>'+esc(x.title||'')+'</b>'+(x.text?' — '+esc(x.text):'')+'</p></div>').join('');
    }
  }catch(_){
    root.innerHTML=factRows([
      ['Founded','Reference source temporarily unavailable'],['Founder(s)','Reference source temporarily unavailable'],['Headquarters','Reference source temporarily unavailable'],
      ['Country',country],['IPO',ipo],['Website',website||'Not available'],
      ['Research source',fundamentals?'Finnhub live profile'+(quote?.provider?' + '+quote.provider+' quote':''):'Company profile feeds temporarily unavailable']
    ]);
  }
}`;

html=html.slice(0,startAt)+replacement+html.slice(endAt);
fs.writeFileSync(file,html);
console.log('Patched company profile with Finnhub-first live profile and resilient reference enrichment.');
