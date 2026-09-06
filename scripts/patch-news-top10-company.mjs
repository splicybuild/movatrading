import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`<style id="mova-news-top10-v3-style">
.mova-news-context{grid-column:1/-1;border:1px solid #1b465d;border-radius:14px;background:#07131d;padding:14px 16px;margin:4px 0 2px}.mova-news-context strong{display:block;font-size:15px}.mova-news-context span{display:block;margin-top:5px;color:#8fa5b4;font-size:12px;line-height:1.45}.mova-news-context .up{color:#66ff8a}.mova-news-context .down{color:#ff7d8a}.mova-news-context .flat{color:#42bbff}.mova-news-search-status{grid-column:1/-1;color:#8299aa;padding:18px 0}.mova-news-rank{display:inline-flex;align-items:center;justify-content:center;min-width:24px;height:24px;border:1px solid #28546a;border-radius:999px;margin-right:7px;color:#66ff8a;font-size:10px;font-weight:1000}
body.mova-light-theme .mova-news-context{background:#fff;border-color:#c8d7df}.mova-light-theme .mova-news-context span{color:#5d7381}
</style>`;
html=html.replace('</head>',css+'</head>');

// Load the default Top 10 market stories once the final News controller has been installed.
const js=`<script id="mova-news-default-market-v1">(function(){
  function loadDefaultMarketNews(){
    setTimeout(function(){
      try{if(typeof window.movaShowMarketNews==='function')window.movaShowMarketNews()}catch(e){}
    },0);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadDefaultMarketNews,{once:true});
  else loadDefaultMarketNews();
})();</script>`;
html=html.replace('</body>',js+'</body>');

writeFileSync(file,html);
console.log('MOVA News: styles retained and Top 10 market stories auto-load by default.');
