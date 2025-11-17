const TOTAL_CATS = 15;

let cats = [];
let liked = [];
let currentIndex = 0;
let undoStack = [];

const container = document.getElementById("card-container");
const spinner = document.getElementById("spinner");
const summaryPage = document.getElementById("summary");
const likedGallery = document.getElementById("liked-gallery");
const likedCount = document.getElementById("liked-count");

const likeBtn = document.getElementById("like");
const dislikeBtn = document.getElementById("dislike");
const undoBtn = document.getElementById("undo");
const restartBtn = document.getElementById("restart");

function getCatURL() {
  return `https://cataas.com/cat?${Math.random()}`;
}

/* Spinner control */
function showSpinner() { spinner.classList.remove("hidden"); }
function hideSpinner() { spinner.classList.add("hidden"); }

/* Preload all images */
function preloadImages(urls, callback) {
  let loaded = 0;
  showSpinner();
  urls.forEach(url => {
    const img = new Image();
    img.onload = () => {
      loaded++;
      if (loaded === urls.length) hideSpinner();
    };
    img.src = url;
  });
}

/* Rendering cards */
function renderCards() {
  container.innerHTML = "";
  if (currentIndex >= cats.length) return showSummary();

  for (let i = currentIndex; i < cats.length; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.zIndex = cats.length - i;

    const img = document.createElement("img");
    img.src = cats[i];

    card.appendChild(img);
    container.appendChild(card);
  }

  attachSwipeListeners();
}

/* Swipe handling (touch + mouse) */
function attachSwipeListeners() {
  const topCard = container.querySelector(".card");
  if (!topCard) return;

  let startX = 0;
  let currentX = 0;

  function start(e) {
    startX = e.touches ? e.touches[0].clientX : e.clientX;
  }

  function move(e) {
    currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;
    topCard.style.transform = `translateX(${diff}px) rotate(${diff / 20}deg)`;
  }

  function end() {
    const diff = currentX - startX;
    if (diff > 120) handleLike();
    else if (diff < -120) handleDislike();
    else {
      topCard.style.transform = "translateX(0)";
    }
  }

  topCard.addEventListener("mousedown", start);
  topCard.addEventListener("mousemove", move);
  topCard.addEventListener("mouseup", end);

  topCard.addEventListener("touchstart", start);
  topCard.addEventListener("touchmove", move);
  topCard.addEventListener("touchend", end);
}

function handleLike() {
  undoStack.push({ index: currentIndex, liked: true });
  liked.push(cats[currentIndex]);
  currentIndex++;
  renderCards();
  saveState();
}

function handleDislike() {
  undoStack.push({ index: currentIndex, liked: false });
  currentIndex++;
  renderCards();
  saveState();
}

/* Undo last swipe */
undoBtn.addEventListener("click", () => {
  if (undoStack.length === 0) return;

  const last = undoStack.pop();
  currentIndex = last.index;

  if (last.liked) liked.pop();

  renderCards();
  saveState();
});

/* Summary screen */
function showSummary() {
  likedCount.textContent = liked.length;
  likedGallery.innerHTML = liked
    .map(url => `<img src="${url}" />`)
    .join("");
  summaryPage.classList.remove("hidden");
}

/* Restart */
restartBtn.addEventListener("click", () => {
  localStorage.removeItem("paws_pref_state");
  location.reload();
});

/* Save progress */
function saveState() {
  localStorage.setItem("paws_pref_state", JSON.stringify({
    cats, liked, currentIndex
  }));
}

/* Load progress */
function loadState() {
  const state = localStorage.getItem("paws_pref_state");
  return state ? JSON.parse(state) : null;
}

/* Init */
function init() {
  const saved = loadState();

  if (saved) {
    cats = saved.cats;
    liked = saved.liked;
    currentIndex = saved.currentIndex;
    preloadImages(cats);
    return renderCards();
  }

  cats = Array.from({ length: TOTAL_CATS }, getCatURL);
  preloadImages(cats);
  renderCards();
  saveState();
}

/* Buttons */
likeBtn.onclick = handleLike;
dislikeBtn.onclick = handleDislike;

init();
