console.log('Hello World!');

// Web Audio API Synthesizer Sound Effects (8-Bit Retro Sounds)
var audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

window.playLaserSound = function() {
    try {
        var ctx = getAudioContext();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.18);
        
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
    } catch(e) {}
};

window.playExplosionSound = function() {
    try {
        var ctx = getAudioContext();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(10, ctx.currentTime + 0.35);
        
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
    } catch(e) {}
};

window.playCoinSound = function() {
    try {
        var ctx = getAudioContext();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.22);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
    } catch(e) {}
};

window.playGameOverSound = function() {
    try {
        var ctx = getAudioContext();
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.65);
        
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.65);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.65);
    } catch(e) {}
};

var drawRipple = function(ev) {
    var x = ev.clientX;
    var y = ev.clientY;
    var node = document.querySelector(".ripple");
    if (!node) return;
    var newNode = node.cloneNode(true);
    newNode.classList.add("animate");
    newNode.style.left = ev.clientX - 5 + "px";
    newNode.style.top = ev.clientY - 5 + "px";
    node.parentNode.replaceChild(newNode, node);
};

window.addEventListener("click", drawRipple);

// Handle the staggered loader fade out on window load
$(window).on('load', function() {
    setTimeout(function() {
        $('.loading-screen').addClass('loaded');
        setTimeout(function() {
            $('.loading-screen').hide();
        }, 500);
    }, 400);
});

// Mobile Swipe gesture control (converts swipes into Keyboard Arrow dispatches)
var touchStartX = 0;
var touchStartY = 0;
var controlMode = 'dpad'; // default mode (dpad or swipe)

window.addEventListener('touchstart', function(e) {
    if (controlMode !== 'swipe') return;
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

window.addEventListener('touchend', function(e) {
    if (controlMode !== 'swipe') return;
    var touchEndX = e.changedTouches[0].screenX;
    var touchEndY = e.changedTouches[0].screenY;
    
    var dx = touchEndX - touchStartX;
    var dy = touchEndY - touchStartY;
    
    if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > 30) {
            if (dx > 0) {
                // Swipe Right (Keycode 39)
                document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 39 }));
            } else {
                // Swipe Left (Keycode 37)
                document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 37 }));
            }
        }
    } else {
        if (Math.abs(dy) > 30) {
            if (dy > 0) {
                // Swipe Down (Keycode 40)
                document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 40 }));
            } else {
                // Swipe Up (Keycode 38)
                document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 38 }));
            }
        }
    }
}, { passive: true });

// Show/Hide Custom Game Modal helpers
window.showGameModal = function(title, score) {
    var modal = document.getElementById('game-modal');
    var titleEl = document.getElementById('modal-title');
    var scoreEl = document.getElementById('modal-score');
    if (titleEl) titleEl.innerText = title;
    if (scoreEl) scoreEl.innerText = score;
    
    // Leaderboard high score check
    var pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && pathParts[pathParts.length - 1].indexOf('.html') !== -1) {
        pathParts.pop();
    }
    var gameName = pathParts.pop() || 'game';
    var gameKey = 'highscore_' + gameName;
    var currentHighScore = parseInt(localStorage.getItem(gameKey) || '0');
    var numericalScore = parseInt(score) || 0;
    
    var isNewRecord = false;
    if (numericalScore > currentHighScore) {
        localStorage.setItem(gameKey, numericalScore.toString());
        currentHighScore = numericalScore;
        isNewRecord = true;
    }

    // Dispatch message to Next.js parent window for Firestore syncing
    try {
        window.parent.postMessage({
            type: 'FINIXX_GAME_OVER',
            game: gameName,
            score: numericalScore
        }, '*');
    } catch(err) {
        console.log("PostMessage to parent failed:", err);
    }
    
    // Display high score text in modal
    var highscoreContainer = document.getElementById('modal-highscore-container');
    if (!highscoreContainer && scoreEl) {
        highscoreContainer = document.createElement('p');
        highscoreContainer.id = 'modal-highscore-container';
        highscoreContainer.style.cssText = 'color:#dfc06f !important; font-size:18px; margin:5px 0 20px 0 !important; font-family:"Jersey 10", sans-serif; letter-spacing:1px; text-align:center;';
        var modalContent = scoreEl.closest('.modal-content') || scoreEl.parentNode;
        if (modalContent) {
            var btn = modalContent.querySelector('button') || modalContent.querySelector('.modal-btn');
            if (btn) {
                modalContent.insertBefore(highscoreContainer, btn);
            } else {
                modalContent.appendChild(highscoreContainer);
            }
        }
    }
    if (highscoreContainer) {
        highscoreContainer.innerHTML = 'HIGH SCORE: <span style="color:#ffffff !important;">' + currentHighScore + '</span>' + 
            (isNewRecord && numericalScore > 0 ? ' <span style="color:#00ff55 !important; font-size:14px; font-weight:bold;">(NEW RECORD!)</span>' : '');
    }
    
    if (modal) modal.style.display = 'flex';
    
    // Play sound effects
    if (title.indexOf('WON') !== -1 || title.indexOf('WIN') !== -1) {
        if (window.playCoinSound) window.playCoinSound();
    } else {
        if (window.playGameOverSound) window.playGameOverSound();
    }
};

