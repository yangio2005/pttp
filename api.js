class QuizAPI {
    constructor(baseURL) {
        this.baseURL = baseURL;
    }

    async fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), CONFIG.API.TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(timeout);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    async getQuestions(chapter) {
        try {
            const url = `${this.baseURL}?chapter=${chapter}&t=${Date.now()}`;
            return await this.fetchWithTimeout(url);
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw new Error(`Không thể tải câu hỏi: ${error.message}`);
        }
    }

    async saveScore(data) {
        try {
            return await this.fetchWithTimeout(this.baseURL, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Error saving score:', error);
            throw new Error(`Không thể lưu điểm: ${error.message}`);
        }
    }
}

// Initialize API
const quizAPI = new QuizAPI(CONFIG.API.BASE_URL);