// The scene around the pet: wheel, bowl, bed, beans and the marks that float
// above the hamster. The hamster itself is in hamster.ts. The wheel is a clear
// acrylic ring on a clear stand, after a reference photo: the desktop
// shows through it, and thin cool edges and white glints give it its shape.
// The bowl is plain white ceramic and the bed soft oatmeal fleece.

import { hamsterDefs, hamsterMarkup } from "./hamster";

export const SCENE_WIDTH = 300;
export const SCENE_HEIGHT = 214;
export const WHEEL = { cx: 96, cy: 117, rim: 74, tread: 68 } as const;
export const DISH = { x: 180, y: 205 } as const;
export const NEST = { x: 250, y: 205 } as const;
export const HAMSTER_SCALE = 0.62;

export interface Spot {
  x: number;
  y: number;
  face: 1 | -1;
}

/** Where the hamster's feet touch down, and which way it faces there. */
export const SPOTS = {
  wheel: { x: 96, y: 184, face: 1 },
  dish: { x: 217, y: 204, face: -1 },
  nest: { x: 247, y: 201, face: -1 },
} as const satisfies Record<string, Spot>;

/** Bean positions in the dish, bottom row first, relative to DISH. */
export const PILE_SLOTS: ReadonlyArray<readonly [number, number]> = [
  [0, -10], [-7, -10], [7, -10], [-14, -10], [14, -10],
  [-3.5, -15.5], [3.5, -15.5], [-10.5, -15.5], [10.5, -15.5],
  [-3.5, -21], [3.5, -21],
  [0, -26.5],
];

const LILAC = "#8a79e8";
const EDGE = "#7f95a6";
const FLEECE_LINE = "#c4b19c";

/** Treads across the inside of the ring. 18 keeps them readable while it spins. */
export const WHEEL_TREADS = 18;

const zLetter = (i: number) =>
  `<text id="z${i}" class="mark-text" font-size="${12 + i * 3}" x="0" y="0">Z</text>`;

type XY = [number, number];
const xy = ([x, y]: XY) => `${x.toFixed(2)} ${y.toFixed(2)}`;

/** The point at radius `r` and `deg` degrees clockwise from the top of the wheel. */
function polar(deg: number, r: number): XY {
  const a = (deg * Math.PI) / 180;
  return [WHEEL.cx + r * Math.sin(a), WHEEL.cy - r * Math.cos(a)];
}

const arc = (from: number, to: number, r: number) => `M${xy(polar(from, r))}A${r} ${r} 0 0 1 ${xy(polar(to, r))}`;

// Radii of the ring: the front edge, the inside of the band and the back edge.
const RING = { outer: 74, front: 71.4, back: 61.6, rim: 59.8 } as const;

/** One tread: a clear rib across the band, wider at the front edge, which is nearer. */
function tread(deg: number): string {
  const [r0, r1] = [RING.back + 0.8, RING.front - 0.6];
  const side = (r: number, half: number) => [polar(deg - (half / r) * (180 / Math.PI), r), polar(deg + (half / r) * (180 / Math.PI), r)];
  const [a0, b0] = side(r0, 1.2);
  const [a1, b1] = side(r1, 1.85);
  return `M${xy(a0)}L${xy(a1)}L${xy(b1)}L${xy(b0)}Z`;
}

/** A thin line along one side of a tread: its lit edge or its shaded edge. */
function treadEdge(deg: number, shift: number): string {
  const [r0, r1] = [RING.back + 1.2, RING.front - 1];
  const at = (r: number, half: number) => polar(deg + ((shift * half) / r) * (180 / Math.PI), r);
  return `M${xy(at(r0, 1.2))}L${xy(at(r1, 1.85))}`;
}

const ALL = (fn: (deg: number) => string, offset = 0) =>
  Array.from({ length: WHEEL_TREADS }, (_, i) => fn(offset + (i * 360) / WHEEL_TREADS)).join("");

function treads(offset: number): string {
  return ALL(tread, offset);
}

