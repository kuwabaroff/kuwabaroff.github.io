# Список правок лендинга Exclusion

Ниже список конкретных правок которые нужно внести в существующий лендинг. Не переписывай код с нуля — вноси точечные изменения. После каждой правки убедись что остальное не сломалось.

---

## 1. Адаптивность под мобильные

Сайт должен корректно отображаться на мобильных устройствах. Требования:
- Не ужимать контент, сохранять пропорции
- Использовать `vw`-единицы для шрифтов там где нужно сохранить пропорции
- Навигация на мобайле: бургер-меню (три линии), при клике — полноэкранное меню поверх сайта
- Каталог: 2 колонки на планшете, 1 колонка на мобайле (до 480px)
- Blueprint секция: на мобайле чертёж сверху, описание снизу (одна колонка)
- Все отступы и размеры шрифтов адаптировать через медиазапросы: 1024px, 768px, 480px

---

## 2. Замена шрифта

Заменить **Manrope** на **Poppins** везде на сайте.
- Подключить через Google Fonts: `https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap`
- Заменить во всех CSS файлах: `font-family: 'Manrope'` → `font-family: 'Poppins'`
- В `:root` обновить: `--font-main: 'Poppins', sans-serif`

---

## 3. Кастомный курсор

Убрать текущую реализацию курсора полностью. Реализовать заново:
- Скрыть стандартный курсор: `cursor: none` на `body`
- Создать div `#cursor` — тонкий крест (+), реализованный через два псевдоэлемента `::before` и `::after`:
  - Горизонтальная линия: 20px × 1px
  - Вертикальная линия: 1px × 20px
  - Центр пересечения совпадает с позицией мыши
- Цвет: белый на тёмных секциях (hero, blueprint, footer), чёрный на светлых (каталог, о бренде, форма)
- Переключение цвета через JS: Intersection Observer отслеживает текущую секцию и добавляет класс `cursor--light` или `cursor--dark`
- Позиционирование: `position: fixed`, `pointer-events: none`, `z-index: 9999`
- Следует за мышью через `mousemove` listener без задержки

---

## 4. Переводы

Проверить и исправить все тексты на сайте. Убедиться что каждый текстовый элемент с `data-i18n` имеет корректный перевод на все три языка:
- **EN** — английский
- **RU** — русский
- **BY** — белорусский

Если белорусского перевода нет — использовать транслитерацию или близкий по смыслу перевод. Ни один элемент не должен оставаться на дефолтном языке при переключении.

Валюта при переключении языка:
- EN → `$` (USD)
- RU → `₽` (RUB)  
- BY → `Br` (BYN)

---

## 5. Hero фон

Убрать кастомный background (текстуру из логотипов / SVG паттерн) из секции hero. Фон hero — просто чистый чёрный (`#0A0A0A`). Никаких паттернов пока.

---

## 6. Навигационное меню — структура

Переделать структуру navbar:
```
[ Кнопки навигации (слева) ]  [ ЛОГОТИП (строго по центру) ]  [ Языки (справа) ]
```

Реализация через CSS Grid:
```css
nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.nav-links { justify-self: start; }
.nav-logo  { justify-self: center; }
.nav-lang  { justify-self: end; }
```

Логотип: `Full Logo.png` (или SVG если уже переведён), высота 28px, белый цвет.

---

## 7. Фон навигации при скролле

Navbar фиксирован сверху. Логика фона:
- По умолчанию (над hero): `background: transparent`
- После скролла 50px вниз: `background: rgba(10, 10, 10, 0.85)` + `backdrop-filter: blur(20px)` + `border-bottom: 1px solid rgba(255,255,255,0.08)`
- На светлых секциях (каталог, форма): цвет текста и логотипа меняется на чёрный, фон `rgba(255,255,255,0.85)`
- Переключение через Intersection Observer: отслеживать какая секция сейчас в viewport

---

## 8. Анимации при наведении на кнопки

Добавить hover-анимации для всех интерактивных элементов:

