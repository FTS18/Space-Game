// ==========================================================================
// Finixx Ludo Engine - Retro-Neon Edition
// ==========================================================================

// 1. Initialize Firebase from query parameters
const urlParams = new URLSearchParams(window.location.search);
const firebaseConfig = {
    apiKey: urlParams.get('apiKey'),
    authDomain: urlParams.get('authDomain'),
    projectId: urlParams.get('projectId'),
    storageBucket: urlParams.get('storageBucket'),
    messagingSenderId: urlParams.get('messagingSenderId'),
    appId: urlParams.get('appId')
};

let db = null;
if (firebaseConfig.apiKey) {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        console.log("[Ludo] Firebase initialized successfully.");
    } catch (e) {
        console.error("[Ludo] Firebase init failed:", e);
    }
}

// 2. Core Game Variables
let gameMode = 'local'; // 'local', 'ai', or 'online'
let currentTurn = 'green'; // 'green', 'yellow', 'blue', 'red'
let players = {
    green: { name: 'Player 1', isAI: false, active: true },
    yellow: { name: 'Player 2', isAI: false, active: true },
    blue: { name: 'Player 3', isAI: false, active: true },
    red: { name: 'Player 4', isAI: false, active: true }
};
const colorsOrder = ['green', 'yellow', 'blue', 'red'];

// Token state: 4 tokens per player
// step: 0 = in yard, 1-51 = track, 52-56 = home run path, 57 = reached home
let tokens = {
    green:  [ { id: 0, step: 0 }, { id: 1, step: 0 }, { id: 2, step: 0 }, { id: 3, step: 0 } ],
    yellow: [ { id: 0, step: 0 }, { id: 1, step: 0 }, { id: 2, step: 0 }, { id: 3, step: 0 } ],
    blue:   [ { id: 0, step: 0 }, { id: 1, step: 0 }, { id: 2, step: 0 }, { id: 3, step: 0 } ],
    red:    [ { id: 0, step: 0 }, { id: 1, step: 0 }, { id: 2, step: 0 }, { id: 3, step: 0 } ]
};

let diceValue = 0;
let hasRolled = false;
let consecutiveSixes = 0;
let isRolling = false;
let gameFinished = false;

// Online Multiplayer states
let roomCode = '';
let myPlayerName = '';
let myColorRole = ''; // assigned color on join
let unsubscribeRoom = null;
let roomDocRef = null;
let isLobbyLeader = false;

// 3. Clockwise Main Track Coordinates (52 cells total, index 0-51)
const TRACK = [
    { r: 6, c: 0 },  { r: 6, c: 1 },  { r: 6, c: 2 },  { r: 6, c: 3 },  { r: 6, c: 4 },  { r: 6, c: 5 }, // 0-5
    { r: 5, c: 6 },  { r: 4, c: 6 },  { r: 3, c: 6 },  { r: 2, c: 6 },  { r: 1, c: 6 },  { r: 0, c: 6 }, // 6-11
    { r: 0, c: 7 },                                                                                     // 12
    { r: 0, c: 8 },  { r: 1, c: 8 },  { r: 2, c: 8 },  { r: 3, c: 8 },  { r: 4, c: 8 },  { r: 5, c: 8 }, // 13-18
    { r: 6, c: 9 },  { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },// 19-24
    { r: 7, c: 14 },                                                                                    // 25
    { r: 8, c: 14 }, { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 }, // 26-31
    { r: 9, c: 8 },  { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },// 32-37
    { r: 14, c: 7 },                                                                                    // 38
    { r: 14, c: 6 }, { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 }, // 39-44
    { r: 8, c: 5 },  { r: 8, c: 4 },  { r: 8, c: 3 },  { r: 8, c: 2 },  { r: 8, c: 1 },  { r: 8, c: 0 }, // 45-50
    { r: 7, c: 0 }                                                                                      // 51
];

// Start cell offsets (indices inside TRACK array) and Safe zones
const offsets = { green: 1, yellow: 14, blue: 27, red: 40 };
const safeIndices = [1, 9, 14, 22, 27, 35, 40, 48];

// Home run paths (5 cells each color, steps 52-56)
const HOME_PATHS = {
    green:  [ { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 } ],
    yellow: [ { r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 } ],
    blue:   [ { r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 } ],
    red:    [ { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 } ]
};

// Center homes (step 57)
const CENTER_HOMES = { green: { r: 7, c: 6 }, yellow: { r: 6, c: 7 }, blue: { r: 7, c: 8 }, red: { r: 8, c: 7 } };

// Yard pockets spots mapping coordinates (row, col)
const YARD_SPOTS = {
    green:  [ { r: 2, c: 2 }, { r: 2, c: 3 }, { r: 3, c: 2 }, { r: 3, c: 3 } ],
    yellow: [ { r: 2, c: 11 }, { r: 2, c: 12 }, { r: 3, c: 11 }, { r: 3, c: 12 } ],
    blue:   [ { r: 11, c: 11 }, { r: 11, c: 12 }, { r: 12, c: 11 }, { r: 12, c: 12 } ],
    red:    [ { r: 11, c: 2 }, { r: 11, c: 3 }, { r: 12, c: 2 }, { r: 12, c: 3 } ]
};

