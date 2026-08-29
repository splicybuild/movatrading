const DIRECT = {
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
const NAMES = {
  NDX:["Nasdaq 100","NASDAQ-100","Nasdaq-100 Index"],
  OIL:["WTI Crude Oil","Crude Oil","WTI"],
  NG:["Natural Gas","Henry Hub Natural Gas"]
};
const INTERVALS = new Set(["1min","5min","15min","30min","45min","1h","2h","4h","8h","1day","1week","1month"]);

function normalizeAlias(raw){
  let a=String(raw||"").trim().toUpperCase();
  if(["GOOG","GOOGLE","ALPHABET"].includes(a))a="GOOGL";
  if(["XAUUSD","XAU/USD"].includes(a))a="GOLD";
  if(["XAGUSD","XAG/USD"].includes(a))a="SILVER";
  if(["USOIL","CRUDE OIL","WTI OIL","WTI CRUDE OIL"].includes(a))a="OIL";
  if(["NATURAL GAS","NATGAS","HENRY HUB"].includes(a))a="NG";
  if(["NASDAQ100","NASDAQ 100","NASDAQ-100"].includes(a))a="NDX";
  return a;
}

async function requestTD(url,key){
  const res=await fetch(url,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.status==="error"||data.code)throw new Error(data.message||`Twelve Data request failed (${res.status})`);
  return data;
}

async function timeSeries(symbol,interval,outputsize,key){
  const u=new URL("https://api.twelvedata.com/time_series");
  u.searchParams.set("symbol",symbol);
  u.searchParams.set("interval",interval);
  u.searchParams.set("outputsize",String(outputsize));
  u.searchParams.set("order","desc");
  return requestTD(u,key);
}

async function earliest(symbol,interval,key){
  const u=new URL("https://api.twelvedata.com/earliest_timestamp");
  u.searchParams.set("symbol",symbol);
  u.searchParams.set("interval",interval);
  try{
    const d=await requestTD(u,key);
    return d.datetime||d.timestamp||d.earliest_timestamp||null;
  }catch(e){return null;}
}

async function symbolSearch(query,key){
  const u=new URL("https://api.twelvedata.com/symbol_search");
  u.searchParams.set("symbol",query);
  u.searchParams.set("outputsize","20");
  u.searchParams.set("show_plan","true");
  try{
    const d=await requestTD(u,key);
    return Array.isArray(d.data)?d.data:[];
  }catch(e){return [];}
}

async function commodityCatalog(key){
  const u=new URL("https://api.twelvedata.com/commodities");
  u.searchParams.set("outputsize","300");
  try{
    const d=await requestTD(u,key);
    return Array.isArray(d.data)?d.data:[];
  }catch(e){return [];}
}

async function resolveCommodity(alias,key){
  const rows=await commodityCatalog(key);
  if(alias==="OIL"){
    const matches=rows.filter(x=>/crude/i.test(x.name||"")&&/oil/i.test(x.name||""));
    const preferred=matches.find(x=>/wti/i.test(x.name||""))||matches[0];
    return preferred?.symbol||null;
  }
  if(alias==="NG"){
    const matches=rows.filter(x=>/natural gas/i.test(x.name||""));
    const preferred=matches.find(x=>/henry hub/i.test(x.name||""))||matches[0];
    return preferred?.symbol||null;
  }
  return null;
}

async function firstWorking(candidates,interval,outputsize,key){
  let last=null;
  for(let i=0;i<candidates.length;i++){
    const symbol=candidates[i];
    try{
      const d=await timeSeries(symbol,interval,outputsize,key);
      const values=Array.isArray(d.values)?d.values:[];
      if(values.length)return {symbol,data:d,values,index:i};
      last=new Error(`No historical values returned for ${symbol}`);
    }catch(e){last=e;}
  }
  throw last||new Error("Historical data unavailable");
}

export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const key=process.env.TWELVE_DATA_API_KEY;
  if(!key)return Response.json({error:"TWELVE_DATA_API_KEY is not configured in Vercel"},{status:500});

  const u=new URL(request.url);
  const alias=normalizeAlias(u.searchParams.get("symbol")||"NVDA");
  const interval=u.searchParams.get("interval")||"1day";
  const outputsize=Math.max(10,Math.min(5000,Number(u.searchParams.get("outputsize")||30)));
  if(!INTERVALS.has(interval))return Response.json({error:"Unsupported interval"},{status:400});

  try{
    let candidates=DIRECT[alias]?[...DIRECT[alias]]:[];
    let mode="direct";
    let proxyLabel=null;

    if(alias==="OIL"||alias==="NG"){
      const commodity=await resolveCommodity(alias,key);
      if(commodity)candidates=[commodity];
    }

    if(alias==="NDX"){
      candidates=["NDX","NDX:NASDAQ","NASDAQ 100","NASDAQ-100"];
    }

    if(!candidates.length && NAMES[alias]){
      for(const name of NAMES[alias]){
        const rows=await symbolSearch(name,key);
        const preferred=rows.find(x=>{
          const it=String(x.instrument_type||"").toLowerCase();
          return alias==="NDX"?it.includes("index"):true;
        })||rows[0];
        if(preferred?.symbol)candidates.push(preferred.symbol);
      }
      candidates=[...new Set(candidates)];
      if(candidates.length)mode="alternate";
    }

    if(!candidates.length && /^[A-Z0-9.\-]{1,12}$/.test(alias)){
      const rows=await symbolSearch(alias,key);
      const exact=rows.find(x=>String(x.symbol||"").toUpperCase()===alias && /stock|equity|depositary/i.test(String(x.instrument_type||"")));
      const preferred=exact||rows.find(x=>/stock|equity|depositary/i.test(String(x.instrument_type||"")))||rows[0];
      candidates=[preferred?.symbol,alias,`${alias}:NASDAQ`,`${alias}:NYSE`].filter(Boolean);
      candidates=[...new Set(candidates)];
      mode="search";
    }

    if(!candidates.length)throw new Error("No Twelve Data symbol could be resolved for this asset.");

    let result;
    try{
      result=await firstWorking(candidates,interval,outputsize,key);
      if(result.index>0)mode="alternate";
    }catch(primaryError){
      if(alias==="NDX"){
        result=await firstWorking(["QQQ","QQQ:NASDAQ"],interval,outputsize,key);
        mode="proxy";
        proxyLabel="QQQ used as Nasdaq-100 proxy";
      }else{
        throw primaryError;
      }
    }

    const earliestValue=await earliest(result.symbol,interval,key);

    return Response.json({
      source:"Twelve Data",
      requested:alias,
      resolvedSymbol:result.symbol,
      mode,
      proxyLabel,
      earliest:earliestValue,
      meta:result.data.meta||{},
      values:result.values
    },{headers:{"Cache-Control":"s-maxage=300, stale-while-revalidate=1800"}});
  }catch(error){
    return Response.json({
      error:error.message||"Historical data unavailable",
      requested:alias,
      mode:"unavailable"
    },{status:502});
  }
 }
};