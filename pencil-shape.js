// Local geometric comparison, not OCR: compare actual ink with the requested
// letter after translation and uniform scaling. Never rotate or mirror letters.
// Raw strokes live only until this page is reset; only summary scores are saved.
let pencilPauseTimer=null,pencilRevision=0,pencilCheckedRevision=-1,lastPencilCue=0;
let pencilDecision=null,pencilLocked=false,pencilGestures=[],pencilGestureStart=0;
let pencilStrokes=[],pencilLive=null,pencilMatch=null,pencilBest=0;
function resetPencilShape(){pencilDecision=null;pencilLocked=false;pencilGestures=[];cancelPencilPause();pencilRevision=0;pencilCheckedRevision=-1;clearPencilCue();pencilStrokes=[];pencilLive=null;pencilMatch=null;pencilBest=0;}
function beginPencilShape(p){pencilGestureStart=pencilStrokes.length;cancelPencilPause();clearPencilCue();pencilLive=[{...p}];}
function recordPencilShape(p){
 if(!pencilLive)return;
 const previous=pencilLive.at(-1),d=distance(previous,p);
 if(d<1)return;if(!$('coach-bubble').hidden)clearPencilCue();pencilRevision++;schedulePencilPause();
 // Missing input frames must not turn a jump into an invented line.
 if(d>100){if(pencilLive.length>1)pencilStrokes.push(pencilLive);pencilLive=[{...p}];pencilPath=null;return;}
 const n=Math.ceil(d/4);
 for(let i=1;i<=n;i++)pencilLive.push({x:previous.x+(p.x-previous.x)*i/n,y:previous.y+(p.y-previous.y)*i/n});
}
function shapeBounds(points){
 let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;
 for(const p of points){left=Math.min(left,p.x);right=Math.max(right,p.x);top=Math.min(top,p.y);bottom=Math.max(bottom,p.y);}
 return {x:(left+right)/2,y:(top+bottom)/2,width:right-left,height:bottom-top,size:Math.max(right-left,bottom-top)};
}
function shapeLength(strokes){return strokes.reduce((sum,points)=>sum+points.slice(1).reduce((n,p,i)=>n+distance(p,points[i]),0),0);}
function resampleShape(strokes,spacing=5){
 return strokes.filter(s=>s.length>1).map(points=>{
  const out=[points[0]];let carry=0;
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],d=distance(a,b);if(!d)continue;
   for(let step=spacing-carry;step<=d;step+=spacing)out.push({x:a.x+(b.x-a.x)*step/d,y:a.y+(b.y-a.y)*step/d});
   carry=(carry+d)%spacing;
  }
  if(distance(out.at(-1),points.at(-1))>.5)out.push(points.at(-1));
  return out;
 });
}
function matchPencilShape(drawn,template,level='gentle'){
 const empty={pass:false,coverage:0,precision:0,score:0,parts:[],deviation:0};
 const ink=resampleShape(drawn),target=resampleShape(template);
 const raw=ink.flat(),goal=target.flat();
 if(raw.length<3||!goal.length)return empty;
 const ib=shapeBounds(raw),tb=shapeBounds(goal),travel=shapeLength(drawn),expected=shapeLength(template);
 if(ib.size<Math.max(24,tb.size*.22)||ib.size>tb.size*2.8||travel<20)return empty;
 const scale=tb.size/ib.size;
 const normalized=ink.map(s=>s.map(p=>({x:(p.x-ib.x)*scale+tb.x,y:(p.y-ib.y)*scale+tb.y}))).flat();
 const margin=level==='focused'?13:23;
 const nearest=(p,cloud)=>{let best=Infinity;for(const q of cloud)best=Math.min(best,distance(p,q));return best;};
 const parts=target.map(s=>s.filter(p=>nearest(p,normalized)<=margin).length/s.length);
 const coverage=goal.filter(p=>nearest(p,normalized)<=margin).length/goal.length;
 const distances=normalized.map(p=>nearest(p,goal));
 const precision=distances.filter(d=>d<=margin).length/distances.length;
 const ratio=travel*scale/expected;
 const score=Math.max(0,Math.min(coverage,precision));
 // Per-part coverage matters: an i without its dot or a Q without its tail fails.
 const dotsPresent=target.filter(s=>shapeLength([s])<8).every(dot=>ink.some(s=>shapeLength([s])*scale<35&&s.some(p=>distance({x:(p.x-ib.x)*scale+tb.x,y:(p.y-ib.y)*scale+tb.y},dot[0])<=15)));
 const required=level==='focused'?.93:.90;const pass=dotsPresent&&coverage>=required&&precision>=required&&parts.every(p=>p>=(level==='focused'?.88:.84))&&ratio>=.72&&ratio<=1.65;
 return {pass,coverage,precision,score,parts,alignment:{scale,ink:ib,target:tb},deviation:distances.reduce((a,b)=>a+b,0)/distances.length};
}
function finishPencilShape(type){
 if(pencilLive?.length>1)pencilStrokes.push(pencilLive);
 pencilLive=null;
 if(type==='pointercancel'||type==='lostpointercapture'){cancelPencilPause();return;}
 if(pencilStrokes.length>pencilGestureStart)pencilGestures.push(pencilGestureStart);
 if(!finished)schedulePencilPause();updatePencilFeedback();
}
function assessPencilShape(showHint=false){
 if(guideMode!=='pencil'||finished||demoRunning||retryPending)return;
 const ink=pencilLive?.length>1?[...pencilStrokes,pencilLive]:pencilStrokes;
 pencilDecision=classifyPencil(ink,current,letterCase,saved.difficulty);
 pencilMatch=pencilDecision.match;
 if(attempt){attempt.shapeMatch=Math.round(pencilMatch.score*100);attempt.shapeCoverage=Math.round(pencilMatch.coverage*100);attempt.shapePrecision=Math.round(pencilMatch.precision*100);attempt.version=4;attempt.recognition=pencilDecision.state;attempt.recognized=pencilDecision.recognized;}
 updatePencilFeedback();
 if(pencilDecision.state==='correct'&&!finished){cancelPencilPause();clearPencilCue();stroke=paths.length;completeLetter();}else if(showHint){if(pencilDecision.state==='different')pencilLocked=true;updatePencilFeedback();showPencilCue();}
}
function updatePencilFeedback(){
 $('undo-pencil').hidden=guideMode!=='pencil';$('help').setAttribute('aria-label',guideMode==='pencil'?'Help: check my drawing':'Help: show the part to try');
 if(guideMode!=='pencil')return;
 $('steps').replaceChildren();
 const status=document.createElement('span');status.textContent=finished?'★':pencilLocked?'↶':'✏️';$('steps').append(status);
 $('steps').setAttribute('aria-label',finished?'Letter complete':pencilLocked?'Undo or start a new page':'Draw, then pause to check');
 $('undo-pencil').hidden=guideMode!=='pencil';$('undo-pencil').disabled=finished||(!pencilStrokes.length&&!pencilLive?.length);

 $('instruction').textContent='Draw the whole letter anywhere on the paper.';
 $('hint').textContent='Your own lines, your own way. Pause to check.';
 $('stroke-label').textContent='Match the letter’s shape';
 $('board').setAttribute('aria-label','Draw '+(letterCase==='upper'?current:current.toLowerCase())+' anywhere on the paper. Stroke order is up to you.');
}

