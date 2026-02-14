// GAME STATE
const gameState = {
    currentScreen: 'menu',
    score: 0,
    highScore: 0,
    totalPoints: 0,
    combo: 0,
    isFlipping: false,
    isCharging: false,
    powerMeter: 0,
    powerDirection: 1,
    rotation: 0,
    position: { x: 50, y: 70 },
    velocity: { x: 0, y: 0, rotation: 0 },
    selectedBottle: 'classic',
    selectedBg: 'sunset',
    ownedBottles: ['classic'],
    particles: [],
    animationFrame: null,
    powerInterval: null
};

// BOTTLE SKINS
const bottles = {
    classic: { name: 'Classic', color: '#3b82f6', price: 0, emoji: '💧' },
    fire: { name: 'Fire', color: '#ef4444', price: 100, emoji: '🔥' },
    neon: { name: 'Neon', color: '#06b6d4', price: 200, emoji: '⚡' },
    gold: { name: 'Gold', color: '#f59e0b', price: 500, emoji: '✨' },
    rainbow: { name: 'Rainbow', color: 'linear-gradient(45deg, #f87171, #fbbf24, #34d399, #60a5fa, #a78bfa)', price: 1000, emoji: '🌈' },
    cosmic: { name: 'Cosmic', color: '#8b5cf6', price: 1500, emoji: '🌌' },
    ice: { name: 'Ice', color: '#06b6d4', price: 2000, emoji: '❄️' },
    lava: { name: 'Lava', color: '#dc2626', price: 3000, emoji: '🌋' }
};

// BACKGROUNDS
const backgrounds = {
    sunset: 'linear-gradient(to bottom, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
    ocean: 'linear-gradient(to bottom, #667eea 0%, #764ba2 100%)',
    forest: 'linear-gradient(to bottom, #134e5e 0%, #71b280 100%)',
    space: 'linear-gradient(to bottom, #000000 0%, #434343 100%)'
};

// DOM ELEMENTS
const elements = {
    container: document.getElementById('game-container'),
    menuScreen: document.getElementById('menu-screen'),
    gameScreen: document.getElementById('game-screen'),
    shopScreen: document.getElementById('shop-screen'),
    settingsScreen: document.getElementById('settings-screen'),
    startBtn: document.getElementById('start-btn'),
    shopBtn: document.getElementById('shop-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    endBtn: document.getElementById('end-btn'),
    shopBackBtn: document.getElementById('shop-back-btn'),
    settingsBackBtn: document.getElementById('settings-back-btn'),
    flipBtn: document.getElementById('flip-btn'),
    bottle: document.getElementById('bottle'),
    bottleEmoji: document.getElementById('bottle-emoji'),
    score: document.getElementById('game-score'),
    comboDisplay: document.getElementById('combo-display'),
    comboText: document.getElementById('combo-text'),
    flipResult: document.getElementById('flip-result'),
    powerMeterBar: document.getElementById('power-meter-bar'),
    powerPercent: document.getElementById('power-percent'),
    zoneIndicator: document.getElementById('zone-indicator'),
    particlesContainer: document.getElementById('particles-container'),
    menuHighScore: document.getElementById('menu-highscore'),
    menuPoints: document.getElementById('menu-points'),
    shopPoints: document.getElementById('shop-points'),
    bottlesGrid: document.getElementById('bottles-grid'),
    backgroundsGrid: document.getElementById('backgrounds-grid')
};

// INITIALIZE
function init() {
    loadGameData();
    setupEventListeners();
    renderShop();
    renderSettings();
    updateBackground();
    updateBottleAppearance();
}

// STORAGE
function loadGameData() {
    try {
        const saved = localStorage.getItem('flippy-bottle-data');
        if (saved) {
            const data = JSON.parse(saved);

            gameState.highScore = data.highScore || 0;
            gameState.totalPoints = data.totalPoints || 0;
            gameState.ownedBottles = data.ownedBottles || ['classic'];
            gameState.selectedBottle = data.selectedBottle || 'classic';
            gameState.selectedBg = data.selectedBg || 'sunset';
        }

        updateMenuStats();
        updateBackground();
        updateBottleAppearance();
        renderShop();
        renderSettings();
    } catch (error) {
        console.log("Load failed:", error);
    }
}


function saveGameData() {
    const data = {
        highScore: gameState.highScore,
        totalPoints: gameState.totalPoints,
        ownedBottles: gameState.ownedBottles,
        selectedBottle: gameState.selectedBottle,
        selectedBg: gameState.selectedBg
    };

    try {
        localStorage.setItem('flippy-bottle-data', JSON.stringify(data));
    } catch (error) {
        console.log("Save failed:", error);
    }
}


// EVENT LISTENERS
function setupEventListeners() {
    elements.startBtn.addEventListener('click', startGame);
    elements.shopBtn.addEventListener('click', () => showScreen('shop'));
    elements.settingsBtn.addEventListener('click', () => showScreen('settings'));
    elements.endBtn.addEventListener('click', endGame);
    elements.shopBackBtn.addEventListener('click', () => showScreen('menu'));
    elements.settingsBackBtn.addEventListener('click', () => showScreen('menu'));
    
    // Flip button - both mouse and touch
    elements.flipBtn.addEventListener('mousedown', startCharging);
    elements.flipBtn.addEventListener('mouseup', releaseFlip);
    elements.flipBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startCharging();
    });
    elements.flipBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        releaseFlip();
    });
}

