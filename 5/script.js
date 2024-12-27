let input = {
    leftPressed: false,
    rightPressed: false
};

// отслеживания нажатий клавиш
document.addEventListener('keydown', function(event) { //нажата клавиша
    switch (event.key) {
        case 'a':
            input.leftPressed = true;
            break;
        case 'd':
            input.rightPressed = true;
            break;
    }
});

document.addEventListener('keyup', function(event) { //лавиша отпущена
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
            if (!this.isFalling) { // Если объект не падает...
                if (this.isJumping) {
                    this.y -= 15;
                    if (this.y <= canvas.height / 2 - 250) { // Если высота достигла определенной 
                        this.isJumping = false; // Прекращаем прыжок
                    }
                } else if (this.y < canvas.height / 2) { //Если объект не прыгает и находится выше центра экрана (y < canvas.height / 2), он медленно опускается вниз
                    this.y += 3;
                }
            } else {
                this.y += 5;
                if (this.y > canvas.height + this.size) {
                    this.reset(); //Если объект опустился ниже нижней границы экрана -  reset.
                }
            }
        },
        
        reset() {
            this.x = canvas.width / 2;
            this.y = canvas.height / 2;
            this.isFalling = false;
        },
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
            ctx.fill();
        }
    },
    
    canyons: [
         {
        x: 200,
        y: canvas.height / 2,
        width: 400,
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
                player.x + player.size > this.x && //правая сторона игрока  пересекается с левой стороной объекта
                player.x < this.x + this.width && //левая сторона игрока находится внутри ширины объекта 
                player.y + player.size > this.y // нижняя сторона игрока касается с верхней стороной объекта
            );
            }
        }
    ]  
};


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //  фон рисовка 
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#6B8E23';
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
    
    // рисовка каньонов
    gameObjects.canyons.forEach(canyon => {
        canyon.draw();
        if (canyon.checkCollision(gameObjects.player)) {
            gameObjects.player.isFalling = true;
        }
    });
    
    gameObjects.player.move();
    gameObjects.player.draw();
    
    requestAnimationFrame(gameLoop);
}

// управление
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

gameLoop(); 