/** The back of the wheel, drawn behind the hamster: stand, back edge, band and treads. */
function wheelMarkup(): string {
  const { cx, cy } = WHEEL;
  const step = 360 / WHEEL_TREADS;
  const post = (x: number) => `
    <rect x="${x - 3}" y="175" width="6" height="24" rx="1.4" fill="url(#acrylic)" stroke="${EDGE}" stroke-opacity=".55" stroke-width=".8"/>
    <path d="M${x - 1.5} 177v20" stroke="#fff" stroke-opacity=".9" stroke-width=".9" stroke-linecap="round"/>
    <path d="M${x + 1.6} 177.5v19" stroke="${EDGE}" stroke-opacity=".25" stroke-width=".6" stroke-linecap="round"/>`;
  return `
  <g id="wheel">
    ${post(cx - 37)}${post(cx + 37)}
    <path d="M${cx - 50} 199.2c0-1.8 1.4-3 3.2-3h93.6c1.8 0 3.2 1.2 3.2 3v3.6c0 1.8-1.4 3-3.2 3h-93.6c-1.8 0-3.2-1.2-3.2-3Z" fill="url(#acrylic)" stroke="${EDGE}" stroke-opacity=".6" stroke-width=".85"/>
    <path d="M${cx - 46} 197.9h92" stroke="#fff" stroke-opacity=".9" stroke-width="1.1" stroke-linecap="round"/>
    <path d="M${cx - 47.5} 203.6h95" stroke="${EDGE}" stroke-opacity=".28" stroke-width=".8" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="${(RING.front + RING.back) / 2}" stroke="url(#acrylic-band)" stroke-width="${RING.front - RING.back}"/>
    <circle cx="${cx}" cy="${cy}" r="${RING.back}" stroke="${EDGE}" stroke-opacity=".42" stroke-width=".9"/>
    <circle cx="${cx}" cy="${cy}" r="${RING.rim}" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/>
    <circle cx="${cx}" cy="${cy}" r="${RING.rim - 1}" stroke="${EDGE}" stroke-opacity=".3" stroke-width=".6"/>
    <g id="rotor">
      <g id="wheel-trails" opacity="0">
        <path d="${treads(-step * 0.22)}" fill="#fff" opacity=".3"/>
        <path d="${treads(-step * 0.42)}" fill="#fff" opacity=".18"/>
      </g>
      <g id="wheel-treads">
        <path d="${treads(0)}" fill="#fff" fill-opacity=".42"/>
        <path d="${ALL((d) => treadEdge(d, -0.55))}" stroke="#fff" stroke-opacity=".95" stroke-width=".7" stroke-linecap="round"/>
        <path d="${ALL((d) => treadEdge(d, 0.85))}" stroke="${EDGE}" stroke-opacity=".56" stroke-width=".55" stroke-linecap="round"/>
      </g>
    </g>
    <circle id="wheel-blur" cx="${cx}" cy="${cy}" r="${(RING.front + RING.back) / 2}" stroke="url(#acrylic-blur)" stroke-width="${RING.front - RING.back - 1.2}" opacity="0"/>
  </g>`;
}

/** The front edge of the ring, drawn over the hamster so it runs inside the wheel. */
function wheelFrontMarkup(): string {
  const { cx, cy } = WHEEL;
  return `
  <g id="wheel-front">
    <circle cx="${cx}" cy="${cy}" r="${(RING.outer + RING.front) / 2}" stroke="#fff" stroke-opacity=".42" stroke-width="${RING.outer - RING.front}"/>
    <circle cx="${cx}" cy="${cy}" r="${RING.outer}" stroke="${EDGE}" stroke-opacity=".62" stroke-width=".9"/>
    <circle cx="${cx}" cy="${cy}" r="${RING.front}" stroke="${EDGE}" stroke-opacity=".4" stroke-width=".7"/>
    <g stroke="#fff" stroke-linecap="round" fill="none">
      <path d="${arc(286, 338, RING.outer - 1.3)}" stroke-width="1.6" opacity=".95"/>
      <path d="${arc(296, 322, RING.front + 1)}" stroke-width=".9" opacity=".8"/>
      <path d="${arc(94, 128, RING.outer - 1.3)}" stroke-width="1.3" opacity=".8"/>
      <path d="${arc(160, 172, RING.outer - 1.3)}" stroke-width="1.1" opacity=".7"/>
      <path d="${arc(300, 330, RING.back + 3)}" stroke-width="2.4" opacity=".28"/>
    </g>
  </g>`;
}

