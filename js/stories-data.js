// ===== ДАННЫЕ STORIES С ПЕРЕВОДАМИ =====
const storiesData = {
  items: [
    { 
      id: 1, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'EXCLUSION',
        ru: 'РАКАЮ БАЛЕНСИ',
        by: 'ФЛЕКШУ БАБКАМИ'
      }
    },
    { 
      id: 2, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'SLIDE ONE',
        ru: 'SLIDE ONE',
        by: 'SLIDE ONE'
      }
    },
    { 
      id: 3, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'MODULES',
        ru: 'МОДУЛИ',
        by: 'МОДУЛІ'
      }
    },
    { 
      id: 4, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'EXCLUSION',
        ru: 'EXCLUSION',
        by: 'EXCLUSION'
      }
    },
    { 
      id: 5, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'SLIDE ONE',
        ru: 'SLIDE ONE',
        by: 'SLIDE ONE'
      }
    },
    { 
      id: 6, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'MODULES',
        ru: 'МОДУЛИ',
        by: 'МОДУЛІ'
      }
    },
    { 
      id: 7, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'EXCLUSION',
        ru: 'EXCLUSION',
        by: 'EXCLUSION'
      }
    },
    { 
      id: 8, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'SLIDE ONE',
        ru: 'SLIDE ONE',
        by: 'SLIDE ONE'
      }
    },
    { 
      id: 9, 
      icon: 'img/stories/stories.png',
      title: {
        en: 'MODULES',
        ru: 'МОДУЛИ',
        by: 'МОДУЛІ'
      }
    }
  ],
  
  getTitle(itemId, lang) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return '';
    return item.title[lang] || item.title.en;
  }
};