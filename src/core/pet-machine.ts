import { isStale } from "./telemetry";
import type { FetchFailure, StatusSnapshot } from "./types";

// The pet's behaviour, driven only by validated wheel data. The real wheel
// decides the pet's main state; clicks and hovers are handled by the view and
// never feed back into this machine.

export type Mode = "loading" | "sleeping" | "waking" | "running" | "stopping" | "eating" | "offline" | "fault";
export type OfflineReason = "no_measurement" | "stale" | "unreachable" | "unsupported";
export type ToastKey =
  | "runningNow"
  | "startedRunning"
  | "startedRunningLabelled"
  | "meal"
  | "blocks"
  | "offline"
  | "backOnline"
  | "fault";

export type Effect =
  | { type: "toast"; key: ToastKey; values?: Record<string, string> }
  | { type: "sound"; name: "squeek" | "nom" | "chime" };

export type PetEvent =
  | { type: "snapshot"; snapshot: StatusSnapshot; at: number }
  | { type: "failure"; failure: FetchFailure; at: number }
  | { type: "tick"; at: number };

export interface Celebration {
  blocks: bigint;
  height: bigint;
  transactionHash: string | null;
  startedAt: number;
}

export interface PetState {
  mode: Mode;
  modeSince: number;
  offlineReason: OfflineReason | null;
  startedAt: number;
  snapshot: StatusSnapshot | null;
  /** Server clock minus local clock, estimated from generatedAt. */
  clockOffsetMs: number;
  lastSuccessAt: number | null;
  lastFailureAt: number | null;
  installationId: string | null;
  // Work ledger: measured work units since launch, turned into "data beans".
  epoch: string | null;
  baseline: bigint | null;
  carry: bigint;
  meal: bigint;
  /** Measured work counted since the pet started, across meals. */
  sessionWork: bigint;
  beans: number;
  extraBeans: number;
  lastBiteAt: number;
  lastMeal: bigint;
  // Settled Squeek Blocks (builder.anchor), used for celebrations.
  settledHeight: bigint | null;
  celebration: Celebration | null;
}

export interface MachineConfig {
  unitsPerBean: bigint;
  maxPile: number;
}

export const WAKE_MS = 1500;
export const STOP_MS = 800;
export const BITE_MS = 450;
export const CELEBRATE_MS = 4200;
export const CONNECT_GRACE_MS = 15_000;
export const DEFAULT_CONFIG: MachineConfig = { unitsPerBean: 10n, maxPile: 12 };

type DataState =
  | { kind: "offline"; reason: OfflineReason }
  | { kind: "fault" }
  | { kind: "active" }
  | { kind: "idle" };

export function initialState(now: number): PetState {
  return {
    mode: "loading",
    modeSince: now,
    offlineReason: null,
    startedAt: now,
    snapshot: null,
    clockOffsetMs: 0,
    lastSuccessAt: null,
    lastFailureAt: null,
    installationId: null,
    epoch: null,
    baseline: null,
    carry: 0n,
    meal: 0n,
    sessionWork: 0n,
    beans: 0,
    extraBeans: 0,
    lastBiteAt: now,
    lastMeal: 0n,
    settledHeight: null,
    celebration: null,
  };
}

export class PetMachine {
  readonly state: PetState;
  private config: MachineConfig;

  constructor(now: number, config: MachineConfig = DEFAULT_CONFIG) {
    this.state = initialState(now);
    this.config = { ...config };
  }

  setConfig(config: Partial<MachineConfig>) {
    this.config = { ...this.config, ...config };
  }

