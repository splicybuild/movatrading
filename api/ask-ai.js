function num(v){const n=Number(v);return Number.isFinite(n)?n:0;}
function money(v){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:2}).format(num(v));}
function safeText(v,max=8000){return String(v||'').replace(/\u0000/g,'').slice(0,max);}
function portfolioSummary(raw){
  const holdings=Array.isArray(raw?.holdings)?raw.holdings.slice(0,40):[];
  const rows=holdings.map(h=>{
    const qty=num(h.qty),avg=num(h.avg),current=num(h.current),value=qty*current,cost=qty*avg,pnl=value-cost,pnlPct=cost?100*pnl/cost:0;
    return {ticker:safeText(h.ticker,20).toUpperCase(),qty,avg,current,value,cost,pnl,pnlPct};
  }).filter(x=>x.ticker);
  const holdingsValue=rows.reduce((s,x)=>s+x.value,0);
  const cost=rows.reduce((s,x)=>s+x.cost,0);
  const cash=num(raw?.cash);
  const total=holdingsValue+cash;
  const pnl=holdingsValue-cost;
  const ranked=rows.slice().sort((a,b)=>b.value-a.value);
  const concentrations=ranked.map(x=>({ticker:x.ticker,weightPct:total?100*x.value/total:0,value:x.value}));
  const project=(rate,years)=>total*Math.pow(1+rate,years);
  return {
    cash,holdingsValue,totalValue:total,totalCost:cost,totalPnl:pnl,totalPnlPct:cost?100*pnl/cost:0,
    holdings:rows,concentrations,
    illustrativeScenarios:{
      note:'Illustrative compound-return scenarios only; these are not forecasts.',
      cautious:{annualRate:0.04,oneYear:project(.04,1),threeYears:project(.04,3),fiveYears:project(.04,5)},
      base:{annualRate:0.08,oneYear:project(.08,1),threeYears:project(.08,3),fiveYears:project(.08,5)},
      strong:{annualRate:0.12,oneYear:project(.12,1),threeYears:project(.12,3),fiveYears:project(.12,5)}
    }
  };
}
function fallbackPortfolioAnswer(q,p){
  const top=p.concentrations.slice(0,3).map(x=>`${x.ticker} ${x.weightPct.toFixed(1)}%`).join(', ')||'No holdings';
  const s=p.illustrativeScenarios;
  return `MOVA portfolio snapshot\n\nCurrent portfolio value: ${money(p.totalValue)} (${money(p.holdingsValue)} invested + ${money(p.cash)} cash). Unrealised P/L versus recorded average cost: ${p.totalPnl>=0?'+':''}${money(p.totalPnl)} (${p.totalPnlPct>=0?'+':''}${p.totalPnlPct.toFixed(1)}%).\n\nLargest concentrations: ${top}. Concentration is important because a small number of large positions can dominate both upside and drawdown risk.\n\nIllustrative growth scenarios (not forecasts):\n• 4% annualised: ${money(s.cautious.oneYear)} in 1y, ${money(s.cautious.threeYears)} in 3y, ${money(s.cautious.fiveYears)} in 5y.\n• 8% annualised: ${money(s.base.oneYear)} in 1y, ${money(s.base.threeYears)} in 3y, ${money(s.base.fiveYears)} in 5y.\n• 12% annualised: ${money(s.strong.oneYear)} in 1y, ${money(s.strong.threeYears)} in 3y, ${money(s.strong.fiveYears)} in 5y.\n\nFor a deeper answer to “${safeText(q,180)}” using current company news, macro drivers and web research, MOVA needs OPENAI_API_KEY configured on the deployment.`;
}

