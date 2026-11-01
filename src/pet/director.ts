import { ANCHOR, LIE } from "../art/hamster";
import { DISH, HAMSTER_SCALE, PILE_SLOTS, SPOTS, type Spot } from "../art/scene";
import { neutralPose, toScene, type Frame, type MarkKind, type Pose } from "../art/rig";
import { BITE_MS, CELEBRATE_MS, WAKE_MS, type Mode, type PetState } from "../core/pet-machine";

// Turns the pet state into a pose for every frame. Everything here is
// presentation: it never changes what the state machine decided.

export interface PointerInput {
  hover: boolean;
  /** Cursor in scene coordinates, when known. */
  cursor: { x: number; y: number } | null;
  clickAt: number;
  patAt: number;
  grumpyAt: number;
  /** A treat from the play dock. Presentation only; never a data bean. */
  treatAt: number;
  /** A manual wake from the play dock. Presentation only; the wheel state is unchanged. */
  wakeAt: number;
}

export const idleInput = (): PointerInput => ({
  hover: false,
  cursor: null,
  clickAt: -Infinity,
  patAt: -Infinity,
  grumpyAt: -Infinity,
  treatAt: -Infinity,
  wakeAt: -Infinity,
});

/** The wake-up animation (eyes, ears, shake) plays before the hop to the wheel. */
export const WAKE_HOP_AT = 900;
const FLIGHT_MS = 620;
const FLIGHT_GAP_MS = 140;
const BURP_MS = 900;
const MAX_PILE = PILE_SLOTS.length;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t, 0, 1));
const approach = (value: number, target: number, dt: number, tau: number) =>
  tau <= 0 ? target : value + (target - value) * (1 - Math.exp(-dt / tau));
const TAU = Math.PI * 2;

function spotFor(mode: Mode): Spot {
  switch (mode) {
    case "waking":
    case "running":
      return SPOTS.wheel;
    case "stopping":
    case "eating":
    case "offline":
    case "fault":
      return SPOTS.dish;
    default:
      return SPOTS.nest;
  }
}

interface Travel {
  from: { x: number; y: number; face: number };
  to: Spot;
  start: number;
  dur: number;
  height: number;
}

interface Flight {
  start: number;
  from: { x: number; y: number };
}

export class Director {
  private last: number | null = null;
  private angle = 0;
  private omega = 0;
  private rpm = 0;
  private gait = 0;
  private profile = 0;
  private face: number = SPOTS.nest.face;
  private travel: Travel;
  private landedAt = -Infinity;
  private prevMode: Mode | null = null;
  private lastBeans = 0;
  private flights: Flight[] = [];
  private belly = 0;
  private mealBites = 0;
  private burpAt = -Infinity;
  private zzz = 0;
  private nestFront = 0;
  private nextBlink: number;
  private blinkAt = -Infinity;
  private nextTwitch: number;
  private twitchAt = -Infinity;

  constructor(now: number, private readonly random: () => number = Math.random) {
    const nest = SPOTS.nest;
    this.travel = { from: { ...nest }, to: nest, start: -Infinity, dur: 1, height: 0 };
    this.nextBlink = now + 2000 + random() * 3000;
    this.nextTwitch = now + 5000 + random() * 5000;
  }

  /** Current wheel speed shown on screen, in RPM. */
  get displayedRpm(): number {
    return this.omega / 6;
  }

