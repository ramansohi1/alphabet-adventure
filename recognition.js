// Competing-letter classifier, deliberately independent of the prompted letter.
// Geometric exemplar recognition, not a learned handwriting model or OCR service.
const RECOGNITION_TEMPLATES=Object.fromEntries(Object.entries(RECOGNITION_POINTS).map(([kind,letters])=>[kind,Object.fromEntries(Object.entries(letters).map(([letter,strokes])=>[letter,[.7,.85,1,1.15,1.35,1.5].map(width=>strokes.map(s=>s.map(([x,y])=>({x:300+(x-300)*width,y}))))]))]));
// Modest natural tilt and alternate A crossbar heights, for every competing letter.
for(const [kind,letters] of Object.entries(RECOGNITION_TEMPLATES))for(const [letter,variants] of Object.entries(letters)){
 if(kind==='upper'&&letter==='A')for(const template of [...variants])for(const y of [180,210]){
  const bar=template[2],oldY=bar[0].y,factor=(y-80)/(oldY-80);
  variants.push(template.map((s,i)=>i===2?s.map(p=>({x:300+(p.x-300)*factor,y})):s));
 }
 const originals=[...variants];for(const deg of [-12,-6,6,12])for(const template of originals){
  const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  variants.push(template.map(stroke=>stroke.map(p=>({x:300+(p.x-300)*c-(p.y-220)*s,y:220+(p.x-300)*s+(p.y-220)*c}))));
 }
}
let recognitionCache={};
function normalizeInk(strokes){
 strokes=cleanPencilInk(strokes);
 const sampled=resampleShape(strokes,7),points=[];
 // Repeated pencil marks describe the same shape, not extra letter parts.
 for(const p of sampled.flat())if(!points.some(q=>distance(p,q)<3))points.push(p);
 if(points.length<3)return null;
 const box=shapeBounds(points),length=shapeLength(strokes);
 if(box.size<24||length<20)return null;
 return {points:points.map(p=>({x:(p.x-box.x)/box.size,y:(p.y-box.y)/box.size})),length:length/box.size};
}
function directedInkDistance(a,b){
 let sum=0,far=0;
 for(const p of a){let best=Infinity;for(const q of b){const dx=p.x-q.x,dy=p.y-q.y;best=Math.min(best,dx*dx+dy*dy);}
  const d=Math.sqrt(best);sum+=Math.min(.3,d);if(d>.085)far++;}
 return {mean:sum/a.length,far:far/a.length};
}
function rankLetters(strokes,kind){
 const drawn=normalizeInk(strokes);if(!drawn)return [];
 if(!recognitionCache[kind])recognitionCache[kind]=Object.entries(RECOGNITION_TEMPLATES[kind]).map(([letter,variants])=>({letter,variants:variants.map(s=>({strokes:s,ink:normalizeInk(s)}))}));
 return recognitionCache[kind].map(({letter,variants})=>{
  let result={letter,score:-Infinity};
  for(const variant of variants){
   const forward=directedInkDistance(drawn.points,variant.ink.points),back=directedInkDistance(variant.ink.points,drawn.points);
   const ratio=drawn.length/variant.ink.length;
   const penalty=Math.max(0,.65-ratio)*.3;
   const score=Math.max(0,1-(forward.mean+back.mean)*3-(forward.far+back.far)*.15-penalty);
   if(score>result.score)result={letter,score,template:variant.strokes};
  }
  return result;
 }).sort((a,b)=>b.score-a.score);
}
function classifyPencil(strokes,wanted,kind,level='gentle'){
 const ranked=rankLetters(strokes,kind);
 if(!ranked.length)return {state:'empty',recognized:null,ranked:[],match:matchPencilShape(strokes,RECOGNITION_TEMPLATES[kind][wanted][2],level)};
 const best=ranked[0],gap=best.score-ranked[1].score;
 const target=ranked.find(r=>r.letter===wanted);
 const match=matchPencilShape(strokes,target.template,level);
 const bestMatch=matchPencilShape(strokes,best.template,level);
 const certain=best.score>=.86&&gap>=.035&&bestMatch.pass;
 let state='uncertain',recognized=null;
 if(certain&&best.letter===wanted&&match.pass){state='correct';recognized=wanted;}
 else if(certain&&best.letter!==wanted){
  // A valid smaller letter can still be the beginning of the requested one.
  const extensions={E:['F','L'],F:['L'],R:['P'],Q:['O'],G:['C'],B:['P'],H:['I'],M:['N']};
  const lowerExtensions={B:['L','I'],H:['L','I','N'],D:['L','I','A'],P:['L','I'],Q:['A','L','I'],M:['N'],N:['I','L'],I:['L'],J:['I','L']};
  const canContinue=(kind==='lower'&&(lowerExtensions[wanted]||[]).includes(best.letter))||(kind==='upper'&&(extensions[wanted]||[]).includes(best.letter))||(match.precision>=.92&&match.coverage<.9);
  if(canContinue)state='incomplete';
  else {state='different';recognized=best.letter;}
 }else if(match.precision>=.85&&match.coverage<.9)state='incomplete';
 return {state,recognized,ranked:ranked.slice(0,3).map(r=>({letter:r.letter,score:Math.round(r.score*100)})),match};
}
