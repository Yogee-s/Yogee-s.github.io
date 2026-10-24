/* ==========================================================
   Homepage behaviour
   ========================================================== */
import Lenis from 'lenis';
import { autoplayVideos, initCaseStudy, initLightbox, initPdfFullscreen, initNavProgress } from './case-study.js';
import { projects } from '../data/projects';
import { rich } from '../lib/rich';

const mq = (q) => window.matchMedia(q).matches;
const reduced = mq('(prefers-reduced-motion: reduce)');
const desktopMedia = window.matchMedia('(min-width: 1100px)');
const desktop = () => desktopMedia.matches;
const navH = () => document.getElementById('nav')?.offsetHeight ?? 64;

const phoneMedia = window.matchMedia('(max-width: 760px)');

/* ---------- folds (phones): About details and More projects start closed and glide open ---------- */
const folds = [...document.querySelectorAll('[data-fold]')];
function setFold(f, open, animate = true) {
  const btn = f.querySelector(':scope > .fold-toggle');
  const body = f.querySelector(':scope > .fold-body');
  if (!btn || !body || (btn.getAttribute('aria-expanded') === 'true') === open) return;
  btn.setAttribute('aria-expanded', String(open));
  const start = f.classList.contains('is-open') ? body.getBoundingClientRect().height : 0;
  body.getAnimations().forEach((a) => a.cancel());
  if (!animate || reduced || !phoneMedia.matches) {
    f.classList.toggle('is-open', open);
    return;
  }
  f.classList.add('is-open');
  const end = open ? body.offsetHeight : 0;
  body.style.overflow = 'hidden';
  const anim = body.animate(
    { height: [`${start}px`, `${end}px`], opacity: open ? [start ? 1 : 0, 1] : [1, 0] },
    { duration: open ? 420 : 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
  );
  anim.onfinish = () => {
    body.style.overflow = '';
    if (!open) f.classList.remove('is-open');
  };
}
folds.forEach((f) =>
  f.querySelector(':scope > .fold-toggle')?.addEventListener('click', (e) =>
    setFold(f, e.currentTarget.getAttribute('aria-expanded') !== 'true'),
  ),
);
// back to closed whenever the layout becomes a phone one (larger screens ignore the folds)
phoneMedia.addEventListener('change', () => folds.forEach((f) => setFold(f, false, false)));

/* ---------- smooth scroll (desktop pointer only) ---------- */
let lenis = null;
if (!reduced && mq('(pointer: fine)')) {
  lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true });
  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}

function scrollToEl(el) {
  if (!el) return;
  const tabsH = !desktop() && el.matches('.sp') ? document.querySelector('.stage-tabs')?.offsetHeight ?? 0 : 0;
  // layout position, ignoring any rise-in transform still running on the target
  let y = 0;
  for (let n = el; n; n = n.offsetParent) y += n.offsetTop;
  // on phones the top bar tucks away while scrolling down, so only the project tabs stay above
  const navGone = phoneMedia.matches && y > window.scrollY;
  const offset = (navGone ? 0 : navH()) + tabsH + (tabsH ? 20 : 16);
  if (lenis) lenis.scrollTo(el, { offset: -offset, duration: 1.2 });
  else window.scrollTo({ top: y - offset, behavior: reduced ? 'auto' : 'smooth' });
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.closest('.lp')) return;
  const id = a.getAttribute('href');
  const el = id === '#top' ? document.body : document.querySelector(id);
  if (!el) return;
  e.preventDefault();
  if (id === '#top') {
    lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  } else {
    scrollToEl(el);
  }
  history.replaceState(history.state, '', id === '#top' ? '/' : id);
});

/* ---------- hero: type out each role in turn ---------- */
const roleLine = document.querySelector('.hero-role');
const roleEl = document.getElementById('hero-role');
if (roleLine && roleEl && !reduced) {
  const roles = JSON.parse(roleLine.dataset.roles || '[]');
  let r = 0;
  let n = roles[0]?.length ?? 0;
  let deleting = true;
  const tick = () => {
    const word = roles[r];
    n += deleting ? -1 : 1;
    roleEl.textContent = word.slice(0, n);
    if (deleting && n === 0) {
      deleting = false;
      r = (r + 1) % roles.length;
      return setTimeout(tick, 350);
    }
    if (!deleting && n === roles[r].length) {
      deleting = true;
      return setTimeout(tick, 2200);
    }
    setTimeout(tick, deleting ? 28 : 58);
  };
  setTimeout(tick, 2600);
}

