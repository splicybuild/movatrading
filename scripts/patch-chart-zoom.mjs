import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`
/* MOVA chart zoom controls */
.mova-chart-zoom-controls{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 12px;padding:8px 9px;border:1px solid #153446;border-radius:13px;background:#06121b}.mova-chart-zoom-label{font-size:10px;font-weight:900;color:#7891a2;letter-spacing:.07em;margin-right:3px}.mova-chart-zoom-btn{border:1px solid #1a4056;background:#081923;color:#a9bbc6;border-radius:10px;min-height:35px;padding:0 12px;font-size:12px;font-weight:900;cursor:pointer}.mova-chart-zoom-btn:hover{background:#0d3851;border-color:#1b668f;color:#fff}.mova-chart-zoom-readout{min-width:50px;text-align:center;color:#7eefff;font-size:11px;font-weight:900}.mova-chart-zoom-btn:disabled{opacity:.4;cursor:not-allowed}
@media(max-width:740px){.mova-chart-zoom-controls{gap:6px}.mova-chart-zoom-label{width:100%;margin-bottom:1px}.mova-chart-zoom-btn{flex:1;min-width:72px;padding:0 7px}.mova-chart-zoom-readout{min-width:44px}}
`;
if(!html.includes('/* MOVA chart zoom controls */'))html=html.replace('</style>',css+'</style>');

const runtime=`
<script>
(function(){
  let zoomFactor=1;
  let zoomAnchor=1; // 1 = latest/right side of the dataset
  let originalDraw=null;
  let zoomControls=null;

  function visibleSlice(data){
    if(!Array.isArray(data)||data.length<3||zoomFactor<=1)return data;
    const visible=Math.max(12,Math.round(data.length/zoomFactor));
    if(visible>=data.length)return data;
    const maxStart=data.length-visible;
    const start=Math.max(0,Math.min(maxStart,Math.round(maxStart*zoomAnchor)));
    return data.slice(start,start+visible);
  }

  function installZoomRenderer(){
    if(originalDraw||typeof drawMarketChart!=='function')return false;
    originalDraw=drawMarketChart;
    drawMarketChart=function(){
      if(zoomFactor<=1||!Array.isArray(chartData)||chartData.length<3)return originalDraw();
      const full=chartData;
      chartData=visibleSlice(full);
      try{return originalDraw()}finally{chartData=full}
    };
    return true;
  }

  function redraw(){
    if(typeof requestChartDraw==='function')requestChartDraw();
    else if(typeof drawMarketChart==='function')drawMarketChart();
  }

  function updateControls(){
    if(!zoomControls)return;
    const read=zoomControls.querySelector('.mova-chart-zoom-readout');
    const out=zoomControls.querySelector('[data-zoom="out"]');
    const reset=zoomControls.querySelector('[data-zoom="reset"]');
    if(read)read.textContent=zoomFactor===1?'100%':Math.round(zoomFactor*100)+'%';
    if(out)out.disabled=zoomFactor<=1.001;
    if(reset)reset.disabled=zoomFactor<=1.001;
  }

  function changeZoom(action){
    if(action==='in')zoomFactor=Math.min(8,zoomFactor*1.5);
    if(action==='out')zoomFactor=Math.max(1,zoomFactor/1.5);
    if(action==='reset'){zoomFactor=1;zoomAnchor=1}
    updateControls();redraw();
  }

  function setup(){
    if(zoomControls||!document.getElementById('marketCanvas'))return;
    if(!installZoomRenderer())return;
    const viewControls=document.querySelector('.mova-chart-view-controls');
    const canvas=document.getElementById('marketCanvas');
    zoomControls=document.createElement('div');
    zoomControls.className='mova-chart-zoom-controls';
    zoomControls.innerHTML='<span class="mova-chart-zoom-label">ZOOM</span><button type="button" class="mova-chart-zoom-btn" data-zoom="in">＋ Zoom in</button><button type="button" class="mova-chart-zoom-btn" data-zoom="out">− Zoom out</button><span class="mova-chart-zoom-readout">100%</span><button type="button" class="mova-chart-zoom-btn" data-zoom="reset">Reset</button>';
    if(viewControls)viewControls.insertAdjacentElement('afterend',zoomControls);
    else canvas.parentElement.insertAdjacentElement('beforebegin',zoomControls);
    zoomControls.addEventListener('click',e=>{const b=e.target.closest('[data-zoom]');if(b)changeZoom(b.dataset.zoom)});
    updateControls();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
  setTimeout(setup,400);
  setTimeout(setup,1000);
})();
</script>
`;
if(!html.includes('mova-chart-zoom-controls'))html=html.replace('</body>',runtime+'</body>');

writeFileSync(file,html);
console.log('MOVA chart zoom controls patch complete.');
