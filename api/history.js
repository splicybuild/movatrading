const ALLOWED = new Set(["NVDA","MSFT","AAPL","AMZN","META","GOOGL","TSLA","AVGO","QQQ"]);
const INTERVALS = new Set(["1min","5min","15min","30min","1h","1day"]);

export default {
  async fetch(request){
    if(request.method!=="GET"){
      return Response.json({error:"Method not allowed"},{status:405});
    }
    const key=process.env.TWELVE_DATA_API_KEY;
    if(!key){
      return Response.json({error:"TWELVE_DATA_API_KEY is not configured in Vercel"},{status:500});
    }

    const u=new URL(request.url);
    const symbol=(u.searchParams.get("symbol")||"NVDA").toUpperCase();
    const interval=u.searchParams.get("interval")||"5min";
    const outputsize=Math.max(10,Math.min(200,Number(u.searchParams.get("outputsize")||60)));

    if(!ALLOWED.has(symbol)) return Response.json({error:"Unsupported symbol"},{status:400});
    if(!INTERVALS.has(interval)) return Response.json({error:"Unsupported interval"},{status:400});

    const url=new URL("https://api.twelvedata.com/time_series");
    url.searchParams.set("symbol",symbol);
    url.searchParams.set("interval",interval);
    url.searchParams.set("outputsize",String(outputsize));
    url.searchParams.set("previous_close","true");

    try{
      const res=await fetch(url,{
        headers:{
          "Accept":"application/json",
          "Authorization":`apikey ${key}`
        }
      });
      const data=await res.json();
      if(!res.ok || data.status==="error" || data.code){
        throw new Error(data.message||`Twelve Data request failed (${res.status})`);
      }

      return Response.json({
        source:"Twelve Data",
        meta:data.meta,
        values:Array.isArray(data.values)?data.values:[]
      },{
        headers:{"Cache-Control":"s-maxage=60, stale-while-revalidate=300"}
      });
    }catch(error){
      return Response.json({error:error.message||"History request failed"},{status:502});
    }
  }
};