/* ---------- reveal on scroll ---------- */
const revealIO = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        revealIO.unobserve(e.target);
      }
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
);
document.querySelectorAll('[data-reveal]').forEach((el) => revealIO.observe(el));
// phones: the timeline rows also rise in one by one
if (phoneMedia.matches && !reduced)
  document.querySelectorAll('.tl-row').forEach((el) => {
    el.classList.add('m-reveal');
    revealIO.observe(el);
  });

/* ---------- nav ---------- */
initNavProgress();
const navLinks = [...document.querySelectorAll('[data-nav]')];
const navSections = ['about', 'work', 'experience', 'contact'].map((id) => document.getElementById(id)).filter(Boolean);
let navRaf = 0;
function syncNav() {
  navRaf = 0;
  const line = window.innerHeight * 0.45;
  let current = '';
  for (const sec of navSections) {
    const r = sec.getBoundingClientRect();
    if (r.top <= line && r.bottom > line) current = sec.id;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = 'contact';
  navLinks.forEach((l) => {
    const active = l.dataset.nav === current;
    l.classList.toggle('is-active', active);
    if (active) l.setAttribute('aria-current', 'location');
    else l.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', () => navRaf || (navRaf = requestAnimationFrame(syncNav)), { passive: true });
window.addEventListener('resize', syncNav);
syncNav();

/* ---------- media ---------- */
const lightbox = initLightbox();
initPdfFullscreen();

/* ---------- work: a pinned stage that steps through the projects ---------- */
let scan = null;
const heroEl = document.getElementById('top');
const workTrack = document.getElementById('work-track');
const railFrame = document.getElementById('rail-frame');
const scanView = document.getElementById('scan-view');
const rail = {
  index: document.getElementById('rail-index'),
  title: document.getElementById('rail-title'),
  caption: document.getElementById('rail-caption'),
};
const panels = [...document.querySelectorAll('.sp')];
const tabs = [...document.querySelectorAll('.stage-tab')];
const progressBar = document.getElementById('stage-progress');
let cardScene = panels[0]?.dataset.scene;
let step = -1;
let inWork = false;
const visibleCardVideos = new Set();
const STEP_VH = 0.62; // scroll distance per project, as a share of the viewport height

function playActive() {
  panels.forEach((pnl) => {
    const v = pnl.querySelector('video');
    if (!v || !desktop()) return;
    if (visibleCardVideos.has(v) && !document.hidden && !document.documentElement.classList.contains('case-open') && pnl.classList.contains('is-active') && !reduced) {
      if (v.preload === 'none') v.preload = 'auto';
      v.muted = true;
      v.play().catch(() => {});
    } else v.pause();
  });
}

function showScene(slug) {
  cardScene = slug;
  const p = projects.find((x) => x.slug === slug);
  if (!p) return;
  if (inWork) scan?.setScene(slug);
  if (rail.title && rail.title.textContent !== p.title) {
    railFrame?.classList.add('is-switching');
    setTimeout(() => {
      const i = projects.findIndex((x) => x.slug === slug);
      rail.index.textContent = String(i + 1).padStart(2, '0');
      rail.title.textContent = p.title;
      rail.caption.innerHTML = rich(p.sceneCaption);
      railFrame?.classList.remove('is-switching');
    }, 160);
  }
}

function setStep(i) {
  if (i === step) return;
  const dir = i > step ? 1 : -1;
  step = i;
  panels.forEach((pnl, k) => {
    pnl.classList.toggle('is-active', k === i);
    pnl.classList.toggle('is-before', k < i);
    pnl.style.setProperty('--dir', String(dir));
  });
  tabs.forEach((t, k) => {
    t.classList.toggle('is-active', k === i);
    t.setAttribute('aria-current', k === i ? 'true' : 'false');
  });
  moveGlider();
  if (stageCount) stageCount.textContent = String(i + 1);
  // phones: arriving at More (by swipe or tab) opens it
  if (carousel() && panels[i].matches('[data-fold]')) setFold(panels[i], true);
  fitTrack();
  showScene(panels[i].dataset.scene);
  playActive();
}

// phones: the highlight behind the active tab glides to it and takes on its colour
const glider = document.querySelector('.stage-glider');
function moveGlider() {
  const t = tabs[step];
  if (!glider || !t) return;
  glider.style.setProperty('--gx', `${t.offsetLeft}px`);
  glider.style.setProperty('--gw', `${t.offsetWidth}px`);
  glider.style.setProperty('--g-tone', getComputedStyle(t).getPropertyValue('--tone'));
}
window.addEventListener('resize', moveGlider);

/* phones: one project at a time; the cards sit side by side and are swiped (or picked from the tabs),
   and the row takes the height of the card in view */
const track = document.querySelector('.stage-projects');
const stageCount = document.getElementById('stage-count');
const carousel = () => !!track && phoneMedia.matches && panels.length > 0;
let trackTarget = -1;
let settleTimer = 0;

function fitTrack() {
  if (!track) return;
  if (!carousel()) {
    track.style.height = '';
    return;
  }
  const p = panels[step];
  if (p) track.style.height = `${p.offsetHeight}px`;
}

// after a swipe from deep inside a long card, bring the new card in from its top
function settleTrack() {
  trackTarget = -1;
  const pill = document.querySelector('.stage-tabs');
  const limit = (pill?.getBoundingClientRect().bottom ?? navH()) + 4;
  if (track.getBoundingClientRect().top < limit - 8) scrollToEl(panels[step]);
}

function showCard(i) {
  markSwiped();
  trackTarget = i;
  setStep(i);
  track.scrollTo({ left: i * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
  clearTimeout(settleTimer);
  settleTimer = setTimeout(settleTrack, reduced ? 0 : 420);
}

track?.addEventListener(
  'scroll',
  () => {
    if (!carousel()) return;
    // while a tab's slide is running, ignore the cards it passes on the way
    if (trackTarget < 0) {
      // a real drag, not the browser settling the snap by a pixel or two
      if (Math.abs(track.scrollLeft - step * track.clientWidth) > 24) markSwiped();
      const i = Math.round(track.scrollLeft / track.clientWidth);
      if (panels[i]) setStep(i);
    }
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settleTrack, 160);
  },
  { passive: true },
);

if (track && 'ResizeObserver' in window) {
  const ro = new ResizeObserver(() => carousel() && fitTrack());
  panels.forEach((p) => ro.observe(p));
}

// the first time the projects come into view, the card slides aside for a moment to show the next
// one, then settles back: a one-off cue that they swipe (never repeated once the reader has)
let swiped = false;
function markSwiped() {
  if (swiped) return;
  swiped = true;
  document.querySelector('.stage-hint')?.classList.add('is-done');
}
if (track && !reduced && 'IntersectionObserver' in window) {
  const nudgeIO = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting) || !carousel()) return;
      nudgeIO.disconnect();
      setTimeout(() => {
        if (swiped || step !== 0) return;
        const frames = [
          { transform: 'none' },
          { transform: 'translateX(-64px)', offset: 0.4, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' },
          { transform: 'translateX(5px)', offset: 0.78 },
          { transform: 'none' },
        ];
        panels.slice(0, 2).forEach((p) => p.animate(frames, { duration: 1300, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }));
      }, 600);
    },
    { threshold: 0.6 },
  );
  nudgeIO.observe(track);
}

function realignTrack() {
  if (carousel()) track.scrollLeft = step * track.clientWidth;
  fitTrack();
}
window.addEventListener('resize', realignTrack);
phoneMedia.addEventListener('change', realignTrack);

function trackMetrics() {
  const vh = window.innerHeight;
  const S = vh * STEP_VH;
  const top = workTrack.getBoundingClientRect().top + window.scrollY - navH();
  return { S, top };
}

function syncStage() {
  if (!workTrack || !panels.length) return;
  if (!desktop()) {
    progressBar && (progressBar.style.transform = 'scaleX(0)');
    // phones: the sideways swipe picks the project, not the page scroll
    if (carousel()) return;
    // Read below the sticky tabs, including on short landscape screens.
    const tabsH = document.querySelector('.stage-tabs')?.offsetHeight ?? 0;
    const line = Math.min(navH() + tabsH + 48, window.innerHeight - 24);
    const i = panels.findIndex((pnl) => {
      const r = pnl.getBoundingClientRect();
      return r.top <= line && r.bottom > line;
    });
    if (i >= 0) setStep(i);
    return;
  }
  const { S, top } = trackMetrics();
  const scrolled = window.scrollY - top;
  const last = panels.length - 1;
  setStep(Math.min(last, Math.max(0, Math.round(scrolled / S))));
  if (progressBar) progressBar.style.transform = `scaleX(${Math.min(1, Math.max(0, scrolled / (S * last)))})`;
}

tabs.forEach((t) =>
  t.addEventListener('click', () => {
    const i = Number(t.dataset.step);
    if (!desktop()) {
      // phones: the More tab also opens the folded More projects card
      if (panels[i].matches('[data-fold]')) setFold(panels[i], true);
      if (carousel()) showCard(i);
      else scrollToEl(panels[i]);
      return;
    }
    const { S, top } = trackMetrics();
    const y = top + i * S + 2;
    if (lenis) lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
  }),
);

// in the "More projects" step, pointing at an entry previews its scene
document.querySelectorAll('.sp-more [data-scene]').forEach((row) => {
  const enter = () => step === panels.length - 1 && showScene(row.dataset.scene);
  row.addEventListener('mouseenter', enter);
  row.addEventListener('focusin', enter);
});
document.querySelector('.sp-more')?.addEventListener('mouseleave', () => {
  if (step === panels.length - 1) showScene(panels[step].dataset.scene);
});

let stageRaf = 0;
window.addEventListener(
  'scroll',
  () => {
    if (!stageRaf)
      stageRaf = requestAnimationFrame(() => {
        stageRaf = 0;
        syncStage();
      });
  },
  { passive: true },
);
window.addEventListener('resize', syncStage);
syncStage();
if (step < 0 && panels.length) setStep(0);

// phones/tablets: no pinned stage, so each loop plays while it is on screen
let stopCardAutoplay = () => {};
function syncCardPlayback() {
  stopCardAutoplay();
  document.querySelectorAll('[data-card-video]').forEach((v) => {
    v.pause();
    v.setAttribute('data-autoplay', '');
  });
  if (document.documentElement.classList.contains('case-open')) return;
  if (desktop()) playActive();
  else stopCardAutoplay = autoplayVideos(document.querySelector('.stage-projects'));
}
desktopMedia.addEventListener('change', syncCardPlayback);
syncCardPlayback();

const desktopVideoIO = new IntersectionObserver((entries) => {
  entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
    if (isIntersecting && intersectionRatio >= 0.35) visibleCardVideos.add(target);
    else visibleCardVideos.delete(target);
  });
  if (desktop()) playActive();
}, { rootMargin: `-${navH()}px 0px 0px 0px`, threshold: 0.35 });
document.querySelectorAll('[data-card-video]').forEach((v) => desktopVideoIO.observe(v));
document.addEventListener('visibilitychange', () => {
  if (desktop()) playActive();
});