// 4. Dom and Board Setup on Load
document.addEventListener('DOMContentLoaded', () => {
    buildLudoBoard();
    updateDiceUI(1);
});

function buildLudoBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // Create 15x15 grid cells
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            // Determine if in yards
            if (r < 6 && c < 6) continue; // Green yard
            if (r < 6 && c >= 9) continue; // Yellow yard
            if (r >= 9 && c >= 9) continue; // Blue yard
            if (r >= 9 && c < 6) continue; // Red yard
            if (r >= 6 && r < 9 && c >= 6 && c < 9) continue; // Center Home area

            // Regular cells
            let cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.style.gridRowStart = r + 1;
            cell.style.gridColumnStart = c + 1;

            // Apply safe markings
            if (isSafeTrackCell(r, c)) {
                cell.classList.add('safe-star');
            }

            // Path colors
            applyCellColors(cell, r, c);
            board.appendChild(cell);
        }
    }

    // Build the 4 Large Yard corners
    appendYard(board, 'green', 1, 1);
    appendYard(board, 'yellow', 1, 10);
    appendYard(board, 'blue', 10, 10);
    appendYard(board, 'red', 10, 1);

    // Build Center Home triangles
    let center = document.createElement('div');
    center.className = 'center-home';
    center.style.gridRowStart = 7;
    center.style.gridColumnStart = 7;
    center.style.gridRowEnd = 'span 3';
    center.style.gridColumnEnd = 'span 3';

    center.innerHTML = `
        <div class="home-triangle tri-green"></div>
        <div class="home-triangle tri-yellow"></div>
        <div class="home-triangle tri-blue"></div>
        <div class="home-triangle tri-red"></div>
    `;
    board.appendChild(center);
}

function appendYard(board, color, row, col) {
    let yard = document.createElement('div');
    yard.className = `yard yard-${color}`;
    yard.style.gridRowStart = row;
    yard.style.gridColumnStart = col;
    yard.style.gridRowEnd = 'span 6';
    yard.style.gridColumnEnd = 'span 6';

    // Append 4 pockets inside each yard
    for (let i = 0; i < 4; i++) {
        let spot = document.createElement('div');
        spot.className = 'home-spot';
        spot.dataset.color = color;
        spot.dataset.spotId = i;
        yard.appendChild(spot);
    }
    board.appendChild(yard);
}

function isSafeTrackCell(r, c) {
    // Indices on TRACK array that represent safe stars
    const trackIndex = TRACK.findIndex(cell => cell.r === r && cell.c === c);
    return safeIndices.includes(trackIndex);
}

function applyCellColors(cell, r, c) {
    // Home runs colors
    if (r === 7 && c >= 1 && c <= 5) cell.classList.add('bg-green');
    if (c === 7 && r >= 1 && r <= 5) cell.classList.add('bg-yellow');
    if (r === 7 && c >= 9 && c <= 13) cell.classList.add('bg-blue');
    if (c === 7 && r >= 9 && r <= 13) cell.classList.add('bg-red');

    // Starting spots safe background fills
    if (r === 6 && c === 1) cell.classList.add('safe-green');
    if (r === 1 && c === 8) cell.classList.add('safe-yellow');
    if (r === 8 && c === 13) cell.classList.add('safe-blue');
    if (r === 13 && c === 6) cell.classList.add('safe-red');
}

// 5. Game Setup & Initialization
function setPlayMode(mode) {
    $('.setup-subpanel').hide();
    $('.mode-select-btn').removeClass('selected');
    
    // Highlight selected button
    const btnText = mode === 'ai' ? 'VS COMPUTER' : mode === 'local' ? 'LOCAL PASS' : 'ONLINE';
    $(`.mode-select-btn:contains("${btnText}")`).addClass('selected');

    if (mode === 'ai') {
        $('#ai-setup-panel').show();
    } else if (mode === 'local') {
        $('#local-setup-panel').show();
    } else if (mode === 'online') {
        $('#online-setup-panel').show();
    }
}

let numLocalPlayers = 4;
function setLocalPlayersCount(count) {
    numLocalPlayers = count;
    $('#local-setup-panel .count-btn').removeClass('selected');
    $(`#local-setup-panel .count-btn:contains("${count}")`).addClass('selected');
}

let numAIPlayers = 1;
function setAICount(count) {
    numAIPlayers = count;
    $('#ai-setup-panel .count-btn').removeClass('selected');
    $(`#ai-setup-panel .count-btn:contains("${count}")`).addClass('selected');
}

