import type { Badge, BubbleContent, PanelContent, Row, ToastContent } from "./present";

// The bubbles around the pet. API values only ever reach the DOM as text.

export interface HudActions {
  openUrl(url: string): void;
  openSettings(): void;
  closePanel(): void;
}

export interface HudLabels {
  pulse: string;
  settings: string;
  close: string;
}

const TOAST_MS = 3800;
const ACTION_TOAST_MS = 6500;
const MAX_TOASTS = 2;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className = "", text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function badgeNode(badge: Badge | null): HTMLElement | null {
  return badge ? el("span", `badge badge--${badge.tone}`, badge.text) : null;
}

function rowNodes(rows: Row[], className: string): HTMLElement {
  const list = el("dl", className);
  for (const row of rows) {
    const item = el("div", row.label ? "" : "row--wide");
    if (row.label) item.append(el("dt", "", row.label));
    const value = el("dd", "", row.value);
    if (row.note) value.append(el("small", "", row.note));
    item.append(value);
    list.append(item);
  }
  return list;
}

export class Hud {
  private readonly stack: HTMLElement;
  private readonly bubble: HTMLElement;
  private readonly panel: HTMLElement;
  private readonly tag: HTMLElement;
  private bubbleKey = "";
  private panelKey = "";

  constructor(
    root: HTMLElement,
    private readonly actions: HudActions,
  ) {
    this.stack = el("div", "hud-stack");
    this.bubble = el("div", "bubble");
    this.bubble.hidden = true;
    this.stack.append(this.bubble);
    this.panel = el("section", "panel");
    this.panel.hidden = true;
    this.tag = el("div", "pet-tag");
    this.tag.hidden = true;
    root.append(this.tag, this.stack, this.panel);
  }

  get panelOpen(): boolean {
    return !this.panel.hidden;
  }

  /** The always-visible label for demo or simulated data. */
  setTag(text: string | null) {
    this.tag.hidden = !text;
    if (text && this.tag.textContent !== text) this.tag.textContent = text;
  }

  setBubble(content: BubbleContent | null) {
    if (!content) {
      this.bubble.hidden = true;
      this.bubbleKey = "";
      return;
    }
    const key = JSON.stringify(content);
    this.bubble.hidden = false;
    if (key === this.bubbleKey) return;
    this.bubbleKey = key;
    const head = el("div", "card-head");
    head.append(el("strong", "", content.title));
    const badge = badgeNode(content.badge);
    if (badge) head.append(badge);
    const parts: HTMLElement[] = [head, el("div", "bubble-status", content.status)];
    if (content.rows.length) parts.push(rowNodes(content.rows, "rows"));
    if (content.note) parts.push(el("p", "note", content.note));
    parts.push(el("p", "foot", content.foot));
    this.bubble.replaceChildren(...parts);
  }

  setPanel(content: PanelContent | null, labels: HudLabels) {
    if (!content) {
      this.panel.hidden = true;
      this.panelKey = "";
      return;
    }
    const key = JSON.stringify([content, labels]);
    this.panel.hidden = false;
    if (key === this.panelKey) return;
    this.panelKey = key;
    const head = el("div", "card-head");
    head.append(el("strong", "", content.title));
    const badge = badgeNode(content.badge);
    if (badge) head.append(badge);
    const close = el("button", "close", "×");
    close.type = "button";
    close.title = labels.close;
    close.setAttribute("aria-label", labels.close);
    close.addEventListener("click", () => this.actions.closePanel());
    head.append(close);

    const parts: HTMLElement[] = [head, rowNodes(content.rows, "rows rows--panel")];
    if (content.tx) {
      const tx = content.tx;
      const link = el("button", "link", `${tx.label} ↗`);
      link.type = "button";
      link.addEventListener("click", () => this.actions.openUrl(tx.url));
      parts.push(link);
    }
    if (content.reading) parts.push(el("p", "foot", content.reading));
    parts.push(el("p", "foot foot--tight", content.source));
    const buttons = el("div", "buttons");
    const pulse = el("button", "button", `${labels.pulse} ↗`);
    pulse.type = "button";
    pulse.addEventListener("click", () => this.actions.openUrl("https://squeekpulse.xyz/"));
    const settings = el("button", "button button--quiet", labels.settings);
    settings.type = "button";
    settings.addEventListener("click", () => this.actions.openSettings());
    buttons.append(pulse, settings);
    parts.push(buttons);
    this.panel.replaceChildren(...parts);
  }

  toast(content: ToastContent) {
    const node = el("div", `toast toast--${content.tone}`);
    node.append(el("span", "", content.text));
    if (content.action) {
      const action = content.action;
      const button = el("button", "toast-action", `${action.label} ↗`);
      button.type = "button";
      button.addEventListener("click", () => this.actions.openUrl(action.url));
      node.append(button);
      node.dataset.interactive = "true";
    }
    this.stack.append(node);
    const toasts = this.stack.querySelectorAll(".toast");
    for (let i = 0; i < toasts.length - MAX_TOASTS; i++) toasts[i].remove();
    window.setTimeout(() => {
      node.classList.add("toast--leaving");
      window.setTimeout(() => node.remove(), 300);
    }, content.action ? ACTION_TOAST_MS : TOAST_MS);
  }

  /** Parts of the HUD that must catch clicks: the open panel and toasts with a link. */
  interactiveRects(): DOMRect[] {
    const rects: DOMRect[] = [];
    if (!this.panel.hidden) rects.push(this.panel.getBoundingClientRect());
    this.stack.querySelectorAll<HTMLElement>('.toast[data-interactive="true"]').forEach((node) => rects.push(node.getBoundingClientRect()));
    return rects;
  }
}
