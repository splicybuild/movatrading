const SYMBOLS = {
  NVDA:"NVDA", MSFT:"MSFT", AAPL:"AAPL", AMZN:"AMZN", META:"META",
  GOOGL:"GOOGL", TSLA:"TSLA", AVGO:"AVGO", QQQ:"QQQ",
  GOLD:"XAU/USD", SILVER:"XAG/USD"
};
const INTERVALS = new Set(["1min","5min","15min","30min","1h","1day"]);

async function td(url,key){
  const res=await fetch(url,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok || data.status==="error" || data.code) throw new Error(data.message||`Twelve Data request failed (${res.status})`);
  return data;
}

async function resolveOil(key){
  const url=new URL("https://api.twelvedata.com/commodities");
  url.searchParams.set("outputsize","100");
  const data=await td(url,key);
  const rows=Array.isArray(data.data)?data.data:[];
  const matches=rows.filter(x=>/crude/i.test(x.name||"") && /oil/i.test(x.name||""));
  const preferred=matches.find(x=>/wti/i.test(x.name||""))||matches[0];
  return preferred?.symbol||null;
}

export default {
  async fetch(request){
    if(request.method!=="GET") return Response.json({error:"Method not allowed"},{status:405});
    const key=process.env.TWELVE_DATA_API_KEY;
    if(!key) return Response.json({error:"TWELVE_DATA_API_KEY is not configured in Vercel"},{status:500});

    const u=new URL(request.url);
    const alias=(u.searchParams.get("symbol")||"NVDA").toUpperCase();
    const interval=u.searchParams.get("interval")||"1day";
    const outputsize=Math.max(10,Math.min(500,Number(u.searchParams.get("outputsize")||30)));

    if(!INTERVALS.has(interval)) return Response.json({error:"Unsupported interval"},{status:400});

    let symbol=SYMBOLS[alias]||null;
    if(alias==="OIL"){
      try{symbol=await resolveOil(key);}catch(e){return Response.json({error:e.message},{status:502});}
    }
    if(!symbol) return Response.json({error:"Historical data is not enabled for this asset yet"},{status:400});

    const url=new URL("https://api.twelvedata.com/time_series");
    url.searchParams.set("symbol",symbol);
    url.searchParams.set("interval",interval);
    url.searchParams.set("outputsize",String(outputsize));
    url.searchParams.set("previous_close","true");

    try{
      const data=await td(url,key);
      return Response.json({
        source:"Twelve Data",
        symbol:alias,
        resolvedSymbol:symbol,
        meta:data.meta,
        values:Array.isArray(data.values)?data.values:[]
      },{headers:{"Cache-Control":"s-maxage=60, stale-while-revalidate=300"}});
    }catch(error){
      return Response.json({error:error.message||"History request failed"},{status:502});
    }
  }
};