// Virtual Piano Instrument - Musicca Style
class VirtualPiano {
    constructor(container, audioContext) {
        this.container = container;
        this.audioContext = audioContext;
        this.audioEngine = new AudioEngine(audioContext);
        
        this.currentOctave = 4;
        this.sustainPressed = false;
        this.activeNotes = new Map();
        this.keyMap = new Map();
        this.showNoteNames = true;
        this.markedNotes = new Set();
        
        // Piano configuration - More keys like Musicca
        this.totalKeys = 21; // 3 octaves
        this.startNote = 'C';
        this.startOctave = 3;
        
        this.init();
    }
    
    init() {
        this.setupKeyMapping();
        this.render();
        this.setupEventListeners();
    }
    
    setupKeyMapping() {
        // Musicca-style keyboard mapping
        // Top row (numbers) for black keys
        this.keyMap.set('2', { note: 'C#', octave: 4 });
        this.keyMap.set('3', { note: 'D#', octave: 4 });
        this.keyMap.set('5', { note: 'F#', octave: 4 });
        this.keyMap.set('6', { note: 'G#', octave: 4 });
        this.keyMap.set('7', { note: 'A#', octave: 4 });
        this.keyMap.set('9', { note: 'C#', octave: 5 });
        this.keyMap.set('0', { note: 'D#', octave: 5 });
        
        // QWERTY row for white keys
        this.keyMap.set('q', { note: 'C', octave: 4 });
        this.keyMap.set('w', { note: 'D', octave: 4 });
        this.keyMap.set('e', { note: 'E', octave: 4 });
        this.keyMap.set('r', { note: 'F', octave: 4 });
        this.keyMap.set('t', { note: 'G', octave: 4 });
        this.keyMap.set('y', { note: 'A', octave: 4 });
        this.keyMap.set('u', { note: 'B', octave: 4 });
        this.keyMap.set('i', { note: 'C', octave: 5 });
        this.keyMap.set('o', { note: 'D', octave: 5 });
        this.keyMap.set('p', { note: 'E', octave: 5 });
    }
    
    render() {
        this.container.innerHTML = `
            <div class="piano-interface">
                <div class="piano-controls">
                    <button class="control-btn" id="markBtn">Mark</button>
                    <button class="control-btn" id="noteNamesBtn">${this.showNoteNames ? 'Hide note names' : 'Show note names'}</button>
                    <button class="control-btn" id="playBtn" style="display: none;">Play</button>
                </div>
                <div class="piano-container">
                    <div class="piano-keyboard" id="pianoKeyboard">
                        ${this.renderRealisticKeyboard()}
                    </div>
                </div>
            </div>
        `;
        
        this.addRealisticPianoStyles();
    }
    
    renderRealisticKeyboard() {
        let keyboardHTML = '';
        const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        const blackKeyPositions = {
            'C#': 1, 'D#': 2, 'F#': 4, 'G#': 5, 'A#': 6
        };
        
        // Generate 3 octaves starting from C3
        for (let octave = 3; octave <= 5; octave++) {
            for (let i = 0; i < whiteKeys.length; i++) {
                const note = whiteKeys[i];
                const noteId = `${note}${octave}`;
                
                keyboardHTML += `
                    <div class="piano-key white-key" 
                         data-note="${note}" 
                         data-octave="${octave}"
                         data-note-id="${noteId}"
                         id="key-${noteId}">
                        ${this.showNoteNames ? `<span class="note-label">${note}</span>` : ''}
                    </div>
                `;
            }
        }
        
        // Add black keys
        for (let octave = 3; octave <= 5; octave++) {
            Object.keys(blackKeyPositions).forEach(blackNote => {
                const noteId = `${blackNote}${octave}`;
                const position = blackKeyPositions[blackNote] + (octave - 3) * 7;
                
                keyboardHTML += `
                    <div class="piano-key black-key" 
                         data-note="${blackNote}" 
                         data-octave="${octave}"
                         data-note-id="${noteId}"
                         data-position="${position}"
                         id="key-${noteId}">
                        ${this.showNoteNames ? `<span class="note-label">${blackNote}</span>` : ''}
                    </div>
                `;
            });
        }
        
        return keyboardHTML;
    }
    
