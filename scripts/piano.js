// Professional Piano JavaScript
class ProfessionalPiano {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.reverbNode = null;
        this.oscillators = new Map();
        this.markedNotes = new Set();
        this.showNotes = true;
        this.markMode = false;
        this.currentInstrument = 'acoustic-grand';
        this.isRecording = false;
        this.recordedNotes = [];
        
        // Note frequencies (Equal temperament, A4 = 440Hz)
        this.noteFrequencies = {
            'C': [130.81, 261.63, 523.25, 1046.50],
            'C#': [138.59, 277.18, 554.37, 1108.73],
            'D': [146.83, 293.66, 587.33, 1174.66],
            'D#': [155.56, 311.13, 622.25, 1244.51],
            'E': [164.81, 329.63, 659.25, 1318.51],
            'F': [174.61, 349.23, 698.46, 1396.91],
            'F#': [185.00, 369.99, 739.99, 1479.98],
            'G': [196.00, 392.00, 783.99, 1567.98],
            'G#': [207.65, 415.30, 830.61, 1661.22],
            'A': [220.00, 440.00, 880.00, 1760.00],
            'A#': [233.08, 466.16, 932.33, 1864.66],
            'B': [246.94, 493.88, 987.77, 1975.53]
        };

        this.keyboardMapping = {
            'KeyA': 'C3', 'KeyW': 'C#3', 'KeyS': 'D3', 'KeyE': 'D#3', 'KeyD': 'E3',
            'KeyF': 'F3', 'KeyT': 'F#3', 'KeyG': 'G3', 'KeyY': 'G#3', 'KeyH': 'A3',
            'KeyU': 'A#3', 'KeyJ': 'B3', 'KeyK': 'C4', 'KeyO': 'C#4', 'KeyL': 'D4',
            'KeyP': 'D#4', 'Semicolon': 'E4'
        };

        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            
            // Create reverb
            await this.createReverb();
            
            this.setupPiano();
            this.setupControls();
            this.setupKeyboardListeners();
            this.setupVisualizer();
            
