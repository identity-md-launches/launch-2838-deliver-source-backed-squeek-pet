import { describe, expect, it } from "vitest";
import { LIE } from "../src/art/hamster";
import { PetMachine } from "../src/core/pet-machine";
import type { CoreStatus } from "../src/core/types";
import { Director, idleInput } from "../src/pet/director";
import { snap, T0 } from "./helpers";

// Presentation only, but it is the intended look: on the wheel the
// hamster runs side-on, looking ahead along the wheel, not at the viewer.
describe("director", () => {
  function play(core: (t: number) => CoreStatus, until: number) {
    const machine = new PetMachine(T0);
    const director = new Director(T0, () => 0.5);
    const frames: { t: number; mode: string; profile: number }[] = [];
    let poll = 0;
    for (let t = 0; t <= until; t += 1000 / 30) {
      const now = T0 + t;
      if (t >= poll) {
        const status = core(t);
        machine.dispatch({ type: "snapshot", snapshot: snap({ at: now, core: status, rpm: status === "ACTIVE" ? 60 : 0, work: 1000n }), at: now });
        poll += 1000;
      } else {
        machine.dispatch({ type: "tick", at: now });
      }
      const frame = director.frame(machine.state, now, idleInput(), 30);
      frames.push({ t, mode: machine.state.mode, profile: frame.pose.profile });
    }
    return (ms: number) => frames.reduce((best, f) => (Math.abs(f.t - ms) < Math.abs(best.t - ms) ? f : best));
  }

  it("runs in profile on the wheel and turns back to the viewer off it", () => {
    const at = play((t) => (t < 6000 ? "ACTIVE" : "IDLE"), 11_000);
    expect(at(0).profile).toBe(0);
    expect(at(5500).mode).toBe("running");
    expect(at(5500).profile).toBeGreaterThan(0.99);
    expect(at(11_000).mode).not.toBe("running");
    expect(at(11_000).profile).toBeLessThan(0.01);
  });

  it("keeps facing the viewer while asleep", () => {
    const at = play(() => "IDLE", 4000);
    expect(at(4000).mode).toBe("sleeping");
    expect(at(4000).profile).toBe(0);
  });

  function asleep() {
    const machine = new PetMachine(T0);
    machine.dispatch({ type: "snapshot", snapshot: snap({ at: T0, core: "IDLE", work: 1000n }), at: T0 });
    return machine;
  }

  it("stretches on a manual wake without claiming the wheel moved", () => {
    const machine = asleep();
    const director = new Director(T0, () => 0.5);
    const frame = director.frame(machine.state, T0 + 320, { ...idleInput(), wakeAt: T0 }, 30);
    expect(machine.state.mode).toBe("sleeping");
    expect(frame.pose.eye).toBe("open");
    expect(frame.pose.lie).toBeLessThan(LIE);
  });

  it("eats a dock treat without adding a data bean", () => {
    const machine = asleep();
    const director = new Director(T0, () => 0.5);
    const frame = director.frame(machine.state, T0 + 720, { ...idleInput(), treatAt: T0 }, 30);
    expect(machine.state.beans).toBe(0);
    expect(machine.state.mode).toBe("sleeping");
    expect(frame.pose.holdBean).toBe(true);
    expect(frame.pose.chew).toBeGreaterThan(0);
  });
});