window.restartGame = function() {
    window.location.reload();
};

// Auto-inject Virtual Retro D-Pad Controller for Touch Devices
$(function() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) return;

        var path = window.location.pathname.toLowerCase();
        var needsDpad = path.indexOf('space-fire') !== -1;
        if (!needsDpad) return;

        var controls = document.createElement('div');
        controls.id = 'mobile-hud-controls';
        controls.style.cssText = 'position:fixed; bottom:10px; left:10px; right:10px; height:90px; z-index:999; display:flex; justify-content:space-between; align-items:center; pointer-events:none; transition: opacity 0.25s ease;';
        
        // Left Dpad Grid
        var dpad = document.createElement('div');
        dpad.style.cssText = 'width:90px; height:90px; display:grid; grid-template-columns: repeat(3, 30px); grid-template-rows: repeat(3, 30px); pointer-events:auto; transition: opacity 0.2s ease;';
        
        function makeDButton(label, arrowKey) {
            var btn = document.createElement('button');
            btn.innerText = label;
            btn.style.cssText = 'background:rgba(14, 12, 21, 0.7); color:#dfc06f; border:2px solid #dfc06f; font-family:"Jersey 10", sans-serif; font-size:14px; border-radius:50%; width:26px; height:26px; padding:0; cursor:pointer; outline:none; display:flex; justify-content:center; align-items:center;';
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: arrowKey }));
                btn.style.background = '#dfc06f';
                btn.style.color = '#0e0c15';
            });
            btn.addEventListener('touchend', function(e) {
                e.preventDefault();
                document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: arrowKey }));
                btn.style.background = 'rgba(14, 12, 21, 0.7)';
                btn.style.color = '#dfc06f';
            });
            return btn;
        }
        
        var btnUp = makeDButton('U', 38);
        var btnLeft = makeDButton('L', 37);
        var btnRight = makeDButton('R', 39);
        var btnDown = makeDButton('D', 40);
        
        var empty = () => document.createElement('div');
        
        dpad.appendChild(empty());
        dpad.appendChild(btnUp);
        dpad.appendChild(empty());
        dpad.appendChild(btnLeft);
        dpad.appendChild(empty());
        dpad.appendChild(btnRight);
        dpad.appendChild(empty());
        dpad.appendChild(btnDown);
        dpad.appendChild(empty());
        
        controls.appendChild(dpad);
        
        // Show Fire Button only for Space Fire game page
        var fireBtn = null;
        if (path.indexOf('space-fire') !== -1) {
            fireBtn = document.createElement('button');
            fireBtn.innerText = 'FIRE';
            fireBtn.style.cssText = 'width:50px; height:50px; border-radius:50%; background:rgba(255, 1, 70, 0.4); color:#ff0146; border:3px solid #ff0146; font-family:"Jersey 10", sans-serif; font-size:14px; font-weight:bold; cursor:pointer; pointer-events:auto; display:flex; justify-content:center; align-items:center; outline:none; transition: opacity 0.2s ease;';
            fireBtn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 32 }));
                fireBtn.style.background = '#ff0146';
                fireBtn.style.color = '#ffffff';
            });
            fireBtn.addEventListener('touchend', function(e) {
                e.preventDefault();
                document.dispatchEvent(new KeyboardEvent('keyup', { keyCode: 32 }));
                fireBtn.style.background = 'rgba(255, 1, 70, 0.4)';
                fireBtn.style.color = '#ff0146';
            });
            controls.appendChild(fireBtn);
        }
        
        document.body.appendChild(controls);
        
        // Mode Selector Toggle button (D-PAD vs SWIPE)
        var modeToggle = document.createElement('button');
        modeToggle.innerText = 'MODE: D-PAD';
        modeToggle.style.cssText = 'position:fixed; top:10px; right:10px; background:rgba(14, 12, 21, 0.85); color:#dfc06f; border:2px solid #dfc06f; font-family:"Jersey 10", sans-serif; font-size:14px; padding:4px 10px; cursor:pointer; z-index:1000; outline:none; letter-spacing:0.5px; text-transform:uppercase;';
        
        modeToggle.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (controlMode === 'dpad') {
                controlMode = 'swipe';
                modeToggle.innerText = 'MODE: SWIPE';
                dpad.style.opacity = '0';
                dpad.style.pointerEvents = 'none';
                if (fireBtn) {
                    fireBtn.style.opacity = '0';
                    fireBtn.style.pointerEvents = 'none';
                }
            } else {
                controlMode = 'dpad';
                modeToggle.innerText = 'MODE: D-PAD';
                dpad.style.opacity = '1';
                dpad.style.pointerEvents = 'auto';
                if (fireBtn) {
                    fireBtn.style.opacity = '1';
                    fireBtn.style.pointerEvents = 'auto';
                }
            }
        });
        
        document.body.appendChild(modeToggle);
    }
});
