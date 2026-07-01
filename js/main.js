document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM загружен');
  
  // Инициализация загрузчика
  initLoader();
  
  renderStories();
  renderCatalog();
  setupLanguageSwitcher();
  initSlider();
  initNavbarScroll();
  initSmoothScroll();
  initActiveSection();
  initCustomCursor();
  initChainsParallax();
  initParallaxLayer();
});

// ===== ЗАГРУЗЧИК =====
function initLoader() {
  const overlay = document.getElementById('loaderOverlay');
  const bar = document.getElementById('loaderBar');
  const percent = document.getElementById('loaderPercent');
  
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress > 100) progress = 100;
    
    bar.style.width = progress + '%';
    percent.textContent = Math.round(progress) + '%';
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        overlay.classList.add('hidden');
        // После скрытия загрузчика запускаем анимацию приветствия
        startIntroAnimation();
      }, 300);
    }
  }, 150);
}

// ===== АНИМАЦИЯ ПРИВЕТСТВИЯ =====
let introAnimationStarted = false;

function startIntroAnimation() {
  if (introAnimationStarted) return;
  introAnimationStarted = true;
  
  const words = document.querySelectorAll('.intro-word');
  if (!words.length) return;
  
  const introWords = translations['en']?.intro?.words || ['ONE', 'BASE,', 'INFINITY', 'STYLES.'];
  words.forEach((word, index) => {
    if (introWords[index]) word.textContent = introWords[index];
  });
  
  words.forEach((word, index) => {
    const delay = parseFloat(word.dataset.delay) || index * 0.6;
    setTimeout(() => {
      word.classList.add('visible');
    }, delay * 1000);
  });
  
  // Максимальная задержка: 1.2 + 0.8 (анимация) + 0.5 = 2.5 сек
  setTimeout(() => {
    const overlay = document.getElementById('introOverlay');
    if (overlay) {
      overlay.classList.add('hide');
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (typeof applyTranslations === 'function' && window.currentLang) {
          applyTranslations(window.currentLang);
        }
        // Перерисовываем stories и catalog после применения переводов
        renderStories();
        renderCatalog();
      }, 600);
    }
  }, 2800);
}

// ===== КАСТОМНЫЙ КУРСОР =====
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;
  
  if (window.innerWidth <= 768) {
    cursor.style.display = 'none';
    return;
  }
  
  let mouseX = -100;
  let mouseY = -100;
  let currentX = -100;
  let currentY = -100;
  
  function updateCursorColor(x, y) {
    const element = document.elementFromPoint(x, y);
    if (!element) return;
    
    const isOnHero = element.closest('.hero-section') !== null;
    const isOnFooter = element.closest('.footer') !== null;
    const isOnNavbar = element.closest('.navbar') !== null;
    
    const color = (isOnHero || isOnFooter || isOnNavbar) ? '#ffffff' : '#000000';
    cursor.style.color = color;
  }
  
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    updateCursorColor(mouseX, mouseY);
    cursor.style.opacity = '1';
  });
  
  function animateCursor() {
    currentX += (mouseX - currentX) * 0.15;
    currentY += (mouseY - currentY) * 0.15;
    
    cursor.style.left = currentX + 'px';
    cursor.style.top = currentY + 'px';
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();
  
  document.addEventListener('mouseleave', function() {
    cursor.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', function() {
    cursor.style.opacity = '1';
  });
  
  window.addEventListener('scroll', function() {
    if (mouseX >= 0 && mouseY >= 0) {
      updateCursorColor(mouseX, mouseY);
    }
  });
  
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      cursor.style.display = 'none';
      document.body.style.cursor = 'auto';
    } else {
      cursor.style.display = 'block';
      document.body.style.cursor = 'none';
    }
  });
}

// ===== ПАРАЛЛАКС ДЛЯ ЦЕПЕЙ =====
function initChainsParallax() {
  const leftChain = document.querySelector('.form-chain-left');
  const rightChain = document.querySelector('.form-chain-right');
  const formSection = document.getElementById('formSection');
  
  if (!leftChain || !rightChain || !formSection) return;
  
  function updateChains(scrollY) {
    const rect = formSection.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = formSection.offsetHeight;
    const windowHeight = window.innerHeight;
    
    const viewportCenter = scrollY + windowHeight / 2;
    const sectionCenter = sectionTop + sectionHeight / 2;
    
    const offset = (viewportCenter - sectionCenter) / (sectionHeight / 2);
    const clampedOffset = Math.max(-1, Math.min(1, offset));
    
    const maxOffset = 60;
    const leftOffset = -clampedOffset * maxOffset;
    const rightOffset = clampedOffset * maxOffset;
    
    leftChain.style.transform = `translateY(${leftOffset}px)`;
    rightChain.style.transform = `translateY(${rightOffset}px)`;
  }
  
  let ticking = false;
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        updateChains(window.scrollY);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  
  setTimeout(() => {
    updateChains(window.scrollY);
  }, 100);
  
  window.addEventListener('resize', function() {
    updateChains(window.scrollY);
  }, { passive: true });
}

