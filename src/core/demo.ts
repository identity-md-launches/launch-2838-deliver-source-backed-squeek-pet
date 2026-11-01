import type { StatusSnapshot } from "./types";

// A scripted, clearly labelled demo loop for trying the animations when the
// real hamster is resting. Demo snapshots carry source "demo" and provenance
// "simulated" so the UI never presents them as live hardware readings.

export const DEMO_LOOP_MS = 60_000;
export const DEMO_INSTALLATION = "squeek-pet-demo";
const BASE_WORK = 40_000n;
const BASE_HEIGHT = 4_000n;
const BLOCKS_PER_LOOP = 8n;

/** Demo wheel speed (RPM) at a point in the loop. */
export function demoRpm(loopMs: number): number {
  const t = loopMs / 1000;
  if (t < 8 || t >= 30) return 0;
  if (t < 11) return Math.round(((t - 8) / 3) * 62);
  return Math.round(74 + 14 * Math.sin((t - 11) / 2.2) + 6 * Math.sin((t - 11) / 0.9));
}

/** Work units produced in the loop up to loopMs (integral of rpm / 18 per second, sampled each second). */
export function demoWorkInLoop(loopMs: number): bigint {
  let work = 0;
  const end = Math.floor(loopMs / 1000);
  for (let s = 0; s < end; s++) work += demoRpm(s * 1000) / 18;
  return BigInt(Math.floor(work));
}

const WORK_PER_LOOP = demoWorkInLoop(DEMO_LOOP_MS);

export function demoSnapshot(startedAt: number, now: number): StatusSnapshot {
  const elapsed = Math.max(0, now - startedAt);
  const loops = BigInt(Math.floor(elapsed / DEMO_LOOP_MS));
  const loopMs = elapsed % DEMO_LOOP_MS;
  const t = loopMs / 1000;
  const rpm = demoRpm(loopMs);
  const offline = t >= 46 && t < 53;
  const settledLoops = loops * BLOCKS_PER_LOOP + (t >= 40 ? BLOCKS_PER_LOOP : 0n);
  return {
    installationId: DEMO_INSTALLATION,
    revision: `demo-${Math.floor(elapsed / 1000)}`,
    generatedAt: now,
    source: "demo",
    measurement: {
      freshness: offline ? "stale" : "online",
      observedAt: offline ? now - 121_500 : now,
      receivedAt: offline ? now - 121_000 : now,
      staleAfterSeconds: 120,
      counterEpoch: "demo-epoch",
      cumulativeWorkUnits: BASE_WORK + loops * WORK_PER_LOOP + demoWorkInLoop(loopMs),
      provenance: "simulated",
      coreStatus: rpm > 0 ? "ACTIVE" : "IDLE",
      rpm,
      speedMmPerSecond: Math.round(rpm * 14.6),
      distanceMm: Math.round(Number(loops * WORK_PER_LOOP + demoWorkInLoop(loopMs)) * 1300),
    },
    settlement: {
      blockHeight: BASE_HEIGHT + settledLoops,
      settledThroughRound: 500n + loops,
      confirmedAt: now,
      transactionHash: null,
    },
  };
}
