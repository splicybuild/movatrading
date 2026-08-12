const SUPPORTED=new Set(["NVDA","MSFT","AAPL","AMZN","GOOGL","META","AVGO","TSLA"]);

async function td(path,symbol,key){
  const u=new URL(`https://api.twelvedata.com/${path}`);
  u.searchParams.set("symbol",symbol);
  const res=await fetch(u,{headers:{"Accept":"application/json","Authorization":`apikey ${key}`}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok||data.status==="error"||data.code)throw new Error(data.message||`${path} unavailable`);
  return data;
}

export default{
 async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const key=process.env.TWELVE_DATA_API_KEY;
  if(!key)return Response.json({error:"TWELVE_DATA_API_KEY is not configured"},{status:500});
  const u=new URL(request.url);
  let symbol=(u.searchParams.get("symbol")||"").toUpperCase();
  if(symbol==="GOOG")symbol="GOOGL";
  if(!SUPPORTED.has(symbol))return Response.json({error:"Fundamentals are only available for the stock test universe"},{status:400});

  let profile=null,statistics=null,profileError=null,statisticsError=null;
  try{profile=await td("profile",symbol,key);}catch(e){profileError=e.message;}
  try{
    const d=await td("statistics",symbol,key);
    statistics=d.statistics||d;
  }catch(e){statisticsError=e.message;}

  if(!profile&&!statistics){
    return Response.json({
      symbol,
      liveFundamentals:false,
      profile:null,
      statistics:null,
      limitations:{
        profile:profileError||"Unavailable",
        statistics:statisticsError||"Unavailable"
      }
    });
  }

  return Response.json({
    symbol,
    currency:statistics?.meta?.currency||profile?.currency||"USD",
    profile,
    statistics,
    liveFundamentals:true,
    limitations:{profile:profileError,statistics:statisticsError}
  },{headers:{"Cache-Control":"public, s-maxage=43200, stale-while-revalidate=86400"}});
 }
};