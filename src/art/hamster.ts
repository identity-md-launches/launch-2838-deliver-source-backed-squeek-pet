// Squeektoshi for the desktop, drawn after zake's reference photos: a golden
// Syrian hamster with a darker saddle and forehead, cream muzzle, chest and
// belly, grey-brown ears with pink insides, black bead eyes, a pink nose and
// pink paws. There are no outlines: soft gradients, fluffy edges made of
// tufts and fine hair strokes do the work, as in a photo.
//
// Parts are drawn facing right in hamster coordinates, with the feet at
// PIVOT.origin; the rig turns, tilts and swaps them every frame.

import { at, fluffy, fuzz, hairs, radial, type Pt } from "./fur";

const GOLD_DEEP = "#c98a52";
const CREAM = "#fbf2e6";
const CREAM_SHADE = "#e2cdb6";
const PINK = "#f2b2ad";
const PINK_SHADE = "#d99893";
const EYE = "#120b09";
const LID = "#3b2417";
const LIP = "#a8746a";

export const PIVOT = {
  origin: [160, 192],
  hip: [116, 186],
  head: [180, 152],
  tail: [99, 162],
  legs: [
    [136, 176], // far rear
    [190, 176], // far front
    [124, 172], // near rear
    [182, 176], // near front
  ],
} as const satisfies Record<string, Pt | readonly Pt[]>;

/**
 * The head is drawn at a size that is comfortable for detail, then shrunk
 * onto the body around the neck: at full size it looked too big.
 */
const HEAD_SCALE = 0.85;
const NECK: Pt = [182, 150];
const round2 = (n: number) => Math.round(n * 100) / 100;
/** Where a point drawn on the head ends up on the hamster. */
const onHead = ([x, y]: Pt): Pt => [round2(NECK[0] + (x - NECK[0]) * HEAD_SCALE), round2(NECK[1] + (y - NECK[1]) * HEAD_SCALE)];

/** Points other code attaches things to, in hamster coordinates. */
export const ANCHOR = {
  /** Top of the head: the gold block pops above it. */
  crown: onHead([200, 92]),
  /** Between the eyes: used to look at the pointer. */
  eyes: onHead([201, 131]),
  /** Head pats are rubbed around here. */
  head: onHead([199, 112]),
  /** Where "!", hearts, notes and the anger mark float. */
  mark: onHead([216, 80]),
  zzz: onHead([214, 88]),
  /** Just in front of the mouth, for the burp. */
  mouth: onHead([238, 152]),
  /** Behind the back, for the speed lines. */
  rear: [96, 152],
  /** Centre of the "?" card held while offline. */
  card: [204, 179],
} as const satisfies Record<string, Pt>;

/** How far the body sinks to lie on the ground. */
export const LIE = 5;

/** Points around the silhouette, for hit testing in any pose. */
export const HULL: ReadonlyArray<Pt> = [
  [92, 160], [110, 123], [150, 115], onHead([164, 89]), onHead([230, 85]), onHead([242, 112]), onHead([252, 140]),
  onHead([228, 168]), [200, 193], [100, 192],
];

// Outlines, as points a smooth curve passes through.
const BODY: Pt[] = [
  [103, 138], [121, 124.5], [147, 118.5], [172, 121.5], [190, 132], [198.5, 149], [199, 168],
  [191, 183.5], [166, 189.5], [136, 190.5], [111, 187.5], [98.5, 176], [95, 157],
];
const HEAD: Pt[] = [
  [201, 94], [219, 96.5], [233, 106], [240.5, 121], [241.5, 137], [236, 151], [224, 161], [206, 166],
  [188, 163.5], [173, 155], [164.5, 140], [165.5, 121], [174, 105], [187, 96.5],
];
const CHEEK_NEAR: Pt[] = [[171, 136], [180, 139], [185, 148], [182, 158], [172, 164], [161, 160], [157, 150], [161, 140]];
const CHEEK_FAR: Pt[] = [[232, 137], [240, 140], [244, 149], [240, 157], [231, 160], [224, 155], [223, 146], [226, 139]];
const MUZZLE: Pt[] = [
  [193, 138.5], [199, 135.5], [205, 134.5], [211, 135.5], [218, 138.5], [225.5, 145], [226, 155], [218, 164.5],
  [205, 168.5], [192, 165.5], [184.5, 157], [184.5, 146],
];
const HAUNCH: Pt[] = [[124, 157], [134, 160], [138, 170], [134, 181], [124, 185], [113, 181], [110, 170], [114, 160]];
const TAIL: Pt[] = [[92, 161.5], [97, 162], [98.5, 166], [95, 169], [90.5, 167.5]];

