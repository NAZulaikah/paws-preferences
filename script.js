/* Enhanced script: responsive swipe, undo, spinner, localStorage, preload, PWA register */
const TOTAL = 14;
let cats = [];
let liked = [];
let idx = 0;
let undoStack = [];

const cardStack = document.getElementById('cardStack');
const spinner = document.getElementById('spinner');
const summary = document.getElementById('summary');
const likedCount = document.getElementById('liked-count');
const likedGallery = document.getElementById('liked-gallery');

const likeBtn = document.getElementById('like');
const dislikeBtn = document.getElementById('dislike');
const undoBtn = document.getElementById('undo');
const restartBtn = document.getElementById('restart');
const clearBtn = document.getElementById('clear');
const openHome = document.getElementById('open-home');

// PWA registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(()=>{/* ignore */});
}

function catURL(){ return `https://cataas.com/cat?width=900&height=900&rand=${Math.random()}`; }

// LocalStorage helpers
function save(){ localStorage.setItem('paws_state', JSON.stringify({cats, liked, idx})); }
function load(){
  try{
    const s = localStorage.getItem('paws_state');
    if (!s) return false;
    const o = JSON.parse(s);
    if (!Array.isArray(o.cats)) return false;
    cats = o.cats; liked = o.liked||[]; idx = Number(o.idx)||0;
    return true;
  }catch(e){ return false; }
}
function clearState(){ localStorage.removeItem('paws_state'); }

// Spinner
function showSpinner(){ spinner.classList.remove('hidden'); }
function hideSpinner(){ spinner.classList.add('hidden'); }

// Preload
function preload(list, cb){
  if (!list || list.length===0){ if(cb) cb(); return; }
  let loaded=0; showSpinner();
  list.forEach(u=>{
    const img=new Image();
    img.onload=()=>{
      loaded++; if(loaded===list.length){ hideSpinner(); if(cb) cb(); }
    };
    img.onerror=()=>{
      loaded++; if(loaded===list.length){ hideSpinner(); if(cb) cb(); }
    };
    img.src=u;
  });
}

// Init / render
function init(){
  const resumed = load();
  if (resumed){ preload(cats, ()=>render()); return; }
  cats = Array.from({length: TOTAL}, ()=>catURL());
  liked = []; idx = 0; save();
  preload(cats, ()=>render());
}

function render(){
  cardStack.innerHTML='';
  if (idx>=cats.length){ return showSummary(); }
  for (let i=idx;i<cats.length;i++){
    const el = document.createElement('div'); el.className='card';
    el.style.zIndex = String(cats.length - i);
    const img = document.createElement('img'); img.src=cats[i]; img.alt='Cute cat';
    el.appendChild(img);
    cardStack.appendChild(el);
    if (i===idx) attach(el);
  }
}

// Attach pointer listeners for top card
function attach(card){
  let startX=0, startY=0, curX=0, curY=0, dragging=false, id=null;
  card.style.transition='transform 180ms cubic-bezier(.22,.9,.32,1)';

  function down(e){
    dragging=true;
    const p = e.touches? e.touches[0] : e;
    startX = p.clientX; startY = p.clientY;
    card.style.transition='none';
  }
  function move(e){
    if(!dragging) return;
    const p = e.touches? e.touches[0]: e;
    curX = p.clientX - startX;
    curY = p.clientY - startY;
    // If vertical significant, let page scroll (don't prevent)
    if (Math.abs(curY) > Math.abs(curX) && Math.abs(curY) > 10) {
      // don't transform to allow native scroll
      return;
    }
    const rot = curX / 18;
    card.style.transform = `translateX(${curX}px) rotate(${rot}deg)`;
    e.preventDefault();
  }
  function up(e){
    if(!dragging) return;
    dragging=false;
    card.style.transition='transform 220ms cubic-bezier(.22,.9,.32,1)';
    // decide
    if (curX > 120){ animateOut(card, 'right'); doLike(); }
    else if (curX < -120){ animateOut(card, 'left'); doDislike(); }
    else { card.style.transform = ''; }
    curX=0; curY=0;
  }

  // pointer events for mouse + touch
  card.addEventListener('touchstart', down, {passive:true});
  card.addEventListener('touchmove', move, {passive:false});
  card.addEventListener('touchend', up);
  card.addEventListener('mousedown', (e)=>{ down(e); window.addEventListener('mousemove', move); window.addEventListener('mouseup', function upMouse(ev){ up(ev); window.removeEventListener('mousemove', move); }, {once:true}); });
}

function animateOut(card, dir){
  const off = dir==='right' ? window.innerWidth*1.2 : -window.innerWidth*1.2;
  const rot = dir==='right'? 30:-30;
  card.style.transform = `translateX(${off}px) rotate(${rot}deg)`;
  card.style.opacity = '0';
}

// Actions
function doLike(){
  undoStack.push({i:idx, liked:true});
  liked.push(cats[idx]);
  idx++;
  save();
  setTimeout(()=>{ if (idx>=cats.length) showSummary(); else render(); }, 220);
}
function doDislike(){
  undoStack.push({i:idx, liked:false});
  idx++;
  save();
  setTimeout(()=>{ if (idx>=cats.length) showSummary(); else render(); }, 220);
}

// Buttons
likeBtn && likeBtn.addEventListener('click', ()=>{
  const top = cardStack.querySelector('.card'); if(!top) return;
  animateOut(top,'right'); doLike();
});
dislikeBtn && dislikeBtn.addEventListener('click', ()=>{
  const top = cardStack.querySelector('.card'); if(!top) return;
  animateOut(top,'left'); doDislike();
});
undoBtn && undoBtn.addEventListener('click', ()=>{
  if (undoStack.length===0) return;
  const last = undoStack.pop();
  idx = last.i;
  if (last.liked) { liked.pop(); }
  save();
  render();
});
restartBtn && restartBtn.addEventListener('click', ()=>{
  clearState();
  location.reload();
});
clearBtn && clearBtn.addEventListener('click', ()=>{
  clearState(); alert('Saved progress cleared'); location.reload();
});
openHome && openHome.addEventListener('click', ()=>{
  summary.classList.add('hidden'); document.querySelector('.app').scrollIntoView();
});

// Summary
function showSummary(){
  likedCount.textContent = String(liked.length);
  likedGallery.innerHTML = liked.map(u=>`<img src="${u}" alt="liked cat">`).join('');
  summary.classList.remove('hidden');
  document.getElementById('open-home').style.display='inline-block';
}

// Start
init();
