// Lightweight, device-local sound effects and letter-specific play scenes.
// Animal calls are playful synthesized imitations, not wildlife recordings.
const SCENES = {
 A:['Apple orchard','#fff4e5','🍎 🌳 🍃','pop'], B:['Bear’s woodland','#eff2df','🐻 🌲 🍯','growl'],
 C:['Cat’s cozy corner','#fff0e9','🐱 🧶 🐾','meow'], D:['Dog’s sunny park','#eff6df','🐶 🎾 🦴','bark'],
 E:['Elephant’s grassland','#f6efda','🐘 🌾 ☀️','trumpet'], F:['Fox’s autumn forest','#fff0db','🦊 🍂 🌲','yip'],
 G:['Goat’s mountain meadow','#eaf5e5','🐐 ⛰️ 🌼','bleat'], H:['Horse’s meadow','#edf5dc','🐴 🌾 🌻','neigh'],
 I:['Icy igloo','#e7f6fc','🧊 ❄️ 🏔️','ice'], J:['Jellyfish ocean','#e9f2ff','🪼 🫧 🪸','bubbles'],
 K:['Koala’s treetops','#e8f3e8','🐨 🌿 🌳','growl'], L:['Lion’s savanna','#fff2cf','🦁 🌾 ☀️','roar'],
 M:['Monkey’s jungle','#e5f5df','🐵 🍌 🌴','chatter'], N:['Nest in the treetops','#f1f4de','🪺 🌳 🍃','rustle'],
 O:['Owl’s moonlit forest','#eeebfa','🦉 🌙 ✨','hoot'], P:['Penguin’s icy shore','#e7f5fa','🐧 ❄️ 🐟','honk'],
 Q:['Queen’s magical garden','#fff0f7','👑 🌷 🦋','magic'], R:['Rabbit’s garden','#f1f7df','🐰 🥕 🌼','hop'],
 S:['Snail’s rainy garden','#eaf4e8','🐌 🍄 💧','rain'], T:['Turtle’s pond','#e2f4ef','🐢 🪷 💧','splash'],
 U:['Umbrella rain dance','#eaf2ff','☂️ 🌧️ 💧','rain'], V:['Van’s little road trip','#fff2df','🚐 🌈 🌳','beep'],
 W:['Whale’s blue ocean','#e4f3ff','🐳 🌊 🫧','whale'], X:['Xylophone music garden','#fff0f1','🎵 🎶 🌸','music'],
 Y:['Yak’s mountain home','#edf1f8','🐂 ⛰️ ❄️','moo'], Z:['Zebra’s sunny plains','#f4f2dc','🦓 🌾 🌅','bray']
};
const CALL_LETTERS = new Set('BCDEFGHKLMOPWYZ');
let effectNodes=[], speechGeneration=0;
function stopEffects(){effectNodes.forEach(n=>{try{n.stop();}catch{}});effectNodes=[];}
function cancelVoices(){speechGeneration++;stopEffects();if('speechSynthesis' in window)window.speechSynthesis.cancel();}
function updateScene(){const [name,color,icons]=SCENES[current];document.body.style.setProperty('--scene-color',color);$('scene-title').textContent=name;$('scene-toys').replaceChildren();$('scene-backdrop').replaceChildren();icons.split(' ').forEach((icon,i)=>{const toy=document.createElement('button');toy.className='scene-toy';toy.textContent=icon;toy.setAttribute('aria-label',`Play ${LETTERS[current].word} scene, surprise ${i+1}`);toy.onclick=()=>{sceneBurst();};$('scene-toys').append(toy);const decoration=document.createElement('span');decoration.textContent=icon;decoration.style.left=`${i*37+5}%`;decoration.style.top=`${i%2?55:15}%`;decoration.style.animationDelay=`-${i*2}s`;$('scene-backdrop').append(decoration);});$('animal-sound').textContent=CALL_LETTERS.has(current)?`${LETTERS[current].emoji} Hear my sound`:'♫ Play scene sound';$('animal-sound').setAttribute('aria-label',CALL_LETTERS.has(current)?`Hear a playful ${LETTERS[current].word} sound`:`Hear ${name} sound effects`);}
function sceneBurst(){if(!saved.animations||matchMedia('(prefers-reduced-motion: reduce)').matches)return;const icons=SCENES[current][2].split(' ');for(let i=0;i<9;i++){const e=document.createElement('span');e.className='scene-pop';e.textContent=icons[i%icons.length];e.style.left=`${10+Math.random()*80}%`;e.style.setProperty('--drift',`${Math.random()*160-80}px`);$('screen-effects').append(e);setTimeout(()=>e.remove(),1800);}}
function screenConfetti(){if(!saved.animations||matchMedia('(prefers-reduced-motion: reduce)').matches)return;$('screen-effects').replaceChildren();const shapes=['✦','●','♥','★','▪','✿'];for(let i=0;i<90;i++){const el=document.createElement('span');el.className='screen-confetti';el.textContent=shapes[i%shapes.length];el.style.left=`${Math.random()*100}%`;el.style.color=['#ef7c82','#66b9ad','#ffc84f','#a88be0','#6bb0ef'][i%5];el.style.animationDelay=`${Math.random()*.65}s`;el.style.setProperty('--drift',`${Math.random()*340-170}px`);el.style.setProperty('--spin',`${Math.random()*1080-540}deg`);el.style.fontSize=`${14+Math.random()*18}px`;$('screen-effects').append(el);setTimeout(()=>el.remove(),4200);}sceneBurst();}

// Short, optional practice path: simple straight strokes before complex curves.
let adventure=null;
function refreshAdventure(){ $('adventure-progress').replaceChildren();if(!adventure){$('adventure-status').textContent='Try three easy letters, one at a time.';return;}for(const letter of adventure.letters){const el=document.createElement('span');el.textContent=adventure.done.includes(letter)?'★':letter;el.className=adventure.done.includes(letter)?'earned':'';$('adventure-progress').append(el);}$('adventure-status').textContent=adventure.done.length===3?'Three letters! You’re a little writing star.':`${adventure.done.length} of 3 stars collected. Take your time!`;}
function startAdventure(){adventure={letters:['L','T','I'],done:[]};letterCase='upper';current='L';render();refreshAdventure();describe();}
function adventureReward(){if(!adventure||letterCase!=='upper'||!adventure.letters.includes(current))return;if(!adventure.done.includes(current))adventure.done.push(current);refreshAdventure();if(adventure.done.length===3){$('reward-title').textContent='Three-letter superstar!';$('reward-text').textContent='You made L, T and I. What a wonderful little adventure!';$('next').textContent='Choose another letter →';}}
function nextAdventureLetter(){if(adventure){const next=adventure.letters.find(l=>!adventure.done.includes(l));if(next){letterCase='upper';current=next;}else{adventure=null;current='A';}refreshAdventure();}else if(randomMode){current=drawRandomLetter();}else{const all=Object.keys(LETTERS);current=all[(all.indexOf(current)+1)%all.length];}render();describe();}
