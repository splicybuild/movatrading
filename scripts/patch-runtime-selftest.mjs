import { readFileSync } from 'node:fs';

const html=readFileSync('dist/index.html','utf8');

function must(label,condition){
  if(!condition)throw new Error(`MOVA runtime self-test failed: ${label}`);
  console.log('PASS:',label);
}

const start=html.indexOf('<script id="mova-preview-followup-fixes-v3">');
const end=start>=0?html.indexOf('</script>',start):-1;
must('final follow-up v3 runtime exists',start>=0&&end>start);
const openEnd=html.indexOf('>',start);
const js=html.slice(openEnd+1,end);
new Function(js);
console.log('PASS: final follow-up v3 runtime parses as JavaScript');

must('broken v1 runtime removed',!html.includes('id="mova-preview-followup-fixes-v1"'));
must('superseded v2 runtime removed',!html.includes('id="mova-preview-followup-fixes-v2"'));
must('legacy News controller removed',!html.includes('id="mova-news-top10-hardfix-v5"'));
must('legacy Watch List controller removed',!html.includes('id="mova-watchlist-sourcefix-v8"'));
must('Account nav has Watch List between Investments and Alerts',html.includes('data-mna="investments">Investments</button><button class="mna-nav" data-mna="watchlist">Watch List</button><button class="mna-nav" data-mna="alerts">Alerts</button>'));
must('live scan has directional class',html.includes('<small class="\'+cls+\'">'));
must('News Top 10 final handler exists',html.includes('window.movaNewsTop10Search'));
must('News button is directly bound to final handler',html.includes('onclick="return window.movaNewsTop10Search(event)"'));
must('News Enter key is directly bound to final handler',html.includes("window.movaNewsTop10Search(event)"));
must('Watch List final refresh exists',html.includes('window.movaWatchlistRefresh'));
must('Watch List migrates legacy key',html.includes("movaUnifiedWatchlistV1"));
must('Watchlist ticker sync exists',html.includes('function syncTopTicker()'));
