// Piano-specific JavaScript
class VirtualPiano {
    constructor() {
        this.currentOctave = 4;
        this.sustainPedal = false;
        this.isRecording = false;
        this.recordedNotes = [];
        this.recordingStartTime = 0;
        this.playbackTimeout = null;
        this.activeNotes = new Map();
        this.sustainedNotes = new Set();
        this.volume = 0.7;
        this.visualizerBars = [];
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupPiano();
            this.setupControls();
            this.setupKeyboardShortcuts();
            this.setupVisualizer();
            this.setupRecording();
        });
    }

    setupPiano() {
        this.createPianoKeys();
        this.updateOctaveDisplay();
    }

    createPianoKeys() {
        const keyboard = document.getElementById('piano-keyboard');
        if (!keyboard) return;

        keyboard.innerHTML = '';
        
        // Create 2 octaves worth of keys starting from current octave
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        for (let octave = this.currentOctave; octave <= this.currentOctave + 1; octave++) {
            notes.forEach((note, index) => {
                const key = document.createElement('button');
                const isBlack = note.includes('#');
                const noteId = `${note}${octave}`;
                
                key.className = `piano-key ${isBlack ? 'black' : 'white'}`;
                key.setAttribute('data-note', noteId);
                key.setAttribute('data-frequency', window.musicStudio.getNoteFrequency(noteId));
                
                if (!isBlack) {
                    key.textContent = note;
                }
                
                // Mouse events
                key.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    this.playNote(noteId, key);
                });
                
                key.addEventListener('mouseup', (e) => {
                    e.preventDefault();
                    this.stopNote(noteId, key);
                });
                
                key.addEventListener('mouseleave', (e) => {
                    this.stopNote(noteId, key);
                });
                
                // Touch events
                key.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.playNote(noteId, key);
                });
                
                key.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.stopNote(noteId, key);
                });
                
                // Prevent default to avoid double events
                key.addEventListener('click', (e) => {
                    e.preventDefault();
                });
                
                keyboard.appendChild(key);
                
                // Position black keys
                if (isBlack) {
                    const whiteKeyWidth = 40;
                    const blackKeyOffset = this.getBlackKeyOffset(note, index, octave - this.currentOctave);
                    key.style.left = `${blackKeyOffset}px`;
                }
            });
        }
    }

    getBlackKeyOffset(note, noteIndex, octaveOffset) {
        const whiteKeyWidth = 40;
        const octaveWidth = whiteKeyWidth * 7; // 7 white keys per octave
        const baseOffset = octaveOffset * octaveWidth;
        
        const offsets = {
            'C#': whiteKeyWidth * 0.7,
            'D#': whiteKeyWidth * 1.7,
            'F#': whiteKeyWidth * 3.7,
            'G#': whiteKeyWidth * 4.7,
            'A#': whiteKeyWidth * 5.7
        };
        
        return baseOffset + (offsets[note] || 0);
    }

    setupControls() {
        // Octave controls
        const octaveUp = document.getElementById('octave-up');
        const octaveDown = document.getElementById('octave-down');
        
        if (octaveUp) {
            octaveUp.addEventListener('click', () => {
                if (this.currentOctave < 7) {
                    this.currentOctave++;
                    this.updateOctaveDisplay();
                    this.createPianoKeys();
                }
            });
        }
        
        if (octaveDown) {
            octaveDown.addEventListener('click', () => {
                if (this.currentOctave > 1) {
                    this.currentOctave--;
                    this.updateOctaveDisplay();
                    this.createPianoKeys();
                }
            });
        }
        
        // Volume control
        const volumeSlider = document.getElementById('volume-slider');
        const volumeValue = document.getElementById('volume-value');
        
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.volume = e.target.value / 100;
                if (volumeValue) {
                    volumeValue.textContent = `${e.target.value}%`;
                }
                if (window.musicStudio.masterGain) {
                    window.musicStudio.masterGain.gain.value = this.volume;
                }
            });
        }
        
        // Sustain pedal
        const sustainBtn = document.getElementById('sustain-btn');
        if (sustainBtn) {
            sustainBtn.addEventListener('click', () => {
                this.toggleSustain();
            });
        }
        
        // Recording controls
        const recordBtn = document.getElementById('record-btn');
        if (recordBtn) {
            recordBtn.addEventListener('click', () => {
                this.openRecordingModal();
            });
        }
    }

    setupKeyboardShortcuts() {
        // Piano key mappings
        const keyMap = {
            // White keys: ASDFGHJK
            'KeyA': 'C', 'KeyS': 'D', 'KeyD': 'E', 'KeyF': 'F',
            'KeyG': 'G', 'KeyH': 'A', 'KeyJ': 'B', 'KeyK': 'C',
            // Black keys: WETYO
            'KeyW': 'C#', 'KeyE': 'D#', 'KeyT': 'F#', 'KeyY': 'G#', 'KeyO': 'A#'
        };
        
        const pressedKeys = new Set();
        
        document.addEventListener('keydown', (e) => {
            // Prevent repeat events
            if (pressedKeys.has(e.code)) return;
            pressedKeys.add(e.code);
            
            // Sustain pedal
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.sustainPedal) {
                    this.toggleSustain();
                }
                return;
            }
            
            // Octave controls
            if (e.code === 'ArrowLeft' && this.currentOctave > 1) {
                this.currentOctave--;
                this.updateOctaveDisplay();
                this.createPianoKeys();
                return;
            }
            
            if (e.code === 'ArrowRight' && this.currentOctave < 7) {
                this.currentOctave++;
                this.updateOctaveDisplay();
                this.createPianoKeys();
                return;
            }
            
            // Play notes
            if (keyMap[e.code]) {
                const note = keyMap[e.code];
                const octave = note === 'C' && e.code === 'KeyK' ? this.currentOctave + 1 : this.currentOctave;
                const noteId = `${note}${octave}`;
                const keyElement = document.querySelector(`[data-note="${noteId}"]`);
                
                if (keyElement) {
                    this.playNote(noteId, keyElement);
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            pressedKeys.delete(e.code);
            
            // Release sustain pedal
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.sustainPedal) {
                    this.toggleSustain();
                }
                return;
            }
            
            // Stop notes
            if (keyMap[e.code]) {
                const note = keyMap[e.code];
                const octave = note === 'C' && e.code === 'KeyK' ? this.currentOctave + 1 : this.currentOctave;
                const noteId = `${note}${octave}`;
                const keyElement = document.querySelector(`[data-note="${noteId}"]`);
                
                if (keyElement) {
                    this.stopNote(noteId, keyElement);
                }
            }
        });
    }

    playNote(noteId, keyElement) {
        if (this.activeNotes.has(noteId)) return;
        
        const frequency = window.musicStudio.getNoteFrequency(noteId);
        const audioNodes = window.musicStudio.createOscillator(frequency, 'triangle', {
            attack: 0.01,
            decay: 0.3,
            sustain: 0.3,
            release: 1.0,
            volume: this.volume * 0.4
        });
        
        if (!audioNodes) return;
        
        const { oscillator, gainNode } = audioNodes;
        
        // Add some harmonics for richer piano sound
        const harmonic2 = window.musicStudio.createOscillator(frequency * 2, 'sine', {
            volume: this.volume * 0.1
        });
        const harmonic3 = window.musicStudio.createOscillator(frequency * 3, 'sine', {
            volume: this.volume * 0.05
        });
        
        oscillator.start();
        if (harmonic2) harmonic2.oscillator.start();
        if (harmonic3) harmonic3.oscillator.start();
        
        this.activeNotes.set(noteId, { 
            oscillator, 
            gainNode,
            harmonics: [harmonic2, harmonic3].filter(Boolean)
        });
        
        keyElement.classList.add('active');
        
        // Record note if recording
        if (this.isRecording) {
            this.recordedNotes.push({
                note: noteId,
                time: Date.now() - this.recordingStartTime,
                type: 'start'
            });
        }
        
        // Update visualizer
        this.updateVisualizer(frequency);
    }

    stopNote(noteId, keyElement) {
        if (!this.activeNotes.has(noteId)) return;
        
        keyElement.classList.remove('active');
        
        // If sustain pedal is on, add to sustained notes
        if (this.sustainPedal) {
            this.sustainedNotes.add(noteId);
            keyElement.classList.add('sustained');
            return;
        }
        
        this.releaseNote(noteId);
        
        // Record note end if recording
        if (this.isRecording) {
            this.recordedNotes.push({
                note: noteId,
                time: Date.now() - this.recordingStartTime,
                type: 'end'
            });
        }
    }

    releaseNote(noteId) {
        if (!this.activeNotes.has(noteId)) return;
        
        const { oscillator, gainNode, harmonics } = this.activeNotes.get(noteId);
        
        // Release envelope
        const currentTime = window.musicStudio.audioContext.currentTime;
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
        
        oscillator.stop(currentTime + 0.6);
        harmonics.forEach(h => {
            if (h.oscillator) {
                h.gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
                h.oscillator.stop(currentTime + 0.6);
            }
        });
        
        this.activeNotes.delete(noteId);
        this.sustainedNotes.delete(noteId);
        
        const keyElement = document.querySelector(`[data-note="${noteId}"]`);
        if (keyElement) {
            keyElement.classList.remove('sustained');
        }
    }

    toggleSustain() {
        this.sustainPedal = !this.sustainPedal;
        const sustainBtn = document.getElementById('sustain-btn');
        
        if (sustainBtn) {
            if (this.sustainPedal) {
                sustainBtn.classList.add('active');
                sustainBtn.innerHTML = '<i class="fas fa-music"></i> Sustain ON';
            } else {
                sustainBtn.classList.remove('active');
                sustainBtn.innerHTML = '<i class="fas fa-music"></i> Sustain Pedal';
                
                // Release all sustained notes
                this.sustainedNotes.forEach(noteId => {
                    this.releaseNote(noteId);
                });
            }
        }
    }

    updateOctaveDisplay() {
        const display = document.getElementById('current-octave');
        if (display) {
            display.textContent = this.currentOctave;
        }
        
        // Update button states
        const octaveUp = document.getElementById('octave-up');
        const octaveDown = document.getElementById('octave-down');
        
        if (octaveUp) {
            octaveUp.disabled = this.currentOctave >= 7;
        }
        if (octaveDown) {
            octaveDown.disabled = this.currentOctave <= 1;
        }
    }

    setupVisualizer() {
        const visualizer = document.getElementById('piano-visualizer');
        if (!visualizer) return;
        
        visualizer.innerHTML = '';
        
        // Create visualizer bars
        for (let i = 0; i < 32; i++) {
            const bar = document.createElement('div');
            bar.className = 'visualizer-bar';
            visualizer.appendChild(bar);
            this.visualizerBars.push(bar);
        }
    }

    updateVisualizer(frequency) {
        if (this.visualizerBars.length === 0) return;
        
        // Simple frequency-based visualization
        const barIndex = Math.floor((frequency / 2000) * this.visualizerBars.length);
        const targetBar = this.visualizerBars[Math.min(barIndex, this.visualizerBars.length - 1)];
        
        if (targetBar) {
            targetBar.classList.add('active');
            setTimeout(() => {
                targetBar.classList.remove('active');
            }, 200);
        }
    }

    setupRecording() {
        // Recording modal setup
        const modal = document.getElementById('recording-modal');
        const closeBtn = modal?.querySelector('.modal-close');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeRecordingModal();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeRecordingModal();
                }
            });
        }
        
        // Recording control buttons
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const playBtn = document.getElementById('play-recording');
        const downloadBtn = document.getElementById('download-recording');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startRecording());
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopRecording());
        }
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playRecording());
        }
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadRecording());
        }
    }

    openRecordingModal() {
        const modal = document.getElementById('recording-modal');
        if (modal) {
            modal.style.display = 'block';
        }
    }

    closeRecordingModal() {
        const modal = document.getElementById('recording-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        if (this.isRecording) {
            this.stopRecording();
        }
    }

    startRecording() {
        this.isRecording = true;
        this.recordedNotes = [];
        this.recordingStartTime = Date.now();
        
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const indicator = document.getElementById('recording-indicator');
        
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.classList.add('recording');
            startBtn.innerHTML = '<i class="fas fa-circle"></i> Recording...';
        }
        if (stopBtn) {
            stopBtn.disabled = false;
        }
        if (indicator) {
            indicator.classList.add('recording');
            indicator.textContent = '● REC';
        }
        
        this.updateRecordingTime();
        this.showNotification('Recording started', 'success');
    }

    stopRecording() {
        this.isRecording = false;
        
        const startBtn = document.getElementById('start-recording');
        const stopBtn = document.getElementById('stop-recording');
        const playBtn = document.getElementById('play-recording');
        const downloadBtn = document.getElementById('download-recording');
        const indicator = document.getElementById('recording-indicator');
        
        if (startBtn) {
            startBtn.disabled = false;
            startBtn.classList.remove('recording');
            startBtn.innerHTML = '<i class="fas fa-circle"></i> Start Recording';
        }
        if (stopBtn) {
            stopBtn.disabled = true;
        }
        if (playBtn) {
            playBtn.disabled = this.recordedNotes.length === 0;
        }
        if (downloadBtn) {
            downloadBtn.disabled = this.recordedNotes.length === 0;
        }
        if (indicator) {
            indicator.classList.remove('recording');
            indicator.textContent = '';
        }
        
        this.showNotification(
            `Recording stopped. ${this.recordedNotes.length} events recorded.`, 
            'info'
        );
    }

    updateRecordingTime() {
        if (!this.isRecording) return;
        
        const timeDisplay = document.getElementById('recording-time');
        if (timeDisplay) {
            const elapsed = (Date.now() - this.recordingStartTime) / 1000;
            const minutes = Math.floor(elapsed / 60);
            const seconds = Math.floor(elapsed % 60);
            timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        setTimeout(() => this.updateRecordingTime(), 100);
    }

    playRecording() {
        if (this.recordedNotes.length === 0) return;
        
        const playBtn = document.getElementById('play-recording');
        if (playBtn) {
            playBtn.disabled = true;
            playBtn.classList.add('playing');
            playBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
        }
        
        // Clear any existing playback
        if (this.playbackTimeout) {
            clearTimeout(this.playbackTimeout);
        }
        
        // Play recorded notes
        this.recordedNotes.forEach(event => {
            setTimeout(() => {
                const keyElement = document.querySelector(`[data-note="${event.note}"]`);
                if (keyElement) {
                    if (event.type === 'start') {
                        this.playNote(event.note, keyElement);
                    } else {
                        this.stopNote(event.note, keyElement);
                    }
                }
            }, event.time);
        });
        
        // Calculate total duration
        const duration = Math.max(...this.recordedNotes.map(n => n.time));
        
        this.playbackTimeout = setTimeout(() => {
            if (playBtn) {
                playBtn.disabled = false;
                playBtn.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            }
        }, duration + 1000);
        
        this.showNotification('Playing recording...', 'info');
    }

    downloadRecording() {
        if (this.recordedNotes.length === 0) return;
        
        const data = {
            version: '1.0',
            instrument: 'piano',
            notes: this.recordedNotes,
            duration: Math.max(...this.recordedNotes.map(n => n.time)),
            created: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const filename = `piano-recording-${new Date().toISOString().slice(0, 10)}.json`;
        this.downloadBlob(blob, filename);
        
        this.showNotification('Recording downloaded!', 'success');
    }
    
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Apply notification styles
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
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
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

// Initialize piano when DOM is loaded
const piano = new VirtualPiano();
