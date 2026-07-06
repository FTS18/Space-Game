document.addEventListener('DOMContentLoaded', () => {
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
        } catch (e) {
            console.error("Firebase init failed:", e);
        }
    }

    // 2. Core Game Variables
    let board = Array(9).fill(null);
    let currentPlayer = 'X';
    let gameActive = true;
    let gameMode = 'pvp'; // pvp, pve, or online
    let difficulty = 'easy'; // easy or hard
    
    let scoreX = 0;
    let scoreO = 0;
    let scoreTies = 0;

    // Online game states
    let roomCode = '';
    let playerName = '';
    let myRole = ''; // 'X' or 'O'
    let unsubscribeRoom = null;
    let localRoomData = null;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const cells = document.querySelectorAll('.cell');
    const playerIndicator = document.getElementById('current-player');
    const scoreXDisplay = document.getElementById('score-x');
    const scoreODisplay = document.getElementById('score-o');
    const scoreTiesDisplay = document.getElementById('score-ties');
    const labelX = document.getElementById('label-x');
    const labelO = document.getElementById('label-o');

    // Mode Buttons Selectors
    const btnPvP = document.getElementById('btn-pvp');
    const btnPvE = document.getElementById('btn-pve');
    const btnOnline = document.getElementById('btn-online');
    const diffSelectDiv = document.getElementById('diff-select');
    const btnEasy = document.getElementById('btn-easy');
    const btnHard = document.getElementById('btn-hard');

    // Online Lobby Selectors
    const lobbyOverlay = document.getElementById('lobby-overlay');
    const lobbySetupView = document.getElementById('lobby-setup-view');
    const lobbyWaitingView = document.getElementById('lobby-waiting-view');
    const btnCreateRoom = document.getElementById('btn-create-room');
    const btnJoinRoom = document.getElementById('btn-join-room');
    const btnCancelOnline = document.getElementById('btn-cancel-online');
    const btnLeaveLobby = document.getElementById('btn-leave-lobby');

    // Mode Select Handlers
    btnPvP.addEventListener('click', () => {
        setGameMode('pvp');
        resetScores();
        restartRound();
    });
    btnPvE.addEventListener('click', () => {
        setGameMode('pve');
        resetScores();
        restartRound();
    });
    btnOnline.addEventListener('click', () => {
        if (!db) {
            alert("Online play is unavailable. Firebase credentials missing!");
            return;
        }
        setGameMode('online');
    });

    btnEasy.addEventListener('click', () => {
        setDifficulty('easy');
        restartRound();
    });
    btnHard.addEventListener('click', () => {
        setDifficulty('hard');
        restartRound();
    });

    function setGameMode(mode) {
        gameMode = mode;
        btnPvP.classList.remove('active');
        btnPvE.classList.remove('active');
        btnOnline.classList.remove('active');
        diffSelectDiv.style.display = 'none';

        if (mode === 'pvp') {
            btnPvP.classList.add('active');
            labelX.innerText = 'PLAYER X';
            labelO.innerText = 'PLAYER O';
            closeOnlineSession();
        } else if (mode === 'pve') {
            btnPvE.classList.add('active');
            diffSelectDiv.style.display = 'flex';
            labelX.innerText = 'PLAYER X';
            labelO.innerText = 'COMPUTER';
            closeOnlineSession();
        } else if (mode === 'online') {
            btnOnline.classList.add('active');
            // Show setup dialog
            lobbyOverlay.style.display = 'flex';
            lobbySetupView.style.display = 'flex';
            lobbyWaitingView.style.display = 'none';
        }
        if (window.playLaserSound) window.playLaserSound();
    }

    function setDifficulty(diff) {
        difficulty = diff;
        if (diff === 'easy') {
            btnEasy.classList.add('active');
            btnHard.classList.remove('active');
        } else {
            btnEasy.classList.remove('active');
            btnHard.classList.add('active');
        }
        if (window.playLaserSound) window.playLaserSound();
    }

    function resetScores() {
        scoreX = 0;
        scoreO = 0;
        scoreTies = 0;
        updateScoreboard();
    }

    function updateScoreboard() {
        scoreXDisplay.innerText = scoreX;
        scoreODisplay.innerText = scoreO;
        scoreTiesDisplay.innerText = scoreTies;
    }

    // Cell Click handler
    cells.forEach(cell => {
        cell.addEventListener('click', () => handleCellClick(cell));
    });

    function handleCellClick(cell) {
        const index = parseInt(cell.getAttribute('data-index'));

        if (gameMode === 'online') {
            // Online turns checks
            if (!localRoomData || localRoomData.status !== 'playing' || !gameActive) return;
            if (localRoomData.currentPlayer !== myRole) return; // Not my turn!
            if (board[index] !== null) return; // Already marked

            makeOnlineMove(index);
            return;
        }

        // Local Modes check
        if (board[index] !== null || !gameActive) return;

        makeMove(index, currentPlayer);

        const winCond = getWinningCondition(board, currentPlayer);
        if (winCond) {
            drawWinLine(winCond);
            endRound(currentPlayer + ' WINS!');
            return;
        }

        if (checkTie(board)) {
            endRound('TIE GAME!');
            return;
        }

        // Switch Turn
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        playerIndicator.innerText = currentPlayer;
        playerIndicator.className = (currentPlayer === 'X') ? 'gold-text' : 'red-text';

        // Trigger AI if computer's turn
        if (gameMode === 'pve' && currentPlayer === 'O' && gameActive) {
            setTimeout(makeAIMove, 400);
        }
    }

    function makeMove(index, player) {
        board[index] = player;
        const cell = cells[index];
        cell.classList.remove('x-mark', 'o-mark');
        cell.classList.add(player.toLowerCase() + '-mark');
        
        if (player === 'X') {
            if (window.playCoinSound) window.playCoinSound();
        } else {
            if (window.playLaserSound) window.playLaserSound();
        }
    }

    // ==========================================
    // MULTIPLAYER REAL-TIME ENGINE
    // ==========================================
    btnCancelOnline.addEventListener('click', () => {
        setGameMode('pvp');
    });

    btnCreateRoom.addEventListener('click', createOnlineRoom);
    btnJoinRoom.addEventListener('click', joinOnlineRoom);
    btnLeaveLobby.addEventListener('click', () => {
        leaveOnlineRoom();
        setGameMode('pvp');
    });

    function generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    function createOnlineRoom() {
        playerName = document.getElementById('player-name-input').value.trim();
        if (!playerName) {
            playerName = 'Player' + Math.floor(Math.random() * 9000 + 1000);
        }
        roomCode = generateRoomCode();
        myRole = 'X'; // Creator gets X

        db.collection('tictactoe_rooms').doc(roomCode).set({
            roomCode: roomCode,
            status: 'waiting',
            players: [{ name: playerName, role: 'X' }],
            board: Array(9).fill(null),
            currentPlayer: 'X',
            scores: { X: 0, O: 0, Ties: 0 },
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            enterLobby();
        }).catch(err => {
            alert("Error creating room: " + err.message);
        });
    }

    function joinOnlineRoom() {
        playerName = document.getElementById('player-name-input').value.trim();
        if (!playerName) {
            playerName = 'Player' + Math.floor(Math.random() * 9000 + 1000);
        }
        roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
        if (!roomCode || roomCode.length !== 4) {
            alert("Please enter a valid 4-letter room code!");
            return;
        }

        const roomRef = db.collection('tictactoe_rooms').doc(roomCode);
        roomRef.get().then(doc => {
            if (!doc.exists) {
                alert("Room not found!");
                return;
            }
            const data = doc.data();
            if (data.status !== 'waiting') {
                alert("Lobby is already active/full!");
                return;
            }

            const list = data.players || [];
            if (list.length >= 2) {
                alert("Room is full!");
                return;
            }

            list.push({ name: playerName, role: 'O' });
            myRole = 'O'; // Joiner gets O

            roomRef.update({
                players: list,
                status: 'playing' // Auto start when 2nd player joins!
            }).then(() => {
                enterLobby();
            });
        }).catch(err => {
            alert("Error joining lobby: " + err.message);
        });
    }

    function enterLobby() {
        lobbySetupView.style.display = 'none';
        lobbyWaitingView.style.display = 'flex';
        document.getElementById('lobby-code-display').innerText = roomCode;

        unsubscribeRoom = db.collection('tictactoe_rooms').doc(roomCode).onSnapshot(doc => {
            if (!doc.exists) {
                alert("Room disconnected!");
                leaveOnlineRoom();
                setGameMode('pvp');
                return;
            }
            handleOnlineStateUpdate(doc.data());
        });
    }

    function leaveOnlineRoom() {
        closeOnlineSession();
        // Reset local variables
        roomCode = '';
        playerName = '';
        myRole = '';
        localRoomData = null;
    }

    function closeOnlineSession() {
        if (unsubscribeRoom) {
            unsubscribeRoom();
            unsubscribeRoom = null;
        }

        if (roomCode && playerName) {
            const roomRef = db.collection('tictactoe_rooms').doc(roomCode);
            roomRef.get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const players = data.players || [];
                    const updated = players.filter(p => p.name !== playerName);
                    
                    if (updated.length === 0) {
                        roomRef.delete();
                    } else {
                        roomRef.update({ players: updated, status: 'waiting' });
                    }
                }
            });
        }
        lobbyOverlay.style.display = 'none';
    }

    function handleOnlineStateUpdate(data) {
        localRoomData = data;

        // Sync player cards labels
        const p1 = data.players.find(p => p.role === 'X');
        const p2 = data.players.find(p => p.role === 'O');

        labelX.innerText = p1 ? p1.name.toUpperCase() : 'WAITING...';
        labelO.innerText = p2 ? p2.name.toUpperCase() : 'WAITING...';

        // Reconcile wait views
        const playersList = document.getElementById('lobby-players-list');
        playersList.innerHTML = '';
        data.players.forEach(p => {
            const div = document.createElement('div');
            div.className = 'lobby-player-row';
            div.innerHTML = `<span>${p.name.toUpperCase()}</span> <span>MARK: ${p.role}</span>`;
            playersList.appendChild(div);
        });

        // Toggle state overlays
        if (data.status === 'playing') {
            lobbyOverlay.style.display = 'none';
        } else {
            lobbyOverlay.style.display = 'flex';
            lobbySetupView.style.display = 'none';
            lobbyWaitingView.style.display = 'flex';
        }

        // Sync board tiles
        board = data.board;
        cells.forEach((cell, idx) => {
            const mark = board[idx];
            cell.classList.remove('x-mark', 'o-mark');
            if (mark) {
                cell.classList.add(mark.toLowerCase() + '-mark');
            }
        });

        // Sync turn indicators
        currentPlayer = data.currentPlayer;
        playerIndicator.innerText = currentPlayer;
        playerIndicator.className = (currentPlayer === 'X') ? 'gold-text' : 'red-text';

        // Sync scores
        scoreX = data.scores.X;
        scoreO = data.scores.O;
        scoreTies = data.scores.Ties;
        updateScoreboard();

        // Local check for round over to draw line / show modal
        evaluateOnlineRoundEnd(data);
    }

    function makeOnlineMove(index) {
        const newBoard = [...board];
        newBoard[index] = myRole;

        const nextPlayer = (myRole === 'X') ? 'O' : 'X';
        const winCond = getWinningCondition(newBoard, myRole);

        let targetStatus = 'playing';
        const newScores = { X: scoreX, O: scoreO, Ties: scoreTies };

        if (winCond) {
            targetStatus = 'gameover';
            if (myRole === 'X') newScores.X++;
            else newScores.O++;
        } else if (checkTie(newBoard)) {
            targetStatus = 'gameover';
            newScores.Ties++;
        }

        db.collection('tictactoe_rooms').doc(roomCode).update({
            board: newBoard,
            currentPlayer: nextPlayer,
            status: targetStatus,
            scores: newScores
        }).catch(err => console.log("Make move failed:", err));
    }

    function evaluateOnlineRoundEnd(data) {
        // Draw winning line if anyone won
        const winCondX = getWinningCondition(data.board, 'X');
        const winCondO = getWinningCondition(data.board, 'O');

        if (winCondX) {
            drawWinLine(winCondX);
            triggerModalTimeout('PLAYER X WINS!', data);
        } else if (winCondO) {
            drawWinLine(winCondO);
            triggerModalTimeout('PLAYER O WINS!', data);
        } else if (checkTie(data.board) && data.status === 'gameover') {
            triggerModalTimeout('TIE GAME!', data);
        } else {
            // Hide win lines and modal if playing
            const svg = document.getElementById('win-line-svg');
            if (svg) svg.style.display = 'none';
            const modal = document.getElementById('game-modal');
            if (modal) modal.style.display = 'none';
            gameActive = true;
        }
    }

    let modalTimerId = null;
    function triggerModalTimeout(titleText, data) {
        gameActive = false;
        if (modalTimerId) clearTimeout(modalTimerId);

        modalTimerId = setTimeout(() => {
            if (window.showGameModal) {
                const scoreSummary = `${labelX.innerText}: ${data.scores.X} | ${labelO.innerText}: ${data.scores.O} | Ties: ${data.scores.Ties}`;
                window.showGameModal(titleText, scoreSummary);
            }
        }, 800);
    }

    // ==========================================
    // LOCAL ENGINE / FALLBACKS
    // ==========================================
    function makeAIMove() {
        if (!gameActive) return;

        let bestMove;
        if (difficulty === 'easy') {
            bestMove = getRandomMove();
        } else {
            bestMove = getMinimaxMove();
        }

        if (bestMove !== undefined && bestMove !== null) {
            makeMove(bestMove, 'O');

            const winCond = getWinningCondition(board, 'O');
            if (winCond) {
                drawWinLine(winCond);
                endRound(gameMode === 'pve' ? 'COMPUTER WINS!' : 'PLAYER O WINS!');
                return;
            }

            if (checkTie(board)) {
                endRound('TIE GAME!');
                return;
            }

            currentPlayer = 'X';
            playerIndicator.innerText = currentPlayer;
            playerIndicator.className = 'gold-text';
        }
    }

    function getRandomMove() {
        const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        if (emptyIndices.length === 0) return null;
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    function getMinimaxMove() {
        let bestVal = -Infinity;
        let bestMove = null;

        for (let i = 0; i < 9; i++) {
            if (board[i] === null) {
                board[i] = 'O'; // Computer marker
                let moveVal = minimax(board, 0, false);
                board[i] = null;

                if (moveVal > bestVal) {
                    bestVal = moveVal;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    function minimax(tempBoard, depth, isMax) {
        if (checkWin(tempBoard, 'O')) return 10 - depth;
        if (checkWin(tempBoard, 'X')) return depth - 10;
        if (checkTie(tempBoard)) return 0;

        if (isMax) {
            let best = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (tempBoard[i] === null) {
                    tempBoard[i] = 'O';
                    best = Math.max(best, minimax(tempBoard, depth + 1, false));
                    tempBoard[i] = null;
                }
            }
            return best;
        } else {
            let best = Infinity;
            for (let i = 0; i < 9; i++) {
                if (tempBoard[i] === null) {
                    tempBoard[i] = 'X';
                    best = Math.min(best, minimax(tempBoard, depth + 1, true));
                    tempBoard[i] = null;
                }
            }
            return best;
        }
    }

    function checkWin(tempBoard, player) {
        return winningConditions.some(condition => {
            return condition.every(index => tempBoard[index] === player);
        });
    }

    function getWinningCondition(tempBoard, player) {
        return winningConditions.find(condition => {
            return condition.every(index => tempBoard[index] === player);
        });
    }

    function drawWinLine(condition) {
        const startCell = cells[condition[0]];
        const endCell = cells[condition[2]];
        
        const boardElem = document.querySelector('.board');
        const boardRect = boardElem.getBoundingClientRect();
        const startRect = startCell.getBoundingClientRect();
        const endRect = endCell.getBoundingClientRect();
        
        const x1 = startRect.left - boardRect.left + startRect.width / 2;
        const y1 = startRect.top - boardRect.top + startRect.height / 2;
        const x2 = endRect.left - boardRect.left + endRect.width / 2;
        const y2 = endRect.top - boardRect.top + endRect.height / 2;
        
        const svg = document.getElementById('win-line-svg');
        const line = document.getElementById('win-line');
        
        const length = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke-dasharray', length);
        line.setAttribute('stroke-dashoffset', length);
        
        svg.style.display = 'block';
        
        line.getBoundingClientRect();
        line.setAttribute('stroke-dashoffset', '0');
    }

    function checkTie(tempBoard) {
        return tempBoard.every(cell => cell !== null);
    }

    function endRound(resultText) {
        gameActive = false;

        // Update score tallies
        if (resultText.includes('WINS') && currentPlayer === 'X') {
            scoreX++;
        } else if (resultText.includes('WINS') || resultText.includes('COMPUTER WINS')) {
            scoreO++;
        } else {
            scoreTies++;
        }
        updateScoreboard();

        setTimeout(() => {
            if (window.showGameModal) {
                const scoreSummary = `X: ${scoreX} | O: ${scoreO} | Ties: ${scoreTies}`;
                window.showGameModal(resultText, scoreSummary);
            } else {
                alert(resultText);
            }
        }, 800);
    }

    window.restartRound = function() {
        if (gameMode === 'online') {
            // Trigger Firestore board resets
            if (roomCode && myRole === 'X') {
                db.collection('tictactoe_rooms').doc(roomCode).update({
                    board: Array(9).fill(null),
                    currentPlayer: 'X',
                    status: 'playing'
                });
            }
            return;
        }

        board = Array(9).fill(null);
        gameActive = true;
        currentPlayer = 'X';
        playerIndicator.innerText = currentPlayer;
        playerIndicator.className = 'gold-text';

        cells.forEach(cell => {
            cell.classList.remove('x-mark', 'o-mark');
        });

        const svg = document.getElementById('win-line-svg');
        if (svg) svg.style.display = 'none';
        
        const modal = document.getElementById('game-modal');
        if (modal) modal.style.display = 'none';
        
        if (window.playLaserSound) window.playLaserSound();
    };

    window.restartGame = function() {
        restartRound();
    };
});
