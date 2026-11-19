// Local summary-only coaching. Placement never decides whether a letter passes.
let practicePlan=null;
function pencilPlacement(ink,template){
 const pts=resampleShape(cleanPencilInk(ink),6).flat(),goal=template.flat();
 if(!pts.length||!goal.length)return null;
 const top=Math.min(...goal.map(p=>p.y)),bottom=Math.max(...goal.map(p=>p.y));
 const nearestLine=y=>[['sky',80],['plane',180],['grass',360],['worm',425]].reduce((a,b)=>Math.abs(b[1]-y)<Math.abs(a[1]-y)?b:a);
 const upper=nearestLine(top),lower=nearestLine(bottom),tolerance=12;
 const above=pts.filter(p=>p.y<upper[1]-tolerance).length,below=pts.filter(p=>p.y>lower[1]+tolerance).length;
 return {band:Math.round(100*(pts.length-above-below)/pts.length),above:Math.round(100*above/pts.length),below:Math.round(100*below/pts.length),top:upper[0],bottom:lower[0]};
}
function notePencilCheck(decision,ink,revision){
 if(!attempt)return;
 const checks=attempt.checks||(attempt.checks=[]);if(checks.at(-1)?.revision===revision)return;
 const placement=pencilPlacement(ink,samples),check={number:(attempt.checkCount||0)+1,revision,shape:Math.round(decision.match.score*100),state:decision.state,placement};
 attempt.checkCount=check.number;checks.push(check);attempt.checks=checks.slice(-8);attempt.placement=placement;
 const old=attempt.bestCheck;
 if(!old||(check.state==='correct'&&old.state!=='correct')||(check.state===old.state&&check.shape>old.shape)|| (check.state!=='correct'&&old.state!=='correct'&&check.shape>old.shape))attempt.bestCheck=check;
}
function pencilPracticeCandidates(rows=observations){
 const groups={};for(const r of rows){if(r.mode!=='pencil'||r.version!==4||!r.key.startsWith(letterCase+':')||r.difficulty!==saved.difficulty)continue;(groups[r.key]||(groups[r.key]=[])).push(r);}
 return Object.entries(groups).map(([key,all])=>{const recent=all.slice(-3),n=recent.length;const shape=recent.reduce((sum,r)=>sum+(Number.isFinite(r.shapeMatch)?r.shapeMatch:0),0)/n;const placements=recent.filter(r=>Number.isFinite(r.placement?.band));const band=placements.length?placements.reduce((sum,r)=>sum+r.placement.band,0)/placements.length:100;const unfinished=recent.filter(r=>!r.completed).length/n;return {key,letter:key.split(':')[1],score:(100-shape)/100+unfinished*.7+(100-band)/100,reason:unfinished>.4?'Letter shape':band<95?'Writing lines':'Shape practice',shape:Math.round(shape),band:Math.round(band)};}).sort((a,b)=>b.score-a.score).filter(r=>r.score>.08);
}
function startTargetPractice(letter){
 endAttempt();const candidates=pencilPracticeCandidates();
 const letters=letter?[letter]:candidates.slice(0,3).map(r=>r.letter);if(!letters.length)letters.push(current);
 practicePlan={letters,kind:letterCase,index:0,stage:'trail'};adventure=null;randomMode=false;updateRandomUI();
 current=letters[0];setGuide('trail');$('settings-dialog').close();render();describe();
}
function stopTargetPractice(){practicePlan=null;updatePracticeBanner();}
function updatePracticeBanner(){
 const banner=$('practice-banner');banner.hidden=!practicePlan;if(!practicePlan)return;
 $('practice-status').textContent=`🌱 ${practicePlan.index+1} / ${practicePlan.letters.length} · ${practicePlan.stage==='trail'?'🖍 Crayon first':'✏️ Now your pencil'}`;
}
function syncPracticePlan(){if(practicePlan&&(practicePlan.kind!==letterCase||practicePlan.letters[practicePlan.index]!==current||practicePlan.stage!==guideMode))practicePlan=null;updatePracticeBanner();}
function practiceAfterTrace(){
 if(!practicePlan||practicePlan.stage!=='trail'||practicePlan.letters[practicePlan.index]!==current)return false;
 practicePlan.stage='pencil';setGuide('pencil');render();describe();showPencilMessage('Now draw it with your pencil!');return true;
}
function nextTargetPractice(){
 if(!practicePlan)return false;
 if(practicePlan.stage!=='pencil'||!finished)return false;
 practicePlan.index++;
 if(practicePlan.index>=practicePlan.letters.length){stopTargetPractice();resetPictureGame();$('practice-done').showModal();say('Lovely practice! Try one on paper with a grown-up.');return true;}
 current=practicePlan.letters[practicePlan.index];practicePlan.stage='trail';setGuide('trail');render();describe();return true;
}
function drawAttemptHistory(rows,host){
 const recent=[...rows,...(attempt?.mode==='pencil'&&attempt.difficulty===$('chart-level').value?[attempt]:[])].slice(-6);
 const panel=chartPanel('Pencil tries · shape and writing lines');
 panel.append(chartNode('p','chart-caption','New try starts a separate drawing. Retracing on the same page adds checks to that try. Shape decides completion; writing-line placement is coaching only. Best check means highest shape score, with a recognized letter preferred.'));
 if(!recent.length)panel.append(chartNode('p','','Try a letter, then tap Check. Your recent checks will appear here.'));
 const best=recent.filter(r=>r.bestCheck).sort((a,b)=>Number(b.bestCheck.state==='correct')-Number(a.bestCheck.state==='correct')||b.bestCheck.shape-a.bestCheck.shape)[0];if(best)panel.append(chartNode('p','',`★ Strongest recent try: ${best.key.startsWith('lower:')?best.key.split(':')[1].toLowerCase():best.key.split(':')[1]} · ${best===attempt?'current try':'saved try '+(rows.indexOf(best)+1)} · check ${best.bestCheck.number} · ${best.bestCheck.shape}% shape`));
 recent.forEach((r,i)=>{const letter=r.key.startsWith('lower:')?r.key.split(':')[1].toLowerCase():r.key.split(':')[1],box=chartNode('section','attempt-card');
 box.append(chartNode('h4','',`${letter} · ${r===attempt?'Current try':'Saved try '+(rows.indexOf(r)+1)} · ${r.completed?'Recognized':'Practicing'}`));
 if(r.date)box.append(chartNode('p','chart-caption',new Date(r.date).toLocaleString()));
 if(r.bestCheck)box.append(chartNode('p','',`★ Best: check ${r.bestCheck.number} · ${r.bestCheck.shape}% shape similarity`));
 const checks=(r.checks||[]).slice(-8);
 if(checks.length){const table=chartNode('table','attempt-table'),thead=chartNode('thead',''),tr=chartNode('tr','');for(const title of ['Check','Shape','Within lines','Result'])tr.append(chartNode('th','',title));thead.append(tr);table.append(thead);const body=chartNode('tbody','');for(const c of checks){const row=chartNode('tr','');for(const value of [String(c.number)+(r.bestCheck?.number===c.number?' ★':''),c.shape+'%',c.placement?c.placement.band+'%':'—',c.state==='correct'?'Recognized':c.state==='different'?'Other letter':'Keep practicing'])row.append(chartNode('td','',value));body.append(row);}table.append(body);box.append(table);}
 else box.append(chartNode('p','chart-caption',Number.isFinite(r.shapeMatch)?`Shape: ${r.shapeMatch}%. Detailed checks are available for new tries.`:'No check yet.'));
 if(r.placement){const p=r.placement;box.append(chartNode('p','chart-caption',`${p.above}% above the ${p.top} line · ${p.below}% below the ${p.bottom} line. Small slips have a little allowance.`));}
 panel.append(box);
 });
 const needs=pencilPracticeCandidates();panel.append(chartNode('h4','','Next practice'));
 for(const item of needs.slice(0,3)){panel.append(chartNode('p','',`${letterCase==='lower'?item.letter.toLowerCase():item.letter}: ${item.reason} · ${item.shape}% shape · ${item.band}% within lines`));}
 panel.append(chartNode('p','chart-caption','A short round: trace each selected letter with crayon, then write the same letter with pencil. Finish with one on real paper. Scores are practice estimates, not a developmental assessment.'));
 host.append(panel);
}
function initPracticePlan(){
 $('target-practice').onclick=()=>{unlockAudio();startTargetPractice();};$('review-practice').onclick=()=>{unlockAudio();startTargetPractice();};
 $('exit-practice').onclick=stopTargetPractice;
 $('practice-done-close').onclick=()=>{$('practice-done').close();render();describe();};
}
