const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const kernel=Function('distance',['pencil-shape.js','recognition-data.js','recognition.js'].map(f=>fs.readFileSync(path.join(root,f),'utf8')).join('\n')+';return {classifyPencil};')((a,b)=>Math.hypot(a.x-b.x,a.y-b.y));
// Artificial polygonal curves with deterministic wobble. No recorded handwriting.
for(const kind of ['upper','lower'])for(const opening of [35,45,55]){
 const ink=[Array.from({length:20},(_,i)=>{const a=(-opening-(360-2*opening)*i/19)*Math.PI/180;return {x:355+125*Math.cos(a)+Math.sin(i*2)*4,y:280+140*Math.sin(a)+Math.cos(i)*5};})];
 assert.equal(kernel.classifyPencil(ink,'C',kind).state,'correct');
 for(const other of ['O','G','S'])assert.notEqual(kernel.classifyPencil(ink,other,kind).state,'correct','C is not '+other);
 assert.notEqual(kernel.classifyPencil([ink[0].slice(0,8)],'C',kind).state,'correct','Short arc is unfinished');
 assert.notEqual(kernel.classifyPencil([ink[0].map(p=>({x:600-p.x,y:p.y}))],'C',kind).state,'correct','Mirrored C is not accepted');
}
console.log('PASS: synthetic open C variants in both cases, shifted outside guides; confusable letters, short arcs and reversed C rejected.');
