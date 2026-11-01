import { t, type Language } from "./i18n";

const locales: Record<Language, string> = { en: "en-US", zh: "zh-CN" };

export function formatInteger(value: bigint | number, language: Language): string {
  return new Intl.NumberFormat(locales[language]).format(value);
}

export function formatRpm(rpm: number): string {
  return rpm.toFixed(1);
}

export function formatDistance(mm: number, language: Language): string {
  const metres = mm / 1000;
  if (metres < 1000) return `${formatInteger(Math.round(metres), language)} m`;
  return `${(metres / 1000).toFixed(2)} km`;
}

export function formatSpeed(mmPerSecond: number): string {
  return `${(mmPerSecond / 1000).toFixed(2)} m/s`;
}

export function formatAgo(ms: number, language: Language): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 3) return t(language, "ago.now");
  if (seconds < 60) return t(language, "ago.seconds", { n: String(seconds) });
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t(language, "ago.minutes", { n: String(minutes) });
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return t(language, "ago.hours", { n: String(hours) });
  return t(language, "ago.days", { n: String(Math.floor(hours / 24)) });
}

export function formatClock(ms: number, language: Language): string {
  return new Intl.DateTimeFormat(locales[language], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(ms);
}