interface Ear {
  c: Pt;
  rx: number;
  ry: number;
  rot: number;
  pivot: Pt;
  inner: Pt;
}
interface Bead {
  c: Pt;
  rx: number;
  ry: number;
}

const TUMMY: Pt = [147, 152];
const CHEEK_NEAR_PIVOT: Pt = [177, 146];
const CHEEK_FAR_PIVOT: Pt = [226, 145];
const EAR_NEAR: Ear = { c: [175, 99], rx: 12, ry: 13, rot: -18, pivot: [180, 110], inner: [177.2, 101.8] };
const EAR_FAR: Ear = { c: [227, 97], rx: 11, ry: 12, rot: 18, pivot: [221, 107], inner: [225.2, 99.6] };
const EYE_NEAR: Bead = { c: [186, 132], rx: 4.6, ry: 5 };
const EYE_FAR: Bead = { c: [217, 131], rx: 4.1, ry: 4.7 };
const MOUTH: Pt = [205, 149];

// The head in profile, worn while running: it looks ahead along the wheel,
// the way the hamster in zake's wheel photo does. The back of it sinks into
// the body; the cream jaw and cheek sweep back from the nose to the throat.
const SIDE_HEAD: Pt[] = [
  [180, 109], [194, 99.5], [209, 96.5], [222, 99.5], [233, 106.5], [241, 116], [247, 126], [251.5, 133.5],
  [252, 139.5], [248.5, 145], [241.5, 149.5], [230, 155.5], [214, 161.5], [196, 163.5], [182, 158],
  [174, 143], [173.5, 124],
];
const SIDE_JAW: Pt[] = [
  [251, 139], [248.5, 145.5], [241.5, 150.5], [230, 157], [214, 163], [196, 164.5], [184.5, 158.5],
  [183.5, 151], [190, 144.5], [200, 141], [211, 140], [222, 138.6], [233, 137.8], [243, 138], [249.5, 138.5],
];
const SIDE_CHEEK: Pt[] = [[213, 146], [222, 144.5], [230, 148], [232.5, 154], [228, 159], [219, 161], [210, 157.5], [208, 151.5]];
const SIDE_CHEEK_PIVOT: Pt = [225, 148];
const SIDE_EAR_NEAR: Ear = { c: [195, 94.5], rx: 11.5, ry: 13.5, rot: -20, pivot: [201, 106], inner: [197.6, 96] };
const SIDE_EAR_FAR: Ear = { c: [208.5, 92], rx: 8.5, ry: 10.5, rot: 6, pivot: [207, 103], inner: [209.8, 93.5] };
const SIDE_EYE: Bead = { c: [226, 122.8], rx: 4.5, ry: 5.1 };
const SIDE_MOUTH: Pt = [246, 144];

// Which way the fur lies: backwards and down on the body, out from the nose
// on the head, out and down on the cheeks.
const bodyFlow = ([x, y]: Pt): Pt => {
  const [dx, dy] = [x - 150, y - 170];
  const len = Math.hypot(dx, dy) || 1;
  return [dy / len - 0.35, -dx / len + 0.55];
};
const headFlow = radial([205, 142], [0, 0.15]);
const nearCheekFlow = radial([176, 144], [-0.2, 0.5]);
const farCheekFlow = radial([228, 143], [0.2, 0.5]);
const sideFlow = radial([252, 141], [0, -0.05]);
const jawFlow = radial([247, 142], [0, 0.45]);
const sideCheekFlow = radial([228, 146], [-0.2, 0.4]);

/** Short sleek fur on the back, fuller on the rump and the belly. */
const bodyFluff = ([x, y]: Pt, [nx, ny]: Pt) =>
  x > 183 && y < 166 ? 0 : 1.6 + 1.6 * Math.max(0, -nx) + 1.4 * Math.max(0, ny) + 0.4 * Math.max(0, nx);
const headFluff = (_: Pt, [nx, ny]: Pt) => (ny > 0.35 ? 0 : 1.4 + 0.8 * Math.max(0, -ny) + 0.4 * Math.abs(nx));
/** In profile: soft fur where the head meets the body, a short nap round the nose. */
const sideFluff = ([x, y]: Pt, [, ny]: Pt) => (x < 188 && y > 126 ? 1.2 : x > 243 ? 0.45 : 1.3 + 0.7 * Math.max(0, -ny));
/** The jaw's top meets golden fur inside the head, so it stays short; underneath it is full. */
const jawFluff = ([x]: Pt, [nx, ny]: Pt) => (x > 244 ? 0.5 : ny < -0.3 ? 1 : 1.5 + 0.6 * Math.max(0, ny) + 0.5 * Math.max(0, -nx));