function startLudoGame() {
    // Check mode
    const activePanelId = $('.setup-subpanel:visible').attr('id');
    if (activePanelId === 'ai-setup-panel') {
        gameMode = 'ai';
        players.green = { name: 'Player 1', isAI: false, active: true };
        players.yellow = { name: 'CPU 1', isAI: true, active: numAIPlayers >= 1 };
        players.blue = { name: 'CPU 2', isAI: true, active: numAIPlayers >= 2 };
        players.red = { name: 'CPU 3', isAI: true, active: numAIPlayers >= 3 };
    } else if (activePanelId === 'local-setup-panel') {
        gameMode = 'local';
        players.green = { name: 'Player 1 (Green)', isAI: false, active: true };
        players.yellow = { name: 'Player 2 (Yellow)', isAI: false, active: true };
        players.blue = { name: 'Player 3 (Blue)', isAI: false, active: numLocalPlayers >= 3 };
        players.red = { name: 'Player 4 (Red)', isAI: false, active: numLocalPlayers >= 4 };
    }

    // Initialize clean token positions
    tokens = {
        green:  [ { id: 0, step: 0 }, { id: 1, step: 0 }, { id: 2, step: 0 }, { id: 3, step: 0 } ],
        yellow: [ { id: 0, step: 0 }, { id: 1, step: 0 }, { id: 2, step: 0 }, { id: 3, step: 0 } ],
        blue:   [ { id: 0, step: 0 }, { id: 1, step: 0 }, { id: 2, step: 0 }, { id: 3, step: 0 } ],
        red:    [ { id: 0, step: 0 }, { id: 1, step: 0 }, { id: 2, step: 0 }, { id: 3, step: 0 } ]
    };

    currentTurn = 'green';
    diceValue = 0;
    hasRolled = false;
    consecutiveSixes = 0;
    gameFinished = false;

    $('#setup-modal').hide();
    $('#mode-badge').text(gameMode.toUpperCase());
    
    logToHUD("Ludo match started! Green rolls first.");
    setupPlayersUI();
    renderBoardTokens();
}

function setupPlayersUI() {
    colorsOrder.forEach(color => {
        const row = $(`.player-row[data-color="${color}"]`);
        if (players[color].active) {
            row.show();
            row.find('.name').text(players[color].name);
            row.find('.status').text(color === currentTurn ? 'ROLLING...' : 'WAITING');
        } else {
            row.hide();
        }
    });
    highlightActiveTurnUI();
}

function highlightActiveTurnUI() {
    $('.player-row').removeClass('active');
    $(`.player-row[data-color="${currentTurn}"]`).addClass('active');
    
    // Set banner color
    const banner = document.getElementById('dice-banner-color');
    banner.innerText = `${currentTurn.toUpperCase()}'S TURN`;
    banner.style.color = currentTurn === 'green' ? '#00ff66' : currentTurn === 'yellow' ? '#dfc06f' : currentTurn === 'blue' ? '#00ccff' : '#ff0146';
    
    // Disable/Enable Roll Button
    const rollBtn = document.getElementById('roll-btn');
    if (gameMode === 'online') {
        rollBtn.disabled = (currentTurn !== myColorRole || hasRolled || isRolling);
    } else {
        rollBtn.disabled = (players[currentTurn].isAI || hasRolled || isRolling);
    }
}

// 6. Token Rendering Engine
function renderBoardTokens() {
    // Clear old tokens and stack containers
    document.querySelectorAll('.token').forEach(el => el.remove());
    document.querySelectorAll('.token-stack').forEach(el => el.remove());

    // Group active tokens by cell coordinate to stack overlays
    let cellGroups = {};

    colorsOrder.forEach(color => {
        if (!players[color].active) return;

        tokens[color].forEach(token => {
            let coord = getCoordinates(color, token.step, token.id);
            let key = `${coord.r}_${coord.c}`;
            if (!cellGroups[key]) cellGroups[key] = [];
            cellGroups[key].push({ color, id: token.id, step: token.step });
        });
    });

    // Append tokens to DOM
    Object.keys(cellGroups).forEach(key => {
        let list = cellGroups[key];
        let [r, c] = key.split('_').map(Number);
        
        let cellEl = getCellElement(r, c);
        if (!cellEl) return;

        if (list.length === 1) {
            // Render single token directly
            let item = list[0];
            let tokenEl = createTokenDOMElement(item.color, item.id);
            cellEl.appendChild(tokenEl);
        } else {
            // Render stacked tokens wrapper
            let stack = document.createElement('div');
            stack.className = 'token-stack';
            list.forEach(item => {
                let tokenEl = createTokenDOMElement(item.color, item.id);
                stack.appendChild(tokenEl);
            });
            cellEl.appendChild(stack);
        }
    });

    highlightMovableTokens();
}

