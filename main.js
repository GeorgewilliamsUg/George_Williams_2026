/* ============================================================
   George — Editorial Publication Scripts
   Accessible Navigation | Instant Search & Filtering | Restrained Motion
   ============================================================ */

/* ---------- Mobile Navigation Drawer ---------- */
function openMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const trigger = document.getElementById('mobile-nav-trigger');
  if (!nav) return;
  nav.classList.add('open');
  if (trigger) trigger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', _escCloseMobileNav);
}

function closeMobileNav() {
  const nav = document.getElementById('mobile-nav');
  const trigger = document.getElementById('mobile-nav-trigger');
  if (!nav) return;
  nav.classList.remove('open');
  if (trigger) trigger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _escCloseMobileNav);
}

function _escCloseMobileNav(e) {
  if (e.key === 'Escape') closeMobileNav();
}

/* ---------- Copy Article Link Helper ---------- */
function copyArticleLink() {
  if (!navigator.clipboard) return;
  navigator.clipboard.writeText(window.location.href).then(() => {
    const btn = document.getElementById('copy-link-btn');
    const txt = document.getElementById('copy-link-text');
    if (btn) {
      btn.classList.add('copied');
      if (txt) txt.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        if (txt) txt.textContent = 'Copy link';
      }, 2000);
    }
  }).catch(() => {});
}

/* ---------- Smooth Scroll to Top Helper ---------- */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- DOM Initialization ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Header Scroll Shadow & Blur ---- */
  const header = document.querySelector('header');
  if (header) {
    const updateHeader = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  /* ---- Auto-close Mobile Nav on Desktop Breakpoint ---- */
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMobileNav();
    }
  }, { passive: true });

  /* ---- Reading Progress Bar ---- */
  const progressBar = document.getElementById('reading-progress');
  if (progressBar) {
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
  }

  /* ---- Floating Back to Top Button ---- */
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    const toggleBackToTop = () => {
      backToTopBtn.classList.toggle('is-visible', window.scrollY > 500);
    };
    toggleBackToTop();
    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    backToTopBtn.addEventListener('click', scrollToTop);
  }

  /* ---- Universal Newsletter Form Submissions ---- */
  document.querySelectorAll('form[aria-label="Newsletter signup"], form.newsletter-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const emailInput = form.querySelector('input[type="email"]');
      const messageEl = form.querySelector('p[id^="form-msg"], p[id^="form-message"], .form-message');

      if (emailInput && emailInput.validity.valid) {
        if (messageEl) {
          messageEl.textContent = "You're on the list. The Sunday letter will arrive in your inbox.";
          messageEl.style.color = 'var(--color-ink-primary)';
          messageEl.style.fontWeight = '600';
        }
        emailInput.value = '';
      }
    });
  });

  /* ---- Combined Live Search & Topic Filter on Archive (articles.html) ---- */
  const searchInput = document.getElementById('search-articles');
  const searchClearBtn = document.getElementById('search-clear');
  const filterChips = document.querySelectorAll('.filter-chip[data-filter]');
  const articleCards = document.querySelectorAll('.archive-card, .article-row, .article-row-item');
  const countEl = document.getElementById('count-num');
  const emptyState = document.getElementById('empty-state');

  if (articleCards.length) {
    let currentTopic = 'all';
    let currentQuery = '';

    const applyFilters = () => {
      let visibleCount = 0;

      articleCards.forEach((card) => {
        const cardTopic = (card.dataset.topic || '').toLowerCase();
        const textContent = (card.textContent || '').toLowerCase();

        const matchesTopic = currentTopic === 'all' || cardTopic === currentTopic;
        const matchesQuery = !currentQuery || textContent.includes(currentQuery);

        const isVisible = matchesTopic && matchesQuery;
        card.classList.toggle('hidden-card', !isVisible);
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) visibleCount++;
      });

      if (countEl) countEl.textContent = visibleCount;
      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
      }
    };

    // Filter chip click handler
    filterChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        filterChips.forEach((c) => {
          c.classList.remove('active');
          c.setAttribute('aria-selected', 'false');
        });
        chip.classList.add('active');
        chip.setAttribute('aria-selected', 'true');
        currentTopic = chip.dataset.filter;
        applyFilters();
      });
    });

    // Real-time search input handler
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentQuery = (e.target.value || '').trim().toLowerCase();
        if (searchClearBtn) {
          searchClearBtn.classList.toggle('is-active', currentQuery.length > 0);
        }
        applyFilters();
      });

      if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
          searchInput.value = '';
          currentQuery = '';
          searchClearBtn.classList.remove('is-active');
          searchInput.focus();
          applyFilters();
        });
      }
    }
  }

  /* ---- Restrained Motion: Single Hero Entrance Only ---- */
  if (!prefersReducedMotion && window.gsap) {
    const heroTitle = document.querySelector('h1');
    if (heroTitle) {
      gsap.from(heroTitle, {
        opacity: 0,
        y: 16,
        duration: 0.65,
        ease: 'power2.out'
      });
    }
  }
});