/** A shape with a soft edge: a lightly tufted fill, short hairs across the edge and a few long wisps. */
interface Furry {
  fill: string;
  fuzz: string;
  wisps: string;
}

function furry(points: Pt[], length: (p: Pt, n: Pt) => number, flow: (p: Pt) => Pt, seed: number, tuft = 0.45): Furry {
  return {
    fill: fluffy(points, { length: (p, n) => length(p, n) * tuft, flow, seed, spacing: [2.4, 4] }),
    fuzz: fuzz(points, { length, flow, seed: seed + 1, spacing: 0.8 }),
    wisps: fuzz(points, { length: (p, n) => length(p, n) * 1.6, flow, seed: seed + 2, spacing: 3.4 }),
  };
}

const BODY_FUR = furry(BODY, bodyFluff, bodyFlow, 11);
const HEAD_FUR = furry(HEAD, headFluff, headFlow, 23);
const NEAR_CHEEK_FUR = furry(CHEEK_NEAR, () => 2.1, nearCheekFlow, 31);
const FAR_CHEEK_FUR = furry(CHEEK_FAR, () => 1.8, farCheekFlow, 37);
const MUZZLE_FUR = furry(MUZZLE, (_, [, ny]) => (ny > 0.4 ? 1.9 : 1.3), radial([205, 152]), 41, 0.3);
const HAUNCH_FUR = furry(HAUNCH, (_, [, ny]) => (ny > 0.15 ? 2 : 0), bodyFlow, 43, 0.3);
const TAIL_FUR = furry(TAIL, () => 1.3, () => [-1, 0.3], 47);
const SIDE_FUR = furry(SIDE_HEAD, sideFluff, sideFlow, 51);
const JAW_FUR = furry(SIDE_JAW, jawFluff, jawFlow, 61, 0.35);
const SIDE_CHEEK_FUR = furry(SIDE_CHEEK, () => 1.5, sideCheekFlow, 71, 0.35);

/** Draws a furry shape filled and edged with one paint, usually a gradient in hamster coordinates. */
const furPath = (f: Furry, paint: string, wisps = true) =>
  `<path d="${f.fill}" fill="${paint}"/><path d="${f.fuzz}" stroke="${paint}" stroke-width=".75" stroke-linecap="round"/>${wisps ? `<path d="${f.wisps}" stroke="${paint}" stroke-width=".5" stroke-linecap="round" opacity=".85"/>` : ""}`;

const hairPath = (d: string, color: string, width: number, opacity: number) =>
  `<path d="${d}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}"/>`;

/** A group the rig moves as one part, turning or scaling around its pivot. */
function part(name: string, pivot: Pt | null, inner: string, attrs = ""): string {
  return `<g data-part="${name}"${pivot ? ` data-pivot="${at(pivot)}"` : ""}${attrs ? ` ${attrs}` : ""}>${inner}</g>`;
}

