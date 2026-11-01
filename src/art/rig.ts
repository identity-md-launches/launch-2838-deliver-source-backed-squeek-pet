import { ANCHOR, PIVOT } from "./hamster";
import { DISH, PILE_SLOTS, WHEEL, WHEEL_TREADS, sceneMarkup } from "./scene";

export type EyeStyle = "open" | "closed" | "happy" | "grumpy" | "swirl";
export type MarkKind = "none" | "exclaim" | "dots" | "heart" | "note" | "steam";

/** Every movable part of the hamster for one frame. Angles are in degrees. */
export interface Pose {
  x: number;
  y: number;
  /** 1 faces right, -1 faces left; values in between are a turn in progress. */
  face: number;
  scale: number;
  hop: number;
  squashX: number;
  squashY: number;
  /** How far the body is lowered towards the ground (lying down). */
  lie: number;
  /** Whole-body rotation around the hips; negative rears up. */
  tilt: number;
  head: number;
  /**
   * 0 shows the face turned towards the viewer, 1 the head in profile looking
   * ahead, as while running; values in between blend the two.
   */
  profile: number;
  ear: number;
  earScale: number;
  tail: number;
  /** Far rear, far front, near rear, near front. */
  legs: [number, number, number, number];
  /** 1 for straight legs, smaller to tuck them under the body. */
  tuck: number;
  eye: EyeStyle;
  blink: number;
  pupilX: number;
  pupilY: number;
  pouch: number;
  bulge: number;
  chew: number;
  holdBean: boolean;
  question: boolean;
  swirl: number;
}

export interface Frame {
  pose: Pose;
  wheelAngle: number;
  speedLines: { opacity: number; x: number; y: number; shift: number };
  pile: number;
  overflow: number;
  flights: { x: number; y: number }[];
  nestFront: number;
  zzz: { opacity: number; x: number; y: number; t: number };
  mark: { kind: MarkKind; x: number; y: number; t: number };
  burp: { x: number; y: number; t: number } | null;
  celebration: { x: number; y: number; t: number; text: string } | null;
}

export function neutralPose(x: number, y: number, face: number, scale: number): Pose {
  return {
    x,
    y,
    face,
    scale,
    hop: 0,
    squashX: 1,
    squashY: 1,
    lie: 0,
    tilt: 0,
    head: 0,
    profile: 0,
    ear: 0,
    earScale: 1,
    tail: 0,
    legs: [0, 0, 0, 0],
    tuck: 1,
    eye: "open",
    blink: 0,
    pupilX: 0,
    pupilY: 0,
    pouch: 0,
    bulge: 0,
    chew: 0,
    holdBean: false,
    question: false,
    swirl: 0,
  };
}

/** Maps a point drawn in hamster coordinates to scene coordinates for this pose. */
export function toScene(p: Pose, ox: number, oy: number): { x: number; y: number } {
  const [hx, hy] = PIVOT.hip;
  const a = (p.tilt * Math.PI) / 180;
  const rx = hx + (ox - hx) * Math.cos(a) - (oy - hy) * Math.sin(a);
  const ry = hy + (ox - hx) * Math.sin(a) + (oy - hy) * Math.cos(a) + p.lie;
  const [cx, cy] = PIVOT.origin;
  return {
    x: p.x + p.face * p.scale * p.squashX * (rx - cx),
    y: p.y + p.hop + p.scale * p.squashY * (ry - cy),
  };
}

const r = (n: number) => Math.round(n * 100) / 100;
const around = (px: number, py: number, inner: string) => `translate(${px} ${py}) ${inner} translate(${-px} ${-py})`;
const SVG_NS = "http://www.w3.org/2000/svg";
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

interface Part {
  node: SVGElement;
  x: number;
  y: number;
}

