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
const PREPOST_INTERVALS = new Set(["1min","5min","15min","30min"]);

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
function isEquityLike(alias){return !["GOLD","SILVER","OIL","NG","NDX"].includes(alias)}

async function requestTD(url,key){
  const res=await fetch(url,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.status==="error"||data.code)throw new Error(data.message||`Twelve Data request failed (${res.status})`);
  return data;
}

async function timeSeries(symbol,interval,outputsize,key,prepost=false){
  const u=new URL("https://api.twelvedata.com/time_series");
  u.searchParams.set("symbol",symbol);
  u.searchParams.set("interval",interval);
  u.searchParams.set("outputsize",String(outputsize));
  u.searchParams.set("order","desc");
  if(prepost)u.searchParams.set("prepost","true");
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

async function firstWorking(candidates,interval,outputsize,key,wantPrepost=false){
  let last=null;
  for(let i=0;i<candidates.length;i++){
    const symbol=candidates[i];
    if(wantPrepost){
      try{
        const d=await timeSeries(symbol,interval,outputsize,key,true);
        const values=Array.isArray(d.values)?d.values:[];
        if(values.length)return {symbol,data:d,values,index:i,extendedHours:true};
      }catch(e){last=e;}
    }
    try{
      const d=await timeSeries(symbol,interval,outputsize,key,false);
      const values=Array.isArray(d.values)?d.values:[];
      if(values.length)return {symbol,data:d,values,index:i,extendedHours:false};
      last=new Error(`No historical values returned for ${symbol}`);
    }catch(e){last=e;}
  }
  throw last||new Error("Historical data unavailable");
}

function yahooSymbol(alias){
  if(alias==="GOLD")return "GC=F";
  if(alias==="SILVER")return "SI=F";
  if(alias==="OIL")return "CL=F";
  if(alias==="NG")return "NG=F";
  if(alias==="NDX")return "^NDX";
  return alias;
}
function yahooInterval(interval){
  return ({
    "1min":"1m","5min":"5m","15min":"15m","30min":"30m","45min":"30m",
    "1h":"1h","2h":"1h","4h":"1h","8h":"1h",
    "1day":"1d","1week":"1wk","1month":"1mo"
  })[interval]||"1d";
}
function yahooRange(interval,outputsize){
  if(interval==="1min")return "5d";
  if(["5min","15min","30min","45min"].includes(interval))return outputsize>150?"1mo":"10d";
  if(["1h","2h","4h","8h"].includes(interval))return "6mo";
  if(interval==="1day")return outputsize>300?"5y":outputsize>100?"2y":"6mo";
  if(interval==="1week")return outputsize>300?"max":"10y";
  if(interval==="1month")return "max";
  return "1y";
}
async function yahooHistory(alias,interval,outputsize){
  const symbol=yahooSymbol(alias),yi=yahooInterval(interval),range=yahooRange(interval,outputsize);
  const u=new URL(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`);
  u.searchParams.set("interval",yi);
  u.searchParams.set("range",range);
  u.searchParams.set("includePrePost",isEquityLike(alias)?"true":"false");
  u.searchParams.set("events","div,splits");
  const res=await fetch(u,{headers:{"Accept":"application/json","User-Agent":"Mozilla/5.0 MOVA/2.4"}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(`Yahoo Finance request failed (${res.status})`);
  const result=data?.chart?.result?.[0];
  const err=data?.chart?.error;
  if(err)throw new Error(err.description||err.code||"Yahoo Finance history unavailable");
  const timestamps=result?.timestamp||[];
  const q=result?.indicators?.quote?.[0]||{};
  const values=[];
  for(let i=0;i<timestamps.length;i++){
    const open=Number(q.open?.[i]),high=Number(q.high?.[i]),low=Number(q.low?.[i]),close=Number(q.close?.[i]);
    if(![open,high,low,close].every(Number.isFinite))continue;
    values.push({
      datetime:new Date(Number(timestamps[i])*1000).toISOString(),
      open:String(open),high:String(high),low:String(low),close:String(close),
      volume:q.volume?.[i]==null?null:String(q.volume[i])
    });
  }
  if(!values.length)throw new Error("Yahoo Finance returned no OHLC values");
  return {
    source:"Yahoo Finance",
    requested:alias,
    resolvedSymbol:symbol,
    mode:"fallback",
    proxyLabel:null,
    earliest:values[0]?.datetime||null,
    extendedHours:isEquityLike(alias)&&PREPOST_INTERVALS.has(interval),
    meta:{symbol,interval:yi,range,exchangeTimezoneName:result?.meta?.exchangeTimezoneName||null,regularMarketPrice:result?.meta?.regularMarketPrice||null},
    values:values.slice(-outputsize).reverse()
  };
}

export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const u=new URL(request.url);
  const alias=normalizeAlias(u.searchParams.get("symbol")||"NVDA");
  const interval=u.searchParams.get("interval")||"1day";
  const outputsize=Math.max(10,Math.min(5000,Number(u.searchParams.get("outputsize")||30)));
  if(!INTERVALS.has(interval))return Response.json({error:"Unsupported interval"},{status:400});
  const key=process.env.TWELVE_DATA_API_KEY;
  const wantPrepost=isEquityLike(alias)&&PREPOST_INTERVALS.has(interval);
  let twelveError=null;

  if(key){
    try{
      let candidates=DIRECT[alias]?[...DIRECT[alias]]:[];
      let mode="direct";
      let proxyLabel=null;

      if(alias==="OIL"||alias==="NG"){
        const commodity=await resolveCommodity(alias,key);
        if(commodity)candidates=[commodity];
      }
      if(alias==="NDX")candidates=["NDX","NDX:NASDAQ","NASDAQ 100","NASDAQ-100"];

      if(!candidates.length&&NAMES[alias]){
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

      if(!candidates.length&&/^[A-Z0-9.\-]{1,12}$/.test(alias)){
        const rows=await symbolSearch(alias,key);
        const exact=rows.find(x=>String(x.symbol||"").toUpperCase()===alias&&/stock|equity|depositary/i.test(String(x.instrument_type||"")));
        const preferred=exact||rows.find(x=>/stock|equity|depositary/i.test(String(x.instrument_type||"")))||rows[0];
        candidates=[preferred?.symbol,alias,`${alias}:NASDAQ`,`${alias}:NYSE`].filter(Boolean);
        candidates=[...new Set(candidates)];
        mode="search";
      }

      if(!candidates.length)throw new Error("No Twelve Data symbol could be resolved for this asset.");

      let result;
      try{
        result=await firstWorking(candidates,interval,outputsize,key,wantPrepost);
        if(result.index>0)mode="alternate";
      }catch(primaryError){
        if(alias==="NDX"){
          result=await firstWorking(["QQQ","QQQ:NASDAQ"],interval,outputsize,key,wantPrepost);
          mode="proxy";
          proxyLabel="QQQ used as Nasdaq-100 proxy";
        }else throw primaryError;
      }

      const earliestValue=await earliest(result.symbol,interval,key);
      return Response.json({
        source:"Twelve Data",
        requested:alias,
        resolvedSymbol:result.symbol,
        mode,
        proxyLabel,
        earliest:earliestValue,
        extendedHours:Boolean(result.extendedHours),
        meta:result.data.meta||{},
        values:result.values
      },{headers:{"Cache-Control":"s-maxage=60, stale-while-revalidate=300"}});
    }catch(error){
      twelveError=error?.message||"Twelve Data unavailable";
    }
  }else{
    twelveError="TWELVE_DATA_API_KEY is not configured in this Vercel environment";
  }

  try{
    const fallback=await yahooHistory(alias,interval,outputsize);
    return Response.json({...fallback,fallbackReason:twelveError},{headers:{"Cache-Control":"s-maxage=60, stale-while-revalidate=300"}});
  }catch(error){
    return Response.json({
      error:error?.message||"Historical data unavailable",
      requested:alias,
      mode:"unavailable",
      twelveError
    },{status:502});
  }
 }
};
