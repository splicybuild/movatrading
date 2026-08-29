import { readFileSync, writeFileSync } from 'node:fs';

const path = 'dist/index.html';
let html = readFileSync(path, 'utf8');

const marker = 'MOVA APPROVED WORDMARK FINAL v180';
if (html.includes(marker)) {
  console.log('Final approved MOVA wordmark patch already applied.');
  process.exit(0);
}

const patch = String.raw`
<style id="mova-approved-wordmark-final-v180">
/* Approved preview sizing: full wordmark, natural aspect ratio, no clipping. */
.brand{overflow:visible!important}
.brand-wordmark{
  display:block!important;
  width:420px!important;
  height:auto!important;
  max-width:82vw!important;
  max-height:none!important;
  object-fit:contain!important;
  object-position:center center!important;
  margin:0 auto!important;
}
@media(max-width:800px){
  body:not(.mova-mobile-welcome) .brand-wordmark{
    display:block!important;
    width:250px!important;
    height:auto!important;
    max-width:78vw!important;
    max-height:none!important;
    object-fit:contain!important;
    object-position:center center!important;
    margin:0 auto!important;
  }
}
</style>
<script id="mova-approved-wordmark-final-v180-js">
(function(){
  if(window.__movaApprovedWordmark180)return;
  window.__movaApprovedWordmark180=true;

  function trimWordmark(img){
    if(!img || img.dataset.movaTrimmed==='1')return;
    img.dataset.movaTrimmed='1';

    function run(){
      try{
        var w=img.naturalWidth,h=img.naturalHeight;
        if(!w||!h)return;
        var c=document.createElement('canvas');
        c.width=w;c.height=h;
        var x=c.getContext('2d',{willReadFrequently:true});
        x.drawImage(img,0,0);
        var d=x.getImageData(0,0,w,h).data;
        var minX=w,minY=h,maxX=-1,maxY=-1;

        for(var py=0;py<h;py++){
          for(var px=0;px<w;px++){
            var i=(py*w+px)*4;
            var r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
            var mx=Math.max(r,g,b),mn=Math.min(r,g,b),chroma=mx-mn;
            if(a>18 && (mx>38 || chroma>18)){
              if(px<minX)minX=px;if(px>maxX)maxX=px;
              if(py<minY)minY=py;if(py>maxY)maxY=py;
            }
          }
        }
        if(maxX<minX||maxY<minY)return;

        var pad=Math.max(8,Math.round(Math.min(w,h)*0.012));
        minX=Math.max(0,minX-pad);minY=Math.max(0,minY-pad);
        maxX=Math.min(w-1,maxX+pad);maxY=Math.min(h-1,maxY+pad);
        var tw=maxX-minX+1,th=maxY-minY+1;
        var out=document.createElement('canvas');
        out.width=tw;out.height=th;
        out.getContext('2d').drawImage(c,minX,minY,tw,th,0,0,tw,th);
        img.src=out.toDataURL('image/png');
      }catch(_){
        /* If canvas trimming is unavailable, retain the original image rather than crop it. */
      }
    }

    if(img.complete && img.naturalWidth)run();
    else img.addEventListener('load',run,{once:true});
  }

  function init(){
    document.querySelectorAll('.brand-wordmark').forEach(trimWordmark);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
</script>
<!-- MOVA APPROVED WORDMARK FINAL v180 -->
`;

html += patch;
writeFileSync(path, html, 'utf8');
console.log('Applied approved MOVA wordmark sizing to desktop and logged-in mobile.');
