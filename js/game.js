// ==== Game Constants ====
const GAME_FPS = 60;
const GAME_INTERVAL = 1000 / GAME_FPS;
const GRAVITY = 0.6;
const TERMINAL_VELOCITY = 15;
const FRICTION = 0.85;
const ACCELERATION = 0.2;
const MAX_SPEED = 12;
const JUMP_POWER = 14;
const AIR_RESISTANCE = 0.98;
const RING_VALUE = 10;
const STARTING_LIVES = 3;

// ==== Game State ====
let game = {
    state: 'loading', // loading, title, character-select, level-select, playing, paused, level-complete, game-over
    debug: false,
    score: 0,
    rings: 0,
    lives: STARTING_LIVES,
    time: 0,
    levelTime: 0,
    currentLevel: '',
    checkpointReached: false,
    checkpointPosition: { x: 0, y: 0 }
};

// ==== Player ====
let player = {
    character: '',
    x: 100,
    y: 0,
    width: 64,
    height: 64,
    velocityX: 0,
    velocityY: 0,
    speed: 0,
    maxSpeed: 0,
    acceleration: 0,
    jumpPower: 0,
    jumping: false,
    doubleJumping: false,
    falling: false,
    rolling: false,
    spinning: false,
    invincible: false,
    invincibilityTimer: 0,
    direction: 'right',
    sprite: {
        idle: [],
        run: [],
        jump: [],
        spin: [],
        hurt: []
    },
    currentAnimation: 'idle',
    animationFrame: 0,
    animationSpeed: 0.15,
    animationTimer: 0,
    specialAbility: false,
    specialCooldown: 0
};

// ==== Level ====
let level = {
    platforms: [],
    springs: [],
    rings: [],
    enemies: [],
    spikes: [],
    loops: [],
    itemBoxes: [],
    checkpoint: null,
    goal: null,
    width: 0,
    height: 0,
    gravity: GRAVITY,
    bounds: {
        left: 0,
        right: 5000, // Default level width
        top: 0,
        bottom: 720  // Default level height
    },
    camera: {
        x: 0,
        y: 0,
        width: 960,
        height: 720,
        following: true
    }
};

// ==== Character Properties ====
const characters = {
    sonic: {
        name: 'SONIC',
        color: '#1a75ff',
        maxSpeed: 10,
        acceleration: 0.3,
        jumpPower: 14,
        specialAbility: 'SPIN DASH',
        specialDescription: 'Press S to charge, release to dash forward',
        sprites: {
            idle: 'sonic-idle.png',
            run: 'sonic-run.png',
            jump: 'sonic-jump.png',
            spin: 'sonic-spin.png',
            hurt: 'sonic-hurt.png'
        }
    },
    tails: {
        name: 'TAILS',
        color: '#ff9900',
        maxSpeed: 8,
        acceleration: 0.25,
        jumpPower: 13,
        specialAbility: 'FLY',
        specialDescription: 'Press S during jump to fly temporarily',
        sprites: {
            idle: 'tails-idle.png',
            run: 'tails-run.png',
            jump: 'tails-jump.png',
            spin: 'tails-spin.png',
            hurt: 'tails-hurt.png'
        }
    },
    knuckles: {
        name: 'KNUCKLES',
        color: '#cc0000',
        maxSpeed: 7,
        acceleration: 0.2,
        jumpPower: 12,
        specialAbility: 'GLIDE & CLIMB',
        specialDescription: 'Press S during jump to glide, press UP against walls to climb',
        sprites: {
            idle: 'knuckles-idle.png',
            run: 'knuckles-run.png',
            jump: 'knuckles-jump.png',
            spin: 'knuckles-spin.png',
            hurt: 'knuckles-hurt.png'
        }
    },
    shadow: {
        name: 'SHADOW',
        color: '#333333',
        maxSpeed: 11,
        acceleration: 0.35,
        jumpPower: 15,
        specialAbility: 'CHAOS CONTROL',
        specialDescription: 'Press S to briefly slow down time for enemies',
        sprites: {
            idle: 'shadow-idle.png',
            run: 'shadow-run.png',
            jump: 'shadow-jump.png',
            spin: 'shadow-spin.png',
            hurt: 'shadow-hurt.png'
        }
    },
    amy: {
        name: 'AMY',
        color: '#ff66b2',
        maxSpeed: 6,
        acceleration: 0.15,
        jumpPower: 11,
        specialAbility: 'HAMMER ATTACK',
        specialDescription: 'Press S to swing hammer and defeat enemies',
        sprites: {
            idle: 'amy-idle.png',
            run: 'amy-run.png',
            jump: 'amy-jump.png',
            spin: 'amy-spin.png',
            hurt: 'amy-hurt.png'
        }
    }
};

// ==== Level Data ====
const levels = {
    'green-hills': {
        name: 'GREEN HILLS ZONE',
        background: 'green-hills-bg.png',
        music: 'green-hills-music.mp3',
        width: 5000,
        height: 720,
        platforms: [
            { x: 0, y: 650, width: 1200, height: 70 },
            { x: 1350, y: 650, width: 800, height: 70 },
            { x: 2300, y: 650, width: 1000, height: 70 },
            { x: 3400, y: 650, width: 1600, height: 70 },
            // Platforms
            { x: 400, y: 500, width: 200, height: 30 },
            { x: 650, y: 400, width: 200, height: 30 },
            { x: 900, y: 300, width: 200, height: 30 },
            { x: 1500, y: 450, width: 300, height: 30 },
            { x: 2000, y: 500, width: 200, height: 30 },
            { x: 2500, y: 400, width: 300, height: 30 },
            { x: 3000, y: 350, width: 200, height: 30 },
            { x: 3500, y: 450, width: 400, height: 30 },
            { x: 4000, y: 350, width: 300, height: 30 },
            { x: 4500, y: 450, width: 400, height: 30 }
        ],
        springs: [
            { x: 500, y: 620, type: 'red' },
            { x: 1000, y: 620, type: 'yellow' },
            { x: 2500, y: 620, type: 'red' },
            { x: 3800, y: 620, type: 'yellow' }
        ],
        rings: [
            // Ring patterns
            // Pattern 1: Horizontal line
            ...Array.from({ length: 10 }, (_, i) => ({ x: 300 + i * 40, y: 450 })),
            // Pattern 2: Vertical line
            ...Array.from({ length: 6 }, (_, i) => ({ x: 800, y: 500 - i * 40 })),
            // Pattern 3: Arc
            ...Array.from({ length: 8 }, (_, i) => {
                const angle = (Math.PI / 8) * i;
                return { 
                    x: 1200 + Math.cos(angle) * 100, 
                    y: 450 - Math.sin(angle) * 100 
                };
            }),
            // Pattern 4: Circle
            ...Array.from({ length: 12 }, (_, i) => {
                const angle = (Math.PI / 6) * i;
                return { 
                    x: 2000 + Math.cos(angle) * 80, 
                    y: 400 + Math.sin(angle) * 80 
                };
            }),
            // Pattern 5: Zig-zag
            ...Array.from({ length: 10 }, (_, i) => ({
                x: 2700 + i * 50,
                y: 400 + (i % 2 === 0 ? -50 : 0)
            })),
            // Pattern 6: Diamond
            ...Array.from({ length: 8 }, (_, i) => {
                if (i < 2) return { x: 3400 + i * 40, y: 400 - i * 40 };
                else if (i < 4) return { x: 3400 + 80 + (i - 2) * 40, y: 320 + (i - 2) * 40 };
                else if (i < 6) return { x: 3400 + 160 - (i - 4) * 40, y: 400 + (i - 4) * 40 };
                else return { x: 3400 + 80 - (i - 6) * 40, y: 480 - (i - 6) * 40 };
            }),
            // Extra rings scattered around
            ...Array.from({ length: 30 }, () => ({
                x: Math.random() * 4500 + 200,
                y: Math.random() * 300 + 150
            }))
        ],
        enemies: [
            { x: 600, y: 600, type: 'crabmeat', direction: 'left' },
            { x: 1200, y: 600, type: 'buzzbomber', direction: 'left' },
            { x: 1800, y: 600, type: 'motobug', direction: 'left' },
            { x: 2400, y: 600, type: 'crabmeat', direction: 'left' },
            { x: 3000, y: 600, type: 'buzzbomber', direction: 'left' },
            { x: 3600, y: 600, type: 'motobug', direction: 'left' },
            { x: 4200, y: 600, type: 'crabmeat', direction: 'left' }
        ],
        spikes: [
            { x: 1250, y: 620 },
            { x: 2250, y: 620 },
            { x: 3350, y: 620 }
        ],
        loops: [
            { x: 1700, y: 500, width: 300, height: 200 }
        ],
        itemBoxes: [
            { x: 500, y: 450, type: 'rings' },
            { x: 1500, y: 400, type: 'shield' },
            { x: 2500, y: 350, type: 'speed' },
            { x: 3500, y: 400, type: 'invincible' },
            { x: 4500, y: 400, type: 'life' }
        ],
        checkpoint: { x: 2500, y: 570 },
        goal: { x: 4800, y: 500 }
    },
    'chemical-plant': {
        name: 'CHEMICAL PLANT ZONE',
        background: 'chemical-plant-bg.png',
        music: 'chemical-plant-music.mp3',
        // Similar structure but with different platforms, enemies, etc.
        width: 6000,
        height: 720
    },
    'casino-night': {
        name: 'CASINO NIGHT ZONE',
        background: 'casino-night-bg.png',
        music: 'casino-night-music.mp3',
        // Similar structure but with different platforms, enemies, etc.
        width: 5500,
        height: 720
    }
};

