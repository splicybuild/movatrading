import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

const css=`
/* MOVA responsive portrait chart view for vertical desktop monitors */
@media (min-width:741px){
  .mova-chart-focus.mova-chart-portrait{
    left:10px!important;
    right:10px!important;
    top:10px!important;
    bottom:10px!important;
    transform:none!important;
    width:auto!important;
    max-width:none!important;
    height:calc(100vh - 20px)!important;
    box-sizing:border-box!important;
  }
  .mova-chart-focus.mova-chart-portrait #marketCanvas{
    width:100%!important;
    max-width:none!important;
    height:clamp(520px,58vh,920px)!important;
  }
}
@media (min-width:741px) and (orientation:portrait){
  .mova-chart-focus.mova-chart-portrait{
    padding:16px!important;
  }
  .mova-chart-focus.mova-chart-portrait #marketCanvas{
    height:clamp(560px,60vh,980px)!important;
  }
}
`;

if(!html.includes('/* MOVA responsive portrait chart view for vertical desktop monitors */')){
  html=html.replace('</style>',css+'</style>');
}

writeFileSync(file,html);
console.log('MOVA responsive desktop portrait chart patch complete.');
