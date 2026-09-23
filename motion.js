/**
 * ==============================================================================
 * RESTRAINED MOTION & RESPONSIVE POLISH SYSTEM
 * Pure Vanilla JavaScript | Zero External Dependencies
 * ==============================================================================
 */

(function () {
  'use strict';

  // Mark document as JS-enabled for progressive enhancement
  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ----------------------------------------------------------------------------
   * 1. TOP SECTION PAGE LOAD ENTRANCE
   * ---------------------------------------------------------------------------- */
  function initEntrance() {
    if (prefersReducedMotion) return;

    // Trigger entrances smoothly after initial layout paint
    requestAnimationFrame(() => {
      document.documentElement.classList.add('is-loaded');
      document.body.classList.add('is-loaded');
    });
  }

  /* ----------------------------------------------------------------------------
   * 2. SCROLL REVEAL (IntersectionObserver)
   * ---------------------------------------------------------------------------- */
  function initReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    const staggerContainers = document.querySelectorAll('[data-reveal-stagger]');

    if (prefersReducedMotion) {
      revealElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    // Apply index-based stagger delays to children of stagger containers
    staggerContainers.forEach(container => {
      const items = container.querySelectorAll(':scope > [data-reveal], :scope > *');
      items.forEach((item, index) => {
        if (!item.hasAttribute('data-reveal')) {
          item.setAttribute('data-reveal', 'up');
        }
        if (!item.hasAttribute('data-delay')) {
          item.style.transitionDelay = `${(index * 0.08).toFixed(2)}s`;
        }
      });
    });

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = entry.target;
            target.classList.add('is-revealed');
            obs.unobserve(target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.05
      }
    );

    document.querySelectorAll('[data-reveal]').forEach(el => {
      const customDelay = el.getAttribute('data-delay');
      const customDuration = el.getAttribute('data-duration');
      if (customDelay) el.style.transitionDelay = `${customDelay}s`;
      if (customDuration) el.style.transitionDuration = `${customDuration}s`;
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------------------------
   * 3. SCROLL-DRIVEN MARQUEE ROWS
   * ---------------------------------------------------------------------------- */
  function initMarquee() {
    const marqueeContainers = document.querySelectorAll('[data-marquee-container]');
    if (!marqueeContainers.length || prefersReducedMotion) return;

    const marquees = [];

    marqueeContainers.forEach(container => {
      const row1 = container.querySelector('[data-marquee-row="1"]');
      const row2 = container.querySelector('[data-marquee-row="2"]');

      [row1, row2].forEach(row => {
        if (row && !row.dataset.cloned) {
          const originalContent = row.innerHTML;
          // Triple content for a seamless loop
          row.innerHTML = originalContent + originalContent + originalContent;
          row.dataset.cloned = 'true';
        }
      });

      marquees.push({ container, row1, row2 });
    });

    let ticking = false;

    function updateMarquees() {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;

      marquees.forEach(({ container, row1, row2 }) => {
        const rect = container.getBoundingClientRect();
        const sectionTop = rect.top + scrollY;

        // Calculate offset based on scroll position relative to container
        const offset = (scrollY - sectionTop + windowH) * 0.3;

        if (row1) {
          row1.style.transform = `translate3d(${(offset - 200).toFixed(1)}px, 0, 0)`;
        }
        if (row2) {
          row2.style.transform = `translate3d(${(-(offset - 200)).toFixed(1)}px, 0, 0)`;
        }
      });

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateMarquees);
          ticking = true;
        }
      },
      { passive: true }
    );

    // Initial positioning
    updateMarquees();
  }

  /* ----------------------------------------------------------------------------
   * 4. SCROLL-PROGRESS TEXT REVEAL (Per-character fluid opacity)
   * ---------------------------------------------------------------------------- */
  function initScrollText() {
    const textElements = document.querySelectorAll('[data-scroll-text]');
    if (!textElements.length) return;

    if (prefersReducedMotion) return;

    const targets = [];

    textElements.forEach(el => {
      const originalText = el.textContent.trim();
      el.setAttribute('aria-label', originalText);

      // Split into words, then characters to prevent unnatural line breaks mid-word
      const words = originalText.split(/\s+/);
      el.innerHTML = '';

      const charSpans = [];

      words.forEach((word, wIdx) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'scroll-text-word';
        wordSpan.setAttribute('aria-hidden', 'true');

        const chars = Array.from(word);
        chars.forEach(char => {
          const charSpan = document.createElement('span');
          charSpan.className = 'scroll-text-char';
          charSpan.textContent = char;
          charSpan.setAttribute('aria-hidden', 'true');
          wordSpan.appendChild(charSpan);
          charSpans.push(charSpan);
        });

        el.appendChild(wordSpan);

        // Add a space between words
        if (wIdx < words.length - 1) {
          const spaceSpan = document.createElement('span');
          spaceSpan.className = 'scroll-text-space';
          spaceSpan.innerHTML = '&nbsp;';
          spaceSpan.setAttribute('aria-hidden', 'true');
          el.appendChild(spaceSpan);
        }
      });

      targets.push({ element: el, charSpans, totalChars: charSpans.length });
    });

    let ticking = false;

    function updateScrollText() {
      const windowH = window.innerHeight;

      targets.forEach(({ element, charSpans, totalChars }) => {
        const rect = element.getBoundingClientRect();
        // Progress runs from when paragraph top reaches 80% of viewport to when bottom reaches 20%
        const start = windowH * 0.8;
        const end = windowH * 0.2;
        const current = rect.top;

        const progress = Math.min(Math.max((start - current) / (start - end), 0), 1);
        const activeCount = Math.floor(progress * totalChars);

        for (let i = 0; i < totalChars; i++) {
          if (i <= activeCount) {
            charSpans[i].style.opacity = '1';
          } else {
            charSpans[i].style.opacity = '0.2';
          }
        }
      });

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(updateScrollText);
          ticking = true;
        }
      },
      { passive: true }
    );

    window.addEventListener('resize', () => requestAnimationFrame(updateScrollText), { passive: true });
    updateScrollText();
  }

  /* ----------------------------------------------------------------------------
   * 5. MAGNETIC HOVER (Fine pointer only)
   * ---------------------------------------------------------------------------- */
  function initMagnet() {
    if (prefersReducedMotion || !isFinePointer) return;

    const magnets = document.querySelectorAll('[data-magnet]');
    if (!magnets.length) return;

    const threshold = 150; // Distance in pixels from edge
    const strength = 3; // Translation divisor

    magnets.forEach(el => {
      let isNear = false;
      let frameId = null;

      function onMouseMove(e) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Compute distance from element edges
        const dxEdge = Math.max(0, Math.abs(deltaX) - rect.width / 2);
        const dyEdge = Math.max(0, Math.abs(deltaY) - rect.height / 2);
        const dist = Math.hypot(dxEdge, dyEdge);

        if (dist < threshold) {
          if (!isNear) {
            isNear = true;
            el.classList.add('is-magnetic-active');
          }
          if (frameId) cancelAnimationFrame(frameId);
          frameId = requestAnimationFrame(() => {
            el.style.transform = `translate3d(${(deltaX / strength).toFixed(1)}px, ${(deltaY / strength).toFixed(1)}px, 0)`;
          });
        } else if (isNear) {
          resetMagnet();
        }
      }

      function resetMagnet() {
        isNear = false;
        el.classList.remove('is-magnetic-active');
        el.classList.add('is-magnetic-returning');
        el.style.transform = 'translate3d(0, 0, 0)';
        setTimeout(() => {
          el.classList.remove('is-magnetic-returning');
        }, 600);
      }

      window.addEventListener('mousemove', onMouseMove, { passive: true });
      el.addEventListener('mouseleave', resetMagnet);
    });
  }

  /* ----------------------------------------------------------------------------
   * 6. STICKY STACKING CARDS
   * ---------------------------------------------------------------------------- */
  function initStackCards() {
    const stackContainers = document.querySelectorAll('[data-card-stack]');
    if (!stackContainers.length || prefersReducedMotion) return;

    stackContainers.forEach(container => {
      const cards = container.querySelectorAll('[data-stack-card]');
      const totalCards = cards.length;
      if (totalCards <= 1) return;

      const isMobile = window.innerWidth < 768;
      const baseTop = isMobile ? 96 : 128;
      const offsetPerCard = 28;

      cards.forEach((card, index) => {
        card.style.top = `${baseTop + index * offsetPerCard}px`;
      });

      let ticking = false;

      function updateCardScales() {
        cards.forEach((card, index) => {
          if (index === totalCards - 1) return; // Last card stays scale 1.0

          const nextCard = cards[index + 1];
          const nextRect = nextCard.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();

          // How much the next card overlaps this card
          const targetScale = 1 - (totalCards - 1 - index) * 0.03;
          const overlap = Math.max(0, cardRect.bottom - nextRect.top);
          const maxOverlap = cardRect.height || 400;
          const progress = Math.min(overlap / maxOverlap, 1);

          const currentScale = 1 - (1 - targetScale) * progress;
          card.style.transform = `scale(${currentScale.toFixed(4)})`;
        });

        ticking = false;
      }

      window.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            requestAnimationFrame(updateCardScales);
            ticking = true;
          }
        },
        { passive: true }
      );

      updateCardScales();
    });
  }

  /* ----------------------------------------------------------------------------
   * 7. HERO TEXT HOVER & POINTER RESPONSIVENESS
   * ---------------------------------------------------------------------------- */
  function initHeroHoverMotion() {
    if (prefersReducedMotion || !isFinePointer) return;

    const heroHeadings = document.querySelectorAll('[data-hero-motion]');
    if (!heroHeadings.length) return;

    heroHeadings.forEach(heading => {
      const childNodes = Array.from(heading.childNodes);
      childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          const words = node.textContent.split(/(\s+)/);
          const fragment = document.createDocumentFragment();
          words.forEach(w => {
            if (/^\s+$/.test(w)) {
              fragment.appendChild(document.createTextNode(w));
            } else if (w.length) {
              const span = document.createElement('span');
              span.className = 'hero-word-hover';
              span.textContent = w;
              fragment.appendChild(span);
            }
          });
          heading.replaceChild(fragment, node);
        }
      });
    });
  }

  /* ----------------------------------------------------------------------------
   * DOM READY INITIALIZATION
   * ---------------------------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initEntrance();
    initReveal();
    initMarquee();
    initScrollText();
    initMagnet();
    initStackCards();
    initHeroHoverMotion();
  });
})();