// ==== Asset Management ====
const assets = {
    images: {},
    sounds: {},
    loaded: 0,
    total: 0,
    
    loadImage: function(name, src) {
        this.total++;
        this.images[name] = new Image();
        
        // Handle successful load
        this.images[name].onload = () => this.assetLoaded();
        
        // Handle failed load
        this.images[name].onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            // Create a colored rectangle as fallback
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            
            // Generate a color based on the name (simple hash)
            const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const hue = hash % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
            ctx.fillRect(0, 0, 64, 64);
            
            // Add some text
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(name, 32, 32);
            
            this.images[name].src = canvas.toDataURL();
            this.assetLoaded();
        };
        
        // Set timeout to prevent hanging on load
        setTimeout(() => {
            if (!this.images[name].complete) {
                this.images[name].onerror();
            }
        }, 5000);
        
        this.images[name].src = 'images/' + src;
    },
    
    loadSound: function(name, src) {
        this.total++;
        this.sounds[name] = new Audio();
        
        // Handle successful load
        this.sounds[name].oncanplaythrough = () => {
            this.sounds[name].loaded = true;
            this.assetLoaded();
        };
        
        // Handle failed load
        this.sounds[name].onerror = () => {
            console.warn(`Failed to load sound: ${src}`);
            this.assetLoaded();
        };
        
        // Set timeout to prevent hanging on load
        setTimeout(() => {
            if (!this.sounds[name].loaded) {
                this.assetLoaded();
            }
        }, 3000);
        
        // Try to load the sound
        try {
            this.sounds[name].src = 'sounds/' + src;
        } catch (e) {
            console.error(`Error setting sound source: ${e}`);
            this.assetLoaded();
        }
    },
    
    assetLoaded: function() {
        this.loaded++;
        const progress = (this.loaded / this.total) * 100;
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }
        
        // Show progress in console for debugging
        console.log(`Loaded ${this.loaded}/${this.total} assets (${Math.round(progress)}%)`);
        
        if (this.loaded >= this.total) {
            console.log('All assets loaded (or timed out). Starting game...');
            setTimeout(showTitleScreen, 500);
        }
    },
    
    playSound: function(name, volume = 1.0, loop = false) {
        if (this.sounds[name]) {
            try {
                this.sounds[name].volume = volume;
                this.sounds[name].loop = loop;
                this.sounds[name].currentTime = 0;
                this.sounds[name].play().catch(e => console.log("Audio play error:", e));
            } catch (e) {
                console.warn(`Error playing sound ${name}: ${e}`);
            }
        }
    },
    
    stopSound: function(name) {
        if (this.sounds[name]) {
            try {
                this.sounds[name].pause();
                this.sounds[name].currentTime = 0;
            } catch (e) {
                console.warn(`Error stopping sound ${name}: ${e}`);
            }
        }
    }
};

// ==== DOM Elements ====
const domElements = {
    loadingScreen: document.getElementById('loading-screen'),
    titleScreen: document.getElementById('title-screen'),
    characterSelect: document.getElementById('character-select'),
    levelSelect: document.getElementById('level-select'),
    gameScreen: document.getElementById('game-screen'),
    gameWorld: document.getElementById('game-world'),
    gameLayer: document.getElementById('game-layer'),
    player: document.getElementById('player'),
    pauseMenu: document.getElementById('pause-menu'),
    levelComplete: document.getElementById('level-complete'),
    gameOver: document.getElementById('game-over'),
    background: {
        far: document.getElementById('background-far'),
        mid: document.getElementById('background-mid')
    },
    foreground: document.getElementById('foreground'),
    hud: {
        score: document.getElementById('score'),
        rings: document.getElementById('rings'),
        time: document.getElementById('time'),
        lives: document.getElementById('lives')
    },
    results: {
        timeBonus: document.getElementById('time-bonus'),
        ringBonus: document.getElementById('ring-bonus'),
        levelScore: document.getElementById('level-score')
    },
    finalScore: document.getElementById('final-score'),
    controls: document.getElementById('controls-overlay'),
    buttons: {
        start: document.getElementById('start-button'),
        continue: document.getElementById('continue-button'),
        playAgain: document.getElementById('play-again'),
        mainMenu: document.getElementById('main-menu'),
        resume: document.getElementById('resume-button'),
        restart: document.getElementById('restart-button'),
        quit: document.getElementById('quit-button')
    },
    audio: {
        bgm: document.getElementById('bgm'),
        jump: document.getElementById('sfx-jump'),
        ring: document.getElementById('sfx-ring'),
        hurt: document.getElementById('sfx-hurt')
    }
};

