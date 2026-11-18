// Recognition runs off the UI thread. No networking or persistent ink storage.
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
importScripts('pencil-shape.js?v=31','recognition-data.js?v=31','recognition.js?v=31');
self.onmessage=({data})=>{
 try{self.postMessage({id:data.id,decision:classifyPencil(data.ink,data.letter,data.kind,data.level)});}
 catch{self.postMessage({id:data.id,error:true});}
};

