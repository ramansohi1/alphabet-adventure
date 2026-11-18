// Artificial wobbles applied to the existing public letter template.
// Contains no coordinates or measurements from a user recording.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const code=['pencil-shape.js','recognition-data.js','recognition.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n');
const {classifyPencil,rankLetters,resampleShape,RECOGNITION_TEMPLATES}=Function('distance',code+';return {classifyPencil,rankLetters,resampleShape,RECOGNITION_TEMPLATES};')((a,b)=>Math.hypot(a.x-b.x,a.y-b.y));
const ink=resampleShape(RECOGNITION_TEMPLATES.upper.A[2],5).map((stroke,j)=>stroke.map((p,i)=>({x:p.x+Math.sin(i*.35+j)*12,y:p.y+Math.cos(i*.25+j)*6})));
const rank=rankLetters(ink,'upper');assert.equal(rank[0].letter,'A');assert.ok(rank[0].score<.86,'Reproduces the old ranking-cutoff failure');
const result=classifyPencil(ink,'A','upper');assert.equal(result.state,'correct');assert.ok(result.match.pass);
for(const wanted of 'BCDEFGHIJKLMNOPQRSTUVWXYZ'){
 const r=classifyPencil(ink,wanted,'upper');assert.notEqual(r.state,'correct','Cannot reward A for '+wanted);assert.equal(r.recognized,'A','Recognition is independent of prompt');
}
for(const missing of [0,1,2])assert.notEqual(classifyPencil(ink.filter((_,i)=>i!==missing),'A','upper').state,'correct','Missing part '+missing+' is not accepted');
assert.notEqual(classifyPencil(ink,'A','upper','focused').state,'correct','Focused thresholds remain stricter');
for(const scale of [.65,1,1.3]){
 const moved=ink.map(s=>s.map(p=>({x:p.x*scale+35,y:p.y*scale-20})));
 assert.equal(classifyPencil(moved,'A','upper').state,'correct','Same A at size '+scale);
}
assert.equal(classifyPencil([...ink,ink[1]],'A','upper').state,'correct','Retracing does not erase success');
console.log('PASS: artificial wobbly A, all 25 competing prompts, each missing part, stricter Focused mode, translation/scaling and retracing.');
