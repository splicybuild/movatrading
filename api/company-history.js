function text(v){return String(v||"").trim();}
function yearFromTime(v){
  const m=text(v).match(/([+-]?\d{4,})-/);
  return m?String(Number(m[1])):"";
}
function claimEntityIds(entity,prop){
  return (entity?.claims?.[prop]||[])
    .map(c=>c?.mainsnak?.datavalue?.value?.id)
    .filter(Boolean);
}
function claimTime(entity,prop){
  return (entity?.claims?.[prop]||[])
    .map(c=>c?.mainsnak?.datavalue?.value?.time)
    .find(Boolean)||"";
}
function claimString(entity,prop){
  return (entity?.claims?.[prop]||[])
    .map(c=>c?.mainsnak?.datavalue?.value)
    .find(v=>typeof v==="string")||"";
}
async function json(url){
  const r=await fetch(url,{headers:{"Accept":"application/json","User-Agent":"MOVA-Trading/1.0 company research"}});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(`History source ${r.status}`);
  return d;
}
async function searchEntity(query){
  const u=new URL("https://www.wikidata.org/w/api.php");
  u.searchParams.set("action","wbsearchentities");
  u.searchParams.set("search",query);
  u.searchParams.set("language","en");
  u.searchParams.set("type","item");
  u.searchParams.set("limit","8");
  u.searchParams.set("format","json");
  u.searchParams.set("origin","*");
  const d=await json(u);
  const results=Array.isArray(d.search)?d.search:[];
  return results.find(x=>/company|bank|corporation|business|retail|technology|financial|e-commerce|manufacturer|airline|automotive|media|telecommunications/i.test(`${x.description||""}`))||results[0]||null;
}
async function getEntity(id){
  const u=new URL("https://www.wikidata.org/w/api.php");
  u.searchParams.set("action","wbgetentities");
  u.searchParams.set("ids",id);
  u.searchParams.set("props","labels|descriptions|claims|sitelinks");
  u.searchParams.set("languages","en");
  u.searchParams.set("sitefilter","enwiki");
  u.searchParams.set("format","json");
  u.searchParams.set("origin","*");
  const d=await json(u);
  return d?.entities?.[id]||null;
}
async function labels(ids){
  if(!ids.length)return {};
  const u=new URL("https://www.wikidata.org/w/api.php");
  u.searchParams.set("action","wbgetentities");
  u.searchParams.set("ids",ids.slice(0,20).join("|"));
  u.searchParams.set("props","labels");
  u.searchParams.set("languages","en");
  u.searchParams.set("format","json");
  u.searchParams.set("origin","*");
  const d=await json(u);
  const out={};
  for(const [id,e] of Object.entries(d.entities||{}))out[id]=e?.labels?.en?.value||id;
  return out;
}
async function wikiIntro(title){
  if(!title)return "";
  const u=new URL("https://en.wikipedia.org/w/api.php");
  u.searchParams.set("action","query");
  u.searchParams.set("prop","extracts");
  u.searchParams.set("exintro","1");
  u.searchParams.set("explaintext","1");
  u.searchParams.set("redirects","1");
  u.searchParams.set("titles",title);
  u.searchParams.set("format","json");
  u.searchParams.set("origin","*");
  const d=await json(u);
  const page=Object.values(d?.query?.pages||{})[0];
  return text(page?.extract);
}
function buildTimeline({founded,founders,ipo,title,description}){
  const items=[];
  const fy=yearFromTime(founded)||text(founded).match(/\b(1[5-9]\d{2}|20\d{2})\b/)?.[1]||"";
  if(fy)items.push({year:fy,title:"Founded / established",text:`${title} was established${founders.length?` by ${founders.join(", ")}`:""}.`});
  const iy=text(ipo).match(/\b(19|20)\d{2}\b/)?.[0]||"";
  if(iy&&iy!==fy)items.push({year:iy,title:"Public-market milestone",text:`MOVA's market profile records a listing / IPO milestone in ${iy}.`});
  if(description)items.push({year:"Today",title:"Current business",text:description.charAt(0).toUpperCase()+description.slice(1)+("." )});
  return items;
}

export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const u=new URL(request.url);
  const ticker=text(u.searchParams.get("ticker")).toUpperCase();
  const name=text(u.searchParams.get("name"));
  if(!name)return Response.json({error:"Company name required"},{status:400});

  try{
    const hit=await searchEntity(name);
    if(!hit)return Response.json({error:"No company-history match found"},{status:404});
    const entity=await getEntity(hit.id);
    if(!entity)return Response.json({error:"Company-history entity unavailable"},{status:404});

    const founderIds=claimEntityIds(entity,"P112");
    const hqIds=claimEntityIds(entity,"P159");
    const idLabels=await labels([...new Set([...founderIds,...hqIds])]);

    const founded=claimTime(entity,"P571");
    const founders=founderIds.map(id=>idLabels[id]).filter(Boolean);
    const headquarters=hqIds.map(id=>idLabels[id]).filter(Boolean).join(", ");
    const website=claimString(entity,"P856");
    const title=entity?.sitelinks?.enwiki?.title||hit.label||name;
    const description=entity?.descriptions?.en?.value||hit.description||"";
    const intro=await wikiIntro(title);

    return Response.json({
      ticker,name,
      entityId:hit.id,
      title,
      description,
      founded,
      founders,
      headquarters,
      website,
      summary:intro||`${name} is ${description||"a listed company"}.`,
      timeline:buildTimeline({founded,founders,ipo:"",title:name,description}),
      sourceLabel:"Company history: Wikidata structured facts + English Wikipedia introductory company history; market performance remains sourced from MOVA's price-history feed."
    },{
      headers:{"Cache-Control":"public, s-maxage=604800, stale-while-revalidate=2592000"}
    });
  }catch(e){
    return Response.json({error:e.message||"Company history unavailable"},{status:502});
  }
 }
};