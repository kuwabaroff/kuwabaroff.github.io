// QuestNet — Canvas квестов (бесконечное полотно)

(function() {
    'use strict';

    const state = {
        quests: [],
        links: [],
        nextId: 1,
        linkMode: false,
        linkSourceId: null,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        dragOffsetX: 0,
        dragOffsetY: 0,
        selectedQuest: null,
        lastCompletedDate: null,
        dailyCompleted: 0,
        dailySphereCount: {}
    };

    // Находим или создаем контейнер
    let container = document.getElementById('questCanvas');
    if (!container) {
        console.warn('Quest canvas container not found, creating one...');
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            container = document.createElement('div');
            container.id = 'questCanvas';
            container.style.cssText = `
                width: 100%;
                height: 100%;
                position: relative;
            `;
            canvasContainer.appendChild(container);
            console.log('✅ Created questCanvas container');
        } else {
            console.error('Could not find .canvas-container');
            return;
        }
    }

    // Создаем элементы canvas
    const worldContainer = document.createElement('div');
    worldContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform-origin: 0 0;
        will-change: transform;
        pointer-events: none;
    `;
    
    const questWorld = document.createElement('div');
    questWorld.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    
    const linksSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    linksSvg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    
    questWorld.appendChild(linksSvg);
    worldContainer.appendChild(questWorld);
    container.appendChild(worldContainer);

    // Сетка
    const gridOverlay = document.createElement('div');
    gridOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        background-image: 
            linear-gradient(rgba(200, 195, 185, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(200, 195, 185, 0.15) 1px, transparent 1px);
        background-size: 50px 50px;
    `;
    container.appendChild(gridOverlay);

    const emptyHint = document.getElementById('emptyCanvasHint');

    const MIN_SCALE = 0.1;
    const MAX_SCALE = 3.0;
    const ZOOM_STEP = 0.1;
    const NODE_SIZE = 72;
    const SPHERE_COLORS = {
        'Тело': '#f87171',
        'Разум': '#6c8aff',
        'Финансы': '#facc15',
        'Работа': '#fb923c',
        'Отношения': '#f472b6',
        'Среда': '#a78bfa',
        'Дух': '#4ade80'
    };
    const SPHERE_ICONS = {
        'Тело': '💪',
        'Разум': '🧠',
        'Финансы': '💰',
        'Работа': '💼',
        'Отношения': '💕',
        'Среда': '🏠',
        'Дух': '✨'
    };

    let initialized = false;

    function initCanvas() {
        if (initialized) return;
        
        loadFromStorage();
        setupCanvasEvents();
        setupToolbarEvents();
        render();
        updateTransform();
        updateEmptyHint();
        
        console.log('🗺️ Canvas initialized with', state.quests.length, 'quests');
        initialized = true;
        
        // Регистрируем CanvasAPI
        window.CanvasAPI = {
            getQuests: () => state.quests,
            getLinks: () => state.links,
            addQuest: addQuest,
            deleteQuest: deleteQuest,
            toggleComplete: toggleComplete,
            getSphereColors: () => SPHERE_COLORS,
            getSphereIcons: () => SPHERE_ICONS,
            render: render,
            getState: () => state,
            saveState: saveToStorage
        };
        console.log('✅ CanvasAPI registered');
        
        // Уведомляем всех, что CanvasAPI готов
        if (typeof window._onCanvasReady === 'function') {
            window._onCanvasReady();
        }
    }

    function setupCanvasEvents() {
        container.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);

        container.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', endDrag);

        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
            setScale(state.scale + delta, e.clientX, e.clientY);
        }, { passive: false });

        questWorld.addEventListener('dblclick', (e) => {
            const node = e.target.closest('.quest-node');
            if (!node) return;
            const id = parseInt(node.dataset.id);
            if (id) toggleComplete(id);
        });

        questWorld.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const node = e.target.closest('.quest-node');
            if (!node) return;
            const id = parseInt(node.dataset.id);
            if (id) {
                if (confirm('Удалить квест?')) {
                    deleteQuest(id);
                }
            }
        });
    }

    function setupToolbarEvents() {
        const linkBtn = document.getElementById('linkModeBtn');
        const addBtn = document.getElementById('addQuestBtn');
        
        if (linkBtn) {
            linkBtn.addEventListener('click', toggleLinkMode);
        }
        
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                showQuestForm();
            });
        }
    }

    function showQuestForm() {
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
                <input type="text" id="questFormTitle" placeholder="Название" style="width: 100%;">
                <input type="text" id="questFormEmoji" placeholder="Эмодзи (например, 🏋️)" style="width: 100%;">
                <select id="questFormSphere" style="width: 100%;">
                    <option value="Тело">💪 Тело</option>
                    <option value="Разум">🧠 Разум</option>
                    <option value="Финансы">💰 Финансы</option>
                    <option value="Работа">💼 Работа</option>
                    <option value="Отношения">💕 Отношения</option>
                    <option value="Среда">🏠 Среда</option>
                    <option value="Дух">✨ Дух</option>
                </select>
                <input type="number" id="questFormReward" placeholder="Награда (монеты)" value="20" style="width: 100%;">
                <select id="questFormDifficulty" style="width: 100%;">
                    <option value="easy">Легкая</option>
                    <option value="medium" selected>Средняя</option>
                    <option value="hard">Сложная</option>
                </select>
                <textarea id="questFormDesc" placeholder="Описание" style="width: 100%; min-height: 80px;"></textarea>
                <div style="display: flex; gap: 10px; margin-top: 8px;">
                    <button class="btn-primary" id="questFormSubmit" style="flex: 1;">Создать</button>
                    <button class="btn-secondary" id="questFormCancel">Отмена</button>
                </div>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        document.getElementById('questFormSubmit').addEventListener('click', () => {
            const title = document.getElementById('questFormTitle').value.trim() || 'Новый квест';
            const emoji = document.getElementById('questFormEmoji').value.trim() || '❓';
            const sphere = document.getElementById('questFormSphere').value;
            const reward = parseInt(document.getElementById('questFormReward').value) || 20;
            const difficulty = document.getElementById('questFormDifficulty').value;
            const desc = document.getElementById('questFormDesc').value.trim() || '';
            
            const rect = container.getBoundingClientRect();
            const cx = (rect.width / 2 - state.offsetX) / state.scale;
            const cy = (rect.height / 2 - state.offsetY) / state.scale;
            const x = cx + (Math.random() - 0.5) * 200;
            const y = cy + (Math.random() - 0.5) * 200;
            
            addQuest(title, emoji, sphere, reward, difficulty, x, y, desc);
            overlay.remove();
        });
        
        document.getElementById('questFormCancel').addEventListener('click', () => {
            overlay.remove();
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
    }

    function addQuest(title, emoji, sphere, reward, difficulty, x, y, description) {
        const quest = {
            id: state.nextId++,
            title: title,
            emoji: emoji || '❓',
            sphere: sphere || 'Разум',
            reward: reward || 20,
            difficulty: difficulty || 'medium',
            description: description || '',
            x: x || 0,
            y: y || 0,
            completed: false,
            createdAt: Date.now(),
            completedAt: null
        };
        
        state.quests.push(quest);
        saveToStorage();
        render();
        updateEmptyHint();
        
        console.log('✅ Quest added:', quest.title, 'to sphere:', quest.sphere);
        
        if (typeof SphereCanvases !== 'undefined') {
            setTimeout(() => SphereCanvases.renderAll(), 50);
        }
        
        return quest.id;
    }

    function deleteQuest(id) {
        const index = state.quests.findIndex(q => q.id === id);
        if (index === -1) return;
        
        const quest = state.quests[index];
        if (quest.completed) {
            if (typeof QuestNet !== 'undefined') {
                QuestNet.addCoins(-quest.reward);
            }
        }
        
        state.quests.splice(index, 1);
        state.links = state.links.filter(l => l.from !== id && l.to !== id);
        saveToStorage();
        render();
        updateEmptyHint();
        
        if (typeof SphereCanvases !== 'undefined') {
            setTimeout(() => SphereCanvases.renderAll(), 50);
        }
    }

    function toggleComplete(id) {
        const quest = state.quests.find(q => q.id === id);
        if (!quest) return;
        
        if (quest.completed) {
            if (typeof QuestNet !== 'undefined') {
                QuestNet.addCoins(-quest.reward);
            }
            quest.completed = false;
            quest.completedAt = null;
            saveToStorage();
            render();
            if (typeof SphereCanvases !== 'undefined') {
                setTimeout(() => SphereCanvases.renderAll(), 50);
            }
            return;
        }
        
        const hoursSinceCreation = (Date.now() - quest.createdAt) / (1000 * 60 * 60);
        if (hoursSinceCreation < 2) {
            if (typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '⏳ Слишком рано',
                    'Квест можно выполнить только через 2 часа после создания',
                    '⏳',
                    '#facc15'
                );
            }
            return;
        }
        
        const today = new Date().toDateString();
        if (state.lastCompletedDate !== today) {
            state.dailyCompleted = 0;
            state.dailySphereCount = {};
            state.lastCompletedDate = today;
        }
        
        if (state.dailyCompleted >= 10) {
            if (typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '📊 Лимит достигнут',
                    'Максимум 10 квестов в день. Отличная работа!',
                    '📊',
                    '#facc15'
                );
            }
            return;
        }
        
        const todayCoins = getTodayCoins();
        if (todayCoins + quest.reward > 150) {
            if (typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '💰 Лимит монет',
                    'Максимум 150 монет в день. Завтра новый день!',
                    '💰',
                    '#facc15'
                );
            }
            return;
        }
        
        quest.completed = true;
        quest.completedAt = Date.now();
        state.dailyCompleted++;
        
        if (!state.dailySphereCount[quest.sphere]) {
            state.dailySphereCount[quest.sphere] = 0;
        }
        state.dailySphereCount[quest.sphere]++;
        
        let reward = quest.reward;
        
        const sphereCount = Object.keys(state.dailySphereCount).length;
        if (sphereCount >= 3) {
            const bonus = Math.floor(reward * 0.2);
            reward += bonus;
            if (typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '🎯 Бонус за разнообразие!',
                    `+${bonus} монет за активность в ${sphereCount} сферах`,
                    '🎯',
                    '#4ade80'
                );
            }
        }
        
        const streak = getStreak();
        if (streak >= 7) {
            reward *= 2;
            if (typeof QuestNet !== 'undefined') {
                QuestNet.showNotification(
                    '🔥 Бонус за стрик!',
                    `x2 награда! Твой стрик: ${streak} дней`,
                    '🔥',
                    '#facc15'
                );
            }
        }
        
        if (typeof QuestNet !== 'undefined') {
            QuestNet.addCoins(reward);
            showQuote(quest.sphere);
        }
        
        updateStreak();
        
        saveToStorage();
        render();
        
        if (typeof SphereCanvases !== 'undefined') {
            setTimeout(() => SphereCanvases.renderAll(), 50);
        }
    }

    function getTodayCoins() {
        const today = new Date().toDateString();
        let total = 0;
        state.quests.forEach(q => {
            if (q.completed && q.completedAt) {
                const date = new Date(q.completedAt).toDateString();
                if (date === today) {
                    total += q.reward;
                }
            }
        });
        return total;
    }

    function getStreak() {
        if (typeof QuestNet !== 'undefined') {
            return QuestNet.state.streak || 0;
        }
        return 0;
    }

    function updateStreak() {
        if (typeof QuestNet !== 'undefined') {
            const today = new Date().toDateString();
            const last = QuestNet.state.lastActivityDate;
            
            if (last === today) {
                return;
            }
            
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            
            if (last === yesterdayStr) {
                QuestNet.state.streak++;
            } else if (last !== today) {
                QuestNet.state.streak = 0;
            }
            
            QuestNet.state.lastActivityDate = today;
            QuestNet.saveState();
            QuestNet.updateUI();
        }
    }

    function showQuote(sphere) {
        if (typeof quotes === 'undefined') return;
        
        const sphereQuotes = quotes[sphere] || quotes['Разум'] || [];
        if (sphereQuotes.length === 0) return;
        
        const quote = sphereQuotes[Math.floor(Math.random() * sphereQuotes.length)];
        const color = SPHERE_COLORS[sphere] || '#6c8aff';
        
        if (typeof QuestNet !== 'undefined') {
            QuestNet.showNotification(
                `📖 ${sphere}`,
                `"${quote}"`,
                '📖',
                color
            );
        }
    }

    function toggleLinkMode() {
        state.linkMode = !state.linkMode;
        if (!state.linkMode) state.linkSourceId = null;
        render();
        updateLinkUI();
    }

    function handleLinkClick(id) {
        if (!state.linkMode) return;
        
        if (state.linkSourceId === null) {
            state.linkSourceId = id;
            render();
            updateLinkUI();
            return;
        }
        
        if (state.linkSourceId === id) {
            state.linkSourceId = null;
            render();
            updateLinkUI();
            return;
        }
        
        const from = state.linkSourceId;
        const to = id;
        const exists = state.links.some(l => 
            (l.from === from && l.to === to) || (l.from === to && l.to === from)
        );
        
        if (!exists) {
            state.links.push({ from, to });
            saveToStorage();
        }
        
        state.linkSourceId = null;
        render();
        updateLinkUI();
    }

    function updateLinkUI() {
        const linkBtn = document.getElementById('linkModeBtn');
        const linkHint = document.querySelector('.link-hint');
        
        if (linkBtn) {
            linkBtn.textContent = state.linkMode ? '🔗 Отменить' : '🔗 Связать';
            linkBtn.style.border = state.linkMode ? '1px solid #1a1a1a' : '';
            linkBtn.style.background = state.linkMode ? '#f7f6f3' : '';
        }
        
        if (linkHint) {
            if (state.linkMode && state.linkSourceId) {
                const source = state.quests.find(q => q.id === state.linkSourceId);
                linkHint.textContent = `Выберите второй квест (источник: ${source ? source.title : '?'})`;
                linkHint.style.display = 'block';
            } else if (state.linkMode) {
                linkHint.textContent = 'Выберите первый квест';
                linkHint.style.display = 'block';
            } else {
                linkHint.style.display = 'none';
            }
        }
    }

    function updateEmptyHint() {
        if (emptyHint) {
            emptyHint.style.display = state.quests.length === 0 ? 'block' : 'none';
        }
    }

    function render() {
        const existingNodes = questWorld.querySelectorAll('.quest-node');
        existingNodes.forEach(el => el.remove());
        
        state.quests.forEach(q => {
            const node = document.createElement('div');
            node.className = `quest-node${q.completed ? ' completed' : ''}`;
            node.dataset.id = q.id;
            node.style.cssText = `
                position: absolute;
                left: ${q.x}px;
                top: ${q.y}px;
                transform: translate(-50%, -50%);
                pointer-events: all;
                cursor: ${state.linkMode ? 'pointer' : 'grab'};
                z-index: ${q.completed ? 3 : 2};
                display: flex;
                flex-direction: column;
                align-items: center;
                touch-action: none;
                will-change: transform;
            `;
            
            const color = SPHERE_COLORS[q.sphere] || '#6c8aff';
            const borderColor = q.completed ? color : `${color}66`;
            
            const wrap = document.createElement('div');
            wrap.style.cssText = `
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: ${NODE_SIZE}px;
                height: ${NODE_SIZE}px;
                border-radius: 50%;
                background: #ffffff;
                border: 1.5px solid ${borderColor};
                transition: all 0.15s ease;
                pointer-events: all;
                box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                ${q.completed ? `box-shadow: 0 0 20px ${color}22, 0 1px 3px rgba(0,0,0,0.04);` : ''}
            `;
            
            const emoji = document.createElement('span');
            emoji.textContent = q.emoji || '❓';
            emoji.style.cssText = `
                font-size: 1.8rem;
                line-height: 1;
                pointer-events: none;
            `;
            
            const tooltip = document.createElement('div');
            tooltip.style.cssText = `
                position: absolute;
                bottom: calc(100% + 12px);
                left: 50%;
                transform: translateX(-50%) scale(0.95);
                background: #ffffff;
                color: #1a1a1a;
                padding: 12px 16px;
                border-radius: 8px;
                min-width: 200px;
                max-width: 280px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.08);
                border: 1px solid #e8e5de;
                opacity: 0;
                pointer-events: none;
                transition: all 0.15s ease;
                z-index: 30;
                font-size: 0.85rem;
                font-family: 'Inter', sans-serif;
            `;
            
            const difficultyMap = {
                'easy': '🟢 Легкая',
                'medium': '🟡 Средняя',
                'hard': '🔴 Сложная'
            };
            
            tooltip.innerHTML = `
                <div style="font-weight: 500; color: #1a1a1a; margin-bottom: 4px; font-family: 'Playfair Display', serif;">${q.title}</div>
                <div style="color: #6b6b6b; font-size: 0.8rem; margin-bottom: 6px;">${q.description || 'Нет описания'}</div>
                <div style="color: ${color}; font-size: 0.8rem;">${q.sphere} • ${difficultyMap[q.difficulty] || 'Средняя'}</div>
                <div style="color: #facc15; font-size: 0.8rem; margin-top: 4px;">💰 ${q.reward} монет</div>
                <div style="color: #9b9b9b; font-size: 0.7rem; margin-top: 4px;">${q.completed ? '✅ Выполнен' : '⬜ Не выполнен'}</div>
            `;
            
            wrap.appendChild(emoji);
            wrap.appendChild(tooltip);
            node.appendChild(wrap);
            
            wrap.addEventListener('click', (e) => {
                if (state.linkMode) {
                    handleLinkClick(q.id);
                }
            });
            
            wrap.addEventListener('mouseenter', () => {
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'translateX(-50%) scale(1)';
            });
            
            wrap.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateX(-50%) scale(0.95)';
            });
            
            questWorld.appendChild(node);
            setupDrag(node, q);
        });
        
        renderLinks();
        updateLinkUI();
        updateEmptyHint();
    }

    function setupDrag(node, quest) {
        let isDraggingQuest = false;
        let startX, startY, origX, origY;
        
        const onStart = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return;
            if (e.type === 'touchstart' && e.touches.length !== 1) return;
            if (e.target.closest('.quest-tooltip')) return;
            if (state.linkMode) return;
            
            isDraggingQuest = true;
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
            
            const rect = container.getBoundingClientRect();
            startX = (clientX - rect.left - state.offsetX) / state.scale;
            startY = (clientY - rect.top - state.offsetY) / state.scale;
            origX = quest.x;
            origY = quest.y;
            node.style.cursor = 'grabbing';
            node.style.zIndex = 30;
            e.preventDefault?.();
            e.stopPropagation?.();
        };
        
        const onMove = (e) => {
            if (!isDraggingQuest) return;
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
            
            const rect = container.getBoundingClientRect();
            const worldX = (clientX - rect.left - state.offsetX) / state.scale;
            const worldY = (clientY - rect.top - state.offsetY) / state.scale;
            
            quest.x = origX + (worldX - startX);
            quest.y = origY + (worldY - startY);
            
            node.style.left = quest.x + 'px';
            node.style.top = quest.y + 'px';
            
            renderLinks();
            e.preventDefault?.();
        };
        
        const onEnd = () => {
            if (isDraggingQuest) {
                isDraggingQuest = false;
                node.style.cursor = 'grab';
                node.style.zIndex = 2;
                saveToStorage();
                renderLinks();
            }
        };
        
        node.addEventListener('mousedown', onStart);
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
        
        node.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onEnd);
    }

    function renderLinks() {
        const ns = 'http://www.w3.org/2000/svg';
        linksSvg.innerHTML = '';
        
        state.links.forEach(link => {
            const from = state.quests.find(q => q.id === link.from);
            const to = state.quests.find(q => q.id === link.to);
            if (!from || !to) return;
            
            const line = document.createElementNS(ns, 'line');
            line.setAttribute('x1', from.x);
            line.setAttribute('y1', from.y);
            line.setAttribute('x2', to.x);
            line.setAttribute('y2', to.y);
            
            const isCompleted = from.completed && to.completed;
            line.setAttribute('stroke', isCompleted ? '#4ade80' : 'rgba(0,0,0,0.08)');
            line.setAttribute('stroke-width', isCompleted ? '2' : '1.5');
            line.setAttribute('stroke-linecap', 'round');
            line.setAttribute('opacity', isCompleted ? '0.9' : '0.5');
            
            if (isCompleted) {
                line.setAttribute('stroke-dasharray', '4,4');
            }
            
            linksSvg.appendChild(line);
        });
    }

    function updateTransform() {
        worldContainer.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
    }

    function setScale(newScale, centerX, centerY) {
        const oldScale = state.scale;
        state.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, newScale));
        
        if (centerX !== undefined && centerY !== undefined) {
            const rect = container.getBoundingClientRect();
            const cx = centerX - rect.left;
            const cy = centerY - rect.top;
            state.offsetX = cx - (cx - state.offsetX) * (state.scale / oldScale);
            state.offsetY = cy - (cy - state.offsetY) * (state.scale / oldScale);
        }
        
        updateTransform();
        renderLinks();
    }

    function startDrag(e) {
        if (e.target.closest('.quest-node')) return;
        if (e.target.closest('.sidebar')) return;
        if (e.target.closest('.topbar')) return;
        
        state.isDragging = true;
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        state.dragStartX = clientX;
        state.dragStartY = clientY;
        state.dragOffsetX = state.offsetX;
        state.dragOffsetY = state.offsetY;
        container.style.cursor = 'grabbing';
        e.preventDefault?.();
    }

    function moveDrag(e) {
        if (!state.isDragging) return;
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        state.offsetX = state.dragOffsetX + (clientX - state.dragStartX);
        state.offsetY = state.dragOffsetY + (clientY - state.dragStartY);
        updateTransform();
        e.preventDefault?.();
    }

    function endDrag() {
        if (state.isDragging) {
            state.isDragging = false;
            container.style.cursor = 'grab';
        }
    }

    function saveToStorage() {
        try {
            const data = {
                quests: state.quests,
                links: state.links,
                nextId: state.nextId,
                lastCompletedDate: state.lastCompletedDate,
                dailyCompleted: state.dailyCompleted,
                dailySphereCount: state.dailySphereCount
            };
            localStorage.setItem('questnet_canvas', JSON.stringify(data));
            console.log('💾 Saved', state.quests.length, 'quests to storage');
        } catch (e) {
            console.warn('Failed to save canvas state:', e);
        }
    }

    function loadFromStorage() {
        try {
            const stored = localStorage.getItem('questnet_canvas');
            if (stored) {
                const data = JSON.parse(stored);
                state.quests = data.quests || [];
                state.links = data.links || [];
                state.nextId = data.nextId || 1;
                state.lastCompletedDate = data.lastCompletedDate || null;
                state.dailyCompleted = data.dailyCompleted || 0;
                state.dailySphereCount = data.dailySphereCount || {};
                
                const today = new Date().toDateString();
                if (state.lastCompletedDate !== today) {
                    state.dailyCompleted = 0;
                    state.dailySphereCount = {};
                }
                console.log('📂 Loaded', state.quests.length, 'quests from storage');
                return true;
            }
        } catch (e) {
            console.warn('Failed to load canvas state:', e);
        }
        return false;
    }

    // Экспортируем инициализацию
    window.CanvasInit = initCanvas;

})();