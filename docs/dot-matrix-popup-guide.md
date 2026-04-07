# Dot Matrix with Canvas Popup — Complete Build Guide

How to build an interactive dot grid with hover popups using nothing but a `<canvas>` element and vanilla JS. No frameworks, no libraries, no dependencies.

---

## What it is

A `<canvas>` element sitting behind your content. Every 16ms (60fps) the entire canvas is cleared and redrawn. Each "dot" is a filled circle drawn with `ctx.arc`. The popup is also just canvas shapes drawn on top. There is no HTML, no DOM elements, and no library involved in the animation.

---

## Step 1 — HTML Setup

```html
<div class="hero" style="position: relative; overflow: hidden;">
  <!-- The canvas sits BEHIND everything -->
  <canvas id="dot-canvas" aria-hidden="true" style="
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
  "></canvas>

  <!-- Your actual content sits ON TOP -->
  <div style="position: relative; z-index: 1;">
    <h1>Your headline</h1>
    <p>Your content</p>
  </div>
</div>
```

**Three rules:**
- `pointer-events: none` on the canvas — mouse events pass through to your real content underneath
- `position: absolute; inset: 0` — canvas fills its parent completely
- Parent must be `position: relative` so the absolute positioning anchors to it

---

## Step 2 — Canvas Sizing (the part everyone gets wrong)

You must multiply by `devicePixelRatio` or everything looks blurry on retina/HiDPI screens.

```js
const canvas = document.getElementById('dot-canvas');
const ctx = canvas.getContext('2d');
let dpr = 1;

function resize() {
  dpr = window.devicePixelRatio || 1;
  const parent = canvas.parentElement;
  const W = parent.clientWidth;
  const H = parent.clientHeight;

  // Physical pixels (what the GPU actually draws)
  canvas.width  = W * dpr;
  canvas.height = H * dpr;

  // CSS size (what the browser displays)
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  // Scale all draw operations automatically
  // so you always work in CSS pixels — never think about DPR again
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Rebuild dot grid when dimensions change
  buildDots(W, H);
}

// Use ResizeObserver, not window.resize
// ResizeObserver fires when the element itself changes size
const ro = new ResizeObserver(() => resize());
ro.observe(canvas.parentElement);
resize();
```

After `setTransform(dpr, 0, 0, dpr, 0, 0)` all your coordinates are in CSS pixels. You never need to multiply by DPR anywhere else.

---

## Step 3 — The Dot Data

Each dot is a plain object. The key idea: **grid position (`gx`, `gy`) is fixed forever. Display position (`x`, `y`) lerps toward a target** — which is normally the grid position, but gets pushed away when the mouse is nearby.

```js
const GRID_SPACING = 18; // px between dots — lower = denser
let dots = [];

function buildDots(W, H) {
  dots = [];
  const cols = Math.ceil(W / GRID_SPACING) + 1;
  const rows = Math.ceil(H / GRID_SPACING) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gx = c * GRID_SPACING;
      const gy = r * GRID_SPACING;

      dots.push({
        gx, gy,   // home position — never changes
        x:  gx,   // current display position — lerps toward target
        y:  gy,

        // Your custom data — whatever makes sense for your use case
        category: randomCategory(),
        label:    randomLabel(),
        color:    randomColor(),
        status:   randomStatus(),
      });
    }
  }
}
```

---

## Step 4 — Mouse Tracking

The canvas has `pointer-events: none` so you listen on the **parent element** instead. Convert client coordinates to canvas-local coordinates by subtracting the canvas bounding rect.

```js
let mouseX = -9999, mouseY = -9999;

// Listen on PARENT — canvas ignores pointer events
canvas.parentElement.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.parentElement.addEventListener('mouseleave', () => {
  mouseX = -9999;
  mouseY = -9999;
});
```

---

## Step 5 — The Render Loop