  frame(state: PetState, now: number, input: PointerInput, fps = 30): Frame {
    const dt = this.last === null ? 0 : clamp((now - this.last) / 1000, 0, 0.25);
    this.last = now;
    const mode = state.mode;

    if (mode !== this.prevMode) {
      if (this.prevMode === "eating" && mode === "sleeping" && state.lastMeal > 0n) this.burpAt = now;
      if (mode === "eating") this.mealBites = 0;
      this.prevMode = mode;
    }

    // Moving between the wheel, the dish and the nest.
    const target = spotFor(mode);
    if (target !== this.travel.to) {
      const here = this.position(now);
      const start = mode === "waking" ? Math.max(now, state.modeSince + WAKE_HOP_AT) : now;
      const distance = Math.hypot(target.x - here.x, target.y - here.y);
      const dur = mode === "waking" ? WAKE_MS - WAKE_HOP_AT : clamp(280 + distance * 2.4, 320, 640);
      this.travel = { from: { ...here, face: this.face }, to: target, start, dur, height: 12 + distance * 0.2 };
    }
    const pos = this.position(now);
    const u = (now - this.travel.start) / this.travel.dur;
    const inAir = u > 0 && u < 1;
    if (u >= 1 && this.landedAt < this.travel.start) this.landedAt = this.travel.start + this.travel.dur;
    const atWheel = this.travel.to === SPOTS.wheel && u >= 1;
    const atNest = this.travel.to === SPOTS.nest && (u >= 1 || this.travel.start === -Infinity);

    // Which way to face: towards the jump while airborne, else the spot's way.
    const dx = this.travel.to.x - this.travel.from.x;
    const faceTarget = inAir && Math.abs(dx) > 4 ? Math.sign(dx) : u <= 0 ? this.travel.from.face : this.travel.to.face;
    this.face = approach(this.face, faceTarget, dt, 0.06);
    if (Math.abs(this.face - faceTarget) < 0.01) this.face = faceTarget;

    // Wheel speed follows the measured RPM, smoothed, and only while the
    // hamster is actually on the wheel. The visual step per frame is capped
    // so the five spokes never alias into a backwards spin at low frame rates.
    const measured = state.snapshot?.measurement?.rpm ?? 0;
    this.rpm = approach(this.rpm, mode === "running" || mode === "waking" ? measured : 0, dt, 0.8);
    const wheelTarget = atWheel && (mode === "running" || mode === "waking") ? this.rpm * 6 : 0;
    this.omega = approach(this.omega, wheelTarget, dt, wheelTarget > this.omega ? 0.45 : 0.9);
    this.angle = (this.angle + Math.min(this.omega, 30 * Math.max(fps, 1)) * dt) % 360;

    // Beans: new work flies from the wheel into the dish.
    const beans = state.beans;
    if (mode === "eating" && beans < this.lastBeans) {
      const bites = this.lastBeans - beans;
      this.mealBites += bites;
      this.belly = Math.min(1, this.belly + bites * 0.1);
    }
    if (beans > this.lastBeans && mode !== "eating") {
      const from = { x: pos.x + 16 * this.face, y: pos.y - 14 };
      const queued = this.flights.length ? this.flights[this.flights.length - 1].start : now - FLIGHT_GAP_MS;
      for (let i = 0; i < beans - this.lastBeans && this.flights.length < 6; i++) {
        this.flights.push({ start: Math.max(now, queued + FLIGHT_GAP_MS * (i + 1)), from });
      }
    }
    this.lastBeans = beans;
    this.flights = this.flights.filter((f) => now - f.start < FLIGHT_MS);
    if (this.flights.length > beans) this.flights.length = Math.max(0, beans);
    if (mode !== "eating") this.belly = Math.max(0, this.belly - dt / 14);

    const pose = neutralPose(pos.x, pos.y, this.face, HAMSTER_SCALE);
    const since = now - state.modeSince;
    let mark: { kind: MarkKind; t: number } = { kind: "none", t: 0 };

    if (inAir) {
      this.hopPose(pose, u);
    } else {
      switch (mode) {
        case "running":
          this.runPose(pose, dt);
          break;
        case "waking":
          if (atWheel) this.runPose(pose, dt);
          else {
            this.wakePose(pose, since);
            if (since > 150 && since < WAKE_HOP_AT) mark = { kind: "exclaim", t: (since - 150) / (WAKE_HOP_AT - 150) };
          }
          break;
        case "sleeping":
        case "loading":
          this.sleepPose(pose, now);
          if (mode === "loading") {
            // Connecting: still curled up, but awake and looking around.
            pose.eye = "open";
            pose.head = 4 + 7 * Math.sin((now / 2800) * TAU);
            pose.ear = -4;
            mark = { kind: "dots", t: (now % 1500) / 1500 };
          }
          break;
        case "eating":
          this.sitPose(pose);
          this.eatPose(pose, state, now);
          break;
        case "offline":
          this.sitPose(pose);
          this.offlinePose(pose, now);
          break;
        case "fault":
          this.sitPose(pose);
          pose.eye = "swirl";
          pose.swirl = (now / 4) % 360;
          pose.tilt += 3 * Math.sin((now / 1600) * TAU);
          pose.head += 4 * Math.sin((now / 900) * TAU);
          break;
        case "stopping":
          this.sitPose(pose);
          break;
      }
    }

    // On the wheel it runs side-on, looking ahead along the wheel rather than
    // at the viewer. It turns its head back once it hops off.
    const running = !inAir && (mode === "running" || (mode === "waking" && atWheel));
    this.profile = approach(this.profile, running ? 1 : 0, dt, 0.08);
    pose.profile = this.profile;

    // Landing squash.
    const sinceLanding = now - this.landedAt;
    if (sinceLanding >= 0 && sinceLanding < 180 && !inAir) {
      const k = 1 - sinceLanding / 180;
      pose.squashY *= 1 - 0.12 * k;
      pose.squashX *= 1 + 0.08 * k;
    }
    pose.bulge = Math.max(pose.bulge, this.belly);

    // Settled-block celebration: a short happy hop, then back to whatever the wheel says.
    let celebration: Frame["celebration"] = null;
    const party = state.celebration;
    if (party && now - party.startedAt < CELEBRATE_MS) {
      const ct = now - party.startedAt;
      if (ct < 1800) pose.eye = "happy";
      if (mode !== "sleeping" && !inAir && ct < 1100) pose.hop -= 13 * Math.abs(Math.sin((Math.PI * ct) / 550));
      const top = toScene(pose, ...ANCHOR.crown);
      celebration = {
        x: clamp(top.x, 40, 260),
        y: Math.max(26, top.y - 16 - 14 * ease(ct / 1200)),
        t: ct / CELEBRATE_MS,
        text: `+${party.blocks.toString()}`,
      };
    }

    // Interaction reactions sit on top of the main state for a moment.
    const sleeping = mode === "sleeping";
    if (now - input.grumpyAt < 1800) {
      pose.eye = "grumpy";
      pose.pouch = Math.max(pose.pouch, 0.8);
      pose.head += 3 * Math.sin((now / 110) * TAU);
      mark = { kind: "steam", t: (now - input.grumpyAt) / 1800 };
    } else if (now - input.patAt < 1400) {
      pose.eye = "happy";
      pose.head += 6;
      mark = { kind: "heart", t: (now - input.patAt) / 1400 };
    } else if (now - input.clickAt < 800) {
      if (now - input.clickAt < 150 && pose.eye === "open") pose.blink = 1;
      if (sleeping) pose.ear -= 14 * Math.sin(Math.PI * clamp((now - input.clickAt) / 300, 0, 1));
      mark = { kind: "note", t: (now - input.clickAt) / 800 };
    } else if (now - input.wakeAt < 1500 && (mode === "sleeping" || mode === "loading")) {
      // A manual wake is a stretch and a look around, then back to rest:
      // it must not pretend the wheel started.
      const since = now - input.wakeAt;
      this.wakePose(pose, since);
      if (since > 780) {
        pose.head += 9 * Math.sin(((since - 780) / 460) * TAU);
        pose.pupilX = 1.2;
      }
      mark = { kind: "exclaim", t: since / 1500 };
    } else if (now - input.treatAt < 1600 && !running && !inAir) {
      // A treat is a small presentation-only snack, not a measured bean.
      const since = now - input.treatAt;
      const u = clamp(since / 1600, 0, 1);
      this.sitPose(pose);
      pose.eye = "happy";
      const arm = lerp(-78, 14, ease(clamp((u - 0.18) / 0.34, 0, 1)));
      pose.legs[1] = arm + 4;
      pose.legs[3] = arm;
      pose.head = 28 + 6 * Math.sin(Math.PI * clamp((u - 0.3) / 0.42, 0, 1));
      pose.holdBean = u > 0.24 && u < 0.68;
      pose.chew = u > 0.42 && u < 0.9 ? Math.abs(Math.sin(since / 55)) : 0;
      pose.pouch = Math.max(pose.pouch, 0.3);
      mark = { kind: "note", t: u };
    }

    // Look at the cursor while it is over the pet.
    if (input.hover && input.cursor && pose.eye === "open") {
      const eye = toScene(pose, ...ANCHOR.eyes);
      const lx = (input.cursor.x - eye.x) * Math.sign(pose.face || 1);
      const ly = input.cursor.y - eye.y;
      const tilt = lx > 0 ? (Math.atan2(ly, lx) * 180) / Math.PI : -ly / 6;
      pose.head += clamp(tilt * 0.35, -9, 9);
      pose.pupilX = clamp(lx / 30, -1.6, 1.6);
      pose.pupilY = clamp(ly / 30, -1.4, 1.4);
    }

    // Idle life: blinking and the odd ear twitch.
    if (now >= this.nextBlink) {
      this.blinkAt = now;
      this.nextBlink = now + 2400 + this.random() * 3600;
    }
    if (pose.eye === "open" && now - this.blinkAt < 140) pose.blink = Math.max(pose.blink, Math.sin((Math.PI * (now - this.blinkAt)) / 140));
    if (now >= this.nextTwitch) {
      this.twitchAt = now;
      this.nextTwitch = now + 6000 + this.random() * 6000;
    }
    if (sleeping && now - this.twitchAt < 260) pose.ear -= 16 * Math.sin((Math.PI * (now - this.twitchAt)) / 260);

    // Zzz only while the pointer rests on a sleeping pet.
    const grumpy = now - input.grumpyAt < 1800;
    this.zzz = approach(this.zzz, sleeping && input.hover && !grumpy ? 1 : 0, dt, 0.15);
    this.nestFront = approach(this.nestFront, atNest && !inAir && (sleeping || mode === "loading") ? 1 : 0, dt, 0.12);

    const markAt = toScene(pose, ...ANCHOR.mark);
    const zzzAt = toScene(pose, ...ANCHOR.zzz);
    const burpAt = toScene(pose, ...ANCHOR.mouth);
    const lines = toScene(pose, ...ANCHOR.rear);
    const holding = pose.holdBean ? 1 : 0;

    return {
      pose,
      wheelAngle: this.angle,
      speedLines: {
        opacity: atWheel && mode === "running" ? clamp((this.rpm - 55) / 30, 0, 1) : 0,
        x: lines.x - 22,
        y: lines.y - 4,
        shift: -((this.gait * 18) % 6),
      },
      pile: clamp(beans - this.flights.length - holding, 0, MAX_PILE),
      overflow: state.extraBeans,
      flights: this.flights.filter((f) => now >= f.start).map((f) => this.flightPosition(f, now, beans)),
      nestFront: this.nestFront,
      zzz: { opacity: this.zzz, x: zzzAt.x, y: zzzAt.y, t: now },
      mark: { ...mark, x: markAt.x, y: markAt.y },
      burp: now - this.burpAt < BURP_MS ? { ...burpAt, t: (now - this.burpAt) / BURP_MS } : null,
      celebration,
    };
  }