    setupEventListeners() {
        // Piano key events
        const keys = this.container.querySelectorAll('.piano-key');
        keys.forEach(key => {
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.playKey(key);
            });
            
            key.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.stopKey(key);
            });
            
            key.addEventListener('mouseleave', (e) => {
                this.stopKey(key);
            });
            
            // Touch events for mobile
            key.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playKey(key);
            });
            
            key.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.stopKey(key);
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
        
        // Keyboard events - Musicca style
        this.keyboardHandler = (e) => this.handleKeyboard(e);
        document.addEventListener('keydown', this.keyboardHandler);
        document.addEventListener('keyup', this.keyboardHandler);
        
        // Initialize properties
        this.markMode = false;
    }
    
    handleKeyboard(e) {
        const key = e.key.toLowerCase();
        
        // Handle special keys
        if (e.type === 'keydown') {
            if (key === 'arrowup') {
                e.preventDefault();
                this.changeOctave(1);
                return;
            }
            if (key === 'arrowdown') {
                e.preventDefault();
                this.changeOctave(-1);
                return;
            }
            if (key === ' ') {
                e.preventDefault();
                if (!this.sustainPressed) {
                    this.toggleSustain();
                }
                return;
            }
        }
        
        // Handle note keys
        if (this.keyMap.has(key)) {
            const noteData = this.keyMap.get(key);
            const noteId = `${noteData.note}${noteData.octave}`;
            const keyElement = this.container.querySelector(`[data-note-id="${noteId}"]`);
            
            if (keyElement) {
                if (e.type === 'keydown' && !e.repeat) {
                    this.playKey(keyElement);
                } else if (e.type === 'keyup' && !this.sustainPressed) {
                    this.stopKey(keyElement);
                }
            }
        }
    }
    
    playKey(keyElement) {
        const note = keyElement.dataset.note;
        if (!note) return;
        
        // Add active class for visual feedback
        keyElement.classList.add('active');
        
        // Show note name if enabled
        if (this.showNoteNames && !keyElement.querySelector('.note-name')) {
            const nameSpan = document.createElement('span');
            nameSpan.className = 'note-name';
            nameSpan.textContent = note.replace(/\d+/, '');
            keyElement.appendChild(nameSpan);
        }
        
        // Play sound using Web Audio API
        const frequency = this.getFrequency(note);
        if (frequency && window.audioEngine) {
            const oscillator = window.audioEngine.audioCtx.createOscillator();
            const gainNode = window.audioEngine.audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(window.audioEngine.audioCtx.destination);
            
            oscillator.frequency.setValueAtTime(frequency, window.audioEngine.audioCtx.currentTime);
            oscillator.type = 'sine'; // Clean piano-like tone
            
            // Realistic envelope - attack and decay
            gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, window.audioEngine.audioCtx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.1, window.audioEngine.audioCtx.currentTime + 0.5);
            
            oscillator.start();
            
            // Store for cleanup
            keyElement._oscillator = oscillator;
            keyElement._gainNode = gainNode;
        }
        
        // Handle mark mode
        if (this.markMode) {
            keyElement.classList.toggle('marked');
        }
    }
    
    stopKey(keyElement) {
        keyElement.classList.remove('active');
        
        // Stop sound
        if (keyElement._oscillator) {
            keyElement._gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.1);
            keyElement._oscillator.stop(window.audioEngine.audioCtx.currentTime + 0.1);
            delete keyElement._oscillator;
            delete keyElement._gainNode;
        }
    }
    
    createRippleEffect(keyElement) {
        const ripple = document.createElement('div');
        ripple.className = 'key-ripple';
        keyElement.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    toggleMarkMode() {
        this.markMode = !this.markMode;
        const markBtn = this.container.querySelector('#markBtn');
        markBtn.classList.toggle('active', this.markMode);
        
        if (!this.markMode) {
            // Clear all marks when exiting mark mode
            this.container.querySelectorAll('.piano-key.marked').forEach(key => {
                key.classList.remove('marked');
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
            this.container.querySelectorAll('.piano-key').forEach(key => {
                if (!key.querySelector('.note-name')) {
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'note-name';
                    nameSpan.textContent = key.dataset.note.replace(/\d+/, '');
                    key.appendChild(nameSpan);
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
        const markedKeys = this.container.querySelectorAll('.piano-key.marked');
        if (markedKeys.length === 0) return;
        
        // Play all marked notes as a chord
        markedKeys.forEach(key => {
            this.playKey(key);
            setTimeout(() => this.stopKey(key), 1000); // Hold for 1 second
        });
    }
    
    getFrequency(note) {
        const noteMap = {
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
            'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
            'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
            'D#5': 622.25, 'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
            'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77, 'C6': 1046.50
        };
        return noteMap[note] || 440;
    }
    
    cleanup() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            document.removeEventListener('keyup', this.keyboardHandler);
        }
        
        // Stop all active sounds
        this.container.querySelectorAll('.piano-key').forEach(key => {
            this.stopKey(key);
        });
    }
    
    addRealisticPianoStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .piano-interface {
                background: #ffffff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            
            .piano-controls {
                display: flex;
                gap: 12px;
                margin-bottom: 20px;
                justify-content: center;
            }
            
            .control-btn {
                background: #3b82f6;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .control-btn:hover {
                background: #2563eb;
            }
            
            .control-btn.active {
                background: #059669;
            }
            
            .piano-container {
                display: flex;
                justify-content: center;
                background: #1e293b;
                padding: 30px 20px;
                border-radius: 12px;
                box-shadow: inset 0 4px 8px rgb(0 0 0 / 0.3);
            }
            
            .piano-keyboard {
                position: relative;
                display: flex;
                align-items: flex-end;
            }
            
            .piano-key {
                position: relative;
                cursor: pointer;
                user-select: none;
                transition: all 0.1s ease;
                border: 1px solid;
            }
            
            .white-key {
                width: 40px;
                height: 200px;
                background: linear-gradient(to bottom, #ffffff 0%, #f8f9fa 50%, #e9ecef 100%);
                border-color: #dee2e6;
                border-radius: 0 0 6px 6px;
                margin: 0 1px;
                z-index: 1;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                padding-bottom: 12px;
            }
            
            .black-key {
                width: 28px;
                height: 130px;
                background: linear-gradient(to bottom, #495057 0%, #343a40 50%, #212529 100%);
                border-color: #000000;
                border-radius: 0 0 4px 4px;
                position: absolute;
                z-index: 2;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                padding-bottom: 8px;
                box-shadow: 0 4px 8px rgb(0 0 0 / 0.5);
            }
            
            /* Position black keys precisely like a real piano */
            .black-key[data-position="1"] { left: 28px; }
            .black-key[data-position="2"] { left: 69px; }
            .black-key[data-position="4"] { left: 151px; }
            .black-key[data-position="5"] { left: 192px; }
            .black-key[data-position="6"] { left: 233px; }
            .black-key[data-position="8"] { left: 315px; }
            .black-key[data-position="9"] { left: 356px; }
            .black-key[data-position="11"] { left: 438px; }
            .black-key[data-position="12"] { left: 479px; }
            .black-key[data-position="13"] { left: 520px; }
            .black-key[data-position="15"] { left: 602px; }
            .black-key[data-position="16"] { left: 643px; }
            .black-key[data-position="18"] { left: 725px; }
            .black-key[data-position="19"] { left: 766px; }
            .black-key[data-position="20"] { left: 807px; }
            
            .piano-key:active,
            .piano-key.active {
                transform: translateY(2px);
            }
            
            .white-key:active,
            .white-key.active {
                background: linear-gradient(to bottom, #e9ecef 0%, #dee2e6 50%, #ced4da 100%);
                box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.2);
            }
            
            .black-key:active,
            .black-key.active {
                background: linear-gradient(to bottom, #343a40 0%, #212529 50%, #000000 100%);
                box-shadow: inset 0 2px 4px rgb(0 0 0 / 0.3);
            }
            
            .note-label {
                font-size: 12px;
                font-weight: 600;
                color: #64748b;
                text-align: center;
            }
            
            .black-key .note-label {
                color: #94a3b8;
            }
            
            .piano-key.marked {
                background: #fef3c7 !important;
            }
            
            .piano-key.marked.black-key {
                background: #f59e0b !important;
            }
            
            @media (max-width: 768px) {
                .piano-keyboard {
                    overflow-x: auto;
                    width: 100%;
                }
                
                .white-key {
                    width: 32px;
                    height: 160px;
                }
                
                .black-key {
                    width: 22px;
                    height: 100px;
                }
                
                /* Adjust black key positions for mobile */
                .black-key[data-position="1"] { left: 22px; }
                .black-key[data-position="2"] { left: 55px; }
                .black-key[data-position="4"] { left: 121px; }
                .black-key[data-position="5"] { left: 154px; }
                .black-key[data-position="6"] { left: 187px; }
                .black-key[data-position="8"] { left: 253px; }
                .black-key[data-position="9"] { left: 286px; }
                .black-key[data-position="11"] { left: 352px; }
                .black-key[data-position="12"] { left: 385px; }
                .black-key[data-position="13"] { left: 418px; }
                .black-key[data-position="15"] { left: 484px; }
                .black-key[data-position="16"] { left: 517px; }
                .black-key[data-position="18"] { left: 583px; }
                .black-key[data-position="19"] { left: 616px; }
                .black-key[data-position="20"] { left: 649px; }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    mount(container) {
        this.container = container;
        this.render();
        this.setupEventListeners();
    }
    
    cleanup() {
        // Remove event listeners
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
            document.removeEventListener('keyup', this.keyboardHandler);
        }
        
        // Stop all playing notes
        this.stopAllNotes();
    }
}
