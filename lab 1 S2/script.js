const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartButton = document.getElementById('restartButton');

// Устанавливаем размеры canvas в зависимости от размеров окна браузера
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let input = { leftPressed: false, rightPressed: false };
let score = 0;
let isGameOver = false;
let isDarkened = false;
let lastJumpTime = 0; // Время последнего прыжка
const jumpCooldown = 500; // Пауза между прыжками в миллисекундах

// Получаем элемент аудио и регулятор громкости
const backgroundMusic = document.getElementById('backgroundMusic');
const volumeControl = document.getElementById('volumeControl');

// Устанавливаем начальную громкость и включаем музыку
backgroundMusic.volume = volumeControl.value;
backgroundMusic.play();

// Обработчик изменения громкости
volumeControl.addEventListener('input', () => {
    backgroundMusic.volume = volumeControl.value;
});

// Управление
document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyA') input.leftPressed = true;
    if (e.code === 'KeyD') input.rightPressed = true;
    if (e.code === 'Space' && !gameObjects.player.isFalling && Date.now() - lastJumpTime > jumpCooldown) {
        gameObjects.player.isJumping = true;
        lastJumpTime = Date.now(); // Записываем время последнего прыжка
    }

    // Управление музыкой
    if (e.code === 'Digit1') {
        backgroundMusic.pause();
    }
    if (e.code === 'Digit2') {
        backgroundMusic.play();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'KeyA') input.leftPressed = false;
    if (e.code === 'KeyD') input.rightPressed = false;
});

