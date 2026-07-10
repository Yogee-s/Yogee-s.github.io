(function () {
    // Gate pre-reveal hiding (.reveal opacity:0 in CSS) on this file actually
    // running: if script.js never loads, the class is absent and everything
    // stays visible. Set here — not in an inline <head> script — so the flag
    // and the reveal machinery can only exist together.
    document.documentElement.classList.add('js-anim');

    /* ========================================
       TYPING EFFECT
       ======================================== */
    const roles = [
        'ROS2 Systems Developer',
        'Computer Vision Engineer',
        'Reinforcement Learning Researcher',
        'Perception Pipeline Builder',
        'On-device LLM & Embodied AI Engineer'
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

        // Make hero section visible immediately
        const heroSection = document.getElementById('home');
        if (heroSection) {
            heroSection.classList.add('visible');
        }

        // Without anime.js the hero simply stays visible — never hide content we can't reveal
        if (typeof anime === 'undefined') return;

        // Initially hide all hero elements
        heroEls.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
        });

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
        // Sections are already visible via the .visible class; the stagger is enhancement only
        if (typeof anime === 'undefined') return;

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
    const robotGuideTrigger = document.getElementById('robot-guide-trigger');

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

    if (robotGuideTrigger) {
        robotGuideTrigger.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('robot-guide:request-tour'));

            if (mainNav && mainNav.classList.contains('open') && navToggle) {
                mainNav.classList.remove('open');
                navToggle.textContent = '☰';
                navToggle.setAttribute('aria-expanded', 'false');
            }
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
        const detailPanel = document.getElementById('detail-panel');
        const panelOpen = detailPanel && detailPanel.getAttribute('aria-hidden') === 'false';
        document.body.style.overflow = panelOpen ? 'hidden' : '';
    }

    if (lightbox && lightboxImage) {
        document.addEventListener('click', (event) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const image = target.closest('.js-lightbox');
            if (!(image instanceof HTMLImageElement)) return;

            lightboxImage.src = image.currentSrc || image.src;
            lightboxImage.alt = image.alt || 'Expanded image';
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        });
    }

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
        // Reveals first: even if a later step throws, content is never left hidden
        initScrollReveals();
        initParticles();
        try {
            runHeroEntrance();
        } catch (err) {
            console.warn('Hero entrance skipped:', err);
        }
        initCardTilt();
        initMagneticButtons();
    }
})();

/* ========================================================
   FEATURED PROJECTS · ROBOT BODY MAP
   ======================================================== */

