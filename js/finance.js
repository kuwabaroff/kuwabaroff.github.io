// QuestNet — Финансовый учёт

(function() {
    'use strict';

    const FINANCE_KEY = 'questnet_finance';

    let state = {
        transactions: [],
        balance: 0,
        totalIncome: 0,
        totalExpense: 0
    };

    // Категории
    const CATEGORIES = {
        income: ['salary', 'freelance', 'investments', 'gift', 'other'],
        expense: ['food', 'transport', 'entertainment', 'health', 'education', 'other']
    };

    const CATEGORY_LABELS = {
        salary: 'Зарплата',
        freelance: 'Фриланс',
        investments: 'Инвестиции',
        gift: 'Подарок',
        food: 'Еда',
        transport: 'Транспорт',
        entertainment: 'Развлечения',
        health: 'Здоровье',
        education: 'Обучение',
        other: 'Другое'
    };

    const CATEGORY_ICONS = {
        salary: '💼',
        freelance: '💻',
        investments: '📈',
        gift: '🎁',
        food: '🍽️',
        transport: '🚗',
        entertainment: '🎮',
        health: '🏥',
        education: '📚',
        other: '📌'
    };

    // Инициализация
    function initFinance() {
        loadState();
        renderFinance();
        setupFinanceEvents();
        console.log('💰 Finance system initialized');
    }

    // Загрузка состояния
    function loadState() {
        try {
            const stored = localStorage.getItem(FINANCE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                state.transactions = parsed.transactions || [];
                state.balance = parsed.balance || 0;
                state.totalIncome = parsed.totalIncome || 0;
                state.totalExpense = parsed.totalExpense || 0;
            }
        } catch (e) {
            console.warn('Failed to load finance state:', e);
        }
    }

    // Сохранение состояния
    function saveState() {
        try {
            localStorage.setItem(FINANCE_KEY, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save finance state:', e);
        }
    }

    // Добавление транзакции
    function addTransaction(type, amount, category, description, date) {
        if (!amount || amount <= 0) {
            return { success: false, message: 'Некорректная сумма' };
        }

        const transaction = {
            id: Date.now(),
            type: type,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            category: category || 'other',
            description: description || '',
            date: date || new Date().toISOString(),
            createdAt: Date.now()
        };

        state.transactions.push(transaction);
        updateBalances();
        saveState();
        renderFinance();

        // Начисляем монеты за финансовую активность
        if (typeof CoinsAPI !== 'undefined') {
            const coinReward = type === 'income' ? 10 : 5;
            const result = CoinsAPI.addCoins(coinReward, 'Финансы');
            if (result.success) {
                if (typeof QuestNet !== 'undefined') {
                    QuestNet.showNotification(
                        '💰 Мини-квест выполнен!',
                        `+${coinReward} монет за финансовую активность`,
                        '💰',
                        '#facc15'
                    );
                }
            }
        }

        return { success: true, transaction };
    }

    // Обновление балансов
    function updateBalances() {
        let income = 0;
        let expense = 0;
        
        state.transactions.forEach(t => {
            if (t.type === 'income') {
                income += t.amount;
            } else {
                expense += Math.abs(t.amount);
            }
        });
        
        state.totalIncome = income;
        state.totalExpense = expense;
        state.balance = income - expense;
    }

    // Получение транзакций за период
    function getTransactions(days = 30) {
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        return state.transactions
            .filter(t => t.createdAt >= cutoff)
            .sort((a, b) => b.createdAt - a.createdAt);
    }

    // Рендер финансов
    function renderFinance() {
        const balanceEl = document.getElementById('financeBalance');
        const incomeEl = document.getElementById('totalIncome');
        const expenseEl = document.getElementById('totalExpense');
        const listEl = document.getElementById('transactionList');

        if (balanceEl) balanceEl.textContent = `${state.balance} ₽`;
        if (incomeEl) incomeEl.textContent = `+${state.totalIncome} ₽`;
        if (incomeEl) incomeEl.style.color = '#4ade80';
        if (expenseEl) expenseEl.textContent = `-${state.totalExpense} ₽`;
        if (expenseEl) expenseEl.style.color = '#f87171';

        // Рендер списка транзакций
        if (listEl) {
            const recent = getTransactions(30).slice(0, 20);
            
            if (recent.length === 0) {
                listEl.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📊</div>
                        <div class="empty-title">Нет транзакций</div>
                        <div class="empty-sub">Добавьте первую транзакцию</div>
                    </div>
                `;
            } else {
                listEl.innerHTML = recent.map(t => {
                    const isIncome = t.type === 'income';
                    const categoryLabel = CATEGORY_LABELS[t.category] || t.category;
                    const categoryIcon = CATEGORY_ICONS[t.category] || '📌';
                    const date = new Date(t.date);
                    const dateStr = date.toLocaleDateString('ru-RU');
                    
                    return `
                        <div class="transaction-item" style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            padding: 10px 0;
                            border-bottom: 1px solid rgba(255,255,255,0.04);
                        ">
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span style="font-size: 1.2rem;">${categoryIcon}</span>
                                <div>
                                    <div style="color: #e8e8e8; font-size: 0.85rem;">${t.description || categoryLabel}</div>
                                    <div style="color: #666; font-size: 0.7rem;">${categoryLabel} • ${dateStr}</div>
                                </div>
                            </div>
                            <div style="color: ${isIncome ? '#4ade80' : '#f87171'}; font-weight: 500;">
                                ${isIncome ? '+' : ''}${t.amount} ₽
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Рендер графика
        renderChart();
    }

    // Рендер графика
    function renderChart() {
        const svg = document.getElementById('financeChartSvg');
        if (!svg) return;

        const transactions = getTransactions(90);
        const grouped = {};
        
        transactions.forEach(t => {
            const date = new Date(t.date);
            const week = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
            if (!grouped[week]) grouped[week] = { income: 0, expense: 0 };
            if (t.type === 'income') {
                grouped[week].income += t.amount;
            } else {
                grouped[week].expense += Math.abs(t.amount);
            }
        });

        const weeks = Object.keys(grouped).sort();
        if (weeks.length === 0) {
            svg.innerHTML = `
                <text x="250" y="100" text-anchor="middle" fill="#444" font-size="12">Нет данных</text>
            `;
            return;
        }

        const maxValue = Math.max(
            ...Object.values(grouped).map(w => Math.max(w.income, w.expense)),
            1000
        );

        const width = 500;
        const height = 200;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;
        const step = Math.max(1, Math.floor(weeks.length / 20));

        let incomePoints = '';
        let expensePoints = '';
        let labels = '';

        weeks.forEach((week, i) => {
            if (i % step !== 0 && i !== weeks.length - 1) return;
            
            const x = padding + (i / (weeks.length - 1)) * chartWidth;
            const data = grouped[week];
            
            const incomeY = padding + chartHeight - (data.income / maxValue) * chartHeight;
            const expenseY = padding + chartHeight - (data.expense / maxValue) * chartHeight;
            
            incomePoints += `${x},${incomeY} `;
            expensePoints += `${x},${expenseY} `;
            
            labels += `
                <text x="${x}" y="${height - 5}" text-anchor="middle" fill="#444" font-size="8">
                    ${i+1}
                </text>
            `;
        });

        const svgContent = `
            <!-- Оси -->
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
            
            <!-- Линии -->
            <polyline points="${incomePoints}" fill="none" stroke="#4ade80" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="${expensePoints}" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            
            <!-- Заполнение под линиями -->
            ${incomePoints ? `<polygon points="${padding},${padding + chartHeight} ${incomePoints} ${padding + chartWidth},${padding + chartHeight}" fill="rgba(74,222,128,0.05)"/>` : ''}
            ${expensePoints ? `<polygon points="${padding},${padding + chartHeight} ${expensePoints} ${padding + chartWidth},${padding + chartHeight}" fill="rgba(248,113,113,0.05)"/>` : ''}
            
            <!-- Легенда -->
            <text x="${width - 120}" y="15" fill="#4ade80" font-size="9">⎯ Доходы</text>
            <text x="${width - 120}" y="28" fill="#f87171" font-size="9">⎯ Расходы</text>
            
            <!-- Метки недель -->
            ${labels}
            
            <!-- Метки по оси Y -->
            <text x="${padding - 5}" y="${padding}" text-anchor="end" fill="#444" font-size="8">${Math.round(maxValue)}</text>
            <text x="${padding - 5}" y="${height - padding}" text-anchor="end" fill="#444" font-size="8">0</text>
        `;

        svg.innerHTML = svgContent;
    }

    // Настройка событий
    function setupFinanceEvents() {
        const addBtn = document.getElementById('addTransactionBtn');
        if (!addBtn) return;

        addBtn.addEventListener('click', () => {
            const amount = document.getElementById('transactionAmount');
            const type = document.getElementById('transactionType');
            const category = document.getElementById('transactionCategory');
            const desc = document.getElementById('transactionDesc');

            const result = addTransaction(
                type.value,
                parseFloat(amount.value) || 0,
                category.value,
                desc.value.trim()
            );

            if (result.success) {
                amount.value = '';
                desc.value = '';
                
                if (typeof QuestNet !== 'undefined') {
                    QuestNet.showNotification(
                        '✅ Транзакция добавлена',
                        `${type.value === 'income' ? 'Доход' : 'Расход'}: ${Math.abs(result.transaction.amount)} ₽`,
                        '✅',
                        '#4ade80'
                    );
                }
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

        // Enter для быстрого добавления
        document.querySelectorAll('#transactionAmount, #transactionDesc').forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') addBtn.click();
            });
        });
    }

    // Экспорт API
    window.FinanceAPI = {
        getBalance: () => state.balance,
        getTransactions,
        addTransaction,
        renderFinance,
        CATEGORIES,
        CATEGORY_LABELS,
        CATEGORY_ICONS
    };

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFinance);
    } else {
        initFinance();
    }

})();