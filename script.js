/* Main swipe app with overlay paw-wheel spinner (3 paws rotating) */
const TOTAL = 12;
const cardStack = document.getElementById('cardStack');
const overlay = document.getElementById('overlay');
const likeBtn = document.getElementById('like');
const dislikeBtn = document.getElementById('dislike');
const undoBtn = document.getElementById('undo');

let cats = [];
let idx = 0;
let liked = JSON.parse(localStorage.getItem('likedCats')||'[]');
let history = [];

// overlay spinner helpers
function showOverlay(){ overlay.classList.remove('hidden'); }
function hideOverlay(){ overlay.classList.add('hidden'); }

function catURL(){ return `https://cataas.com/cat?width=800&height=900&rand=${Math.random()}`; }

// preload images and show overlay while loading
function preload(list, cb){
  if(!list || list.length===0){ if(cb) cb(); return; }
  let loaded=0; showOverlay();
  list.forEach(src => {
    const img = new Image();
    img.onload = ()=> { loaded++; if(loaded===list.length){ hideOverlay(); if(cb) cb(); } };
    img.onerror = ()=> { loaded++; if(loaded===list.length){ hideOverlay(); if(cb) cb(); } };
    img.src = src;
  });
}

function init(){
  const s = localStorage.getItem('paws_state');
  if(s){
    try{
      const o = JSON.parse(s);
      cats = o.cats; idx = o.idx||0; liked = o.liked||[];
      preload(cats, render); return;
    }catch(e){}
  }
  cats = Array.from({length: TOTAL}, () => catURL());
  idx = 0; liked = JSON.parse(localStorage.getItem('likedCats')||'[]');
  saveState();
  preload(cats, render);
}

function saveState(){ localStorage.setItem('paws_state', JSON.stringify({cats, idx, liked})); }

function render(){
  cardStack.innerHTML = '';
  if(idx >= cats.length){ return showSummary(); }
  for(let i = idx; i < cats.length; i++){
    const el = document.createElement('div');
    el.className = 'card';
    el.style.zIndex = String(cats.length - i);
    const img = document.createElement('img');
    img.src = cats[i];
    el.appendChild(img);
    cardStack.appendChild(el);
    if(i === idx) attach(el);
  }
}

function attach(card){
  let startX=0, startY=0, curX=0, curY=0, dragging=false;
  card.style.transition = 'transform .22s cubic-bezier(.22,.9,.32,1)';
  function down(e){
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    startX = p.clientX; startY = p.clientY;
    card.style.transition = 'none';
  }
  function move(e){
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    curX = p.clientX - startX; curY = p.clientY - startY;
    if(Math.abs(curY) > Math.abs(curX) && Math.abs(curY) > 10) return;
    const rot = curX / 18;
    card.style.transform = `translateX(${curX}px) rotate(${rot}deg)`;
    e.preventDefault && e.preventDefault();
  }
  function up(e){
    if(!dragging) return;
    dragging = false;
    card.style.transition = 'transform .22s cubic-bezier(.22,.9,.32,1)';
    if(curX > 120){ flyOut(card, 'right'); doLike(); }
    else if(curX < -120){ flyOut(card, 'left'); doDislike(); }
    else { card.style.transform = ''; }
    curX = 0; curY = 0;
  }
  card.addEventListener('touchstart', down, {passive:true});
  card.addEventListener('touchmove', move, {passive:false});
  card.addEventListener('touchend', up);
  card.addEventListener('mousedown', (e)=>{ down(e); window.addEventListener('mousemove', move); window.addEventListener('mouseup', function mu(ev){ up(ev); window.removeEventListener('mousemove', move); }, {once:true}); });
}

function flyOut(card, dir){
  const off = dir === 'right' ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;
  const rot = dir === 'right' ? 30 : -30;
  card.style.transform = `translateX(${off}px) rotate(${rot}deg)`;
  card.style.opacity = '0';
}

function doLike(){ history.push({i:idx, liked:true}); liked.push(cats[idx]); localStorage.setItem('likedCats', JSON.stringify(liked)); idx++; saveState(); setTimeout(()=>{ if(idx>=cats.length) showSummary(); else render(); }, 220); }
function doDislike(){ history.push({i:idx, liked:false}); idx++; saveState(); setTimeout(()=>{ if(idx>=cats.length) showSummary(); else render(); }, 220); }

likeBtn.addEventListener('click', ()=>{ const top = cardStack.querySelector('.card'); if(!top) return; flyOut(top,'right'); doLike(); });
dislikeBtn.addEventListener('click', ()=>{ const top = cardStack.querySelector('.card'); if(!top) return; flyOut(top,'left'); doDislike(); });
undoBtn.addEventListener('click', ()=>{ const last = history.pop(); if(!last) return; idx = last.i; if(last.liked) liked.pop(); saveState(); render(); });

function showSummary(){ window.location.href = 'liked.html'; }

// PWA register
if('serviceWorker' in navigator){ try{ navigator.serviceWorker.register('sw.js'); }catch(e){} }

// start
init();
