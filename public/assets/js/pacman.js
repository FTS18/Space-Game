// PACMAN CANVAS ENGINE OVERHAUL

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const modal = document.getElementById('game-modal');
const modalScore = document.getElementById('modal-score');
const modalTitle = document.getElementById('modal-title');

let CW, CH;
let isVertical = false;
let TILE_SIZE = 20;

// Inputs
let keys = {};
window.addEventListener('keydown', e => { 
    keys[e.keyCode] = true; 
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, {passive: false});
window.addEventListener('keyup', e => { keys[e.keyCode] = false; });

// Touch logic for mobile
let touchStartX = 0;
let touchStartY = 0;
canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, {passive: false});
canvas.addEventListener('touchmove', e => {
    e.preventDefault();
}, {passive: false});
canvas.addEventListener('touchend', e => {
    let dx = e.changedTouches[0].clientX - touchStartX;
    let dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 30) { keys[39] = true; setTimeout(()=>keys[39]=false, 100); }
        else if (dx < -30) { keys[37] = true; setTimeout(()=>keys[37]=false, 100); }
    } else {
        if (dy > 30) { keys[40] = true; setTimeout(()=>keys[40]=false, 100); }
        else if (dy < -30) { keys[38] = true; setTimeout(()=>keys[38]=false, 100); }
    }
});

let frameNo = 0;
let score = 0;
let gameOver = false;
let gameWon = false;
let screenShake = 0;
let combo = 0;
let comboTimer = 0;
let floatingTexts = [];
let particles = [];
let ghosts = [];
let powerups = []; // special items
let level = 1;
let isBossRound = false;
let boss = null;

let pacmanSpeed = 2.5;
let pacmanPhase = 0;
let ghostFreeze = 0;

let map = [];
let mapCols = 0;
let mapRows = 0;

// MAP DATA
// 0: Pellet, 1: Wall, 2: Empty, 3: Power Pellet, 4: Ghost Gate
const mapDesktop = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
  [2,2,2,2,2,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,2,2,2,2,2],
  [2,2,2,2,2,1,0,1,1,2,1,1,1,4,4,1,1,1,2,1,1,0,1,2,2,2,2,2],
  [1,1,1,1,1,1,0,1,1,2,1,2,2,2,2,2,2,1,2,1,1,0,1,1,1,1,1,1],
  [2,2,2,2,2,2,0,2,2,2,1,2,2,2,2,2,2,1,2,2,2,0,2,2,2,2,2,2],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [2,2,2,2,2,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,2,2,2,2,2],
  [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,3,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,3,1],
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const mapBossDesktop = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,3,1],
  [1,0,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,1,1],
  [2,2,2,2,2,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,2,2,2,2,2],
  [1,1,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,2,2,2,2,2,2,2,2,2,2,2,2,2,2,0,1,1,1,1,0,1],
  [1,3,0,0,0,0,0,2,2,2,2,2,2,1,1,2,2,2,2,2,2,0,0,0,0,0,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];


const mapMobile = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,3,0,0,0,1,1,1,0,1,0,1,1,1,0,0,0,3,1],
  [1,0,0,0,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,1,1,2,1,1,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,2,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,4,1,1,2,1,0,1,1,1,1],
  [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,1,1,1,1,1,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,0,1,0,1,1,1,0,0,0,0,1],
  [1,3,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,3,1],
  [1,0,0,0,0,1,0,1,1,1,1,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const mapBossMobile = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,0,1,1,0,2,2,2,2,2,2,2,2,2,0,1,1,0,1],
  [1,3,0,0,0,2,2,2,2,2,2,2,2,2,0,0,0,3,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Audio
const actx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq, type, duration, vol) {
    if(actx.state === 'suspended') actx.resume();
    let osc = actx.createOscillator();
    let gain = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, actx.currentTime);
    gain.gain.setValueAtTime(vol, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + duration);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + duration);
}
function playEat() { playTone(400 + Math.random()*200, 'triangle', 0.1, 0.05); }
function playGhostEat() { playTone(800, 'square', 0.3, 0.1); }
function playPower() { playTone(300, 'sine', 0.5, 0.1); }
function playDie() { playTone(150, 'sawtooth', 1.0, 0.2); }
function playBossHit() { playTone(200, 'sawtooth', 0.4, 0.2); }
function playBossDie() { playTone(100, 'sawtooth', 2.0, 0.3); }

