import type { Language } from "./i18n";

export type Performance = "eco" | "balanced" | "smooth";

export interface Settings {
  language: Language;
  /** Pet size in percent of the 300 x 380 design. */
  scale: number;
  performance: Performance;
  alwaysOnTop: boolean;
  sounds: boolean;
  toasts: boolean;
  demo: boolean;
  unitsPerBean: number;
}

export const DEFAULT_SETTINGS: Settings = {
  language: "en",
  scale: 75,
  performance: "balanced",
  alwaysOnTop: true,
  sounds: false,
  toasts: true,
  demo: false,
  unitsPerBean: 10,
};

export const BEAN_SIZES = [5, 10, 25, 50] as const;

/** Pet size range in percent. Below `hudMin` only the scene shrinks, so the cards stay readable. */
export const SCALE = { min: 40, max: 150, step: 5, hudMin: 80 } as const;

/** Sizes offered in the right-click menu; any other step is set in the settings window. */
export const SCALE_PRESETS = [50, 75, 100, 125, 150] as const;

/** The layout everything is drawn at, in logical pixels. */
export const BASE = { width: 300, height: 380 } as const;

export interface PetLayout {
  /** Window size in logical pixels. */
  width: number;
  height: number;
  /** Scale of the whole layout, cards included. */
  zoom: number;
  /** Extra scale of the scene inside the layout: 1 unless the pet is smaller than `SCALE.hudMin`. */
  stage: number;
}

/** Window size and scales for a pet size in percent. */
export function petLayout(scale: number): PetLayout {
  const size = clampScale(scale) / 100;
  const zoom = Math.max(size, SCALE.hudMin / 100);
  return { width: Math.round(BASE.width * zoom), height: Math.round(BASE.height * zoom), zoom, stage: size / zoom };
}

/** Snaps a size to the slider's steps and range; anything that isn't a number gets the fallback. */
export function clampScale(value: unknown, fallback: number = DEFAULT_SETTINGS.scale): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(SCALE.max, Math.max(SCALE.min, Math.round(value / SCALE.step) * SCALE.step));
}

/** Animation frame cap and status poll interval for each performance mode. */
export const PERFORMANCE: Record<Performance, { fps: number; pollMs: number }> = {
  eco: { fps: 15, pollMs: 10_000 },
  balanced: { fps: 30, pollMs: 3_000 },
  smooth: { fps: 60, pollMs: 2_000 },
};

export const STORAGE_KEY = "squeek-pet:settings:v1";

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
const bool = (value: unknown, fallback: boolean) => (typeof value === "boolean" ? value : fallback);

/**
 * Accepts only known values, so a corrupted or older entry falls back to defaults field by field.
 * The old small / medium / large `size` field is dropped: everyone starts again at the default size.
 */
export function sanitize(raw: unknown, defaults: Settings = DEFAULT_SETTINGS): Settings {
  const r = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const d = defaults;
  return {
    language: pick(r.language, ["en", "zh"], d.language),
    scale: clampScale(r.scale, d.scale),
    performance: pick(r.performance, ["eco", "balanced", "smooth"], d.performance),
    alwaysOnTop: bool(r.alwaysOnTop, d.alwaysOnTop),
    sounds: bool(r.sounds, d.sounds),
    toasts: bool(r.toasts, d.toasts),
    demo: bool(r.demo, d.demo),
    unitsPerBean: (BEAN_SIZES as readonly number[]).includes(r.unitsPerBean as number) ? (r.unitsPerBean as number) : d.unitsPerBean,
  };
}

/** First-run language follows the system: Chinese systems get Chinese. */
export function systemLanguage(): Language {
  const language = typeof navigator === "undefined" ? "" : (navigator.language ?? "");
  return language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

export function loadSettings(storage: Pick<Storage, "getItem"> | null = safeStorage()): Settings {
  const defaults = { ...DEFAULT_SETTINGS, language: systemLanguage() };
  try {
    const text = storage?.getItem(STORAGE_KEY);
    return sanitize(text ? JSON.parse(text) : null, defaults);
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Settings, storage: Pick<Storage, "setItem"> | null = safeStorage()) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be unavailable; the pet still works with in-memory settings.
  }
}

function safeStorage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}
