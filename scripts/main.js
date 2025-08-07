// VibeWaves - Main Application JavaScript
// Shared functionality across all instruments

class VibeWavesApp {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.currentInstrument = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Setup navigation
            this.setupNavigation();
            
            // Setup keyboard shortcuts
            this.setupGlobalKeyboard();
            
            // Setup responsive design
            this.setupResponsive();
            
            // Setup accessibility
            this.setupAccessibility();
            
            this.initialized = true;
            console.log('VibeWaves App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize VibeWaves App:', error);
        }
    }
    
    setupNavigation() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            });
            
            // Close menu when pressing Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    navMenu.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            });
        }
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Active nav link highlighting
        this.highlightActiveNavLink();
    }
    
    highlightActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href && (currentPath.endsWith(href) || (href === 'index.html' && currentPath === '/'))) {
                link.classList.add('active');
            }
        });
    }
    
    setupGlobalKeyboard() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + specific keys for navigation
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateTo('index.html');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateTo('piano-new.html');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateTo('guitar-new.html');
                        break;
                    case '4':
                        e.preventDefault();
                        this.navigateTo('drums.html');
                        break;
                    case '5':
                        e.preventDefault();
                        this.navigateTo('percussion.html');
                        break;
                }
            }
            
            // ESC to close modals/overlays
            if (e.key === 'Escape') {
                this.closeAllOverlays();
            }
        });
    }
    
    setupResponsive() {
        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    }
    
    setupAccessibility() {
        // Focus management
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // High contrast detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
        
        // Reduced motion detection
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
        
        // Screen reader announcements
        this.createAriaLiveRegion();
    }
    
    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;
        document.body.appendChild(liveRegion);
        this.ariaLiveRegion = liveRegion;
    }
    
    announce(message) {
        if (this.ariaLiveRegion) {
            this.ariaLiveRegion.textContent = message;
        }
    }
    
    navigateTo(url) {
        if (url !== window.location.pathname) {
            window.location.href = url;
        }
    }
    
    closeAllOverlays() {
        // Close any open overlays, modals, dropdowns
        document.querySelectorAll('.overlay, .modal, .dropdown').forEach(element => {
            element.classList.remove('active', 'open', 'visible');
        });
        
        // Close mobile menu
        const navMenu = document.querySelector('.nav-menu');
        const hamburger = document.querySelector('.hamburger');
        if (navMenu && hamburger) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    }
    
    handleResize() {
        // Emit custom resize event for instruments
        const resizeEvent = new CustomEvent('vibewave-resize', {
            detail: {
                width: window.innerWidth,
                height: window.innerHeight,
                orientation: screen.orientation?.angle || 0
            }
        });
        document.dispatchEvent(resizeEvent);
    }
    
    // Utility methods for instruments
    createNoiseBuffer(duration, filterFreq = 1000) {
        if (!this.audioContext) return null;
        
        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        return buffer;
    }
    
    createOscillator(frequency, type = 'sine', options = {}) {
        if (!this.audioContext) return null;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        
        // Apply ADSR envelope if provided
        if (options.attack || options.decay || options.sustain || options.release) {
            const now = this.audioContext.currentTime;
            const { attack = 0.1, decay = 0.2, sustain = 0.5, release = 0.5, volume = 0.5 } = options;
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(volume, now + attack);
            gainNode.gain.exponentialRampToValueAtTime(volume * sustain, now + attack + decay);
            
            setTimeout(() => {
                const releaseTime = this.audioContext.currentTime;
                gainNode.gain.cancelScheduledValues(releaseTime);
                gainNode.gain.setValueAtTime(gainNode.gain.value, releaseTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, releaseTime + release);
                oscillator.stop(releaseTime + release);
            }, (attack + decay) * 1000);
        }
        
        oscillator.connect(gainNode);
        
        return { oscillator, gainNode };
    }
    
    // Performance monitoring
    logPerformance(label, startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 16.67) { // More than one frame at 60fps
            console.warn(`Performance warning: ${label} took ${duration.toFixed(2)}ms`);
        }
    }
    
    // Error handling
    handleError(error, context = 'Unknown') {
        console.error(`VibeWaves Error in ${context}:`, error);
        
        // Show user-friendly error message
        this.showNotification(`An error occurred. Please refresh the page and try again.`, 'error');
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        // Announce to screen readers
        this.announce(message);
    }
}

// Audio Context utilities
class AudioUtils {
    static createReverb(audioContext, roomSize = 2, decay = 2) {
        const convolver = audioContext.createConvolver();
        const length = audioContext.sampleRate * decay;
        const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                const n = length - i;
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, roomSize);
            }
        }
        
        convolver.buffer = impulse;
        return convolver;
    }
    
    static createDistortion(audioContext, amount = 50) {
        const distortion = audioContext.createWaveShaper();
        const samples = 44100;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
        }
        
        distortion.curve = curve;
        distortion.oversample = '4x';
        return distortion;
    }
    
    static createDelay(audioContext, delayTime = 0.3, feedback = 0.3) {
        const delay = audioContext.createDelay();
        const delayGain = audioContext.createGain();
        const feedbackGain = audioContext.createGain();
        
        delay.delayTime.setValueAtTime(delayTime, audioContext.currentTime);
        feedbackGain.gain.setValueAtTime(feedback, audioContext.currentTime);
        
        delay.connect(delayGain);
        delay.connect(feedbackGain);
        feedbackGain.connect(delay);
        
        return { input: delay, output: delayGain };
    }
}

// Performance utilities
class PerformanceUtils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    static requestIdleCallback(callback) {
        if (window.requestIdleCallback) {
            return window.requestIdleCallback(callback);
        } else {
            return setTimeout(callback, 1);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.vibeWavesApp = new VibeWavesApp();
    window.AudioUtils = AudioUtils;
    window.PerformanceUtils = PerformanceUtils;
});