// ==== Event Listeners ====
// Navigation between screens
domElements.buttons.start.addEventListener('click', () => showCharacterSelect());
domElements.buttons.continue.addEventListener('click', () => continueToNextLevel());
domElements.buttons.playAgain.addEventListener('click', () => restartGame());
domElements.buttons.mainMenu.addEventListener('click', () => showTitleScreen());
domElements.buttons.resume.addEventListener('click', () => resumeGame());
domElements.buttons.restart.addEventListener('click', () => restartLevel());
domElements.buttons.quit.addEventListener('click', () => quitToTitleScreen());

// Character selection
document.querySelectorAll('.character').forEach(character => {
    character.addEventListener('click', () => {
        selectCharacter(character.dataset.character);
    });
    character.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            selectCharacter(character.dataset.character);
        }
    });
});

// Level selection
document.querySelectorAll('.level').forEach(level => {
    level.addEventListener('click', () => {
        selectLevel(level.dataset.level);
    });
    level.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            selectLevel(level.dataset.level);
        }
    });
});

// Keyboard controls
let keyState = {};

document.addEventListener('keydown', (e) => {
    keyState[e.code] = true;
    
    // Pause game
    if (e.code === 'KeyP' && game.state === 'playing') {
        pauseGame();
    }
    
    // Debug mode toggle
    if (e.code === 'KeyD' && e.ctrlKey && e.shiftKey) {
        game.debug = !game.debug;
    }
});

document.addEventListener('keyup', (e) => {
    keyState[e.code] = false;
});

// ==== Game Initialization ====
function init() {
    // Load assets
    loadAssets();
    
    // Initialize game state
    game.state = 'loading';
    
    // Hide all screens except loading
    hideAllScreens();
    domElements.loadingScreen.style.display = 'flex';
}

function createFallbackImage(width, height, color, text) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    // Add text if provided
    if (text) {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width/2, height/2);
    }
    
    return canvas.toDataURL();
}

function loadAssets() {
    console.log('Starting asset loading...');
    
    // Create fallback background
    const bgFallback = createFallbackImage(960, 720, '#000066', '');
    const levelPreviewFallback = createFallbackImage(250, 150, '#003366', '');
    
    // Create some basic fallbacks for critical elements
    // These will be used automatically by the error handler if the real assets fail to load
    const fallbacks = {
        'title-bg': createFallbackImage(960, 720, '#000033', 'SONIC ADVENTURE'),
        'ring': createFallbackImage(30, 30, '#ffcc00', ''),
        'platform': createFallbackImage(100, 30, '#008800', ''),
        'player': createFallbackImage(64, 64, '#1a75ff', 'SONIC')
    };
    
    // Preload critical fallbacks
    for (const [name, dataUrl] of Object.entries(fallbacks)) {
        const img = new Image();
        img.src = dataUrl;
        assets.images[`${name}-fallback`] = img;
    }
    
    // Create simple color blocks for character icons
    const characterColors = {
        'sonic': '#1a75ff',
        'tails': '#ff9900',
        'knuckles': '#cc0000',
        'shadow': '#333333',
        'amy': '#ff66b2'
    };
    
    // Load fewer assets for faster loading during development
    const loadMinimalAssets = false;
    
    // Load essential assets first
    // Load background images
    assets.loadImage('title-bg', 'title-bg.png');
    assets.loadImage('sonic-logo', 'sonic-logo.png');
    
    // Load character icons
    for (const [char, color] of Object.entries(characterColors)) {
        assets.loadImage(`${char}-icon`, `${char}-icon.png`);
    }
    
    // Load level previews
    assets.loadImage('green-hills-preview', 'green-hills-preview.png');
    
    if (!loadMinimalAssets) {
        assets.loadImage('sonic-running', 'sonic-running.gif');
        assets.loadImage('chemical-plant-preview', 'chemical-plant-preview.png');
        assets.loadImage('casino-night-preview', 'casino-night-preview.png');
    }
    
    // Load background layers - critical for gameplay
    assets.loadImage('bg-far', 'bg-far.png');
    assets.loadImage('bg-mid', 'bg-mid.png');
    assets.loadImage('fg', 'fg.png');
    
    // Load essential game elements
    assets.loadImage('platform', 'platform.png');
    assets.loadImage('ring', 'ring.png');
    
    if (!loadMinimalAssets) {
        // Load additional game elements
        assets.loadImage('spring', 'spring.png');
        assets.loadImage('spike', 'spike.png');
        assets.loadImage('loop', 'loop.png');
        assets.loadImage('checkpoint', 'checkpoint.png');
        assets.loadImage('goal', 'goal.png');
        assets.loadImage('item-box', 'item-box.png');
        
        // Load enemy sprites
        assets.loadImage('enemy-crabmeat', 'enemy-crabmeat.png');
        assets.loadImage('enemy-buzzbomber', 'enemy-buzzbomber.png');
        assets.loadImage('enemy-motobug', 'enemy-motobug.png');
    }
    
    // Load essential sound (reduced to avoid hanging)
    // Title music is most important for starting experience
    assets.loadSound('bgm-title', 'bgm-title.mp3');
    assets.loadSound('sfx-jump', 'sfx-jump.mp3');
    assets.loadSound('sfx-ring', 'sfx-ring.mp3');
    
    if (!loadMinimalAssets) {
        // Load additional music
        assets.loadSound('bgm-green-hills', 'bgm-green-hills.mp3');
        assets.loadSound('bgm-chemical-plant', 'bgm-chemical-plant.mp3');
        assets.loadSound('bgm-casino-night', 'bgm-casino-night.mp3');
        
        // Load additional sound effects
        assets.loadSound('sfx-hurt', 'sfx-hurt.mp3');
        assets.loadSound('sfx-death', 'sfx-death.mp3');
        assets.loadSound('sfx-spring', 'sfx-spring.mp3');
        assets.loadSound('sfx-checkpoint', 'sfx-checkpoint.mp3');
        assets.loadSound('sfx-item-box', 'sfx-item-box.mp3');
        assets.loadSound('sfx-goal', 'sfx-goal.mp3');
        assets.loadSound('sfx-level-complete', 'sfx-level-complete.mp3');
        assets.loadSound('sfx-game-over', 'sfx-game-over.mp3');
        
        // Character-specific sounds
        assets.loadSound('sfx-sonic-spin', 'sfx-sonic-spin.mp3');
        assets.loadSound('sfx-tails-fly', 'sfx-tails-fly.mp3');
        assets.loadSound('sfx-knuckles-glide', 'sfx-knuckles-glide.mp3');
        assets.loadSound('sfx-shadow-chaos', 'sfx-shadow-chaos.mp3');
        assets.loadSound('sfx-amy-hammer', 'sfx-amy-hammer.mp3');
    }
    
    console.log(`Asset loading started: ${assets.total} assets to load`);
}

function hideAllScreens() {
    domElements.loadingScreen.style.display = 'none';
    domElements.titleScreen.style.display = 'none';
    domElements.characterSelect.style.display = 'none';
    domElements.levelSelect.style.display = 'none';
    domElements.gameScreen.style.display = 'none';
    domElements.pauseMenu.style.display = 'none';
    domElements.levelComplete.style.display = 'none';
    domElements.gameOver.style.display = 'none';
}

// ==== Screen Navigation ====
function showTitleScreen() {
    hideAllScreens();
    game.state = 'title';
    domElements.titleScreen.style.display = 'flex';
    assets.playSound('bgm-title', 0.7, true);
}