const ellipse = ([x, y]: Pt, rx: number, ry: number, attrs: string, rot = 0) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ""} ${attrs}/>`;

/** A furry leg: a soft oval of fur from the body down to a pink paw. */
function leg(from: Pt, to: Pt, width: number, fur: string, paw: Pt, size: readonly [number, number], pink: string, seed: number, toes = false): string {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const [ux, uy] = [(to[0] - from[0]) / len, (to[1] - from[1]) / len];
  const mid: Pt = [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2];
  const outline: Pt[] = Array.from({ length: 12 }, (_, k) => {
    const a = (k / 12) * Math.PI * 2;
    const along = Math.cos(a) * (len / 2 + width * 0.3);
    const across = Math.sin(a) * (width / 2) * (Math.cos(a) > 0 ? 0.82 : 1);
    return [mid[0] + ux * along - uy * across, mid[1] + uy * along + ux * across] as const;
  });
  const coat = furry(outline, () => 1.2, () => [ux, uy], seed);
  const [px, py] = paw;
  const fingers = toes
    ? `<path d="M${at([px + size[0] * 0.25, py - size[1] * 0.2])}v${size[1] * 0.8}M${at([px + size[0] * 0.62, py - size[1] * 0.35])}v${size[1] * 0.8}" stroke="${PINK_SHADE}" stroke-width=".55" stroke-linecap="round" opacity=".8"/>`
    : "";
  return `${furPath(coat, fur, false)}
    ${ellipse(paw, size[0], size[1], `fill="${pink}"`)}
    ${ellipse([px - size[0] * 0.1, py - size[1] * 0.35], size[0] * 0.6, size[1] * 0.35, `fill="#fff" opacity=".35"`)}${fingers}`;
}

/** An ear: grey-brown fur outside, pink skin inside, a light rim where the light comes through. */
function ear(e: Ear, innerScale: number, shade = 0): string {
  const [x, y] = e.c;
  return part(
    "ear",
    e.pivot,
    `${ellipse(e.c, e.rx, e.ry, `fill="url(#ham-ear-out)"`, e.rot)}
      ${ellipse(e.inner, e.rx * 0.66 * innerScale, e.ry * 0.7, `fill="url(#ham-ear-in)"`, e.rot)}
      ${shade ? ellipse(e.c, e.rx, e.ry, `fill="#5e4a3e" opacity="${shade}"`, e.rot) : ""}
      <path d="M${at([x - e.rx * 0.75, y - e.ry * 0.35])}A${e.rx} ${e.ry} 0 0 1 ${at([x + e.rx * 0.75, y - e.ry * 0.38])}" transform="rotate(${e.rot} ${x} ${y})" stroke="#f6dccf" stroke-width=".9" stroke-linecap="round" opacity=".7"/>`,
  );
}

/** A black bead eye in a dark rim, with the light's reflection. */
function eye(shape: Bead, glint: number): string {
  const [x, y] = shape.c;
  return part(
    "eye",
    shape.c,
    `${ellipse(shape.c, shape.rx + 0.65, shape.ry + 0.6, `fill="${LID}"`)}${part(
      "pupil",
      null,
      `${ellipse(shape.c, shape.rx, shape.ry, `fill="url(#ham-eye)"`)}
        ${ellipse([x + shape.rx * 0.3, y - shape.ry * 0.34], 1.3 * glint, 1.45 * glint, `fill="#fff"`, -20)}
        <circle cx="${x - shape.rx * 0.34}" cy="${y + shape.ry * 0.42}" r="${0.55 * glint}" fill="#fff" opacity=".65"/>`,
    )}`,
  );
}

function spiral([x, y]: Pt, k: number): string {
  const a = (n: number) => (n * k).toFixed(2);
  return `<path data-part="swirl" data-pivot="${x} ${y}" d="M${x} ${y}m-${a(1.1)} 0a${a(1.1)} ${a(1.1)} 0 1 1 ${a(2.2)} 0 ${a(2.2)} ${a(2.2)} 0 1 1-${a(4.4)} 0 ${a(3.3)} ${a(3.3)} 0 1 1 ${a(6.6)} 0 ${a(4.2)} ${a(4.2)} 0 1 1-${a(8.4)} 0" stroke="${LID}" stroke-width="1.3" stroke-linecap="round"/>`;
}

/** Gradients and clip paths the hamster uses; they go into the scene's defs. */
export function hamsterDefs(): string {
  const fade = (id: string, color: string, opacity: number) =>
    `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${opacity}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
  return `
    <linearGradient id="ham-coat" gradientUnits="userSpaceOnUse" x1="0" y1="116" x2="0" y2="194">
      <stop offset="0" stop-color="#f6d3a8"/>
      <stop offset=".12" stop-color="#edb57d"/>
      <stop offset=".36" stop-color="#e5a668"/>
      <stop offset=".52" stop-color="#e9b483"/>
      <stop offset=".62" stop-color="#f2d6b7"/>
      <stop offset=".72" stop-color="#faefe2"/>
      <stop offset="1" stop-color="#ebd7c2"/>
    </linearGradient>
    <radialGradient id="ham-head" gradientUnits="userSpaceOnUse" cx="192" cy="108" r="62">
      <stop offset="0" stop-color="#f7d6ab"/>
      <stop offset=".35" stop-color="#efb980"/>
      <stop offset=".7" stop-color="#e6a86b"/>
      <stop offset="1" stop-color="#dc995c"/>
    </radialGradient>
    <linearGradient id="ham-cheek-near" gradientUnits="userSpaceOnUse" x1="165" y1="137" x2="178" y2="163">
      <stop offset="0" stop-color="#ebab6c"/>
      <stop offset=".42" stop-color="#f3cda3"/>
      <stop offset=".78" stop-color="#fbf1e6"/>
      <stop offset="1" stop-color="#f2e1ce"/>
    </linearGradient>
    <linearGradient id="ham-cheek-far" gradientUnits="userSpaceOnUse" x1="239" y1="137" x2="229" y2="160">
      <stop offset="0" stop-color="#e4a061"/>
      <stop offset=".42" stop-color="#f0c59a"/>
      <stop offset=".8" stop-color="#f9eee0"/>
      <stop offset="1" stop-color="#eddac6"/>
    </linearGradient>
    <radialGradient id="ham-muzzle" gradientUnits="userSpaceOnUse" cx="205" cy="152" r="22">
      <stop offset="0" stop-color="#fffdfa"/>
      <stop offset=".65" stop-color="#fdf6ee"/>
      <stop offset="1" stop-color="#f5e6d4"/>
    </radialGradient>
    <linearGradient id="ham-haunch" gradientUnits="userSpaceOnUse" x1="0" y1="157" x2="0" y2="188">
      <stop offset="0" stop-color="#e9b07a" stop-opacity="0"/>
      <stop offset=".36" stop-color="#efc196" stop-opacity=".4"/>
      <stop offset=".64" stop-color="#f9ecde"/>
      <stop offset="1" stop-color="#ebd8c4"/>
    </linearGradient>
    <linearGradient id="ham-tail" gradientUnits="userSpaceOnUse" x1="0" y1="160" x2="0" y2="170">
      <stop offset="0" stop-color="#eebf90"/>
      <stop offset="1" stop-color="#f6e4d2"/>
    </linearGradient>
    <linearGradient id="ham-ear-out" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c6afa4"/>
      <stop offset="1" stop-color="#97827a"/>
    </linearGradient>
    <radialGradient id="ham-ear-in" cx=".5" cy=".62" r=".62">
      <stop offset="0" stop-color="#c78b8a"/>
      <stop offset=".55" stop-color="#dcaaa6"/>
      <stop offset="1" stop-color="#ebc4be"/>
    </radialGradient>
    <radialGradient id="ham-eye" cx=".5" cy=".8" r=".75">
      <stop offset="0" stop-color="#55372a"/>
      <stop offset=".5" stop-color="#1d110c"/>
      <stop offset="1" stop-color="${EYE}"/>
    </radialGradient>
    <linearGradient id="ham-nose" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f8c9c9"/>
      <stop offset="1" stop-color="#de8e96"/>
    </linearGradient>
    <radialGradient id="ham-side-head" gradientUnits="userSpaceOnUse" cx="214" cy="106" r="58">
      <stop offset="0" stop-color="#f7d6ab"/>
      <stop offset=".35" stop-color="#efb980"/>
      <stop offset=".7" stop-color="#e6a86b"/>
      <stop offset="1" stop-color="#dc995c"/>
    </radialGradient>
    <linearGradient id="ham-side-jaw" gradientUnits="userSpaceOnUse" x1="0" y1="139" x2="0" y2="168">
      <stop offset="0" stop-color="#fbf0e4" stop-opacity="0"/>
      <stop offset=".22" stop-color="#fcf3e9" stop-opacity=".7"/>
      <stop offset=".4" stop-color="#fdf7f0"/>
      <stop offset=".76" stop-color="#fffbf6"/>
      <stop offset="1" stop-color="#efdfcd"/>
    </linearGradient>
    <radialGradient id="ham-side-cheek" gradientUnits="userSpaceOnUse" cx="220" cy="151" r="14">
      <stop offset="0" stop-color="#fffefb"/>
      <stop offset=".7" stop-color="#fffaf4"/>
      <stop offset="1" stop-color="#fdf6ee"/>
    </radialGradient>
    ${fade("ham-saddle", "#a8642f", 0.42)}
    ${fade("ham-ash", "#8f664b", 0.55)}
    ${fade("ham-glow", "#fff6ea", 0.95)}
    ${fade("ham-sheen", "#ffffff", 0.4)}
    ${fade("ham-shade", "#7a4626", 0.3)}
    <clipPath id="ham-coat-clip"><path d="${BODY_FUR.fill}"/></clipPath>
    <clipPath id="ham-head-clip"><path d="${HEAD_FUR.fill}"/></clipPath>
    <clipPath id="ham-side-clip"><path d="${SIDE_FUR.fill}"/></clipPath>`;
}

