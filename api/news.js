const STOCKS=new Set(["NVDA","MSFT","AAPL","AMZN","META","GOOGL","TSLA","AVGO","AMD","NFLX","TMUS","JPM","BAC","V","MA"]);
const COMMODITY_WORDS=["gold","silver","oil","crude","natural gas","commodity","opec","copper","energy"];

function isoDate(d){return d.toISOString().slice(0,10);}
function clean(s){return String(s||"").replace(/\s+/g," ").trim();}

async function getJson(url){
  const r=await fetch(url,{headers:{"Accept":"application/json"}});
  const d=await r.json().catch(()=>null);
  if(!r.ok)throw new Error((d&&d.error)||`Upstream ${r.status}`);
  return d;
}
async function companyNews(symbol,key,days=14){
  const to=new Date(), from=new Date(Date.now()-days*86400000);
  const u=new URL("https://finnhub.io/api/v1/company-news");
  u.searchParams.set("symbol",symbol); u.searchParams.set("from",isoDate(from)); u.searchParams.set("to",isoDate(to)); u.searchParams.set("token",key);
  const rows=await getJson(u);
  return (Array.isArray(rows)?rows:[]).slice(0,12).map(x=>({
    symbol,headline:clean(x.headline),summary:clean(x.summary),source:clean(x.source),
    datetime:x.datetime?new Date(x.datetime*1000).toISOString():null,url:x.url||"",image:x.image||"",category:"company"
  }));
}
async function generalNews(key){
  const u=new URL("https://finnhub.io/api/v1/news");
  u.searchParams.set("category","general"); u.searchParams.set("minId","0"); u.searchParams.set("token",key);
  const rows=await getJson(u);
  return (Array.isArray(rows)?rows:[]).slice(0,45).map(x=>({
    symbol:"",headline:clean(x.headline),summary:clean(x.summary),source:clean(x.source),
    datetime:x.datetime?new Date(x.datetime*1000).toISOString():null,url:x.url||"",image:x.image||"",category:"general"
  }));
}

async function searchCompany(query,key){
  const q=clean(query);
  if(!q)return null;
  const u=new URL("https://finnhub.io/api/v1/search");
  u.searchParams.set("q",q);u.searchParams.set("token",key);
  const data=await getJson(u);
  const rows=Array.isArray(data?.result)?data.result:[];
  if(!rows.length)return null;

  const upper=q.toUpperCase();
  const scored=rows
    .filter(x=>x&&x.symbol)
    .map(x=>{
      const symbol=clean(x.symbol).toUpperCase();
      const desc=clean(x.description);
      const type=clean(x.type).toLowerCase();
      let score=0;
      if(symbol===upper)score+=100;
      if(desc.toUpperCase()===upper)score+=90;
      if(desc.toUpperCase().startsWith(upper))score+=55;
      if(desc.toUpperCase().includes(upper))score+=35;
      if(type.includes("common stock")||type.includes("stock"))score+=20;
      if(symbol.includes(".")||symbol.includes(":"))score-=3;
      return {...x,_score:score};
    })
    .sort((x,y)=>y._score-x._score);

  return scored[0]||null;
}

async function profile(symbol,key){
  if(["GOLD","SILVER","OIL"].includes(symbol))return null;
  const u=new URL("https://finnhub.io/api/v1/stock/profile2");
  u.searchParams.set("symbol",symbol);u.searchParams.set("token",key);
  try{
    const p=await getJson(u);
    return p&&Object.keys(p).length?{
      name:p.name||"",ticker:p.ticker||symbol,exchange:p.exchange||"",ipo:p.ipo||"",
      finnhubIndustry:p.finnhubIndustry||"",marketCapitalization:p.marketCapitalization||null,
      weburl:p.weburl||"",logo:p.logo||"",country:p.country||""
    }:null;
  }catch(e){return null;}
}
function dedupe(items){
  const seen=new Set();
  return items.filter(x=>{
    const k=(x.url||x.headline||"").toLowerCase(); if(!k||seen.has(k))return false;seen.add(k);return true;
  }).sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));
}

export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const key=process.env.FINNHUB_API_KEY;
  if(!key)return Response.json({error:"FINNHUB_API_KEY is not configured"},{status:500});
  const u=new URL(request.url);
  const mode=(u.searchParams.get("mode")||"market").toLowerCase();
  const requested=(u.searchParams.get("symbols")||"NVDA,MSFT,AAPL,AMZN,META,GOOGL,TSLA,AVGO")
    .split(",").map(s=>s.trim().toUpperCase()).filter(Boolean).slice(0,8);

  try{
    if(mode==="search"){
      const query=clean(u.searchParams.get("q")||"");
      if(!query)return Response.json({error:"Company name or ticker required"},{status:400});
      const hit=await searchCompany(query,key);
      if(!hit)return Response.json({error:`No listed company found for "${query}"`},{status:404});

      const symbol=clean(hit.symbol).toUpperCase();
      const p=await profile(symbol,key);
      const items=await companyNews(symbol,key,30);
      return Response.json({
        source:"Finnhub",
        asOf:new Date().toISOString(),
        symbol,
        name:p?.name||clean(hit.description)||symbol,
        profile:p||{name:clean(hit.description)||symbol,ticker:symbol},
        items:dedupe(items).slice(0,12)
      },{headers:{"Cache-Control":"s-maxage=180, stale-while-revalidate=600"}});
    }

    if(mode==="asset"){
      const symbol=requested[0];
      if(!symbol)return Response.json({error:"Symbol required"},{status:400});
      let items=[];
      if(!["GOLD","SILVER","OIL"].includes(symbol))items=await companyNews(symbol,key,30);
      else{
        const general=await generalNews(key);
        const terms=symbol==="GOLD"?["gold","bullion"]:symbol==="OIL"?["oil","crude","opec"]:symbol==="SILVER"?["silver"]:COMMODITY_WORDS;
        items=general.filter(x=>terms.some(t=>`${x.headline} ${x.summary}`.toLowerCase().includes(t))).slice(0,12).map(x=>({...x,symbol}));
      }
      const p=await profile(symbol,key);
      return Response.json({source:"Finnhub",asOf:new Date().toISOString(),items:dedupe(items).slice(0,15),profile:p},
        {headers:{"Cache-Control":"s-maxage=300, stale-while-revalidate=900"}});
    }

    const general=await generalNews(key);
    const marketRelevant=general.filter(x=>{
      const t=`${x.headline} ${x.summary}`.toLowerCase();
      return COMMODITY_WORDS.some(k=>t.includes(k)) ||
        /nasdaq|s&p|dow|stock|shares|market|earnings|fed|inflation|rates|economy|tariff|technology|ai|semiconductor|bank|bond|treasury|currency|dollar|investor/.test(t);
    });

    // Top stories intentionally come from the general market feed rather than
    // attaching a requested ticker to broad publisher articles. This prevents
    // unrelated stories (for example a pharma story) being mislabeled NVDA.
    return Response.json({
      source:"Finnhub",
      asOf:new Date().toISOString(),
      items:dedupe(marketRelevant).slice(0,10)
    },{headers:{"Cache-Control":"s-maxage=300, stale-while-revalidate=900"}});
  }catch(e){
    return Response.json({error:e.message||"News service unavailable"},{status:502});
  }
 }
};