/** The scene's DOM. Writes each frame and skips attributes that did not change. */
export class SceneView {
  readonly svg: SVGSVGElement;
  private readonly el: Record<string, SVGElement> = {};
  /** Hamster parts by name. A part can have several pieces, each with its own pivot. */
  private readonly parts = new Map<string, Part[]>();
  /** Every drawing of each expression: one in the front view, one in profile. */
  private readonly eyes = new Map<string, SVGElement[]>();
  private readonly pileBeans: SVGUseElement[] = [];
  private readonly flightBeans: SVGUseElement[] = [];
  private readonly cache = new WeakMap<Element, Map<string, string>>();
  private lastWheel: number | null = null;
  /** How far the wheel turns per drawn frame, in tread spacings, smoothed. */
  private spin = 0;

  constructor(host: HTMLElement) {
    host.innerHTML = sceneMarkup();
    this.svg = host.querySelector("svg")!;
    for (const node of this.svg.querySelectorAll<SVGElement>("[id]")) this.el[node.id] = node;
    for (const node of this.svg.querySelectorAll<SVGElement>("[data-part]")) {
      const [x = 0, y = 0] = (node.dataset.pivot ?? "").split(" ").map(Number);
      const name = node.dataset.part!;
      this.parts.set(name, [...(this.parts.get(name) ?? []), { node, x, y }]);
    }
    for (const node of this.svg.querySelectorAll<SVGElement>("[data-eye]")) {
      const style = node.dataset.eye!;
      this.eyes.set(style, [...(this.eyes.get(style) ?? []), node]);
    }
    const pile = this.el.pile;
    PILE_SLOTS.forEach(([dx, dy]) => {
      const bean = this.makeBean(DISH.x + dx, DISH.y + dy);
      pile.appendChild(bean);
      this.pileBeans.push(bean);
    });
    for (let i = 0; i < 6; i++) {
      const bean = this.makeBean(0, 0);
      this.el.flights.appendChild(bean);
      this.flightBeans.push(bean);
    }
  }

  private makeBean(x: number, y: number): SVGUseElement {
    const bean = document.createElementNS(SVG_NS, "use");
    bean.setAttribute("href", "#bean");
    bean.setAttribute("width", "18");
    bean.setAttribute("height", "18");
    bean.setAttribute("x", "-9");
    bean.setAttribute("y", "-9");
    bean.setAttribute("transform", `translate(${x} ${y})`);
    return bean;
  }

  private set(node: Element | undefined, name: string, value: string | number) {
    if (!node) return;
    const text = typeof value === "number" ? String(r(value)) : value;
    let attrs = this.cache.get(node);
    if (!attrs) this.cache.set(node, (attrs = new Map()));
    if (attrs.get(name) === text) return;
    attrs.set(name, text);
    node.setAttribute(name, text);
  }

  /** Sets the transform of every piece of a part, built around each piece's pivot. */
  private part(name: string, transform: (x: number, y: number) => string) {
    for (const piece of this.parts.get(name) ?? []) this.set(piece.node, "transform", transform(piece.x, piece.y));
  }

