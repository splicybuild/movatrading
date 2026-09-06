// MOVA News image resolver v4 — market news + company-specific top-10 search.
function norm(h){return String(h||"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();}
function unique(items){const seen=new Set();return items.filter(x=>{const n=norm(x.title||x.headline),key=n.split(" ").slice(0,13).join(" ");if(!key||seen.has(key))return false;seen.add(key);return true;});}
function decodeXml(s){return String(s||"").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,"$1").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'");}
function tag(block,name){const m=block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`,`i`));return m?decodeXml(m[1]).trim():"";}
function attrTag(block,name,attr){const m=block.match(new RegExp(`<${name}[^>]*\\b${attr}=["']([^"']+)["'][^>]*>`,`i`));return m?decodeXml(m[1]).trim():"";}
function htmlImage(s){const m=String(s||"").match(/<img[^>]+src=["']([^"']+)["']/i);return m?decodeXml(m[1]).trim():"";}
function stripHtml(s){return decodeXml(String(s||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ")).trim();}
function absolutize(url,base){try{return new URL(url,base).href}catch{return url||""}}
function canonicalImage(url){try{const u=new URL(url);return (u.origin+u.pathname).toLowerCase()}catch{return String(url||"").split('?')[0].toLowerCase()}}
function usableImage(url){if(!url)return false;const s=String(url).toLowerCase();return !(/logo|icon|avatar|sprite|pixel|tracking|favicon/.test(s));}
function escQuery(v){return String(v||'').replace(/["<>]/g,' ').replace(/\s+/g,' ').trim();}
async function resolveArticle(url){
  if(!url)return {url:"",image:""};
  try{
    const r=await fetch(url,{redirect:"follow",headers:{"User-Agent":"Mozilla/5.0","Accept":"text/html,application/xhtml+xml"}});
    const finalUrl=r.url||url,type=r.headers.get("content-type")||"";
    if(!r.ok||!type.includes("text/html"))return {url:finalUrl,image:""};
    const html=await r.text();
    const metaPatterns=[
      /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
      /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i
    ];
    for(const p of metaPatterns){const m=html.match(p);if(m&&usableImage(m[1]))return {url:finalUrl,image:absolutize(decodeXml(m[1]),finalUrl)}}
    const jsonLdBlocks=html.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi)||[];
    for(const block of jsonLdBlocks){
      const body=block.replace(/^<script[^>]*>/i,'').replace(/<\/script>$/i,'');
      for(const re of [/"image"\s*:\s*"([^"]+)"/i,/"image"\s*:\s*\[\s*"([^"]+)"/i,/"image"\s*:\s*\{[\s\S]*?"url"\s*:\s*"([^"]+)"/i]){
        const m=body.match(re);if(m&&usableImage(m[1]))return {url:finalUrl,image:absolutize(decodeXml(m[1].replace(/\\\//g,'/')),finalUrl)};
      }
    }
    const imgs=[...html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi)].map(m=>m[1]).filter(usableImage);
    if(imgs.length)return {url:finalUrl,image:absolutize(decodeXml(imgs[0]),finalUrl)};
    return {url:finalUrl,image:""};
  }catch{return {url,image:""}}
}
const FALLBACK_IMAGES=[
 "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1624996379697-f01d168b1a52?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1579226905180-636b76d96082?auto=format&fit=crop&w=900&q=80",
 "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?auto=format&fit=crop&w=900&q=80"
];
async function bingQuery(q){
  const all=[];
  try{
    const u=new URL("https://www.bing.com/news/search");u.searchParams.set("q",q);u.searchParams.set("format","rss");u.searchParams.set("setlang","en-GB");u.searchParams.set("cc","GB");
    const r=await fetch(u,{headers:{"User-Agent":"Mozilla/5.0"}});if(!r.ok)return all;
    const xml=await r.text(),blocks=xml.match(/<item>[\s\S]*?<\/item>/gi)||[];
    for(const b of blocks.slice(0,16)){
      const title=tag(b,"title"),url=tag(b,"link"),pub=tag(b,"pubDate"),desc=tag(b,"description");
      const source=tag(b,"News:Source")||tag(b,"source")||"Market news";
      const image=attrTag(b,"media:content","url")||attrTag(b,"media:thumbnail","url")||attrTag(b,"enclosure","url")||htmlImage(desc);
      if(title&&url)all.push({title,headline:title,summary:stripHtml(desc).slice(0,240),body:stripHtml(desc).slice(0,240),source,url,image:image?absolutize(image,url):"",datetime:pub?new Date(pub).toISOString():new Date().toISOString()});
    }
  }catch{}
  return all;
}
function relevanceScore(item,symbol,name){
  const text=norm((item.title||'')+' '+(item.summary||''));
  const ticker=norm(symbol),company=norm(name);
  let score=0;
  if(ticker&&new RegExp('(?:^| )'+ticker+'(?: |$)').test(text))score+=8;
  if(company){const words=company.split(' ').filter(x=>x.length>2);score+=words.filter(w=>text.includes(w)).length*3;}
  if(/earnings|revenue|guidance|forecast|analyst|rating|target|shares|stock|market|investor|results|margin|sales|profit|loss|sec|regulatory|acquisition|merger|launch|demand|supply|chip|ai|rates|yield|inflation/.test(text))score+=2;
  const age=Math.max(0,Date.now()-new Date(item.datetime||0).getTime());
  score+=Math.max(0,4-age/86400000);
  return score;
}
async function finish(items,limit=20){
  const picked=unique(items).slice(0,Math.max(limit,10));
  const used=new Set(),output=[];
  for(let i=0;i<picked.length&&output.length<limit;i++){
    const item=picked[i];
    let image=usableImage(item.image)?item.image:"",resolvedUrl=item.url;
    if(!image||used.has(canonicalImage(image))){const r=await resolveArticle(item.url);resolvedUrl=r.url||item.url;if(r.image&&!used.has(canonicalImage(r.image)))image=r.image;}
    if(!image||used.has(canonicalImage(image)))image=FALLBACK_IMAGES.find(x=>!used.has(canonicalImage(x)))||FALLBACK_IMAGES[i%FALLBACK_IMAGES.length];
    used.add(canonicalImage(image));output.push({...item,url:resolvedUrl,image});
  }
  return output;
}
async function bingMarketNews(){
  const queries=["US stock market","Nasdaq technology stocks","oil markets","gold markets","Federal Reserve markets"];
  const groups=await Promise.all(queries.map(bingQuery));
  const items=unique(groups.flat()).sort((a,b)=>new Date(b.datetime||0)-new Date(a.datetime||0));
  return finish(items,20);
}
async function bingCompanyNews(symbol,name){
  const s=escQuery(symbol).toUpperCase(),n=escQuery(name||symbol);
  const queries=[
    `"${n}" ${s} stock`,
    `"${n}" ${s} earnings OR revenue OR guidance`,
    `"${n}" ${s} analyst OR price target OR shares`,
    `"${n}" ${s} market news`
  ];
  const groups=await Promise.all(queries.map(bingQuery));
  const ranked=unique(groups.flat()).map(x=>({...x,relevance:relevanceScore(x,s,n)})).sort((a,b)=>b.relevance-a.relevance||new Date(b.datetime||0)-new Date(a.datetime||0));
  return finish(ranked,10);
}
export default{async fetch(request){
  if(request.method!=="GET")return Response.json({error:"Method not allowed"},{status:405});
  try{
    const u=new URL(request.url),symbol=escQuery(u.searchParams.get('symbol')).toUpperCase(),name=escQuery(u.searchParams.get('name'));
    const items=symbol?await bingCompanyNews(symbol,name||symbol):await bingMarketNews();
    return Response.json({asOf:new Date().toISOString(),mode:symbol?'company':'market',symbol:symbol||null,name:name||null,items},{headers:{"Cache-Control":"public, s-maxage=120, stale-while-revalidate=300"}});
  }catch(e){return Response.json({error:e.message||"News request failed"},{status:500});}
}};
