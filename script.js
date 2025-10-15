// Flipbook viewer - pure client-side
// Behavior:
// - tries to fetch /img/images.json
// - if not found, fallbacks to EMBEDDED_LIST (manual)
// - shows two pages (left/right), supports next/prev, keyboard, swipe, autoplay

const IMG_FOLDER = './img/'; // relative path to folder
const MANIFEST = IMG_FOLDER + 'images.json';
const leftPage = document.getElementById('leftPage');
const rightPage = document.getElementById('rightPage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const thumbs = document.getElementById('thumbs');
const playPause = document.getElementById('playPause');
const intervalInput = document.getElementById('interval');
const fullscreenBtn = document.getElementById('fullscreen');

let images = []; // will be array of filenames (strings)
let index = 0;   // index of left page (even numbers preferred)
let autoplayTimer = null;

// ---- FALLBACK: if images.json unavailable, edit this array manually ----
// Put filenames exactly as they appear in /img, e.g. "cover.png", "page-1.png"
const EMBEDDED_LIST = [
  // "cover.png","page-1.png","page-2.png"
];

// ---------------------------------------------------------------------

async function loadManifest(){
  try {
    const r = await fetch(MANIFEST, {cache: "no-cache"});
    if(!r.ok) throw new Error('no manifest');
    const data = await r.json();
    if(!Array.isArray(data)) throw new Error('manifest not array');
    return data;
  } catch(e){
    return EMBEDDED_LIST;
  }
}

function buildThumbs(){
  thumbs.innerHTML = '';
  images.forEach((fn, i) => {
    const img = document.createElement('img');
    img.src = IMG_FOLDER + fn;
    img.alt = `Thumb ${i+1}`;
    img.addEventListener('click', ()=> { index = (i%2===0? i: i-1); render(); });
    thumbs.appendChild(img);
  });
}

function render(){
  // ensure index in bounds and even if possible
  if(index < 0) index = 0;
  if(index >= images.length) index = Math.max(0, images.length - (images.length%2===0?2:1));
  if(index % 2 !== 0) index--;

  const left = images[index] ?? null;
  const right = images[index+1] ?? null;

  leftPage.innerHTML = left ? `<img src="${IMG_FOLDER+left}" alt="Page ${index+1}">` : '';
  rightPage.innerHTML = right ? `<img src="${IMG_FOLDER+right}" alt="Page ${index+2}">` : '';

  // active thumb
  document.querySelectorAll('.thumbnails img').forEach((t,i)=>{
    t.classList.toggle('active', i===index || i===index+1);
  });
}

function next(){
  index += 2;
  if(index >= images.length) index = images.length - (images.length%2===0?2:1);
  render();
}

function prev(){
  index -= 2;
  if(index < 0) index = 0;
  render();
}

function startAutoplay(){
  const ms = Math.max(1000, parseInt(intervalInput.value) || 2500);
  autoplayTimer = setInterval(()=> {
    // go next and loop
    index += 2;
    if(index >= images.length) index = 0;
    render();
  }, ms);
  playPause.textContent = 'Pause';
}

function stopAutoplay(){
  clearInterval(autoplayTimer); autoplayTimer = null;
  playPause.textContent = 'Play';
}

document.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight') next();
  if(e.key === 'ArrowLeft') prev();
  if(e.key === ' ') { e.preventDefault(); playPause.click(); }
});

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);
playPause.addEventListener('click', ()=>{
  if(autoplayTimer) stopAutoplay(); else startAutoplay();
});
fullscreenBtn.addEventListener('click', ()=>{
  if(!document.fullscreenElement){
    document.documentElement.requestFullscreen().catch(()=>{});
  } else {
    document.exitFullscreen().catch(()=>{});
  }
});

// simple touch swipe
let touchStartX = 0;
document.addEventListener('touchstart', (e)=> { touchStartX = e.changedTouches[0].clientX; });
document.addEventListener('touchend', (e)=> {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if(Math.abs(dx) > 40){
    if(dx < 0) next(); else prev();
  }
});

// init
(async function init(){
  const manifest = await loadManifest();
  images = manifest && manifest.length ? manifest : [];
  if(images.length === 0){
    console.warn('No images found in manifest and EMBEDDED_LIST is empty.');
    // still render empty viewer
  }
  buildThumbs();
  render();
})();
