import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, stat } from "node:fs/promises";

import market from "./api/market.js";
import history from "./api/history.js";
import sector from "./api/sector.js";
import companyHistory from "./api/company-history.js";
import fundamentals from "./api/fundamentals.js";
import news from "./api/news.js";
import companyVisual from "./api/company-visual.js";
import newsVisual from "./api/news-visual.js";

const __filename=fileURLToPath(import.meta.url);
const ROOT=path.dirname(__filename);
const PORT=Number(process.env.PORT||10000);
const HOST="0.0.0.0";

const API={
  market,
  history,
  sector,
  "company-history":companyHistory,
  fundamentals,
  news,
  "company-visual":companyVisual,
  "news-visual":newsVisual
};

const MIME={
  ".html":"text/html; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".svg":"image/svg+xml",
  ".png":"image/png",
  ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg",
  ".webp":"image/webp",
  ".ico":"image/x-icon",
  ".txt":"text/plain; charset=utf-8",
  ".md":"text/markdown; charset=utf-8"
};

function send(res,status,headers,body){
  res.writeHead(status,headers);
  if(body==null)res.end();
  else res.end(body);
}

function safeFilePath(urlPath){
  const decoded=decodeURIComponent(urlPath.split("?")[0]);
  const relative=decoded.replace(/^\/+/,"");
  const full=path.resolve(ROOT,relative||"index.html");
  if(full!==ROOT && !full.startsWith(ROOT+path.sep))return null;
  return full;
}

async function serveStatic(req,res,pathname){
  let target=pathname==="/" ? "/index.html" : pathname;
  let full=safeFilePath(target);
  if(!full){
    send(res,400,{"content-type":"text/plain; charset=utf-8"},"Bad request");
    return;
  }

  try{
    const info=await stat(full);
    if(info.isDirectory())full=path.join(full,"index.html");
    const body=await readFile(full);
    const ext=path.extname(full).toLowerCase();
    send(res,200,{
      "content-type":MIME[ext]||"application/octet-stream",
      "cache-control":ext===".html" ? "no-cache" : "public, max-age=3600"
    },req.method==="HEAD"?null:body);
  }catch(e){
    // MOVA is a single-page app: unknown browser routes fall back to index.html.
    if(req.method==="GET" && !path.extname(pathname)){
      try{
        const body=await readFile(path.join(ROOT,"index.html"));
        send(res,200,{
          "content-type":"text/html; charset=utf-8",
          "cache-control":"no-cache"
        },body);
        return;
      }catch(_){}
    }
    send(res,404,{"content-type":"text/plain; charset=utf-8"},"Not found");
  }
}

async function nodeRequestToWebRequest(req){
  const proto=(req.headers["x-forwarded-proto"]||"https").toString().split(",")[0].trim();
  const host=(req.headers["x-forwarded-host"]||req.headers.host||`localhost:${PORT}`).toString().split(",")[0].trim();
  const url=`${proto}://${host}${req.url}`;
  const headers=new Headers();
  for(const [k,v] of Object.entries(req.headers)){
    if(v==null)continue;
    if(Array.isArray(v))v.forEach(x=>headers.append(k,x));
    else headers.set(k,String(v));
  }

  let body;
  if(!["GET","HEAD"].includes(req.method||"GET")){
    const chunks=[];
    for await(const chunk of req)chunks.push(Buffer.from(chunk));
    if(chunks.length)body=Buffer.concat(chunks);
  }
  return new Request(url,{method:req.method||"GET",headers,body});
}

async function serveApi(req,res,pathname){
  const name=pathname.slice("/api/".length).replace(/\/+$/,"");
  const handler=API[name];
  if(!handler?.fetch){
    send(res,404,{"content-type":"application/json; charset=utf-8"},
      JSON.stringify({error:"Unknown API endpoint"}));
    return;
  }

  try{
    const request=await nodeRequestToWebRequest(req);
    const response=await handler.fetch(request);
    const headers={};
    response.headers.forEach((v,k)=>headers[k]=v);
    const bytes=Buffer.from(await response.arrayBuffer());
    send(res,response.status,headers,req.method==="HEAD"?null:bytes);
  }catch(err){
    console.error(`API /api/${name} failed`,err);
    send(res,500,{"content-type":"application/json; charset=utf-8"},
      JSON.stringify({error:"Internal server error"}));
  }
}

const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||"/",`http://${req.headers.host||"localhost"}`);
    const pathname=url.pathname;

    if(pathname==="/health"){
      send(res,200,{"content-type":"application/json; charset=utf-8"},
        JSON.stringify({
          ok:true,
          service:"mova-trading",
          render:Boolean(process.env.RENDER),
          finnhubConfigured:Boolean(process.env.FINNHUB_API_KEY),
          twelveDataConfigured:Boolean(process.env.TWELVE_DATA_API_KEY)
        }));
      return;
    }

    if(pathname.startsWith("/api/")){
      await serveApi(req,res,pathname);
      return;
    }

    await serveStatic(req,res,pathname);
  }catch(err){
    console.error("Request failed",err);
    send(res,500,{"content-type":"text/plain; charset=utf-8"},"Internal server error");
  }
});

server.listen(PORT,HOST,()=>{
  console.log(`MOVA Trading listening on http://${HOST}:${PORT}`);
  console.log(`FINNHUB_API_KEY configured: ${Boolean(process.env.FINNHUB_API_KEY)}`);
  console.log(`TWELVE_DATA_API_KEY configured: ${Boolean(process.env.TWELVE_DATA_API_KEY)}`);
});
