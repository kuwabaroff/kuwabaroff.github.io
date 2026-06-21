// Функции для блокировки/разблокировки скролла
function lockScroll() {
  document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  document.body.style.overflow = '';
}

// Экспортируем функции
window.scrollLock = {
  lock: lockScroll,
  unlock: unlockScroll
};