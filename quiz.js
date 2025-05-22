class Quiz {
    constructor() {
        this.initialize();
        this.bindEvents();
    }

    initialize() {
        // State
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.highScore = Utils.storage.get(CONFIG.STORAGE_KEYS.HIGH_SCORE, 0);
        this.timeLeft = CONFIG.QUIZ.TIME_LIMIT;
        this.timerInterval = null;
        this.soundEnabled = Utils.storage.get(CONFIG.STORAGE_KEYS.SOUND_ENABLED, false);
        this.answered = false;

        // Cache DOM elements
        this.elements = {
            startScreen: Utils.qs('#start-screen'),
            quizContainer: Utils.qs('#quiz-container'),
            playerName: Utils.qs('#player-name'),
            chapter: Utils.qs('#chapter'),
            shuffle: Utils.qs('#shuffle'),
            startBtn: Utils.qs('#start-btn'),
            soundBtn: Utils.qs('#enable-sound-btn'),
            question: Utils.qs('#question'),
            note: Utils.qs('#note'),
            options: Utils.qs('#options'),
            result: Utils.qs('#result'),
            score: Utils.qs('#score'),
            nextBtn: Utils.qs('#next-btn'),
            restartBtn: Utils.qs('#restart-btn'),
            timer: Utils.qs('#timer'),
            questionCount: Utils.qs('#question-count'),
        };

        // Initialize UI
        this.updateScoreDisplay();
        this.loadSavedPlayerName();
        this.updateSoundButton();
    }

    bindEvents() {
        this.elements.startBtn.addEventListener('click', () => this.handleStart());
        this.elements.soundBtn.addEventListener('click', () => this.toggleSound());
        this.elements.nextBtn.addEventListener('click', () => this.handleNext());
        this.elements.restartBtn.addEventListener('click', () => this.handleRestart());
    }

    async handleStart() {
        const playerName = this.elements.playerName.value.trim();
        if (!playerName) {
            Utils.ui.showToast('Vui lòng nhập tên người chơi!', 'error');
            this.elements.playerName.focus();
            return;
        }

        Utils.storage.set(CONFIG.STORAGE_KEYS.PLAYER_NAME, playerName);
        
        try {
            Utils.ui.loading.show();
            await this.loadQuestions();
            this.startQuiz();
        } catch (error) {
            Utils.ui.showToast(error.message, 'error');
        } finally {
            Utils.ui.loading.hide();
        }
    }

    async loadQuestions() {
        const questions = await quizAPI.getQuestions(this.elements.chapter.value);
        
        if (!questions || questions.length === 0) {
            throw new Error('Không có câu hỏi nào trong chương này!');
        }

        this.questions = this.elements.shuffle.checked ? Utils.shuffle(questions) : questions;
    }

    startQuiz() {
        this.elements.startScreen.classList.add('hidden');
        this.elements.quizContainer.classList.remove('hidden');
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.answered = false;
        this.updateScoreDisplay();
        this.showQuestion();
    }

    showQuestion() {
        clearInterval(this.timerInterval);
        this.answered = false;
        this.startTimer();

        const question = this.questions[this.currentQuestionIndex];
        this.elements.question.textContent = question.question;
        this.elements.questionCount.textContent = `Câu ${this.currentQuestionIndex + 1}/${this.questions.length}`;
        
        this.elements.options.innerHTML = '';
        this.elements.note.innerHTML = '';
        this.elements.result.textContent = '';
        this.elements.nextBtn.classList.add('hidden');
        this.elements.restartBtn.classList.add('hidden');

        // Show note if exists
        if (question.note?.trim()) {
            const noteParts = question.note.split('Image:');
            let noteHtml = noteParts[0] ? `<p class="text-sm">${noteParts[0].trim()}</p>` : '';
            if (noteParts[1]?.trim()) {
                noteHtml += `<img src="${noteParts[1].trim()}" class="max-w-full h-auto rounded mt-2 max-h-64" alt="Hình ảnh minh họa" loading="lazy" onerror="this.style.display='none'">`;
            }
            this.elements.note.innerHTML = noteHtml;
        }

        // Create options
        Object.entries(question.options)
            .filter(([_, value]) => value.trim())
            .forEach(([key, value]) => {
                const button = document.createElement('button');
                button.className = 'bg-blue-100 p-4 rounded-lg hover:bg-blue-200 transition text-left border border-blue-200';
                button.innerHTML = `<span class="font-bold text-blue-700">${key}:</span> ${value}`;
                button.addEventListener('click', () => {
                    if (!this.answered) {
                        this.checkAnswer(key, button);
                    }
                });
                this.elements.options.appendChild(button);
            });
    }

    async checkAnswer(selected, button) {
        if (this.answered) return;
        
        this.answered = true;
        clearInterval(this.timerInterval);
        
        const correct = this.questions[this.currentQuestionIndex].answer;
        const isCorrect = selected === correct;
        
        // Highlight correct answer
        this.elements.options.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
            const btnKey = btn.innerHTML.charAt(btn.innerHTML.indexOf('<span') + 20);
            if (btnKey === correct) {
                btn.classList.remove('bg-blue-100', 'hover:bg-blue-200');
                btn.classList.add('bg-green-500', 'text-white', 'border-green-500');
            }
        });
        
        if (isCorrect) {
            if (button) {
                button.classList.add('pop');
            }
            this.elements.result.textContent = 'Chính xác! 🎉';
            this.elements.result.className = 'text-center mt-4 text-lg font-semibold text-green-600';
            this.score += CONFIG.QUIZ.POINTS_PER_CORRECT;
            
            if (this.score > this.highScore) {
                this.highScore = this.score;
                Utils.storage.set(CONFIG.STORAGE_KEYS.HIGH_SCORE, this.highScore);
            }
            
            if (this.soundEnabled) {
                Utils.sound.play(800, 0.3);
            }
        } else {
            if (button) {
                button.classList.remove('bg-blue-100');
                button.classList.add('bg-red-500', 'text-white', 'shake', 'border-red-500');
            }
            this.elements.result.textContent = selected ? `Sai rồi! Đáp án đúng là ${correct} 😞` : 'Hết thời gian! ⏰';
            this.elements.result.className = 'text-center mt-4 text-lg font-semibold text-red-600';
            
            if (this.soundEnabled) {
                Utils.sound.play(300, 0.5);
            }
        }
        
        this.updateScoreDisplay();
        
        if (this.currentQuestionIndex === this.questions.length - 1) {
            await this.finishQuiz();
        } else {
            setTimeout(() => {
                this.elements.nextBtn.classList.remove('hidden');
            }, 1000);
        }
    }

    async finishQuiz() {
        try {
            await quizAPI.saveScore({
                playerName: this.elements.playerName.value || "Anonymous",
                chapter: this.elements.chapter.value,
                score: this.score
            });
            
            setTimeout(() => {
                this.elements.nextBtn.textContent = 'Hoàn thành';
                this.elements.nextBtn.classList.remove('hidden');
                this.elements.restartBtn.classList.remove('hidden');
            }, 1500);
            
        } catch (error) {
            Utils.ui.showToast('Không thể lưu điểm', 'error');
        }
    }

    startTimer() {
        this.timeLeft = CONFIG.QUIZ.TIME_LIMIT;
        this.updateTimer();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                if (!this.answered) {
                    this.checkAnswer('', null);
                }
            }
        }, 1000);
    }

    updateTimer() {
        this.elements.timer.textContent = `Thời gian: ${this.timeLeft}s`;
        this.elements.timer.classList.toggle('timer-warning', this.timeLeft <= 10);
    }

    updateScoreDisplay() {
        this.elements.score.textContent = `Điểm: ${this.score} (Cao nhất: ${this.highScore})`;
    }

    loadSavedPlayerName() {
        const savedName = Utils.storage.get(CONFIG.STORAGE_KEYS.PLAYER_NAME);
        if (savedName) {
            this.elements.playerName.value = savedName;
        }
    }

    async toggleSound() {
        try {
            await Utils.sound.init();
            this.soundEnabled = true;
            Utils.storage.set(CONFIG.STORAGE_KEYS.SOUND_ENABLED, true);
            Utils.sound.play(600, 0.2);
            this.updateSoundButton();
            this.elements.soundBtn.disabled = true;
        } catch (error) {
            Utils.ui.showToast('Không thể bật âm thanh', 'error');
        }
    }

    updateSoundButton() {
        if (this.soundEnabled) {
            this.elements.soundBtn.textContent = 'Âm thanh đã bật ✓';
            this.elements.soundBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
            this.elements.soundBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        }
    }

    handleNext() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else {
            this.showCompletionScreen();
        }
    }

    handleRestart() {
        this.elements.quizContainer.classList.add('hidden');
        this.elements.startScreen.classList.remove('hidden');
        this.score = 0;
        this.currentQuestionIndex = 0;
        this.questions = [];
        this.answered = false;
        clearInterval(this.timerInterval);
    }

    showCompletionScreen() {
        this.elements.quizContainer.innerHTML = `
            <div class="text-center">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">🎊 Hoàn thành! 🎊</h2>
                <p class="text-xl">Điểm của bạn: <span class="font-bold text-blue-600">${this.score}</span></p>
                <p class="text-lg text-gray-600">Điểm cao nhất: ${this.highScore}</p>
                <div class="mt-6">
                    <button id="final-restart-btn" class="bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 text-lg">
                        Chơi lại
                    </button>
                </div>
            </div>
        `;
        Utils.qs('#final-restart-btn').addEventListener('click', () => this.handleRestart());
    }
}

// Initialize quiz when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Quiz();
});