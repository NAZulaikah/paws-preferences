const landing = document.getElementById("landing");
const swipePage = document.getElementById("swipePage");
const startBtn = document.getElementById("startBtn");
const clearBtn = document.getElementById("clearBtn");

const catCard = document.getElementById("catCard");
const likeBtn = document.getElementById("likeBtn");
const dislikeBtn = document.getElementById("dislikeBtn");

const likedContainer = document.getElementById("likedContainer");
const progressText = document.getElementById("progress");

const likeSound = document.getElementById("likeSound");
const dislikeSound = document.getElementById("dislikeSound");

let currentCat = "";
let likedCats = JSON.parse(localStorage.getItem("likedCats") || "[]");

let totalCats = 20;
let counter = 1;

// Show liked cats
updateLikedList();

// Load cat from API
async function loadCat() {
    currentCat = `https://cataas.com/cat?${Date.now()}`;
    catCard.src = currentCat;
    progressText.textContent = `Cat ${counter} of ${totalCats}`;
}

// Start Swipe Page
startBtn.addEventListener("click", () => {
    landing.classList.add("hidden");
    swipePage.classList.remove("hidden");
    counter = 1;
    loadCat();
});

// Clear Liked Cats
clearBtn.addEventListener("click", () => {
    likedCats = [];
    localStorage.setItem("likedCats", "[]");
    updateLikedList();
});

// Like & Dislike Buttons
likeBtn.onclick = () => animateDecision(true);
dislikeBtn.onclick = () => animateDecision(false);

// Slide animation + save
function animateDecision(liked) {
    if (liked) {
        likeSound.play();
        catCard.classList.add("slide-right");
    } else {
        dislikeSound.play();
        catCard.classList.add("slide-left");
    }

    setTimeout(() => {
        handleDecision(liked);
        catCard.classList.remove("slide-right", "slide-left");
    }, 300);
}

// Save decision & load next
function handleDecision(liked) {
    if (liked) {
        likedCats.push(currentCat);
        localStorage.setItem("likedCats", JSON.stringify(likedCats));
        updateLikedList();
    }

    counter++;
    if (counter > totalCats) counter = 1;
    loadCat();
}

// Update landing page liked images
function updateLikedList() {
    likedContainer.innerHTML = "";

    likedCats.forEach(url => {
        let img = document.createElement("img");
        img.src = url;
        likedContainer.appendChild(img);
    });
}

/* Swipe Gesture */
let startX = 0;

catCard.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
});

catCard.addEventListener("touchmove", e => {
    let diff = e.touches[0].clientX - startX;
    catCard.style.transform = `translateX(${diff}px) rotate(${diff / 15}deg)`;
});

catCard.addEventListener("touchend", e => {
    let diff = e.changedTouches[0].clientX - startX;

    if (diff > 120) {
        animateDecision(true);
    } else if (diff < -120) {
        animateDecision(false);
    }

    catCard.style.transform = "translateX(0) rotate(0)";
});
