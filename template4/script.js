/* =============================================
   GrandLux Hotel — script.js
   Senior Front-End, Luxury Hospitality
   ============================================= */

'use strict';

/* ─── Helpers ─── */
const isMobile = () => window.innerWidth <= 900;
const isTouch  = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ─── DOM References ─── */
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('hamburger');
const navMenu     = document.getElementById('navMenu');
const navLinks    = navMenu ? navMenu.querySelectorAll('.navbar__link') : [];
const contactForm = document.getElementById('contactForm');

/* ─────────────────────────────────────────────
   1. NAVBAR — Scroll Behaviour & Mobile Menu
   ───────────────────────────────────────────── */

const SCROLL_THRESHOLD = 60;

function updateNavbar() {
  if (window.scrollY > SCROLL_THRESHOLD) {
    navbar.classList.add('is-scrolled');
  } else {
    navbar.classList.remove('is-scrolled');
  }
}

updateNavbar();
window.addEventListener('scroll', updateNavbar, { passive: true });

// Mobile hamburger toggle
if (hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

// Close mobile nav when a link is clicked
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Close mobile nav on outside click
document.addEventListener('click', (e) => {
  if (
    navMenu &&
    navMenu.classList.contains('is-open') &&
    !navMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    navMenu.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// Close mobile nav on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) {
    navMenu.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

// Inject "Book Now" CTA inside mobile menu (missing in original)
(function injectMobileBookBtn() {
  if (!navMenu) return;

  const existingMobileBtn = navMenu.querySelector('.navbar__mobile-cta');
  if (existingMobileBtn) return; // already injected

  const mobileBtn = document.createElement('a');
  mobileBtn.href = '#contact';
  mobileBtn.className = 'btn btn--gold navbar__mobile-cta';
  mobileBtn.textContent = 'Book Now';
  mobileBtn.style.cssText = 'display:none; margin-top:8px;';

  navMenu.appendChild(mobileBtn);

  // Show only when menu is open (mobile)
  const mo = new MutationObserver(() => {
    mobileBtn.style.display = navMenu.classList.contains('is-open') ? 'inline-flex' : 'none';
  });
  mo.observe(navMenu, { attributes: true, attributeFilter: ['class'] });
})();

/* ─────────────────────────────────────────────
   2. SMOOTH SCROLL — Native with offset
   ───────────────────────────────────────────── */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();

    const navbarH   = navbar ? navbar.offsetHeight : 0;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarH;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

/* ─────────────────────────────────────────────
   3. INTERSECTION OBSERVER — Reveal on Scroll
   ───────────────────────────────────────────── */

const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.08,            // lower threshold → more forgiving on small screens
      rootMargin: '0px 0px -32px 0px',
    }
  );

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ─────────────────────────────────────────────
   4. TESTIMONIALS CAROUSEL
   ───────────────────────────────────────────── */

(function initCarousel() {
  const track   = document.getElementById('testimonialsTrack');
  const dotsEl  = document.getElementById('testimonialsDots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (!track) return;

  const cards  = Array.from(track.querySelectorAll('.testimonial-card'));
  const total  = cards.length;
  let current  = 0;
  let autoTimer;

  // Build dots
  if (dotsEl) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonials__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  function updateDots() {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.testimonials__dot').forEach((dot, i) => {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    updateDots();
    resetAuto();
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);

  // Auto-advance
  function startAuto() {
    autoTimer = setInterval(next, 5500);
  }

  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  startAuto();

  // Pause on hover (desktop only)
  const carousel = track.closest('.testimonials__carousel');
  if (carousel && !isTouch()) {
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', startAuto);
  }

  // Swipe support — lower delta threshold for mobile fingers
  let touchStartX = 0;
  let touchStartY = 0;

  track.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const deltaY = e.changedTouches[0].clientY - touchStartY;

    // Only treat as horizontal swipe if horizontal delta dominates
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      deltaX < 0 ? next() : prev();
    }
  }, { passive: true });
})();

/* ─────────────────────────────────────────────
   5. ACTIVE NAV LINK — Highlight on Scroll
      (debounced for mobile performance)
   ───────────────────────────────────────────── */

(function initActiveLink() {
  const sections = document.querySelectorAll('section[id], div[id]');
  if (!sections.length || !navLinks.length) return;

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollMid = window.scrollY + window.innerHeight / 3;

      sections.forEach(section => {
        const top    = section.offsetTop;
        const bottom = top + section.offsetHeight;
        const id     = section.getAttribute('id');

        if (scrollMid >= top && scrollMid < bottom) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.style.color = href === `#${id}` ? 'var(--color-gold)' : '';
          });
        }
      });

      ticking = false;
    });
    ticking = true;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();

/* ─────────────────────────────────────────────
   6. CONTACT FORM — Submission Handler
   ───────────────────────────────────────────── */

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const btn      = contactForm.querySelector('[type="submit"]');
    const original = btn.textContent;

    btn.textContent = 'Sending…';
    btn.disabled    = true;
    btn.style.opacity = '0.7';

    setTimeout(() => {
      btn.textContent   = '✓ Enquiry Sent!';
      btn.style.opacity = '1';

      setTimeout(() => {
        btn.textContent = original;
        btn.disabled    = false;
        contactForm.reset();
      }, 3000);
    }, 1400);
  });
}

