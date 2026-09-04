function absoluteUrl(value,base){
  const v=String(value||"").trim();
  if(!v)return "";
  try{return new URL(v,base).toString();}catch(e){return "";}
}
function attr(tag,name){
  const re=new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`,"i");
  return (String(tag||"").match(re)||[])[1]||"";
}
function srcsetBest(tag,base){
  const raw=attr(tag,"srcset")||attr(tag,"data-srcset");
  if(!raw)return "";
  const items=raw.split(",").map(x=>x.trim()).map(x=>{
    const m=x.match(/^(\S+)(?:\s+(\d+)(?:w|x))?$/);
    return m?{url:absoluteUrl(m[1],base),size:Number(m[2]||0)}:null;
  }).filter(Boolean).filter(x=>x.url);
  return items.sort((a,b)=>b.size-a.size)[0]?.url||"";
}
function scoreCandidate(url,hint="",w=0,h=0,baseScore=0){
  const u=String(url||"").toLowerCase(),t=String(hint||"").toLowerCase();
  let score=baseScore;
  if(/\.svg(?:\?|$)/.test(u))score+=350;
  if(/logo|wordmark|brand|logotype|site-logo/.test(u+" "+t))score+=180;
  if(/header|navbar|masthead/.test(t))score+=60;
  if(w>=200||h>=200)score+=70;
  if(w>=400||h>=400)score+=90;
  if(/apple-touch-icon/.test(t+" "+u))score+=50;
  if(/favicon|icon-16|icon-32|icon-48/.test(u+" "+t))score-=220;
  if(/og:image|twitter:image/.test(t))score-=280;
  return score;
}
function websiteCandidates(html,base){
  const out=[];
  for(const tag of (String(html||"").match(/<img\b[^>]*>/gi)||[])){
    const direct=attr(tag,"src")||attr(tag,"data-src")||attr(tag,"data-lazy-src");
    const srcset=srcsetBest(tag,base);
    const alt=attr(tag,"alt"),cls=attr(tag,"class"),id=attr(tag,"id");
    const hint=`${alt} ${cls} ${id} ${direct} ${srcset}`;
    if(!/logo|wordmark|brand|logotype|site-logo/i.test(hint))continue;
    const w=Number(attr(tag,"width")||0),h=Number(attr(tag,"height")||0);
    for(const raw of [srcset,direct]){
      const url=absoluteUrl(raw,base);if(!url)continue;
      out.push({url,score:scoreCandidate(url,hint,w,h,200)});
    }
  }
  for(const tag of (String(html||"").match(/<link\b[^>]*>/gi)||[])){
    const rel=attr(tag,"rel"),href=absoluteUrl(attr(tag,"href"),base);
    if(!href||!/(apple-touch-icon|icon)/i.test(rel))continue;
    const n=Math.max(...(attr(tag,"sizes").match(/\d+/g)||["0"]).map(Number));
    out.push({url:href,score:scoreCandidate(href,rel,n,n,40)});
  }
  return out;
}
async function fetchImage(url){
  if(!url)return null;
  try{
    const r=await fetch(url,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (compatible; MOVA/1.0)","Accept":"image/svg+xml,image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8"}});
    if(!r.ok)return null;
    const type=(r.headers.get("content-type")||"").toLowerCase();
    if(!type.startsWith("image/"))return null;
    const body=await r.arrayBuffer();
    if(body.byteLength<300)return null;
    return {body,type};
  }catch(e){return null;}
}
async function finnhubProfile(symbol,key){
  if(!symbol||!key)return null;
  try{
    const u=new URL("https://finnhub.io/api/v1/stock/profile2");
    u.searchParams.set("symbol",symbol);u.searchParams.set("token",key);
    const r=await fetch(u);if(!r.ok)return null;
    const d=await r.json();return d&&Object.keys(d).length?d:null;
  }catch(e){return null;}
}
function fallbackSvg(symbol){
  const safe=String(symbol||"?").replace(/[^A-Z0-9.-]/gi,"").slice(0,5)||"?";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><rect width="256" height="256" rx="42" fill="#f5f7f8"/><text x="128" y="142" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="800" fill="#10202c">${safe}</text></svg>`;
}
export default{async fetch(request){
  const u=new URL(request.url);
  const symbol=String(u.searchParams.get("symbol")||"").trim().toUpperCase();
  let site=String(u.searchParams.get("url")||"").trim();
  const key=process.env.FINNHUB_API_KEY||"";
  const profile=await finnhubProfile(symbol,key);
  if(profile?.weburl)site=profile.weburl;

  const candidates=[];
  if(profile?.logo)candidates.push({url:profile.logo,score:240});

  if(site){
    if(!/^https?:\/\//i.test(site))site=`https://${site}`;
    try{
      const r=await fetch(site,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (compatible; MOVAResearch/1.0)","Accept":"text/html,application/xhtml+xml"}});
      if(r.ok){
        const html=await r.text();
        candidates.push(...websiteCandidates(html,r.url||site));
      }
    }catch(e){}
    try{
      const domain=new URL(site).hostname.replace(/^www\./,"");
      candidates.push({url:`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=512`,score:10});
    }catch(e){}
  }

  const ordered=[...new Map(candidates.filter(x=>x?.url).sort((a,b)=>b.score-a.score).map(x=>[x.url,x])).values()];
  for(const candidate of ordered){
    const img=await fetchImage(candidate.url);
    if(!img)continue;
    return new Response(img.body,{status:200,headers:{"Content-Type":img.type,"Cache-Control":"public, s-maxage=21600, stale-while-revalidate=604800","X-MOVA-Logo-Source":candidate.url}});
  }

  return new Response(fallbackSvg(symbol),{status:200,headers:{"Content-Type":"image/svg+xml; charset=utf-8","Cache-Control":"public, max-age=900"}});
}};