function text(v){return String(v||"").trim();}
function clean(s){return text(s).replace(/\[[^\]]*\]/g,"").replace(/\s+/g," ").trim();}
function yearFromTime(v){const m=text(v).match(/([+-]?\d{4,})-/);return m?String(Number(m[1])):"";}
function claimEntityIds(e,p){return (e?.claims?.[p]||[]).map(c=>c?.mainsnak?.datavalue?.value?.id).filter(Boolean);}
function claimTime(e,p){return (e?.claims?.[p]||[]).map(c=>c?.mainsnak?.datavalue?.value?.time).find(Boolean)||"";}
function claimString(e,p){return (e?.claims?.[p]||[]).map(c=>c?.mainsnak?.datavalue?.value).find(v=>typeof v==="string")||"";}
async function json(url){const r=await fetch(url,{headers:{"Accept":"application/json","User-Agent":"MOVA-Trading/1.0 research"}});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`Research source ${r.status}`);return d;}
async function searchEntity(query,ticker){
 for(const q of [`${query} company`,query,ticker].filter(Boolean)){
  const u=new URL("https://www.wikidata.org/w/api.php");u.searchParams.set("action","wbsearchentities");u.searchParams.set("search",q);u.searchParams.set("language","en");u.searchParams.set("type","item");u.searchParams.set("limit","10");u.searchParams.set("format","json");u.searchParams.set("origin","*");
  const d=await json(u),r=Array.isArray(d.search)?d.search:[],hit=r.find(x=>/company|corporation|business|bank|semiconductor|technology|software|retail|e-commerce|manufacturer|financial|pharmaceutical|energy|telecommunications/i.test(`${x.description||""}`));if(hit)return hit;if(r[0])return r[0];
 }return null;
}
async function getEntity(id){const u=new URL("https://www.wikidata.org/w/api.php");u.searchParams.set("action","wbgetentities");u.searchParams.set("ids",id);u.searchParams.set("props","labels|descriptions|claims|sitelinks");u.searchParams.set("languages","en");u.searchParams.set("sitefilter","enwiki");u.searchParams.set("format","json");u.searchParams.set("origin","*");const d=await json(u);return d?.entities?.[id]||null;}
async function labels(ids){if(!ids.length)return {};const u=new URL("https://www.wikidata.org/w/api.php");u.searchParams.set("action","wbgetentities");u.searchParams.set("ids",ids.slice(0,40).join("|"));u.searchParams.set("props","labels");u.searchParams.set("languages","en");u.searchParams.set("format","json");u.searchParams.set("origin","*");const d=await json(u),o={};for(const [id,e] of Object.entries(d.entities||{}))o[id]=e?.labels?.en?.value||id;return o;}
async function wikiPage(title){
 const a=new URL("https://en.wikipedia.org/w/api.php");a.searchParams.set("action","query");a.searchParams.set("prop","extracts");a.searchParams.set("explaintext","1");a.searchParams.set("redirects","1");a.searchParams.set("titles",title);a.searchParams.set("format","json");a.searchParams.set("origin","*");
 const b=new URL("https://en.wikipedia.org/w/api.php");b.searchParams.set("action","parse");b.searchParams.set("page",title);b.searchParams.set("prop","sections");b.searchParams.set("format","json");b.searchParams.set("origin","*");
 const [intro,sec]=await Promise.all([json(a),json(b)]),page=Object.values(intro?.query?.pages||{})[0];return {extract:clean(page?.extract),sections:sec?.parse?.sections||[]};
}
async function wikiSection(title,index){
 const u=new URL("https://en.wikipedia.org/w/api.php");u.searchParams.set("action","parse");u.searchParams.set("page",title);u.searchParams.set("prop","wikitext");u.searchParams.set("section",String(index));u.searchParams.set("format","json");u.searchParams.set("origin","*");
 const d=await json(u);let s=text(d?.parse?.wikitext?.["*"]);
 s=s.replace(/\{\{[\s\S]*?\}\}/g," ").replace(/<ref[\s\S]*?<\/ref>/gi," ").replace(/<ref[^>]*\/>/gi," ").replace(/<[^>]+>/g," ").replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g,"$1").replace(/\[https?:\/\/[^\s\]]+\s*([^\]]*)\]/g,"$1").replace(/'{2,3}/g,"").replace(/^=+.*?=+$/gm," ").replace(/\{\|[\s\S]*?\|\}/g," ").replace(/\s+/g," ").trim();
 return s.slice(0,6500);
}
function chooseSection(s,p){return s.find(x=>p.some(r=>r.test(text(x.line))))||null;}
function firstParagraphs(s,max=2200){s=clean(s);if(!s)return "";const p=s.split(/(?<=[.!?])\s+/);let o="";for(const x of p){if((o+" "+x).length>max)break;o+=(o?" ":"")+x;}return o||s.slice(0,max);}
function buildTimeline(founded,founders,title,h){const a=[],fy=yearFromTime(founded);if(fy)a.push({year:fy,title:"Founded / established",text:`${title} was established${founders.length?` by ${founders.join(", ")}`:""}.`});for(const y of [...new Set((text(h).match(/\b(?:18|19|20)\d{2}\b/g)||[]))].filter(y=>y!==fy).slice(0,5))a.push({year:y,title:"Company milestone",text:`The company's history records an important stage of development around ${y}.`});a.push({year:"Today",title:"Current business",text:`${title} continues to operate in its current markets.`});return a.slice(0,7);}
function revenueContext(title,b,p){
 const s=clean(`${b} ${p}`).split(/(?<=[.!?])\s+/).filter(x=>/revenue|sales|subscription|advertis|cloud|service|segment|product|commerce|licen[cs]|fee|customer|business model/i.test(x)).slice(0,6);
 return {summary:s.length?firstParagraphs(s.join(" "),1600):`${title}'s revenue comes from the products, services and operating activities described in its business profile. Exact segment figures are only shown when supported by the source.`,items:s.slice(0,4).map((x,i)=>({label:`Revenue / business area ${i+1}`,description:x})),note:"MOVA does not invent revenue percentages or segment figures when the underlying source does not provide them."};
}
export default{async fetch(request){
 if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
 const u=new URL(request.url),ticker=text(u.searchParams.get("ticker")).toUpperCase(),name=text(u.searchParams.get("name"));if(!name)return Response.json({error:"Company name required"},{status:400});
 try{
  const hit=await searchEntity(name,ticker);if(!hit)return Response.json({error:"No company-history match found"},{status:404});const e=await getEntity(hit.id);if(!e)return Response.json({error:"Company entity unavailable"},{status:404});
  const fi=claimEntityIds(e,"P112"),hi=claimEntityIds(e,"P159"),ls=await labels([...new Set([...fi,...hi])]),founded=claimTime(e,"P571"),founders=fi.map(id=>ls[id]).filter(Boolean),headquarters=hi.map(id=>ls[id]).filter(Boolean).join(", "),website=claimString(e,"P856"),title=e?.sitelinks?.enwiki?.title||hit.label||name,description=e?.descriptions?.en?.value||hit.description||"",page=await wikiPage(title);
  const hs=chooseSection(page.sections,[/^history$/i,/found/i,/early years/i,/origins/i]),bs=chooseSection(page.sections,[/business/i,/operations/i,/company affairs/i,/corporate/i]),ps=chooseSection(page.sections,[/products/i,/services/i,/divisions/i,/segments/i,/subsidiar/i]),rs=chooseSection(page.sections,[/recent/i,/202\d/i,/acquisition/i,/expansion/i]);
  const [hr,br,pr,rr]=await Promise.all([hs?wikiSection(title,hs.index):"",bs?wikiSection(title,bs.index):"",ps?wikiSection(title,ps.index):"",rs?wikiSection(title,rs.index):""]);
  const origins=firstParagraphs(hr||page.extract,3200),business=firstParagraphs(br||page.extract,2800),products=firstParagraphs(pr,2600),recent=firstParagraphs(rr,2200),development=firstParagraphs(hr,4000);
  return Response.json({ticker,name,entityId:hit.id,title,description,founded,foundedDisplay:yearFromTime(founded)||founded,founders,headquarters,website,summary:firstParagraphs(page.extract,2800)||`${name} is ${description||"a listed company"}.`,sections:{origins,business,development,products,recent},revenueContext:revenueContext(name,business,products),timeline:buildTimeline(founded,founders,name,hr),sourceLabel:"Detailed company research: Wikidata structured facts + English Wikipedia company overview/history/business sections. Market prices, fundamentals and news remain on MOVA's dedicated feeds."},{headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"}});
 }catch(e){return Response.json({error:e.message||"Company history unavailable"},{status:502});}
}};