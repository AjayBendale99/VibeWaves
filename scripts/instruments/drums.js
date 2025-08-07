// Virtual Drums Instrument - Musicca Style
class VirtualDrums {
    constructor(container, audioContext) {
        this.container = container;
        this.audioContext = audioContext;
        
        // Drum kit configuration - Realistic drum set
        this.drumKit = {
            kick: { 
                name: 'Kick Drum', 
                frequency: 60, 
                position: { x: '50%', y: '85%' },
                size: { width: 80, height: 80 },
                color: '#2D1810'
            },
            snare: { 
                name: 'Snare', 
                frequency: 200, 
                position: { x: '30%', y: '65%' },
                size: { width: 60, height: 60 },
                color: '#C0C0C0'
            },
            hihatClosed: { 
                name: 'Hi-Hat (Closed)', 
                frequency: 8000, 
                position: { x: '15%', y: '45%' },
                size: { width: 45, height: 45 },
                color: '#FFD700'
            },
            hihatOpen: { 
                name: 'Hi-Hat (Open)', 
                frequency: 6000, 
                position: { x: '15%', y: '30%' },
                size: { width: 45, height: 45 },
                color: '#FFA500'
            },
            crash: { 
                name: 'Crash Cymbal', 
                frequency: 5000, 
                position: { x: '85%', y: '25%' },
                size: { width: 65, height: 65 },
                color: '#DAA520'
            },
            ride: { 
                name: 'Ride Cymbal', 
                frequency: 4000, 
                position: { x: '85%', y: '45%' },
                size: { width: 70, height: 70 },
                color: '#B8860B'
            },
            tomHigh: { 
                name: 'High Tom', 
                frequency: 330, 
                position: { x: '45%', y: '35%' },
                size: { width: 50, height: 50 },
                color: '#8B4513'
            },
            tomMid: { 
                name: 'Mid Tom', 
                frequency: 220, 
                position: { x: '55%', y: '35%' },
                size: { width: 55, height: 55 },
                color: '#8B4513'
            },
            tomFloor: { 
                name: 'Floor Tom', 
                frequency: 110, 
                position: { x: '70%', y: '65%' },
                size: { width: 65, height: 65 },
                color: '#8B4513'
            }
        };
        
        this.showNoteNames = true;
        this.markMode = false;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.addRealisticDrumStyles();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="drums-interface">
                <div class="drums-controls">
                    <button id="markBtn" class="control-btn">Mark</button>
                    <button id="noteNamesBtn" class="control-btn active">Hide note names</button>
                    <button id="playBtn" class="control-btn">Play</button>
                </div>
                
                <div class="drum-kit-container">
                    <div class="drum-kit">
                        ${this.renderDrumKit()}
                    </div>
                </div>
                
                <div class="drum-keyboard-guide">
                    <h4>Keyboard Controls:</h4>
                    <div class="key-mappings">
                        <span><kbd>Space</kbd> - Kick</span>
                        <span><kbd>S</kbd> - Snare</span>
                        <span><kbd>H</kbd> - Hi-Hat</span>
                        <span><kbd>C</kbd> - Crash</span>
                        <span><kbd>R</kbd> - Ride</span>
                        <span><kbd>Q</kbd> - High Tom</span>
                        <span><kbd>W</kbd> - Mid Tom</span>
                        <span><kbd>E</kbd> - Floor Tom</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderDrumKit() {
        let drumKitHTML = '';
        
        Object.entries(this.drumKit).forEach(([drumId, drum]) => {
            drumKitHTML += `
                <div class="drum-piece ${drumId}" 
                     data-drum="${drumId}"
                     data-name="${drum.name}"
                     style="
                         left: ${drum.position.x}; 
                         top: ${drum.position.y};
                         width: ${drum.size.width}px;
                         height: ${drum.size.height}px;
                     ">
                    <div class="drum-surface" style="background-color: ${drum.color}"></div>
                    ${this.showNoteNames ? `<span class="drum-label">${drum.name}</span>` : ''}
                    <div class="hit-animation"></div>
                </div>
            `;
        });
        
        // Add drum set hardware (stands, pedals, etc.)
        drumKitHTML += `
            <div class="drum-hardware">
                <div class="kick-pedal" style="left: 45%; top: 95%;"></div>
                <div class="hihat-pedal" style="left: 10%; top: 55%;"></div>
                <div class="snare-stand" style="left: 25%; top: 75%;"></div>
                <div class="cymbal-stand crash-stand" style="left: 80%; top: 35%;"></div>
                <div class="cymbal-stand ride-stand" style="left: 80%; top: 55%;"></div>
            </div>
        `;
        
        return drumKitHTML;
    }
    
    setupEventListeners() {
        // Drum piece events
        const drumPieces = this.container.querySelectorAll('.drum-piece');
        drumPieces.forEach(piece => {
            piece.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.hitDrum(piece);
            });
            
            piece.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.hitDrum(piece);
            });
        });
        
        // Control events
        const markBtn = this.container.querySelector('#markBtn');
        const noteNamesBtn = this.container.querySelector('#noteNamesBtn');
        const playBtn = this.container.querySelector('#playBtn');
        
        markBtn.addEventListener('click', () => this.toggleMarkMode());
        noteNamesBtn.addEventListener('click', () => this.toggleNoteNames());
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playMarkedDrums());
        }
        
        // Keyboard events
        this.keyboardHandler = (e) => this.handleKeyboard(e);
        document.addEventListener('keydown', this.keyboardHandler);
        
        // Initialize properties
        this.markMode = false;
    }
    
    hitDrum(drumElement) {
        const drumId = drumElement.dataset.drum;
        const drum = this.drumKit[drumId];
        if (!drum) return;
        
        // Add hit animation
        drumElement.classList.add('hit');
        const hitAnimation = drumElement.querySelector('.hit-animation');
        hitAnimation.classList.add('active');
        
        setTimeout(() => {
            drumElement.classList.remove('hit');
            hitAnimation.classList.remove('active');
        }, 200);
        
        // Play drum sound
        this.playDrumSound(drum);
        
        // Handle mark mode
        if (this.markMode) {
            drumElement.classList.toggle('marked');
        }
    }
    
    playDrumSound(drum) {
        if (!window.audioEngine) return;
        
        const oscillator = window.audioEngine.audioCtx.createOscillator();
        const gainNode = window.audioEngine.audioCtx.createGain();
        const filterNode = window.audioEngine.audioCtx.createBiquadFilter();
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(window.audioEngine.audioCtx.destination);
        
        // Different sound characteristics for different drums
        switch (drum.name) {
            case 'Kick Drum':
                oscillator.frequency.setValueAtTime(60, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'sine';
                filterNode.type = 'lowpass';
                filterNode.frequency.setValueAtTime(100, window.audioEngine.audioCtx.currentTime);
                
                // Kick envelope - deep thump
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.8, window.audioEngine.audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.2);
                break;
                
            case 'Snare':
                oscillator.frequency.setValueAtTime(200, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'square';
                filterNode.type = 'bandpass';
                filterNode.frequency.setValueAtTime(1000, window.audioEngine.audioCtx.currentTime);
                
                // Snare envelope - sharp crack
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.6, window.audioEngine.audioCtx.currentTime + 0.005);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.1);
                break;
                
            case 'Hi-Hat (Closed)':
            case 'Hi-Hat (Open)':
                oscillator.frequency.setValueAtTime(8000, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'square';
                filterNode.type = 'highpass';
                filterNode.frequency.setValueAtTime(5000, window.audioEngine.audioCtx.currentTime);
                
                const duration = drum.name.includes('Open') ? 0.3 : 0.05;
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, window.audioEngine.audioCtx.currentTime + 0.001);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + duration);
                break;
                
            case 'Crash Cymbal':
            case 'Ride Cymbal':
                oscillator.frequency.setValueAtTime(4000, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'sawtooth';
                filterNode.type = 'highpass';
                filterNode.frequency.setValueAtTime(2000, window.audioEngine.audioCtx.currentTime);
                
                const cymbalDuration = drum.name.includes('Crash') ? 1.0 : 0.4;
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.4, window.audioEngine.audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + cymbalDuration);
                break;
                
            default: // Toms
                oscillator.frequency.setValueAtTime(drum.frequency, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'sine';
                filterNode.type = 'lowpass';
                filterNode.frequency.setValueAtTime(drum.frequency * 4, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, window.audioEngine.audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.3);
                break;
        }
        
        oscillator.start();
        oscillator.stop(window.audioEngine.audioCtx.currentTime + 2.0);
    }
    
    handleKeyboard(e) {
        if (e.repeat) return;
        
        const key = e.key.toLowerCase();
        const keyMap = {
            ' ': 'kick',
            's': 'snare',
            'h': 'hihatClosed',
            'shift+h': 'hihatOpen',
            'c': 'crash',
            'r': 'ride',
            'q': 'tomHigh',
            'w': 'tomMid',
            'e': 'tomFloor'
        };
        
        const drumId = keyMap[key] || (e.shiftKey && key === 'h' ? 'hihatOpen' : null);
        if (drumId) {
            e.preventDefault();
            const drumElement = this.container.querySelector(`[data-drum="${drumId}"]`);
            if (drumElement) {
                this.hitDrum(drumElement);
            }
        }
    }
    
    toggleMarkMode() {
        this.markMode = !this.markMode;
        const markBtn = this.container.querySelector('#markBtn');
        markBtn.classList.toggle('active', this.markMode);
        
        if (!this.markMode) {
            // Clear all marks when exiting mark mode
            this.container.querySelectorAll('.drum-piece.marked').forEach(piece => {
                piece.classList.remove('marked');
            });
        }
    }
    
    toggleNoteNames() {
        this.showNoteNames = !this.showNoteNames;
        const noteNamesBtn = this.container.querySelector('#noteNamesBtn');
        noteNamesBtn.classList.toggle('active', this.showNoteNames);
        noteNamesBtn.textContent = this.showNoteNames ? 'Hide note names' : 'Show note names';
        
        if (this.showNoteNames) {
            // Show all drum labels
            this.container.querySelectorAll('.drum-piece').forEach(piece => {
                if (!piece.querySelector('.drum-label')) {
                    const labelSpan = document.createElement('span');
                    labelSpan.className = 'drum-label';
                    labelSpan.textContent = piece.dataset.name;
                    piece.appendChild(labelSpan);
                }
            });
        } else {
            // Hide all drum labels
            this.container.querySelectorAll('.drum-label').forEach(label => {
                label.remove();
            });
        }
    }
    
    playMarkedDrums() {
        const markedDrums = this.container.querySelectorAll('.drum-piece.marked');
        if (markedDrums.length === 0) return;
        
        // Play all marked drums in sequence
        markedDrums.forEach((drum, index) => {
            setTimeout(() => {
                this.hitDrum(drum);
            }, index * 100); // 100ms delay between each drum
        });
    }
    
    addRealisticDrumStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .drums-interface {
                background: #ffffff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            
            .drums-controls {
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
            
            .drum-kit-container {
                background: linear-gradient(135deg, #2D1810 0%, #4A4A4A 50%, #2D1810 100%);
                border-radius: 12px;
                padding: 40px;
                margin: 20px 0;
                box-shadow: 
                    inset 0 4px 8px rgba(0,0,0,0.3),
                    0 4px 12px rgba(0,0,0,0.2);
                position: relative;
                overflow: hidden;
            }
            
            .drum-kit-container::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
                pointer-events: none;
            }
            
            .drum-kit {
                position: relative;
                width: 100%;
                height: 400px;
                background: radial-gradient(ellipse at center bottom, rgba(0,0,0,0.2) 0%, transparent 70%);
            }
            
            .drum-piece {
                position: absolute;
                cursor: pointer;
                transition: all 0.1s ease;
                transform-origin: center center;
                user-select: none;
            }
            
            .drum-piece:hover {
                transform: scale(1.05);
                filter: brightness(1.1);
            }
            
            .drum-piece.hit {
                transform: scale(0.95);
                filter: brightness(1.3);
            }
            
            .drum-piece.marked {
                box-shadow: 0 0 15px #10B981;
            }
            
            .drum-surface {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 3px solid rgba(255,255,255,0.2);
                box-shadow: 
                    inset 0 2px 8px rgba(255,255,255,0.3),
                    inset 0 -2px 8px rgba(0,0,0,0.4),
                    0 4px 8px rgba(0,0,0,0.3);
                position: relative;
                overflow: hidden;
            }
            
            .drum-surface::before {
                content: '';
                position: absolute;
                top: 10%;
                left: 20%;
                width: 30%;
                height: 30%;
                background: radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%);
                border-radius: 50%;
            }
            
            .kick .drum-surface {
                background: linear-gradient(135deg, #2D1810 0%, #4D2A1A 50%, #2D1810 100%);
                border-width: 4px;
            }
            
            .snare .drum-surface {
                background: linear-gradient(135deg, #C0C0C0 0%, #E0E0E0 50%, #A0A0A0 100%);
                border-color: #808080;
            }
            
            .hihatClosed .drum-surface,
            .hihatOpen .drum-surface {
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #B8860B 100%);
                border-color: #DAA520;
                border-radius: 10%;
            }
            
            .crash .drum-surface,
            .ride .drum-surface {
                background: linear-gradient(135deg, #DAA520 0%, #B8860B 50%, #8B7355 100%);
                border-color: #CD853F;
                border-radius: 10%;
            }
            
            .tomHigh .drum-surface,
            .tomMid .drum-surface,
            .tomFloor .drum-surface {
                background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #654321 100%);
                border-color: #8B4513;
            }
            
            .drum-label {
                position: absolute;
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 12px;
                font-weight: bold;
                color: #f5f5dc;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                white-space: nowrap;
                pointer-events: none;
            }
            
            .hit-animation {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%);
                transform: translate(-50%, -50%);
                pointer-events: none;
                transition: all 0.2s ease-out;
            }
            
            .hit-animation.active {
                width: 150%;
                height: 150%;
                opacity: 0;
            }
            
            .drum-hardware {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            .kick-pedal,
            .hihat-pedal {
                position: absolute;
                width: 30px;
                height: 15px;
                background: linear-gradient(135deg, #333, #666);
                border-radius: 4px;
                border: 1px solid #555;
                transform: translateX(-50%);
            }
            
            .snare-stand,
            .cymbal-stand {
                position: absolute;
                width: 4px;
                height: 100px;
                background: linear-gradient(180deg, #666, #333);
                transform: translateX(-50%);
                border-radius: 2px;
            }
            
            .snare-stand {
                height: 60px;
                top: 60%;
            }
            
            .crash-stand,
            .ride-stand {
                height: 120px;
                top: 40%;
            }
            
            .crash-stand::before,
            .ride-stand::before {
                content: '';
                position: absolute;
                top: -10px;
                left: -8px;
                width: 20px;
                height: 20px;
                background: radial-gradient(circle, #666, #333);
                border-radius: 50%;
            }
            
            .drum-keyboard-guide {
                margin-top: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .drum-keyboard-guide h4 {
                margin: 0 0 10px 0;
                color: #495057;
                font-size: 14px;
            }
            
            .key-mappings {
                display: flex;
                flex-wrap: wrap;
                gap: 15px;
            }
            
            .key-mappings span {
                font-size: 12px;
                color: #6c757d;
            }
            
            .key-mappings kbd {
                background: #e9ecef;
                color: #495057;
                padding: 2px 6px;
                border-radius: 3px;
                font-family: monospace;
                font-size: 11px;
                margin-right: 5px;
            }
            
            @media (max-width: 768px) {
                .drum-kit-container {
                    padding: 20px;
                }
                
                .drum-kit {
                    height: 300px;
                }
                
                .drum-piece {
                    transform: scale(0.8);
                }
                
                .key-mappings {
                    gap: 10px;
                }
                
                .key-mappings span {
                    font-size: 11px;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    cleanup() {
        if (this.keyboardHandler) {
            document.removeEventListener('keydown', this.keyboardHandler);
        }
    }
}

// Export for global use
if (typeof window !== 'undefined') {
    window.VirtualDrums = VirtualDrums;
}
