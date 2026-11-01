import type { StatusClient } from "./api";
import type { FetchOutcome } from "./types";

export interface PollerOptions {
  client: StatusClient;
  intervalMs: () => number;
  onResult: (outcome: FetchOutcome, at: number) => void;
  now?: () => number;
  setTimer?: (fn: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
}

export const MAX_BACKOFF_MS = 60_000;

/** Delay before the next poll: the normal interval, Retry-After, or exponential backoff. */
export function nextDelay(outcome: FetchOutcome, interval: number, failures: number): number {
  if (outcome.ok) return interval;
  const failure = outcome.failure;
  const backoff = Math.min(MAX_BACKOFF_MS, interval * 2 ** Math.min(failures, 6));
  switch (failure.kind) {
    case "rate_limited":
      return Math.max(interval, failure.retryAfterMs);
    case "http":
      return Math.max(interval, failure.retryAfterMs ?? backoff);
    case "unsupported_schema":
      return MAX_BACKOFF_MS;
    default:
      return backoff;
  }
}

export function createPoller(options: PollerOptions) {
  const now = options.now ?? (() => Date.now());
  const setTimer = options.setTimer ?? ((fn: () => void, ms: number) => setTimeout(fn, ms));
  const clearTimer = options.clearTimer ?? ((handle: unknown) => clearTimeout(handle as ReturnType<typeof setTimeout>));
  let timer: unknown = null;
  let running = false;
  let inFlight = false;
  let failures = 0;

  async function poll() {
    if (!running || inFlight) return;
    inFlight = true;
    timer = null;
    const outcome = await options.client.fetchStatus(now());
    inFlight = false;
    if (!running) return;
    failures = outcome.ok ? 0 : failures + 1;
    options.onResult(outcome, now());
    schedule(nextDelay(outcome, options.intervalMs(), failures - 1));
  }

  function schedule(ms: number) {
    if (timer !== null) clearTimer(timer);
    timer = setTimer(() => void poll(), ms);
  }

  return {
    start() {
      if (running) return;
      running = true;
      void poll();
    },
    stop() {
      running = false;
      if (timer !== null) clearTimer(timer);
      timer = null;
    },
    /** Poll as soon as possible, e.g. after the interval setting changed. */
    pollSoon() {
      if (running && !inFlight) schedule(0);
    },
    get running() {
      return running;
    },
  };
}
