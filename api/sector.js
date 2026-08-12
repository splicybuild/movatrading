const SECTORS={
  Technology:[
    ["NVDA","NVIDIA"],["MSFT","Microsoft"],["AAPL","Apple"],["AVGO","Broadcom"],["AMD","AMD"]
  ],
  Utilities:[
    ["NEE","NextEra Energy"],["SO","Southern Company"],["DUK","Duke Energy"],["AEP","American Electric Power"],["SRE","Sempra"]
  ],
  Energy:[
    ["XOM","Exxon Mobil"],["CVX","Chevron"],["COP","ConocoPhillips"],["SLB","SLB"],["OXY","Occidental Petroleum"]
  ],
  Healthcare:[
    ["AMGN","Amgen"],["GILD","Gilead Sciences"],["VRTX","Vertex Pharmaceuticals"],["REGN","Regeneron"],["ISRG","Intuitive Surgical"]
  ],
  Financials:[
    ["JPM","JPMorgan Chase"],["BAC","Bank of America"],["GS","Goldman Sachs"],["V","Visa"],["MA","Mastercard"]
  ],
  "Consumer Discretionary":[
    ["AMZN","Amazon"],["TSLA","Tesla"],["BKNG","Booking Holdings"],["MELI","MercadoLibre"],["MAR","Marriott"]
  ],
  "Communication Services":[
    ["GOOGL","Alphabet"],["META","Meta Platforms"],["NFLX","Netflix"],["TMUS","T-Mobile US"],["WBD","Warner Bros. Discovery"]
  ]
};

function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}

async function tdQuote(symbol,key){
  const u=new URL("https://api.twelvedata.com/quote");
  u.searchParams.set("symbol",symbol);
  u.searchParams.set("interval","1day");
  const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.status==="error"||data.code)throw new Error(data.message||`Quote unavailable for ${symbol}`);
  return data;
}

async function fxRate(key){
  const u=new URL("https://api.twelvedata.com/currency_conversion");
  u.searchParams.set("symbol","USD/GBP");
  u.searchParams.set("amount","1");
  const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const d=await res.json().catch(()=>({}));
  return num(d.rate);
}

function movementReason(q){
  const pct=num(q.percent_change)||0;
  const vol=num(q.volume);
  const avg=num(q.average_volume);
  const rel=(vol&&avg)?vol/avg:null;
  const range=(num(q.high)!=null&&num(q.low)!=null&&num(q.previous_close))?((num(q.high)-num(q.low))/num(q.previous_close))*100:null;
  const direction=pct>=0?"Positive":"Negative";
  let text=`${direction} ${Math.abs(pct).toFixed(2)}% daily move`;
  if(rel!=null)text+=`; volume is ${rel.toFixed(2)}× its recent average`;
  if(range!=null)text+=`; intraday range is ${range.toFixed(2)}%`;
  return text+".";
}

export default{
  async fetch(request){
    if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
    const key=process.env.TWELVE_DATA_API_KEY;
    if(!key)return Response.json({error:"TWELVE_DATA_API_KEY is not configured"},{status:500});

    const u=new URL(request.url);
    const sector=u.searchParams.get("sector")||"";
    const list=SECTORS[sector];
    if(!list)return Response.json({error:"Unsupported sector"},{status:400});

    let usdGbp=null;
    try{usdGbp=await fxRate(key);}catch(e){}

    const results=await Promise.allSettled(list.map(([ticker])=>tdQuote(ticker,key)));
    const assets=[];
    const errors=[];
    results.forEach((r,i)=>{
      const [ticker,fallbackName]=list[i];
      if(r.status!=="fulfilled"){errors.push({ticker,error:r.reason?.message||"Unavailable"});return;}
      const q=r.value;
      const nativePrice=num(q.close);
      const currency=q.currency||"USD";
      const priceGBP=currency==="GBP"?nativePrice:(currency==="USD"&&usdGbp&&nativePrice!=null?nativePrice*usdGbp:null);
      assets.push({
        ticker,
        name:q.name||fallbackName,
        nativeCurrency:currency,
        priceNative:nativePrice,
        priceGBP:priceGBP!=null?Number(priceGBP.toFixed(2)):null,
        changePct:num(q.percent_change)||0,
        reason:movementReason(q)
      });
    });

    return Response.json({
      source:"Twelve Data",
      sector,
      asOf:new Date().toISOString(),
      assets,
      errors
    },{headers:{"Cache-Control":"public, s-maxage=600, stale-while-revalidate=1200"}});
  }
};