// SCREEN MANAGEMENT
function showScreen(screen) {
    gameState.currentScreen = screen;
    
    elements.menuScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.shopScreen.classList.remove('active');
    elements.settingsScreen.classList.remove('active');
    
    if (screen === 'menu') {
        elements.menuScreen.classList.add('active');
        updateMenuStats();
    } else if (screen === 'game') {
        elements.gameScreen.classList.add('active');
    } else if (screen === 'shop') {
        elements.shopScreen.classList.add('active');
        updateShopPoints();
    } else if (screen === 'settings') {
        elements.settingsScreen.classList.add('active');
    }
}

// GAME FUNCTIONS
function startGame() {
    gameState.score = 0;
    gameState.combo = 0;
    gameState.rotation = 0;
    gameState.position = { x: 50, y: 70 };
    gameState.isFlipping = false;
    gameState.isCharging = false;
    gameState.powerMeter = 0;
    gameState.powerDirection = 1;
    gameState.velocity = { x: 0, y: 0, rotation: 0 };
    
    elements.score.textContent = '0';
    elements.comboDisplay.style.display = 'none';
    elements.flipResult.style.display = 'none';
    elements.flipBtn.disabled = false;
    elements.flipBtn.textContent = 'HOLD!';
    
    updateBottlePosition();
    showScreen('game');
}

function endGame() {
    const newTotalPoints = gameState.totalPoints + gameState.score;
    const newHighScore = Math.max(gameState.highScore, gameState.score);
    
    gameState.totalPoints = newTotalPoints;
    gameState.highScore = newHighScore;
    
    saveGameData();
    showScreen('menu');
    
    if (gameState.animationFrame) {
        cancelAnimationFrame(gameState.animationFrame);
    }
    if (gameState.powerInterval) {
        clearInterval(gameState.powerInterval);
    }
}

function startCharging() {
    if (gameState.isFlipping || gameState.isCharging) return;
    
    gameState.isCharging = true;
    gameState.powerMeter = 0;
    gameState.powerDirection = 1;
    elements.flipBtn.textContent = 'RELEASE!';
    
    gameState.powerInterval = setInterval(() => {
        gameState.powerMeter += gameState.powerDirection * 1.5;
        
        if (gameState.powerMeter >= 100) {
            gameState.powerDirection = -1;
            gameState.powerMeter = 100;
        }
        if (gameState.powerMeter <= 0) {
            gameState.powerDirection = 1;
            gameState.powerMeter = 0;
        }
        
        updatePowerMeter();
    }, 16);
}

function releaseFlip() {
    if (!gameState.isCharging || gameState.isFlipping) return;
    
    gameState.isCharging = false;
    gameState.isFlipping = true;
    elements.flipBtn.disabled = true;
    
    if (gameState.powerInterval) {
        clearInterval(gameState.powerInterval);
    }
    
    const powerPercent = gameState.powerMeter / 100;
    const power = 6 + (powerPercent * 6);
    
    let rotationSpeed;
    if (gameState.powerMeter >= 60 && gameState.powerMeter <= 95) {
        rotationSpeed = Math.random() > 0.5 ? 360 / 25 : 360 / 12.5;
    } else if (gameState.powerMeter >= 40 && gameState.powerMeter < 60) {
        rotationSpeed = 13 + (Math.random() * 2);
    } else if (gameState.powerMeter > 95 && gameState.powerMeter <= 100) {
        rotationSpeed = 15 + (Math.random() * 2);
    } else {
        rotationSpeed = 10 + (Math.random() * 10);
    }
    
    gameState.velocity = {
        x: (Math.random() - 0.5) * 0.5,
        y: -power,
        rotation: rotationSpeed
    };
    
    gameState.powerMeter = 0;
    updatePowerMeter();
    
    animateFlip();
}

