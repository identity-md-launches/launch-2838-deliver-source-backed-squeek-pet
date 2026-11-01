import "./styles/scene.css";
import "./styles/preview.css";
import { SceneView } from "./art/rig";
import { PetMachine } from "./core/pet-machine";
import { Director, idleInput, type PointerInput } from "./pet/director";
import type { CoreStatus, StatusSnapshot } from "./core/types";

// A gallery of scripted moments for checking the artwork. Each tile replays
// its script through the real PetMachine and Director, frame by frame.

interface Reading {
  core?: CoreStatus;
  rpm?: number;
  work?: bigint;
  height?: bigint;
  stale?: boolean;
  none?: boolean;
}

interface Scenario {
  title: string;
  at: number;
  reading: (t: number) => Reading | null;
  input?: (t: number) => Partial<PointerInput>;
}

const T0 = Date.parse("2026-10-30T12:00:00Z");

function snapshot(now: number, r: Reading): StatusSnapshot {
  const rpm = r.rpm ?? 0;
  return {
    installationId: "preview",
    revision: String(now),
    generatedAt: now,
    source: "api",
    measurement: r.none
      ? null
      : {
          freshness: r.stale ? "stale" : "online",
          observedAt: now - 400,
          receivedAt: r.stale ? now - 200_000 : now - 300,
          staleAfterSeconds: 120,
          counterEpoch: "preview",
          cumulativeWorkUnits: r.work ?? 1000n,
          provenance: "hardware",
          coreStatus: r.core ?? "IDLE",
          rpm,
          speedMmPerSecond: Math.round(rpm * 14.6),
          distanceMm: 3_455_808,
        },
    settlement: { blockHeight: r.height ?? 4135n, settledThroughRound: 500n, confirmedAt: now, transactionHash: null },
  };
}

/** Work that grows at `perSecond` from `from` ms on. */
const work = (t: number, perSecond: number, from = 0) => 1000n + BigInt(Math.max(0, Math.floor(((t - from) / 1000) * perSecond)));

const scenarios: Scenario[] = [
  { title: "Sleeping · hover shows Zzz", at: 3000, reading: () => ({}), input: () => ({ hover: true }) },
  { title: "Waking up", at: 1700, reading: (t) => (t < 1000 ? {} : { core: "ACTIVE", rpm: 64 }) },
  { title: "Hopping onto the wheel", at: 2250, reading: (t) => (t < 1000 ? {} : { core: "ACTIVE", rpm: 64 }) },
  { title: "Running · 38 RPM", at: 4000, reading: (t) => ({ core: "ACTIVE", rpm: 38, work: work(t, 3) }) },
  { title: "Running fast · 92 RPM", at: 4550, reading: (t) => ({ core: "ACTIVE", rpm: 92, work: work(t, 14) }) },
  {
    title: "Eating data beans",
    at: 5180,
    reading: (t) => (t < 3000 ? { core: "ACTIVE", rpm: 70, work: work(t, 30) } : { work: work(3000, 30) }),
  },
  {
    title: "Chewing",
    at: 5470,
    reading: (t) => (t < 3000 ? { core: "ACTIVE", rpm: 70, work: work(t, 30) } : { work: work(3000, 30) }),
  },
  {
    title: "Burp after the meal",
    at: 3000 + 800 + 450 * 4 + 200,
    reading: (t) => (t < 3000 ? { core: "ACTIVE", rpm: 60, work: work(t, 12, 1000) } : { work: work(3000, 12, 1000) }),
  },
  { title: "Offline · waiting for data", at: 3200, reading: (t) => (t < 1000 ? {} : { stale: true }) },
  { title: "Sensor fault", at: 2600, reading: () => ({ core: "COUNTER_FAULT" }) },
  {
    title: "Settled block celebration",
    at: 2500,
    reading: (t) => ({ core: "ACTIVE", rpm: 70, height: t < 2000 ? 4135n : 4143n }),
  },
  { title: "Head pat", at: 2350, reading: () => ({ core: "ACTIVE", rpm: 46 }), input: () => ({ hover: true, patAt: T0 + 2000 }) },
  { title: "Too many clicks", at: 2500, reading: () => ({}), input: () => ({ hover: true, grumpyAt: T0 + 2000 }) },
  { title: "Connecting", at: 1500, reading: () => null },
  {
    title: "Big run · pile overflow",
    at: 4200,
    reading: (t) => ({ core: "ACTIVE", rpm: 80, work: t < 1000 ? 1000n : 1600n }),
  },
  {
    title: "Eyes follow the cursor",
    at: 3000,
    reading: () => ({ core: "ACTIVE", rpm: 44 }),
    input: () => ({ hover: true, cursor: { x: 190, y: 40 } }),
  },
];

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Tile {
  scenario: Scenario;
  machine: PetMachine;
  director: Director;
  view: SceneView;
  label: HTMLElement;
  t: number;
  nextPoll: number;
}

function makeTile(scenario: Scenario, grid: HTMLElement): Tile {
  const card = document.createElement("figure");
  const stage = document.createElement("div");
  stage.className = "stage";
  const caption = document.createElement("figcaption");
  const title = document.createElement("strong");
  title.textContent = scenario.title;
  const label = document.createElement("span");
  caption.append(title, label);
  card.append(stage, caption);
  grid.appendChild(card);
  const tile: Tile = {
    scenario,
    machine: new PetMachine(T0),
    director: new Director(T0, seeded(7)),
    view: new SceneView(stage),
    label,
    t: 0,
    nextPoll: 0,
  };
  return tile;
}

function step(tile: Tile, until: number) {
  const { scenario, machine, director } = tile;
  // The last few frames are applied in order, so effects that depend on
  // movement between frames, such as the wheel's motion blur, show up.
  const recent = [];
  while (tile.t <= until) {
    const now = T0 + tile.t;
    if (tile.t >= tile.nextPoll) {
      const reading = scenario.reading(tile.t);
      if (reading) machine.dispatch({ type: "snapshot", snapshot: snapshot(now, reading), at: now });
      else machine.dispatch({ type: "failure", failure: { kind: "network", message: "preview" }, at: now });
      tile.nextPoll += 1000;
    } else {
      machine.dispatch({ type: "tick", at: now });
    }
    recent.push(director.frame(machine.state, now, { ...idleInput(), ...scenario.input?.(tile.t) }, 30));
    if (recent.length > 8) recent.shift();
    tile.t += 1000 / 30;
  }
  for (const frame of recent) tile.view.apply(frame);
  tile.label.textContent = `${machine.state.mode} · ${(tile.t / 1000).toFixed(1)}s`;
}

const grid = document.getElementById("grid")!;
const tiles = scenarios.map((s) => makeTile(s, grid));
for (const tile of tiles) step(tile, tile.scenario.at);
document.body.dataset.ready = "true";

document.getElementById("dark")!.addEventListener("change", (e) => {
  document.body.classList.toggle("dark", (e.target as HTMLInputElement).checked);
});

let playing = false;
document.getElementById("play")!.addEventListener("change", (e) => {
  playing = (e.target as HTMLInputElement).checked;
  if (playing) requestAnimationFrame(loop);
});

function loop() {
  if (!playing) return;
  for (const tile of tiles) step(tile, tile.t + 1000 / 30);
  requestAnimationFrame(loop);
}