            console.log('Professional Piano initialized successfully');
        } catch (error) {
            console.error('Failed to initialize piano:', error);
        }
    }

    async createReverb() {
        // Create convolution reverb
        this.reverbNode = this.audioContext.createConvolver();
        const reverbGain = this.audioContext.createGain();
        reverbGain.gain.value = 0.3;
        
        // Create impulse response for reverb
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.reverbNode.buffer = impulse;
        this.reverbNode.connect(reverbGain);
        reverbGain.connect(this.masterGain);
    }

    setupPiano() {
        const keyboard = document.getElementById('pianoKeyboard');
        keyboard.innerHTML = '';

        // Generate 3 octaves starting from C3
        const octaves = 3;
        const startOctave = 3;
        
        for (let octave = startOctave; octave < startOctave + octaves; octave++) {
            const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
            const sharps = ['C#', 'D#', 'F#', 'G#', 'A#'];
            
            notes.forEach((note, index) => {
                const key = this.createKey(note, octave, false);
                keyboard.appendChild(key);
                
                // Add sharps/flats (except after E and B)
                if (index !== 2 && index !== 6) {
                    const sharpNote = sharps.find(s => s.startsWith(note));
                    if (sharpNote) {
                        const sharpKey = this.createKey(sharpNote, octave, true);
                        keyboard.appendChild(sharpKey);
                    }
                }
            });
        }

        this.positionKeys();
    }

    createKey(note, octave, isSharp) {
        const key = document.createElement('div');
        const noteName = note + octave;
        
        key.className = `piano-key ${isSharp ? 'black-key' : 'white-key'}`;
        key.dataset.note = noteName;
        key.dataset.frequency = this.getNoteFrequency(note, octave);
        
        // Add note name
        const nameSpan = document.createElement('span');
        nameSpan.className = 'note-name';
        nameSpan.textContent = note;
        key.appendChild(nameSpan);
        
        // Event listeners
        key.addEventListener('mousedown', (e) => this.handleKeyPress(e, noteName));
        key.addEventListener('mouseup', (e) => this.handleKeyRelease(e, noteName));
        key.addEventListener('mouseleave', (e) => this.handleKeyRelease(e, noteName));
        
        // Touch events for mobile
        key.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleKeyPress(e, noteName);
        });
        key.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleKeyRelease(e, noteName);
        });
        
        return key;
    }

    positionKeys() {
        const whiteKeys = document.querySelectorAll('.white-key');
        const blackKeys = document.querySelectorAll('.black-key');
        
        const keyboardWidth = document.getElementById('pianoKeyboard').offsetWidth;
        const whiteKeyWidth = keyboardWidth / whiteKeys.length;
        
        // Position white keys
        whiteKeys.forEach((key, index) => {
            key.style.left = (index * whiteKeyWidth) + 'px';
            key.style.width = whiteKeyWidth + 'px';
        });
        
        // Position black keys
        const blackKeyWidth = whiteKeyWidth * 0.6;
        const blackKeyPositions = [0.7, 1.7, 3.7, 4.7, 5.7]; // Relative positions within each octave
        
        blackKeys.forEach((key, index) => {
            const octaveIndex = Math.floor(index / 5);
            const keyInOctave = index % 5;
            const octaveOffset = octaveIndex * 7; // 7 white keys per octave
            
            const position = (octaveOffset + blackKeyPositions[keyInOctave]) * whiteKeyWidth - (blackKeyWidth / 2);
            key.style.left = position + 'px';
            key.style.width = blackKeyWidth + 'px';
        });
    }

    getNoteFrequency(note, octave) {
        const baseNote = note.replace('#', '');
        const isSharp = note.includes('#');
        
        if (this.noteFrequencies[baseNote]) {
            const freq = this.noteFrequencies[baseNote][octave - 1] || this.noteFrequencies[baseNote][0];
            return isSharp ? freq * Math.pow(2, 1/12) : freq;
        }
        return 440; // Default to A4
    }

    handleKeyPress(e, noteName) {
        if (this.markMode) {
            this.toggleMarkedNote(noteName);
            return;
        }
        
        this.playNote(noteName);
        this.updateCurrentNotes();
        this.addRippleEffect(e.target);
        
        if (this.isRecording) {
            this.recordedNotes.push({
                note: noteName,
                time: Date.now(),
                action: 'press'
            });
        }
    }

    addRippleEffect(keyElement) {
        // Remove existing ripples
        const existingRipples = keyElement.querySelectorAll('.key-ripple');
        existingRipples.forEach(ripple => ripple.remove());
        
        // Create new ripple
        const ripple = document.createElement('div');
        ripple.className = 'key-ripple';
        keyElement.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    handleKeyRelease(e, noteName) {
        if (!this.markMode) {
            this.stopNote(noteName);
            this.updateCurrentNotes();
        }
    }

    playNote(noteName) {
        if (this.oscillators.has(noteName)) return; // Note already playing
        
        const frequency = document.querySelector(`[data-note="${noteName}"]`).dataset.frequency;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        // Configure oscillator based on instrument
        this.configureInstrument(oscillator, gainNode);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        gainNode.connect(this.reverbNode);
        
        // ADSR envelope
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
        gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.3); // Decay to sustain
        
        oscillator.start(now);
        
        this.oscillators.set(noteName, { oscillator, gainNode });
        
        // Visual feedback
        const keyElement = document.querySelector(`[data-note="${noteName}"]`);
        keyElement.classList.add('active');
        
        this.updateVisualizer();
    }

    stopNote(noteName) {
        if (!this.oscillators.has(noteName)) return;
        
        const { oscillator, gainNode } = this.oscillators.get(noteName);
        const now = this.audioContext.currentTime;
        
        // Release envelope
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        
        oscillator.stop(now + 0.5);
        this.oscillators.delete(noteName);
        
        // Remove visual feedback
        const keyElement = document.querySelector(`[data-note="${noteName}"]`);
        keyElement.classList.remove('active');
        
        this.updateVisualizer();
    }

    configureInstrument(oscillator, gainNode) {
        switch (this.currentInstrument) {
            case 'acoustic-grand':
                oscillator.type = 'triangle';
                break;
            case 'electric-piano':
                oscillator.type = 'square';
                break;
            case 'upright-piano':
                oscillator.type = 'sawtooth';
                break;
            case 'harpsichord':
                oscillator.type = 'square';
                gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
                break;
            case 'organ':
                oscillator.type = 'sine';
                break;
            default:
                oscillator.type = 'triangle';
        }
    }

    toggleMarkedNote(noteName) {
        const keyElement = document.querySelector(`[data-note="${noteName}"]`);
        
        if (this.markedNotes.has(noteName)) {
            this.markedNotes.delete(noteName);
            keyElement.classList.remove('marked');
        } else {
            this.markedNotes.add(noteName);
            keyElement.classList.add('marked');
        }
        
        this.updatePlayMarkedButton();
    }

    playMarkedNotes() {
        if (this.markedNotes.size === 0) return;
        
        this.markedNotes.forEach(noteName => {
            this.playNote(noteName);
            setTimeout(() => this.stopNote(noteName), 1000);
        });
    }

    clearMarkedNotes() {
        this.markedNotes.forEach(noteName => {
            const keyElement = document.querySelector(`[data-note="${noteName}"]`);
            keyElement.classList.remove('marked');
        });
        this.markedNotes.clear();
        this.updatePlayMarkedButton();
    }

    setupControls() {
        // Instrument selector
        document.getElementById('instrumentSelect').addEventListener('change', (e) => {
            this.currentInstrument = e.target.value;
        });

        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
            e.target.nextElementSibling.textContent = e.target.value + '%';
        });

        // Reverb control
        const reverbSlider = document.getElementById('reverbSlider');
        reverbSlider.addEventListener('input', (e) => {
            const reverbAmount = e.target.value / 100;
            // Update reverb mix here
            e.target.nextElementSibling.textContent = e.target.value + '%';
        });

        // Show notes toggle
        document.getElementById('showNotesBtn').addEventListener('click', (e) => {
            this.showNotes = !this.showNotes;
            const noteNames = document.querySelectorAll('.note-name');
            noteNames.forEach(name => {
                name.classList.toggle('hidden', !this.showNotes);
            });
            e.target.classList.toggle('active', this.showNotes);
        });

        // Mark mode toggle
        document.getElementById('markModeBtn').addEventListener('click', (e) => {
            this.markMode = !this.markMode;
            e.target.classList.toggle('active', this.markMode);
            document.body.style.cursor = this.markMode ? 'crosshair' : 'default';
        });

        // Play marked notes
        document.getElementById('playMarkedBtn').addEventListener('click', () => {
            this.playMarkedNotes();
        });

        // Clear marked notes
        document.getElementById('clearMarkedBtn').addEventListener('click', () => {
            this.clearMarkedNotes();
        });

        // Learning tools
        document.getElementById('chordsBtn').addEventListener('click', () => {
            document.getElementById('chordsOverlay').classList.add('active');
        });

        document.getElementById('scalesBtn').addEventListener('click', () => {
            document.getElementById('scalesOverlay').classList.add('active');
        });

        // Record button
        document.getElementById('recordBtn').addEventListener('click', (e) => {
            this.toggleRecording();
            e.target.classList.toggle('active', this.isRecording);
        });

        this.setupChordButtons();
        this.setupScaleButtons();
    }

    setupChordButtons() {
        const chordButtons = document.querySelectorAll('.chord-btn');
        chordButtons.forEach(button => {
            button.addEventListener('click', () => {
                const chord = button.dataset.chord;
                this.playChord(chord);
            });
        });
    }

    setupScaleButtons() {
        const scaleButtons = document.querySelectorAll('.scale-btn');
        scaleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const scale = button.dataset.scale;
                this.playScale(scale);
            });
        });
    }

    playChord(chordName) {
        const chordMap = {
            'C': ['C4', 'E4', 'G4'],
            'Cm': ['C4', 'D#4', 'G4'],
            'G': ['G3', 'B3', 'D4'],
            'Gm': ['G3', 'A#3', 'D4'],
            'F': ['F3', 'A3', 'C4'],
            'Fm': ['F3', 'G#3', 'C4'],
            'Am': ['A3', 'C4', 'E4'],
            'Em': ['E3', 'G3', 'B3']
        };

        const notes = chordMap[chordName] || [];
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playNote(note);
                setTimeout(() => this.stopNote(note), 2000);
            }, index * 100);
        });
    }

    playScale(scaleName) {
        const scaleMap = {
            'C-major': ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
            'A-minor': ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
            'G-major': ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'],
            'E-minor': ['E3', 'F#3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4'],
            'F-major': ['F3', 'G3', 'A3', 'A#3', 'C4', 'D4', 'E4', 'F4'],
            'D-minor': ['D3', 'E3', 'F3', 'G3', 'A3', 'A#3', 'C4', 'D4']
        };

        const notes = scaleMap[scaleName] || [];
        notes.forEach((note, index) => {
            setTimeout(() => {
                this.playNote(note);
                setTimeout(() => this.stopNote(note), 300);
            }, index * 300);
        });
    }

    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            
            const noteName = this.keyboardMapping[e.code];
            if (noteName) {
                e.preventDefault();
                this.handleKeyPress(e, noteName);
            }
        });

        document.addEventListener('keyup', (e) => {
            const noteName = this.keyboardMapping[e.code];
            if (noteName) {
                e.preventDefault();
                this.handleKeyRelease(e, noteName);
            }
        });
    }

    setupVisualizer() {
        this.canvas = document.getElementById('audioCanvas');
        this.canvasCtx = this.canvas.getContext('2d');
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.masterGain.connect(this.analyser);
        
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.updateVisualizer();
    }

    updateVisualizer() {
        requestAnimationFrame(() => this.updateVisualizer());
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        this.canvasCtx.fillStyle = 'rgb(248, 250, 252)';
        this.canvasCtx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            
            const gradient = this.canvasCtx.createLinearGradient(0, this.canvas.height - barHeight, 0, this.canvas.height);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(1, '#2563eb');
            
            this.canvasCtx.fillStyle = gradient;
            this.canvasCtx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }

    updateCurrentNotes() {
        const currentNotesElement = document.getElementById('currentNotes');
        const playingNotes = Array.from(this.oscillators.keys());
        
        if (playingNotes.length === 0) {
            currentNotesElement.innerHTML = '<span class="note-display">No notes playing</span>';
        } else {
            currentNotesElement.innerHTML = playingNotes.map(note => 
                `<span class="note-display">${note}</span>`
            ).join(' ');
        }
    }

    updatePlayMarkedButton() {
        const playBtn = document.getElementById('playMarkedBtn');
        if (this.markedNotes.size > 0) {
            playBtn.classList.remove('disabled');
        } else {
            playBtn.classList.add('disabled');
        }
    }

    toggleRecording() {
        this.isRecording = !this.isRecording;
        if (this.isRecording) {
            this.recordedNotes = [];
        }
    }
}

// Utility functions for overlays
function closeOverlay(overlayId) {
    document.getElementById(overlayId).classList.remove('active');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Resume audio context on user interaction
    document.addEventListener('click', () => {
        if (window.piano && window.piano.audioContext.state === 'suspended') {
            window.piano.audioContext.resume();
        }
    }, { once: true });
    
    window.piano = new ProfessionalPiano();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.piano) {
        setTimeout(() => window.piano.positionKeys(), 100);
    }
});
