// Blueprint секция - анимация чертежа и блокировка скролла
let blueprintAnimated = false;

function initBlueprint() {
  const section = document.querySelector('.blueprint');
  if (!section) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !blueprintAnimated) {
        blueprintAnimated = true;
        lockScroll();
        animateBlueprint();
      }
    });
  }, { threshold: 0.5 });

  observer.observe(section);
}

function lockScroll() {
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.body.style.overflow = '';
}

function animateBlueprint() {
  const svg = document.querySelector('.blueprint-svg');
  const elements = svg.querySelectorAll('path, line, rect, circle');
  const panels = document.querySelectorAll('.blueprint-panel');

  // Анимируем SVG элементы
  elements.forEach((el, index) => {
    const length = el.getTotalLength ? el.getTotalLength() : 200;
    el.style.strokeDasharray = length;
    el.style.strokeDashoffset = length;
    el.style.animation = `draw 2s ease forwards ${index * 0.2}s`;
  });

  // После анимации SVG показываем панели
  setTimeout(() => {
    panels.forEach((panel, index) => {
      setTimeout(() => {
        panel.classList.add('visible');
      }, index * 200);
    });

    // Разблокируем скролл после показа всех панелей
    setTimeout(unlockScroll, 600);
  }, elements.length * 200 + 500);
}