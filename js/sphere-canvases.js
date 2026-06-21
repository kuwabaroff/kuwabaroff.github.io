// QuestNet — Управление канвасами для каждой сферы

(function() {
    'use strict';

    const canvases = {};
    let initialized = false;

    const SPHERE_COLORS = {
        'Тело': '#f87171',
        'Разум': '#6c8aff',
        'Финансы': '#facc15',
        'Работа': '#fb923c',
        'Отношения': '#f472b6',
        'Среда': '#a78bfa',
        'Дух': '#4ade80'
    };

    const SPHERE_EMOJIS = {
        'Тело': '💪',
        'Разум': '🧠',
        'Финансы': '💰',
        'Работа': '💼',
        'Отношения': '💕',
        'Среда': '🏠',
        'Дух': '✨'
    };

    function initSphereCanvases() {
        if (initialized) return;
        
        if (typeof CanvasAPI === 'undefined') {
            console.warn('CanvasAPI not available yet');
            return;
        }

        console.log('🎨 Initializing sphere canvases...');

        const sphereConfigs = [
            { id: 'sphereCanvasBody', sphere: 'Тело' },
            { id: 'sphereCanvasMind', sphere: 'Разум' },
            { id: 'sphereCanvasFinance', sphere: 'Финансы' },
            { id: 'sphereCanvasWork', sphere: 'Работа' },
            { id: 'sphereCanvasRelations', sphere: 'Отношения' },
            { id: 'sphereCanvasEnvironment', sphere: 'Среда' },
            { id: 'sphereCanvasSpirit', sphere: 'Дух' }
        ];

        sphereConfigs.forEach(({ id, sphere }) => {
            const container = document.getElementById(id);
            if (!container) {
                console.warn(`Container ${id} not found for sphere ${sphere}`);
                return;
            }
            
            const canvas = createSphereCanvas(container, sphere);
            canvases[sphere] = canvas;
        });
        
        initialized = true;
        console.log('✅ All sphere canvases initialized, total:', Object.keys(canvases).length);
        
        renderAll();
    }

    function createSphereCanvas(container, sphere) {
        container.innerHTML = '';

        container.style.cssText = `
            width: 100%;
            height: 100%;
            position: relative;
            overflow: hidden;
            cursor: grab;
            background: #ffffff;
        `;

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
                linear-gradient(rgba(200, 195, 185, 0.12) 1px, transparent 1px),
                linear-gradient(90deg, rgba(200, 195, 185, 0.12) 1px, transparent 1px);
            background-size: 40px 40px;
        `;
        container.appendChild(gridOverlay);

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
        container.appendChild(linksSvg);

        const questWorld = document.createElement('div');
        questWorld.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            transform-origin: 0 0;
            will-change: transform;
        `;
        container.appendChild(questWorld);

        const emptyHint = document.createElement('div');
        emptyHint.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            pointer-events: none;
            z-index: 2;
        `;
        emptyHint.innerHTML = `
            <div style="font-size: 2.5rem; margin-bottom: 8px; opacity: 0.3;">${SPHERE_EMOJIS[sphere] || '❓'}</div>
            <div style="font-size: 1rem; color: #9b9b9b; font-family: 'Playfair Display', serif;">Нет квестов</div>
            <div style="font-size: 0.8rem; color: #c4c4c4; font-family: 'Inter', sans-serif;">Создайте первый квест</div>
        `;
        container.appendChild(emptyHint);

        const state = {
            scale: 1,
            offsetX: 0,
            offsetY: 0,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            dragOffsetX: 0,
            dragOffsetY: 0
        };

        function getQuests() {
            if (typeof CanvasAPI === 'undefined') {
                return [];
            }
            const allQuests = CanvasAPI.getQuests();
            return allQuests.filter(q => q.sphere === sphere);
        }

        function getLinks() {
            if (typeof CanvasAPI === 'undefined') return [];
            const allLinks = CanvasAPI.getLinks();
            const sphereQuests = getQuests();
            const ids = new Set(sphereQuests.map(q => q.id));
            return allLinks.filter(l => ids.has(l.from) && ids.has(l.to));
        }

        function render() {
            const quests = getQuests();
            const links = getLinks();

            updateSphereStats(sphere);

            questWorld.innerHTML = '';

            if (quests.length === 0) {
                emptyHint.style.display = 'block';
            } else {
                emptyHint.style.display = 'none';
            }

            quests.forEach(q => {
                const node = document.createElement('div');
                node.className = `quest-node${q.completed ? ' completed' : ''}`;
                node.dataset.id = q.id;
                node.style.cssText = `
                    position: absolute;
                    left: ${q.x || 0}px;
                    top: ${q.y || 0}px;
                    transform: translate(-50%, -50%);
                    pointer-events: all;
                    cursor: grab;
                    z-index: ${q.completed ? 3 : 2};
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    touch-action: none;
                    will-change: transform;
                `;

                const color = SPHERE_COLORS[sphere] || '#6c8aff';
                const borderColor = q.completed ? color : 'rgba(0,0,0,0.08)';

                const wrap = document.createElement('div');
                wrap.style.cssText = `
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #ffffff;
                    border: 1.5px solid ${borderColor};
                    transition: all 0.15s ease;
                    pointer-events: all;
                    box-shadow: ${q.completed ? `0 0 20px ${color}22, 0 1px 3px rgba(0,0,0,0.04)` : '0 1px 3px rgba(0,0,0,0.04)'};
                `;

                const emoji = document.createElement('span');
                emoji.textContent = q.emoji || '❓';
                emoji.style.cssText = 'font-size: 1.8rem; line-height: 1; pointer-events: none;';

                const tooltip = document.createElement('div');
                tooltip.style.cssText = `
                    position: absolute;
                    bottom: calc(100% + 12px);
                    left: 50%;
                    transform: translateX(-50%) scale(0.95);
                    background: #ffffff;
                    color: #1a1a1a;
                    padding: 10px 14px;
                    border-radius: 8px;
                    min-width: 180px;
                    max-width: 260px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.08);
                    border: 1px solid #e8e5de;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.15s ease;
                    z-index: 30;
                    font-size: 0.8rem;
                    font-family: 'Inter', sans-serif;
                `;
                const difficultyMap = {
                    'easy': '🟢 Легкая',
                    'medium': '🟡 Средняя',
                    'hard': '🔴 Сложная'
                };
                tooltip.innerHTML = `
                    <div style="font-size: 0.9rem; font-weight: 500; color: #1a1a1a; margin-bottom: 2px; font-family: 'Playfair Display', serif;">${q.title}</div>
                    <div style="font-size: 0.75rem; color: #6b6b6b; margin-bottom: 4px; line-height: 1.4;">${q.description || 'Нет описания'}</div>
                    <div style="font-size: 0.8rem; color: #facc15; font-weight: 500;">💰 ${q.reward} монет</div>
                    <div style="font-size: 0.7rem; color: #9b9b9b; margin-top: 2px;">${q.completed ? '✅ Выполнен' : '⬜ Не выполнен'}</div>
                `;

                wrap.appendChild(emoji);
                wrap.appendChild(tooltip);
                node.appendChild(wrap);

                wrap.addEventListener('mouseenter', () => {
                    tooltip.style.opacity = '1';
                    tooltip.style.transform = 'translateX(-50%) scale(1)';
                });

                wrap.addEventListener('mouseleave', () => {
                    tooltip.style.opacity = '0';
                    tooltip.style.transform = 'translateX(-50%) scale(0.95)';
                });

                wrap.addEventListener('dblclick', (e) => {
                    e.stopPropagation();
                    if (typeof CanvasAPI !== 'undefined') {
                        CanvasAPI.toggleComplete(q.id);
                        renderAll();
                    }
                });

                wrap.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (confirm(`Удалить квест "${q.title}"?`)) {
                        if (typeof CanvasAPI !== 'undefined') {
                            CanvasAPI.deleteQuest(q.id);
                            renderAll();
                        }
                    }
                });

                setupDrag(node, q);
                questWorld.appendChild(node);
            });

            renderLinks(links);
        }

        function renderLinks(links) {
            const ns = 'http://www.w3.org/2000/svg';
            linksSvg.innerHTML = '';
            
            const quests = getQuests();
            const questMap = {};
            quests.forEach(q => { questMap[q.id] = q; });

            links.forEach(link => {
                const from = questMap[link.from];
                const to = questMap[link.to];
                if (!from || !to) return;

                const line = document.createElementNS(ns, 'line');
                line.setAttribute('x1', from.x || 0);
                line.setAttribute('y1', from.y || 0);
                line.setAttribute('x2', to.x || 0);
                line.setAttribute('y2', to.y || 0);
                
                const isCompleted = from.completed && to.completed;
                line.setAttribute('stroke', isCompleted ? '#4ade80' : 'rgba(0,0,0,0.08)');
                line.setAttribute('stroke-width', isCompleted ? '2' : '1.5');
                line.setAttribute('stroke-linecap', 'round');
                line.setAttribute('opacity', isCompleted ? '0.9' : '0.5');

                linksSvg.appendChild(line);
            });
        }

        function setupDrag(node, quest) {
            let isDragging = false;
            let startX, startY, origX, origY;

            const onStart = (e) => {
                if (e.type === 'mousedown' && e.button !== 0) return;
                if (e.type === 'touchstart' && e.touches.length !== 1) return;
                if (e.target.closest('.quest-tooltip')) return;

                isDragging = true;
                const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

                const rect = container.getBoundingClientRect();
                startX = (clientX - rect.left - state.offsetX) / state.scale;
                startY = (clientY - rect.top - state.offsetY) / state.scale;
                origX = quest.x || 0;
                origY = quest.y || 0;
                node.style.cursor = 'grabbing';
                node.style.zIndex = 30;
                e.preventDefault?.();
                e.stopPropagation?.();
            };

            const onMove = (e) => {
                if (!isDragging) return;
                const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

                const rect = container.getBoundingClientRect();
                const worldX = (clientX - rect.left - state.offsetX) / state.scale;
                const worldY = (clientY - rect.top - state.offsetY) / state.scale;

                quest.x = origX + (worldX - startX);
                quest.y = origY + (worldY - startY);

                node.style.left = quest.x + 'px';
                node.style.top = quest.y + 'px';

                renderLinks(getLinks());
                e.preventDefault?.();
            };

            const onEnd = () => {
                if (isDragging) {
                    isDragging = false;
                    node.style.cursor = 'grab';
                    node.style.zIndex = 2;
                    if (typeof CanvasAPI !== 'undefined') {
                        const allQuests = CanvasAPI.getQuests();
                        const target = allQuests.find(q => q.id === quest.id);
                        if (target) {
                            target.x = quest.x;
                            target.y = quest.y;
                        }
                        if (typeof CanvasAPI.saveState === 'function') {
                            CanvasAPI.saveState();
                        }
                    }
                    renderLinks(getLinks());
                }
            };

            node.addEventListener('mousedown', onStart);
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onEnd);

            node.addEventListener('touchstart', onStart, { passive: false });
            document.addEventListener('touchmove', onMove, { passive: false });
            document.addEventListener('touchend', onEnd);
        }

        container.addEventListener('mousedown', (e) => {
            if (e.target.closest('.quest-node')) return;
            if (e.target.closest('.sphere-canvas-toolbar')) return;
            
            state.isDragging = true;
            state.dragStartX = e.clientX;
            state.dragStartY = e.clientY;
            state.dragOffsetX = state.offsetX;
            state.dragOffsetY = state.offsetY;
            container.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!state.isDragging) return;
            state.offsetX = state.dragOffsetX + (e.clientX - state.dragStartX);
            state.offsetY = state.dragOffsetY + (e.clientY - state.dragStartY);
            updateTransform();
        });

        document.addEventListener('mouseup', () => {
            if (state.isDragging) {
                state.isDragging = false;
                container.style.cursor = 'grab';
            }
        });

        container.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.05 : 0.05;
            const oldScale = state.scale;
            state.scale = Math.max(0.1, Math.min(3, state.scale + delta));
            
            const rect = container.getBoundingClientRect();
            const cx = e.clientX - rect.left;
            const cy = e.clientY - rect.top;
            state.offsetX = cx - (cx - state.offsetX) * (state.scale / oldScale);
            state.offsetY = cy - (cy - state.offsetY) * (state.scale / oldScale);
            
            updateTransform();
        }, { passive: false });

        function updateTransform() {
            questWorld.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
            linksSvg.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
        }

        render();

        return {
            render: render,
            getState: () => state,
            container: container,
            sphere: sphere
        };
    }

    function updateSphereStats(sphere) {
        if (typeof CanvasAPI === 'undefined') return;
        
        const quests = CanvasAPI.getQuests();
        const sphereQuests = quests.filter(q => q.sphere === sphere);
        const completed = sphereQuests.filter(q => q.completed);

        const map = {
            'Тело': 'body',
            'Разум': 'mind',
            'Финансы': 'finance',
            'Работа': 'work',
            'Отношения': 'relations',
            'Среда': 'environment',
            'Дух': 'spirit'
        };

        const key = map[sphere];
        const completedEl = document.getElementById(`${key}Completed`);
        const totalEl = document.getElementById(`${key}Total`);

        if (completedEl) completedEl.textContent = completed.length;
        if (totalEl) totalEl.textContent = sphereQuests.length;
    }

    function renderAll() {
        if (!initialized) {
            console.warn('Sphere canvases not initialized yet');
            return;
        }
        Object.keys(canvases).forEach(sphere => {
            if (canvases[sphere]) {
                canvases[sphere].render();
            }
        });
    }

    function getCanvas(sphere) {
        return canvases[sphere] || null;
    }

    window.SphereCanvases = {
        init: initSphereCanvases,
        renderAll: renderAll,
        getCanvas: getCanvas,
        getCanvases: () => canvases,
        isReady: () => initialized
    };

})();