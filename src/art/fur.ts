// Geometry helpers for drawing soft fur in SVG: smooth closed outlines through
// a few points, fluffy edges made of small tufts, and short hair strokes for
// texture. Everything is generated once from a fixed seed, so the drawing is
// identical on every start and in every test.

export type Pt = readonly [number, number];
type Seg = readonly [Pt, Pt, Pt, Pt];

/** A small deterministic random generator (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const num = (n: number) => String(Math.round(n * 100) / 100);
export const at = ([x, y]: Pt) => `${num(x)} ${num(y)}`;

/** Bezier segments of the closed Catmull-Rom spline through the points. */
function segments(points: readonly Pt[]): Seg[] {
  const n = points.length;
  return points.map((p1, i) => {
    const p0 = points[(i - 1 + n) % n];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    return [p1, c1, c2, p2] as const;
  });
}

/** A smooth closed outline through the points, as SVG path data. */
export function smooth(points: readonly Pt[]): string {
  const segs = segments(points);
  return `M${at(segs[0][0])}${segs.map(([, c1, c2, p]) => `C${at(c1)} ${at(c2)} ${at(p)}`).join("")}Z`;
}

/** Points about `step` units apart along the smooth closed outline. */
export function ring(points: readonly Pt[], step = 0.5): Pt[] {
  const dense: Pt[] = [];
  for (const [p0, c1, c2, p3] of segments(points)) {
    for (let k = 0; k < 32; k++) {
      const t = k / 32;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      dense.push([a * p0[0] + b * c1[0] + c * c2[0] + d * p3[0], a * p0[1] + b * c1[1] + c * c2[1] + d * p3[1]]);
    }
  }
  const out: Pt[] = [dense[0]];
  let carry = 0;
  for (let i = 1; i <= dense.length; i++) {
    const p = dense[i - 1];
    const q = dense[i % dense.length];
    let len = Math.hypot(q[0] - p[0], q[1] - p[1]);
    let from = p;
    while (carry + len >= step) {
      const k = (step - carry) / len;
      from = [from[0] + (q[0] - from[0]) * k, from[1] + (q[1] - from[1]) * k];
      out.push(from);
      len -= step - carry;
      carry = 0;
    }
    carry += len;
  }
  if (out.length > 1) {
    const [first, last] = [out[0], out[out.length - 1]];
    if (Math.hypot(first[0] - last[0], first[1] - last[1]) < step * 0.5) out.pop();
  }
  return out;
}

function area(points: readonly Pt[]): number {
  let s = 0;
  points.forEach((p, i) => {
    const q = points[(i + 1) % points.length];
    s += p[0] * q[1] - q[0] * p[1];
  });
  return s / 2;
}

