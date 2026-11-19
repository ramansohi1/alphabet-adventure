// Display-only repair coaching. It cannot award a letter or change recognition thresholds.
// Only small summary counts are persisted; drawn points and overlays stay in memory.
let pencilAutoTimer=null,pencilAutoRevision=-1,pencilRepair=null,pencilModelHidden=false;
let pencilAutoTopics=new Set();
function showPencilMessage(text){$('coach-bubble').hidden=true;$('coach-message').textContent=text;$('pencil-coach').textContent=text;} 
function setPencilModelHidden(hidden){pencilModelHidden=hidden;document.body.classList.toggle('pencil-model-hidden',hidden);$('watch-guide').setAttribute('visibility',hidden?'hidden':'visible');$('hide-pencil-guide').textContent=hidden?'Show model':'Hide model';}
function cancelPencilAuto(){clearTimeout(pencilAutoTimer);pencilAutoTimer=null;}
function clearPencilRepair(){cancelPencilAuto();pencilRepair=null;$('pencil-repair').replaceChildren();$('pencil-repair-key').hidden=true;}
function resetPencilRepair(){clearPencilRepair();pencilAutoRevision=-1;pencilAutoTopics.clear();}
function repairRuns(points,predicate,minLength=10){
 const runs=[];let run=[];const flush=()=>{if(run.length&&(shapeLength([run])>=minLength||points.length<3))runs.push(run);run=[];};
 points.forEach((p,i)=>{if(predicate(p,i))run.push(p);else flush();});flush();return runs;
}
function pencilRepairAnalysis(ink,template,match,level='gentle'){
 const none={focus:'compare',part:null,missing:[],outside:[],target:[]};
 if(!match?.alignment||!template?.length||match.coverage<.45||match.precision<.55)return none;
 const {scale,ink:ib,target:tb}=match.alignment;
 if(!Number.isFinite(scale)||scale<=0)return none;
 const project=p=>({x:(p.x-tb.x)/scale+ib.x,y:(p.y-tb.y)/scale+ib.y});
 const target=resampleShape(template,5).map(s=>s.map(project)),drawn=resampleShape(cleanPencilInk(ink),5),cloud=drawn.flat(),goal=target.flat();
 const near=(p,other)=>other.reduce((d,q)=>Math.min(d,distance(p,q)),Infinity);
 const tolerance=(level==='focused'?15:25)/scale;
 const missing=target.map((s,part)=>({part,runs:repairRuns(s,p=>near(p,cloud)>tolerance,12/scale)})).filter(x=>x.runs.length&&shapeLength(x.runs)>=Math.max(18/scale,shapeLength([target[x.part]])*.18));
 const outside=drawn.flatMap(s=>repairRuns(s,p=>near(p,goal)>tolerance*1.25,15/scale)).slice(0,3);
 // One actionable part at a time. Dots count as their own part.
 const gap=missing.sort((a,b)=>shapeLength(b.runs)-shapeLength(a.runs))[0];
 return {focus:gap?'missing':outside.length?'shape':'compare',part:gap?gap.part:null,missing:gap?[target[gap.part]]:[],outside,target};
}
function repairPath(points){return points.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ');}
function drawPencilRepair(plan){
 const group=$('pencil-repair');group.replaceChildren();
 for(const run of plan.outside)svg('path',{d:repairPath(run),fill:'none',stroke:'#bd6814','stroke-width':13,'stroke-opacity':.45,'stroke-linecap':'round'},group);
 for(const run of plan.missing){if(shapeLength([run])<8)svg('circle',{cx:run[0].x,cy:run[0].y,r:11,fill:'none',stroke:'#087e99','stroke-width':4,'stroke-dasharray':'3 4'},group);else svg('path',{d:repairPath(run),fill:'none',stroke:'#087e99','stroke-width':6,'stroke-dasharray':'8 8','stroke-linecap':'round'},group);}
 $('pencil-repair-key').hidden=!plan.missing.length&&!plan.outside.length;
 if(plan.missing.length){const points=plan.target[plan.part],ends=shapeLength([points])<8?[points[0]]:[points[0],points.at(-1)];ends.forEach((p,i)=>{svg('circle',{cx:p.x,cy:p.y,r:13,fill:'#087e99',stroke:'#fff','stroke-width':3},group);const label=svg('text',{x:p.x,y:p.y+5,'text-anchor':'middle',fill:'#fff','font-size':16,'font-weight':700},group);label.textContent=i+1;});}
 $('pencil-repair-key').textContent=plan.missing.length?'Blue: try 1 → 2. Amber: compare this part.':'Amber: compare this part. Undo last can help.';
}
function notePencilCoaching(plan){if(!attempt)return;const c=attempt.coaching||(attempt.coaching={checks:0,autoDemos:0,repairs:0});c.checks++;c.focus=plan.focus;c.part=plan.part;}
function coachPencilRepair(){
 if(guideMode!=='pencil'||finished||drawing||!pencilDecision)return;
 const decision=pencilDecision;
 const plan=decision.state==='different'?{focus:'compare',part:null,missing:[],outside:[],target:[]}:pencilRepairAnalysis(pencilStrokes,decision.template,decision.match,saved.difficulty);
 setPencilModelHidden(false);pencilRepair=plan;drawPencilRepair(plan);notePencilCoaching(plan);
 const text=plan.focus==='missing'?'Follow blue from 1 to 2.':plan.focus==='shape'?'Look at the amber part. Let’s compare.':decision.state==='empty'?'Make a line first.':decision.state==='incomplete'?'Keep going. I’ll show you the next part.':'Let’s look together. I’ll show you.';
 showPencilMessage(text);
 if(decision.state==='empty'){say(text);return;}
 if(saved.autoPencil===false){showPencilMessage('Try the highlighted part. Tap Watch for help.');say($('pencil-coach').textContent);return;}
 // A Check press or idle review may request only one replay per unchanged drawing.
 const topic=plan.focus+':'+plan.part;
 if(pencilAutoRevision===pencilRevision||pencilAutoTopics.has(topic)){showPencilMessage(plan.focus==='missing'?'Try blue 1 to 2. Undo last can help.':'Try Undo last, or Watch together.');return;}
 pencilAutoRevision=pencilRevision;const epoch=pencilEpoch,revision=pencilRevision,letter=current,kind=letterCase;
 cancelPencilAuto();pencilAutoTimer=setTimeout(()=>{
  pencilAutoTimer=null;
  if(epoch!==pencilEpoch||revision!==pencilRevision||letter!==current||kind!==letterCase||guideMode!=='pencil'||drawing||finished||demoRunning||document.hidden||document.querySelector?.('dialog[open]'))return;
  pencilAutoTopics.add(topic);
  if(attempt?.coaching)attempt.coaching.autoDemos++;
  if(plan.focus==='missing')showPencilRepairDemo(plan);else showDemo();
 },900);
}
function showPencilRepairDemo(plan){
 if(!plan.target[plan.part]?.length){showDemo();return;}
 pausePencilRecognition();cancelPencilPause();stopDemo();pauseObservation();
 activePointer=null;drawing=false;lastPoint=null;demoRunning=true;$('demo').disabled=true;$('stop-pencil-watch').hidden=false;
 $('pencil-directions').replaceChildren();$('start-marker').setAttribute('visibility','hidden');
 const points=plan.target[plan.part],token=demoToken,dot=$('demo-dot');let time=null,moved=false,spoken=false,ended=false;
 const line=svg('path',{d:repairPath(points),fill:'none',stroke:'#087e99','stroke-width':6,'stroke-linecap':'round','stroke-linejoin':'round'},$('pencil-repair'));
 const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths.at(-1)+distance(points[i-1],points[i]));
 const total=lengths.at(-1),duration=Math.max(1800,total*8);
 line.setAttribute('stroke-dasharray',`${total||1} ${total||1}`);line.setAttribute('stroke-dashoffset',total);
 const finish=()=>{if(!moved||!spoken||ended||token!==demoToken)return;ended=true;stopDemo();showPencilMessage('Your turn! Follow blue 1 to 2.');$('instruction').textContent='Your turn! Add the blue part.';say('Your turn! Add the blue part.');drawPencilRepair(plan);};
 const cue=WATCH_SCRIPTS[current][letterCase][plan.part];
 const text=`Try this part. ${cue} Finish ${pencilLinePosition(points.at(-1))}.`;
 dot.setAttribute('visibility','visible');dot.setAttribute('cx',points[0].x);dot.setAttribute('cy',points[0].y);
 narrateDemo(text,token,()=>{spoken=true;finish();});
 const frame=t=>{if(token!==demoToken)return;if(time===null)time=t;const f=Math.min(1,(t-time)/duration),travel=total*f;let i=1;while(i<lengths.length-1&&lengths[i]<travel)i++;const a=points[Math.max(0,i-1)],b=points[Math.min(i,points.length-1)],span=(lengths[i]||0)-(lengths[i-1]||0),u=span?(travel-lengths[i-1])/span:0;dot.setAttribute('cx',a.x+(b.x-a.x)*u);dot.setAttribute('cy',a.y+(b.y-a.y)*u);line.setAttribute('stroke-dashoffset',total*(1-f));if(f===1){moved=true;finish();}else demoFrame=requestAnimationFrame(frame);};demoFrame=requestAnimationFrame(frame);
}
function undoPencilGesture(){
 if(guideMode!=='pencil'||drawing||finished||!pencilStrokes.length)return;
 stopDemo();pausePencilRecognition();cancelPencilPause();clearPencilCue();clearPencilRepair();clearWatchGuide();
 const from=pencilGestures.length?pencilGestures.pop():pencilStrokes.length-1;pencilStrokes.splice(from);pencilLive=null;pencilPath=null;pencilLocked=false;pencilRevision++;pencilCheckedRevision=-1;pencilDecision=null;pencilMatch=null;pencilTip=0;pencilGuideDone=[];
 for(const el of Array.from($('letter-paths').children))if(el.getAttribute('class')==='pencil-ink')el.remove();
 for(const points of pencilStrokes)svg('path',{d:repairPath(points),class:'pencil-ink'},$('letter-paths'));
 if(attempt){const c=attempt.coaching||(attempt.coaching={checks:0,autoDemos:0,repairs:0});c.repairs++;}
 advancePencilCoaching(false);updatePencilFeedback();say('Try that part again.');if(pencilStrokes.length)schedulePencilPause();
}
function drawPencilParent(rows){
 const host=$('pencil-parent-plan');host.replaceChildren();host.hidden=$('chart-mode').value!=='pencil';if(host.hidden)return;
 const currentRow=attempt?.mode==='pencil'&&attempt.difficulty===$('chart-level').value?attempt:null;
 const recent=[...rows,...(currentRow?[currentRow]:[])].slice(-8),latest=recent.at(-1);
 const title=chartNode('h3','','Help with pencil practice');host.append(title);
 host.append(chartNode('p','','Let the child finish, then tap Check. A pause never starts a demonstration. Start with one small improvement. Screen practice is a bridge to paper, not proof of pencil control.'));
 const focusNames={missing:'Finish a missing part',shape:'Compare a curve or line',compare:'Look at the whole shape together'};
 if(latest){const letter=latest.key.startsWith('lower:')?latest.key.split(':')[1].toLowerCase():latest.key.split(':')[1];const c=latest.coaching;
  host.append(chartNode('h4','',`${currentRow?'On the paper now':'Latest attempt'}: ${letter}`));
  host.append(chartNode('p','',latest.completed?'The app recognized this letter. Next, try one on real paper with the model covered.':c?`${focusNames[c.focus]||'Try one part together'}${Number.isInteger(c.part)?' (part '+(c.part+1)+')':''}. Blue dashes suggest a missing part; amber shows a region to compare. These are suggestions, not certain mistakes.`:'No detailed check yet. Let the child finish, then tap Check.'));
  if(c)host.append(chartNode('p','',`${c.checks||0} checks · ${c.autoDemos||0} automatic demonstrations · ${c.repairs||0} undo actions. Help use is not failure.`));
 }
 const list=chartNode('ol','');for(const tip of ['Watch one part together. Say the same short direction as the app.','Let the child draw that part. Use Undo last if they want to redo it; keep the rest.','On real paper, draw a model once. Let the child copy it, cover it, then try one from memory.','Compare together: “What looks the same? Which little part shall we try again?” Finish with one success and a break.'])list.append(chartNode('li','',tip));host.append(list);
 const next=recent.filter(r=>!r.completed).at(-1)||latest;
 if(next){const button=chartNode('button','secondary','Practice '+(next.key.startsWith('lower:')?next.key.split(':')[1].toLowerCase():next.key.split(':')[1])+' together');button.onclick=()=>{letterCase=next.key.split(':')[0];startTargetPractice(next.key.split(':')[1]);};host.append(button);}
 host.append(chartNode('p','chart-caption','Only summaries are saved on this device. Exact drawings are not stored. A child may write a valid form the app does not recognize.'));
}
function initPencilFeedback(){
 $('undo-pencil').onclick=undoPencilGesture;
 $('stop-pencil-watch').onclick=()=>{stopDemo();markStart();if(pencilRepair)drawPencilRepair(pencilRepair);showPencilMessage('Your turn. Take your time.');};
 $('auto-pencil-choice').checked=saved.autoPencil!==false;$('auto-pencil-choice').onchange=e=>{saved.autoPencil=e.target.checked;cancelPencilAuto();save();};
 $('hide-pencil-guide').onclick=()=>setPencilModelHidden(!pencilModelHidden);
}
