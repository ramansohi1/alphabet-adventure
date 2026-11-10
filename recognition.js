// Competing-letter classifier, deliberately independent of the prompted letter.
// Geometric exemplar recognition, not a learned handwriting model or OCR service.
const RECOGNITION_TEMPLATES=Object.fromEntries(Object.entries(RECOGNITION_POINTS).map(([kind,letters])=>[kind,Object.fromEntries(Object.entries(letters).map(([letter,strokes])=>[letter,[.7,.85,1,1.15,1.35,1.5].map(width=>strokes.map(s=>s.map(([x,y])=>({x:300+(x-300)*width,y}))))]))]));
let recognitionCache={};
function normalizeInk(strokes){
 const sampled=resampleShape(strokes,7),points=sampled.flat();
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
   const penalty=Math.max(0,ratio-1.6)*.2+Math.max(0,.65-ratio)*.3;
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
  const canContinue=(kind==='upper'&&(extensions[wanted]||[]).includes(best.letter))||(match.precision>=.92&&match.coverage<.9);
  if(canContinue)state='incomplete';
  else {state='different';recognized=best.letter;}
 }else if(match.precision>=.85&&match.coverage<.9)state='incomplete';
 return {state,recognized,ranked:ranked.slice(0,3).map(r=>({letter:r.letter,score:Math.round(r.score*100)})),match};
}