/* ─────────────────────────────────────────────
   7. DATE INPUTS — Set min to today
      (iOS Safari fix: avoid invalid date on input[type=date])
   ───────────────────────────────────────────── */

(function setDateConstraints() {
  // Pad numbers to 2 digits — avoids iOS Safari date parsing issues
  function toDateString(d) {
    const y  = d.getFullYear();
    const m  = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dy}`;
  }

  const today    = toDateString(new Date());
  const checkin  = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');

  if (checkin)  checkin.setAttribute('min', today);
  if (checkout) checkout.setAttribute('min', today);

  if (checkin && checkout) {
    checkin.addEventListener('change', () => {
      if (!checkin.value) return;
      const nextDay = new Date(checkin.value + 'T00:00:00'); // force local time parse
      nextDay.setDate(nextDay.getDate() + 1);
      const nextStr = toDateString(nextDay);
      checkout.setAttribute('min', nextStr);
      if (checkout.value && checkout.value <= checkin.value) {
        checkout.value = nextStr;
      }
    });
  }
})();

/* ─────────────────────────────────────────────
   8. GALLERY — Lightbox Effect
   ───────────────────────────────────────────── */

(function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll('.gallery__item');
  if (!galleryItems.length) return;

  const overlay = document.createElement('div');
  overlay.id = 'galleryOverlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Image viewer');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    background: 'rgba(11,31,58,0.95)',
    zIndex: '9000',
    display: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'zoom-out',
    padding: '24px',
    // Improve mobile: prevent text select during swipe
    userSelect: 'none',
    WebkitUserSelect: 'none',
  });

  const lightboxImg = document.createElement('img');
  Object.assign(lightboxImg.style, {
    maxWidth: '92vw',
    maxHeight: '88vh',
    objectFit: 'contain',
    borderRadius: '8px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
    animation: 'fadeIn 0.25s ease',
    // Prevent double-tap zoom on iOS from zooming the lightbox image
    touchAction: 'manipulation',
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Close image viewer');
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '16px',
    right: '20px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '1rem',
    cursor: 'pointer',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure large enough tap target on mobile
    minWidth: '44px',
    minHeight: '44px',
  });

  overlay.appendChild(lightboxImg);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  function openLightbox(src, alt) {
    lightboxImg.src          = src;
    lightboxImg.alt          = alt || '';
    overlay.style.display    = 'flex';
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    overlay.style.display        = 'none';
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) openLightbox(img.src, img.alt);
    });
    item.style.cursor = 'zoom-in';
  });

  overlay.addEventListener('click', closeLightbox);
  closeBtn.addEventListener('click', (e) => { e.stopPropagation(); closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
})();

/* ─────────────────────────────────────────────
   9. HERO PARALLAX — Disabled on mobile/touch
      (prevents overflow and janky scroll on small screens)
   ───────────────────────────────────────────── */

(function initParallax() {
  const heroImg = document.querySelector('.hero__img');
  if (!heroImg) return;

  // Skip parallax entirely on touch devices & small screens
  if (isTouch() || isMobile()) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroImg.style.transform = `scale(1) translateY(${scrollY * 0.22}px)`;
      }
      ticking = false;
    });
    ticking = true;
  }, { passive: true });

  // Also disable if user resizes to mobile mid-session
  window.addEventListener('resize', () => {
    if (isMobile() || isTouch()) {
      heroImg.style.transform = '';
    }
  }, { passive: true });
})();

/* ─────────────────────────────────────────────
   10. COUNTER ANIMATION — Hero Stats
   ───────────────────────────────────────────── */

(function initCounters() {
  const stats = document.querySelectorAll('.hero__stat-num');
  if (!stats.length) return;

  const targets = [25, 120, 4.9];

  function animateCounter(el, target, isDecimal) {
    const duration = 1800;
    const start    = performance.now();

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;

      el.textContent = isDecimal
        ? current.toFixed(1) + '★'
        : Math.floor(current) + '+';

      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stats.forEach((el, i) => {
            const isDecimal = targets[i] % 1 !== 0;
            animateCounter(el, targets[i], isDecimal);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsEl = document.querySelector('.hero__stats');
  if (statsEl) observer.observe(statsEl);
})();

/* ─────────────────────────────────────────────
   11. HERO STATS — Scroll snap on mobile
       (makes swiping between stats feel native)
   ───────────────────────────────────────────── */

(function initStatsScrollSnap() {
  const statsEl = document.querySelector('.hero__stats');
  if (!statsEl) return;

  function applySnap() {
    if (window.innerWidth <= 640) {
      statsEl.style.scrollSnapType    = 'x mandatory';
      statsEl.style.webkitOverflowScrolling = 'touch';
      statsEl.querySelectorAll('.hero__stat').forEach(stat => {
        stat.style.scrollSnapAlign = 'center';
        stat.style.flexShrink = '0';
      });
    } else {
      statsEl.style.scrollSnapType = '';
      statsEl.querySelectorAll('.hero__stat').forEach(stat => {
        stat.style.scrollSnapAlign = '';
        stat.style.flexShrink = '';
      });
    }
  }

  applySnap();
  window.addEventListener('resize', applySnap, { passive: true });
})();