  private text(node: Element | undefined, value: string) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  apply(f: Frame) {
    const p = f.pose;
    const e = this.el;
    this.set(e.rotor, "transform", `rotate(${r(f.wheelAngle % 360)} ${WHEEL.cx} ${WHEEL.cy})`);
    this.applyWheelBlur(f.wheelAngle);
    this.set(e.ham, "transform", `translate(${r(p.x)} ${r(p.y + p.hop)}) scale(${r(p.face * p.scale * p.squashX)} ${r(p.scale * p.squashY)})`);
    this.set(e["ham-body"], "transform", `translate(0 ${r(p.lie)}) rotate(${r(p.tilt)} ${PIVOT.hip[0]} ${PIVOT.hip[1]})`);
    p.legs.forEach((angle, i) => this.part(`leg-${i}`, (x, y) => around(x, y, `rotate(${r(angle)}) scale(1 ${r(p.tuck)})`)));
    // Tucked paws disappear under the body instead of squashing into slivers.
    const paws = smoothstep(0.32, 0.8, p.tuck);
    for (const i of [2, 3]) for (const piece of this.parts.get(`leg-${i}`) ?? []) this.set(piece.node, "opacity", paws);
    // Front face or profile. Mid-turn the head narrows a little and the two
    // views swap over a few frames; a hidden view is not painted at all.
    const narrow = 1 - 0.12 * Math.sin(Math.PI * Math.min(1, Math.max(0, p.profile)));
    const [tx, ty] = ANCHOR.eyes;
    const turn = narrow < 0.999 ? ` ${around(tx, ty, `scale(${r(narrow)} 1)`)}` : "";
    this.part("head", (x, y) => `rotate(${r(p.head)} ${x} ${y})${turn}`);
    const side = smoothstep(0.38, 0.62, p.profile);
    this.set(e["head-front"], "opacity", 1 - side);
    this.set(e["head-front"], "visibility", side >= 1 ? "hidden" : "visible");
    this.set(e["head-side"], "opacity", side);
    this.set(e["head-side"], "visibility", side <= 0 ? "hidden" : "visible");
    this.part("ear", (x, y) => around(x, y, `rotate(${r(p.ear)}) scale(${r(p.earScale)})`));
    this.part("tail", (x, y) => `rotate(${r(p.tail)} ${x} ${y})`);
    this.part("pupil", () => `translate(${r(p.pupilX)} ${r(p.pupilY)})`);
    for (const [style, nodes] of this.eyes) for (const node of nodes) this.set(node, "opacity", p.eye === style ? 1 : 0);
    this.part("eye", (x, y) => around(x, y, `scale(1 ${r(Math.max(0.08, 1 - p.blink))})`));
    this.part("swirl", (x, y) => `rotate(${r(p.swirl)} ${x} ${y})`);
    this.part("pouch", (x, y) => around(x, y, `scale(${r(1 + 0.4 * p.pouch)})`));
    this.part("tummy", (x, y) => around(x, y, `scale(${r(1 + 0.05 * p.bulge)} ${r(1 + 0.1 * p.bulge)})`));
    this.part("mouth", (x, y) => around(x, y, `scale(1 ${r(1 + 1.4 * p.chew)})`));
    this.set(e["held-bean"], "opacity", p.holdBean ? 1 : 0);
    this.set(e.question, "opacity", p.question ? 1 : 0);
    // Keep the card upright and its "?" readable whichever way the hamster faces.
    const [qx, qy] = ANCHOR.card;
    this.set(e.question, "transform", `rotate(${r(-p.tilt * 0.8)} ${qx} ${qy}) ${around(qx, qy, `scale(${p.face < 0 ? -1 : 1} 1)`)}`);

    const groundY = p.y + Math.max(0, -p.hop) + 1.5;
    const lift = Math.min(0.6, Math.max(0, -p.hop) / 40);
    this.set(e["ham-shadow"], "transform", `translate(${r(p.x)} ${r(groundY - Math.max(0, -p.hop))}) scale(${r(p.scale * 1.6 * (1 - lift))} 1)`);
    this.set(e["ham-shadow"], "opacity", 0.2 * (1 - lift));

    this.pileBeans.forEach((bean, i) => this.set(bean, "visibility", i < f.pile ? "visible" : "hidden"));
    this.text(e.overflow, f.overflow > 0 ? `+${f.overflow}` : "");
    this.flightBeans.forEach((bean, i) => {
      const flight = f.flights[i];
      this.set(bean, "visibility", flight ? "visible" : "hidden");
      if (flight) this.set(bean, "transform", `translate(${r(flight.x)} ${r(flight.y)})`);
    });

    this.set(e["nest-front"], "opacity", f.nestFront);
    const s = f.speedLines;
    this.set(e["speed-lines"], "opacity", s.opacity);
    if (s.opacity > 0) this.set(e["speed-lines"], "transform", `translate(${r(s.x + s.shift)} ${r(s.y)})`);

    this.set(e.zzz, "opacity", f.zzz.opacity);
    if (f.zzz.opacity > 0) {
      for (let i = 0; i < 3; i++) {
        const u = (f.zzz.t / 2400 + i / 3) % 1;
        this.set(e[`z${i}`], "transform", `translate(${r(f.zzz.x + i * 7 + 3 * Math.sin(u * 6))} ${r(f.zzz.y - i * 8 - u * 12)})`);
        this.set(e[`z${i}`], "opacity", Math.sin(Math.PI * u));
      }
    }

    this.applyMark(f.mark);

    const burp = f.burp;
    this.set(e.burp, "opacity", burp ? 1 - burp.t : 0);
    if (burp) {
      [...e.burp.children].forEach((bubble, i) => {
        this.set(bubble, "cx", burp.x + 4 + i * 4 + burp.t * 6);
        this.set(bubble, "cy", burp.y - 4 - i * 5 - burp.t * (14 + i * 6));
      });
    }

    const c = f.celebration;
    this.set(e.celebration, "opacity", c ? Math.min(1, c.t * 6, (1 - c.t) * 5) : 0);
    if (c) {
      this.set(e.celebration, "transform", `translate(${r(c.x)} ${r(c.y)})`);
      this.text(e["celebration-text"], c.text);
      [...e.sparkles.children].forEach((sparkle, i) => {
        const a = c.t * 5 + (i * Math.PI) / 2;
        const radius = 21 + 4 * Math.sin(c.t * 18 + i);
        this.set(sparkle, "transform", `translate(${r(Math.cos(a) * radius)} ${r(Math.sin(a) * radius * 0.7)}) scale(${r(0.7 + 0.4 * Math.abs(Math.sin(c.t * 14 + i)))})`);
      });
    }
  }

