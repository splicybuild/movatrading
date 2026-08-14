function text(v){return String(v||"").trim();}
function clean(s){
  return text(s)
    .replace(/\[\[[^\]]*?\|(?:left|right|center|thumb|frameless|\d+px)[^\]]*\]\]/gi," ")
    .replace(/\[\[File:[^\]]+\]\]/gi," ")
    .replace(/\[\[Image:[^\]]+\]\]/gi," ")
    .replace(/\[[^\]]*\]/g," ")
    .replace(/\bthumb\b/gi," ")
    .replace(/(^|\s)\|+\s*/g,"$1")
    .replace(/\b(?:left|right|center|thumb|frameless)\s*\|\s*\d+px\s*\|?/gi," ")
    .replace(/\b\d+px\s*\|/gi," ")
    .replace(/\b[a-z_]{2,30}\s*=\s*(?=[A-Z0-9])/g," ")
    .replace(/\s*\*\s*/g," ")
    .replace(/\s*•\s*/g," ")
    .replace(/\s+/g," ")
    .replace(/^[|,;:\s]+|[|,;:\s]+$/g,"")
    .trim();
}
function stripWiki(s){
  s=text(s);
  s=s.replace(/<ref[\s\S]*?<\/ref>/gi," ").replace(/<ref[^>]*\/>/gi," ");
  s=s.replace(/\{\|[\s\S]*?\|\}/g," ");
  s=s.replace(/\{\{[\s\S]*?\}\}/g," ");
  s=s.replace(/\[\[(?:File|Image):[^\]]+\]\]/gi," ");
  s=s.replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g,"$1");
  s=s.replace(/\[https?:\/\/[^\s\]]+\s*([^\]]*)\]/g,"$1");
  s=s.replace(/'{2,3}/g,"").replace(/<[^>]+>/g," ");
  s=s.replace(/^=+.*?=+$/gm," ");
  s=s.replace(/\b(?:left|right|center|thumb|frameless)\s*\|\s*\d+px\s*\|?/gi," ");
  s=s.replace(/\b\d+px\s*\|/gi," ");
  s=s.replace(/(^|\s)\|+\s*/g,"$1");
  s=s.replace(/\b[a-z_]{2,30}\s*=\s*(?=[A-Z0-9])/g," ");
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

function sanitizeInfoboxValue(v){
  let s=stripWiki(v);
  if(!s)return "";
  // Reject a value that has leaked into the next infobox parameter.
  if(/\|\s*[a-z_]{2,30}\s*=/.test(s) || /\b[a-z_]{2,30}\s*=\s*/.test(s))return "";
  return clean(s);
}
async function wikidataEntityWithClaims(id){
  if(!id)return null;
  const u=new URL("https://www.wikidata.org/w/api.php");
  u.searchParams.set("action","wbgetentities");u.searchParams.set("ids",id);
  u.searchParams.set("props","labels|claims");u.searchParams.set("languages","en");
  u.searchParams.set("format","json");u.searchParams.set("origin","*");
  try{const d=await fetchJson(u);return d?.entities?.[id]||null;}catch(e){return null;}
}
function entityLabel(e,id){return e?.labels?.en?.value||id||"";}
async function resolveLocationEntity(id,depth=0,seen=new Set()){
  if(!id||depth>4||seen.has(id))return [];
  seen.add(id);
  const e=await wikidataEntityWithClaims(id);if(!e)return [];
  const label=entityLabel(e,id),parts=label?[label]:[];
  const countryId=claimIds(e,"P17")[0]||"";
  const parentId=claimIds(e,"P131")[0]||"";
  if(parentId){
    const parents=await resolveLocationEntity(parentId,depth+1,seen);
    for(const p of parents)if(p&&!parts.includes(p))parts.push(p);
  }
  if(countryId){
    const ce=await wikidataEntityWithClaims(countryId),cl=entityLabel(ce,countryId);
    if(cl&&!parts.includes(cl))parts.push(cl);
  }
  return parts;
}
async function resolveHeadquarters(hqIds,infoboxHq,infoboxCity,infoboxCountry){
  if(hqIds&&hqIds.length){
    const groups=[];
    for(const id of hqIds.slice(0,2)){
      const p=await resolveLocationEntity(id);
      if(p.length)groups.push(p.join(", "));
    }
    if(groups.length)return groups.join("; ");
  }
  const parts=[sanitizeInfoboxValue(infoboxHq),sanitizeInfoboxValue(infoboxCity),sanitizeInfoboxValue(infoboxCountry)].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

function yearFromTime(v){
  const m=text(v).match(/([+-]?\d{4,})-/);
  return m?String(Number(m[1])):"";
}
function buildTimeline(title,founded,founders,historyText){
  const out=[],plain=stripWiki(historyText),fy=(normaliseFounded(founded).match(/\b(18|19|20)\d{2}\b/)||[])[0]||yearFromTime(founded);
  if(fy)out.push({year:fy,title:"Founded / established",text:`${title} was established${founders.length?` by ${founders.join(", ")}`:""}.`});
  const sentences=plain.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(s=>s.length>45&&s.length<420),seen=new Set();
  for(const sentence of sentences){
    for(const y of [...new Set(sentence.match(/\b(?:18|19|20)\d{2}\b/g)||[])]){
      if(y===fy||seen.has(y))continue;
      if(!/(launch|acquir|expand|introduc|appoint|merge|restructur|list|public|open|found|establish|enter|sell|buy|create|spin|announce|become|rename|move|invest|release|start|begin)/i.test(sentence))continue;
      const cleanedSentence=clean(sentence.replace(/^In\s+(?:18|19|20)\d{2},?\s*/i,""));
      if(!cleanedSentence || /logo used|image|photograph|pictured|sculpture|caption/i.test(cleanedSentence))continue;
      const t=/acquir/i.test(sentence)?"Acquisition":/launch|introduc|release/i.test(sentence)?"Launch / product milestone":/expand|open|enter/i.test(sentence)?"Expansion":/restructur/i.test(sentence)?"Restructuring":/list|public/i.test(sentence)?"Public-market milestone":/appoint/i.test(sentence)?"Leadership change":"Company milestone";
      out.push({year:y,title:t,text:cleanedSentence});
      seen.add(y);if(out.length>=7)break;
    }
    if(out.length>=7)break;
  }
  return out.slice(0,7);
}
function revenueContext(title,business,products){
  const sentences=stripWiki(`${business} ${products}`).split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean),hits=[];
  for(const s of sentences){
    if(s.length<45||s.length>300)continue;
    if(/former|chairman|chief executive|atm|branch|office|subsidiar|closed|technologies centre|member of the global atm alliance/i.test(s))continue;
    if(!/(revenue|sales|fees|interest income|investment banking|wealth management|retail banking|commercial banking|cloud|advertising|subscription|services|products|e-commerce|marketplace|payments|data center|gaming|client|embedded|licensing)/i.test(s))continue;
    hits.push(s);if(hits.length>=6)break;
  }
  return {summary:hits.length?firstSentences(hits.slice(0,3).join(" "),950):`${title} generates revenue from its main products, services and business activities.`,items:hits.slice(0,5).map((s,i)=>({label:`Key revenue / business area ${i+1}`,description:s})),note:"Concise business-model summary. MOVA does not invent segment percentages or figures when the source does not provide them."};
}



function normalizeOfficialWebsite(v){
  let s=clean(v);
  if(!s)return "";
  s=s.replace(/^\{\{|\}\}$/g,"").replace(/^\[|\]$/g,"").trim();
  // Reject leaked wiki/template residue or anything that is not plausibly a hostname/url.
  if(/[{}|=]/.test(s))return "";
  const urlMatch=s.match(/https?:\/\/[^\s]+/i);
  if(urlMatch)s=urlMatch[0];
  else{
    const host=s.match(/\b(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+\b/i);
    if(!host)return "";
    s=host[0];
  }
  s=s.replace(/[),.;]+$/,"");
  if(!/^https?:\/\//i.test(s))s=`https://${s}`;
  try{
    const u=new URL(s);
    if(!u.hostname.includes("."))return "";
    return u.toString().replace(/\/$/,"");
  }catch(e){return "";}
}

function validFoundedValue(v){
  const s=clean(v);
  if(!s)return "";
  // A founding value must contain a plausible year. This prevents location fragments
  // such as "in the City of London, Kingdom of England" entering the Founded field.
  const m=s.match(/\b(16|17|18|19|20)\d{2}\b/);
  if(!m)return "";
  return s;
}
function normalizeCompanyLocation(v){
  let s=clean(v);if(!s)return "";
  s=s
    .replace(/\bKingdom of England\b/gi,"United Kingdom")
    .replace(/\bGreat Britain\b/gi,"United Kingdom")
    .replace(/\bU\.S\.A?\.?\b/gi,"United States")
    .replace(/\bUSA\b/gi,"United States")
    .replace(/\bUK\b/g,"United Kingdom")
    .replace(/\bEngland,\s*United Kingdom\b/gi,"United Kingdom")
    .replace(/\bLondon,\s*England\b/gi,"London, United Kingdom")
    .replace(/\bNew York City,\s*New York City\b/gi,"New York City")
    .replace(/\bUnited States of America\b/gi,"United States");

  const cityCountry=[
    [/\bNew York City\b|\bManhattan\b/i,"United States"],
    [/\bCharlotte\b/i,"United States"],[/\bSan Francisco\b/i,"United States"],
    [/\bToronto\b/i,"Canada"],[/\bMontreal\b/i,"Canada"],
    [/\bEdinburgh\b/i,"United Kingdom"],[/\bLondon\b/i,"United Kingdom"],
    [/\bMadrid\b/i,"Spain"],[/\bZurich\b/i,"Switzerland"],[/\bFrankfurt\b/i,"Germany"],
    [/\bTokyo\b/i,"Japan"],[/\bAmsterdam\b/i,"Netherlands"]
  ];
  for(const [re,country] of cityCountry){if(re.test(s)&&!new RegExp(`\\b${country.replace(/ /g,"\\s+")}\\b`,`i`).test(s))s=`${s}, ${country}`;}
  return [...new Set(s.split(/\s*,\s*/).filter(Boolean))].join(", ");
}
const COMPANY_FACT_OVERRIDES={
  "BCS":{
    founded:"1690",
    founders:["John Freame","Thomas Gould"],
    headquarters:"1 Churchill Place, Canary Wharf, London, United Kingdom",
    website:"https://home.barclays"
  },
  "JPM":{
    founded:"2000",
    founders:["No single founder — JPMorgan Chase was formed by the merger of Chase Manhattan Bank and J.P. Morgan & Co.; major predecessor founders include Aaron Burr and J. Pierpont Morgan"],
    headquarters:"270 Park Avenue, New York City, New York, United States",
    website:"https://www.jpmorganchase.com"
  },
  "LYG":{
    founded:"2009",
    founders:["No single founder — Lloyds Banking Group was formed through the acquisition of HBOS by Lloyds TSB; Lloyds Bank traces its roots to John Taylor and Sampson Lloyd in 1765"],
    headquarters:"London, United Kingdom",
    website:"https://www.lloydsbankinggroup.com"
  },
  "NWG":{
    headquarters:"36 St Andrew Square, Edinburgh, United Kingdom",
    website:"https://www.natwestgroup.com"
  },
  "SAN":{
    headquarters:"Boadilla del Monte, Madrid, Spain",
    website:"https://www.santander.com"
  }
};

function extractFoundedFromText(...parts){
  const t=stripWiki(parts.filter(Boolean).join(" "));
  const patterns=[
    /\b(?:founded|established|formed|incorporated|created|started)\s+(?:in|on)?\s*([A-Z][a-z]+\s+\d{1,2},\s+(?:18|19|20)\d{2})/i,
    /\b(?:founded|established|formed|incorporated|created|started)\s+(?:in|on)?\s*((?:18|19|20)\d{2})/i,
    /\b(?:was|were)\s+(?:founded|established|formed|incorporated|created)\s+(?:in|on)?\s*([A-Z][a-z]+\s+\d{1,2},\s+(?:18|19|20)\d{2})/i,
    /\b(?:was|were)\s+(?:founded|established|formed|incorporated|created)\s+(?:in|on)?\s*((?:18|19|20)\d{2})/i
  ];
  for(const p of patterns){const m=t.match(p);if(m)return m[1];}
  return "";
}
function extractFoundersFromText(...parts){
  const t=stripWiki(parts.filter(Boolean).join(" "));
  const patterns=[
    /\b(?:founded|co-founded|established|started|created)\s+by\s+([^.;]{3,180})/i,
    /\b(?:was|were)\s+(?:founded|co-founded|established|started|created)\s+by\s+([^.;]{3,180})/i
  ];
  for(const p of patterns){
    const m=t.match(p);
    if(m){
      let s=m[1]
        .replace(/\s+(?:in|on)\s+(?:[A-Z][a-z]+\s+\d{1,2},\s+)?(?:18|19|20)\d{2}.*$/i,"")
        .replace(/\s+as\s+.*$/i,"")
        .trim();
      const names=s.split(/,\s*|\s+and\s+/i)
        .map(x=>clean(x))
        .filter(x=>x && x.length>1 && x.length<90 && !/company|corporation|group|bank|holdings|plc|inc\.?|limited|ltd\.?/i.test(x));
      if(names.length)return [...new Set(names)].slice(0,6);
    }
  }
  return [];
}

const CURATED_COMPANY_FALLBACKS={"LYG":{"overview":"Lloyds Banking Group is a major UK financial-services group whose principal brands include Lloyds Bank, Halifax, Bank of Scotland and Scottish Widows. The current group was created in 2009 when Lloyds TSB acquired HBOS, bringing together banking and insurance businesses with roots stretching back more than three centuries.","founded":"2009","founders":["No single founder — the current group was formed through Lloyds TSB's acquisition of HBOS; Lloyds Bank itself was founded in 1765 by John Taylor and Sampson Lloyd"],"headquarters":"25 Gresham Street, London, United Kingdom; registered office: The Mound, Edinburgh, United Kingdom","website":"https://www.lloydsbankinggroup.com","description":"UK Banking & Financial Services","origins":"Lloyds Banking Group was formed in 2009, but its major brands have much older histories. Bank of Scotland was founded in Edinburgh in 1695, Lloyds Bank began in Birmingham in 1765 as Taylors & Lloyds, Scottish Widows opened in Edinburgh in 1815, and Halifax was founded in 1852. Lloyds TSB acquired HBOS in 2009 to create the present group.","business":"The group provides retail and commercial banking, mortgages, savings, credit cards, motor and asset finance, insurance, pensions, investments and wealth-management services, primarily in the United Kingdom.","products":"Key brands include Lloyds Bank, Halifax, Bank of Scotland and Scottish Widows. Its activities span consumer banking, business and commercial banking, mortgages, cards, motor finance, insurance, pensions, investments and wealth.","recent":"The group has increasingly focused on digital banking, cost efficiency and a UK-centred business model while investing in technology and data capabilities.","timeline":[{"year":"1695","title":"Bank of Scotland founded","text":"Bank of Scotland, now one of the group's core brands, was founded in Edinburgh."},{"year":"1765","title":"Lloyds Bank founded","text":"John Taylor and Sampson Lloyd established Taylors & Lloyds in Birmingham, the business that became Lloyds Bank."},{"year":"1815","title":"Scottish Widows opened","text":"Scottish Widows began operating in Edinburgh and later became part of the group."},{"year":"1852","title":"Halifax founded","text":"The Halifax Permanent Benefit Building Society was established to help working people buy or build homes."},{"year":"1995","title":"Lloyds TSB formed","text":"Lloyds Bank and TSB Group agreed to merge, creating Lloyds TSB Group."},{"year":"2009","title":"Lloyds Banking Group formed","text":"Lloyds TSB acquired HBOS, creating the present Lloyds Banking Group."}],"highlights":["One of the UK's largest retail-banking groups.","Major brands include Lloyds Bank, Halifax, Bank of Scotland and Scottish Widows.","The current group was formed in 2009, but its heritage stretches back to 1695 and 1765.","Revenue is driven mainly by banking income, lending, mortgages, insurance, pensions and other financial services."]},"NWG":{"overview":"NatWest Group is a UK-centred banking group headquartered in Edinburgh. Its principal brands include NatWest, Royal Bank of Scotland, Coutts and Ulster Bank. The current corporate entity traces its formation to 1968–69, while important predecessor banks date back centuries.","founded":"1968","founders":["No single founder — the current group developed through the combination of Royal Bank of Scotland and National Commercial Bank of Scotland"],"headquarters":"Gogarburn, 175 Glasgow Road, Edinburgh, Scotland, United Kingdom","website":"https://www.natwestgroup.com","description":"UK Banking & Financial Services","origins":"The current group was incorporated in 1968 as National & Commercial Banking Group ahead of the 1969 combination of the Royal Bank of Scotland and National Commercial Bank of Scotland. Royal Bank of Scotland itself was founded in Edinburgh in 1727. The group acquired NatWest in 2000 and changed its corporate name to NatWest Group in 2020.","business":"NatWest Group provides personal, business and commercial banking, private banking, payments, lending, mortgages and capital-markets services, with a strong focus on the United Kingdom.","products":"Major brands and businesses include NatWest, Royal Bank of Scotland, Coutts, Ulster Bank Northern Ireland and NatWest Markets.","recent":"Since the financial crisis, NatWest Group has reduced its international footprint and refocused on UK customers, capital resilience and digital banking.","timeline":[{"year":"1727","title":"Royal Bank of Scotland founded","text":"Royal Bank of Scotland was founded in Edinburgh by royal charter."},{"year":"1968","title":"Current group incorporated","text":"National & Commercial Banking Group was incorporated as part of the restructuring that created the modern group."},{"year":"2000","title":"NatWest acquired","text":"RBS Group acquired National Westminster Bank in a major UK banking transaction."},{"year":"2008","title":"Government support","text":"The group became partly state-owned during the global financial crisis."},{"year":"2020","title":"NatWest Group name adopted","text":"Royal Bank of Scotland Group changed its corporate name to NatWest Group."}],"highlights":["UK-centred bank headquartered in Edinburgh.","Major brands include NatWest, Royal Bank of Scotland and Coutts.","Modern group dates to 1968–69; Royal Bank of Scotland dates to 1727.","Focuses on retail, business, commercial and private banking."]},"SAN":{"overview":"Banco Santander is a Spanish banking group founded in 1857 to support trade between Spain and the Americas. It has grown into a major international retail and commercial bank with operations across Europe and the Americas.","founded":"1857","founders":["Founded under a royal decree authorising Banco de Santander; no single individual founder is normally identified for the modern group"],"headquarters":"Boadilla del Monte, Madrid, Spain","website":"https://www.santander.com","description":"Global Banking & Financial Services","origins":"Banco de Santander was authorised in 1857 in northern Spain, initially serving trade between the port of Santander and the Americas. It expanded through organic growth and major acquisitions to become an international banking group.","business":"Santander provides retail and commercial banking, consumer finance, corporate and investment banking, wealth management, insurance and payment services.","products":"Its global businesses include Retail & Commercial Banking, Digital Consumer Bank, Corporate & Investment Banking, Wealth Management & Insurance and payments-related businesses.","recent":"Santander has increasingly organised operations around global business lines and shared technology platforms while retaining strong local banking franchises.","timeline":[{"year":"1857","title":"Banco Santander founded","text":"The bank was authorised in Santander, Spain, to facilitate trade between Spain and the Americas."},{"year":"1923","title":"Head office moved","text":"Santander moved its registered headquarters to the Paseo de Pereda building in Santander."},{"year":"1999","title":"BSCH created","text":"Banco Santander merged with Banco Central Hispano, creating one of Spain's largest banking groups."},{"year":"2004","title":"Abbey National acquired","text":"Santander expanded its UK presence through the acquisition of Abbey National."},{"year":"2023","title":"Global businesses reorganised","text":"Santander reorganised the group around five global businesses to simplify operations and scale shared platforms."}],"highlights":["Founded in Spain in 1857.","Large retail and commercial banking presence across Europe and the Americas.","Revenue comes from lending, deposits, consumer finance, payments, investment banking, wealth and insurance.","The group is increasingly organised around global platforms and business lines."]},"JPM":{"overview":"JPMorgan Chase is one of the world's largest banking groups. The present company was formed in 2000 through the merger of J.P. Morgan & Co. and Chase Manhattan, combining banking lineages that include The Manhattan Company, Chase National Bank and the House of Morgan.","founded":"2000","founders":["No single founder — the present company was formed by merger; major predecessor figures include Aaron Burr and J. Pierpont Morgan"],"headquarters":"270 Park Avenue, New York City, New York, United States","website":"https://www.jpmorganchase.com","description":"Global Banking & Financial Services","origins":"The present JPMorgan Chase was created in 2000 when J.P. Morgan & Co. merged with Chase Manhattan. Chase traces part of its heritage to The Manhattan Company, founded in 1799, while J.P. Morgan's banking lineage developed from firms led by Junius and J. Pierpont Morgan in the nineteenth century.","business":"JPMorgan Chase operates consumer and community banking, commercial banking, corporate and investment banking, payments, markets, asset management and wealth management.","products":"Its major activities include Chase consumer banking and cards, business banking, investment banking, securities markets, payments, commercial banking and asset and wealth management.","recent":"The group has continued investing heavily in technology, payments, digital banking and global markets while expanding its balance sheet and customer base.","timeline":[{"year":"1799","title":"Manhattan Company established","text":"The Manhattan Company, an important Chase predecessor, was founded in New York."},{"year":"1877","title":"Chase National Bank established","text":"Chase National Bank was founded and later became a major predecessor of Chase Manhattan."},{"year":"1955","title":"Chase Manhattan formed","text":"Chase National Bank and The Bank of the Manhattan Company combined to form Chase Manhattan Bank."},{"year":"2000","title":"JPMorgan Chase formed","text":"J.P. Morgan & Co. and Chase Manhattan merged to create JPMorgan Chase."},{"year":"2004","title":"Bank One acquired","text":"JPMorgan Chase combined with Bank One, significantly expanding its US consumer-banking franchise."},{"year":"2008","title":"Bear Stearns and Washington Mutual transactions","text":"During the financial crisis, the group acquired Bear Stearns and the banking operations of Washington Mutual."}],"highlights":["Present company formed in 2000 through the J.P. Morgan–Chase Manhattan merger.","Major businesses span consumer banking, investment banking, payments, commercial banking and asset management.","Chase is the group's principal US consumer-banking brand.","Its predecessor institutions stretch back to the eighteenth and nineteenth centuries."]},"BCS":{"overview":"Barclays is a British universal banking group with roots in London banking partnerships dating to 1690. It operates consumer, corporate and investment-banking businesses in the United Kingdom and internationally.","founded":"1690","founders":["John Freame","Thomas Gould"],"headquarters":"1 Churchill Place, Canary Wharf, London, United Kingdom","website":"https://home.barclays","description":"UK & International Banking","origins":"Barclays traces its history to a goldsmith-banking business established in the City of London in 1690 by John Freame and Thomas Gould. The Barclays name entered the partnership in the eighteenth century through James Barclay.","business":"Barclays provides UK consumer banking, credit cards, business banking, corporate banking, investment banking and wealth-management services.","products":"Its major businesses include Barclays UK, Barclays Investment Bank, corporate banking, cards and payments and private banking and wealth services.","recent":"The group has continued reshaping its business mix around UK banking, cards, investment banking and wealth while managing capital and returns across divisions.","timeline":[{"year":"1690","title":"Banking partnership established","text":"John Freame and Thomas Gould began the London banking business from which Barclays traces its origins."},{"year":"1736","title":"Barclay name enters the firm","text":"James Barclay joined the partnership, establishing the family name associated with the bank."},{"year":"1896","title":"Barclays & Co formed","text":"A group of private banks combined under the Barclays & Co name."},{"year":"1967","title":"First UK credit card launched","text":"Barclays launched Barclaycard, one of the earliest general-purpose credit cards in the United Kingdom."},{"year":"1986","title":"Big Bang expansion","text":"Barclays expanded its securities and investment-banking activities around the deregulation of London's financial markets."}],"highlights":["British banking group with roots dating to 1690.","Founders of the original banking partnership were John Freame and Thomas Gould.","Business spans UK banking, cards, corporate banking, investment banking and wealth.","Barclaycard became a major UK credit-card franchise."]},"HSBC":{"overview":"HSBC is a global banking group founded in Hong Kong in 1865 as The Hongkong and Shanghai Banking Corporation. It was created to finance trade between Asia, Europe and other international markets.","founded":"1865","founders":["Thomas Sutherland"],"headquarters":"London, United Kingdom","website":"https://www.hsbc.com","description":"Global Banking & Financial Services","origins":"HSBC was founded in Hong Kong in 1865 following an initiative led by Scottish banker Thomas Sutherland. Its original purpose was to support the rapidly growing trade between China, Europe and other international markets.","business":"HSBC provides wealth and personal banking, commercial banking, global banking and markets and related financial services across major international markets.","products":"Its activities include deposits, lending, cards, payments, trade finance, commercial banking, wealth management, insurance and investment banking.","recent":"HSBC has increasingly concentrated capital on Asian and international wealth and trade corridors while simplifying operations in lower-return markets.","timeline":[{"year":"1865","title":"HSBC founded","text":"The Hongkong and Shanghai Banking Corporation opened in Hong Kong and Shanghai."},{"year":"1991","title":"HSBC Holdings created","text":"HSBC Holdings plc was established as the group's parent company."},{"year":"1992","title":"Midland Bank acquired","text":"HSBC acquired Midland Bank, greatly expanding its UK presence."},{"year":"1993","title":"Group headquarters moved to London","text":"HSBC Holdings established its head office in London following the Midland acquisition."}],"highlights":["Founded in Hong Kong in 1865 by an initiative led by Thomas Sutherland.","International bank historically focused on trade and cross-border finance.","Major businesses include wealth, personal banking, commercial banking and global markets.","Strong strategic focus on Asia and international wealth flows."]}};

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

    const infoboxFounders=sanitizeInfoboxValue(infoboxField(page.fullWikitext,["founder","founders"]));
    const infoboxFounded=sanitizeInfoboxValue(infoboxField(page.fullWikitext,["founded","foundation","established"]));
    const infoboxHq=infoboxField(page.fullWikitext,["hq_location","headquarters","location"]);
    const infoboxHqCity=infoboxField(page.fullWikitext,["hq_location_city","headquarters_city"]);
    const infoboxHqCountry=infoboxField(page.fullWikitext,["hq_location_country","headquarters_country"]);
    const infoboxWebsite=sanitizeInfoboxValue(infoboxField(page.fullWikitext,["website","homepage"]));

    let founded=normaliseFounded(claimTime(entity,"P571")||infoboxFounded);
    let founders=founderIds.length?founderIds.map(id=>labels[id]).filter(Boolean):(infoboxFounders?infoboxFounders.split(/,| and /).map(clean).filter(Boolean):[]);
    const headquarters=await resolveHeadquarters(hqIds,infoboxHq,infoboxHqCity,infoboxHqCountry);
    const website=normalizeOfficialWebsite(claimString(entity,"P856")||infoboxWebsite);

    // If structured sources are incomplete, recover founding facts from the company intro/history text.
    if(!founded)founded=extractFoundedFromText(page.intro,historyRaw);
    if(!founders.length)founders=extractFoundersFromText(page.intro,historyRaw);

    // Strict validation and modern location formatting.
    founded=validFoundedValue(founded);
    let normalizedHeadquarters=normalizeCompanyLocation(headquarters);

    const override=COMPANY_FACT_OVERRIDES[ticker];
    let normalizedWebsite=website;
    if(override){
      founded=override.founded||founded;
      founders=(override.founders&&override.founders.length)?override.founders:founders;
      normalizedHeadquarters=override.headquarters||normalizedHeadquarters;
      normalizedWebsite=normalizeOfficialWebsite(override.website||normalizedWebsite);
    }

    const origins=firstSentences(historyRaw||page.intro,3300).replace(/^\s*\|+\s*/gm,"");
    const business=firstSentences(businessRaw||page.intro,3000).replace(/^\s*\|+\s*/gm,"");
    const products=firstSentences(productsRaw,2800).replace(/^\s*\|+\s*/gm,"");
    const recent=firstSentences(recentRaw,2400).replace(/^\s*\|+\s*/gm,"");
    const development=firstSentences(historyRaw,4200).replace(/^\s*\|+\s*/gm,"");

    const curated=CURATED_COMPANY_FALLBACKS[ticker]||null;
    const externalTimeline=buildTimeline(name,founded,founders,historyRaw);
    const result={
      ticker,name,title:page.title,
      description:entity?.descriptions?.en?.value||curated?.description||"",
      founded,foundedDisplay:founded||curated?.founded||"",
      founders:(founders&&founders.length)?founders:(curated?.founders||[]),
      headquarters:normalizedHeadquarters||curated?.headquarters||"",
      website:normalizedWebsite||curated?.website||"",
      summary:firstSentences(page.intro,3000)||curated?.overview||"",
      sections:{
        origins:origins||curated?.origins||"",
        business:business||curated?.business||"",
        development:development||curated?.origins||"",
        products:products||curated?.products||"",
        recent:recent||curated?.recent||""
      },
      highlights:curated?.highlights||[],
      revenueContext:revenueContext(name,business||curated?.business||"",products||curated?.products||""),
      timeline:externalTimeline.length?externalTimeline:(curated?.timeline||[]),
      sourceLabel:curated
        ?"Detailed company research: external company sources supplemented by MOVA's curated fallback profile where source fields are incomplete."
        :"Detailed company research: English Wikipedia company article (primary) + exact-page Wikidata structured facts, with Wikipedia infobox fallback for founder/founded/headquarters/website."
    };
    return Response.json(result,{
      headers:{"Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"}
    });
  }catch(e){
    return Response.json({error:e.message||"Company history unavailable"},{status:502});
  }
 }
};