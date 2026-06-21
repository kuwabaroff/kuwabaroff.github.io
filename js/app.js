// QuestNet — Главный модуль приложения

(function() {
    'use strict';

    const state = {
        currentSection: 'path',
        coins: 0,
        tokens: 0,
        streak: 0,
        lastActivityDate: null,
        dailyQuests: 0,
        lastDailyReset: null
    };

    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');
    const sectionTitle = document.getElementById('sectionTitle');

    const sectionNames = {
        'path': 'Путь',
        'quests': 'Квесты',
        'sphere-body': 'Тело',
        'sphere-mind': 'Разум',
        'sphere-finance': 'Финансы',
        'sphere-work': 'Работа',
        'sphere-relations': 'Отношения',
        'sphere-environment': 'Среда',
        'sphere-spirit': 'Дух',
        'pomodoro': 'Помодоро',
        'finance': 'Финансы',
        'body': 'Трекер тела',
        'habits': 'Привычки',
        'shop': 'Магазин',
        'wallet': 'Кошелёк'
    };

    let canvasReady = false;

    function init() {
        console.log('🚀 Starting QuestNet...');
        
        loadState();
        setupNavigation();
        updateUI();
        checkDailyReset();
        showOnboarding();
        setupGlobalEvents();
        setupPomodoroButton();
        setupSphereAddButtons();
        setupQuestButtons();
        
        if (typeof CanvasInit === 'function') {
            console.log('📦 Initializing Canvas...');
            CanvasInit();
            canvasReady = true;
        } else {
            console.warn('CanvasInit not available');
        }
        
        console.log('📦 Initializing modules...');
        if (typeof initShop === 'function') initShop();
        if (typeof initPomodoro === 'function') initPomodoro();
        if (typeof initFinance === 'function') initFinance();
        if (typeof initBody === 'function') initBody();
        if (typeof initHabits === 'function') initHabits();
        
        if (typeof SphereCanvases !== 'undefined') {
            let attempts = 0;
            const maxAttempts = 30;
            const checkInterval = setInterval(() => {
                attempts++;
                if (typeof CanvasAPI !== 'undefined') {
                    clearInterval(checkInterval);
                    console.log('✅ CanvasAPI ready, initializing sphere canvases');
                    SphereCanvases.init();
                    setTimeout(() => {
                        if (SphereCanvases.renderAll) {
                            SphereCanvases.renderAll();
                        }
                    }, 100);
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkInterval);
                    console.warn('CanvasAPI not available after max attempts');
                } else {
                    console.log(`⏳ Waiting for CanvasAPI... (${attempts}/${maxAttempts})`);
                }
            }, 100);
        }
        
        startTokenMining();
        updateStreakDisplay();
        
        if (typeof ShopAPI !== 'undefined' && ShopAPI.renderShop) {
            setTimeout(() => ShopAPI.renderShop(), 300);
        }
        
        // Принудительное обновление UI через 1 секунду
        setTimeout(() => {
            updateUI();
            console.log('🔄 UI updated, coins:', state.coins, 'tokens:', state.tokens);
        }, 1000);
        
        console.log('✅ QuestNet fully initialized');
    }

    // ----- НАВИГАЦИЯ -----
    function setupNavigation() {
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.dataset.section;
                navigateTo(section);
            });
        });
    }

    function navigateTo(section) {
        console.log('📍 Navigating to:', section);
        
        navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        sections.forEach(sec => {
            sec.classList.toggle('active', sec.id === `section-${section}`);
        });

        sectionTitle.textContent = sectionNames[section] || section;
        state.currentSection = section;
        saveState();

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
        
        if (section.startsWith('sphere-')) {
            const sphere = getSphereFromSection(section);
            if (sphere && typeof SphereCanvases !== 'undefined') {
                const canvas = SphereCanvases.getCanvas(sphere);
                if (canvas) {
                    canvas.render();
                }
            }
        }
    }

    function getSphereFromSection(section) {
        const map = {
            'sphere-body': 'Тело',
            'sphere-mind': 'Разум',
            'sphere-finance': 'Финансы',
            'sphere-work': 'Работа',
            'sphere-relations': 'Отношения',
            'sphere-environment': 'Среда',
            'sphere-spirit': 'Дух'
        };
        return map[section] || null;
    }

    // ----- UI ОБНОВЛЕНИЯ -----
    function updateUI() {
        // Получаем элементы каждый раз заново, чтобы быть уверенными
        const coinEl = document.getElementById('coinBalance');
        const tokenEl = document.getElementById('tokenBalance');
        const streakEl = document.getElementById('streakCount');
        
        if (coinEl) {
            coinEl.textContent = Math.round(state.coins);
            console.log('💰 Coins updated:', state.coins);
        } else {
            console.warn('coinBalance element not found');
        }
        
        if (tokenEl) {
            tokenEl.textContent = Math.round(state.tokens * 100) / 100;
        }
        
        if (streakEl) {
            streakEl.textContent = state.streak;
        }
    }

    // ----- КНОПКИ КВЕСТОВ -----
    function setupQuestButtons() {
        const addBtn = document.getElementById('addQuestBtn');
        if (addBtn) {
            addBtn.addEventListener('click', function() {
                console.log('➕ Add quest button clicked');
                if (typeof CanvasAPI !== 'undefined' && CanvasAPI.addQuest) {
                    showMainQuestForm();
                } else {
                    console.warn('CanvasAPI not ready');
                }
            });
        }

        const linkBtn = document.getElementById('linkModeBtn');
        if (linkBtn) {
            linkBtn.addEventListener('click', function() {
                console.log('🔗 Link mode button clicked');
                if (typeof CanvasAPI !== 'undefined') {
                    const state = CanvasAPI.getState();
                    state.linkMode = !state.linkMode;
                    if (!state.linkMode) state.linkSourceId = null;
                    CanvasAPI.render();
                }
            });
        }
    }

    function showMainQuestForm() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #ffffff;
            border: 1px solid #e8e5de;
            border-radius: 12px;
            padding: 32px;
            max-width: 480px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.06);
        `;
        
        modal.innerHTML = `
            <h3 style="margin-bottom: 20px; font-weight: 500; color: #1a1a1a; font-family: 'Playfair Display', serif; font-size: 1.3rem;">
                Создать квест
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <input type="text" id="mainQuestFormTitle" placeholder="Название" style="width: 100%;">
                <input type="text" id="mainQuestFormEmoji" placeholder="Эмодзи (например, 🏋️)" style="width: 100%;">
                <select id="mainQuestFormSphere" style="width: 100%;">
                    <option value="Тело">💪 Тело</option>
                    <option value="Разум">🧠 Разум</option>
                    <option value="Финансы">💰 Финансы</option>
                    <option value="Работа">💼 Работа</option>
                    <option value="Отношения">💕 Отношения</option>
                    <option value="Среда">🏠 Среда</option>
                    <option value="Дух">✨ Дух</option>
                </select>
                <input type="number" id="mainQuestFormReward" placeholder="Награда (монеты)" value="20" style="width: 100%;">
                <select id="mainQuestFormDifficulty" style="width: 100%;">
                    <option value="easy">Легкая</option>
                    <option value="medium" selected>Средняя</option>
                    <option value="hard">Сложная</option>
                </select>
                <textarea id="mainQuestFormDesc" placeholder="Описание" style="width: 100%; min-height: 80px;"></textarea>
                <div style="display: flex; gap: 10px; margin-top: 8px;">
                    <button class="btn-primary" id="mainQuestFormSubmit" style="flex: 1;">Создать</button>
                    <button class="btn-secondary" id="mainQuestFormCancel">Отмена</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        document.getElementById('mainQuestFormSubmit').addEventListener('click', () => {
            const title = document.getElementById('mainQuestFormTitle').value.trim() || 'Новый квест';
            const emoji = document.getElementById('mainQuestFormEmoji').value.trim() || '❓';
            const sphere = document.getElementById('mainQuestFormSphere').value;
            const reward = parseInt(document.getElementById('mainQuestFormReward').value) || 20;
            const difficulty = document.getElementById('mainQuestFormDifficulty').value;
            const desc = document.getElementById('mainQuestFormDesc').value.trim() || '';
            
            if (typeof CanvasAPI !== 'undefined' && CanvasAPI.addQuest) {
                const x = (Math.random() - 0.5) * 300;
                const y = (Math.random() - 0.5) * 300;
                CanvasAPI.addQuest(title, emoji, sphere, reward, difficulty, x, y, desc);
                
                if (typeof SphereCanvases !== 'undefined') {
                    setTimeout(() => SphereCanvases.renderAll(), 100);
                }
            }
            
            overlay.remove();
        });
        
        document.getElementById('mainQuestFormCancel').addEventListener('click', () => {
            overlay.remove();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    // ----- КНОПКИ ДЛЯ СФЕР -----
    function setupSphereAddButtons() {
        document.querySelectorAll('.sphere-add-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const sphere = this.dataset.sphere;
                console.log('➕ Add quest for sphere:', sphere);
                showQuestFormForSphere(sphere);
            });
        });
    }

    function showQuestFormForSphere(sphere) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(8px);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #ffffff;
            border: 1px solid #e8e5de;
            border-radius: 12px;
            padding: 32px;
            max-width: 480px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 32px rgba(0,0,0,0.06);
        `;
        
        modal.innerHTML = `
            <h3 style="margin-bottom: 20px; font-weight: 500; color: #1a1a1a; font-family: 'Playfair Display', serif; font-size: 1.3rem;">
                Создать квест для «${sphere}»
            </h3>
            <div style="display: flex; flex-direction: column; gap: 12px;">
                <input type="text" id="sphereQuestFormTitle" placeholder="Название" style="width: 100%;">
                <input type="text" id="sphereQuestFormEmoji" placeholder="Эмодзи (например, 🏋️)" style="width: 100%;">
                <input type="number" id="sphereQuestFormReward" placeholder="Награда (монеты)" value="20" style="width: 100%;">
                <select id="sphereQuestFormDifficulty" style="width: 100%;">
                    <option value="easy">Легкая</option>
                    <option value="medium" selected>Средняя</option>
                    <option value="hard">Сложная</option>
                </select>
                <textarea id="sphereQuestFormDesc" placeholder="Описание" style="width: 100%; min-height: 80px;"></textarea>
                <div style="display: flex; gap: 10px; margin-top: 8px;">
                    <button class="btn-primary" id="sphereQuestFormSubmit" style="flex: 1;">Создать</button>
                    <button class="btn-secondary" id="sphereQuestFormCancel">Отмена</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        document.getElementById('sphereQuestFormSubmit').addEventListener('click', () => {
            const title = document.getElementById('sphereQuestFormTitle').value.trim() || 'Новый квест';
            const emoji = document.getElementById('sphereQuestFormEmoji').value.trim() || '❓';
            const reward = parseInt(document.getElementById('sphereQuestFormReward').value) || 20;
            const difficulty = document.getElementById('sphereQuestFormDifficulty').value;
            const desc = document.getElementById('sphereQuestFormDesc').value.trim() || '';
            
            if (typeof CanvasAPI !== 'undefined' && CanvasAPI.addQuest) {
                const x = (Math.random() - 0.5) * 300;
                const y = (Math.random() - 0.5) * 300;
                CanvasAPI.addQuest(title, emoji, sphere, reward, difficulty, x, y, desc);
                
                if (typeof SphereCanvases !== 'undefined') {
                    setTimeout(() => SphereCanvases.renderAll(), 100);
                }
            }
            
            overlay.remove();
        });
        
        document.getElementById('sphereQuestFormCancel').addEventListener('click', () => {
            overlay.remove();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

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

    function updateStreakDisplay() {
        let streak = state.streak;
        
        if (typeof HabitsAPI !== 'undefined') {
            const habitStreak = HabitsAPI.getHabitStreak();
            if (habitStreak > streak) {
                streak = habitStreak;
            }
        }
        
        const streakEl = document.getElementById('streakCount');
        if (streakEl) streakEl.textContent = streak;
        
        if (streak > state.streak) {
            state.streak = streak;
            saveState();
        }
    }

    function setupGlobalEvents() {
        document.addEventListener('activity', () => {
            updateStreakDisplay();
            if (typeof SphereCanvases !== 'undefined' && SphereCanvases.renderAll) {
                SphereCanvases.renderAll();
            }
        });
    }

    // ----- ПОМОДОРО (только в отдельной вкладке) -----
    function setupPomodoroButton() {
        // Кнопка в верхней панели больше не нужна, удаляем её
        const topbarBtn = document.getElementById('pomodoroBtn');
        if (topbarBtn) {
            topbarBtn.style.display = 'none';
        }
        
        // Кнопки в разделе помодоро
        const startBtn = document.getElementById('pomodoroStartBtn');
        const stopBtn = document.getElementById('pomodoroStopBtn');
        const resetBtn = document.getElementById('pomodoroResetBtn');
        const timeDisplay = document.getElementById('pomodoroTime');
        const phaseDisplay = document.getElementById('pomodoroPhase');
        const sessionsDisplay = document.getElementById('pomodoroSessions');
        
        if (startBtn) {
            startBtn.addEventListener('click', function() {
                console.log('⏱️ Pomodoro start');
                if (typeof PomodoroAPI !== 'undefined') {
                    PomodoroAPI.startTimer();
                    updatePomodoroDisplay();
                }
            });
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                console.log('⏱️ Pomodoro stop');
                if (typeof PomodoroAPI !== 'undefined') {
                    PomodoroAPI.stopTimer();
                    updatePomodoroDisplay();
                }
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                console.log('⏱️ Pomodoro reset');
                if (typeof PomodoroAPI !== 'undefined') {
                    PomodoroAPI.stopTimer();
                    // Сброс состояния помодоро
                    const state = PomodoroAPI.getState();
                    state.timeLeft = 25 * 60;
                    state.totalSeconds = 25 * 60;
                    state.isWork = true;
                    state.sessionsCompleted = 0;
                    if (typeof PomodoroAPI.saveState === 'function') {
                        PomodoroAPI.saveState();
                    }
                    updatePomodoroDisplay();
                }
            });
        }
        
        // Обновление дисплея каждую секунду
        setInterval(() => {
            if (typeof PomodoroAPI !== 'undefined') {
                updatePomodoroDisplay();
            }
        }, 1000);
    }

    function updatePomodoroDisplay() {
        if (typeof PomodoroAPI === 'undefined') return;
        
        const timeDisplay = document.getElementById('pomodoroTime');
        const phaseDisplay = document.getElementById('pomodoroPhase');
        const sessionsDisplay = document.getElementById('pomodoroSessions');
        const state = PomodoroAPI.getState();
        
        if (timeDisplay) {
            const mins = Math.floor(state.timeLeft / 60);
            const secs = state.timeLeft % 60;
            timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        
        if (phaseDisplay) {
            phaseDisplay.textContent = state.isWork ? 'Работа' : 'Отдых';
            phaseDisplay.style.color = state.isWork ? '#1a1a1a' : '#4ade80';
        }
        
        if (sessionsDisplay) {
            sessionsDisplay.textContent = state.sessionsCompleted || 0;
        }
    }

    // ----- ОНБОРДИНГ -----
    function showOnboarding() {
        if (localStorage.getItem('questnet_onboarding_done')) return;
        
        const steps = [
            {
                title: '7 сфер жизни',
                description: 'Тело, Разум, Финансы, Работа, Отношения, Среда, Дух — каждая сфера имеет свои квесты. Развивайся гармонично!'
            },
            {
                title: 'Монеты и баланс сфер',
                description: 'Выполняй квесты, получай монеты. Чем разнообразнее твои квесты, тем больше бонусов.'
            },
            {
                title: 'Магазин артефактов',
                description: 'Покупай артефакты за монеты. Они пассивно майнят токены, которые скоро будут доступны на DEX.'
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
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255,255,255,0.92);
                backdrop-filter: blur(12px);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: fadeIn 0.3s ease;
            `;
            
            const modal = document.createElement('div');
            modal.style.cssText = `
                background: #ffffff;
                border: 1px solid #e8e5de;
                border-radius: 12px;
                padding: 40px;
                max-width: 480px;
                width: 90%;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0,0,0,0.04);
            `;
            
            modal.innerHTML = `
                <div style="color: #9b9b9b; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; font-family: 'Inter', sans-serif;">
                    ${step + 1} / ${steps.length}
                </div>
                <h2 style="font-size: 1.5rem; font-weight: 500; color: #1a1a1a; margin-bottom: 12px; font-family: 'Playfair Display', serif;">
                    ${s.title}
                </h2>
                <p style="color: #6b6b6b; font-size: 0.95rem; line-height: 1.6; margin-bottom: 16px; font-family: 'Inter', sans-serif;">
                    ${s.description}
                </p>
                ${s.link ? `
                    <a href="${s.link}" target="_blank" style="
                        display: inline-block;
                        color: #1a1a1a;
                        font-size: 0.85rem;
                        text-decoration: none;
                        margin-bottom: 20px;
                        padding: 6px 12px;
                        border: 1px solid #e8e5de;
                        border-radius: 4px;
                        transition: all 0.15s ease;
                        font-family: 'Inter', sans-serif;
                    " onmouseenter="this.style.borderColor='#1a1a1a'" onmouseleave="this.style.borderColor='#e8e5de'">
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
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    localStorage.setItem('questnet_onboarding_done', 'true');
                }
            });
        }
        
        showStep();
    }

    // ----- МАЙНИНГ ТОКЕНОВ -----
    function startTokenMining() {
        setInterval(() => {
            let miningRate = 0;
            
            if (typeof ShopAPI !== 'undefined') {
                miningRate = ShopAPI.getMiningRate();
            }
            
            if (miningRate > 0) {
                const tokensEarned = miningRate / 720;
                state.tokens += tokensEarned;
                updateUI();
                saveState();
            }
        }, 5000);
    }

    // ----- КОШЕЛЁК -----
    function renderWallet() {
        const balanceEl = document.getElementById('walletTokenBalance');
        const artifactsList = document.getElementById('activeArtifactsList');
        
        if (balanceEl) {
            balanceEl.textContent = `${Math.round(state.tokens * 100) / 100} 💎`;
        }
        
        if (artifactsList && typeof ShopAPI !== 'undefined') {
            const artifacts = ShopAPI.getActiveArtifacts();
            
            if (artifacts.length === 0) {
                artifactsList.innerHTML = `
                    <div style="color: #9b9b9b; font-size: 0.85rem; padding: 12px 0; font-family: 'Inter', sans-serif;">
                        Нет активных артефактов. Посети магазин!
                    </div>
                `;
            } else {
                artifactsList.innerHTML = artifacts.map(a => `
                    <div class="card" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin-bottom: 6px;">
                        <span style="font-size: 1.5rem;">${a.emoji}</span>
                        <div style="flex: 1;">
                            <div style="color: #1a1a1a; font-weight: 500; font-size: 0.9rem; font-family: 'Playfair Display', serif;">${a.name}</div>
                            <div style="color: #9b9b9b; font-size: 0.75rem; font-family: 'Inter', sans-serif;">${a.sphere} • ${a.rate} токен/час</div>
                        </div>
                        <div style="color: #4ade80; font-size: 0.8rem; font-family: 'Inter', sans-serif;">⚡ активен</div>
                    </div>
                `).join('');
            }
        }
        
        renderTokenChart();
    }

    function renderTokenChart() {
        const svg = document.getElementById('tokenChartSvg');
        if (!svg) return;
        
        let history = [];
        try {
            const stored = localStorage.getItem('questnet_token_history');
            if (stored) {
                history = JSON.parse(stored);
            }
        } catch (e) {}
        
        if (history.length === 0) {
            history = Array.from({ length: 30 }, (_, i) => ({
                day: i + 1,
                value: Math.random() * 5 + 2
            }));
        }
        
        const width = 500;
        const height = 200;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        
        const maxValue = Math.max(...history.map(h => h.value), 5);
        const step = Math.max(1, Math.floor(history.length / 15));
        
        let points = '';
        let labels = '';
        
        history.forEach((h, i) => {
            const x = padding + (i / (history.length - 1)) * chartWidth;
            const y = padding + chartHeight - (h.value / maxValue) * chartHeight;
            points += `${x},${y} `;
            
            if (i % step === 0 || i === history.length - 1) {
                labels += `
                    <text x="${x}" y="${height - 5}" text-anchor="middle" fill="#9b9b9b" font-size="8" font-family="Inter, sans-serif;">
                        ${h.day}
                    </text>
                `;
            }
        });
        
        svg.innerHTML = `
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="#e8e5de" stroke-width="1"/>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#e8e5de" stroke-width="1"/>
            
            <polyline points="${points}" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <polygon points="${padding},${padding + chartHeight} ${points} ${padding + chartWidth},${padding + chartHeight}" fill="rgba(26,26,26,0.04)"/>
            
            ${labels}
            
            <text x="${padding - 5}" y="${padding}" text-anchor="end" fill="#9b9b9b" font-size="8" font-family="Inter, sans-serif;">${Math.round(maxValue)}</text>
            <text x="${padding - 5}" y="${height - padding}" text-anchor="end" fill="#9b9b9b" font-size="8" font-family="Inter, sans-serif;">0</text>
            
            <text x="${width - 100}" y="15" fill="#1a1a1a" font-size="9" font-family="Inter, sans-serif;">💎 Токены</text>
        `;
    }

    // ----- ГЛОБАЛЬНЫЙ API -----
    window.QuestNet = {
        state: state,
        updateUI: updateUI,
        saveState: saveState,
        navigateTo: navigateTo,
        addCoins: function(amount) {
            console.log('💰 Adding coins:', amount, 'current:', state.coins);
            state.coins += amount;
            updateUI();
            saveState();
            document.dispatchEvent(new Event('activity'));
            updateStreakDisplay();
        },
        addTokens: function(amount) {
            state.tokens += amount;
            updateUI();
            saveState();
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
        showNotification: function(title, text, icon = '📌', color = '#1a1a1a') {
            const container = document.getElementById('notificationContainer');
            if (!container) return;
            
            const notif = document.createElement('div');
            notif.className = 'notification';
            notif.style.cssText = `
                background: #ffffff;
                border: 1px solid #e8e5de;
                border-radius: 8px;
                padding: 12px 16px;
                color: #1a1a1a;
                font-size: 0.85rem;
                pointer-events: all;
                animation: slideUp 0.2s ease;
                box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                display: flex;
                align-items: flex-start;
                gap: 10px;
                margin-bottom: 8px;
                min-width: 280px;
                max-width: 420px;
                font-family: 'Inter', sans-serif;
            `;
            
            notif.innerHTML = `
                <div style="font-size: 1.2rem; flex-shrink: 0;">${icon}</div>
                <div style="flex: 1;">
                    <div style="font-weight: 500; margin-bottom: 2px;">${title}</div>
                    <div style="color: #6b6b6b; font-size: 0.8rem; line-height: 1.4;">${text}</div>
                </div>
                <div style="width: 3px; border-radius: 2px; flex-shrink: 0; align-self: stretch; background: ${color};"></div>
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

    // Стили
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
    `;
    document.head.appendChild(style);

    // ЗАПУСК
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();