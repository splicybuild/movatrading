const DEFAULT_SYMBOLS = ["NVDA","MSFT","AAPL","AMZN","META","GOOGL","TSLA","AVGO","QQQ","GOLD","SILVER","OIL"];
const ALLOWED = new Set(DEFAULT_SYMBOLS);

const COMMODITY_ALIASES = {
  GOLD: { symbol: "XAU/USD", name: "Gold Spot" },
  SILVER: { symbol: "XAG/USD", name: "Silver Spot" }
};

function clamp(n,min=0,max=100){ return Math.max(min,Math.min(max,n)); }
function num(v){ const n=Number(v); return Number.isFinite(n)?n:null; }

async function td(path, params, key){
  const url=new URL(`https://api.twelvedata.com${path}`);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,String(v)));
  const res=await fetch(url,{
    headers:{
      "Accept":"application/json",
      "Authorization":`apikey ${key}`
    }
  });
  const data=await res.json().catch(()=>({}));
  if(!res.ok || data.status==="error" || data.code){
    throw new Error(data.message || `Twelve Data request failed (${res.status})`);
  }
  return data;
}

async function resolveOilSymbol(key){
  const catalogue=await td("/commodities",{outputsize:100},key);
  const rows=Array.isArray(catalogue.data)?catalogue.data:[];
  const matches=rows.filter(x=>/crude/i.test(x.name||"") && /oil/i.test(x.name||""));
  const preferred=matches.find(x=>/wti/i.test(x.name||"")) || matches[0];
  return preferred ? {symbol:preferred.symbol,name:preferred.name||"Crude Oil"} : null;
}

function analyseQuote(q){
  const pct=num(q.percent_change) ?? 0;
  const volume=num(q.volume);
  const averageVolume=num(q.average_volume);
  const high=num(q.high);
  const low=num(q.low);
  const prev=num(q.previous_close) || num(q.close) || 1;

  const relVolume=(volume && averageVolume) ? volume/averageVolume : 1;
  const intradayVol=(high!=null && low!=null && prev) ? ((high-low)/prev)*100 : 0;

  const movementScore=clamp(38 + Math.abs(pct)*13);
  const relativeVolumeScore=clamp(relVolume*50);
  const volatilityScore=clamp(intradayVol*22);
  const momentumScore=clamp(50 + pct*9);
  const pulseScore=clamp(
    movementScore*0.40 +
    relativeVolumeScore*0.35 +
    volatilityScore*0.25
  );

  const earlyMoveScore=clamp(100-(Math.abs(pct)*18));
  const radarScore=clamp(
    relativeVolumeScore*0.45 +
    volatilityScore*0.35 +
    earlyMoveScore*0.20
  );

  const radarStage=radarScore>=80?"Accelerating":radarScore>=68?"Building":radarScore>=55?"Emerging":"Cooling";
  const direction=pct>=0?"positive":"negative";

  const reason=`${direction[0].toUpperCase()+direction.slice(1)} ${Math.abs(pct).toFixed(2)}% move; relative volume ${relVolume.toFixed(2)}× normal; intraday range ${intradayVol.toFixed(2)}%.`;
  const radarReason=relVolume>=1.3
    ? `Volume is ${relVolume.toFixed(2)}× normal while the move is ${Math.abs(pct).toFixed(2)}%, which can indicate activity building before a larger move.`
    : `Volume is near normal (${relVolume.toFixed(2)}×); Radar is watching volatility and price behaviour for further confirmation.`;

  return {
    pulseScore:Math.round(pulseScore),
    radarScore:Math.round(radarScore),
    radarStage,
    momentumScore:Math.round(momentumScore),
    relativeVolumeScore:Math.round(relativeVolumeScore),
    volatilityScore:Math.round(volatilityScore),
    relativeVolume:Number(relVolume.toFixed(2)),
    intradayVolatilityPct:Number(intradayVol.toFixed(2)),
    reason,
    radarReason
  };
}

export default {
  async fetch(request){
    if(request.method!=="GET"){
      return Response.json({error:"Method not allowed"},{status:405});
    }

    const key=process.env.TWELVE_DATA_API_KEY;
    if(!key){
      return Response.json({error:"TWELVE_DATA_API_KEY is not configured in Vercel"},{status:500});
    }

    const requestUrl=new URL(request.url);
    const requested=(requestUrl.searchParams.get("symbols")||DEFAULT_SYMBOLS.join(","))
      .split(",").map(s=>s.trim().toUpperCase()).filter(Boolean);
    const symbols=[...new Set(requested)].filter(s=>ALLOWED.has(s)).slice(0,12);
    if(!symbols.length){
      return Response.json({error:"No supported symbols requested"},{status:400});
    }

    try{
      let usdGbp=null;
      try{
        const fx=await td("/currency_conversion",{symbol:"USD/GBP",amount:1},key);
        usdGbp=num(fx.rate);
      }catch(e){
        console.warn("USD/GBP conversion unavailable:",e.message);
      }

      const resolved=[];
      for(const ticker of symbols){
        if(COMMODITY_ALIASES[ticker]){
          resolved.push({ticker,...COMMODITY_ALIASES[ticker],type:"commodity"});
        }else if(ticker==="OIL"){
          try{
            const oil=await resolveOilSymbol(key);
            if(oil) resolved.push({ticker,...oil,type:"commodity"});
            else resolved.push({ticker,symbol:null,name:"Crude Oil",type:"commodity",resolveError:"No crude oil symbol found"});
          }catch(e){
            resolved.push({ticker,symbol:null,name:"Crude Oil",type:"commodity",resolveError:e.message});
          }
        }else{
          resolved.push({ticker,symbol:ticker,name:null,type:ticker==="QQQ"?"etf":"stock"});
        }
      }

      const results=await Promise.allSettled(resolved.map(item=>{
        if(!item.symbol) throw new Error(item.resolveError||"Symbol unavailable");
        return td("/quote",{symbol:item.symbol,interval:"1day"},key);
      }));

      const assets=[];
      const errors=[];
      results.forEach((result,i)=>{
        const item=resolved[i];
        const ticker=item.ticker;
        if(result.status!=="fulfilled"){
          errors.push({ticker,error:result.reason?.message||"Quote unavailable"});
          return;
        }
        const q=result.value;
        const nativePrice=num(q.close);
        const currency=q.currency||"USD";
        const priceGBP=currency==="GBP"
          ? nativePrice
          : (currency==="USD" && usdGbp && nativePrice!=null ? nativePrice*usdGbp : null);

        assets.push({
          ticker,
          symbol:item.symbol,
          name:item.name||q.name||ticker,
          exchange:q.exchange||null,
          nativeCurrency:currency,
          priceNative:nativePrice,
          priceGBP:priceGBP!=null?Number(priceGBP.toFixed(2)):null,
          changePct:num(q.percent_change) ?? 0,
          volume:num(q.volume),
          averageVolume:num(q.average_volume),
          marketOpen:Boolean(q.is_market_open),
          type:item.type,
          analysis:analyseQuote(q)
        });
      });

      return Response.json({
        source:"Twelve Data",
        asOf:new Date().toISOString(),
        displayCurrency:"GBP",
        usdGbpRate:usdGbp,
        assets,
        errors
      },{
        headers:{"Cache-Control":"s-maxage=60, stale-while-revalidate=300"}
      });
    }catch(error){
      return Response.json({error:error.message||"Market data request failed"},{status:502});
    }
  }
};
