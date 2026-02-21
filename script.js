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

/* ========================================================
   FEATURED PROJECTS — ROBOT BODY MAP
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

    const focusTitle = document.getElementById('robot-focus-title');
    const focusDesc = document.getElementById('robot-focus-desc');
    const partLabel = document.getElementById('robot-part-label');
    const projectLabel = document.getElementById('robot-project-label');

    const panel = document.getElementById('detail-panel');
    const panelContent = document.getElementById('detail-content');
    const panelTitle = document.getElementById('bar-project-title');
    const panelPill = document.getElementById('bar-project-pill');
    const overlay = document.getElementById('detail-overlay');

    const PROJECTS = {
        'boxbunny': {
            panelTitle: 'BoxBunny: Intelligent Boxing Robot',
            panelPill: 'In Progress',
            focusTitle: 'Full-Body Integration',
            focusDesc: 'Full-body integration across perception, control, and feedback.',
            partLabel: 'Scope: Full-body system integration',
            projectLabel: 'BoxBunny - vision, reasoning, and control integrated into one stack',
            cameraOrbit: '0deg 88deg 3.9m',
            cameraTarget: '0m 0.02m 0m',
            color: '#f59e0b',
            template: 'tpl-boxbunny'
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

    function openDetailPanel(projectId) {
        const config = PROJECTS[projectId];
        if (!config || !panel || !panelContent || !overlay) return;

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
                selectProject(projectId);
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                selectProject(projectId);
                openDetailPanel(projectId);
            }
        });

        card.addEventListener('click', () => {
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
            selectProject(projectId);
            const card = cards.find((node) => node.dataset.project === projectId);
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        hotspot.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
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
