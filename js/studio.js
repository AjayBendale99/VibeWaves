// Studio.js - Professional Recording Studio Implementation
class VirtualStudio {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.compressor = null;
        this.recorder = null;
        this.tracks = [];
        this.isRecording = false;
        this.isPlaying = false;
        this.currentTime = 0;
        this.tempo = 120;
        this.timeSignature = '4/4';
        this.metronome = null;
        this.projectName = 'New Project';
        this.sampleRate = 44100;
        
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.setupMasterChain();
            this.setupTracks();
            this.setupEventListeners();
            this.updateDisplay();
            console.log('Virtual Studio initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Virtual Studio:', error);
            this.showNotification('Failed to initialize audio. Please check your browser permissions.', 'error');
        }
    }

    setupMasterChain() {
        // Create master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.7;

        // Create compressor for master bus
        this.compressor = this.audioContext.createDynamicsCompressor();
        this.compressor.threshold.value = -20;
        this.compressor.knee.value = 10;
        this.compressor.ratio.value = 4;
        this.compressor.attack.value = 0.003;
        this.compressor.release.value = 0.1;

        // Connect master chain
        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.audioContext.destination);
    }

    setupTracks() {
        // Initialize 4 audio tracks
        for (let i = 0; i < 4; i++) {
            this.tracks.push(this.createTrack(i + 1));
        }
    }

    createTrack(trackNumber) {
        const track = {
            number: trackNumber,
            name: `Track ${trackNumber}`,
            gainNode: this.audioContext.createGain(),
            eqNodes: {
                low: this.audioContext.createBiquadFilter(),
                mid: this.audioContext.createBiquadFilter(),
                high: this.audioContext.createBiquadFilter()
            },
            effectsChain: [],
            isMuted: false,
            isSolo: false,
            isRecording: false,
            volume: 1.0,
            pan: 0,
            recordedData: [],
            isPlaying: false
        };

        // Setup EQ
        track.eqNodes.low.type = 'lowshelf';
        track.eqNodes.low.frequency.value = 320;
        track.eqNodes.mid.type = 'peaking';
        track.eqNodes.mid.frequency.value = 1000;
        track.eqNodes.mid.Q.value = 1;
        track.eqNodes.high.type = 'highshelf';
        track.eqNodes.high.frequency.value = 3200;

        // Connect track chain
        track.eqNodes.low.connect(track.eqNodes.mid);
        track.eqNodes.mid.connect(track.eqNodes.high);
        track.eqNodes.high.connect(track.gainNode);
        track.gainNode.connect(this.masterGain);

        return track;
    }

    setupEventListeners() {
        // Transport controls
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecord());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('rewindBtn').addEventListener('click', () => this.rewind());

        // Tempo control
        const tempoInput = document.getElementById('tempoInput');
        tempoInput.addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            this.updateMetronome();
        });

        // Master controls
        document.getElementById('masterVolume').addEventListener('input', (e) => {
            this.masterGain.gain.value = e.target.value / 100;
            document.getElementById('masterVolumeValue').textContent = e.target.value;
        });

        // Track controls
        this.tracks.forEach((track, index) => {
            this.setupTrackControls(track, index);
        });

        // Project controls
        document.getElementById('newProjectBtn').addEventListener('click', () => this.newProject());
        document.getElementById('saveProjectBtn').addEventListener('click', () => this.saveProject());
        document.getElementById('loadProjectBtn').addEventListener('click', () => this.loadProject());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportProject());

        // Project info
        document.getElementById('projectName').addEventListener('input', (e) => {
            this.projectName = e.target.value;
        });

        // Quick instrument access
        this.setupQuickInstruments();
    }

    setupTrackControls(track, index) {
        const trackElement = document.getElementById(`track${track.number}`);
        
        // Mute button
        const muteBtn = trackElement.querySelector('.mute-btn');
        muteBtn.addEventListener('click', () => this.toggleTrackMute(track.number));

        // Solo button
        const soloBtn = trackElement.querySelector('.solo-btn');
        soloBtn.addEventListener('click', () => this.toggleTrackSolo(track.number));

        // Record button
        const recBtn = trackElement.querySelector('.rec-btn');
        recBtn.addEventListener('click', () => this.toggleTrackRecord(track.number));

        // Volume control
        const volumeSlider = trackElement.querySelector('.track-volume');
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            track.gainNode.gain.value = volume;
            track.volume = volume;
            trackElement.querySelector('.volume-value').textContent = e.target.value;
        });

        // EQ controls
        const lowEq = trackElement.querySelector('.low-eq');
        const midEq = trackElement.querySelector('.mid-eq');
        const highEq = trackElement.querySelector('.high-eq');

        lowEq.addEventListener('input', (e) => {
            track.eqNodes.low.gain.value = (e.target.value - 50) * 0.3;
        });

        midEq.addEventListener('input', (e) => {
            track.eqNodes.mid.gain.value = (e.target.value - 50) * 0.3;
        });

        highEq.addEventListener('input', (e) => {
            track.eqNodes.high.gain.value = (e.target.value - 50) * 0.3;
        });

        // Effects controls
        const reverbKnob = trackElement.querySelector('.reverb-knob');
        const delayKnob = trackElement.querySelector('.delay-knob');

        reverbKnob.addEventListener('input', (e) => {
            this.setTrackReverb(track.number, e.target.value / 100);
        });

        delayKnob.addEventListener('input', (e) => {
            this.setTrackDelay(track.number, e.target.value / 100);
        });
    }

    setupQuickInstruments() {
        const instrumentButtons = document.querySelectorAll('.instrument-quick-btn');
        instrumentButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const instrument = button.getAttribute('href').split('/').pop().replace('.html', '');
                this.openInstrument(instrument);
            });
        });
    }

    async togglePlay() {
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.updateTransportButtons();
        this.startTimeUpdate();
        this.showNotification('Playback started', 'success');
        
        // Start any recorded tracks
        this.tracks.forEach(track => {
            if (track.recordedData.length > 0) {
                this.playTrack(track);
            }
        });
    }

    pause() {
        this.isPlaying = false;
        this.updateTransportButtons();
        this.stopTimeUpdate();
        this.showNotification('Playback paused', 'info');
    }

    stop() {
        this.isPlaying = false;
        this.isRecording = false;
        this.currentTime = 0;
        this.updateTransportButtons();
        this.stopTimeUpdate();
        this.updateTimeDisplay();
        this.showNotification('Playback stopped', 'info');
        
        // Stop all tracks
        this.tracks.forEach(track => {
            track.isPlaying = false;
            track.isRecording = false;
        });
        this.updateTrackButtons();
    }

    rewind() {
        this.currentTime = 0;
        this.updateTimeDisplay();
        this.showNotification('Rewound to beginning', 'info');
    }

    async toggleRecord() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new MediaRecorder(stream);
            this.isRecording = true;
            this.updateTransportButtons();
            this.showNotification('Recording started', 'success');
            
            // Start playback if not already playing
            if (!this.isPlaying) {
                this.play();
            }
        } catch (error) {
            console.error('Recording failed:', error);
            this.showNotification('Recording failed. Please check microphone permissions.', 'error');
        }
    }

    stopRecording() {
        if (this.recorder && this.recorder.state !== 'inactive') {
            this.recorder.stop();
        }
        this.isRecording = false;
        this.updateTransportButtons();
        this.showNotification('Recording stopped', 'info');
    }

    toggleTrackMute(trackNumber) {
        const track = this.tracks[trackNumber - 1];
        track.isMuted = !track.isMuted;
        track.gainNode.gain.value = track.isMuted ? 0 : track.volume;
        this.updateTrackButtons();
        this.showNotification(`Track ${trackNumber} ${track.isMuted ? 'muted' : 'unmuted'}`, 'info');
    }

    toggleTrackSolo(trackNumber) {
        const track = this.tracks[trackNumber - 1];
        track.isSolo = !track.isSolo;
        
        // Handle solo logic
        const hasSolo = this.tracks.some(t => t.isSolo);
        this.tracks.forEach(t => {
            if (hasSolo) {
                t.gainNode.gain.value = t.isSolo ? t.volume : 0;
            } else {
                t.gainNode.gain.value = t.isMuted ? 0 : t.volume;
            }
        });
        
        this.updateTrackButtons();
        this.showNotification(`Track ${trackNumber} ${track.isSolo ? 'soloed' : 'un-soloed'}`, 'info');
    }

    toggleTrackRecord(trackNumber) {
        const track = this.tracks[trackNumber - 1];
        track.isRecording = !track.isRecording;
        this.updateTrackButtons();
        this.showNotification(`Track ${trackNumber} ${track.isRecording ? 'armed for recording' : 'recording disabled'}`, 'info');
    }

    setTrackReverb(trackNumber, amount) {
        // Simplified reverb effect
        const track = this.tracks[trackNumber - 1];
        // In a real implementation, you'd create a convolution reverb
        console.log(`Setting reverb for track ${trackNumber}: ${amount}`);
    }

    setTrackDelay(trackNumber, amount) {
        // Simplified delay effect
        const track = this.tracks[trackNumber - 1];
        // In a real implementation, you'd create a delay line
        console.log(`Setting delay for track ${trackNumber}: ${amount}`);
    }

    playTrack(track) {
        track.isPlaying = true;
        // In a real implementation, you'd play back recorded audio data
        console.log(`Playing track ${track.number}`);
    }

    updateTransportButtons() {
        const playBtn = document.getElementById('playBtn');
        const recordBtn = document.getElementById('recordBtn');
        
        playBtn.innerHTML = this.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        recordBtn.classList.toggle('recording', this.isRecording);
    }

    updateTrackButtons() {
        this.tracks.forEach(track => {
            const trackElement = document.getElementById(`track${track.number}`);
            const muteBtn = trackElement.querySelector('.mute-btn');
            const soloBtn = trackElement.querySelector('.solo-btn');
            const recBtn = trackElement.querySelector('.rec-btn');
            
            muteBtn.classList.toggle('active', track.isMuted);
            soloBtn.classList.toggle('active', track.isSolo);
            recBtn.classList.toggle('active', track.isRecording);
        });
    }

    startTimeUpdate() {
        this.timeUpdateInterval = setInterval(() => {
            this.currentTime += 0.1;
            this.updateTimeDisplay();
            this.updateLevelMeters();
        }, 100);
    }

    stopTimeUpdate() {
        if (this.timeUpdateInterval) {
            clearInterval(this.timeUpdateInterval);
        }
    }

    updateTimeDisplay() {
        const minutes = Math.floor(this.currentTime / 60);
        const seconds = Math.floor(this.currentTime % 60);
        const centiseconds = Math.floor((this.currentTime % 1) * 100);
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
        document.getElementById('timeDisplay').textContent = timeString;
    }

    updateLevelMeters() {
        // Simulate level meters with random values
        this.tracks.forEach(track => {
            const meter = document.querySelector(`#track${track.number} .level-meter`);
            if (track.isPlaying || track.isRecording) {
                meter.classList.add('active');
                // In a real implementation, you'd analyze actual audio levels
                const level = Math.random() * 0.8 + 0.2;
                meter.style.setProperty('--level', `${level * 100}%`);
            } else {
                meter.classList.remove('active');
            }
        });
    }

    updateMetronome() {
        // Simple metronome implementation
        if (this.metronome) {
            clearInterval(this.metronome);
        }
        
        const beatInterval = (60 / this.tempo) * 1000;
        this.metronome = setInterval(() => {
            if (this.isPlaying) {
                this.playMetronomeClick();
            }
        }, beatInterval);
    }

    playMetronomeClick() {
        const oscillator = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        oscillator.connect(gain);
        gain.connect(this.audioContext.destination);
        
        oscillator.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    newProject() {
        this.stop();
        this.currentTime = 0;
        this.projectName = 'New Project';
        this.tracks.forEach(track => {
            track.recordedData = [];
            track.isRecording = false;
            track.isMuted = false;
            track.isSolo = false;
        });
        this.updateDisplay();
        this.showNotification('New project created', 'success');
    }

    saveProject() {
        const projectData = {
            name: this.projectName,
            tempo: this.tempo,
            timeSignature: this.timeSignature,
            tracks: this.tracks.map(track => ({
                name: track.name,
                volume: track.volume,
                isMuted: track.isMuted,
                recordedData: track.recordedData
            }))
        };
        
        const dataStr = JSON.stringify(projectData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `${this.projectName}.json`;
        link.click();
        
        this.showNotification('Project saved', 'success');
    }

    loadProject() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const projectData = JSON.parse(e.target.result);
                        this.loadProjectData(projectData);
                        this.showNotification('Project loaded', 'success');
                    } catch (error) {
                        this.showNotification('Failed to load project', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    loadProjectData(projectData) {
        this.stop();
        this.projectName = projectData.name;
        this.tempo = projectData.tempo;
        this.timeSignature = projectData.timeSignature;
        
        projectData.tracks.forEach((trackData, index) => {
            if (this.tracks[index]) {
                this.tracks[index].name = trackData.name;
                this.tracks[index].volume = trackData.volume;
                this.tracks[index].isMuted = trackData.isMuted;
                this.tracks[index].recordedData = trackData.recordedData || [];
            }
        });
        
        this.updateDisplay();
    }

    exportProject() {
        // Simplified export - in a real implementation, you'd render audio
        this.showNotification('Export functionality coming soon!', 'info');
    }

    openInstrument(instrument) {
        window.open(`${instrument}.html`, '_blank');
    }

    updateDisplay() {
        document.getElementById('projectName').value = this.projectName;
        document.getElementById('tempoInput').value = this.tempo;
        this.updateTimeDisplay();
        this.updateTrackButtons();
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

// Initialize studio when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.virtualStudio = new VirtualStudio();
});

// Export for global access
window.VirtualStudio = VirtualStudio;