// ===== ПАРАЛЛАКС-ЭФФЕКТ ДЛЯ ЗВЁЗД И HEADER =====
function initParallaxLayer() {
  const starsLeft = document.getElementById('starsLeft');
  const starsRight = document.getElementById('starsRight');
  const headerImage = document.getElementById('headerImage');
  const heroSection = document.getElementById('heroSection');
  
  if (!starsLeft || !starsRight || !headerImage || !heroSection) return;
  
  let mouseX = 0;
  let mouseY = 0;
  let currentLeftX = 0;
  let currentLeftY = 0;
  let currentRightX = 0;
  let currentRightY = 0;
  let currentHeaderX = 0;
  let currentHeaderY = 0;
  
  const maxOffset = {
    starsLeft: { x: 30, y: 20 },
    starsRight: { x: -25, y: -15 },
    header: { x: 15, y: 10 }
  };
  
  function updateParallax() {
    const rect = heroSection.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const offsetX = (mouseX - centerX) / rect.width;
    const offsetY = (mouseY - centerY) / rect.height;
    
    const targetLeftX = offsetX * maxOffset.starsLeft.x * 2;
    const targetLeftY = offsetY * maxOffset.starsLeft.y * 2;
    currentLeftX += (targetLeftX - currentLeftX) * 0.08;
    currentLeftY += (targetLeftY - currentLeftY) * 0.08;
    
    const targetRightX = offsetX * maxOffset.starsRight.x * 2;
    const targetRightY = offsetY * maxOffset.starsRight.y * 2;
    currentRightX += (targetRightX - currentRightX) * 0.08;
    currentRightY += (targetRightY - currentRightY) * 0.08;
    
    const targetHeaderX = offsetX * maxOffset.header.x * 2;
    const targetHeaderY = offsetY * maxOffset.header.y * 2;
    currentHeaderX += (targetHeaderX - currentHeaderX) * 0.06;
    currentHeaderY += (targetHeaderY - currentHeaderY) * 0.06;
    
    starsLeft.style.transform = `translate(${currentLeftX}px, ${currentLeftY}px)`;
    starsRight.style.transform = `translate(${currentRightX}px, ${currentRightY}px)`;
    headerImage.style.transform = `translate(${currentHeaderX}px, ${currentHeaderY}px)`;
    
    requestAnimationFrame(updateParallax);
  }
  
  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  document.addEventListener('mouseleave', function() {
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
  });
  
  setTimeout(() => {
    mouseX = window.innerWidth / 2;
    mouseY = window.innerHeight / 2;
  }, 100);
  
  updateParallax();
}

