function text(v){return String(v??'').trim();}
function clean(v){return text(v).replace(/\s+/g,' ').trim();}
function yearFromTime(v){const m=text(v).match(/[+-]?(\d{4,})-/);return m?String(Number(m[1])):'';}
function claimIds(entity,prop){return (entity?.claims?.[prop]||[]).map(c=>c?.mainsnak?.datavalue?.value?.id).filter(Boolean);}
function claimTime(entity,prop){return (entity?.claims?.[prop]||[]).map(c=>c?.mainsnak?.datavalue?.value?.time).find(Boolean)||'';}
function claimString(entity,prop){return (entity?.claims?.[prop]||[]).map(c=>c?.mainsnak?.datavalue?.value).find(v=>typeof v==='string')||'';}
async function fetchJson(url,timeout=4500){
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),timeout);
  try{
    const r=await fetch(url,{signal:ctrl.signal,headers:{Accept:'application/json'}});
    if(!r.ok)throw new Error('HTTP '+r.status);
    return await r.json();
  }finally{clearTimeout(timer)}
}
async function wikiSearch(name){
  const u=new URL('https://en.wikipedia.org/w/api.php');
  u.searchParams.set('action','query');u.searchParams.set('list','search');u.searchParams.set('srsearch',name+' company');
  u.searchParams.set('srlimit','5');u.searchParams.set('format','json');u.searchParams.set('origin','*');
  const d=await fetchJson(u);
  const rows=d?.query?.search||[];
  const good=rows.find(x=>/company|corporation|technology|automotive|bank|semiconductor|software|energy|manufacturer|retail/i.test((x.title||'')+' '+(x.snippet||'')));
  return (good||rows[0])?.title||name;
}
async function wikiIntro(title){
  const u=new URL('https://en.wikipedia.org/w/api.php');
  u.searchParams.set('action','query');u.searchParams.set('prop','extracts|pageprops');u.searchParams.set('exintro','1');u.searchParams.set('explaintext','1');
  u.searchParams.set('redirects','1');u.searchParams.set('titles',title);u.searchParams.set('format','json');u.searchParams.set('origin','*');
  const d=await fetchJson(u);
  const page=Object.values(d?.query?.pages||{})[0]||{};
  return {title:page.title||title,summary:clean(page.extract||''),wikibase:page?.pageprops?.wikibase_item||''};
}
async function wikidata(id){
  if(!id)return null;
  const u=new URL('https://www.wikidata.org/w/api.php');
  u.searchParams.set('action','wbgetentities');u.searchParams.set('ids',id);u.searchParams.set('props','labels|descriptions|claims');
  u.searchParams.set('languages','en');u.searchParams.set('format','json');u.searchParams.set('origin','*');
  const d=await fetchJson(u);
  return d?.entities?.[id]||null;
}
async function labels(ids){
  const unique=[...new Set(ids.filter(Boolean))];if(!unique.length)return {};
  const u=new URL('https://www.wikidata.org/w/api.php');
  u.searchParams.set('action','wbgetentities');u.searchParams.set('ids',unique.slice(0,30).join('|'));u.searchParams.set('props','labels');
  u.searchParams.set('languages','en');u.searchParams.set('format','json');u.searchParams.set('origin','*');
  const d=await fetchJson(u),out={};
  for(const [id,e] of Object.entries(d?.entities||{}))out[id]=e?.labels?.en?.value||id;
  return out;
}
export default{async fetch(request){
  if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405});
  const u=new URL(request.url),ticker=text(u.searchParams.get('ticker')).toUpperCase(),name=text(u.searchParams.get('name'))||ticker;
  if(!name)return Response.json({error:'Company name required'},{status:400});

  let title=name,summary='',entity=null,sourceStatus=[];
  try{title=await wikiSearch(name);sourceStatus.push('Wikipedia search');}catch(e){}
  try{const intro=await wikiIntro(title);title=intro.title;summary=intro.summary;sourceStatus.push('Wikipedia summary');if(intro.wikibase)entity=await wikidata(intro.wikibase);}catch(e){}

  let founded='',founders=[],headquarters='',website='',description='';
  if(entity){
    try{
      founded=yearFromTime(claimTime(entity,'P571'));
      const founderIds=claimIds(entity,'P112'),hqIds=claimIds(entity,'P159'),nameMap=await labels([...founderIds,...hqIds]);
      founders=founderIds.map(id=>nameMap[id]).filter(Boolean);
      headquarters=hqIds.map(id=>nameMap[id]).filter(Boolean).join('; ');
      website=claimString(entity,'P856');
      description=entity?.descriptions?.en?.value||'';
      sourceStatus.push('Wikidata facts');
    }catch(e){}
  }

  const timeline=[];
  if(founded)timeline.push({year:founded,title:'Founded / established',text:name+' was founded or established in '+founded+'.'});
  const result={
    ticker,name,title,description,
    founded,foundedDisplay:founded,
    founders,headquarters,website,
    summary,
    sections:{origins:summary,business:summary,development:'',products:'',recent:''},
    highlights:[],
    revenueContext:{summary:'',items:[],note:'MOVA does not invent segment percentages when a verified source does not provide them.'},
    timeline,
    partial:!(summary&&founded&&founders.length&&headquarters),
    sourceLabel:sourceStatus.length?sourceStatus.join(' + '):'Company reference sources temporarily unavailable'
  };
  return Response.json(result,{headers:{'Cache-Control':'public, s-maxage=21600, stale-while-revalidate=86400'}});
}};