// Classes
class Entity {
    constructor(c, r, speed) {
        this.x = c * TILE_SIZE + TILE_SIZE/2;
        this.y = r * TILE_SIZE + TILE_SIZE/2;
        this.vx = 0; this.vy = 0;
        this.speed = speed;
        this.nextDir = null; // {vx, vy}
        this.radius = TILE_SIZE/2 - 2;
    }
    
    getGridPos() {
        return { c: Math.floor(this.x / TILE_SIZE), r: Math.floor(this.y / TILE_SIZE) };
    }
    
    centerDist() {
        let cx = Math.floor(this.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
        let cy = Math.floor(this.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
        return Math.abs(this.x - cx) + Math.abs(this.y - cy);
    }

    canMove(vx, vy, isPhasing) {
        let gp = this.getGridPos();
        let nc = gp.c + vx;
        let nr = gp.r + vy;
        
        // Tunnel wrap
        if (nc < 0) nc = mapCols - 1;
        if (nc >= mapCols) nc = 0;
        if (nr < 0) nr = mapRows - 1;
        if (nr >= mapRows) nr = 0;
        
        if (isPhasing) return true; // can move anywhere
        // Ghosts can pass through 4, Pacman cannot
        if (this !== pacman && map[nr] && map[nr][nc] === 4) return true;
        return map[nr] && map[nr][nc] !== 1 && map[nr][nc] !== 4; // Not wall, not ghost gate
    }
    
    move(isPhasing = false) {
        // Attempt turn if at center
        if (this.nextDir && (this.centerDist() < this.speed || isPhasing)) {
            if (this.canMove(this.nextDir.vx, this.nextDir.vy, isPhasing)) {
                // Snap to center unless phasing
                if (!isPhasing) {
                    this.x = Math.floor(this.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
                    this.y = Math.floor(this.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
                }
                this.vx = this.nextDir.vx;
                this.vy = this.nextDir.vy;
                this.nextDir = null;
            }
        }
        
        // Stop if hitting wall ahead
        if (this.centerDist() < this.speed && !isPhasing) {
            if (!this.canMove(this.vx, this.vy) && (this.vx!==0 || this.vy!==0)) {
                this.x = Math.floor(this.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
                this.y = Math.floor(this.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE/2;
                this.vx = 0;
                this.vy = 0;
            }
        }
        
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;
        
        // Wrap
        if (this.x < 0) this.x = mapCols * TILE_SIZE;
        if (this.x > mapCols * TILE_SIZE) this.x = 0;
        if (this.y < 0) this.y = mapRows * TILE_SIZE;
        if (this.y > mapRows * TILE_SIZE) this.y = 0;
    }
}

class BossGhost {
    constructor(c, r) {
        this.x = c * TILE_SIZE + TILE_SIZE/2;
        this.y = r * TILE_SIZE + TILE_SIZE/2;
        this.vx = 1; this.vy = 0.5;
        this.speed = 1.0;
        this.health = 4; // Takes 4 power pellets to kill
        this.radius = TILE_SIZE * 2;
        this.color = '#aa00ff';
        this.frightened = 0;
    }
    move() {
        this.x += this.vx * this.speed;
        this.y += this.vy * this.speed;
        
        // Bounce off walls of the boss arena
        if (this.x < TILE_SIZE * 6) { this.x = TILE_SIZE*6; this.vx *= -1; }
        if (this.x > canvas.width - TILE_SIZE * 6) { this.x = canvas.width - TILE_SIZE*6; this.vx *= -1; }
        if (this.y < TILE_SIZE * 2) { this.y = TILE_SIZE*2; this.vy *= -1; }
        if (this.y > canvas.height - TILE_SIZE * 4) { this.y = canvas.height - TILE_SIZE*4; this.vy *= -1; }
        
        if (Math.random() < 0.01) {
            // Randomly change direction slightly
            this.vx += (Math.random()-0.5);
            this.vy += (Math.random()-0.5);
            // normalize
            let mag = Math.hypot(this.vx, this.vy);
            this.vx /= mag; this.vy /= mag;
        }
    }
}

let pacman;

function initGame() {
    isVertical = window.innerHeight > window.innerWidth;
    isBossRound = (level % 3 === 0);
    
    let baseMap;
    if (isBossRound) {
        baseMap = isVertical ? mapBossMobile : mapBossDesktop;
    } else {
        baseMap = isVertical ? mapMobile : mapDesktop;
    }
    
    // Deep copy map
    map = baseMap.map(row => [...row]);
    mapRows = map.length;
    mapCols = map[0].length;
    
    let screenW = window.innerWidth - 20; 
    let screenH = window.innerHeight - 150;
    
    let tileW = Math.floor(screenW / mapCols);
    let tileH = Math.floor(screenH / mapRows);
    TILE_SIZE = Math.min(tileW, tileH);
    if (TILE_SIZE > 30) TILE_SIZE = 30;
    if (TILE_SIZE < 10) TILE_SIZE = 10;
    
    canvas.width = mapCols * TILE_SIZE;
    canvas.height = mapRows * TILE_SIZE;
    
    let pSpawn = {c:1, r:1};
    if (isVertical) {
        pSpawn = {c: Math.floor(mapCols/2), r: mapRows-3};
    } else {
        pSpawn = {c: Math.floor(mapCols/2), r: mapRows-3};
    }
    
    pacman = new Entity(pSpawn.c, pSpawn.r, 2.5);
    pacmanSpeed = 2.5;
    pacmanPhase = 0;
    ghostFreeze = 0;
    
    ghosts = [];
    powerups = [];
    boss = null;
    
    if (isBossRound) {
        boss = new BossGhost(Math.floor(mapCols/2), Math.floor(mapRows/2));
        floatingTexts.push({x: canvas.width/2, y: canvas.height/2, text: "BOSS ROUND! EAT 4 POWER PELLETS!", life: 180, color: '#ff0000'});
    } else {
        let colors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852', '#00ff00'];
        let types = ['chaser', 'ambusher', 'flanker', 'wanderer', 'glitch'];
        let spawnC = Math.floor(mapCols/2);
        let spawnR = Math.floor(mapRows/2) - 1; 
        
        for(let i=0; i<5; i++) {
            let g = new Entity(spawnC, spawnR, 2.2);
            g.color = colors[i];
            g.type = types[i];
            g.mode = 'scatter';
            g.frightened = 0;
            ghosts.push(g);
        }
    }
    
    gameOver = false;
    gameWon = false;
    particles = [];
}

function handleInput() {
    if (keys[37]) pacman.nextDir = {vx: -1, vy: 0};
    if (keys[38]) pacman.nextDir = {vx: 0, vy: -1};
    if (keys[39]) pacman.nextDir = {vx: 1, vy: 0};
    if (keys[40]) pacman.nextDir = {vx: 0, vy: 1};
}

function spawnRandomPowerup() {
    if (isBossRound || Math.random() > 0.005) return;
    if (powerups.length > 2) return; // max 2 on screen
    
    let c = Math.floor(Math.random() * mapCols);
    let r = Math.floor(Math.random() * mapRows);
    if (map[r][c] === 2) { // empty space
        let types = ['freeze', 'speed', 'phase'];
        let type = types[Math.floor(Math.random() * types.length)];
        powerups.push({c: c, r: r, type: type, life: 600});
    }
}

function update() {
    if (gameOver || gameWon) return;
    frameNo++;
    handleInput();
    
    // Powerup Timers
    if (ghostFreeze > 0) ghostFreeze--;
    if (pacmanPhase > 0) pacmanPhase--;
    else pacmanSpeed = 2.5; // normal speed, speed powerup shares phase logic slightly
    
    pacman.speed = pacmanSpeed;
    pacman.move(pacmanPhase > 0);
    
    spawnRandomPowerup();
    
    // Update powerups
    powerups.forEach(p => p.life--);
    powerups = powerups.filter(p => p.life > 0);
    
    // Eat pellet
    let gp = pacman.getGridPos();
    if (map[gp.r] && map[gp.r][gp.c] === 0) {
        map[gp.r][gp.c] = 2;
        score += 10;
        playEat();
    } else if (map[gp.r] && map[gp.r][gp.c] === 3) {
        map[gp.r][gp.c] = 2;
        score += 50;
        playPower();
        if (isBossRound && boss) {
            boss.health--;
            boss.frightened = 120;
            playBossHit();
            screenShake = 30;
            if (boss.health <= 0) {
                // Boss dies
                score += 5000;
                playBossDie();
                particles = [];
                for(let i=0; i<100; i++) {
                    particles.push({
                        x: boss.x, y: boss.y,
                        vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20,
                        life: 60 + Math.random()*40,
                        color: boss.color
                    });
                }
                floatingTexts.push({x: boss.x, y: boss.y, text: "BOSS DEFEATED!", life: 120, color: '#00ff00'});
                boss = null;
            }
        } else {
            ghosts.forEach(g => {
                g.frightened = 400; // longer
                g.nextDir = {vx: -g.vx, vy: -g.vy};
            });
        }
        combo = 0;
    }
    
    // Eat Powerups
    for(let i = powerups.length-1; i>=0; i--) {
        let p = powerups[i];
        if (gp.c === p.c && gp.r === p.r) {
            playPower();
            if (p.type === 'freeze') {
                ghostFreeze = 300;
                floatingTexts.push({x: pacman.x, y: pacman.y, text: "FREEZE!", life: 60, color: '#00ffff'});
            } else if (p.type === 'speed') {
                pacmanSpeed = 5.0;
                floatingTexts.push({x: pacman.x, y: pacman.y, text: "SPEED!", life: 60, color: '#ff0000'});
            } else if (p.type === 'phase') {
                pacmanPhase = 300;
                floatingTexts.push({x: pacman.x, y: pacman.y, text: "QUANTUM PHASE!", life: 60, color: '#ffb8ff'});
            }
            powerups.splice(i, 1);
        }
    }
    
    if (isBossRound && boss) {
        if (boss.frightened > 0) boss.frightened--;
        else boss.move();
        
        let dist = Math.hypot(pacman.x - boss.x, pacman.y - boss.y);
        if (dist < TILE_SIZE + boss.radius && pacmanPhase <= 0) {
            playDie();
            gameOver = true;
            screenShake = 30;
            setTimeout(showModal, 1000);
        }
    }
    
    // Ghost Logic
    if (!isBossRound && ghostFreeze <= 0) {
        ghosts.forEach(g => {
            if (g.frightened > 0) {
                g.frightened--;
                g.speed = 1.2;
            } else {
                g.speed = 2.2;
            }
            
            // AI Decision at intersections
            if (g.centerDist() < g.speed) {
                let possibleDirs = [];
                let dirs = [{vx:0,vy:-1},{vx:1,vy:0},{vx:0,vy:1},{vx:-1,vy:0}];
                dirs.forEach(d => {
                    if (d.vx === -g.vx && d.vy === -g.vy && (g.vx!==0 || g.vy!==0)) return; 
                    
                    let nc = g.getGridPos().c + d.vx;
                    let nr = g.getGridPos().r + d.vy;
                    if (nc < 0) nc = mapCols-1;
                    if (nc >= mapCols) nc = 0;
                    
                    let canPass = (map[nr] && map[nr][nc] !== 1);
                    // Prevent re-entering if they are above the gate, but for now just let them pass freely to fix the trap
                    if (g.type === 'glitch' && Math.random() < 0.1) canPass = true;
                    
                    if (canPass) {
                        possibleDirs.push(d);
                    }
                });
                
                if (possibleDirs.length > 0) {
                    let chosen = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                    
                    if (g.frightened <= 0 && Math.random() > 0.4) {
                        let bestDist = Infinity;
                        possibleDirs.forEach(d => {
                            let tx = pacman.x;
                            let ty = pacman.y;
                            if (g.type === 'ambusher') {
                                tx += pacman.vx * TILE_SIZE * 4;
                                ty += pacman.vy * TILE_SIZE * 4;
                            }
                            
                            let nx = g.x + d.vx * TILE_SIZE;
                            let ny = g.y + d.vy * TILE_SIZE;
                            let dist = (nx-tx)*(nx-tx) + (ny-ty)*(ny-ty);
                            if (dist < bestDist) {
                                bestDist = dist;
                                chosen = d;
                            }
                        });
                    }
                    g.nextDir = chosen;
                }
            }
            g.move();
            
            // Collision with Pacman
            let dist = Math.hypot(pacman.x - g.x, pacman.y - g.y);
            if (dist < TILE_SIZE) {
                if (g.frightened > 0 || pacmanPhase > 0) {
                    // Eat ghost if frightened. If phasing, just pass through or kill? 
                    // Let's say phase passes through, doesn't kill unless frightened.
                    if (g.frightened > 0) {
                        combo++;
                        let pts = 100 * Math.pow(2, combo);
                        score += pts;
                        playGhostEat();
                        screenShake = 10;
                        floatingTexts.push({x: g.x, y: g.y, text: pts, life: 60});
                        
                        if (combo > 1) {
                            floatingTexts.push({x: g.x, y: g.y - 20, text: combo + "X CHOMP!", life: 60, color: '#ffb8ff'});
                        }
                        
                        for(let i=0; i<20; i++) {
                            particles.push({
                                x: g.x, y: g.y,
                                vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10,
                                life: 30 + Math.random()*20,
                                color: g.color
                            });
                        }
                        
                        g.x = Math.floor(mapCols/2) * TILE_SIZE + TILE_SIZE/2;
                        g.y = (Math.floor(mapRows/2) - 1) * TILE_SIZE + TILE_SIZE/2;
                        g.frightened = 0;
                    }
                } else {
                    // Die
                    playDie();
                    gameOver = true;
                    screenShake = 20;
                    setTimeout(showModal, 1000);
                }
            }
        });
    } // End Ghost logic
    
    // Particles
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
    });
    particles = particles.filter(p => p.life > 0);
    
    floatingTexts.forEach(ft => {
        ft.y -= 0.5;
        ft.life--;
    });
    floatingTexts = floatingTexts.filter(ft => ft.life > 0);
    
    if (screenShake > 0) screenShake--;
    scoreEl.innerText = score;
    
    // Check win condition
    let left = 0;
    for(let r=0; r<mapRows; r++){
        for(let c=0; c<mapCols; c++){
            if(map[r][c] === 0 || map[r][c] === 3) left++;
        }
    }
    
    if (isBossRound && !boss) {
        // Won boss round
        gameWon = true;
        setTimeout(showModal, 1000);
    } else if (!isBossRound && left === 0) {
        gameWon = true;
        setTimeout(showModal, 1000);
    }
}

function draw() {
    ctx.save();
    
    if (screenShake > 0) {
        let dx = (Math.random()-0.5)*screenShake;
        let dy = (Math.random()-0.5)*screenShake;
        ctx.translate(dx, dy);
    }
    
    ctx.fillStyle = '#0e0c15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Map
    for(let r=0; r<mapRows; r++){
        for(let c=0; c<mapCols; c++){
            let x = c * TILE_SIZE;
            let y = r * TILE_SIZE;
            if (map[r][c] === 1) {
                ctx.fillStyle = '#282335';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.strokeStyle = '#3e3752';
                ctx.strokeRect(x+2, y+2, TILE_SIZE-4, TILE_SIZE-4);
            } else if (map[r][c] === 4) {
                ctx.fillStyle = '#dfc06f';
                ctx.fillRect(x, y + TILE_SIZE/2 - 2, TILE_SIZE, 4);
            } else if (map[r][c] === 0) {
                ctx.fillStyle = '#dfc06f';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 3, 0, Math.PI*2);
                ctx.fill();
            } else if (map[r][c] === 3) {
                ctx.fillStyle = '#dfc06f';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, 7 + Math.sin(frameNo*0.1)*2, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }
    
    // Draw Powerups
    powerups.forEach(p => {
        let x = p.c * TILE_SIZE + TILE_SIZE/2;
        let y = p.r * TILE_SIZE + TILE_SIZE/2;
        ctx.fillStyle = p.type === 'freeze' ? '#00ffff' : (p.type === 'speed' ? '#ff0000' : '#ffb8ff');
        ctx.beginPath();
        ctx.moveTo(x, y - 8);
        ctx.lineTo(x + 8, y);
        ctx.lineTo(x, y + 8);
        ctx.lineTo(x - 8, y);
        ctx.fill();
    });
    
    // Draw Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 4, 4);
    });
    
    // Draw Pacman
    ctx.save();
    ctx.translate(pacman.x, pacman.y);
    let angle = 0;
    if (pacman.vx === 1) angle = 0;
    if (pacman.vx === -1) angle = Math.PI;
    if (pacman.vy === 1) angle = Math.PI/2;
    if (pacman.vy === -1) angle = -Math.PI/2;
    ctx.rotate(angle);
    
    let mouth = Math.abs(Math.sin(frameNo * (pacmanSpeed * 0.1))) * 0.6;
    ctx.fillStyle = '#dfc06f';
    if (pacmanPhase > 0) ctx.globalAlpha = 0.5; // Transparent when phasing
    if (pacmanSpeed > 3.0) {
        // Speed blur
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#dfc06f';
    }
    ctx.beginPath();
    ctx.arc(0, 0, pacman.radius, mouth, Math.PI*2 - mouth);
    ctx.lineTo(0,0);
    ctx.fill();
    ctx.restore();
    
    // Draw Boss
    if (isBossRound && boss) {
        ctx.save();
        ctx.translate(boss.x, boss.y);
        ctx.fillStyle = boss.frightened > 0 ? '#ff0000' : boss.color;
        
        ctx.beginPath();
        ctx.arc(0, -boss.radius/2, boss.radius, Math.PI, 0);
        ctx.lineTo(boss.radius, boss.radius);
        ctx.lineTo(boss.radius/3, boss.radius - 10);
        ctx.lineTo(-boss.radius/3, boss.radius);
        ctx.lineTo(-boss.radius, boss.radius - 10);
        ctx.closePath();
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(-10, -10, 8, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(10, -10, 8, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(-10 + boss.vx*3, -10 + boss.vy*3, 4, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(10 + boss.vx*3, -10 + boss.vy*3, 4, 0, Math.PI*2); ctx.fill();
        ctx.restore();
        
        // Health bar
        ctx.fillStyle = '#fff';
        ctx.fillRect(canvas.width/2 - 50, 10, 100, 10);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(canvas.width/2 - 50, 10, (boss.health/4)*100, 10);
    }
    
    // Draw Ghosts
    if (!isBossRound) {
        ghosts.forEach(g => {
            ctx.save();
            ctx.translate(g.x, g.y);
            if (g.frightened > 0) {
                ctx.fillStyle = (g.frightened < 60 && Math.floor(frameNo/10)%2===0) ? '#fff' : '#0000ff';
            } else if (ghostFreeze > 0) {
                ctx.fillStyle = '#00ffff';
            } else {
                ctx.fillStyle = g.color;
                if (g.type === 'glitch') {
                    ctx.globalAlpha = 0.7 + Math.sin(frameNo*0.5)*0.3;
                    if (Math.random() < 0.1) ctx.translate((Math.random()-0.5)*5, (Math.random()-0.5)*5);
                }
            }
            
            ctx.beginPath();
            ctx.arc(0, -g.radius/2, g.radius, Math.PI, 0);
            ctx.lineTo(g.radius, g.radius);
            ctx.lineTo(g.radius/3, g.radius - 3);
            ctx.lineTo(-g.radius/3, g.radius);
            ctx.lineTo(-g.radius, g.radius - 3);
            ctx.closePath();
            ctx.fill();
            
            if (g.frightened <= 0 && ghostFreeze <= 0) {
                ctx.fillStyle = '#fff';
                ctx.beginPath(); ctx.arc(-3, -3, 3, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(3, -3, 3, 0, Math.PI*2); ctx.fill();
                ctx.fillStyle = '#000';
                ctx.beginPath(); ctx.arc(-3 + g.vx*2, -3 + g.vy*2, 1.5, 0, Math.PI*2); ctx.fill();
                ctx.beginPath(); ctx.arc(3 + g.vx*2, -3 + g.vy*2, 1.5, 0, Math.PI*2); ctx.fill();
            } else {
                ctx.fillStyle = '#ffb8ff';
                ctx.fillRect(-4, -2, 2, 2);
                ctx.fillRect(2, -2, 2, 2);
            }
            
            ctx.restore();
        });
    }
    
    // Floating Texts
    ctx.font = 'bold 16px Poppins';
    ctx.textAlign = 'center';
    floatingTexts.forEach(ft => {
        ctx.fillStyle = ft.color || '#fff';
        ctx.globalAlpha = ft.life / 60;
        ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.globalAlpha = 1.0;
    
    ctx.restore();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function showModal() {
    modal.style.display = 'flex';
    if (gameWon) {
        modalTitle.innerText = "LEVEL CLEARED!";
        modalTitle.style.color = '#00ff00';
    } else {
        modalTitle.innerText = "GAME OVER";
        modalTitle.style.color = '#ff0000';
        level = 1; // reset level
    }
    modalScore.innerText = score;
}

window.restartGame = function() {
    modal.style.display = 'none';
    if (gameWon) level++;
    initGame();
};

window.addEventListener('resize', () => {
    let newVertical = window.innerHeight > window.innerWidth;
    if (newVertical !== isVertical) {
        initGame();
    }
});

// START
initGame();
loop();

