(function() {
    // 1. Initialize Firebase dynamically from URL query parameters
    const params = new URLSearchParams(window.location.search);
    const firebaseConfig = {
        apiKey: params.get('apiKey'),
        authDomain: params.get('authDomain'),
        projectId: params.get('projectId'),
        storageBucket: params.get('storageBucket'),
        messagingSenderId: params.get('messagingSenderId'),
        appId: params.get('appId')
    };

    if (!firebaseConfig.apiKey) {
        document.getElementById('word-display').innerText = "ERROR: Firebase Config Missing!";
        return;
    }

    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    function showToast(msg) {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // 2. Word list for Scribble game
    const WORD_LIST = [
        "apple", "banana", "cat", "dog", "house", "car", "plane", "ship", "cloud", "rain", 
        "sun", "moon", "star", "tree", "flower", "grass", "sword", "shield", "dragon", "alien", 
        "robot", "pizza", "burger", "cake", "clock", "shoe", "shirt", "book", "pencil", "guitar", 
        "phone", "bottle", "window", "door", "table", "chair", "bed", "lamp", "key", "coin", 
        "duck", "fish", "frog", "bird", "lion", "tiger", "bear", "snake", "mouse", "elephant"
    ];

    // 3. Local Player State
    var roomCode = '';
    var playerName = '';
    var isHost = false;
    var myPlayerIndex = -1;
    var localRoomState = null;
    var unsubscribeRoom = null;
    var hostTimerId = null;

    // 4. Canvas State
    const canvas = document.getElementById('drawing-canvas');
    const ctx = canvas.getContext('2d');
    const canvasContainer = document.getElementById('canvas-container');

    var isDrawing = false;
    var drawingPoints = [];
    var currentColor = '#000000';
    var currentSize = 4;
    var localStrokesRenderedCount = 0;

    // Fit canvas to relative size
    function resizeCanvas() {
        canvas.width = canvasContainer.clientWidth;
        canvas.height = canvasContainer.clientHeight;
        localStrokesRenderedCount = 0; // Trigger full redraw
        redrawCanvas();
    }
    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 100);
    window.addEventListener('beforeunload', leaveLobby);

    // 5. Drawing handlers
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', (e) => {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
        var mouseEvent = new MouseEvent('mouseup', {});
        canvas.dispatchEvent(mouseEvent);
        e.preventDefault();
    }, { passive: false });

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / rect.width, // Normalize coordinate ratios (0 to 1) for cross-resolution scaling!
            y: (e.clientY - rect.top) / rect.height
        };
    }

    function startDrawing(e) {
        if (!localRoomState || localRoomState.status !== 'drawing') return;
        
        // Only the drawer can draw!
        const currentDrawer = localRoomState.players[localRoomState.currentDrawerIndex];
        if (!currentDrawer || currentDrawer.name !== playerName) return;

        isDrawing = true;
        drawingPoints = [];
        const pos = getMousePos(e);
        drawingPoints.push(pos);
    }

    function draw(e) {
        if (!isDrawing) return;
        const pos = getMousePos(e);
        
        if (drawingPoints.length > 0) {
            const lastPos = drawingPoints[drawingPoints.length - 1];
            const dx = (pos.x - lastPos.x) * canvas.width;
            const dy = (pos.y - lastPos.y) * canvas.height;
            if (Math.sqrt(dx*dx + dy*dy) < 4) {
                // Only render locally for smoothness, don't store in array to compress
                ctx.lineTo(pos.x * canvas.width, pos.y * canvas.height);
                ctx.stroke();
                return;
            }
        }
        drawingPoints.push(pos);

        // Render locally instantly for latency-free feedback!
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = currentSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const startPos = drawingPoints[drawingPoints.length - 2] || drawingPoints[0];
        ctx.moveTo(startPos.x * canvas.width, startPos.y * canvas.height);
        ctx.lineTo(pos.x * canvas.width, pos.y * canvas.height);
        ctx.stroke();
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        
        if (!localRoomState || localRoomState.status !== 'drawing') return;
        const currentDrawer = localRoomState.players[localRoomState.currentDrawerIndex];
        if (!currentDrawer || currentDrawer.name !== playerName) return;

        // Upload completed stroke to Firestore
        if (drawingPoints.length > 0) {
            const completedStroke = {
                points: drawingPoints,
                color: currentColor,
                size: currentSize
            };
            db.collection('scribble_rooms').doc(roomCode).update({
                strokes: firebase.firestore.FieldValue.arrayUnion(completedStroke)
            }).catch(err => console.log("Upload stroke error:", err));
        }
    }

    function redrawCanvas() {
        if (!localRoomState) return;
        
        // Clear canvas
        ctx.fillStyle = '#f7f6f9';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const strokes = localRoomState.strokes || [];
        strokes.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.size;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.beginPath();
            ctx.moveTo(stroke.points[0].x * canvas.width, stroke.points[0].y * canvas.height);
            for (var i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x * canvas.width, stroke.points[i].y * canvas.height);
            }
            ctx.stroke();
        });
        localStrokesRenderedCount = strokes.length;
    }

    // 6. Brush Tool Bar Setup
    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            currentColor = dot.getAttribute('data-color');
        });
    });

    document.querySelectorAll('.size-btn').forEach(btn => {
        if (btn.getAttribute('data-size')) {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.brush-sizes .size-btn').forEach(b => {
                    if (b.getAttribute('data-size')) b.classList.remove('active');
                });
                btn.classList.add('active');
                currentSize = parseInt(btn.getAttribute('data-size'));
            });
        }
    });

    document.getElementById('btn-clear-canvas').addEventListener('click', () => {
        db.collection('scribble_rooms').doc(roomCode).update({
            strokes: []
        });
    });

    // 7. Room Setup & Lobby Controls
    document.getElementById('btn-create-room').addEventListener('click', createRoom);
    document.getElementById('btn-join-room').addEventListener('click', joinRoom);
    document.getElementById('btn-start-game').addEventListener('click', startGame);
    document.getElementById('btn-leave-lobby').addEventListener('click', leaveLobby);
    document.getElementById('btn-send-chat').addEventListener('click', submitChatGuess);
    document.getElementById('btn-quit-game').addEventListener('click', leaveLobby);
    document.getElementById('btn-show-rules').addEventListener('click', () => {
        showToast("DRAW, GUESS, AND SCORE POINTS!");
    });

    // Hit enter to guess
    document.getElementById('chat-input').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitChatGuess();
        }
    });

    function generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var code = '';
        for (var i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    function createRoom() {
        playerName = document.getElementById('player-name-input').value.trim();
        if (!playerName) {
            playerName = 'Player' + Math.floor(Math.random() * 9000 + 1000);
        }
        
        function tryCreate() {
            roomCode = generateRoomCode();
            const roomRef = db.collection('scribble_rooms').doc(roomCode);
            roomRef.get().then(doc => {
                if (doc.exists) {
                    tryCreate();
                    return;
                }
                isHost = true;
                roomRef.set({
                    roomCode: roomCode,
                    status: 'waiting',
                    players: [{ name: playerName, score: 0, isHost: true, isCorrect: false, active: true }],
                    currentDrawerIndex: 0,
                    currentWord: '',
                    round: 0,
                    timer: 0,
                    strokes: [],
                    guesses: [],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(() => {
                    enterLobby();
                }).catch(err => {
                    showToast("Error creating cabinet: " + err.message);
                });
            });
        }
        
        tryCreate();
    }

    function joinRoom() {
        playerName = document.getElementById('player-name-input').value.trim();
        if (!playerName) {
            playerName = 'Player' + Math.floor(Math.random() * 9000 + 1000);
        }
        roomCode = document.getElementById('room-code-input').value.trim().toUpperCase();
        if (!roomCode || roomCode.length !== 4) {
            showToast("Please enter a valid 4-letter room code!");
            return;
        }

        const roomRef = db.collection('scribble_rooms').doc(roomCode);
        roomRef.get().then(doc => {
            if (!doc.exists) {
                showToast("Room not found!");
                return;
            }
            const data = doc.data();
            if (data.status !== 'waiting') {
                showToast("Game is already in progress!");
                return;
            }

            const playersList = data.players || [];
            // Duplicate name check
            if (playersList.some(p => p.name.toLowerCase() === playerName.toLowerCase())) {
                playerName += '#' + Math.floor(Math.random() * 90 + 10);
            }

            playersList.push({
                name: playerName,
                score: 0,
                isHost: false,
                isCorrect: false,
                active: true
            });

            roomRef.update({
                players: playersList
            }).then(() => {
                isHost = false;
                enterLobby();
            });
        }).catch(err => {
            showToast("Error joining: " + err.message);
        });
    }

    function enterLobby() {
        document.getElementById('lobby-setup-view').style.display = 'none';
        document.getElementById('lobby-waiting-view').style.display = 'block';
        document.getElementById('lobby-code-display').innerText = roomCode;
        document.getElementById('btn-quit-game').style.display = 'block';

        if (isHost) {
            document.getElementById('btn-start-game').style.display = 'block';
            document.getElementById('host-wait-msg').style.display = 'none';
        } else {
            document.getElementById('btn-start-game').style.display = 'none';
            document.getElementById('host-wait-msg').style.display = 'block';
        }

        // Subscribe to room updates
        unsubscribeRoom = db.collection('scribble_rooms').doc(roomCode).onSnapshot(doc => {
            if (!doc.exists) {
                showToast("Room deleted!");
                leaveLobby();
                return;
            }
            handleRoomStateUpdate(doc.data());
        });

        // WhatsApp trigger sound
        if (window.parent && window.parent.playLaserSound) window.parent.playLaserSound();
    }

    function leaveLobby() {
        if (unsubscribeRoom) unsubscribeRoom();
        if (hostTimerId) clearInterval(hostTimerId);

        // Remove from list if lobby is waiting
        if (roomCode && playerName) {
            const roomRef = db.collection('scribble_rooms').doc(roomCode);
            roomRef.get().then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const players = data.players || [];
                    const updated = players.filter(p => p.name !== playerName);
                    
                    if (updated.length === 0) {
                        // Delete room if last player leaves
                        roomRef.delete();
                    } else {
                        // Re-elect host if creator left
                        if (players.find(p => p.name === playerName)?.isHost) {
                            updated[0].isHost = true;
                        }
                        roomRef.update({ players: updated });
                    }
                }
            });
        }

        roomCode = '';
        playerName = '';
        isHost = false;
        localRoomState = null;

        // Reset UI views
        document.getElementById('lobby-overlay').style.display = 'flex';
        document.getElementById('lobby-setup-view').style.display = 'flex';
        document.getElementById('lobby-waiting-view').style.display = 'none';
        document.getElementById('drawer-toolbar').style.display = 'none';
        document.getElementById('chat-input').disabled = true;
        document.getElementById('btn-quit-game').style.display = 'none';
        document.getElementById('word-display').innerText = "CHOOSE / JOIN ROOM";
        document.getElementById('hud-round').innerText = "Waiting";
        document.getElementById('hud-timer').innerText = "--";
    }

    function startGame() {
        if (!isHost) return;

        // Advance to selection state
        advanceToNextTurn(1, 0); // Round 1, Player index 0
    }

    // 8. Reconcile game state changes
    function handleRoomStateUpdate(data) {
        localRoomState = data;
        
        // Find my index
        myPlayerIndex = data.players.findIndex(p => p.name === playerName);
        if (myPlayerIndex === -1) {
            // I was removed or kicked
            leaveLobby();
            return;
        }

        // Re-evaluate host index
        isHost = data.players[myPlayerIndex].isHost;

        // Lobby panel update
        const playersListDiv = document.getElementById('lobby-players-list');
        playersListDiv.innerHTML = '';
        data.players.forEach(p => {
            const row = document.createElement('div');
            row.className = 'lobby-player-row';
            row.innerHTML = `<span>${p.name} ${p.isHost ? '(HOST)' : ''}</span> <span>${p.score} pts</span>`;
            playersListDiv.appendChild(row);
        });

        // Sidebar update
        const scoreboardDiv = document.getElementById('player-list-panel');
        scoreboardDiv.innerHTML = '';
        data.players.forEach((p, idx) => {
            const card = document.createElement('div');
            card.className = `player-card ${idx === data.currentDrawerIndex && data.status === 'drawing' ? 'is-drawer' : ''} ${p.isCorrect ? 'is-correct' : ''}`;
            
            var roleLabel = '';
            if (data.status === 'drawing' && idx === data.currentDrawerIndex) {
                roleLabel = ' ✏️';
            }

            card.innerHTML = `
                <div class="player-card-name">${p.name}${roleLabel}</div>
                <div class="player-card-score">${p.score} PTS</div>
            `;
            scoreboardDiv.appendChild(card);
        });

        // Header timers and rounds
        if (data.status !== 'waiting') {
            document.getElementById('hud-round').innerText = `${data.round}/3`;
            document.getElementById('hud-timer').innerText = data.timer;
        }

        // Reconcile status overlays
        if (data.status === 'waiting') {
            document.getElementById('lobby-overlay').style.display = 'flex';
        } else if (data.status === 'selecting') {
            document.getElementById('lobby-overlay').style.display = 'none';
            
            // Show word choice dialog
            const currentDrawer = data.players[data.currentDrawerIndex];
            if (currentDrawer.name === playerName) {
                document.getElementById('choice-dialog-overlay').style.display = 'flex';
                const choicesDiv = document.getElementById('word-choices-container');
                if (choicesDiv.children.length === 0) {
                    choicesDiv.innerHTML = '';
                    // Select 3 random words
                    const choices = getRandomChoices(3);
                    choices.forEach(word => {
                        const btn = document.createElement('button');
                        btn.className = 'choice-btn';
                        btn.innerText = word;
                        btn.addEventListener('click', () => selectWordToDraw(word));
                        choicesDiv.appendChild(btn);
                    });
                }
                document.getElementById('word-display').innerText = "CHOOSE A WORD TO DRAW!";
            } else {
                document.getElementById('choice-dialog-overlay').style.display = 'flex';
                document.getElementById('word-choices-container').innerHTML = `
                    <div style="font-size: 20px; color: #9692a8; margin: 15px 0;">
                        WAITING FOR ${currentDrawer.name.toUpperCase()} TO CHOOSE A WORD...
                    </div>
                `;
                document.getElementById('word-display').innerText = "WAITING FOR DRAWER...";
            }
            
            // Clear canvas locally
            ctx.fillStyle = '#f7f6f9';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            localStrokesRenderedCount = 0;
        } else if (data.status === 'drawing') {
            document.getElementById('lobby-overlay').style.display = 'none';
            document.getElementById('choice-dialog-overlay').style.display = 'none';

            // Configure toolbar visibility
            const isMeDrawer = data.players[data.currentDrawerIndex].name === playerName;
            const sendBtn = document.getElementById('btn-send-chat');
            if (isMeDrawer) {
                document.getElementById('drawer-toolbar').style.display = 'flex';
                document.getElementById('chat-input').disabled = true;
                document.getElementById('chat-input').placeholder = "YOU ARE THE DRAWER!";
                sendBtn.disabled = true;
                document.getElementById('word-display').innerText = "WORD: " + data.currentWord.toUpperCase();
            } else {
                document.getElementById('drawer-toolbar').style.display = 'none';
                
                // Enable guessing for correct players
                const amICorrect = data.players[myPlayerIndex].isCorrect;
                if (amICorrect) {
                    document.getElementById('chat-input').disabled = true;
                    document.getElementById('chat-input').placeholder = "YOU GUESSED CORRECT!";
                    sendBtn.disabled = true;
                } else {
                    document.getElementById('chat-input').disabled = false;
                    document.getElementById('chat-input').placeholder = "Type guess...";
                    sendBtn.disabled = false;
                }

                // Render word underscores (e.g. A P P L E -> _ _ _ _ _)
                var mask = '';
                for (var char of data.currentWord) {
                    mask += char === ' ' ? '  ' : '_ ';
                }
                document.getElementById('word-display').innerText = "GUESS: " + mask;
            }

            // Sync drawing strokes
            if (data.strokes.length === 0 && localStrokesRenderedCount > 0) {
                ctx.fillStyle = '#f7f6f9';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                localStrokesRenderedCount = 0;
            } else if (data.strokes.length !== localStrokesRenderedCount) {
                redrawCanvas();
            }

            // Re-sync Host-side Timer Thread
            if (isHost && !hostTimerId) {
                startHostTimerLoop();
            }
        } else if (data.status === 'gameover') {
            document.getElementById('lobby-overlay').style.display = 'flex';
            document.getElementById('lobby-setup-view').style.display = 'none';
            document.getElementById('lobby-waiting-view').style.display = 'none';
            
            // Find winner
            var winner = data.players[0];
            data.players.forEach(p => {
                if (p.score > winner.score) winner = p;
            });

            const overlayElem = document.getElementById('lobby-overlay');
            overlayElem.innerHTML = `
                <div class="lobby-box">
                    <div class="lobby-title" style="color: #00ff66;">GAME COMPLETED</div>
                    <div style="font-size: 32px; color: #fff; margin-bottom: 20px; font-weight: bold;">
                        👑 WINNER: ${winner.name.toUpperCase()}
                    </div>
                    <div style="font-size: 24px; color: #dfc06f; margin-bottom: 30px;">
                        SCORE: ${winner.score} POINTS
                    </div>
                    <button class="btn-action" onclick="window.location.reload()">PLAY AGAIN</button>
                </div>
            `;
            
            // Dispatch highscore to parent
            if (myPlayerIndex !== -1 && window.parent) {
                window.parent.postMessage({
                    type: 'FINIXX_GAME_OVER',
                    game: 'scribble',
                    score: data.players[myPlayerIndex].score
                }, '*');
            }

            if (hostTimerId) {
                clearInterval(hostTimerId);
                hostTimerId = null;
            }
        }

        // Render chat messages
        const chatBox = document.getElementById('chat-box');
        const prevMsgCount = chatBox.childElementCount;
        chatBox.innerHTML = '';
        const guesses = data.guesses || [];
        guesses.forEach(msg => {
            const div = document.createElement('div');
            if (msg.isCorrect) {
                div.className = 'chat-msg correct';
                div.innerText = `${msg.name} ${msg.text}`;
            } else if (msg.isSystem) {
                div.className = 'chat-msg system';
                div.innerText = msg.text;
            } else {
                div.className = 'chat-msg';
                div.innerText = `${msg.name}: ${msg.text}`;
            }
            chatBox.appendChild(div);
        });

        // Scroll chat to bottom on new messages
        if (guesses.length > prevMsgCount) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    function getRandomChoices(count) {
        var result = [];
        var clone = [...WORD_LIST];
        for (var i = 0; i < count; i++) {
            const idx = Math.floor(Math.random() * clone.length);
            result.push(clone.splice(idx, 1)[0]);
        }
        return result;
    }

    function selectWordToDraw(word) {
        document.getElementById('choice-dialog-overlay').style.display = 'none';
        
        // Reset player correct states
        const resetPlayers = localRoomState.players.map(p => {
            return { ...p, isCorrect: false };
        });

        db.collection('scribble_rooms').doc(roomCode).update({
            status: 'drawing',
            currentWord: word.toLowerCase(),
            timer: 80,
            strokes: [],
            players: resetPlayers,
            guesses: firebase.firestore.FieldValue.arrayUnion({
                name: 'SYSTEM',
                text: `${playerName.toUpperCase()} is drawing now!`,
                isSystem: true,
                isCorrect: false
            })
        });
    }

    function submitChatGuess() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        if (!localRoomState || localRoomState.status !== 'drawing') return;

        const isMeDrawer = localRoomState.players[localRoomState.currentDrawerIndex].name === playerName;
        if (isMeDrawer) return;

        const guessClean = text.toLowerCase();
        const targetClean = localRoomState.currentWord.toLowerCase();

        if (guessClean === targetClean) {
            // Correct guess!
            const remainingTimer = localRoomState.timer;
            const pointsGained = Math.max(10, Math.round(remainingTimer * 1.5));

            // Update score
            const updatedPlayers = localRoomState.players.map(p => {
                if (p.name === playerName) {
                    return { ...p, score: p.score + pointsGained, isCorrect: true };
                }
                return p;
            });

            // If this guesser is correct, award minor points to the drawer too!
            const drawerIndex = localRoomState.currentDrawerIndex;
            updatedPlayers[drawerIndex].score += 5; // Reward drawing well

            db.collection('scribble_rooms').doc(roomCode).update({
                players: updatedPlayers,
                guesses: firebase.firestore.FieldValue.arrayUnion({
                    name: playerName.toUpperCase(),
                    text: `guessed the word! (+${pointsGained})`,
                    isSystem: false,
                    isCorrect: true
                })
            }).then(() => {
                if (window.parent && window.parent.playCoinSound) window.parent.playCoinSound();
            });
        } else {
            // Wrong guess, push as normal chat
            db.collection('scribble_rooms').doc(roomCode).update({
                guesses: firebase.firestore.FieldValue.arrayUnion({
                    name: playerName,
                    text: text,
                    isSystem: false,
                    isCorrect: false
                })
            });
        }
    }

    // 9. Host Engine Loop (Acts as the coordinator clock)
    function startHostTimerLoop() {
        if (hostTimerId) clearInterval(hostTimerId);
        
        hostTimerId = setInterval(() => {
            if (!isHost || !localRoomState || localRoomState.status !== 'drawing') {
                clearInterval(hostTimerId);
                hostTimerId = null;
                return;
            }

            const currentTimer = localRoomState.timer;
            const players = localRoomState.players;

            // Check if all active guessers have guessed correctly
            const activeGuessers = players.filter((p, idx) => idx !== localRoomState.currentDrawerIndex);
            const allCorrect = activeGuessers.length > 0 && activeGuessers.every(p => p.isCorrect);

            if (currentTimer <= 1 || allCorrect) {
                // Time up or round complete! Advance turn.
                clearInterval(hostTimerId);
                hostTimerId = null;

                const answerWord = localRoomState.currentWord.toUpperCase();
                
                db.collection('scribble_rooms').doc(roomCode).update({
                    guesses: firebase.firestore.FieldValue.arrayUnion({
                        name: 'SYSTEM',
                        text: `The word was: ${answerWord}`,
                        isSystem: true,
                        isCorrect: false
                    })
                }).then(() => {
                    setTimeout(advanceTurnSequence, 2500); // 2.5s delay to let users read answer!
                });
            } else {
                // Decrement timer
                db.collection('scribble_rooms').doc(roomCode).update({
                    timer: currentTimer - 1
                });
            }
        }, 1000);
    }

    function advanceTurnSequence() {
        if (!isHost || !localRoomState) return;

        var nextRound = localRoomState.round;
        var nextDrawerIdx = localRoomState.currentDrawerIndex + 1;

        if (nextDrawerIdx >= localRoomState.players.length) {
            nextDrawerIdx = 0;
            nextRound += 1;
        }

        advanceToNextTurn(nextRound, nextDrawerIdx);
    }

    function advanceToNextTurn(roundVal, drawerIdx) {
        if (roundVal > 3) {
            // End Game!
            db.collection('scribble_rooms').doc(roomCode).update({
                status: 'gameover'
            });
        } else {
            // Set to selection status
            db.collection('scribble_rooms').doc(roomCode).update({
                status: 'selecting',
                round: roundVal,
                currentDrawerIndex: drawerIdx,
                currentWord: '',
                strokes: [],
                guesses: [],
                timer: 0
            }).then(() => {
                document.getElementById('word-choices-container').innerHTML = ''; // Ensure clean slate
            });
        }
    }

})();