/* ---------- point-cloud scan ---------- */
const canvas = document.getElementById('scan-canvas');

let transitionT = 0;
function scanRect() {
  const vh = window.innerHeight;
  if (!desktop()) {
    // No target rect lets an existing desktop renderer sleep after resizing to a compact layout.
    transitionT = 0;
    return null;
  }
  if (!railFrame || !workTrack) {
    transitionT = 0;
    return heroEl.getBoundingClientRect();
  }
  const r = railFrame.getBoundingClientRect();
  // 0 while the Work section is below the fold, 1 once its rail is (nearly) pinned
  transitionT = Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.75)));
  // the hero scene scrolls away with the hero (never behind the About text); the scan only
  // reappears inside the project stage, where it gathers into the first scene
  return transitionT > 0.8 ? (scanView ?? railFrame).getBoundingClientRect() : heroEl.getBoundingClientRect();
}

function syncSceneToScroll() {
  if (!scan) return;
  scanRect();
  const nowInWork = desktop() && transitionT > 0.8;
  if (nowInWork !== inWork) {
    inWork = nowInWork;
    scan.setScene(inWork ? cardScene : 'hero');
    scan.reassemble();
    if (inWork) showScene(cardScene);
  }
  scan.wake();
}

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

let scanStarting = false;
async function startScan() {
  if (!desktop() || !canvas || !heroEl || scanStarting) return;
  if (scan) {
    syncSceneToScroll();
    return;
  }
  if (!webglOK()) return;
  scanStarting = true;
  try {
    const { initScan } = await import('./scan.js');
    if (!desktop()) return;
    scan = await initScan({
      canvas,
      getRect: scanRect,
      reducedMotion: reduced,
      onReady: () => document.documentElement.classList.add('scan-ready'),
    });
    window.addEventListener('scroll', syncSceneToScroll, { passive: true });
    window.addEventListener('resize', syncSceneToScroll);
    syncSceneToScroll();
  } catch (err) {
    console.warn('Scan disabled:', err);
  } finally {
    scanStarting = false;
  }
}
// Compact layouts skip the renderer, Three.js and model downloads entirely.
desktopMedia.addEventListener('change', () => {
  if (desktop()) startScan();
  else syncSceneToScroll();
});
// let the hero text paint first
if ('requestIdleCallback' in window) requestIdleCallback(startScan, { timeout: 600 });
else setTimeout(startScan, 200);

