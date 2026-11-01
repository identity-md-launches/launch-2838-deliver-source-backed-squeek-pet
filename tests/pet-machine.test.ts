import { describe, expect, it } from "vitest";
import {
  BITE_MS,
  CELEBRATE_MS,
  CONNECT_GRACE_MS,
  PetMachine,
  STOP_MS,
  WAKE_MS,
  type Effect,
} from "../src/core/pet-machine";
import { T0, snap, type SnapOptions } from "./helpers";

const toasts = (effects: Effect[]) => effects.flatMap((e) => (e.type === "toast" ? [e.key] : []));
const sounds = (effects: Effect[]) => effects.flatMap((e) => (e.type === "sound" ? [e.name] : []));

/** A machine plus a clock; `feed` delivers a snapshot taken at the current time. */
function rig(first: SnapOptions = { core: "IDLE", work: 1000n }) {
  let now = T0;
  const machine = new PetMachine(now);
  const log: Effect[] = [];
  const feed = (options: SnapOptions) => {
    const effects = machine.dispatch({ type: "snapshot", snapshot: snap({ ...options, at: now }), at: now });
    log.push(...effects);
    return effects;
  };
  const wait = (ms: number) => {
    const effects: Effect[] = [];
    const end = now + ms;
    while (now < end) {
      now = Math.min(end, now + 100);
      effects.push(...machine.dispatch({ type: "tick", at: now }));
    }
    log.push(...effects);
    return effects;
  };
  feed(first);
  return { machine, feed, wait, log, get now() { return now; } };
}

describe("wheel-driven modes", () => {
  it("starts asleep without a toast when the wheel is idle", () => {
    const { machine, log } = rig();
    expect(machine.state.mode).toBe("sleeping");
    expect(log).toEqual([]);
  });

  it("starts running straight away when the wheel is already active", () => {
    const { machine, log } = rig({ core: "ACTIVE", rpm: 70, work: 1000n });
    expect(machine.state.mode).toBe("running");
    expect(toasts(log)).toEqual(["runningNow"]);
  });

  it("wakes up, then runs, when the real wheel starts", () => {
    const r = rig();
    const effects = r.feed({ core: "ACTIVE", rpm: 64, work: 1000n });
    expect(r.machine.state.mode).toBe("waking");
    expect(toasts(effects)).toEqual(["startedRunning"]);
    expect(sounds(effects)).toEqual(["squeek"]);
    r.wait(WAKE_MS);
    expect(r.machine.state.mode).toBe("running");
  });

  it("labels a start that is not from real hardware", () => {
    const r = rig();
    const effects = r.feed({ core: "ACTIVE", rpm: 64, work: 1000n, provenance: "simulated" });
    expect(toasts(effects)).toEqual(["startedRunningLabelled"]);
  });

  it("turns measured work into beans and eats them after the wheel stops", () => {
    const r = rig();
    r.feed({ core: "ACTIVE", rpm: 70, work: 1000n });
    r.wait(WAKE_MS);
    r.feed({ core: "ACTIVE", rpm: 75, work: 1025n });
    expect(r.machine.state.beans).toBe(2);
    expect(r.machine.state.carry).toBe(5n);
    r.feed({ core: "ACTIVE", rpm: 80, work: 1032n });
    expect(r.machine.state.beans).toBe(3);
    expect(r.machine.state.meal).toBe(32n);

    r.feed({ core: "IDLE", rpm: 0, work: 1032n });
    expect(r.machine.state.mode).toBe("stopping");
    r.wait(STOP_MS);
    expect(r.machine.state.mode).toBe("eating");
    const meal = r.wait(BITE_MS * 4);
    expect(sounds(meal).filter((s) => s === "nom")).toHaveLength(3);
    expect(meal).toContainEqual({ type: "toast", key: "meal", values: { n: "32" } });
    expect(r.machine.state.mode).toBe("sleeping");
    expect(r.machine.state.meal).toBe(0n);
    expect(r.machine.state.beans).toBe(0);
    expect(r.machine.state.sessionWork).toBe(32n);
  });

  it("eats a crumb when the run produced less than one bean of work", () => {
    const r = rig();
    r.feed({ core: "ACTIVE", rpm: 30, work: 1000n });
    r.feed({ core: "ACTIVE", rpm: 30, work: 1007n });
    expect(r.machine.state.beans).toBe(0);
    r.feed({ core: "IDLE", rpm: 0, work: 1007n });
    const effects = r.wait(STOP_MS + BITE_MS * 3);
    expect(effects).toContainEqual({ type: "toast", key: "meal", values: { n: "7" } });
  });

  it("caps the visible pile but reports the exact meal", () => {
    const r = rig();
    r.feed({ core: "ACTIVE", rpm: 90, work: 1000n });
    r.feed({ core: "ACTIVE", rpm: 90, work: 1500n });
    expect(r.machine.state.beans).toBe(12);
    expect(r.machine.state.extraBeans).toBe(38);
    r.feed({ core: "IDLE", rpm: 0, work: 1500n });
    r.wait(STOP_MS);
    expect(r.machine.state.extraBeans).toBe(0);
    const effects = r.wait(BITE_MS * 14);
    expect(effects).toContainEqual({ type: "toast", key: "meal", values: { n: "500" } });
  });

  it("goes back to the wheel if it starts again mid-meal", () => {
    const r = rig();
    r.feed({ core: "ACTIVE", rpm: 70, work: 1000n });
    r.feed({ core: "ACTIVE", rpm: 70, work: 1100n });
    r.feed({ core: "IDLE", work: 1100n });
    r.wait(STOP_MS + BITE_MS * 2);
    expect(r.machine.state.mode).toBe("eating");
    const effects = r.feed({ core: "ACTIVE", rpm: 70, work: 1100n });
    expect(r.machine.state.mode).toBe("waking");
    expect(toasts(effects)).toEqual(["startedRunning"]);
  });
});

