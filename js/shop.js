// QuestNet — Магазин артефактов

(function() {
    'use strict';

    // Артефакты по сферам
    const ARTIFACTS = [
        // Тело
        { 
            id: 'iron_will', 
            name: 'Железная воля', 
            sphere: 'Тело', 
            emoji: '⚡', 
            cost: 500, 
            rate: 1, 
            description: '+1 токен/час за активность в Теле',
            rarity: 'rare'
        },
        { 
            id: 'perfect_form', 
            name: 'Идеальная форма', 
            sphere: 'Тело', 
            emoji: '💪', 
            cost: 300, 
            rate: 0.5, 
            description: '+0.5 токен/час за тренировки',
            rarity: 'common'
        },
        { 
            id: 'sleep_king', 
            name: 'Король сна', 
            sphere: 'Тело', 
            emoji: '😴', 
            cost: 700, 
            rate: 1.5, 
            description: '+1.5 токен/час за качественный сон',
            rarity: 'epic'
        },
        { 
            id: 'nutrition_guru', 
            name: 'Гуру питания', 
            sphere: 'Тело', 
            emoji: '🥗', 
            cost: 400, 
            rate: 0.8, 
            description: '+0.8 токен/час за правильное питание',
            rarity: 'uncommon'
        },
        
        // Разум
        { 
            id: 'book_of_knowledge', 
            name: 'Книга знаний', 
            sphere: 'Разум', 
            emoji: '📚', 
            cost: 500, 
            rate: 1, 
            description: '+1 токен/час за обучение',
            rarity: 'rare'
        },
        { 
            id: 'mind_palace', 
            name: 'Дворец разума', 
            sphere: 'Разум', 
            emoji: '🧠', 
            cost: 350, 
            rate: 0.6, 
            description: '+0.6 токен/час за чтение',
            rarity: 'common'
        },
        { 
            id: 'genius_glasses', 
            name: 'Очки гения', 
            sphere: 'Разум', 
            emoji: '👓', 
            cost: 800, 
            rate: 2, 
            description: '+2 токен/час за глубокое мышление',
            rarity: 'epic'
        },
        { 
            id: 'learning_potion', 
            name: 'Эликсир обучения', 
            sphere: 'Разум', 
            emoji: '🧪', 
            cost: 450, 
            rate: 0.9, 
            description: '+0.9 токен/час за новые навыки',
            rarity: 'uncommon'
        },
        
        // Финансы
        { 
            id: 'money_safe', 
            name: 'Сейф', 
            sphere: 'Финансы', 
            emoji: '💰', 
            cost: 800, 
            rate: 1.5, 
            description: 'x1.5 токенов за финансовые квесты',
            rarity: 'epic'
        },
        { 
            id: 'golden_compass', 
            name: 'Золотой компас', 
            sphere: 'Финансы', 
            emoji: '🧭', 
            cost: 350, 
            rate: 0.5, 
            description: '+0.5 токен/час за планирование бюджета',
            rarity: 'common'
        },
        { 
            id: 'crystal_ball', 
            name: 'Хрустальный шар', 
            sphere: 'Финансы', 
            emoji: '🔮', 
            cost: 600, 
            rate: 1.2, 
            description: '+1.2 токен/час за инвестиции',
            rarity: 'rare'
        },
        { 
            id: 'wealth_ring', 
            name: 'Кольцо богатства', 
            sphere: 'Финансы', 
            emoji: '💍', 
            cost: 1000, 
            rate: 2.5, 
            description: '+2.5 токен/час за финансовую активность',
            rarity: 'legendary'
        },
        
        // Работа
        { 
            id: 'time_master', 
            name: 'Мастер времени', 
            sphere: 'Работа', 
            emoji: '⏱️', 
            cost: 600, 
            rate: 1, 
            description: 'Бонус токенов за помодоро сессии',
            rarity: 'rare'
        },
        { 
            id: 'focus_crown', 
            name: 'Корона фокуса', 
            sphere: 'Работа', 
            emoji: '👑', 
            cost: 400, 
            rate: 0.7, 
            description: '+0.7 токен/час за глубокую работу',
            rarity: 'uncommon'
        },
        { 
            id: 'project_shield', 
            name: 'Щит проектов', 
            sphere: 'Работа', 
            emoji: '🛡️', 
            cost: 750, 
            rate: 1.8, 
            description: '+1.8 токен/час за завершённые проекты',
            rarity: 'epic'
        },
        { 
            id: 'efficiency_wings', 
            name: 'Крылья эффективности', 
            sphere: 'Работа', 
            emoji: '🦅', 
            cost: 900, 
            rate: 2.2, 
            description: '+2.2 токен/час за продуктивность',
            rarity: 'legendary'
        },
        
        // Отношения
        { 
            id: 'heart_amplifier', 
            name: 'Усилитель сердца', 
            sphere: 'Отношения', 
            emoji: '❤️', 
            cost: 450, 
            rate: 0.8, 
            description: '+0.8 токен/час за общение',
            rarity: 'uncommon'
        },
        { 
            id: 'friendship_necklace', 
            name: 'Ожерелье дружбы', 
            sphere: 'Отношения', 
            emoji: '🤝', 
            cost: 300, 
            rate: 0.5, 
            description: '+0.5 токен/час за нетворкинг',
            rarity: 'common'
        },
        { 
            id: 'family_portal', 
            name: 'Портал семьи', 
            sphere: 'Отношения', 
            emoji: '🏠', 
            cost: 550, 
            rate: 1, 
            description: '+1 токен/час за время с семьёй',
            rarity: 'rare'
        },
        { 
            id: 'love_pendant', 
            name: 'Подвеска любви', 
            sphere: 'Отношения', 
            emoji: '💕', 
            cost: 700, 
            rate: 1.6, 
            description: '+1.6 токен/час за глубокие связи',
            rarity: 'epic'
        },
        
        // Среда
        { 
            id: 'order_orb', 
            name: 'Сфера порядка', 
            sphere: 'Среда', 
            emoji: '🌀', 
            cost: 350, 
            rate: 0.6, 
            description: '+0.6 токен/час за организацию пространства',
            rarity: 'common'
        },
        { 
            id: 'tool_belt', 
            name: 'Пояс инструментов', 
            sphere: 'Среда', 
            emoji: '🔧', 
            cost: 500, 
            rate: 0.9, 
            description: '+0.9 токен/час за работу с инструментами',
            rarity: 'uncommon'
        },
        { 
            id: 'cleanse_aura', 
            name: 'Аура чистоты', 
            sphere: 'Среда', 
            emoji: '✨', 
            cost: 650, 
            rate: 1.3, 
            description: '+1.3 токен/час за порядок и чистоту',
            rarity: 'rare'
        },
        { 
            id: 'space_diamond', 
            name: 'Алмаз пространства', 
            sphere: 'Среда', 
            emoji: '💎', 
            cost: 850, 
            rate: 2, 
            description: '+2 токен/час за идеальную среду',
            rarity: 'epic'
        },
        
        // Дух
        { 
            id: 'spirit_wings', 
            name: 'Крылья духа', 
            sphere: 'Дух', 
            emoji: '🕊️', 
            cost: 600, 
            rate: 1, 
            description: '+1 токен/час за медитацию',
            rarity: 'rare'
        },
        { 
            id: 'purpose_star', 
            name: 'Звезда цели', 
            sphere: 'Дух', 
            emoji: '⭐', 
            cost: 400, 
            rate: 0.7, 
            description: '+0.7 токен/час за рефлексию',
            rarity: 'uncommon'
        },
        { 
            id: 'peace_pendant', 
            name: 'Кулон покоя', 
            sphere: 'Дух', 
            emoji: '☮️', 
            cost: 750, 
            rate: 1.6, 
            description: '+1.6 токен/час за внутренний баланс',
            rarity: 'epic'
        },
        { 
            id: 'enlightenment_crown', 
            name: 'Корона просветления', 
            sphere: 'Дух', 
            emoji: '🌟', 
            cost: 1000, 
            rate: 3, 
            description: '+3 токен/час за духовную практику',
            rarity: 'legendary'
        }
    ];

    // Состояние
    let state = {
        owned: [], // ID купленных артефактов
        purchased: {} // { artifactId: purchaseDate }
    };

    // Инициализация
    function initShop() {
        loadState();
        renderShop();
        console.log('🏪 Shop initialized with', ARTIFACTS.length, 'artifacts');
    }

    // Загрузка состояния
    function loadState() {
        try {
            const stored = localStorage.getItem('questnet_shop');
            if (stored) {
                const parsed = JSON.parse(stored);
                state.owned = parsed.owned || [];
                state.purchased = parsed.purchased || {};
            }
        } catch (e) {
            console.warn('Failed to load shop state:', e);
        }
    }

    // Сохранение состояния
    function saveState() {
        try {
            localStorage.setItem('questnet_shop', JSON.stringify({
                owned: state.owned,
                purchased: state.purchased
            }));
        } catch (e) {
            console.warn('Failed to save shop state:', e);
        }
    }

    // Получение артефактов по сфере
    function getArtifactsBySphere(sphere) {
        return ARTIFACTS.filter(a => a.sphere === sphere);
    }

    // Получение всех артефактов
    function getAllArtifacts() {
        return ARTIFACTS;
    }

    // Проверка наличия артефакта
    function hasArtifact(artifactId) {
        return state.owned.includes(artifactId);
    }

    // Получение активных артефактов
    function getActiveArtifacts() {
        return state.owned.map(id => ARTIFACTS.find(a => a.id === id)).filter(Boolean);
    }

    // Расчет скорости майнинга
    function getMiningRate() {
        const active = getActiveArtifacts();
        let rate = 0;
        active.forEach(a => {
            rate += a.rate || 0;
        });
        return rate;
    }

    // Покупка артефакта
    function purchaseArtifact(artifactId) {
        const artifact = ARTIFACTS.find(a => a.id === artifactId);
        if (!artifact) {
            return { success: false, message: 'Артефакт не найден' };
        }

        if (state.owned.includes(artifactId)) {
            return { success: false, message: 'Артефакт уже куплен' };
        }

        // Проверка баланса
        if (typeof CoinsAPI !== 'undefined') {
            const balance = CoinsAPI.getBalance();
            if (balance < artifact.cost) {
                return { 
                    success: false, 
                    message: `Недостаточно монет. Нужно ${artifact.cost}, у тебя ${balance}` 
                };
            }
            
            // Списание монет
            const result = CoinsAPI.spendCoins(artifact.cost);
            if (!result.success) {
                return { success: false, message: result.message };
            }
        } else {
            return { success: false, message: 'Система монет не инициализирована' };
        }

        // Добавляем артефакт
        state.owned.push(artifactId);
        state.purchased[artifactId] = Date.now();
        saveState();
        
        // Уведомление
        if (typeof QuestNet !== 'undefined') {
            QuestNet.showNotification(
                '🎉 Артефакт куплен!',
                `${artifact.emoji} ${artifact.name} — ${artifact.description}`,
                '🎉',
                '#4ade80'
            );
        }

        renderShop();
        
        return { 
            success: true, 
            message: `Куплен ${artifact.name}`,
            artifact: artifact
        };
    }

    // Рендер магазина
    function renderShop() {
        const container = document.getElementById('shopContainer');
        if (!container) return;

        // Группируем по сферам
        const spheres = ['Тело', 'Разум', 'Финансы', 'Работа', 'Отношения', 'Среда', 'Дух'];
        const sphereEmojis = {
            'Тело': '💪',
            'Разум': '🧠',
            'Финансы': '💰',
            'Работа': '💼',
            'Отношения': '💕',
            'Среда': '🏠',
            'Дух': '✨'
        };
        const sphereColors = {
            'Тело': '#f87171',
            'Разум': '#6c8aff',
            'Финансы': '#facc15',
            'Работа': '#fb923c',
            'Отношения': '#f472b6',
            'Среда': '#a78bfa',
            'Дух': '#4ade80'
        };

        let html = '';
        
        spheres.forEach(sphere => {
            const artifacts = getArtifactsBySphere(sphere);
            if (artifacts.length === 0) return;

            html += `
                <div class="shop-sphere-section">
                    <div class="shop-sphere-header" style="color: ${sphereColors[sphere]};">
                        <span>${sphereEmojis[sphere]}</span>
                        <span>${sphere}</span>
                        <span style="font-size: 0.7rem; color: #666; font-weight: 400;">${artifacts.length} артефактов</span>
                    </div>
                    <div class="shop-grid">
            `;

            artifacts.forEach(artifact => {
                const owned = state.owned.includes(artifact.id);
                const rarityColors = {
                    'common': '#888',
                    'uncommon': '#6c8aff',
                    'rare': '#a78bfa',
                    'epic': '#f472b6',
                    'legendary': '#facc15'
                };
                const rarityLabels = {
                    'common': 'Обычный',
                    'uncommon': 'Необычный',
                    'rare': 'Редкий',
                    'epic': 'Эпический',
                    'legendary': 'Легендарный'
                };

                html += `
                    <div class="shop-item card ${owned ? 'owned' : ''}" data-artifact="${artifact.id}">
                        <div class="shop-item-header">
                            <span class="shop-item-emoji">${artifact.emoji}</span>
                            <span class="shop-item-rarity" style="color: ${rarityColors[artifact.rarity]};">
                                ${rarityLabels[artifact.rarity]}
                            </span>
                        </div>
                        <div class="shop-item-name">${artifact.name}</div>
                        <div class="shop-item-desc">${artifact.description}</div>
                        <div class="shop-item-sphere" style="color: ${sphereColors[sphere]};">
                            ${sphereEmojis[sphere]} ${sphere}
                        </div>
                        <div class="shop-item-footer">
                            ${owned ? (
                                '<span class="shop-item-owned">✅ Владеешь</span>'
                            ) : (
                                `<button class="btn-primary shop-buy-btn" data-id="${artifact.id}">
                                    🪙 ${artifact.cost} монет
                                </button>`
                            )}
                            <span class="shop-item-rate">⚡ ${artifact.rate}/час</span>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Обработчики покупки
        container.querySelectorAll('.shop-buy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const result = purchaseArtifact(id);
                if (!result.success) {
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
        });
    }

    // Экспорт API
    window.ShopAPI = {
        getAllArtifacts,
        getArtifactsBySphere,
        hasArtifact,
        getActiveArtifacts,
        getMiningRate,
        purchaseArtifact,
        renderShop
    };

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initShop);
    } else {
        initShop();
    }

})();