// Получаем элементы игры
const target = document.getElementById('target');
const counterDisplay = document.getElementById('counter');
const energyBar = document.getElementById('energy-bar');
const miniGameButton = document.getElementById('start-mini-game');
const miniGame = document.getElementById('mini-game');
const triangle = document.getElementById('triangle');
const miniScoreDisplay = document.getElementById('mini-score');
const closeMiniGameButton = document.getElementById('close-mini-game');

let counter = 0;
let energy = 100; // Максимальный уровень энергии
const energyDecrease = 5; // Энергия, которая уменьшается с каждым кликом
const miniGameEnergyCost = 30; // Стоимость энергии для мини-игры
const energyRecoveryInterval = 10000; // Восстановление 1 единицы энергии каждые 10 секунд
let miniGameActive = false;
let miniGameScore = 0;

// Функция для отображения покраснения в месте клика
function showHitEffect(event) {
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Создаем круг для эффекта
    const hitEffect = document.createElement('div');
    hitEffect.className = 'hit-effect';
    hitEffect.style.left = `${x}px`;
    hitEffect.style.top = `${y}px`;

    target.appendChild(hitEffect);

    // Удаляем эффект через 300 мс
    setTimeout(() => {
        target.removeChild(hitEffect);
    }, 300);
}

// Функция для удара
function slap(event) {
    if (energy >= 5) {
        counter++;
        counterDisplay.textContent = counter;

        // Уменьшаем энергию
        energy = Math.max(energy - energyDecrease, 0);
        updateEnergyBar();

        // Показать эффект удара
        showHitEffect(event);

        // Обновляем счет в базе данных
        updateScore(10);
    } else {
        alert("Недостаточно энергии для удара!");
    }
}

// Обновление шкалы энергии
function updateEnergyBar() {
    energyBar.style.width = `${energy}%`;
}

// Восстановление энергии
setInterval(() => {
    if (energy < 100) {
        energy = Math.min(energy + 1, 100);
        updateEnergyBar();
    }
}, energyRecoveryInterval);

// Функция для обновления очков через API
function updateScore(points) {
    const userId = new URLSearchParams(window.location.search).get('user_id');
    fetch('/api/updateScore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, score: points })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score updated:', data.message);
    })
    .catch(error => {
        console.error('Error updating score:', error);
    });
}

// Запуск мини-игры
function startMiniGame() {
    if (energy >= miniGameEnergyCost) {
        energy -= miniGameEnergyCost;
        updateEnergyBar();

        miniGame.classList.remove('hidden');
        miniGameActive = true;
        miniGameScore = 0;
        miniScoreDisplay.textContent = miniGameScore;

        let rectanglesDropped = 0;
        const dropInterval = setInterval(() => {
            if (rectanglesDropped >= 25 || !miniGameActive) {
                clearInterval(dropInterval);

                // Завершение игры через 10 секунд после появления последнего прямоугольника
                setTimeout(endMiniGame, 10000);
                return;
            }
            createFallingRectangle();
            rectanglesDropped++;
        }, 500);
    } else {
        alert("Недостаточно энергии для запуска мини-игры!");
    }
}

// Завершение мини-игры
function endMiniGame() {
    miniGameActive = false;
    alert(`Мини-игра завершена! Вы набрали ${miniGameScore} очков.`);
    miniGame.classList.add('hidden');
}

// Создание падающего прямоугольника
function createFallingRectangle() {
    const rectangle = document.createElement('div');
    rectangle.classList.add('rectangle');
    rectangle.style.left = `${Math.random() * (window.innerWidth - 50)}px`;

    miniGame.appendChild(rectangle);

    let fallSpeed = 100; // Очень быстрая скорость падения
    const fallInterval = setInterval(() => {
        const rect = rectangle.getBoundingClientRect();
        const triangleRect = triangle.getBoundingClientRect();

        // Проверка на столкновение с треугольником
        if (
            rect.bottom >= triangleRect.top &&
            rect.left < triangleRect.right &&
            rect.right > triangleRect.left
        ) {
            miniGameScore += 5; // Добавляем 5 очков за попадание
            updateScore(5); // Обновляем очки в базе данных
            miniGame.removeChild(rectangle);
            clearInterval(fallInterval);
        } else if (rect.top >= window.innerHeight) {
            miniGame.removeChild(rectangle);
            clearInterval(fallInterval);
        } else {
            rectangle.style.top = `${rect.top + fallSpeed}px`;
        }
    }, 10); // Уменьшаем интервал обновления позиции для увеличения скорости
}

// Движение треугольника и объекта
document.addEventListener('mousemove', (event) => {
    if (miniGameActive) {
        // Поднимаем треугольник на треть экрана
        triangle.style.left = `${event.clientX - 25}px`;
        triangle.style.top = `${window.innerHeight * 2 / 3}px`;
    }
});

// Инициализация игры
document.addEventListener('DOMContentLoaded', () => {
    // Обработчики событий
    target.addEventListener('click', slap);
    miniGameButton.addEventListener('click', startMiniGame);
    closeMiniGameButton.addEventListener('click', endMiniGame);
});

