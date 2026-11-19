let pencilWorker=null,pencilRequest=0,pencilWorkerTimer=null;
function recognizePencilInk(ink,letter,kind,level,done){
 const id=++pencilRequest;
 const fallback=()=>{clearTimeout(pencilWorkerTimer);pencilWorker?.terminate();pencilWorker=null;if(id===pencilRequest)done(classifyPencil(ink,letter,kind,level));};
 if(typeof Worker==='undefined'){fallback();return;}
 try{
  // Discard an older in-flight result rather than queueing slow checks.
  pencilWorker?.terminate();clearTimeout(pencilWorkerTimer);
  pencilWorker=new Worker('recognition-worker.js?v=32');
  pencilWorker.onmessage=({data})=>{if(data.id!==id||id!==pencilRequest)return;if(data.error){fallback();return;}clearTimeout(pencilWorkerTimer);pencilWorker.terminate();pencilWorker=null;done(data.decision);};
  pencilWorker.onerror=fallback;
  pencilWorkerTimer=setTimeout(fallback,10000);
  pencilWorker.postMessage({id,ink,letter,kind,level});
 }catch{fallback();}
}
function pausePencilRecognition(){
 if(pencilChecking)pencilCheckedRevision=-1;
 pencilEpoch++;pencilChecking=false;pencilRequest++;
 clearTimeout(pencilWorkerTimer);pencilWorker?.terminate();pencilWorker=null;
}

