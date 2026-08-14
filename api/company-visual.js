function absoluteUrl(value,base){
  const v=String(value||"").trim();
  if(!v)return "";
  try{return new URL(v,base).toString();}catch(e){return "";}
}
function attr(tag,name){
  const re=new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`,"i");
  return (String(tag||"").match(re)||[])[1]||"";
}
function metaContent(html,key){
  const tags=String(html||"").match(/<meta\b[^>]*>/gi)||[];
  for(const tag of tags){
    const prop=(attr(tag,"property")||attr(tag,"name")).toLowerCase();
    if(prop===key.toLowerCase())return attr(tag,"content");
  }
  return "";
}
function bestIcon(html,base){
  const tags=String(html||"").match(/<link\b[^>]*>/gi)||[];
  const candidates=[];
  for(const tag of tags){
    const rel=attr(tag,"rel").toLowerCase(),href=attr(tag,"href");
    if(!href)continue;
    if(rel.includes("apple-touch-icon"))candidates.push({score:100,url:absoluteUrl(href,base)});
    else if(rel.includes("icon")){
      const sizes=attr(tag,"sizes");
      const n=Math.max(...(sizes.match(/\d+/g)||["0"]).map(Number));
      candidates.push({score:20+n,url:absoluteUrl(href,base)});
    }
  }
  return candidates.filter(x=>x.url).sort((a,b)=>b.score-a.score)[0]?.url||"";
}
function usefulImage(v){
  const s=String(v||"").toLowerCase();
  return s && !s.startsWith("data:") && !/\\.svg(?:\\?|$)/.test(s);
}
export default{async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  const u=new URL(request.url);
  let site=String(u.searchParams.get("url")||"").trim();
  if(!site)return Response.json({error:"url required"},{status:400});
  if(!/^https?:\/\//i.test(site))site=`https://${site}`;
  let parsed;try{parsed=new URL(site);}catch(e){return Response.json({error:"Invalid url"},{status:400});}

  const domain=parsed.hostname.replace(/^www\./,"");
  const fallbackLogo=`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=512`;
  const fallbackShot=`https://image.thum.io/get/width/1600/crop/760/noanimate/${site}`;

  try{
    const r=await fetch(site,{
      redirect:"follow",
      headers:{
        "Accept":"text/html,application/xhtml+xml",
        "User-Agent":"Mozilla/5.0 (compatible; MOVAResearch/1.0)"
      }
    });
    if(!r.ok)throw new Error(`Website ${r.status}`);
    const html=await r.text();
    const finalUrl=r.url||site;
    const og=absoluteUrl(metaContent(html,"og:image"),finalUrl);
    const twitter=absoluteUrl(metaContent(html,"twitter:image"),finalUrl);
    const icon=bestIcon(html,finalUrl);
    const image=[og,twitter].find(usefulImage)||fallbackShot;
    return Response.json({
      ok:true,domain,site:finalUrl,
      background:image,
      backgroundSource:(image===og?"og:image":image===twitter?"twitter:image":"website screenshot"),
      logo:icon||fallbackLogo,
      logoSource:icon?"website touch/icon":"domain favicon",
      fallbackBackground:fallbackShot,
      fallbackLogo
    },{headers:{"Cache-Control":"public, max-age=21600"}});
  }catch(e){
    return Response.json({
      ok:false,domain,site,
      background:fallbackShot,backgroundSource:"website screenshot fallback",
      logo:fallbackLogo,logoSource:"domain favicon fallback",
      fallbackBackground:fallbackShot,fallbackLogo
    },{headers:{"Cache-Control":"public, max-age=3600"}});
  }
}};