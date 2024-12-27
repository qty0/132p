const canvas = document.getElementById('gameCanvas');//ищет элемент в html с указанным идентификатором (id)
const ctx = canvas.getContext('2d');//переменная ctx будет содержать объект, через который мы рисуем линии, фигуры, текст и другие элементы на холсте.

canvas.width = 1920;
canvas.height = 1080;

const gameObjects = {
    main: {
        x: canvas.width / 2,
        y: canvas.height / 1.7,
        size: 190,
        color: 'white',
        direction: -1,
        speed: 3,
        changeDirectionTimer: 0, //таймер связанный с изменением направления движения какого-то объекта
        
        move() {
            this.changeDirectionTimer++;//каждый раз когда вызывается функция к таймеру прибавляется 1
            if (this.changeDirectionTimer > 50) {
                this.direction = Math.random() > 0.5 ? -1 : 1;//берется рандомное значение если больше 0.5 то движется влево ,если меньше вправо
                this.changeDirectionTimer = 0;//сброс таймера после смены движения
            }
            this.x += this.speed * this.direction; //Обновляет (this.x) с помощью умножения скорости на направление движения
            if (this.x <= 0 || this.x >= canvas.width - this.size) { //чтобы не вышел за границы если вышел меняем направление
                this.direction *= -1;
            }
        },
        
        draw() { //рисуем шарик
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + this.size/2, this.y + this.size/2, this.size/2, 0, Math.PI * 2);
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
    ]
};

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисуем фон цвет неба и земли 
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height/2);
    ctx.fillStyle = '#556B2F';
    ctx.fillRect(0, canvas.height/2, canvas.width, canvas.height/2);
    
    // Отрисовка объектов
    gameObjects.main.move();
    gameObjects.main.draw();
    
    gameObjects.collectables.forEach(collectable => {
        collectable.draw();
    });
    
    requestAnimationFrame(gameLoop); //запрашивает следующий кадр анимации, передавая ей gameLoop как аргумент
}

gameLoop(); //процесс обновления и отрисовки.