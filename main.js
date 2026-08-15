(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     Preloader (with live percentage)
  ============================================================ */
  const preloaderPercent = document.getElementById('preloaderPercent');
  if (preloaderPercent) {
    let pct = 0;
    const step = () => {
      pct = Math.min(100, pct + Math.random() * 14 + 4);
      preloaderPercent.textContent = Math.floor(pct) + '%';
      if (pct < 100) {
        setTimeout(step, 90);
      } else {
        preloaderPercent.textContent = '100%';
      }
    };
    step();
  }

  window.addEventListener('load', () => {
    const pre = document.getElementById('preloader');
    setTimeout(() => {
      pre.classList.add('is-hidden');
      runHeroEntrance();
    }, 900);
  });

  /* ============================================================
     Navbar: scrolled state + scrollspy
  ============================================================ */
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-link');
  const sections = document.querySelectorAll('main section[id], .hero[id]');

  function onScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.dataset.nav === id);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
  );
  sections.forEach((s) => spyObserver.observe(s));

  /* ============================================================
     Mobile menu
  ============================================================ */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mobileMenu.classList.toggle('is-open', !expanded);
    document.body.classList.toggle('menu-open', !expanded);
  });

  document.querySelectorAll('.mobile-link').forEach((link) => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });

  /* ============================================================
     Cursor glow
  ============================================================ */
  const cursorGlow = document.getElementById('cursorGlow');
  if (cursorGlow && !reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    window.addEventListener('mousemove', (e) => {
      cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    }, { passive: true });
  }

  /* ============================================================
     Scroll reveal
  ============================================================ */
  const revealEls = document.querySelectorAll('.reveal-up');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = (entry.target.style.getPropertyValue('--stagger') || 0) * 90;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ============================================================
     Skill ring / meter animation trigger
  ============================================================ */
  const skillRing = document.querySelector('.skill-ring');
  const skillMeter = document.querySelector('.skill-meter');
  [skillRing, skillMeter].forEach((el) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
  });

  /* ============================================================
     Tilt cards (3D pointer tilt)
  ============================================================ */
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateY(0)';
      });
    });

    /* Magnetic buttons */
    document.querySelectorAll('.magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ============================================================
     Hero entrance timeline
  ============================================================ */
  function runHeroEntrance() {
    if (typeof gsap === 'undefined') {
      document.querySelectorAll('.hero .reveal-up').forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const items = document.querySelectorAll('.hero .reveal-up');
    gsap.set(items, { opacity: 0, y: 28 });
    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.12,
      delay: 0.1,
      onComplete: () => items.forEach((el) => el.classList.add('is-visible')),
    });
  }

  /* ============================================================
     GSAP ScrollTrigger — subtle gradient text shift progress
     (kept minimal / optional enhancement, safe if gsap missing)
  ============================================================ */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reduceMotion) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.section-title').forEach((title) => {
      gsap.fromTo(
        title,
        { letterSpacing: '0.04em' },
        {
          letterSpacing: '-0.01em',
          duration: 1,
          scrollTrigger: { trigger: title, start: 'top 85%' },
        }
      );
    });
  }

  /* ============================================================
     Developer Core network — animated node ring + SVG connectors
  ============================================================ */
  (function initCore() {
    const stage = document.getElementById('coreStage');
    const svg = document.getElementById('coreLines');
    if (!stage || !svg) return;

    const nodeEls = Array.from(stage.querySelectorAll('.core-node'));
    const NS = 'http://www.w3.org/2000/svg';

    // gradient defs
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = `
      <linearGradient id="coreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3EE8FF"/>
        <stop offset="100%" stop-color="#A35BFF"/>
      </linearGradient>`;
    svg.appendChild(defs);

    const lines = nodeEls.map(() => {
      const line = document.createElementNS(NS, 'line');
      line.setAttribute('stroke', 'url(#coreGrad)');
      line.setAttribute('stroke-width', '1.4');
      line.setAttribute('opacity', '0.5');
      svg.appendChild(line);
      return line;
    });

    let angleOffset = 0;
    const paused = { value: false };

    stage.addEventListener('mouseenter', () => (paused.value = true));
    stage.addEventListener('mouseleave', () => (paused.value = false));

    function layout() {
      const size = stage.clientWidth;
      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.38;

      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

      nodeEls.forEach((node, i) => {
        const angle = angleOffset + (i / nodeEls.length) * Math.PI * 2;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        node.style.left = x + 'px';
        node.style.top = y + 'px';

        const line = lines[i];
        line.setAttribute('x1', cx);
        line.setAttribute('y1', cy);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y);
      });
    }

    function tick() {
      if (!paused.value && !reduceMotion) {
        angleOffset += 0.0025;
        layout();
      }
      requestAnimationFrame(tick);
    }

    layout();
    window.addEventListener('resize', layout);
    requestAnimationFrame(tick);
  })();

  /* ============================================================
     Smooth-scroll for in-page nav (fallback for older browsers)
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length < 2) return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  /* ============================================================
     Theme toggle (dark / light, persisted)
  ============================================================ */
  (function initTheme() {
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    let stored = null;
    try { stored = localStorage.getItem('ri-theme'); } catch (e) { /* storage unavailable */ }

    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    const initial = stored || (prefersLight ? 'light' : 'dark');
    applyTheme(initial);

    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      applyTheme(current === 'light' ? 'dark' : 'light');
    });

    function applyTheme(theme) {
      if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
        toggle.setAttribute('aria-pressed', 'true');
        toggle.setAttribute('aria-label', 'Switch to dark theme');
      } else {
        root.removeAttribute('data-theme');
        toggle.setAttribute('aria-pressed', 'false');
        toggle.setAttribute('aria-label', 'Switch to light theme');
      }
      try { localStorage.setItem('ri-theme', theme); } catch (e) { /* storage unavailable */ }
    }
  })();

  /* ============================================================
     Hero typed-role cycling text
  ============================================================ */
  (function initTypedText() {
    const el = document.getElementById('typedText');
    if (!el) return;

    const roles = ['CSE Student', 'Problem Solver', 'Tech Enthusiast', 'Lifelong Learner'];
    if (reduceMotion) {
      el.textContent = roles[0];
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1500);
          return;
        }
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      setTimeout(tick, deleting ? 40 : 75);
    }
    tick();
  })();
})();