function showCharacterSelect() {
    hideAllScreens();
    game.state = 'character-select';
    domElements.characterSelect.style.display = 'flex';
}

function showLevelSelect() {
    hideAllScreens();
    game.state = 'level-select';
    domElements.levelSelect.style.display = 'flex';
}

function selectCharacter(characterId) {
    player.character = characterId;
    
    // Update character stats based on selection
    const char = characters[characterId];
    player.maxSpeed = char.maxSpeed;
    player.acceleration = char.acceleration;
    player.jumpPower = char.jumpPower;
    
    // Visual feedback for selection
    document.querySelectorAll('.character').forEach(el => {
        el.classList.remove('selected');
    });
    document.querySelector(`.character[data-character="${characterId}"]`).classList.add('selected');
    
    // Show level select after a short delay
    setTimeout(showLevelSelect, 500);
}

function selectLevel(levelId) {
    game.currentLevel = levelId;
    
    // Visual feedback for selection
    document.querySelectorAll('.level').forEach(el => {
        el.classList.remove('selected');
    });
    document.querySelector(`.level[data-level="${levelId}"]`).classList.add('selected');
    
    // Start the level after a short delay
    setTimeout(() => startLevel(levelId), 500);
}

// ==== Game Flow Functions ====
function startLevel(levelId) {
    hideAllScreens();
    game.state = 'playing';
    domElements.gameScreen.style.display = 'block';
    
    // Reset game variables
    game.score = 0;
    game.rings = 0;
    game.levelTime = 0;
    game.checkpointReached = false;
    
    // Stop title music and play level music
    assets.stopSound('bgm-title');
    assets.playSound(`bgm-${levelId}`, 0.7, true);
    
    // Reset player position
    resetPlayer();
    
    // Load level data
    loadLevel(levelId);
    
    // Start the game loop
    if (!gameLoop.running) {
        gameLoop.start();
    }
    
    // Update HUD
    updateHUD();
}

function resetPlayer() {
    // Reset player state
    player.x = 100;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    player.jumping = false;
    player.doubleJumping = false;
    player.falling = true;
    player.rolling = false;
    player.spinning = false;
    player.invincible = false;
    player.invincibilityTimer = 0;
    player.direction = 'right';
    player.currentAnimation = 'idle';
    player.animationFrame = 0;
    player.animationTimer = 0;
    player.specialAbility = false;
    player.specialCooldown = 0;
    
    // Position player element
    domElements.player.style.left = `${player.x}px`;
    domElements.player.style.top = `${player.y}px`;
    
    // Set player appearance based on character
    if (characters[player.character]) {
        // For now, use a color block until sprites are loaded
        domElements.player.style.backgroundColor = characters[player.character].color;
        
        // When we have sprites:
        // domElements.player.style.backgroundImage = `url('images/${characters[player.character].sprites.idle}')`;
    }
}

function loadLevel(levelId) {
    // Clear existing level elements
    clearGameElements();
    
    // Load level configuration
    const levelData = levels[levelId];
    level.width = levelData.width;
    level.height = levelData.height;
    level.bounds.right = levelData.width;
    level.bounds.bottom = levelData.height;
    
    // Set background images
    domElements.background.far.style.backgroundImage = `url('images/bg-far.png')`;
    domElements.background.mid.style.backgroundImage = `url('images/bg-mid.png')`;
    domElements.foreground.style.backgroundImage = `url('images/fg.png')`;
    
    // Create platforms
    levelData.platforms.forEach(platform => {
        createPlatform(platform.x, platform.y, platform.width, platform.height);
    });
    
    // Create springs
    levelData.springs?.forEach(spring => {
        createSpring(spring.x, spring.y, spring.type);
    });
    
    // Create rings
    levelData.rings?.forEach(ring => {
        createRing(ring.x, ring.y);
    });
    
    // Create enemies
    levelData.enemies?.forEach(enemy => {
        createEnemy(enemy.x, enemy.y, enemy.type, enemy.direction);
    });
    
    // Create spikes
    levelData.spikes?.forEach(spike => {
        createSpike(spike.x, spike.y);
    });
    
    // Create loops
    levelData.loops?.forEach(loop => {
        createLoop(loop.x, loop.y, loop.width, loop.height);
    });
    
    // Create item boxes
    levelData.itemBoxes?.forEach(box => {
        createItemBox(box.x, box.y, box.type);
    });
    
    // Create checkpoint
    if (levelData.checkpoint) {
        createCheckpoint(levelData.checkpoint.x, levelData.checkpoint.y);
        level.checkpoint = { x: levelData.checkpoint.x, y: levelData.checkpoint.y };
    }
    
    // Create goal
    if (levelData.goal) {
        createGoal(levelData.goal.x, levelData.goal.y);
        level.goal = { x: levelData.goal.x, y: levelData.goal.y };
    }
    
    // Reset camera
    level.camera.x = 0;
    level.camera.y = 0;
}

function clearGameElements() {
    // Remove all game elements from the DOM
    const gameElements = document.querySelectorAll('.platform, .spring, .ring, .enemy, .spike, .loop, .item-box, .checkpoint, .goal');
    gameElements.forEach(element => element.remove());
    
    // Clear level arrays
    level.platforms = [];
    level.springs = [];
    level.rings = [];
    level.enemies = [];
    level.spikes = [];
    level.loops = [];
    level.itemBoxes = [];
    level.checkpoint = null;
    level.goal = null;
}

// ==== Game Object Creation ====
function createPlatform(x, y, width, height) {
    const platform = document.createElement('div');
    platform.className = 'platform';
    platform.style.left = `${x}px`;
    platform.style.top = `${y}px`;
    platform.style.width = `${width}px`;
    platform.style.height = `${height}px`;
    
    domElements.gameLayer.appendChild(platform);
    
    level.platforms.push({
        x: x,
        y: y,
        width: width,
        height: height,
        element: platform
    });
}

function createSpring(x, y, type) {
    const spring = document.createElement('div');
    spring.className = 'spring';
    spring.style.left = `${x}px`;
    spring.style.top = `${y}px`;
    spring.dataset.type = type;
    
    domElements.gameLayer.appendChild(spring);
    
    level.springs.push({
        x: x,
        y: y,
        width: 40,
        height: 40,
        type: type,
        element: spring
    });
}

function createRing(x, y) {
    const ring = document.createElement('div');
    ring.className = 'ring';
    ring.style.left = `${x}px`;
    ring.style.top = `${y}px`;
    
    domElements.gameLayer.appendChild(ring);
    
    level.rings.push({
        x: x,
        y: y,
        width: 30,
        height: 30,
        collected: false,
        element: ring
    });
}

function createEnemy(x, y, type, direction) {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = `${x}px`;
    enemy.style.top = `${y}px`;
    enemy.style.backgroundImage = `url('images/enemy-${type}.png')`;
    
    domElements.gameLayer.appendChild(enemy);
    
    level.enemies.push({
        x: x,
        y: y,
        width: 50,
        height: 50,
        type: type,
        direction: direction || 'left',
        velocityX: direction === 'right' ? 1 : -1,
        velocityY: 0,
        defeated: false,
        element: enemy
    });
}

