// Drum Kit JavaScript
class VirtualDrumKit {
    constructor() {
        this.volume = 0.8;
        this.bpm = 120;
        this.isMetronomeOn = false;
        this.isRecording = false;
        this.recordedBeats = [];
        this.recordingStartTime = 0;
        this.currentPattern = null;
        this.isPatternPlaying = false;
        this.patternInterval = null;
        this.beatCount = 1;
        this.metronomeInterval = null;
        
        // Drum sounds configuration
        this.drumSounds = {
            kick: { freq: 60, decay: 0.5, type: 'tonal' },
            snare: { freq: 200, decay: 0.2, type: 'noise', filterFreq: 2000 },
            hihat: { freq: 8000, decay: 0.1, type: 'noise', filterFreq: 12000 },
            openhat: { freq: 8000, decay: 0.3, type: 'noise', filterFreq: 10000 },
            crash: { freq: 5000, decay: 1.0, type: 'noise', filterFreq: 8000 },
            ride: { freq: 3000, decay: 0.8, type: 'noise', filterFreq: 6000 },
            tom1: { freq: 220, decay: 0.4, type: 'tonal' },
            tom2: { freq: 180, decay: 0.5, type: 'tonal' },
            tom3: { freq: 120, decay: 0.6, type: 'tonal' }
        };
        
        // Beat patterns
        this.beatPatterns = {
            basic: {
                name: 'Basic Rock',
                pattern: [
                    { time: 0, drums: ['kick'] },
                    { time: 0.25, drums: ['hihat'] },
                    { time: 0.5, drums: ['snare', 'hihat'] },
                    { time: 0.75, drums: ['hihat'] },
                    { time: 1, drums: ['kick'] },
                    { time: 1.25, drums: ['hihat'] },
                    { time: 1.5, drums: ['snare', 'hihat'] },
                    { time: 1.75, drums: ['hihat'] }
                ]
            },
            funk: {
                name: 'Funk Groove',
                pattern: [
                    { time: 0, drums: ['kick'] },
                    { time: 0.125, drums: ['hihat'] },
                    { time: 0.25, drums: ['snare'] },
                    { time: 0.375, drums: ['hihat'] },
                    { time: 0.5, drums: ['kick', 'hihat'] },
                    { time: 0.625, drums: [] },
                    { time: 0.75, drums: ['snare'] },
                    { time: 0.875, drums: ['kick'] },
                    { time: 1, drums: ['hihat'] },
                    { time: 1.125, drums: ['kick'] },
                    { time: 1.25, drums: ['snare', 'hihat'] },
                    { time: 1.375, drums: [] },
                    { time: 1.5, drums: ['kick'] },
                    { time: 1.625, drums: ['hihat'] },
                    { time: 1.75, drums: ['snare'] },
                    { time: 1.875, drums: ['hihat'] }
                ]
            },
            jazz: {
                name: 'Jazz Swing',
                pattern: [
                    { time: 0, drums: ['kick', 'ride'] },
                    { time: 0.33, drums: ['ride'] },
                    { time: 0.5, drums: ['snare'] },
                    { time: 0.66, drums: ['ride'] },
                    { time: 1, drums: ['kick', 'ride'] },
                    { time: 1.33, drums: ['ride'] },
                    { time: 1.5, drums: ['snare'] },
                    { time: 1.66, drums: ['ride'] }
                ]
            },
            latin: {
                name: 'Latin Rhythm',
                pattern: [
                    { time: 0, drums: ['kick'] },
                    { time: 0.25, drums: ['hihat'] },
                    { time: 0.5, drums: ['snare'] },
                    { time: 0.625, drums: ['kick'] },
                    { time: 0.75, drums: ['hihat'] },
                    { time: 1, drums: ['kick'] },
                    { time: 1.25, drums: ['hihat'] },
                    { time: 1.5, drums: ['snare'] },
                    { time: 1.75, drums: ['hihat'] }
                ]
            },
            shuffle: {
                name: 'Blues Shuffle',
                pattern: [
                    { time: 0, drums: ['kick', 'hihat'] },
                    { time: 0.33, drums: ['hihat'] },
                    { time: 0.5, drums: ['snare'] },
                    { time: 0.83, drums: ['hihat'] },
                    { time: 1, drums: ['kick', 'hihat'] },
                    { time: 1.33, drums: ['hihat'] },
                    { time: 1.5, drums: ['snare'] },
                    { time: 1.83, drums: ['hihat'] }
                ]
            },
            breakbeat: {
                name: 'Breakbeat',
                pattern: [
                    { time: 0, drums: ['kick'] },
                    { time: 0.125, drums: ['hihat'] },
                    { time: 0.25, drums: ['snare'] },
                    { time: 0.375, drums: ['kick'] },
                    { time: 0.5, drums: ['kick'] },
                    { time: 0.625, drums: ['hihat'] },
                    { time: 0.75, drums: ['snare'] },
                    { time: 0.875, drums: ['hihat'] },
                    { time: 1, drums: ['kick'] },
                    { time: 1.125, drums: [] },
                    { time: 1.25, drums: ['snare'] },
                    { time: 1.375, drums: ['kick'] },
                    { time: 1.5, drums: ['snare'] },
                    { time: 1.625, drums: ['hihat'] },
                    { time: 1.75, drums: ['snare'] },
                    { time: 1.875, drums: ['hihat'] }
                ]
            }
        };
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupDrumPads();
            this.setupControls();
            this.setupKeyboardShortcuts();
            this.setupBeatPatterns();
        });
    }

    setupDrumPads() {
        const drumPads = document.querySelectorAll('.drum-pad');
        
        drumPads.forEach(pad => {
            const sound = pad.dataset.sound;
            
            // Mouse events
            pad.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.playDrumSound(sound, pad);
            });
            
            // Touch events
            pad.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playDrumSound(sound, pad);
            });
            
            // Prevent context menu
            pad.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
        });
    }

    setupControls() {
        // Volume control
        const volumeSlider = document.getElementById('drum-volume-slider');
        const volumeValue = document.getElementById('drum-volume-value');
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                if (volumeValue) {
                    volumeValue.textContent = `${e.target.value}%`;
                }
            });
        }
        
        // BPM control
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmValue = document.getElementById('bpm-value');
        
        if (bpmSlider) {
            bpmSlider.addEventListener('input', (e) => {
                this.bpm = parseInt(e.target.value);
                if (bpmValue) {
                    bpmValue.textContent = e.target.value;
                }
                
                // Restart metronome if it's running
                if (this.isMetronomeOn) {
                    this.stopMetronome();
                    this.startMetronome();
                }
            });
        }
        
        // Metronome button
        const metronomeBtn = document.getElementById('metronome-btn');
        if (metronomeBtn) {
            metronomeBtn.addEventListener('click', () => {
                this.toggleMetronome();
            });
        }
        
        // Beat patterns button
        const beatPatternBtn = document.getElementById('beat-pattern-btn');
        if (beatPatternBtn) {
            beatPatternBtn.addEventListener('click', () => {
                this.toggleBeatPatterns();
            });
        }
        
        // Record button
        const recordBtn = document.getElementById('drum-record-btn');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => {
                window.musicStudio.showNotification('Recording feature coming soon!', 'info');
            });
        }
    }

    setupKeyboardShortcuts() {
        const keyMap = {
            'KeyQ': 'crash',
            'KeyW': 'hihat',
            'KeyE': 'ride',
            'KeyR': 'tom1',
            'KeyT': 'tom2',
            'KeyY': 'tom3',
            'KeyS': 'snare',
            'KeyO': 'openhat',
            'Space': 'kick'
        };
        
        const pressedKeys = new Set();
        
        document.addEventListener('keydown', (e) => {
            if (pressedKeys.has(e.code)) return;
            pressedKeys.add(e.code);
            
            if (keyMap[e.code]) {
                e.preventDefault();
                const sound = keyMap[e.code];
                const pad = document.querySelector(`[data-sound="${sound}"]`);
                if (pad) {
                    this.playDrumSound(sound, pad);
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            pressedKeys.delete(e.code);
        });
    }

    setupBeatPatterns() {
        const patternButtons = document.querySelectorAll('.pattern-btn');
        const playPatternBtn = document.getElementById('play-pattern');
        const stopPatternBtn = document.getElementById('stop-pattern');
        
        patternButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const patternName = btn.dataset.pattern;
                this.selectPattern(patternName, btn);
            });
        });
        
        if (playPatternBtn) {
            playPatternBtn.addEventListener('click', () => {
                this.playPattern();
            });
        }
        
        if (stopPatternBtn) {
            stopPatternBtn.addEventListener('click', () => {
                this.stopPattern();
            });
        }
    }

    playDrumSound(soundType, padElement) {
        if (!window.musicStudio.audioContext) return;
        
        const sound = this.drumSounds[soundType];
        if (!sound) return;
        
        // Enhanced visual feedback with better animations
        padElement.classList.add('active', 'hit');
        
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'drum-ripple';
        padElement.appendChild(ripple);
        
        setTimeout(() => {
            padElement.classList.remove('active', 'hit');
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 300);
        
        // Play realistic drum sound
        this.playRealisticDrumSound(soundType, sound);
        
        // Record if recording
        if (this.isRecording) {
            this.recordedBeats.push({
                sound: soundType,
                time: Date.now() - this.recordingStartTime
            });
        }
    }
    
    playRealisticDrumSound(soundType, sound) {
        const ctx = window.musicStudio.audioContext;
        const now = ctx.currentTime;
        
        switch(soundType) {
            case 'kick':
                this.createKickDrum(now, sound);
                break;
            case 'snare':
                this.createSnareDrum(now, sound);
                break;
            case 'hihat':
            case 'openhat':
                this.createHiHat(now, sound, soundType === 'openhat');
                break;
            case 'crash':
                this.createCymbal(now, sound, 'crash');
                break;
            case 'ride':
                this.createCymbal(now, sound, 'ride');
                break;
            case 'tom1':
            case 'tom2':
            case 'tom3':
                this.createTom(now, sound);
                break;
            default:
                this.playTonalSound(sound);
        }
    }
    
    createKickDrum(startTime, sound) {
        const ctx = window.musicStudio.audioContext;
        
        // Main kick oscillator (sine wave for body)
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        const kickFilter = ctx.createBiquadFilter();
        
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(60, startTime);
        kickOsc.frequency.exponentialRampToValueAtTime(30, startTime + 0.1);
        
        kickFilter.type = 'lowpass';
        kickFilter.frequency.setValueAtTime(100, startTime);
        kickFilter.Q.setValueAtTime(1, startTime);
        
        kickGain.gain.setValueAtTime(0, startTime);
        kickGain.gain.linearRampToValueAtTime(this.volume * 0.8, startTime + 0.01);
        kickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
        
        kickOsc.connect(kickFilter);
        kickFilter.connect(kickGain);
        kickGain.connect(ctx.destination);
        
        kickOsc.start(startTime);
        kickOsc.stop(startTime + 0.5);
        
        // Click component for attack
        const clickOsc = ctx.createOscillator();
        const clickGain = ctx.createGain();
        const clickFilter = ctx.createBiquadFilter();
        
        clickOsc.type = 'square';
        clickOsc.frequency.setValueAtTime(1000, startTime);
        
        clickFilter.type = 'highpass';
        clickFilter.frequency.setValueAtTime(800, startTime);
        
        clickGain.gain.setValueAtTime(0, startTime);
        clickGain.gain.linearRampToValueAtTime(this.volume * 0.3, startTime + 0.001);
        clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.01);
        
        clickOsc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(ctx.destination);
        
        clickOsc.start(startTime);
        clickOsc.stop(startTime + 0.01);
    }
    
    createSnareDrum(startTime, sound) {
        const ctx = window.musicStudio.audioContext;
        
        // Tonal component
        const snareOsc = ctx.createOscillator();
        const snareGain = ctx.createGain();
        
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(200, startTime);
        snareOsc.frequency.exponentialRampToValueAtTime(100, startTime + 0.1);
        
        snareGain.gain.setValueAtTime(0, startTime);
        snareGain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.01);
        snareGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
        
        snareOsc.connect(snareGain);
        snareGain.connect(ctx.destination);
        
        snareOsc.start(startTime);
        snareOsc.stop(startTime + 0.2);
        
        // Noise component (snare rattle)
        const bufferSize = ctx.sampleRate * 0.2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        const noiseFilter = ctx.createBiquadFilter();
        
        noiseSource.buffer = noiseBuffer;
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2000, startTime);
        noiseFilter.Q.setValueAtTime(5, startTime);
        
        noiseGain.gain.setValueAtTime(0, startTime);
        noiseGain.gain.linearRampToValueAtTime(this.volume * 0.6, startTime + 0.005);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noiseSource.start(startTime);
        noiseSource.stop(startTime + 0.2);
    }
    
    createHiHat(startTime, sound, isOpen = false) {
        const ctx = window.musicStudio.audioContext;
        const duration = isOpen ? 0.3 : 0.1;
        
        // Create noise buffer
        const bufferSize = ctx.sampleRate * duration;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noiseSource = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        const highpass = ctx.createBiquadFilter();
        const lowpass = ctx.createBiquadFilter();
        
        noiseSource.buffer = noiseBuffer;
        
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(8000, startTime);
        
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(12000, startTime);
        
        noiseGain.gain.setValueAtTime(0, startTime);
        noiseGain.gain.linearRampToValueAtTime(this.volume * (isOpen ? 0.5 : 0.3), startTime + 0.001);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        noiseSource.connect(highpass);
        highpass.connect(lowpass);
        lowpass.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        
        noiseSource.start(startTime);
        noiseSource.stop(startTime + duration);
    }
    
    createCymbal(startTime, sound, type) {
        const ctx = window.musicStudio.audioContext;
        const duration = type === 'crash' ? 2.0 : 1.0;
        
        // Multiple oscillators for metallic sound
        for (let i = 0; i < 6; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();
            
            const baseFreq = type === 'crash' ? 3000 : 2500;
            const freq = baseFreq * (1 + i * 0.37 + Math.random() * 0.1);
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, startTime);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(freq, startTime);
            filter.Q.setValueAtTime(0.5, startTime);
            
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.1 / (i + 1), startTime + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        }
    }
    
    createTom(startTime, sound) {
        const ctx = window.musicStudio.audioContext;
        
        const tomOsc = ctx.createOscillator();
        const tomGain = ctx.createGain();
        const tomFilter = ctx.createBiquadFilter();
        
        tomOsc.type = 'sine';
        tomOsc.frequency.setValueAtTime(sound.freq, startTime);
        tomOsc.frequency.exponentialRampToValueAtTime(sound.freq * 0.5, startTime + 0.1);
        
        tomFilter.type = 'lowpass';
        tomFilter.frequency.setValueAtTime(sound.freq * 3, startTime);
        tomFilter.Q.setValueAtTime(1.5, startTime);
        
        tomGain.gain.setValueAtTime(0, startTime);
        tomGain.gain.linearRampToValueAtTime(this.volume * 0.6, startTime + 0.01);
        tomGain.gain.exponentialRampToValueAtTime(0.001, startTime + sound.decay);
        
        tomOsc.connect(tomFilter);
        tomFilter.connect(tomGain);
        tomGain.connect(ctx.destination);
        
        tomOsc.start(startTime);
        tomOsc.stop(startTime + sound.decay);
    }

    playNoiseSound(sound) {
        const noiseSource = window.musicStudio.createNoiseSource({
            duration: sound.decay,
            filterType: 'highpass',
            filterFreq: sound.filterFreq || 1000,
            volume: this.volume * 0.6,
            decay: 2
        });
        
        if (noiseSource) {
            noiseSource.source.start();
            noiseSource.source.stop(window.musicStudio.audioContext.currentTime + sound.decay);
        }
    }

    playTonalSound(sound) {
        const oscillatorData = window.musicStudio.createOscillator(sound.freq, 'triangle', {
            attack: 0.01,
            decay: sound.decay * 0.3,
            sustain: 0.1,
            release: sound.decay * 0.7,
            volume: this.volume * 0.5
        });
        
        if (oscillatorData) {
            oscillatorData.oscillator.start();
            oscillatorData.oscillator.stop(window.musicStudio.audioContext.currentTime + sound.decay);
        }
    }

    toggleMetronome() {
        if (this.isMetronomeOn) {
            this.stopMetronome();
        } else {
            this.startMetronome();
        }
    }

    startMetronome() {
        this.isMetronomeOn = true;
        this.beatCount = 1;
        
        const metronomeBtn = document.getElementById('metronome-btn');
        const metronomeDisplay = document.getElementById('metronome-display');
        
        if (metronomeBtn) {
            metronomeBtn.classList.add('active');
            metronomeBtn.innerHTML = '<i class="fas fa-metronome"></i> Stop Metronome';
        }
        
        if (metronomeDisplay) {
            metronomeDisplay.classList.add('active');
        }
        
        const beatDuration = 60000 / this.bpm; // ms per beat
        
        this.metronomeInterval = setInterval(() => {
            this.playMetronomeBeat();
            this.updateBeatDisplay();
        }, beatDuration);
        
        // Play first beat immediately
        this.playMetronomeBeat();
        this.updateBeatDisplay();
        
        window.musicStudio.showNotification(`Metronome started at ${this.bpm} BPM`, 'success');
    }

    stopMetronome() {
        this.isMetronomeOn = false;
        
        if (this.metronomeInterval) {
            clearInterval(this.metronomeInterval);
            this.metronomeInterval = null;
        }
        
        const metronomeBtn = document.getElementById('metronome-btn');
        const metronomeDisplay = document.getElementById('metronome-display');
        
        if (metronomeBtn) {
            metronomeBtn.classList.remove('active');
            metronomeBtn.innerHTML = '<i class="fas fa-metronome"></i> Metronome';
        }
        
        if (metronomeDisplay) {
            metronomeDisplay.classList.remove('active');
        }
        
        window.musicStudio.showNotification('Metronome stopped', 'info');
    }

    playMetronomeBeat() {
        // Different sound for first beat of measure
        const frequency = this.beatCount === 1 ? 800 : 600;
        const oscillatorData = window.musicStudio.createOscillator(frequency, 'square', {
            attack: 0.01,
            decay: 0.05,
            sustain: 0.1,
            release: 0.1,
            volume: this.volume * 0.3
        });
        
        if (oscillatorData) {
            oscillatorData.oscillator.start();
            oscillatorData.oscillator.stop(window.musicStudio.audioContext.currentTime + 0.1);
        }
    }

    updateBeatDisplay() {
        const beatIndicator = document.getElementById('beat-indicator');
        const beatCounter = document.getElementById('beat-counter');
        
        if (beatIndicator) {
            beatIndicator.classList.add('pulse');
            setTimeout(() => {
                beatIndicator.classList.remove('pulse');
            }, 100);
        }
        
        if (beatCounter) {
            beatCounter.textContent = this.beatCount;
        }
        
        this.beatCount = this.beatCount % 4 + 1; // 4/4 time
    }

    toggleBeatPatterns() {
        const beatPatternsDiv = document.getElementById('beat-patterns');
        if (beatPatternsDiv) {
            if (beatPatternsDiv.style.display === 'none') {
                beatPatternsDiv.style.display = 'block';
            } else {
                beatPatternsDiv.style.display = 'none';
            }
        }
    }

    selectPattern(patternName, buttonElement) {
        // Update button states
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        buttonElement.classList.add('active');
        
        this.currentPattern = this.beatPatterns[patternName];
        
        // Enable play button
        const playPatternBtn = document.getElementById('play-pattern');
        if (playPatternBtn) {
            playPatternBtn.disabled = false;
        }
        
        window.musicStudio.showNotification(`Pattern selected: ${this.currentPattern.name}`, 'info');
    }

    playPattern() {
        if (!this.currentPattern || this.isPatternPlaying) return;
        
        this.isPatternPlaying = true;
        const playBtn = document.getElementById('play-pattern');
        const stopBtn = document.getElementById('stop-pattern');
        
        if (playBtn) {
            playBtn.disabled = true;
            playBtn.classList.add('active');
        }
        if (stopBtn) {
            stopBtn.disabled = false;
        }
        
        const beatDuration = 60000 / this.bpm; // ms per beat
        const patternDuration = 2000; // 2 beats pattern
        
        const playPatternLoop = () => {
            this.currentPattern.pattern.forEach(beat => {
                setTimeout(() => {
                    if (this.isPatternPlaying) {
                        beat.drums.forEach(drumType => {
                            const pad = document.querySelector(`[data-sound="${drumType}"]`);
                            if (pad) {
                                this.playDrumSound(drumType, pad);
                                pad.classList.add('pattern-hit');
                                setTimeout(() => {
                                    pad.classList.remove('pattern-hit');
                                }, 100);
                            }
                        });
                    }
                }, beat.time * beatDuration);
            });
            
            if (this.isPatternPlaying) {
                this.patternInterval = setTimeout(playPatternLoop, patternDuration);
            }
        };
        
        playPatternLoop();
        window.musicStudio.showNotification(`Playing: ${this.currentPattern.name}`, 'success');
    }

    stopPattern() {
        this.isPatternPlaying = false;
        
        if (this.patternInterval) {
            clearTimeout(this.patternInterval);
            this.patternInterval = null;
        }
        
        const playBtn = document.getElementById('play-pattern');
        const stopBtn = document.getElementById('stop-pattern');
        
        if (playBtn) {
            playBtn.disabled = false;
            playBtn.classList.remove('active');
        }
        if (stopBtn) {
            stopBtn.disabled = true;
        }
        
        window.musicStudio.showNotification('Pattern stopped', 'info');
    }
}

// Initialize drum kit
const drumKit = new VirtualDrumKit();
