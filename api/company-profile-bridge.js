const PROD_BASE='https://movatrading-vert.vercel.app';
const ALLOWED={
  fundamentals:['symbol'],
  market:['symbols'],
  'company-history':['ticker','name']
};

export default{async fetch(request){
  if(request.method!=='GET')return Response.json({error:'Method not allowed'},{status:405});
  const u=new URL(request.url);
  const endpoint=String(u.searchParams.get('endpoint')||'');
  const keys=ALLOWED[endpoint];
  if(!keys)return Response.json({error:'Unsupported endpoint'},{status:400});

  // This bridge is only a preview safety net. Never proxy a production request back to production.
  if(u.hostname==='movatrading-vert.vercel.app')return Response.json({error:'Preview bridge disabled on production'},{status:409});

  const target=new URL('/api/'+endpoint,PROD_BASE);
  for(const key of keys){
    const value=u.searchParams.get(key);
    if(value)target.searchParams.set(key,value);
  }

  try{
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),10000);
    const r=await fetch(target,{headers:{Accept:'application/json'},signal:ctrl.signal});
    clearTimeout(timer);
    const body=await r.text();
    return new Response(body,{status:r.status,headers:{
      'Content-Type':r.headers.get('content-type')||'application/json; charset=utf-8',
      'Cache-Control':endpoint==='market'?'public, s-maxage=30, stale-while-revalidate=60':'public, s-maxage=300, stale-while-revalidate=900',
      'X-MOVA-Preview-Bridge':'production-api'
    }});
  }catch(e){
    return Response.json({error:'Production API bridge unavailable',detail:String(e?.message||e)},{status:502});
  }
}};
