function absoluteUrl(value,base){
  const v=String(value||"").trim();
  if(!v)return "";
  try{return new URL(v,base).toString();}catch(e){return "";}
}
function attr(tag,name){
  const re=new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`,"i");
  return (String(tag||"").match(re)||[])[1]||"";
}
function bestWebsiteLogo(html,base){
  const candidates=[];
  for(const tag of (String(html||"").match(/<meta\b[^>]*>/gi)||[])){
    const prop=(attr(tag,"property")||attr(tag,"name")).toLowerCase();
    const content=absoluteUrl(attr(tag,"content"),base);
    if(content && /og:image|twitter:image/.test(prop))candidates.push(content);
  }
  for(const tag of (String(html||"").match(/<link\b[^>]*>/gi)||[])){
    const rel=attr(tag,"rel").toLowerCase();
    const href=absoluteUrl(attr(tag,"href"),base);
    if(href && (rel.includes("apple-touch-icon")||rel.includes("icon")))candidates.push(href);
  }
  for(const tag of (String(html||"").match(/<img\b[^>]*>/gi)||[])){
    const hint=`${attr(tag,"alt")} ${attr(tag,"class")} ${attr(tag,"id")} ${attr(tag,"src")}`.toLowerCase();
    if(!/logo|wordmark|brand/.test(hint))continue;
    const src=absoluteUrl(attr(tag,"src")||attr(tag,"data-src"),base);
    if(src)candidates.unshift(src);
  }
  return [...new Set(candidates)];
}
async function fetchImage(url){
  if(!url)return null;
  try{
    const r=await fetch(url,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (compatible; MOVA/1.0)","Accept":"image/avif,image/webp,image/svg+xml,image/*,*/*;q=0.8"}});
    if(!r.ok)return null;
    const type=(r.headers.get("content-type")||"").toLowerCase();
    if(!type.startsWith("image/"))return null;
    const body=await r.arrayBuffer();
    if(body.byteLength<500)return null;
    return {body,type};
  }catch(e){return null;}
}
async function finnhubProfile(symbol,key){
  if(!symbol||!key)return null;
  try{
    const u=new URL("https://finnhub.io/api/v1/stock/profile2");
    u.searchParams.set("symbol",symbol);
    u.searchParams.set("token",key);
    const r=await fetch(u);
    if(!r.ok)return null;
    const d=await r.json();
    return d&&Object.keys(d).length?d:null;
  }catch(e){return null;}
}
export default{async fetch(request){
  const u=new URL(request.url);
  const symbol=String(u.searchParams.get("symbol")||"").trim().toUpperCase();
  let site=String(u.searchParams.get("url")||"").trim();
  const key=process.env.FINNHUB_API_KEY||"";
  const profile=await finnhubProfile(symbol,key);
  if(profile?.weburl)site=profile.weburl;
  const candidates=[];
  if(profile?.logo)candidates.push(profile.logo);

  if(site){
    if(!/^https?:\/\//i.test(site))site=`https://${site}`;
    try{
      const r=await fetch(site,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0 (compatible; MOVAResearch/1.0)","Accept":"text/html,application/xhtml+xml"}});
      if(r.ok){
        const html=await r.text();
        candidates.push(...bestWebsiteLogo(html,r.url||site));
      }
    }catch(e){}
    try{
      const domain=new URL(site).hostname.replace(/^www\./,"");
      candidates.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=512`);
    }catch(e){}
  }

  for(const candidate of [...new Set(candidates.filter(Boolean))]){
    const img=await fetchImage(candidate);
    if(!img)continue;
    return new Response(img.body,{
      status:200,
      headers:{
        "Content-Type":img.type,
        "Cache-Control":"public, s-maxage=86400, stale-while-revalidate=604800"
      }
    });
  }

  return new Response("",{status:404,headers:{"Cache-Control":"public, max-age=900"}});
}};