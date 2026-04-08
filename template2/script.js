/* =====================================================
   MedicaCare – script.js
   Modern Hospital Landing Page
   ===================================================== */

'use strict';

/* ── 1. Navbar: Scroll Effect & Mobile Toggle ── */
(function initNavbar() {
  const navbar   = document.getElementById('navbar');
  const toggle   = document.getElementById('navToggle');
  const navMenu  = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.navbar__link');

  function handleScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  function closeMenu() {
    navMenu.classList.remove('open');
    toggle.classList.remove('active');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle('open');
    toggle.classList.toggle('active');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  toggle.addEventListener('click', toggleMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', function (e) {
    if (navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !toggle.contains(e.target)) {
      closeMenu();
    }
  });
})();


/* ── 2. Smooth Scroll for Anchor Links ── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar').offsetHeight;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    });
  });
})();


/* ── 3. Scroll Reveal (Intersection Observer) ── */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');

  if (!elements.length) return;

  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry, index) {
      if (entry.isIntersecting) {
        const delay = index * 80;

        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, delay);

        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  elements.forEach(function (el) {
    observer.observe(el);
  });
})();


/* ── 4. Counter Animation ── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-item__value[data-target]');

  if (!counters.length) return;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 2000;
    let   startTime = null;

    function step(currentTime) {
      if (!startTime) startTime = currentTime;

      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutQuart(progress);
      const current  = Math.round(eased * target);

      el.textContent = current.toLocaleString('id-ID');

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString('id-ID');
      }
    }

    requestAnimationFrame(step);
  }

  const observerOptions = {
    threshold: 0.5
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(function (counter) {
    observer.observe(counter);
  });
})();


/* ── 5. Active Nav Link on Scroll ── */
(function initActiveNavLink() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.navbar__link');

  function updateActiveLink() {
    const scrollY     = window.scrollY;
    const navHeight   = document.getElementById('navbar').offsetHeight;
    let   activeId    = '';

    sections.forEach(function (section) {
      const sectionTop    = section.offsetTop - navHeight - 60;
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollY >= sectionTop && scrollY < sectionBottom) {
        activeId = section.getAttribute('id');
      }
    });

    navLinks.forEach(function (link) {
      link.classList.remove('navbar__link--active');

      const href = link.getAttribute('href');
      if (href === '#' + activeId) {
        link.classList.add('navbar__link--active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();


/* ── 6. Navbar Link Active Style (CSS injection) ── */
(function injectActiveStyle() {
  const style = document.createElement('style');
  style.textContent = `
    .navbar__link--active {
      color: var(--clr-primary) !important;
      background: var(--clr-primary-light);
    }
  `;
  document.head.appendChild(style);
})();


/* ── 7. Service Card Staggered Reveal ── */
(function initCardStagger() {
  const cards = document.querySelectorAll('.service-card.reveal, .doctor-card.reveal, .testi-card.reveal');

  const observer = new IntersectionObserver(function (entries) {
    const visible = entries.filter(e => e.isIntersecting);

    visible.forEach(function (entry, i) {
      setTimeout(function () {
        entry.target.classList.add('is-visible');
      }, i * 100);
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -30px 0px'
  });

  cards.forEach(el => observer.observe(el));
})();


/* ── 8. Stat Items Stagger on Section Enter ── */
(function initStatStagger() {
  const statSection = document.querySelector('.statistik');
  if (!statSection) return;

  const statItems = statSection.querySelectorAll('.stat-item.reveal');

  const observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      statItems.forEach(function (item, i) {
        setTimeout(function () {
          item.classList.add('is-visible');
        }, i * 150);
      });
      observer.unobserve(statSection);
    }
  }, { threshold: 0.2 });

  observer.observe(statSection);
})();


/* ── 9. Subtle Parallax on Hero Shapes ── */
(function initParallax() {
  const shapes = document.querySelectorAll('.hero__shape');
  if (!shapes.length) return;

  function onScroll() {
    const scrollY = window.scrollY;

    shapes[0] && (shapes[0].style.transform = `translateY(${scrollY * 0.15}px)`);
    shapes[1] && (shapes[1].style.transform = `translateY(${-scrollY * 0.1}px)`);
    shapes[2] && (shapes[2].style.transform = `translateY(${scrollY * 0.08}px)`);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ── 10. Hero Cards Subtle Mouse Parallax ── */
(function initHeroCardParallax() {
  const heroSection = document.querySelector('.hero');
  const cards       = document.querySelectorAll('.hero__card');

  if (!heroSection || !cards.length) return;

  heroSection.addEventListener('mousemove', function (e) {
    const rect    = heroSection.getBoundingClientRect();
    const centerX = rect.width  / 2;
    const centerY = rect.height / 2;
    const deltaX  = (e.clientX - rect.left - centerX) / centerX;
    const deltaY  = (e.clientY - rect.top  - centerY) / centerY;

    cards.forEach(function (card, i) {
      const factor = (i + 1) * 6;
      card.style.transform = `translate(${deltaX * factor}px, ${deltaY * factor}px)`;
    });
  });

  heroSection.addEventListener('mouseleave', function () {
    cards.forEach(function (card) {
      card.style.transform = '';
    });
  });
})();


/* ── 11. Button Ripple Effect ── */
(function initRipple() {
  const buttons = document.querySelectorAll('.btn');

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      const ripple = document.createElement('span');
      const rect   = btn.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height) * 2;
      const x      = e.clientX - rect.left - size / 2;
      const y      = e.clientY - rect.top  - size / 2;

      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        border-radius: 50%;
        background: rgba(255,255,255,0.25);
        transform: scale(0);
        animation: ripple-anim 0.5s ease-out forwards;
        pointer-events: none;
      `;

      const existingStyle = document.getElementById('ripple-style');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id    = 'ripple-style';
        style.textContent = `
          @keyframes ripple-anim {
            to { transform: scale(1); opacity: 0; }
          }
        `;
        document.head.appendChild(style);
      }

      btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.appendChild(ripple);

      ripple.addEventListener('animationend', function () {
        ripple.remove();
      });
    });
  });
})();
