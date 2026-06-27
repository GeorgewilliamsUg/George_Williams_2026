// ── Progress bar ────────────────────────────
const bar = document.getElementById('progress-bar');
if (bar) {
  window.addEventListener('scroll', () => {
    const d = document.documentElement;
    if (d.scrollHeight > d.clientHeight) {
      bar.style.width = ((d.scrollTop / (d.scrollHeight - d.clientHeight)) * 100) + '%';
    } else {
      bar.style.width = '0%';
    }
  }, { passive: true });
}

// ── Quote rotator ────────────────────────────
(function () {
  const quotes = document.querySelectorAll('.quote-text');
  const dots   = document.querySelectorAll('.q-dot');
  if (!quotes.length || !dots.length) return;

  let current = 0;
  let timer;

  function showQuote(idx) {
    quotes[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = idx;
    quotes[current].classList.add('active');
    dots[current].classList.add('active');
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      showQuote(parseInt(dot.dataset.dot, 10));
      timer = setInterval(() => showQuote((current + 1) % quotes.length), 5000);
    });
  });

  timer = setInterval(() => showQuote((current + 1) % quotes.length), 5000);
}());

// ── Copy link ────────────────────────────────
const copyBtn = document.getElementById('copy-btn');
if (copyBtn) {
  copyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href).then(() => {
      const old = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = old; }, 1800);
    });
  });
}

const popup = document.getElementById('verse-popup');
const vpRef = document.getElementById('vp-ref');
const vpText = document.getElementById('vp-text');
const vpVersion = document.getElementById('vp-version');

if (popup && vpRef && vpText && vpVersion) {
  let hideTimer = null;

  function showPopup(el) {
    if (hideTimer) {
      clearTimeout(hideTimer);
    }

    vpRef.textContent = el.dataset.ref || '';
    vpText.textContent = el.dataset.text || '';
    vpVersion.textContent = el.dataset.version || 'ESV';

    const rect = el.getBoundingClientRect();
    const popupWidth = 320;
    const gap = 10;
    const scrollY = window.scrollY;

    let left = rect.left + window.scrollX;
    if (left + popupWidth > window.innerWidth - 12) {
      left = window.innerWidth - popupWidth - 12;
    }
    if (left < 8) {
      left = 8;
    }

    const estimatedHeight = 120;
    let top;
    if (rect.top > estimatedHeight + gap) {
      top = rect.top + scrollY - estimatedHeight - gap;
    } else {
      top = rect.bottom + scrollY + gap;
    }

    popup.style.left = left + 'px';
    popup.style.top = top + 'px';
    popup.classList.add('visible');
  }

  function hidePopup() {
    hideTimer = setTimeout(() => {
      popup.classList.remove('visible');
    }, 120);
  }

  document.querySelectorAll('.bible-ref').forEach((ref) => {
    ref.addEventListener('mouseenter', () => showPopup(ref));
    ref.addEventListener('mouseleave', hidePopup);
    ref.addEventListener('focus', () => showPopup(ref));
    ref.addEventListener('blur', hidePopup);
  });
}

// ── Share buttons ────────────────────────────
(function () {
  const platforms = {
    facebook: () => 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(location.href),
    twitter:  () => 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(location.href) + '&text=' + encodeURIComponent(document.title),
    whatsapp: () => 'https://wa.me/?text=' + encodeURIComponent(document.title + ' ' + location.href),
  };

  document.querySelectorAll('.share-btn[data-platform]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const builder = platforms[btn.dataset.platform];
      if (builder) window.open(builder(), '_blank', 'noopener,noreferrer');
    });
  });
}());