/* ---------- copy email ---------- */
// the Copy button copies; clicking the address itself copies too (and still opens the mail app)
document.querySelectorAll('[data-copy]').forEach((btn) => {
  const label = btn.querySelector('span');
  let timer = 0;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      if (label) label.textContent = 'Copied';
      clearTimeout(timer);
      timer = setTimeout(() => label && (label.textContent = 'Copy'), 1800);
      return true;
    } catch {
      return false;
    }
  };
  btn.addEventListener('click', async () => {
    if (!(await copy())) window.location.href = `mailto:${btn.dataset.copy}`;
  });
  btn.closest('.contact-mail')?.querySelector('.contact-address')?.addEventListener('click', () => copy());
});

/* ---------- case-study overlay with real URLs ---------- */
const overlay = document.getElementById('case-overlay');
const scroller = document.getElementById('case-scroll');
let cleanupCase = null;
let returnFocus = null;
const baseTitle = document.title;

function openCase(slug, { push = true, replace = false } = {}) {
  const tpl = document.getElementById(`case-${slug}`);
  if (!tpl || !overlay) return false;
  cleanupCase?.();
  scroller.innerHTML = '';
  scroller.appendChild(tpl.content.cloneNode(true));
  // every project opens at its top, never where the previous one was left
  scroller.scrollTo({ top: 0, behavior: 'instant' });
  document.title = `${tpl.dataset.title} · Muthukumaran Yogeeswaran`;

  if (overlay.hidden) {
    returnFocus = document.activeElement;
    overlay.hidden = false;
    document.documentElement.classList.add('case-open');
    syncCardPlayback();
    lenis?.stop();
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    scroller.focus({ preventScroll: true });
  }
  const url = `/work/${slug}/`;
  if (replace) history.replaceState({ case: slug }, '', url);
  else if (push) history.pushState({ case: slug }, '', url);

  const cs = scroller.querySelector('.lp');
  if (cs) cleanupCase = initCaseStudy(cs, scroller);
  requestAnimationFrame(() => scroller.scrollTo({ top: 0, behavior: 'instant' }));
  return true;
}

