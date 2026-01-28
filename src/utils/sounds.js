/**
 * UI Sound Synthesis Utility
 * Uses Web Audio API to generate sounds without external files.
 */

class SoundSystem {
    constructor() {
        this.context = null;
        this.enabled = true;
        this.volume = 0.4; // Premium subtle default
    }

    init() {
        if (!this.context) {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    playClick() {
        if (!this.enabled) return;
        this.init();
        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1500, now);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.context.destination);

        osc.start(now);
        osc.stop(now + 0.05);
    }

    playSuccess() {
        if (!this.enabled) return;
        this.init();
        const now = this.context.currentTime;
        // Soft dual-tone chime (low to high)
        const notes = [440, 880]; // A4 to A5
        notes.forEach((freq, i) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();

            osc.frequency.setValueAtTime(freq, now + i * 0.15);
            gain.gain.setValueAtTime(0, now + i * 0.15);
            gain.gain.linearRampToValueAtTime(0.1 * this.volume, now + i * 0.15 + 0.05);
            gain.gain.exponentialRampToValueAtToTime ? gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4) : null;
            if (!gain.gain.exponentialRampToValueAtTime) { // Fallback if API is slightly different in env
                gain.gain.setTargetAtTime(0.001, now + i * 0.15 + 0.05, 0.1);
            } else {
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
            }

            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.start(now + i * 0.15);
            osc.stop(now + i * 0.15 + 0.5);
        });
    }

    playTimer(isStart) {
        if (!this.enabled) return;
        this.init();
        const now = this.context.currentTime;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        // Muted 'thud' or pro beep
        osc.frequency.setValueAtTime(isStart ? 150 : 100, now);
        osc.frequency.exponentialRampToValueAtTime(isStart ? 100 : 50, now + 0.15);

        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }
}

export const sounds = new SoundSystem();
