// Virtual Percussion Instrument - Musicca Style
class VirtualPercussion {
    constructor(container, audioContext) {
        this.container = container;
        this.audioContext = audioContext;
        
        // Percussion instruments configuration
        this.instruments = {
            tambourine: {
                name: 'Tambourine',
                frequency: 3000,
                position: { x: '15%', y: '20%' },
                size: { width: 60, height: 60 },
                color: '#CD853F',
                shape: 'circle'
            },
            triangle: {
                name: 'Triangle',
                frequency: 5000,
                position: { x: '35%', y: '15%' },
                size: { width: 50, height: 50 },
                color: '#C0C0C0',
                shape: 'triangle'
            },
            maracas: {
                name: 'Maracas',
                frequency: 8000,
                position: { x: '55%', y: '20%' },
                size: { width: 45, height: 65 },
                color: '#8B4513',
                shape: 'oval'
            },
            cowbell: {
                name: 'Cowbell',
                frequency: 1500,
                position: { x: '75%', y: '25%' },
                size: { width: 40, height: 55 },
                color: '#FFD700',
                shape: 'bell'
            },
            woodblock: {
                name: 'Wood Block',
                frequency: 2000,
                position: { x: '25%', y: '45%' },
                size: { width: 55, height: 35 },
                color: '#8B4513',
                shape: 'rectangle'
            },
            claves: {
                name: 'Claves',
                frequency: 3500,
                position: { x: '50%', y: '40%' },
                size: { width: 50, height: 15 },
                color: '#D2691E',
                shape: 'stick'
            },
            shaker: {
                name: 'Shaker',
                frequency: 6000,
                position: { x: '70%', y: '45%' },
                size: { width: 35, height: 50 },
                color: '#8B4513',
                shape: 'cylinder'
            },
            castanet: {
                name: 'Castanets',
                frequency: 4000,
                position: { x: '20%', y: '65%' },
                size: { width: 40, height: 40 },
                color: '#654321',
                shape: 'shell'
            },
            guiro: {
                name: 'Güiro',
                frequency: 2500,
                position: { x: '45%', y: '70%' },
                size: { width: 70, height: 30 },
                color: '#DAA520',
                shape: 'gourd'
            },
            vibraslap: {
                name: 'Vibraslap',
                frequency: 7000,
                position: { x: '75%', y: '70%' },
                size: { width: 60, height: 25 },
                color: '#8B4513',
                shape: 'vibraslap'
            }
        };
        
        this.showNoteNames = true;
        this.markMode = false;
        
        this.init();
    }
    
    init() {
        this.render();
        this.setupEventListeners();
        this.addRealisticPercussionStyles();
    }
    