describe("work ledger safety", () => {
  it("does not count work done before launch", () => {
    const r = rig({ core: "IDLE", work: 999_999n });
    expect(r.machine.state.beans).toBe(0);
    expect(r.machine.state.meal).toBe(0n);
  });

  it("re-baselines on a new counter epoch instead of counting a difference", () => {
    const r = rig();
    r.feed({ core: "ACTIVE", work: 50n, epoch: "new-epoch" });
    expect(r.machine.state.meal).toBe(0n);
    r.feed({ core: "ACTIVE", work: 70n, epoch: "new-epoch" });
    expect(r.machine.state.meal).toBe(20n);
  });

  it("ignores a counter that goes backwards", () => {
    const r = rig();
    r.feed({ core: "IDLE", work: 900n });
    expect(r.machine.state.meal).toBe(0n);
    r.feed({ core: "IDLE", work: 905n });
    expect(r.machine.state.meal).toBe(5n);
  });

  it("resets when the API switches to another installation", () => {
    const r = rig();
    r.feed({ core: "IDLE", work: 5000n, installationId: "another-install" });
    expect(r.machine.state.meal).toBe(0n);
  });
});

describe("offline, stale and fault data", () => {
  it("shows offline for a stale reading and recovers", () => {
    const r = rig();
    const lost = r.feed({ core: "IDLE", work: 1000n, freshness: "stale" });
    expect(r.machine.state.mode).toBe("offline");
    expect(r.machine.state.offlineReason).toBe("stale");
    expect(toasts(lost)).toEqual(["offline"]);
    const back = r.feed({ core: "IDLE", work: 1000n });
    expect(r.machine.state.mode).toBe("sleeping");
    expect(toasts(back)).toEqual(["backOnline"]);
  });

  it("never shows a missing reading as sleep", () => {
    const r = rig();
    r.feed({ measurement: null });
    expect(r.machine.state.mode).toBe("offline");
    expect(r.machine.state.offlineReason).toBe("no_measurement");
  });

  it("shows a counter fault separately", () => {
    const r = rig();
    const effects = r.feed({ core: "COUNTER_FAULT", work: 1000n });
    expect(r.machine.state.mode).toBe("fault");
    expect(toasts(effects)).toEqual(["fault"]);
  });

  it("goes offline once the last reading ages past staleAfterSeconds while requests fail", () => {
    const r = rig();
    r.machine.dispatch({ type: "failure", failure: { kind: "network", message: "down" }, at: r.now + 1000 });
    expect(r.machine.state.mode).toBe("sleeping");
    r.wait(125_000);
    expect(r.machine.state.mode).toBe("offline");
    expect(r.machine.state.offlineReason).toBe("unreachable");
  });

  it("reports unreachable when the first request never succeeds", () => {
    const machine = new PetMachine(T0);
    machine.dispatch({ type: "failure", failure: { kind: "network", message: "down" }, at: T0 + 1000 });
    expect(machine.state.mode).toBe("loading");
    machine.dispatch({ type: "tick", at: T0 + CONNECT_GRACE_MS + 1 });
    expect(machine.state.mode).toBe("offline");
    expect(machine.state.offlineReason).toBe("unreachable");
  });

  it("stays offline with an update notice when the schema changes", () => {
    const r = rig();
    r.machine.dispatch({ type: "failure", failure: { kind: "unsupported_schema", schemaVersion: 2 }, at: r.now });
    r.wait(1000);
    expect(r.machine.state.mode).toBe("offline");
    expect(r.machine.state.offlineReason).toBe("unsupported");
  });

  it("corrects for a wrong local clock using generatedAt", () => {
    const machine = new PetMachine(T0);
    const tenMinutesAhead = T0 + 600_000;
    machine.dispatch({ type: "snapshot", snapshot: snap({ core: "IDLE", work: 1n, at: T0 }), at: tenMinutesAhead });
    expect(machine.state.mode).toBe("sleeping");
  });
});

describe("settled block celebrations", () => {
  it("celebrates new settled blocks once, then clears", () => {
    const r = rig({ core: "IDLE", work: 1000n, height: 4135n });
    const effects = r.feed({ core: "IDLE", work: 1000n, height: 4143n });
    expect(effects).toContainEqual({ type: "toast", key: "blocks", values: { n: "8", height: "4143" } });
    expect(sounds(effects)).toContain("chime");
    expect(r.machine.state.celebration?.blocks).toBe(8n);
    expect(toasts(r.feed({ core: "IDLE", work: 1000n, height: 4143n }))).toEqual([]);
    r.wait(CELEBRATE_MS);
    expect(r.machine.state.celebration).toBeNull();
  });

  it("does not celebrate the starting height or a reset", () => {
    const r = rig({ core: "IDLE", work: 1000n, height: 4135n });
    expect(r.machine.state.celebration).toBeNull();
    expect(toasts(r.feed({ core: "IDLE", work: 1000n, height: 10n }))).toEqual([]);
  });
});
