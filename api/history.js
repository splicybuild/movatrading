const SYMBOLS={
  NVDA:["NVDA","NVDA:NASDAQ"],
  MSFT:["MSFT","MSFT:NASDAQ"],
  AAPL:["AAPL","AAPL:NASDAQ"],
  AMZN:["AMZN","AMZN:NASDAQ"],
  META:["META","META:NASDAQ"],
  GOOGL:["GOOGL","GOOGL:NASDAQ"],
  TSLA:["TSLA","TSLA:NASDAQ"],
  AVGO:["AVGO","AVGO:NASDAQ"],
  QQQ:["QQQ","QQQ:NASDAQ"],
  GOLD:["XAU/USD"],
  SILVER:["XAG/USD"]
};
const INTERVALS=new Set(["1min","5min","15min","30min","1h","1day"]);

async function requestTD(url,key){
  const res=await fetch(url,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.status==="error"||data.code)throw new Error(data.message||`Twelve Data request failed (${res.status})`);
  return data;
}
async function resolveOil(key){
  const u=new URL("https://api.twelvedata.com/commodities");
  u.searchParams.set("outputsize","100");
  const d=await requestTD(u,key);
  const rows=Array.isArray(d.data)?d.data:[];
  const m=rows.filter(x=>/crude/i.test(x.name||"")&&/oil/i.test(x.name||""));
  return (m.find(x=>/wti/i.test(x.name||""))||m[0])?.symbol||null;
}
async function fetchSeries(symbol,interval,outputsize,key){
  const u=new URL("https://api.twelvedata.com/time_series");
  u.searchParams.set("symbol",symbol);
  u.searchParams.set("interval",interval);
  u.searchParams.set("outputsize",String(outputsize));
  u.searchParams.set("order","desc");
  return requestTD(u,key);
}
export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const key=process.env.TWELVE_DATA_API_KEY;
  if(!key)return Response.json({error:"TWELVE_DATA_API_KEY is not configured in Vercel"},{status:500});
  const u=new URL(request.url);
  let alias=(u.searchParams.get("symbol")||"NVDA").toUpperCase();
  if(alias==="GOOG"||alias==="GOOGLE"||alias==="ALPHABET")alias="GOOGL";
  if(alias==="XAUUSD"||alias==="XAU/USD")alias="GOLD";
  if(alias==="XAGUSD"||alias==="XAG/USD")alias="SILVER";
  if(alias==="USOIL"||alias==="CRUDE OIL")alias="OIL";
  const interval=u.searchParams.get("interval")||"1day";
  const outputsize=Math.max(10,Math.min(500,Number(u.searchParams.get("outputsize")||30)));
  if(!INTERVALS.has(interval))return Response.json({error:"Unsupported interval"},{status:400});

  let candidates=SYMBOLS[alias]||[];
  if(alias==="OIL"){
    try{const oil=await resolveOil(key);candidates=oil?[oil]:[];}
    catch(e){return Response.json({error:e.message},{status:502});}
  }
  if(!candidates.length)return Response.json({error:"Historical data is not enabled for this asset yet"},{status:400});

  let lastError=null;
  for(const symbol of candidates){
    try{
      const d=await fetchSeries(symbol,interval,outputsize,key);
      const values=Array.isArray(d.values)?d.values:[];
      if(values.length){
        return Response.json({source:"Twelve Data",symbol:alias,resolvedSymbol:symbol,meta:d.meta||{},values},{
          headers:{"Cache-Control":"s-maxage=60, stale-while-revalidate=300"}
        });
      }
      lastError=new Error("No historical prices returned");
    }catch(e){lastError=e;}
  }
  return Response.json({error:lastError?.message||"Historical data unavailable"},{status:502});
 }
};