  dispatch(event: PetEvent): Effect[] {
    const effects: Effect[] = [];
    const s = this.state;
    switch (event.type) {
      case "snapshot": {
        const snap = event.snapshot;
        if (s.installationId !== null && s.installationId !== snap.installationId) this.resetLedgers();
        s.installationId = snap.installationId;
        s.clockOffsetMs = snap.generatedAt - event.at;
        s.snapshot = snap;
        s.lastSuccessAt = event.at;
        this.updateLedger(snap);
        this.updateSettlement(snap, event.at, effects);
        this.applyData(this.dataState(event.at), event.at, effects);
        break;
      }
      case "failure": {
        s.lastFailureAt = event.at;
        if (event.failure.kind === "unsupported_schema") {
          this.goOffline("unsupported", event.at, effects);
          break;
        }
        this.applyData(this.dataState(event.at), event.at, effects);
        break;
      }
      case "tick":
        this.applyData(this.dataState(event.at), event.at, effects);
        break;
    }
    this.advance(event.at, effects);
    return effects;
  }

  /** Data state as of `now`, using the last valid snapshot. */
  private dataState(now: number): DataState | null {
    const s = this.state;
    if (!s.snapshot) {
      return now - s.startedAt > CONNECT_GRACE_MS ? { kind: "offline", reason: "unreachable" } : null;
    }
    const m = s.snapshot.measurement;
    if (!m) return { kind: "offline", reason: "no_measurement" };
    const serverNow = now + s.clockOffsetMs;
    if (isStale(m, serverNow)) {
      const failing = s.lastFailureAt !== null && (s.lastSuccessAt === null || s.lastFailureAt > s.lastSuccessAt);
      return { kind: "offline", reason: failing ? "unreachable" : "stale" };
    }
    if (m.coreStatus === "COUNTER_FAULT") return { kind: "fault" };
    return m.coreStatus === "ACTIVE" ? { kind: "active" } : { kind: "idle" };
  }

  private enter(mode: Mode, now: number) {
    if (this.state.mode === mode) return;
    this.state.mode = mode;
    this.state.modeSince = now;
    if (mode === "eating") {
      // The visible pile is what gets eaten; the meal total still counts every unit.
      this.state.lastBiteAt = now;
      this.state.extraBeans = 0;
    }
    if (mode !== "offline") this.state.offlineReason = null;
  }

  private goOffline(reason: OfflineReason, now: number, effects: Effect[]) {
    const s = this.state;
    if (s.mode !== "offline" && s.mode !== "loading") effects.push({ type: "toast", key: "offline" });
    this.enter("offline", now);
    s.offlineReason = reason;
  }

  private applyData(data: DataState | null, now: number, effects: Effect[]) {
    const s = this.state;
    if (data === null) return;
    if (s.offlineReason === "unsupported" && s.mode === "offline") return;
    switch (data.kind) {
      case "offline":
        this.goOffline(data.reason, now, effects);
        return;
      case "fault":
        if (s.mode !== "fault") effects.push({ type: "toast", key: "fault" });
        this.enter("fault", now);
        return;
      case "active":
        switch (s.mode) {
          case "loading":
            effects.push({ type: "toast", key: "runningNow" });
            this.enter("running", now);
            return;
          case "offline":
          case "fault":
            effects.push({ type: "toast", key: "backOnline" });
            this.enter("running", now);
            return;
          case "sleeping":
          case "eating": {
            const labelled = this.isLabelled();
            effects.push({ type: "toast", key: labelled ? "startedRunningLabelled" : "startedRunning" });
            effects.push({ type: "sound", name: "squeek" });
            this.enter("waking", now);
            return;
          }
          case "stopping":
            this.enter("running", now);
            return;
          default:
            return;
        }
      case "idle":
        switch (s.mode) {
          case "loading":
            this.enter(s.beans > 0 ? "eating" : "sleeping", now);
            return;
          case "offline":
          case "fault":
            effects.push({ type: "toast", key: "backOnline" });
            this.enter(s.beans > 0 ? "eating" : "sleeping", now);
            return;
          case "running":
          case "waking":
            this.enter("stopping", now);
            return;
          case "sleeping":
            if (s.beans > 0) this.enter("eating", now);
            return;
          default:
            return;
        }
    }
  }