// ===== ПЛАВНЫЙ СКРОЛЛ =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      if (!targetId || targetId === '#') return;
      
      e.preventDefault();
      
      const target = document.querySelector(targetId);
      
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== АКТИВНЫЙ РАЗДЕЛ В НАВИГАЦИИ =====
function initActiveSection() {
  const navLinks = document.querySelectorAll('.nav-left a[data-section]');
  
  if (navLinks.length === 0) return;
  
  const sectionIds = ['heroSection', 'catalogSection', 'photosessionSection', 'formSection'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(el => el !== null);
  
  function updateActiveLink() {
    const scrollPosition = window.scrollY + 120;
    
    let currentSection = null;
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionTop = section.offsetTop;
      
      if (i < sections.length - 1) {
        const nextSection = sections[i + 1];
        const nextSectionTop = nextSection.offsetTop;
        
        if (scrollPosition >= sectionTop && scrollPosition < nextSectionTop) {
          currentSection = section.id;
          break;
        }
      } else {
        if (scrollPosition >= sectionTop) {
          currentSection = section.id;
          break;
        }
      }
    }
    
    if (!currentSection && scrollPosition < sections[0].offsetTop) {
      currentSection = 'heroSection';
    }
    
    if (!currentSection) {
      currentSection = 'heroSection';
    }
    
    navLinks.forEach(link => {
      if (link.dataset.section === currentSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  window.addEventListener('scroll', updateActiveLink, { passive: true });
  setTimeout(updateActiveLink, 100);
}

// ===== РЕНДЕРИНГ STORIES =====
function renderStories() {
  const grid = document.getElementById('storiesGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const currentLang = window.currentLang || 'en';
  
  storiesData.items.forEach(item => {
    const story = document.createElement('div');
    story.className = 'story-item';
    story.dataset.id = item.id;
    
    const title = storiesData.getTitle(item.id, currentLang);
    
    story.innerHTML = `
      <div class="story-ring">
        <div class="story-icon-wrapper">
          <img src="${item.icon}" alt="${title}" class="story-icon">
        </div>
      </div>
      <span class="story-title">${title}</span>
    `;
    
    grid.appendChild(story);
  });
}

// ===== РЕНДЕРИНГ КАТАЛОГА =====
function renderCatalog() {
  const grid = document.getElementById('catalogGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  const currentLang = window.currentLang || 'en';
  
  catalogData.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'catalog-card';
    card.dataset.id = item.id;
    
    const name = catalogData.getName(item.id, currentLang);
    
    card.innerHTML = `
      <div class="catalog-card-image">
        <img src="${item.image}" alt="${name}" loading="lazy">
      </div>
      <h3 class="catalog-card-title">${name}</h3>
      <p class="catalog-card-lot">LOT: ${item.lot}</p>
    `;
    
    grid.appendChild(card);
  });
}

// ===== ПЕРЕКЛЮЧЕНИЕ ЯЗЫКА =====
function setupLanguageSwitcher() {
  const langLinks = document.querySelectorAll('.nav-right a[data-lang]');
  
  langLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const lang = this.dataset.lang;
      
      if (translations[lang] && lang !== window.currentLang) {
        if (typeof switchLanguage === 'function') {
          switchLanguage(lang);
        } else {
          applyTranslations(lang);
          langLinks.forEach(l => l.classList.remove('active'));
          this.classList.add('active');
          catalogData.setLanguage(lang);
          renderStories();
          renderCatalog();
        }
      }
    });
  });
}

// ===== ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРА =====
function initSlider() {
  const track = document.getElementById('sliderTrack');
  if (!track) return;
  
  const slides = track.querySelectorAll('.slide');
  if (slides.length === 0) return;
  
  const slideWidth = slides[0].offsetWidth + 25;
  const trackWidth = track.scrollWidth;
  const containerWidth = track.parentElement.offsetWidth;
  
  if (trackWidth >= containerWidth) return;
  
  const neededSlides = Math.ceil(containerWidth / slideWidth) + 2;
  const currentSlides = slides.length;
  
  if (neededSlides > currentSlides) {
    const clonesNeeded = neededSlides - currentSlides;
    const originalSlides = Array.from(slides);
    
    for (let i = 0; i < clonesNeeded; i++) {
      const clone = originalSlides[i % originalSlides.length].cloneNode(true);
      track.appendChild(clone);
    }
  }
}

// ===== УМЕНЬШЕНИЕ ЛОГОТИПА ПРИ СКРОЛЛЕ =====
function initNavbarScroll() {
  const navbar = document.getElementById('mainNavbar');
  const heroSection = document.getElementById('heroSection');
  
  if (!navbar || !heroSection) return;
  
  navbar.style.opacity = '1';
  navbar.style.paddingTop = '35px';
  
  window.addEventListener('scroll', function() {
    const heroHeight = heroSection.offsetHeight;
    const scrollPosition = window.scrollY;
    
    const triggerPoint = heroHeight * 0.01;
    
    if (scrollPosition > triggerPoint) {
      navbar.classList.add('scrolled');
      navbar.style.paddingTop = '14px';
    } else {
      navbar.classList.remove('scrolled');
      navbar.style.paddingTop = '35px';
    }
  }, { passive: true });
}

// ===== ФОРМА =====
document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('subscribeForm');
  const success = document.getElementById('formSuccess');
  
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('emailInput').value.trim();
      
      if (email) {
        console.log('Email submitted:', email);
        
        form.style.display = 'none';
        success.style.display = 'block';
      }
    });
  }
});

// ===== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ =====
document.addEventListener('DOMContentLoaded', function() {
  const defaultLang = 'en';
  const langLinks = document.querySelectorAll('.nav-right a[data-lang]');
  langLinks.forEach(link => {
    if (link.dataset.lang === defaultLang) {
      link.classList.add('active');
    }
  });
  
  catalogData.setLanguage(defaultLang);
  
  if (typeof applyTranslations === 'function' && window.currentLang) {
    applyTranslations(window.currentLang);
  } else {
    console.warn('⚠️ translations.js не загружен или applyTranslations не определена');
  }
  
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      initSlider();
    }, 250);
  });
});