/** The near half of the plush donut bed: drawn with the bed, and again over a sleeping hamster. */
const BED_FRONT = `
    <path d="M205 197a45 13.5 0 0 0 90 0c0-1.1-.2-2.2-.6-3.2L276 194.5a26 6.5 0 0 1-52 0l-18.4-.7c-.4 1-.6 2.1-.6 3.2Z" fill="url(#bed-rim)" stroke="${FLEECE_LINE}" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M214.5 203.6c9 3.2 21.5 4.7 35.5 4.7" stroke="#fff" stroke-opacity=".75" stroke-width="1.6" stroke-linecap="round"/>`;

function bedMarkup(): string {
  return `
  <g id="nest-back">
    <ellipse cx="250" cy="197" rx="45" ry="13.5" fill="url(#bed-rim)" stroke="${FLEECE_LINE}" stroke-width="1.1"/>
    <ellipse cx="250" cy="194.5" rx="26" ry="6.5" fill="url(#bed-cushion)" stroke="${FLEECE_LINE}" stroke-width="1"/>
    <path d="M224 194.5a26 6.5 0 0 1 52 0c-6-2.8-15.5-4-26-4s-20 1.2-26 4Z" fill="#d9c7b1" opacity=".55"/>
    <path d="M216 190.2c8.5-3.6 20.5-5.4 34-5.4s25.5 1.8 34 5.4" stroke="#fff" stroke-opacity=".85" stroke-width="2" stroke-linecap="round"/>
    ${BED_FRONT}
  </g>`;
}

