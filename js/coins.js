// QuestNet — Система монет и стриков

(function() {
    'use strict';

    const COINS_KEY = 'questnet_coins';
    const STREAK_KEY = 'questnet_streak';
    const DAILY_LIMIT = 150;
    const MAX_DAILY_QUESTS = 10;
    const MIN_HOURS_BEFORE_COMPLETE = 2;

    // Состояние
    let state = {
        balance: 0,
        streak: 0,
        lastActivityDate: null,
        todayCoins: 0,
        todayQuests: 0,
        todaySpheres: {},
        dailyResetTime: null
    };

    // Инициализация
    function initCoins() {
        loadState();
        checkDailyReset();
        console.log('🪙 Coins system initialized');
    }

    // Загрузка состояния
    function loadState() {
        try {
            const stored = localStorage.getItem(COINS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.assign(state, parsed);
            }
        } catch (e) {
            console.warn('Failed to load coins state:', e);
        }
    }

    // Сохранение состояния
    function saveState() {
        try {
            localStorage.setItem(COINS_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save coins state:', e);
        }
    }

    // Проверка ежедневного сброса
    function checkDailyReset() {
        const today = new Date().toDateString();
        if (state.dailyResetTime !== today) {
            state.todayCoins = 0;
            state.todayQuests = 0;
            state.todaySpheres = {};
            state.dailyResetTime = today;
            saveState();
        }
    }

    // Получение баланса
    function getBalance() {
        return state.balance;
    }

    // Получение стрика
    function getStreak() {
        return state.streak;
    }

    // Добавление монет (с проверкой антиабьюз)
    function addCoins(amount, sphere) {
        checkDailyReset();
        
        // Проверка лимита монет в день
        if (state.todayCoins + amount > DAILY_LIMIT) {
            return {
                success: false,
                message: `Дневной лимит монет (${DAILY_LIMIT}) достигнут`,
                earned: 0
            };
        }

        // Проверка лимита квестов в день
        if (state.todayQuests >= MAX_DAILY_QUESTS) {
            return {
                success: false,
                message: `Дневной лимит квестов (${MAX_DAILY_QUESTS}) достигнут`,
                earned: 0
            };
        }

        // Бонус за разнообразие сфер (минимум 3 сферы в день)
        let bonus = 0;
        if (sphere) {
            if (!state.todaySpheres[sphere]) {
                state.todaySpheres[sphere] = 0;
            }
            state.todaySpheres[sphere]++;
            
            const sphereCount = Object.keys(state.todaySpheres).length;
            if (sphereCount >= 3) {
                bonus = Math.floor(amount * 0.2);
            }
        }

        // Бонус за стрик (x2 при стрике 7+ дней)
        let streakBonus = 0;
        if (state.streak >= 7) {
            streakBonus = amount;
        }

        const totalEarned = amount + bonus + streakBonus;
        
        // Начисляем
        state.balance += totalEarned;
        state.todayCoins += totalEarned;
        state.todayQuests++;
        
        // Обновляем стрик
        updateStreak();
        
        saveState();
        
        return {
            success: true,
            earned: totalEarned,
            base: amount,
            bonus: bonus,
            streakBonus: streakBonus,
            message: `+${totalEarned} монет`
        };
    }

    // Списание монет
    function spendCoins(amount) {
        if (state.balance < amount) {
            return {
                success: false,
                message: 'Недостаточно монет'
            };
        }
        
        state.balance -= amount;
        saveState();
        
        return {
            success: true,
            remaining: state.balance
        };
    }

    // Обновление стрика
    function updateStreak() {
        const today = new Date().toDateString();
        
        if (state.lastActivityDate === today) {
            // Уже обновлено сегодня
            return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (state.lastActivityDate === yesterdayStr) {
            // Продолжаем стрик
            state.streak++;
        } else if (state.lastActivityDate !== today) {
            // Сброс стрика (если пропущен день)
            state.streak = 1; // Начинаем новый стрик
        }
        
        state.lastActivityDate = today;
        saveState();
    }

    // Сброс стрика (при срыве привычки)
    function resetStreak() {
        state.streak = 0;
        state.lastActivityDate = null;
        saveState();
        
        if (typeof QuestNet !== 'undefined') {
            QuestNet.showNotification(
                '💔 Стрик сброшен',
                'Ты сорвался. Но это не конец — начни заново!',
                '💔',
                '#f87171'
            );
        }
    }

    // Получение статистики за день
    function getDailyStats() {
        checkDailyReset();
        return {
            todayCoins: state.todayCoins,
            todayQuests: state.todayQuests,
            todaySpheres: state.todaySpheres,
            maxCoins: DAILY_LIMIT,
            maxQuests: MAX_DAILY_QUESTS,
            spheresCount: Object.keys(state.todaySpheres).length
        };
    }

    // Проверка возможности выполнения квеста
    function canCompleteQuest(quest) {
        checkDailyReset();
        
        // Проверка времени создания (2 часа)
        const hoursSinceCreation = (Date.now() - quest.createdAt) / (1000 * 60 * 60);
        if (hoursSinceCreation < MIN_HOURS_BEFORE_COMPLETE) {
            return {
                can: false,
                reason: `Квест можно выполнить через ${Math.ceil(MIN_HOURS_BEFORE_COMPLETE - hoursSinceCreation)} часов`
            };
        }
        
        // Проверка дневного лимита квестов
        if (state.todayQuests >= MAX_DAILY_QUESTS) {
            return {
                can: false,
                reason: `Дневной лимит квестов (${MAX_DAILY_QUESTS}) достигнут`
            };
        }
        
        // Проверка дневного лимита монет
        if (state.todayCoins + quest.reward > DAILY_LIMIT) {
            return {
                can: false,
                reason: `Дневной лимит монет (${DAILY_LIMIT}) будет превышен`
            };
        }
        
        return { can: true };
    }

    // Экспорт API
    window.CoinsAPI = {
        getBalance,
        getStreak,
        addCoins,
        spendCoins,
        resetStreak,
        getDailyStats,
        canCompleteQuest,
        DAILY_LIMIT,
        MAX_DAILY_QUESTS,
        MIN_HOURS_BEFORE_COMPLETE
    };

    // Инициализация
    initCoins();

})();