/** Fine hairs inside a shape: light ones catch the light, dark ones sit between them. */
function texture(points: Pt[], flow: (p: Pt) => Pt, seed: number, count: number, length: readonly [number, number], where?: (p: Pt) => boolean): string {
  return `${hairPath(hairs(points, { count, length, flow, seed, where }), "#fff", 0.55, 0.16)}${hairPath(hairs(points, { count: Math.round(count * 0.6), length, flow, seed: seed + 1, where }), "#6e3a1c", 0.55, 0.11)}`;
}

/** The body: golden coat with a darker saddle, cream belly and chest, and the near haunch. */
function body(): string {
  const golden = (p: Pt) => p[1] < 158 - (p[0] < 125 ? 6 : 0);
  return part(
    "tummy",
    TUMMY,
    `${furPath(BODY_FUR, "url(#ham-coat)")}
      <g clip-path="url(#ham-coat-clip)">
        ${ellipse([152, 127], 42, 13, `fill="url(#ham-saddle)"`, 4)}
        ${ellipse([134, 122], 30, 5.5, `fill="url(#ham-sheen)"`, -8)}
        ${ellipse([111, 177], 18, 15, `fill="url(#ham-glow)"`)}
        ${ellipse([191, 167], 15, 24, `fill="url(#ham-glow)"`)}
        ${ellipse([178, 140], 20, 22, `fill="url(#ham-shade)"`)}
        ${ellipse([150, 195], 52, 9, `fill="url(#ham-shade)"`)}
        ${texture(BODY, bodyFlow, 101, 90, [3.5, 6.5], golden)}
        ${hairPath(hairs(BODY, { count: 40, length: [3, 5], flow: bodyFlow, seed: 107, where: ([, y]) => y > 151 && y < 169 }), "#fff8ee", 0.7, 0.55)}
      </g>
      ${furPath(HAUNCH_FUR, "url(#ham-haunch)")}
      ${texture(HAUNCH, bodyFlow, 301, 14, [2.5, 4], ([, y]) => y < 168)}`,
  );
}

