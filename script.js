
/* script.js - paws-preferences (Full version with LocalStorage) */
const TOTAL_CATS = 12; // number of cards to fetch

let cats = [];
let liked = [];
let currentIndex = 0;

const cardContainer = document.getElementById('card-container');
const summaryEl = document.getElementById('summary');
const likeCount = document.getElementById('like-count');
const likedGrid = document.getElementById('liked-grid');

function getCatURL() {
  // Cataas random cat image; rand query to reduce cache collisions
  return `https://cataas.com/cat?width=800&height=900&rand=${Math.random()}`;
}

// --- LocalStorage helpers ---
function saveState() {
  localStorage.setItem('paws_cats', JSON.stringify(cats));
  localStorage.setItem('paws_liked', JSON.stringify(liked));
  localStorage.setItem('paws_index', String(currentIndex));
}

function loadState() {
  const a = localStorage.getItem('paws_cats');
  const b = localStorage.getItem('paws_liked');
  const c = localStorage.getItem('paws_index');
  if (a && b && c !== null) {
    try {
      cats = JSON.parse(a);
      liked = JSON.parse(b);
      currentIndex = Number(c);
      // Basic validation
      if (!Array.isArray(cats) || !Array.isArray(liked) || Number.isNaN(currentIndex)) throw 0;
      return true;
    } catch (e) {
      // corrupted state
      localStorage.removeItem('paws_cats');
      localStorage.removeItem('paws_liked');
      localStorage.removeItem('paws_index');
      return false;
    }
  }
  return false;
}

function clearState() {
  localStorage.removeItem('paws_cats');
  localStorage.removeItem('paws_liked');
  localStorage.removeItem('paws_index');
}

// --- App logic ---
function init() {
  const resumed = loadState();
  if (resumed) {
    renderCards();
    return;
  }
  // fresh session
  cats = Array.from({length: TOTAL_CATS}, () => getCatURL());
  liked = [];
  currentIndex = 0;
  saveState();
  renderCards();
}

function renderCards() {
  cardContainer.innerHTML = '';
  if (currentIndex >= cats.length) {
    showSummary();
    return;
  }

  // Render from top (current) to end, so top card is current
  for (let i = currentIndex; i < cats.length; i++) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.zIndex = String(cats.length - i);

    const img = document.createElement('img');
    img.src = cats[i];
    img.alt = 'Cute cat';

    // small delay for nicer stacking appearance
    card.appendChild(img);
    cardContainer.appendChild(card);

    if (i === currentIndex) enableSwipe(card);
  }
}

function enableSwipe(card) {
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  // Add pointer events to support mouse + touch
  card.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    startX = e.clientX;
    dragging = true;
    card.setPointerCapture(e.pointerId);
    card.style.transition = 'none';
  });

  card.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    currentX = e.clientX - startX;
    const rot = currentX / 18;
    card.style.transform = `translateX(${currentX}px) rotate(${rot}deg)`;
  });

  card.addEventListener('pointerup', (e) => {
    if (!dragging) return;
    dragging = false;
    card.releasePointerCapture(e.pointerId);
    card.style.transition = 'transform 220ms cubic-bezier(.22,.9,.32,1)';
    if (currentX > 120) {
      // liked
      animateOut(card, 'right');
      handleLike();
    } else if (currentX < -120) {
      animateOut(card, 'left');
      handleDislike();
    } else {
      // snap back
      card.style.transform = '';
    }
    currentX = 0;
  });

  // Accessibility: allow keyboard keypresses when focused
  card.tabIndex = 0;
  card.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      animateOut(card, 'right'); handleLike();
    } else if (e.key === 'ArrowLeft') {
      animateOut(card, 'left'); handleDislike();
    }
  });
}

function animateOut(card, dir='right') {
  const off = dir === 'right' ? window.innerWidth * 1.2 : -window.innerWidth * 1.2;
  const rot = dir === 'right' ? 30 : -30;
  card.style.transform = `translateX(${off}px) rotate(${rot}deg)`;
  card.style.opacity = '0';
}

function handleLike() {
  liked.push(cats[currentIndex]);
  nextCard();
}

function handleDislike() {
  nextCard();
}

function nextCard() {
  currentIndex++;
  saveState();
  // small timeout so animation can be visible
  setTimeout(() => {
    if (currentIndex >= cats.length) showSummary();
    else renderCards();
  }, 220);
}

function showSummary() {
  // finish session — clear local progress so next run starts fresh
  clearState();
  // hide app and show summary
  document.getElementById('app').classList.add('hidden');
  summaryEl.classList.remove('hidden');
  likeCount.textContent = String(liked.length);
  likedGrid.innerHTML = liked.map(src => `<img src="${src}" alt="liked cat"/>`).join('');
}

// Controls
document.getElementById('like').addEventListener('click', () => {
  // simulate swipe right
  const top = document.querySelector('.card');
  if (!top) return;
  animateOut(top, 'right');
  handleLike();
});
document.getElementById('dislike').addEventListener('click', () => {
  const top = document.querySelector('.card');
  if (!top) return;
  animateOut(top, 'left');
  handleDislike();
});

// Restart & clear
document.getElementById('restart').addEventListener('click', () => {
  // restart: regenerate cats and start anew
  clearState();
  document.getElementById('app').classList.remove('hidden');
  summaryEl.classList.add('hidden');
  init();
});
document.getElementById('clear').addEventListener('click', () => {
  clearState();
  alert('Saved progress cleared.');
});

// Start
init();