function createSpike(x, y) {
    const spike = document.createElement('div');
    spike.className = 'spike';
    spike.style.left = `${x}px`;
    spike.style.top = `${y}px`;
    
    domElements.gameLayer.appendChild(spike);
    
    level.spikes.push({
        x: x,
        y: y,
        width: 40,
        height: 30,
        element: spike
    });
}

function createLoop(x, y, width, height) {
    const loop = document.createElement('div');
    loop.className = 'loop';
    loop.style.left = `${x}px`;
    loop.style.top = `${y}px`;
    loop.style.width = `${width}px`;
    loop.style.height = `${height}px`;
    
    domElements.gameLayer.appendChild(loop);
    
    level.loops.push({
        x: x,
        y: y,
        width: width,
        height: height,
        element: loop
    });
}

function createItemBox(x, y, type) {
    const itemBox = document.createElement('div');
    itemBox.className = 'item-box';
    itemBox.style.left = `${x}px`;
    itemBox.style.top = `${y}px`;
    itemBox.dataset.type = type;
    
    domElements.gameLayer.appendChild(itemBox);
    
    level.itemBoxes.push({
        x: x,
        y: y,
        width: 50,
        height: 50,
        type: type,
        broken: false,
        element: itemBox
    });
}

function createCheckpoint(x, y) {
    const checkpoint = document.createElement('div');
    checkpoint.className = 'checkpoint';
    checkpoint.style.left = `${x}px`;
    checkpoint.style.top = `${y}px`;
    
    domElements.gameLayer.appendChild(checkpoint);
    
    level.checkpoint = {
        x: x,
        y: y,
        width: 60,
        height: 120,
        activated: false,
        element: checkpoint
    };
}

function createGoal(x, y) {
    const goal = document.createElement('div');
    goal.className = 'goal';
    goal.style.left = `${x}px`;
    goal.style.top = `${y}px`;
    
    domElements.gameLayer.appendChild(goal);
    
    level.goal = {
        x: x,
        y: y,
        width: 100,
        height: 200,
        reached: false,
        element: goal
    };
}

// ==== Game Loop ====
const gameLoop = {
    running: false,
    lastTime: 0,
    
    start: function() {
        this.running = true;
        this.lastTime = performance.now();
        requestAnimationFrame(time => this.update(time));
    },
    
    stop: function() {
        this.running = false;
    },
    
    update: function(currentTime) {
        if (!this.running) return;
        
        const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        this.lastTime = currentTime;
        
        if (game.state === 'playing') {
            // Update game time
            game.levelTime += deltaTime;
            
            // Update player
            updatePlayer(deltaTime);
            
            // Update camera
            updateCamera();
            
            // Update game objects
            updateGameObjects(deltaTime);
            
            // Check collisions
            checkCollisions();
            
            // Update HUD
            updateHUD();
        }
        
        requestAnimationFrame(time => this.update(time));
    }
};

// ==== Player Movement & Physics ====
function updatePlayer(deltaTime) {
    // Handle keyboard input
    if (keyState['ArrowLeft'] || keyState['KeyA']) {
        player.velocityX -= player.acceleration;
        player.direction = 'left';
        if (!player.jumping && !player.falling && !player.rolling) {
            player.currentAnimation = 'run';
        }
    } else if (keyState['ArrowRight'] || keyState['KeyD']) {
        player.velocityX += player.acceleration;
        player.direction = 'right';
        if (!player.jumping && !player.falling && !player.rolling) {
            player.currentAnimation = 'run';
        }
    } else {
        // Apply friction when not pressing movement keys
        player.velocityX *= FRICTION;
        if (Math.abs(player.velocityX) < 0.1) {
            player.velocityX = 0;
        }
        
        if (!player.jumping && !player.falling && !player.rolling) {
            player.currentAnimation = 'idle';
        }
    }
    
    // Jumping
    if ((keyState['Space'] || keyState['ArrowUp'] || keyState['KeyW']) && !player.jumping && !player.falling) {
        player.jumping = true;
        player.velocityY = -player.jumpPower;
        player.currentAnimation = 'jump';
        assets.playSound('sfx-jump', 0.7);
    }
    
    // Special ability
    if (keyState['KeyS'] && player.specialCooldown <= 0) {
        useSpecialAbility();
    }
    
    // Apply physics
    
    // Limit horizontal speed
    if (player.velocityX > player.maxSpeed) {
        player.velocityX = player.maxSpeed;
    } else if (player.velocityX < -player.maxSpeed) {
        player.velocityX = -player.maxSpeed;
    }
    
    // Apply gravity
    if (player.jumping || player.falling) {
        player.velocityY += level.gravity;
        
        // Air resistance
        if (Math.abs(player.velocityX) > 0) {
            player.velocityX *= AIR_RESISTANCE;
        }
    }
    
    // Limit falling speed (terminal velocity)
    if (player.velocityY > TERMINAL_VELOCITY) {
        player.velocityY = TERMINAL_VELOCITY;
    }
    
    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;
    
    // Set boundaries
    if (player.x < level.bounds.left) {
        player.x = level.bounds.left;
        player.velocityX = 0;
    } else if (player.x + player.width > level.bounds.right) {
        player.x = level.bounds.right - player.width;
        player.velocityX = 0;
    }
    
    if (player.y < level.bounds.top) {
        player.y = level.bounds.top;
        player.velocityY = 0;
    } else if (player.y + player.height > level.bounds.bottom) {
        playerDie();
    }
    
    // Update player element position
    domElements.player.style.left = `${player.x}px`;
    domElements.player.style.top = `${player.y}px`;
    
    // Update player animation
    updatePlayerAnimation(deltaTime);
    
    // Update special ability cooldown
    if (player.specialCooldown > 0) {
        player.specialCooldown -= deltaTime;
    }
    
    // Update invincibility timer
    if (player.invincible && player.invincibilityTimer > 0) {
        player.invincibilityTimer -= deltaTime;
        
        // Blinking effect
        if (Math.floor(player.invincibilityTimer * 10) % 2 === 0) {
            domElements.player.style.opacity = '0.5';
        } else {
            domElements.player.style.opacity = '1';
        }
        
        if (player.invincibilityTimer <= 0) {
            player.invincible = false;
            domElements.player.style.opacity = '1';
        }
    }
}

function updatePlayerAnimation(deltaTime) {
    player.animationTimer += deltaTime;
    
    if (player.animationTimer >= player.animationSpeed) {
        player.animationTimer = 0;
        player.animationFrame++;
        
        // Reset animation frame if it reaches the end
        const totalFrames = 8; // Assuming 8 frames for all animations
        if (player.animationFrame >= totalFrames) {
            player.animationFrame = 0;
        }
    }
    
    // Flip the sprite based on direction
    if (player.direction === 'left') {
        domElements.player.style.transform = 'scaleX(-1)';
    } else {
        domElements.player.style.transform = 'scaleX(1)';
    }
    
    // When sprites are available:
    // domElements.player.style.backgroundPosition = `-${player.animationFrame * player.width}px 0`;
}