const MOVA_COMPANY_NAMES={NVDA:'NVIDIA',MSFT:'Microsoft',AAPL:'Apple',AMZN:'Amazon',META:'Meta Platforms',GOOGL:'Alphabet',GOOG:'Alphabet',TSLA:'Tesla',AVGO:'Broadcom',AMD:'Advanced Micro Devices',ASML:'ASML Holding',PLTR:'Palantir Technologies',NFLX:'Netflix',INTC:'Intel',MU:'Micron Technology',ARM:'Arm Holdings',QCOM:'Qualcomm',ORCL:'Oracle',CRM:'Salesforce',ADBE:'Adobe'};
const MOVA_TICKER_STOP=new Set(['MOVA','AI','ETF','ETFS','USD','US','UK','CEO','CFO','EPS','PE','P','L','IPO','ADR','THE','AND','WHAT','WHO','WHY','HOW','IS','ARE','MY']);
function inferTicker(q){const raw=String(q||'');for(const [ticker,name] of Object.entries(MOVA_COMPANY_NAMES)){if(new RegExp('\b'+name.replace(/[.*+?^${}()|[\]\]/g,'\$&')+'\b','i').test(raw))return ticker;}const tokens=raw.match(/[A-Z][A-Z0-9.\-]{1,7}/g)||[];return tokens.find(x=>!MOVA_TICKER_STOP.has(x))||'';}
function isPortfolioIntent(q){const x=String(q||'').toLowerCase();return /portfolio|holdings?|positions?|allocation|concentration|diversif|unrealised|p\/?l/.test(x)||/(my|our)\s+(investments?|stocks?|shares?)/.test(x);}
function pct(v){return Number.isFinite(v)?`${v>=0?'+':''}${v.toFixed(1)}%`:'n/a';}
function histStats(values){const rows=(Array.isArray(values)?values:[]).map(v=>({date:v.datetime,close:Number(v.close),high:Number(v.high),low:Number(v.low)})).filter(v=>Number.isFinite(v.close));if(!rows.length)return null;const latest=rows[0].close,ret=i=>rows[i]&&rows[i].close?((latest/rows[i].close)-1)*100:null,yr=rows.slice(0,253),highs=yr.map(x=>x.high).filter(Number.isFinite),lows=yr.map(x=>x.low).filter(Number.isFinite);return {latest,date:rows[0].date,oneMonth:ret(21),threeMonth:ret(63),sixMonth:ret(126),oneYear:ret(252),high52:highs.length?Math.max(...highs):null,low52:lows.length?Math.min(...lows):null};}
async function jsonOrNull(url){try{const r=await fetch(url,{headers:{Accept:'application/json'}});const d=await r.json().catch(()=>null);return r.ok&&d&&!d.error?d:null;}catch{return null;}}
async function fallbackCompanyAnswer(request,question){const ticker=inferTicker(question);if(!ticker)return null;const name=MOVA_COMPANY_NAMES[ticker]||ticker,origin=new URL(request.url).origin;const [profile,market,history,news]=await Promise.all([jsonOrNull(`${origin}/api/company-history?ticker=${encodeURIComponent(ticker)}&name=${encodeURIComponent(name)}`),jsonOrNull(`${origin}/api/market?symbols=${encodeURIComponent(ticker)}`),jsonOrNull(`${origin}/api/history?symbol=${encodeURIComponent(ticker)}&interval=1day&outputsize=260`),jsonOrNull(`${origin}/api/news?symbols=${encodeURIComponent(ticker)}`)]);if(!profile&&!market&&!history&&!news)return null;const a=market?.assets?.[0]||null,h=histStats(history?.values),heads=(news?.items||[]).slice(0,4),timeline=(profile?.timeline||[]).slice(0,5),sources=[];if(profile?.website)sources.push({title:`${name} official website`,url:profile.website});for(const x of heads)if(x?.url&&!sources.some(y=>y.url===x.url))sources.push({title:x.title||x.headline||`${ticker} news`,url:x.url});const parts=[`${name} (${ticker}) — MOVA research snapshot`];if(profile?.summary)parts.push(`
Who they are
${safeText(profile.summary,1800)}`);if(profile?.sections?.business)parts.push(`
How the business works
${safeText(profile.sections.business,1300)}`);const facts=[];if(profile?.foundedDisplay)facts.push(`Founded: ${profile.foundedDisplay}`);if(profile?.headquarters)facts.push(`Headquarters: ${profile.headquarters}`);if(facts.length)parts.push(`
Company background
${facts.join('
')}`);if(h){let line=`Latest historical close returned: ${money(h.latest)}${h.date?` (${h.date})`:''}.`;const moves=[];if(Number.isFinite(h.oneMonth))moves.push(`1 month ${pct(h.oneMonth)}`);if(Number.isFinite(h.threeMonth))moves.push(`3 months ${pct(h.threeMonth)}`);if(Number.isFinite(h.sixMonth))moves.push(`6 months ${pct(h.sixMonth)}`);if(Number.isFinite(h.oneYear))moves.push(`1 year ${pct(h.oneYear)}`);if(moves.length)line+=` Approximate price performance: ${moves.join(', ')}.`;if(Number.isFinite(h.low52)&&Number.isFinite(h.high52))line+=` 52-week range: ${money(h.low52)} to ${money(h.high52)}.`;parts.push(`
Investment / share-price history
${line}`);}if(a)parts.push(`
Current market read
${ticker} is ${pct(Number(a.changePct)||0)} today at about ${money(Number(a.priceNative??a.priceUSD??a.price))}. Current direction: ${a.analysis?.direction||'mixed'}; momentum: ${a.analysis?.momentum||'normal'}. Source: ${a.provider||market?.source||'MOVA market feed'}.`);if(timeline.length)parts.push(`
Key company milestones
${timeline.map(x=>`• ${x.year||''}${x.year?' — ':''}${x.title||'Milestone'}: ${safeText(x.text,360)}`).join('
')}`);if(heads.length)parts.push(`
Recent news
${heads.map(x=>`• ${x.datetime?new Date(x.datetime).toISOString().slice(0,10)+' — ':''}${safeText(x.title||x.headline,240)}${x.source?` (${x.source})`:''}`).join('
')}`);parts.push(`
MOVA view
For an investor, the key is to connect the business quality and competitive position with this price trend, valuation, earnings trajectory and current catalysts. This answer uses MOVA's available company and market feeds. The generative AI layer is not connected on this deployment yet, so MOVA is showing the underlying research rather than inventing an AI opinion.`);return {answer:parts.join('
'),sources:sources.slice(0,8),configured:false,ticker,fallback:'company-research'};}

function collectSources(data){
  const out=[];
  for(const item of data?.output||[]){
    if(item?.type==='web_search_call'){
      const src=item?.action?.sources;
      if(Array.isArray(src))for(const s of src){const url=s?.url||s?.link,title=s?.title||s?.name||url;if(url&&!out.some(x=>x.url===url))out.push({title:safeText(title,180),url:safeText(url,800)});}
    }
    if(item?.type==='message'){
      for(const c of item?.content||[]){
        for(const a of c?.annotations||[]){const url=a?.url||a?.url_citation?.url,title=a?.title||a?.url_citation?.title||url;if(url&&!out.some(x=>x.url===url))out.push({title:safeText(title,180),url:safeText(url,800)});}
      }
    }
  }
  return out.slice(0,12);
}
export default {async fetch(request){
  if(request.method==='GET')return Response.json({ok:true,configured:Boolean(process.env.OPENAI_API_KEY),model:'gpt-5.6-terra'},{headers:{'Cache-Control':'no-store'}});
  if(request.method!=='POST')return Response.json({error:'Method not allowed'},{status:405});
  try{
    const body=await request.json();
    const question=safeText(body?.question,5000).trim();
    if(!question)return Response.json({error:'Ask a question first.'},{status:400});
    const portfolio=portfolioSummary(body?.portfolio||{});
    const history=Array.isArray(body?.history)?body.history.slice(-8).map(x=>({role:x?.role==='assistant'?'assistant':'user',content:safeText(x?.content,4000)})):[];
    const key=process.env.OPENAI_API_KEY;
    if(!key){
      if(isPortfolioIntent(question))return Response.json({answer:fallbackPortfolioAnswer(question,portfolio),sources:[],configured:false,portfolio},{headers:{'Cache-Control':'no-store'}});
      const companyFallback=await fallbackCompanyAnswer(request,question);
      if(companyFallback)return Response.json(companyFallback,{headers:{'Cache-Control':'no-store'}});
      return Response.json({answer:'MOVA can research named companies and tickers from its market/company feeds, but the generative AI layer is not connected on this deployment yet. Include a company ticker such as ASML, AMD or NVDA, or connect OPENAI_API_KEY for broader live AI research and synthesis.',sources:[],configured:false},{headers:{'Cache-Control':'no-store'}});
    }

    const now=new Date().toISOString();
    const instructions=`You are MOVA AI, the research assistant inside MOVA Trading. Current timestamp: ${now}. Answer questions about stocks, shares, ETFs, indices, commodities, market drivers, news and the user's supplied MOVA portfolio.\n\nFor any question naming a stock, share, ticker, listed company, ETF, index or commodity, use web search so the answer reflects current information even when the user does not explicitly say latest or current. For current or time-sensitive questions, use web search. Prefer primary/company filings, investor relations, exchanges, regulators and established financial/news sources. State dates for current news. Distinguish facts from interpretation. Never invent prices, analyst targets, earnings numbers or headlines. For company research, cover what the business does, relevant investment and share-price history, financial and earnings context, valuation context when reliably available, recent news and catalysts, material risks, competitive or sector factors, and what investors should watch next. Explain why each factor matters rather than listing facts.\n\nFor portfolio questions, analyse the supplied holdings, weights, recorded average costs, P/L and cash. Identify concentration, diversification, correlated exposures, company/sector/macro risks, catalysts and what could materially change the outlook. If the user asks for projected growth, use scenario analysis and clearly label assumptions; never present a projection as guaranteed. The supplied 4%, 8% and 12% compound scenarios are illustrative reference cases, not predictions. You may supplement them with researched company/market context.\n\nStyle: detailed but concise, plain English, useful to a trader/investor. Lead with a direct answer, then use short sections when useful: MOVA view; Current drivers; Relevant news/catalysts; Risks; Portfolio impact; Scenarios; What to watch next. Explain why each factor matters. Avoid generic filler. Do not tell the user simply to consult an adviser. Include a brief informational-not-personal-financial-advice note only when the answer contains investment conclusions or projections.`;

    const context={question,portfolio,conversation:history};
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{'Authorization':`Bearer ${key}`,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'gpt-5.6-terra',
        reasoning:{effort:'medium'},
        text:{verbosity:'high'},
        tools:[{type:'web_search_preview',search_context_size:'high'}],
        tool_choice:'auto',
        include:['web_search_call.action.sources'],
        store:false,
        max_output_tokens:7000,
        instructions,
        input:[{role:'user',content:[{type:'input_text',text:`MOVA context (JSON):\n${JSON.stringify(context)}\n\nAnswer the user's question using this context.`}]}]
      })
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data?.error?.message||`OpenAI ${r.status}`);
    const answer=safeText(data?.output_text||'',30000) || (data?.output||[]).flatMap(i=>i?.content||[]).filter(c=>c?.type==='output_text').map(c=>c.text).join('\n').trim();
    if(!answer)throw new Error('AI returned no text response');
    return Response.json({answer,sources:collectSources(data),configured:true,model:data?.model||'gpt-5.6-terra',asOf:now,portfolio},{headers:{'Cache-Control':'no-store'}});
  }catch(e){return Response.json({error:e?.message||'MOVA Ask AI failed'},{status:500,headers:{'Cache-Control':'no-store'}});}
}};
