// config
const IMG_FOLDER = './img/';
const TOTAL_PAGES = 12; // ganti sesuai jumlah gambar kamu

// Pola nama file
const BASE_NAME = 'FLIPBOOK PMB 20262027_20251015_153943_0000 '; // perhatikan spasi di akhir

// Buat array nama file otomatis
const images = Array.from({ length: TOTAL_PAGES }, (_, i) => 
  `${BASE_NAME}${i + 1}.png`
);

const leftPage = document.getElementById('leftPage');
const rightPage = document.getElementById('rightPage');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const thumbs = document.getElementById('thumbs');

let index = 0;

function render() {
  if (index < 0) index = 0;
  if (index >= images.length) index = images.length - 2;
  const left = images[index];
  const right = images[index + 1];

  leftPage.innerHTML = left ? `<img src="${IMG_FOLDER + left}" alt="page ${index + 1}">` : '';
  rightPage.innerHTML = right ? `<img src="${IMG_FOLDER + right}" alt="page ${index + 2}">` : '';

  document.querySelectorAll('.thumbnails img').forEach((t, i) => {
    t.classList.toggle('active', i === index || i === index + 1);
  });
}

function next() { index += 2; if (index >= images.length) index = 0; render(); }
function prev() { index -= 2; if (index < 0) index = images.length - 2; render(); }

function buildThumbs() {
  thumbs.innerHTML = '';
  images.forEach((fn, i) => {
    const img = document.createElement('img');
    img.src = IMG_FOLDER + fn;
    img.addEventListener('click', () => { index = (i % 2 === 0 ? i : i - 1); render(); });
    thumbs.appendChild(img);
  });
}

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);

buildThumbs();
render();
