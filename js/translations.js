// ===== ПЕРЕВОДЫ =====
const translations = {
  en: {
    nav: {
      howItWorks: 'HOW IT WORKS',
      catalog: 'CATALOG',
      photosession: 'PHOTOSESSION',
      reserve: 'RESERVE'
    },
    hero: {
      title: 'EXCLUSION',
      scroll: 'SCROLL',
      leftText: 'UNIQUE MODULAR ZIPPER SYSTEM.',
      rightText: 'ONE BASE, INFINITY STYLES.',
      collection: 'SLIDE ONE COLLECTION'
    },
    stories: {
      exclusion: 'EXCLUSION',
      slideOne: 'SLIDE ONE',
      modules: 'MODULES'
    },
    catalog: {
      title: 'PULLERS',
      subtitle: 'SLIDE ONE COLLECTION',
      lot: 'LOT'
    },
    textBlock: {
      title: 'Switch without limits.',
      line1: 'The base gives you reliability. The charms give you character.',
      line2: 'Mix, match, and remix as often as you want. One click changes everything — literally.'
    },
    photosession: {
      title: 'PHOTOSESSION'
    },
    form: {
      title: 'Find your base.',
      description: 'Your outfit changes, your accessories shouldn\'t stay the same. Subscribe to the first drop and get a chance to vote for the first collaborative artist series.',
      placeholder: 'your@email.com',
      button: 'RESERVE YOUR SLOT',
      footer: 'No spam. Drop notification only.',
      success: "YOU'RE IN. SLOT RESERVED."
    },
    intro: {
      words: ['ONE', 'BASE,', 'INFINITY', 'STYLES.']
    },
    footer: {
      copyright: 'Exclusion @ All rights reserved, 2026'
    }
  },
  ru: {
    nav: {
      howItWorks: 'КАК ЭТО РАБОТАЕТ',
      catalog: 'КАТАЛОГ',
      photosession: 'ФОТОСЕССИЯ',
      reserve: 'ЗАБРОНИРОВАТЬ'
    },
    hero: {
      title: 'EXCLUSION',
      scroll: 'ЛИСТАЙТЕ',
      leftText: 'УНИКАЛЬНАЯ МОДУЛЬНАЯ СИСТЕМА МОЛНИЙ.',
      rightText: 'ОДНА БАЗА, БЕСКОНЕЧНЫЕ СТИЛИ.',
      collection: 'SLIDE ONE COLLECTION'
    },
    stories: {
      exclusion: 'EXCLUSION',
      slideOne: 'SLIDE ONE',
      modules: 'МОДУЛИ'
    },
    catalog: {
      title: 'ПУЛЛЕРЫ',
      subtitle: 'КОЛЛЕКЦИЯ SLIDE ONE',
      lot: 'ЛОТ'
    },
    textBlock: {
      title: 'Меняй без ограничений.',
      line1: 'База даёт тебе надёжность. Шармы — характер.',
      line2: 'Смешивай, комбинируй и пересобирай так часто, как хочешь. Один клик меняет всё — буквально.'
    },
    photosession: {
      title: 'ФОТОСЕССИЯ'
    },
    form: {
      title: 'Найди свою базу.',
      description: 'Твой образ меняется — твои аксессуары не должны оставаться прежними. Подпишись на первый релиз и получи шанс проголосовать за первую коллаборацию с художниками.',
      placeholder: 'ваш@email.com',
      button: 'ЗАБРОНИРОВАТЬ МЕСТО',
      footer: 'Без спама. Только уведомления о релизах.',
      success: 'ВЫ В ИГРЕ. МЕСТО ЗАБРОНИРОВАНО.'
    },
    intro: {
      words: ['ОДНА', 'БАЗА,', 'БЕСКОНЕЧНЫЕ', 'СТИЛИ.']
    },
    footer: {
      copyright: 'Exclusion @ Все права защищены, 2026'
    }
  },
  by: {
    nav: {
      howItWorks: 'ЯК ГЭТА ПРАЦУЕ',
      catalog: 'КАТАЛОГ',
      photosession: 'ФОТАСЭСІЯ',
      reserve: 'ЗАБРАНІРАВАЦЬ'
    },
    hero: {
      title: 'EXCLUSION',
      scroll: 'ПРАКРУЦІЦЕ',
      leftText: 'УНІКАЛЬНАЯ МОДУЛЬНАЯ СІСТЭМА МАЛАНАК.',
      rightText: 'АДНА БАЗА, БЯСКОНЦЫЯ СТЫЛІ.',
      collection: 'SLIDE ONE COLLECTION'
    },
    stories: {
      exclusion: 'EXCLUSION',
      slideOne: 'SLIDE ONE',
      modules: 'МОДУЛІ'
    },
    catalog: {
      title: 'ПУЛЛЕРЫ',
      subtitle: 'КАЛЕКЦЫЯ SLIDE ONE',
      lot: 'ЛОТ'
    },
    textBlock: {
      title: 'Мяняй без абмежаванняў.',
      line1: 'База дае табе надзейнасць. Шармы — характар.',
      line2: 'Змешвай, камбінуй і перабірай так часта, як хочаш. Адзін клік мяняе ўсё — літаральна.'
    },
    photosession: {
      title: 'ФОТАСЭСІЯ'
    },
    form: {
      title: 'Знайдзі сваю базу.',
      description: 'Твой вобраз мяняецца — твае аксэсуары не павінны заставацца ранейшымі. Падпішыся на першы рэліз і атрымай шанец прагаласаваць за першую калабарацыю з мастакамі.',
      placeholder: 'ваш@email.com',
      button: 'ЗАБРАНІРАВАЦЬ МЕСЦА',
      footer: 'Без спаму. Толькі апавяшчэнні пра рэлізы.',
      success: 'ВЫ Ў ГУЛЬНІ. МЕСЦА ЗАБРАНІРАВАНА.'
    },
    intro: {
      words: ['АДНА', 'БАЗА,', 'БЯСКОНЦЫЯ', 'СТЫЛІ.']
    },
    footer: {
      copyright: 'Exclusion @ Усе правы абаронены, 2026'
    }
  }
};

