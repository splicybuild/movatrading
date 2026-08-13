const SUPPORTED=new Set(["NVDA","MSFT","AAPL","AMZN","GOOGL","META","AVGO","TSLA"]);
function alias(raw){const s=String(raw||"").toUpperCase();return s==="GOOG"?"GOOGL":s;}
async function fh(path,key){
  const u=new URL(`https://finnhub.io/api/v1/${path}`);
  const res=await fetch(u,{headers:{"Accept":"application/json","X-Finnhub-Token":key}});
  const d=await res.json().catch(()=>({}));
  if(!res.ok||d.error)throw new Error(d.error||`Finnhub ${res.status}`);
  return d;
}
function firstMetric(m,...keys){
  for(const k of keys){if(m&&m[k]!=null&&Number.isFinite(Number(m[k])))return Number(m[k]);}
  return null;
}
export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const key=process.env.FINNHUB_API_KEY;
  if(!key)return Response.json({error:"FINNHUB_API_KEY is not configured in Vercel"},{status:500});
  const u=new URL(request.url);
  const symbol=alias(u.searchParams.get("symbol")||"");
  if(!SUPPORTED.has(symbol))return Response.json({error:"Fundamentals are available for MOVA's current US stock universe"},{status:400});
  try{
    const [profileRes,metricRes]=await Promise.allSettled([
      fh(`stock/profile2?symbol=${encodeURIComponent(symbol)}`,key),
      fh(`stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all`,key)
    ]);
    const profile=profileRes.status==="fulfilled"?profileRes.value:null;
    const raw=metricRes.status==="fulfilled"?metricRes.value:null;
    const m=raw?.metric||{};
    if(!profile&&!raw)throw new Error("Finnhub fundamentals unavailable");

    const marketCapMillions=profile?.marketCapitalization!=null?Number(profile.marketCapitalization):null;
    const statistics={
      valuations_metrics:{
        market_capitalization:marketCapMillions!=null?marketCapMillions*1e6:null,
        enterprise_value:firstMetric(m,"enterpriseValue","enterpriseValueAnnual"),
        trailing_pe:firstMetric(m,"peBasicExclExtraTTM","peTTM","peNormalizedAnnual"),
        forward_pe:firstMetric(m,"forwardPE","peForward"),
        price_to_sales_ttm:firstMetric(m,"psTTM","priceToSalesTTM"),
        price_to_book_mrq:firstMetric(m,"pbQuarterly","pbAnnual","priceToBookQuarterly")
      },
      financials:{
        profit_margin:(()=>{
          const v=firstMetric(m,"netProfitMarginTTM","netProfitMarginAnnual");
          return v==null?null:v/100;
        })()
      },
      stock_statistics:{
        shares_outstanding:profile?.shareOutstanding!=null?Number(profile.shareOutstanding)*1e6:null
      }
    };
    const normalizedProfile={
      ...profile,
      sector:profile?.finnhubIndustry||null,
      industry:profile?.finnhubIndustry||null,
      website:profile?.weburl||null,
      city:null,state:null,
      country:profile?.country||null,
      employees:null,
      description:null
    };
    return Response.json({
      symbol,currency:profile?.currency||"USD",
      profile:normalizedProfile,statistics,
      liveFundamentals:true,
      provider:"Finnhub",
      providerLabel:"Finnhub fundamentals + MOVA profile"
    },{headers:{"Cache-Control":"public, s-maxage=43200, stale-while-revalidate=86400"}});
  }catch(e){
    return Response.json({error:e.message||"Fundamentals unavailable"},{status:502});
  }
 }
};