**Кнопки навигации:**
```css
.nav-link {
  position: relative;
  transition: opacity 0.2s;
}
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0; height: 1px;
  background: currentColor;
  transition: width 0.3s ease;
}
.nav-link:hover::after { width: 100%; }
```

**CTA-кнопки:** инверсия цвета (белый фон → чёрный текст и наоборот), transition 0.25s

**Кнопка языка:** opacity 0.6 → 1 при hover

**Иконки соцсетей в футере:** scale(1.15), transition 0.2s

---

## 9. Карточки товаров — квадратные фотографии

Контейнер изображения в карточке всегда строго квадратный:
```css
.card-image-wrapper {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}
.card-image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
```

---

## 10. Футер — структура

Переделать футер по следующей структуре (три строки):

```
Строка 1: [ Full Logo (слева) ]  [ © 2025 Exclusion. All rights reserved. (центр) ]  [ Иконки соцсетей (справа) ]
Строка 2: [ Слоган по центру — "Modular zipper system. One base — infinite styles." ]
```

Фон: `#0A0A0A`, весь текст белый, мелкий (12px, letter-spacing 0.1em).

---

## 11. Иконки социальных сетей в футере

Добавить SVG-иконки для шести соцсетей. Все иконки белые, размер 20×20px, при hover opacity: 0.6.

Использовать простые SVG inline или через `<img>` с белым фильтром. Порядок:
1. **Instagram**
2. **TikTok**
3. **YouTube**
4. **Pinterest**
5. **Telegram**
6. **ВКонтакте**

Расположить горизонтально с gap: 20px.

---

## 12. Логотипы бренда в SVG

Перевести `Full Logo.png` и `Logo.png` в SVG формат:
- Создать файлы `Full Logo.svg` и `Logo.svg` в папке `/images`
- Воссоздать логотипы как SVG (используй геометрические примитивы — если логотип сложный, обведи через простые пути)
- Заменить все `<img src="...Logo.png">` на `<img src="...Logo.svg">` или inline SVG
- Преимущество inline SVG: можно менять цвет через CSS `fill: currentColor`

---

## 13. Секция каталога — убрать маятник, исправить заголовок

- **Полностью убрать** физику маятника (Matter.js) и canvas из секции каталога
- Убрать подключение Matter.js из HTML если больше нигде не используется
- Заголовок секции реализовать статично, точно как на макете:
  ```
  [Logo.svg иконка 28px]  PULLERS  |  SLIDE ONE COLLECTION
  ```
  - "PULLERS" — H2, чёрный, bold
  - "SLIDE ONE COLLECTION" — caption, серый (`#888`), letter-spacing 0.15em, uppercase
  - Иконка и текст выровнены по базовой линии

---

## 14. Названия товаров в каталоге

Исправить названия товаров (сейчас неправильные):
1. **Exclusion Zipper Base** — $25
2. **Exclusion EX Zipper #1** — $25
3. **Exclusion EX Zipper #2** — $25
4. **Exclusion EX Zipper #3** — $25

Стиль названий:
- Font-size: 13px (чуть меньше текущего)
- Letter-spacing: -0.01em (буквы чуть сжатее)
- Font-weight: 600
- Uppercase

Убрать дублирующиеся карточки — должно быть ровно **4 карточки**, не 8.

---

## 15. Карточки каталога — убрать фон по умолчанию

```css
.product-card {
  background: transparent; /* убрать любой background-color */
}
.card-image-wrapper {
  background: transparent; /* фон только у обёртки изображения — тоже убрать */
}
```

Фон появляется только при hover на карточку: `background: #F5F5F5`, transition 0.25s.

---

## 16. Кнопка предзаказа при hover на карточку

Исправить отображение кнопки "Предзаказ" при наведении:
- Кнопка абсолютно позиционирована внутри карточки, внизу изображения
- По умолчанию: `opacity: 0`, `transform: translateY(8px)`
- При hover на карточку: `opacity: 1`, `transform: translateY(0)`, transition 0.25s
- Стиль кнопки: чёрный фон, белый текст, 0 border-radius, ширина 100%, padding 10px
- Кнопка находится поверх нижней части изображения (не выталкивает текст вниз)

