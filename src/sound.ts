// Tiny synthesized sounds, so the app ships no audio files. Off by default;
// web audio only starts after the user has clicked the pet once.

export type SoundName = "squeek" | "nom" | "chime";

export class Sounds {
  enabled = false;
  private ctx: AudioContext | null = null;

  /** Call from a user gesture so the audio context is allowed to run. */
  unlock() {
    if (!this.enabled) return;
    try {
      this.ctx ??= new AudioContext();
      if (this.ctx.state === "suspended") void this.ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  play(name: SoundName) {
    const ctx = this.ctx;
    if (!this.enabled || !ctx || ctx.state !== "running") return;
    const t = ctx.currentTime;
    switch (name) {
      case "squeek":
        this.tone(ctx, "sine", t, 0.07, 1900, 2700, 0.05);
        this.tone(ctx, "sine", t + 0.09, 0.08, 2300, 3100, 0.045);
        break;
      case "nom":
        this.tone(ctx, "triangle", t, 0.06, 260, 170, 0.06);
        break;
      case "chime":
        this.tone(ctx, "sine", t, 0.6, 1318.5, 1318.5, 0.04);
        this.tone(ctx, "sine", t + 0.1, 0.7, 1975.5, 1975.5, 0.035);
        break;
    }
  }

  private tone(ctx: AudioContext, type: OscillatorType, start: number, length: number, from: number, to: number, volume: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(from, start);
    osc.frequency.exponentialRampToValueAtTime(to, start + length);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + length + 0.02);
  }
}
