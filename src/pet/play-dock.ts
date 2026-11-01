// The browser-only play dock. The desktop pet is click-through and uses the
// context menu; a hosted page needs visible controls instead.

export type PlayAction = "pat" | "feed" | "wake";

export interface PlayDockLabels {
  /** Accessible name for the button group. */
  label: string;
  pat: string;
  feed: string;
  wake: string;
  hint: string;
}

export interface PlayDockActions {
  pat(): void;
  feed(): void;
  wake(): void;
}

const ICONS: Record<PlayAction, string> = { pat: "♥", feed: "●", wake: "☀" };
const KEYS: Record<PlayAction, string> = { pat: "P", feed: "F", wake: "W" };

function actionButton(action: PlayAction, text: string, run: () => void): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "play-dock__button";
  button.dataset.action = action;
  button.title = `${text} (${KEYS[action]})`;
  button.setAttribute("aria-label", `${text} (${KEYS[action]})`);

  const icon = document.createElement("span");
  icon.className = "play-dock__icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = ICONS[action];

  const label = document.createElement("span");
  label.textContent = text;

  button.append(icon, label);
  button.addEventListener("click", run);
  return button;
}

/** Adds the Pat / Feed / Wake controls to a plain browser page. */
export function mountPlayDock(labels: PlayDockLabels, actions: PlayDockActions): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "play-dock-wrap";

  const dock = document.createElement("div");
  dock.className = "play-dock";
  dock.setAttribute("role", "group");
  dock.setAttribute("aria-label", labels.label);
  dock.append(
    actionButton("pat", labels.pat, actions.pat),
    actionButton("feed", labels.feed, actions.feed),
    actionButton("wake", labels.wake, actions.wake),
  );

  const hint = document.createElement("p");
  hint.className = "play-dock__hint";
  hint.textContent = labels.hint;

  wrap.append(dock, hint);
  return wrap;
}