```css
.card-image-wrapper { position: relative; }
.card-preorder-btn {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.25s ease;
}
.product-card:hover .card-preorder-btn {
  opacity: 1;
  transform: translateY(0);
}
```

---

## 17. Blueprint — анимация по скроллу (scroll-driven)

Полностью переделать логику Blueprint секции. Убрать scroll-lock. Новая логика:

**Поведение:**
1. Пользователь доскролливает до секции
2. Секция заполняет экран → фиксируется (`position: sticky`, `top: 0`)
3. Дальнейший скролл вниз прогрессивно рисует SVG чертёж (stroke-dashoffset уменьшается пропорционально прогрессу скролла)
4. Скролл вверх — анимация идёт в обратном порядке (stroke-dashoffset увеличивается)
5. После того как пользователь проскроллил достаточно чтобы полностью нарисовать чертёж — секция открепляется и можно скроллить дальше

**Реализация:**
```javascript
// Высота "скролл-трека" для секции — например 200vh
// Секция sticky внутри wrapper с height: 300vh
// Прогресс = (scrollY - sectionTop) / (trackHeight)
// strokeDashoffset = totalLength * (1 - progress)

const wrapper = document.querySelector('.blueprint-wrapper'); // height: 300vh
const section = document.querySelector('.blueprint-section'); // sticky top: 0
const paths = document.querySelectorAll('.blueprint-path');

window.addEventListener('scroll', () => {
  const rect = wrapper.getBoundingClientRect();
  const progress = Math.max(0, Math.min(1, -rect.top / (wrapper.offsetHeight - window.innerHeight)));
  
  paths.forEach(path => {
    const length = path.getTotalLength();
    path.style.strokeDasharray = length;
    path.style.strokeDashoffset = length * (1 - progress);
  });
});
```

---

## 18. Blueprint — структура секции (две колонки)

Переделать layout Blueprint секции:

```
[ Левая колонка — 40% ]          [ Правая колонка — 60% ]
  Заголовок секции                  SVG чертёж
  Три описательные панели           (технический рисунок пуллера)
  (появляются по мере прогресса)
```

Левая колонка:
- Заголовок: "Zipper System" / "Система молнии" (H2, белый)
- Подзаголовок: краткое описание концепции (1 предложение, белый, opacity 0.7)
- Три панели с описанием деталей — появляются последовательно по мере прогресса скролла:
  - При progress > 0.3: панель 1 "Базовая часть"
  - При progress > 0.6: панель 2 "Съёмная подвеска"  
  - При progress > 0.9: панель 3 "Система фиксации"
- Каждая панель: белая рамка 1px, белый текст, padding 16px, fade-in при появлении

