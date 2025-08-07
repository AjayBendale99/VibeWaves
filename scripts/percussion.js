// Professional Percussion JavaScript
class ProfessionalPercussion {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.reverbGain = null;
        this.volume = 0.8;
        this.reverbLevel = 0.25;
        this.activePads = new Set();
        
        // Keyboard mapping for all percussion sounds
        this.keyMap = {
            // Latin Percussion
            'q': 'conga-low',
            'w': 'conga-mid', 
            'e': 'conga-high',
            'r': 'conga-slap',
            'a': 'bongo-low',
            's': 'bongo-high',
            'd': 'bongo-rim',
            'f': 'bongo-side',
            
            // Hand Percussion
            'z': 'shaker',
            'x': 'maracas',
            'c': 'tambourine',
            'v': 'claves',
            't': 'woodblock',
            'y': 'cowbell',
            'u': 'triangle',
            'i': 'agogo',
            
            // World Percussion
            'g': 'djembe-bass',
            'h': 'djembe-tone',
            'j': 'djembe-slap',
            'k': 'djembe-ghost',
            'b': 'cajon-bass',
            'n': 'cajon-snare',
            'm': 'cajon-tap',
            ',': 'cajon-brush',
            
            // Effects
            '1': 'rain-stick',
            '2': 'ocean-drum',
            '3': 'wind-chimes',
            '4': 'thunder-sheet',
            
            // Silence
            ' ': 'silence'
        };
        
