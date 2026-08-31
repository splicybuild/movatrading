const PROD_BASE="https://movatrading-vert.vercel.app";
async function proxyProduction(request){
  const incoming=new URL(request.url),target=new URL("/api/fundamentals",PROD_BASE);target.search=incoming.search;
  const r=await fetch(target,{headers:{Accept:"application/json"}}),body=await r.text();
  return new Response(body,{status:r.status,headers:{"Content-Type":r.headers.get("content-type")||"application/json; charset=utf-8","Cache-Control":"public, s-maxage=300, stale-while-revalidate=900","X-MOVA-Preview-Source":"production-api"}});
}
async function fh(path,key){
  const u=new URL(`https://finnhub.io/api/v1/${path}`);u.searchParams.set("token",key);
  const r=await fetch(u,{headers:{"Accept":"application/json"}});const d=await r.json().catch(()=>({}));
  if(!r.ok||d.error)throw new Error(d.error||`Finnhub ${r.status}`);return d;
}
function num(v){const n=Number(v);return Number.isFinite(n)?n:null;}
export default{async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const key=process.env.FINNHUB_API_KEY;
  if(!key){
    if(process.env.VERCEL_ENV==="preview")return proxyProduction(request);
    return Response.json({error:"FINNHUB_API_KEY is not configured"},{status:500});
  }
  const u=new URL(request.url),symbol=String(u.searchParams.get("symbol")||"").trim().toUpperCase();
  if(!symbol)return Response.json({error:"Symbol required"},{status:400});
  const [pr,mr]=await Promise.allSettled([fh(`stock/profile2?symbol=${encodeURIComponent(symbol)}`,key),fh(`stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all`,key)]);
  const p=pr.status==="fulfilled"?pr.value:{}, md=mr.status==="fulfilled"?mr.value:{},m=md?.metric||{};
  const pe=num(m.peTTM)??num(m.peNormalizedAnnual)??num(m.peBasicExclExtraTTM);
  const fpe=num(m.forwardPE)??null, ps=num(m.psTTM)??num(m.psAnnual),pb=num(m.pbAnnual)??num(m.pbQuarterly);
  const margin=num(m.netProfitMarginTTM)??num(m.netProfitMarginAnnual);
  const dy=num(m.dividendYieldIndicatedAnnual)??num(m.currentDividendYieldTTM)??num(m.dividendYield5Y);
  return Response.json({source:"Finnhub",providerLabel:"Finnhub company profile + basic financials",liveFundamentals:Boolean(Object.keys(m).length||Object.keys(p).length),currency:p.currency||"USD",
    profile:{name:p.name||symbol,ticker:p.ticker||symbol,exchange:p.exchange||"",industry:p.finnhubIndustry||"",sector:p.finnhubIndustry||"",country:p.country||"",website:p.weburl||"",ipo:p.ipo||"",phone:p.phone||"",marketCapitalization:num(p.marketCapitalization),shareOutstanding:num(p.shareOutstanding),logo:p.logo||""},
    metric:m,statistics:{valuations_metrics:{market_capitalization:num(p.marketCapitalization)??num(m.marketCapitalization),trailing_pe:pe,forward_pe:fpe,price_to_sales_ttm:ps,price_to_book_mrq:pb},financials:{profit_margin:margin!=null?(Math.abs(margin)>1?margin/100:margin):null,dividend_yield:dy},stock_statistics:{shares_outstanding:num(p.shareOutstanding)}}},
    {headers:{"Cache-Control":"public, s-maxage=21600, stale-while-revalidate=43200"}});
}};