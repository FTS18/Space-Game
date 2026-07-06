window.onload = function() {
  setTimeout(function() {
    var canvas = document.createElement("canvas"),
      width = canvas.width = window.innerWidth,
      height = canvas.height = window.innerHeight;

    var enemyScore = 0,
      playerScore = 0;

    document.body.appendChild(canvas);

    var ctx = canvas.getContext("2d");

    // Paddle velocity trackers for spin calculation
    var playerPaddleVy = 0;
    var lastPlayerPaddleY = 0;

    var paddle = {
      _x: 0,
      _y: 0,
      _width: 0,
      _height: 0,
      create: function(x, y, width, height) {
        var p = Object.create(this);
        p._x = x;
        p._y = y;
        p._width = width;
        p._height = height;
        return p;
      },

      render: function(c) {
        c.fillRect(this._x, this._y, this._width, this._height);
      },

      setX: function(x) {
        this._x = x
      },

      setY: function(y) {
        // Clamp paddle to the current window height
        this._y = Math.max(0, Math.min(height - this._height, y));
      },

      getX: function() {
        return this._x;
      },

      getY: function() {
        return this._y;
      },

      getWidth: function() {
        return this._width;
      },

      getHeight: function() {
        return this._height;
      }
    };

    var particles = [];

    var ball = {
      _x: width / 2,
      _y: height / 2,
      _vx: -6,
      _vy: 3,
      _spin: 0,
      _speed: 7, // base speed
      _size: 10,
      _history: [],

      update: function() {
        // Save history for trail
        this._history.push({ x: this._x, y: this._y });
        if (this._history.length > 5) {
          this._history.shift();
        }

        // Move position. Apply spin drift directly to y position instead of compounding _vy.
        // This conserves velocity magnitude and keeps deflection angles natural!
        this._x += this._vx;
        this._y += this._vy + this._spin;
        
        // Spin decay
        this._spin *= 0.94;
      },

      render: function(c) {
        // Draw motion trails
        for (var i = 0; i < this._history.length; i++) {
          var pos = this._history[i];
          var alpha = (i + 1) / (this._history.length + 1) * 0.35;
          c.beginPath();
          c.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
          c.arc(pos.x, pos.y, this._size * (0.6 + i * 0.08), 0, Math.PI * 2);
          c.fill();
          c.closePath();
        }

        c.beginPath();
        c.fillStyle = "#ffffff";
        c.arc(this._x, this._y, this._size, 0, Math.PI * 2);
        c.fill();
        c.closePath();
      }
    };

    // Responsive sizing
    var paddleHeight = Math.max(100, height * 0.20);
    var playerPaddle = paddle.create(20, (height - paddleHeight) / 2, 12, paddleHeight);
    var enemyPaddle = paddle.create(width - 32, (height - paddleHeight) / 2, 12, paddleHeight);

    // Dynamic resize handler to update dimensions on orientation rotation
    window.addEventListener("resize", function() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Update sizes and bounds
      var newPaddleHeight = Math.max(100, height * 0.20);
      playerPaddle._height = newPaddleHeight;
      enemyPaddle._height = newPaddleHeight;
      
      enemyPaddle.setX(width - 32);
      
      // Keep paddles within bounds
      playerPaddle.setY(playerPaddle.getY());
      enemyPaddle.setY(enemyPaddle.getY());
    });

    // Event listeners
    document.body.addEventListener("mousemove", mouseMoveHandler);
    document.body.addEventListener("touchmove", touchMoveHandler, { passive: false });

    function mouseMoveHandler(event) {
      playerPaddle.setY(event.clientY - playerPaddle.getHeight() / 2);
    }

    function touchMoveHandler(event) {
      if (event.touches.length > 0) {
        playerPaddle.setY(event.touches[0].clientY - playerPaddle.getHeight() / 2);
        event.preventDefault(); // Prevent scroll bounce
      }
    }

    function reset(servesToPlayer) {
      ball._x = width / 2;
      ball._y = height / 2;
      ball._speed = 7;
      ball._spin = 0;
      ball._vx = (servesToPlayer ? -1 : 1) * ball._speed;
      ball._vy = (Math.random() * 2 - 1) * 3;
    }

    window.restartGame = function() {
      playerScore = 0;
      enemyScore = 0;
      reset(true);
      
      // Hide modal
      var modal = document.getElementById('game-modal');
      if (modal) modal.style.display = 'none';
      
      // Restart loop
      requestAnimationFrame(update);
    };

    function handlePaddleHit(paddleObj, isPlayer) {
      // Calculate relative intersection point on paddle (-1 to 1)
      var relativeY = (ball._y - paddleObj.getY()) / paddleObj.getHeight();
      var normalizedRelativeIntersectionY = (relativeY - 0.5) * 2;
      
      // Calculate reflection angle (max 60 degrees / PI/3)
      var bounceAngle = normalizedRelativeIntersectionY * (Math.PI / 3);
      
      // Smash check: increase speed if paddle was moving fast
      var currentSpeed = ball._speed;
      if (isPlayer && Math.abs(playerPaddleVy) > 6) {
        currentSpeed *= 1.25;
        ball._spin = playerPaddleVy * 0.35; // Curve drift
      } else {
        ball._spin = (isPlayer ? playerPaddleVy : 0) * 0.15; // Curve drift
      }

      // Cap speed
      ball._speed = Math.min(18, currentSpeed + 0.5);

      // Set velocity vectors
      ball._vx = (isPlayer ? 1 : -1) * ball._speed * Math.cos(bounceAngle);
      ball._vy = ball._speed * Math.sin(bounceAngle);

      // Spawn retro paddle collision sparks
      for (var i = 0; i < 12; i++) {
        particles.push({
          x: ball._x,
          y: ball._y,
          vx: (isPlayer ? 1 : -1) * (Math.random() * 4 + 2),
          vy: (Math.random() * 6 - 3),
          size: Math.random() * 3 + 1,
          color: isPlayer ? "#dfc06f" : "#ff0146",
          alpha: 1.0
        });
      }

      // Play retro bounce sound
      if (window.playLaserSound) window.playLaserSound();
    }

    update();

    function update() {
      // Calculate player paddle velocity
      playerPaddleVy = playerPaddle.getY() - lastPlayerPaddleY;
      lastPlayerPaddleY = playerPaddle.getY();

      ctx.fillStyle = "#0e0c15";
      ctx.fillRect(0, 0, width, height);

      // Draw middle divider line
      ctx.strokeStyle = "rgba(223, 192, 111, 0.15)";
      ctx.lineWidth = 4;
      ctx.setLineDash([15, 15]);
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top/Bottom Wall Collisions
      if (ball._y - ball._size < 0) {
        ball._y = ball._size;
        ball._vy *= -1;
        if (window.playLaserSound) window.playLaserSound();
      } else if (ball._y + ball._size > height) {
        ball._y = height - ball._size;
        ball._vy *= -1;
        if (window.playLaserSound) window.playLaserSound();
      }

      // Check Player Paddle Collision
      if (ball._vx < 0 && ball._x - ball._size <= playerPaddle.getX() + playerPaddle.getWidth() && ball._x + ball._size >= playerPaddle.getX()) {
        if (ball._y >= playerPaddle.getY() && ball._y <= playerPaddle.getY() + playerPaddle.getHeight()) {
          handlePaddleHit(playerPaddle, true);
        }
      }

      // Check Enemy Paddle Collision
      if (ball._vx > 0 && ball._x + ball._size >= enemyPaddle.getX() && ball._x - ball._size <= enemyPaddle.getX() + enemyPaddle.getWidth()) {
        if (ball._y >= enemyPaddle.getY() && ball._y <= enemyPaddle.getY() + enemyPaddle.getHeight()) {
          handlePaddleHit(enemyPaddle, false);
        }
      }

      // Score checking
      if (ball._x - ball._size < 0) {
        enemyScore++;
        if (window.playExplosionSound) window.playExplosionSound();
        reset(true);
      } else if (ball._x + ball._size > width) {
        playerScore++;
        if (window.playCoinSound) window.playCoinSound();
        reset(false);
      }

      // Adaptive CPU AI Tracking
      var targetY = ball._y - enemyPaddle.getHeight() / 2;
      var currentEnemyY = enemyPaddle.getY();
      var diff = targetY - currentEnemyY;
      
      // Speed multiplier increases as player score rises
      var baseTrackingSpeed = 0.07;
      var trackingSpeed = Math.min(0.12, baseTrackingSpeed + (playerScore * 0.005));
      enemyPaddle.setY(currentEnemyY + diff * trackingSpeed);

      // Physics updates
      ball.update();

      // Render elements
      ctx.fillStyle = "#dfc06f"; // Gold styling
      playerPaddle.render(ctx);
      
      ctx.fillStyle = "#ff0146"; // Red enemy styling
      enemyPaddle.render(ctx);
      
      ctx.fillStyle = "#ffffff";
      ball.render(ctx);

      // Update and draw active particles
      for (var p = particles.length - 1; p >= 0; p--) {
        var part = particles[p];
        part.x += part.vx;
        part.y += part.vy;
        part.alpha -= 0.04;
        if (part.alpha <= 0) {
          particles.splice(p, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = part.alpha;
        ctx.fillStyle = part.color;
        ctx.fillRect(part.x, part.y, part.size, part.size);
        ctx.restore();
      }

      // Score displays
      ctx.font = "80px 'Jersey 10', sans-serif";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(223, 192, 111, 0.4)";
      ctx.fillText(playerScore, width / 4, height / 5);
      ctx.fillStyle = "rgba(255, 1, 70, 0.25)";
      ctx.fillText(enemyScore, (width / 4) * 3, height / 5);

      // Win/Loss thresholds
      if (playerScore >= 10) {
        if (window.showGameModal) {
          window.showGameModal("YOU HAVE WON!", playerScore + " - " + enemyScore);
        } else {
          alert("You Have Won! " + playerScore + " - " + enemyScore);
        }
        return;
      }
      if (enemyScore >= 10) {
        if (window.showGameModal) {
          window.showGameModal("GAME OVER", playerScore + " - " + enemyScore);
        } else {
          alert("Game Over! " + playerScore + " - " + enemyScore);
        }
        return;
      }

      requestAnimationFrame(update);
    }
  }, 1000);
}
