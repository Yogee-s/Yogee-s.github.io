/* ==========================================================
   Case-study behaviour, shared by the homepage overlay and the
   standalone /work/<slug>/ pages.
   ========================================================== */

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Muted loops play only while on screen. `root` is the scrolling element (null = viewport). */
export function autoplayVideos(scope, root = null) {
  const videos = [...scope.querySelectorAll('video[data-autoplay]')];
  if (!videos.length || !('IntersectionObserver' in window)) return () => {};
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const v = e.target;
        if (e.isIntersecting && !reduced()) {
          v.muted = true;
          if (v.preload === 'none') v.preload = 'auto';
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      }
    },
    { root, threshold: 0.35 },
  );
  videos.forEach((v) => {
    v.muted = true;
    v.defaultMuted = true;
    io.observe(v);
  });
  return () => io.disconnect();
}

/**
 * Wires one project page (legacy layout): the "On this page" outline follows the reader,
 * in-page links scroll smoothly, and the in-view video loops start.
 * `root` is the .lp wrapper; `scroller` is the element that scrolls (window for standalone pages).
 */
export function initCaseStudy(root, scroller) {
  const isWindow = scroller === window;
  const cleanups = [];
  const content = root.querySelector('.detail-content');
  const bar = root.querySelector('.detail-header-bar');
  const navH = () => (isWindow ? document.getElementById('nav')?.offsetHeight ?? 64 : 0);

  // the outline sticks just under the header bar, whose height changes with the viewport
  const syncBar = () => content?.style.setProperty('--cs-bar', `${navH() + (bar?.offsetHeight ?? 0)}px`);
  syncBar();
  window.addEventListener('resize', syncBar);
  cleanups.push(() => window.removeEventListener('resize', syncBar));

  // ---- outline: highlight the entry for whatever sits under the header bar
  const toc = root.querySelector('.cs-toc');
  if (toc) {
    const entries = [...toc.querySelectorAll('a[href^="#"]')]
      .map((link) => ({ link, target: root.querySelector(link.getAttribute('href')) }))
      .filter((e) => e.target);
    const sections = [...toc.querySelectorAll(':scope > ol > li')];
    let lastSection = null;
    const update = () => {
      const line = (isWindow ? 0 : scroller.getBoundingClientRect().top) + navH() + (bar?.offsetHeight ?? 0) + 80;
      let current = null;
      entries.forEach((e) => {
        if (e.target.getBoundingClientRect().top <= line) current = e;
      });
      entries.forEach(({ link }) => link.classList.toggle('is-active', link === current?.link));
      sections.forEach((li) => li.classList.toggle('is-current', !!current && li.contains(current.link)));
      // phone layout: the outline is a sideways strip, keep the current chip in view
      const cur = sections.find((li) => li.classList.contains('is-current'));
      if (cur && cur !== lastSection && toc.scrollWidth > toc.clientWidth) {
        toc.scrollTo({ left: cur.offsetLeft - 16, behavior: reduced() ? 'auto' : 'smooth' });
      }
      lastSection = cur;
    };
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };
    scroller.addEventListener('scroll', onScroll, { passive: true });
    cleanups.push(() => scroller.removeEventListener('scroll', onScroll));
    update();
  }

  // ---- in-page links (outline + inline)
  const onClick = (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || !root.contains(a)) return;
    const target = root.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.style.scrollMarginTop = `${navH() + (bar?.offsetHeight ?? 0) + 16}px`;
    target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
  };
  root.addEventListener('click', onClick);
  cleanups.push(() => root.removeEventListener('click', onClick));

  cleanups.push(autoplayVideos(root, isWindow ? null : scroller));
  return () => cleanups.forEach((f) => f());
}

/* ---------- lightbox ---------- */
export function initLightbox() {
  const box = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  if (!box || !img) return { isOpen: () => false, close() {} };
  let opener = null;
  const close = () => {
    box.classList.remove('open');
    box.setAttribute('aria-hidden', 'true');
    img.removeAttribute('src');
    opener?.focus?.();
  };
  document.addEventListener('click', (e) => {
    const t = e.target.closest?.('.js-lightbox');
    if (t instanceof HTMLImageElement) {
      opener = t;
      img.src = t.currentSrc || t.src;
      img.alt = t.alt || '';
      box.classList.add('open');
      box.setAttribute('aria-hidden', 'false');
      document.getElementById('lightbox-close')?.focus();
      return;
    }
    if (box.classList.contains('open') && (e.target === box || e.target.id === 'lightbox-close' || e.target === img)) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && box.classList.contains('open')) {
      e.stopImmediatePropagation();
      close();
    }
  });
  return { isOpen: () => box.classList.contains('open'), close };
}

/* ---------- PDF viewer: full screen with the zoom toolbar, clean inline view otherwise ---------- */
export function initPdfFullscreen() {
  const swap = (frame, toolbar) => {
    const obj = frame.querySelector('.pdf-embed');
    if (!obj) return;
    // remember the page's own inline settings (e.g. fit-to-width) so leaving full screen restores them
    frame.dataset.inline ??= obj.getAttribute('data');
    const base = frame.dataset.inline.split('#')[0];
    const next = obj.cloneNode(true);
    next.setAttribute('data', toolbar ? `${base}#view=FitH` : frame.dataset.inline);
    obj.replaceWith(next);
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.pdf-fs, .pdf-fs-btn');
    if (btn) {
      const frame = btn.closest('.pdf, .pdf-item')?.querySelector('.pdf-frame, .pdf-embed-container');
      if (frame?.requestFullscreen) {
        frame
          .requestFullscreen()
          .then(() => {
            frame.dataset.fs = 'on';
            swap(frame, true);
          })
          .catch(() => window.open(btn.dataset.pdf, '_blank', 'noopener'));
      } else {
        window.open(btn.dataset.pdf, '_blank', 'noopener');
      }
      return;
    }
    if (e.target.closest('.pdf-exit, .pdf-fs-exit') && document.fullscreenElement) document.exitFullscreen();
  });
  document.addEventListener('fullscreenchange', () => {
    document.querySelectorAll('[data-fs="on"]').forEach((f) => {
      if (f !== document.fullscreenElement) {
        f.dataset.fs = '';
        swap(f, false);
      }
    });
  });
}

/* ---------- top hairline showing reading progress ---------- */
export function initNavProgress() {
  const bar = document.getElementById('nav-progress');
  const nav = document.getElementById('nav');
  if (!bar) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    nav?.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!raf) raf = requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}
