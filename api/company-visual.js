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


function srcsetBest(tag,base){
  const raw=attr(tag,"srcset")||attr(tag,"data-srcset");
  if(!raw)return "";
  const c=raw.split(",").map(x=>x.trim()).map(x=>{
    const m=x.match(/^(\S+)(?:\s+(\d+)(?:w|x))?$/);
    return m?{url:absoluteUrl(m[1],base),size:Number(m[2]||0)}:null;
  }).filter(Boolean).filter(x=>x.url);
  return c.sort((a,b)=>b.size-a.size)[0]?.url||"";
}
function jsonLdLogos(html,base){
  const scripts=String(html||"").match(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)||[];
  const out=[];
  const walk=v=>{
    if(!v||typeof v!=="object")return;
    if(v.logo){
      const value=typeof v.logo==="string"?v.logo:(v.logo.url||v.logo.contentUrl||"");
      const u=absoluteUrl(value,base); if(u)out.push(u);
    }
    Object.values(v).forEach(x=>{if(x&&typeof x==="object")walk(x);});
  };
  for(const block of scripts){
    const raw=block.replace(/^.*?>/s,"").replace(/<\/script>\s*$/i,"").trim();
    try{const data=JSON.parse(raw);(Array.isArray(data)?data:[data]).forEach(walk);}catch(e){}
  }
  return [...new Set(out)];
}
function logoQualityScore(url,hint="",w=0,h=0){
  const u=String(url||"").toLowerCase(), t=String(hint||"").toLowerCase();
  let score=0;
  if(/\.svg(?:\?|$)/.test(u))score+=240;
  if(/logo|wordmark|brand/.test(u+" "+t))score+=90;
  if(/header|navbar|nav/.test(t))score+=35;
  if(/footer/.test(t))score-=20;
  if(w>=200||h>=200)score+=70;
  if(w>=400||h>=400)score+=70;
  if(/favicon|icon-16|icon-32|icon-48|apple-touch-icon-57/.test(u))score-=200;
  return score;
}


function inlineSvgLogos(html){
  const out=[];
  const svgs=String(html||"").match(/<svg\b[\s\S]*?<\/svg>/gi)||[];
  for(const svg of svgs){
    const open=(svg.match(/^<svg\b[^>]*>/i)||[""])[0];
    const hint=(open+" "+svg.slice(0,800)).toLowerCase();
    if(!/logo|brand|wordmark|site-logo|header-logo|navbar/.test(hint))continue;

    // Strip scripts/events before returning the markup as an image source.
    const clean=svg
      .replace(/<script\b[\s\S]*?<\/script>/gi,"")
      .replace(/\son\w+\s*=\s*["'][^"']*["']/gi,"")
      .replace(/\son\w+\s*=\s*[^\s>]+/gi,"");

    // A usable inline SVG needs a viewBox or explicit dimensions.
    if(!/viewBox\s*=|width\s*=|height\s*=/i.test(clean))continue;
    try{
      const encoded="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(clean);
      out.push(encoded);
    }catch(e){}
  }
  return out;
}

function bestPageLogo(html,base){
  const candidates=[];
  for(const u of jsonLdLogos(html,base)){
    candidates.push({score:logoQualityScore(u,"jsonld logo",500,500),url:u});
  }
  const imgs=String(html||"").match(/<img\b[^>]*>/gi)||[];
  for(const tag of imgs){
    const direct=attr(tag,"src")||attr(tag,"data-src")||attr(tag,"data-lazy-src");
    const srcset=srcsetBest(tag,base);
    const alt=(attr(tag,"alt")||"").toLowerCase();
    const cls=(attr(tag,"class")||"").toLowerCase();
    const id=(attr(tag,"id")||"").toLowerCase();
    const width=Number(attr(tag,"width")||0),height=Number(attr(tag,"height")||0);
    const hint=`${direct} ${srcset} ${alt} ${cls} ${id}`.toLowerCase();
    if(!/logo|brand|wordmark|site-mark|site-logo/.test(hint))continue;
    for(const raw of [srcset,direct]){
      const url=absoluteUrl(raw,base); if(!url)continue;
      candidates.push({score:logoQualityScore(url,hint,width,height),url});
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
    const inlineLogos=inlineSvgLogos(html); const pageLogo=bestPageLogo(html,finalUrl); const icon=bestIcon(html,finalUrl); const jsonLogos=jsonLdLogos(html,finalUrl);
    const image=[og,twitter].find(usefulImage)||fallbackShot;
    return Response.json({
      ok:true,domain,site:finalUrl,
      background:image,
      backgroundSource:(image===og?"og:image":image===twitter?"twitter:image":"website screenshot"),
      logo:inlineLogos[0]||pageLogo||jsonLogos[0]||icon||fallbackLogo,
      logoCandidates:[...inlineLogos,pageLogo,...jsonLogos,icon,fallbackLogo].filter(Boolean),
      logoSource:pageLogo?"website logo":icon?"website touch/icon":"domain favicon",
      fallbackBackground:fallbackShot,
      fallbackLogo
    },{headers:{"Cache-Control":"public, max-age=21600"}});
  }catch(e){
    return Response.json({
      ok:false,domain,site,
      background:fallbackShot,backgroundSource:"website screenshot fallback",
      logo:fallbackLogo,logoCandidates:[fallbackLogo],logoSource:"domain favicon fallback",
      fallbackBackground:fallbackShot,fallbackLogo
    },{headers:{"Cache-Control":"public, max-age=3600"}});
  }
}};