function closeCaseNow() {
  if (!overlay || overlay.hidden) return;
  cleanupCase?.();
  cleanupCase = null;
  overlay.classList.remove('is-open');
  document.documentElement.classList.remove('case-open');
  syncCardPlayback();
  document.title = baseTitle;
  lenis?.start();
  const done = () => {
    overlay.hidden = true;
    scroller.innerHTML = '';
  };
  if (reduced) done();
  else setTimeout(done, 320);
  returnFocus?.focus?.({ preventScroll: true });
}

function closeCase() {
  if (history.state?.case) history.back();
  else {
    closeCaseNow();
    history.replaceState(null, '', '/');
  }
}

document.addEventListener('click', (e) => {
  const link = e.target.closest('[data-case]');
  if (!link || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
  const inOverlay = !overlay.hidden && overlay.contains(link);
  if (openCase(link.dataset.case, { replace: inOverlay })) e.preventDefault();
});
overlay?.addEventListener('click', (e) => {
  const closer = e.target.closest('[data-close]');
  if (closer) {
    e.preventDefault();
    closeCase();
    // "Back to all projects": land on the More step, with every project in reach
    if (closer.dataset.then === 'more') setTimeout(() => tabs[tabs.length - 1]?.click(), reduced ? 0 : 360);
  }
});
window.addEventListener('popstate', (e) => {
  if (e.state?.case) openCase(e.state.case, { push: false });
  else closeCaseNow();
});
document.addEventListener('keydown', (e) => {
  if (!overlay || overlay.hidden) return;
  if (e.key === 'Escape' && !lightbox.isOpen()) closeCase();
  if (e.key === 'Tab') {
    const f = [...overlay.querySelectorAll('a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])')].filter(
      (el) => el.offsetParent !== null,
    );
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
