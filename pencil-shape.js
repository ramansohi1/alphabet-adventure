// Local geometric comparison, not OCR: compare actual ink with the requested
// letter after translation and uniform scaling. Never rotate or mirror letters.
// Raw strokes live only until this page is reset; only summary scores are saved.
let pencilPauseTimer=null,pencilRevision=0,pencilCheckedRevision=-1,lastPencilCue=0;
let pencilStrokes=[],pencilLive=null,pencilMatch=null,pencilBest=0;
function resetPencilShape(){cancelPencilPause();pencilRevision=0;pencilCheckedRevision=-1;clearPencilCue();pencilStrokes=[];pencilLive=null;pencilMatch=null;pencilBest=0;}
function beginPencilShape(p){cancelPencilPause();clearPencilCue();pencilLive=[{...p}];}
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
 assessPencilShape(false);if(!finished)schedulePencilPause();
}
function assessPencilShape(showHint=false){
 if(guideMode!=='pencil'||finished||demoRunning||retryPending)return;
 const ink=pencilLive?.length>1?[...pencilStrokes,pencilLive]:pencilStrokes;
 pencilMatch=matchPencilShape(ink,samples,saved.difficulty);
 if(attempt){attempt.shapeMatch=Math.round(pencilMatch.score*100);attempt.shapeCoverage=Math.round(pencilMatch.coverage*100);attempt.shapePrecision=Math.round(pencilMatch.precision*100);attempt.version=3;}
 updatePencilFeedback();
 if(pencilMatch.pass&&!finished){cancelPencilPause();clearPencilCue();stroke=paths.length;completeLetter();}else if(showHint)showPencilCue();
}
function updatePencilFeedback(){
 if(guideMode!=='pencil')return;
 $('steps').replaceChildren();
 const score=pencilMatch?.score||0;
 for(let i=0;i<3;i++){const star=document.createElement('span');star.textContent=score>=(i+1)*.3?'★':'☆';star.className=score>=(i+1)*.3?'complete':'';$('steps').append(star);}
 $('steps').setAttribute('aria-label','Whole-letter shape progress');
 $('instruction').textContent='Draw the whole letter anywhere on the paper.';
 $('hint').textContent='Your own lines, your own way. Lift your finger to check.';
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
 const match=pencilMatch;if(!match)return;
 const hint=alignPencilHint(match);
 const low=hint.parts.length?hint.parts.indexOf(Math.min(...hint.parts)):0;
 const transform=hint.alignment;
 const group=$('pencil-cue');group.replaceChildren();
 if(samples[low]){
  const points=samples[low].map(p=>transform?{x:(p.x-transform.target.x)/transform.scale+transform.ink.x,y:(p.y-transform.target.y)/transform.scale+transform.ink.y}:p);
  svg('path',{d:points.map((p,i)=>(i?'L':'M')+p.x+' '+p.y).join(' '),class:'missing-piece'},group);
 }
 const extra=match.precision<.7&&match.coverage>.7;
 $('coach-bubble').hidden=false;$('coach-face').textContent=extra?'🌱':'🐻';
 $('coach-message').textContent=extra?'Try a fresh page?':'Try this glowing part';
 $('help').classList.toggle('help-needed',true);
 if(Date.now()-lastPencilCue>20000){lastPencilCue=Date.now();say(extra?'Let’s try a fresh page.':'Try this glowing part, Hargun.');}
}

function alignPencilHint(match){
 if(!match.alignment)return match;
 const ink=resampleShape(pencilLive?.length>1?[...pencilStrokes,pencilLive]:pencilStrokes,10).flat();
 const target=resampleShape(samples,10),goal=target.flat(),a=match.alignment;
 const raw=ink.map(p=>({x:(p.x-a.ink.x)*a.scale+a.target.x,y:(p.y-a.ink.y)*a.scale+a.target.y}));
 const nearest=(p,cloud)=>cloud.reduce((n,q)=>Math.min(n,distance(p,q)),Infinity);
 let best=-Infinity,result=match;
 for(const dx of [-.5,-.25,0,.25,.5])for(const dy of [-.5,-.25,0,.25,.5]){
  const shift={x:dx*a.target.width,y:dy*a.target.height};
  const moved=raw.map(p=>({x:p.x+shift.x,y:p.y+shift.y}));
  const precision=moved.filter(p=>nearest(p,goal)<=23).length/Math.max(1,moved.length);
  const parts=target.map(s=>s.filter(p=>nearest(p,moved)<=23).length/s.length);
  const score=precision*.75+parts.reduce((n,v)=>n+v,0)/parts.length*.25-Math.abs(dx)*.005-Math.abs(dy)*.005;
  if(score>best){best=score;result={parts,alignment:{...a,ink:{...a.ink,x:a.ink.x-shift.x/a.scale,y:a.ink.y-shift.y/a.scale}}};}
 }
 return result;
}
