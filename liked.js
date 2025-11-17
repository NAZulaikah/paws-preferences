const grid = document.getElementById("likedGrid");
const liked = JSON.parse(localStorage.getItem("likedCats") || "[]");

grid.innerHTML = liked.map(url => `<img src="${url}">`).join("");

function clearLikes() {
  localStorage.removeItem("likedCats");
  grid.innerHTML = "";
}