function useSpecialAbility() {
    switch (player.character) {
        case 'sonic':
            // Spin Dash
            if (!player.jumping && !player.falling) {
                player.rolling = true;
                player.currentAnimation = 'spin';
                player.velocityX = player.direction === 'right' ? player.maxSpeed * 1.5 : -player.maxSpeed * 1.5;
                player.specialCooldown = 3;
                assets.playSound('sfx-sonic-spin', 0.7);
            }
            break;
            
        case 'tails':
            // Fly
            if (player.jumping || player.falling) {
                player.velocityY = -5;
                player.falling = false;
                player.specialCooldown = 0.1; // Allow continuous flying
                assets.playSound('sfx-tails-fly', 0.7);
            }
            break;
            
        case 'knuckles':
            // Glide
            if (player.jumping || player.falling) {
                player.velocityY = 0;
                player.velocityX = player.direction === 'right' ? player.maxSpeed * 1.2 : -player.maxSpeed * 1.2;
                player.specialCooldown = 0.1; // Allow continuous gliding
                assets.playSound('sfx-knuckles-glide', 0.7);
            }
            break;
            
        case 'shadow':
            // Chaos Control (slow enemies)
            player.specialCooldown = 10;
            assets.playSound('sfx-shadow-chaos', 0.7);
            
            // Visual effect
            domElements.gameScreen.classList.add('chaos-control');
            setTimeout(() => {
                domElements.gameScreen.classList.remove('chaos-control');
            }, 500);
            
            // Slow down all enemies
            level.enemies.forEach(enemy => {
                enemy.velocityX *= 0.3;
            });
            break;
            
        case 'amy':
            // Hammer Attack
            player.spinning = true;
            player.currentAnimation = 'spin';
            player.specialCooldown = 2;
            assets.playSound('sfx-amy-hammer', 0.7);
            
            domElements.player.classList.add('spin');
            setTimeout(() => {
                domElements.player.classList.remove('spin');
                player.spinning = false;
                if (!player.jumping && !player.falling) {
                    player.currentAnimation = 'idle';
                }
            }, 400);
            break;
    }
}

// ==== Camera ====
function updateCamera() {
    if (level.camera.following) {
        // Center camera on player with some lead room
        const targetX = player.x - level.camera.width / 3;
        
        // Smoothly move camera
        level.camera.x += (targetX - level.camera.x) * 0.1;
        
        // Keep camera within level bounds
        if (level.camera.x < 0) {
            level.camera.x = 0;
        } else if (level.camera.x > level.width - level.camera.width) {
            level.camera.x = level.width - level.camera.width;
        }
        
        // Apply camera position to game layer
        domElements.gameLayer.style.transform = `translateX(-${level.camera.x}px)`;
        
        // Parallax scrolling for background layers
        domElements.background.far.style.backgroundPosition = `-${level.camera.x * 0.2}px 0`;
        domElements.background.mid.style.backgroundPosition = `-${level.camera.x * 0.5}px 0`;
        domElements.foreground.style.backgroundPosition = `-${level.camera.x * 1.2}px 0`;
    }
}

// ==== Game Objects ====
function updateGameObjects(deltaTime) {
    // Update enemies
    level.enemies.forEach(enemy => {
        if (!enemy.defeated) {
            // Simple AI movement
            enemy.x += enemy.velocityX;
            
            // Apply gravity
            enemy.velocityY += level.gravity;
            enemy.y += enemy.velocityY;
            
            // Simple platform collision
            level.platforms.forEach(platform => {
                if (
                    enemy.x < platform.x + platform.width &&
                    enemy.x + enemy.width > platform.x &&
                    enemy.y + enemy.height > platform.y &&
                    enemy.y + enemy.height < platform.y + 20
                ) {
                    enemy.y = platform.y - enemy.height;
                    enemy.velocityY = 0;
                }
            });
            
            // Reverse direction at edges or obstacles
            const edgeCheck = enemy.direction === 'left' ? 
                  enemy.x <= 0 : 
                  enemy.x + enemy.width >= level.width;
                  
            if (edgeCheck) {
                enemy.direction = enemy.direction === 'left' ? 'right' : 'left';
                enemy.velocityX = enemy.direction === 'left' ? -1 : 1;
            }
            
            // Update enemy element position
            enemy.element.style.left = `${enemy.x}px`;
            enemy.element.style.top = `${enemy.y}px`;
            
            // Flip sprite based on direction
            if (enemy.direction === 'left') {
                enemy.element.style.transform = 'scaleX(-1)';
            } else {
                enemy.element.style.transform = 'scaleX(1)';
            }
        }
    });
    
    // Animate rings
    level.rings.forEach(ring => {
        if (!ring.collected) {
            // Rotation animation is handled by CSS
            // Any additional ring animations could go here
        }
    });
    
    // Animate springs
    level.springs.forEach(spring => {
        // Spring animation when compressed could go here
    });
}

// ==== Collisions ====
function checkCollisions() {
    // Check platform collisions
    let onGround = false;
    
    level.platforms.forEach(platform => {
        // Check if player is on top of platform
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + 20 &&
            player.velocityY >= 0
        ) {
            player.y = platform.y - player.height;
            player.velocityY = 0;
            player.jumping = false;
            player.falling = false;
            onGround = true;
            
            // If rolling and on ground, gradually slow down
            if (player.rolling) {
                player.velocityX *= 0.98;
                if (Math.abs(player.velocityX) < 2) {
                    player.rolling = false;
                    player.currentAnimation = 'idle';
                }
            }
        }
        
        // Hitting side or bottom of platform
        if (
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y + 20
        ) {
            // Side collision
            if (player.x + player.width / 2 < platform.x + platform.width / 2) {
                player.x = platform.x - player.width;
            } else {
                player.x = platform.x + platform.width;
            }
            player.velocityX = 0;
        }
    });
    
    if (!onGround && !player.jumping) {
        player.falling = true;
    }
    
    // Check spring collisions
    level.springs.forEach(spring => {
        if (checkObjectCollision(player, spring)) {
            // Bounce player upward
            player.jumping = true;
            player.falling = false;
            
            // Different spring types give different boost
            if (spring.type === 'red') {
                player.velocityY = -player.jumpPower * 1.5;
            } else {
                player.velocityY = -player.jumpPower * 2;
            }
            
            assets.playSound('sfx-spring', 0.7);
            
            // Spring animation
            spring.element.classList.add('bounce');
            setTimeout(() => {
                spring.element.classList.remove('bounce');
            }, 500);
        }
    });
    
    // Check ring collisions
    level.rings.forEach((ring, index) => {
        if (!ring.collected && checkObjectCollision(player, ring)) {
            collectRing(ring, index);
        }
    });
    
    // Check enemy collisions
    level.enemies.forEach((enemy, index) => {
        if (!enemy.defeated && checkObjectCollision(player, enemy)) {
            // If player is rolling, spinning, or jumping on top of enemy
            if (
                player.rolling || 
                player.spinning || 
                (player.velocityY > 0 && player.y + player.height < enemy.y + enemy.height / 2)
            ) {
                defeatEnemy(enemy, index);
            } else if (!player.invincible) {
                playerHurt();
            }
        }
    });
    
    // Check spike collisions
    level.spikes.forEach(spike => {
        if (checkObjectCollision(player, spike) && !player.invincible) {
            playerHurt();
        }
    });
    
    // Check item box collisions
    level.itemBoxes.forEach((box, index) => {
        if (!box.broken && checkObjectCollision(player, box)) {
            // Hit the top of the box
            if (player.velocityY > 0 && player.y + player.height < box.y + box.height / 2) {
                breakItemBox(box, index);
            }
        }
    });
    
    // Check checkpoint collision
    if (level.checkpoint && !level.checkpoint.activated && checkObjectCollision(player, level.checkpoint)) {
        activateCheckpoint();
    }
    
    // Check goal collision
    if (level.goal && !level.goal.reached && checkObjectCollision(player, level.goal)) {
        reachGoal();
    }
}

