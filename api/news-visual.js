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
function looksGeneric(url){
  const s=String(url||"").toLowerCase();
  if(!s)return true;
  return /(?:logo|favicon|sprite|placeholder|default[-_]?image|brandmark|author[-_]?image|avatar|icon(?:[-_.]|\/)|profile[-_]?image)/.test(s);
}
export default{async fetch(request){
  const u=new URL(request.url);
  const article=String(u.searchParams.get("url")||"").trim();
  const feed=String(u.searchParams.get("fallback")||"").trim();

  if(!article){
    return Response.json({
      feedImage:looksGeneric(feed)?"":feed,
      articleImage:"",
      screenshot:""
    },{headers:{"Cache-Control":"public,max-age=1800"}});
  }

  let articleImage="";
  try{
    const r=await fetch(article,{
      redirect:"follow",
      headers:{
        "Accept":"text/html,application/xhtml+xml",
        "User-Agent":"Mozilla/5.0 (compatible; MOVANews/1.0)"
      }
    });
    if(r.ok){
      const html=await r.text(),base=r.url||article;
      const candidates=[
        absoluteUrl(metaContent(html,"og:image:secure_url"),base),
        absoluteUrl(metaContent(html,"og:image"),base),
        absoluteUrl(metaContent(html,"twitter:image"),base),
        absoluteUrl(metaContent(html,"twitter:image:src"),base)
      ].filter(Boolean);
      articleImage=candidates.find(x=>!looksGeneric(x))||"";
    }
  }catch(e){}

  const safeFeed=looksGeneric(feed)?"":feed;
  const screenshot=`https://image.thum.io/get/width/1400/crop/700/noanimate/${article}`;

  return Response.json({
    feedImage:safeFeed,
    articleImage,
    screenshot
  },{headers:{"Cache-Control":"public,max-age=7200"}});
}};