```js
let hoveredDot = null;

function frame() {
  requestAnimationFrame(frame);

  // Always work in CSS pixels (canvas.width / dpr)
  const W = canvas.width / dpr;
  const H = canvas.height / dpr;
  const t = performance.now() * 0.001; // time in seconds

  ctx.clearRect(0, 0, W, H);

  // ── A: Find hovered dot ────────────────────────────────────────────
  hoveredDot = null;
  let bestDist = 20; // px — hover detection radius
  for (const dot of dots) {
    const dx   = dot.x - mouseX;
    const dy   = dot.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < bestDist) {
      bestDist   = dist;
      hoveredDot = dot;
    }
  }

  // ── B: Update + draw every dot ─────────────────────────────────────
  for (const dot of dots) {
    // Where does this dot want to be this frame?
    let targetX = dot.gx;
    let targetY = dot.gy;

    // Mouse repulsion — push dots away with smooth easing
    const INFLUENCE_RADIUS = 120; // px — how far the mouse reaches
    const PUSH_STRENGTH    = 30;  // px — maximum push distance
    const dx   = dot.gx - mouseX;
    const dy   = dot.gy - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < INFLUENCE_RADIUS && dist > 0) {
      // Double-smoothstep: S-curve easing that's very soft at the edges
      // and strong near the centre — feels natural
      const raw       = 1 - dist / INFLUENCE_RADIUS;
      const smooth    = raw * raw * (3 - 2 * raw);            // smoothstep
      const influence = smooth * smooth * (3 - 2 * smooth);   // double-smoothstep
      const push      = Math.pow(influence, 3) * PUSH_STRENGTH;

      targetX += (dx / dist) * push; // push away from mouse
      targetY += (dy / dist) * push;
    }

    // Lerp current position toward target — creates smooth lag
    const LERP = 0.06; // 0.01 = very slow/floaty, 0.1 = snappy
    dot.x += (targetX - dot.x) * LERP;
    dot.y += (targetY - dot.y) * LERP;

    // Draw the dot
    const isHovered = dot === hoveredDot;
    const alpha     = isHovered ? 0.95 : 0.30;
    const radius    = isHovered ? 5    : 2;

    ctx.globalAlpha = alpha;
    ctx.fillStyle   = dot.color;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;

  // ── C: Draw popup LAST so it renders on top of all dots ────────────
  if (hoveredDot) {
    drawPopup(hoveredDot, W, H);
  }
}

requestAnimationFrame(frame);
```

---

## Step 6 — Drawing the Popup

The popup is entirely canvas draw calls — no DOM, no HTML. The glassmorphism look comes from layering a dark fill, a tinted colour overlay, a border, a shadow, and a top accent bar.

