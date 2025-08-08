// Sound effects manager for TigerRozetka
// Using Web Audio API for better control

export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private volume: number = 0.7;
  private enabled: boolean = true;

  constructor() {
    this.init();
  }

  private async init() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  async loadSound(name: string, url: string): Promise<void> {
    if (!this.audioContext) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
    }
  }

  playSound(name: string, volume: number = 1): void {
    if (!this.enabled || !this.audioContext) return;

    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = buffer;
    gainNode.gain.value = this.volume * volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  // Generate electric spark sound programmatically
  generateSparkSound(intensity: 'low' | 'medium' | 'high' | 'extreme'): void {
    if (!this.enabled || !this.audioContext) return;

    const duration = {
      low: 0.1,
      medium: 0.2,
      high: 0.3,
      extreme: 0.5
    }[intensity];

    const frequency = {
      low: 2000,
      medium: 3000,
      high: 4000,
      extreme: 5000
    }[intensity];

    // Create white noise for spark effect
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    // Generate noise with frequency modulation
    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-t * 10); // Exponential decay
      const noise = (Math.random() * 2 - 1) * envelope;
      const oscillation = Math.sin(2 * Math.PI * frequency * t * (1 + Math.random() * 0.5));
      output[i] = noise * oscillation * 0.3;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = this.volume * (intensity === 'extreme' ? 0.8 : 0.5);

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  // Generate shock sound
  generateShockSound(): void {
    if (!this.enabled || !this.audioContext) return;

    const duration = 0.8;
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const envelope = Math.exp(-t * 3);
      const lowFreq = Math.sin(2 * Math.PI * 100 * t);
      const highFreq = Math.sin(2 * Math.PI * 800 * t) * 0.5;
      const noise = (Math.random() * 2 - 1) * 0.3;
      output[i] = (lowFreq + highFreq + noise) * envelope * 0.6;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = this.volume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  // Generate warning sound
  generateWarningSound(): void {
    if (!this.enabled || !this.audioContext) return;

    const duration = 0.3;
    const bufferSize = this.audioContext.sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / this.audioContext.sampleRate;
      const frequency = 1000 + Math.sin(t * 20) * 200; // Frequency modulation
      const envelope = Math.sin(Math.PI * t / duration); // Bell-shaped envelope
      output[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = buffer;
    gainNode.gain.value = this.volume * 0.6;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start();
  }

  // Загружает и воспроизводит звук тигра при электрическом разряде
  async playTigerSound(): Promise<void> {
    if (!this.enabled) return;

    try {
      // Используем HTML5 Audio для простоты загрузки и воспроизведения
      const audio = new Audio('/tigerrosette/Media/sound/re_-tigra.mp3');
      audio.volume = this.volume * 0.8; // Немного тише основного уровня
      audio.preload = 'auto';
      
      // Воспроизводим звук
      await audio.play();
      console.log('SoundManager: Tiger sound played successfully');
    } catch (error) {
      console.warn('Failed to play tiger sound:', error);
    }
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  getVolume(): number {
    return this.volume;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Global sound manager instance
export const soundManager = new SoundManager();
