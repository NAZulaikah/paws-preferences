const grid = document.getElementById('likedGrid');
const clearBtn = document.getElementById('clearBtn');
function loadLiked(){ const liked = JSON.parse(localStorage.getItem('likedCats')||'[]'); grid.innerHTML = liked.map(u=>`<img src="${u}" alt="liked cat">`).join(''); }
clearBtn && clearBtn.addEventListener('click', ()=>{ localStorage.removeItem('likedCats'); loadLiked(); });
loadLiked();
