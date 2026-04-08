/**
 * SavoryBite Fine Dining — script.js
 * Author  : Senior Front-End Developer
 * Version : 1.1.0 — Mobile Responsive Fix
 */

'use strict';

/* ============================================================
   HELPERS
   ============================================================ */
const isTouchDevice = () =>
  window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

const isMobileWidth = () => window.innerWidth <= 900;


/* ============================================================
   1. DOM READY
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initHero();
  initScrollReveal();
  initMenuFilter();
  initSmoothScroll();
  initScrollProgress();
});


/* ============================================================
   2. NAVBAR — scroll state & transparency
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 60;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}


/* ============================================================
   3. MOBILE MENU — hamburger toggle
   ============================================================ */
function initMobileMenu() {
  const toggle  = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (!toggle || !navMenu) return;

  const open = () => {
    toggle.classList.add('open');
    navMenu.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    toggle.classList.remove('open');
    navMenu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    toggle.classList.contains('open') ? close() : open();
  });

  // Close on nav link click
  navMenu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggle.contains(e.target)) close();
  });

  // Close on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // Inject "Reserve" CTA into mobile menu (hidden via CSS on desktop)
  injectMobileCTA(navMenu, close);
}

/**
 * Adds a Reserve button inside the mobile nav overlay.
 * CSS hides .navbar__cta at <=900px — this provides a tap-friendly
 * alternative directly in the slide-down panel.
 */
function injectMobileCTA(navMenu, closeMenu) {
  if (navMenu.querySelector('.navbar__mobile-cta')) return;

  const cta = document.createElement('a');
  cta.href        = '#reservations';
  cta.className   = 'btn btn--warm navbar__mobile-cta';
  cta.textContent = 'Reserve a Table';
  cta.style.cssText = 'display:none; margin-top:0.5rem;';

  navMenu.appendChild(cta);
  cta.addEventListener('click', closeMenu);

  // Show / hide in sync with the menu open state
  const mo = new MutationObserver(() => {
    cta.style.display = navMenu.classList.contains('open') ? 'inline-flex' : 'none';
  });
  mo.observe(navMenu, { attributes: true, attributeFilter: ['class'] });
}


/* ============================================================
   4. HERO — background reveal & mobile parallax fix
   ============================================================ */
function initHero() {
  const heroBg = document.querySelector('.hero__bg');
  if (heroBg) {
    requestAnimationFrame(() => {
      setTimeout(() => heroBg.classList.add('loaded'), 100);
    });
    fixHeroParallaxOnMobile(heroBg);
  }

  const heroContent = document.querySelector('.reveal-hero');
  if (heroContent) {
    setTimeout(() => heroContent.classList.add('visible'), 200);
  }
}

/**
 * background-attachment:fixed causes severe scroll jank and visual glitches
 * on iOS Safari and most Android browsers. Switch to 'scroll' on those devices.
 */
function fixHeroParallaxOnMobile(heroBg) {
  const isSafariOrMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    || isTouchDevice();

  if (isSafariOrMobile) {
    heroBg.style.backgroundAttachment = 'scroll';
  }

  window.addEventListener('resize', () => {
    if (isMobileWidth()) heroBg.style.backgroundAttachment = 'scroll';
  }, { passive: true });
}


/* ============================================================
   5. SCROLL REVEAL — Intersection Observer
   ============================================================ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      // Smaller rootMargin on mobile — -80px can hide elements on short viewports
      rootMargin: isMobileWidth() ? '0px 0px -32px 0px' : '0px 0px -80px 0px',
      threshold: 0.08,
    }
  );

  elements.forEach((el) => observer.observe(el));
}


/* ============================================================
   6. MENU FILTER — category tabs
   ============================================================ */
function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards  = document.querySelectorAll('.menu-card');
  if (!filterBtns.length || !menuCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Scroll selected tab into view on mobile (horizontal overflow scenario)
      if (isMobileWidth()) {
        btn.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
      }

      menuCards.forEach((card) => {
        const show = filter === 'all' || card.dataset.category === filter;

        if (show) {
          card.classList.remove('hidden');
          card.style.opacity   = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
              card.style.opacity    = '1';
              card.style.transform  = 'translateY(0)';
            });
          });
        } else {
          card.classList.add('hidden');
          card.style.opacity   = '';
          card.style.transform = '';
          card.style.transition = '';
        }
      });
    });
  });
}


