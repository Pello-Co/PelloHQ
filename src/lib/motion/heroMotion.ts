/**
 * heroMotion.ts
 * Master GSAP timeline for the HeroPello intelligence panel.
 * Exports: initHeroMotion, initHeroInteractions, triggerActivation
 */

import { gsap } from 'gsap';

// ── SVG connector builder ────────────────────────────────────
// Runs after layout is stable (via requestAnimationFrame),
// measures real element positions, draws SVG paths from the
// core panel to each channel node dot, then adds stroke-
// dashoffset tweens to the master timeline at a given time.

function buildConnectors(tl: gsap.core.Timeline, atTime: number) {
  requestAnimationFrame(() => {
    const panel = document.getElementById('hero-panel');
    const coreEl = document.getElementById('panel-core-inner');
    const svgEl = document.getElementById('connector-svg') as SVGSVGElement | null;
    const nodeEls = document.querySelectorAll<HTMLElement>('#hero-panel .channel-node');

    if (!panel || !coreEl || !svgEl || nodeEls.length === 0) return;

    const panelRect = panel.getBoundingClientRect();
    const coreRect = coreEl.getBoundingClientRect();

    // Set SVG viewport to match panel pixel dimensions
    const W = panelRect.width;
    const H = panelRect.height;
    svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svgEl.setAttribute('width', String(W));
    svgEl.setAttribute('height', String(H));

    // Origin: bottom-center of the core panel
    const originX = coreRect.left - panelRect.left + coreRect.width / 2;
    const originY = coreRect.bottom - panelRect.top;

    const paths: SVGPathElement[] = [];

    nodeEls.forEach((node) => {
      const dotEl = node.querySelector<HTMLElement>('.node-dot');
      if (!dotEl) return;

      const dotRect = dotEl.getBoundingClientRect();
      const color = node.dataset['color'] ?? '#6366f1';

      // Destination: center of the node's color dot
      const endX = dotRect.left - panelRect.left + dotRect.width / 2;
      const endY = dotRect.top - panelRect.top + dotRect.height / 2;

      // Midpoint for a subtle elbow — go straight down from origin, then across
      const midY = endY;
      const d = `M ${originX} ${originY} L ${originX} ${midY} L ${endX} ${midY}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement;
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', `${color}22`);
      path.setAttribute('stroke-width', '1');

      // getTotalLength requires the SVG to be in the DOM first
      svgEl.appendChild(path);
      const len = path.getTotalLength();
      path.style.strokeDasharray = String(len);
      path.style.strokeDashoffset = String(len);

      paths.push(path);
    });

    if (paths.length === 0) return;

    // Add connector reveal tweens to the already-running timeline
    tl.to(
      paths,
      {
        strokeDashoffset: 0,
        duration: 0.55,
        stagger: 0.09,
        ease: 'power2.inOut',
      },
      atTime
    );
  });
}

// ── Ambient loop (starts after main sequence ends) ──────────

function startAmbientLoop() {
  // Status dot gentle pulse
  gsap.to('#status-indicator', {
    scale: 1.3,
    opacity: 0.5,
    duration: 1.6,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
  });

  // Occasional node highlight flicker to simulate live data
  const nodes = gsap.utils.toArray<HTMLElement>('#hero-panel .channel-node');

  function scheduleFlicker() {
    const delay = 2.5 + Math.random() * 5;
    const idx = Math.floor(Math.random() * nodes.length);
    const node = nodes[idx];
    if (!node) {
      setTimeout(scheduleFlicker, delay * 1000);
      return;
    }
    const color = node.dataset['color'] ?? '#6366f1';
    gsap.to(node, {
      backgroundColor: `${color}0e`,
      borderColor: `${color}28`,
      duration: 0.35,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
      delay,
      onComplete: scheduleFlicker,
    });
  }

  scheduleFlicker();
}

// ── Master timeline ──────────────────────────────────────────

export function initHeroMotion() {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    // ── Set initial hidden states ────────────────────────────
    gsap.set(['#hero-eyebrow', '#hero-sub', '#hero-cta-row'], { opacity: 0 });
    gsap.set('#hero-sub', { y: 12 });
    gsap.set('#hero-cta-row', { y: 12 });
    gsap.set('#hero-line-1', { opacity: 0, clipPath: 'inset(0 0 100% 0)', y: 18 });
    gsap.set('#hero-line-2', { opacity: 0, clipPath: 'inset(0 0 100% 0)', y: 18 });
    gsap.set('#hero-panel', { opacity: 0, y: 20 });
    gsap.set('#panel-source-row', { opacity: 0 });
    gsap.set('#panel-core-body', { opacity: 0 });
    gsap.set('.core-metric-row', { opacity: 0, x: -10 });
    gsap.set('#scan-pct-label', { opacity: 0 });
    gsap.set('.scan-bar-fill', { scaleX: 0, transformOrigin: 'left center' });
    gsap.set('.metric-bar-fill', { scaleX: 0, transformOrigin: 'left center' });
    gsap.set('#hero-panel .channel-node', { opacity: 0 });
    gsap.set('#panel-ready-bar', { opacity: 0 });
    gsap.set('#source-glow-layer', { opacity: 0 });

    // ── Build timeline ───────────────────────────────────────
    const tl = gsap.timeline({ delay: 0.15 });

    // T 0.0–0.4 — panel materialises
    tl.to('#hero-panel', { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 0);

    // T 0.2–1.1 — left column content reveals
    tl.to('#hero-eyebrow', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 0.25);
    tl.to(
      '#hero-line-1',
      { opacity: 1, clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.78, ease: 'power2.out' },
      0.42
    );
    tl.to(
      '#hero-line-2',
      { opacity: 1, clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.78, ease: 'power2.out' },
      0.58
    );
    tl.to('#hero-sub', { opacity: 1, y: 0, duration: 0.62, ease: 'power2.out' }, 0.82);
    tl.to('#hero-cta-row', { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out' }, 1.0);

    // T 1.0–2.2 — source node activates
    tl.to('#panel-source-row', { opacity: 1, duration: 0.5, ease: 'power2.out' }, 1.1);
    tl.to('#source-glow-layer', { opacity: 1, duration: 0.7, ease: 'sine.inOut' }, 1.28);

    tl.add(() => {
      const el = document.getElementById('panel-status-text');
      if (el) el.textContent = 'Scanning';
      document.getElementById('status-indicator')?.classList.add('is-scanning');
    }, 1.35);

    // Scan percentage counter
    const scanPctProxy = { v: 0 };
    tl.to(scanPctProxy, {
      v: 100,
      duration: 1.45,
      ease: 'power2.inOut',
      onUpdate() {
        const el = document.getElementById('scan-pct-label');
        if (el) el.textContent = `${Math.round(scanPctProxy.v)}%`;
      },
    }, 1.5);
    tl.to('#scan-pct-label', { opacity: 1, duration: 0.4 }, 1.5);
    tl.to('.scan-bar-fill', { scaleX: 1, duration: 1.45, ease: 'power2.inOut' }, 1.5);

    // T 2.0–3.8 — analysis core wakes up
    tl.add(() => {
      const el = document.getElementById('panel-status-text');
      if (el) el.textContent = 'Analysing';
    }, 2.15);

    tl.to('#panel-core-body', { opacity: 1, duration: 0.55, ease: 'power2.out' }, 2.1);
    tl.to(
      '.core-metric-row',
      { opacity: 1, x: 0, stagger: 0.2, duration: 0.55, ease: 'power2.out' },
      2.45
    );
    tl.to(
      '.metric-bar-fill',
      { scaleX: 1, stagger: 0.18, duration: 0.95, ease: 'power3.out' },
      2.65
    );

    // SVG connector paths — built dynamically after layout at T≈3.1
    buildConnectors(tl, 3.1);

    // T 3.2–5.6 — channel nodes activate in wave
    tl.to(
      '#hero-panel .channel-node',
      { opacity: 1, duration: 0.4, stagger: 0.16, ease: 'power2.out' },
      3.3
    );

    // T 5.6–6.8 — unified final state
    tl.add(() => {
      document.getElementById('status-indicator')?.classList.remove('is-scanning');
      document.getElementById('status-indicator')?.classList.add('is-ready');
      const el = document.getElementById('panel-status-text');
      if (el) el.textContent = 'Ready';
    }, 5.65);

    tl.to('#panel-ready-bar', { opacity: 1, duration: 0.65, ease: 'power2.out' }, 5.7);

    // T 6.9+ — ambient idle loop
    tl.add(startAmbientLoop, 7.0);

    // Cleanup function for gsap.matchMedia
    return () => {
      tl.kill();
      gsap.killTweensOf('#status-indicator');
    };
  });

  // Reduced motion: reveal everything instantly in final state
  mm.add('(prefers-reduced-motion: reduce)', () => {
    const targets = [
      '#hero-eyebrow',
      '#hero-line-1',
      '#hero-line-2',
      '#hero-sub',
      '#hero-cta-row',
      '#hero-panel',
      '#panel-source-row',
      '#panel-core-body',
      '#panel-ready-bar',
    ];
    gsap.set(targets, { opacity: 1, y: 0, x: 0 });
    gsap.set('#hero-line-1', { clipPath: 'inset(0 0 0% 0)' });
    gsap.set('#hero-line-2', { clipPath: 'inset(0 0 0% 0)' });
    gsap.set('.core-metric-row', { opacity: 1, x: 0 });
    gsap.set('#hero-panel .channel-node', { opacity: 1 });
    gsap.set('#scan-pct-label', { opacity: 1 });

    const pctEl = document.getElementById('scan-pct-label');
    if (pctEl) pctEl.textContent = '100%';
    const statusEl = document.getElementById('panel-status-text');
    if (statusEl) statusEl.textContent = 'Ready';
    document.getElementById('status-indicator')?.classList.add('is-ready');
  });
}

// ── Interaction layer ────────────────────────────────────────

export function initHeroInteractions() {
  // Node hover: accent highlight
  document.querySelectorAll<HTMLElement>('#hero-panel .channel-node').forEach((node) => {
    const color = node.dataset['color'] ?? '#6366f1';
    node.addEventListener('mouseenter', () => {
      gsap.to(node, {
        backgroundColor: `${color}0d`,
        borderColor: `${color}28`,
        scale: 1.018,
        duration: 0.22,
        ease: 'power2.out',
      });
    });
    node.addEventListener('mouseleave', () => {
      gsap.to(node, {
        backgroundColor: 'rgba(255,255,255,0.02)',
        borderColor: 'rgba(255,255,255,0.05)',
        scale: 1,
        duration: 0.28,
        ease: 'power2.out',
      });
    });
  });

  // Input focus: energise the source node in the panel
  const heroInput = document.getElementById('hero-url-input');
  heroInput?.addEventListener('focus', () => {
    gsap.to('#source-glow-layer', { opacity: 1, duration: 0.38, ease: 'power2.out' });
    gsap.to('.source-live-dot', { scale: 1.7, duration: 0.28, ease: 'back.out(2)' });
  });
  heroInput?.addEventListener('blur', () => {
    gsap.to('#source-glow-layer', { opacity: 0.5, duration: 0.5 });
    gsap.to('.source-live-dot', { scale: 1, duration: 0.35 });
  });

  // Sync typed URL into source display
  heroInput?.addEventListener('input', () => {
    const display = document.getElementById('source-url-display');
    if (!display) return;
    const val = (heroInput as HTMLInputElement).value.trim();
    display.textContent = val ? val.replace(/^https?:\/\//, '') : 'yoursite.com';
  });

  // Restrained mouse parallax on panel (desktop, max ±8px)
  const mmP = gsap.matchMedia();
  mmP.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
    const panel = document.getElementById('hero-panel');
    const hero = document.getElementById('hero');
    if (!panel || !hero) return;

    const xQ = gsap.quickTo(panel, 'x', { duration: 1.6, ease: 'power2.out' });
    const yQ = gsap.quickTo(panel, 'y', { duration: 1.6, ease: 'power2.out' });

    hero.addEventListener('mousemove', (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth - 0.5) * 2;
      const my = (e.clientY / window.innerHeight - 0.5) * 2;
      xQ(mx * 7);
      yQ(my * 4);
    });

    hero.addEventListener('mouseleave', () => {
      xQ(0);
      yQ(0);
    });
  });
}

// ── Activation replay (triggered by form submit) ─────────────

export function triggerActivation() {
  const tl = gsap.timeline();

  // Reset scan + nodes
  tl.to('.scan-bar-fill', {
    scaleX: 0,
    duration: 0.25,
    ease: 'power2.in',
    transformOrigin: 'left center',
  });
  tl.to(
    '#hero-panel .channel-node',
    { opacity: 0, duration: 0.18, stagger: { each: 0.04, from: 'end' } },
    '<'
  );
  tl.to('#panel-ready-bar', { opacity: 0, duration: 0.15 }, '<');

  tl.add(() => {
    const el = document.getElementById('panel-status-text');
    if (el) el.textContent = 'Scanning';
    document.getElementById('status-indicator')?.classList.remove('is-ready');
    document.getElementById('status-indicator')?.classList.add('is-scanning');
  });

  // Re-run analysis
  tl.to('.scan-bar-fill', { scaleX: 1, duration: 0.85, ease: 'power2.inOut' });
  tl.to(
    '#hero-panel .channel-node',
    { opacity: 1, stagger: 0.09, duration: 0.32, ease: 'power2.out' },
    '>0.1'
  );

  tl.add(() => {
    document.getElementById('status-indicator')?.classList.remove('is-scanning');
    document.getElementById('status-indicator')?.classList.add('is-ready');
    const el = document.getElementById('panel-status-text');
    if (el) el.textContent = 'Ready';
  });
  tl.to('#panel-ready-bar', { opacity: 1, duration: 0.4, ease: 'power2.out' });
}
