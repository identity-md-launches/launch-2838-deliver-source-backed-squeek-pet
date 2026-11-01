import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("settings navigation", () => {
  it.each([
    ["https://pet.example/", "https://pet.example/settings.html"],
    ["https://gateway.example/ipfs/example-cid/", "https://gateway.example/ipfs/example-cid/settings.html"],
    ["https://gateway.example/ipfs/example-cid/index.html?demo=1#pet", "https://gateway.example/ipfs/example-cid/settings.html"],
  ])("keeps settings beside %s", async (href, expected) => {
    const open = vi.fn();
    vi.stubGlobal("window", { location: { href }, open });
    const { desktop, inTauri } = await import("../src/platform/desktop");
    expect(inTauri).toBe(false);
    desktop.openSettings();
    expect(open).toHaveBeenCalledExactlyOnceWith(expected, "squeek-pet-settings", "width=420,height=680");
  });

  it("still opens the native settings window in Tauri", async () => {
    const invoke = vi.fn().mockResolvedValue(undefined);
    const open = vi.fn();
    vi.stubGlobal("window", { __TAURI_INTERNALS__: { invoke }, open });
    const { desktop, inTauri } = await import("../src/platform/desktop");
    expect(inTauri).toBe(true);
    desktop.openSettings();
    expect(invoke).toHaveBeenCalledWith("open_settings", {}, undefined);
    expect(open).not.toHaveBeenCalled();
  });
});
