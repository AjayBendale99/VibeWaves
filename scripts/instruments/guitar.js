// Virtual Guitar Instrument - Musicca Style
class VirtualGuitar {
    constructor(container, audioContext) {
        this.container = container;
        this.audioContext = audioContext;
        
        // Guitar configuration - Standard tuning
        this.strings = [
            { name: 'E', openNote: 'E4', color: '#8B4513' }, // High E
            { name: 'B', openNote: 'B3', color: '#8B4513' },
            { name: 'G', openNote: 'G3', color: '#8B4513' },
            { name: 'D', openNote: 'D3', color: '#8B4513' },
            { name: 'A', openNote: 'A2', color: '#8B4513' },
            { name: 'E', openNote: 'E2', color: '#8B4513' }  // Low E
        ];
        this.frets = 12;
        this.showNoteNames = true;
        this.markMode = false;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.addRealisticGuitarStyles();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="guitar-interface">
                <div class="guitar-controls">
                    <button id="markBtn" class="control-btn">Mark</button>
                    <button id="noteNamesBtn" class="control-btn active">Hide note names</button>
                    <button id="playBtn" class="control-btn">Play</button>
                </div>
                
                <div class="guitar-container">
                    <div class="guitar-neck">
                        ${this.renderFretboard()}
                    </div>
                    <div class="guitar-body">
                        <div class="sound-hole">
                            <div class="rosette"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderFretboard() {
        let fretboardHTML = '';
        
        // Fret markers at the top
        fretboardHTML += '<div class="fret-markers">';
        fretboardHTML += '<div class="fret-marker">Open</div>';
        for (let fret = 1; fret <= this.frets; fret++) {
            fretboardHTML += `<div class="fret-marker">${fret}</div>`;
        }
        fretboardHTML += '</div>';
        
        // String tuning labels
        fretboardHTML += '<div class="string-labels">';
        this.strings.forEach((string, index) => {
            fretboardHTML += `<div class="string-label">${string.name}</div>`;
        });
        fretboardHTML += '</div>';
        
        // Fretboard with strings
        fretboardHTML += '<div class="fretboard">';
        
        // Render each string
        this.strings.forEach((string, stringIndex) => {
            fretboardHTML += `<div class="guitar-string" data-string="${stringIndex}">`;
            
            // Open string position
            const openNote = string.openNote;
            fretboardHTML += `
                <div class="fret-position open-string" 
                     data-string="${stringIndex}" 
                     data-fret="0" 
                     data-note="${openNote}">
                    ${this.showNoteNames ? `<span class="note-name">${openNote.replace(/\d+/, '')}</span>` : ''}
                </div>
            `;
            
            // Fret positions
            for (let fret = 1; fret <= this.frets; fret++) {
                const noteAtFret = this.getNoteAtFret(string.openNote, fret);
                fretboardHTML += `
                    <div class="fret-position" 
                         data-string="${stringIndex}" 
                         data-fret="${fret}" 
                         data-note="${noteAtFret}">
                        ${this.showNoteNames ? `<span class="note-name">${noteAtFret.replace(/\d+/, '')}</span>` : ''}
                    </div>
                `;
            }
            
            fretboardHTML += '</div>';
        });
        
        // Add fret position markers (dots)
        fretboardHTML += '<div class="position-markers">';
        [3, 5, 7, 9, 12].forEach(fret => {
            if (fret === 12) {
                fretboardHTML += `<div class="position-dot double" style="grid-column: ${fret + 1}"></div>`;
            } else {
                fretboardHTML += `<div class="position-dot" style="grid-column: ${fret + 1}"></div>`;
            }
        });
        fretboardHTML += '</div>';
        
        fretboardHTML += '</div>';
        
        return fretboardHTML;
    }
    
    getNoteAtFret(openNote, fret) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteMatch = openNote.match(/([A-G]#?)(\d+)/);
        const noteName = noteMatch[1];
        const octave = parseInt(noteMatch[2]);
        
        const startIndex = notes.indexOf(noteName);
        const newIndex = (startIndex + fret) % 12;
        const octaveShift = Math.floor((startIndex + fret) / 12);
        
        return notes[newIndex] + (octave + octaveShift);
    }
    
    setupEventListeners() {
        // Fret position events
        const fretPositions = this.container.querySelectorAll('.fret-position');
        fretPositions.forEach(position => {
            position.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.playFret(position);
            });
            
            position.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.stopFret(position);
            });
            
            position.addEventListener('mouseleave', (e) => {
                this.stopFret(position);
            });
            
            // Touch events for mobile
            position.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playFret(position);
            });
            
            position.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopFret(position);
            });
        });
        
        // Control events
        const markBtn = this.container.querySelector('#markBtn');
        const noteNamesBtn = this.container.querySelector('#noteNamesBtn');
        const playBtn = this.container.querySelector('#playBtn');
        
        markBtn.addEventListener('click', () => this.toggleMarkMode());
        noteNamesBtn.addEventListener('click', () => this.toggleNoteNames());
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playMarkedNotes());
        }
        
        // Keyboard events for string playing
        this.keyboardHandler = (e) => this.handleKeyboard(e);
        document.addEventListener('keydown', this.keyboardHandler);
        document.addEventListener('keyup', this.keyboardHandler);
        
        // Initialize properties
        this.markMode = false;
    }
    
    playFret(fretElement) {
        const note = fretElement.dataset.note;
        if (!note) return;
        
        // Add active class for visual feedback
        fretElement.classList.add('active');
        
        // Show note name if enabled
        if (this.showNoteNames && !fretElement.querySelector('.note-name')) {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'note-name';
            nameSpan.textContent = note.replace(/\d+/, '');
            fretElement.appendChild(nameSpan);
        }
        
        // Play sound using Web Audio API
        const frequency = this.getFrequency(note);
        if (frequency && window.audioEngine) {
            const oscillator = window.audioEngine.audioCtx.createOscillator();
            const gainNode = window.audioEngine.audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(window.audioEngine.audioCtx.destination);
            
            oscillator.frequency.setValueAtTime(frequency, window.audioEngine.audioCtx.currentTime);
            oscillator.type = 'sawtooth'; // Guitar-like tone
            
            // Guitar envelope - quick attack, sustained tone
            gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.4, window.audioEngine.audioCtx.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.2, window.audioEngine.audioCtx.currentTime + 0.3);
            
            oscillator.start();
            
            // Store for cleanup
            fretElement._oscillator = oscillator;
            fretElement._gainNode = gainNode;
        }
        
        // Handle mark mode
        if (this.markMode) {
            fretElement.classList.toggle('marked');
        }
    }
    
    stopFret(fretElement) {
        fretElement.classList.remove('active');
        
        // Stop sound
        if (fretElement._oscillator) {
            fretElement._gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.2);
            fretElement._oscillator.stop(window.audioEngine.audioCtx.currentTime + 0.2);
            delete fretElement._oscillator;
            delete fretElement._gainNode;
        }
    }
    
    handleKeyboard(e) {
        const key = e.key.toLowerCase();
        
        // Simple keyboard mapping for guitar strings
        const keyMap = {
            '1': { string: 0, fret: 0 }, // High E open
            '2': { string: 1, fret: 0 }, // B open
            '3': { string: 2, fret: 0 }, // G open
            '4': { string: 3, fret: 0 }, // D open
            '5': { string: 4, fret: 0 }, // A open
            '6': { string: 5, fret: 0 }, // Low E open
            'q': { string: 0, fret: 1 },
            'w': { string: 0, fret: 2 },
            'e': { string: 0, fret: 3 },
            'r': { string: 0, fret: 4 },
            't': { string: 0, fret: 5 }
        };
        
        if (keyMap[key]) {
            const { string, fret } = keyMap[key];
            const fretElement = this.container.querySelector(`[data-string="${string}"][data-fret="${fret}"]`);
            
            if (fretElement) {
                if (e.type === 'keydown' && !e.repeat) {
                    this.playFret(fretElement);
                } else if (e.type === 'keyup') {
                    this.stopFret(fretElement);
                }
            }
        }
    }
    
    toggleMarkMode() {
        this.markMode = !this.markMode;
        const markBtn = this.container.querySelector('#markBtn');
        markBtn.classList.toggle('active', this.markMode);
        
        if (!this.markMode) {
            // Clear all marks when exiting mark mode
            this.container.querySelectorAll('.fret-position.marked').forEach(position => {
                position.classList.remove('marked');
            });
        }
    }
    
    toggleNoteNames() {
        this.showNoteNames = !this.showNoteNames;
        const noteNamesBtn = this.container.querySelector('#noteNamesBtn');
        noteNamesBtn.classList.toggle('active', this.showNoteNames);
        noteNamesBtn.textContent = this.showNoteNames ? 'Hide note names' : 'Show note names';
        
        if (this.showNoteNames) {
            // Show all note names
            this.container.querySelectorAll('.fret-position').forEach(position => {
                if (!position.querySelector('.note-name')) {
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'note-name';
                    nameSpan.textContent = position.dataset.note.replace(/\d+/, '');
                    position.appendChild(nameSpan);
                }
            });
        } else {
            // Hide all note names
            this.container.querySelectorAll('.note-name').forEach(span => {
                span.remove();
            });
        }
    }
    
    playMarkedNotes() {
        const markedPositions = this.container.querySelectorAll('.fret-position.marked');
        if (markedPositions.length === 0) return;
        
        // Play all marked notes as a chord
        markedPositions.forEach(position => {
            this.playFret(position);
            setTimeout(() => this.stopFret(position), 1500); // Hold for 1.5 seconds
        });
    }
    
    getFrequency(note) {
        const noteMap = {
            'E2': 82.41, 'F2': 87.31, 'F#2': 92.50, 'G2': 98.00, 'G#2': 103.83, 'A2': 110.00,
            'A#2': 116.54, 'B2': 123.47, 'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
            'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00,
            'A#3': 233.08, 'B3': 246.94, 'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
            'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
            'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33
        };
        return noteMap[note] || 220;
    }
    
    addRealisticGuitarStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .guitar-interface {
                background: #ffffff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            
            .guitar-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .control-btn {
                padding: 8px 16px;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                background: #f9fafb;
                color: #374151;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .control-btn:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
            }
            
            .control-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }
            
            .guitar-container {
                display: flex;
                align-items: center;
                gap: 20px;
                background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%);
                border-radius: 12px;
                padding: 20px;
                box-shadow: 
                    inset 0 2px 4px rgba(0,0,0,0.1),
                    0 4px 8px rgba(0,0,0,0.15);
            }
            
            .guitar-neck {
                flex: 1;
                background: linear-gradient(to right, #8B4513, #A0522D);
                border-radius: 4px;
                padding: 15px;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
            }
            
            .fret-markers {
                display: grid;
                grid-template-columns: 80px repeat(12, 1fr);
                gap: 2px;
                margin-bottom: 10px;
            }
            
            .fret-marker {
                text-align: center;
                font-size: 12px;
                color: #f5f5dc;
                font-weight: 500;
            }
            
            .string-labels {
                display: grid;
                grid-template-rows: repeat(6, 1fr);
                gap: 8px;
                margin-bottom: 10px;
                width: 80px;
            }
            
            .string-label {
                text-align: center;
                font-weight: bold;
                color: #f5f5dc;
                font-size: 14px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .fretboard {
                position: relative;
                display: grid;
                grid-template-rows: repeat(6, 1fr);
                gap: 8px;
                background: linear-gradient(to right, #8B4513, #D2691E);
                border-radius: 4px;
                padding: 10px 0;
            }
            
            .guitar-string {
                display: grid;
                grid-template-columns: 80px repeat(12, 1fr);
                gap: 2px;
                align-items: center;
                position: relative;
            }
            
            .guitar-string::before {
                content: '';
                position: absolute;
                left: 80px;
                right: 0;
                top: 50%;
                height: 2px;
                background: linear-gradient(to right, #FFD700, #FFA500);
                z-index: 1;
                box-shadow: 0 1px 2px rgba(0,0,0,0.3);
            }
            
            .fret-position {
                height: 30px;
                background: rgba(139, 69, 19, 0.3);
                border: 1px solid rgba(210, 180, 140, 0.5);
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                position: relative;
                z-index: 2;
                backdrop-filter: blur(1px);
            }
            
            .fret-position:hover {
                background: rgba(160, 82, 45, 0.6);
                border-color: #DEB887;
                transform: scale(1.05);
            }
            
            .fret-position.active {
                background: #FF6B35;
                border-color: #FF8C42;
                box-shadow: 0 0 10px rgba(255, 107, 53, 0.6);
                transform: scale(1.1);
            }
            
            .fret-position.marked {
                background: #10B981;
                border-color: #34D399;
            }
            
            .fret-position.marked.active {
                background: #059669;
                box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
            }
            
            .open-string {
                background: rgba(218, 165, 32, 0.4) !important;
            }
            
            .note-name {
                font-size: 11px;
                font-weight: bold;
                color: #f5f5dc;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
                pointer-events: none;
            }
            
            .position-markers {
                position: absolute;
                display: grid;
                grid-template-columns: 80px repeat(12, 1fr);
                gap: 2px;
                width: 100%;
                height: 100%;
                pointer-events: none;
                top: 0;
                left: 0;
            }
            
            .position-dot {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .position-dot::before {
                content: '';
                width: 8px;
                height: 8px;
                background: #F5F5DC;
                border-radius: 50%;
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.3);
            }
            
            .position-dot.double::before {
                box-shadow: 
                    0 -15px 0 #F5F5DC,
                    0 15px 0 #F5F5DC,
                    inset 0 1px 2px rgba(0,0,0,0.3);
            }
            
            .guitar-body {
                width: 150px;
                height: 200px;
                background: radial-gradient(ellipse at center, #D2691E, #8B4513);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 
                    inset 0 4px 8px rgba(0,0,0,0.2),
                    0 4px 8px rgba(0,0,0,0.15);
            }
            
            .sound-hole {
                width: 60px;
                height: 60px;
                background: radial-gradient(circle at 30% 30%, #2D1810, #000);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 
                    inset 0 0 20px rgba(0,0,0,0.8),
                    0 2px 4px rgba(0,0,0,0.3);
            }
            
            .rosette {
                width: 40px;
                height: 40px;
                border: 2px solid #8B4513;
                border-radius: 50%;
                background: conic-gradient(
                    from 0deg, 
                    #D2691E 0deg 60deg,
                    #8B4513 60deg 120deg,
                    #D2691E 120deg 180deg,
                    #8B4513 180deg 240deg,
                    #D2691E 240deg 300deg,
                    #8B4513 300deg 360deg
                );
            }
            
            @media (max-width: 768px) {
                .guitar-container {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .fret-markers,
                .guitar-string,
                .position-markers {
                    grid-template-columns: 60px repeat(8, 1fr);
                }
                
                .string-labels {
                    width: 60px;
                }
                
                .fret-marker {
                    font-size: 10px;
                }
                
                .guitar-body {
                    width: 120px;
                    height: 160px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    cleanup() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            document.removeEventListener('keyup', this.keyboardHandler);
        }
        
        // Stop all active sounds
        this.container.querySelectorAll('.fret-position').forEach(position => {
            this.stopFret(position);
        });
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.VirtualGuitar = VirtualGuitar;
}
