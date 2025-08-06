// Guitar.js - Virtual Guitar Implementation
class VirtualGuitar {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.currentChord = null;
        this.isRecording = false;
        this.recordedChunks = [];
        this.mediaRecorder = null;
        this.tunerActive = false;
        this.analyser = null;
        this.microphone = null;
        this.patternPlaying = false;
        this.currentPattern = 'down-up-down-up';
        this.tempo = 120;
        this.effects = {
            distortion: 0,
            reverb: 20,
            delay: 0,
            chorus: 0
        };
        
        // Guitar tuning (standard)
        this.tunings = {
            standard: ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
            'drop-d': ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
            'open-g': ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
            dadgad: ['D2', 'A2', 'D3', 'G3', 'A3', 'D4']
        };
        
        this.currentTuning = 'standard';
        this.chordLibrary = this.initializeChordLibrary();
        
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.setupAudioChain();
            this.setupEventListeners();
            this.generateFretboard();
            this.loadChords('major');
            console.log('Virtual Guitar initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Virtual Guitar:', error);
            this.showNotification('Failed to initialize audio. Please check your browser permissions.', 'error');
        }
    }

    setupAudioChain() {
        // Create master gain
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.7;
        
        // Create effects chain
        this.setupEffects();
        
        // Connect to destination
        this.masterGain.connect(this.audioContext.destination);
    }

    setupEffects() {
        // Create effect nodes
        this.effectNodes = {
            distortion: this.audioContext.createWaveShaper(),
            reverb: this.audioContext.createConvolver(),
            delay: this.audioContext.createDelay(1.0),
            chorus: this.audioContext.createOscillator()
        };
        
        // Setup distortion
        this.setupDistortion();
        
        // Setup reverb
        this.setupReverb();
        
        // Setup delay
        this.setupDelay();
    }

    setupDistortion() {
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + 20) * x * 20 * deg) / (Math.PI + 20 * Math.abs(x));
        }
        
        this.effectNodes.distortion.curve = curve;
        this.effectNodes.distortion.oversample = '4x';
    }

    setupReverb() {
        // Create impulse response for reverb
        const length = this.audioContext.sampleRate * 2;
        const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.effectNodes.reverb.buffer = impulse;
    }

    setupDelay() {
        this.effectNodes.delay.delayTime.value = 0.3;
        
        const delayFeedback = this.audioContext.createGain();
        delayFeedback.gain.value = 0.3;
        
        this.effectNodes.delay.connect(delayFeedback);
        delayFeedback.connect(this.effectNodes.delay);
    }

    setupEventListeners() {
        // Volume control
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.masterGain.gain.value = e.target.value / 100;
            document.getElementById('volumeValue').textContent = e.target.value;
        });

        // Tuning selector
        document.getElementById('tuningSelect').addEventListener('change', (e) => {
            this.currentTuning = e.target.value;
            this.updateStringTuning();
        });

        // Effect controls
        document.getElementById('distortionKnob').addEventListener('input', (e) => {
            this.effects.distortion = e.target.value / 100;
            document.getElementById('distortionValue').textContent = e.target.value;
            this.updateEffects();
        });

        document.getElementById('reverbKnob').addEventListener('input', (e) => {
            this.effects.reverb = e.target.value / 100;
            document.getElementById('reverbValue').textContent = e.target.value;
            this.updateEffects();
        });

        document.getElementById('delayKnob').addEventListener('input', (e) => {
            this.effects.delay = e.target.value / 100;
            document.getElementById('delayValue').textContent = e.target.value;
            this.updateEffects();
        });

        document.getElementById('chorusKnob').addEventListener('input', (e) => {
            this.effects.chorus = e.target.value / 100;
            document.getElementById('chorusValue').textContent = e.target.value;
            this.updateEffects();
        });

        // Chord categories
        document.querySelectorAll('.chord-category').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.chord-category').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.loadChords(e.target.dataset.category);
            });
        });

        // Strumming controls
        document.getElementById('strumTempo').addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            document.getElementById('tempoValue').textContent = this.tempo;
        });

        document.getElementById('playPatternBtn').addEventListener('click', () => this.playStrumPattern());
        document.getElementById('stopPatternBtn').addEventListener('click', () => this.stopStrumPattern());

        // Pattern selection
        document.querySelectorAll('.pattern-item').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.pattern-item').forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.currentPattern = e.currentTarget.dataset.pattern;
            });
        });

        // Tuner controls
        document.getElementById('tunerBtn').addEventListener('click', () => this.toggleTuner());

        // Reference tones
        document.querySelectorAll('.reference-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playReferenceNote(e.target.dataset.note);
            });
        });

        // Recording controls
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('playRecordingBtn').addEventListener('click', () => this.playRecording());
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadRecording());
    }

    generateFretboard() {
        const strings = document.querySelectorAll('.string');
        strings.forEach((string, stringIndex) => {
            // Add frets to each string
            for (let fret = 0; fret <= 12; fret++) {
                const fretElement = document.createElement('div');
                fretElement.className = 'fret';
                fretElement.style.left = `${fret * 60 + 20}px`;
                fretElement.dataset.string = stringIndex;
                fretElement.dataset.fret = fret;
                
                fretElement.addEventListener('click', (e) => {
                    this.playFret(stringIndex, fret);
                    this.highlightFret(e.target);
                });
                
                string.appendChild(fretElement);
            }
        });
        
        // Add fret markers
        this.addFretMarkers();
    }

    addFretMarkers() {
        const markers = document.querySelector('.fret-markers');
        const markerPositions = [3, 5, 7, 9, 12];
        
        markerPositions.forEach(fret => {
            const marker = document.createElement('div');
            marker.className = 'fret-marker';
            marker.style.left = `${fret * 60 + 20}px`;
            markers.appendChild(marker);
        });
    }

    playFret(stringIndex, fret) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const baseNote = this.tunings[this.currentTuning][stringIndex];
        const frequency = this.noteToFrequency(baseNote) * Math.pow(2, fret / 12);
        
        this.playGuitarNote(frequency, stringIndex);
    }

    playGuitarNote(frequency, stringIndex = 0, velocity = 0.3) {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Create harmonic series for guitar-like sound
        const fundamental = this.audioContext.createOscillator();
        const harmonic2 = this.audioContext.createOscillator();
        const harmonic3 = this.audioContext.createOscillator();
        
        const fundamentalGain = this.audioContext.createGain();
        const harmonic2Gain = this.audioContext.createGain();
        const harmonic3Gain = this.audioContext.createGain();
        
        // Set frequencies
        fundamental.frequency.value = frequency;
        harmonic2.frequency.value = frequency * 2;
        harmonic3.frequency.value = frequency * 3;
        
        // Set waveforms
        fundamental.type = 'sawtooth';
        harmonic2.type = 'triangle';
        harmonic3.type = 'sine';
        
        // Set gains for harmonic content
        fundamentalGain.gain.value = velocity;
        harmonic2Gain.gain.value = velocity * 0.3;
        harmonic3Gain.gain.value = velocity * 0.1;
        
        // Filter for guitar timbre
        filter.type = 'lowpass';
        filter.frequency.value = 2000 + (stringIndex * 400);
        filter.Q.value = 2;
        
        // ADSR envelope with pick attack
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(velocity * 1.2, this.audioContext.currentTime + 0.005); // Quick attack
        gain.gain.exponentialRampToValueAtTime(velocity * 0.8, this.audioContext.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(velocity * 0.4, this.audioContext.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 2);
        
        // Connect harmonic series
        fundamental.connect(fundamentalGain);
        harmonic2.connect(harmonic2Gain);
        harmonic3.connect(harmonic3Gain);
        
        fundamentalGain.connect(filter);
        harmonic2Gain.connect(filter);
        harmonic3Gain.connect(filter);
        
        filter.connect(gain);
        gain.connect(this.masterGain);
        
        // Start oscillators
        const startTime = this.audioContext.currentTime;
        fundamental.start(startTime);
        harmonic2.start(startTime);
        harmonic3.start(startTime);
        
        // Stop oscillators
        const stopTime = startTime + 2;
        fundamental.stop(stopTime);
        harmonic2.stop(stopTime);
        harmonic3.stop(stopTime);
    }

    highlightFret(fretElement) {
        // Remove previous highlights
        document.querySelectorAll('.fret.active').forEach(f => f.classList.remove('active'));
        
        // Highlight current fret
        fretElement.classList.add('active');
        
        // Remove highlight after animation
        setTimeout(() => {
            fretElement.classList.remove('active');
        }, 500);
    }

    initializeChordLibrary() {
        return {
            major: [
                { name: 'C', fingers: [3, 2, 0, 1, 0, 0], notes: ['C', 'E', 'G'] },
                { name: 'D', fingers: [2, 0, 0, 2, 3, 2], notes: ['D', 'F#', 'A'] },
                { name: 'E', fingers: [0, 2, 2, 1, 0, 0], notes: ['E', 'G#', 'B'] },
                { name: 'F', fingers: [1, 3, 3, 2, 1, 1], notes: ['F', 'A', 'C'] },
                { name: 'G', fingers: [3, 2, 0, 0, 3, 3], notes: ['G', 'B', 'D'] },
                { name: 'A', fingers: [0, 0, 2, 2, 2, 0], notes: ['A', 'C#', 'E'] },
                { name: 'B', fingers: [2, 2, 4, 4, 4, 2], notes: ['B', 'D#', 'F#'] }
            ],
            minor: [
                { name: 'Am', fingers: [0, 0, 2, 2, 1, 0], notes: ['A', 'C', 'E'] },
                { name: 'Bm', fingers: [2, 2, 4, 4, 3, 2], notes: ['B', 'D', 'F#'] },
                { name: 'Cm', fingers: [3, 3, 5, 5, 4, 3], notes: ['C', 'Eb', 'G'] },
                { name: 'Dm', fingers: [1, 0, 0, 2, 3, 1], notes: ['D', 'F', 'A'] },
                { name: 'Em', fingers: [0, 2, 2, 0, 0, 0], notes: ['E', 'G', 'B'] },
                { name: 'Fm', fingers: [1, 3, 3, 1, 1, 1], notes: ['F', 'Ab', 'C'] },
                { name: 'Gm', fingers: [3, 5, 5, 3, 3, 3], notes: ['G', 'Bb', 'D'] }
            ],
            seventh: [
                { name: 'C7', fingers: [3, 2, 3, 1, 0, 0], notes: ['C', 'E', 'G', 'Bb'] },
                { name: 'D7', fingers: [2, 0, 0, 2, 1, 2], notes: ['D', 'F#', 'A', 'C'] },
                { name: 'E7', fingers: [0, 2, 0, 1, 0, 0], notes: ['E', 'G#', 'B', 'D'] },
                { name: 'F7', fingers: [1, 3, 1, 2, 1, 1], notes: ['F', 'A', 'C', 'Eb'] },
                { name: 'G7', fingers: [3, 2, 0, 0, 0, 1], notes: ['G', 'B', 'D', 'F'] },
                { name: 'A7', fingers: [0, 0, 2, 0, 2, 0], notes: ['A', 'C#', 'E', 'G'] },
                { name: 'B7', fingers: [2, 1, 2, 0, 2, 2], notes: ['B', 'D#', 'F#', 'A'] }
            ],
            extended: [
                { name: 'Cmaj7', fingers: [3, 2, 0, 0, 0, 0], notes: ['C', 'E', 'G', 'B'] },
                { name: 'Dm7', fingers: [1, 0, 0, 2, 1, 1], notes: ['D', 'F', 'A', 'C'] },
                { name: 'Em7', fingers: [0, 2, 0, 0, 0, 0], notes: ['E', 'G', 'B', 'D'] },
                { name: 'Fmaj7', fingers: [1, 3, 2, 2, 1, 0], notes: ['F', 'A', 'C', 'E'] },
                { name: 'Gmaj7', fingers: [3, 2, 0, 0, 0, 2], notes: ['G', 'B', 'D', 'F#'] },
                { name: 'Am7', fingers: [0, 0, 2, 0, 1, 0], notes: ['A', 'C', 'E', 'G'] }
            ]
        };
    }

    loadChords(category) {
        const chordGrid = document.getElementById('chordGrid');
        chordGrid.innerHTML = '';
        
        const chords = this.chordLibrary[category] || [];
        
        chords.forEach(chord => {
            const chordCard = document.createElement('div');
            chordCard.className = 'chord-card';
            chordCard.innerHTML = `
                <div class="chord-name">${chord.name}</div>
                <div class="chord-fingers">${chord.fingers.join('-')}</div>
            `;
            
            chordCard.addEventListener('click', () => {
                this.playChord(chord);
                this.highlightChord(chordCard);
            });
            
            chordGrid.appendChild(chordCard);
        });
    }

    playChord(chord) {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        this.currentChord = chord;
        
        // Play each string of the chord
        chord.fingers.forEach((fret, stringIndex) => {
            if (fret >= 0) {
                setTimeout(() => {
                    this.playFret(stringIndex, fret);
                }, stringIndex * 50); // Slight strum delay
            }
        });
        
        this.showNotification(`Playing ${chord.name} chord`, 'info');
    }

    highlightChord(chordCard) {
        document.querySelectorAll('.chord-card').forEach(card => card.classList.remove('active'));
        chordCard.classList.add('active');
    }

    playStrumPattern() {
        if (this.patternPlaying) return;
        
        this.patternPlaying = true;
        const beatDuration = (60 / this.tempo) * 1000; // ms per beat
        const pattern = this.currentPattern.split('-');
        
        this.showNotification('Strumming pattern started', 'success');
        
        const playPattern = () => {
            if (!this.patternPlaying) return;
            
            pattern.forEach((stroke, index) => {
                setTimeout(() => {
                    if (this.patternPlaying && this.currentChord) {
                        this.executeStroke(stroke);
                    }
                }, index * (beatDuration / pattern.length));
            });
            
            // Repeat pattern
            setTimeout(playPattern, beatDuration);
        };
        
        playPattern();
    }

    executeStroke(stroke) {
        if (!this.currentChord) return;
        
        switch (stroke) {
            case 'down':
                // Strum down (high to low strings)
                this.currentChord.fingers.forEach((fret, stringIndex) => {
                    if (fret >= 0) {
                        setTimeout(() => this.playFret(stringIndex, fret), stringIndex * 10);
                    }
                });
                break;
            case 'up':
                // Strum up (low to high strings)
                this.currentChord.fingers.slice().reverse().forEach((fret, stringIndex) => {
                    const realStringIndex = this.currentChord.fingers.length - 1 - stringIndex;
                    if (fret >= 0) {
                        setTimeout(() => this.playFret(realStringIndex, fret), stringIndex * 10);
                    }
                });
                break;
            case 'mute':
                // Palm mute (no sound)
                break;
        }
    }

    stopStrumPattern() {
        this.patternPlaying = false;
        this.showNotification('Strumming pattern stopped', 'info');
    }

    async toggleTuner() {
        if (this.tunerActive) {
            this.stopTuner();
        } else {
            await this.startTuner();
        }
    }

    async startTuner() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 4096;
            
            this.microphone.connect(this.analyser);
            
            this.tunerActive = true;
            document.getElementById('tunerBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Tuner';
            this.analyzePitch();
            
            this.showNotification('Tuner started', 'success');
        } catch (error) {
            console.error('Tuner failed:', error);
            this.showNotification('Tuner failed. Please check microphone permissions.', 'error');
        }
    }

    stopTuner() {
        this.tunerActive = false;
        document.getElementById('tunerBtn').innerHTML = '<i class="fas fa-microphone"></i> Start Tuner';
        
        if (this.microphone) {
            this.microphone.disconnect();
        }
        
        // Reset display
        document.getElementById('noteDisplay').querySelector('.note-name').textContent = '-';
        document.getElementById('noteDisplay').querySelector('.frequency').textContent = '0 Hz';
        document.getElementById('tuningNeedle').style.transform = 'translate(-50%, -50%)';
        
        this.showNotification('Tuner stopped', 'info');
    }

    analyzePitch() {
        if (!this.tunerActive) return;
        
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Float32Array(bufferLength);
        this.analyser.getFloatFrequencyData(dataArray);
        
        const frequency = this.findFundamentalFreq(dataArray);
        
        if (frequency > 0) {
            const note = this.frequencyToNote(frequency);
            const cents = this.getCentsOffset(frequency, note);
            
            document.getElementById('noteDisplay').querySelector('.note-name').textContent = note;
            document.getElementById('noteDisplay').querySelector('.frequency').textContent = `${frequency.toFixed(1)} Hz`;
            
            // Update needle position
            const needleOffset = (cents / 50) * 25; // Max 25% movement for 50 cents
            document.getElementById('tuningNeedle').style.transform = `translate(calc(-50% + ${needleOffset}%), -50%)`;
        }
        
        requestAnimationFrame(() => this.analyzePitch());
    }

    findFundamentalFreq(dataArray) {
        // Simplified pitch detection - in a real implementation, you'd use autocorrelation
        let maxIndex = 0;
        let maxValue = -Infinity;
        
        for (let i = 0; i < dataArray.length; i++) {
            if (dataArray[i] > maxValue) {
                maxValue = dataArray[i];
                maxIndex = i;
            }
        }
        
        const frequency = (maxIndex * this.audioContext.sampleRate) / (this.analyser.fftSize * 2);
        return frequency > 80 && frequency < 2000 ? frequency : 0;
    }

    playReferenceNote(noteName) {
        const frequency = this.noteToFrequency(noteName);
        this.playGuitarNote(frequency);
        this.showNotification(`Playing reference ${noteName}`, 'info');
    }

    async toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
                this.recordedBlob = blob;
                document.getElementById('playRecordingBtn').disabled = false;
                document.getElementById('downloadBtn').disabled = false;
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.startRecordingTimer();
            
            document.getElementById('recordBtn').innerHTML = '<i class="fas fa-stop"></i> Stop Recording';
            this.showNotification('Recording started', 'success');
        } catch (error) {
            console.error('Recording failed:', error);
            this.showNotification('Recording failed. Please check microphone permissions.', 'error');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        this.isRecording = false;
        this.stopRecordingTimer();
        
        document.getElementById('recordBtn').innerHTML = '<i class="fas fa-circle"></i> Record';
        this.showNotification('Recording stopped', 'info');
    }

    startRecordingTimer() {
        this.recordingStartTime = Date.now();
        this.recordingTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.recordingStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('recordingTime').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
        }
    }

    playRecording() {
        if (this.recordedBlob) {
            const audio = new Audio(URL.createObjectURL(this.recordedBlob));
            audio.play();
            this.showNotification('Playing recording', 'info');
        }
    }

    downloadRecording() {
        if (this.recordedBlob) {
            const url = URL.createObjectURL(this.recordedBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `guitar-recording-${Date.now()}.wav`;
            a.click();
            this.showNotification('Recording downloaded', 'success');
        }
    }

    updateStringTuning() {
        const strings = document.querySelectorAll('.string');
        const tuning = this.tunings[this.currentTuning];
        
        strings.forEach((string, index) => {
            string.dataset.note = tuning[index];
        });
        
        this.showNotification(`Tuning changed to ${this.currentTuning}`, 'info');
    }

    updateEffects() {
        // In a real implementation, you would update the actual effect parameters
        // This is a simplified version
        console.log('Effects updated:', this.effects);
    }

    noteToFrequency(note) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = parseInt(note.slice(-1));
        const noteName = note.slice(0, -1);
        const noteIndex = notes.indexOf(noteName);
        
        if (noteIndex === -1) return 0;
        
        // A4 = 440 Hz
        const A4 = 440;
        const A4Index = 9; // A is at index 9
        const A4Octave = 4;
        
        const semitonesFromA4 = (octave - A4Octave) * 12 + (noteIndex - A4Index);
        return A4 * Math.pow(2, semitonesFromA4 / 12);
    }

    frequencyToNote(frequency) {
        const A4 = 440;
        const semitones = Math.round(12 * Math.log2(frequency / A4));
        const noteIndex = (semitones + 9) % 12;
        const octave = Math.floor((semitones + 9) / 12) + 4;
        
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        return notes[noteIndex < 0 ? noteIndex + 12 : noteIndex] + octave;
    }

    getCentsOffset(frequency, note) {
        const targetFreq = this.noteToFrequency(note);
        return Math.round(1200 * Math.log2(frequency / targetFreq));
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize guitar when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.virtualGuitar = new VirtualGuitar();
});

// Export for global access
window.VirtualGuitar = VirtualGuitar;
