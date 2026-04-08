/* ═══════════════════════════════════════════════════════════
   SMARTQUEUE · script.js
   ═══════════════════════════════════════════════════════════ */

'use strict';

/* ─── NAVBAR: scroll state ─── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  let lastScroll = 0;

  const onScroll = () => {
    const scrollY = window.scrollY;

    if (scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = scrollY;
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on init
})();


/* ─── MOBILE MENU: hamburger toggle ─── */
(function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('nav-menu');
  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', isOpen);

    // Animate hamburger → X
    const spans = hamburger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on nav link click
  navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ─── SMOOTH SCROLL: anchor links ─── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();

      const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
})();


/* ─── SCROLL REVEAL: Intersection Observer ─── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    }
  );

  elements.forEach(el => observer.observe(el));
})();


/* ─── FAQ: accordion ─── */
(function initFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer   = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all other items
      faqItems.forEach(otherItem => {
        const otherQ = otherItem.querySelector('.faq-question');
        const otherA = otherItem.querySelector('.faq-answer');
        if (otherQ && otherA && otherItem !== item) {
          otherQ.setAttribute('aria-expanded', 'false');
          otherA.classList.remove('open');
        }
      });

      // Toggle current
      const newState = !isOpen;
      question.setAttribute('aria-expanded', newState);
      if (newState) {
        answer.classList.add('open');
      } else {
        answer.classList.remove('open');
      }
    });
  });
})();


/* ─── PRICING: monthly / yearly toggle ─── */
(function initPricingToggle() {
  const toggleBtn   = document.getElementById('pricing-toggle');
  const priceAmounts = document.querySelectorAll('.price-amount[data-monthly]');
  if (!toggleBtn || !priceAmounts.length) return;

  let isYearly = false;

  const updatePrices = () => {
    priceAmounts.forEach(el => {
      const monthly = el.getAttribute('data-monthly');
      const yearly  = el.getAttribute('data-yearly');
      const target  = isYearly ? yearly : monthly;

      // Animate number change
      animateNumber(el, parseInt(el.textContent.replace(/\D/g, '')) || 0, parseInt(target), 400);
    });
  };

  const animateNumber = (el, from, to, duration) => {
    const start = performance.now();
    const update = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = '$' + Math.round(from + (to - from) * eased);
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  };

  toggleBtn.addEventListener('click', () => {
    isYearly = !isYearly;
    toggleBtn.classList.toggle('active', isYearly);
    toggleBtn.setAttribute('aria-checked', isYearly);
    updatePrices();
  });
})();


/* ─── HERO: staggered fade-in on load ─── */
(function initHeroReveal() {
  // Already handled by CSS reveal classes + IntersectionObserver
  // Force-trigger hero elements immediately on load
  const heroReveals = document.querySelectorAll('.hero .reveal');
  heroReveals.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 100 + i * 180);
  });
})();


/* ─── FEATURE CARDS: magnetic hover effect ─── */
(function initMagneticCards() {
  const cards = document.querySelectorAll('.feature-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left - rect.width  / 2;
      const y      = e.clientY - rect.top  - rect.height / 2;
      const tiltX  = (y / rect.height) * 4;
      const tiltY  = -(x / rect.width)  * 4;

      card.style.transform = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ─── COUNTER: animated stats in trusted section ─── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.getAttribute('data-count'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      let start    = 0;
      const duration = 1800;
      const startTime = performance.now();

      const update = (now) => {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 4);
        el.textContent = Math.floor(start + (target - start) * eased).toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(update);
      };

      requestAnimationFrame(update);
      observer.unobserve(el);
    });
  }, { threshold: 0.6 });

  counters.forEach(el => observer.observe(el));
})();


/* ─── NAVBAR: active link highlight based on scroll position ─── */
(function initActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(section => observer.observe(section));
})();


/* ─── BACK TO TOP: keyboard shortcut ─── */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});


/* ─── UTILITY: debounce ─── */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}


/* ─── PERFORMANCE: lazy initialize non-critical effects on idle ─── */
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // Could lazy-load additional analytics or widgets here
    console.log('%cSmartQueue · Built with care ✦', 'color:#6366f1;font-weight:700;font-size:14px;');
  });
} else {
  setTimeout(() => {
    console.log('%cSmartQueue · Built with care ✦', 'color:#6366f1;font-weight:700;font-size:14px;');
  }, 2000);
}