function getCellElement(r, c) {
    // Check if in yard pockets
    let spot = document.querySelector(`.home-spot[data-color]`);
    // Pockets are in yards
    let pockets = document.querySelectorAll(`.home-spot`);
    for (let p of pockets) {
        let parentYard = p.parentElement;
        let yardCol = parseInt(parentYard.style.gridColumnStart);
        let yardRow = parseInt(parentYard.style.gridRowStart);
        let pocketCol = parseInt(p.dataset.spotId) % 2;
        let pocketRow = Math.floor(parseInt(p.dataset.spotId) / 2);
        
        // Exact coordinate check
        let spotCoord = YARD_SPOTS[p.dataset.color][p.dataset.spotId];
        if (spotCoord.r === r && spotCoord.c === c) {
            return p;
        }
    }

    // Check normal cells
    return document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
}

function createTokenDOMElement(color, id) {
    let tokenEl = document.createElement('span');
    tokenEl.className = `token ${color}`;
    tokenEl.dataset.color = color;
    tokenEl.dataset.tokenId = id;

    // Attach click handler if it's the active player's turn
    tokenEl.addEventListener('click', () => {
        if (isRolling || gameFinished) return;
        if (gameMode === 'online' && currentTurn !== myColorRole) return;
        if (currentTurn === color && hasRolled && !players[color].isAI) {
            selectTokenToMove(id);
        }
    });

    return tokenEl;
}

function getCoordinates(color, step, id) {
    // Step 0: In Yard
    if (step === 0) {
        return YARD_SPOTS[color][id];
    }
    
    // Step 57: Center Home reached
    if (step === 57) {
        return CENTER_HOMES[color];
    }

    // Steps 52-56: Home Run
    if (step >= 52 && step <= 56) {
        return HOME_PATHS[color][step - 52];
    }

    // Steps 1-51: Clockwise Track
    let startIndex = offsets[color];
    let trackIndex = (startIndex + step - 1) % 52;
    return TRACK[trackIndex];
}

// 7. Dice Controller
function triggerDiceRoll() {
    if (hasRolled || isRolling || gameFinished) return;
    
    // If online mode, check permissions
    if (gameMode === 'online' && currentTurn !== myColorRole) return;

    isRolling = true;
    hasRolled = false;

    // Roll animation class
    const diceEl = document.getElementById('dice-container');
    diceEl.classList.add('dice-rolling');
    
    // Trigger roll sound
    if (window.parent && window.parent.playLaserSound) {
        window.parent.playLaserSound();
    } else if (window.playLaserSound) {
        window.playLaserSound();
    }

    setTimeout(() => {
        diceEl.classList.remove('dice-rolling');
        
        // Random 1 to 6
        diceValue = Math.floor(Math.random() * 6) + 1;
        updateDiceUI(diceValue);
        
        isRolling = false;
        hasRolled = true;
        
        logToHUD(`${currentTurn.toUpperCase()} rolled a ${diceValue}!`);

        if (gameMode === 'online') {
            // Write dice roll value to Firestore room doc
            updateOnlineRoomRoll(diceValue);
        } else {
            processDiceResult();
        }
    }, 850);
}

function updateDiceUI(val) {
    const dice3d = document.getElementById('dice-3d');
    
    // Remove any existing show-* class
    for (let i = 1; i <= 6; i++) {
        dice3d.classList.remove(`show-${i}`);
    }
    
    // Apply the new face class
    dice3d.classList.add(`show-${val}`);
}

function processDiceResult() {
    // Check consecutive sixes
    if (diceValue === 6) {
        consecutiveSixes++;
        if (consecutiveSixes === 3) {
            logToHUD(`Three 6s rolled in a row! Turn forfeited.`);
            consecutiveSixes = 0;
            switchTurn();
            return;
        }
    } else {
        consecutiveSixes = 0;
    }

    // Fetch movable tokens
    let movable = getMovableTokensList(currentTurn, diceValue);

    if (movable.length === 0) {
        logToHUD(`No valid moves possible.`);
        setTimeout(switchTurn, 1000);
    } else {
        highlightMovableTokens();
        // If CPU turn, let AI process the move
        if (players[currentTurn].isAI) {
            setTimeout(() => {
                let aiMove = selectAIMove(currentTurn, movable, diceValue);
                executeTokenMove(currentTurn, aiMove);
            }, 800);
        }
    }
}

function getMovableTokensList(color, roll) {
    let list = [];
    tokens[color].forEach(t => {
        // Reached home: locked
        if (t.step === 57) return;

        // In yard (step 0): requires a 6 to exit
        if (t.step === 0) {
            if (roll === 6) list.push(t.id);
            return;
        }

        // Inside home path: requires exact roll to land on 57
        if (t.step + roll <= 57) {
            list.push(t.id);
        }
    });
    return list;
}