  /**
   * The clear wheel's treads strobe once they move more than a fraction of
   * their spacing between two frames, and can even seem to turn backwards. So
   * they grow faint trails first, then blur into a frosted band, the way a
   * camera sees a fast wheel. Works at any frame rate.
   */
  private applyWheelBlur(angle: number) {
    const a = angle % 360;
    const step = this.lastWheel === null ? 0 : Math.abs(((a - this.lastWheel + 540) % 360) - 180);
    this.lastWheel = a;
    this.spin += (step / (360 / WHEEL_TREADS) - this.spin) * 0.35;
    const blur = smoothstep(0.26, 0.5, this.spin);
    this.set(this.el["wheel-trails"], "opacity", smoothstep(0.04, 0.18, this.spin) * (1 - blur));
    this.set(this.el["wheel-treads"], "opacity", 1 - 0.82 * blur);
    this.set(this.el["wheel-blur"], "opacity", blur);
  }

  private applyMark(mark: Frame["mark"]) {
    const e = this.el;
    const fade = Math.min(1, mark.t * 8, (1 - mark.t) * 4);
    const rise = mark.t * 10;
    this.set(e.mark, "opacity", mark.kind === "exclaim" ? fade : 0);
    if (mark.kind === "exclaim") {
      this.text(e.mark, "!");
      this.set(e.mark, "x", mark.x);
      this.set(e.mark, "y", mark.y - rise * 0.6);
    }
    // The connecting dots loop for as long as the state lasts, so they never fade.
    this.set(e.dots, "opacity", mark.kind === "dots" ? 1 : 0);
    if (mark.kind === "dots") {
      this.set(e.dots, "transform", `translate(${r(mark.x)} ${r(mark.y - 4)})`);
      [...e.dots.children].forEach((dot, i) => this.set(dot, "opacity", 0.35 + 0.65 * Math.max(0, Math.sin(Math.PI * (mark.t * 3 - i)))));
    }
    this.set(e["heart-mark"], "opacity", mark.kind === "heart" ? fade : 0);
    if (mark.kind === "heart") this.set(e["heart-mark"], "transform", `translate(${r(mark.x)} ${r(mark.y - rise * 1.5)}) scale(${r(0.8 + mark.t * 0.5)})`);
    this.set(e["note-mark"], "opacity", mark.kind === "note" ? fade : 0);
    if (mark.kind === "note") this.set(e["note-mark"], "transform", `translate(${r(mark.x + 4 * Math.sin(mark.t * 9))} ${r(mark.y - rise * 1.6)})`);
    // Anger mark: pulses beside the head.
    this.set(e.steam, "opacity", mark.kind === "steam" ? fade : 0);
    if (mark.kind === "steam") this.set(e.steam, "transform", `translate(${r(mark.x + 8)} ${r(mark.y + 4)}) scale(${r(0.85 + 0.25 * Math.abs(Math.sin(mark.t * 14)))})`);
  }
}
