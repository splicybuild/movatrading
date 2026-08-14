function text(v){return String(v||"").trim();}
function clean(s){
  return text(s)
    .replace(/\{\{cite[^}]*\}\}/gi," ")
    .replace(/\[[0-9]+\]/g," ")
    .replace(/\s+/g," ")
    .trim();
}
async function fetchJson(url){
  const r=await fetch(url,{headers:{"Accept":"application/json","User-Agent":"MOVA-Trading/1.0"}});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(`Research source ${r.status}`);
  return d;
}
function stripWiki(s){
  s=text(s);
  s=s.replace(/<ref[\s\S]*?<\/ref>/gi," ").replace(/<ref[^>]*\/>/gi," ");
  s=s.replace(/\{\|[\s\S]*?\|\}/g," ");
  s=s.replace(/\{\{[\s\S]*?\}\}/g," ");
  s=s.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g,"$1");
  s=s.replace(/\[https?:\/\/[^\s\]]+\s*([^\]]*)\]/g,"$1");
  s=s.replace(/'{2,3}/g,"").replace(/<[^>]+>/g," ");
  s=s.replace(/^=+.*?=+$/gm," ");
  return clean(s);
}
function firstSentences(s,max=2600){
  s=stripWiki(s); if(!s)return "";
  const parts=s.split(/(?<=[.!?])\s+/);
  let out="";
  for(const p of parts){if((out+" "+p).length>max)break;out+=(out?" ":"")+p;}
  return out||s.slice(0,max);
}
async function wikipediaSearch(name){
  const u=new URL("https://en.wikipedia.org/w/api.php");
  u.searchParams.set("action","query");
  u.searchParams.set("list","search");
  u.searchParams.set("srsearch",`${name} company`);
  u.searchParams.set("srlimit","8");
  u.searchParams.set("format","json");
  u.searchParams.set("origin","*");
  const d=await fetchJson(u);
  const rows=d?.query?.search||[];
  const good=rows.find(x=>/company|corporation|bank|semiconductor|technology|software|retail|energy|pharmaceutical|telecommunications|manufacturer/i.test(`${x.title} ${stripWiki(x.snippet||"")}`));
  return (good||rows[0])?.title||name;
}
async function wikiIntroAndSections(title){
  const intro=new URL("https://en.wikipedia.org/w/api.php");
  intro.searchParams.set("action","query");
  intro.searchParams.set("prop","extracts|pageprops");
  intro.searchParams.set("explaintext","1");
  intro.searchParams.set("redirects","1");
  intro.searchParams.set("titles",title);
  intro.searchParams.set("format","json");
  intro.searchParams.set("origin","*");

  const parse=new URL("https://en.wikipedia.org/w/api.php");
  parse.searchParams.set("action","parse");
  parse.searchParams.set("page",title);
  parse.searchParams.set("prop","sections|wikitext");
  parse.searchParams.set("format","json");
  parse.searchParams.set("origin","*");

  const [a,b]=await Promise.all([fetchJson(intro),fetchJson(parse)]);
  const page=Object.values(a?.query?.pages||{})[0]||{};
  return {
    title:page.title||title,
    intro:clean(page.extract||""),
    wikibase:page?.pageprops?.wikibase_item||"",
    sections:b?.parse?.sections||[],
    fullWikitext:text(b?.parse?.wikitext?.["*"])
  };
}
async function wikiSection(title,index){
  const u=new URL("https://en.wikipedia.org/w/api.php");
  u.searchParams.set("action","parse");
  u.searchParams.set("page",title);
  u.searchParams.set("prop","wikitext");
  u.searchParams.set("section",String(index));
  u.searchParams.set("format","json");
  u.searchParams.set("origin","*");
  const d=await fetchJson(u);
  return text(d?.parse?.wikitext?.["*"]);
}
function chooseSection(sections,patterns){
  return sections.find(s=>patterns.some(p=>p.test(text(s.line))))||null;
}
function infoboxField(wiki, names){
  for(const name of names){
    const re=new RegExp(`\\n\\|\\s*${name}\\s*=\\s*([^\\n]+)`,"i");
    const m=wiki.match(re);
    if(m)return stripWiki(m[1]).replace(/\{\{.*?\}\}/g,"").trim();
  }
  return "";
}
function normaliseFounded(v){
  v=stripWiki(v);
  const m=v.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)?\s*\d{0,2},?\s*(18|19|20)\d{2}\b/i);
  return m?m[0].trim():v;
}
async function wikidataEntity(id){
  if(!id)return null;
  const u=new URL("https://www.wikidata.org/w/api.php");
  u.searchParams.set("action","wbgetentities");
  u.searchParams.set("ids",id);
  u.searchParams.set("props","labels|descriptions|claims");
  u.searchParams.set("languages","en");
  u.searchParams.set("format","json");
  u.searchParams.set("origin","*");
  try{
    const d=await fetchJson(u);
    return d?.entities?.[id]||null;
  }catch(e){return null;}
}
function claimIds(entity,p){
  return (entity?.claims?.[p]||[]).map(c=>c?.mainsnak?.datavalue?.value?.id).filter(Boolean);
}
function claimTime(entity,p){
  return (entity?.claims?.[p]||[]).map(c=>c?.mainsnak?.datavalue?.value?.time).find(Boolean)||"";
}
function claimString(entity,p){
  return (entity?.claims?.[p]||[]).map(c=>c?.mainsnak?.datavalue?.value).find(v=>typeof v==="string")||"";
}
async function entityLabels(ids){
  if(!ids.length)return {};
  const u=new URL("https://www.wikidata.org/w/api.php");
  u.searchParams.set("action","wbgetentities");
  u.searchParams.set("ids",ids.slice(0,30).join("|"));
  u.searchParams.set("props","labels");
  u.searchParams.set("languages","en");
  u.searchParams.set("format","json");
  u.searchParams.set("origin","*");
  try{
    const d=await fetchJson(u),o={};
    for(const [id,e] of Object.entries(d.entities||{}))o[id]=e?.labels?.en?.value||id;
    return o;
  }catch(e){return {};}
}
function yearFromTime(v){
  const m=text(v).match(/([+-]?\d{4,})-/);
  return m?String(Number(m[1])):"";
}
function buildTimeline(title,founded,founders,historyText){
  const out=[];
  const fy=(normaliseFounded(founded).match(/\b(18|19|20)\d{2}\b/)||[])[0]||yearFromTime(founded);
  if(fy)out.push({year:fy,title:"Founded / established",text:`${title} was established${founders.length?` by ${founders.join(", ")}`:""}.`});
  const yrs=[...new Set((stripWiki(historyText).match(/\b(?:18|19|20)\d{2}\b/g)||[]))].filter(y=>y!==fy).slice(0,5);
  for(const y of yrs)out.push({year:y,title:"Company milestone",text:`The company's history records an important stage of development around ${y}.`});
  out.push({year:"Today",title:"Current business",text:`${title} continues to operate in its current markets.`});
  return out.slice(0,7);
}
function revenueContext(title,business,products){
  const combined=stripWiki(`${business} ${products}`);
  const sentences=combined.split(/(?<=[.!?])\s+/).filter(Boolean);
  const hits=sentences.filter(s=>/revenue|sales|subscription|advertis|cloud|service|segment|product|commerce|licen[cs]|fee|customer|business model|data center|gaming|client|embedded/i.test(s)).slice(0,7);
  return {
    summary:hits.length?firstSentences(hits.join(" "),1700):`${title}'s revenue comes from the products, services and operating activities described in its business profile. Exact segment figures are only shown when supported by the underlying source.`,
    items:hits.slice(0,5).map((s,i)=>({label:`Revenue / business area ${i+1}`,description:s})),
    note:"MOVA does not invent revenue percentages or segment figures when a source does not provide them."
  };
}
export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const u=new URL(request.url);
  const ticker=text(u.searchParams.get("ticker")).toUpperCase();
  const name=text(u.searchParams.get("name"));
  if(!name)return Response.json({error:"Company name required"},{status:400});

  try{
    // Wikipedia is the primary source because it is much more reliable for every named company.
    const guessedTitle=await wikipediaSearch(name);
    const page=await wikiIntroAndSections(guessedTitle);

    const hs=chooseSection(page.sections,[/^history$/i,/found/i,/early years/i,/origins/i,/formation/i]);
    const bs=chooseSection(page.sections,[/business/i,/operations/i,/company affairs/i,/corporate/i,/activities/i]);
    const ps=chooseSection(page.sections,[/products/i,/services/i,/divisions/i,/segments/i,/subsidiar/i,/portfolio/i]);
    const rs=chooseSection(page.sections,[/recent/i,/202\d/i,/acquisition/i,/expansion/i,/developments/i]);

    const [historyRaw,businessRaw,productsRaw,recentRaw]=await Promise.all([
      hs?wikiSection(page.title,hs.index):Promise.resolve(""),
      bs?wikiSection(page.title,bs.index):Promise.resolve(""),
      ps?wikiSection(page.title,ps.index):Promise.resolve(""),
      rs?wikiSection(page.title,rs.index):Promise.resolve("")
    ]);

    // Structured facts: use exact Wikipedia page -> Wikidata id, with infobox fallback.
    const entity=await wikidataEntity(page.wikibase);
    const founderIds=claimIds(entity,"P112");
    const hqIds=claimIds(entity,"P159");
    const labels=await entityLabels([...new Set([...founderIds,...hqIds])]);

    const infoboxFounders=infoboxField(page.fullWikitext,["founder","founders"]);
    const infoboxFounded=infoboxField(page.fullWikitext,["founded","foundation","established"]);
    const infoboxHq=infoboxField(page.fullWikitext,["hq_location","headquarters","location"]);
    const infoboxWebsite=infoboxField(page.fullWikitext,["website","homepage"]);

    const founded=normaliseFounded(claimTime(entity,"P571")||infoboxFounded);
    const founders=founderIds.length?founderIds.map(id=>labels[id]).filter(Boolean):(infoboxFounders?infoboxFounders.split(/,| and /).map(clean).filter(Boolean):[]);
    const headquarters=hqIds.length?hqIds.map(id=>labels[id]).filter(Boolean).join(", "):infoboxHq;
    const website=claimString(entity,"P856")||infoboxWebsite;

    const origins=firstSentences(historyRaw||page.intro,3300);
    const business=firstSentences(businessRaw||page.intro,3000);
    const products=firstSentences(productsRaw,2800);
    const recent=firstSentences(recentRaw,2400);
    const development=firstSentences(historyRaw,4200);

    return Response.json({
      ticker,name,title:page.title,
      description:entity?.descriptions?.en?.value||"",
      founded,foundedDisplay:founded,
      founders,headquarters,website,
      summary:firstSentences(page.intro,3000),
      sections:{origins,business,development,products,recent},
      revenueContext:revenueContext(name,business,products),
      timeline:buildTimeline(name,founded,founders,historyRaw),
      sourceLabel:"Detailed company research: English Wikipedia company article (primary) + exact-page Wikidata structured facts, with Wikipedia infobox fallback for founder/founded/headquarters/website."
    },{
      headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"}
    });
  }catch(e){
    return Response.json({error:e.message||"Company history unavailable"},{status:502});
  }
 }
};