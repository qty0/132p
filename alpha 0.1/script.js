document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('startScreen');
    const tutorialScreen = document.getElementById('tutorialScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const eatenScreen = document.getElementById('eatenScreen');
    const playButton = document.getElementById('playButton');
    const tutorialButton = document.getElementById('tutorialButton');
    const closeTutorialButton = document.getElementById('closeTutorialButton');
    const restartButton = document.getElementById('restartButton');
    const restartButtonEaten = document.getElementById('restartButtonEaten');
    const settingsWindow = document.getElementById('settingsWindow');
    const reassignOverlay = document.getElementById('reassignOverlay');
    const uiSound = document.getElementById('uiSound');

    let input = { leftPressed: false, rightPressed: false };
    let score = 0;
    let isGameOver = false;
    let isEaten = false;
    let isPaused = false;
    let lastJumpTime = 0;
    const jumpCooldown = 900;

    const backgroundMusic = document.getElementById('backgroundMusic');
    const volumeControl = document.getElementById('volumeControl');

    let isSettingsOpen = false;
    let isReassigning = false;
    let currentReassignControl = null;

    const controls = {
        left: 'KeyA',
        right: 'KeyD',
        jump: 'Space',
        musicOff: 'Digit1',
        musicOn: 'Digit2'
    };

    // Set canvas size based on window size
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    backgroundMusic.volume = 0.10;
    volumeControl.value = 0.25;

    let volumeFadeTimeout;
    volumeControl.addEventListener('input', () => {
        backgroundMusic.volume = volumeControl.value;
        if (volumeFadeTimeout) clearTimeout(volumeFadeTimeout);
        if (isSettingsOpen) {
            backgroundMusic.play();

        }
    });

    playButton.addEventListener('click', () => {
        startScreen.style.display = 'none';
        backgroundMusic.play();
        gameLoop();
    });

    tutorialButton.addEventListener('click', () => {
        tutorialScreen.style.display = 'block';
    });

    closeTutorialButton.addEventListener('click', () => {
        tutorialScreen.style.display = 'none';
    });

    document.addEventListener('keydown', (e) => {
        if (isReassigning) {
            if (currentReassignControl) {
                controls[currentReassignControl] = e.code;
                updateControlDisplay();
                isReassigning = false;
                reassignOverlay.style.display = 'none';
                uiSound.play();
            }
            return;
        }

        if (e.code === 'Escape' && !isReassigning) {
            toggleSettings();
            uiSound.play();
            return;
        }

        if (isPaused) return;

        if (e.code === controls.left) {
            input.leftPressed = true;
            gameObjects.player.speed = 6.25;
        }
        if (e.code === controls.right) {
            input.rightPressed = true;
            gameObjects.player.speed = 2.5;
        }
        if (e.code === controls.jump && !gameObjects.player.isFalling && Date.now() - lastJumpTime > jumpCooldown) {
            gameObjects.player.isJumping = true;
            lastJumpTime = Date.now();
        }

        if (e.code === controls.musicOff) {
            backgroundMusic.pause();
        }
        if (e.code === controls.musicOn) {
            backgroundMusic.play();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code === controls.left) {
            input.leftPressed = false;
            gameObjects.player.speed = 5;
        }
        if (e.code === controls.right) {
            input.rightPressed = false;
            gameObjects.player.speed = 5;
        }
    });

    function toggleSettings() {
        isSettingsOpen = !isSettingsOpen;
        isPaused = isSettingsOpen;
        settingsWindow.style.display = isSettingsOpen ? 'block' : 'none';
        if (isSettingsOpen) {
            backgroundMusic.pause();
        } else {
            // Если игрок находится на стартовом экране или в обучении, музыка не воспроизводится
            if (startScreen.style.display === 'none' && tutorialScreen.style.display === 'none') {
                backgroundMusic.play();
            }
        }
    }

    function updateControlDisplay() {
        document.getElementById('leftControl').textContent = `Влево (${controls.left})`;
        document.getElementById('rightControl').textContent = `Вправо (${controls.right})`;
        document.getElementById('jumpControl').textContent = `Прыжок (${controls.jump})`;
        document.getElementById('musicOffControl').textContent = `Выключить музыку (${controls.musicOff})`;
        document.getElementById('musicOnControl').textContent = `Включить музыку (${controls.musicOn})`;
    }

    document.querySelectorAll('.controlTile').forEach(tile => {
        tile.addEventListener('click', () => {
            if (!isReassigning) {
                isReassigning = true;
                currentReassignControl = tile.id.replace('Control', '').toLowerCase();
                reassignOverlay.style.display = 'block';
                uiSound.play();
            }
        });
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
                if (!isGameOver && !isEaten && !isPaused) {
                    if (!this.isJumping || this.isFalling) {
                        this.x -= this.speed / 1.5;
                    }

                    if (input.leftPressed && this.x > 0) this.x -= this.speed;
                    if (input.rightPressed && this.x < canvas.width - this.size) this.x += this.speed;

                    if (!this.isFalling) {
                        if (this.isJumping) {
                            this.y -= 25;
                            if (this.y <= canvas.height / 2 - 400) this.isJumping = false;
                        } else if (this.y < canvas.height / 2) this.y += 3;
                    } else {
                        this.y += 4.5;
                        if (this.y > canvas.height + this.size) this.reset();
                    }

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
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.size, this.size);

                ctx.strokeStyle = '#32CD32';
                ctx.lineWidth = 2;
                for (let i = 0; i < this.size; i += 10) {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y + i);
                    ctx.lineTo(this.x + this.size, this.y + i);
                    ctx.stroke();
                }

                const headWidth = this.size * 0.8;
                const headHeight = this.size * 0.4;
                const headX = this.x + (this.size - headWidth) / 2;
                const headY = this.y - headHeight;
                ctx.fillStyle = '#444';
                ctx.fillRect(headX, headY, headWidth, headHeight);

                const antennaWidth = headWidth * 0.1;
                const antennaHeight = headHeight * 0.5;
                const antennaX = headX + (headWidth - antennaWidth) / 2;
                const antennaY = headY - antennaHeight;
                ctx.fillStyle = '#666';
                ctx.fillRect(antennaX, antennaY, antennaWidth, antennaHeight);

                const eyeWidth = headWidth * 0.3;
                const eyeHeight = headHeight * 0.5;
                const eyeOffsetX = headWidth * 0.1;
                const eyeOffsetY = headHeight * 0.25;
                ctx.fillStyle = '#FF0000';
                ctx.fillRect(headX + eyeOffsetX, headY + eyeOffsetY, eyeWidth, eyeHeight);
                ctx.fillRect(headX + headWidth - eyeOffsetX - eyeWidth, headY + eyeOffsetY, eyeWidth, eyeHeight);

                const mouthY = headY + headHeight * 0.8;
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(headX + eyeOffsetX, mouthY);
                ctx.lineTo(headX + headWidth - eyeOffsetX, mouthY);
                ctx.stroke();

                const armWidth = this.size * 0.2;
                const armHeight = this.size * 0.6;
                const leftArmX = this.x - armWidth;
                const rightArmX = this.x + this.size;
                const armY = this.y + this.size * 0.2;
                ctx.fillStyle = '#444';
                ctx.fillRect(leftArmX, armY, armWidth, armHeight);
                ctx.fillRect(rightArmX, armY, armWidth, armHeight);

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

                const legWidth = this.size * 0.3;
                const legHeight = this.size * 0.4;
                const leftLegX = this.x + this.size * 0.1;
                const rightLegX = this.x + this.size * 0.6;
                const legY = this.y + this.size;
                ctx.fillStyle = '#444';
                ctx.fillRect(leftLegX, legY, legWidth, legHeight);
                ctx.fillRect(rightLegX, legY, legWidth, legHeight);

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

                const shoulderWidth = this.size * 0.3;
                const shoulderHeight = this.size * 0.1;
                const leftShoulderX = this.x - shoulderWidth;
                const rightShoulderX = this.x + this.size;
                const shoulderY = this.y;
                ctx.fillStyle = '#666';
                ctx.fillRect(leftShoulderX, shoulderY, shoulderWidth, shoulderHeight);
                ctx.fillRect(rightShoulderX, shoulderY, shoulderWidth, shoulderHeight);

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
                    ctx.fillStyle = '#000';
                    ctx.fillRect(this.x, this.y, this.width, this.height);

                    ctx.fillStyle = '#FFF';
                    this.stars.forEach(star => {
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                        ctx.fill();
                    });
                },
                move() {
                    if (!isGameOver && !isPaused) {
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
                    ctx.fillStyle = '#222';
                    ctx.fillRect(this.x, this.y, this.width, this.height);

                    this.planets.forEach(planet => {
                        ctx.beginPath();
                        ctx.arc(planet.x, planet.y, planet.size, 0, Math.PI * 2);
                        ctx.fillStyle = planet.color;
                        ctx.fill();
                    });

                    ctx.fillStyle = '#444';
                    ctx.fillRect(this.x + 100, this.y + 50, 200, 50);
                    ctx.fillRect(this.x + 400, this.y + 100, 300, 50);
                    ctx.fillRect(this.x + 800, this.y + 150, 200, 50);

                    ctx.fillStyle = '#FFD700';
                    ctx.fillRect(this.x + 120, this.y + 60, 10, 10);
                    ctx.fillRect(this.x + 420, this.y + 110, 10, 10);
                    ctx.fillRect(this.x + 820, this.y + 160, 10, 10);
                },
                move() {
                    if (!isGameOver && !isPaused) {
                        this.planets.forEach(planet => {
                            planet.x -= planet.speed;
                            if (planet.x < -planet.size) planet.x = this.width + planet.size;
                        });
                    }
                }
            }
        ],

        collectables: [],
        enemies: []
    };

    function spawnCollectable() {
        const newCollectable = {
            x: Math.floor(Math.random() * (canvas.width - 100)) + 50,
            y: (canvas.height / 2) - (canvas.height / 12), size: 100, color: 'gray', speed: 10, direction: 1, patrolStart: 0, patrolEnd: canvas.width, isAlive: true,
            wingAngle: 0,
            move() {
                if (this.isAlive && !isGameOver && !isPaused) {
                    this.x += this.speed * this.direction;
                    if (this.x <= this.patrolStart || this.x >= this.patrolEnd) this.direction *= -1;
                    this.wingAngle += 0.2;
                }
            },
            draw() {
                if (this.isAlive) {
                    ctx.fillStyle = '#f8f8ff';
                    ctx.beginPath();
                    ctx.ellipse(this.x, this.y, this.size / 2, this.size / 3, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#FF0000';
                    ctx.beginPath();
                    ctx.arc(this.x - this.size / 4, this.y - this.size / 6, this.size / 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(this.x + this.size / 4, this.y - this.size / 6, this.size / 8, 0, Math.PI * 2);
                    ctx.fill();

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
                        spawnCollectable();
                        return false;
                    }
                    return true;
                }
                return false;
            }
        };
        gameObjects.collectables.push(newCollectable);
    }

    function spawnRedEnemy() {
        const newRedEnemy = {
            x: Math.random() < 0.5 
            ? Math.floor(Math.random() * (canvas.width / 2 - 400)) // Левая сторона
            : Math.floor(Math.random() * (canvas.width / 2 - 400)) + (canvas.width / 2 + 400),
            y: canvas.height / 2, size: 80, color: 'red', speed: 8, direction: 1, patrolStart: 0, patrolEnd: canvas.width, isAlive: true,
            wingAngle: 0,
            move() {
                if (this.isAlive && !isGameOver && !isPaused) {       
                    if (this.direction === 1 && gameObjects.player.x > this.x && !gameObjects.player.isJumping && !gameObjects.player.isFalling) {
                        this.speed = 12; 
                    } else if (this.direction === -1 && gameObjects.player.x < this.x && !gameObjects.player.isJumping && !gameObjects.player.isFalling) {
                        this.speed = 12;
                    } else {
                        this.speed = 8;
                    }

                    this.x += this.speed * this.direction;
                    if (this.x <= this.patrolStart || this.x >= this.patrolEnd) this.direction *= -1;
                    this.wingAngle += 0.2;
                }
            },
            draw() {
                if (this.isAlive) {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.ellipse(this.x, this.y, this.size / 2, this.size / 3, 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.arc(this.x - this.size / 4, this.y - this.size / 6, this.size / 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(this.x + this.size / 4, this.y - this.size / 6, this.size / 8, 0, Math.PI * 2);
                    ctx.fill();

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
                if (distance < 120 && player.y === canvas.height / 2) {
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

    function restartGame() {
        isGameOver = false;
        isEaten = false;
        gameOverScreen.style.display = 'none';
        eatenScreen.style.display = 'none';
        gameObjects.player.reset();
        gameObjects.collectables = [];
        gameObjects.enemies = [];
        score = 0;
        backgroundMusic.currentTime = 0;
        backgroundMusic.play();
        spawnCollectable();
        spawnRedEnemy();
    }

    restartButton.addEventListener('click', () => {
        restartGame();
    });

    restartButtonEaten.addEventListener('click', () => {
        restartGame();
    });

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        gameObjects.backgroundObjects.forEach(obj => {
            obj.draw();
            obj.move();
        });

        gameObjects.conveyor.draw();
        gameObjects.conveyor.move();

        gameObjects.collectables.forEach(collectable => {
            collectable.move();
            collectable.draw();
            collectable.checkCollision(gameObjects.player);
        });

        gameObjects.enemies.forEach(enemy => {
            enemy.move();
            enemy.draw();
            enemy.checkCollision(gameObjects.player);
        });

        gameObjects.player.move();
        gameObjects.player.draw();

        if (gameObjects.player.y > canvas.height) {
            gameObjects.player.reset();
        }

        if (score > 0) {
            ctx.font = "50px 'Type', sans-serif";
            ctx.fillStyle = "#f8f8ff";
            ctx.fillText("Счёт: " + score, 10, 100);
        }

        requestAnimationFrame(gameLoop);
    }

    gameObjects.backgroundObjects[0].init();
    spawnCollectable();
    spawnRedEnemy();
});