function animateFlip() {
    const animate = () => {
        gameState.position.y += gameState.velocity.y;
        gameState.position.x += gameState.velocity.x;
        
        gameState.velocity.y += 0.8; // Gravity
        gameState.velocity.x *= 0.99;
        gameState.velocity.rotation *= 0.98;
        
        if (gameState.position.y >= 70) {
            gameState.position.y = 70;
            gameState.isFlipping = false;
            checkLanding();
            return;
        }
        
        gameState.rotation += gameState.velocity.rotation;
        updateBottlePosition();
        
        gameState.animationFrame = requestAnimationFrame(animate);
    };
    
    gameState.animationFrame = requestAnimationFrame(animate);
}

function checkLanding() {
    const finalRotation = gameState.rotation % 360;
    const normalizedRotation = finalRotation < 0 ? finalRotation + 360 : finalRotation;
    
    const isPerfect = (normalizedRotation > 335 || normalizedRotation < 25) || 
                      (normalizedRotation > 155 && normalizedRotation < 205);
    
    const isGood = (normalizedRotation > 315 && normalizedRotation < 45) || 
                   (normalizedRotation > 135 && normalizedRotation < 225);
    
    if (isPerfect) {
        gameState.combo++;
        const points = 10 * gameState.combo;
        gameState.score += points;
        showFlipResult('perfect', points);
        createParticles(20, '#fbbf24');
    } else if (isGood) {
        gameState.combo++;
        const points = 5 * gameState.combo;
        gameState.score += points;
        showFlipResult('good', points);
        createParticles(10, '#60a5fa');
    } else {
        gameState.combo = 0;
        showFlipResult('fail', 0);
        setTimeout(endGame, 1000);
        return;
    }
    
    elements.score.textContent = gameState.score;
    updateComboDisplay();
    elements.flipBtn.disabled = false;
    elements.flipBtn.textContent = 'HOLD!';
}

function showFlipResult(type, points) {
    const result = elements.flipResult;
    result.style.display = 'block';
    
    let text = '';
    let color = '';
    
    if (type === 'perfect') {
        text = '🔥 PERFECT!';
        color = '#fbbf24';
    } else if (type === 'good') {
        text = '👍 NICE!';
        color = '#60a5fa';
    } else {
        text = '💀 FAIL!';
        color = '#ef4444';
    }
    
    result.innerHTML = `
        <div class="flip-result-text" style="color: ${color}">${text}</div>
        ${points > 0 ? `<div class="flip-result-points">+${points}</div>` : ''}
    `;
    
    setTimeout(() => {
        result.style.display = 'none';
    }, 2000);
}

function createParticles(count, color) {
    for (let i = 0; i < count; i++) {
        const particle = {
            id: Date.now() + i,
            x: 50,
            y: 70,
            vx: (Math.random() - 0.5) * 10,
            vy: -Math.random() * 8 - 2,
            color: color,
            life: 100
        };
        
        const el = document.createElement('div');
        el.className = 'particle';
        el.style.left = particle.x + '%';
        el.style.top = particle.y + '%';
        el.style.backgroundColor = particle.color;
        el.dataset.id = particle.id;
        elements.particlesContainer.appendChild(el);
        
        gameState.particles.push({ ...particle, element: el });
    }
    
    animateParticles();
}

function animateParticles() {
    const interval = setInterval(() => {
        gameState.particles = gameState.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.3;
            p.life -= 2;
            
            if (p.life <= 0) {
                p.element.remove();
                return false;
            }
            
            p.element.style.left = p.x + '%';
            p.element.style.top = p.y + '%';
            p.element.style.opacity = p.life / 100;
            return true;
        });
        
        if (gameState.particles.length === 0) {
            clearInterval(interval);
        }
    }, 16);
}

// UPDATE FUNCTIONS
function updateBottlePosition() {
    elements.bottle.style.left = gameState.position.x + '%';
    elements.bottle.style.bottom = gameState.position.y + '%';
    elements.bottle.style.transform = `translate(-50%, 0) rotate(${gameState.rotation}deg)`;
}

function updateBottleAppearance() {
    const bottle = bottles[gameState.selectedBottle];
    elements.bottle.style.background = bottle.color;
    elements.bottleEmoji.textContent = bottle.emoji;
}

