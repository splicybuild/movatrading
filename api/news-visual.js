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
  return /(?:logo|favicon|sprite|placeholder|default[-_]?image|brandmark|author[-_]?image|avatar|icon(?:[-_.]|\/)|profile[-_]?image|site[-_]?logo|publisher[-_]?logo)/.test(s);
}
function imageCandidates(html,base){
  const out=[
    absoluteUrl(metaContent(html,"og:image:secure_url"),base),
    absoluteUrl(metaContent(html,"og:image"),base),
    absoluteUrl(metaContent(html,"twitter:image"),base),
    absoluteUrl(metaContent(html,"twitter:image:src"),base)
  ];
  const imgs=String(html||"").match(/<img\b[^>]*>/gi)||[];
  for(const tag of imgs.slice(0,80)){
    const src=absoluteUrl(attr(tag,"src")||attr(tag,"data-src")||attr(tag,"data-lazy-src"),base);
    const hint=`${attr(tag,"alt")} ${attr(tag,"class")} ${attr(tag,"id")}`.toLowerCase();
    if(src && /hero|article|story|lead|featured|main[-_ ]?image|content[-_ ]?image/.test(hint))out.push(src);
  }
  return [...new Set(out.filter(x=>x&&!looksGeneric(x)))];
}
export default{async fetch(request){
  const u=new URL(request.url);
  const article=String(u.searchParams.get("url")||"").trim();
  const feed=String(u.searchParams.get("fallback")||"").trim();
  if(!article)return Response.json({feedImage:looksGeneric(feed)?"":feed,articleImage:"",screenshot:""});

  let articleImage="";
  try{
    const r=await fetch(article,{
      redirect:"follow",
      headers:{"Accept":"text/html,application/xhtml+xml","User-Agent":"Mozilla/5.0 (compatible; MOVANews/1.0)"}
    });
    if(r.ok){
      const html=await r.text(),base=r.url||article;
      articleImage=imageCandidates(html,base)[0]||"";
    }
  }catch(e){}

  // A page screenshot is intentionally article-specific and therefore a much
  // better fallback than repeating one generic stock photo across unrelated stories.
  const screenshot=`https://image.thum.io/get/width/1400/crop/760/noanimate/${article}`;
  return Response.json({
    feedImage:looksGeneric(feed)?"":feed,
    articleImage,
    screenshot
  },{headers:{"Cache-Control":"public,s-maxage=7200,stale-while-revalidate=21600"}});
}};