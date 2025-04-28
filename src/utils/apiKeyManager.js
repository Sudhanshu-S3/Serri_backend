require('dotenv').config();

class ApiKeyManager {
    constructor() {
        this.keys = process.env.YOUTUBE_API_KEYS.split(',');
        this.currentKeyIndex = 0;
        this.quotaExhaustedKeys = new Set();
    }

    getCurrentKey() {
        return this.keys[this.currentKeyIndex];
    }

    markKeyAsExhausted(key) {
        this.quotaExhaustedKeys.add(key);
        this.rotateToNextAvailableKey();
    }

    rotateToNextAvailableKey() {
        let attempts = 0;
        while (attempts < this.keys.length) {
            this.currentKeyIndex = (this.currentKeyIndex + 1) % this.keys.length;
            if (!this.quotaExhaustedKeys.has(this.keys[this.currentKeyIndex])) {
                return this.keys[this.currentKeyIndex];
            }
            attempts++;
        }
        throw new Error('All API keys have exhausted their quota!');
    }

    resetExhaustedKeys() {
        this.quotaExhaustedKeys.clear();
    }
}

module.exports = new ApiKeyManager();