function updatePowerMeter() {
    const meter = gameState.powerMeter;
    elements.powerMeterBar.style.width = meter + '%';
    elements.powerPercent.textContent = Math.round(meter) + '%';
    
    let background, zone, zoneColor;
    if (meter >= 60 && meter <= 95) {
        background = 'linear-gradient(90deg, #10b981, #34d399)';
        zone = '🎯 PERFECT ZONE!';
        zoneColor = '#6ee7b7';
        elements.powerMeterBar.classList.add('pulse');
    } else if (meter >= 40 && meter <= 100) {
        background = 'linear-gradient(90deg, #3b82f6, #60a5fa)';
        zone = '👍 GOOD ZONE';
        zoneColor = '#93c5fd';
        elements.powerMeterBar.classList.remove('pulse');
    } else {
        background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
        zone = '⚡ OKAY!';
        zoneColor = '#fbbf24';
        elements.powerMeterBar.classList.remove('pulse');
    }
    
    elements.powerMeterBar.style.background = background;
    
    if (gameState.isCharging) {
        elements.zoneIndicator.textContent = zone;
        elements.zoneIndicator.style.color = zoneColor;
    } else {
        elements.zoneIndicator.textContent = '';
    }
}

function updateComboDisplay() {
    if (gameState.combo > 0) {
        elements.comboDisplay.style.display = 'flex';
        elements.comboText.textContent = `x${gameState.combo} COMBO!`;
    } else {
        elements.comboDisplay.style.display = 'none';
    }
}

function updateMenuStats() {
    elements.menuHighScore.textContent = gameState.highScore;
    elements.menuPoints.textContent = gameState.totalPoints;
}

function updateShopPoints() {
    elements.shopPoints.textContent = gameState.totalPoints;
}

function updateBackground() {
    elements.container.style.background = backgrounds[gameState.selectedBg];
}

// SHOP
function renderShop() {
    elements.bottlesGrid.innerHTML = '';
    
    Object.entries(bottles).forEach(([key, bottle]) => {
        const owned = gameState.ownedBottles.includes(key);
        const selected = gameState.selectedBottle === key;
        const canBuy = gameState.totalPoints >= bottle.price;
        
        const card = document.createElement('div');
        card.className = 'bottle-card';
        if (selected) card.classList.add('selected');
        if (owned) card.classList.add('owned');
        
        let buttonHTML = '';
        if (owned) {
            if (selected) {
                buttonHTML = '<button class="bottle-btn equipped">EQUIPPED</button>';
            } else {
                buttonHTML = `<button class="bottle-btn equip" onclick="selectBottle('${key}')">EQUIP</button>`;
            }
        } else {
            if (canBuy) {
                buttonHTML = `<button class="bottle-btn buy" onclick="buyBottle('${key}')">${bottle.price} PTS</button>`;
            } else {
                buttonHTML = `<button class="bottle-btn locked">${bottle.price} PTS</button>`;
            }
        }
        
        card.innerHTML = `
            ${selected ? '<div class="bottle-badge">EQUIPPED</div>' : ''}
            <div class="bottle-icon">${bottle.emoji}</div>
            <div class="bottle-name">${bottle.name}</div>
            ${buttonHTML}
        `;
        
        elements.bottlesGrid.appendChild(card);
    });
}

function buyBottle(key) {
    const bottle = bottles[key];
    if (gameState.totalPoints >= bottle.price && !gameState.ownedBottles.includes(key)) {
        gameState.totalPoints -= bottle.price;
        gameState.ownedBottles.push(key);
        updateShopPoints();
        updateMenuStats(); // FIX: Update menu stats too
        renderShop();
        saveGameData();
    }
}

function selectBottle(key) {
    if (gameState.ownedBottles.includes(key)) {
        gameState.selectedBottle = key;
        updateBottleAppearance();
        renderShop();
        saveGameData();
    }
}

// SETTINGS
function renderSettings() {
    elements.backgroundsGrid.innerHTML = '';
    
    Object.entries(backgrounds).forEach(([key, gradient]) => {
        const active = gameState.selectedBg === key;
        
        const card = document.createElement('button');
        card.className = 'bg-card';
        if (active) card.classList.add('active');
        card.style.background = gradient;
        card.onclick = () => selectBackground(key);
        
        card.innerHTML = `
            ${active ? '<div class="bg-active-badge">✓ ACTIVE</div>' : ''}
            <div class="bg-card-label">${key}</div>
        `;
        
        elements.backgroundsGrid.appendChild(card);
    });
}

function selectBackground(key) {
    gameState.selectedBg = key;
    updateBackground();
    renderSettings();
    saveGameData();
}

// Make functions global for onclick handlers
window.buyBottle = buyBottle;
window.selectBottle = selectBottle;
window.selectBackground = selectBackground;

// START
init();