// Текущий язык
let currentLang = 'en';

// ===== ПРИМЕНЕНИЕ ПЕРЕВОДОВ =====
function applyTranslations(lang) {
  const t = translations[lang];
  if (!t) return;
  
  // ===== МЕНЯЕМ ЛОГОТИП =====
  const logoNav = document.getElementById('navLogo');
  const logoFooter = document.getElementById('footerLogo');
  
  if (lang === 'by') {
    if (logoNav) logoNav.src = 'img/logo-by.jpg';
    if (logoFooter) logoFooter.src = 'img/logo-by.jpg';
  } else {
    if (logoNav) logoNav.src = 'img/logo.jpg';
    if (logoFooter) logoFooter.src = 'img/logo.jpg';
  }
  
  // Навигация
  document.querySelectorAll('.nav-left a').forEach((el, index) => {
    const keys = ['howItWorks', 'catalog', 'photosession', 'reserve'];
    if (index < keys.length) el.textContent = t.nav[keys[index]];
  });
  
  // Hero
  const heroTitle = document.querySelector('.hero-content h1');
  if (heroTitle) heroTitle.textContent = t.hero.title;
  
  const scrollSpan = document.querySelector('.scroll-indicator span');
  if (scrollSpan) scrollSpan.textContent = t.hero.scroll;
  
  const heroLeftText = document.querySelector('.hero-left-text span');
  if (heroLeftText) heroLeftText.textContent = t.hero.leftText;
  
  const heroRightText = document.querySelector('.hero-right-text span');
  if (heroRightText) heroRightText.textContent = t.hero.rightText;
  
  // SLIDE ONE COLLECTION (бегущие строки и нижний текст)
  const heroCollection = document.querySelector('.hero-collection');
  if (heroCollection) heroCollection.textContent = t.hero.collection;
  
  // Бегущие строки
  document.querySelectorAll('.marquee-track span').forEach(el => {
    el.textContent = t.hero.collection;
  });
  
  // Каталог — с поддержкой перевода
  const catalogTitle = document.querySelector('.catalog-section .section-title');
  if (catalogTitle) catalogTitle.textContent = t.catalog.title;
  
  const catalogSubtitle = document.querySelector('.catalog-section .section-subtitle');
  if (catalogSubtitle) catalogSubtitle.textContent = t.catalog.subtitle;
  
  // Текстовый блок
  const textBlockTitle = document.querySelector('.text-block-title');
  if (textBlockTitle) textBlockTitle.textContent = t.textBlock.title;
  
  const textBlockLines = document.querySelectorAll('.text-block-line');
  if (textBlockLines.length >= 2) {
    textBlockLines[0].textContent = t.textBlock.line1;
    textBlockLines[1].textContent = t.textBlock.line2;
  }
  
  // Фотосессия
  const photosessionTitle = document.querySelector('.photosession-section .section-title');
  if (photosessionTitle) photosessionTitle.textContent = t.photosession.title;
  
  // Форма
  const formTitle = document.getElementById('formTitle');
  if (formTitle) formTitle.textContent = t.form.title;
  
  const formDescription = document.getElementById('formDescription');
  if (formDescription) formDescription.textContent = t.form.description;
  
  const emailInput = document.getElementById('emailInput');
  if (emailInput) emailInput.placeholder = t.form.placeholder;
  
  const formSubmit = document.getElementById('formSubmit');
  if (formSubmit) formSubmit.textContent = t.form.button;
  
  const formFooter = document.getElementById('formFooter');
  if (formFooter) formFooter.textContent = t.form.footer;
  
  const successText = document.getElementById('successText');
  if (successText) successText.textContent = t.form.success;
  
  // Футер
  const footerCopyright = document.getElementById('footerCopyright');
  if (footerCopyright) footerCopyright.textContent = t.footer.copyright;
  
  // Сохраняем язык
  currentLang = lang;
  window.currentLang = lang;
  
  // Обновляем каталог и stories
  if (typeof catalogData !== 'undefined' && catalogData.setLanguage) {
    catalogData.setLanguage(lang);
  }
  
  if (typeof renderStories === 'function') {
    renderStories();
  }
  
  if (typeof renderCatalog === 'function') {
    renderCatalog();
  }
}

