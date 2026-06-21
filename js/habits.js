// QuestNet — Таймер вредных привычек

(function() {
    'use strict';

    const HABITS_KEY = 'questnet_habits';

    let state = {
        habits: [] // { id, name, startDate, lastResetDate, totalResets }
    };

    let intervals = {};

    // Инициализация
    function initHabits() {
        loadState();
        renderHabits();
        setupHabitsEvents();
        startAllTimers();
        console.log('🚫 Habits tracker initialized');
    }

    // Загрузка состояния
    function loadState() {
        try {
            const stored = localStorage.getItem(HABITS_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                state.habits = parsed.habits || [];
            }
        } catch (e) {
            console.warn('Failed to load habits state:', e);
        }
    }

    // Сохранение состояния
    function saveState() {
        try {
            localStorage.setItem(HABITS_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save habits state:', e);
        }
    }

    // Добавление привычки
    function addHabit(name) {
        if (!name || name.trim().length === 0) {
            return { success: false, message: 'Введите название привычки' };
        }

        const habit = {
            id: Date.now(),
            name: name.trim(),
            startDate: new Date().toISOString(),
            lastResetDate: null,
            totalResets: 0
        };

        state.habits.push(habit);
        saveState();
        renderHabits();
        startTimer(habit.id);

        if (typeof QuestNet !== 'undefined') {
            QuestNet.showNotification(
                '🚫 Привычка добавлена',
                `Ты отказался от: ${habit.name}`,
                '🚫',
                '#f472b6'
            );
        }

        return { success: true, habit };
    }

    // Удаление привычки
    function deleteHabit(id) {
        state.habits = state.habits.filter(h => h.id !== id);
        if (intervals[id]) {
            clearInterval(intervals[id]);
            delete intervals[id];
        }
        saveState();
        renderHabits();
        return { success: true };
    }

    // Срыв (обнуление счетчика)
    function resetHabit(id) {
        const habit = state.habits.find(h => h.id === id);
        if (!habit) return { success: false, message: 'Привычка не найдена' };

        habit.lastResetDate = new Date().toISOString();
        habit.totalResets++;

        saveState();
        renderHabits();
        startTimer(id);

        // Сброс стрика
        if (typeof CoinsAPI !== 'undefined') {
            CoinsAPI.resetStreak();
        }

        if (typeof QuestNet !== 'undefined') {
            QuestNet.showNotification(
                '💔 Срыв!',
                `Ты сорвался с "${habit.name}". Но это не конец — начни заново!`,
                '💔',
                '#f87171'
            );
        }

        return { success: true };
    }

    // Получение времени с последнего сброса
    function getTimeSince(id) {
        const habit = state.habits.find(h => h.id === id);
        if (!habit) return null;

        const start = habit.lastResetDate ? new Date(habit.lastResetDate) : new Date(habit.startDate);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000); // секунды

        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);

        return { days, hours, minutes, totalSeconds: diff };
    }

    // Форматирование времени
    function formatTime(time) {
        if (!time) return '0 дней';
        const parts = [];
        if (time.days > 0) parts.push(`${time.days} д`);
        if (time.hours > 0 || time.days > 0) parts.push(`${time.hours} ч`);
        parts.push(`${time.minutes} мин`);
        return parts.join(' ');
    }

    // Запуск таймера для привычки
    function startTimer(id) {
        if (intervals[id]) {
            clearInterval(intervals[id]);
        }

        intervals[id] = setInterval(() => {
            const el = document.querySelector(`[data-habit-id="${id}"] .habit-timer`);
            if (el) {
                const time = getTimeSince(id);
                if (time) {
                    el.textContent = formatTime(time);
                }
            }
        }, 1000);
    }

    // Запуск всех таймеров
    function startAllTimers() {
        state.habits.forEach(h => startTimer(h.id));
    }

    // Рендер привычек
    function renderHabits() {
        const container = document.getElementById('habitList');
        if (!container) return;

        if (state.habits.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🚫</div>
                    <div class="empty-title">Нет привычек</div>
                    <div class="empty-sub">Добавь привычку, от которой хочешь отказаться</div>
                </div>
            `;
            return;
        }

        container.innerHTML = state.habits.map(habit => {
            const time = getTimeSince(habit.id);
            const timeStr = time ? formatTime(time) : '0 дней';
            
            return `
                <div class="habit-item card" data-habit-id="${habit.id}" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    margin-bottom: 10px;
                ">
                    <div style="display: flex; flex-direction: column; gap: 4px; flex: 1;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.2rem;">🚫</span>
                            <span style="color: #e8e8e8; font-weight: 500;">${habit.name}</span>
                            ${habit.totalResets > 0 ? `<span style="color: #666; font-size: 0.7rem;">срывов: ${habit.totalResets}</span>` : ''}
                        </div>
                        <div class="habit-timer" style="color: #4ade80; font-size: 1.1rem; font-weight: 500;">
                            ${timeStr}
                        </div>
                        <div style="color: #666; font-size: 0.7rem;">
                            С ${new Date(habit.startDate).toLocaleDateString('ru-RU')}
                        </div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <button class="btn-secondary habit-reset-btn" data-id="${habit.id}" 
                            style="padding: 6px 12px; font-size: 0.8rem; border-color: #f87171; color: #f87171;">
                            Сорвался
                        </button>
                        <button class="btn-secondary habit-delete-btn" data-id="${habit.id}" 
                            style="padding: 6px 12px; font-size: 0.8rem; border-color: transparent; color: #444;">
                            ✕
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Обработчики
        container.querySelectorAll('.habit-reset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (confirm('Точно сорвался? Счетчик обнулится.')) {
                    resetHabit(id);
                }
            });
        });

        container.querySelectorAll('.habit-delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                if (confirm('Удалить привычку?')) {
                    deleteHabit(id);
                }
            });
        });
    }

    // Настройка событий
    function setupHabitsEvents() {
        const addBtn = document.getElementById('addHabitBtn');
        const input = document.getElementById('habitName');

        if (addBtn && input) {
            addBtn.addEventListener('click', () => {
                const result = addHabit(input.value);
                if (result.success) {
                    input.value = '';
                } else {
                    if (typeof QuestNet !== 'undefined') {
                        QuestNet.showNotification(
                            '❌ Ошибка',
                            result.message,
                            '❌',
                            '#f87171'
                        );
                    }
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') addBtn.click();
            });
        }
    }

    // Получение общей длины стрика (с учетом привычек)
    function getHabitStreak() {
        if (state.habits.length === 0) return 0;
        
        // Берем минимальный стрик среди всех привычек
        let minDays = Infinity;
        state.habits.forEach(habit => {
            const time = getTimeSince(habit.id);
            if (time) {
                minDays = Math.min(minDays, time.days);
            }
        });
        
        return minDays === Infinity ? 0 : minDays;
    }

    // Экспорт API
    window.HabitsAPI = {
        getState: () => state,
        addHabit,
        deleteHabit,
        resetHabit,
        getTimeSince,
        getHabitStreak,
        renderHabits
    };

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHabits);
    } else {
        initHabits();
    }

})();