function checkObjectCollision(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// ==== Game Events ====
function collectRing(ring, index) {
    // Update ring object
    ring.collected = true;
    ring.element.remove();
    
    // Update game state
    game.rings += 1;
    game.score += RING_VALUE;
    
    // Play sound
    assets.playSound('sfx-ring', 0.4);
    
    // Visual effect (ring sparkle)
    createRingParticles(ring.x, ring.y);
}

function createRingParticles(x, y) {
    const particles = document.createElement('div');
    particles.className = 'ring-particles';
    particles.style.left = `${x}px`;
    particles.style.top = `${y}px`;
    
    // Create 6 particles in different directions
    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'ring-particle';
        
        // Random spread
        const angle = (Math.PI * 2 / 6) * i;
        const speed = 3 + Math.random() * 2;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed;
        
        // Animate particle with CSS animations
        particle.style.left = '15px';
        particle.style.top = '15px';
        particle.style.animation = `particle-${i} 0.5s forwards`;
        
        // Add keyframe animation dynamically
        const styleSheet = document.styleSheets[0];
        const keyframes = `
            @keyframes particle-${i} {
                0% { transform: translate(0, 0); opacity: 1; }
                100% { transform: translate(${dx * 10}px, ${dy * 10}px); opacity: 0; }
            }
        `;
        
        try {
            styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
        } catch (e) {
            // Fallback if dynamic insertRule fails
            particle.style.transition = 'all 0.5s';
            setTimeout(() => {
                particle.style.transform = `translate(${dx * 10}px, ${dy * 10}px)`;
                particle.style.opacity = '0';
            }, 10);
        }
        
        particles.appendChild(particle);
    }
    
    domElements.gameLayer.appendChild(particles);
    
    // Remove particles after animation
    setTimeout(() => {
        particles.remove();
    }, 600);
}

function defeatEnemy(enemy, index) {
    // Update enemy object
    enemy.defeated = true;
    enemy.element.remove();
    
    // Update game state
    game.score += 100;
    
    // Player bounce
    player.velocityY = -player.jumpPower * 0.8;
    
    // Create explosion effect
    createExplosion(enemy.x, enemy.y);
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    
    domElements.gameLayer.appendChild(explosion);
    
    // Remove explosion after animation
    setTimeout(() => {
        explosion.remove();
    }, 500);
}

function breakItemBox(box, index) {
    // Update box object
    box.broken = true;
    
    // Apply effect based on box type
    switch (box.type) {
        case 'rings':
            // Spawn 10 rings
            for (let i = 0; i < 10; i++) {
                const ringX = box.x + (Math.random() * 30 - 15);
                const ringY = box.y - 30 - (Math.random() * 50);
                createRing(ringX, ringY);
            }
            break;
            
        case 'shield':
            // Give player shield
            player.invincible = true;
            player.invincibilityTimer = 10;
            break;
            
        case 'speed':
            // Temporary speed boost
            player.maxSpeed *= 1.5;
            setTimeout(() => {
                player.maxSpeed = characters[player.character].maxSpeed;
            }, 10000);
            break;
            
        case 'invincible':
            // Temporary invincibility
            player.invincible = true;
            player.invincibilityTimer = 20;
            break;
            
        case 'life':
            // Extra life
            game.lives++;
            break;
    }
    
    // Update score
    game.score += 50;
    
    // Play sound
    assets.playSound('sfx-item-box', 0.7);
    
    // Change box appearance
    box.element.style.backgroundImage = 'none';
    box.element.style.backgroundColor = '#aaa';
    
    // Add broken animation
    box.element.classList.add('broken');
    
    // Remove broken box after animation
    setTimeout(() => {
        box.element.remove();
    }, 1000);
}

function activateCheckpoint() {
    // Update checkpoint object
    level.checkpoint.activated = true;
    
    // Update game state
    game.checkpointReached = true;
    game.checkpointPosition.x = level.checkpoint.x;
    game.checkpointPosition.y = level.checkpoint.y - player.height;
    
    // Play sound
    assets.playSound('sfx-checkpoint', 0.7);
    
    // Change checkpoint appearance (activated)
    level.checkpoint.element.classList.add('activated');
}

function reachGoal() {
    // Update goal object
    level.goal.reached = true;
    
    // Play sound
    assets.stopSound(`bgm-${game.currentLevel}`);
    assets.playSound('sfx-goal', 0.7);
    assets.playSound('sfx-level-complete', 0.7);
    
    // Stop game loop
    game.state = 'level-complete';
    
    // Calculate bonuses
    const timeBonus = Math.max(0, Math.floor((300 - game.levelTime) * 10));
    const ringBonus = game.rings * 10;
    const totalScore = game.score + timeBonus + ringBonus;
    
    // Update total score
    game.score = totalScore;
    
    // Show level complete screen after a short delay
    setTimeout(() => {
        domElements.results.timeBonus.textContent = timeBonus;
        domElements.results.ringBonus.textContent = ringBonus;
        domElements.results.levelScore.textContent = totalScore;
        
        hideAllScreens();
        domElements.levelComplete.style.display = 'flex';
    }, 2000);
}

function continueToNextLevel() {
    // Get next level or go back to level select
    const levelIds = Object.keys(levels);
    const currentIndex = levelIds.indexOf(game.currentLevel);
    
    if (currentIndex < levelIds.length - 1) {
        // Go to next level
        game.currentLevel = levelIds[currentIndex + 1];
        startLevel(game.currentLevel);
    } else {
        // All levels completed, go back to title
        showTitleScreen();
    }
}

function playerHurt() {
    if (player.invincible) return;
    
    // Check if player has rings
    if (game.rings > 0) {
        // Scatter rings
        scatterRings();
        
        // Set temporary invincibility
        player.invincible = true;
        player.invincibilityTimer = 2;
        
        // Play hurt sound
        assets.playSound('sfx-hurt', 0.7);
        
        // Hurt animation
        player.currentAnimation = 'hurt';
        domElements.player.classList.add('hit');
        setTimeout(() => {
            domElements.player.classList.remove('hit');
            if (!player.jumping && !player.falling) {
                player.currentAnimation = 'idle';
            }
        }, 300);
    } else {
        // Player dies
        playerDie();
    }
}

