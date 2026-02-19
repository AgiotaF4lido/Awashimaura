
class AudioService {
  private ctx: AudioContext | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playStep() {
    this.playTone(80 + Math.random() * 20, 'square', 0.05, 0.02);
  }

  playWallHit() {
    this.playTone(50, 'sawtooth', 0.1, 0.05);
  }

  playEntity() {
    this.playTone(200, 'sine', 1.0, 0.05);
    setTimeout(() => this.playTone(150, 'sine', 0.8, 0.05), 200);
  }

  playReset() {
    this.playTone(400, 'square', 0.2, 0.1);
    this.playTone(200, 'square', 0.2, 0.1);
    this.playTone(100, 'square', 0.5, 0.1);
  }

  playTempleTransition() {
    this.playTone(150, 'sine', 1.5, 0.08);
    this.playTone(300, 'sine', 1.2, 0.04);
    setTimeout(() => this.playTone(600, 'sine', 0.8, 0.02), 300);
  }
}

export const audioService = new AudioService();