const gameObjects = {
    player: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 100,
        color: '#7CFC00',
        speed: 5,
        isJumping: false,
        isFalling: false,
        move() {
            if (!isGameOver) {
                if (input.leftPressed && this.x > 0) this.x -= this.speed;
                if (input.rightPressed && this.x < canvas.width - this.size) this.x += this.speed;

                if (!this.isFalling) {
                    if (this.isJumping) {
                        this.y -= 15;
                        if (this.y <= canvas.height / 2 - 250) this.isJumping = false;
                    } else if (this.y < canvas.height / 2) this.y += 3;
                } else {
                    this.y += 5;
                    if (this.y > canvas.height + this.size) this.reset();
                }

                // Проверка на достижение левого края
                if (this.x <= 0) {
                    gameOver();
                }
            }
        },
        reset() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.isFalling = false;
        },
        draw() {
            // Основное тело робота
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);

            // Добавляем текстуру на рубашку (полоски)
            ctx.strokeStyle = '#32CD32';
            ctx.lineWidth = 2;
            for (let i = 0; i < this.size; i += 10) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + i);
                ctx.lineTo(this.x + this.size, this.y + i);
                ctx.stroke();
            }

            // Голова робота
            const headWidth = this.size * 0.8;
            const headHeight = this.size * 0.4;
            const headX = this.x + (this.size - headWidth) / 2;
            const headY = this.y - headHeight;
            ctx.fillStyle = '#444';
            ctx.fillRect(headX, headY, headWidth, headHeight);

            // Антенна
            const antennaWidth = headWidth * 0.1;
            const antennaHeight = headHeight * 0.5;
            const antennaX = headX + (headWidth - antennaWidth) / 2;
            const antennaY = headY - antennaHeight;
            ctx.fillStyle = '#666';
            ctx.fillRect(antennaX, antennaY, antennaWidth, antennaHeight);

            // Глаза-дисплеи (красные)
            const eyeWidth = headWidth * 0.3;
            const eyeHeight = headHeight * 0.5;
            const eyeOffsetX = headWidth * 0.1;
            const eyeOffsetY = headHeight * 0.25;
            ctx.fillStyle = '#FF0000';
            ctx.fillRect(headX + eyeOffsetX, headY + eyeOffsetY, eyeWidth, eyeHeight);
            ctx.fillRect(headX + headWidth - eyeOffsetX - eyeWidth, headY + eyeOffsetY, eyeWidth, eyeHeight);

            // Рот (линия)
            const mouthY = headY + headHeight * 0.8;
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(headX + eyeOffsetX, mouthY);
            ctx.lineTo(headX + headWidth - eyeOffsetX, mouthY);
            ctx.stroke();

            // Руки
            const armWidth = this.size * 0.2;
            const armHeight = this.size * 0.6;
            const leftArmX = this.x - armWidth;
            const rightArmX = this.x + this.size;
            const armY = this.y + this.size * 0.2;
            ctx.fillStyle = '#444';
            ctx.fillRect(leftArmX, armY, armWidth, armHeight);
            ctx.fillRect(rightArmX, armY, armWidth, armHeight);

            // Детализация рук (полоски)
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            for (let i = 0; i < armHeight; i += 10) {
                ctx.beginPath();
                ctx.moveTo(leftArmX, armY + i);
                ctx.lineTo(leftArmX + armWidth, armY + i);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(rightArmX, armY + i);
                ctx.lineTo(rightArmX + armWidth, armY + i);
                ctx.stroke();
            }

            // Ноги
            const legWidth = this.size * 0.3;
            const legHeight = this.size * 0.4;
            const leftLegX = this.x + this.size * 0.1;
            const rightLegX = this.x + this.size * 0.6;
            const legY = this.y + this.size;
            ctx.fillStyle = '#444';
            ctx.fillRect(leftLegX, legY, legWidth, legHeight);
            ctx.fillRect(rightLegX, legY, legWidth, legHeight);

            // Детализация ног (полоски)
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 2;
            for (let i = 0; i < legHeight; i += 10) {
                ctx.beginPath();
                ctx.moveTo(leftLegX, legY + i);
                ctx.lineTo(leftLegX + legWidth, legY + i);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(rightLegX, legY + i);
                ctx.lineTo(rightLegX + legWidth, legY + i);
                ctx.stroke();
            }

            // Броня на плечах
            const shoulderWidth = this.size * 0.3;
            const shoulderHeight = this.size * 0.1;
            const leftShoulderX = this.x - shoulderWidth;
            const rightShoulderX = this.x + this.size;
            const shoulderY = this.y;
            ctx.fillStyle = '#666';
            ctx.fillRect(leftShoulderX, shoulderY, shoulderWidth, shoulderHeight);
            ctx.fillRect(rightShoulderX, shoulderY, shoulderWidth, shoulderHeight);

            // Детализация брони (болты)
            const boltRadius = 3;
            ctx.fillStyle = '#888';
            ctx.beginPath();
            ctx.arc(leftShoulderX + shoulderWidth / 2, shoulderY + shoulderHeight / 2, boltRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(rightShoulderX + shoulderWidth / 2, shoulderY + shoulderHeight / 2, boltRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    conveyor: {
        x: 0,
        y: canvas.height / 2 + 100,
        width: canvas.width,
        height: 50,
        speed: 2,
        draw() {
            // Основа конвейера
            ctx.fillStyle = '#333';
            ctx.fillRect(this.x, this.y, this.width, this.height);

            // Детализация конвейера (болты)
            ctx.fillStyle = '#666';
            for (let i = 0; i < this.width; i += 50) {
                ctx.beginPath();
                ctx.arc(this.x + i + 10, this.y + 10, 5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.x + i + 40, this.y + 10, 5, 0, Math.PI * 2);
                ctx.fill();
            }

            // Движущиеся полосы на конвейере
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 5;
            for (let i = 0; i < this.width; i += 50) {
                ctx.beginPath();
                ctx.moveTo(this.x + i + (this.x % 50), this.y);
                ctx.lineTo(this.x + i + (this.x % 50), this.y + this.height);
                ctx.stroke();
            }

            // Тени под конвейером
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(this.x, this.y + this.height, this.width, 10);
        },
        move() {
            if (!isGameOver) {
                this.x -= this.speed;
                if (this.x < -50) this.x = 0;
            }
        }
    },

    backgroundObjects: [
        {
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height / 2,
            stars: [],
            init() {
                for (let i = 0; i < 100; i++) {
                    this.stars.push({
                        x: Math.random() * this.width,
                        y: Math.random() * this.height,
                        size: Math.random() * 3,
                        speed: Math.random() * 0.5
                    });
                }
            },
            draw() {
                // Звездное небо
                ctx.fillStyle = '#000';
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // Звезды
                ctx.fillStyle = '#FFF';
                this.stars.forEach(star => {
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                    ctx.fill();
                });
            },
            move() {
                if (!isGameOver) {
                    this.stars.forEach(star => {
                        star.x -= star.speed;
                        if (star.x < 0) star.x = this.width;
                    });
                }
            }
        },
        {
            x: 0,
            y: canvas.height / 2,
            width: canvas.width,
            height: canvas.height / 2,
            planets: [
                { x: 500, y: 100, size: 50, color: '#FF4500', speed: 0.1 },
                { x: 1200, y: 200, size: 80, color: '#00BFFF', speed: 0.2 }
            ],
            draw() {
                // Космическая станция
                ctx.fillStyle = '#222';
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // Планеты
                this.planets.forEach(planet => {
                    ctx.beginPath();
                    ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
                    ctx.fillStyle = planet.color;
                    ctx.fill();
                });

                // Детализация космической станции
                ctx.fillStyle = '#444';
                ctx.fillRect(this.x + 100, this.y + 50, 200, 50);
                ctx.fillRect(this.x + 400, this.y + 100, 300, 50);
                ctx.fillRect(this.x + 800, this.y + 150, 200, 50);

                // Анимация огней на станции
                ctx.fillStyle = '#FFD700';
                ctx.fillRect(this.x + 120, this.y + 60, 10, 10);
                ctx.fillRect(this.x + 420, this.y + 110, 10, 10);
                ctx.fillRect(this.x + 820, this.y + 160, 10, 10);
            },
            move() {
                if (!isGameOver) {
                    this.planets.forEach(planet => {
                        planet.x -= planet.speed;
                        if (planet.x < -planet.size) planet.x = this.width + planet.size;
                    });
                }
            }
        }
    ],

    enemies: []
};

// Массив для хранения всех врагов
gameObjects.enemies = [];

function spawnEnemy() {
    const newEnemy = {
        x: Math.floor(Math.random() * (canvas.width - 100)) + 50,
        y: 400, size: 100, color: 'gray', speed: 10, direction: 1, patrolStart: 0, patrolEnd: canvas.width, isAlive: true,
        wingAngle: 0, // Угол для анимации крыльев
        move() {
            if (this.isAlive && !isGameOver) {
                this.x += this.speed * this.direction;
                if (this.x <= this.patrolStart || this.x >= this.patrolEnd) this.direction *= -1;

                // Анимация крыльев
                this.wingAngle += 0.2;
            }
        },
        draw() {
            if (this.isAlive) {
                // Тело мухи
                ctx.fillStyle = '#f8f8ff';
                ctx.beginPath();
                ctx.ellipse(this.x, this.y, this.size / 2, this.size / 3, 0, 0, Math.PI * 2);
                ctx.fill();

                // Глаза
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(this.x - this.size / 4, this.y - this.size / 6, this.size / 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(this.x + this.size / 4, this.y - this.size / 6, this.size / 8, 0, Math.PI * 2);
                ctx.fill();

                // Крылья
                ctx.strokeStyle = '#f8f8ff';
                ctx.lineWidth = 2;
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(Math.sin(this.wingAngle) * 0.2);
                ctx.beginPath();
                ctx.moveTo(-this.size / 3, 0);
                ctx.lineTo(-this.size / 2, -this.size / 2);
                ctx.lineTo(-this.size / 6, -this.size / 4);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(this.size / 3, 0);
                ctx.lineTo(this.size / 2, -this.size / 2);
                ctx.lineTo(this.size / 6, -this.size / 4);
                ctx.stroke();
                ctx.restore();
            }
        },
        checkCollision(player) {
            if (!this.isAlive) return false;
            const dx = (this.x + this.size / 2) - (player.x + player.size / 2);
            const dy = (this.y + this.size / 2) - (player.y + player.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < (this.size / 2 + player.size / 2)) {
                if (player.y < this.y && player.isJumping) {
                    this.isAlive = false;
                    player.isJumping = true;
                    score += 1;
                    return false;
                }
                return true;
            }
            return false;
        }
    };
    gameObjects.enemies.push(newEnemy);
}

function gameOver() {
    isGameOver = true;
    gameOverScreen.style.display = 'block';
    backgroundMusic.pause(); // Пауза музыки при смерти
}

function restartGame() {
    isGameOver = false;
    gameOverScreen.style.display = 'none';
    gameObjects.player.reset();
    gameObjects.enemies = [];
    score = 0;
    backgroundMusic.currentTime = 0; // Перемотка музыки на начало
    backgroundMusic.play(); // Воспроизведение музыки
}

restartButton.addEventListener('click', restartGame);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Рисуем фон
    gameObjects.backgroundObjects.forEach(obj => {
        obj.draw();
        obj.move();
    });

    // Рисуем конвейер
    gameObjects.conveyor.draw();
    gameObjects.conveyor.move();

    // Обновляем и рисуем врагов
    gameObjects.enemies.forEach(enemy => {
        enemy.move();
        enemy.draw();
        enemy.checkCollision(gameObjects.player);
    });

    gameObjects.player.move();
    gameObjects.player.draw();

    // Проверяем, жив ли игрок
    if (gameObjects.player.y > canvas.height) {
        gameObjects.player.reset();
    }

    // Создаем нового врага, если все погибли
    if (gameObjects.enemies.every(enemy => !enemy.isAlive)) {
        spawnEnemy();
    }

    // Отрисовка текста очков
    if (score > 0) {
        ctx.font = "50px Arial";
        ctx.fillStyle = "#f8f8ff";
        ctx.fillText("Счёт: " + score, 10, 100);
    }

    // Затемнение экрана при завершении игры
    if (isDarkened) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    requestAnimationFrame(gameLoop);
}

// Запускаем игру
gameObjects.backgroundObjects[0].init();
spawnEnemy();
gameLoop();