(function () {
  /* ========================================
     TYPING EFFECT
     ======================================== */
  const roles = [
    'ROS2 Systems Developer',
    'Computer Vision Engineer',
    'Reinforcement Learning Researcher',
    'Perception Pipeline Builder',
    'Embodied AI Engineer'
  ];

  const typedEl = document.getElementById('typed-text');
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 65;
  const deleteSpeed = 35;
  const pauseAfterType = 2000;
  const pauseAfterDelete = 400;

  function typeLoop() {
    if (!typedEl) return;
    const currentRole = roles[roleIndex];

    if (!isDeleting) {
      typedEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;

      if (charIndex === currentRole.length) {
        isDeleting = true;
        setTimeout(typeLoop, pauseAfterType);
        return;
      }
      setTimeout(typeLoop, typeSpeed);
    } else {
      typedEl.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;

      if (charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(typeLoop, pauseAfterDelete);
        return;
      }
      setTimeout(typeLoop, deleteSpeed);
    }
  }

  /* ========================================
     HERO ENTRANCE TIMELINE (anime.js)
     ======================================== */
  function runHeroEntrance() {
    const heroEls = document.querySelectorAll('[data-anim="hero"]');
    // Initially hide all hero elements
    heroEls.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
    });

    // Make hero section visible immediately
    const heroSection = document.getElementById('home');
    if (heroSection) {
      heroSection.classList.add('visible');
    }

    const tl = anime.timeline({
      easing: 'easeOutExpo',
      duration: 900
    });

    // 1. Eyebrow slides in
    tl.add({
      targets: '.eyebrow[data-anim="hero"]',
      opacity: [0, 1],
      translateX: [-40, 0],
      translateY: [0, 0],
      duration: 700,
      easing: 'easeOutCubic'
    });

    // 2. Name animates in
    tl.add({
      targets: 'h1[data-anim="hero"]',
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 1000,
      easing: 'easeOutExpo'
    }, '-=500');

    // 3. Subtitle
    tl.add({
      targets: '.hero-subtitle[data-anim="hero"]',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      easing: 'easeOutCubic',
      complete: function () {
        setTimeout(typeLoop, 200);
      }
    }, '-=600');

    // 4. Lead paragraph
    tl.add({
      targets: '.lead[data-anim="hero"]',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 700,
      easing: 'easeOutCubic'
    }, '-=400');

    // 5. CTA row container becomes visible + buttons stagger in
    tl.add({
      targets: '.cta-row[data-anim="hero"]',
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 400,
      easing: 'easeOutCubic',
      begin: function () {
        // Stagger individual buttons inside the row
        anime({
          targets: '.cta-row[data-anim="hero"] .btn',
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 500,
          delay: anime.stagger(120, { start: 100 }),
          easing: 'easeOutBack'
        });
      }
    }, '-=400');

    // 6. Profile photo with spring
    tl.add({
      targets: '.hero-photo[data-anim="hero"]',
      opacity: [0, 1],
      scale: [0.7, 1],
      translateY: [0, 0],
      duration: 1000,
      easing: 'spring(1, 80, 10, 0)'
    }, '-=800');

    // 7. Scroll indicator
    tl.add({
      targets: '.scroll-indicator[data-anim="hero"]',
      opacity: [0, 0.7],
      translateY: [15, 0],
      duration: 600,
      easing: 'easeOutCubic'
    }, '-=400');

    // 8. Meta cards stagger up
    tl.add({
      targets: '.hero-meta .meta-card',
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 700,
      delay: anime.stagger(150),
      easing: 'easeOutCubic'
    }, '-=500');

    // Scroll indicator bounce loop
    anime({
      targets: '.scroll-indicator .arrow',
      translateY: [0, 8, 0],
      duration: 1500,
      easing: 'easeInOutSine',
      loop: true,
      delay: 2500
    });
  }

  /* ========================================
     FLOATING PARTICLE CANVAS
     ======================================== */
  function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 35;

    function resize() {
      const hero = document.getElementById('home');
      if (!hero) return;
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2 - 0.1,
        opacity: Math.random() * 0.4 + 0.1,
        hue: Math.random() > 0.5 ? 186 : 267 // cyan or purple
      };
    }

    function init() {
      resize();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `hsla(${p.hue}, 80%, 70%, ${p.opacity * 0.5})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(draw);
    }

    init();
    draw();
    window.addEventListener('resize', () => {
      resize();
    });
  }

  /* ========================================
     SCROLL-TRIGGERED SECTION REVEALS
     ======================================== */
  function initScrollReveals() {
    // Section-level reveal
    const sections = document.querySelectorAll('.section.reveal');
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
            entry.target.classList.add('visible');
            animateSection(entry.target);
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06 }
    );

    sections.forEach((el) => sectionObserver.observe(el));
  }

  function animateSection(section) {
    const id = section.id;

    // Project cards
    const cards = section.querySelectorAll('.card');
    if (cards.length) {
      anime({
        targets: cards,
        opacity: [0, 1],
        translateY: [50, 0],
        duration: 800,
        delay: anime.stagger(120, { start: 100 }),
        easing: 'easeOutCubic'
      });
    }

    // Tech tags
    const tags = section.querySelectorAll('.tech-tag');
    if (tags.length) {
      anime({
        targets: tags,
        opacity: [0, 1],
        translateX: [-15, 0],
        scale: [0.8, 1],
        duration: 500,
        delay: anime.stagger(50, { start: 400 }),
        easing: 'easeOutBack'
      });
    }

    // Timeline dots
    if (id === 'resume') {
      const dots = section.querySelectorAll('.timeline-dot');
      anime({
        targets: dots,
        scale: [0, 1],
        duration: 500,
        delay: anime.stagger(100, { start: 200 }),
        easing: 'easeOutElastic(1, .6)'
      });

      // Timeline content
      const timelineContent = section.querySelectorAll('.timeline-content');
      anime({
        targets: timelineContent,
        opacity: [0, 1],
        translateX: [30, 0],
        duration: 600,
        delay: anime.stagger(100, { start: 300 }),
        easing: 'easeOutCubic'
      });

      // Timeline dates
      const timelineDates = section.querySelectorAll('.timeline-date');
      anime({
        targets: timelineDates,
        opacity: [0, 0.85],
        translateX: [-20, 0],
        duration: 600,
        delay: anime.stagger(100, { start: 300 }),
        easing: 'easeOutCubic'
      });
    }

    // Skill grid
    const skillCards = section.querySelectorAll('.skill-grid .card');
    if (skillCards.length) {
      anime({
        targets: skillCards,
        opacity: [0, 1],
        scale: [0.85, 1],
        translateY: [25, 0],
        duration: 600,
        delay: anime.stagger(100, { start: 300 }),
        easing: 'easeOutBack'
      });
    }

    // Poster cards
    const posterCards = section.querySelectorAll('.poster-card');
    if (posterCards.length) {
      anime({
        targets: posterCards,
        opacity: [0, 1],
        translateY: [40, 0],
        rotate: [2, 0],
        duration: 700,
        delay: anime.stagger(150, { start: 100 }),
        easing: 'easeOutCubic'
      });
    }

    // IDP iterations
    const idpFigures = section.querySelectorAll('.idp-iterations figure');
    if (idpFigures.length) {
      anime({
        targets: idpFigures,
        opacity: [0, 1],
        translateX: function (el, i) {
          return [i % 2 === 0 ? -40 : 40, 0];
        },
        duration: 700,
        delay: anime.stagger(150, { start: 200 }),
        easing: 'easeOutCubic'
      });
    }

    // Section heading animation
    const sectionHead = section.querySelector('.section-head');
    if (sectionHead) {
      anime({
        targets: sectionHead.children,
        opacity: [0, 1],
        translateY: [25, 0],
        duration: 700,
        delay: anime.stagger(120),
        easing: 'easeOutCubic'
      });
    }
  }

  /* ========================================
     INTERACTIVE CARD TILT (3D perspective)
     ======================================== */
  function initCardTilt() {
    const cards = document.querySelectorAll('.project.card, .idp-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -2;
        const rotateY = ((x - centerX) / centerX) * 2;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
      });

      card.addEventListener('mouseleave', () => {
        anime({
          targets: card,
          rotateX: 0,
          rotateY: 0,
          translateZ: 0,
          duration: 600,
          easing: 'easeOutElastic(1, .5)'
        });
        card.style.transform = '';
      });
    });
  }

  /* ========================================
     MAGNETIC BUTTONS
     ======================================== */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn-primary, .btn-ghost');
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        anime({
          targets: btn,
          translateX: 0,
          translateY: 0,
          duration: 500,
          easing: 'easeOutElastic(1, .4)'
        });
        btn.style.transform = '';
      });
    });
  }

  /* ========================================
     ACTIVE NAV HIGHLIGHTING
     ======================================== */
  const allSections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === '#' + id;
            link.classList.toggle('active', isActive);
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    }
  );

  allSections.forEach((section) => navObserver.observe(section));

  /* ========================================
     NAVBAR SCROLL EFFECT
     ======================================== */
  const topbar = document.getElementById('topbar');
  const syncTopbarState = () => {
    if (topbar) {
      topbar.classList.toggle('scrolled', window.scrollY > 50);
    }
  };

  syncTopbarState();
  window.addEventListener('scroll', syncTopbarState, { passive: true });

  /* ========================================
     MOBILE NAV TOGGLE
     ======================================== */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      const isOpen = mainNav.classList.contains('open');
      navToggle.textContent = isOpen ? '✕' : '☰';
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close nav on link click (mobile)
    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.textContent = '☰';
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ========================================
     LIGHTBOX
     ======================================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxClose = document.getElementById('lightbox-close');

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImage.removeAttribute('src');
    lightboxImage.removeAttribute('alt');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.js-lightbox').forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || 'Expanded image';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  if (lightbox) {
    lightbox.addEventListener('click', (event) => {
      if (event.target === lightbox || event.target === lightboxClose) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  /* ========================================
     FORCE MUTE ALL VIDEOS
     ======================================== */
  function enforceMute(video) {
    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;
  }

  document.querySelectorAll('video').forEach((video) => {
    enforceMute(video);
    video.addEventListener('volumechange', () => {
      if (!video.muted || video.volume !== 0) {
        enforceMute(video);
      }
    });
  });

  /* ========================================
     FOOTER DATE
     ======================================== */
  const updated = document.getElementById('last-updated');
  if (updated) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    updated.textContent = formatter.format(now);
  }

  /* ========================================
     SMOOTH SCROLL FOR ANCHORS
     ======================================== */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ========================================
     INITIALIZE EVERYTHING
     ======================================== */
  // Wait for DOM + fonts to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    initParticles();
    runHeroEntrance();
    initScrollReveals();
    initCardTilt();
    initMagneticButtons();
  }
})();
