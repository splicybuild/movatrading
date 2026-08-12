const ALLOWED=new Set(["NVDA","MSFT","AAPL","AMZN","GOOGL","META","AVGO","TSLA"]);

async function pressReleases(symbol,key){
  const u=new URL("https://api.twelvedata.com/press_releases");
  u.searchParams.set("symbol",symbol);
  u.searchParams.set("outputsize","3");
  u.searchParams.set("language","en,en-US");
  const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.status==="error"||data.code)throw new Error(data.message||`Press releases unavailable for ${symbol}`);
  return Array.isArray(data.press_releases)?data.press_releases:[];
}

export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const key=process.env.TWELVE_DATA_API_KEY;
  if(!key)return Response.json({error:"TWELVE_DATA_API_KEY is not configured"},{status:500});
  const u=new URL(request.url);
  const requested=(u.searchParams.get("symbols")||"NVDA,AAPL,MSFT")
    .split(",").map(s=>s.trim().toUpperCase()).filter(s=>ALLOWED.has(s)).slice(0,5);
  if(!requested.length)return Response.json({error:"No supported watchlist stocks requested"},{status:400});

  const results=await Promise.allSettled(requested.map(s=>pressReleases(s,key)));
  const items=[];
  const errors=[];
  results.forEach((r,i)=>{
    const symbol=requested[i];
    if(r.status!=="fulfilled"){errors.push({symbol,error:r.reason?.message||"Unavailable"});return;}
    r.value.forEach(x=>items.push({
      symbol,
      id:x.id,
      datetime:x.datetime,
      title:x.title,
      body:x.body||"",
      language:x.language||[]
    }));
  });
  items.sort((a,b)=>new Date(b.datetime)-new Date(a.datetime));
  return Response.json({
    source:"Twelve Data press releases",
    asOf:new Date().toISOString(),
    items:items.slice(0,15),
    errors
  },{headers:{"Cache-Control":"s-maxage=300, stale-while-revalidate=900"}});
 }
};