function highlightMovableTokens() {
    // Clear all highlights
    document.querySelectorAll('.token').forEach(el => el.classList.remove('movable'));

    if (!hasRolled || isRolling || gameFinished) return;
    if (gameMode === 'online' && currentTurn !== myColorRole) return;

    let movable = getMovableTokensList(currentTurn, diceValue);
    movable.forEach(id => {
        let tokenEl = document.querySelector(`.token[data-color="${currentTurn}"][data-token-id="${id}"]`);
        if (tokenEl) tokenEl.classList.add('movable');
    });

    // Auto-Move Basic Intelligence (for human players)
    if (!players[currentTurn].isAI && movable.length > 0) {
        let autoMove = false;
        
        // Case 1: Only 1 token can legally move
        if (movable.length === 1) {
            autoMove = true;
        } 
        // Case 2: Multiple tokens can move, but they are all in the exact same spot (e.g. yard or stacked)
        else {
            let firstStep = tokens[currentTurn].find(t => t.id === movable[0]).step;
            let allSame = movable.every(id => tokens[currentTurn].find(t => t.id === id).step === firstStep);
            if (allSame) autoMove = true;
        }

        if (autoMove) {
            setTimeout(() => {
                // Execute move if the player hasn't already clicked it manually
                if (document.querySelectorAll('.token.movable').length > 0) {
                    selectTokenToMove(movable[0]);
                }
            }, 400);
        }
    }
}

// 8. Token Move Execution (with sliding step-by-step path transitions!)
let isMovingToken = false;

function selectTokenToMove(id) {
    if (isMovingToken) return;

    let movable = getMovableTokensList(currentTurn, diceValue);
    if (movable.includes(id)) {
        if (gameMode === 'online') {
            updateOnlineRoomMove(id);
        } else {
            executeTokenMove(currentTurn, id);
        }
    }
}

function executeTokenMove(color, id) {
    isMovingToken = true;
    let token = tokens[color].find(t => t.id === id);
    let startStep = token.step;
    let targetStep = startStep === 0 ? 1 : startStep + diceValue;
    
    // Clear highlights
    document.querySelectorAll('.token').forEach(el => el.classList.remove('movable'));

    // Animate token sliding step-by-step
    animateStepMovement(color, id, startStep, targetStep, () => {
        token.step = targetStep;
        isMovingToken = false;
        
        // Handle board events post placement
        let coord = getCoordinates(color, targetStep, id);
        let captured = checkOpponentCapture(color, coord.r, coord.c);
        
        let hasWonMatch = checkPlayerVictory(color);
        if (hasWonMatch) {
            announceVictory(color);
            return;
        }

        // Roll again on 6, capture, or home goal!
        if (diceValue === 6 || captured || targetStep === 57) {
            logToHUD(`${players[color].name} earns an extra roll!`);
            hasRolled = false;
            highlightActiveTurnUI();
            
            // Auto roll if AI player
            if (players[color].isAI) {
                setTimeout(triggerDiceRoll, 1000);
            }
        } else {
            switchTurn();
        }
    });
}

function animateStepMovement(color, id, current, target, callback) {
    if (current === target) {
        callback();
        return;
    }

    // Step increments
    let nextStep = current === 0 ? 1 : current + 1;
    let tokenState = tokens[color].find(t => t.id === id);
    tokenState.step = nextStep;

    // Redraw screen on this frame
    renderBoardTokens();
    
    // Step sound
    if (window.parent && window.parent.playLaserSound) {
        window.parent.playLaserSound();
    }

    setTimeout(() => {
        animateStepMovement(color, id, nextStep, target, callback);
    }, 150); // 150ms per step slide
}

function checkOpponentCapture(color, r, c) {
    // Star cells/Start cells are safe
    const trackIndex = TRACK.findIndex(cell => cell.r === r && cell.c === c);
    if (safeIndices.includes(trackIndex)) return false;

    let captured = false;

    colorsOrder.forEach(oppColor => {
        if (oppColor === color || !players[oppColor].active) return;

        tokens[oppColor].forEach(t => {
            let coord = getCoordinates(oppColor, t.step, t.id);
            if (coord.r === r && coord.c === c) {
                // Send back to home yard
                t.step = 0;
                captured = true;
                logToHUD(`${players[color].name} captured ${players[oppColor].name}'s token!`);
                
                if (window.parent && window.parent.playExplosionSound) {
                    window.parent.playExplosionSound();
                } else if (window.playExplosionSound) {
                    window.playExplosionSound();
                }
            }
        });
    });

    if (captured) {
        renderBoardTokens();
    }
    return captured;
}

function checkPlayerVictory(color) {
    // Player wins if all 4 tokens have reached step 57
    return tokens[color].every(t => t.step === 57);
}

function announceVictory(color) {
    gameFinished = true;
    if (window.parent && window.parent.playCoinSound) {
        window.parent.playCoinSound();
    } else if (window.playCoinSound) {
        window.playCoinSound();
    }

    $('#end-modal-title').text(`${color.toUpperCase()} VICTORIOUS!`);
    $('#end-modal-message').text(`${players[color].name} has won the match!`);
    $('#end-modal').show();

    // Send final score to the parent iframe storefront container
    window.parent.postMessage({
        type: 'FINIXX_GAME_OVER',
        game: 'ludo',
        score: 1000
    }, '*');
}

