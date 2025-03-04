document.addEventListener('DOMContentLoaded', () => {
    // Константы для звуков
    const uiSound = document.getElementById('uiSound');
    const clickSound = document.getElementById('clickSound');
    const udarSound = new Audio('udar.mp3');
    const backgroundMusic = document.getElementById('backgroundMusic');

    // Константы для элементов интерфейса
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('startScreen');
    const tutorialScreen = document.getElementById('tutorialScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const eatenScreen = document.getElementById('eatenScreen');
    const playButton = document.getElementById('playButton');
    const tutorialButton = document.getElementById('tutorialButton');
    const restartButton = document.getElementById('restartButton');
    const restartButtonEaten = document.getElementById('restartButtonEaten');
    const settingsWindow = document.getElementById('settingsWindow');
    const reassignOverlay = document.getElementById('reassignOverlay');
    const tutorialVideo = document.getElementById('tutorialVideo');
    const mori1Video = document.getElementById('mori1Video');
    const mina1Video = document.getElementById('mina1Video');
    const tutorialButtons = document.getElementById('tutorialButtons');
    const minaButton = document.getElementById('minaButton');
    const backButton = document.getElementById('backButton');
    const moriButton = document.getElementById('moriButton');
    const volumeControl = document.getElementById('volumeControl');
    const toggleSoundControl = document.getElementById('toggleSoundControl');
    const bottleVideo = document.getElementById('bottleVideo');

    // Константы для управления
    const controls = {
        left: 'KeyA',
        right: 'KeyD',
        jump: 'Space',
        musicOff: 'Digit1',
        musicOn: 'Digit2'
    };

    // Инициализация переменных
    let input = { leftPressed: false, rightPressed: false };
    let score = 0;
    let isGameOver = false;
    let isEaten = false;
    let isPaused = false;
    let isSettingsOpen = false;
    let isReassigning = false;
    let currentReassignControl = null;
    let isSoundEnabled = true;
    let isGrounded = true;
    let isJumping = false;
    let canShoot = true; 
    let bottleActive = false; 
    let bottleX = 0;
    let bottleY = 0;
    let bottleSpeedX = 0;
    let bottleSpeedY = 0;
    let isMouseControlDisabled = true; 

    // Начальная высота спавна персонажа
    const initialY = canvas.height / 2 + canvas.height / 15 + 200 + 422; 

    // Установка громкости
    udarSound.volume = 0.1;
    uiSound.volume = 0.2;
    backgroundMusic.volume = 0.05;
    volumeControl.value = 0.25;

    // Установка размеров canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Предзагрузка звуков
    [uiSound, clickSound, udarSound, backgroundMusic].forEach(sound => sound.load());

    // Обработчики событий
    playButton.addEventListener('click', startGame);
    tutorialButton.addEventListener('click', showTutorial);
    minaButton.addEventListener('click', () => playVideo(mina1Video));
    moriButton.addEventListener('click', () => playVideo(mori1Video));
    backButton.addEventListener('click', hideTutorial);
    restartButton.addEventListener('click', restartGame);
    restartButtonEaten.addEventListener('click', restartGame);
    volumeControl.addEventListener('input', adjustVolume);
    toggleSoundControl.addEventListener('click', toggleSound);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousedown', handleMouseDown);
    document.querySelectorAll('.controlTile').forEach(tile => {
        tile.addEventListener('mouseenter', () => uiSound.play());
        if (tile.id !== 'toggleSoundControl') {
            tile.addEventListener('click', () => reassignControl(tile));
        }
    });

    // Функции
    function startGame() {
        startScreen.style.display = 'none';
        backgroundMusic.play();
        clickSound.play();
        isMouseControlDisabled = true; 
        setTimeout(() => {
            isMouseControlDisabled = false; 
        }, 1000);
        gameLoop();
    }

    function showTutorial() {
        startScreen.style.backgroundColor = '';
        tutorialScreen.style.display = 'block';
        tutorialVideo.style.display = 'block';
        tutorialVideo.play();
        clickSound.play();
        isPaused = true;

        tutorialVideo.onended = () => {
            tutorialButtons.style.display = 'flex';
            tutorialButtons.style.animation = 'slideUp 0.5s ease-out';
        };
    }

    function playVideo(video) {
        tutorialVideo.style.display = 'none';
        video.style.display = 'block';
        video.play();
        clickSound.play();
        tutorialButtons.style.display = 'none';

        video.onended = () => {
            video.pause();
            tutorialButtons.style.display = 'flex';
            tutorialButtons.style.animation = 'slideUp 0.2s ease-out';
        };
    }

    function hideTutorial() {
        tutorialScreen.style.display = 'none';
        tutorialVideo.style.display = 'none';
        mori1Video.style.display = 'none';
        mina1Video.style.display = 'none';
        tutorialButtons.style.display = 'none';
        startScreen.style.display = 'block';
        isPaused = false;
    }

    function restartGame() {
        isGameOver = false;
        isEaten = false;
        gameOverScreen.style.display = 'none';
        eatenScreen.style.display = 'none';
        gameObjects.player.reset();
        gameObjects.collectables.forEach(collectable => collectable.video.remove());
        gameObjects.collectables = [];
        gameObjects.enemies = [];
        score = 0;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
        spawnCollectable();
        spawnRedEnemy();
        clickSound.play();
    }

    function adjustVolume() {
        backgroundMusic.volume = volumeControl.value;
        if (isSettingsOpen) backgroundMusic.play();
    }

    function toggleSound() {
        isSoundEnabled = !isSoundEnabled;
        toggleSoundControl.style.backgroundColor = isSoundEnabled ? 'green' : 'red';
        uiSound.muted = !isSoundEnabled;
        udarSound.muted = !isSoundEnabled;
        clickSound.play();
    }

    function handleKeyDown(e) {
        if (isReassigning) {
            if (currentReassignControl) {
                controls[currentReassignControl] = e.code;
                updateControlDisplay();
                isReassigning = false;
                reassignOverlay.style.display = 'none';
            }
            return;
        }

        if (e.code === 'Escape' && !isReassigning) {
            toggleSettings();
            return;
        }

        if (isPaused) return;

        if (e.code === controls.left) input.leftPressed = true;
        if (e.code === controls.right) input.rightPressed = true;
        if (e.code === controls.jump && isGrounded) {
            gameObjects.player.isJumping = true;
            isGrounded = false;
            isJumping = true;
            canShoot = true; // Разрешаем выстрел при прыжке
        }
        if (e.code === controls.musicOff) backgroundMusic.pause();
        if (e.code === controls.musicOn) backgroundMusic.play();
    }

    function handleKeyUp(e) {
        if (e.code === controls.left) input.leftPressed = false;
        if (e.code === controls.right) input.rightPressed = false;
    }

    function handleMouseDown(e) {
        if (isMouseControlDisabled) return; // Если управление мышкой заблокировано, ничего не делаем

        if (isJumping && canShoot) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            bottleX = gameObjects.player.x + gameObjects.player.size / 2;
            bottleY = gameObjects.player.y + gameObjects.player.size / 2;

            const angle = Math.atan2(mouseY - bottleY, mouseX - bottleX);
            bottleSpeedX = Math.cos(angle) * 10;
            bottleSpeedY = Math.sin(angle) * 10;

            bottleVideo.src = 'bottle.webm';
            bottleVideo.autoplay = true;
            bottleVideo.loop = false;
            bottleVideo.style.display = 'block';
            bottleVideo.style.left = `${bottleX}px`;
            bottleVideo.style.top = `${bottleY}px`;
            bottleActive = true;
            canShoot = false; // Запрещаем выстрел до следующего прыжка
        }
    }

    function toggleSettings() {
        isSettingsOpen = !isSettingsOpen;
        isPaused = isSettingsOpen;
        settingsWindow.style.display = isSettingsOpen ? 'block' : 'none';
        settingsWindow.style.animation = isSettingsOpen ? 'slideIn 0.5s ease-out' : 'slideOut 0.5s ease-out';
        if (isSettingsOpen) backgroundMusic.pause();
        else if (startScreen.style.display === 'none' && tutorialScreen.style.display === 'none') backgroundMusic.play();
    }

    function updateControlDisplay() {
        document.getElementById('leftControl').textContent = `Влево (${controls.left})`;
        document.getElementById('rightControl').textContent = `Вправо (${controls.right})`;
        document.getElementById('jumpControl').textContent = `Прыжок (${controls.jump})`;
        document.getElementById('musicOffControl').textContent = `Выключить музыку (${controls.musicOff})`;
        document.getElementById('musicOnControl').textContent = `Включить музыку (${controls.musicOn})`;
    }

    function reassignControl(tile) {
        if (!isReassigning) {
            isReassigning = true;
            currentReassignControl = tile.id.replace('Control', '').toLowerCase();
            reassignOverlay.style.display = 'block';
            uiSound.play();
            clickSound.play();
        }
    }

    // Игровые объекты
    const gameObjects = {
        player: {
            x: canvas.width / 2,
            y: initialY,
            size: 50,
            color: '#FFA500',
            speed: 5,
            isJumping: false,
            isFalling: false,
            move() {
                if (!isGameOver && !isEaten && !isPaused) {
                    if (!this.isJumping || this.isFalling) this.x -= this.speed / 1.5;
                    if (input.leftPressed && this.x > 0) this.x -= this.speed;
                    if (input.rightPressed && this.x < canvas.width - this.size) this.x += this.speed;

                    if (this.isJumping) {
                        this.y -= 10;
                        if (this.y <= initialY - 350) {
                            this.isJumping = false;
                            this.isFalling = true;
                        }
                    } else if (this.isFalling) {
                        this.y += 6;
                        if (this.y >= initialY) {
                            this.y = initialY;
                            this.isFalling = false;
                            isGrounded = true;
                            isJumping = false;
                        }
                    }
                }

                if (this.x <= 0) gameOver();
            },
            reset() {
                this.x = canvas.width / 2;
                this.y = initialY;
                this.isJumping = false;
                this.isFalling = false;
                isGrounded = true;
                isJumping = false;
            },
            draw() {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            }
        },
        conveyor: {
            x: 0,
            y: canvas.height / 2 + canvas.height / 3.6,
            width: canvas.width,
            height: 35,
            speed: 2,
            draw() {
                ctx.fillStyle = '#333';
                ctx.fillRect(this.x, this.y, this.width, this.height);

                ctx.fillStyle = '#666';
                for (let i = 0; i < this.width; i += 50) {
                    ctx.beginPath();
                    ctx.arc(this.x + i + 10, this.y + 10, 5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(this.x + i + 40, this.y + 10, 5, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.strokeStyle = '#666';
                ctx.lineWidth = 5;
                for (let i = 0; i < this.width; i += 50) {
                    ctx.beginPath();
                    ctx.moveTo(this.x + i + (this.x % 50), this.y);
                    ctx.lineTo(this.x + i + (this.x % 50), this.y + this.height);
                    ctx.stroke();
                }

                ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
                ctx.fillRect(this.x, this.y + this.height, this.width, 10);
            },
            move() {
                if (!isGameOver && !isPaused) {
                    this.x -= this.speed;
                    if (this.x < -50) this.x = 0;
                }
            }
        },
        collectables: [],
        enemies: []
    };

    function spawnCollectable() {
        const video = document.createElement('video');
        video.src = 'muxa.webm';
        video.autoplay = true;
        video.loop = true;
        video.style.position = 'absolute';
        video.style.width = '200px';
        video.style.height = '200px';
        video.style.display = 'none';
        document.body.appendChild(video);

        const speeds = [3, 10, 14]; // Возможные значения скорости
        const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)]; // Случайный выбор скорости

        const newCollectable = {
            x: Math.floor(Math.random() * (canvas.width - 200)) + 50,
            y: (canvas.height / 2) - (canvas.height / 3),
            size: 200,
            speed: randomSpeed, // Используем случайную скорость
            direction: 1,
            patrolStart: 50,
            patrolEnd: canvas.width - 100,
            isAlive: true,
            video: video,
            move() {
                if (this.isAlive && !isGameOver && !isPaused) {
                    if (this.x % (canvas.width / 3) < 1) {
                        if (Math.random() < 0.5) this.direction *= -1;
                    }
                    this.x += this.speed * this.direction;
                    if (this.x <= this.patrolStart || this.x >= this.patrolEnd) this.direction *= -1;
                }
            },
            draw() {
                if (this.isAlive) {
                    this.video.style.left = `${this.x}px`;
                    this.video.style.top = `${this.y}px`;
                    this.video.style.transform = this.direction === 1 ? 'scaleX(1)' : 'scaleX(-1)';
                    this.video.style.display = 'block';
                } else {
                    this.video.style.display = 'none';
                }
            }
        };
        gameObjects.collectables.push(newCollectable);
    }

    function spawnRedEnemy() {
        const newRedEnemy = {
            x: Math.random() < 0.5
                ? Math.floor(Math.random() * (canvas.width / 2 - 600))
                : Math.floor(Math.random() * (canvas.width / 2 - 600)) + (canvas.width / 2 + 600),
            y: canvas.height / 2 + canvas.height / 4,
            size: 50,
            color: '#FF0000',
            speed: 4,
            direction: 1,
            patrolStart: 0,
            patrolEnd: canvas.width,
            isAlive: true,
            move() {
                if (this.isAlive && !isGameOver && !isPaused) {
                    if (this.direction === 1 && gameObjects.player.x > this.x && !gameObjects.player.isJumping && !gameObjects.player.isFalling) {
                        this.speed = 14;
                    } else if (this.direction === -1 && gameObjects.player.x < this.x && !gameObjects.player.isJumping && !gameObjects.player.isFalling) {
                        this.speed = 14;
                    } else {
                        this.speed = 5;
                    }

                    this.x += this.speed * this.direction;
                    if (this.x <= this.patrolStart || this.x >= this.patrolEnd) this.direction *= -1;
                }
            },
            draw() {
                if (this.isAlive) {
                    ctx.fillStyle = this.color;
                    ctx.fillRect(this.x, this.y, this.size, this.size);
                }
            },
            checkCollision(player) {
                if (!this.isAlive) return false;
                const dx = (this.x + this.size / 2) - (player.x + player.size / 2);
                const dy = (this.y + this.size / 2) - (player.y + player.size / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    isEaten = true;
                    eatenScreen.style.display = 'block';
                    backgroundMusic.pause();
                    return true;
                }
                return false;
            }
        };
        gameObjects.enemies.push(newRedEnemy);
    }

    function gameOver() {
        isGameOver = true;
        gameOverScreen.style.display = 'block';
        backgroundMusic.pause();
    }

    function gameLoop() {
        if (!isPaused) {
            // Очистка canvas и установка черного фона
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            gameObjects.conveyor.draw();
            gameObjects.conveyor.move();

            gameObjects.collectables.forEach(collectable => {
                collectable.move();
                collectable.draw();
            });

            gameObjects.enemies.forEach(enemy => {
                enemy.move();
                enemy.draw();
                enemy.checkCollision(gameObjects.player);
            });

            gameObjects.player.move();
            gameObjects.player.draw();

            // Логика для бутылки
            if (bottleActive) {
                bottleX += bottleSpeedX;
                bottleY += bottleSpeedY;

                bottleVideo.style.left = `${bottleX}px`;
                bottleVideo.style.top = `${bottleY}px`;

                // Проверка столкновения бутылки с collectables
                gameObjects.collectables.forEach((collectable) => {
                    if (collectable.isAlive) {
                        const dx = (collectable.x + collectable.size / 2) - (bottleX +  50);
                        const dy = (collectable.y + collectable.size / 2) - (bottleY + 50);
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < (collectable.size / 2 + 10)) {
                            collectable.isAlive = false;
                            collectable.video.remove();
                            score += 1;
                            udarSound.play();
                            spawnCollectable();
                            bottleActive = false;
                            bottleVideo.style.display = 'none';
                        }
                    }
                });

                // Если бутылка выходит за пределы экрана, скрываем ее
                if (bottleX < 0 || bottleX > canvas.width || bottleY < 0 || bottleY > canvas.height) {
                    bottleActive = false;
                    bottleVideo.style.display = 'none';
                }
            }

            if (gameObjects.player.y > canvas.height) gameObjects.player.reset();

            if (score > 0) {
                ctx.font = "50px 'Type', sans-serif";
                ctx.fillStyle = "#f8f8ff";
                ctx.fillText("Счёт: " + score, 10, 100);
            }
        }

        requestAnimationFrame(gameLoop);
    }

    spawnCollectable();
    spawnRedEnemy();
});