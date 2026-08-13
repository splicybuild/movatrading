const DIRECT={
  NVDA:["NVDA","NVDA:NASDAQ"],MSFT:["MSFT","MSFT:NASDAQ"],AAPL:["AAPL","AAPL:NASDAQ"],
  AMZN:["AMZN","AMZN:NASDAQ"],META:["META","META:NASDAQ"],GOOGL:["GOOGL","GOOGL:NASDAQ"],
  TSLA:["TSLA","TSLA:NASDAQ"],AVGO:["AVGO","AVGO:NASDAQ"],QQQ:["QQQ","QQQ:NASDAQ"],
  GOLD:["XAU/USD"],SILVER:["XAG/USD"]
};
const INTERVALS=new Set(["1min","5min","15min","30min","45min","1h","2h","4h","8h","1day","1week","1month"]);
function alias(raw){
  let a=String(raw||"").trim().toUpperCase();
  if(["GOOG","GOOGLE","ALPHABET"].includes(a))a="GOOGL";
  if(["XAUUSD","XAU/USD"].includes(a))a="GOLD";
  if(["XAGUSD","XAG/USD"].includes(a))a="SILVER";
  if(["USOIL","CRUDE OIL","WTI OIL","WTI"].includes(a))a="OIL";
  if(["NATURAL GAS","NATGAS"].includes(a))a="NG";
  if(["NASDAQ100","NASDAQ 100","NASDAQ-100"].includes(a))a="NDX";
  return a;
}
async function td(path,params,key){
  const u=new URL(`https://api.twelvedata.com/${path}`);
  Object.entries(params||{}).forEach(([k,v])=>u.searchParams.set(k,String(v)));
  const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const d=await res.json().catch(()=>({}));
  if(!res.ok||d.status==="error"||d.code)throw new Error(d.message||`Twelve Data ${res.status}`);
  return d;
}
async function catalog(kind,key){
  const d=await td("commodities",{outputsize:"300"},key);
  const rows=Array.isArray(d.data)?d.data:[];
  if(kind==="OIL"){
    const m=rows.filter(x=>/crude/i.test(x.name||"")&&/oil/i.test(x.name||""));
    return (m.find(x=>/wti/i.test(x.name||""))||m[0])?.symbol||null;
  }
  if(kind==="NG"){
    const m=rows.filter(x=>/natural gas/i.test(x.name||""));
    return (m.find(x=>/henry hub/i.test(x.name||""))||m[0])?.symbol||null;
  }
  return null;
}
async function first(candidates,interval,outputsize,key){
  let last=null;
  for(let i=0;i<candidates.length;i++){
    try{
      const d=await td("time_series",{symbol:candidates[i],interval,outputsize,order:"desc"},key);
      const values=Array.isArray(d.values)?d.values:[];
      if(values.length)return {symbol:candidates[i],data:d,values,index:i};
      last=new Error(`No values for ${candidates[i]}`);
    }catch(e){last=e;}
  }
  throw last||new Error("Historical data unavailable");
}
async function earliest(symbol,interval,key){
  try{
    const d=await td("earliest_timestamp",{symbol,interval},key);
    return d.datetime||d.timestamp||d.earliest_timestamp||null;
  }catch(e){return null;}
}
export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const key=process.env.TWELVE_DATA_API_KEY;
  if(!key)return Response.json({error:"TWELVE_DATA_API_KEY is not configured"},{status:500});
  const u=new URL(request.url);
  const symbol=alias(u.searchParams.get("symbol")||"NVDA");
  const interval=u.searchParams.get("interval")||"1day";
  const outputsize=Math.max(10,Math.min(5000,Number(u.searchParams.get("outputsize")||30)));
  if(!INTERVALS.has(interval))return Response.json({error:"Unsupported interval"},{status:400});
  try{
    let candidates=DIRECT[symbol]?[...DIRECT[symbol]]:[];
    let mode="direct",proxyLabel=null;
    if(symbol==="OIL"||symbol==="NG"){
      const resolved=await catalog(symbol,key);
      if(resolved)candidates=[resolved];
    }
    if(symbol==="NDX")candidates=["NDX","NDX:NASDAQ","NASDAQ 100","NASDAQ-100"];
    if(!candidates.length)throw new Error("No Twelve Data symbol is configured for this asset");
    let result;
    try{
      result=await first(candidates,interval,outputsize,key);
      if(result.index>0)mode="alternate";
    }catch(e){
      if(symbol==="NDX"){
        result=await first(["QQQ","QQQ:NASDAQ"],interval,outputsize,key);
        mode="proxy";proxyLabel="QQQ used as Nasdaq-100 proxy";
      }else throw e;
    }
    return Response.json({
      source:"Twelve Data",requested:symbol,resolvedSymbol:result.symbol,mode,proxyLabel,
      earliest:await earliest(result.symbol,interval,key),
      meta:result.data.meta||{},values:result.values
    },{headers:{"Cache-Control":"public, s-maxage=3600, stale-while-revalidate=86400"}});
  }catch(e){
    return Response.json({error:e.message||"Historical data unavailable",requested:symbol,mode:"unavailable"},{status:502});
  }
 }
};