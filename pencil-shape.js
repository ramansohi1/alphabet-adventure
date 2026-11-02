// Local geometric comparison, not OCR: compare actual ink with the requested
// letter after translation and uniform scaling. Never rotate or mirror letters.
// Raw strokes live only until this page is reset; only summary scores are saved.
let pencilStrokes=[],pencilLive=null,pencilMatch=null,pencilBest=0;
function resetPencilShape(){pencilStrokes=[];pencilLive=null;pencilMatch=null;pencilBest=0;}
function beginPencilShape(p){pencilLive=[{...p}];}
function recordPencilShape(p){
 if(!pencilLive)return;
 const previous=pencilLive.at(-1),d=distance(previous,p);
 if(d<1)return;
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
 const margin=level==='focused'?13:19;
 const nearest=(p,cloud)=>{let best=Infinity;for(const q of cloud)best=Math.min(best,distance(p,q));return best;};
 const parts=target.map(s=>s.filter(p=>nearest(p,normalized)<=margin).length/s.length);
 const coverage=goal.filter(p=>nearest(p,normalized)<=margin).length/goal.length;
 const distances=normalized.map(p=>nearest(p,goal));
 const precision=distances.filter(d=>d<=margin).length/distances.length;
 const ratio=travel*scale/expected;
 const score=Math.max(0,Math.min(coverage,precision));
 // Per-part coverage matters: an i without its dot or a Q without its tail fails.
 const pass=coverage>=.93&&precision>=.93&&parts.every(p=>p>=.88)&&ratio>=.72&&ratio<=1.65;
 return {pass,coverage,precision,score,parts,deviation:distances.reduce((a,b)=>a+b,0)/distances.length};
}
function finishPencilShape(type){
 if(pencilLive?.length>1)pencilStrokes.push(pencilLive);
 pencilLive=null;
 if(type==='pointercancel'||type==='lostpointercapture')return;
 pencilMatch=matchPencilShape(pencilStrokes,samples,saved.difficulty);
 if(attempt){attempt.shapeMatch=Math.round(pencilMatch.score*100);attempt.shapeCoverage=Math.round(pencilMatch.coverage*100);attempt.shapePrecision=Math.round(pencilMatch.precision*100);attempt.version=3;}
 updatePencilFeedback();
 if(pencilMatch.pass&&!finished){stroke=paths.length;completeLetter();}
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