function switchTurn() {
    if (gameFinished) return;
    
    let currentIndex = colorsOrder.indexOf(currentTurn);
    let nextIndex = currentIndex;
    
    // Cycle until finding next active player
    do {
        nextIndex = (nextIndex + 1) % 4;
        currentTurn = colorsOrder[nextIndex];
    } while (!players[currentTurn].active);
    
    hasRolled = false;
    consecutiveSixes = 0;
    
    logToHUD(`${players[currentTurn].name}'s turn.`);
    highlightActiveTurnUI();

    // Auto roll if AI
    if (players[currentTurn].isAI) {
        setTimeout(triggerDiceRoll, 1000);
    }
}

// 9. AI Pathing Logic
function selectAIMove(color, movableIds, roll) {
    // Heuristic analysis to pick best token to move:
    // 1. Exiting Home Yard is extremely high priority
    if (roll === 6) {
        let yardTokenId = movableIds.find(id => tokens[color].find(t => t.id === id).step === 0);
        if (yardTokenId !== undefined) return yardTokenId;
    }

    // 2. Prioritize capturing opponent tokens
    for (let id of movableIds) {
        let token = tokens[color].find(t => t.id === id);
        let targetStep = token.step + roll;
        let coord = getCoordinates(color, targetStep, id);
        
        // Simulate landing checks
        const trackIndex = TRACK.findIndex(cell => cell.r === coord.r && cell.c === coord.c);
        if (!safeIndices.includes(trackIndex)) {
            let canCapture = false;
            colorsOrder.forEach(opp => {
                if (opp !== color) {
                    tokens[opp].forEach(oppToken => {
                        let oppCoord = getCoordinates(opp, oppToken.step, oppToken.id);
                        if (oppCoord.r === coord.r && oppCoord.c === coord.c) {
                            canCapture = true;
                        }
                    });
                }
            });
            if (canCapture) return id;
        }
    }

    // 3. Prioritize landing on safety cells
    for (let id of movableIds) {
        let token = tokens[color].find(t => t.id === id);
        let targetStep = token.step + roll;
        let coord = getCoordinates(color, targetStep, id);
        const trackIndex = TRACK.findIndex(cell => cell.r === coord.r && cell.c === coord.c);
        if (safeIndices.includes(trackIndex)) return id;
    }

    // 4. Prioritize tokens entering home lane/goal
    for (let id of movableIds) {
        let token = tokens[color].find(t => t.id === id);
        let targetStep = token.step + roll;
        if (targetStep === 57) return id; // direct goal!
        if (token.step < 52 && targetStep >= 52) return id; // enter safe path
    }

    // 5. Default: Advance the token that is closest to home
    let bestId = movableIds[0];
    let maxStep = -1;
    movableIds.forEach(id => {
        let step = tokens[color].find(t => t.id === id).step;
        if (step > maxStep) {
            maxStep = step;
            bestId = id;
        }
    });
    return bestId;
}

// 10. Firestore Online Multiplayer Synchronization Logic
function createOnlineRoom() {
    if (!db) {
        alert("Firestore backend unavailable!");
        return;
    }
    
    let name = $('#player-name-input').val().trim();
    if (!name) {
        alert("Please enter a nickname!");
        return;
    }
    
    myPlayerName = name;
    
    // Generate 4-letter code
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // exclude ambiguous letters
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    roomCode = code;
    myColorRole = 'green'; // Creator is Green
    isLobbyLeader = true;
    
    roomDocRef = db.collection('ludo_rooms').doc(roomCode);
    
    let initialTokens = {
        green:  [0, 0, 0, 0],
        yellow: [0, 0, 0, 0],
        blue:   [0, 0, 0, 0],
        red:    [0, 0, 0, 0]
    };
    
    let initialPlayersList = [
        { name: myPlayerName, color: 'green', isAI: false, active: true }
    ];
    
    roomDocRef.set({
        code: roomCode,
        playersList: initialPlayersList,
        status: 'waiting',
        currentTurn: 'green',
        diceValue: 1,
        hasRolled: false,
        tokens: initialTokens,
        lastMove: null,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        setupLobbyUI();
    }).catch(err => {
        console.error("Room creation error:", err);
        alert("Failed to create room: " + err.message);
    });
}

