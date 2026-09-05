import { readFileSync, writeFileSync } from 'node:fs';
const file='dist/index.html';
let html=readFileSync(file,'utf8');
const css=`<style id="mova-company-logo-align-v194">
@media(min-width:741px){
  .cr-company-heading-row{display:grid!important;grid-template-columns:72px minmax(0,1fr)!important;grid-template-rows:auto auto!important;column-gap:16px!important;row-gap:0!important;align-items:start!important}
  .cr-company-heading-text{display:contents!important}
  .cr-company-heading-row .eyebrow{grid-column:2!important;grid-row:1!important}
  .cr-company-heading-row h1{grid-column:2!important;grid-row:2!important;margin-top:0!important}
  .cr-company-logo{grid-column:1!important;grid-row:2!important;align-self:start!important;margin:0!important;width:72px!important;height:72px!important}
}
</style>`;
html=html.replace('</head>',css+'</head>');
writeFileSync(file,html);
console.log('MOVA company logo desktop alignment v194 complete.');
