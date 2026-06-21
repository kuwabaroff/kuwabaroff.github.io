// QuestNet — Помодоро таймер

(function() {
    'use strict';

    const POMODORO_KEY = 'questnet_pomodoro';
    const WORK_DURATION = 25 * 60; // 25 минут в секундах
    const BREAK_DURATION = 5 * 60; // 5 минут в секундах

    let state = {
        isRunning: false,
        isWork: true,
        timeLeft: WORK_DURATION,
        totalSeconds: WORK_DURATION,
        currentTaskId: null,
        sessionsCompleted: 0,
        startTime: null
    };

    let timerInterval = null;
    let audioContext = null;

    // Инициализация
    function initPomodoro() {
        loadState();
        renderPomodoro();
        setupPomodoroEvents();
        console.log('⏱️ Pomodoro initialized');
    }

    // Загрузка состояния
    function loadState() {
        try {
            const stored = localStorage.getItem(POMODORO_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.assign(state, parsed);
                // Если таймер был запущен, но страница перезагружена
                if (state.isRunning && state.startTime) {
                    const elapsed = (Date.now() - state.startTime) / 1000;
                    state.timeLeft = Math.max(0, state.timeLeft - elapsed);
                    if (state.timeLeft <= 0) {
                        state.isRunning = false;
                        completeSession();
                    } else {
                        // Продолжаем таймер
                        startTimer();
                    }
                }
            }
        } catch (e) {
            console.warn('Failed to load pomodoro state:', e);
        }
    }

    // Сохранение состояния
    function saveState() {
        try {
            const data = { ...state };
            // Не сохраняем startTime при остановке
            if (!state.isRunning) {
                data.startTime = null;
            }
            localStorage.setItem(POMODORO_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save pomodoro state:', e);
        }
    }

    // Создание звука
    function playBeep() {
        try {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            setTimeout(() => {
                oscillator.stop();
            }, 300);
            
            // Второй сигнал через 200ms
            setTimeout(() => {
                const osc2 = audioContext.createOscillator();
                const gain2 = audioContext.createGain();
                osc2.connect(gain2);
                gain2.connect(audioContext.destination);
                osc2.frequency.value = 1100;
                osc2.type = 'sine';
                gain2.gain.value = 0.3;
                osc2.start();
                setTimeout(() => osc2.stop(), 300);
            }, 200);
            
        } catch (e) {
            console.warn('Could not play beep:', e);
        }
    }

    // Запуск таймера
    function startTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        state.isRunning = true;
        state.startTime = Date.now();
        saveState();
        
        timerInterval = setInterval(() => {
            state.timeLeft--;
            
            if (state.timeLeft <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                state.isRunning = false;
                completeSession();
                return;
            }
            
            updateDisplay();
        }, 1000);
        
        updateDisplay();
    }

    // Остановка таймера
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        state.isRunning = false;
        state.startTime = null;
        saveState();
        updateDisplay();
    }

    // Завершение сессии
    function completeSession() {
        playBeep();
        
        state.sessionsCompleted++;
        state.isRunning = false;
        state.startTime = null;
        
        // Переключение между работой и отдыхом
        state.isWork = !state.isWork;
        state.totalSeconds = state.isWork ? WORK_DURATION : BREAK_DURATION;
        state.timeLeft = state.totalSeconds;
        
        // Бонус за завершенную сессию
        if (!state.isWork) {
            // Только что завершили работу, начинаем отдых
            applyPomodoroBonus();
        }
        
        saveState();
        updateDisplay();
        
        // Уведомление
        if (typeof QuestNet !== 'undefined') {
            const phase = state.isWork ? '⏱️ Работа' : '☕ Отдых';
            const duration = state.isWork ? '25 мин' : '5 мин';
            QuestNet.showNotification(
                `${phase} завершена!`,
                `Начинается ${state.isWork ? 'работа' : 'отдых'} (${duration})`,
                state.isWork ? '⏱️' : '☕',
                state.isWork ? '#6c8aff' : '#4ade80'
            );
        }
        
        // Если есть задача, показываем бонус
        if (!state.isWork && state.currentTaskId) {
            if (typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '🎯 Бонус помодоро!',
                    `+20% к награде за квест`,
                    '🎯',
                    '#facc15'
                );
            }
        }
        
        // Автоматически запускаем следующую сессию через 3 секунды
        setTimeout(() => {
            if (!state.isRunning) {
                startTimer();
            }
        }, 3000);
    }

    // Применение бонуса помодоро к задаче
    function applyPomodoroBonus() {
        if (!state.currentTaskId) return;
        
        // Находим квест
        if (typeof CanvasAPI !== 'undefined') {
            const quests = CanvasAPI.getQuests();
            const quest = quests.find(q => q.id === state.currentTaskId);
            if (quest) {
                // Добавляем бонус 20% к награде
                const bonus = Math.floor(quest.reward * 0.2);
                // Можно добавить специальный флаг к квесту
                if (typeof QuestNet !== 'undefined') {
                    QuestNet.showNotification(
                        '🔥 Бонус помодоро!',
                        `+${bonus} монет к квесту "${quest.title}"`,
                        '🔥',
                        '#facc15'
                    );
                }
                // Сохраняем бонус для последующего начисления
                localStorage.setItem('questnet_pomodoro_bonus_' + quest.id, String(bonus));
            }
        }
    }

    // Обновление дисплея
    function updateDisplay() {
        const minutes = Math.floor(state.timeLeft / 60);
        const seconds = state.timeLeft % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const display = document.getElementById('pomodoroDisplay');
        if (display) {
            display.textContent = timeStr;
        }
        
        // Обновляем иконку в топбаре
        const btn = document.getElementById('pomodoroBtn');
        if (btn) {
            const phase = state.isWork ? '⏱️' : '☕';
            btn.innerHTML = `${phase} ${timeStr}`;
            btn.style.color = state.isWork ? '#6c8aff' : '#4ade80';
        }
    }

    // Рендер помодоро
    function renderPomodoro() {
        // Добавляем отображение в топбар
        const btn = document.getElementById('pomodoroBtn');
        if (btn) {
            btn.style.cssText = `
                background: rgba(255,255,255,0.06);
                border: none;
                border-radius: 6px;
                padding: 6px 12px;
                color: #aaa;
                cursor: pointer;
                font-size: 0.8rem;
                font-family: 'Inter', sans-serif;
                transition: all 0.15s ease;
                display: flex;
                align-items: center;
                gap: 4px;
            `;
            
            // Создаем скрытый display для обновления
            const display = document.createElement('span');
            display.id = 'pomodoroDisplay';
            display.style.display = 'none';
            document.body.appendChild(display);
            
            updateDisplay();
        }
    }

    // Настройка событий
    function setupPomodoroEvents() {
        const btn = document.getElementById('pomodoroBtn');
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            if (state.isRunning) {
                stopTimer();
                if (typeof QuestNet !== 'undefined') {
                    QuestNet.showNotification(
                        '⏸️ Таймер остановлен',
                        'Помодоро сессия приостановлена',
                        '⏸️',
                        '#888'
                    );
                }
            } else {
                // Если нет задачи, предлагаем выбрать
                if (!state.currentTaskId) {
                    showTaskSelection();
                } else {
                    startTimer();
                    if (typeof QuestNet !== 'undefined') {
                        const phase = state.isWork ? 'Работа' : 'Отдых';
                        const duration = state.isWork ? '25 мин' : '5 мин';
                        QuestNet.showNotification(
                            `⏱️ ${phase} начата`,
                            `Помодоро сессия на ${duration}`,
                            '⏱️',
                            '#6c8aff'
                        );
                    }
                }
            }
        });
        
        // Клавиатурные сокращения
        document.addEventListener('keydown', (e) => {
            if (e.key === 'p' && e.ctrlKey) {
                e.preventDefault();
                btn.click();
            }
        });
    }

    // Выбор задачи для помодоро
    function showTaskSelection() {
        if (typeof CanvasAPI === 'undefined') {
            if (typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '❌ Ошибка',
                    'Система квестов не инициализирована',
                    '❌',
                    '#f87171'
                );
            }
            return;
        }
        
        const quests = CanvasAPI.getQuests();
        const activeQuests = quests.filter(q => !q.completed);
        
        if (activeQuests.length === 0) {
            if (typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '📋 Нет активных квестов',
                    'Создай квест, чтобы запустить помодоро',
                    '📋',
                    '#888'
                );
            }
            return;
        }
        
        // Создаем модальное окно выбора
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #111114;
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 16px;
            padding: 32px;
            max-width: 480px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        let listHtml = '';
        activeQuests.forEach(q => {
            listHtml += `
                <div class="task-select-item" data-id="${q.id}" style="
                    padding: 12px 16px;
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                ">
                    <span style="font-size: 1.5rem;">${q.emoji || '❓'}</span>
                    <div>
                        <div style="color: #e8e8e8; font-weight: 500;">${q.title}</div>
                        <div style="color: #666; font-size: 0.8rem;">${q.sphere} • ${q.reward} монет</div>
                    </div>
                </div>
            `;
        });
        
        modal.innerHTML = `
            <h3 style="margin-bottom: 16px; font-weight: 500; color: #e8e8e8;">
                ⏱️ Выбери задачу для помодоро
            </h3>
            <div style="margin-bottom: 16px; color: #666; font-size: 0.85rem;">
                Таймер будет запущен на выбранную задачу
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                ${listHtml}
            </div>
            <button class="btn-secondary" id="pomodoroTaskCancel" style="margin-top: 12px; width: 100%;">
                Отмена
            </button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Обработчики
        modal.querySelectorAll('.task-select-item').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                state.currentTaskId = id;
                saveState();
                overlay.remove();
                startTimer();
                
                const quest = activeQuests.find(q => q.id === id);
                if (typeof QuestNet !== 'undefined') {
                    QuestNet.showNotification(
                        '⏱️ Помодоро запущен',
                        `Для задачи: ${quest ? quest.title : '#' + id}`,
                        '⏱️',
                        '#6c8aff'
                    );
                }
            });
            
            item.addEventListener('mouseenter', () => {
                item.style.borderColor = 'rgba(255,255,255,0.15)';
                item.style.background = 'rgba(255,255,255,0.04)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.borderColor = 'rgba(255,255,255,0.06)';
                item.style.background = 'transparent';
            });
        });
        
        document.getElementById('pomodoroTaskCancel').addEventListener('click', () => {
            overlay.remove();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    // Получение бонуса помодоро для задачи
    function getPomodoroBonus(questId) {
        const key = 'questnet_pomodoro_bonus_' + questId;
        const bonus = localStorage.getItem(key);
        if (bonus) {
            localStorage.removeItem(key);
            return parseInt(bonus);
        }
        return 0;
    }

    // Экспорт API
    window.PomodoroAPI = {
        getState: () => state,
        startTimer,
        stopTimer,
        getPomodoroBonus,
        isRunning: () => state.isRunning,
        getTimeLeft: () => state.timeLeft,
        getSessions: () => state.sessionsCompleted
    };

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPomodoro);
    } else {
        initPomodoro();
    }

})();