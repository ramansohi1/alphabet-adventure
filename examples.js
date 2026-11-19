// Reviewed vocabulary is bundled; no live image search or child data upload.
const MORE_EXAMPLES={A:[['ant','🐜'],['airplane','✈️']],B:[['ball','⚽'],['butterfly','🦋']],C:[['car','🚗'],['cake','🎂']],D:[['duck','🦆'],['dinosaur','🦕']],E:[['egg','🥚'],['eagle','🦅']],F:[['fish','🐟'],['flower','🌼']],G:[['grapes','🍇'],['guitar','🎸']],H:[['hat','🎩'],['house','🏠']],I:[['ice cream','🍦'],['insect','🐞']],J:[['juice','🧃'],['jeans','👖']],K:[['key','🔑'],['kite','🪁']],L:[['leaf','🍃'],['lemon','🍋']],M:[['moon','🌙'],['mouse','🐭']],N:[['noodles','🍜'],['nose','👃']],O:[['orange','🍊'],['octopus','🐙']],P:[['pear','🍐'],['pizza','🍕']],Q:[['question','❓'],['quilt','🟪']],R:[['rainbow','🌈'],['rocket','🚀']],S:[['star','⭐'],['snake','🐍']],T:[['tree','🌳'],['train','🚂']],U:[['unicorn','🦄'],['up','⬆️']],V:[['violin','🎻'],['volcano','🌋']],W:[['watermelon','🍉'],['watch','⌚']],X:[['x-ray','🩻'],['X marks the spot','❌']],Y:[['yo-yo','🪀'],['yellow','🟨']],Z:[['zipper','🤐'],['zero','0️⃣']]};
const exampleChoices={};
function letterExamples(letter=current){const base=LETTERS[letter];return [{word:base.word,emoji:base.emoji},...MORE_EXAMPLES[letter].map(([word,emoji])=>({word,emoji}))].filter((a,i,all)=>all.findIndex(b=>a.word===b.word)===i);}
function currentExample(){return letterExamples()[exampleChoices[current]||0];}
function updateExamples(){
 const example=currentExample();$('word-title').textContent='is for '+example.word;setPicture($('word-emoji'),example);
 $('word-emoji').setAttribute('aria-label','Hear '+current+' is for '+example.word);
 $('picture-examples').replaceChildren();
 for(const [i,item] of letterExamples().entries()){
  const b=document.createElement('button');setPicture(b,item);b.setAttribute('aria-label',current+' is for '+item.word);b.setAttribute('aria-pressed',String(i===(exampleChoices[current]||0)));
  b.onclick=()=>{if(demoRunning||finished)return;unlockAudio();exampleChoices[current]=i;updateExamples();say(spokenLetter(current)+' is for '+item.word+'.');};$('picture-examples').append(b);
 }
}

// Original bundled artwork avoids misleading emoji substitutes and external calls.
function setPicture(host,item){
 host.replaceChildren();
 if(['igloo','xylophone','zipper','quilt'].includes(item.word)){
  const picture=document.createElement('img');picture.src='pictures/'+item.word+'.svg';picture.alt='';picture.setAttribute('aria-hidden','true');picture.className='word-picture';picture.draggable=false;host.append(picture);
 }else host.textContent=item.emoji;
}

let pictureGame=null,pictureNextTimer=null;
function cancelPictureNext(){clearTimeout(pictureNextTimer);pictureNextTimer=null;}
function queuePictureNext(game,delay=1400){cancelPictureNext();pictureNextTimer=setTimeout(()=>{pictureNextTimer=null;if(pictureGame!==game||!game.solved||!finished||game.key!==letterCase+':'+current)return;if(document.hidden||document.querySelector?.('dialog[open]')){queuePictureNext(game,1000);return;}nextAdventureLetter();},delay);}
const pictureTurns={};
function resetPictureGame(){cancelPictureNext();pictureGame=null;$('picture-game').hidden=true;$('celebrate').classList.toggle('picture-game-active',false);}
function startPictureGame(){
 cancelPictureNext();
 const key=letterCase+':'+current,items=letterExamples();
 const target=(pictureTurns[key]||0)%items.length;pictureTurns[key]=target+1;
 pictureGame={key,letter:current,items,target,solved:false};
 $('celebrate').classList.toggle('picture-game-active',true);$('picture-game').hidden=false;
 $('picture-game-choices').replaceChildren();
 items.forEach((item,index)=>{
  const button=document.createElement('button');button.type='button';setPicture(button,item);
  button.setAttribute('aria-label',item.word);
  button.onclick=()=>choosePicture(index);
  $('picture-game-choices').append(button);
 });
 $('picture-game-prompt').textContent='Can you find the '+items[target].word+'?';
 $('picture-game-hear').onclick=()=>{unlockAudio();say($('picture-game-prompt').textContent);};
 $('picture-game-next').onclick=()=>{unlockAudio();nextAdventureLetter();};
 say(personal('You did it!')+' '+$('picture-game-prompt').textContent);
 $('picture-game-hear').focus({preventScroll:true});
}
function choosePicture(index){
 const game=pictureGame;
 if(!game||!finished||game.key!==letterCase+':'+current||game.solved)return;
 const item=game.items[index];if(!item)return;
 unlockAudio();
 const buttons=$('picture-game-choices').children;
 if(index===game.target){
  game.solved=true;
  buttons[index].classList.toggle('picture-found',true);
  $('picture-game-prompt').textContent=item.word+'! '+game.letter+' is for '+item.word+'.';
  const speech=say(item.word+'! '+spokenLetter(game.letter)+' is for '+item.word+'.',()=>{if(pictureGame===game)queuePictureNext(game);});
  queuePictureNext(game,speech?6500:1800);
 }else{
  say(item.word+'. Can you find the '+game.items[game.target].word+'?');
  buttons[game.target].classList.toggle('picture-hint',true);
 }
}