```js
function drawPopup(dot, W, H) {
  const POPUP_W = 240;
  const POPUP_H = 90;
  const PAD     = 14;

  // ── Position it ─────────────────────────────────────────────────────
  // Default: centred above the dot
  let x = dot.x - POPUP_W / 2;
  let y = dot.y - POPUP_H - 18;

  // Clamp — never let it clip outside the canvas
  x = Math.max(6, Math.min(W - POPUP_W - 6, x));
  if (y < 6) y = dot.y + 14; // flip below if too close to top edge

  ctx.save();

  // ── Connector line from dot to popup ─────────────────────────────────
  ctx.globalAlpha  = 0.2;
  ctx.strokeStyle  = dot.color;
  ctx.lineWidth    = 1;
  ctx.beginPath();
  ctx.moveTo(dot.x, dot.y - 5);
  ctx.lineTo(dot.x, y < dot.y ? y + POPUP_H : y); // connect to nearest edge
  ctx.stroke();

  // ── Glow / shadow ─────────────────────────────────────────────────────
  ctx.globalAlpha = 1;
  ctx.shadowColor = dot.color + '40'; // colour at ~25% opacity
  ctx.shadowBlur  = 20;

  // ── Dark glass background ─────────────────────────────────────────────
  roundedRect(ctx, x, y, POPUP_W, POPUP_H, 8);
  ctx.fillStyle = 'rgba(8, 8, 20, 0.80)';
  ctx.fill();

  ctx.shadowBlur = 0; // disable shadow for everything after

  // ── Tinted colour overlay — gives the "tinted glass" feel ────────────
  roundedRect(ctx, x, y, POPUP_W, POPUP_H, 8);
  ctx.fillStyle = dot.color + '15'; // colour at ~8% opacity
  ctx.fill();

  // ── Border ────────────────────────────────────────────────────────────
  ctx.strokeStyle = dot.color + '40'; // colour at ~25% opacity
  ctx.lineWidth   = 1;
  ctx.stroke();

  // ── Top accent bar ────────────────────────────────────────────────────
  ctx.globalAlpha = 0.7;
  roundedRect(ctx, x, y, POPUP_W, 3, 3);
  ctx.fillStyle = dot.color;
  ctx.fill();
  ctx.globalAlpha = 1;

  // ── Text ─────────────────────────────────────────────────────────────
  ctx.textAlign    = 'left';
  ctx.textBaseline = 'top';

  // Small category label at top
  ctx.font      = 'bold 9px "SF Mono", monospace';
  ctx.fillStyle = dot.color;
  ctx.fillText(dot.category.toUpperCase(), x + PAD, y + PAD);

  // Main title
  ctx.font      = '500 14px -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(dot.label, x + PAD, y + PAD + 16);

  // Status / meta at bottom
  ctx.font      = '10px "SF Mono", monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText(dot.status, x + PAD, y + PAD + 36);

  ctx.restore();
}
```

### The rounded rect helper

Canvas didn't have `roundRect` natively until 2023. This helper works in all browsers:

```js
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x,     y,     x + r, y);
  ctx.closePath();
}
```

> If you only need modern browser support (Chrome 99+, Firefox 112+, Safari 15.4+), you can use the native `ctx.roundRect(x, y, w, h, r)` directly.

---

## Step 7 — Auto-Demo (when no mouse is present)

Without this, the component looks completely dead to anyone who isn't hovering. Add an auto-cycling hover that picks a random dot every few seconds:

```js
let autoHoverDot   = null;
let autoHoverTimer = 0;

// Replace the hover detection section in frame() with this:
const hasMouse = mouseX > -9000;

if (hasMouse) {
  // Normal hover detection
  hoveredDot = null;
  let bestDist = 20;
  for (const dot of dots) {
    const dx = dot.x - mouseX, dy = dot.y - mouseY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < bestDist) { bestDist = dist; hoveredDot = dot; }
  }
} else {
  // Auto-demo: cycle to a random dot every 3 seconds
  const now = performance.now() * 0.001;
  if (now - autoHoverTimer > 3) {
    autoHoverTimer = now;
    // Pick from dots in the middle area of the canvas (not edges)
    const candidates = dots.filter(d =>
      d.gx > W * 0.2 && d.gx < W * 0.8 &&
      d.gy > H * 0.2 && d.gy < H * 0.8
    );
    autoHoverDot = candidates[Math.floor(Math.random() * candidates.length)];
  }
  hoveredDot = autoHoverDot;
}
```

---

## Complete Working Example

