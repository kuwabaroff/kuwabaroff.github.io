// QuestNet — Трекер тела (вес, ИМТ, тренировки)

(function() {
    'use strict';

    const BODY_KEY = 'questnet_body';

    let state = {
        weights: [], // { date, weight }
        height: null, // см
        weightGoal: null, // кг
        workouts: {}, // { '2024-01-01': true }
        workoutGoal: 3, // раз в неделю
        lastWorkoutDate: null
    };

    // Инициализация
    function initBody() {
        loadState();
        renderBody();
        setupBodyEvents();
        console.log('💪 Body tracker initialized');
    }

    // Загрузка состояния
    function loadState() {
        try {
            const stored = localStorage.getItem(BODY_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.assign(state, parsed);
            }
        } catch (e) {
            console.warn('Failed to load body state:', e);
        }
    }

    // Сохранение состояния
    function saveState() {
        try {
            localStorage.setItem(BODY_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save body state:', e);
        }
    }

    // Добавление записи веса
    function addWeight(weight, date) {
        if (!weight || weight <= 0) {
            return { success: false, message: 'Некорректный вес' };
        }

        const dateStr = date || new Date().toISOString().split('T')[0];
        
        // Проверяем, есть ли запись за эту дату
        const existing = state.weights.find(w => w.date === dateStr);
        if (existing) {
            existing.weight = weight;
        } else {
            state.weights.push({ date: dateStr, weight });
        }

        state.weights.sort((a, b) => a.date.localeCompare(b.date));
        saveState();
        renderBody();

        // Начисляем монеты за запись веса
        if (typeof CoinsAPI !== 'undefined') {
            const result = CoinsAPI.addCoins(5, 'Тело');
            if (result.success && typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '💪 Мини-квест выполнен!',
                    `+5 монет за запись веса (${weight} кг)`,
                    '💪',
                    '#f87171'
                );
            }
        }

        return { success: true };
    }

    // Установка цели по весу
    function setWeightGoal(weight) {
        state.weightGoal = weight;
        saveState();
        renderBody();
        return { success: true };
    }

    // Установка роста
    function setHeight(height) {
        state.height = height;
        saveState();
        renderBody();
        return { success: true };
    }

    // Расчет ИМТ
    function calculateBMI(weight, height) {
        if (!height || !weight) return null;
        const heightM = height / 100;
        return weight / (heightM * heightM);
    }

    // Получение статуса ИМТ
    function getBMIStatus(bmi) {
        if (!bmi) return 'Нет данных';
        if (bmi < 18.5) return 'Недостаточный вес';
        if (bmi < 25) return 'Нормальный вес';
        if (bmi < 30) return 'Избыточный вес';
        if (bmi < 35) return 'Ожирение I степени';
        if (bmi < 40) return 'Ожирение II степени';
        return 'Ожирение III степени';
    }

    // Логирование тренировки
    function logWorkout(date) {
        const dateStr = date || new Date().toISOString().split('T')[0];
        state.workouts[dateStr] = true;
        state.lastWorkoutDate = dateStr;
        
        saveState();
        renderBody();

        // Начисляем монеты за тренировку
        if (typeof CoinsAPI !== 'undefined') {
            const result = CoinsAPI.addCoins(10, 'Тело');
            if (result.success && typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '🏋️ Мини-квест выполнен!',
                    `+10 монет за тренировку!`,
                    '🏋️',
                    '#f87171'
                );
            }
        }

        return { success: true };
    }

    // Получение количества тренировок за неделю
    function getWorkoutsThisWeek() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = воскресенье
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        
        let count = 0;
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            if (state.workouts[dateStr]) count++;
        }
        
        return count;
    }

    // Рендер тела
    function renderBody() {
        renderWeightChart();
        renderWorkoutCalendar();
        updateBMI();
        updateWorkoutStats();
    }

    // Обновление ИМТ
    function updateBMI() {
        const bmiEl = document.getElementById('bmiValue');
        const goalEl = document.getElementById('weightGoal');
        
        if (state.weights.length === 0) {
            if (bmiEl) bmiEl.textContent = '—';
            if (goalEl) goalEl.textContent = '—';
            return;
        }

        const latest = state.weights[state.weights.length - 1];
        const bmi = calculateBMI(latest.weight, state.height);
        
        if (bmiEl) {
            if (bmi) {
                const status = getBMIStatus(bmi);
                bmiEl.textContent = `${bmi.toFixed(1)} (${status})`;
            } else {
                bmiEl.textContent = 'Укажите рост';
            }
        }
        
        if (goalEl) {
            goalEl.textContent = state.weightGoal ? `${state.weightGoal} кг` : 'Не установлена';
        }
    }

    // Рендер графика веса
    function renderWeightChart() {
        const svg = document.getElementById('weightChartSvg');
        if (!svg) return;

        if (state.weights.length === 0) {
            svg.innerHTML = `
                <text x="200" y="75" text-anchor="middle" fill="#444" font-size="12">Нет данных о весе</text>
            `;
            return;
        }

        const width = 400;
        const height = 150;
        const padding = 30;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const weights = state.weights.slice(-30); // Последние 30 записей
        const minWeight = Math.max(0, Math.min(...weights.map(w => w.weight)) - 5);
        const maxWeight = Math.max(...weights.map(w => w.weight)) + 5;
        const range = maxWeight - minWeight || 1;

        let points = '';
        let labels = '';

        weights.forEach((w, i) => {
            const x = padding + (i / (weights.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((w.weight - minWeight) / range) * chartHeight;
            points += `${x},${y} `;
            
            if (i % Math.max(1, Math.floor(weights.length / 8)) === 0 || i === weights.length - 1) {
                labels += `
                    <text x="${x}" y="${height - 2}" text-anchor="middle" fill="#444" font-size="7">
                        ${w.date.slice(5)}
                    </text>
                `;
            }
        });

        // Линия цели
        let goalLine = '';
        if (state.weightGoal) {
            const goalY = padding + chartHeight - ((state.weightGoal - minWeight) / range) * chartHeight;
            goalLine = `
                <line x1="${padding}" y1="${goalY}" x2="${width - padding}" y2="${goalY}" 
                      stroke="#facc15" stroke-width="1.5" stroke-dasharray="4,4"/>
                <text x="${width - padding - 5}" y="${goalY - 5}" text-anchor="end" fill="#facc15" font-size="8">
                    Цель: ${state.weightGoal} кг
                </text>
            `;
        }

        const svgContent = `
            <!-- Оси -->
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            
            <!-- Линия веса -->
            <polyline points="${points}" fill="none" stroke="#6c8aff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Точки -->
            ${weights.map((w, i) => {
                const x = padding + (i / (weights.length - 1)) * chartWidth;
                const y = padding + chartHeight - ((w.weight - minWeight) / range) * chartHeight;
                return `<circle cx="${x}" cy="${y}" r="3" fill="#6c8aff"/>`;
            }).join('')}
            
            <!-- Метки -->
            ${labels}
            
            <!-- Линия цели -->
            ${goalLine}
            
            <!-- Минимальное значение -->
            <text x="${padding - 5}" y="${padding + chartHeight}" text-anchor="end" fill="#444" font-size="8">
                ${minWeight.toFixed(1)}
            </text>
            <text x="${padding - 5}" y="${padding}" text-anchor="end" fill="#444" font-size="8">
                ${maxWeight.toFixed(1)}
            </text>
        `;

        svg.innerHTML = svgContent;
    }

    // Рендер календаря тренировок
    function renderWorkoutCalendar() {
        const container = document.getElementById('workoutCalendar');
        if (!container) return;

        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startDay = firstDay.getDay() || 7; // 1 = понедельник

        let html = `
            <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; margin-top: 12px;">
                <div style="color: #444; font-size: 0.6rem; text-align: center; text-transform: uppercase; padding: 2px;">Пн</div>
                <div style="color: #444; font-size: 0.6rem; text-align: center; text-transform: uppercase; padding: 2px;">Вт</div>
                <div style="color: #444; font-size: 0.6rem; text-align: center; text-transform: uppercase; padding: 2px;">Ср</div>
                <div style="color: #444; font-size: 0.6rem; text-align: center; text-transform: uppercase; padding: 2px;">Чт</div>
                <div style="color: #444; font-size: 0.6rem; text-align: center; text-transform: uppercase; padding: 2px;">Пт</div>
                <div style="color: #444; font-size: 0.6rem; text-align: center; text-transform: uppercase; padding: 2px;">Сб</div>
                <div style="color: #444; font-size: 0.6rem; text-align: center; text-transform: uppercase; padding: 2px;">Вс</div>
        `;

        for (let i = 1; i < startDay; i++) {
            html += `<div style="aspect-ratio: 1;"></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isWorkout = state.workouts[dateStr] || false;
            const isToday = date.toDateString() === today.toDateString();

            html += `
                <div style="
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.75rem;
                    color: ${isWorkout ? '#4ade80' : '#444'};
                    background: ${isWorkout ? 'rgba(74,222,128,0.1)' : 'transparent'};
                    border-radius: 4px;
                    border: ${isToday ? '1px solid #6c8aff' : '1px solid transparent'};
                    font-weight: ${isToday ? '500' : '400'};
                    cursor: ${isWorkout ? 'default' : 'pointer'};
                    transition: all 0.15s ease;
                " data-date="${dateStr}">
                    ${day}
                    ${isWorkout ? '✓' : ''}
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        // Добавляем возможность отметить тренировку кликом на день
        container.querySelectorAll('[data-date]').forEach(el => {
            const dateStr = el.dataset.date;
            if (!state.workouts[dateStr]) {
                el.addEventListener('click', () => {
                    logWorkout(dateStr);
                });
            }
        });

        // Обновляем статистику тренировок
        updateWorkoutStats();
    }

    // Обновление статистики тренировок
    function updateWorkoutStats() {
        const workoutsThisWeek = getWorkoutsThisWeek();
        const goal = state.workoutGoal || 3;
        
        const container = document.querySelector('.workout-plan');
        if (container) {
            const label = container.querySelector('label');
            if (label) {
                const progress = Math.min(workoutsThisWeek / goal * 100, 100);
                const color = progress >= 100 ? '#4ade80' : progress >= 70 ? '#facc15' : '#f87171';
                
                label.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                        <span>План: <input type="number" id="workoutGoal" value="${goal}" min="1" max="7" 
                            style="width: 50px; background: #0d0d0d; border: 1px solid rgba(255,255,255,0.08); 
                            border-radius: 4px; padding: 2px 6px; color: #e8e8e8; text-align: center;"> раз/нед</span>
                        <span style="color: ${color};">${workoutsThisWeek} / ${goal}</span>
                    </div>
                    <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-top: 4px;">
                        <div style="width: ${progress}%; height: 100%; background: ${color}; border-radius: 2px; transition: width 0.3s ease;"></div>
                    </div>
                `;
                
                // Обработчик изменения цели
                const input = label.querySelector('#workoutGoal');
                if (input) {
                    input.addEventListener('change', () => {
                        state.workoutGoal = parseInt(input.value) || 3;
                        saveState();
                        updateWorkoutStats();
                    });
                }
            }
        }
    }

    // Настройка событий
    function setupBodyEvents() {
        // Добавление веса
        const addBtn = document.getElementById('addWeightBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                const weightInput = document.getElementById('weightInput');
                const heightInput = document.getElementById('heightInput');
                
                if (weightInput) {
                    const weight = parseFloat(weightInput.value);
                    if (weight && weight > 0) {
                        addWeight(weight);
                        weightInput.value = '';
                        
                        // Если есть рост, сохраняем
                        if (heightInput) {
                            const height = parseFloat(heightInput.value);
                            if (height && height > 0) {
                                setHeight(height);
                            }
                        }
                    } else {
                        if (typeof QuestNet !== 'undefined') {
                            QuestNet.showNotification(
                                '❌ Ошибка',
                                'Введите корректный вес',
                                '❌',
                                '#f87171'
                            );
                        }
                    }
                }
            });
        }

        // Логирование тренировки
        const logBtn = document.getElementById('logWorkoutBtn');
        if (logBtn) {
            logBtn.addEventListener('click', () => {
                logWorkout();
            });
        }

        // Weight input enter
        const weightInput = document.getElementById('weightInput');
        if (weightInput) {
            weightInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') addBtn.click();
            });
        }
    }

    // Экспорт API
    window.BodyAPI = {
        getState: () => state,
        addWeight,
        setWeightGoal,
        setHeight,
        logWorkout,
        getWorkoutsThisWeek,
        calculateBMI,
        getBMIStatus,
        renderBody
    };

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBody);
    } else {
        initBody();
    }

})();