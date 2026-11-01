import { describe, expect, it } from "vitest";
import { formatAgo, formatDistance, formatInteger, formatSpeed } from "../src/core/format";
import { t } from "../src/core/i18n";
import { DEFAULT_SETTINGS, SCALE, STORAGE_KEY, loadSettings, petLayout, sanitize, saveSettings } from "../src/core/settings";

describe("settings", () => {
  it("falls back field by field for unknown values", () => {
    expect(sanitize({ language: "fr", scale: "big", sounds: true, unitsPerBean: 7 })).toEqual({ ...DEFAULT_SETTINGS, sounds: true });
    expect(sanitize(null)).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps the pet size on the slider's steps and inside its range", () => {
    expect(sanitize({ scale: 77 }).scale).toBe(75);
    expect(sanitize({ scale: 12 }).scale).toBe(SCALE.min);
    expect(sanitize({ scale: 400 }).scale).toBe(SCALE.max);
    expect(sanitize({ scale: Number.NaN }).scale).toBe(DEFAULT_SETTINGS.scale);
  });

  it("drops the old small / medium / large setting", () => {
    const settings = sanitize({ size: "large" });
    expect(settings.scale).toBe(DEFAULT_SETTINGS.scale);
    expect(settings).not.toHaveProperty("size");
  });

  it("round-trips through storage", () => {
    const store = new Map<string, string>();
    const storage = { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) };
    saveSettings({ ...DEFAULT_SETTINGS, language: "zh", scale: 120, unitsPerBean: 25 }, storage);
    expect(JSON.parse(store.get(STORAGE_KEY)!)).toMatchObject({ language: "zh", scale: 120 });
    expect(loadSettings(storage)).toMatchObject({ language: "zh", scale: 120, unitsPerBean: 25 });
  });

  it("survives corrupted storage", () => {
    expect(loadSettings({ getItem: () => "{not json" })).toEqual(DEFAULT_SETTINGS);
  });
});

describe("pet layout", () => {
  it("scales the window and everything in it from 80% up", () => {
    expect(petLayout(100)).toEqual({ width: 300, height: 380, zoom: 1, stage: 1 });
    expect(petLayout(150)).toEqual({ width: 450, height: 570, zoom: 1.5, stage: 1 });
  });

  it("shrinks only the scene below 80%, so the cards stay readable", () => {
    const small = petLayout(50);
    expect(small).toMatchObject({ width: 240, height: 304, zoom: 0.8 });
    expect(small.stage).toBeCloseTo(0.625);
  });
});

describe("formatting", () => {
  it("formats distance, speed and integers", () => {
    expect(formatDistance(820_400, "en")).toBe("820 m");
    expect(formatDistance(3_455_808, "en")).toBe("3.46 km");
    expect(formatSpeed(1127)).toBe("1.13 m/s");
    expect(formatInteger(45957n, "en")).toBe("45,957");
  });

  it("formats relative time in both languages", () => {
    expect(formatAgo(1000, "en")).toBe("just now");
    expect(formatAgo(12_000, "en")).toBe("12s ago");
    expect(formatAgo(185_000, "zh")).toBe("3 分钟前");
  });

  it("interpolates messages", () => {
    expect(t("en", "toast.meal", { n: "32" })).toBe("Nom! +32 measured work units");
    expect(t("zh", "toast.blocks", { n: "8", height: "4143" })).toBe("Sepolia 链上结算 +8 个 Squeek 区块 · #4143");
  });
});