Drop this into any HTML file. Change the data arrays to match your use case.

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; background: #06070f; }
    .hero {
      position: relative;
      height: 500px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    canvas {
      position: absolute;
      inset: 0;
      z-index: 0;
      pointer-events: none;
    }
    .content {
      position: relative;
      z-index: 1;
      text-align: center;
      color: white;
      font-family: -apple-system, sans-serif;
    }
  </style>
</head>
<body>
<div class="hero">
  <canvas id="dot-canvas" aria-hidden="true"></canvas>
  <div class="content">
    <h1>Your headline</h1>
    <p>Hover the dots</p>
  </div>
</div>

<script>
// ── Data ─────────────────────────────────────────────────────────────
const CATEGORIES = ['Feature A', 'Feature B', 'Feature C', 'Feature D'];
const LABELS     = ['Example label one', 'Example label two', 'Example label three', 'Example label four', 'Example label five'];
const COLORS     = ['#6366f1','#8b5cf6','#a855f7','#ec4899','#22c55e','#3b82f6'];
const STATUSES   = ['● active', '● published', '○ draft', '● live'];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Setup ────────────────────────────────────────────────────────────
const canvas = document.getElementById('dot-canvas');
const ctx    = canvas.getContext('2d');
let dpr  = 1;
let dots = [];
let mouseX = -9999, mouseY = -9999;
let hoveredDot = null, autoHoverDot = null, autoHoverTimer = 0;

const GRID_SPACING  = 18;
const INFLUENCE_R   = 120;
const PUSH_STRENGTH = 30;
const LERP          = 0.06;

// ── Rounded rect helper ──────────────────────────────────────────────
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}

// ── Build dot grid ───────────────────────────────────────────────────
function buildDots(W, H) {
  dots = [];
  const cols = Math.ceil(W / GRID_SPACING) + 1;
  const rows = Math.ceil(H / GRID_SPACING) + 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const gx = c * GRID_SPACING, gy = r * GRID_SPACING;
      dots.push({ gx, gy, x: gx, y: gy,
        category: pick(CATEGORIES),
        label:    pick(LABELS),
        color:    pick(COLORS),
        status:   pick(STATUSES),
      });
    }
  }
}

// ── Resize ───────────────────────────────────────────────────────────
function resize() {
  dpr = window.devicePixelRatio || 1;
  const W = canvas.parentElement.clientWidth;
  const H = canvas.parentElement.clientHeight;
  canvas.width  = W * dpr; canvas.height = H * dpr;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildDots(W, H);
}
new ResizeObserver(resize).observe(canvas.parentElement);
resize();

// ── Mouse ────────────────────────────────────────────────────────────
canvas.parentElement.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});
canvas.parentElement.addEventListener('mouseleave', () => {
  mouseX = -9999; mouseY = -9999;
});

// ── Popup ────────────────────────────────────────────────────────────
function drawPopup(dot, W, H) {
  const PW = 240, PH = 90, PAD = 14;
  let x = dot.x - PW / 2;
  let y = dot.y - PH - 18;
  x = Math.max(6, Math.min(W - PW - 6, x));
  if (y < 6) y = dot.y + 14;

  ctx.save();

  // Connector line
  ctx.globalAlpha = 0.2; ctx.strokeStyle = dot.color; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(dot.x, dot.y - 5);
  ctx.lineTo(dot.x, y < dot.y ? y + PH : y); ctx.stroke();

  // Glass background + glow
  ctx.globalAlpha = 1;
  ctx.shadowColor = dot.color + '40'; ctx.shadowBlur = 20;
  rr(ctx, x, y, PW, PH, 8); ctx.fillStyle = 'rgba(8,8,20,0.80)'; ctx.fill();
  ctx.shadowBlur = 0;

  // Colour tint
  rr(ctx, x, y, PW, PH, 8); ctx.fillStyle = dot.color + '15'; ctx.fill();

  // Border
  ctx.strokeStyle = dot.color + '40'; ctx.lineWidth = 1; ctx.stroke();

  // Top accent bar
  ctx.globalAlpha = 0.7; rr(ctx, x, y, PW, 3, 3);
  ctx.fillStyle = dot.color; ctx.fill(); ctx.globalAlpha = 1;

  // Text
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.font = 'bold 9px "SF Mono",monospace'; ctx.fillStyle = dot.color;
  ctx.fillText(dot.category.toUpperCase(), x + PAD, y + PAD);
  ctx.font = '500 14px -apple-system,sans-serif'; ctx.fillStyle = '#fff';
  ctx.fillText(dot.label, x + PAD, y + PAD + 16);
  ctx.font = '10px "SF Mono",monospace'; ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.fillText(dot.status, x + PAD, y + PAD + 36);

  ctx.restore();
}