  private position(now: number) {
    const t = this.travel;
    const u = clamp((now - t.start) / t.dur, 0, 1);
    const e = ease(u);
    return {
      x: lerp(t.from.x, t.to.x, e),
      y: lerp(t.from.y, t.to.y, e) - t.height * 4 * u * (1 - u),
    };
  }

  private flightPosition(f: Flight, now: number, beans: number) {
    const index = clamp(beans - this.flights.length + this.flights.indexOf(f), 0, MAX_PILE - 1);
    const [sx, sy] = PILE_SLOTS[index];
    const u = clamp((now - f.start) / FLIGHT_MS, 0, 1);
    const e = ease(u);
    return {
      x: lerp(f.from.x, DISH.x + sx, e),
      y: lerp(f.from.y, DISH.y + sy, e) - 30 * 4 * u * (1 - u),
    };
  }

  private runPose(pose: Pose, dt: number) {
    const rpm = this.rpm;
    this.gait += (1.3 + rpm * 0.032) * dt;
    const p = this.gait % 1;
    const amp = rpm < 35 ? 18 : 25;
    const wave = (offset: number) => amp * Math.sin(TAU * (p + offset));
    pose.legs = [wave(0.5), wave(0.25), wave(0), wave(0.75)];
    pose.hop = -2.2 * (0.5 - 0.5 * Math.cos(2 * TAU * p));
    pose.head = 1.5 * Math.sin(TAU * p);
    pose.tail = 7 * Math.sin(TAU * p);
    pose.ear = -2 - 2 * Math.sin(TAU * p - 0.5);
    pose.tilt = 2;
  }

