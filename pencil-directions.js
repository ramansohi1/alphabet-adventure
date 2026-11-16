// Optional coaching is presentation only: it never contributes to recognition.
let pencilTip=0,pencilShownTip=0,pencilGuideDone=[];
function pencilDirectionInfo(index=pencilTip){
 const path=paths[index];if(!path)return null;
 const length=path.getTotalLength(),start=path.getPointAtLength(0),end=path.getPointAtLength(length);
 return {start,end,length,loop:length>40&&distance(start,end)<24,around:path.getPointAtLength(length/2)};
}
function pencilDirectionText(index=pencilTip){
 const info=pencilDirectionInfo(index);if(!info)return '';
 const cue=WATCH_SCRIPTS[current][letterCase][index];
 if(info.length<8)return 'Tap a dot at 1.';
 if(info.loop)return 'Start at 1. Go around 2 and back to 1.';
 return `Start at 1. ${cue} Finish at 2.`;
}
function demoInstruction(index){return guideMode==='pencil'&&saved.pencilDirections!==false?pencilDirectionText(index):WATCH_SCRIPTS[current][letterCase][index];}
function drawPencilDirections(index=pencilShownTip){
 pencilShownTip=index;
 const group=$('pencil-directions');group.replaceChildren();
 if(guideMode!=='pencil'||saved.pencilDirections===false||finished)return;
 const info=pencilDirectionInfo(index);if(!info)return;
 const markers=info.length<8?[info.start]:[info.start,info.loop?info.around:info.end];
 markers.forEach((p,i)=>{
  svg('circle',{cx:p.x,cy:p.y,r:15,fill:i?'#f3c863':'#8051b2',stroke:'#fff','stroke-width':3},group);
  const t=svg('text',{x:p.x,y:p.y+6,'text-anchor':'middle',fill:i?'#3d294e':'#fff','font-size':19,'font-weight':700},group);t.textContent=i+1;
 });
 if(info.length>40){const a=paths[index].getPointAtLength(info.length*.35),b=paths[index].getPointAtLength(info.length*.35+6),angle=Math.atan2(b.y-a.y,b.x-a.x);
  svg('path',{d:`M${a.x-12*Math.cos(angle-.65)} ${a.y-12*Math.sin(angle-.65)} L${a.x} ${a.y} L${a.x-12*Math.cos(angle+.65)} ${a.y-12*Math.sin(angle+.65)}`,fill:'none',stroke:'#8051b2','stroke-width':4,'stroke-linecap':'round'},group);
 }
}
function pencilTipHelp(){
 if(!paths.length)return;
 advancePencilCoaching(false);
 drawPencilDirections(pencilTip);
 showPencilTip();
}

// Progress is coaching only: it must never award a letter or alter the ink.
// Compare ink near the displayed route, with room for wobbles and small gaps.
// Free drawings elsewhere are still handled by whole-letter recognition.
function pencilRouteCovered(path, ink, level='gentle'){
 const length=path.getTotalLength(),start=path.getPointAtLength(0);
 if(length<8)return ink.some(line=>shapeLength([line])<35&&line.some(p=>distance(p,start)<=22));
 const tolerance=level==='focused'?24:34;
 const count=Math.max(2,Math.ceil(length/6));
 const target=Array.from({length:count+1},(_,i)=>path.getPointAtLength(length*i/count));
 const near=(p,cloud)=>cloud.some(q=>distance(p,q)<=tolerance);
 const points=resampleShape(ink,5).flat();
 if(!points.length)return false;
 const coverage=target.filter(p=>near(p,points)).length/target.length;
 // Taps at the two numbers are not a drawn line. Only nearby traveled ink counts.
 let travel=0;
 for(const line of ink)for(let i=1;i<line.length;i++){
  if(near(line[i-1],target)&&near(line[i],target))travel+=distance(line[i-1],line[i]);
 }
 return coverage>=.84&&near(target[0],points)&&near(target.at(-1),points)&&travel>=Math.max(20,length*.60);
}
function advancePencilCoaching(speak=true){
 if(guideMode!=='pencil'||saved.pencilDirections===false||finished||demoRunning||drawing)return;
 const previous=pencilTip;
 paths.forEach((path,i)=>{if(!pencilGuideDone[i]&&pencilRouteCovered(path,pencilStrokes,saved.difficulty))pencilGuideDone[i]=true;});
 const next=paths.findIndex((_,i)=>!pencilGuideDone[i]);
 pencilTip=next<0?paths.length:next;
 drawPencilDirections(pencilTip);
 if(speak&&pencilTip!==previous)showPencilTip();
}
function showPencilTip(){
 const text=pencilTip<paths.length?pencilDirectionText(pencilTip):'Now pause. Let’s look at your letter.';
 $('coach-face').textContent='☝️';$('coach-message').textContent=text;$('coach-bubble').hidden=false;
 say(text);
}
