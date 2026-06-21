// QuestNet — Главный модуль приложения

(function() {
    'use strict';

    // Состояние приложения
    const state = {
        currentSection: 'quests',
        coins: 0,
        tokens: 0,
        streak: 0,
        lastActivityDate: null,
        dailyQuests: 0,
        lastDailyReset: null
    };

    // DOM элементы
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const sectionTitle = document.getElementById('sectionTitle');
    const coinBalance = document.getElementById('coinBalance');
    const tokenBalance = document.getElementById('tokenBalance');

    // Инициализация
    function init() {
        loadState();
        setupNavigation();
        setupRadar();
        updateUI();
        checkDailyReset();
        showOnboarding();
        setupGlobalEvents();
        setupPomodoroButton();
        
        // Инициализация модулей
        if (typeof initCanvas === 'function') initCanvas();
        if (typeof initShop === 'function') initShop();
        if (typeof initPomodoro === 'function') initPomodoro();
        if (typeof initFinance === 'function') initFinance();
        if (typeof initBody === 'function') initBody();
        if (typeof initHabits === 'function') initHabits();
        
        // Запускаем майнинг токенов
        startTokenMining();
        
        // Обновляем стрик
        updateStreakDisplay();
        
        console.log('🚀 QuestNet fully initialized');
    }

    // Навигация
    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                navigateTo(section);
            });
        });
    }

    function navigateTo(section) {
        // Обновляем активный пункт меню
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        // Показываем нужную секцию
        sections.forEach(sec => {
            sec.classList.toggle('active', sec.id === `section-${section}`);
        });

        // Обновляем заголовок
        const sectionNames = {
            quests: 'Квесты',
            path: 'Путь',
            calendar: 'Календарь',
            finance: 'Финансы',
            body: 'Тело',
            habits: 'Привычки',
            shop: 'Магазин',
            wallet: 'Кошелёк'
        };
        sectionTitle.textContent = sectionNames[section] || section;

        state.currentSection = section;
        saveState();

        // Обновляем контент при переходе
        if (section === 'calendar' && typeof renderCalendar === 'function') {
            renderCalendar();
        }
        if (section === 'path' && typeof renderMountain === 'function') {
            renderMountain();
        }
        if (section === 'shop' && typeof ShopAPI !== 'undefined' && ShopAPI.renderShop) {
            ShopAPI.renderShop();
        }
        if (section === 'finance' && typeof FinanceAPI !== 'undefined' && FinanceAPI.renderFinance) {
            FinanceAPI.renderFinance();
        }
        if (section === 'body' && typeof BodyAPI !== 'undefined' && BodyAPI.renderBody) {
            BodyAPI.renderBody();
        }
        if (section === 'habits' && typeof HabitsAPI !== 'undefined' && HabitsAPI.renderHabits) {
            HabitsAPI.renderHabits();
        }
        if (section === 'wallet') {
            renderWallet();
        }
    }

    // Радар баланса сфер
    function setupRadar() {
        const svg = document.getElementById('radarSvg');
        if (!svg) return;
        renderRadar(svg);
        // Обновляем радар каждые 30 секунд
        setInterval(() => renderRadar(svg), 30000);
    }

    function renderRadar(svg) {
        const spheres = [
            { name: 'Тело', color: '#f87171' },
            { name: 'Разум', color: '#6c8aff' },
            { name: 'Финансы', color: '#facc15' },
            { name: 'Работа', color: '#fb923c' },
            { name: 'Отношения', color: '#f472b6' },
            { name: 'Среда', color: '#a78bfa' },
            { name: 'Дух', color: '#4ade80' }
        ];

        const cx = 50, cy = 50, r = 38;
        const count = spheres.length;
        const angleStep = (2 * Math.PI) / count;
        
        let svgContent = '';
        
        // Фоновые окружности
        for (let ring = 1; ring <= 3; ring++) {
            const radius = (r / 3) * ring;
            svgContent += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>`;
        }

        // Оси
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI/2 + i * angleStep;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            svgContent += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>`;
        }

        // Паутина (активность)
        const activity = getSphereActivity();
        let points = '';
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI/2 + i * angleStep;
            const value = Math.min(activity[i] || 0, 1);
            const radius = r * (0.1 + 0.9 * value);
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            points += `${x},${y} `;
        }
        
        if (points) {
            svgContent += `<polygon points="${points}" fill="rgba(108,138,255,0.15)" stroke="#6c8aff" stroke-width="1.5"/>`;
        }

        // Точки на осях
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI/2 + i * angleStep;
            const value = Math.min(activity[i] || 0, 1);
            const radius = r * (0.1 + 0.9 * value);
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            svgContent += `<circle cx="${x}" cy="${y}" r="1.5" fill="${spheres[i].color}"/>`;
        }

        // Подписи сфер (снаружи)
        for (let i = 0; i < count; i++) {
            const angle = -Math.PI/2 + i * angleStep;
            const labelR = r + 12;
            const x = cx + labelR * Math.cos(angle);
            const y = cy + labelR * Math.sin(angle);
            const emoji = getSphereEmoji(i);
            svgContent += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" font-size="6" fill="#666">${emoji}</text>`;
        }

        svg.innerHTML = svgContent;
    }

    function getSphereActivity() {
        // Получаем данные из localStorage или возвращаем демо
        const stored = localStorage.getItem('questnet_sphereActivity');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {}
        }
        
        // Пытаемся получить реальные данные из квестов
        if (typeof CanvasAPI !== 'undefined') {
            const quests = CanvasAPI.getQuests();
            if (quests && quests.length > 0) {
                const spheres = ['Тело', 'Разум', 'Финансы', 'Работа', 'Отношения', 'Среда', 'Дух'];
                const activity = spheres.map(s => {
                    const completed = quests.filter(q => q.sphere === s && q.completed);
                    const total = quests.filter(q => q.sphere === s);
                    return total.length > 0 ? Math.min(completed.length / total.length, 1) : 0.1;
                });
                return activity;
            }
        }
        
        // Демо данные
        return [0.6, 0.8, 0.4, 0.7, 0.3, 0.5, 0.9];
    }

    function getSphereEmoji(index) {
        const emojis = ['💪', '🧠', '💰', '💼', '💕', '🏠', '✨'];
        return emojis[index] || '•';
    }

    // Обновление UI
    function updateUI() {
        if (coinBalance) coinBalance.textContent = Math.round(state.coins);
        if (tokenBalance) tokenBalance.textContent = Math.round(state.tokens * 100) / 100;
        const streakEl = document.getElementById('streakCount');
        if (streakEl) streakEl.textContent = state.streak;
    }

    // Сохранение состояния
    function saveState() {
        try {
            localStorage.setItem('questnet_state', JSON.stringify(state));
        } catch (e) {}
    }

    function loadState() {
        try {
            const stored = localStorage.getItem('questnet_state');
            if (stored) {
                const parsed = JSON.parse(stored);
                Object.assign(state, parsed);
            }
        } catch (e) {}
        
        checkDailyReset();
    }

    function checkDailyReset() {
        const today = new Date().toDateString();
        if (state.lastDailyReset !== today) {
            state.dailyQuests = 0;
            state.lastDailyReset = today;
            saveState();
        }
    }

    // Обновление стрика
    function updateStreakDisplay() {
        let streak = state.streak;
        
        // Проверяем стрик из привычек
        if (typeof HabitsAPI !== 'undefined') {
            const habitStreak = HabitsAPI.getHabitStreak();
            if (habitStreak > streak) {
                streak = habitStreak;
            }
        }
        
        const streakEl = document.getElementById('streakCount');
        if (streakEl) streakEl.textContent = streak;
        
        // Сохраняем обновленный стрик
        if (streak > state.streak) {
            state.streak = streak;
            saveState();
        }
    }

    // Глобальные события
    function setupGlobalEvents() {
        // Обновление стрика при любой активности
        document.addEventListener('activity', () => {
            updateStreakDisplay();
        });
    }

    // Кнопка помодоро
    function setupPomodoroButton() {
        const btn = document.getElementById('pomodoroBtn');
        if (!btn) return;
        
        btn.addEventListener('click', () => {
            if (typeof PomodoroAPI !== 'undefined') {
                if (PomodoroAPI.isRunning()) {
                    PomodoroAPI.stopTimer();
                } else {
                    // Если нет задачи, показываем выбор
                    if (typeof showTaskSelection === 'function') {
                        showTaskSelection();
                    } else {
                        // Просто запускаем помодоро
                        PomodoroAPI.startTimer();
                    }
                }
            }
        });
    }

    // Онбординг
    function showOnboarding() {
        if (localStorage.getItem('questnet_onboarding_done')) return;
        
        const steps = [
            {
                title: '7 сфер жизни',
                description: 'Тело, Разум, Финансы, Работа, Отношения, Среда, Дух — каждая сфера имеет свои квесты и цвет. Развивайся гармонично!'
            },
            {
                title: 'Монеты и баланс сфер',
                description: 'Выполняй квесты, получай монеты. Чем разнообразнее твои квесты, тем больше бонусов. Баланс сфер показывает твою активность.'
            },
            {
                title: 'Магазин артефактов',
                description: 'Покупай артефакты за монеты. Они пассивно майнят токены, которые скоро будут доступны на DEX. Инвестируй в своё развитие!'
            },
            {
                title: 'Геймификация продуктивности',
                description: 'Исследования показывают, что геймификация повышает продуктивность на 30-50%. Сделай свою жизнь увлекательным квестом!',
                link: 'https://www.researchgate.net/publication/273945539'
            }
        ];

        let step = 0;
        
        function showStep() {
            const s = steps[step];
            const overlay = document.createElement('div');
            overlay.className = 'onboarding-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.85);
                backdrop-filter: blur(12px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            `;
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: #111114;
                border: 1px solid rgba(255,255,255,0.06);
                border-radius: 16px;
                padding: 40px;
                max-width: 480px;
                width: 90%;
                text-align: center;
            `;
            
            modal.innerHTML = `
                <div style="color: #666; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px;">
                    ${step + 1} / ${steps.length}
                </div>
                <h2 style="font-size: 1.5rem; font-weight: 500; color: #e8e8e8; margin-bottom: 12px;">
                    ${s.title}
                </h2>
                <p style="color: #aaa; font-size: 0.95rem; line-height: 1.6; margin-bottom: 16px;">
                    ${s.description}
                </p>
                ${s.link ? `
                    <a href="${s.link}" target="_blank" style="
                        display: inline-block;
                        color: #6c8aff;
                        font-size: 0.85rem;
                        text-decoration: none;
                        margin-bottom: 20px;
                        padding: 6px 12px;
                        border: 1px solid rgba(108,138,255,0.2);
                        border-radius: 6px;
                        transition: all 0.15s ease;
                    " onmouseenter="this.style.borderColor='rgba(108,138,255,0.4)'" onmouseleave="this.style.borderColor='rgba(108,138,255,0.2)'">
                        📄 Исследование →
                    </a>
                ` : ''}
                <div style="display: flex; gap: 10px; justify-content: center;">
                    ${step > 0 ? `
                        <button class="btn-secondary" id="onboardingPrev" style="padding: 10px 24px;">
                            Назад
                        </button>
                    ` : ''}
                    <button class="btn-primary" id="onboardingNext" style="padding: 10px 32px;">
                        ${step === steps.length - 1 ? '🚀 Начать' : 'Далее →'}
                    </button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            const nextBtn = document.getElementById('onboardingNext');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    overlay.remove();
                    step++;
                    if (step < steps.length) {
                        showStep();
                    } else {
                        localStorage.setItem('questnet_onboarding_done', 'true');
                        if (typeof QuestNet !== 'undefined') {
                            QuestNet.showNotification(
                                '🎯 Добро пожаловать в QuestNet!',
                                'Начинай свой путь к вершине!',
                                '🎯',
                                '#4ade80'
                            );
                        }
                    }
                });
            }
            
            const prevBtn = document.getElementById('onboardingPrev');
            if (prevBtn) {
                prevBtn.addEventListener('click', () => {
                    overlay.remove();
                    step--;
                    showStep();
                });
            }
            
            // Закрытие по клику вне модалки
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    localStorage.setItem('questnet_onboarding_done', 'true');
                }
            });
        }
        
        showStep();
    }

    // Майнинг токенов
    function startTokenMining() {
        // Проверяем каждые 5 секунд
        setInterval(() => {
            let miningRate = 0;
            
            if (typeof ShopAPI !== 'undefined') {
                miningRate = ShopAPI.getMiningRate();
            }
            
            if (miningRate > 0) {
                // Майним токены пропорционально времени (в час / 720 = за 5 сек)
                const tokensEarned = miningRate / 720;
                state.tokens += tokensEarned;
                updateUI();
                saveState();
            }
        }, 5000);
    }

    // Рендер кошелька
    function renderWallet() {
        const balanceEl = document.getElementById('walletTokenBalance');
        const artifactsList = document.getElementById('activeArtifactsList');
        
        if (balanceEl) {
            balanceEl.textContent = `${Math.round(state.tokens * 100) / 100} 💎`;
        }
        
        // Рендер активных артефактов
        if (artifactsList && typeof ShopAPI !== 'undefined') {
            const artifacts = ShopAPI.getActiveArtifacts();
            
            if (artifacts.length === 0) {
                artifactsList.innerHTML = `
                    <div style="color: #666; font-size: 0.85rem; padding: 12px 0;">
                        Нет активных артефактов. Посети магазин!
                    </div>
                `;
            } else {
                artifactsList.innerHTML = artifacts.map(a => `
                    <div class="card" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 6px;">
                        <span style="font-size: 1.5rem;">${a.emoji}</span>
                        <div style="flex: 1;">
                            <div style="color: #e8e8e8; font-weight: 500; font-size: 0.9rem;">${a.name}</div>
                            <div style="color: #666; font-size: 0.75rem;">${a.sphere} • ${a.rate} токен/час</div>
                        </div>
                        <div style="color: #4ade80; font-size: 0.8rem;">⚡ активен</div>
                    </div>
                `).join('');
            }
        }
        
        // Рендер графика токенов
        renderTokenChart();
    }

    // Рендер графика токенов
    function renderTokenChart() {
        const svg = document.getElementById('tokenChartSvg');
        if (!svg) return;
        
        // Получаем историю токенов из localStorage
        let history = [];
        try {
            const stored = localStorage.getItem('questnet_token_history');
            if (stored) {
                history = JSON.parse(stored);
            }
        } catch (e) {}
        
        // Если нет истории, создаем демо
        if (history.length === 0) {
            history = Array.from({ length: 30 }, (_, i) => ({
                day: i + 1,
                value: Math.random() * 10 + 5
            }));
        }
        
        const width = 500;
        const height = 200;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const maxValue = Math.max(...history.map(h => h.value), 10);
        const step = Math.max(1, Math.floor(history.length / 15));
        
        let points = '';
        let labels = '';
        
        history.forEach((h, i) => {
            const x = padding + (i / (history.length - 1)) * chartWidth;
            const y = padding + chartHeight - (h.value / maxValue) * chartHeight;
            points += `${x},${y} `;
            
            if (i % step === 0 || i === history.length - 1) {
                labels += `
                    <text x="${x}" y="${height - 5}" text-anchor="middle" fill="#444" font-size="8">
                        ${h.day}
                    </text>
                `;
            }
        });
        
        const svgContent = `
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            
            <polyline points="${points}" fill="none" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <polygon points="${padding},${padding + chartHeight} ${points} ${padding + chartWidth},${padding + chartHeight}" fill="rgba(250,204,21,0.05)"/>
            
            ${labels}
            
            <text x="${padding - 5}" y="${padding}" text-anchor="end" fill="#444" font-size="8">${Math.round(maxValue)}</text>
            <text x="${padding - 5}" y="${height - padding}" text-anchor="end" fill="#444" font-size="8">0</text>
            
            <text x="${width - 100}" y="15" fill="#facc15" font-size="9">💎 Токены</text>
        `;
        
        svg.innerHTML = svgContent;
    }

    // Публичное API
    window.QuestNet = {
        state: state,
        updateUI: updateUI,
        saveState: saveState,
        navigateTo: navigateTo,
        addCoins: function(amount) {
            state.coins += amount;
            updateUI();
            saveState();
            document.dispatchEvent(new Event('activity'));
            // Сохраняем активность для стрика
            updateStreakDisplay();
        },
        addTokens: function(amount) {
            state.tokens += amount;
            updateUI();
            saveState();
            // Сохраняем историю токенов
            try {
                let history = JSON.parse(localStorage.getItem('questnet_token_history') || '[]');
                const today = new Date().toISOString().split('T')[0];
                const existing = history.find(h => h.date === today);
                if (existing) {
                    existing.value += amount;
                } else {
                    history.push({ date: today, value: amount });
                }
                if (history.length > 90) history = history.slice(-90);
                localStorage.setItem('questnet_token_history', JSON.stringify(history));
            } catch (e) {}
        },
        getState: function() {
            return state;
        },
        showNotification: function(title, text, icon = '📌', color = '#6c8aff') {
            const container = document.getElementById('notificationContainer');
            if (!container) return;
            
            const notif = document.createElement('div');
            notif.className = 'notification';
            notif.style.cssText = `
                background: #1a1a1e;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px;
                padding: 12px 16px;
                color: #e8e8e8;
                font-size: 0.85rem;
                pointer-events: all;
                animation: slideUp 0.2s ease;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 8px;
                min-width: 280px;
                max-width: 420px;
            `;
            
            notif.innerHTML = `
                <div class="notif-icon" style="font-size: 1.2rem; flex-shrink: 0;">${icon}</div>
                <div class="notif-content" style="flex: 1;">
                    <div class="notif-title" style="font-weight: 500; margin-bottom: 2px;">${title}</div>
                    <div class="notif-text" style="color: #aaa; font-size: 0.8rem; line-height: 1.4;">${text}</div>
                </div>
                <div class="notif-border" style="width: 3px; border-radius: 4px; flex-shrink: 0; align-self: stretch; background: ${color};"></div>
            `;
            
            container.appendChild(notif);
            
            setTimeout(() => {
                notif.style.opacity = '0';
                notif.style.transform = 'translateY(-8px)';
                notif.style.transition = 'all 0.3s ease';
                setTimeout(() => notif.remove(), 300);
            }, 4000);
        },
        updateStreakDisplay: updateStreakDisplay
    };

    // Стили для уведомлений и онбординга
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            animation: slideUp 0.2s ease !important;
        }
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes fadeIn {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
        .onboarding-overlay {
            animation: fadeIn 0.3s ease;
        }
        .onboarding-overlay .btn-primary {
            background: #fff;
            color: #0d0d0d;
            border: none;
            border-radius: 8px;
            padding: 10px 32px;
            font-size: 0.85rem;
            font-weight: 500;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .onboarding-overlay .btn-primary:hover {
            opacity: 0.85;
        }
        .onboarding-overlay .btn-secondary {
            background: transparent;
            color: #aaa;
            border: 1px solid rgba(255,255,255,0.12);
            border-radius: 8px;
            padding: 10px 24px;
            font-size: 0.85rem;
            font-weight: 500;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .onboarding-overlay .btn-secondary:hover {
            background: rgba(255,255,255,0.04);
            color: #e8e8e8;
        }
    `;
    document.head.appendChild(style);

    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();