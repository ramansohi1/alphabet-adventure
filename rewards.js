let pencilTry=null,pencilMisses=0,pencilTotalMisses=0,pencilDistance=0,retryPending=false,retryTimer=null;
function clearPencilRetries(){clearTimeout(retryTimer);pencilTry=null;pencilMisses=0;pencilTotalMisses=0;pencilDistance=0;retryPending=false;$('retry-notice').hidden=true;}
function startPencilTry(p){if(guideMode!=='pencil')return;pencilTry={stroke,progress,point:p,distance:0,shapeScore:pencilBest};}
// A bounded page pauses for an explicit repair; it never silently erases work.
function queuePencilRestart(){
 if(finished||guideMode!=='pencil')return;
 cancelPencilPause();if(pencilLive?.length>1){pencilStrokes.push(pencilLive);pencilGestures.push(pencilGestureStart);}
 pencilLive=null;pencilLocked=true;drawing=false;activePointer=null;pencilTry=null;pauseObservation();
 $('coach-bubble').hidden=false;$('coach-face').textContent='🌱';$('coach-message').textContent='Undo or try a new page';
 say('Let’s try undo, or a new page, Hargun.');updatePencilFeedback();
}
function pencilTravel(p){
 if(!pencilTry||guideMode!=='pencil')return false;
 const length=distance(p,pencilTry.point);pencilTry.distance+=length;pencilDistance+=length;pencilTry.point=p;
 const budget=Math.max(1200,paths.reduce((n,path)=>n+path.getTotalLength(),0)*5);
 if(pencilDistance>budget){queuePencilRestart();return true;}return false;
}
function finishPencilTry(type){
 pencilTry=null;
 // Finger lifts are not failed attempts. Bound meaningful gestures instead.
 if(type!=='pointercancel'&&type!=='lostpointercapture'&&pencilGestures.length>=16)queuePencilRestart();
}

function prepareReward(letter){$('reward-letter').textContent=letter;for(const b of document.querySelectorAll('.pop-star')){b.disabled=false;b.textContent='⭐';} $('reward-animal').setAttribute('aria-label',`You made ${letter}! Tap the ${currentExample().word} picture for the next letter`);}
function initRewardPlay(){for(const button of document.querySelectorAll('.pop-star'))button.onclick=()=>{if(button.disabled)return;button.disabled=true;button.textContent='✨';unlockAudio();chime('stroke');tinyReward();};}
