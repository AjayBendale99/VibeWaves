// Synthesizer.js - Advanced Virtual Synthesizer Implementation
class VirtualSynthesizer {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.activeOscillators = new Map();
        this.currentOctave = 4;
        this.isSequencerPlaying = false;
        this.currentStep = 0;
        this.sequenceSteps = new Array(16).fill(false);
        this.tempo = 120;
        
        // Synthesizer parameters
        this.params = {
            osc1: {
                wave: 'square',
                octave: 0,
                detune: 0,
                level: 80
            },
            osc2: {
                wave: 'sawtooth',
                octave: -1,
                detune: 7,
                level: 60
            },
            filter: {
                type: 'lowpass',
                cutoff: 2000,
                resonance: 1,
                envelope: 50
            },
            ampEnvelope: {
                attack: 0.1,
                decay: 0.3,
                sustain: 0.7,
                release: 0.5
            },
            filterEnvelope: {
                attack: 0.2,
                decay: 0.8,
                sustain: 0.3,
                release: 1.0
            },
            lfo: {
                wave: 'sine',
                rate: 2,
                pitchMod: 0,
                filterMod: 30,
                ampMod: 0
            },
            effects: {
                distortion: { enabled: false, drive: 0 },
                reverb: { enabled: true, size: 30 },
                delay: { enabled: false, time: 250, feedback: 30 }
            },
            masterVolume: 70
        };
        
