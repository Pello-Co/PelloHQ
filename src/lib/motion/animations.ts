/**
 * animations.ts
 * Central GSAP animation utilities.
 * Import and call these in component <script> tags.
 * All animations respect prefers-reduced-motion via gsap.matchMedia().
 */

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

/** Fade + slide-up reveal triggered on scroll, with optional stagger. */
export function revealOnScroll(
  elements: string | Element | NodeListOf<Element>,
  opts: { stagger?: number; delay?: number; start?: string } = {}
) {
  const { stagger = 0.1, delay = 0, start = 'top 88%' } = opts;

  const triggerTarget =
    typeof elements === 'string' ? elements : elements instanceof Element ? elements : undefined;

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(elements, {
      opacity: 0,
      y: 32,
      duration: 0.75,
      stagger,
      delay,
      ease: 'power2.out',
      scrollTrigger: triggerTarget
        ? { trigger: triggerTarget, start, once: true }
        : { start, once: true },
    });
  });

  // Reduced motion fallback: just fade in
  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.from(elements, {
      opacity: 0,
      duration: 0.3,
      stagger: stagger * 0.5,
      delay,
      ease: 'none',
      scrollTrigger: triggerTarget
        ? { trigger: triggerTarget, start, once: true }
        : { start, once: true },
    });
  });
}

/** Hero entrance timeline — runs once on page load. */
export function heroEntrance(targets: {
  badge?: string;
  headline?: string;
  sub?: string;
  ctas?: string;
  visual?: string;
}) {
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (targets.badge) {
      tl.from(targets.badge, { opacity: 0, y: 16, duration: 0.5 });
    }
    if (targets.headline) {
      tl.from(targets.headline, { opacity: 0, y: 40, duration: 0.85 }, '-=0.2');
    }
    if (targets.sub) {
      tl.from(targets.sub, { opacity: 0, y: 24, duration: 0.65 }, '-=0.5');
    }
    if (targets.ctas) {
      tl.from(targets.ctas, { opacity: 0, y: 20, duration: 0.55 }, '-=0.45');
    }
    if (targets.visual) {
      tl.from(
        targets.visual,
        { opacity: 0, scale: 0.96, duration: 1.1, ease: 'power2.out' },
        '-=0.6'
      );
    }
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    const allTargets = Object.values(targets).filter(Boolean);
    gsap.from(allTargets, { opacity: 0, duration: 0.4, stagger: 0.05 });
  });
}

/** Card stagger reveal — call when parent section enters viewport. */
export function staggerCards(selector: string, triggerEl?: string) {
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.from(selector, {
      opacity: 0,
      y: 40,
      scale: 0.97,
      duration: 0.65,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: triggerEl ?? selector,
        start: 'top 85%',
        once: true,
      },
    });
  });

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.from(selector, { opacity: 0, duration: 0.3, stagger: 0.04 });
  });
}

/** Subtle horizontal parallax for decorative elements. */
export function parallaxX(selector: string, amount: number = 20) {
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.to(selector, {
      x: amount,
      ease: 'none',
      scrollTrigger: {
        trigger: selector,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });
}

/** Stat counter animation. */
export function animateCounter(
  el: Element,
  endValue: number,
  suffix: string = '',
  prefix: string = ''
) {
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const counter = { value: 0 };
    gsap.to(counter, {
      value: endValue,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true,
      },
      onUpdate() {
        el.textContent = `${prefix}${Math.round(counter.value).toLocaleString()}${suffix}`;
      },
    });
  });
}