// One idle assessment per revision of real ink, even with a finger held still.
function cancelPencilPause(){clearTimeout(pencilPauseTimer);pencilPauseTimer=null;}
function schedulePencilPause(){
 cancelPencilPause();
 if(!pencilRevision||pencilCheckedRevision===pencilRevision||finished||demoRunning||retryPending)return;
 const revision=pencilRevision;
 pencilPauseTimer=setTimeout(()=>{
  pencilPauseTimer=null;
  if(revision!==pencilRevision||finished||demoRunning||retryPending)return;
  pencilCheckedRevision=revision;assessPencilShape(true);
 },3000);
}
function clearPencilCue(){$('pencil-cue').replaceChildren();$('coach-bubble').hidden=true;}

function showPencilCue(){
 const decision=pencilDecision;
 $('pencil-cue').replaceChildren();
 $('coach-bubble').hidden=false;
 $('coach-face').textContent=decision?.state==='different'?(letterCase==='lower'?decision.recognized.toLowerCase():decision.recognized):'🐻';
 let text=decision?.state==='different'?'Let’s make '+(letterCase==='lower'?current.toLowerCase():current):decision?.state==='incomplete'?'Keep drawing when you’re ready':'Watch, undo, or try again';
 $('coach-message').textContent=text;
 $('help').classList.toggle('help-needed',decision?.state==='uncertain');
 if(Date.now()-lastPencilCue>20000){
  lastPencilCue=Date.now();
  say(decision?.state==='different'? 'That looks like '+spokenLetter(decision.recognized)+'. We’re making '+spokenLetter(current)+'. Undo the last line, or try a new page.':decision?.state==='incomplete'?'Keep drawing when you’re ready, Hargun.':'I’m not sure yet. You can watch, undo, or try a new page.');
 }
}
function undoPencil(){
 if(guideMode!=='pencil'||finished)return;
 cancelPencilPause();cancelVoices();pauseObservation();
 if(pencilLive){pencilLive=null;pencilStrokes.length=pencilGestureStart;}
 else if(pencilGestures.length)pencilStrokes.length=pencilGestures.pop();
 else pencilStrokes.pop();
 activePointer=null;drawing=false;lastPoint=null;pencilPath=null;pencilTry=null;pencilLocked=false;
 pencilMisses=0;pencilDistance=shapeLength(pencilStrokes);pencilRevision++;pencilDecision=null;pencilMatch=null;clearPencilCue();
 // Repaint the actual remaining ink; no synthetic completion paths.
 for(const el of Array.from($('letter-paths').children))if(el.getAttribute('class')==='pencil-ink')el.remove();
 for(const points of pencilStrokes){pencilPath=null;for(const p of points)pencilPoint(p);}pencilPath=null;
 document.body.classList.toggle('is-tracing',false);$('touch-feedback').setAttribute('visibility','hidden');
 updatePencilFeedback();if(pencilStrokes.length)schedulePencilPause();
}