function joinOnlineRoom() {
    if (!db) {
        alert("Firestore backend unavailable!");
        return;
    }
    
    let name = $('#player-name-input').val().trim();
    let code = $('#room-code-input').val().trim().toUpperCase();
    
    if (!name) {
        alert("Please enter your nickname!");
        return;
    }
    if (code.length !== 4) {
        alert("Enter a valid 4-character Room Code!");
        return;
    }
    
    myPlayerName = name;
    roomCode = code;
    isLobbyLeader = false;
    
    roomDocRef = db.collection('ludo_rooms').doc(roomCode);
    
    db.runTransaction(transaction => {
        return transaction.get(roomDocRef).then(doc => {
            if (!doc.exists) {
                throw new Error("Room not found!");
            }
            
            let data = doc.data();
            if (data.status !== 'waiting') {
                throw new Error("Room match already started or finished!");
            }
            
            let list = data.playersList || [];
            if (list.length >= 4) {
                throw new Error("Room is full! (Max 4 players)");
            }
            
            // Assign next clockwise color
            let assignedColor = colorsOrder[list.length];
            list.push({ name: myPlayerName, color: assignedColor, isAI: false, active: true });
            
            transaction.update(roomDocRef, { playersList: list });
            myColorRole = assignedColor;
            return list;
        });
    }).then(() => {
        setupLobbyUI();
    }).catch(err => {
        alert(err.message);
    });
}

function setupLobbyUI() {
    $('#setup-modal').hide();
    $('#lobby-code').text(roomCode);
    $('#lobby-modal').show();
    
    // Hide start button if not leader
    if (isLobbyLeader) {
        $('#start-online-btn').show();
    } else {
        $('#start-online-btn').hide();
    }
    
    // Listen to room updates
    unsubscribeRoom = roomDocRef.onSnapshot(doc => {
        if (!doc.exists) {
            alert("Room has been terminated.");
            leaveOnlineLobby();
            return;
        }
        
        let data = doc.data();
        updateLobbyPlayersList(data.playersList);
        
        if (data.status === 'playing') {
            // Start match
            $('#lobby-modal').hide();
            syncOnlineGameState(data);
            
            // Cancel lobby listener and bind active game listener
            unsubscribeRoom();
            bindOnlineGameListener();
        }
    });
}

function updateLobbyPlayersList(list) {
    const listEl = document.getElementById('lobby-players-list');
    listEl.innerHTML = '';
    list.forEach(p => {
        let row = document.createElement('div');
        row.className = 'lobby-player-row';
        row.innerHTML = `
            <span><span class="dot" style="background:${p.color === 'green' ? '#00ff66' : p.color === 'yellow' ? '#dfc06f' : p.color === 'blue' ? '#00ccff' : '#ff0146'}; width:10px; height:10px; display:inline-block; border-radius:50%; margin-right:10px;"></span>${p.name}</span>
            <span style="color:#55506a; font-size:14px;">${p.color.toUpperCase()}</span>
        `;
        listEl.appendChild(row);
    });
}

function startOnlineMatch() {
    roomDocRef.update({ status: 'playing' });
}

function leaveOnlineLobby() {
    if (unsubscribeRoom) unsubscribeRoom();
    
    if (roomDocRef) {
        if (isLobbyLeader) {
            // Delete room
            roomDocRef.delete();
        } else {
            // Remove myself from player list
            db.runTransaction(transaction => {
                return transaction.get(roomDocRef).then(doc => {
                    if (!doc.exists) return;
                    let list = doc.data().playersList || [];
                    list = list.filter(p => p.name !== myPlayerName);
                    transaction.update(roomDocRef, { playersList: list });
                });
            });
        }
    }
    
    window.location.reload();
}

function bindOnlineGameListener() {
    unsubscribeRoom = roomDocRef.onSnapshot(doc => {
        if (!doc.exists) {
            alert("Match terminated by leader.");
            window.location.reload();
            return;
        }
        
        let data = doc.data();
        syncOnlineGameState(data);
    });
}

function syncOnlineGameState(data) {
    // 1. Sync players order status mapping
    players = {
        green:  { name: 'N/A', isAI: false, active: false },
        yellow: { name: 'N/A', isAI: false, active: false },
        blue:   { name: 'N/A', isAI: false, active: false },
        red:    { name: 'N/A', isAI: false, active: false }
    };
    
    data.playersList.forEach(p => {
        players[p.color] = { name: p.name, isAI: p.isAI, active: p.active };
    });
    
    gameMode = 'online';
    $('#mode-badge').text(`ONLINE: ${roomCode}`);
    setupPlayersUI();
    
    // 2. Sync tokens position mapping
    colorsOrder.forEach(color => {
        if (data.tokens[color]) {
            for (let i = 0; i < 4; i++) {
                tokens[color][i].step = data.tokens[color][i];
            }
        }
    });
    renderBoardTokens();
    
    // 3. Sync turn states & rolls
    currentTurn = data.currentTurn;
    diceValue = data.diceValue;
    hasRolled = data.hasRolled;
    
    updateDiceUI(diceValue);
    highlightActiveTurnUI();
    
    // If it's AI turn (and we are lobby leader), lead AI actions
    if (players[currentTurn].isAI && isLobbyLeader && !isRolling) {
        if (!hasRolled) {
            // Trigger automatic roll
            setTimeout(triggerDiceRoll, 1000);
        } else {
            // Select best move
            setTimeout(() => {
                let movable = getMovableTokensList(currentTurn, diceValue);
                if (movable.length === 0) {
                    // Switch turn
                    let currentIndex = colorsOrder.indexOf(currentTurn);
                    let nextIndex = currentIndex;
                    do {
                        nextIndex = (nextIndex + 1) % 4;
                    } while (!players[colorsOrder[nextIndex]].active);
                    
                    roomDocRef.update({
                        currentTurn: colorsOrder[nextIndex],
                        hasRolled: false
                    });
                } else {
                    let aiMove = selectAIMove(currentTurn, movable, diceValue);
                    executeOnlineAIMove(currentTurn, aiMove);
                }
            }, 1000);
        }
    }
}

