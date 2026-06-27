(function () {
  'use strict';

  /* ── THEME ── */
  let dark = false;

  function toggleTheme() {
    dark = !dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const icon = document.getElementById('toggleIcon');
    if (icon) icon.textContent = dark ? '☾' : '☀';
    localStorage.setItem('gw-theme', dark ? 'dark' : 'light');
  }

  /* Persist saved theme */
  (function () {
    const saved = localStorage.getItem('gw-theme');
    if (saved === 'dark' || saved === 'light') {
      dark = saved === 'dark';
      document.documentElement.setAttribute('data-theme', saved);
      const icon = document.getElementById('toggleIcon');
      if (icon) icon.textContent = dark ? '☾' : '☀';
    }
  })();

  /* Wire theme toggle — works on both nav styles */
  document.querySelectorAll('.theme-toggle, .art-theme-btn').forEach((btn) => {
    btn.addEventListener('click', toggleTheme);
  });

  /* ── NAV ── */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    }, { passive: true });
  }

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
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.remove('visible');
      io.observe(el);
    });
  }

  initReveal();

  /* ── SCRIPTURE ROTATOR ── */
  const verses = [
    { t: '\u201cFor the word of God is alive and active. Sharper than any double-edged sword.\u201d', r: 'Hebrews 4:12' },
    { t: '\u201cYour word is a lamp for my feet, a light on my path.\u201d', r: 'Psalm 119:105' },
    { t: '\u201cIn the beginning was the Word, and the Word was with God, and the Word was God.\u201d', r: 'John 1:1' },
    { t: '\u201cAll Scripture is God-breathed and is useful for teaching, rebuking, correcting and training.\u201d', r: '2 Timothy 3:16' },
    { t: '\u201cDo not merely listen to the word, and so deceive yourselves. Do what it says.\u201d', r: 'James 1:22' },
  ];

  let vi = 0;

  function setVerse(index) {
    const text = document.getElementById('scr-text');
    const reference = document.getElementById('scr-ref');
    if (!text || !reference) return;

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

  /* Wire scripture nav buttons */
  const scrPrev = document.querySelector('.scr-prev');
  const scrNext = document.querySelector('.scr-next');
  if (scrPrev) scrPrev.addEventListener('click', prevScr);
  if (scrNext) scrNext.addEventListener('click', nextScr);

  /* ── SUBSCRIBE ── */
  function subscribe() {
    const input = document.querySelector('.email-input');
    const button = document.querySelector('.sub-btn');
    if (!input || !button) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input.value.trim())) {
      button.textContent = '\u2713 You\u2019re on the list.';
      button.style.opacity = '0.7';
      button.style.cursor = 'default';
      button.disabled = true;
      input.value = '';
      input.placeholder = 'Subscribed!';
    } else {
      input.style.borderColor = '#c0392b';
      input.focus();
      setTimeout(() => { input.style.borderColor = ''; }, 1400);
    }
  }

  /* Wire subscribe button */
  const subBtn = document.querySelector('.sub-btn');
  if (subBtn) subBtn.addEventListener('click', subscribe);

  /* ── TOPIC FILTER ── */
  (function () {
    const allCards = Array.from(document.querySelectorAll('.article-grid .a-card'));
    if (!allCards.length) return;

    function topicOf(card) {
      const el = card.querySelector('.a-tag');
      return el ? el.textContent.trim() : '';
    }

    function buildCounts() {
      const counts = {};
      allCards.forEach((c) => {
        const t = topicOf(c);
        if (t) counts[t] = (counts[t] || 0) + 1;
      });
      return counts;
    }

    function updateBadges(counts) {
      const total = allCards.length;
      document.querySelectorAll('.topic-btn, .filter-chip').forEach((btn) => {
        const badge = btn.querySelector('.t-count');
        if (!badge) return;
        const f = btn.dataset.filter;
        badge.textContent = f === 'all' ? total : (counts[f] || 0);
      });
    }

    function applyFilter(filter) {
      let visible = 0;
      allCards.forEach((card) => {
        const match = filter === 'all' || topicOf(card) === filter;
        card.classList.toggle('filtered-out', !match);
        if (match) visible++;
      });

      document.querySelectorAll('.article-grid').forEach((grid) => {
        const msg = grid.parentElement.querySelector('.no-filter-results');
        if (!msg) return;
        msg.classList.toggle('visible', visible === 0);
      });

      document.querySelectorAll('.topic-btn, .filter-chip').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
    }

    const counts = buildCounts();
    updateBadges(counts);

    document.querySelectorAll('.topic-btn, .filter-chip').forEach((btn) => {
      btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });
  }());

}());