// ── Render loop ──────────────────────────────────────────────────────
function frame() {
  requestAnimationFrame(frame);
  const W = canvas.width / dpr, H = canvas.height / dpr;

  ctx.clearRect(0, 0, W, H);

  // Hover detection
  const hasMouse = mouseX > -9000;
  if (hasMouse) {
    hoveredDot = null;
    let best = 20;
    for (const dot of dots) {
      const dx = dot.x - mouseX, dy = dot.y - mouseY;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < best) { best = d; hoveredDot = dot; }
    }
  } else {
    // Auto-demo
    const now = performance.now() * 0.001;
    if (now - autoHoverTimer > 3) {
      autoHoverTimer = now;
      const cands = dots.filter(d => d.gx > W*0.2 && d.gx < W*0.8 && d.gy > H*0.2 && d.gy < H*0.8);
      autoHoverDot = cands[Math.floor(Math.random() * cands.length)];
    }
    hoveredDot = autoHoverDot;
  }

  // Update + draw dots
  for (const dot of dots) {
    let tx = dot.gx, ty = dot.gy;
    const dx = dot.gx - mouseX, dy = dot.gy - mouseY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < INFLUENCE_R && dist > 0) {
      const raw = 1 - dist/INFLUENCE_R;
      const s   = raw*raw*(3-2*raw);
      const inf = s*s*(3-2*s);
      const push = Math.pow(inf, 3) * PUSH_STRENGTH;
      tx += (dx/dist)*push; ty += (dy/dist)*push;
    }
    dot.x += (tx - dot.x) * LERP;
    dot.y += (ty - dot.y) * LERP;

    const isHov  = dot === hoveredDot;
    ctx.globalAlpha = isHov ? 0.95 : 0.30;
    ctx.fillStyle   = dot.color;
    ctx.beginPath(); ctx.arc(dot.x, dot.y, isHov ? 5 : 2, 0, Math.PI*2); ctx.fill();
  }

  ctx.globalAlpha = 1;
  if (hoveredDot) drawPopup(hoveredDot, W, H);
}

requestAnimationFrame(frame);
</script>
</body>
</html>
```

---

## Customisation Reference

| Property | Where to change | Notes |
|---|---|---|
| Dot colour | `dot.color` in `buildDots` | Per category, per status, random, anything |
| Dot size | `radius` in `ctx.arc` | Can vary with any data property |
| Grid density | `GRID_SPACING` | 10 = very dense, 30 = sparse |
| Push distance | `PUSH_STRENGTH` | Higher = more dramatic repulsion |
| Influence zone | `INFLUENCE_R` | How far the mouse reaches (px) |
| Animation lag | `LERP` | 0.01 = floaty, 0.12 = snappy |
| Popup size | `PW` / `PH` in `drawPopup` | Clamping handles edge cases automatically |
| Auto-demo speed | `> 3` in the timer check | Seconds between auto-hover cycles |
| Bottom fade | Multiply `globalAlpha` by `(1 - dot.gy / H)` | Fades dots toward the bottom |
| Staggered reveal | Add `birthTime` per dot, skip if `elapsed < birthTime` | Dots appear outward from centre |
| Pulse ripple | Add periodic `pulseAlpha` from `Math.sin` based on distance from centre | Creates wave effect |

---

## Why no framework

Because canvas redraws everything every frame anyway. There's no "show popup" event — you just conditionally include the draw calls. This means:

- **Zero overhead** — no DOM diffing, no style recalculation, no layout reflow
- **Pixel-perfect control** — popup is in the same coordinate space as the dots
- **Trivial positioning** — clamp math keeps it inside bounds, done
- **No z-index issues** — last thing drawn is always on top
- **No dependencies** — ships as a single `<script>` block, works anywhere
