const SECTORS={
  Technology:[["NVDA","NVIDIA"],["MSFT","Microsoft"],["AAPL","Apple"],["AVGO","Broadcom"],["AMD","AMD"]],
  Utilities:[["NEE","NextEra Energy"],["SO","Southern Company"],["DUK","Duke Energy"],["AEP","American Electric Power"],["SRE","Sempra"]],
  Energy:[["XOM","Exxon Mobil"],["CVX","Chevron"],["COP","ConocoPhillips"],["SLB","SLB"],["OXY","Occidental Petroleum"]],
  Healthcare:[["AMGN","Amgen"],["GILD","Gilead Sciences"],["VRTX","Vertex Pharmaceuticals"],["REGN","Regeneron"],["ISRG","Intuitive Surgical"]],
  Financials:[["JPM","JPMorgan Chase"],["BAC","Bank of America"],["GS","Goldman Sachs"],["V","Visa"],["MA","Mastercard"]],
  "Consumer Discretionary":[["AMZN","Amazon"],["TSLA","Tesla"],["BKNG","Booking Holdings"],["MELI","MercadoLibre"],["MAR","Marriott"]],
  "Communication Services":[["GOOGL","Alphabet"],["META","Meta Platforms"],["NFLX","Netflix"],["TMUS","T-Mobile US"],["WBD","Warner Bros. Discovery"]]
};
function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}
async function finnhubQuote(symbol,key){
  const u=new URL("https://finnhub.io/api/v1/quote");u.searchParams.set("symbol",symbol);u.searchParams.set("token",key);
  const res=await fetch(u,{headers:{"Accept":"application/json"}});
  const d=await res.json().catch(()=>({}));
  if(!res.ok||d.error)throw new Error(d.error||`Finnhub ${res.status}`);
  const price=num(d.c);if(price==null||price<=0)throw new Error("Finnhub returned no current quote");
  return {priceNative:price,changePct:num(d.dp)||0,high:num(d.h),low:num(d.l),previous:num(d.pc),provider:"Finnhub"};
}
async function twelveQuote(symbol,key){
  const u=new URL("https://api.twelvedata.com/quote");u.searchParams.set("symbol",symbol);u.searchParams.set("interval","1day");
  const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const d=await res.json().catch(()=>({}));
  if(!res.ok||d.status==="error"||d.code)throw new Error(d.message||`Twelve Data ${res.status}`);
  const price=num(d.close);if(price==null||price<=0)throw new Error("Twelve Data returned no current quote");
  return {priceNative:price,changePct:num(d.percent_change)||0,high:num(d.high),low:num(d.low),previous:num(d.previous_close),provider:"Twelve Data"};
}
async function usdGbp(key){
  if(!key)return null;
  try{
    const u=new URL("https://api.twelvedata.com/currency_conversion");u.searchParams.set("symbol","USD/GBP");u.searchParams.set("amount","1");
    const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
    const d=await res.json();return num(d.rate);
  }catch(e){return null;}
}
function explain(changePct,high,low,previous,sector){
  const pct=Number(changePct||0),abs=Math.abs(pct);
  const range=(high!=null&&low!=null&&previous)?Math.abs((high-low)/previous*100):null;
  let text;
  if(pct>=2)text=`Strong buying momentum is lifting the shares ${pct.toFixed(2)}% today`;
  else if(pct>=0.5)text=`Positive buying pressure is supporting a ${pct.toFixed(2)}% gain today`;
  else if(pct>=0)text=`The shares are slightly positive at ${pct.toFixed(2)}%, suggesting relatively balanced trading`;
  else if(pct<=-2)text=`Heavy selling pressure is weighing on the shares, down ${abs.toFixed(2)}% today`;
  else if(pct<=-0.5)text=`The shares are under moderate selling pressure, down ${abs.toFixed(2)}% today`;
  else text=`The shares are slightly lower by ${abs.toFixed(2)}%, indicating a relatively subdued move`;
  if(range!=null)text+=`, within an intraday range of roughly ${range.toFixed(2)}%`;
  return text+`. This is a price/momentum signal contributing to current ${sector} breadth, not an identified news catalyst.`;
}
export default{
  async fetch(request){
    if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
    const fh=process.env.FINNHUB_API_KEY,td=process.env.TWELVE_DATA_API_KEY;
    if(!fh&&!td)return Response.json({error:"Neither FINNHUB_API_KEY nor TWELVE_DATA_API_KEY is configured"},{status:500});
    const u=new URL(request.url),sector=u.searchParams.get("sector")||"",list=SECTORS[sector];
    if(!list)return Response.json({error:"Unsupported sector"},{status:400});
    const fx=await usdGbp(td),assets=[],errors=[],providers=new Set();
    for(const [ticker,name] of list){
      let q=null,attempts=[];
      if(fh){try{q=await finnhubQuote(ticker,fh);}catch(e){attempts.push(`Finnhub: ${e.message}`);}}
      if(!q&&td){try{q=await twelveQuote(ticker,td);}catch(e){attempts.push(`Twelve Data: ${e.message}`);}}
      if(!q){errors.push({ticker,error:attempts.join(" | ")||"No quote provider available"});continue;}
      providers.add(q.provider);
      assets.push({
        ticker,name,nativeCurrency:"USD",priceNative:q.priceNative,
        priceGBP:fx!=null?Number((q.priceNative*fx).toFixed(2)):null,
        changePct:q.changePct,reason:explain(q.changePct,q.high,q.low,q.previous,sector),
        provider:q.provider
      });
    }
    return Response.json({source:[...providers].join(" + ")||"Unavailable",sector,asOf:new Date().toISOString(),assets,errors},
      {headers:{"Cache-Control":"public, s-maxage=600, stale-while-revalidate=1200"}});
  }
};