import fs from 'node:fs';

const file='dist/index.html';
let html=fs.readFileSync(file,'utf8');
const start='async function hydrateCompanyHistoryLive(k,a){';
const end='\nfunction renderReportedRows';
const s=html.indexOf(start),e=s>=0?html.indexOf(end,s):-1;
if(s<0||e<0)throw new Error('Could not locate company profile hydrator');

const replacement=`async function hydrateCompanyHistoryLive(k,a){
  const root=document.getElementById('crOriginFacts');
  const esc=v=>String(v??'').replace(/[&<>\"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
  const rows=x=>x.map(v=>'<div class="cr-fact"><span>'+esc(v[0])+'</span><b>'+esc(v[1])+'</b></div>').join('');
  const request=async(url,timeout=7000)=>{
    const once=async target=>{const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(target,{signal:c.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.json()}finally{clearTimeout(t)}};
    try{return await once(url)}catch(err){
      if(location.hostname==='movatrading-vert.vercel.app')throw err;
      const u=new URL(url,location.origin),map={'/api/fundamentals':'fundamentals','/api/market':'market','/api/company-history':'company-history'},endpoint=map[u.pathname];
      if(!endpoint)throw err;
      const b=new URL('/api/company-profile-bridge',location.origin);b.searchParams.set('endpoint',endpoint);u.searchParams.forEach((v,k)=>b.searchParams.set(k,v));
      return await once(b.toString());
    }
  };
  const money=n=>Number.isFinite(Number(n))?'$'+Number(n).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}):'Live quote unavailable';

  crWho.textContent='Loading live company profile…';crWhat.textContent='Loading live company profile…';
  crFacts.innerHTML=rows([['Industry','Loading…'],['Ticker',k],['Current price','Loading…'],['Exchange','Loading…']]);
  root.innerHTML=rows([['Founded','Loading verified history…'],['Founder(s)','Loading verified history…'],['Headquarters','Loading verified history…'],['Research source','Finnhub live profile']]);
  crBusinessMix.innerHTML='<div class="cr-fact"><span>SEGMENT DATA</span><b>Loading verified company information…</b></div>';
  if(location.protocol==='file:')return;

  const [fRes,mRes]=await Promise.allSettled([request('/api/fundamentals?symbol='+encodeURIComponent(k)),request('/api/market?symbols='+encodeURIComponent(k))]);
  const f=fRes.status==='fulfilled'?fRes.value:null,m=mRes.status==='fulfilled'?mRes.value:null,p=f?.profile||{};
  const q=(Array.isArray(m?.assets)?m.assets.find(x=>x.ticker===k):null)||((typeof liveQuotes!=='undefined'&&liveQuotes?.get)?liveQuotes.get(k):null);
  const name=p.name||a.n||k,industry=p.industry||'Not available from Finnhub',exchange=p.exchange||'Not available from Finnhub',country=p.country||'Not available from Finnhub',ticker=p.ticker||k,website=p.website||'',ipo=p.ipo||'Not available from Finnhub',price=money(q?.priceNative),pct=Number(q?.changePct),move=Number.isFinite(pct)?((pct>=0?'+':'')+pct.toFixed(2)+'%'):'—';
  crName.textContent=name;crWhoTitle.textContent=name;crEyebrow.textContent=(p.industry||a.sector||'Company')+' · '+ticker;
  if(q?.priceNative!=null){crPrice.textContent=price;crMove.textContent=move;crMove.className=pct>=0?'up':'down'}
  const summary=name+' is a publicly traded company'+(p.industry?' in the '+p.industry+' industry':'')+(p.exchange?' listed on '+p.exchange:'')+(p.country?' and based in '+p.country:'')+'.';
  crIntro.textContent=summary;crWho.textContent=summary;crWhat.textContent=p.industry?'Finnhub classifies '+name+' in the '+p.industry+' industry.':'Detailed business classification is not currently available from Finnhub.';
  crFacts.innerHTML=rows([['Industry',industry],['Ticker',ticker],['Current price',price],['Exchange',exchange]]);
  crHistoryStats.innerHTML=rows([['Current',price],['Latest move',move],['Industry',industry],['IPO',ipo]]);
  root.innerHTML=rows([['Founded','Loading verified history…'],['Founder(s)','Loading verified history…'],['Headquarters','Loading verified history…'],['Country',country],['IPO',ipo],['Website',website||'Not available'],['Research source',f?'Finnhub live profile'+(q?.provider?' + '+q.provider+' quote':''):'Company profile feed unavailable']]);
  crBusinessMix.innerHTML='<div class="cr-fact"><span>SEGMENT DATA</span><b>Finnhub does not provide audited revenue-by-segment percentages here. MOVA will not invent them.</b></div>';

  try{
    const h=await request('/api/company-history?ticker='+encodeURIComponent(k)+'&name='+encodeURIComponent(a.n),6500),hs=h?.summary||h?.overview||'',biz=h?.sections?.business||h?.business||h?.sections?.products||h?.products||'',orig=h?.sections?.origins||h?.origins||hs;
    if(hs){crIntro.textContent=hs;crWho.textContent=hs}if(biz)crWhat.textContent=biz;if(orig)crHistorySummary.textContent=orig;
    const founders=Array.isArray(h?.founders)?h.founders.filter(Boolean).join(', '):(h?.founders||'Not identified');
    root.innerHTML=rows([['Founded',h?.foundedDisplay||h?.founded||'Not available'],['Founder(s)',founders||'Not identified'],['Headquarters',h?.headquarters||'Not available'],['Country',country],['IPO',ipo],['Website',website||h?.website||'Not available'],['Research source','Finnhub live profile + company-history enrichment'+(q?.provider?' + '+q.provider+' quote':'')]]);
    const items=Array.isArray(h?.revenueContext?.items)?h.revenueContext.items.filter(x=>x?.description):[];
    if(items.length)crBusinessMix.innerHTML=items.slice(0,5).map(x=>'<div class="cr-fact"><span>'+esc(x.label||'Business area')+'</span><b>'+esc(x.description)+'</b></div>').join('')+'<div class="cr-fact"><span>DATA NOTE</span><b>Qualitative verified information only — no invented segment percentages.</b></div>';
    if(Array.isArray(h?.timeline)&&h.timeline.length)crMilestones.innerHTML=h.timeline.map(x=>'<div class="timeline-item"><time>'+esc(x.year||'')+'</time><i class="timeline-dot"></i><p><b>'+esc(x.title||'')+'</b>'+(x.text?' — '+esc(x.text):'')+'</p></div>').join('');
  }catch(_){
    root.innerHTML=rows([['Founded','History source temporarily unavailable'],['Founder(s)','History source temporarily unavailable'],['Headquarters','History source temporarily unavailable'],['Country',country],['IPO',ipo],['Website',website||'Not available'],['Research source',f?'Finnhub live profile'+(q?.provider?' + '+q.provider+' quote':''):'Company profile feeds temporarily unavailable']]);
  }
}`;

html=html.slice(0,s)+replacement+html.slice(e);
fs.writeFileSync(file,html);
console.log('Patched company profile with Finnhub-first data and preview bridge fallback.');
