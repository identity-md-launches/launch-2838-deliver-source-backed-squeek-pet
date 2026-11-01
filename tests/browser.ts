// Native-browser regression page, served by Vite at /tests/browser.html.
// No DOM substitute or additional test dependency is needed. Run with both
// light and dark system themes; the result is also exposed on <html> for CI.
import "../src/styles/pet.css";
import { t } from "../src/core/i18n";
import { DEFAULT_SETTINGS, STORAGE_KEY } from "../src/core/settings";
import { mountBrowserChrome } from "../src/pet/browser-chrome";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function node<T extends HTMLElement = HTMLElement>(selector: string): T {
  const result = document.querySelector<T>(selector);
  assert(result, `Missing ${selector}`);
  return result;
}

function rgb(text: string): number[] {
  return text.match(/[\d.]+/g)!.slice(0, 3).map(Number);
}

function contrast(a: number[], b: number[]): number {
  const luminance = (color: number[]) => color.map((n) => {
    const s = n / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const report = document.createElement("pre");
report.style.cssText = "position:fixed;inset:0 auto auto 0;z-index:20;background:white;color:black;padding:12px;white-space:pre-wrap";
try {
  const calls = { pat: 0, feed: 0, wake: 0 };
  const chrome = mountBrowserChrome("en", {
    pat: () => calls.pat++, feed: () => calls.feed++, wake: () => calls.wake++,
  });
  const pat = node<HTMLButtonElement>('[data-action="pat"]');
  pat.focus();

  // Updating in both directions must retain the same focused controls and
  // their original handlers, while refreshing all visible and accessible text.
  for (const lang of ["zh", "en", "zh"] as const) {
    chrome.update(lang);
    assert(node(".web-head h1").textContent === t(lang, "web.title"), "Heading did not translate");
    assert(document.title === t(lang, "web.title"), "Tab title did not translate");
    assert(node(".web-head p").textContent === t(lang, "web.subtitle"), "Subtitle did not translate");
    assert(node(".play-dock__hint").textContent === t(lang, "web.hint"), "Hint did not translate");
    assert(node(".play-dock").getAttribute("aria-label") === t(lang, "play.label"), "Group name did not translate");
    assert(document.activeElement === pat, "Language change lost focus");
    for (const [action, key] of [["pat", "P"], ["feed", "F"], ["wake", "W"]] as const) {
      const button = node<HTMLButtonElement>(`[data-action="${action}"]`);
      const text = t(lang, `play.${action}`);
      assert(button.querySelector(".play-dock__label")!.textContent === text, `${action} text is stale`);
      assert(button.title === `${text} (${key})`, `${action} title is stale`);
      assert(button.getAttribute("aria-label") === button.title, `${action} accessible name is stale`);
      button.click();
    }
  }
  assert(calls.pat === 3 && calls.feed === 3 && calls.wake === 3, "Actions were lost or duplicated");
  assert(document.querySelectorAll(".web-head").length === 1, "Duplicate browser chrome");

  // Computed styles catch the dark-mode cascade, rather than merely searching
  // CSS source. Test heading/subtitle against the frame's gradient endpoints.
  for (const selector of [".web-head h1", ".web-head p"] as const) {
    const ink = rgb(getComputedStyle(node(selector)).color);
    for (const background of [[251, 246, 236], [240, 229, 210]]) {
      assert(contrast(ink, background) >= 4.5, `${selector} loses contrast in ${matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"} mode`);
    }
  }
  const hint = getComputedStyle(node(".play-dock__hint"));
  assert(contrast(rgb(hint.color), [246, 239, 227]) >= 4.5, "Hint loses contrast");
  for (const button of document.querySelectorAll<HTMLButtonElement>(".play-dock__button")) {
    const style = getComputedStyle(button);
    assert(contrast(rgb(style.color), rgb(style.backgroundColor)) >= 4.5, "Play button loses contrast");
  }

  // Exercise the real entry point and its cross-window settings listener, too.
  // Demo is explicit so this check neither depends on nor substitutes for live API access.
  const pet = document.createElement("iframe");
  pet.src = "/?demo=1&lang=en";
  pet.style.cssText = "position:fixed;left:-1000px;width:400px;height:600px";
  const loaded = new Promise<void>((resolve, reject) => {
    pet.onload = () => resolve();
    pet.onerror = () => reject(new Error("Could not load the pet regression frame"));
  });
  document.body.append(pet);
  await loaded;
  const petWindow = pet.contentWindow!;
  const petDocument = pet.contentDocument!;
  for (const lang of ["zh", "en"] as const) {
    petWindow.dispatchEvent(new StorageEvent("storage", {
      key: STORAGE_KEY,
      newValue: JSON.stringify({ ...DEFAULT_SETTINGS, demo: true, language: lang }),
    }));
    assert(petDocument.documentElement.lang === (lang === "zh" ? "zh-CN" : "en"), "Pet ignored settings language");
    assert(petDocument.querySelector(".web-head h1")!.textContent === t(lang, "web.title"), "Pet entry point left browser chrome stale");
    assert(petDocument.querySelector('[data-action="pat"]')!.getAttribute("aria-label") === `${t(lang, "play.pat")} (P)`, "Pet entry point left accessible name stale");
  }
  pet.remove();
  report.textContent = "PASS: browser translations, settings events, accessible names, focus, actions and contrast";
  document.documentElement.dataset.result = "pass";
} catch (error) {
  report.textContent = `FAIL: ${error instanceof Error ? error.message : String(error)}`;
  document.documentElement.dataset.result = "fail";
  throw error;
} finally {
  document.body.append(report);
}
