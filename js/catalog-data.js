// ===== ДАННЫЕ КАТАЛОГА С ПЕРЕВОДАМИ =====
const catalogData = {
  currentLang: 'en',
  
  languages: {
    en: { label: 'EN', currency: '$', symbol: '$' },
    ru: { label: 'RU', currency: '₽', symbol: '₽' },
    by: { label: 'BY', currency: 'BYN', symbol: 'BYN' }
  },
  
  items: [
    {
      id: 1,
      lot: '0001',
      image: 'img/lots/lot1.png',
      name: {
        en: 'EXCLUSION MODULE BASE',
        ru: 'БАЗОВЫЙ МОДУЛЬ EXCLUSION',
        by: 'БАЗАВЫ МОДУЛЬ EXCLUSION'
      },
      price: {
        en: 49,
        ru: 4500,
        by: 120
      }
    },
    {
      id: 2,
      lot: '0002',
      image: 'img/lots/lot2.png',
      name: {
        en: 'EXCLUSION EX PULLER',
        ru: 'PULLER EXCLUSION EX',
        by: 'PULLER EXCLUSION EX'
      },
      price: {
        en: 59,
        ru: 5400,
        by: 140
      }
    },
    {
      id: 3,
      lot: '0003',
      image: 'img/lots/lot3.png',
      name: {
        en: 'EXCLUSION BAT PULLER',
        ru: 'PULLER EXCLUSION BAT',
        by: 'PULLER EXCLUSION BAT'
      },
      price: {
        en: 69,
        ru: 6300,
        by: 160
      }
    },
    {
      id: 4,
      lot: '0004',
      image: 'img/lots/lot4.png',
      name: {
        en: 'EXCLUSION CLEAN PULLER',
        ru: 'PULLER EXCLUSION CLEAN',
        by: 'PULLER EXCLUSION CLEAN'
      },
      price: {
        en: 79,
        ru: 7200,
        by: 180
      }
    }
  ],
  
  getName(itemId, lang) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return '';
    return item.name[lang] || item.name.en;
  },
  
  getPriceWithCurrency(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return '';
    const price = item.price[this.currentLang];
    const currency = this.languages[this.currentLang].symbol;
    return `${price} ${currency}`;
  },
  
  setLanguage(lang) {
    if (this.languages[lang]) {
      this.currentLang = lang;
      return true;
    }
    return false;
  }
};