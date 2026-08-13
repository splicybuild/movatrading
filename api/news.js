const ALLOWED=new Set(["NVDA","MSFT","AAPL","AMZN","GOOGL","META","AVGO","TSLA"]);
function day(d){return d.toISOString().slice(0,10);}
async function fhNews(symbol,key){
  const to=new Date(),from=new Date(Date.now()-14*86400000);
  const u=new URL("https://finnhub.io/api/v1/company-news");
  u.searchParams.set("symbol",symbol);u.searchParams.set("from",day(from));u.searchParams.set("to",day(to));
  const res=await fetch(u,{headers:{"Accept":"application/json","X-Finnhub-Token":key}});
  const d=await res.json().catch(()=>[]);
  if(!res.ok||d.error)throw new Error(d.error||`Finnhub ${res.status}`);
  return Array.isArray(d)?d:[];
}
async function tdReleases(symbol,key){
  const u=new URL("https://api.twelvedata.com/press_releases");
  u.searchParams.set("symbol",symbol);u.searchParams.set("outputsize","3");u.searchParams.set("language","en,en-US");
  const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const d=await res.json().catch(()=>({}));
  if(!res.ok||d.status==="error"||d.code)throw new Error(d.message||`Twelve Data ${res.status}`);
  return Array.isArray(d.press_releases)?d.press_releases:[];
}
export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const fh=process.env.FINNHUB_API_KEY,td=process.env.TWELVE_DATA_API_KEY;
  if(!fh&&!td)return Response.json({error:"No news-data API keys configured"},{status:500});
  const u=new URL(request.url);
  const symbols=(u.searchParams.get("symbols")||"NVDA,AAPL,MSFT").split(",").map(s=>s.trim().toUpperCase()).filter(s=>ALLOWED.has(s)).slice(0,5);
  const items=[],errors=[];
  for(const symbol of symbols){
    let used=false;
    if(fh){
      try{
        const rows=await fhNews(symbol,fh);
        rows.slice(0,5).forEach(x=>items.push({
          symbol,id:x.id,datetime:new Date(Number(x.datetime)*1000).toISOString(),
          title:x.headline||"Company news",body:x.summary||"",source:x.source||"Finnhub",
          url:x.url||null,provider:"Finnhub"
        }));
        used=rows.length>0;
      }catch(e){errors.push({symbol,provider:"Finnhub",error:e.message});}
    }
    if(!used&&td){
      try{
        const rows=await tdReleases(symbol,td);
        rows.forEach(x=>items.push({
          symbol,id:x.id,datetime:x.datetime,title:x.title,body:x.body||"",
          source:"Company press release",url:null,provider:"Twelve Data"
        }));
      }catch(e){errors.push({symbol,provider:"Twelve Data",error:e.message});}
    }
  }
  items.sort((a,b)=>new Date(b.datetime)-new Date(a.datetime));
  return Response.json({source:"Finnhub with Twelve Data fallback",asOf:new Date().toISOString(),items:items.slice(0,20),errors},
    {headers:{"Cache-Control":"public, s-maxage=900, stale-while-revalidate=1800"}});
 }
};