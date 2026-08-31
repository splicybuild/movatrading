import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const runtime=`
<script data-mova-chart-zoom-runtime>
(function(){
  let zoomFactor=1;
  let originalDraw=null;
  let zoomControls=null;

  function visibleSlice(data){
    if(!Array.isArray(data)||data.length<3||zoomFactor<=1)return data;
    const visible=Math.max(12,Math.round(data.length/zoomFactor));
    return data.slice(Math.max(0,data.length-visible));
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
    if(action==='reset')zoomFactor=1;
    updateControls();
    redraw();
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

if(!html.includes('data-mova-chart-zoom-runtime'))html=html.replace('</body>',runtime+'</body>');
writeFileSync(file,html);
console.log('MOVA chart zoom runtime injected.');
