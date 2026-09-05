const STOCKS=new Set(["NVDA","MSFT","AAPL","AMZN","META","GOOGL","TSLA","AVGO","QQQ"]);
function alias(raw){let s=String(raw||"").trim().toUpperCase();if(s==="GOOG")s="GOOGL";if(["NDX","NASDAQ100","NASDAQ 100"].includes(s))s="QQQ";return s;}
async function finnhub(path,key){const u=new URL(`https://finnhub.io/api/v1/${path}`);u.searchParams.set("token",key);const r=await fetch(u,{headers:{Accept:"application/json"}});const d=await r.json().catch(()=>({}));if(!r.ok||d.error)throw new Error(d.error||`Finnhub ${r.status}`);return d;}
function norm(h){return String(h||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
function unique(items){const seen=new Set();return items.filter(x=>{const n=norm(x.title||x.headline),key=n.split(" ").slice(0,13).join(" ");if(!key||seen.has(key))return false;seen.add(key);return true;});}
async function company(symbol,key){const now=new Date(),from=new Date(now.getTime()-7*864e5).toISOString().slice(0,10),to=now.toISOString().slice(0,10);const d=await finnhub(`company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`,key);return (Array.isArray(d)?d:[]).map(x=>({symbol,title:x.headline,headline:x.headline,body:x.summary,summary:x.summary,source:x.source,url:x.url,image:x.image,datetime:x.datetime?new Date(x.datetime*1000).toISOString():null}));}
function decodeXml(s){return String(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'");}
function tag(block,name){const m=block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,`i`));return m?decodeXml(m[1]).trim():"";}
function attrTag(block,name,attr){const m=block.match(new RegExp(`<${name}[^>]*\\b${attr}=["']([^"']+)["'][^>]*>`,`i`));return m?decodeXml(m[1]).trim():"";}
function htmlImage(s){const m=String(s||"").match(/<img[^>]+src=["']([^"']+)["']/i);return m?decodeXml(m[1]).trim():"";}
function absolutize(url,base){try{return new URL(url,base).href}catch{return url||""}}
async function resolveArticle(url){
  if(!url)return {url:"",image:""};
  try{
    const r=await fetch(url,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0","Accept":"text/html,application/xhtml+xml"}});
    const finalUrl=r.url||url;
    const type=r.headers.get("content-type")||"";
    if(!r.ok||!type.includes("text/html"))return {url:finalUrl,image:""};
    const html=await r.text();
    const patterns=[
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i
    ];
    for(const p of patterns){const m=html.match(p);if(m&&m[1])return {url:finalUrl,image:absolutize(decodeXml(m[1]),finalUrl)}}
    return {url:finalUrl,image:""};
  }catch{return {url,image:""}}
}
const FALLBACK_IMAGES=[
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?auto=format&fit=crop&w=900&q=80"
];
async function googleReuters(){
  const queries=["site:reuters.com markets stocks","site:reuters.com Nasdaq technology stocks","site:reuters.com oil markets","site:reuters.com gold markets"];
  const raw=[];
  for(const q of queries){
    try{
      const u=new URL("https://news.google.com/rss/search");u.searchParams.set("q",q);u.searchParams.set("hl","en-GB");u.searchParams.set("gl","GB");u.searchParams.set("ceid","GB:en");
      const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});if(!r.ok)continue;const xml=await r.text();const items=xml.match(/<item>[\s\S]*?<\/item>/gi)||[];
      items.slice(0,8).forEach((b,i)=>{
        const title=tag(b,"title").replace(/\s+-\s+Reuters$/i,"");
        const url=tag(b,"link"),pub=tag(b,"pubDate"),desc=tag(b,"description");
        const feedImage=attrTag(b,"media:content","url")||attrTag(b,"media:thumbnail","url")||attrTag(b,"enclosure","url")||htmlImage(desc);
        if(title&&url)raw.push({title,headline:title,body:"Open the full Reuters story for the latest market details.",summary:"Open the full Reuters story for the latest market details.",source:"Reuters",url,image:feedImage,datetime:pub?new Date(pub).toISOString():new Date().toISOString()});
      });
    }catch{}
  }
  const deduped=unique(raw).sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0)).slice(0,20);
  const resolved=await Promise.all(deduped.map(async (item,i)=>{
    if(item.image)return {...item,image:absolutize(item.image,item.url)};
    const r=await resolveArticle(item.url);
    return {...item,url:r.url||item.url,image:r.image||FALLBACK_IMAGES[i%FALLBACK_IMAGES.length]};
  }));
  return resolved;
}
export default{async fetch(request){if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});const u=new URL(request.url);try{const key=process.env.FINNHUB_API_KEY;let items=[];if(key){const symbols=(u.searchParams.get("symbols")||"NVDA,MSFT,AAPL,AMZN,META,GOOGL,TSLA,AVGO").split(",").map(alias).filter(s=>s&&s!=="QQQ"&&!["GOLD","SILVER","OIL"].includes(s)),all=[];for(const s of symbols){try{all.push(...await company(s,key));}catch{}}items=unique(all).sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0)).slice(0,80);items=await Promise.all(items.slice(0,20).map(async (item,i)=>{if(item.image)return item;const r=await resolveArticle(item.url);return {...item,url:r.url||item.url,image:r.image||FALLBACK_IMAGES[i%FALLBACK_IMAGES.length]}}));}if(!items.length)items=await googleReuters();return Response.json({asOf:new Date().toISOString(),items},{headers:{"Cache-Control":"public, s-maxage=120, stale-while-revalidate=300"}});}catch(e){return Response.json({error:e.message||"News request failed"},{status:500});}}};
