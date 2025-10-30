// Game variables
let canvas, ctx;
let player;
let platforms = [];
let spikes = [];
let movingPlatforms = [];
let sawBlades = [];
let deathCount = 0;
let startTime = 0;
let currentTime = 0;
let gameRunning = false;
let gamePaused = false;
let lastTime = 0;
let difficultyMultiplier = 1;

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create player
    player = {
        x: canvas.width / 2 - 15,
        y: canvas.height - 100,
        width: 30,
        height: 30,
        color: '#ff0000',
        velocityX: 0,
        velocityY: 0,
        speed: 5,
        jumpForce: 12,
        isJumping: false,
        gravity: 0.5
    };
    
    // Create level (brutally difficult)
    createHellishLevel();
    
    // Event listeners
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('retry-btn').addEventListener('click', restartGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('resume-btn').addEventListener('click', togglePause);
    document.getElementById('quit-btn').addEventListener('click', quitGame);
    
    // Keyboard controls
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('keyup', keyUpHandler);
    
    // Touch controls for mobile
    setupTouchControls();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

// Resize canvas to window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
// Create an extremely difficult level
function createHellishLevel() {
    platforms = [];
    spikes = [];
    movingPlatforms = [];
    sawBlades = [];
    
    // Starting platform
    platforms.push({
        x: 0,
        y: canvas.height - 50,
        width: canvas.width,
        height: 50,
        color: '#333'
    });
    
    // Add impossible obstacles (even more brutal)
    for (let i = 0; i < 100; i++) { // Increased from 75 to 100
        // Random platforms (more frequent)
        if (Math.random() > 0.1) { // Decreased threshold from 0.2 to 0.1
            platforms.push({
                x: Math.random() * (canvas.width - 80),
                y: Math.random() * (canvas.height - 200),
                width: 20 + Math.random() * 50, // Made platforms smaller
                height: 5 + Math.random() * 10, // Made platforms thinner
                color: '#555'
            });
        }
        
        // Spikes (more frequent)
        if (Math.random() > 0.2) { // Decreased threshold from 0.3 to 0.2
            spikes.push({
                x: Math.random() * (canvas.width - 20),
                y: Math.random() * (canvas.height - 80),
                width: 20,
                height: 20,
                color: '#ff0000'
            });
        }
        
        // Moving platforms (more aggressive)
        if (Math.random() > 0.3) { // Decreased threshold from 0.5 to 0.3
            movingPlatforms.push({
                x: Math.random() * (canvas.width - 80),
                y: Math.random() * (canvas.height - 200),
                width: 20 + Math.random() * 50, // Made platforms smaller
                height: 5 + Math.random() * 10, // Made platforms thinner
                color: '#777',
                speed: 3 + Math.random() * 7, // Increased speed range
                direction: Math.random() > 0.5 ? 1 : -1,
                minX: Math.random() * (canvas.width / 4), // Reduced range
                maxX: canvas.width / 4 + Math.random() * (canvas.width / 2) // Reduced range
            });
        }
        
        // Saw blades (more deadly)
        if (Math.random() > 0.4) { // Decreased threshold from 0.6 to 0.4
            sawBlades.push({
                x: Math.random() * (canvas.width - 40),
                y: Math.random() * (canvas.height - 40),
                radius: 10 + Math.random() * 30, // Increased size range
                speed: 3 + Math.random() * 10, // Increased speed range
                angle: 0,
                color: '#ff0000'
            });
        }
    }
    
    // Make sure there's at least one path (but it's nearly impossible)
    createAlmostImpossiblePath();
    
    // Add extra death traps
    addExtraDeathTraps();
}
// Add even more brutal death traps
function addExtraDeathTraps() {
    // Narrow passages with spikes
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * (canvas.width - 100);
        const y = Math.random() * (canvas.height - 200);
        
        // Create narrow passage
        platforms.push({
            x: x,
            y: y,
            width: 20,
            height: 100,
            color: '#555'
        });
        
        // Surround with spikes
        for (let j = 0; j < 5; j++) {
            spikes.push({
                x: x - 30,
                y: y + j * 20,
                width: 20,
                height: 20,
                color: '#ff0000'
            });
            
            spikes.push({
                x: x + 30,
                y: y + j * 20,
                width: 20,
                height: 20,
                color: '#ff0000'
            });
        }
    }
    
    // Flying saw blade corridors
    for (let i = 0; i < 5; i++) {
        const startX = Math.random() * canvas.width;
        const endX = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height - 200);
        
        for (let j = 0; j < 3; j++) {
            sawBlades.push({
                x: startX + j * 50,
                y: y,
                radius: 20,
                speed: 4,
                angle: 0,
                color: '#ff0000',
                startX: startX,
                endX: endX,
                direction: 1
            });
        }
    }
}
// Create a nearly impossible path to the top
function createAlmostImpossiblePath() {
    const pathWidth = 20; // Made platforms narrower
    const pathHeight = 10; // Made platforms shorter
    const steps = 40; // Increased from 30 to 40 steps
    const stepHeight = (canvas.height - 150) / steps;
    
    let currentX = canvas.width / 2 - pathWidth / 2;
    
    for (let i = 0; i < steps; i++) {
        // Add tiny platforms with massive gaps
        platforms.push({
            x: currentX,
            y: canvas.height - 100 - (i * stepHeight),
            width: pathWidth,
            height: pathHeight,
            color: '#444'
        });
        
        // Randomly shift position drastically to make it harder
        currentX += (Math.random() * 400 - 200); // Increased gap size
        currentX = Math.max(0, Math.min(currentX, canvas.width - pathWidth));
        
        // Add spikes everywhere
        spikes.push({
            x: currentX - 30,
            y: canvas.height - 100 - (i * stepHeight) - 30,
            width: 30,
            height: 30,
            color: '#ff0000'
        });
        
        spikes.push({
            x: currentX + pathWidth,
            y: canvas.height - 100 - (i * stepHeight) - 30,
            width: 30,
            height: 30,
            color: '#ff0000'
        });
        
        // Add moving obstacles frequently
        if (i % 1 === 0) { // Increased frequency
            sawBlades.push({
                x: currentX + pathWidth / 2,
                y: canvas.height - 100 - (i * stepHeight) - 50,
                radius: 25, // Larger saw blades
                speed: 6, // Faster movement
                angle: 0,
                color: '#ff0000'
            });
        }
        
        // Add moving platforms in the way
        if (i % 2 === 0) { // Increased frequency
            movingPlatforms.push({
                x: currentX - 60,
                y: canvas.height - 100 - (i * stepHeight) - 70,
                width: 30,
                height: 8,
                color: '#777',
                speed: 5, // Faster movement
                direction: Math.random() > 0.5 ? 1 : -1,
                minX: currentX - 150,
                maxX: currentX + 150
            });
        }
    }
}
// Game loop
function gameLoop(timestamp) {
    if (!gamePaused && gameRunning) {
        // Calculate delta time
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;
        
        // Update game state
        update(deltaTime);
        
        // Update timer
        currentTime = Date.now();
        updateTimer();
    }
    
    // Render game
    render();
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    // Apply gravity
    player.velocityY += player.gravity;
    
    // Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Check collisions with platforms
    let onGround = false;
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Collision from top
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                onGround = true;
            }
            // Collision from bottom
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Collision from left
            else if (player.velocityX > 0 && player.x + player.width - player.velocityX <= platform.x) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
            }
            // Collision from right
            else if (player.velocityX < 0 && player.x - player.velocityX >= platform.x + platform.width) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
        }
    });
