// Optional coaching is presentation only: it never contributes to recognition.
let pencilTip=0,pencilShownTip=0;
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
 drawPencilDirections(pencilTip);
 $('coach-face').textContent='☝️';$('coach-message').textContent=pencilDirectionText();$('coach-bubble').hidden=false;
 say(pencilDirectionText());
 pencilTip=(pencilTip+1)%paths.length;
}