(function initHumanoidMap() {
    const section = document.getElementById('featured');
    if (!section) return;

    const wrap = section.querySelector('.constellation-wrap');
    const linkLayer = document.getElementById('robot-link-layer');
    const cards = Array.from(section.querySelectorAll('.robot-project-grid .card-node'));
    if (!cards.length) return;

    const model = document.getElementById('humanoid-model');
    const stage = document.getElementById('robot-stage');
    const hotspots = Array.from(section.querySelectorAll('.robot-hotspot'));
    const posterSection = section.querySelector('.poster-section');
    const otherProjectsSection = section.querySelector('.other-projects');
    const posterSectionTitle = posterSection ? posterSection.querySelector('.poster-section-title') : null;
    const otherProjectsTitle = otherProjectsSection ? otherProjectsSection.querySelector('.other-projects-title') : null;
    const resumeSection = document.getElementById('resume');
    const resumeSectionHead = resumeSection ? resumeSection.querySelector('.section-head') : null;
    const resumeSectionTitle = resumeSectionHead ? resumeSectionHead.querySelector('h2') : null;

    const focusTitle = document.getElementById('robot-focus-title');
    const focusDesc = document.getElementById('robot-focus-desc');
    const partLabel = document.getElementById('robot-part-label');
    const projectLabel = document.getElementById('robot-project-label');

    const panel = document.getElementById('detail-panel');
    const panelContent = document.getElementById('detail-content');
    const panelTitle = document.getElementById('bar-project-title');
    const panelPill = document.getElementById('bar-project-pill');
    const overlay = document.getElementById('detail-overlay');
    const GUIDE_VISUAL_CUE_EVENT = 'robot-guide:visual-cue';

    const PROJECTS = {
        'boxbunny': {
            panelTitle: 'BoxBunny · Intelligent Boxing Robot',
            panelPill: 'Final Year Project',
            focusTitle: 'Full-Body Integration',
            focusDesc: 'Full-body integration across perception, control, and feedback.',
            partLabel: 'Scope: Full-body system integration',
            projectLabel: 'BoxBunny - vision, reasoning, and control integrated into one stack',
            cameraOrbit: '0deg 88deg 3.9m',
            cameraTarget: '0m 0.02m 0m',
            color: '#f59e0b',
            template: 'tpl-boxbunny'
        },
        'robotic-companion': {
            panelTitle: 'Robotic Companion',
            panelPill: 'UREx · Solo',
            focusTitle: 'Chest / Embodied Social Cognition',
            focusDesc: 'On-device voice, vision, and affect fused into an embodied companion.',
            partLabel: 'Targeted area: Embodied social AI (head + torso)',
            projectLabel: 'Robotic Companion - offline emotion-aware voice and face loop',
            cameraOrbit: '-14deg 78deg 2.82m',
            cameraTarget: '0m 0.40m 0.1m',
            color: '#10b981',
            template: 'tpl-robotic-companion'
        },
        'teleco': {
            panelTitle: 'Teleco Localization',
            panelPill: 'Deployed',
            focusTitle: 'Eyes / Visual Attention',
            focusDesc: 'Vision + localization for gaze and visual attention.',
            partLabel: 'Targeted part: Eyes and visual focus',
            projectLabel: 'Teleco - camera-to-map localization and social gaze control',
            cameraOrbit: '8deg 74deg 2.78m',
            cameraTarget: '0.07m 0.79m 0.08m',
            color: '#06b6d4',
            template: 'tpl-teleco'
        },
        'breaking-bias': {
            panelTitle: 'Breaking Bias in LLMs',
            panelPill: 'LLM Research',
            focusTitle: 'Head / Reasoning Layer',
            focusDesc: 'Reasoning-layer safety through bias analysis and mitigation.',
            partLabel: 'Targeted part: Head and cognition',
            projectLabel: 'Breaking Bias - safer language reasoning and mitigation workflows',
            cameraOrbit: '20deg 66deg 2.88m',
            cameraTarget: '0.02m 0.87m 0.07m',
            color: '#f43f5e',
            template: 'tpl-breaking-bias'
        },
        'astar-rl': {
            panelTitle: 'RL Dexterous Hand',
            panelPill: 'Research',
            focusTitle: 'Manipulation Hand',
            focusDesc: 'Dexterous hand control for grasping and manipulation.',
            partLabel: 'Targeted part: Hand dexterity',
            projectLabel: 'A*STAR RL - dexterous grasping and control adaptation',
            cameraOrbit: '52deg 86deg 2.74m',
            cameraTarget: '0.4m 0.35m 0m',
            color: '#8b5cf6',
            template: 'tpl-astar-rl'
        },
        'idp': {
            panelTitle: 'Legged Balancing Robot (IDP)',
            panelPill: 'Foundation',
            focusTitle: 'Legs / Locomotion Base',
            focusDesc: 'Simulation-based LQR tuning and kinematic modeling for legged balance and locomotion stability.',
            partLabel: 'Targeted part: Legs, balance, and locomotion base',
            projectLabel: 'Legged Balancing Robot - MATLAB/Simulink LQR tuning, kinematic analysis, and locomotion stability iteration.',
            cameraOrbit: '-12deg 104deg 2.86m',
            cameraTarget: '-0.24m -0.7m 0.02m',
            color: '#fca5a5',
            template: 'tpl-idp'
        }
    };
    const neutralState = {
        focusTitle: focusTitle ? focusTitle.textContent : '',
        focusDesc: focusDesc ? focusDesc.textContent : 'Select a project to see the subsystem it targets.',
        partLabel: partLabel ? partLabel.textContent : 'Hover a project to preview subsystem focus.',
        projectLabel: projectLabel ? projectLabel.textContent : 'Click a project to lock focus and open details.',
        color: '#9ca3af',
        cameraOrbit: model ? (model.getAttribute('camera-orbit') || '0deg 88deg 4.1m') : '0deg 88deg 4.1m',
        cameraTarget: model ? (model.getAttribute('camera-target') || '0m 0m 0m') : '0m 0m 0m'
    };

    let selectedProject = null;
    let activeProject = null;
    let connectorPath = null;
    let connectorDot = null;
    let guideCueCycleTimer = null;
    let guideCueRestoreTimer = null;
    let guideCueSnapshot = null;

    function ensureConnector() {
        if (!linkLayer || connectorPath) return;
        connectorPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        connectorPath.setAttribute('fill', 'none');
        connectorPath.setAttribute('stroke-width', '2.2');
        connectorPath.setAttribute('stroke-linecap', 'round');
        connectorPath.setAttribute('stroke-linejoin', 'round');
        connectorPath.classList.add('robot-link-path');
        linkLayer.appendChild(connectorPath);

        connectorDot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        connectorDot.setAttribute('r', '4.5');
        connectorDot.classList.add('robot-link-dot');
        linkLayer.appendChild(connectorDot);
    }

    function updateConnector() {
        if (!wrap || !linkLayer) return;
        ensureConnector();

        if (!activeProject) {
            if (connectorPath) connectorPath.setAttribute('d', '');
            if (connectorDot) connectorDot.setAttribute('display', 'none');
            return;
        }

        const card = cards.find((node) => node.dataset.project === activeProject);
        const hotspot = hotspots.find((node) => node.dataset.project === activeProject);
        if (!card || !hotspot || !connectorPath || !connectorDot) return;

        const wrapRect = wrap.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const hotspotRect = hotspot.getBoundingClientRect();

        const x1 = cardRect.left + cardRect.width / 2 - wrapRect.left;
        const y1 = cardRect.top + cardRect.height / 2 - wrapRect.top;
        const x2 = hotspotRect.left + hotspotRect.width / 2 - wrapRect.left;
        const y2 = hotspotRect.top + hotspotRect.height / 2 - wrapRect.top;

        const c1x = x1 + (x2 - x1) * 0.35;
        const c1y = y1 - 68;
        const c2x = x1 + (x2 - x1) * 0.7;
        const c2y = y2 - 28;

        const width = wrap.clientWidth;
        const height = wrap.clientHeight;
        linkLayer.setAttribute('viewBox', `0 0 ${width} ${height}`);
        linkLayer.setAttribute('width', String(width));
        linkLayer.setAttribute('height', String(height));

        connectorPath.setAttribute('d', `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`);
        connectorDot.setAttribute('cx', String(x2));
        connectorDot.setAttribute('cy', String(y2));
        connectorDot.removeAttribute('display');
    }

    function syncConnectorFor(durationMs = 700) {
        const startedAt = performance.now();
        const tick = (now) => {
            updateConnector();
            if (now - startedAt < durationMs) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    function setNeutralState(options = {}) {
        const shouldMoveCamera = options.moveCamera !== false;
        activeProject = null;

        cards.forEach(card => card.classList.remove('active'));
        hotspots.forEach(hotspot => hotspot.classList.remove('active'));

        if (focusTitle) focusTitle.textContent = neutralState.focusTitle;
        if (focusDesc) focusDesc.textContent = neutralState.focusDesc;
        if (partLabel) partLabel.textContent = neutralState.partLabel;
        if (projectLabel) projectLabel.textContent = neutralState.projectLabel;
        if (stage) {
            stage.style.setProperty('--robot-accent', neutralState.color);
            stage.classList.remove('has-active');
            stage.removeAttribute('data-active-project');
        }

        if (model && shouldMoveCamera) {
            model.cameraOrbit = neutralState.cameraOrbit;
            model.cameraTarget = neutralState.cameraTarget;
        }
        if (model) model.classList.remove('fullbody-focus');

        updateConnector();
        syncConnectorFor(shouldMoveCamera ? 520 : 160);
    }

    function selectProject(projectId, options = {}) {
        if (!PROJECTS[projectId]) return;
        selectedProject = projectId;
        setActiveProject(projectId, options);
    }

    function previewProject(projectId, options = {}) {
        if (!PROJECTS[projectId]) return;
        setActiveProject(projectId, options);
    }

    function clearPreview() {
        if (selectedProject) {
            if (activeProject === selectedProject) return;
            setActiveProject(selectedProject);
            return;
        }
        if (activeProject !== null) setNeutralState();
    }

    function clearSelection(options = {}) {
        if (!selectedProject) {
            if (activeProject !== null) setNeutralState(options);
            return;
        }
        selectedProject = null;
        setNeutralState(options);
    }

    function setActiveProject(projectId, options = {}) {
        const config = PROJECTS[projectId];
        if (!config) return;

        const shouldMoveCamera = options.moveCamera !== false;
        activeProject = projectId;

        cards.forEach(card => card.classList.toggle('active', card.dataset.project === projectId));
        hotspots.forEach(hotspot => hotspot.classList.toggle('active', hotspot.dataset.project === projectId));

        if (focusTitle) focusTitle.textContent = config.focusTitle;
        if (focusDesc) focusDesc.textContent = config.focusDesc;
        if (partLabel) partLabel.textContent = config.partLabel;
        if (projectLabel) projectLabel.textContent = config.projectLabel;
        if (stage) {
            stage.style.setProperty('--robot-accent', config.color);
            stage.classList.add('has-active');
            stage.dataset.activeProject = projectId;
        }
        if (connectorPath) connectorPath.setAttribute('stroke', config.color);
        if (connectorDot) connectorDot.setAttribute('fill', config.color);

        if (model) {
            if (shouldMoveCamera) {
                model.cameraOrbit = config.cameraOrbit;
                model.cameraTarget = config.cameraTarget;
            }
            model.classList.toggle('fullbody-focus', projectId === 'boxbunny');
        }

        updateConnector();
        syncConnectorFor(shouldMoveCamera ? 760 : 260);
    }

    function clearGuideCueTimers() {
        if (guideCueCycleTimer) {
            window.clearTimeout(guideCueCycleTimer);
            guideCueCycleTimer = null;
        }
        if (guideCueRestoreTimer) {
            window.clearTimeout(guideCueRestoreTimer);
            guideCueRestoreTimer = null;
        }
    }

    function clearGuideCueClasses() {
        cards.forEach((card) => {
            card.classList.remove('guide-spotlight', 'guide-open-target');
            const openButton = card.querySelector('.card-node-open');
            if (openButton) openButton.classList.remove('guide-open-cue');
        });
        hotspots.forEach((hotspot) => hotspot.classList.remove('guide-spotlight'));
        if (posterSectionTitle) posterSectionTitle.classList.remove('guide-section-spotlight');
        if (otherProjectsTitle) otherProjectsTitle.classList.remove('guide-section-spotlight');
        if (posterSection) posterSection.classList.remove('guide-section-spotlight');
        if (otherProjectsSection) otherProjectsSection.classList.remove('guide-section-spotlight');
        if (resumeSectionTitle) resumeSectionTitle.classList.remove('guide-resume-spotlight');
    }

    function snapshotGuideState() {
        return { selectedProject, activeProject };
    }

    function restoreGuideState(snapshot) {
        if (!snapshot) return;

        selectedProject = snapshot.selectedProject && PROJECTS[snapshot.selectedProject] ? snapshot.selectedProject : null;
        const restoreId = selectedProject || (snapshot.activeProject && PROJECTS[snapshot.activeProject] ? snapshot.activeProject : null);
        if (restoreId) {
            setActiveProject(restoreId, { moveCamera: false });
            return;
        }
        setNeutralState({ moveCamera: false });
    }

    function stopGuideVisualCue(options = {}) {
        const shouldRestore = options.restore === true;
        const shouldResetToDefault = options.resetToDefault === true;
        clearGuideCueTimers();
        clearGuideCueClasses();
        if (shouldRestore && guideCueSnapshot) restoreGuideState(guideCueSnapshot);
        if (shouldResetToDefault) clearSelection({ moveCamera: false });
        guideCueSnapshot = null;
    }

    function resolveGuideProjectId(rawProjectId) {
        if (rawProjectId === 'active') {
            if (activeProject && PROJECTS[activeProject]) return activeProject;
            if (selectedProject && PROJECTS[selectedProject]) return selectedProject;
        }
        if (rawProjectId && PROJECTS[rawProjectId]) return rawProjectId;
        if (selectedProject && PROJECTS[selectedProject]) return selectedProject;
        if (activeProject && PROJECTS[activeProject]) return activeProject;
        return 'boxbunny';
    }

    function resolveGuideSectionTarget(rawSectionId) {
        const sectionId = typeof rawSectionId === 'string' ? rawSectionId : '';
        if (!sectionId) return null;

        if (sectionId === 'poster' || sectionId === 'posters' || sectionId === 'posterSection') {
            return posterSectionTitle || posterSection;
        }
        if (sectionId === 'other' || sectionId === 'otherProjects') {
            return otherProjectsTitle || otherProjectsSection;
        }
        return null;
    }

    function resolveGuideSectionTargets(rawSectionRef) {
        const sectionRefs = Array.isArray(rawSectionRef) ? rawSectionRef : [rawSectionRef];
        const targets = [];
        sectionRefs.forEach((sectionRef) => {
            const target = resolveGuideSectionTarget(sectionRef);
            if (!target || targets.includes(target)) return;
            targets.push(target);
        });
        return targets;
    }

    function resolveGuideResumeTargets(rawTargets) {
        const knownTargets = {
            heading: resumeSectionTitle || resumeSectionHead,
            title: resumeSectionTitle || resumeSectionHead
        };
        const requestedTargets = Array.isArray(rawTargets)
            ? rawTargets
            : ['heading'];
        const includeAll = requestedTargets.some((target) => String(target).toLowerCase() === 'all');
        const targetKeys = includeAll ? ['heading'] : requestedTargets;
        const resolvedTargets = [];

        targetKeys.forEach((target) => {
            const key = String(target).toLowerCase();
            const element = knownTargets[key];
            if (!element || resolvedTargets.includes(element)) return;
            resolvedTargets.push(element);
        });

        return resolvedTargets;
    }

    function applyGuideSpotlight(projectId, options = {}) {
        const resolvedProjectId = resolveGuideProjectId(projectId);
        setActiveProject(resolvedProjectId, { moveCamera: options.moveCamera !== false });
        clearGuideCueClasses();

        const card = cards.find((node) => node.dataset.project === resolvedProjectId);
        const hotspot = hotspots.find((node) => node.dataset.project === resolvedProjectId);
        if (card) card.classList.add('guide-spotlight');
        if (hotspot) hotspot.classList.add('guide-spotlight');
        return resolvedProjectId;
    }

    function playGuideSpotlightSequence(projectIds, options = {}) {
        const orderedIds = Array.isArray(projectIds)
            ? projectIds
                .map(resolveGuideProjectId)
                .filter((projectId, index, array) => PROJECTS[projectId] && array.indexOf(projectId) === index)
            : [];
        if (!orderedIds.length) return;

        const dwellMs = Math.max(680, Number(options.dwellMs) || 980);
        const holdMs = Math.max(500, Number(options.holdMs) || 860);
        const shouldRestore = options.restore !== false;
        const shouldResetToDefault = options.resetToDefault === true;
        let index = 0;

        const runStep = () => {
            applyGuideSpotlight(orderedIds[index], options);
            index += 1;

            if (index < orderedIds.length) {
                guideCueCycleTimer = window.setTimeout(runStep, dwellMs);
                return;
            }

            if (!shouldRestore && !shouldResetToDefault) return;
            guideCueRestoreTimer = window.setTimeout(() => {
                if (shouldResetToDefault) {
                    stopGuideVisualCue({ restore: false, resetToDefault: true });
                    return;
                }
                stopGuideVisualCue({ restore: true });
            }, holdMs);
        };

        runStep();
    }

    function showGuideOpenCue(projectId, options = {}) {
        const resolvedProjectId = applyGuideSpotlight(projectId, options);
        const targetCard = cards.find((node) => node.dataset.project === resolvedProjectId);
        if (!targetCard) return;

        const openButton = targetCard.querySelector('.card-node-open');
        if (!openButton) return;

        targetCard.classList.add('guide-open-target');
        openButton.classList.add('guide-open-cue');

        if (options.restore === false) return;
        const durationMs = Math.max(1400, Number(options.durationMs) || 3000);
        guideCueRestoreTimer = window.setTimeout(() => {
            stopGuideVisualCue({ restore: true });
        }, durationMs);
    }

    function showGuideSectionCue(sectionRef, options = {}) {
        const targets = resolveGuideSectionTargets(sectionRef);
        if (!targets.length) return;
        targets.forEach((target) => {
            target.classList.add('guide-section-spotlight');
        });

        if (options.restore === false) return;
        const durationMs = Math.max(1200, Number(options.durationMs) || 2600);
        guideCueRestoreTimer = window.setTimeout(() => {
            stopGuideVisualCue({ restore: true });
        }, durationMs);
    }

    function showGuideResumeCue(options = {}) {
        const targets = resolveGuideResumeTargets(options.targets);
        if (!targets.length) return;

        targets.forEach((target) => {
            target.classList.add('guide-resume-spotlight');
        });

        const shouldRestore = options.restore === true;
        if (!shouldRestore) return;
        const durationMs = Math.max(1200, Number(options.durationMs) || 3000);
        guideCueRestoreTimer = window.setTimeout(() => {
            stopGuideVisualCue({ restore: true });
        }, durationMs);
    }

    function handleGuideVisualCueEvent(event) {
        if (panel && panel.getAttribute('aria-hidden') === 'false') return;

        const detail = event && event.detail && typeof event.detail === 'object' ? event.detail : {};
        const cueType = typeof detail.type === 'string' ? detail.type : 'spotlight';
        if (cueType === 'clear') {
            stopGuideVisualCue({ restore: false });
            return;
        }

        stopGuideVisualCue({ restore: false });
        guideCueSnapshot = snapshotGuideState();

        if (cueType === 'openCue') {
            showGuideOpenCue(detail.projectId, detail);
            return;
        }
        if (cueType === 'sectionCue') {
            const sectionRef = Array.isArray(detail.sections) ? detail.sections : detail.section;
            showGuideSectionCue(sectionRef, detail);
            return;
        }
        if (cueType === 'resumeCue') {
            showGuideResumeCue(detail);
            return;
        }

        const cueProjects = Array.isArray(detail.projectIds)
            ? detail.projectIds
            : (detail.projectId ? [detail.projectId] : []);
        if (!cueProjects.length) {
            stopGuideVisualCue({ restore: true });
            return;
        }

        playGuideSpotlightSequence(cueProjects, detail);
    }

    function openDetailPanel(projectId) {
        const config = PROJECTS[projectId];
        if (!config || !panel || !panelContent || !overlay) return;
        stopGuideVisualCue({ restore: false });

        const template = document.getElementById(config.template);
        if (!template) return;

        if (panelTitle) panelTitle.textContent = config.panelTitle;
        if (panelPill) panelPill.textContent = config.panelPill;

        panelContent.innerHTML = '';
        panelContent.appendChild(template.content.cloneNode(true));
        panel.scrollTop = 0;

        panel.setAttribute('aria-hidden', 'false');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        panelContent.style.opacity = '0';
        panelContent.style.transform = 'translateY(18px)';
        anime({
            targets: panelContent,
            opacity: [0, 1],
            translateY: [18, 0],
            duration: 520,
            easing: 'easeOutCubic'
        });

        // Trigger IDP toggle logic if applicable
        if (typeof handleIdpDetailsToggle === 'function' && typeof mediaQuery !== 'undefined') {
            handleIdpDetailsToggle(mediaQuery);
        }
    }

    function closeDetailPanel() {
        if (!panel || !overlay) return;
        if (panel.getAttribute('aria-hidden') === 'true') return;

        const videos = panel.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
            video.currentTime = 0;
        });

        panel.setAttribute('aria-hidden', 'true');
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        // Force the guide robot to re-appear using the resize event handler
        window.dispatchEvent(new Event('resize'));
    }

    function normalizeModelMaterials() {
        if (!model || !model.model || !Array.isArray(model.model.materials)) return;
        model.model.materials.forEach((material) => {
            if (!material) return;
            if (typeof material.setDoubleSided === 'function') {
                material.setDoubleSided(true);
            }
            if (typeof material.setAlphaMode === 'function') {
                material.setAlphaMode('OPAQUE');
            }
            const pbr = material.pbrMetallicRoughness;
            if (pbr && typeof pbr.setMetallicFactor === 'function') {
                pbr.setMetallicFactor(0.04);
            }
            if (pbr && typeof pbr.setRoughnessFactor === 'function') {
                pbr.setRoughnessFactor(0.92);
            }
        });
    }

    cards.forEach((card) => {
        const projectId = card.dataset.project;
        if (!PROJECTS[projectId]) return;

        const openButton = card.querySelector('.card-node-open');
        if (openButton) {
            openButton.addEventListener('click', (event) => {
                event.stopPropagation();
                stopGuideVisualCue({ restore: false });
                selectProject(projectId);
                openDetailPanel(projectId);
            });
        }

        card.addEventListener('mouseenter', () => {
            previewProject(projectId);
        });

        card.addEventListener('mouseleave', clearPreview);

        card.addEventListener('focusin', () => {
            previewProject(projectId);
        });

        card.addEventListener('focusout', () => {
            requestAnimationFrame(() => {
                const stillInside = card.contains(document.activeElement);
                if (!stillInside) clearPreview();
            });
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === ' ') {
                event.preventDefault();
                stopGuideVisualCue({ restore: false });
                selectProject(projectId);
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                stopGuideVisualCue({ restore: false });
                selectProject(projectId);
                openDetailPanel(projectId);
            }
        });

        card.addEventListener('click', () => {
            stopGuideVisualCue({ restore: false });
            selectProject(projectId);
        });
    });

    hotspots.forEach((hotspot) => {
        const projectId = hotspot.dataset.project;
        if (!PROJECTS[projectId]) return;

        hotspot.addEventListener('mouseenter', () => {
            previewProject(projectId);
        });

        hotspot.addEventListener('mouseleave', clearPreview);

        hotspot.addEventListener('focusin', () => {
            previewProject(projectId);
        });

        hotspot.addEventListener('focusout', () => {
            requestAnimationFrame(() => {
                const stillInside = hotspot.contains(document.activeElement);
                if (!stillInside) clearPreview();
            });
        });

        hotspot.addEventListener('click', (event) => {
            event.preventDefault();
            stopGuideVisualCue({ restore: false });
            selectProject(projectId);
            const card = cards.find((node) => node.dataset.project === projectId);
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        hotspot.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            stopGuideVisualCue({ restore: false });
            selectProject(projectId);
            const card = cards.find((node) => node.dataset.project === projectId);
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    });

    if (overlay) overlay.addEventListener('click', closeDetailPanel);

    document.querySelectorAll('.bar-close').forEach((button) => {
        button.addEventListener('click', closeDetailPanel);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') return;
        if (panel && panel.getAttribute('aria-hidden') === 'false') {
            closeDetailPanel();
            return;
        }
        clearSelection();
    });

    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        if (panel && panel.getAttribute('aria-hidden') === 'false') return;
        if (target.closest('.card-node, .robot-hotspot, #humanoid-model, .card-node-open')) return;
        clearSelection();
    });

    document.addEventListener(GUIDE_VISUAL_CUE_EVENT, handleGuideVisualCueEvent);

    if (model) {
        model.addEventListener('load', () => {
            normalizeModelMaterials();
            setNeutralState({ moveCamera: false });
            updateConnector();
        }, { once: true });
        model.addEventListener('camera-change', updateConnector);
    }

    window.addEventListener('resize', () => {
        updateConnector();
        syncConnectorFor(180);
    });
    window.addEventListener('scroll', updateConnector, { passive: true });

    setNeutralState({ moveCamera: false });

    anime({
        targets: '#featured .robot-project-grid .card-node',
        opacity: [0, 1],
        delay: anime.stagger(90, { start: 140 }),
        duration: 580,
        easing: 'easeOutCubic'
    });
})();