export function inside(points: readonly Pt[], [x, y]: Pt): boolean {
  let hit = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const unit = ([x, y]: Pt): Pt => {
  const len = Math.hypot(x, y) || 1;
  return [x / len, y / len];
};

export interface Fluff {
  /** Longest tuft at a point of the outline, given its outward normal. Below 0.4 the edge stays smooth. */
  length: (p: Pt, normal: Pt) => number;
  /** Which way the fur lies at a point; tufts lean that way along the edge. */
  flow: (p: Pt) => Pt;
  seed: number;
  /** Distance between tuft roots, in units. */
  spacing?: readonly [number, number];
}

/**
 * The outline through the points with small pointed tufts sticking out of
 * it, as SVG path data. The tufts lean with the fur, so the edge looks soft.
 */
export function fluffy(points: readonly Pt[], fluff: Fluff): string {
  const pts = ring(points, 0.5);
  const n = pts.length;
  const sign = area(pts) > 0 ? 1 : -1;
  const tangent = (i: number) => unit([pts[(i + 1) % n][0] - pts[(i - 1 + n) % n][0], pts[(i + 1) % n][1] - pts[(i - 1 + n) % n][1]]);
  const random = rng(fluff.seed);
  const [lo, hi] = fluff.spacing ?? [2.2, 3.6];
  let d = `M${at(pts[0])}`;
  for (let i = 0; i < n; ) {
    const span = Math.max(3, Math.round((lo + random() * (hi - lo)) / 0.5));
    const j = Math.min(n, i + span);
    const mid = Math.floor((i + j) / 2) % n;
    const t = tangent(mid);
    const normal: Pt = [sign * t[1], -sign * t[0]];
    const m = pts[mid];
    const h = fluff.length(m, normal) * (0.4 + 0.6 * random());
    const start = pts[i % n];
    const end = pts[j % n];
    if (h < 0.4) {
      for (let k = i + 2; k < j; k += 2) d += `L${at(pts[k % n])}`;
      d += `L${at(end)}`;
    } else {
      const flow = fluff.flow(m);
      const lean = Math.max(-1, Math.min(1, flow[0] * t[0] + flow[1] * t[1])) * h * 0.85 + (random() - 0.5) * h * 0.3;
      const tip: Pt = [m[0] + normal[0] * h + t[0] * lean, m[1] + normal[1] * h + t[1] * lean];
      const c1: Pt = [start[0] + normal[0] * h * 0.5 + t[0] * lean * 0.3, start[1] + normal[1] * h * 0.5 + t[1] * lean * 0.3];
      const c2: Pt = [end[0] + normal[0] * h * 0.3, end[1] + normal[1] * h * 0.3];
      d += `Q${at(c1)} ${at(tip)}Q${at(c2)} ${at(end)}`;
    }
    i = j;
  }
  return `${d}Z`;
}

export interface Fuzz {
  /** Longest hair at a point of the outline, given its outward normal. Below 0.3 no hair grows there. */
  length: (p: Pt, normal: Pt) => number;
  /** Which way the fur lies at a point; the hairs lean that way. */
  flow: (p: Pt) => Pt;
  seed: number;
  /** Average distance between hairs along the edge. */
  spacing?: number;
  /** How far inside the edge each hair starts. */
  inset?: number;
}

/**
 * Short hairs that cross the outline and stick out of it, as SVG path data.
 * Stroked with the shape's own gradient they give it a soft, furry edge.
 */
export function fuzz(points: readonly Pt[], f: Fuzz): string {
  const pts = ring(points, 0.25);
  const n = pts.length;
  const sign = area(pts) > 0 ? 1 : -1;
  const random = rng(f.seed);
  const spacing = f.spacing ?? 0.9;
  const inset = f.inset ?? 1;
  let d = "";
  for (let i = 0; i < n; i += Math.max(1, Math.round((spacing * (0.5 + random())) / 0.25))) {
    const p = pts[i];
    const t = unit([pts[(i + 1) % n][0] - pts[(i - 1 + n) % n][0], pts[(i + 1) % n][1] - pts[(i - 1 + n) % n][1]]);
    const normal: Pt = [sign * t[1], -sign * t[0]];
    const len = f.length(p, normal) * (0.45 + 0.55 * random());
    if (len < 0.3) continue;
    const flow = f.flow(p);
    const lean = Math.max(-1.2, Math.min(1.2, flow[0] * t[0] + flow[1] * t[1])) * 0.9 + (random() - 0.5) * 0.6;
    const dir = unit([normal[0] + t[0] * lean, normal[1] + t[1] * lean]);
    const back = inset * (0.6 + 0.8 * random());
    const start: Pt = [p[0] - normal[0] * back, p[1] - normal[1] * back];
    const end: Pt = [p[0] + dir[0] * len, p[1] + dir[1] * len];
    const bend = (random() - 0.5) * 0.5 * len;
    const c: Pt = [(start[0] + end[0]) / 2 - dir[1] * bend, (start[1] + end[1]) / 2 + dir[0] * bend];
    d += `M${at(start)}Q${at(c)} ${at(end)}`;
  }
  return d;
}

export interface Hair {
  count: number;
  length: readonly [number, number];
  flow: (p: Pt) => Pt;
  seed: number;
  /** Only grow hairs where this holds, for example in the golden part. */
  where?: (p: Pt) => boolean;
  /** How much each hair bends, as a share of its length. */
  curl?: number;
}

/** Short curved strokes inside the outline that follow the fur, as SVG path data. */
export function hairs(points: readonly Pt[], hair: Hair): string {
  const pts = ring(points, 1);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const random = rng(hair.seed);
  let d = "";
  for (let made = 0, tries = 0; made < hair.count && tries < hair.count * 40; tries++) {
    const p: Pt = [x0 + random() * (x1 - x0), y0 + random() * (y1 - y0)];
    if (!inside(pts, p) || (hair.where && !hair.where(p))) continue;
    const [fx, fy] = unit(hair.flow(p));
    const len = hair.length[0] + random() * (hair.length[1] - hair.length[0]);
    const end: Pt = [p[0] + fx * len, p[1] + fy * len];
    if (!inside(pts, end)) continue;
    const bend = (random() - 0.5) * (hair.curl ?? 0.5) * len;
    const c: Pt = [(p[0] + end[0]) / 2 - fy * bend, (p[1] + end[1]) / 2 + fx * bend];
    d += `M${at(p)}Q${at(c)} ${at(end)}`;
    made++;
  }
  return d;
}

/** Fur that grows outward from a point, bent a little towards `bias`. */
export const radial =
  ([cx, cy]: Pt, [bx, by]: Pt = [0, 0]): ((p: Pt) => Pt) =>
  ([x, y]) => {
    const [ux, uy] = unit([x - cx, y - cy]);
    return unit([ux + bx, uy + by]);
  };
