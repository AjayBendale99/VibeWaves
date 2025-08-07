// Professional Guitar JavaScript
class ProfessionalGuitar {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.oscillators = new Map();
        this.markedPositions = new Set();
        this.showNotes = true;
        this.markMode = false;
        this.currentGuitarType = 'acoustic';
        this.strings = 6;
        this.frets = 15;
        
        // Standard tuning frequencies (Hz)
        this.stringFrequencies = {
            1: 329.63, // E4 (high E)
            2: 246.94, // B3
            3: 196.00, // G3
            4: 146.83, // D3
            5: 110.00, // A2
            6: 82.41   // E2 (low E)
        };
        
        // Fret positions for note calculation
        this.fretRatio = Math.pow(2, 1/12); // Equal temperament
        
        // Note names
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Chord definitions (fret positions for each string)
        this.chordLibrary = {
            basic: {
                'C': [null, 3, 2, 0, 1, 0],
                'G': [3, 2, 0, 0, 3, 3],
                'Am': [null, 0, 2, 2, 1, 0],
                'F': [1, 1, 3, 3, 2, 1],
                'D': [null, null, 0, 2, 3, 2],
                'Em': [0, 2, 2, 0, 0, 0],
                'A': [null, 0, 2, 2, 2, 0],
                'E': [0, 2, 2, 1, 0, 0]
            },
            barre: {
                'F': [1, 1, 3, 3, 2, 1],
                'Bm': [null, 2, 4, 4, 3, 2],
                'B': [null, 2, 4, 4, 4, 2],
                'Cm': [null, 3, 5, 5, 4, 3],
                'Dm': [null, null, 0, 2, 3, 1],
                'Gm': [3, 5, 5, 3, 3, 3]
            },
            seventh: {
                'G7': [3, 2, 0, 0, 0, 1],
                'C7': [null, 3, 2, 3, 1, 0],
                'D7': [null, null, 0, 2, 1, 2],
                'A7': [null, 0, 2, 0, 2, 0],
                'E7': [0, 2, 0, 1, 0, 0],
                'B7': [null, 2, 1, 2, 0, 2]
            }
        };
        
        // Scale patterns
        this.scaleLibrary = {
            major: {
                'C Major': [[null, 3], [null, 5], [2, 5], [2, 5], [2, 5], [null, 3]],
                'G Major': [[3, 6], [3, 6], [2, 5], [2, 5], [3, 6], [3, 6]],
                'D Major': [[null, 3], [2, 5], [2, 5], [2, 4], [null, 3], [null, 3]]
            },
            minor: {
                'A Minor': [[5, 8], [5, 8], [5, 7], [5, 7], [5, 8], [5, 8]],
                'E Minor': [[0, 3], [0, 3], [0, 2], [0, 2], [0, 3], [0, 3]],
                'D Minor': [[null, 3], [1, 4], [0, 3], [0, 3], [1, 4], [null, 3]]
            },
            pentatonic: {
                'A Minor Pentatonic': [[5, 8], [5, 8], [5, 7], [5, 7], [5, 8], [5, 8]],
                'E Minor Pentatonic': [[0, 3], [0, 3], [0, 2], [0, 2], [0, 3], [0, 3]]
            }
        };
        
