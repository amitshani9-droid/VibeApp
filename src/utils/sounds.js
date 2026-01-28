/**
 * UI Sound Synthesis Utility
 * Uses Web Audio API to generate sounds without external files.
 */

class SoundSystem {
    constructor() {
        this.context = null;
        this.enabled = true;
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
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.context.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.1);

        gain.gain.setValueAtTime(0.1, this.context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.context.destination);

        osc.start();
        osc.stop(this.context.currentTime + 0.1);
    }

    playSuccess() {
        if (!this.enabled) return;
        this.init();
        const now = this.context.currentTime;

        const playNote = (freq, startTime, duration) => {
            const osc = this.context.createOscillator();
            const gain = this.context.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.1, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            osc.connect(gain);
            gain.connect(this.context.destination);
            osc.start(startTime);
            osc.stop(startTime + duration);
        };

        playNote(523.25, now, 0.1); // C5
        playNote(659.25, now + 0.1, 0.1); // E5
        playNote(783.99, now + 0.2, 0.3); // G5
    }

    playTimer(isStart) {
        if (!this.enabled) return;
        this.init();
        const now = this.context.currentTime;
        const freq = isStart ? 880 : 440; // A5 for start, A4 for stop

        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.context.destination);
        osc.start();
        osc.stop(now + 0.15);
    }
}

export const sounds = new SoundSystem();
