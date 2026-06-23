/* ── THEME ── */
let dark = false;

function toggleTheme() {
  dark = !dark;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  document.getElementById('toggleIcon').textContent = dark ? '☾' : '☀';
  localStorage.setItem('gw-theme', dark ? 'dark' : 'light');
}

/* Persist */
(function() {
  const saved = localStorage.getItem('gw-theme');
  if (saved === 'dark') {
    dark = true;
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('toggleIcon').textContent = '☾';
  }
})();

/* ── NAV ── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

/* ── PARALLAX ── */
const pw1 = document.getElementById('pw1');
const pw2 = document.getElementById('pw2');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (pw1) pw1.style.transform = `translateY(${y * 0.22}px)`;
  if (pw2) pw2.style.transform = `translateY(${-y * 0.14}px)`;
}, { passive: true });

/* ── SCROLL REVEAL ── */
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

function initReveal() {
  document.querySelectorAll('.reveal').forEach((element) => {
    element.classList.remove('visible');
    io.observe(element);
  });
}

initReveal();

/* ── PAGE NAV ── */
function show(id) {
  document.querySelectorAll('.page').forEach((page) => {
    page.classList.remove('active');
    page.style.opacity = '0';
  });

  const page = document.getElementById(id);
  page.classList.add('active');
  page.style.opacity = '0';

  window.scrollTo({ top: 0, behavior: 'instant' });

  requestAnimationFrame(() => {
    page.style.transition = 'opacity 0.45s cubic-bezier(0.4,0,0.2,1)';
    page.style.opacity = '1';
    setTimeout(initReveal, 60);
  });
}

function gotoArticles() {
  show('home');
  setTimeout(() => {
    document.getElementById('articles-top').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 500);
}

/* ── SCRIPTURE ROTATOR ── */
const verses = [
  { t: '"For the word of God is alive and active. Sharper than any double-edged sword."', r: 'Hebrews 4:12' },
  { t: '"Your word is a lamp for my feet, a light on my path."', r: 'Psalm 119:105' },
  { t: '"In the beginning was the Word, and the Word was with God, and the Word was God."', r: 'John 1:1' },
  { t: '"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training."', r: '2 Timothy 3:16' },
  { t: '"Do not merely listen to the word, and so deceive yourselves. Do what it says."', r: 'James 1:22' },
];

let vi = 0;

function setVerse(index) {
  const text = document.getElementById('scr-text');
  const reference = document.getElementById('scr-ref');

  text.style.opacity = '0';
  reference.style.opacity = '0';

  setTimeout(() => {
    text.textContent = verses[index].t;
    reference.textContent = verses[index].r;
    text.style.transition = 'opacity 0.4s';
    reference.style.transition = 'opacity 0.4s';
    text.style.opacity = '1';
    reference.style.opacity = '1';
  }, 280);
}

function nextScr() {
  vi = (vi + 1) % verses.length;
  setVerse(vi);
}

function prevScr() {
  vi = (vi - 1 + verses.length) % verses.length;
  setVerse(vi);
}

/* ── SUBSCRIBE ── */
function subscribe() {
  const input = document.querySelector('.email-input');
  const button = document.querySelector('.sub-btn');

  if (input.value.includes('@')) {
    button.textContent = '✓ See you Monday.';
    button.style.opacity = '0.7';
    button.style.cursor = 'default';
    input.value = '';
    input.placeholder = 'Subscribed!';
  } else {
    input.style.borderColor = '#c0392b';
    input.focus();
    setTimeout(() => {
      input.style.borderColor = '';
    }, 1400);
  }
}