        this.keyboardMapping = {
            // Enhanced keyboard mapping for all keys - String 1 (High E)
            'KeyQ': {string: 1, fret: 0}, 'Digit1': {string: 1, fret: 1}, 'KeyW': {string: 1, fret: 2}, 
            'KeyE': {string: 1, fret: 3}, 'KeyR': {string: 1, fret: 4}, 'KeyT': {string: 1, fret: 5},
            'KeyY': {string: 1, fret: 6}, 'KeyU': {string: 1, fret: 7}, 'KeyI': {string: 1, fret: 8},
            'KeyO': {string: 1, fret: 9}, 'KeyP': {string: 1, fret: 10}, 'BracketLeft': {string: 1, fret: 11},
            'BracketRight': {string: 1, fret: 12},
            
            // String 2 (B)
            'KeyA': {string: 2, fret: 0}, 'Digit2': {string: 2, fret: 1}, 'KeyS': {string: 2, fret: 2},
            'KeyD': {string: 2, fret: 3}, 'KeyF': {string: 2, fret: 4}, 'KeyG': {string: 2, fret: 5},
            'KeyH': {string: 2, fret: 6}, 'KeyJ': {string: 2, fret: 7}, 'KeyK': {string: 2, fret: 8},
            'KeyL': {string: 2, fret: 9}, 'Semicolon': {string: 2, fret: 10}, 'Quote': {string: 2, fret: 11},
            'Enter': {string: 2, fret: 12},
            
            // String 3 (G)
            'KeyZ': {string: 3, fret: 0}, 'Digit3': {string: 3, fret: 1}, 'KeyX': {string: 3, fret: 2},
            'KeyC': {string: 3, fret: 3}, 'KeyV': {string: 3, fret: 4}, 'KeyB': {string: 3, fret: 5},
            'KeyN': {string: 3, fret: 6}, 'KeyM': {string: 3, fret: 7}, 'Comma': {string: 3, fret: 8},
            'Period': {string: 3, fret: 9}, 'Slash': {string: 3, fret: 10}, 'ShiftRight': {string: 3, fret: 11},
            'Backslash': {string: 3, fret: 12},
            
            // String 4 (D)
            'Tab': {string: 4, fret: 0}, 'Digit4': {string: 4, fret: 1}, 'CapsLock': {string: 4, fret: 2},
            'ShiftLeft': {string: 4, fret: 3}, 'ControlLeft': {string: 4, fret: 4}, 'MetaLeft': {string: 4, fret: 5},
            'AltLeft': {string: 4, fret: 6}, 'Space': {string: 4, fret: 7}, 'AltRight': {string: 4, fret: 8},
            'MetaRight': {string: 4, fret: 9}, 'ControlRight': {string: 4, fret: 10}, 'ArrowLeft': {string: 4, fret: 11},
            'ArrowDown': {string: 4, fret: 12},
            
            // String 5 (A)
            'Backquote': {string: 5, fret: 0}, 'Digit5': {string: 5, fret: 1}, 'Minus': {string: 5, fret: 2},
            'Equal': {string: 5, fret: 3}, 'Backspace': {string: 5, fret: 4}, 'Delete': {string: 5, fret: 5},
            'Home': {string: 5, fret: 6}, 'End': {string: 5, fret: 7}, 'PageUp': {string: 5, fret: 8},
            'PageDown': {string: 5, fret: 9}, 'Insert': {string: 5, fret: 10}, 'ArrowUp': {string: 5, fret: 11},
            'ArrowRight': {string: 5, fret: 12},
            
            // String 6 (Low E)
            'Escape': {string: 6, fret: 0}, 'Digit6': {string: 6, fret: 1}, 'F1': {string: 6, fret: 2},
            'F2': {string: 6, fret: 3}, 'F3': {string: 6, fret: 4}, 'F4': {string: 6, fret: 5},
            'F5': {string: 6, fret: 6}, 'F6': {string: 6, fret: 7}, 'F7': {string: 6, fret: 8},
            'F8': {string: 6, fret: 9}, 'F9': {string: 6, fret: 10}, 'F10': {string: 6, fret: 11},
            'F11': {string: 6, fret: 12}
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            
            this.setupFretboard();
            this.setupControls();
            this.setupKeyboardListeners();
            
            console.log('Professional Guitar initialized successfully');
        } catch (error) {
            console.error('Failed to initialize guitar:', error);
        }
    }
    
    setupFretboard() {
        const fretboard = document.getElementById('fretboard');
        fretboard.innerHTML = '';
        
        // Add strings
        for (let string = 1; string <= this.strings; string++) {
            const stringElement = document.createElement('div');
            stringElement.className = 'string';
            fretboard.appendChild(stringElement);
        }
        
        // Add frets
        const fretboardWidth = 1000; // Base width
        for (let fret = 0; fret <= this.frets; fret++) {
            const fretElement = document.createElement('div');
            fretElement.className = 'fret';
            
            // Calculate fret position using equal temperament
            const position = fret === 0 ? 0 : (fretboardWidth * (1 - Math.pow(2, -fret/12)));
            fretElement.style.left = position + 'px';
            
            fretboard.appendChild(fretElement);
            
            // Add fret markers at specific frets
            if ([3, 5, 7, 9, 15].includes(fret)) {
                const marker = document.createElement('div');
                marker.className = 'fret-marker';
                marker.style.left = (position + 15) + 'px';
                fretboard.appendChild(marker);
            }
            
            // Double marker at 12th fret
            if (fret === 12) {
                const marker = document.createElement('div');
                marker.className = 'fret-marker double';
                marker.style.left = (position + 15) + 'px';
                fretboard.appendChild(marker);
            }
        }
        
        // Add fret positions (clickable areas)
        for (let string = 1; string <= this.strings; string++) {
            for (let fret = 0; fret <= this.frets; fret++) {
                const position = document.createElement('div');
                position.className = 'fret-position';
                position.dataset.string = string;
                position.dataset.fret = fret;
                
                // Position calculation
                const stringY = 25 + (string - 1) * 45;
                const fretX = fret === 0 ? 10 : (1000 * (1 - Math.pow(2, -fret/12))) - 10;
                
                position.style.left = fretX + 'px';
                position.style.top = stringY + 'px';
                
                // Add note name
                const noteName = this.getNoteName(string, fret);
                position.textContent = this.showNotes ? noteName : '';
                position.title = noteName;
                
                // Event listeners
                position.addEventListener('mousedown', (e) => this.handleFretPress(e, string, fret));
                position.addEventListener('mouseup', (e) => this.handleFretRelease(e, string, fret));
                position.addEventListener('mouseleave', (e) => this.handleFretRelease(e, string, fret));
                
                // Touch events for mobile
                position.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleFretPress(e, string, fret);
                });
                position.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.handleFretRelease(e, string, fret);
                });
                
                fretboard.appendChild(position);
            }
        }
    }
    
    getNoteName(string, fret) {
        const baseFreq = this.stringFrequencies[string];
        const frequency = baseFreq * Math.pow(this.fretRatio, fret);
        
        // Convert frequency to note name
        const A4 = 440;
        const semitonesFromA4 = Math.round(12 * Math.log2(frequency / A4));
        const noteIndex = (9 + semitonesFromA4) % 12; // A is index 9
        
        return this.noteNames[noteIndex < 0 ? noteIndex + 12 : noteIndex];
    }
    
    getFrequency(string, fret) {
        return this.stringFrequencies[string] * Math.pow(this.fretRatio, fret);
    }
    
    handleFretPress(e, string, fret) {
        const positionKey = `${string}-${fret}`;
        
        if (this.markMode) {
            this.toggleMarkedPosition(string, fret);
            return;
        }
        
        this.playNote(string, fret);
        this.updateCurrentNotes();
    }
    
    handleFretRelease(e, string, fret) {
        if (!this.markMode) {
            this.stopNote(string, fret);
            this.updateCurrentNotes();
        }
    }
    
    playNote(string, fret) {
        const positionKey = `${string}-${fret}`;
        if (this.oscillators.has(positionKey)) return;
        
        const frequency = this.getFrequency(string, fret);
        
        // Create realistic guitar sound with multiple oscillators
        const oscillator1 = this.audioContext.createOscillator();
        const oscillator2 = this.audioContext.createOscillator();
        const oscillator3 = this.audioContext.createOscillator();
        
        const gainNode = this.audioContext.createGain();
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();
        
        // Add filter for more realistic tone
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
        filter.Q.setValueAtTime(1, this.audioContext.currentTime);
        
        // Configure guitar harmonics and timbre
        oscillator1.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator2.frequency.setValueAtTime(frequency * 2.02, this.audioContext.currentTime); // Slight detuning
        oscillator3.frequency.setValueAtTime(frequency * 3.98, this.audioContext.currentTime);
        
        // Configure based on guitar type with better waveforms
        this.configureAdvancedGuitarType(oscillator1, oscillator2, oscillator3, gain1, gain2, gain3, filter);
        
        // Connect the oscillators
        oscillator1.connect(gain1);
        oscillator2.connect(gain2);
        oscillator3.connect(gain3);
        
        gain1.connect(filter);
        gain2.connect(filter);
        gain3.connect(filter);
        
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        // Realistic guitar envelope with pluck simulation
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.8, now + 0.005); // Very quick attack (pluck)
        gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.1); // Initial decay
        gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.5); // Sustain level
        gainNode.gain.exponentialRampToValueAtTime(0.05, now + 2.0); // Long decay
        
        // Add vibrato for electric guitars
        if (this.currentGuitarType.includes('electric')) {
            const vibrato = this.audioContext.createOscillator();
            const vibratoGain = this.audioContext.createGain();
            vibrato.frequency.setValueAtTime(5, now); // 5Hz vibrato
            vibratoGain.gain.setValueAtTime(5, now); // Depth
            vibrato.connect(vibratoGain);
            vibratoGain.connect(oscillator1.frequency);
            vibrato.start(now);
            
            setTimeout(() => {
                try { vibrato.stop(); } catch(e) {}
            }, 3000);
        }
        
        oscillator1.start(now);
        oscillator2.start(now);
        oscillator3.start(now);
        
        this.oscillators.set(positionKey, { 
            oscillator: oscillator1, 
            oscillator2, 
            oscillator3, 
            gainNode,
            filter
        });
        
        // Enhanced visual feedback with animation
        const positionElement = document.querySelector(`[data-string="${string}"][data-fret="${fret}"]`);
        positionElement.classList.add('active');
        
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'note-ripple';
        positionElement.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    stopNote(string, fret) {
        const positionKey = `${string}-${fret}`;
        if (!this.oscillators.has(positionKey)) return;
        
        const { oscillator, oscillator2, oscillator3, gainNode, filter } = this.oscillators.get(positionKey);
        const now = this.audioContext.currentTime;
        
        // Realistic release envelope
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // Longer release
        
        // Stop all oscillators
        setTimeout(() => {
            try {
                oscillator.stop();
                oscillator2.stop();
                oscillator3.stop();
            } catch(e) {}
        }, 1500);
        
        this.oscillators.delete(positionKey);
        
        // Remove visual feedback with fade
        const positionElement = document.querySelector(`[data-string="${string}"][data-fret="${fret}"]`);
        positionElement.classList.remove('active');
    }
    
    configureAdvancedGuitarType(osc1, osc2, osc3, gain1, gain2, gain3, filter) {
        const now = this.audioContext.currentTime;
        
        switch (this.currentGuitarType) {
            case 'acoustic':
                osc1.type = 'triangle';
                osc2.type = 'sine';
                osc3.type = 'triangle';
                gain1.gain.setValueAtTime(1.0, now);
                gain2.gain.setValueAtTime(0.3, now);
                gain3.gain.setValueAtTime(0.1, now);
                filter.frequency.setValueAtTime(4000, now);
                break;
                
            case 'electric-clean':
                osc1.type = 'sawtooth';
                osc2.type = 'triangle';
                osc3.type = 'sine';
                gain1.gain.setValueAtTime(0.8, now);
                gain2.gain.setValueAtTime(0.4, now);
                gain3.gain.setValueAtTime(0.2, now);
                filter.frequency.setValueAtTime(5000, now);
                break;
                
            case 'electric-distortion':
                osc1.type = 'square';
                osc2.type = 'sawtooth';
                osc3.type = 'square';
                gain1.gain.setValueAtTime(0.7, now);
                gain2.gain.setValueAtTime(0.5, now);
                gain3.gain.setValueAtTime(0.3, now);
                filter.frequency.setValueAtTime(2500, now);
                filter.Q.setValueAtTime(3, now);
                break;
                
            case 'classical':
                osc1.type = 'sine';
                osc2.type = 'triangle';
                osc3.type = 'sine';
                gain1.gain.setValueAtTime(0.9, now);
                gain2.gain.setValueAtTime(0.2, now);
                gain3.gain.setValueAtTime(0.1, now);
                filter.frequency.setValueAtTime(3500, now);
                break;
                
            default:
                osc1.type = 'triangle';
                osc2.type = 'sine';
                osc3.type = 'triangle';
                gain1.gain.setValueAtTime(1.0, now);
                gain2.gain.setValueAtTime(0.3, now);
                gain3.gain.setValueAtTime(0.1, now);
        }
    }
    
    toggleMarkedPosition(string, fret) {
        const positionKey = `${string}-${fret}`;
        const positionElement = document.querySelector(`[data-string="${string}"][data-fret="${fret}"]`);
        
        if (this.markedPositions.has(positionKey)) {
            this.markedPositions.delete(positionKey);
            positionElement.classList.remove('marked');
        } else {
            this.markedPositions.add(positionKey);
            positionElement.classList.add('marked');
        }
        
        this.updatePlayMarkedButton();
    }
    
    playMarkedPositions() {
        if (this.markedPositions.size === 0) return;
        
        this.markedPositions.forEach(positionKey => {
            const [string, fret] = positionKey.split('-').map(Number);
            this.playNote(string, fret);
            setTimeout(() => this.stopNote(string, fret), 1500);
        });
    }
    
    clearMarkedPositions() {
        this.markedPositions.forEach(positionKey => {
            const [string, fret] = positionKey.split('-').map(Number);
            const positionElement = document.querySelector(`[data-string="${string}"][data-fret="${fret}"]`);
            positionElement.classList.remove('marked');
        });
        this.markedPositions.clear();
        this.updatePlayMarkedButton();
    }
    
    playChord(chordName, category) {
        const chord = this.chordLibrary[category][chordName];
        if (!chord) return;
        
        chord.forEach((fret, index) => {
            if (fret !== null) {
                const string = index + 1;
                setTimeout(() => {
                    this.playNote(string, fret);
                    setTimeout(() => this.stopNote(string, fret), 2000);
                }, index * 50);
            }
        });
    }
    
    showChord(chordName, category) {
        // Clear previous markings
        this.clearMarkedPositions();
        
        const chord = this.chordLibrary[category][chordName];
        if (!chord) return;
        
        chord.forEach((fret, index) => {
            if (fret !== null) {
                const string = index + 1;
                const positionKey = `${string}-${fret}`;
                this.markedPositions.add(positionKey);
                
                const positionElement = document.querySelector(`[data-string="${string}"][data-fret="${fret}"]`);
                positionElement.classList.add('marked');
            }
        });
        
        this.updatePlayMarkedButton();
    }
    
    setupControls() {
        // Guitar type selector
        document.getElementById('guitarType').addEventListener('change', (e) => {
            this.currentGuitarType = e.target.value;
        });
        
        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
            e.target.nextElementSibling.textContent = e.target.value + '%';
        });
        
        // Show notes toggle
        document.getElementById('showNotesBtn').addEventListener('click', (e) => {
            this.showNotes = !this.showNotes;
            const positions = document.querySelectorAll('.fret-position');
            positions.forEach(pos => {
                const string = parseInt(pos.dataset.string);
                const fret = parseInt(pos.dataset.fret);
                const noteName = this.getNoteName(string, fret);
                pos.textContent = this.showNotes ? noteName : '';
            });
            e.target.classList.toggle('active', this.showNotes);
        });
        
        // Mark mode toggle
        document.getElementById('markModeBtn').addEventListener('click', (e) => {
            this.markMode = !this.markMode;
            e.target.classList.toggle('active', this.markMode);
            document.body.style.cursor = this.markMode ? 'crosshair' : 'default';
        });
        
        // Play marked positions
        document.getElementById('playMarkedBtn').addEventListener('click', () => {
            this.playMarkedPositions();
        });
        
        // Clear marked positions
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearMarkedPositions();
        });
        
        // Chord library
        document.getElementById('chordsBtn').addEventListener('click', () => {
            document.getElementById('chordsOverlay').classList.add('active');
            this.populateChordGrid('basic');
        });
        
        // Scale library
        document.getElementById('scalesBtn').addEventListener('click', () => {
            document.getElementById('scalesOverlay').classList.add('active');
            this.populateScaleGrid('major');
        });
        
        // Tuner
        document.getElementById('tunerBtn').addEventListener('click', () => {
            document.getElementById('tunerOverlay').classList.add('active');
            this.setupTuner();
        });
        
        this.setupChordCategories();
        this.setupScaleCategories();
    }
    
    setupChordCategories() {
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.populateChordGrid(btn.dataset.category);
            });
        });
    }
    
    setupScaleCategories() {
        const categoryBtns = document.querySelectorAll('.scale-category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.populateScaleGrid(btn.dataset.category);
            });
        });
    }
    
    populateChordGrid(category) {
        const grid = document.getElementById('chordGrid');
        grid.innerHTML = '';
        
        const chords = this.chordLibrary[category] || {};
        Object.keys(chords).forEach(chordName => {
            const button = document.createElement('button');
            button.className = 'chord-btn';
            button.textContent = chordName;
            
            button.addEventListener('click', () => {
                this.showChord(chordName, category);
                setTimeout(() => this.playChord(chordName, category), 500);
            });
            
            grid.appendChild(button);
        });
    }
    
    populateScaleGrid(category) {
        const grid = document.getElementById('scaleGrid');
        grid.innerHTML = '';
        
        const scales = this.scaleLibrary[category] || {};
        Object.keys(scales).forEach(scaleName => {
            const button = document.createElement('button');
            button.className = 'scale-btn';
            button.textContent = scaleName;
            
            button.addEventListener('click', () => {
                this.showScale(scaleName, category);
            });
            
            grid.appendChild(button);
        });
    }
    
    showScale(scaleName, category) {
        // Clear previous markings
        this.clearMarkedPositions();
        
        const scale = this.scaleLibrary[category][scaleName];
        if (!scale) return;
        
        scale.forEach((fretRange, stringIndex) => {
            if (fretRange) {
                const string = stringIndex + 1;
                const [startFret, endFret] = fretRange;
                
                for (let fret = startFret; fret <= endFret; fret++) {
                    const positionKey = `${string}-${fret}`;
                    this.markedPositions.add(positionKey);
                    
                    const positionElement = document.querySelector(`[data-string="${string}"][data-fret="${fret}"]`);
                    if (positionElement) {
                        positionElement.classList.add('marked');
                    }
                }
            }
        });
        
        this.updatePlayMarkedButton();
    }
    
    setupTuner() {
        const referenceButtons = document.querySelectorAll('.play-reference');
        referenceButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const stringNum = parseInt(e.target.closest('.string-tuner').dataset.string);
                this.playReferenceNote(stringNum);
            });
        });
    }
    
    playReferenceNote(stringNum) {
        const frequency = this.stringFrequencies[stringNum];
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);
        
        oscillator.start(now);
        oscillator.stop(now + 2);
    }
    
    setupKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            
            const mapping = this.keyboardMapping[e.code];
            if (mapping) {
                e.preventDefault();
                let fret = mapping.fret;
                if (e.shiftKey) fret += 5; // Higher frets with Shift
                
                this.handleFretPress(e, mapping.string, fret);
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const mapping = this.keyboardMapping[e.code];
            if (mapping) {
                e.preventDefault();
                let fret = mapping.fret;
                if (e.shiftKey) fret += 5;
                
                this.handleFretRelease(e, mapping.string, fret);
            }
        });
    }
    
    updateCurrentNotes() {
        const currentNotesElement = document.getElementById('currentNotes');
        const playingNotes = Array.from(this.oscillators.keys()).map(key => {
            const [string, fret] = key.split('-').map(Number);
            return this.getNoteName(string, fret);
        });
        
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
        if (this.markedPositions.size > 0) {
            playBtn.classList.remove('disabled');
        } else {
            playBtn.classList.add('disabled');
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
        if (window.guitar && window.guitar.audioContext.state === 'suspended') {
            window.guitar.audioContext.resume();
        }
    }, { once: true });
    
    window.guitar = new ProfessionalGuitar();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.guitar) {
        setTimeout(() => window.guitar.setupFretboard(), 100);
    }
});
