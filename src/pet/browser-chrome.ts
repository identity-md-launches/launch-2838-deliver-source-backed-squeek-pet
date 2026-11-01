import { t, type Language } from "../core/i18n";
import { mountPlayDock, updatePlayDock, type PlayDockActions } from "./play-dock";

/** Browser-only frame; the desktop continues to use its tray and context menu. */
export function mountBrowserChrome(language: Language, actions: PlayDockActions) {
  document.body.classList.add("web");

  const backdrop = document.createElement("div");
  backdrop.className = "web-backdrop";
  backdrop.setAttribute("aria-hidden", "true");

  const head = document.createElement("header");
  head.className = "web-head";
  const title = document.createElement("h1");
  const subtitle = document.createElement("p");
  head.append(title, subtitle);

  const labels = (lang: Language) => ({
    label: t(lang, "play.label"),
    pat: t(lang, "play.pat"),
    feed: t(lang, "play.feed"),
    wake: t(lang, "play.wake"),
    hint: t(lang, "web.hint"),
  });
  const dock = mountPlayDock(labels(language), actions);
  document.body.append(backdrop, head, dock);

  function update(lang: Language) {
    document.title = title.textContent = t(lang, "web.title");
    subtitle.textContent = t(lang, "web.subtitle");
    updatePlayDock(dock, labels(lang));
  }
  update(language);
  return { update };
}
