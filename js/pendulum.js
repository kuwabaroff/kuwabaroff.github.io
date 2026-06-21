// Физика маятника в секции каталога
let engine;
let render;
let pendulumBody;
let mouseConstraint;

function initPendulum() {
  const section = document.querySelector('.catalog');
  if (!section) return;

  // Получаем canvas
  const canvas = document.getElementById('pendulum-canvas');
  if (!canvas) return;

  // Инициализируем Matter.js
  engine = Matter.Engine.create();
  render = Matter.Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      width: 60,
      height: 80,
      wireframes: false,
      background: 'transparent'
    }
  });

  // Создаём тело маятника (логотип)
  pendulumBody = Matter.Bodies.rectangle(30, 40, 32, 32, {
    render: {
      sprite: {
        texture: '../images/Logo.png',
        xScale: 32 / 100,
        yScale: 32 / 100
      }
    }
  });

  // Создаём верхнюю границу (точка крепления)
  const topConstraint = Matter.Constraint.create({
    pointA: { x: 30, y: 0 },
    bodyB: pendulumBody,
    pointB: { x: 0, y: -40 },
    stiffness: 0.01
  });

  // Добавляем в мир
  Matter.Composite.add(engine.world, [pendulumBody, topConstraint]);

  // Запускаем рендер
  Matter.Render.run(render);
  Matter.Runner.run(engine);

  // Обработка скролла
  let lastScrollY = window.scrollY;
  window.addEventListener('scroll', () => {
    const scrollDelta = window.scrollY - lastScrollY;
    if (Math.abs(scrollDelta) > 5) {
      Matter.Body.applyForce(pendulumBody, pendulumBody.position, {
        x: scrollDelta * 0.0005,
        y: 0
      });
    }
    lastScrollY = window.scrollY;
  });

  // Обработка движения мыши
  section.addEventListener('mousemove', (e) => {
    const rect = section.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    Matter.Body.applyForce(pendulumBody, pendulumBody.position, {
      x: (x - rect.width / 2) * 0.00001,
      y: (y - rect.height / 2) * 0.00001
    });
  });
}