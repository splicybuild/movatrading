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
async function fh(path,key){
  const u=new URL(`https://finnhub.io/api/v1/${path}`);
  const res=await fetch(u,{headers:{"Accept":"application/json","X-Finnhub-Token":key}});
  const d=await res.json().catch(()=>({}));
  if(!res.ok||d.error)throw new Error(d.error||`Finnhub ${res.status}`);
  return d;
}
async function tdFx(key){
  if(!key)return null;
  try{
    const u=new URL("https://api.twelvedata.com/currency_conversion");
    u.searchParams.set("symbol","USD/GBP");u.searchParams.set("amount","1");
    const r=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
    const d=await r.json();return num(d.rate);
  }catch(e){return null;}
}
function reason(q){
  const pct=num(q.dp)||0;
  const range=(num(q.h)!=null&&num(q.l)!=null&&num(q.pc))?((num(q.h)-num(q.l))/num(q.pc))*100:null;
  let t=`${pct>=0?"Positive":"Negative"} ${Math.abs(pct).toFixed(2)}% daily move`;
  if(range!=null)t+=`; intraday range is ${range.toFixed(2)}%`;
  return t+".";
}
export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const fhKey=process.env.FINNHUB_API_KEY;
  if(!fhKey)return Response.json({error:"FINNHUB_API_KEY is not configured"},{status:500});
  const tdKey=process.env.TWELVE_DATA_API_KEY;
  const u=new URL(request.url);
  const sector=u.searchParams.get("sector")||"";
  const list=SECTORS[sector];
  if(!list)return Response.json({error:"Unsupported sector"},{status:400});
  const fx=await tdFx(tdKey);
  const results=await Promise.allSettled(list.map(([ticker])=>fh(`quote?symbol=${encodeURIComponent(ticker)}`,fhKey)));
  const assets=[],errors=[];
  results.forEach((r,i)=>{
    const [ticker,name]=list[i];
    if(r.status!=="fulfilled"){errors.push({ticker,error:r.reason?.message||"Unavailable"});return;}
    const q=r.value,p=num(q.c);
    if(p==null||p<=0){errors.push({ticker,error:"No current quote"});return;}
    assets.push({
      ticker,name,nativeCurrency:"USD",priceNative:p,
      priceGBP:fx!=null?Number((p*fx).toFixed(2)):null,
      changePct:num(q.dp)||0,reason:reason(q),provider:"Finnhub"
    });
  });
  return Response.json({source:"Finnhub",sector,asOf:new Date().toISOString(),assets,errors},
    {headers:{"Cache-Control":"public, s-maxage=600, stale-while-revalidate=1200"}});
 }
};