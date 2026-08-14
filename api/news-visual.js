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
function absoluteUrl(value,base){
  try{return new URL(String(value||"").trim(),base).toString();}catch(e){return "";}
}
function genericImage(url){
  const s=String(url||"").toLowerCase();
  return !s || /(?:logo|favicon|icon|sprite|placeholder|default[-_]?image|brandmark)/.test(s);
}
export default{async fetch(request){
  const u=new URL(request.url);
  const article=String(u.searchParams.get("url")||"").trim();
  const fallback=String(u.searchParams.get("fallback")||"").trim();
  if(!article)return Response.json({image:genericImage(fallback)?"":fallback},{headers:{"Cache-Control":"public,max-age=3600"}});
  try{
    const r=await fetch(article,{redirect:"follow",headers:{"Accept":"text/html,application/xhtml+xml","User-Agent":"Mozilla/5.0 (compatible; MOVANews/1.0)"}});
    if(!r.ok)throw new Error(String(r.status));
    const html=await r.text(),base=r.url||article;
    const candidates=[
      absoluteUrl(metaContent(html,"og:image"),base),
      absoluteUrl(metaContent(html,"twitter:image"),base),
      absoluteUrl(metaContent(html,"twitter:image:src"),base),
      fallback
    ];
    const image=candidates.find(x=>x&&!genericImage(x))||"";
    return Response.json({image},{headers:{"Cache-Control":"public,max-age=21600"}});
  }catch(e){
    return Response.json({image:genericImage(fallback)?"":fallback},{headers:{"Cache-Control":"public,max-age=1800"}});
  }
}};