  /** Timed steps: finishing the wake-up, hopping off the wheel, eating beans. */
  private advance(now: number, effects: Effect[]) {
    const s = this.state;
    if (s.mode === "waking" && now - s.modeSince >= WAKE_MS) this.enter("running", now);
    if (s.mode === "stopping" && now - s.modeSince >= STOP_MS) {
      if (s.beans === 0 && s.meal > 0n) s.beans = 1; // a small crumb so every meal is eaten
      s.extraBeans = 0;
      this.enter(s.beans > 0 ? "eating" : "sleeping", now);
    }
    if (s.mode === "eating") {
      while (s.beans > 0 && now - s.lastBiteAt >= BITE_MS) {
        s.beans -= 1;
        s.lastBiteAt += BITE_MS;
        effects.push({ type: "sound", name: "nom" });
      }
      if (s.beans === 0 && now - s.lastBiteAt >= BITE_MS) {
        if (s.meal > 0n) effects.push({ type: "toast", key: "meal", values: { n: s.meal.toString() } });
        s.lastMeal = s.meal;
        s.meal = 0n;
        s.carry = 0n;
        this.enter("sleeping", now);
      }
    }
    if (s.celebration && now - s.celebration.startedAt >= CELEBRATE_MS) s.celebration = null;
  }

  private isLabelled(): boolean {
    const snap = this.state.snapshot;
    return snap?.source === "demo" || (snap?.measurement?.provenance ?? "hardware") !== "hardware";
  }

  private resetLedgers() {
    const s = this.state;
    s.epoch = null;
    s.baseline = null;
    s.carry = 0n;
    s.meal = 0n;
    s.sessionWork = 0n;
    s.beans = 0;
    s.extraBeans = 0;
    s.settledHeight = null;
    s.celebration = null;
  }

  /**
   * New measured work becomes beans. A new counter epoch or a counter that
   * goes backwards only re-baselines: work from different epochs is never
   * subtracted or counted twice. Work done before launch is not counted.
   */
  private updateLedger(snap: StatusSnapshot) {
    const s = this.state;
    const m = snap.measurement;
    if (!m) return;
    if (s.baseline === null || s.epoch !== m.counterEpoch) {
      s.epoch = m.counterEpoch;
      s.baseline = m.cumulativeWorkUnits;
      return;
    }
    const delta = m.cumulativeWorkUnits - s.baseline;
    s.baseline = m.cumulativeWorkUnits;
    if (delta <= 0n) return;
    s.meal += delta;
    s.sessionWork += delta;
    const total = s.carry + delta;
    const fresh = total / this.config.unitsPerBean;
    s.carry = total % this.config.unitsPerBean;
    const freshBeans = fresh > 1_000_000n ? 1_000_000 : Number(fresh);
    const room = Math.max(0, this.config.maxPile - s.beans);
    const shown = Math.min(room, freshBeans);
    s.beans += shown;
    s.extraBeans += freshBeans - shown;
  }

  /** Celebrate only settled Squeek Blocks (builder.anchor), never projections. */
  private updateSettlement(snap: StatusSnapshot, now: number, effects: Effect[]) {
    const s = this.state;
    const settled = snap.settlement;
    if (!settled) return;
    if (s.settledHeight === null || settled.blockHeight < s.settledHeight) {
      s.settledHeight = settled.blockHeight;
      return;
    }
    if (settled.blockHeight > s.settledHeight) {
      const blocks = settled.blockHeight - s.settledHeight;
      s.settledHeight = settled.blockHeight;
      s.celebration = { blocks, height: settled.blockHeight, transactionHash: settled.transactionHash, startedAt: now };
      effects.push({ type: "toast", key: "blocks", values: { n: blocks.toString(), height: settled.blockHeight.toString() } });
      effects.push({ type: "sound", name: "chime" });
    }
  }
}