export function sceneMarkup(): string {
  return `<svg class="scene" viewBox="0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <defs>${hamsterDefs()}
    <radialGradient id="soft-shadow">
      <stop offset="0" stop-color="#2b2140" stop-opacity=".24"/>
      <stop offset=".65" stop-color="#2b2140" stop-opacity=".09"/>
      <stop offset="1" stop-color="#2b2140" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="acrylic" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".62"/>
      <stop offset=".5" stop-color="#e3edf4" stop-opacity=".3"/>
      <stop offset="1" stop-color="#cddbe6" stop-opacity=".42"/>
    </linearGradient>
    <radialGradient id="acrylic-band" gradientUnits="userSpaceOnUse" cx="${WHEEL.cx}" cy="${WHEEL.cy}" r="${RING.front}">
      <stop offset="${(RING.back / RING.front).toFixed(3)}" stop-color="#dbe6ee" stop-opacity=".12"/>
      <stop offset="1" stop-color="#f4f8fb" stop-opacity=".26"/>
    </radialGradient>
    <radialGradient id="acrylic-blur" gradientUnits="userSpaceOnUse" cx="${WHEEL.cx}" cy="${WHEEL.cy}" r="${RING.front}">
      <stop offset="${(RING.back / RING.front).toFixed(3)}" stop-color="#ffffff" stop-opacity=".22"/>
      <stop offset=".93" stop-color="#ffffff" stop-opacity=".5"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity=".3"/>
    </radialGradient>
    <linearGradient id="bowl" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset=".6" stop-color="#f6f2ec"/>
      <stop offset="1" stop-color="#e2dad0"/>
    </linearGradient>
    <linearGradient id="bowl-inside" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e6dfd6"/>
      <stop offset="1" stop-color="#fbf9f6"/>
    </linearGradient>
    <radialGradient id="bed-rim" gradientUnits="userSpaceOnUse" cx="250" cy="192" r="47" gradientTransform="translate(0 132) scale(1 .31)">
      <stop offset="0" stop-color="#fdf9f3"/>
      <stop offset=".72" stop-color="#f1e7da"/>
      <stop offset="1" stop-color="#dfcfbb"/>
    </radialGradient>
    <radialGradient id="bed-cushion" cx=".5" cy=".85" r=".85">
      <stop offset="0" stop-color="#fffdf9"/>
      <stop offset="1" stop-color="#f1e7db"/>
    </radialGradient>
    <radialGradient id="bean-glow">
      <stop offset="0" stop-color="#9eeaff" stop-opacity=".9"/>
      <stop offset=".55" stop-color="#38c2f2" stop-opacity=".28"/>
      <stop offset="1" stop-color="#38c2f2" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="bean-body" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#83e2ff"/>
      <stop offset="1" stop-color="#24a8e2"/>
    </linearGradient>
    <radialGradient id="gold-glow">
      <stop offset="0" stop-color="#fff1b0" stop-opacity=".95"/>
      <stop offset=".5" stop-color="#ffd257" stop-opacity=".35"/>
      <stop offset="1" stop-color="#ffd257" stop-opacity="0"/>
    </radialGradient>
    <symbol id="bean" viewBox="-9 -9 18 18" overflow="visible">
      <circle class="bean-halo" r="8.5" fill="url(#bean-glow)"/>
      <ellipse rx="4.6" ry="3.5" fill="url(#bean-body)" stroke="#1a8cc6" stroke-width=".9"/>
      <ellipse cx="-1.5" cy="-1.3" rx="1.7" ry=".95" fill="#fff" opacity=".9"/>
    </symbol>
    <symbol id="gold-block" viewBox="-16 -16 32 32" overflow="visible">
      <circle r="16" fill="url(#gold-glow)"/>
      <path d="M0-11 10-5.5 0 0-10-5.5Z" fill="#ffe7a0"/>
      <path d="M-10-5.5 0 0v12l-10-5.5Z" fill="#f7bf3e"/>
      <path d="M10-5.5 0 0v12l10-5.5Z" fill="#e39c22"/>
      <path d="M0-11 10-5.5v12L0 12l-10-5.5v-12ZM-10-5.5 0 0l10-5.5M0 0v12" stroke="#c9861a" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M-5.5-6.8 0-9.8" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".9"/>
    </symbol>
    <symbol id="heart" viewBox="-8 -8 16 16" overflow="visible">
      <path d="M0 5.6C-2.2 4-7 .9-7-2.6A3.6 3.6 0 0 1 0-4.1 3.6 3.6 0 0 1 7-2.6C7 .9 2.2 4 0 5.6Z" fill="#ff7f98" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>
      <ellipse cx="-3.4" cy="-2.2" rx="1.4" ry=".9" transform="rotate(-30 -3.4 -2.2)" fill="#fff" opacity=".8"/>
    </symbol>
    <symbol id="note" viewBox="-8 -8 16 16" overflow="visible">
      <path d="M1.5-6.5v9M1.5-6.5c2.2.8 4.2 2.3 3.5 5" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="-.8" cy="3" rx="2.8" ry="2.1" transform="rotate(-20 -.8 3)" fill="#fff"/>
      <path d="M1.5-6.5v9M1.5-6.5c2.2.8 4.2 2.3 3.5 5" stroke="${LILAC}" stroke-width="1.7" stroke-linecap="round"/>
      <ellipse cx="-.8" cy="3" rx="2.2" ry="1.6" transform="rotate(-20 -.8 3)" fill="${LILAC}"/>
    </symbol>
  </defs>

  <ellipse cx="${WHEEL.cx}" cy="206.5" rx="56" ry="4.2" fill="url(#soft-shadow)" opacity=".7"/>
  <ellipse cx="180" cy="206" rx="27" ry="3.8" fill="url(#soft-shadow)"/>
  <ellipse cx="250" cy="207" rx="54" ry="6" fill="url(#soft-shadow)"/>
  ${wheelMarkup()}
  ${bedMarkup()}

  <g id="dish-back">
    <ellipse cx="180" cy="194.5" rx="21.5" ry="4.8" fill="url(#bowl-inside)" stroke="#b9ada0" stroke-width="1"/>
  </g>
  <g id="pile"></g>
  <g id="dish-front">
    <path d="M158.5 194.5c0 6.5 6.5 11 14.5 11h14c8 0 14.5-4.5 14.5-11-2.5 3-10.5 4.8-21.5 4.8s-19-1.8-21.5-4.8Z" fill="url(#bowl)" stroke="#b9ada0" stroke-width="1" stroke-linejoin="round"/>
    <path d="M163.6 199.8c1.3 2.2 3.4 3.6 6 4.2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M196.4 197.4c-.6 2-2 3.6-4 4.6" stroke="#a89a8c" stroke-opacity=".35" stroke-width="1" stroke-linecap="round"/>
  </g>
  <text id="overflow" class="mark-text overflow" x="${DISH.x + 27}" y="${DISH.y - 16}" font-size="10"></text>

  <g id="speed-lines" opacity="0" stroke-linecap="round">
    <path d="M0 0h14M-6 8h12M2 16h10" stroke="#fff" stroke-width="4.4"/>
    <path d="M0 0h14M-6 8h12M2 16h10" stroke="#b3a496" stroke-width="2.2"/>
  </g>

  <ellipse id="ham-shadow" cx="0" cy="0" rx="36" ry="4.2" fill="url(#soft-shadow)" opacity=".2"/>

  <g id="ham">
    <g transform="translate(-160 -192)">${hamsterMarkup()}
    </g>
  </g>

  ${wheelFrontMarkup()}

  <g id="nest-front" opacity="0">${BED_FRONT}
  </g>

  <g id="flights"></g>

  <g id="zzz" opacity="0">${zLetter(0)}${zLetter(1)}${zLetter(2)}</g>
  <text id="mark" class="mark-text" font-size="20" x="0" y="0" opacity="0"></text>
  <g id="dots" opacity="0" fill="${LILAC}" stroke="#ffffff" stroke-width="1.6">
    <circle cx="-7" r="2.7"/><circle r="2.7"/><circle cx="7" r="2.7"/>
  </g>
  <use id="heart-mark" href="#heart" width="16" height="16" x="-8" y="-8" opacity="0"/>
  <use id="note-mark" href="#note" width="16" height="16" x="-8" y="-8" opacity="0"/>
  <g id="steam" opacity="0" stroke-linecap="round">
    <path d="M-6-2.5c2.6 0 3.6-1 3.6-3.6M2.5-6c0 2.6 1 3.6 3.6 3.6M6 2.5c-2.6 0-3.6 1-3.6 3.6M-2.5 6c0-2.6-1-3.6-3.6-3.6" stroke="#ffffff" stroke-width="4.6"/>
    <path d="M-6-2.5c2.6 0 3.6-1 3.6-3.6M2.5-6c0 2.6 1 3.6 3.6 3.6M6 2.5c-2.6 0-3.6 1-3.6 3.6M-2.5 6c0-2.6-1-3.6-3.6-3.6" stroke="#f0525e" stroke-width="2.4"/>
  </g>
  <g id="burp" opacity="0" fill="#d4f4ff" stroke="#38b6e8" stroke-width="1">
    <circle r="3.2"/><circle r="2.4"/><circle r="1.7"/>
  </g>

  <g id="celebration" opacity="0">
    <g id="sparkles" fill="#ffd257" stroke="#fff6d2" stroke-width=".8">
      <path d="M0-5 1.3-1.3 5 0 1.3 1.3 0 5-1.3 1.3-5 0-1.3-1.3Z"/>
      <path d="M0-4 1-1 4 0 1 1 0 4-1 1-4 0-1-1Z"/>
      <path d="M0-4.5 1.1-1.1 4.5 0 1.1 1.1 0 4.5-1.1 1.1-4.5 0-1.1-1.1Z"/>
      <path d="M0-3.5.9-.9 3.5 0 .9.9 0 3.5-.9.9-3.5 0-.9-.9Z"/>
    </g>
    <use href="#gold-block" width="32" height="32" x="-16" y="-16"/>
    <text id="celebration-text" class="mark-text gold" x="0" y="-19" font-size="12" text-anchor="middle"></text>
  </g>
</svg>`;
}