        this.presets = this.initializePresets();
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.setupAudioChain();
            this.setupEventListeners();
            this.generateKeyboard();
            this.generateStepGrid();
            this.loadPreset('lead');
            this.updateAllDisplays();
            this.setupVisualization();
            console.log('Virtual Synthesizer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Virtual Synthesizer:', error);
            this.showNotification('Failed to initialize audio. Please check your browser permissions.', 'error');
        }
    }

    setupAudioChain() {
        // Create master gain
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.params.masterVolume / 100;
        
        // Create LFO
        this.lfo = this.audioContext.createOscillator();
        this.lfoGain = this.audioContext.createGain();
        this.lfo.type = this.params.lfo.wave;
        this.lfo.frequency.value = this.params.lfo.rate;
        this.lfoGain.gain.value = 0;
        this.lfo.connect(this.lfoGain);
        this.lfo.start();
        
        // Create effects
        this.setupEffects();
        
        // Connect to destination
        this.masterGain.connect(this.audioContext.destination);
    }

    setupEffects() {
        // Distortion
        this.distortion = this.audioContext.createWaveShaper();
        this.setupDistortion();
        
        // Reverb
        this.reverb = this.audioContext.createConvolver();
        this.reverbGain = this.audioContext.createGain();
        this.setupReverb();
        
        // Delay
        this.delay = this.audioContext.createDelay(1.0);
        this.delayFeedback = this.audioContext.createGain();
        this.delayGain = this.audioContext.createGain();
        this.setupDelay();
    }

    setupDistortion() {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            const drive = this.params.effects.distortion.drive / 100;
            curve[i] = ((3 + drive * 20) * x * 20 * deg) / (Math.PI + drive * 20 * Math.abs(x));
        }
        
        this.distortion.curve = curve;
        this.distortion.oversample = '4x';
    }

    setupReverb() {
        const length = this.audioContext.sampleRate * (this.params.effects.reverb.size / 50 + 0.5);
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.reverb.buffer = impulse;
        this.reverbGain.gain.value = this.params.effects.reverb.size / 100;
    }

    setupDelay() {
        this.delay.delayTime.value = this.params.effects.delay.time / 1000;
        this.delayFeedback.gain.value = this.params.effects.delay.feedback / 100;
        this.delayGain.gain.value = this.params.effects.delay.enabled ? 0.3 : 0;
        
        this.delay.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delay);
        this.delay.connect(this.delayGain);
    }

    createSynthVoice(frequency, velocity = 1.0) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const voice = {
            oscillators: [],
            filter: this.audioContext.createBiquadFilter(),
            ampGain: this.audioContext.createGain(),
            filterGain: this.audioContext.createGain(),
            startTime: this.audioContext.currentTime
        };

        // Create oscillators
        for (let i = 1; i <= 2; i++) {
            const osc = this.audioContext.createOscillator();
            const oscGain = this.audioContext.createGain();
            const params = this.params[`osc${i}`];
            
            osc.type = params.wave;
            osc.frequency.value = frequency * Math.pow(2, params.octave) * (1 + params.detune / 1200);
            oscGain.gain.value = (params.level / 100) * velocity;
            
            osc.connect(oscGain);
            oscGain.connect(voice.filter);
            
            voice.oscillators.push({ osc, gain: oscGain });
        }

        // Setup filter
        voice.filter.type = this.params.filter.type;
        voice.filter.frequency.value = this.params.filter.cutoff;
        voice.filter.Q.value = this.params.filter.resonance;
        
        // Filter envelope
        const filterEnv = this.params.filterEnvelope;
        const filterMod = this.params.filter.envelope / 100;
        const baseFreq = this.params.filter.cutoff;
        const maxFreq = Math.min(baseFreq * (1 + filterMod * 10), 20000);
        
        voice.filter.frequency.setValueAtTime(baseFreq, voice.startTime);
        voice.filter.frequency.linearRampToValueAtTime(maxFreq, voice.startTime + filterEnv.attack);
        voice.filter.frequency.exponentialRampToValueAtTime(
            baseFreq + (maxFreq - baseFreq) * filterEnv.sustain,
            voice.startTime + filterEnv.attack + filterEnv.decay
        );

        // Amplitude envelope
        const ampEnv = this.params.ampEnvelope;
        voice.ampGain.gain.setValueAtTime(0, voice.startTime);
        voice.ampGain.gain.linearRampToValueAtTime(velocity, voice.startTime + ampEnv.attack);
        voice.ampGain.gain.exponentialRampToValueAtTime(
            velocity * ampEnv.sustain,
            voice.startTime + ampEnv.attack + ampEnv.decay
        );

        // Connect voice to effects chain
        voice.filter.connect(voice.ampGain);
        this.connectToEffectsChain(voice.ampGain);

        // Start oscillators
        voice.oscillators.forEach(({ osc }) => {
            osc.start(voice.startTime);
        });

        return voice;
    }

    connectToEffectsChain(source) {
        let currentNode = source;
        
        // Distortion
        if (this.params.effects.distortion.enabled) {
            currentNode.connect(this.distortion);
            currentNode = this.distortion;
        }
        
        // Parallel reverb
        if (this.params.effects.reverb.enabled) {
            currentNode.connect(this.reverb);
            this.reverb.connect(this.reverbGain);
            this.reverbGain.connect(this.masterGain);
        }
        
        // Delay
        if (this.params.effects.delay.enabled) {
            currentNode.connect(this.delay);
            this.delayGain.connect(this.masterGain);
        }
        
        // Direct to master
        currentNode.connect(this.masterGain);
    }

    playNote(note, velocity = 1.0) {
        const frequency = this.noteToFrequency(note);
        const voice = this.createSynthVoice(frequency, velocity);
        this.activeOscillators.set(note, voice);
        
        // Visual feedback
        const keyElement = document.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.add('active');
        }
    }

    stopNote(note) {
        const voice = this.activeOscillators.get(note);
        if (!voice) return;

        const releaseTime = this.audioContext.currentTime;
        const releaseDuration = this.params.ampEnvelope.release;
        
        // Release amplitude envelope
        voice.ampGain.gain.cancelScheduledValues(releaseTime);
        voice.ampGain.gain.setValueAtTime(voice.ampGain.gain.value, releaseTime);
        voice.ampGain.gain.exponentialRampToValueAtTime(0.001, releaseTime + releaseDuration);
        
        // Release filter envelope
        const filterRelease = this.params.filterEnvelope.release;
        voice.filter.frequency.cancelScheduledValues(releaseTime);
        voice.filter.frequency.setValueAtTime(voice.filter.frequency.value, releaseTime);
        voice.filter.frequency.exponentialRampToValueAtTime(
            this.params.filter.cutoff * 0.1,
            releaseTime + filterRelease
        );

        // Stop oscillators
        setTimeout(() => {
            voice.oscillators.forEach(({ osc }) => {
                try {
                    osc.stop();
                } catch (e) {
                    // Oscillator already stopped
                }
            });
            this.activeOscillators.delete(note);
        }, releaseDuration * 1000 + 100);

        // Remove visual feedback
        const keyElement = document.querySelector(`[data-note="${note}"]`);
        if (keyElement) {
            keyElement.classList.remove('active');
        }
    }

    setupEventListeners() {
        // Preset controls
        document.getElementById('presetSelect').addEventListener('change', (e) => {
            this.loadPreset(e.target.value);
        });

        // Oscillator controls
        this.setupOscillatorControls();
        
        // Filter controls
        this.setupFilterControls();
        
        // Envelope controls
        this.setupEnvelopeControls();
        
        // LFO controls
        this.setupLFOControls();
        
        // Effects controls
        this.setupEffectsControls();
        
        // Keyboard controls
        this.setupKeyboardControls();
        
        // Sequencer controls
        this.setupSequencerControls();
        
        // Master volume
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.params.masterVolume = e.target.value;
            this.masterGain.gain.value = e.target.value / 100;
            document.getElementById('masterVolumeValue').textContent = e.target.value;
        });
    }

    setupOscillatorControls() {
        for (let i = 1; i <= 2; i++) {
            const prefix = `osc${i}`;
            
            document.getElementById(`${prefix}Wave`).addEventListener('change', (e) => {
                this.params[prefix].wave = e.target.value;
            });
            
            document.getElementById(`${prefix}Octave`).addEventListener('input', (e) => {
                this.params[prefix].octave = parseInt(e.target.value);
                document.getElementById(`${prefix}OctaveValue`).textContent = e.target.value;
            });
            
            document.getElementById(`${prefix}Detune`).addEventListener('input', (e) => {
                this.params[prefix].detune = parseInt(e.target.value);
                document.getElementById(`${prefix}DetuneValue`).textContent = e.target.value;
            });
            
            document.getElementById(`${prefix}Level`).addEventListener('input', (e) => {
                this.params[prefix].level = parseInt(e.target.value);
                document.getElementById(`${prefix}LevelValue`).textContent = e.target.value;
            });
        }
    }

    setupFilterControls() {
        document.getElementById('filterType').addEventListener('change', (e) => {
            this.params.filter.type = e.target.value;
        });
        
        document.getElementById('filterCutoff').addEventListener('input', (e) => {
            this.params.filter.cutoff = parseInt(e.target.value);
            document.getElementById('filterCutoffValue').textContent = e.target.value;
        });
        
        document.getElementById('filterResonance').addEventListener('input', (e) => {
            this.params.filter.resonance = parseInt(e.target.value);
            document.getElementById('filterResonanceValue').textContent = e.target.value;
        });
        
        document.getElementById('filterEnvelope').addEventListener('input', (e) => {
            this.params.filter.envelope = parseInt(e.target.value);
            document.getElementById('filterEnvelopeValue').textContent = e.target.value;
        });
    }

    setupEnvelopeControls() {
        const envelopes = ['ampEnvelope', 'filterEnvelope'];
        const stages = ['Attack', 'Decay', 'Sustain', 'Release'];
        
        envelopes.forEach(envType => {
            const prefix = envType === 'ampEnvelope' ? 'amp' : 'filter';
            
            stages.forEach(stage => {
                const elementId = `${prefix}${stage}`;
                const valueId = `${prefix}${stage}Value`;
                const element = document.getElementById(elementId);
                
                if (element) {
                    element.addEventListener('input', (e) => {
                        this.params[envType][stage.toLowerCase()] = parseFloat(e.target.value);
                        document.getElementById(valueId).textContent = e.target.value;
                        this.updateEnvelopeVisualization(envType);
                    });
                }
            });
        });
    }

    setupLFOControls() {
        document.getElementById('lfoWave').addEventListener('change', (e) => {
            this.params.lfo.wave = e.target.value;
            this.lfo.type = e.target.value;
        });
        
        document.getElementById('lfoRate').addEventListener('input', (e) => {
            this.params.lfo.rate = parseFloat(e.target.value);
            this.lfo.frequency.value = e.target.value;
            document.getElementById('lfoRateValue').textContent = e.target.value;
        });
        
        document.getElementById('lfoPitchMod').addEventListener('input', (e) => {
            this.params.lfo.pitchMod = parseInt(e.target.value);
            document.getElementById('lfoPitchModValue').textContent = e.target.value;
        });
        
        document.getElementById('lfoFilterMod').addEventListener('input', (e) => {
            this.params.lfo.filterMod = parseInt(e.target.value);
            document.getElementById('lfoFilterModValue').textContent = e.target.value;
        });
        
        document.getElementById('lfoAmpMod').addEventListener('input', (e) => {
            this.params.lfo.ampMod = parseInt(e.target.value);
            document.getElementById('lfoAmpModValue').textContent = e.target.value;
        });
    }

    setupEffectsControls() {
        // Distortion
        document.getElementById('distortionOn').addEventListener('change', (e) => {
            this.params.effects.distortion.enabled = e.target.checked;
        });
        
        document.getElementById('distortionDrive').addEventListener('input', (e) => {
            this.params.effects.distortion.drive = parseInt(e.target.value);
            document.getElementById('distortionDriveValue').textContent = e.target.value;
            this.setupDistortion();
        });
        
        // Reverb
        document.getElementById('reverbOn').addEventListener('change', (e) => {
            this.params.effects.reverb.enabled = e.target.checked;
        });
        
        document.getElementById('reverbSize').addEventListener('input', (e) => {
            this.params.effects.reverb.size = parseInt(e.target.value);
            document.getElementById('reverbSizeValue').textContent = e.target.value;
            this.setupReverb();
        });
        
        // Delay
        document.getElementById('delayOn').addEventListener('change', (e) => {
            this.params.effects.delay.enabled = e.target.checked;
            this.delayGain.gain.value = e.target.checked ? 0.3 : 0;
        });
        
        document.getElementById('delayTime').addEventListener('input', (e) => {
            this.params.effects.delay.time = parseInt(e.target.value);
            document.getElementById('delayTimeValue').textContent = e.target.value;
            this.delay.delayTime.value = e.target.value / 1000;
        });
        
        document.getElementById('delayFeedback').addEventListener('input', (e) => {
            this.params.effects.delay.feedback = parseInt(e.target.value);
            document.getElementById('delayFeedbackValue').textContent = e.target.value;
            this.delayFeedback.gain.value = e.target.value / 100;
        });
    }

    setupKeyboardControls() {
        // Octave controls
        document.getElementById('octaveDown').addEventListener('click', () => {
            if (this.currentOctave > 1) {
                this.currentOctave--;
                this.updateOctaveDisplay();
                this.generateKeyboard();
            }
        });
        
        document.getElementById('octaveUp').addEventListener('click', () => {
            if (this.currentOctave < 7) {
                this.currentOctave++;
                this.updateOctaveDisplay();
                this.generateKeyboard();
            }
        });
        
        // Computer keyboard mapping
        this.setupComputerKeyboard();
    }

    setupComputerKeyboard() {
        const keyMap = {
            'KeyA': 'C', 'KeyW': 'C#', 'KeyS': 'D', 'KeyE': 'D#', 'KeyD': 'E',
            'KeyF': 'F', 'KeyT': 'F#', 'KeyG': 'G', 'KeyY': 'G#', 'KeyH': 'A',
            'KeyU': 'A#', 'KeyJ': 'B', 'KeyK': 'C', 'KeyO': 'C#', 'KeyL': 'D'
        };
        
        const pressedKeys = new Set();
        
        document.addEventListener('keydown', (e) => {
            if (pressedKeys.has(e.code)) return;
            pressedKeys.add(e.code);
            
            if (keyMap[e.code]) {
                const note = keyMap[e.code];
                const octave = note === 'C' && e.code === 'KeyK' ? this.currentOctave + 1 : this.currentOctave;
                const noteId = `${note}${octave}`;
                this.playNote(noteId);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            pressedKeys.delete(e.code);
            
            if (keyMap[e.code]) {
                const note = keyMap[e.code];
                const octave = note === 'C' && e.code === 'KeyK' ? this.currentOctave + 1 : this.currentOctave;
                const noteId = `${note}${octave}`;
                this.stopNote(noteId);
            }
        });
    }

    setupSequencerControls() {
        document.getElementById('playSequence').addEventListener('click', () => {
            this.toggleSequencer();
        });
        
        document.getElementById('stopSequence').addEventListener('click', () => {
            this.stopSequencer();
        });
        
        document.getElementById('clearSequence').addEventListener('click', () => {
            this.clearSequencer();
        });
        
        document.getElementById('sequencerTempo').addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            document.getElementById('sequencerTempoValue').textContent = e.target.value;
        });
    }

    generateKeyboard() {
        const keyboard = document.getElementById('synthKeyboard');
        keyboard.innerHTML = '';
        
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const keyContainer = document.createElement('div');
        keyContainer.style.position = 'relative';
        keyContainer.style.display = 'flex';
        
        // Create white keys first
        notes.forEach((note, index) => {
            if (!note.includes('#')) {
                const key = document.createElement('div');
                key.className = 'synth-key white';
                key.dataset.note = `${note}${this.currentOctave}`;
                
                key.addEventListener('mousedown', () => {
                    this.playNote(key.dataset.note);
                });
                
                key.addEventListener('mouseup', () => {
                    this.stopNote(key.dataset.note);
                });
                
                key.addEventListener('mouseleave', () => {
                    this.stopNote(key.dataset.note);
                });
                
                keyContainer.appendChild(key);
            }
        });
        
        // Create black keys
        const blackKeyPositions = [0.5, 1.5, 3.5, 4.5, 5.5]; // Position relative to white keys
        notes.forEach((note, index) => {
            if (note.includes('#')) {
                const key = document.createElement('div');
                key.className = 'synth-key black';
                key.dataset.note = `${note}${this.currentOctave}`;
                key.style.left = `${blackKeyPositions[Math.floor(index / 2)] * 42}px`;
                
                key.addEventListener('mousedown', () => {
                    this.playNote(key.dataset.note);
                });
                
                key.addEventListener('mouseup', () => {
                    this.stopNote(key.dataset.note);
                });
                
                key.addEventListener('mouseleave', () => {
                    this.stopNote(key.dataset.note);
                });
                
                keyContainer.appendChild(key);
            }
        });
        
        keyboard.appendChild(keyContainer);
    }

    generateStepGrid() {
        const stepGrid = document.getElementById('stepGrid');
        stepGrid.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const step = document.createElement('div');
            step.className = 'step';
            step.textContent = i + 1;
            step.dataset.step = i;
            
            step.addEventListener('click', () => {
                this.sequenceSteps[i] = !this.sequenceSteps[i];
                step.classList.toggle('active', this.sequenceSteps[i]);
            });
            
            stepGrid.appendChild(step);
        }
    }

    toggleSequencer() {
        if (this.isSequencerPlaying) {
            this.stopSequencer();
        } else {
            this.startSequencer();
        }
    }

    startSequencer() {
        this.isSequencerPlaying = true;
        this.currentStep = 0;
        
        const playBtn = document.getElementById('playSequence');
        playBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        
        this.sequencerInterval = setInterval(() => {
            this.playSequencerStep();
        }, (60 / this.tempo / 4) * 1000); // 16th notes
        
        this.showNotification('Sequencer started', 'success');
    }

    stopSequencer() {
        this.isSequencerPlaying = false;
        this.currentStep = 0;
        
        if (this.sequencerInterval) {
            clearInterval(this.sequencerInterval);
        }
        
        const playBtn = document.getElementById('playSequence');
        playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
        
        // Remove visual indicators
        document.querySelectorAll('.step.playing').forEach(step => {
            step.classList.remove('playing');
        });
        
        this.showNotification('Sequencer stopped', 'info');
    }

    playSequencerStep() {
        // Remove previous step highlight
        document.querySelectorAll('.step.playing').forEach(step => {
            step.classList.remove('playing');
        });
        
        // Highlight current step
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('playing');
        }
        
        // Play note if step is active
        if (this.sequenceSteps[this.currentStep]) {
            const note = `C${this.currentOctave}`;
            this.playNote(note, 0.8);
            setTimeout(() => this.stopNote(note), 100);
        }
        
        this.currentStep = (this.currentStep + 1) % 16;
    }

    clearSequencer() {
        this.sequenceSteps.fill(false);
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        this.showNotification('Sequencer cleared', 'info');
    }

    initializePresets() {
        return {
            lead: {
                osc1: { wave: 'sawtooth', octave: 0, detune: 0, level: 80 },
                osc2: { wave: 'square', octave: 0, detune: 7, level: 40 },
                filter: { type: 'lowpass', cutoff: 3000, resonance: 8, envelope: 70 },
                ampEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.6, release: 0.3 },
                filterEnvelope: { attack: 0.1, decay: 0.5, sustain: 0.3, release: 0.8 }
            },
            pad: {
                osc1: { wave: 'triangle', octave: 0, detune: 0, level: 60 },
                osc2: { wave: 'sine', octave: -1, detune: -7, level: 50 },
                filter: { type: 'lowpass', cutoff: 1200, resonance: 2, envelope: 30 },
                ampEnvelope: { attack: 0.8, decay: 0.5, sustain: 0.8, release: 1.5 },
                filterEnvelope: { attack: 1.0, decay: 1.0, sustain: 0.7, release: 2.0 }
            },
            bass: {
                osc1: { wave: 'square', octave: -2, detune: 0, level: 90 },
                osc2: { wave: 'triangle', octave: -1, detune: 0, level: 30 },
                filter: { type: 'lowpass', cutoff: 800, resonance: 5, envelope: 40 },
                ampEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.2 },
                filterEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.3 }
            }
        };
    }

    loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;
        
        // Update parameters
        Object.assign(this.params.osc1, preset.osc1);
        Object.assign(this.params.osc2, preset.osc2);
        Object.assign(this.params.filter, preset.filter);
        Object.assign(this.params.ampEnvelope, preset.ampEnvelope);
        Object.assign(this.params.filterEnvelope, preset.filterEnvelope);
        
        this.updateAllDisplays();
        this.showNotification(`Loaded preset: ${presetName}`, 'success');
    }

    updateAllDisplays() {
        // Update oscillator displays
        for (let i = 1; i <= 2; i++) {
            const prefix = `osc${i}`;
            const params = this.params[prefix];
            
            document.getElementById(`${prefix}Wave`).value = params.wave;
            document.getElementById(`${prefix}Octave`).value = params.octave;
            document.getElementById(`${prefix}OctaveValue`).textContent = params.octave;
            document.getElementById(`${prefix}Detune`).value = params.detune;
            document.getElementById(`${prefix}DetuneValue`).textContent = params.detune;
            document.getElementById(`${prefix}Level`).value = params.level;
            document.getElementById(`${prefix}LevelValue`).textContent = params.level;
        }
        
        // Update filter displays
        document.getElementById('filterType').value = this.params.filter.type;
        document.getElementById('filterCutoff').value = this.params.filter.cutoff;
        document.getElementById('filterCutoffValue').textContent = this.params.filter.cutoff;
        document.getElementById('filterResonance').value = this.params.filter.resonance;
        document.getElementById('filterResonanceValue').textContent = this.params.filter.resonance;
        document.getElementById('filterEnvelope').value = this.params.filter.envelope;
        document.getElementById('filterEnvelopeValue').textContent = this.params.filter.envelope;
        
        // Update envelope displays
        const envelopes = [
            { prefix: 'amp', params: this.params.ampEnvelope },
            { prefix: 'filter', params: this.params.filterEnvelope }
        ];
        
        envelopes.forEach(({ prefix, params }) => {
            Object.entries(params).forEach(([stage, value]) => {
                const elementId = `${prefix}${stage.charAt(0).toUpperCase() + stage.slice(1)}`;
                const valueId = `${elementId}Value`;
                
                const element = document.getElementById(elementId);
                const valueElement = document.getElementById(valueId);
                
                if (element) element.value = value;
                if (valueElement) valueElement.textContent = value;
            });
        });
        
        this.updateEnvelopeVisualization('ampEnvelope');
        this.updateEnvelopeVisualization('filterEnvelope');
    }

    updateEnvelopeVisualization(envelopeType) {
        const canvasId = envelopeType === 'ampEnvelope' ? 'ampEnvelopeCanvas' : 'filterEnvelopeCanvas';
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const env = this.params[envelopeType];
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const width = canvas.width;
        const height = canvas.height;
        const totalTime = env.attack + env.decay + 0.5 + env.release;
        
        // Attack
        ctx.moveTo(0, height);
        const attackX = (env.attack / totalTime) * width;
        ctx.lineTo(attackX, 10);
        
        // Decay
        const decayX = ((env.attack + env.decay) / totalTime) * width;
        const sustainY = height - (env.sustain * (height - 20)) - 10;
        ctx.lineTo(decayX, sustainY);
        
        // Sustain
        const sustainX = ((env.attack + env.decay + 0.5) / totalTime) * width;
        ctx.lineTo(sustainX, sustainY);
        
        // Release
        ctx.lineTo(width, height);
        
        ctx.stroke();
    }

    setupVisualization() {
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.masterGain.connect(this.analyser);
        
        this.visualizationData = new Uint8Array(this.analyser.frequencyBinCount);
        this.startVisualization();
    }

    startVisualization() {
        const canvas = document.getElementById('waveformCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        const draw = () => {
            this.analyser.getByteTimeDomainData(this.visualizationData);
            
            ctx.fillStyle = '#022c22';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#10b981';
            ctx.beginPath();
            
            const sliceWidth = canvas.width / this.visualizationData.length;
            let x = 0;
            
            for (let i = 0; i < this.visualizationData.length; i++) {
                const v = this.visualizationData[i] / 128.0;
                const y = v * canvas.height / 2;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                x += sliceWidth;
            }
            
            ctx.stroke();
            requestAnimationFrame(draw);
        };
        
        draw();
    }

    updateOctaveDisplay() {
        document.getElementById('octaveDisplay').textContent = `Octave: ${this.currentOctave}`;
    }

    noteToFrequency(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(note.slice(-1));
        const noteName = note.slice(0, -1);
        const noteIndex = notes.indexOf(noteName);
        
        if (noteIndex === -1) return 0;
        
        const A4 = 440;
        const A4Index = 9;
        const A4Octave = 4;
        
        const semitonesFromA4 = (octave - A4Octave) * 12 + (noteIndex - A4Index);
        return A4 * Math.pow(2, semitonesFromA4 / 12);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize synthesizer when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.virtualSynth = new VirtualSynthesizer();
});

// Export for global access
window.VirtualSynthesizer = VirtualSynthesizer;