        // Percussion sound definitions with realistic synthesis parameters
        this.percussionSounds = {
            // Congas
            'conga-low': { 
                type: 'membrane', 
                frequency: 85, 
                decay: 1.2, 
                resonance: 2.5,
                filterFreq: 300,
                name: 'Conga Low'
            },
            'conga-mid': { 
                type: 'membrane', 
                frequency: 110, 
                decay: 1.0, 
                resonance: 2.2,
                filterFreq: 400,
                name: 'Conga Mid'
            },
            'conga-high': { 
                type: 'membrane', 
                frequency: 140, 
                decay: 0.8, 
                resonance: 2.0,
                filterFreq: 500,
                name: 'Conga High'
            },
            'conga-slap': { 
                type: 'slap', 
                frequency: 180, 
                decay: 0.3, 
                resonance: 1.5,
                filterFreq: 2000,
                name: 'Conga Slap'
            },
            
            // Bongos
            'bongo-low': { 
                type: 'membrane', 
                frequency: 200, 
                decay: 0.6, 
                resonance: 3.0,
                filterFreq: 600,
                name: 'Bongo Low'
            },
            'bongo-high': { 
                type: 'membrane', 
                frequency: 300, 
                decay: 0.5, 
                resonance: 2.8,
                filterFreq: 800,
                name: 'Bongo High'
            },
            'bongo-rim': { 
                type: 'metallic', 
                frequency: 1500, 
                decay: 0.2, 
                resonance: 0.5,
                filterFreq: 3000,
                name: 'Bongo Rim'
            },
            'bongo-side': { 
                type: 'wood', 
                frequency: 800, 
                decay: 0.15, 
                resonance: 1.0,
                filterFreq: 1200,
                name: 'Bongo Side'
            },
            
            // Hand Percussion
            'shaker': { 
                type: 'noise', 
                frequency: 8000, 
                decay: 0.3, 
                resonance: 0.3,
                filterFreq: 6000,
                name: 'Shaker'
            },
            'maracas': { 
                type: 'noise', 
                frequency: 6000, 
                decay: 0.4, 
                resonance: 0.4,
                filterFreq: 5000,
                name: 'Maracas'
            },
            'tambourine': { 
                type: 'metallic', 
                frequency: 4000, 
                decay: 1.5, 
                resonance: 0.8,
                filterFreq: 8000,
                name: 'Tambourine'
            },
            'claves': { 
                type: 'wood', 
                frequency: 2500, 
                decay: 0.1, 
                resonance: 0.2,
                filterFreq: 4000,
                name: 'Claves'
            },
            'woodblock': { 
                type: 'wood', 
                frequency: 1800, 
                decay: 0.2, 
                resonance: 0.5,
                filterFreq: 3500,
                name: 'Woodblock'
            },
            'cowbell': { 
                type: 'metallic', 
                frequency: 800, 
                decay: 0.8, 
                resonance: 2.0,
                filterFreq: 2000,
                name: 'Cowbell'
            },
            'triangle': { 
                type: 'metallic', 
                frequency: 3000, 
                decay: 3.0, 
                resonance: 0.1,
                filterFreq: 10000,
                name: 'Triangle'
            },
            'agogo': { 
                type: 'metallic', 
                frequency: 1200, 
                decay: 0.6, 
                resonance: 1.5,
                filterFreq: 2500,
                name: 'Agogo'
            },
            
            // World Percussion
            'djembe-bass': { 
                type: 'membrane', 
                frequency: 60, 
                decay: 1.5, 
                resonance: 3.5,
                filterFreq: 200,
                name: 'Djembe Bass'
            },
            'djembe-tone': { 
                type: 'membrane', 
                frequency: 150, 
                decay: 1.0, 
                resonance: 2.5,
                filterFreq: 500,
                name: 'Djembe Tone'
            },
            'djembe-slap': { 
                type: 'slap', 
                frequency: 250, 
                decay: 0.4, 
                resonance: 1.0,
                filterFreq: 3000,
                name: 'Djembe Slap'
            },
            'djembe-ghost': { 
                type: 'brush', 
                frequency: 400, 
                decay: 0.2, 
                resonance: 0.5,
                filterFreq: 1500,
                name: 'Djembe Ghost'
            },
            'cajon-bass': { 
                type: 'membrane', 
                frequency: 80, 
                decay: 0.8, 
                resonance: 2.0,
                filterFreq: 250,
                name: 'Cajon Bass'
            },
            'cajon-snare': { 
                type: 'snare', 
                frequency: 200, 
                decay: 0.4, 
                resonance: 1.5,
                filterFreq: 2000,
                name: 'Cajon Snare'
            },
            'cajon-tap': { 
                type: 'wood', 
                frequency: 1000, 
                decay: 0.2, 
                resonance: 0.8,
                filterFreq: 2500,
                name: 'Cajon Tap'
            },
            'cajon-brush': { 
                type: 'brush', 
                frequency: 300, 
                decay: 0.3, 
                resonance: 0.6,
                filterFreq: 1000,
                name: 'Cajon Brush'
            },
            
            // Atmospheric Effects
            'rain-stick': { 
                type: 'atmosphere', 
                frequency: 1000, 
                decay: 3.0, 
                resonance: 0.2,
                filterFreq: 2000,
                name: 'Rain Stick'
            },
            'ocean-drum': { 
                type: 'atmosphere', 
                frequency: 100, 
                decay: 4.0, 
                resonance: 0.3,
                filterFreq: 500,
                name: 'Ocean Drum'
            },
            'wind-chimes': { 
                type: 'metallic', 
                frequency: 2000, 
                decay: 5.0, 
                resonance: 0.1,
                filterFreq: 8000,
                name: 'Wind Chimes'
            },
            'thunder-sheet': { 
                type: 'atmosphere', 
                frequency: 50, 
                decay: 6.0, 
                resonance: 0.4,
                filterFreq: 200,
                name: 'Thunder Sheet'
            }
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create audio graph
            this.masterGain = this.audioContext.createGain();
            this.reverbGain = this.audioContext.createGain();
            
            // Create reverb
            await this.createReverb();
            
            // Connect audio graph
            this.masterGain.connect(this.audioContext.destination);
            this.reverbGain.connect(this.audioContext.destination);
            
            this.setupEventListeners();
            this.setupControls();
            
            console.log('Professional Percussion initialized successfully');
        } catch (error) {
            console.error('Failed to initialize percussion:', error);
        }
    }
    
    async createReverb() {
        const convolver = this.audioContext.createConvolver();
        
        // Create impulse response for reverb
        const length = this.audioContext.sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const decay = Math.pow(1 - i / length, 2);
                channelData[i] = (Math.random() * 2 - 1) * decay;
            }
        }
        
        convolver.buffer = impulse;
        this.reverb = convolver;
    }
    
    setupEventListeners() {
        // Pad click events
        document.querySelectorAll('.percussion-pad').forEach(pad => {
            pad.addEventListener('mousedown', (e) => {
                e.preventDefault();
                const sound = pad.dataset.sound;
                this.playPercussion(sound, pad);
            });
            
            pad.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const sound = pad.dataset.sound;
                this.playPercussion(sound, pad);
            });
        });
        
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (this.keyMap[key] && !this.activePads.has(key)) {
                e.preventDefault();
                this.activePads.add(key);
                
                const sound = this.keyMap[key];
                if (sound === 'silence') {
                    this.silenceAll();
                    return;
                }
                
                const pad = document.querySelector(`[data-sound="${sound}"]`);
                if (pad) {
                    this.playPercussion(sound, pad);
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.activePads.delete(key);
        });
    }
    
    setupControls() {
        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
                e.target.nextElementSibling.textContent = e.target.value + '%';
            });
        }
        
        // Reverb control
        const reverbSlider = document.getElementById('reverbSlider');
        if (reverbSlider) {
            reverbSlider.addEventListener('input', (e) => {
                this.reverbLevel = e.target.value / 100;
                this.reverbGain.gain.setValueAtTime(this.reverbLevel, this.audioContext.currentTime);
                e.target.nextElementSibling.textContent = e.target.value + '%';
            });
        }
    }
    
    playPercussion(soundName, padElement) {
        if (!this.audioContext || !this.percussionSounds[soundName]) return;
        
        const sound = this.percussionSounds[soundName];
        const now = this.audioContext.currentTime;
        
        // Visual feedback
        this.addVisualFeedback(padElement, sound.name);
        
        // Play sound based on type
        switch (sound.type) {
            case 'membrane':
                this.createMembraneSound(sound, now);
                break;
            case 'metallic':
                this.createMetallicSound(sound, now);
                break;
            case 'wood':
                this.createWoodSound(sound, now);
                break;
            case 'noise':
                this.createNoiseSound(sound, now);
                break;
            case 'slap':
                this.createSlapSound(sound, now);
                break;
            case 'snare':
                this.createSnareSound(sound, now);
                break;
            case 'brush':
                this.createBrushSound(sound, now);
                break;
            case 'atmosphere':
                this.createAtmosphereSound(sound, now);
                break;
        }
    }
    
    createMembraneSound(sound, startTime) {
        // Main membrane oscillator
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(sound.frequency, startTime);
        osc.frequency.exponentialRampToValueAtTime(sound.frequency * 0.5, startTime + 0.1);
        
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(sound.filterFreq, startTime);
        filter.Q.setValueAtTime(sound.resonance, startTime);
        
        // Envelope
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.8, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(this.volume * 0.3, startTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + sound.decay);
        
        // Connect and add reverb
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        // Add to reverb
        const reverbSend = this.audioContext.createGain();
        reverbSend.gain.setValueAtTime(this.reverbLevel * 0.3, startTime);
        gain.connect(reverbSend);
        reverbSend.connect(this.reverb);
        this.reverb.connect(this.reverbGain);
        
        osc.start(startTime);
        osc.stop(startTime + sound.decay);
    }
    
    createMetallicSound(sound, startTime) {
        // Multiple oscillators for metallic timbre
        for (let i = 0; i < 4; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            const freq = sound.frequency * (1 + i * 0.7 + Math.random() * 0.1);
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, startTime);
            
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(freq, startTime);
            filter.Q.setValueAtTime(sound.resonance, startTime);
            
            const amplitude = this.volume * 0.2 / (i + 1);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(amplitude, startTime + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + sound.decay);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            // Add reverb
            const reverbSend = this.audioContext.createGain();
            reverbSend.gain.setValueAtTime(this.reverbLevel * 0.6, startTime);
            gain.connect(reverbSend);
            reverbSend.connect(this.reverb);
            
            osc.start(startTime);
            osc.stop(startTime + sound.decay);
        }
    }
    
    createWoodSound(sound, startTime) {
        // Sharp attack with quick decay
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(sound.frequency, startTime);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(sound.filterFreq, startTime);
        filter.Q.setValueAtTime(sound.resonance, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.6, startTime + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + sound.decay);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        osc.start(startTime);
        osc.stop(startTime + sound.decay);
    }
    
    createNoiseSound(sound, startTime) {
        // Filtered noise
        const bufferSize = this.audioContext.sampleRate * sound.decay;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const source = this.audioContext.createBufferSource();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        source.buffer = buffer;
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(sound.filterFreq, startTime);
        filter.Q.setValueAtTime(sound.resonance, startTime);
        
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + sound.decay);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        source.start(startTime);
    }
    
    createSlapSound(sound, startTime) {
        // Combination of membrane and noise
        this.createMembraneSound({...sound, decay: sound.decay * 0.3}, startTime);
        this.createNoiseSound({...sound, decay: sound.decay * 0.5, filterFreq: sound.filterFreq * 2}, startTime);
    }
    
    createSnareSound(sound, startTime) {
        // Membrane + noise for snare effect
        this.createMembraneSound(sound, startTime);
        this.createNoiseSound({...sound, filterFreq: 2000, decay: sound.decay * 0.8}, startTime);
    }
    
    createBrushSound(sound, startTime) {
        // Soft filtered noise
        this.createNoiseSound({...sound, filterFreq: sound.filterFreq * 0.5, decay: sound.decay * 1.5}, startTime);
    }
    
    createAtmosphereSound(sound, startTime) {
        // Complex evolving sound
        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();
            
            const freq = sound.frequency * (1 + i * 0.5);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            osc.frequency.linearRampToValueAtTime(freq * 1.2, startTime + sound.decay);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(sound.filterFreq, startTime);
            filter.frequency.linearRampToValueAtTime(sound.filterFreq * 0.3, startTime + sound.decay);
            
            const amplitude = this.volume * 0.2 / (i + 1);
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(amplitude, startTime + 0.5);
            gain.gain.linearRampToValueAtTime(amplitude * 0.3, startTime + sound.decay * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + sound.decay);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            // Heavy reverb for atmosphere
            const reverbSend = this.audioContext.createGain();
            reverbSend.gain.setValueAtTime(this.reverbLevel * 0.8, startTime);
            gain.connect(reverbSend);
            reverbSend.connect(this.reverb);
            
            osc.start(startTime);
            osc.stop(startTime + sound.decay);
        }
    }
    
    addVisualFeedback(padElement, instrumentName) {
        // Activate pad
        padElement.classList.add('active');
        
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'percussion-ripple';
        padElement.appendChild(ripple);
        
        // Update performance display
        const playingInstrument = document.querySelector('.playing-instrument');
        if (playingInstrument) {
            playingInstrument.textContent = instrumentName;
        }
        
        // Remove effects
        setTimeout(() => {
            padElement.classList.remove('active');
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 300);
        
        // Reset display
        setTimeout(() => {
            if (playingInstrument && playingInstrument.textContent === instrumentName) {
                playingInstrument.textContent = 'Ready to play';
            }
        }, 1000);
    }
    
    silenceAll() {
        // Stop all currently playing sounds
        if (this.audioContext) {
            this.audioContext.close().then(() => {
                this.init();
            });
        }
        
        // Remove all visual feedback
        document.querySelectorAll('.percussion-pad.active').forEach(pad => {
            pad.classList.remove('active');
        });
        
        // Update display
        const playingInstrument = document.querySelector('.playing-instrument');
        if (playingInstrument) {
            playingInstrument.textContent = 'Silenced';
            setTimeout(() => {
                playingInstrument.textContent = 'Ready to play';
            }, 1000);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.professionalPercussion = new ProfessionalPercussion();
});