function scatterRings() {
    // Calculate how many rings to scatter (max 20)
    const ringsToScatter = Math.min(game.rings, 20);
    game.rings = 0;
    
    // Create scattered rings
    for (let i = 0; i < ringsToScatter; i++) {
        // Calculate scatter direction
        const angle = (Math.PI * 2 / ringsToScatter) * i;
        const speed = 3 + Math.random() * 2;
        const dx = Math.cos(angle) * speed;
        const dy = Math.sin(angle) * speed - 5; // Initial upward velocity
        
        const ringX = player.x + player.width / 2;
        const ringY = player.y + player.height / 2;
        
        const scatteredRing = document.createElement('div');
        scatteredRing.className = 'ring scattered-ring';
        scatteredRing.style.left = `${ringX}px`;
        scatteredRing.style.top = `${ringY}px`;
        
        domElements.gameLayer.appendChild(scatteredRing);
        
        // Animate the scattered rings with physics
        let posX = ringX;
        let posY = ringY;
        let velX = dx;
        let velY = dy;
        let lifeTime = 0;
        let maxLife = 3; // 3 seconds
        
        const animateRing = () => {
            if (lifeTime >= maxLife) {
                scatteredRing.remove();
                return;
            }
            
            // Physics update
            velY += level.gravity * 0.5;
            posX += velX;
            posY += velY;
            
            // Bounce off ground
            level.platforms.forEach(platform => {
                if (
                    posX > platform.x &&
                    posX < platform.x + platform.width &&
                    posY + 30 > platform.y &&
                    posY + 30 < platform.y + 20 &&
                    velY > 0
                ) {
                    posY = platform.y - 30;
                    velY = -velY * 0.6;
                    velX *= 0.8;
                }
            });
            
            // Update position
            scatteredRing.style.left = `${posX}px`;
            scatteredRing.style.top = `${posY}px`;
            
            // Make the ring flickering when about to disappear
            if (lifeTime > maxLife * 0.7) {
                scatteredRing.style.opacity = Math.random() > 0.5 ? '1' : '0.5';
            }
            
            // Check if player recollects the ring
            if (
                player.x < posX + 30 &&
                player.x + player.width > posX &&
                player.y < posY + 30 &&
                player.y + player.height > posY
            ) {
                // Recollect the ring
                game.rings++;
                game.score += RING_VALUE / 2; // Half points for recollected rings
                assets.playSound('sfx-ring', 0.4);
                scatteredRing.remove();
                return;
            }
            
            lifeTime += 1/60;
            requestAnimationFrame(animateRing);
        };
        
        animateRing();
    }
}

function playerDie() {
    // Update game state
    game.lives--;
    
    // Play death sound
    assets.playSound('sfx-death', 0.7);
    
    // Death animation
    player.currentAnimation = 'hurt';
    domElements.player.classList.add('hit');
    
    // Stop player input
    game.state = 'dying';
    
    // Show game over or restart from checkpoint after animation
    setTimeout(() => {
        if (game.lives <= 0) {
            gameOver();
        } else {
            if (game.checkpointReached) {
                respawnAtCheckpoint();
            } else {
                restartLevel();
            }
        }
    }, 1500);
}

function respawnAtCheckpoint() {
    // Reset player state
    resetPlayer();
    
    // Position at checkpoint
    player.x = game.checkpointPosition.x;
    player.y = game.checkpointPosition.y;
    
    // Update player element position
    domElements.player.style.left = `${player.x}px`;
    domElements.player.style.top = `${player.y}px`;
    
    // Resume game
    game.state = 'playing';
}

function gameOver() {
    // Stop music
    assets.stopSound(`bgm-${game.currentLevel}`);
    assets.playSound('sfx-game-over', 0.7);
    
    // Update final score
    domElements.finalScore.textContent = game.score;
    
    // Show game over screen
    hideAllScreens();
    domElements.gameOver.style.display = 'flex';
    
    // Update game state
    game.state = 'game-over';
}

function restartGame() {
    // Reset game variables
    game.score = 0;
    game.rings = 0;
    game.lives = STARTING_LIVES;
    game.time = 0;
    game.levelTime = 0;
    game.checkpointReached = false;
    
    // Return to character select
    showCharacterSelect();
}

function restartLevel() {
    // Reset level but keep overall score and lives
    game.rings = 0;
    game.levelTime = 0;
    game.checkpointReached = false;
    
    // Restart current level
    startLevel(game.currentLevel);
}

function pauseGame() {
    if (game.state === 'playing') {
        game.state = 'paused';
        domElements.pauseMenu.style.display = 'flex';
        
        // Pause music
        domElements.audio.bgm.pause();
    }
}

function resumeGame() {
    if (game.state === 'paused') {
        game.state = 'playing';
        domElements.pauseMenu.style.display = 'none';
        
        // Resume music
        domElements.audio.bgm.play();
    }
}

function quitToTitleScreen() {
    hideAllScreens();
    showTitleScreen();
}

// ==== HUD ====
function updateHUD() {
    // Update score
    domElements.hud.score.textContent = `SCORE: ${game.score}`;
    
    // Update rings
    domElements.hud.rings.textContent = `RINGS: ${game.rings}`;
    
    // Update time
    const minutes = Math.floor(game.levelTime / 60);
    const seconds = Math.floor(game.levelTime % 60).toString().padStart(2, '0');
    domElements.hud.time.textContent = `TIME: ${minutes}:${seconds}`;
    
    // Update lives
    domElements.hud.lives.textContent = `LIVES: ${game.lives}`;
}

// ==== Initial Game Setup ====
window.addEventListener('load', () => {
    console.log('Game loading...');
    
    // Add a default placeholder image for rings
    createPlaceholderRingImage();
    
    init();
});

// Create a tiny ring image that can be used even without external assets
function createPlaceholderRingImage() {
    try {
        // Create directory if needed
        const dirs = ['images', 'sounds'];
        dirs.forEach(dir => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('HEAD', dir, false);
                xhr.send();
                
                if (xhr.status >= 400) {
                    console.warn(`Directory ${dir} may not exist. Some assets might not load.`);
                }
            } catch (e) {
                console.warn(`Error checking directory ${dir}: ${e}`);
            }
        });
        
        // Create a ring image directly
        const canvas = document.createElement('canvas');
        canvas.width = 30;
        canvas.height = 30;
        const ctx = canvas.getContext('2d');
        
        // Draw a gold ring
        ctx.beginPath();
        ctx.arc(15, 15, 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 5;
        ctx.stroke();
        
        // Fill with gradient
        const gradient = ctx.createRadialGradient(12, 12, 2, 15, 15, 12);
        gradient.addColorStop(0, '#ffee88');
        gradient.addColorStop(1, '#ffcc00');
        
        ctx.beginPath();
        ctx.arc(15, 15, 10, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw highlight
        ctx.beginPath();
        ctx.arc(10, 10, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        // Create an in-memory placeholder
        const dataUrl = canvas.toDataURL();
        const ringImg = new Image();
        ringImg.src = dataUrl;
        
        // Store in assets for fallback use
        assets.images['ring-fallback'] = ringImg;
        
    } catch (e) {
        console.error(`Error creating placeholder: ${e}`);
    }
}

// For handling error cases with missing assets
window.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'AUDIO') {
        console.warn(`Failed to load asset: ${e.target.src}`);
        e.preventDefault();
        
        // Handle missing assets more gracefully
        if (e.target.tagName === 'IMG') {
            e.target.src = 'images/placeholder.png';
        }
        
        // Auto-increment loaded assets count to prevent stalling
        if (assets.loaded < assets.total) {
            assets.assetLoaded();
        }
    }
});