  private hopPose(pose: Pose, u: number) {
    pose.legs = [34, -28, 30, -32];
    pose.tilt = lerp(-14, 12, u);
    pose.ear = -12;
    pose.tail = -10;
  }

  private sleepPose(pose: Pose, now: number) {
    const breath = Math.sin((now / 3200) * TAU);
    pose.lie = LIE;
    pose.tuck = 0.28;
    pose.head = 9;
    pose.ear = -14;
    pose.tail = -12;
    pose.eye = "closed";
    pose.squashY = 1 + 0.028 * breath;
    pose.squashX = 1 - 0.008 * breath;
  }

  private wakePose(pose: Pose, since: number) {
    const rise = ease(since / 300);
    pose.lie = LIE * (1 - rise);
    pose.tuck = lerp(0.28, 1, rise);
    pose.head = 9 * (1 - rise);
    pose.eye = since < 120 ? "closed" : "open";
    const perk = ease((since - 300) / 250);
    pose.ear = lerp(-14, 6, perk);
    pose.earScale = 1 + 0.12 * perk;
    if (since > 550) {
      const shake = Math.sin(((since - 550) / 70) * TAU) * (1 - ease((since - 550) / 350));
      pose.x += 2.2 * shake;
      pose.tilt = 3 * shake;
    }
  }

