const Utils = {
    // DOM helpers
    qs: (selector) => document.querySelector(selector),
    qsa: (selector) => document.querySelectorAll(selector),
    
    // Array utilities
    shuffle: (array) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },

    // Storage helpers
    storage: {
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch {
                return false;
            }
        }
    },

    // Sound utilities
    sound: {
        context: null,
        init() {
            if (!this.context) {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
            }
            return this.context;
        },
        async play(frequency, duration, type = 'sine') {
            try {
                const ctx = await this.init();
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = type;
                
                gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
                
                oscillator.start(ctx.currentTime);
                oscillator.stop(ctx.currentTime + duration);
            } catch (error) {
                console.warn('Sound playback failed:', error);
            }
        }
    },

    // UI utilities
    ui: {
        showToast(message, type = 'info') {
            const toast = document.createElement('div');
            toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white ${
                type === 'error' ? 'bg-red-500' : 
                type === 'success' ? 'bg-green-500' : 
                'bg-blue-500'
            }`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        },

        loading: {
            show() {
                Utils.qs('#loading-overlay').classList.remove('hidden');
            },
            hide() {
                Utils.qs('#loading-overlay').classList.add('hidden');
            }
        },

        formatTime(seconds) {
            return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
        }
    }
};

// Make utils immutable
Object.freeze(Utils);