// ===== ПРИНУДИТЕЛЬНЫЙ ПОКАЗ АНИМАЦИИ =====
function showIntroAnimation() {
  const overlay = document.getElementById('introOverlay');
  const words = document.querySelectorAll('.intro-word');
  
  if (!overlay || !words.length) return;
  
  overlay.style.cssText = `
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: translateY(0) !important;
    pointer-events: auto !important;
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    z-index: 9998 !important;
    background: #000 !important;
    align-items: center !important;
    justify-content: center !important;
  `;
  
  const introWords = translations[currentLang]?.intro?.words || ['ONE', 'BASE,', 'INFINITY', 'STYLES.'];
  words.forEach((word, index) => {
    if (introWords[index]) {
      word.textContent = introWords[index];
    }
    word.classList.remove('visible');
    word.style.opacity = '0';
    word.style.transform = 'translateY(40px)';
    word.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  });
  
  words.forEach((word, index) => {
    const delay = parseFloat(word.dataset.delay) || index * 0.6;
    setTimeout(() => {
      word.style.opacity = '1';
      word.style.transform = 'translateY(0)';
      word.classList.add('visible');
    }, delay * 1000 + 200);
  });
  
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.6s ease, transform 0.6s ease, visibility 0.6s ease';
    overlay.style.opacity = '0';
    overlay.style.transform = 'translateY(-100%)';
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
      
      if (typeof catalogData !== 'undefined' && catalogData.setLanguage) {
        catalogData.setLanguage(currentLang);
      }
      
      if (typeof renderStories === 'function') {
        renderStories();
      }
      
      if (typeof renderCatalog === 'function') {
        renderCatalog();
      }
    }, 600);
  }, 2800);
}

// ===== СМЕНА ЯЗЫКА =====
function switchLanguage(lang) {
  if (!translations[lang] || lang === currentLang) return;
  
  const loader = document.getElementById('loaderOverlay');
  if (!loader) {
    applyTranslations(lang);
    document.body.style.overflow = 'hidden';
    setTimeout(showIntroAnimation, 300);
    return;
  }
  
  const bar = document.getElementById('loaderBar');
  const percent = document.getElementById('loaderPercent');
  if (bar) bar.style.width = '0%';
  if (percent) percent.textContent = '0%';
  
  loader.classList.remove('hidden');
  loader.style.display = 'flex';
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress > 100) progress = 100;
    
    if (bar) bar.style.width = progress + '%';
    if (percent) percent.textContent = Math.round(progress) + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      
      applyTranslations(lang);
      
      if (typeof renderCatalog === 'function') renderCatalog();
      
      document.querySelectorAll('.nav-right a[data-lang]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.lang === lang) link.classList.add('active');
      });
      
      loader.classList.add('hidden');
      
      document.body.style.overflow = 'hidden';
      setTimeout(showIntroAnimation, 400);
    }
  }, 150);
}

// ===== ЭКСПОРТ =====
window.currentLang = currentLang;
window.applyTranslations = applyTranslations;
window.switchLanguage = switchLanguage;
window.translations = translations;
window.showIntroAnimation = showIntroAnimation;