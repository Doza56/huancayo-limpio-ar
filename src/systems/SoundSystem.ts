export class SoundSystem {
    private static context: AudioContext | null = null;

    static init() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    static play(type: 'shoot' | 'hit' | 'bomb' | 'win') {
        if (!this.context) this.init();
        const ctx = this.context!;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === 'shoot') {
            // Pew pew (High pitch sweep down)
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
        else if (type === 'hit') {
            // Ding! (Sine wave high)
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        }
        else if (type === 'bomb') {
            // Explosion (Low noise-ish)
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(10, now + 0.3);
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
        else if (type === 'win') {
            // Triumphant chord arpeggio
            // (Simplified to just a happy beep for now)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.setValueAtTime(554, now + 0.1); // C#
            osc.frequency.setValueAtTime(659, now + 0.2); // E
            gain.gain.setValueAtTime(0.2, now);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    }
}
