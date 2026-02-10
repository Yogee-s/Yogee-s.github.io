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

  setTimeout(typeLoop, 800);

  /* ========================================
     SCROLL REVEAL (staggered)
     ======================================== */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  reveals.forEach((el) => revealObserver.observe(el));

  /* ========================================
     ACTIVE NAV HIGHLIGHTING
     ======================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    }
  );

  sections.forEach((section) => navObserver.observe(section));

  /* ========================================
     NAVBAR SCROLL EFFECT
     ======================================== */
  const topbar = document.getElementById('topbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (topbar) {
      topbar.classList.toggle('scrolled', currentScroll > 50);
    }
    lastScroll = currentScroll;
  }, { passive: true });

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
})();
