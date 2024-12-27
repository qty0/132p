//-
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1920;
canvas.height = 1080;

//-

let input = {
    leftPressed: false,
    rightPressed: false
};

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

//-

const gameObjects = {
    player: {
        x: 1200,
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
        
        reset() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.isFalling = false;
        },
        
        draw() {
             // Основной круг для тела монстра
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.size / 2, this.y + this.size / 2, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Глаза
        const eyeSize = this.size / 4;
        const eyeOffsetX = this.size / 6;
        const eyeOffsetY = this.size / 8;
        
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x + eyeOffsetX, this.y - eyeOffsetY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x - eyeOffsetX, this.y - eyeOffsetY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Зрачки
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x + eyeOffsetX, this.y - eyeOffsetY, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x - eyeOffsetX, this.y - eyeOffsetY, eyeSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Рот
        const mouthWidth = this.size / 2;
        const mouthHeight = this.size / 10;
        const mouthStartX = this.x - mouthWidth / 2;
        const mouthStartY = this.y + this.size / 4;
        
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.rect(mouthStartX, mouthStartY, mouthWidth, mouthHeight);
        ctx.fill();
        
        // Зубы
        const toothWidth = mouthWidth / 5;
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(mouthStartX + i * toothWidth, mouthStartY, toothWidth, mouthHeight);
        }
        
        // Рога
        const hornLength = this.size / 3;
        const hornBaseX = this.x - hornLength / 2;
        const hornBaseY = this.y - this.size / 2;
        
        ctx.fillStyle = 'gray';
        ctx.beginPath();
        ctx.moveTo(hornBaseX, hornBaseY);
        ctx.lineTo(hornBaseX + hornLength, hornBaseY - hornLength);
        ctx.lineTo(hornBaseX + hornLength * 2, hornBaseY);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(this.x + hornLength / 2, hornBaseY);
        ctx.lineTo(this.x + hornLength * 1.5, hornBaseY - hornLength);
        ctx.lineTo(this.x + hornLength * 2.5, hornBaseY);
        ctx.closePath();
        ctx.fill();
        }
    },
collectables: [
        {
            x: 500, //  положение оси X
            y: 200, // положение оси Y
            size: 40, // Размер звезды
            color: 'gold', // Цвет звезды
            isCollected: false, 
            draw() { 
                if (!this.isCollected) {
                    const points = 8; // Количество вершин 
                    const outerRadius = this.size; // Внешний радиус 
                    const innerRadius = outerRadius / 2; // Внутренний радиус 
                    
                    ctx.save(); 
                    ctx.translate(this.x, this.y); 
                    ctx.rotate(-90 * Math.PI / 180); 
                    ctx.beginPath(); 
                    
                    for (let i = 0; i < points; i++) {
                        let angle = i / points * Math.PI * 2 + Math.PI / 2; 
                        let xOuter = Math.cos(angle) * outerRadius;
                        let yOuter = Math.sin(angle) * outerRadius;
                        let xInner = Math.cos(angle + Math.PI / points) * innerRadius;
                        let yInner = Math.sin(angle + Math.PI / points) * innerRadius;
                        
                        ctx.lineTo(xOuter, yOuter); 
                        ctx.lineTo(xInner, yInner); 
                    }
                    
                    ctx.closePath(); 
                    ctx.fillStyle = this.color; 
                    ctx.fill(); 
                    ctx.restore(); 
                }
            }
        },
        {
            x: 1200,
            y: 150,
            size: 30,
            color: 'gold', 
            isCollected: false, 
            draw() { 
                if (!this.isCollected) {
                    const points = 8; 
                    const outerRadius = this.size; 
                    const innerRadius = outerRadius / 2; 
                    
                    ctx.save(); 
                    ctx.translate(this.x, this.y); 
                    ctx.rotate(-90 * Math.PI / 180); 
                    ctx.beginPath(); 
                    
                    for (let i = 0; i < points; i++) {
                        let angle = i / points * Math.PI * 2 + Math.PI / 2; 
                        let xOuter = Math.cos(angle) * outerRadius;
                        let yOuter = Math.sin(angle) * outerRadius;
                        let xInner = Math.cos(angle + Math.PI / points) * innerRadius;
                        let yInner = Math.sin(angle + Math.PI / points) * innerRadius;
                        
                        ctx.lineTo(xOuter, yOuter); 
                        ctx.lineTo(xInner, yInner); 
                    }
                    
                    ctx.closePath(); 
                    ctx.fillStyle = this.color; 
                    ctx.fill(); 
                 
                    ctx.restore();              
                }
            }
        }
    ],

    canyons: [
        {
       x: 400,
       y: canvas.height / 2,
       width: 300,
       height: canvas.height / 2,
       
       draw() {
           const gradient = ctx.createLinearGradient(
               this.x, this.y, this.x, this.y + this.height
           );
           gradient.addColorStop(0, '#964B00');
           gradient.addColorStop(1, '#311800'); 

           ctx.fillStyle = gradient;
           ctx.fillRect(this.x, this.y, this.width, this.height);
       },
       
       checkCollision(player) {
           return (
               player.x + 45  > this.x &&
               player.x < this.x + this.width &&
               player.y + 45 > this.y
           );
           }
       }
   ]  
};     

// Массив для хранения всех врагов
gameObjects.enemies = [];

score = 0;

// Функция для создания нового врага
function spawnEnemy() {
    let newEnemy = {
        x: getRandomInt(50, canvas.width - 100),
        y: 400,
        size: 50,
        color: 'gray',
        speed: 10,
        direction: 1,
        patrolStart: -200,
        patrolEnd: 2100,
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
                // Основной прямоугольник для корпуса мусорного бака
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
        
                // Колеса
                const wheelRadius = this.size / 4;
                const wheelOffset = this.size / 4;
        
                ctx.beginPath();
                ctx.fillStyle = '#000'; // Цвет колес
                ctx.arc(this.x + wheelOffset, this.y + this.size, wheelRadius, 0, Math.PI * 2);
                ctx.fill();
        
                ctx.beginPath();
                ctx.arc(this.x + this.size - wheelOffset, this.y + this.size, wheelRadius, 0, Math.PI * 2);
                ctx.fill();
        
                // Крышка мусорного бака
                ctx.fillStyle = '#333'; // Цвет крышки
                ctx.fillRect(this.x, this.y, this.size, this.size / 2);
        
                // Рукоятка
                ctx.fillStyle = '#555'; // Цвет рукоятки
                ctx.fillRect(this.x + this.size / 2 - 5, this.y - 15, 10, 30);
            }
        },
        
        // Функция проверки коллизий между игроком и врагом
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
                    score += 1; // Увеличиваем счетчик очков
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
    
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#6B8E23';
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 380, canvas.width, 10);
    // каньоны
    gameObjects.canyons.forEach(canyon => {
        canyon.draw();
        if (canyon.checkCollision(gameObjects.player)) {
            gameObjects.player.isFalling = true;
        }
    });

    // Обновляем и рисуем врагов
    gameObjects.enemies.forEach(enemy => {
        enemy.move();
        enemy.draw();
        enemy.checkCollision(gameObjects.player);
    });
    
    gameObjects.collectables.forEach(collectable => {
        collectable.draw();
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
        ctx.font = "50px BigNoodleTooOblique";
        ctx.fillStyle = "#000";
        ctx.fillText("Счёт: " + score, 10, 50);
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
