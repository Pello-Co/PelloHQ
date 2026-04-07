# Interactive Canvas Components — Pello.co

A comprehensive guide to how we build the interactive animated components in the Pello.co homepage product sections. This document covers architecture, tech stack, patterns, and everything your coding agent needs to recreate or extend these components.

---

## Table of Contents

1. [Stack Overview](#1-stack-overview)
2. [Architecture: How It All Fits Together](#2-architecture-how-it-all-fits-together)
3. [The Core Pattern: Canvas + requestAnimationFrame](#3-the-core-pattern-canvas--requestanimationframe)
4. [Performance Strategy](#4-performance-strategy)
5. [Component Inventory](#5-component-inventory)
6. [Deep Dives: How Each Component Works](#6-deep-dives-how-each-component-works)
7. [Mouse Interaction System](#7-mouse-interaction-system)
8. [Tooltip System](#8-tooltip-system)
9. [Auto-Spotlight (No Mouse Fallback)](#9-auto-spotlight-no-mouse-fallback)
10. [Glassmorphism & CSS Layering](#10-glassmorphism--css-layering)
11. [How to Build a New Component](#11-how-to-build-a-new-component)
12. [Common Mistakes to Avoid](#12-common-mistakes-to-avoid)

---

## 1. Stack Overview

| Layer | Technology | Version |
|---|---|---|
| Framework | Astro | ^5.3.0 |
| Styling | Tailwind CSS (v4 via Vite plugin) | ^4.0.6 |
| Animation (scroll/reveal) | GSAP | ^3.12.5 |
| Interactive canvas | Vanilla Canvas 2D API | Built-in |
| TypeScript | Used inside `<script>` in `.astro` files | 5.x |

**No React, no Three.js, no WebGL, no canvas libraries.** Every interactive animation is pure `<canvas>` + `requestAnimationFrame` + Vanilla JS/TS.

This is deliberate:
- Zero runtime dependency for animations (no library cold-start)
- Full control over every pixel and every frame
- Ships as a tiny JS chunk (Astro splits per-page automatically)
- Works perfectly with Astro's static output + partial hydration model

---

## 2. Architecture: How It All Fits Together

### The HTML structure

Each product section in `src/pages/index.astro` follows this pattern:

```html
<div class="product-card" data-product="N">
  <!-- Background canvas: absolute-positioned, z-index 0 -->
  <canvas class="product-bg" aria-hidden="true"></canvas>

  <!-- Interactive content canvas (specific to some products) -->
  <canvas id="specific-canvas-id" aria-hidden="true"></canvas>

  <!-- Text/UI content: relative-positioned, z-index 1 -->
  <div class="product-card-content">
    <!-- Your product description, features, CTAs etc -->
  </div>
</div>
```

### z-index layering

```
product-card (position: relative, overflow: hidden)
  └── .product-bg canvas          z-index: 0  (ambient background animation)
  └── .soc-pulse-bg / specific    z-index: 0  (second background layer where needed)
  └── #specific-canvas-id         z-index: 1+ (foreground interactive canvas)
  └── .product-card-content       z-index: 1  (text, UI elements)
  └── #hud-glass (DOM element)    z-index: 2  (HTML overlay, positioned by JS)
```

### Script location

All canvas code lives in a single large `<script>` block inside `index.astro`. It runs at runtime (not Astro server-side).

The script is wrapped in `requestIdleCallback` to defer non-critical initialisation:

```js
const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
ric(() => {
  // All canvas init code goes here
});
```

---

## 3. The Core Pattern: Canvas + requestAnimationFrame

Every canvas component follows the same lifecycle:

### 1. Create/find canvas element
```js
const canvas = document.querySelector<HTMLCanvasElement>('.product-bg')!;
const ctx = canvas.getContext('2d')!;
```

### 2. Resize handler with devicePixelRatio support

**This is critical.** Always multiply by `devicePixelRatio` or things will look blurry on retina displays:

```js
let dpr = 1;
function resize() {
  dpr = window.devicePixelRatio || 1;
  const rect = container.getBoundingClientRect();
  const w = Math.round(rect.width);
  const h = Math.round(rect.height);
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // ← scales all draw ops automatically
  buildState(w, h); // rebuild anything that depends on dimensions
}

// Watch the container, not window.resize
const ro = new ResizeObserver(() => resize());
ro.observe(container);
resize();
```

### 3. State initialisation

Each component has an `init` function that pre-calculates all the initial state before the first frame:

```js
function initSEO(w: number, h: number): Record<string, unknown> {
  const dots: SeoDot[] = [];
  // pre-generate grid of dots with randomised properties
  return { dots, startTime: performance.now() * 0.001, hoveredIdx: -1 };
}
```

### 4. The render loop

```js
function frame() {
  requestAnimationFrame(frame);
  const W = canvas.width / dpr; // ← always work in CSS pixels, not physical
  const H = canvas.height / dpr;
  const t = performance.now() * 0.001; // time in seconds

  ctx.clearRect(0, 0, W, H);

  // ... draw everything using W/H and t ...
}
requestAnimationFrame(frame);
```

**Key rule:** After `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`, all coordinates are in CSS pixels. Use `canvas.width / dpr` (not `canvas.width`) for your logical width.

### 5. Mouse tracking

```js
let mouse: { x: number; y: number } | null = null;

window.addEventListener('mousemove', (e) => {
  const rect = container.getBoundingClientRect();
  mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
});
window.addEventListener('mouseleave', () => { mouse = null; });
```

---

## 4. Performance Strategy

### IntersectionObserver — only render visible cards

The product card canvases are wired to an IntersectionObserver. Off-screen cards skip their frame:

```js
const pvVisible = new Set<number>();
const pvIO = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) pvVisible.add(idx);
    else pvVisible.delete(idx);
  }
}, { rootMargin: '200px' }); // 200px buffer so it starts before fully visible
```

The single `pvLoop` only renders cards in `pvVisible`:

```js
function pvLoop() {
  requestAnimationFrame(pvLoop);
  const t = performance.now() * 0.001;
  for (const idx of pvVisible) {
    renderProd(pvCards[idx].productIdx, pvCards[idx], t);
  }
}
```

### Render at 0.5× DPR for background canvases

Background ambient canvases (`.product-bg`) are rendered at `1.0 × DPR` (not `2×`) to halve the pixel fill rate at no visible quality loss for ambient animations.

### Off-screen offscreen canvas for aurora

The aurora effect renders to a small `offscreen` canvas (1/3 the size), then blits to the main canvas with `ctx.drawImage`. This means the expensive per-pixel computation runs at 33% resolution:

```js
const offscreen = document.createElement('canvas');
const octx = offscreen.getContext('2d')!;
offscreen.width = Math.round(W / 3);
offscreen.height = Math.round(H / 3);
// ... draw to offscreen at 1/3 size ...
actx.drawImage(offscreen, 0, 0, canvas.width, canvas.height); // upscale to full
```

### Avoid DOM queries in the render loop

All DOM references are captured once at init. Never call `document.querySelector` inside a frame callback.

### `requestIdleCallback` wraps all init

Heavy initialisation runs in idle time so it doesn't block the first paint:

```js
const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
ric(() => {
  // All init code here
});
```

---

## 5. Component Inventory

| Product | Canvas Type | File location (in index.astro script) | Key technique |
|---|---|---|---|
| **PelloSEO** | Dot matrix grid | `drawSEO()` | Perlin noise push, colour by template type, animated tooltip |
| **PelloReach** | Perspective email grid | `drawReach()` / `drawReachTooltip()` | 3D perspective projection, particle flow, legend filtering |
| **PelloPublish** | Particle flow network | `drawRain()` + `#pub-flow-canvas` IIFE | Input→engine→output graph, particle path-following, rich tooltips |
| **PelloSocial** | 3D Holographic Globe | `drawSocial()` / `drawSocTooltip()` | Fibonacci sphere, lat/lon→3D, scan beam, phone nodes |
| **PelloPitch** | Topo contour map | `drawTopo()` | Marching squares contour algorithm, mouse surface deformation |
| **PelloAds** | Campaign grid dashboard | `#ads-dash-canvas` IIFE | Sparklines, hover tooltips, live-updating data simulation |
| **PelloFlow** | Workflow timeline + calendar | `#flow-dash-canvas` IIFE | 4-panel layout, agent state, task popups, activity feed |
| **PelloBuild** | API dashboard + code editor | `#build-dash-canvas` IIFE | Sparklines, live request feed, typing code animation |

---

## 6. Deep Dives: How Each Component Works

### PelloSEO — Dot Matrix

**Concept:** Hundreds of tiny dots, each representing a programmatic SEO page. Dots are coloured by template type. Mouse pushes dots away (repulsion field).

**Key techniques:**
1. **Grid generation** — dots placed every `SEO_GSZ` (10px) pixels
2. **Lerp toward target** — each frame, `dot.x += (targetX - dot.x) * LERP_SPEED`
3. **Mouse repulsion** — within `SEO_INFL` (100px), compute push vector using cubic easing:
   ```js
   const raw = 1 - dist / SEO_INFL;
   const s = raw * raw * (3 - 2 * raw);      // smoothstep
   const influence = s * s * (3 - 2 * s);    // double smoothstep
   const pushMag = Math.pow(influence, 3) * SEO_PUSH;
   ```
4. **Vertical fade** — dots below 82% height fade out: `vFade = 1 - (dot.gy - fadeZone) / (H - fadeZone)`
5. **Pulse ripple** — every 8s, a wave radiates from centre: `pulseAlpha = Math.sin((dca/0.6) * Math.PI) * 0.3`
6. **Hover tooltip** — find dot within `SEO_HOV_R` (15px), draw glassmorphic tooltip above it

**State shape:**
```ts
interface SeoDot {
  gx, gy: number;     // grid position (never changes)
  x, y: number;       // current position (lerps to target)
  templateIdx: number; // which SEO template type
  title: string;      // generated page title
  status: 0|1|2;      // indexed / published / generating
  birthTime: number;  // staggered reveal delay
  phase: number;      // random offset for pulse animations
}
```

---

### PelloReach — Perspective Email Grid

**Concept:** An email outreach grid rendered in perspective (like looking down a road). Each cell = a different prospect/email. Particles flow down the grid toward the viewer. Hovering a cell shows a detailed email preview.

**Key techniques:**
1. **Perspective projection:**
   ```js
   function project(c, r) {
     const tFrac = Math.max(0.001, r / (NR - 1));
     const frac = (c - (NC - 1) / 2) / ((NC - 1) / 2);
     return {
       sx: GRID_CX + frac * HALF_W * tFrac,
       sy: VP_Y + (BOT_Y - VP_Y) * tFrac,
     };
   }
   ```
   Columns converge to a vanishing point at `GRID_CX, VP_Y`. Rows grow apart as they come toward the viewer.

2. **Reverse projection (mouse → grid cell):**
   ```js
   function screenToGrid(sx, sy) {
     const t2 = (sy - VP_Y) / (BOT_Y - VP_Y);
     const frac = (sx - GRID_CX) / (HALF_W * t2);
     return [(frac + 1) * (NC-1) / 2, t2 * (NR-1)];
   }
   ```

3. **Cell colouring** — cells tinted by `status`: `delivered` (purple), `opened` (lighter purple), `replied` (green)

4. **Legend hover** — hovering a legend item dims all non-matching cells

5. **Auto-hover** — when user isn't hovering, automatically cycles through cells on a 3s timer to keep the demo alive

---

### PelloPublish — Particle Flow Network

**Concept:** A node graph. 4 input sources on the left (Website, News, X, Keywords) → AutoPilot engine in the centre → 6 output platforms on the right (Newsletter, Instagram, TikTok, X, LinkedIn, Blog). Particles flow along the connection curves. Hovering a node shows what's flowing in/out.

This one has its own IIFE (immediately invoked function expression) and is by far the most complex:

**Key techniques:**

1. **Quadratic Bézier connections:**
   ```js
   function drawConnection(sx, sy, ex, ey, color, highlighted) {
     ctx.beginPath();
     ctx.moveTo(sx, sy);
     ctx.quadraticCurveTo((sx + ex) / 2, sy, ex, ey); // control point Y = start Y
     ctx.stroke();
   }
   ```

2. **Particles follow exact Bézier path:**
   The quadratic Bézier formula evaluates the curve at progress `t`:
   ```js
   function followConnection(sx, sy, ex, ey, t) {
     const cpx = (sx + ex) / 2, cpy = sy;
     const u = 1 - t;
     return {
       x: u*u*sx + 2*u*t*cpx + t*t*ex,
       y: u*u*sy + 2*u*t*cpy + t*t*ey,
     };
   }
   ```

3. **Auto-spotlight** — when no mouse is present, the component automatically highlights one particle at a time, tracking it input→engine→output with a glow dot and tooltip. State machine:
   - `cooldown` → `input` → `waiting` → `output` → `cooldown`

4. **Rich hover tooltips per platform** — each output platform (Instagram, TikTok, LinkedIn, etc.) has a hand-crafted preview card with platform-accurate UI layout drawn entirely on canvas

5. **SVG icons on canvas** — `Path2D` objects are pre-compiled from SVG path strings, then drawn with `ctx.fill(p2d)`:
   ```js
   const pathCache: Record<string, Path2D> = {};
   for (const [key, val] of Object.entries(SVG_PATHS)) {
     pathCache[key] = new Path2D(val.path); // compile once
   }
   function drawIcon(x, y, type, size, color) {
     const scale = size / SVG_PATHS[type].viewBox;
     ctx.save();
     ctx.translate(x - size/2, y - size/2);
     ctx.scale(scale, scale);
     ctx.fillStyle = color;
     ctx.fill(pathCache[type]);
     ctx.restore();
   }
   ```

---

### PelloSocial — Holographic Globe

**Concept:** A 3D globe showing phone nodes distributed across cities around the world. The globe slowly rotates. Hovering a phone node shows a glassmorphic HUD overlay.

**Key techniques:**

1. **Fibonacci sphere for dot distribution:**
   800 dots uniformly distributed using the golden angle:
   ```js
   const gr2 = (1 + Math.sqrt(5)) / 2; // golden ratio
   for (let i = 0; i < 800; i++) {
     const theta = 2 * Math.PI * i / gr2;
     const phi = Math.acos(1 - 2 * (i + 0.5) / 800);
     const x = Math.sin(phi) * Math.cos(theta);
     const y = Math.cos(phi);
     const z = Math.sin(phi) * Math.sin(theta);
     // ...
   }
   ```

2. **Land/ocean detection** — `socIsLand(lat, lon)` returns true based on hard-coded bounding box approximations for continents. Dots on land are rendered brighter.

3. **Lat/lon → 3D unit vector:**
   ```js
   function socLatLonTo3D(lat, lon) {
     const phi = (90 - lat) * Math.PI / 180;
     const theta = (lon + 180) * Math.PI / 180;
     return [
       Math.sin(phi) * Math.cos(theta),
       Math.cos(phi),
       Math.sin(phi) * Math.sin(theta),
     ];
   }
   ```

4. **3D rotation** — apply Y-axis rotation (continuous spin) + X tilt:
   ```js
   function socApplyRotations(x, y, z, rotY) {
     // X-axis tilt (15°)
     const ct = Math.cos(SOC_TILT), st = Math.sin(SOC_TILT);
     const [x2, y2] = [x*ct - y*st, x*st + y*ct];
     // Y-axis rotation
     const cy = Math.cos(rotY), sy = Math.sin(rotY);
     return [x2*cy + z*sy, y2, -x2*sy + z*cy];
   }
   ```

5. **Depth sorting** — 4 render passes: back-facing ocean, back-facing land, front-facing ocean, front-facing land (brightest, with glow)

6. **Scan beam** — horizontal scan line sweeps top-to-bottom over 5s, dramatically lighting dots it passes

7. **HUD overlay** — `#soc-hud-glass` is a DOM `<div>` with glassmorphism CSS. Its position is updated each frame to align with the computed globe centre:
   ```js
   glassEl.style.left = `${offX + bx}px`;
   glassEl.style.top = `${offY + by}px`;
   ```
   This hybrid canvas+DOM approach gives you HTML text rendering (font smoothing, line wrapping) inside an animation loop without re-rendering text on canvas every frame.

---

### PelloPitch — Topographic Contours

**Concept:** Marching squares contour lines drawn in real time using Perlin noise. Mouse pushes the surface up, creating a hill wherever you hover.

**The marching squares algorithm:**

For each grid cell (4 corners), sample the noise field. For each iso-level (threshold), determine which edges the contour passes through:

```js
const levels = [-0.5, -0.3, -0.1, 0.1, 0.3, 0.5];
for each cell:
  const [tl, tr, bl, br] = corners;
  const crossingPoints = [];
  if ((tl < level) !== (tr < level)) crossingPoints.push(lerp(tl, tr, level)); // top edge
  if ((tr < level) !== (br < level)) crossingPoints.push(lerp(tr, br, level)); // right edge
  if ((bl < level) !== (br < level)) crossingPoints.push(lerp(bl, br, level)); // bottom edge
  if ((tl < level) !== (bl < level)) crossingPoints.push(lerp(tl, bl, level)); // left edge
  // Connect the crossing points with a line segment
```

Mouse influence adds a Gaussian bump:
```js
const d2 = dx*dx + dy*dy;
v += Math.exp(-d2 / 15000) * 0.4; // Gaussian, radius ~122px, height 0.4
```

---

### PelloAds — Campaign Grid Dashboard

**Concept:** A product dashboard with real stats. Campaign rows × platform columns grid, sparklines, live-updating data, hover tooltips.

**Key techniques:**

1. **Virtual coordinate space** — always draw at VW×VH (520×384), scale to fit the container:
   ```js
   const VW = 520, VH = 384;
   scale = Math.min(pw / VW, ph / VH, 2);
   ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
   // Now draw using VW/VH coordinates regardless of actual canvas size
   ```
   This means layout never breaks when resizing.

2. **Sparklines** — smooth Bézier line chart using control points:
   ```js
   for (let i = 1; i < points.length; i++) {
     const cpx = (ppx + px) / 2;
     ctx.bezierCurveTo(cpx, ppy, cpx, py, px, py);
   }
   ```

3. **Gradient fill under sparkline** — draw the line again as a filled path using a linear gradient from colour → transparent

4. **Simulated live data** — `setInterval` every 1500ms slightly drifts sparkline values. Data changes `±0.03` per tick, clamped to [0.05, 0.95].

5. **Hover detection** — check mouse X/Y against every cell rect in the draw function (no separate hit-test phase needed since we're doing a full redraw every frame):
   ```js
   if (mouseX >= cx && mouseX <= cx + cw && mouseY >= cy && mouseY <= cy + ch) {
     hoveredCell = { row: r, col: c };
   }
   ```

---

### PelloFlow — Workflow Timeline + Calendar

**Concept:** 4-panel live dashboard: weekly calendar, agent status cards, today's timeline (Gantt-style), and a live activity feed. All driven by simulated real time.

**Key techniques:**

1. **4-panel layout calculated from canvas size:**
   ```js
   function panelRect(col: 0|1, row: 0|1): Rect {
     const halfW = (W - GAP) / 2;
     const contentH = H - HEADER_H - GAP;
     const halfH = (contentH - GAP) / 2;
     return {
       x: col === 0 ? 0 : halfW + GAP,
       y: HEADER_H + GAP + (row === 0 ? 0 : halfH + GAP),
       w: halfW, h: halfH,
     };
   }
   ```

2. **Real-time simulation** — `simTime` follows actual device clock:
   ```js
   simTime = new Date().getHours() + new Date().getMinutes() / 60 + new Date().getSeconds() / 3600;
   ```
   Task blocks are coloured by whether their time window is past, current, or future.

3. **Hit-test rect caching** — all interactive rects are collected during the draw call, then checked on `mousemove`:
   ```js
   let taskRects: { task: Task; rect: Rect }[] = [];
   // During draw:
   taskRects.push({ task, rect: { x: tx1, y: by, w: bw, h: bh } });
   // In mousemove handler:
   for (const { task, rect: r } of taskRects) {
     if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
       hoveredTask = task;
     }
   }
   ```

4. **Agent dimming with lerp** — hovering an agent card fades all other content:
   ```js
   const target = hoveredAgent === null ? 1 : (hoveredAgent === ai ? 1 : 0.2);
   agentOpacityNow[ai] = lerp(agentOpacityNow[ai], target, 0.1); // smooth transition
   ctx.globalAlpha = agentOpacityNow[ai]; // applied per agent row
   ```

5. **Live feed slide-in animation** — new items are prepended with a negative Y offset that lerps to 0:
   ```js
   feedOffsets[0] = -24; // start above
   feedOpacities[0] = 0;
   // Each frame:
   feedOffsets = feedOffsets.map(off => lerp(off, 0, 0.12));
   feedOpacities = feedOpacities.map(op => lerp(op, 1, 0.1));
   ```

---

### PelloBuild — API Dashboard + Code Editor

**Concept:** 4-panel API monitoring dashboard — request volume sparkline, response time sparkline, status codes donut chart, endpoint table, live request feed, and a code editor that types itself out.

**Key techniques:**

1. **Rolling history buffers** — `reqHistory` and `latHistory` are arrays of 60 `{value, ts}` objects. New samples are pushed and old ones shifted:
   ```js
   reqHistory.push({ value: baseReq, ts: frame });
   if (reqHistory.length > 60) reqHistory.shift();
   ```

2. **Donut chart** — drawn as arc segments:
   ```js
   let angle = -Math.PI / 2; // start at 12 o'clock
   for (const c of codes) {
     const sweep = (c.count / total) * Math.PI * 2;
     ctx.beginPath();
     ctx.arc(cx, cy, r, angle, angle + sweep);
     ctx.strokeStyle = c.color;
     ctx.lineWidth = donutW;
     ctx.lineCap = 'round';
     ctx.stroke();
     angle += sweep;
   }
   ```

3. **Self-typing code editor** — a character counter advances each frame by `CODE_SPEED` (0.8 chars/frame). The draw function renders only the characters up to that count, with a blinking cursor at the insertion point:
   ```js
   let charsLeft = Math.floor(codeChars);
   for (const token of line.tokens) {
     if (charsLeft < token.text.length) {
       ctx.fillText(token.text.slice(0, charsLeft), tokenX, y);
       // draw cursor
       break;
     }
     ctx.fillText(token.text, tokenX, y);
     charsLeft -= token.text.length;
   }
   codeChars += CODE_SPEED;
   ```

4. **S (scale) factor for small canvases** — all font sizes multiply by `S = Math.min(1, W / 480)` to gracefully scale down on narrow containers:
   ```js
   ctx.font = `${Math.round(11 * S)}px -apple-system, sans-serif`;
   ```

---

## 7. Mouse Interaction System

### Global mouse coordinates

One `mousemove` listener captures client coordinates globally:

```js
let gMx = -9999, gMy = -9999;
window.addEventListener('mousemove', (e) => { gMx = e.clientX; gMy = e.clientY; });
window.addEventListener('mouseleave', () => { gMx = -9999; gMy = -9999; });
```

### Per-canvas local coordinates

Each `renderProd()` call converts to canvas-local coordinates:

```js
function renderProd(idx, cs, t) {
  const rect = cs.canvas.getBoundingClientRect();
  const lx = gMx - rect.left;
  const ly = gMy - rect.top;
  const hasMouse = lx >= 0 && lx <= cs.w && ly >= 0 && ly <= cs.h;
  // pass lx, ly, hasMouse to the draw function
}
```

Never use `getBoundingClientRect()` inside the draw function — do it once at the top of `renderProd`.

### Smoothstep easing for influence

Raw linear falloff looks harsh. Use smoothstep³ (quintic ease) for organic feel:

```js
const raw = 1 - dist / INFLUENCE_RADIUS;     // linear 0-1
const s = raw * raw * (3 - 2 * raw);          // smoothstep
const influence = s * s * (3 - 2 * s);        // double-smoothstep (S-curve)
const pushMag = Math.pow(influence, 3) * PUSH_STRENGTH;
```

---

## 8. Tooltip System

All tooltips are drawn on canvas (not DOM). The `rrect()` helper is reused everywhere:

```js
function rrect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x+r, y); c.lineTo(x+w-r, y); c.quadraticCurveTo(x+w, y, x+w, y+r);
  c.lineTo(x+w, y+h-r); c.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  c.lineTo(x+r, y+h); c.quadraticCurveTo(x, y+h, x, y+h-r);
  c.lineTo(x, y+r); c.quadraticCurveTo(x, y, x+r, y);
  c.closePath();
}
```

### Tooltip anatomy

```js
// 1. Shadow
ctx.save();
ctx.shadowColor = `rgba(r,g,b,0.25)`; ctx.shadowBlur = 20;
rrect(ctx, tx, ty, TW, TH, 8); ctx.fillStyle = 'rgba(6,7,18,0.75)'; ctx.fill();
ctx.shadowBlur = 0; ctx.restore();

// 2. Tinted glass overlay (product accent colour at ~7% opacity)
rrect(ctx, tx, ty, TW, TH, 8); ctx.fillStyle = `rgba(r,g,b,0.07)`; ctx.fill();

// 3. Border
ctx.strokeStyle = `rgba(r,g,b,0.35)`; ctx.lineWidth = 1; ctx.stroke();

// 4. Top accent bar (product colour, 0.7 opacity)
ctx.globalAlpha = 0.7; rrect(ctx, tx, ty, TW, 3, 3); ctx.fillStyle = color; ctx.fill();
ctx.globalAlpha = 1;

// 5. Text content (labels in dim, values in bright, stats in accent)
ctx.font = '500 10px -apple-system'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
ctx.fillText(label, tx+pad, ty+row);
```

### Tooltip positioning

Always clamp to canvas bounds:
```js
let tx = mx + 14, ty = my - TH / 2;
if (tx + TW > W - 8) tx = mx - TW - 14; // flip left if off right edge
tx = Math.max(8, Math.min(W - TW - 8, tx));
ty = Math.max(8, Math.min(H - TH - 8, ty));
```

---

## 9. Auto-Spotlight (No Mouse Fallback)

Every interactive canvas keeps working when no mouse is present — it auto-demos itself. Patterns used:

### Pattern A: Auto-hover timer (SEO, Reach)

```js
let autoC = Math.floor(Math.random() * (NC - 1));
let autoTimer = 0;

// In draw loop (no-mouse branch):
if (now - autoTimer > 3) { // every 3 seconds
  autoTimer = now;
  autoC = Math.floor(Math.random() * (NC - 1));
  autoR = 1 + Math.floor(Math.random() * (NR - 3));
}
hovCellC = autoC; hovCellR = autoR;
```

### Pattern B: Sticky hover + decay (Reach, Social)

1. When user hovers → set `stickyC/stickyR`
2. When user leaves → hold sticky for 3 seconds, then fall back to auto
3. After 3s → resume auto-hover cycle

```js
if (hasMouse) {
  stickyC = cc; stickyR = rr;
  userActive = true;
} else {
  if (userActive) { userActive = false; userLeftAt = now; }
  if (now - userLeftAt < 3) {
    hovCellC = stickyC; hovCellR = stickyR; // hold sticky
  } else {
    // auto-hover
  }
}
```

### Pattern C: State machine (PelloPublish)

```js
let spotPhase: 'input' | 'waiting' | 'output' | 'cooldown' = 'cooldown';
// cooldown → pick input particle → track to engine → wait → pick output particle → track to platform → cooldown
```

---

## 10. Glassmorphism & CSS Layering

The `.product-card` component uses these styles (in `index.astro` global CSS):

```css
.product-card {
  position: relative;
  border-radius: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(6, 7, 18, 0.7);
  overflow: hidden;
}

.product-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 2s ease-in; /* fade in on load */
}

.product-card-content {
  position: relative;
  z-index: 1;
}
```

The card background tint is set per-product in JS (using the product's accent colour):
```js
card.style.background = `linear-gradient(135deg, ${color}12 0%, rgba(6, 7, 18, 0.70) 50%, ${color}08 100%)`;
card.style.borderColor = `${color}30`;
```

### Description text glassmorphism

Each product's body text paragraph gets a subtle tinted glass effect:
```css
.product-card .ps-info .text-body-lg {
  backdrop-filter: blur(12px) saturate(1.2);
  border-radius: 1rem;
  background: rgba(R, G, B, 0.06) !important;
  border: 1px solid rgba(R, G, B, 0.15) !important;
  padding: 1.25rem 1.5rem !important;
}
```

---

## 11. How to Build a New Component

Follow this exact checklist to add a new interactive canvas section.

### Step 1: HTML structure

In `index.astro`, add a `product-card` div with a canvas:

```html
<div class="product-card" data-product="N">
  <canvas class="product-bg" aria-hidden="true"></canvas>
  <div class="product-card-content">
    <!-- your layout here -->
  </div>
</div>
```

For a more complex component with its own canvas (like the dashboards), add a named canvas inside the layout:

```html
<div class="build-window-body">
  <canvas id="myproduct-canvas" aria-hidden="true"></canvas>
</div>
```

### Step 2: Define the accent colour

Add to `PV_RGB` array in the script:
```js
const PV_RGB: [number,number,number][] = [
  // ... existing entries ...
  [R, G, B],  // your new product
];
```

### Step 3: Write the state init function

```ts
function initMyProduct(w: number, h: number): Record<string, unknown> {
  return {
    // pre-compute everything needed for the first frame
    nodes: generateNodes(w, h),
    startTime: performance.now() * 0.001,
    hoveredIdx: -1,
  };
}
```

### Step 4: Write the draw function

```ts
function drawMyProduct(
  ctx: CanvasRenderingContext2D,
  w: number, h: number,
  t: number,           // time in seconds
  mx: number, my: number, // mouse in CSS pixels relative to canvas
  hasMouse: boolean,
  state: Record<string, unknown>
) {
  const st = state as MyState; // cast
  ctx.clearRect(0, 0, w, h);
  
  // 1. Update state (physics, timers)
  // 2. Draw background/ambient
  // 3. Draw data/interactive elements
  // 4. Draw hover effects / tooltips LAST
}
```

### Step 5: Register in the orchestrator

In the `renderProd` switch:
```js
function renderProd(idx, cs, t) {
  // ...
  switch(idx) {
    // ... existing cases ...
    case N: drawMyProduct(ctx, w, h, t, lx, ly, hasMouse, state); break;
  }
}
```

And in `initProdState`:
```js
function initProdState(idx, w, h) {
  switch(idx) {
    // ... existing cases ...
    case N: return initMyProduct(w, h);
    default: return {};
  }
}
```

### Step 6: For complex standalone canvases

Wrap in an IIFE (immediately invoked function expression) with its own resize + rAF loop. Place it after the main `pvLoop`:

```js
(function() {
  const canvas = document.getElementById('myproduct-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  // ... full self-contained resize + draw loop ...
})();
```

---

## 12. Common Mistakes to Avoid

### ❌ Drawing in physical pixels
```js
// WRONG — blurry on retina
canvas.width = container.clientWidth;
canvas.height = container.clientHeight;
// RIGHT
canvas.width = container.clientWidth * devicePixelRatio;
canvas.height = container.clientHeight * devicePixelRatio;
ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
```

### ❌ Using canvas.width as the logical width
```js
// WRONG — this is physical pixels
ctx.fillRect(0, 0, canvas.width, canvas.height);
// RIGHT
const W = canvas.width / dpr; // CSS pixels
ctx.fillRect(0, 0, W, H);
```

### ❌ Querying DOM every frame
```js
// WRONG
function frame() {
  const rect = document.querySelector('.my-thing').getBoundingClientRect();
}
// RIGHT — cache it once at init
const cachedRect = el.getBoundingClientRect();
```

### ❌ Forgetting to restore globalAlpha
```js
// WRONG — globalAlpha bleeds to next draws
ctx.globalAlpha = 0.5;
ctx.fillRect(...);
// RIGHT
ctx.save(); ctx.globalAlpha = 0.5; ctx.fillRect(...); ctx.restore();
// OR manually reset
ctx.globalAlpha = 0.5;
ctx.fillRect(...);
ctx.globalAlpha = 1; // reset
```

### ❌ Rendering off-screen canvases
```js
// WRONG — wastes CPU on invisible elements
requestAnimationFrame(frame); // runs even when not visible
// RIGHT — use IntersectionObserver to skip off-screen canvases
```

### ❌ All animation in one giant draw function
Break complex components into sub-functions (`drawPanel`, `drawTooltip`, `drawHeader`) that each own their section of the canvas. The main draw just calls them in order.

### ❌ Spawning state inside the rAF loop
```js
// WRONG — recreates arrays every frame
function frame() {
  const nodes = buildNodes(w, h); // allocates memory every 16ms
}
// RIGHT — build state once, mutate it in the loop
const state = buildNodes(w, h);
function frame() {
  updateNodes(state); // mutates in place
}
```

### ❌ Hardcoding pixel values without canvas size
Use fractions of `W` and `H` everywhere. Never do `ctx.arc(200, 150, ...)` — do `ctx.arc(W * 0.4, H * 0.375, ...)`.

---

## Summary

The entire interactive component system is:
1. **Astro + Tailwind** for the page/layout
2. **Canvas 2D API** for all animation
3. **requestAnimationFrame** with `IntersectionObserver` to skip off-screen
4. **devicePixelRatio + setTransform** for crisp retina rendering
5. **Smoothstep easing** for all influence/interaction curves
6. **IIFE isolation** for complex standalone canvases
7. **Pre-compiled `Path2D`** for SVG icon rendering
8. **Auto-spotlight state machines** so everything demos itself without a mouse

No React. No Three.js. No canvas libraries. Just pixels.

---

## Appendix: Full Source Code for Each Component

All code lives inside the single `<script>` block in `src/pages/index.astro`. The shared Perlin noise utility and the `rrect` helper are available to all components. TypeScript types are used throughout.

---

### Shared Utilities (used by all components)

```typescript
// ── Perlin noise (2D) ─────────────────────────────────────────────────────
// Used by: SEO, Pitch (topo), Ads (hex), Flow (circuit pulses), Publish (rain)
const PERM = new Uint8Array(512);
{
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = ((i * 2654435761) >>> 0) % (i + 1);
    const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
  }
  for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
}
const GRADS: [number,number][] = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
function fade(t: number) { return t*t*t*(t*(t*6-15)+10); }
function nlerp(a: number, b: number, t: number) { return a+t*(b-a); }
function grad(h: number, x: number, y: number) { const [gx,gy]=GRADS[h&7]; return gx*x+gy*y; }
function noise2(x: number, y: number): number {
  const X=Math.floor(x)&255, Y=Math.floor(y)&255;
  const xf=x-Math.floor(x), yf=y-Math.floor(y);
  const u=fade(xf), v=fade(yf);
  const aa=PERM[PERM[X]+Y], ab=PERM[PERM[X]+Y+1];
  const ba=PERM[PERM[X+1]+Y], bb=PERM[PERM[X+1]+Y+1];
  return nlerp(
    nlerp(grad(aa,xf,yf), grad(ba,xf-1,yf), u),
    nlerp(grad(ab,xf,yf-1), grad(bb,xf-1,yf-1), u),
    v
  );
}

// ── Rounded rect helper ───────────────────────────────────────────────────
// Used by every tooltip and glass card
function rrect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x+r, y); c.lineTo(x+w-r, y); c.quadraticCurveTo(x+w, y, x+w, y+r);
  c.lineTo(x+w, y+h-r); c.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  c.lineTo(x+r, y+h); c.quadraticCurveTo(x, y+h, x, y+h-r);
  c.lineTo(x, y+r); c.quadraticCurveTo(x, y, x+r, y);
  c.closePath();
}

// ── Per-product accent RGB lookup ─────────────────────────────────────────
// Index maps to data-product attribute value
const PV_RGB: [number,number,number][] = [
  [99,102,241],   // 0  PelloSEO     #6366f1
  [139,92,246],   // 1  PelloReach   #8b5cf6
  [168,85,247],   // 2  PelloPublish #a855f7
  [192,38,211],   // 3  PelloSocial  #c026d3
  [124,58,237],   // 4  PelloPitch   #7c3aed
  [79,70,229],    // 5  PelloAds     #4f46e5
  [147,51,234],   // 6  PelloFlow    #9333ea
  [34,197,94],    // 7  PelloBuild   #22c55e
];
```

---

### Component 0 — PelloSEO: Interactive Dot Matrix

**What it does:** Renders thousands of tiny coloured dots — each one represents a programmatic SEO page. Dots are categorised by template type (each gets a distinct colour). Mouse repels dots away. Hovering any dot shows a tooltip with the generated page title and status.

```typescript
// ── Data ─────────────────────────────────────────────────────────────────
interface SeoTemplate { name: string; color: [number,number,number]; weight: number; }
const SEO_TMPLS: SeoTemplate[] = [
  { name: "Best {Service} in {City}",     color: [99,102,241],  weight: 0.30 },
  { name: "{Product} for {Industry}",     color: [139,92,246],  weight: 0.20 },
  { name: "How to {Action} with {Tool}",  color: [168,85,247],  weight: 0.15 },
  { name: "{Competitor} Alternative",     color: [192,38,211],  weight: 0.12 },
  { name: "Top {N} {Category} in {Year}", color: [124,58,237],  weight: 0.13 },
  { name: "{Service} near {Location}",    color: [79,70,229],   weight: 0.10 },
];
// Cumulative weight table for weighted-random template selection
const SEO_TCUM: number[] = [];
{ let _s=0; for (const _t of SEO_TMPLS) { _s+=_t.weight; SEO_TCUM.push(_s); } }

const SEO_SERVICES   = ["Plumber","Electrician","Personal Trainer","Accountant","Dentist","Lawyer","Photographer","Web Designer","Therapist","Mechanic","Tutor","Cleaner","Landscaper","Roofer","Painter"];
const SEO_CITIES     = ["London","Manchester","Birmingham","Leeds","Glasgow","Bristol","Liverpool","Edinburgh","Cardiff","Belfast","Oxford","Cambridge","Brighton","Bath","York"];
const SEO_PRODUCTS   = ["CRM Software","Project Management","Email Marketing","Analytics Platform","HR Software","Inventory System","Booking Platform","Payment Gateway"];
const SEO_INDUSTRIES = ["SaaS","E-commerce","Healthcare","Finance","Education","Real Estate","Hospitality","Legal"];
const SEO_ACTIONS    = ["Grow Revenue","Reduce Churn","Scale Operations","Automate Workflows","Track Metrics","Generate Leads"];
const SEO_TOOLS      = ["AI","Automation","Data Analytics","Machine Learning","No-Code","API Integration"];
const SEO_COMPS      = ["HubSpot","Mailchimp","Salesforce","Monday.com","Ahrefs","SEMrush","Moz","Shopify"];
const SEO_CATS       = ["Marketing Tools","CRM Platforms","SEO Strategies","Content Ideas","Growth Hacks","Automation Tools"];
const SEO_LOCS       = ["Central London","Downtown Manchester","East Birmingham","North Leeds","Shoreditch","Canary Wharf","Soho","Camden"];
const SEO_TOPS_N     = ["5","7","10","15","20"];
const SEO_YEARS      = ["2024","2025","2026"];

// ── Constants ─────────────────────────────────────────────────────────────
const SEO_GSZ   = 10;  // grid spacing in px
const SEO_INFL  = 100; // mouse influence radius
const SEO_PUSH  = 4;   // max push distance
const SEO_LERP  = 0.035;
const SEO_HOV_R = 15;  // hover detection radius
const SEO_PROX_R= 40;  // proximity lens radius
const SEO_IDX=0, SEO_PUB=1, SEO_GEN=2; // status constants

// ── Helpers ───────────────────────────────────────────────────────────────
function seoPick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }
function seoPickTmpl(): number {
  const rv = Math.random();
  for (let i=0; i<SEO_TCUM.length; i++) if (rv < SEO_TCUM[i]) return i;
  return SEO_TMPLS.length - 1;
}
function seoGenTitle(tIdx: number): string {
  switch(tIdx) {
    case 0: return `Best ${seoPick(SEO_SERVICES)} in ${seoPick(SEO_CITIES)}`;
    case 1: return `${seoPick(SEO_PRODUCTS)} for ${seoPick(SEO_INDUSTRIES)}`;
    case 2: return `How to ${seoPick(SEO_ACTIONS)} with ${seoPick(SEO_TOOLS)}`;
    case 3: return `${seoPick(SEO_COMPS)} Alternative`;
    case 4: return `Top ${seoPick(SEO_TOPS_N)} ${seoPick(SEO_CATS)} in ${seoPick(SEO_YEARS)}`;
    case 5: return `${seoPick(SEO_SERVICES)} near ${seoPick(SEO_LOCS)}`;
    default: return `Page ${tIdx}`;
  }
}
function seoSmooth(x: number): number { x=Math.max(0,Math.min(1,x)); return x*x*(3-2*x); }

// ── State type ────────────────────────────────────────────────────────────
interface SeoDot {
  gx: number; gy: number; // immutable grid position
  x: number;  y: number;  // current display position (lerps)
  templateIdx: number;
  title: string;
  status: number; // SEO_IDX | SEO_PUB | SEO_GEN
  birthTime: number; // staggered reveal: distance from centre * 0.003
  phase: number;    // random offset for sin animations
}

// ── Init ──────────────────────────────────────────────────────────────────
function initSEO(w: number, h: number) {
  const cols = Math.ceil(w/SEO_GSZ)+1, rows = Math.ceil(h/SEO_GSZ)+1;
  const cx = w/2, cy = h/2;
  const dots: SeoDot[] = [];
  for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
    const gx = c*SEO_GSZ, gy = r*SEO_GSZ;
    const tIdx = seoPickTmpl();
    const sr = Math.random();
    const status = sr<0.10 ? SEO_PUB : sr<0.30 ? SEO_GEN : SEO_IDX;
    const dist = Math.sqrt((gx-cx)**2 + (gy-cy)**2);
    dots.push({ gx, gy, x: gx, y: gy,
      templateIdx: tIdx, title: seoGenTitle(tIdx),
      status, birthTime: dist*0.003, phase: Math.random()*Math.PI*2
    });
  }
  return { dots, startTime: performance.now()*0.001, hoveredIdx: -1 };
}

// ── Tooltip ───────────────────────────────────────────────────────────────
function drawSEOTooltip(c: CanvasRenderingContext2D, dot: SeoDot, W: number, H: number) {
  const px=dot.x, py=dot.y;
  const tmpl=SEO_TMPLS[dot.templateIdx];
  const [r,g,b]=tmpl.color;
  const catLabel=tmpl.name.toUpperCase();
  const titleText=dot.title;
  const isPublished=dot.status===SEO_PUB, isIndexed=dot.status===SEO_IDX;
  const statusDot=isPublished?'●':isIndexed?'●':'○';
  const statusLabel=isPublished?' published':isIndexed?' indexed':' generating';
  const statusColor=isPublished?'rgba(74,222,128,0.9)':isIndexed?'rgba(99,202,241,0.8)':'rgba(251,191,36,0.8)';
  const pad=14;
  c.font='500 15px -apple-system,system-ui,sans-serif';
  const tW=c.measureText(titleText).width;
  c.font='bold 10px "SF Mono","Fira Code",monospace';
  const cW=c.measureText(catLabel).width;
  const tooltipW=Math.max(220, Math.min(Math.max(tW,cW)+pad*2, 360));
  const tooltipH=82;
  let tx=px-tooltipW/2, ty=py-tooltipH-16;
  tx=Math.max(6, Math.min(W-tooltipW-6, tx));
  if (ty<6) ty=py+14;
  if (ty+tooltipH>H-6) ty=py-tooltipH-14;
  c.save();
  // Connector line
  c.globalAlpha=0.18; c.strokeStyle=`rgb(${r},${g},${b})`; c.lineWidth=1;
  c.beginPath(); c.moveTo(px,py-5); c.lineTo(px, ty<py?ty+tooltipH:ty); c.stroke();
  // Glass bg
  c.globalAlpha=1; c.shadowColor=`rgba(${r},${g},${b},0.2)`; c.shadowBlur=24;
  rrect(c,tx,ty,tooltipW,tooltipH,8); c.fillStyle='rgba(6,7,18,0.65)'; c.fill();
  c.shadowBlur=0;
  rrect(c,tx,ty,tooltipW,tooltipH,8); c.fillStyle=`rgba(${r},${g},${b},0.08)`; c.fill();
  c.strokeStyle=`rgba(${r},${g},${b},0.3)`; c.lineWidth=1; c.stroke();
  // Top accent bar
  c.globalAlpha=0.6; c.fillStyle=`rgb(${r},${g},${b})`;
  rrect(c,tx,ty,tooltipW,3,3); c.fill();
  // Text
  c.globalAlpha=0.8; c.fillStyle=`rgb(${r},${g},${b})`; c.font='bold 10px "SF Mono","Fira Code",monospace'; c.textAlign='left';
  c.fillText(catLabel, tx+pad, ty+pad+10);
  c.globalAlpha=1; c.fillStyle='#ffffff'; c.font='500 15px -apple-system,system-ui,sans-serif';
  c.save(); c.beginPath(); c.rect(tx+pad, ty+pad+14, tooltipW-pad*2, 22); c.clip();
  c.fillText(titleText, tx+pad, ty+pad+30); c.restore();
  c.globalAlpha=0.9; c.fillStyle=statusColor; c.font='10px "SF Mono","Fira Code",monospace'; c.textAlign='left';
  c.fillText(statusDot+statusLabel, tx+pad, ty+pad+52);
  c.restore();
}

// ── Draw ──────────────────────────────────────────────────────────────────
function drawSEO(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number,
    mx: number, my: number, hasMouse: boolean, state: Record<string, unknown>) {
  const st = state as { dots:SeoDot[]; startTime:number; hoveredIdx:number };
  const dots = st.dots;
  const now = performance.now()*0.001;
  const elapsed = now - st.startTime;
  const W=w, H=h;

  // Hover detection
  if (hasMouse) {
    let best=-1, bestD=SEO_HOV_R;
    for (let i=0; i<dots.length; i++) {
      const d=dots[i]; if (elapsed-d.birthTime<0) continue;
      const dx=d.x-mx, dy=d.y-my, dist=Math.sqrt(dx*dx+dy*dy);
      if (dist<bestD) { bestD=dist; best=i; }
    }
    st.hoveredIdx=best;
  } else { st.hoveredIdx=-1; }

  let visCount=0;
  for (let i=0; i<dots.length; i++) {
    const dot=dots[i];
    const age=elapsed-dot.birthTime;
    if (age<0) continue;
    const fadeIn=Math.min(1, age/0.3);
    if (fadeIn<0.005) continue;

    // Pulse ripple from centre every 8s
    const cx=W/2, cy=H/2;
    const distC=Math.sqrt((dot.gx-cx)**2+(dot.gy-cy)**2);
    const pElapsed=elapsed-5;
    let pulseAlpha=0;
    if (pElapsed>0) {
      const cycleT=pElapsed%8;
      const dca=cycleT-distC*0.003;
      if (dca>0&&dca<0.6) pulseAlpha=Math.sin((dca/0.6)*Math.PI)*0.3;
    }
    visCount++;

    // Mouse push with double-smoothstep easing
    let targetX=dot.gx, targetY=dot.gy;
    if (hasMouse) {
      const pdx=dot.gx-mx, pdy=dot.gy-my, pdist=Math.sqrt(pdx*pdx+pdy*pdy);
      if (pdist<SEO_INFL) {
        const raw=1-pdist/SEO_INFL, s=raw*raw*(3-2*raw), inf=s*s*(3-2*s);
        const pushMag=Math.pow(inf,3)*SEO_PUSH, len=pdist||1;
        targetX+=(pdx/len)*pushMag; targetY+=(pdy/len)*pushMag;
      }
    }
    dot.x+=(targetX-dot.x)*SEO_LERP;
    dot.y+=(targetY-dot.y)*SEO_LERP;

    // Vertical fade out at bottom 18%
    const fadeZone=H*0.82;
    let vFade=1;
    if (dot.gy>fadeZone) vFade=1-Math.min(1,(dot.gy-fadeZone)/(H-fadeZone));
    if (vFade<0.005) continue;

    const [r,g,b]=SEO_TMPLS[dot.templateIdx].color;
    let alpha: number, radius: number;
    if      (dot.status===SEO_PUB) { alpha=0.30+Math.sin(now*1.2+dot.phase)*0.10; radius=2; }
    else if (dot.status===SEO_GEN) { alpha=0.12; radius=1.8+Math.sin(now*0.8+dot.phase)*0.2; }
    else                           { alpha=0.25; radius=2; }
    if (st.hoveredIdx===i) { alpha=0.9; radius=5; }

    // Proximity magnification lens
    if (st.hoveredIdx!==i && hasMouse) {
      const ldx=dot.x-mx, ldy=dot.y-my, ldist=Math.sqrt(ldx*ldx+ldy*ldy);
      if (ldist<SEO_PROX_R) {
        const pf=seoSmooth(1-ldist/SEO_PROX_R);
        radius+=pf*0.8;
        if (st.hoveredIdx<0) alpha+=pf*0.10;
      }
    }

    alpha=Math.min(0.95, alpha+pulseAlpha);
    ctx.globalAlpha=alpha*fadeIn*vFade;
    ctx.fillStyle=`rgb(${r},${g},${b})`;
    ctx.beginPath(); ctx.arc(dot.x,dot.y,Math.max(0.5,radius),0,Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;

  if (st.hoveredIdx>=0) {
    const dot=dots[st.hoveredIdx];
    if (elapsed-dot.birthTime>=0) drawSEOTooltip(ctx, dot, W, H);
  }

  // Page counter HUD
  ctx.save(); ctx.textAlign='right'; ctx.globalAlpha=0.8;
  ctx.fillStyle='rgba(99,102,241,0.55)'; ctx.font='9px "SF Mono","Fira Code",monospace';
  ctx.fillText(`${visCount.toLocaleString()} pages`, W-10, 16);
  ctx.restore();
}
```

---

### Component 1 — PelloReach: Perspective Email Grid

**What it does:** Vanishing-point perspective grid where each cell is an outreach email to a real prospect. Particles flow down the grid. Hover any cell for an email preview tooltip. Hover legend items to filter by status.

```typescript
// ── Data ─────────────────────────────────────────────────────────────────
interface ReachCell {
  firstName: string; lastName: string; company: string; role: string;
  domain: string; subject: string; opener: string;
  stage: string; status: 'delivered' | 'opened' | 'replied';
}
interface ReachParticle { c: number; r: number; speed: number; }
interface ReachLegItem { label: string; status: string; color: string; x: number; y: number; w: number; h: number; }

const REACH_FIRST_NAMES = ["Sarah","James","Emma","Michael","Sophie","Daniel","Rachel","Tom","Jessica","Alex","Chris","Lauren","David","Hannah","Ben","Kate","Ryan","Olivia","Mark","Lucy"];
const REACH_LAST_NAMES  = ["Chen","Williams","Patel","Thompson","Garcia","Anderson","Martinez","Johnson","Lee","Taylor","Brown","Wilson","Moore","Clark","Hall","Young","King","Wright","Scott","Green"];
const REACH_COMPANIES   = ["Acme Corp","TechFlow","DataSync","CloudNine","Nexus Labs","Horizon AI","Vertex Systems","PulseMedia","Zenith Group","Atlas Digital","BrightPath","CoreStack","DeepBlue","EdgePoint","FrontLine","GrowthLab","HyperScale","InnoVate","JetStream","KineticIO"];
const REACH_ROLES       = ["Head of Marketing","VP Growth","CMO","Marketing Director","Digital Lead","Growth Manager","Head of Demand Gen","Performance Lead","Brand Director","Acquisition Manager"];
const REACH_DOMAINS     = ["outreach-hub.io","connect-reach.co","mailflow-pro.com","sendgrid-alt.io","inbox-direct.co","pulse-mail.com","rapid-reach.io","smart-send.co","flow-mail.io","direct-reach.com"];
const REACH_SUBJECTS    = [
  "Quick question about {company}'s growth strategy",
  "{firstName}, saw your recent {company} launch",
  "Idea for {company}'s outreach — 3 min read",
  "{firstName} — {company} + Pello could be interesting",
  "Re: scaling {company}'s pipeline",
  "{firstName}, one thing about {company}'s email strategy",
  "Congrats on {company}'s Series B, {firstName}",
  "Quick win for {company}'s demand gen",
];
const REACH_OPENERS = [
  "I noticed {company} just expanded into new markets — impressive growth.",
  "Saw your LinkedIn post about {company}'s Q3 results, {firstName}.",
  "A mutual connection mentioned {company} is scaling outreach.",
  "Your talk at SaaStr about {company}'s growth was spot on.",
  "{firstName}, I came across {company}'s case study on demand gen.",
  "Noticed {company} is hiring 3 new SDRs — sounds like you're scaling.",
];

function reachPick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function reachFill(tmpl: string, fn: string, co: string): string {
  return tmpl.replace(/{firstName}/g, fn).replace(/{company}/g, co);
}
function reachGenCell(): ReachCell {
  const fn = reachPick(REACH_FIRST_NAMES), co = reachPick(REACH_COMPANIES);
  const sr = Math.random();
  return {
    firstName: fn, lastName: reachPick(REACH_LAST_NAMES), company: co, role: reachPick(REACH_ROLES),
    domain: reachPick(REACH_DOMAINS),
    subject: reachFill(reachPick(REACH_SUBJECTS), fn, co),
    opener:  reachFill(reachPick(REACH_OPENERS), fn, co),
    stage:   reachPick(['1st touch', 'follow-up', 'reply']),
    status:  sr < 0.60 ? 'delivered' : sr < 0.85 ? 'opened' : 'replied',
  };
}

// ── Init ──────────────────────────────────────────────────────────────────
function initReach(w: number, h: number): Record<string, unknown> {
  const NC=15, NR=12;
  const VP_Y=h*0.12, BOT_Y=h*0.96, HALF_W=w*0.32, GRID_CX=w*0.50;
  const total=(NC-1)*(NR-1);
  const cells: ReachCell[]=Array.from({length:total}, reachGenCell);
  const particles: ReachParticle[]=Array.from({length:22}, ()=>({
    c: Math.random()*(NC-1), r: Math.random()*(NR-1),
    speed: 0.04+Math.random()*0.06,
  }));
  const BOX_W_INIT=160;
  const legX=GRID_CX+BOX_W_INIT/2+16;
  const legStartY=Math.max(4, h*0.12-44-6);
  const legItems: ReachLegItem[]=[
    { label:'Delivered', status:'delivered', color:'rgba(139,92,246,0.5)', x:legX, y:legStartY,    w:150, h:22 },
    { label:'Opened',    status:'opened',    color:'rgba(168,85,247,0.6)', x:legX, y:legStartY+24, w:150, h:22 },
    { label:'Replied',   status:'replied',   color:'rgba(74,222,128,0.7)', x:legX, y:legStartY+48, w:150, h:22 },
  ];
  return { NC,NR,VP_Y,BOT_Y,HALF_W,GRID_CX, cells,particles,
    emailCount:18283, lastTick:0, hovCellC:-1, hovCellR:-1,
    legItems, hoveredLegend:null,
    autoC:Math.floor(Math.random()*(NC-1)), autoR:Math.floor(Math.random()*(NR-1)),
    autoTimer:0, userActive:false, userLeftAt:0, stickyC:-1, stickyR:-1
  };
}

// ── Perspective projection ─────────────────────────────────────────────────
// project(c, r) → screen {sx, sy}. Columns converge to GRID_CX at VP_Y.
// project uses tFrac = r/(NR-1) so row 0 = vanishing point, row NR-1 = bottom.
// drawReach is ~250 lines — see full source in index.astro lines 1768–1990.
```

---

### Component 2 — PelloPublish Background: Vertical Dash Rain

**What it does:** Simple falling dash animation in the `.product-bg` canvas behind the Publish section. Mouse slows columns beneath the cursor and brightens them.

```typescript
interface RainDash   { y: number; alpha: number; speed: number; }
interface RainColumn { x: number; dashes: RainDash[]; }

function initRain(w: number, h: number) {
  const numCols=50, colW=w/numCols;
  const columns: RainColumn[]=[];
  for (let c=0; c<numCols; c++) {
    const dashes: RainDash[]=[];
    for (let d=0; d<10; d++) dashes.push({
      y:     Math.random()*h,
      alpha: 0.30+Math.random()*0.15,
      speed: 0.3+Math.random()*0.5,
    });
    columns.push({ x: c*colW+colW/2, dashes });
  }
  return { columns };
}

function drawRain(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number,
    mx: number, my: number, hasMouse: boolean, state: Record<string, unknown>) {
  const { columns } = state as { columns: RainColumn[] };
  const [r,g,b]=PV_RGB[2]; // #a855f7 purple
  for (const col of columns) {
    const near=hasMouse && Math.abs(mx-col.x) < w/50; // within one column width
    const speedMult=near ? 0.3 : 1;   // slow down near mouse
    const alphaMult=near ? 1.8 : 1;   // brighten near mouse
    for (const dash of col.dashes) {
      dash.y+=dash.speed*speedMult;
      if (dash.y > h+5) { dash.y=-5; dash.speed=0.3+Math.random()*0.5; dash.alpha=0.30+Math.random()*0.15; }
      const a=Math.min(0.55, dash.alpha*alphaMult);
      ctx.strokeStyle=`rgba(${r},${g},${b},${a})`;
      ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(col.x-1.5, dash.y); ctx.lineTo(col.x+1.5, dash.y); ctx.stroke();
    }
  }
}
```

> **Note:** The full Publish interactive canvas (`#pub-flow-canvas`) is the node graph with particles and rich tooltips — that's a large self-contained IIFE starting around line 3323 in index.astro. It is best read directly from the source as it is ~800 lines.

---

### Component 3 — PelloSocial: Holographic Rotating Globe

**What it does:** A spinning 3D globe using Fibonacci sphere distribution. Land masses detected by lat/lon bounding boxes. Phone nodes placed at real city coordinates. Horizontal scan beam sweeps the globe. Hover a node to see which social accounts it runs.

```typescript
// ── Land detection (bounding box approximations) ──────────────────────────
function socIsLand(lat: number, lon: number): boolean {
  if (lat>=15&&lat<=70&&lon>=-168&&lon<=-52) return true;  // North America
  if (lat>=7&&lat<=22&&lon>=-92&&lon<=-60)   return true;  // Central America
  if (lat>=-56&&lat<=12&&lon>=-82&&lon<=-34) return true;  // South America
  if (lat>=50&&lat<=59&&lon>=-11&&lon<=2)    return true;  // UK/Ireland
  if (lat>=36&&lat<=60&&lon>=-10&&lon<=30)   return true;  // Europe core
  if (lat>=55&&lat<=71&&lon>=4&&lon<=30)     return true;  // Scandinavia
  if (lat>=42&&lat<=75&&lon>=28&&lon<=180)   return true;  // Russia/Asia
  if (lat>=18&&lat<=37&&lon>=-17&&lon<=38)   return true;  // North Africa
  if (lat>=-35&&lat<=12&&lon>=14&&lon<=52)   return true;  // Sub-Saharan Africa
  if (lat>=6&&lat<=28&&lon>=66&&lon<=92)     return true;  // India
  if (lat>=1&&lat<=28&&lon>=92&&lon<=110)    return true;  // SE Asia
  if (lat>=18&&lat<=55&&lon>=100&&lon<=135)  return true;  // China
  if (lat>=30&&lat<=45&&lon>=129&&lon<=146)  return true;  // Japan
  if (lat>=-39&&lat<=-10&&lon>=113&&lon<=154)return true;  // Australia
  if (lat>=-47&&lat<=-34&&lon>=166&&lon<=180)return true;  // New Zealand
  return false;
}

// ── Coordinate conversions ────────────────────────────────────────────────
function socLatLonTo3D(lat: number, lon: number): [number,number,number] {
  const phi=(90-lat)*Math.PI/180, theta=(lon+180)*Math.PI/180;
  return [Math.sin(phi)*Math.cos(theta), Math.cos(phi), Math.sin(phi)*Math.sin(theta)];
}

const SOC_TILT = 15*Math.PI/180; // 15° tilt toward viewer

function socApplyRotations(x: number, y: number, z: number, rotY: number): [number,number,number] {
  // 1. X-axis tilt
  const ct=Math.cos(SOC_TILT), st=Math.sin(SOC_TILT);
  const [x2,y2]=[x*ct-y*st, x*st+y*ct];
  // 2. Y-axis spin
  const cy=Math.cos(rotY), sy=Math.sin(rotY);
  return [x2*cy+z*sy, y2, -x2*sy+z*cy];
}

function socProject(x: number, y: number, z: number, rotY: number,
    globeR: number, globeCX: number, globeCY: number) {
  const [rx,ry,rz]=socApplyRotations(x,y,z,rotY);
  return { sx: globeCX+rx*globeR, sy: globeCY-ry*globeR, depth: rz, visible: rz>-0.1 };
}

// ── Init ──────────────────────────────────────────────────────────────────
// initSocial(w, h) — creates 800 globe dots via Fibonacci sphere + ~50 phone nodes
// at real city lat/lon positions. Returns full state including rotY=0.
// drawSocial(ctx, w, h, t, ...) — advances rotY+=0.005 per frame, 4 render passes
// for depth sorting, scan beam, activity pulses, phone node hit-testing, HUD glass panel.
// Full implementation: index.astro lines 2112–2466 (~350 lines).

// Key render loop structure:
function drawSocial_OVERVIEW() {
  // 1. rotY += 0.005 (continuous spin)
  // 2. Scan beam: sweeps top→bottom over 5s using (t%5)/5
  // 3. Globe ambient glow (radialGradient)
  // 4. Edge ring (arc stroke, breathing opacity)
  // 5. Horizontal scan lines (every 4px, near-beam ones are brighter)
  // 6. Four render passes (back ocean, back land, front ocean, front land+glow)
  // 7. Activity pulses (spawned every 0.6s, expanding ring animation)
  // 8. Phone node hit-testing (user→sticky 3s→auto-hover 4s cycle)
  // 9. Phone node rendering (outer ring, inner dot, platform colour, pulse for active)
  // 10. Tooltip (drawSocTooltip) for hovered phone
  // 11. HUD glass div update (position + innerHTML built once, values updated each frame)
}
```

---

### Component 4 — PelloPitch: Topographic Contour Map

**What it does:** Marching squares algorithm on a Perlin noise field, producing animated contour lines. Mouse adds a Gaussian hill that deforms the surface in real time.

```typescript
function drawTopo(ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
    mx: number, my: number, hasMouse: boolean, _state: Record<string, unknown>) {
  const [r,g,b]=PV_RGB[4]; // #7c3aed purple
  const step=8; // grid resolution in px
  const cols=Math.ceil(w/step)+1, rows=Math.ceil(h/step)+1;

  // ── Sample noise field ─────────────────────────────────────────────────
  const grid: number[][]=[];
  for (let row=0; row<rows; row++) {
    grid[row]=[];
    for (let col=0; col<cols; col++) {
      const x=col*step, y=row*step;
      let v=noise2(x*0.020+t*0.2, y*0.020+t*0.15); // animated noise
      if (hasMouse) {
        // Gaussian hill at mouse position (radius ~122px, height 0.4)
        const dx=x-mx, dy=y-my, d2=dx*dx+dy*dy;
        v+=Math.exp(-d2/15000)*0.4;
      }
      grid[row][col]=v;
    }
  }

  // ── Marching squares ───────────────────────────────────────────────────
  const levels=[-0.5,-0.3,-0.1,0.1,0.3,0.5];
  const alphas=[0.20,0.25,0.30,0.35,0.40,0.45];
  for (let li=0; li<levels.length; li++) {
    const level=levels[li];
    ctx.strokeStyle=`rgba(${r},${g},${b},${alphas[li]})`;
    ctx.lineWidth=1;
    ctx.beginPath();
    for (let row=0; row<rows-1; row++) for (let col=0; col<cols-1; col++) {
      const tl=grid[row][col],   tr=grid[row][col+1];
      const bl=grid[row+1][col], br=grid[row+1][col+1];
      const x0=col*step, y0=row*step;
      // Find edge crossings
      const cr: [number,number][]=[];
      if ((tl<level)!==(tr<level)) { const tt=(level-tl)/(tr-tl); cr.push([x0+tt*step, y0]); }         // top
      if ((tr<level)!==(br<level)) { const tt=(level-tr)/(br-tr); cr.push([x0+step, y0+tt*step]); }      // right
      if ((bl<level)!==(br<level)) { const tt=(level-bl)/(br-bl); cr.push([x0+tt*step, y0+step]); }     // bottom
      if ((tl<level)!==(bl<level)) { const tt=(level-tl)/(bl-tl); cr.push([x0, y0+tt*step]); }          // left
      if (cr.length===2) {
        ctx.moveTo(cr[0][0],cr[0][1]); ctx.lineTo(cr[1][0],cr[1][1]);
      } else if (cr.length===4) {
        ctx.moveTo(cr[0][0],cr[0][1]); ctx.lineTo(cr[3][0],cr[3][1]);
        ctx.moveTo(cr[1][0],cr[1][1]); ctx.lineTo(cr[2][0],cr[2][1]);
      }
    }
    ctx.stroke();
  }
}
```

---

### Component 5 — PelloAds Background: Hexagonal Pulse Grid

**What it does:** Tiled hexagons with a radiating sine wave pulse from the centre. Mouse brightens nearby hexagons. Used as the `.product-bg` ambient canvas behind PelloAds.

```typescript
function initAdsBg(_w: number, _h: number) { return {}; } // no state needed

function drawAdsBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
    mx: number, my: number, hasMouse: boolean, _state: Record<string, unknown>) {
  const [r,g,b]=PV_RGB[5]; // #4f46e5 indigo
  const hexR=25;                        // hex radius in px
  const hexH=hexR*Math.sqrt(3);         // row height
  for (let row=-1; row<h/hexH+1; row++) {
    for (let col=-1; col<w/(hexR*3)+1; col++) {
      // Offset alternate rows by 1.5 radii for hex packing
      const cx=col*hexR*3 + (row%2)*hexR*1.5;
      const cy=row*hexH;
      // Radial sine wave from canvas centre
      const dx=cx-w/2, dy=cy-h/2, d=Math.sqrt(dx*dx+dy*dy);
      const wave=Math.sin(d*0.01-t*2)*0.5+0.5; // 0..1
      let alpha=0.06+wave*0.12;
      // Mouse proximity boost
      if (hasMouse) {
        const mdx=cx-mx, mdy=cy-my, md=Math.sqrt(mdx*mdx+mdy*mdy);
        if (md<150) alpha+=(1-md/150)*0.18;
      }
      // Draw hexagon (6 vertices, flat-top orientation)
      ctx.beginPath();
      for (let i=0; i<6; i++) {
        const angle=Math.PI/3*i-Math.PI/6;
        const px=cx+hexR*0.9*Math.cos(angle);
        const py=cy+hexR*0.9*Math.sin(angle);
        i===0 ? ctx.moveTo(px,py) : ctx.lineTo(px,py);
      }
      ctx.closePath();
      ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth=1; ctx.stroke();
      if (wave>0.5) {
        ctx.fillStyle=`rgba(${r},${g},${b},${(wave-0.5)*0.12})`;
        ctx.fill();
      }
    }
  }
}
```

---

### Component 6 — PelloFlow Background: Circuit Path Pulses

**What it does:** Random horizontal and vertical lines (like a circuit board) with glowing dots that travel along them. Intersection points between H and V paths pulse. Mouse brightens nearby lines.

```typescript
interface FlowPath {
  x1: number; y1: number; x2: number; y2: number;
  dir: 'h'|'v';
  pulses: { pos: number; speed: number; }[];
}

function initFlowBg(w: number, h: number) {
  const paths: FlowPath[]=[];
  // Horizontal paths at random Y intervals
  for (let y=40; y<h; y+=40+Math.random()*30) {
    const x1=Math.random()*w*0.3, x2=w*0.5+Math.random()*w*0.5;
    const numP=1+Math.floor(Math.random()*2);
    const pulses=[];
    for (let p=0; p<numP; p++) pulses.push({ pos:Math.random(), speed:0.002+Math.random()*0.004 });
    paths.push({ x1, y1:y, x2, y2:y, dir:'h', pulses });
  }
  // Vertical paths at random X intervals
  for (let x=40; x<w; x+=40+Math.random()*40) {
    const y1=Math.random()*h*0.3, y2=h*0.4+Math.random()*h*0.6;
    const numP=1+Math.floor(Math.random()*2);
    const pulses=[];
    for (let p=0; p<numP; p++) pulses.push({ pos:Math.random(), speed:0.002+Math.random()*0.004 });
    paths.push({ x1:x, y1, x2:x, y2, dir:'v', pulses });
  }
  return { flowPaths:paths };
}

function drawFlowBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
    mx: number, my: number, hasMouse: boolean, state: Record<string, unknown>) {
  const [r,g,b]=PV_RGB[6];
  const st=state as { flowPaths:FlowPath[] };

  for (const path of st.flowPaths) {
    // Base line — brighter when mouse is near
    let lineAlpha=0.04;
    if (hasMouse) {
      if (path.dir==='h' && Math.abs(my-path.y1)<30) lineAlpha=0.08;
      if (path.dir==='v' && Math.abs(mx-path.x1)<30) lineAlpha=0.08;
    }
    ctx.strokeStyle=`rgba(${r},${g},${b},${lineAlpha})`;
    ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(path.x1,path.y1); ctx.lineTo(path.x2,path.y2); ctx.stroke();

    // Travelling pulses
    for (const pulse of path.pulses) {
      pulse.pos+=pulse.speed;
      if (pulse.pos>1) pulse.pos-=1;
      const px=path.x1+(path.x2-path.x1)*pulse.pos;
      const py=path.y1+(path.y2-path.y1)*pulse.pos;
      // Gradient trail
      const trailLen=0.12;
      const ts=Math.max(0,pulse.pos-trailLen);
      const tsx=path.x1+(path.x2-path.x1)*ts;
      const tsy=path.y1+(path.y2-path.y1)*ts;
      const grad=ctx.createLinearGradient(tsx,tsy,px,py);
      grad.addColorStop(0,`rgba(${r},${g},${b},0)`);
      grad.addColorStop(1,`rgba(${r},${g},${b},0.25)`);
      ctx.strokeStyle=grad; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(tsx,tsy); ctx.lineTo(px,py); ctx.stroke();
      // Head dot
      ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},0.4)`; ctx.fill();
    }
  }

  // Intersection glow nodes
  for (const hp of st.flowPaths) {
    if (hp.dir!=='h') continue;
    for (const vp of st.flowPaths) {
      if (vp.dir!=='v') continue;
      if (vp.x1>=hp.x1&&vp.x1<=hp.x2&&hp.y1>=vp.y1&&hp.y1<=vp.y2) {
        const pulse=0.5+0.5*Math.sin(t*2+vp.x1*0.01+hp.y1*0.01);
        ctx.beginPath(); ctx.arc(vp.x1,hp.y1,3+pulse*2,0,Math.PI*2);
        ctx.fillStyle=`rgba(${r},${g},${b},${0.04+pulse*0.06})`; ctx.fill();
      }
    }
  }
}
```

---

### Component 7 — PelloBuild Background: Matrix Code Rain

**What it does:** Matrix-style falling characters (katakana + code keywords) in thin columns. Head character is white/bright, trail fades out. Mouse proximity brightens nearby characters.

```typescript
function initMatrix(w: number, h: number) {
  const colW=7;
  const cols=Math.ceil(w/colW);
  const drops: number[]=[], speeds: number[]=[];
  const chars='アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン' +
    '01{}()[];:<>=+-*/&|!?#$%@^~`const function return async await import export class ' +
    'interface type let var if else for while switch case break new this true false null undefined';
  for (let i=0; i<cols; i++) {
    drops.push(Math.random()*-50); // start above screen at random heights
    speeds.push(0.5+Math.random()*1.2);
  }
  return { drops, speeds, chars, colW, cols };
}

function drawMatrix(ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
    mx: number, my: number, hasMouse: boolean, state: Record<string, unknown>) {
  const [r,g,b]=PV_RGB[7]; // #22c55e green
  const st=state as { drops:number[]; speeds:number[]; chars:string; colW:number; cols:number };
  const fontSize=9;
  ctx.font=`${fontSize}px "SF Mono", "Fira Code", monospace`;

  for (let i=0; i<st.cols; i++) {
    const x=i*st.colW;
    st.drops[i]+=st.speeds[i];

    const trailLen=25;
    for (let j=0; j<trailLen; j++) {
      const y=(st.drops[i]-j)*fontSize;
      if (y<0||y>h) continue;

      // Pseudo-random char (deterministic from t so it "flickers" over time)
      const ci=Math.floor((t*3+i*7+j*13)%st.chars.length);
      const ch=st.chars[ci];

      let alpha: number;
      if (j===0) {
        // Head: white and bright
        ctx.fillStyle=`rgba(255,255,255,0.85)`;
        alpha=0.9;
      } else {
        // Trail: fade out from head
        alpha=Math.max(0.03, (1-j/trailLen)*0.4);
        ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;
      }

      // Mouse proximity brightens
      if (hasMouse) {
        const dx=Math.abs(mx-x), dy=Math.abs(my-y);
        const dist=Math.sqrt(dx*dx+dy*dy);
        if (dist<80) {
          const boost=(1-dist/80)*0.3;
          ctx.fillStyle=`rgba(${r},${g},${b},${Math.min(0.85,alpha+boost)})`;
        }
      }
      ctx.fillText(ch, x, y);
    }

    // Reset column when trail exits screen
    if (st.drops[i]*fontSize>h+trailLen*fontSize) {
      st.drops[i]=Math.random()*-10;
      st.speeds[i]=0.5+Math.random()*1.2;
    }
  }
}
```

---

### Component 5 — PelloSocial Pulse Grid Background

**What it does:** A secondary `.soc-pulse-bg` canvas behind the full PelloSocial card. Dot grid with radial sine wave pulse from centre. Runs as its own self-contained IIFE.

```typescript
// Self-contained IIFE — not part of the product card orchestrator
(function() {
  const canvas=document.querySelector('.soc-pulse-bg') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx=canvas.getContext('2d')!;
  const dpr=window.devicePixelRatio||1;
  let W=0, H=0, t=0;

  function resize() {
    const par=canvas.parentElement!;
    W=par.clientWidth; H=par.clientHeight;
    canvas.width=W*dpr; canvas.height=H*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();
  window.addEventListener('resize', resize);

  let mouseX=-1, mouseY=-1;
  canvas.parentElement!.addEventListener('mousemove', e => {
    const r=canvas.getBoundingClientRect();
    mouseX=e.clientX-r.left; mouseY=e.clientY-r.top;
  });
  canvas.parentElement!.addEventListener('mouseleave', ()=>{ mouseX=-1; mouseY=-1; });

  const R=192, G=38, B=211; // #c026d3 magenta
  const dotSpacing=28;
  const dotR=1.5;

  function draw() {
    ctx.clearRect(0,0,W,H);
    t+=0.02;
    for (let x=dotSpacing/2; x<W; x+=dotSpacing) {
      for (let y=dotSpacing/2; y<H; y+=dotSpacing) {
        const dx=x-W/2, dy=y-H/2, d=Math.sqrt(dx*dx+dy*dy);
        const wave=Math.sin(d*0.015-t*2)*0.5+0.5; // 0..1
        let alpha=0.03+wave*0.08;
        let size=dotR+wave*1.5;
        if (mouseX>0) {
          const md=Math.sqrt((x-mouseX)**2+(y-mouseY)**2);
          if (md<100) { alpha+=(1-md/100)*0.12; size+=(1-md/100)*2; }
        }
        ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2);
        ctx.fillStyle=`rgba(${R},${G},${B},${alpha})`; ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
```

---

### Component Orchestrator — Single rAF Loop

**How all background `.product-bg` canvases are driven by one loop:**

```typescript
// Global mouse — one listener, all canvases read from here
let gMx=-9999, gMy=-9999;
window.addEventListener('mousemove', e=>{ gMx=e.clientX; gMy=e.clientY; });
window.addEventListener('mouseleave', ()=>{ gMx=-9999; gMy=-9999; });

interface CardState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  w: number; h: number; dpr: number;
  visible: boolean;
  state: Record<string, unknown>;
}

// State init router
function initProdState(idx: number, w: number, h: number): Record<string, unknown> {
  switch(idx) {
    case 0: return initSEO(w,h);
    case 1: return initReach(w,h);
    case 2: return initRain(w,h);
    case 3: return initSocial(w,h);
    case 5: return initAdsBg(w,h);
    case 6: return initFlowBg(w,h);
    case 7: return initMatrix(w,h);
    default: return {};
  }
}

// Per-frame render router
function renderProd(idx: number, cs: CardState, t: number) {
  const { ctx, w, h, canvas, state }=cs;
  const rect=canvas.getBoundingClientRect();
  const lx=gMx-rect.left, ly=gMy-rect.top; // local coords
  const hasMouse=lx>=0&&lx<=w&&ly>=0&&ly<=h;
  ctx.clearRect(0,0,w,h);
  switch(idx) {
    case 0: drawSEO(ctx,w,h,t,lx,ly,hasMouse,state); break;
    case 1: drawReach(ctx,w,h,t,lx,ly,hasMouse,state); break;
    case 2: drawRain(ctx,w,h,t,lx,ly,hasMouse,state); break;
    case 3: drawSocial(ctx,w,h,t,lx,ly,hasMouse,state); break;
    case 4: drawTopo(ctx,w,h,t,lx,ly,hasMouse,state); break;
    case 5: drawAdsBg(ctx,w,h,t,lx,ly,hasMouse,state); break;
    case 6: drawFlowBg(ctx,w,h,t,lx,ly,hasMouse,state); break;
    case 7: drawMatrix(ctx,w,h,t,lx,ly,hasMouse,state); break;
  }
}

// IntersectionObserver — only render visible cards
const pvVisible=new Set<number>();
const pvIO=new IntersectionObserver((entries)=>{
  for (const entry of entries) {
    // ... map entry.target to index ...
    if (entry.isIntersecting) pvVisible.add(idx);
    else pvVisible.delete(idx);
  }
}, { rootMargin:'200px' });

// Single rAF loop for all product cards
function pvLoop() {
  requestAnimationFrame(pvLoop);
  const t=performance.now()*0.001;
  for (const idx of pvVisible) {
    if (idx<pvCards.length) renderProd(pvCards[idx].productIdx ?? idx, pvCards[idx], t);
  }
}
requestAnimationFrame(pvLoop);
```

---

### Bonus: Unused Variants (available to repurpose)

These functions exist in the codebase but are currently commented out or not wired up. Ready to use:

**Equaliser bars** (was an early PelloAds idea):
```typescript
function drawBars(ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
    mx: number, my: number, hasMouse: boolean, _state: Record<string, unknown>) {
  const [r,g,b]=PV_RGB[5];
  const numBars=40, barW=3, barGap=2, totalW=barW+barGap;
  const startX=(w-numBars*totalW)/2;
  const centerY=h*0.62;
  for (let i=0; i<numBars; i++) {
    const x=startX+i*totalW, bCx=x+barW/2;
    const n=(noise2(i*0.15+t*0.4, t*0.6+i*0.05)+1)*0.5;
    let barH=4+n*30;
    if (hasMouse) {
      const dx=Math.abs(mx-bCx);
      if (dx<60) barH=Math.max(barH, Math.pow(1-dx/60,2)*35);
    }
    ctx.fillStyle=`rgba(${r},${g},${b},${0.25+(barH/34)*0.25})`;
    ctx.fillRect(x, centerY-barH, barW, barH);
  }
}
```

**Curl-field particles** (was an early PelloFlow idea):
```typescript
interface FParticle { x:number; y:number; trail:{x:number;y:number}[]; }

function initParticles(w: number, h: number) {
  const particles: FParticle[]=[];
  for (let i=0; i<60; i++) particles.push({ x:Math.random()*w, y:Math.random()*h, trail:[] });
  return { particles };
}

function drawParticles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number,
    mx: number, my: number, hasMouse: boolean, state: Record<string, unknown>) {
  const { particles }=state as { particles:FParticle[] };
  const [r,g,b]=PV_RGB[6];
  const s=0.018;
  for (const p of particles) {
    // Curl field: velocity = curl of Perlin noise
    const n_py=noise2(p.x*s, (p.y+1)*s+t*0.1);
    const n_ny=noise2(p.x*s, (p.y-1)*s+t*0.1);
    const n_px=noise2((p.x+1)*s, p.y*s+t*0.1);
    const n_nx=noise2((p.x-1)*s, p.y*s+t*0.1);
    let vx=(n_py-n_ny)/2, vy=-(n_px-n_nx)/2;
    const vmag=Math.sqrt(vx*vx+vy*vy)||0.001;
    vx=(vx/vmag)*0.5; vy=(vy/vmag)*0.5;
    // Mouse swirl
    if (hasMouse) {
      const dx=p.x-mx, dy=p.y-my, d=Math.sqrt(dx*dx+dy*dy);
      if (d<150&&d>0) { const str=(1-d/150)*1.5; vx+=(-dy/d)*str; vy+=(dx/d)*str; }
    }
    p.trail.push({x:p.x, y:p.y});
    if (p.trail.length>5) p.trail.shift();
    p.x+=vx; p.y+=vy;
    // Wrap around edges
    if (p.x<0) p.x+=w; if (p.x>w) p.x-=w;
    if (p.y<0) p.y+=h; if (p.y>h) p.y-=h;
    // Draw trail
    for (let ti=1; ti<p.trail.length; ti++) {
      ctx.strokeStyle=`rgba(${r},${g},${b},${(ti/p.trail.length)*0.25})`;
      ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(p.trail[ti-1].x,p.trail[ti-1].y); ctx.lineTo(p.trail[ti].x,p.trail[ti].y); ctx.stroke();
    }
    ctx.fillStyle=`rgba(${r},${g},${b},0.40)`;
    ctx.beginPath(); ctx.arc(p.x,p.y,1,0,Math.PI*2); ctx.fill();
  }
}
```

**Blueprint grid with animated drawing lines** (currently used as additional background texture in some variants):
```typescript
interface BuildAnim { x:number; y:number; dir:'h'|'v'; len:number; startTime:number; }

function initBlueprint() { return { builds:[] as BuildAnim[], lastBuildTime:0 }; }

function drawBlueprint(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number,
    mx: number, my: number, hasMouse: boolean, state: Record<string, unknown>) {
  const [r,g,b]=PV_RGB[7];
  const st=state as { builds:BuildAnim[]; lastBuildTime:number };
  const BG=20, now=performance.now();

  // Spawn new animated line segment occasionally
  if (now-st.lastBuildTime>800+Math.random()*1500 && st.builds.length<3) {
    const col=Math.floor(Math.random()*Math.floor(w/BG));
    const row=Math.floor(Math.random()*Math.floor(h/BG));
    const dir: 'h'|'v'=Math.random()>0.5?'h':'v';
    const maxLen=dir==='h'?(Math.floor(w/BG)-col)*BG:(Math.floor(h/BG)-row)*BG;
    const len=Math.min(BG*(2+Math.floor(Math.random()*4)), maxLen||BG);
    st.builds.push({ x:col*BG, y:row*BG, dir, len, startTime:now });
    st.lastBuildTime=now;
  }
  st.builds=st.builds.filter(b=>(now-b.startTime)<1500);

  // Static grid lines (mouse-row/column brightens)
  for (let y=0; y<=h; y+=BG) {
    ctx.strokeStyle=`rgba(${r},${g},${b},${hasMouse&&Math.abs(my-y)<BG?0.22:0.12})`;
    ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
  }
  for (let x=0; x<=w; x+=BG) {
    ctx.strokeStyle=`rgba(${r},${g},${b},${hasMouse&&Math.abs(mx-x)<BG?0.22:0.12})`;
    ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
  }

  // Animated highlight segments (draw then fade)
  for (const bld of st.builds) {
    const elapsed=(now-bld.startTime)/1000;
    const alpha=elapsed<0.5 ? 0.40 : 0.40*(1-(elapsed-0.5)/1.0);
    if (alpha<0.005) continue;
    const progress=Math.min(1,elapsed/0.5); // draws in 500ms
    ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`; ctx.lineWidth=2;
    ctx.beginPath();
    if (bld.dir==='h') { ctx.moveTo(bld.x,bld.y); ctx.lineTo(bld.x+bld.len*progress,bld.y); }
    else               { ctx.moveTo(bld.x,bld.y); ctx.lineTo(bld.x,bld.y+bld.len*progress); }
    ctx.stroke();
  }
}
```

---

> **Finding the large IIFEs:** The PelloAds Dashboard, PelloBuild Dashboard, PelloFlow Timeline, and PelloPublish Flow Network are each self-contained IIFEs of 200–800 lines. They start at the following lines in `src/pages/index.astro`:
>
> | Component | Starts at line |
> |---|---|
> | PelloSocial pulse-bg IIFE | ~2843 |
> | PelloAds Dashboard IIFE | ~2902 |
> | PelloBuild Dashboard IIFE | ~3323 |
> | PelloFlow Timeline IIFE | ~3750 |
> | PelloPublish Flow Network IIFE | ~4600 |
>
> Each IIFE is fully self-contained — it creates its own canvas reference, resize observer, mouse listeners, and rAF loop. They do not participate in the shared `pvLoop` orchestrator.
