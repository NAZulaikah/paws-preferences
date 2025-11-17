const stack = document.getElementById("cardStack");
const loader = document.getElementById("loader");

let cats = [];
let current = 0;
let liked = JSON.parse(localStorage.getItem("likedCats") || "[]");
let history = [];

async function loadCats() {
  loader.style.display = "block";

  cats = Array.from({ length: 10 }, () =>
    `https://cataas.com/cat?${Math.random()}`
  );

  loader.style.display = "none";
  renderCards();
}

function renderCards() {
  stack.innerHTML = "";

  cats.slice(current).reverse().forEach(url => {
    const card = document.createElement("div");
    card.className = "cat-card";
    card.style.backgroundImage = `url(${url})`;
    stack.appendChild(card);
  });
}

function swipe(direction) {
  if (current >= cats.length) return;

  const card = stack.querySelector(".cat-card:last-child");

  if (!card) return;

  const likedCat = direction === "right";

  history.push({ index: current, liked: likedCat });

  card.style.transform =
    direction === "right"
      ? "translateX(300px) rotate(20deg)"
      : "translateX(-300px) rotate(-20deg)";

  if (likedCat) {
    liked.push(cats[current]);
    localStorage.setItem("likedCats", JSON.stringify(liked));
  }

  setTimeout(() => {
    current++;
    renderCards();
  }, 250);
}

function undo() {
  const last = history.pop();
  if (!last) return;

  current = last.index;

  if (last.liked) {
    liked.pop();
    localStorage.setItem("likedCats", JSON.stringify(liked));
  }

  renderCards();
}

document.getElementById("likeBtn").onclick = () => swipe("right");
document.getElementById("dislikeBtn").onclick = () => swipe("left");
document.getElementById("undoBtn").onclick = undo;

loadCats();
