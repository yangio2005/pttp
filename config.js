const CONFIG = {
    API: {
        BASE_URL: 'https://script.google.com/macros/s/AKfycbw5HiODOZpveHitzGh2X1ePrvZdYP-MYfC1GgMJWVygzsoYaBIpi8vw53JcYMw-vW84/exec',
        TIMEOUT: 30000, // 30 seconds
    },
    QUIZ: {
        TIME_LIMIT: 30, // seconds per question
        POINTS_PER_CORRECT: 10,
        MAX_QUESTIONS: 10,
    },
    STORAGE_KEYS: {
        HIGH_SCORE: 'quizHighScore',
        SOUND_ENABLED: 'quizSoundEnabled',
        PLAYER_NAME: 'quizPlayerName',
    },
    ANIMATIONS: {
        DURATION: {
            SHAKE: 500,
            POP: 300,
        }
    }
};

Object.freeze(CONFIG); // Prevent modifications