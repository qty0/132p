let input = {
    leftPressed: false,
    rightPressed: false
};

// отслеживания нажатий клавиш
document.addEventListener('keydown', function(event) {
    switch (event.key) {
        case 'a':
            input.leftPressed = true;
            break;
        case 'd':
            input.rightPressed = true;
            break;
    }
});

document.addEventListener('keyup', function(event) {
    switch (event.key) {
        case 'a':
            input.leftPressed = false;
            break;
        case 'd':
            input.rightPressed = false;
            break;
    }
});

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1920;
canvas.height = 1080;

const gameObjects = {
    player: {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 100,
        color: 'red',
        speed: 5,
        isJumping: false,
        isFalling: false,
        
        move() {
            // движение по горизонатали
            if (input.leftPressed && this.x > 0) {
                this.x -= this.speed;
            } else if (input.rightPressed && this.x < canvas.width - this.size) {
                this.x += this.speed;
            }

            //  состояние прыжка и падения
            if (!this.isFalling) {
                if (this.isJumping) {
                    this.y -= 15;
                    if (this.y <= canvas.height / 2 - 250) {
                        this.isJumping = false;
                    }
                } else if (this.y < canvas.height / 2) {
                    this.y += 3;
                }
            } else {
                this.y += 5;
                if (this.y > canvas.height + this.size) {
                    this.reset();
                }
            }
        },
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
}

// Массив для хранения всех врагов
gameObjects.enemies = [];

// Функция для создания нового врага
function spawnEnemy() {
    let newEnemy = {
        x: getRandomInt(50, canvas.width - 100),
        y: canvas.height / 2,
        size: 70,
        color: 'red',
        speed: 2,
        direction: 1,
        patrolStart: 500,
        patrolEnd: 700,
        isAlive: true,
        
        move() {
            if (this.isAlive) {
                this.x += this.speed * this.direction;
                if (this.x <= this.patrolStart || this.x >= this.patrolEnd) {
                    this.direction *= -1;
                }
            }
        },
        
        draw() {
            if (this.isAlive) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            }
        },
        
        checkCollision(player) {
            if (!this.isAlive) return false;
            
            const dx = (this.x + this.size / 2) - (player.x + player.size / 2);
            const dy = (this.y + this.size / 2) - (player.y + player.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < (this.size / 2 + player.size / 2)) {
                // Если игрок прыгает сверху на врага
                if (player.y < this.y && player.isJumping) {
                    this.isAlive = false;
                    player.isJumping = true;
                    return false;
                }
                return true;
            }
            return false;
        }
    };
    
    // Добавляем нового врага в массив
    gameObjects.enemies.push(newEnemy);
}

// Генерация случайного целого числа в заданном диапазоне
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем фон
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height / 2);
    ctx.fillStyle = '#2E8B57';
    ctx.fillRect(0, canvas.height / 2, canvas.width, canvas.height / 2);
    
    // Обновляем и рисуем врагов
    gameObjects.enemies.forEach(enemy => {
        enemy.move();
        enemy.draw();
        enemy.checkCollision(gameObjects.player);
    });
    
    // Обновляем и рисуем игрока
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
    
    requestAnimationFrame(gameLoop);
}

// Управление
document.addEventListener('keydown', (e) => {
    if (!gameObjects.player.isFalling) {
        switch(e.key) {
            case ' ':
                gameObjects.player.isJumping = true;
                break;
            case 'a':
                gameObjects.player.x -= gameObjects.player.speed;
                break;
            case 'd':
                gameObjects.player.x += gameObjects.player.speed;
                break;
        }
    }
});

// Запускаем игру
spawnEnemy();
gameLoop();