// Update moving platforms
    movingPlatforms.forEach(platform => {
        platform.x += platform.speed * platform.direction;
        
        // Reverse direction at boundaries
        if (platform.x <= platform.minX || platform.x + platform.width >= platform.maxX) {
            platform.direction *= -1;
        }
        
        // Check collision with player
        if (checkCollision(player, platform)) {
            // If player is on top, move with platform
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.x += platform.speed * platform.direction;
                player.velocityY = 0;
                player.isJumping = false;
                onGround = true;
            }
            // Side collisions kill instantly
            else {
                playerDie();
            }
        }
    });
    
    // Update flying saw blades
    sawBlades.forEach(saw => {
        // Move between start and end points
        if (saw.startX !== undefined && saw.endX !== undefined) {
            saw.x += saw.speed * saw.direction;
            
            if ((saw.direction > 0 && saw.x > saw.endX) || 
                (saw.direction < 0 && saw.x < saw.startX)) {
                saw.direction *= -1;
            }
        }
        
        saw.angle += saw.speed;
    });
// Update saw blades
    sawBlades.forEach(saw => {
        saw.angle += saw.speed;
    });
    
    // Check collisions with spikes and saw blades
    spikes.forEach(spike => {
        if (checkCollision(player, spike)) {
            playerDie();
        }
    });
    
    sawBlades.forEach(saw => {
        // Simple circle collision check
        const centerX = saw.x;
        const centerY = saw.y;
        const playerCenterX = player.x + player.width / 2;
        const playerCenterY = player.y + player.height / 2;
        const distance = Math.sqrt(
            Math.pow(playerCenterX - centerX, 2) + 
            Math.pow(playerCenterY - centerY, 2)
        );
        
        if (distance < saw.radius) {
            playerDie();
        }
    });
    
    // Check if player fell off screen
    if (player.y > canvas.height) {
        playerDie();
    }
// Check if player reached the top (almost impossible)
    if (player.y < 50) {
        // Even if they reach the top, we'll kill them anyway
        playerDie();
    }
    
    // Increase difficulty over time
    difficultyMultiplier = 1 + (currentTime - startTime) / 60000; // Increases by 1 every minute
    
    // Apply difficulty multiplier to moving objects
    movingPlatforms.forEach(platform => {
        platform.speed = Math.min(platform.speed * difficultyMultiplier, 15); // Cap at 15
    });
    
    sawBlades.forEach(saw => {
        saw.speed = Math.min(saw.speed * difficultyMultiplier, 20); // Cap at 20
    });
}
// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw platforms
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw moving platforms
    movingPlatforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Draw spikes
    spikes.forEach(spike => {
        ctx.fillStyle = spike.color;
        ctx.beginPath();
        ctx.moveTo(spike.x, spike.y + spike.height);
        ctx.lineTo(spike.x + spike.width / 2, spike.y);
        ctx.lineTo(spike.x + spike.width, spike.y + spike.height);
        ctx.closePath();
        ctx.fill();
    });
    
    // Draw saw blades
    sawBlades.forEach(saw => {
        ctx.save();
        ctx.translate(saw.x, saw.y);
        ctx.rotate(saw.angle * Math.PI / 180);
        
        // Draw saw blade
        ctx.fillStyle = saw.color;
        ctx.beginPath();
        ctx.arc(0, 0, saw.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw teeth
        ctx.fillStyle = '#000';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x1 = Math.cos(angle) * saw.radius;
            const y1 = Math.sin(angle) * saw.radius;
            const x2 = Math.cos(angle) * (saw.radius + 10);
            const y2 = Math.sin(angle) * (saw.radius + 10);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(x1, y1