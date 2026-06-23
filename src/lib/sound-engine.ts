class AmbientSoundEngine {
  private audioCtx: AudioContext | null = null;

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playProcessSound() {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.3);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }

  playCompleteSound() {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.audioCtx.currentTime + 0.1);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(1600, this.audioCtx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, this.audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.5);
      
      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.start();
      osc2.start();
      osc.stop(this.audioCtx.currentTime + 0.5);
      osc2.stop(this.audioCtx.currentTime + 0.5);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }

  playKeystroke() {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      
      osc.type = 'sine';
      const freq = 1200 + Math.random() * 200;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }
}

export const soundEngine = new AmbientSoundEngine();
