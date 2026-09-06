import { readFileSync, writeFileSync } from 'node:fs';

const file='dist/index.html';
let html=readFileSync(file,'utf8');

if(!html.includes('company-research-hero')) throw new Error('Company light contrast v3: company hero hook missing');
if(!html.includes('id="crFacts"')) throw new Error('Company light contrast v3: company facts hook missing');
if(!html.includes('id="crBusinessMix"')) throw new Error('Company light contrast v3: business mix hook missing');

const css=`<style id="mova-company-light-contrast-v3">
/* Company Research only: keep its intentionally dark panels dark in Light theme,
   but restore strong white/off-white text contrast. */
body.mova-light-theme .company-research-hero,
body.mova-light-theme .cr-visual-hero{
  color:#f7fbff!important;
}

/* Hero company identity */
body.mova-light-theme .company-research-hero #crName,
body.mova-light-theme .company-research-hero .cr-company-heading-row h1,
body.mova-light-theme .cr-visual-hero #crName{
  color:#f7fbff!important;
}
body.mova-light-theme .company-research-hero #crIntro,
body.mova-light-theme .cr-visual-hero #crIntro{
  color:#d9e6ef!important;
}
body.mova-light-theme .company-research-hero #crEyebrow,
body.mova-light-theme .cr-visual-hero #crEyebrow{
  color:#afc4d3!important;
}

/* Hero price/value area: brighten neutral values but leave up/down semantic colours alone. */
body.mova-light-theme .company-research-hero #crPrice,
body.mova-light-theme .company-research-hero strong:not(.up):not(.down),
body.mova-light-theme .company-research-hero b:not(.up):not(.down),
body.mova-light-theme .cr-visual-hero #crPrice,
body.mova-light-theme .cr-visual-hero strong:not(.up):not(.down),
body.mova-light-theme .cr-visual-hero b:not(.up):not(.down){
  color:#f7fbff!important;
}
body.mova-light-theme .company-research-hero small:not(.up):not(.down),
body.mova-light-theme .company-research-hero span:not(.up):not(.down):not(.eyebrow),
body.mova-light-theme .cr-visual-hero small:not(.up):not(.down),
body.mova-light-theme .cr-visual-hero span:not(.up):not(.down):not(.eyebrow){
  color:#d9e6ef!important;
}

/* Dark fact/metric cards used by Company Overview and Company History. */
body.mova-light-theme #crFacts .cr-fact,
body.mova-light-theme #crHistoryStats .cr-fact,
body.mova-light-theme #crOriginFacts .cr-fact,
body.mova-light-theme #crBusinessMix .cr-fact{
  color:#f7fbff!important;
}
body.mova-light-theme #crFacts .cr-fact b,
body.mova-light-theme #crHistoryStats .cr-fact b,
body.mova-light-theme #crOriginFacts .cr-fact b,
body.mova-light-theme #crBusinessMix .cr-fact b{
  color:#f7fbff!important;
}
body.mova-light-theme #crFacts .cr-fact span,
body.mova-light-theme #crHistoryStats .cr-fact span,
body.mova-light-theme #crOriginFacts .cr-fact span,
body.mova-light-theme #crBusinessMix .cr-fact span{
  color:#afc4d3!important;
}

/* Overview copy sits on white cards in Light theme, so it needs dark text. */
body.mova-light-theme #crWho,
body.mova-light-theme #crWhat{
  color:#43515d!important;
  opacity:1!important;
}

/* Company History remains in the intentionally dark treatment. */
body.mova-light-theme #crHistorySummary{
  color:#d9e6ef!important;
}
body.mova-light-theme #crMilestones .timeline-item p{
  color:#d9e6ef!important;
}
body.mova-light-theme #crMilestones .timeline-item p b{
  color:#f7fbff!important;
}
body.mova-light-theme #crMilestones .timeline-item time,
body.mova-light-theme #crMilestones .timeline-loading{
  color:#afc4d3!important;
}

/* Re-assert market direction colours after the company-specific white overrides. */
body.mova-light-theme .company-research-hero .up,
body.mova-light-theme .cr-visual-hero .up,
body.mova-light-theme #crMove.up{color:#57e389!important}
body.mova-light-theme .company-research-hero .down,
body.mova-light-theme .cr-visual-hero .down,
body.mova-light-theme #crMove.down{color:#ff6b81!important}
</style>`;

html=html.replace('</head>',css+'</head>');
writeFileSync(file,html);
console.log('MOVA company light-theme contrast v3 applied: readable dark overview copy plus bright text on dark Company Research panels.');
