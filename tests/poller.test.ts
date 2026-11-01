import { describe, expect, it } from "vitest";
import { MAX_BACKOFF_MS, createPoller, nextDelay } from "../src/core/poller";
import type { StatusClient } from "../src/core/api";
import type { FetchOutcome } from "../src/core/types";
import { snap } from "./helpers";

const ok: FetchOutcome = { ok: true, snapshot: snap(), changed: true };
const network: FetchOutcome = { ok: false, failure: { kind: "network", message: "offline" } };

describe("nextDelay", () => {
  it("uses the interval after success", () => {
    expect(nextDelay(ok, 3000, 0)).toBe(3000);
  });

  it("backs off exponentially on network errors, up to a cap", () => {
    expect(nextDelay(network, 3000, 0)).toBe(3000);
    expect(nextDelay(network, 3000, 1)).toBe(6000);
    expect(nextDelay(network, 3000, 3)).toBe(24000);
    expect(nextDelay(network, 3000, 20)).toBe(MAX_BACKOFF_MS);
  });

  it("waits at least Retry-After when rate limited", () => {
    expect(nextDelay({ ok: false, failure: { kind: "rate_limited", retryAfterMs: 9000 } }, 3000, 0)).toBe(9000);
    expect(nextDelay({ ok: false, failure: { kind: "rate_limited", retryAfterMs: 500 } }, 3000, 0)).toBe(3000);
  });
});

describe("createPoller", () => {
  it("polls, reports and reschedules until stopped", async () => {
    const outcomes = [ok, network, ok];
    const client = { fetchStatus: async () => outcomes.shift() ?? ok, last: null } as unknown as StatusClient;
    const timers: { fn: () => void; ms: number }[] = [];
    const results: FetchOutcome[] = [];
    const poller = createPoller({
      client,
      intervalMs: () => 3000,
      onResult: (outcome) => results.push(outcome),
      setTimer: (fn, ms) => timers.push({ fn, ms }),
      clearTimer: () => undefined,
    });
    poller.start();
    await Promise.resolve();
    await Promise.resolve();
    expect(results).toHaveLength(1);
    expect(timers.at(-1)!.ms).toBe(3000);
    timers.at(-1)!.fn();
    await Promise.resolve();
    await Promise.resolve();
    expect(results[1]).toBe(network);
    expect(timers.at(-1)!.ms).toBe(3000);
    poller.stop();
    timers.at(-1)!.fn();
    await Promise.resolve();
    expect(results).toHaveLength(2);
  });
});