/* ========================================================
   NEW HIGH-IMPACT VISUAL EFFECTS (Cursor, Glow, Spotlight)
   ======================================================== */
(function initVisualEffects() {
    /* --- Scroll Progress Bar --- */
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            const docHeight = document.body.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            scrollProgress.style.width = scrollPercent + '%';
        }, { passive: true });
    }

    /* --- Global Mouse Tracker (for glow effects) --- */
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        // Set global variables for spotlight / glowing background
        document.body.style.setProperty('--mouse-x', `${mouseX}px`);
        document.body.style.setProperty('--mouse-y', `${mouseY}px`);
    });

    /* --- Spotlight Card Effect --- */
    const cards = document.querySelectorAll('.card, .card-node');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
})();

/* ========================================================
   CONTEXTUAL ROBOT SIDEKICK
   ======================================================== */
(function initRobotSidekick() {
    const sidekick = document.getElementById('robot-sidekick');
    const messageEl = document.getElementById('robot-sidekick-text');
    const avatarBtn = document.getElementById('robot-sidekick-avatar');
    const dismissBtn = document.getElementById('robot-sidekick-dismiss');
    const guideTriggerBtn = document.getElementById('robot-guide-trigger');
    if (!sidekick || !messageEl || !avatarBtn || !dismissBtn) return;

    const detailPanel = document.getElementById('detail-panel');
    const featuredSection = document.getElementById('featured');
    const featuredSectionHead = featuredSection ? featuredSection.querySelector('.section-head') : null;
    const featuredEyebrow = featuredSectionHead ? featuredSectionHead.querySelector('.eyebrow') : null;
    const featuredMapZone = featuredSection ? featuredSection.querySelector('.constellation-wrap') : null;
    const featuredPosterZone = featuredSection ? featuredSection.querySelector('.poster-section') : null;
    const featuredOtherZone = featuredSection ? featuredSection.querySelector('.other-projects') : null;
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia('(min-width: 981px)');
    const mobileGuideQuery = window.matchMedia('(max-width: 980px)');
    const SESSION_KEY = 'portfolio_robot_sidekick_dismissed';
    const GUIDE_TOUR_EVENT = 'robot-guide:request-tour';
    const GUIDE_VISUAL_CUE_EVENT = 'robot-guide:visual-cue';
    const INTRO_PROMPT = 'Want quick highlights? Click the robot icon or press Guide Me.';
    const GUIDE_ME_MAX_STEPS = 7;

    const messagePools = {
        home: [
            'I focus on embodied robotics: perception, reasoning, manipulation, and locomotion.',
        ],
        featured: [
            {
                id: 'featured-map-structure',
                text: 'This humanoid map is organized to show my range across embodied robotics subsystems.',
                ttlMs: 4000,
                gapAfterMs: 240,
                cue: {
                    type: 'spotlight',
                    projectIds: ['boxbunny', 'robotic-companion', 'teleco', 'breaking-bias', 'astar-rl', 'idp'],
                    dwellMs: 760,
                    holdMs: 460,
                    resetToDefault: true
                }
            },
            {
                id: 'featured-open-project',
                text: 'Click Open Project on any card to view implementation details.',
                ttlMs: 2400,
                cue: {
                    type: 'openCue',
                    projectId: 'boxbunny',
                    restore: false
                }
            }
        ],
        featuredPosters: [
            {
                id: 'poster-clarity',
                text: 'I design posters to be clear, aesthetic, and easy to read.',
                ttlMs: 1800,
                cue: {
                    type: 'sectionCue',
                    section: 'poster',
                    durationMs: 2050
                }
            },
            {
                id: 'poster-lifequest',
                text: 'I also designed the visuals and the game flow for my gamified app.',
                ttlMs: 2400,
                cue: {
                    type: 'sectionCue',
                    section: 'other',
                    durationMs: 2500
                }
            }
        ],
        featuredOther: [
            {
                id: 'featured-other-lifequest',
                text: 'LifeQuest is a gamified app where I worked on both product design and implementation.',
                cue: {
                    type: 'sectionCue',
                    section: 'other',
                    durationMs: 2600
                }
            }
        ],
        resume: [
            {
                id: 'resume-growth-path',
                text: 'This timeline shows my growth from the foundations to deployed robotics systems.',
                cue: {
                    type: 'resumeCue',
                    targets: ['heading'],
                    durationMs: 3200,
                    restore: false
                }
            },
            {
                id: 'resume-skill-breadth',
                text: 'It reflects work across simulation, controls, perception, and full integration.',
                cue: {
                    type: 'resumeCue',
                    targets: ['heading'],
                    durationMs: 3000,
                    restore: false
                }
            }
        ],
        contact: [
            'If this work aligns with your interests, feel free to connect.'
        ],
        default: [
            'I share short highlights relevant to the section you are viewing.'
        ]
    };

    let dismissed = false;
    try {
        dismissed = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch (error) {
        dismissed = false;
    }

    let guideIconHintSeen = false;

    let hideTimer = null;
    let guideSequenceTimer = null;
    let guideSequenceActive = false;
    let guideSequenceIndex = 0;
    let guideSequencePauseContext = null;
    let featuredGuideComplete = false;
    let featuredPosterSequenceIndex = 0;
    let featuredPosterOrOtherSeen = false;
    let introPromptTimer = null;
    let guideTriggerCueTimer = null;
    let messageSwapTimer = null;
    let pendingGuideReplayEntry = null;
    let pendingGuideReplayContext = null;
    let lastSpokenEntry = null;
    let lastMessageKey = '';
    let currentGuideContextId = getCurrentGuideContextId();
    let previousGuideContextId = currentGuideContextId;

    function syncAria(hidden) {
        sidekick.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    }

    function clearTimers() {
        if (hideTimer) {
            window.clearTimeout(hideTimer);
            hideTimer = null;
        }
        if (guideSequenceTimer) {
            window.clearTimeout(guideSequenceTimer);
            guideSequenceTimer = null;
        }
        if (messageSwapTimer) {
            window.clearTimeout(messageSwapTimer);
            messageSwapTimer = null;
        }
    }

    function clearMessageSwap() {
        if (messageSwapTimer) {
            window.clearTimeout(messageSwapTimer);
            messageSwapTimer = null;
        }
        messageEl.classList.remove('is-swapping');
    }

    function clearIntroPromptTimer() {
        if (!introPromptTimer) return;
        window.clearTimeout(introPromptTimer);
        introPromptTimer = null;
    }

    function markGuideIconHintSeen() {
        if (guideIconHintSeen) return;
        guideIconHintSeen = true;
        avatarBtn.classList.add('guide-badge-hidden');
    }

    function clearGuideTriggerCue() {
        if (guideTriggerCueTimer) {
            window.clearTimeout(guideTriggerCueTimer);
            guideTriggerCueTimer = null;
        }
        if (guideTriggerBtn) {
            guideTriggerBtn.classList.remove('guide-trigger-cue');
        }
    }

    function showGuideTriggerCue(durationMs = 5600) {
        if (!guideTriggerBtn) return;
        clearGuideTriggerCue();
        guideTriggerBtn.classList.add('guide-trigger-cue');
        guideTriggerCueTimer = window.setTimeout(() => {
            guideTriggerCueTimer = null;
            guideTriggerBtn.classList.remove('guide-trigger-cue');
        }, durationMs);
    }

    function scheduleGuideSequenceStep(delayMs) {
        if (!guideSequenceActive) return;
        if (guideSequenceTimer) {
            window.clearTimeout(guideSequenceTimer);
        }
        guideSequenceTimer = window.setTimeout(() => {
            guideSequenceTimer = null;
            runGuideSequenceStep();
        }, delayMs);
    }

    function runGuideSequenceStep() {
        if (!guideSequenceActive) return;
        if (!canShow({ ignoreDismissed: true })) {
            hideSidekick();
            return;
        }

        const currentContextId = syncGuideContextState();
        const enteringFeaturedFromAnotherSection = currentContextId === 'featured' && previousGuideContextId !== 'featured';
        if (pendingGuideReplayEntry && pendingGuideReplayContext && pendingGuideReplayContext !== currentContextId) {
            pendingGuideReplayEntry = null;
            pendingGuideReplayContext = null;
        }
        if (guideSequencePauseContext && currentContextId === guideSequencePauseContext) return;

        if (currentContextId === 'featured' && featuredGuideComplete) {
            if (enteringFeaturedFromAnotherSection) {
                const returnEntry = pickMessageById('featured', 'featured-open-project') || pickFirstMessage('featured');
                if (returnEntry && returnEntry.text) {
                    const returnTtl = getMessageDurationMs(returnEntry);
                    const shown = showMessage(returnEntry.text, returnTtl, { ignoreDismissed: true, persist: true });
                    if (shown) {
                        lastSpokenEntry = returnEntry;
                        emitGuideVisualCue(returnEntry);
                    }
                }
            }
            guideSequencePauseContext = 'featured';
            return;
        }

        const posterPool = messagePools.featuredPosters || [];
        if (currentContextId === 'featuredPosters' && featuredPosterSequenceIndex >= posterPool.length) {
            guideSequencePauseContext = 'featuredPosters';
            return;
        }

        const messageEntry = pendingGuideReplayEntry || pickGuideSequenceMessage(currentContextId, guideSequenceIndex);
        pendingGuideReplayEntry = null;
        pendingGuideReplayContext = null;
        if (!messageEntry || !messageEntry.text) {
            return;
        }

        const ttl = getMessageDurationMs(messageEntry);
        const shown = showMessage(messageEntry.text, ttl, { ignoreDismissed: true, persist: true });
        if (!shown) return;
        lastSpokenEntry = messageEntry;
        emitGuideVisualCue(messageEntry);

        if (currentContextId !== 'featured') {
            guideSequencePauseContext = null;
        }

        guideSequenceIndex += 1;
        if (currentContextId === 'featured' && messageEntry.id === 'featured-open-project') {
            featuredGuideComplete = true;
            guideSequencePauseContext = 'featured';
            return;
        }

        if (guideSequenceIndex < GUIDE_ME_MAX_STEPS) {
            const isProjectsContext = currentContextId === 'featured'
                || currentContextId === 'featuredPosters'
                || currentContextId === 'featuredOther';
            const baseStepGapMs = isProjectsContext ? 240 : 320;
            const stepGapMs = Number.isFinite(messageEntry.gapAfterMs)
                ? Math.max(baseStepGapMs, messageEntry.gapAfterMs)
                : baseStepGapMs;
            scheduleGuideSequenceStep(ttl + stepGapMs);
            return;
        }

        // Keep guide mode alive so new section scrolls can still trigger relevant updates.
        guideSequencePauseContext = currentContextId;
    }

    function isFeaturedGuideContext(contextId) {
        return contextId === 'featured' || contextId === 'featuredPosters' || contextId === 'featuredOther';
    }

    function maybeResumeGuideOnScroll() {
        const priorContextId = currentGuideContextId;
        const currentContextId = syncGuideContextState();
        const contextChanged = currentContextId !== priorContextId;

        if (!guideSequenceActive) {
            if (contextChanged && !isFeaturedGuideContext(currentContextId)) {
                clearGuideVisualCue();
            }
            return;
        }

        if (!canShow({ ignoreDismissed: true })) return;

        if (contextChanged) {
            if (!isFeaturedGuideContext(currentContextId)) {
                clearGuideVisualCue();
            }

            const inPosterOrOtherContext = currentContextId === 'featuredPosters' || currentContextId === 'featuredOther';
            const posterOrOtherSeenBefore = featuredPosterOrOtherSeen;
            if (inPosterOrOtherContext) featuredPosterOrOtherSeen = true;
            const enteredPosterOrOtherFromOutsideFeatured = inPosterOrOtherContext && !isFeaturedGuideContext(priorContextId);
            const shouldHoldCombinedFeaturedLabels = inPosterOrOtherContext
                && (posterOrOtherSeenBefore || enteredPosterOrOtherFromOutsideFeatured || guideSequenceIndex >= GUIDE_ME_MAX_STEPS);
            if (shouldHoldCombinedFeaturedLabels) {
                document.dispatchEvent(new CustomEvent(GUIDE_VISUAL_CUE_EVENT, {
                    detail: {
                        type: 'sectionCue',
                        sections: ['poster', 'other'],
                        restore: false
                    }
                }));
                guideSequencePauseContext = currentContextId;
                if (guideSequenceTimer) {
                    window.clearTimeout(guideSequenceTimer);
                    guideSequenceTimer = null;
                }
                return;
            }

            // Handle scrolling backwards up the page
            if (currentContextId === 'featuredPosters' && priorContextId === 'featuredOther') {
                featuredPosterSequenceIndex = 0;
            }

            guideSequencePauseContext = null;
            if (guideSequenceTimer) {
                window.clearTimeout(guideSequenceTimer);
                guideSequenceTimer = null;
            }
            scheduleGuideSequenceStep(120);
            return;
        }

        if (guideSequenceTimer) return;
        if (!guideSequencePauseContext) return;
        if (currentContextId === guideSequencePauseContext) return;

        guideSequencePauseContext = null;
        scheduleGuideSequenceStep(220);
    }

    function hideSidekick() {
        clearMessageSwap();
        sidekick.classList.remove('is-visible', 'is-speaking');
        syncAria(true);
    }

    function canShow(options = {}) {
        const ignoreDismissed = options.ignoreDismissed === true;
        const panelOpen = detailPanel && detailPanel.getAttribute('aria-hidden') === 'false';
        const guideViewportActive = desktopQuery.matches || mobileGuideQuery.matches;
        return guideViewportActive && !reducedMotionQuery.matches && (ignoreDismissed || !dismissed) && !panelOpen && !document.hidden;
    }

    function getFocusBandBounds() {
        const topbar = document.getElementById('topbar');
        const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
        const bandTop = Math.min(window.innerHeight - 1, Math.max(0, topbarHeight + 14));
        const bandBottom = Math.max(bandTop + 1, Math.round(window.innerHeight * 0.74));
        return { bandTop, bandBottom };
    }

    function getBandOverlap(rect, bandTop, bandBottom) {
        const overlapTop = Math.max(rect.top, bandTop);
        const overlapBottom = Math.min(rect.bottom, bandBottom);
        return Math.max(0, overlapBottom - overlapTop);
    }

    function getCurrentSectionId() {
        const sections = Array.from(document.querySelectorAll('main section[id]'));
        if (!sections.length) return 'home';

        const { bandTop, bandBottom } = getFocusBandBounds();
        let bestSectionId = 'home';
        let bestOverlap = 0;

        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const overlap = getBandOverlap(rect, bandTop, bandBottom);
            if (overlap > bestOverlap) {
                bestOverlap = overlap;
                bestSectionId = section.id;
            }
        });

        if (bestOverlap > 0) return bestSectionId;

        const probeY = Math.round((bandTop + bandBottom) * 0.5);
        for (let index = 0; index < sections.length; index += 1) {
            const section = sections[index];
            const rect = section.getBoundingClientRect();
            if (rect.top <= probeY && rect.bottom >= probeY) return section.id;
        }

        let nearestSectionId = sections[0].id;
        let nearestDistance = Number.POSITIVE_INFINITY;
        sections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const distance = Math.min(
                Math.abs(rect.top - bandTop),
                Math.abs(rect.bottom - bandTop)
            );
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestSectionId = section.id;
            }
        });

        return nearestSectionId;
    }

    function probeHitsElement(element, probeY) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.top <= probeY && rect.bottom >= probeY;
    }

    function getGuideContextAnchorY() {
        const topbar = document.getElementById('topbar');
        const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
        const minAnchorY = topbarHeight + 36;
        const preferredAnchorY = Math.round(window.innerHeight * 0.28);
        return Math.max(minAnchorY, preferredAnchorY);
    }

    function getCurrentGuideContextId() {
        const sectionId = getCurrentSectionId();
        if (sectionId !== 'featured') return sectionId;

        const anchorY = getGuideContextAnchorY();
        if (probeHitsElement(featuredMapZone, anchorY)) return 'featured';
        if (probeHitsElement(featuredPosterZone, anchorY)) return 'featuredPosters';
        if (probeHitsElement(featuredOtherZone, anchorY)) return 'featuredOther';

        const { bandTop, bandBottom } = getFocusBandBounds();
        const featuredZones = [
            { id: 'featured', element: featuredMapZone },
            { id: 'featuredPosters', element: featuredPosterZone },
            { id: 'featuredOther', element: featuredOtherZone }
        ];

        let bestZoneId = 'featured';
        let bestZoneOverlap = 0;
        featuredZones.forEach((zone) => {
            if (!zone.element) return;
            const overlap = getBandOverlap(zone.element.getBoundingClientRect(), bandTop, bandBottom);
            if (overlap > bestZoneOverlap) {
                bestZoneOverlap = overlap;
                bestZoneId = zone.id;
            }
        });
        if (bestZoneOverlap > 0) return bestZoneId;

        const probeY = Math.round((bandTop + bandBottom) * 0.5);
        if (probeHitsElement(featuredPosterZone, probeY)) return 'featuredPosters';
        if (probeHitsElement(featuredOtherZone, probeY)) return 'featuredOther';
        if (probeHitsElement(featuredMapZone, probeY)) return 'featured';
        return 'featured';
    }

    function syncGuideContextState() {
        const nextContextId = getCurrentGuideContextId();
        if (nextContextId !== currentGuideContextId) {
            previousGuideContextId = currentGuideContextId;
            currentGuideContextId = nextContextId;
        }
        return currentGuideContextId;
    }

    function normalizeMessageEntry(entry, sectionId, index) {
        if (!entry) return null;
        if (typeof entry === 'string') {
            return { id: `${sectionId}-${index}`, text: entry, cue: null, ttlMs: null, gapAfterMs: null };
        }
        if (typeof entry === 'object' && typeof entry.text === 'string') {
            return {
                id: typeof entry.id === 'string' ? entry.id : `${sectionId}-${index}`,
                text: entry.text,
                cue: entry.cue || null,
                ttlMs: Number.isFinite(entry.ttlMs) ? Number(entry.ttlMs) : null,
                gapAfterMs: Number.isFinite(entry.gapAfterMs) ? Number(entry.gapAfterMs) : null
            };
        }
        return null;
    }

    function emitGuideVisualCue(messageEntry) {
        if (!messageEntry || !messageEntry.cue) return;
        const contextId = getCurrentGuideContextId();
        const cueType = typeof messageEntry.cue.type === 'string' ? messageEntry.cue.type : 'spotlight';
        const isFeaturedContext = contextId === 'featured' || contextId === 'featuredPosters' || contextId === 'featuredOther';
        if (cueType === 'resumeCue') {
            if (contextId !== 'resume') return;
        } else if (!isFeaturedContext) {
            return;
        }
        document.dispatchEvent(new CustomEvent(GUIDE_VISUAL_CUE_EVENT, { detail: messageEntry.cue }));
    }

    function clearGuideVisualCue() {
        document.dispatchEvent(new CustomEvent(GUIDE_VISUAL_CUE_EVENT, { detail: { type: 'clear' } }));
    }

    function pickMessage(sectionId) {
        const pool = messagePools[sectionId] || messagePools.default;
        if (!pool.length) return null;

        const startIndex = Math.floor(Math.random() * pool.length);
        let selected = normalizeMessageEntry(pool[startIndex], sectionId, startIndex);
        if (!selected) return null;

        if (pool.length > 1 && selected.id === lastMessageKey) {
            const nextIndex = (startIndex + 1) % pool.length;
            selected = normalizeMessageEntry(pool[nextIndex], sectionId, nextIndex) || selected;
        }

        lastMessageKey = selected.id;
        return selected;
    }

    function pickFirstMessage(sectionId) {
        const pool = messagePools[sectionId] || messagePools.default;
        if (!pool.length) return null;
        const first = normalizeMessageEntry(pool[0], sectionId, 0);
        if (!first) return null;
        lastMessageKey = first.id;
        return first;
    }

    function pickMessageById(sectionId, targetId) {
        const pool = messagePools[sectionId] || messagePools.default;
        if (!pool.length || !targetId) return null;

        for (let index = 0; index < pool.length; index += 1) {
            const candidate = normalizeMessageEntry(pool[index], sectionId, index);
            if (!candidate) continue;
            if (candidate.id !== targetId) continue;
            lastMessageKey = candidate.id;
            return candidate;
        }

        return null;
    }

    function pickGuideSequenceMessage(sectionId, stepIndex) {
        const pool = messagePools[sectionId] || messagePools.default;
        if (!pool.length) return null;

        if (sectionId === 'featured' && stepIndex < pool.length) {
            const forced = normalizeMessageEntry(pool[stepIndex], sectionId, stepIndex);
            if (forced) {
                lastMessageKey = forced.id;
                return forced;
            }
        }

        if (sectionId === 'featuredPosters') {
            if (featuredPosterSequenceIndex >= pool.length) return null;
            const posterIndex = featuredPosterSequenceIndex;
            const forcedPoster = normalizeMessageEntry(pool[posterIndex], sectionId, posterIndex);
            featuredPosterSequenceIndex += 1;
            if (forcedPoster) {
                lastMessageKey = forcedPoster.id;
                return forcedPoster;
            }
        }

        return pickMessage(sectionId);
    }

    function getReadingDurationMs(text) {
        const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
        const computed = 2200 + words * 320;
        return Math.max(4200, Math.min(8600, computed));
    }

    function getMessageDurationMs(messageEntry) {
        if (messageEntry && Number.isFinite(messageEntry.ttlMs)) {
            return Math.max(1600, messageEntry.ttlMs);
        }
        return getReadingDurationMs(messageEntry ? messageEntry.text : '');
    }

    function showMessage(text, ttl = null, options = {}) {
        if (!canShow(options) || !text) return false;
        const durationMs = Number.isFinite(ttl) ? ttl : getReadingDurationMs(text);
        const persist = options.persist === true;
        const nextText = String(text);
        const wasVisible = sidekick.classList.contains('is-visible');
        const shouldAnimateSwap = wasVisible
            && messageEl.textContent
            && messageEl.textContent !== nextText
            && !reducedMotionQuery.matches;

        clearMessageSwap();
        if (shouldAnimateSwap) {
            messageEl.classList.add('is-swapping');
            messageSwapTimer = window.setTimeout(() => {
                messageEl.textContent = nextText;
                messageEl.classList.remove('is-swapping');
                messageSwapTimer = null;
            }, 120);
        } else {
            messageEl.textContent = nextText;
            messageEl.classList.remove('is-swapping');
        }
        sidekick.classList.add('is-visible');
        syncAria(false);

        /* --- Sparky emotes on message changes --- */
        if (!wasVisible) {
            // First appearance: wave hello
            sidekick.classList.remove('sparky--happy', 'sparky--surprised', 'sparky--sleepy');
            sidekick.classList.add('sparky--wave');
            setTimeout(() => { sidekick.classList.remove('sparky--wave'); }, 1200);
            sidekick.classList.remove('is-speaking');
            requestAnimationFrame(() => {
                sidekick.classList.add('is-speaking');
            });
        } else if (shouldAnimateSwap) {
            // New message while already visible: happy reaction
            sidekick.classList.remove('sparky--wave', 'sparky--surprised', 'sparky--sleepy');
            sidekick.classList.add('sparky--happy');
            setTimeout(() => { sidekick.classList.remove('sparky--happy'); }, 800);
            sidekick.classList.add('is-speaking');
        } else {
            sidekick.classList.add('is-speaking');
        }

        if (hideTimer) {
            window.clearTimeout(hideTimer);
            hideTimer = null;
        }
        if (persist) {
            return true;
        }
        hideTimer = window.setTimeout(() => {
            hideSidekick();
            hideTimer = null;
        }, durationMs);
        return true;
    }

    function scrollGuideToProjectsStart() {
        const topbar = document.getElementById('topbar');
        const titleAnchor = document.getElementById('robot-focus-title');
        const stageAnchor = document.getElementById('robot-stage');
        const sectionHeadAnchor = featuredEyebrow || featuredSectionHead;
        const isMobileViewport = window.matchMedia('(max-width: 980px)').matches;
        const anchorCandidates = isMobileViewport
            ? [sectionHeadAnchor, featuredSection, titleAnchor, stageAnchor]
            : [titleAnchor, stageAnchor, sectionHeadAnchor, featuredSection];
        const anchor = anchorCandidates.find((candidate) => {
            if (!(candidate instanceof Element)) return false;
            const rect = candidate.getBoundingClientRect();
            return candidate.getClientRects().length > 0 && rect.height > 0 && rect.width > 0;
        }) || sectionHeadAnchor || featuredSection || stageAnchor || titleAnchor;
        if (!anchor) return;

        const topbarHeight = topbar ? topbar.getBoundingClientRect().height : 0;
        const anchorTop = window.scrollY + anchor.getBoundingClientRect().top;
        const scrollOffset = isMobileViewport ? 2 : 10;
        const targetTop = Math.max(0, anchorTop - topbarHeight - scrollOffset);

        window.scrollTo({
            top: targetTop,
            behavior: 'smooth'
        });
    }

    function startGuideMeSequence() {
        dismissed = false;
        try {
            sessionStorage.removeItem(SESSION_KEY);
        } catch (error) {
            // Ignore storage errors (private mode / blocked storage).
        }

        markGuideIconHintSeen();
        clearTimers();
        clearIntroPromptTimer();
        clearGuideTriggerCue();
        clearGuideVisualCue();
        guideSequenceActive = true;
        guideSequenceIndex = 0;
        guideSequencePauseContext = null;
        featuredGuideComplete = false;
        featuredPosterSequenceIndex = 0;
        featuredPosterOrOtherSeen = false;
        pendingGuideReplayEntry = null;
        pendingGuideReplayContext = null;
        lastSpokenEntry = null;

        scrollGuideToProjectsStart();

        scheduleGuideSequenceStep(560);
    }

    function handleEnvironmentChange() {
        if (guideSequenceActive) {
            if (!canShow({ ignoreDismissed: true })) {
                if (hideTimer && guideSequenceIndex > 0 && lastSpokenEntry) {
                    // If interrupted while speaking, replay that same message on resume.
                    pendingGuideReplayEntry = lastSpokenEntry;
                    pendingGuideReplayContext = getCurrentGuideContextId();
                    guideSequenceIndex -= 1;
                }
                clearTimers();
                clearGuideTriggerCue();
                clearGuideVisualCue();
                hideSidekick();
                return;
            }

            if (!guideSequenceTimer) {
                scheduleGuideSequenceStep(260);
            }
            return;
        }

        if (!canShow()) {
            clearTimers();
            clearGuideTriggerCue();
            clearGuideVisualCue();
            hideSidekick();
            return;
        }
    }

    avatarBtn.addEventListener('click', () => {
        markGuideIconHintSeen();
        if (guideSequenceActive || !canShow({ ignoreDismissed: true })) return;
        clearIntroPromptTimer();
        clearGuideTriggerCue();
        document.dispatchEvent(new CustomEvent(GUIDE_TOUR_EVENT));
    });

    dismissBtn.addEventListener('click', () => {
        guideSequenceActive = false;
        dismissed = true;
        try {
            sessionStorage.setItem(SESSION_KEY, '1');
        } catch (error) {
            // Ignore storage errors (private mode / blocked storage).
        }
        clearTimers();
        clearIntroPromptTimer();
        clearGuideTriggerCue();
        clearGuideVisualCue();
        hideSidekick();
    });

    if (guideTriggerBtn) {
        guideTriggerBtn.addEventListener('click', clearGuideTriggerCue);
    }

    document.addEventListener(GUIDE_TOUR_EVENT, () => {
        startGuideMeSequence();
    });

    if (detailPanel) {
        const panelObserver = new MutationObserver(handleEnvironmentChange);
        panelObserver.observe(detailPanel, { attributes: true, attributeFilter: ['aria-hidden'] });
    }

    function bindMediaChange(query, handler) {
        if (typeof query.addEventListener === 'function') {
            query.addEventListener('change', handler);
            return;
        }
        if (typeof query.addListener === 'function') {
            query.addListener(handler);
        }
    }

    bindMediaChange(desktopQuery, handleEnvironmentChange);
    bindMediaChange(mobileGuideQuery, handleEnvironmentChange);
    bindMediaChange(reducedMotionQuery, handleEnvironmentChange);
    document.addEventListener('visibilitychange', handleEnvironmentChange);
    window.addEventListener('resize', handleEnvironmentChange);
    window.addEventListener('scroll', maybeResumeGuideOnScroll, { passive: true });

    if (canShow({ ignoreDismissed: true })) {
        introPromptTimer = window.setTimeout(() => {
            introPromptTimer = null;
            if (!canShow({ ignoreDismissed: true }) || guideSequenceActive) return;
            const introTtlMs = mobileGuideQuery.matches ? 3200 : 5600;
            const shown = showMessage(INTRO_PROMPT, introTtlMs, { ignoreDismissed: true });
            if (shown) showGuideTriggerCue(introTtlMs);
        }, 2500);
    } else {
        clearGuideTriggerCue();
        hideSidekick();
    }
})();