function updateOnlineRoomRoll(val) {
    // Write roll result
    let updateObj = {
        diceValue: val,
        hasRolled: true
    };
    
    // Verify consecutive roll turns
    if (val === 6) {
        // Wait, online does not enforce consecutive rolls limit on DB directly, just updates locally
    }
    
    // Check if player has no valid moves
    let movable = getMovableTokensList(currentTurn, val);
    if (movable.length === 0) {
        // Advance turn automatically
        let currentIndex = colorsOrder.indexOf(currentTurn);
        let nextIndex = currentIndex;
        do {
            nextIndex = (nextIndex + 1) % 4;
        } while (!players[colorsOrder[nextIndex]].active);
        
        updateObj.currentTurn = colorsOrder[nextIndex];
        updateObj.hasRolled = false;
        logToHUD(`No moves possible for ${currentTurn.toUpperCase()}. Switching turns.`);
    }
    
    roomDocRef.update(updateObj);
}

function updateOnlineRoomMove(id) {
    let token = tokens[currentTurn].find(t => t.id === id);
    let startStep = token.step;
    let targetStep = startStep === 0 ? 1 : startStep + diceValue;
    
    // Perform local slide animations for visual clarity before posting DB
    animateStepMovement(currentTurn, id, startStep, targetStep, () => {
        token.step = targetStep;
        
        // Land check and captures
        let coord = getCoordinates(currentTurn, targetStep, id);
        let captured = checkOpponentCapture(currentTurn, coord.r, coord.c);
        
        // Build new tokens map to update DB
        let dbTokens = {};
        colorsOrder.forEach(color => {
            dbTokens[color] = tokens[color].map(t => t.step);
        });
        
        // Victory checks
        let hasWonMatch = checkPlayerVictory(currentTurn);
        if (hasWonMatch) {
            roomDocRef.update({
                status: 'finished',
                tokens: dbTokens
            });
            announceVictory(currentTurn);
            return;
        }
        
        // Next turn determinations
        let nextTurn = currentTurn;
        let rollAgain = (diceValue === 6 || captured || targetStep === 57);
        
        if (!rollAgain) {
            let currentIndex = colorsOrder.indexOf(currentTurn);
            let nextIndex = currentIndex;
            do {
                nextIndex = (nextIndex + 1) % 4;
                nextTurn = colorsOrder[nextIndex];
            } while (!players[nextTurn].active);
        }
        
        roomDocRef.update({
            tokens: dbTokens,
            currentTurn: nextTurn,
            hasRolled: false,
            lastMove: { color: currentTurn, tokenId: id, rollValue: diceValue }
        });
    });
}

function executeOnlineAIMove(color, id) {
    let token = tokens[color].find(t => t.id === id);
    let startStep = token.step;
    let targetStep = startStep === 0 ? 1 : startStep + diceValue;
    
    animateStepMovement(color, id, startStep, targetStep, () => {
        token.step = targetStep;
        
        let coord = getCoordinates(color, targetStep, id);
        let captured = checkOpponentCapture(color, coord.r, coord.c);
        
        let dbTokens = {};
        colorsOrder.forEach(col => {
            dbTokens[col] = tokens[col].map(t => t.step);
        });
        
        let hasWonMatch = checkPlayerVictory(color);
        if (hasWonMatch) {
            roomDocRef.update({
                status: 'finished',
                tokens: dbTokens
            });
            announceVictory(color);
            return;
        }
        
        let nextTurn = color;
        let rollAgain = (diceValue === 6 || captured || targetStep === 57);
        
        if (!rollAgain) {
            let currentIndex = colorsOrder.indexOf(color);
            let nextIndex = currentIndex;
            do {
                nextIndex = (nextIndex + 1) % 4;
                nextTurn = colorsOrder[nextIndex];
            } while (!players[nextTurn].active);
        }
        
        roomDocRef.update({
            tokens: dbTokens,
            currentTurn: nextTurn,
            hasRolled: false,
            lastMove: { color: color, tokenId: id, rollValue: diceValue }
        });
    });
}

// 11. HUD Log utilities
function logToHUD(msg) {
    const logs = document.getElementById('game-logs');
    if (!logs) return;
    let entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerText = `> ${msg}`;
    logs.insertBefore(entry, logs.firstChild);
}
