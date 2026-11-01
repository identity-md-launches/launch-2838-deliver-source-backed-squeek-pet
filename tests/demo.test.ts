import { describe, expect, it } from "vitest";
import { DEMO_LOOP_MS, demoRpm, demoSnapshot } from "../src/core/demo";
import { PetMachine, type Effect, type Mode } from "../src/core/pet-machine";

describe("demo loop", () => {
  const start = Date.parse("2026-10-30T00:00:00Z");

  it("is always labelled as demo, simulated data", () => {
    for (let ms = 0; ms < DEMO_LOOP_MS; ms += 5000) {
      const s = demoSnapshot(start, start + ms);
      expect(s.source).toBe("demo");
      expect(s.measurement!.provenance).toBe("simulated");
    }
  });

  it("only moves forward: work and settled height never decrease", () => {
    let lastWork = -1n;
    let lastHeight = -1n;
    for (let ms = 0; ms < DEMO_LOOP_MS * 3; ms += 1000) {
      const s = demoSnapshot(start, start + ms);
      expect(s.measurement!.cumulativeWorkUnits >= lastWork).toBe(true);
      expect(s.settlement!.blockHeight >= lastHeight).toBe(true);
      lastWork = s.measurement!.cumulativeWorkUnits;
      lastHeight = s.settlement!.blockHeight;
    }
  });

  it("has an active stretch with realistic RPM", () => {
    const rpms = Array.from({ length: 60 }, (_, s) => demoRpm(s * 1000));
    expect(Math.max(...rpms)).toBeLessThan(110);
    expect(rpms.filter((r) => r > 0).length).toBeGreaterThan(15);
  });

  it("walks the pet through every main state in one loop", () => {
    const machine = new PetMachine(start);
    const modes: Mode[] = [];
    const effects: Effect[] = [];
    for (let ms = 0; ms <= DEMO_LOOP_MS; ms += 250) {
      const now = start + ms;
      if (ms % 1000 === 0) effects.push(...machine.dispatch({ type: "snapshot", snapshot: demoSnapshot(start, now), at: now }));
      else effects.push(...machine.dispatch({ type: "tick", at: now }));
      if (modes.at(-1) !== machine.state.mode) modes.push(machine.state.mode);
    }
    expect(modes).toEqual(["sleeping", "waking", "running", "stopping", "eating", "sleeping", "offline", "sleeping"]);
    const keys = effects.flatMap((e) => (e.type === "toast" ? [e.key] : []));
    expect(keys).toEqual(["startedRunningLabelled", "meal", "blocks", "offline", "backOnline"]);
  });
});