/* ============================================================
   7. SMOOTH SCROLL — anchor links with offset
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Use actual navbar height rather than CSS var (more accurate on resize)
      const navbar = document.getElementById('navbar');
      const navH   = navbar
        ? navbar.offsetHeight
        : (parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--nav-h'), 10) || 80);

      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}


/* ============================================================
   8. SCROLL PROGRESS — rAF-throttled for mobile performance
   ============================================================ */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.id = 'scroll-progress';

  Object.assign(bar.style, {
    position:      'fixed',
    top:           '0',
    left:          '0',
    width:         '0%',
    height:        '2.5px',
    background:    'linear-gradient(90deg, #c4621a, #e8b84b)',
    zIndex:        '9999',
    transition:    'width 0.1s linear',
    pointerEvents: 'none',
  });

  document.body.prepend(bar);

  let ticking = false;

  const updateProgress = () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress  = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      bar.style.width = `${Math.min(progress, 100)}%`;
      ticking = false;
    });
    ticking = true;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
}


/* ============================================================
   9. ACTIVE NAV LINK — highlight current section
   ============================================================ */
(() => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'var(--clr-white)'
              : '';
          });
        }
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
})();


/* ============================================================
   10. PARALLAX — hero text drift (desktop / pointer:fine only)
   ============================================================ */
(() => {
  const heroContent = document.querySelector('.hero__content');
  if (!heroContent) return;

  // On touch/mobile: translateY + opacity fade makes hero content
  // disappear while scrolling — skip entirely.
  if (isTouchDevice() || isMobileWidth()) return;

  let ticking = false;
  const vh    = window.innerHeight;

  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY < vh) {
          heroContent.style.transform = `translateY(${scrollY * 0.22}px)`;
          heroContent.style.opacity   = `${Math.max(0, 1 - scrollY / 700)}`;
        }
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });

  // Gracefully remove parallax if user resizes to mobile mid-session
  window.addEventListener('resize', () => {
    if (isMobileWidth() || isTouchDevice()) {
      window.removeEventListener('scroll', onScroll);
      heroContent.style.transform = '';
      heroContent.style.opacity   = '';
    }
  }, { passive: true });
})();


/* ============================================================
   11. HOVER TILT — chef cards (pointer:fine / desktop only)
   ============================================================ */
(() => {
  const cards = document.querySelectorAll('.chef-card');
  if (!cards.length) return;

  // Tilt interferes with tap / scroll on touch devices — skip entirely
  if (isTouchDevice()) return;

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const dx   = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      const dy   = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);

      card.style.transition = 'transform 0.05s linear, box-shadow 0.4s';
      card.style.transform  =
        `perspective(800px) rotateX(${dy * -5}deg) rotateY(${dx * 5}deg) translateY(-10px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s';
      card.style.transform  = '';
    });
  });
})();


/* ============================================================
   12. FOOTER NEWSLETTER — validation with Enter key support
   ============================================================ */
(() => {
  const form  = document.querySelector('.footer__form');
  const input = document.querySelector('.footer__input');
  const btn   = form?.querySelector('.btn');
  if (!form || !input || !btn) return;

  // Inject shake keyframes once
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25%       { transform: translateX(-6px); }
      75%       { transform: translateX(6px); }
    }
  `;
  document.head.appendChild(style);

  const submit = () => {
    const email = input.value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      input.style.borderColor = '#e03030';
      input.style.animation   = 'shake 0.35s ease';
      setTimeout(() => {
        input.style.borderColor = '';
        input.style.animation   = '';
      }, 1000);
      return;
    }

    btn.textContent         = '✓ Done!';
    btn.style.background    = 'var(--clr-gold)';
    btn.style.pointerEvents = 'none';
    input.value             = '';

    setTimeout(() => {
      btn.textContent         = 'Subscribe';
      btn.style.background    = '';
      btn.style.pointerEvents = '';
    }, 3000);
  };

  btn.addEventListener('click', submit);

  // Mobile keyboard "Go" / "Enter" key support
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  });
})();


/* ============================================================
   13. LAZY IMAGE LOAD — fade-in on load
   ============================================================ */
(() => {
  const imgs = document.querySelectorAll('img[loading="lazy"]');
  imgs.forEach((img) => {
    img.style.opacity    = '0';
    img.style.transition = 'opacity 0.5s ease';

    const show = () => { img.style.opacity = '1'; };

    if (img.complete && img.naturalWidth > 0) {
      show();
    } else {
      img.addEventListener('load', show);
      // Broken images shouldn't stay invisible forever
      img.addEventListener('error', show);
    }
  });
})();