/** The head: ears, golden crown with a darker forehead, cheeks, muzzle and face. */
function head(): string {
  const crown = `${furPath(HEAD_FUR, "url(#ham-head)")}
      <g clip-path="url(#ham-head-clip)">
        ${ellipse([202, 106], 14, 9.5, `fill="url(#ham-ash)"`)}
        ${ellipse([203, 127], 6, 10, `fill="url(#ham-glow)"`)}
        ${ellipse([186, 132], 8.5, 8.5, `fill="url(#ham-glow)"`)}
        ${ellipse([217, 131], 7.5, 8, `fill="url(#ham-glow)"`)}
        ${ellipse([186, 104], 12, 5, `fill="url(#ham-sheen)"`, -18)}
        ${ellipse([238, 132], 9, 22, `fill="url(#ham-shade)"`)}
        ${texture(HEAD, headFlow, 201, 50, [2.5, 4.5], ([, y]) => y < 126)}
      </g>`;
  const cheek = (f: Furry, points: Pt[], fill: string, flow: (p: Pt) => Pt, seed: number) =>
    `${furPath(f, `url(#${fill})`)}${texture(points, flow, seed, 14, [2.2, 3.6], ([, y]) => y < 150)}`;
  const whiskers =
    "M197 144.5Q183 139 170 137.5M196.5 146.5Q182 144.5 167.5 145M197 148.3Q183 150.5 169.5 154M198 150Q186 155 175 160.5M213 144.5Q229 139.5 249 137M213.5 146.5Q231 145 252 146M213 148.3Q229 151 249.5 155M212 150Q225 155.5 243 161";
  const face = `
      ${furPath(MUZZLE_FUR, "url(#ham-muzzle)")}
      <g id="eye-open" data-eye="open">${eye(EYE_NEAR, 1)}${eye(EYE_FAR, 0.9)}</g>
      <path id="eye-closed" data-eye="closed" d="M180.6 132.4Q186 136 191.4 132.4M212.4 131.4Q217 134.6 221.6 131.4" stroke="${LID}" stroke-width="1.5" stroke-linecap="round" opacity="0"/>
      <path id="eye-happy" data-eye="happy" d="M180.8 134.4Q186 128.2 191.2 134.4M212.6 133.4Q217 127.8 221.4 133.4" stroke="${LID}" stroke-width="1.6" stroke-linecap="round" opacity="0"/>
      <g id="eye-grumpy" data-eye="grumpy" opacity="0">
        <path d="M180.8 130.2L191.4 133.6Q190.4 137.6 186 137.6Q181.2 137.4 180.8 130.2ZM222.2 129.2L212.4 132.6Q213.4 136.6 217 136.6Q221.8 136.4 222.2 129.2Z" fill="${EYE}"/>
        <path d="M179.8 129.6L192 133.4M223.2 128.6L211.8 132.4" stroke="${LID}" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="187.6" cy="135" r=".8" fill="#fff" opacity=".85"/><circle cx="218.2" cy="134.2" r=".7" fill="#fff" opacity=".85"/>
      </g>
      <g id="eye-swirl" data-eye="swirl" opacity="0">${spiral(EYE_NEAR.c, 0.92)}${spiral(EYE_FAR.c, 0.82)}</g>
      <path d="M199.7 138.8C201.4 137.1 208.6 137.1 210.3 138.8C211.4 140.2 208.6 144.1 206.7 145.2C205.7 145.8 204.3 145.8 203.3 145.2C201.4 144.1 198.6 140.2 199.7 138.8Z" fill="url(#ham-nose)"/>
      ${ellipse([204.5, 138.7], 2.3, 0.95, `fill="#fff" opacity=".7"`)}
      <path d="M202 142.2q1 1.2 2.1.9M208 142.2q-1 1.2-2.1.9M205 145.7v1.8" stroke="${LIP}" stroke-width=".65" stroke-linecap="round"/>
      ${part("mouth", MOUTH, `${ellipse([205, 149.1], 1.7, 0.5, `fill="#6d3f36" opacity=".85"`)}<path d="M201.6 147.4Q203.3 149.3 205 147.6 206.7 149.3 208.4 147.4" stroke="${LIP}" stroke-width=".85" stroke-linecap="round" stroke-linejoin="round"/>`)}
      <g stroke-linecap="round">
        <path d="${whiskers}" stroke="#4a2f20" stroke-width=".9" opacity=".2"/>
        <path d="${whiskers}" stroke="#fffaf2" stroke-width=".45" opacity=".9"/>
      </g>`;
  // Both views share the head part; the rig shows one or the other.
  return part(
    "head",
    PIVOT.head,
    `<g transform="translate(${at(NECK)}) scale(${HEAD_SCALE}) translate(${at([-NECK[0], -NECK[1]])})">
      <g id="head-front">${ear(EAR_FAR, 0.85)}${ear(EAR_NEAR, 1)}${crown}
      ${part("pouch", CHEEK_FAR_PIVOT, cheek(FAR_CHEEK_FUR, CHEEK_FAR, "ham-cheek-far", farCheekFlow, 223))}
      ${part("pouch", CHEEK_NEAR_PIVOT, cheek(NEAR_CHEEK_FUR, CHEEK_NEAR, "ham-cheek-near", nearCheekFlow, 227))}
      ${face}</g>
      <g id="head-side" opacity="0" visibility="hidden">${sideHead()}</g>
    </g>`,
  );
}

/**
 * The head in profile, looking ahead. It has the same moving parts as the
 * front view (ears, eye, pupil, cheek pouch, mouth) and every expression.
 */
function sideHead(): string {
  const [ex, ey] = SIDE_EYE.c;
  const crown = `${furPath(SIDE_FUR, "url(#ham-side-head)")}
      <g clip-path="url(#ham-side-clip)">
        ${ellipse([211, 104], 17, 8.5, `fill="url(#ham-ash)"`, 8)}
        ${ellipse([239, 119], 7, 4, `fill="url(#ham-glow)" opacity=".55"`, 40)}
        ${ellipse(SIDE_EYE.c, 8, 7.5, `fill="url(#ham-glow)"`)}
        ${ellipse([203, 101], 11, 3.6, `fill="url(#ham-sheen)"`, -8)}
        ${ellipse([178, 136], 8, 20, `fill="url(#ham-shade)" opacity=".4"`)}
        ${texture(SIDE_HEAD, sideFlow, 501, 46, [2.5, 4.5], ([x, y]) => y < 133 && x > 184)}
      </g>`;
  const whiskers = "M245 140.2Q258 135.5 273 133M245.5 141.8Q260 140.2 276 141.2M245 143.3Q259 145.8 273 150.4M244 144.8Q254 150.4 264.5 158M243.5 139Q255 131 267 125";
  const farWhiskers = "M248.5 140Q263 135 279 131M249 142Q263 142.5 278 146.5";
  const brows = "M228 117Q234.5 108.5 242 104.2M230 118.2Q238.5 112 246.5 110";
  const grumpy = `M${at([ex - 5.1, ey - 2.7])}L${at([ex + 5.5, ey + 0.5])}Q${at([ex + 4.9, ey + 5.3])} ${at([ex + 0.1, ey + 5.5])}Q${at([ex - 4.7, ey + 5.3])} ${at([ex - 5.1, ey - 2.7])}Z`;
  return `
      <path d="${farWhiskers}" stroke="#fffaf2" stroke-width=".4" stroke-linecap="round" opacity=".55"/>
      ${ear(SIDE_EAR_FAR, 0.75, 0.22)}${ear(SIDE_EAR_NEAR, 1)}${crown}
      ${furPath(JAW_FUR, "url(#ham-side-jaw)")}
      ${part("pouch", SIDE_CHEEK_PIVOT, furPath(SIDE_CHEEK_FUR, "url(#ham-side-cheek)"))}
      ${ellipse([244.5, 141.5], 6.5, 5, `fill="url(#ham-glow)"`)}
      <g data-eye="open">${eye(SIDE_EYE, 1)}</g>
      <path data-eye="closed" d="M${at([ex - 4.9, ey + 0.7])}Q${at([ex, ey + 4.9])} ${at([ex + 4.9, ey + 0.7])}" stroke="${LID}" stroke-width="1.5" stroke-linecap="round" opacity="0"/>
      <path data-eye="happy" d="M${at([ex - 4.7, ey + 2.7])}Q${at([ex, ey - 3.7])} ${at([ex + 4.7, ey + 2.7])}" stroke="${LID}" stroke-width="1.6" stroke-linecap="round" opacity="0"/>
      <g data-eye="grumpy" opacity="0">
        <path d="${grumpy}" fill="${EYE}"/>
        <path d="M${at([ex - 6.1, ey - 3.6])}L${at([ex + 6.3, ey + 0.1])}" stroke="${LID}" stroke-width="1.2" stroke-linecap="round"/>
        <circle cx="${ex + 1.9}" cy="${ey + 3.1}" r=".8" fill="#fff" opacity=".85"/>
      </g>
      <g data-eye="swirl" opacity="0">${spiral(SIDE_EYE.c, 0.92)}</g>
      ${ellipse([248.2, 137.8], 3.2, 3.9, `fill="url(#ham-nose)"`, -22)}
      ${ellipse([247.7, 135.8], 1.4, 0.7, `fill="#fff" opacity=".7"`, -22)}
      <path d="M250.4 136.4q-1.8.4-2.2 2.5" stroke="#c4737c" stroke-width=".8" stroke-linecap="round"/>
      ${part("mouth", SIDE_MOUTH, `<path d="M248.2 141.8Q248.2 143.6 247.3 144.5Q245.4 146.1 242.6 145.7" stroke="${LIP}" stroke-width=".7" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>${ellipse([245, 145.7], 1.6, 0.38, `fill="#6d3f36" opacity=".45"`)}`)}
      <g stroke-linecap="round">
        <path d="${whiskers}" stroke="#4a2f20" stroke-width=".9" opacity=".2"/>
        <path d="${whiskers}" stroke="#fffaf2" stroke-width=".45" opacity=".9"/>
        <path d="${brows}" stroke="#fffaf2" stroke-width=".4" opacity=".45"/>
      </g>`;
}

/** The hamster, facing right, feet at PIVOT.origin. */
export function hamsterMarkup(): string {
  return `
      <g id="ham-body">
        ${part("leg-0", PIVOT.legs[0], leg([136, 174], [139, 185], 8, GOLD_DEEP, [141, 188.5], [6.2, 2.9], PINK_SHADE, 401))}
        ${part("leg-1", PIVOT.legs[1], leg([190, 175], [192.5, 184], 6.5, CREAM_SHADE, [194.5, 187.4], [4.6, 2.8], PINK_SHADE, 411))}
        ${part("tail", PIVOT.tail, furPath(TAIL_FUR, "url(#ham-tail)", false))}
        ${body()}
        ${head()}
        <g id="question" opacity="0">
          <rect x="189" y="162" width="30" height="34" rx="9" fill="#fffdf8" stroke="#8e7cf3" stroke-width="2.2"/>
          <text x="204" y="188" text-anchor="middle" font-size="24" font-weight="800" fill="#6f5ce6" class="glyph">?</text>
        </g>
        ${part(
          "leg-2",
          PIVOT.legs[2],
          leg([127, 179], [129.5, 186], 7.5, "#f6e8d8", [130.5, 189], [8.2, 3.2], PINK, 421, true),
        )}
        ${part(
          "leg-3",
          PIVOT.legs[3],
          `${leg([182, 174], [184.5, 184], 7.5, CREAM, [186.8, 187.6], [5.2, 3.2], PINK, 431, true)}
            <use id="held-bean" href="#bean" x="176" y="171" width="26" height="26" opacity="0"/>`,
        )}
      </g>`;
}