    render() {
        this.container.innerHTML = `
            <div class="percussion-interface">
                <div class="percussion-controls">
                    <button id="markBtn" class="control-btn">Mark</button>
                    <button id="noteNamesBtn" class="control-btn active">Hide note names</button>
                    <button id="playBtn" class="control-btn">Play</button>
                </div>
                
                <div class="percussion-stage">
                    <div class="percussion-instruments">
                        ${this.renderInstruments()}
                    </div>
                </div>
                
                <div class="percussion-keyboard-guide">
                    <h4>Keyboard Controls:</h4>
                    <div class="key-mappings">
                        <span><kbd>1</kbd> - Tambourine</span>
                        <span><kbd>2</kbd> - Triangle</span>
                        <span><kbd>3</kbd> - Maracas</span>
                        <span><kbd>4</kbd> - Cowbell</span>
                        <span><kbd>5</kbd> - Wood Block</span>
                        <span><kbd>6</kbd> - Claves</span>
                        <span><kbd>7</kbd> - Shaker</span>
                        <span><kbd>8</kbd> - Castanets</span>
                        <span><kbd>9</kbd> - Güiro</span>
                        <span><kbd>0</kbd> - Vibraslap</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderInstruments() {
        let instrumentsHTML = '';
        
        Object.entries(this.instruments).forEach(([instrumentId, instrument]) => {
            instrumentsHTML += `
                <div class="percussion-instrument ${instrumentId}" 
                     data-instrument="${instrumentId}"
                     data-name="${instrument.name}"
                     style="
                         left: ${instrument.position.x}; 
                         top: ${instrument.position.y};
                         width: ${instrument.size.width}px;
                         height: ${instrument.size.height}px;
                     ">
                    <div class="instrument-body ${instrument.shape}" 
                         style="background-color: ${instrument.color}">
                        ${this.getInstrumentDetails(instrument)}
                    </div>
                    ${this.showNoteNames ? `<span class="instrument-label">${instrument.name}</span>` : ''}
                    <div class="strike-animation"></div>
                </div>
            `;
        });
        
        return instrumentsHTML;
    }
    
    getInstrumentDetails(instrument) {
        switch (instrument.shape) {
            case 'triangle':
                return '<div class="triangle-striker"></div>';
            case 'bell':
                return '<div class="bell-handle"></div>';
            case 'stick':
                return '<div class="stick-pattern"></div>';
            case 'shell':
                return '<div class="shell-ridges"></div>';
            case 'gourd':
                return '<div class="gourd-ridges"></div>';
            case 'vibraslap':
                return '<div class="vibraslap-ball"></div>';
            default:
                return '';
        }
    }
    
    setupEventListeners() {
        // Instrument events
        const instruments = this.container.querySelectorAll('.percussion-instrument');
        instruments.forEach(instrument => {
            instrument.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.playInstrument(instrument);
            });
            
            instrument.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.playInstrument(instrument);
            });
        });
        
        // Control events
        const markBtn = this.container.querySelector('#markBtn');
        const noteNamesBtn = this.container.querySelector('#noteNamesBtn');
        const playBtn = this.container.querySelector('#playBtn');
        
        markBtn.addEventListener('click', () => this.toggleMarkMode());
        noteNamesBtn.addEventListener('click', () => this.toggleNoteNames());
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playMarkedInstruments());
        }
        
        // Keyboard events
        this.keyboardHandler = (e) => this.handleKeyboard(e);
        document.addEventListener('keydown', this.keyboardHandler);
        
        // Initialize properties
        this.markMode = false;
    }
    
    playInstrument(instrumentElement) {
        const instrumentId = instrumentElement.dataset.instrument;
        const instrument = this.instruments[instrumentId];
        if (!instrument) return;
        
        // Add strike animation
        instrumentElement.classList.add('struck');
        const strikeAnimation = instrumentElement.querySelector('.strike-animation');
        strikeAnimation.classList.add('active');
        
        setTimeout(() => {
            instrumentElement.classList.remove('struck');
            strikeAnimation.classList.remove('active');
        }, 150);
        
        // Play sound
        this.playPercussionSound(instrument);
        
        // Handle mark mode
        if (this.markMode) {
            instrumentElement.classList.toggle('marked');
        }
    }
    
    playPercussionSound(instrument) {
        if (!window.audioEngine) return;
        
        const oscillator = window.audioEngine.audioCtx.createOscillator();
        const gainNode = window.audioEngine.audioCtx.createGain();
        const filterNode = window.audioEngine.audioCtx.createBiquadFilter();
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(window.audioEngine.audioCtx.destination);
        
        // Different sound characteristics for different instruments
        switch (instrument.name) {
            case 'Tambourine':
                oscillator.frequency.setValueAtTime(3000, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'square';
                filterNode.type = 'highpass';
                filterNode.frequency.setValueAtTime(2000, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, window.audioEngine.audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.3);
                break;
                
            case 'Triangle':
                oscillator.frequency.setValueAtTime(5000, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'sine';
                filterNode.type = 'highpass';
                filterNode.frequency.setValueAtTime(3000, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.4, window.audioEngine.audioCtx.currentTime + 0.005);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 1.0);
                break;
                
            case 'Maracas':
            case 'Shaker':
                oscillator.frequency.setValueAtTime(8000, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'square';
                filterNode.type = 'bandpass';
                filterNode.frequency.setValueAtTime(6000, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.25, window.audioEngine.audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.15);
                break;
                
            case 'Cowbell':
                oscillator.frequency.setValueAtTime(1500, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'square';
                filterNode.type = 'bandpass';
                filterNode.frequency.setValueAtTime(1500, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, window.audioEngine.audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.2);
                break;
                
            case 'Wood Block':
            case 'Claves':
                oscillator.frequency.setValueAtTime(2500, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'square';
                filterNode.type = 'highpass';
                filterNode.frequency.setValueAtTime(1000, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.4, window.audioEngine.audioCtx.currentTime + 0.005);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.08);
                break;
                
            case 'Castanets':
                oscillator.frequency.setValueAtTime(4000, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'square';
                filterNode.type = 'highpass';
                filterNode.frequency.setValueAtTime(2000, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, window.audioEngine.audioCtx.currentTime + 0.003);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.05);
                break;
                
            case 'Güiro':
                oscillator.frequency.setValueAtTime(2500, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'sawtooth';
                filterNode.type = 'bandpass';
                filterNode.frequency.setValueAtTime(2000, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, window.audioEngine.audioCtx.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.4);
                break;
                
            case 'Vibraslap':
                oscillator.frequency.setValueAtTime(7000, window.audioEngine.audioCtx.currentTime);
                oscillator.type = 'square';
                filterNode.type = 'highpass';
                filterNode.frequency.setValueAtTime(5000, window.audioEngine.audioCtx.currentTime);
                
                gainNode.gain.setValueAtTime(0, window.audioEngine.audioCtx.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, window.audioEngine.audioCtx.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioEngine.audioCtx.currentTime + 0.25);
                break;
        }
        
        oscillator.start();
        oscillator.stop(window.audioEngine.audioCtx.currentTime + 1.5);
    }
    
    handleKeyboard(e) {
        if (e.repeat) return;
        
        const key = e.key;
        const keyMap = {
            '1': 'tambourine',
            '2': 'triangle',
            '3': 'maracas',
            '4': 'cowbell',
            '5': 'woodblock',
            '6': 'claves',
            '7': 'shaker',
            '8': 'castanet',
            '9': 'guiro',
            '0': 'vibraslap'
        };
        
        const instrumentId = keyMap[key];
        if (instrumentId) {
            e.preventDefault();
            const instrumentElement = this.container.querySelector(`[data-instrument="${instrumentId}"]`);
            if (instrumentElement) {
                this.playInstrument(instrumentElement);
            }
        }
    }
    
    toggleMarkMode() {
        this.markMode = !this.markMode;
        const markBtn = this.container.querySelector('#markBtn');
        markBtn.classList.toggle('active', this.markMode);
        
        if (!this.markMode) {
            // Clear all marks when exiting mark mode
            this.container.querySelectorAll('.percussion-instrument.marked').forEach(instrument => {
                instrument.classList.remove('marked');
            });
        }
    }
    
    toggleNoteNames() {
        this.showNoteNames = !this.showNoteNames;
        const noteNamesBtn = this.container.querySelector('#noteNamesBtn');
        noteNamesBtn.classList.toggle('active', this.showNoteNames);
        noteNamesBtn.textContent = this.showNoteNames ? 'Hide note names' : 'Show note names';
        
        if (this.showNoteNames) {
            // Show all instrument labels
            this.container.querySelectorAll('.percussion-instrument').forEach(instrument => {
                if (!instrument.querySelector('.instrument-label')) {
                    const labelSpan = document.createElement('span');
                    labelSpan.className = 'instrument-label';
                    labelSpan.textContent = instrument.dataset.name;
                    instrument.appendChild(labelSpan);
                }
            });
        } else {
            // Hide all instrument labels
            this.container.querySelectorAll('.instrument-label').forEach(label => {
                label.remove();
            });
        }
    }
    
    playMarkedInstruments() {
        const markedInstruments = this.container.querySelectorAll('.percussion-instrument.marked');
        if (markedInstruments.length === 0) return;
        
        // Play all marked instruments in sequence
        markedInstruments.forEach((instrument, index) => {
            setTimeout(() => {
                this.playInstrument(instrument);
            }, index * 120); // 120ms delay between each instrument
        });
    }
    
    addRealisticPercussionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .percussion-interface {
                background: #ffffff;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            
            .percussion-controls {
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
            
            .percussion-stage {
                background: linear-gradient(135deg, #8B4513 0%, #D2691E 30%, #CD853F 70%, #8B4513 100%);
                border-radius: 12px;
                padding: 30px;
                margin: 20px 0;
                box-shadow: 
                    inset 0 4px 8px rgba(0,0,0,0.2),
                    0 4px 12px rgba(0,0,0,0.15);
                position: relative;
                overflow: hidden;
            }
            
            .percussion-stage::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: 
                    radial-gradient(circle at 30% 40%, rgba(255,255,255,0.1) 0%, transparent 50%),
                    radial-gradient(circle at 70% 60%, rgba(255,255,255,0.05) 0%, transparent 50%);
                pointer-events: none;
            }
            
            .percussion-instruments {
                position: relative;
                width: 100%;
                height: 350px;
                background: radial-gradient(ellipse at center bottom, rgba(0,0,0,0.1) 0%, transparent 60%);
            }
            
            .percussion-instrument {
                position: absolute;
                cursor: pointer;
                transition: all 0.1s ease;
                transform-origin: center center;
                user-select: none;
            }
            
            .percussion-instrument:hover {
                transform: scale(1.05);
                filter: brightness(1.1);
            }
            
            .percussion-instrument.struck {
                transform: scale(0.95);
                filter: brightness(1.3);
            }
            
            .percussion-instrument.marked {
                box-shadow: 0 0 15px #10B981;
            }
            
            .instrument-body {
                width: 100%;
                height: 100%;
                border: 2px solid rgba(255,255,255,0.3);
                box-shadow: 
                    inset 0 2px 4px rgba(255,255,255,0.3),
                    inset 0 -2px 4px rgba(0,0,0,0.3),
                    0 3px 6px rgba(0,0,0,0.2);
                position: relative;
                overflow: hidden;
            }
            
            .instrument-body::before {
                content: '';
                position: absolute;
                top: 15%;
                left: 25%;
                width: 25%;
                height: 25%;
                background: radial-gradient(ellipse, rgba(255,255,255,0.4) 0%, transparent 70%);
                border-radius: 50%;
            }
            
            /* Specific instrument shapes */
            .circle {
                border-radius: 50%;
            }
            
            .triangle {
                width: 0;
                height: 0;
                border-left: 25px solid transparent;
                border-right: 25px solid transparent;
                border-bottom: 43px solid currentColor;
                background: transparent !important;
                border-radius: 0;
            }
            
            .triangle::before {
                display: none;
            }
            
            .oval {
                border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
            }
            
            .rectangle {
                border-radius: 8px;
            }
            
            .stick {
                border-radius: 25px;
            }
            
            .cylinder {
                border-radius: 15px 15px 50% 50%;
            }
            
            .shell {
                border-radius: 50% 50% 20% 20%;
            }
            
            .gourd {
                border-radius: 60% 40% 60% 40%;
            }
            
            .bell {
                border-radius: 50% 50% 30% 30%;
                position: relative;
            }
            
            .vibraslap {
                border-radius: 20px 5px 5px 20px;
            }
            
            /* Instrument details */
            .triangle-striker {
                position: absolute;
                top: -5px;
                right: -5px;
                width: 2px;
                height: 30px;
                background: #C0C0C0;
                border-radius: 1px;
                transform: rotate(15deg);
            }
            
            .bell-handle {
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 8px;
                height: 15px;
                background: #B8860B;
                border-radius: 4px;
            }
            
            .stick-pattern {
                position: absolute;
                top: 50%;
                left: 10%;
                right: 10%;
                height: 2px;
                background: repeating-linear-gradient(
                    to right,
                    rgba(139, 69, 19, 0.8) 0px,
                    rgba(139, 69, 19, 0.8) 3px,
                    transparent 3px,
                    transparent 6px
                );
            }
            
            .shell-ridges {
                position: absolute;
                top: 20%;
                left: 20%;
                right: 20%;
                bottom: 20%;
                background: repeating-linear-gradient(
                    45deg,
                    rgba(101, 67, 33, 0.3) 0px,
                    rgba(101, 67, 33, 0.3) 2px,
                    transparent 2px,
                    transparent 4px
                );
                border-radius: 50%;
            }
            
            .gourd-ridges {
                position: absolute;
                top: 30%;
                left: 10%;
                right: 10%;
                bottom: 30%;
                background: repeating-linear-gradient(
                    90deg,
                    rgba(218, 165, 32, 0.3) 0px,
                    rgba(218, 165, 32, 0.3) 2px,
                    transparent 2px,
                    transparent 5px
                );
                border-radius: 20px;
            }
            
            .vibraslap-ball {
                position: absolute;
                top: 30%;
                right: -8px;
                width: 16px;
                height: 16px;
                background: #8B4513;
                border-radius: 50%;
                border: 1px solid rgba(255,255,255,0.3);
            }
            
            .instrument-label {
                position: absolute;
                bottom: -22px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 11px;
                font-weight: bold;
                color: #f5f5dc;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
                white-space: nowrap;
                pointer-events: none;
            }
            
            .strike-animation {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,255,255,0.7) 0%, transparent 70%);
                transform: translate(-50%, -50%);
                pointer-events: none;
                transition: all 0.15s ease-out;
            }
            
            .strike-animation.active {
                width: 120%;
                height: 120%;
                opacity: 0;
            }
            
            .percussion-keyboard-guide {
                margin-top: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 8px;
                border: 1px solid #e9ecef;
            }
            
            .percussion-keyboard-guide h4 {
                margin: 0 0 10px 0;
                color: #495057;
                font-size: 14px;
            }
            
            .key-mappings {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
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
                .percussion-stage {
                    padding: 20px;
                }
                
                .percussion-instruments {
                    height: 280px;
                }
                
                .percussion-instrument {
                    transform: scale(0.8);
                }
                
                .key-mappings {
                    gap: 8px;
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
    window.VirtualPercussion = VirtualPercussion;
}
