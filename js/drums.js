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
        
        // Visual feedback
        padElement.classList.add('active', 'hit');
        setTimeout(() => {
            padElement.classList.remove('active', 'hit');
        }, 150);
        
        // Play sound
        if (sound.type === 'noise') {
            this.playNoiseSound(sound);
        } else {
            this.playTonalSound(sound);
        }
        
        // Record if recording
        if (this.isRecording) {
            this.recordedBeats.push({
                sound: soundType,
                time: Date.now() - this.recordingStartTime
            });
        }
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