Правая колонка:
- SVG чертёж центрирован
- Фон: `--blueprint-blue` (#1A6BFF) унаследован от секции
- Сетка чертежа: CSS `background-image: linear-gradient(...)` с тонкими белыми линиями

---

## Важно

- Не трогай логику слайдера при hover на карточку — она работает правильно
- Не трогай форму подписки — она работает правильно
- После всех правок проверь что переключение языка работает на всех секциях
- Проверь в браузере на ширинах: 1440px, 1024px, 768px, 375px

## Правка #19: Маятник в секции подписки на рассылку

### Контекст

В секции подписки на рассылку (`#preorder` / `#subscribe`) нужно добавить физический маятник — пуллер на цепочке, подвешенный к верхней границе секции. Реализовать через **Matter.js**.

---

### Поведение

- Пуллер висит на цепочке, прикреплённой к верхней границе секции (невидимая точка крепления)
- При скролле до секции — получает лёгкий начальный импульс и раскачивается
- При движении мышью над секцией — реагирует на курсор (лёгкое притяжение или отталкивание)
- Физика: гравитация, инерция, затухание. Маятник постепенно успокаивается

---

### Реализация

#### HTML

Добавить canvas внутрь секции подписки, **до** основного контента:

```html
<section id="preorder">
  <canvas id="pendulum-canvas"></canvas>
  
  <!-- существующий контент секции -->
  <div class="preorder-content">
    ...
  </div>
</section>
```

Canvas позиционировать абсолютно, занимает верхнюю часть секции:

```css
#preorder {
  position: relative;
}

#pendulum-canvas {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  pointer-events: none; /* мышь проходит сквозь canvas к контенту */
  z-index: 1;
}

.preorder-content {
  position: relative;
  z-index: 2;
  padding-top: 180px; /* отступ чтобы контент не перекрывал маятник */
}
```

---

### JavaScript (pendulum.js)

```javascript
// Ждём загрузки изображения перед инициализацией Matter.js
const pendulumImg = new Image();
pendulumImg.src = 'images/Logo.svg'; // или Logo.png

pendulumImg.onload = function () {
  initPendulum();
};

function initPendulum() {
  const { Engine, Render, Runner, Bodies, Body, Composite, Constraint, Events, Mouse, MouseConstraint } = Matter;

  const canvas = document.getElementById('pendulum-canvas');
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;

  canvas.width = W;
  canvas.height = H;

  // Движок
  const engine = Engine.create();
  const world = engine.world;
  engine.gravity.y = 1;

  // Рендерер
  const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: W,
      height: H,
      background: 'transparent',
      wireframes: false,
    }
  });

  // Точка крепления (невидимая, статичная)
  const anchorX = W / 2;
  const anchorY = 0;

  // Тело маятника — прямоугольник с текстурой логотипа
  const pendulumBody = Bodies.rectangle(anchorX + 40, 140, 60, 60, {
    restitution: 0.3,
    frictionAir: 0.015,
    render: {
      sprite: {
        texture: pendulumImg.src,
        xScale: 60 / pendulumImg.width,
        yScale: 60 / pendulumImg.height,
      }
    }
  });

  // Ограничение — "верёвка" от точки крепления до тела
  const rope = Constraint.create({
    pointA: { x: anchorX, y: anchorY },
    bodyB: pendulumBody,
    pointB: { x: 0, y: -30 },
    length: 120,
    stiffness: 0.9,
    render: {
      strokeStyle: '#FFFFFF',
      lineWidth: 1.5,
      type: 'line' // прямая линия; для цепочки можно использовать 'spring'
    }
  });

  Composite.add(world, [pendulumBody, rope]);

  // Начальный импульс при появлении секции в viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        Body.applyForce(pendulumBody, pendulumBody.position, { x: 0.005, y: 0 });
      }
    });
  }, { threshold: 0.3 });

  observer.observe(document.getElementById('preorder'));

  // Реакция на движение мыши
  const section = document.getElementById('preorder');
  section.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const dx = mouseX - pendulumBody.position.x;
    Body.applyForce(pendulumBody, pendulumBody.position, {
      x: dx * 0.000015,
      y: 0
    });
  });

  // Запуск
  Render.run(render);
  const runner = Runner.create();
  Runner.run(runner, engine);

  // Прозрачный фон canvas (перерисовка каждого кадра)
  Events.on(render, 'beforeRender', () => {
    render.context.clearRect(0, 0, W, H);
  });
}
```

---

### Важные детали

- `pointer-events: none` на canvas — чтобы мышь и клики проходили к форме подписки
- Фон canvas прозрачный — не перекрывает фон секции
- Цвет верёвки: белый если фон секции тёмный, чёрный если светлый — подбери по факту
- Если `Logo.svg` не загружается как текстура в Matter.js — использовать `Logo.png` (SVG иногда не поддерживается как спрайт в Matter.js)
- Подключить Matter.js в `index.html` если ещё не подключён:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js"></script>
  ```
- Подключить `pendulum.js` после Matter.js и после основного контента страницы:
  ```html
  <script src="js/pendulum.js"></script>
  ```

---

### Что не трогать

- Не изменяй структуру формы подписки
- Не изменяй стили `.preorder-content` кроме добавления `padding-top`
- Не добавляй маятник в другие секции