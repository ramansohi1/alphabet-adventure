// Reviewed vocabulary is bundled; no live image search or child data upload.
const MORE_EXAMPLES={A:[['ant','🐜'],['airplane','✈️']],B:[['ball','⚽'],['butterfly','🦋']],C:[['car','🚗'],['cake','🎂']],D:[['duck','🦆'],['dinosaur','🦕']],E:[['egg','🥚'],['eagle','🦅']],F:[['fish','🐟'],['flower','🌼']],G:[['grapes','🍇'],['guitar','🎸']],H:[['hat','🎩'],['house','🏠']],I:[['ice cream','🍦'],['insect','🐞']],J:[['juice','🧃'],['jeans','👖']],K:[['key','🔑'],['koala','🐨']],L:[['leaf','🍃'],['lemon','🍋']],M:[['moon','🌙'],['mouse','🐭']],N:[['noodles','🍜'],['nose','👃']],O:[['orange','🍊'],['octopus','🐙']],P:[['penguin','🐧'],['pizza','🍕']],Q:[['question','❓']],R:[['rainbow','🌈'],['rocket','🚀']],S:[['star','⭐'],['snake','🐍']],T:[['tree','🌳'],['turtle','🐢']],U:[['unicorn','🦄']],V:[['violin','🎻'],['volcano','🌋']],W:[['watermelon','🍉'],['whale','🐳']],X:[['x-ray','🩻']],Y:[['yo-yo','🪀']],Z:[['zipper','🤐']]};
const exampleChoices={};
function letterExamples(letter=current){const base=LETTERS[letter];return [{word:base.word,emoji:base.emoji},...MORE_EXAMPLES[letter].map(([word,emoji])=>({word,emoji}))].filter((a,i,all)=>all.findIndex(b=>a.word===b.word)===i);}
function currentExample(){return letterExamples()[exampleChoices[current]||0];}
function updateExamples(){
 const example=currentExample();$('word-title').textContent='is for '+example.word;setPicture($('word-emoji'),example);
 $('word-emoji').setAttribute('aria-label','Hear '+current+' is for '+example.word);
 $('picture-examples').replaceChildren();
 for(const [i,item] of letterExamples().entries()){
  const b=document.createElement('button');setPicture(b,item);b.setAttribute('aria-label',current+' is for '+item.word);b.setAttribute('aria-pressed',String(i===(exampleChoices[current]||0)));
  b.onclick=()=>{if(demoRunning||finished)return;unlockAudio();exampleChoices[current]=i;updateExamples();describe();};$('picture-examples').append(b);
 }
}

// Original bundled artwork avoids misleading emoji substitutes and external calls.
function setPicture(host,item){
 host.replaceChildren();
 if(['igloo','xylophone','zipper'].includes(item.word)){
  const picture=document.createElement('img');picture.src='pictures/'+item.word+'.svg';picture.alt='';picture.setAttribute('aria-hidden','true');picture.className='word-picture';picture.draggable=false;host.append(picture);
 }else host.textContent=item.emoji;
}