  private sitPose(pose: Pose) {
    pose.tilt = -42;
    pose.legs = [42, -50, 42, -46];
    pose.head = 28;
    pose.tail = 10;
  }

  private eatPose(pose: Pose, state: PetState, now: number) {
    const u = clamp((now - state.lastBiteAt) / BITE_MS, 0, 1);
    const toMouth = -78;
    const toDish = 14;
    let arm: number;
    if (u < 0.3) arm = toMouth;
    else if (u < 0.55) arm = lerp(toMouth, toDish, ease((u - 0.3) / 0.25));
    else if (u < 0.7) arm = toDish;
    else arm = lerp(toDish, toMouth, ease((u - 0.7) / 0.3));
    pose.legs[1] = arm + 4;
    pose.legs[3] = arm;
    pose.head = 28 + (u > 0.45 && u < 0.75 ? 8 * Math.sin(Math.PI * (u - 0.45) / 0.3) : 0);
    pose.holdBean = state.beans > 0 && u >= 0.6;
    pose.chew = u < 0.35 || state.beans === 0 ? Math.abs(Math.sin(now / 55)) : 0;
    pose.pouch = clamp(0.25 + this.mealBites * 0.08, 0, 1);
  }

  private offlinePose(pose: Pose, now: number) {
    pose.question = true;
    pose.legs[1] = -26;
    pose.legs[3] = 2;
    const cycle = now % 5600;
    const look = cycle < 1300 ? Math.sin((Math.PI * cycle) / 1300) : 0;
    pose.head = 32 - 18 * look;
    pose.pupilY = -1.2 * look;
  }
}