/* ========================================================
   SPARKY AVATAR · EYE TRACKING + EMOTIONS + PARTICLES (premium)
   ======================================================== */
(function initSparkyAvatar() {
    const sidekick = document.getElementById('robot-sidekick');
    const face = document.getElementById('sparky-face');
    const particleContainer = document.getElementById('sparky-particles');
    const avatarWrap = sidekick ? sidekick.querySelector('.sparky-avatar-wrap') : null;
    if (!sidekick || !face) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentEmotion = '';
    let emotionTimer = null;
    let idleTimer = null;
    let currentEyeX = 0;
    let hasMaterialized = false;

    // --- Particle System ---
    const PARTICLE_COUNT = 6;
    const particles = [];

    function createParticles() {
        if (!particleContainer) return;
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const el = document.createElement('span');
            el.className = 'sparky-particle';
            const startX = (Math.random() - 0.5) * 40;
            const startY = Math.random() * 40 + 10;
            const endX = startX + (Math.random() - 0.5) * 20;
            const endY = -(Math.random() * 35 + 15);
            const duration = 2.5 + Math.random() * 2;
            const delay = Math.random() * duration;
            const size = 1.5 + Math.random() * 2.5;

            el.style.setProperty('--start-x', startX + 'px');
            el.style.setProperty('--start-y', startY + 'px');
            el.style.setProperty('--end-x', endX + 'px');
            el.style.setProperty('--end-y', endY + 'px');
            el.style.setProperty('--drift-duration', duration + 's');
            el.style.setProperty('--drift-delay', delay + 's');
            el.style.width = size + 'px';
            el.style.height = size + 'px';

            particleContainer.appendChild(el);
            particles.push(el);
        }
    }

    createParticles();

    // --- Materialize Entrance ---
    function playMaterializeEntrance() {
        if (hasMaterialized || !avatarWrap) return;
        hasMaterialized = true;
        avatarWrap.classList.add('sparky--materializing');
        avatarWrap.addEventListener('animationend', function handler() {
            avatarWrap.classList.remove('sparky--materializing');
            avatarWrap.removeEventListener('animationend', handler);
        });
    }

    // Observer to detect when sidekick becomes visible
    const visObserver = new MutationObserver(function () {
        if (sidekick.classList.contains('is-visible') && !hasMaterialized) {
            playMaterializeEntrance();
        }
    });
    visObserver.observe(sidekick, { attributes: true, attributeFilter: ['class'] });

    // --- Eye Tracking (with lerp for organic movement) ---
    function updateEyes() {
        const rect = sidekick.getBoundingClientRect();
        const centerX = rect.right - 42;
        const centerY = rect.bottom - 50;
        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxOffset = 3;
        const factor = dist > 0 ? Math.min(maxOffset / dist, maxOffset / 80) : 0;
        const targetEyeX = Math.max(-3, Math.min(3, dx * factor));

        // Lerp for smooth following
        currentEyeX += (targetEyeX - currentEyeX) * 0.15;
        sidekick.style.setProperty('--eye-x', currentEyeX.toFixed(2) + 'px');
        sidekick.style.setProperty('--eye-y', '0px');
    }

    function eyeLoop() {
        updateEyes();
        requestAnimationFrame(eyeLoop);
    }

    // --- Emotions ---
    function setEmotion(emotion, durationMs) {
        if (emotionTimer) { clearTimeout(emotionTimer); emotionTimer = null; }
        sidekick.classList.remove('sparky--happy', 'sparky--surprised', 'sparky--sleepy');
        currentEmotion = emotion;
        if (emotion) {
            sidekick.classList.add('sparky--' + emotion);
            if (durationMs) {
                emotionTimer = setTimeout(() => {
                    sidekick.classList.remove('sparky--' + emotion);
                    if (currentEmotion === emotion) currentEmotion = '';
                }, durationMs);
            }
        }
    }

    function resetIdleTimer() {
        if (currentEmotion === 'sleepy') setEmotion('', 0);
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (currentEmotion !== 'happy' && currentEmotion !== 'surprised') {
                const isMobile = window.matchMedia('(max-width: 980px)').matches;
                if (!isMobile) {
                    setEmotion('sleepy', 0);
                }
            }
        }, 6000);
    }

    // --- Events ---
    document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        resetIdleTimer();
    }, { passive: true });

    document.querySelectorAll('.btn, .btn-primary, .btn-ghost, .card-node, .card, .robot-hotspot, nav a, .skill-pill').forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (currentEmotion !== 'surprised') setEmotion('happy', 0);
        });
        el.addEventListener('mouseleave', () => {
            if (currentEmotion === 'happy') setEmotion('', 0);
        });
    });

    document.addEventListener('click', function (e) {
        const target = e.target;
        if (!(target instanceof Element)) return;
        const isInteractive = target.closest('.btn, .btn-primary, .btn-ghost, .card-node-open, .robot-guide-trigger, .card-node, .robot-hotspot, nav a');
        if (isInteractive) setEmotion('surprised', 500);
    });

    requestAnimationFrame(eyeLoop);
    resetIdleTimer();
})();

