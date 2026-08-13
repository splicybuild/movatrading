const STOCKS=new Set(["NVDA","MSFT","AAPL","AMZN","META","GOOGL","TSLA","AVGO","QQQ"]);
const NAMES={"NVDA":"NVIDIA","MSFT":"Microsoft","AAPL":"Apple","AMZN":"Amazon","META":"Meta Platforms","GOOGL":"Alphabet","TSLA":"Tesla","AVGO":"Broadcom","QQQ":"Invesco QQQ","GOLD":"Gold","SILVER":"Silver","OIL":"Crude Oil"};

function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}
function alias(raw){
  let s=String(raw||"").trim().toUpperCase();
  if(s==="GOOG")s="GOOGL";
  if(["XAUUSD","XAU/USD"].includes(s))s="GOLD";
  if(["XAGUSD","XAG/USD"].includes(s))s="SILVER";
  if(["USOIL","WTI","WTI OIL","CRUDE OIL"].includes(s))s="OIL";
  return s;
}
async function finnhub(path,key){
  const u=new URL(`https://finnhub.io/api/v1/${path}`);
  u.searchParams.set("token",key);
  const res=await fetch(u,{headers:{"Accept":"application/json"}});
  const d=await res.json().catch(()=>({}));
  if(!res.ok||d.error)throw new Error(d.error||`Finnhub ${res.status}`);
  return d;
}
async function twelve(path,params,key){
  const u=new URL(`https://api.twelvedata.com/${path}`);
  Object.entries(params||{}).forEach(([k,v])=>u.searchParams.set(k,String(v)));
  const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const d=await res.json().catch(()=>({}));
  if(!res.ok||d.status==="error"||d.code)throw new Error(d.message||`Twelve Data ${res.status}`);
  return d;
}
async function usdGbp(key){
  if(!key)return null;
  try{
    const d=await twelve("currency_conversion",{symbol:"USD/GBP",amount:"1"},key);
    return num(d.rate);
  }catch(e){return null;}
}
async function commoditySymbol(kind,key){
  const d=await twelve("commodities",{outputsize:"300"},key);
  const rows=Array.isArray(d.data)?d.data:[];
  if(kind==="OIL"){
    const hits=rows.filter(x=>/crude/i.test(x.name||"")&&/oil/i.test(x.name||""));
    return (hits.find(x=>/wti/i.test(x.name||""))||hits[0])?.symbol||null;
  }
  return null;
}
function analysis(changePct,high,low,previous){
  const abs=Math.abs(changePct||0);
  const range=(high!=null&&low!=null&&previous)?((high-low)/previous)*100:null;
  return {
    momentum:abs>=3?"strong":abs>=1?"moderate":"steady",
    direction:(changePct||0)>=0?"advancing":"declining",
    dailyRangePct:range!=null?Number(range.toFixed(2)):null
  };
}

export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const fh=process.env.FINNHUB_API_KEY;
  const td=process.env.TWELVE_DATA_API_KEY;
  if(!fh&&!td)return Response.json({error:"No market-data API keys are configured"},{status:500});

  const u=new URL(request.url);
  const requested=(u.searchParams.get("symbols")||"NVDA,MSFT,AAPL,AMZN,META,GOOGL,TSLA,AVGO,QQQ,GOLD,SILVER,OIL")
    .split(",").map(alias).filter(Boolean);
  const fx=await usdGbp(td);
  const assets=[];
  const errors=[];

  for(const symbol of requested){
    if(STOCKS.has(symbol)&&fh){
      try{
        const q=await finnhub(`quote?symbol=${encodeURIComponent(symbol)}`,fh);
        const p=num(q.c), changePct=num(q.dp)||0;
        if(p==null||p<=0)throw new Error("No current price returned");
        assets.push({
          ticker:symbol,name:NAMES[symbol]||symbol,type:symbol==="QQQ"?"etf":"stock",
          nativeCurrency:"USD",priceNative:p,
          priceGBP:fx!=null?Number((p*fx).toFixed(2)):null,
          changePct,
          analysis:analysis(changePct,num(q.h),num(q.l),num(q.pc)),
          provider:"Finnhub"
        });
        continue;
      }catch(e){errors.push({ticker:symbol,provider:"Finnhub",error:e.message});}
    }

    if(td){
      try{
        let tdSymbol=symbol;
        if(symbol==="GOLD")tdSymbol="XAU/USD";
        if(symbol==="SILVER")tdSymbol="XAG/USD";
        if(symbol==="OIL"){
          const found=await commoditySymbol("OIL",td);
          if(found)tdSymbol=found;
        }
        const q=await twelve("quote",{symbol:tdSymbol,interval:"1day"},td);
        const p=num(q.close), prev=num(q.previous_close);
        const changePct=num(q.percent_change) ?? (p!=null&&prev?((p-prev)/prev)*100:0);
        if(p==null)throw new Error("No current price returned");
        const currency=q.currency||(/USD/i.test(tdSymbol)?"USD":"USD");
        const converted=currency==="GBP"?p:(currency==="USD"&&fx!=null?p*fx:null);
        assets.push({
          ticker:symbol,name:q.name||NAMES[symbol]||symbol,
          type:symbol==="QQQ"?"etf":STOCKS.has(symbol)?"stock":"commodity",
          nativeCurrency:currency,priceNative:p,
          priceGBP:converted!=null?Number(converted.toFixed(2)):null,
          changePct:Number(changePct||0),
          analysis:analysis(Number(changePct||0),num(q.high),num(q.low),prev),
          provider:"Twelve Data",
          resolvedSymbol:tdSymbol
        });
      }catch(e){errors.push({ticker:symbol,provider:"Twelve Data",error:e.message});}
    }
  }

  return Response.json({
    source:"Finnhub + Twelve Data",
    asOf:new Date().toISOString(),
    fx:{pair:"USD/GBP",rate:fx},
    assets,errors
  },{headers:{"Cache-Control":"public, s-maxage=300, stale-while-revalidate=600"}});
 }
};