document.addEventListener('DOMContentLoaded', () => {

  const scoreDisplay = document.getElementById('score')
  const width = 28
  let score = 0
  const grid = document.querySelector('.grid')
  const layout = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 3, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 3, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 2, 2, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    4, 4, 4, 4, 4, 4, 0, 0, 0, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 0, 0, 0, 4, 4, 4, 4, 4, 4,
    1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 2, 2, 2, 2, 2, 2, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 0, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
    1, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 3, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
  ]

  const squares = []

  //create your board
  function createBoard() {
    for (let i = 0; i < layout.length; i++) {
      const square = document.createElement('div')
      grid.appendChild(square)
      squares.push(square)

      //add layout to the board
      if (layout[i] === 0) {
        squares[i].classList.add('pac-dot')
      } else if (layout[i] === 1) {
        squares[i].classList.add('wall')
      } else if (layout[i] === 2) {
        squares[i].classList.add('ghost-lair')
      } else if (layout[i] === 3) {
        squares[i].classList.add('power-pellet')
      }
    }
  }
  createBoard()

  //create Characters
  let pacmanCurrentIndex = 490
  squares[pacmanCurrentIndex].classList.add('pac-man')

  // Continuous movement loop logic
  let currentDirection = null
  let nextDirection = null
  const pacmanSpeed = 220 // ms per cell

  function handleKeyDown(e) {
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
    }
    switch (e.keyCode) {
      case 37: nextDirection = -1; break;     // Left
      case 38: nextDirection = -width; break; // Up
      case 39: nextDirection = 1; break;      // Right
      case 40: nextDirection = width; break;  // Down
    }
  }
  document.addEventListener('keydown', handleKeyDown)

  const pacmanTimer = setInterval(function() {
    if (!nextDirection && !currentDirection) return;

    // Check if we can route in the newly buffered direction
    let targetNext = pacmanCurrentIndex + nextDirection;
    if (nextDirection === -1 && pacmanCurrentIndex % width === 0) targetNext = pacmanCurrentIndex + (width - 1);
    if (nextDirection === 1 && (pacmanCurrentIndex + 1) % width === 0) targetNext = pacmanCurrentIndex - (width - 1);

    if (targetNext >= 0 && targetNext < width * width &&
        !squares[targetNext].classList.contains('wall') &&
        !squares[targetNext].classList.contains('ghost-lair')) {
      currentDirection = nextDirection;
    }

    if (currentDirection === null) return;

    // Compute actual destination
    let targetIndex = pacmanCurrentIndex + currentDirection;
    let wrapped = false;
    
    // Side tunnels wrapping checks
    if (currentDirection === -1 && pacmanCurrentIndex === 364) {
      targetIndex = 391;
      wrapped = true;
    } else if (currentDirection === 1 && pacmanCurrentIndex === 391) {
      targetIndex = 364;
      wrapped = true;
    }

    if (wrapped || (targetIndex >= 0 && targetIndex < width * width &&
        !squares[targetIndex].classList.contains('wall') &&
        !squares[targetIndex].classList.contains('ghost-lair'))) {
      
      squares[pacmanCurrentIndex].classList.remove('pac-man')
      squares[pacmanCurrentIndex].style.transform = ''
      pacmanCurrentIndex = targetIndex
      squares[pacmanCurrentIndex].classList.add('pac-man')

      let angle = 'rotate(0deg)'
      if (currentDirection === -1) angle = 'rotate(180deg)'
      else if (currentDirection === 1) angle = 'rotate(0deg)'
      else if (currentDirection === -width) angle = 'rotate(-90deg)'
      else if (currentDirection === width) angle = 'rotate(90deg)'
      squares[pacmanCurrentIndex].style.transform = angle

      pacDotEaten()
      powerPelletEaten()
      checkForGameOver()
      checkForWin()
    }
  }, pacmanSpeed)

  // what happens when you eat a pac-dot
  function pacDotEaten() {
    if (squares[pacmanCurrentIndex].classList.contains('pac-dot')) {
      score++
      scoreDisplay.innerHTML = score
      squares[pacmanCurrentIndex].classList.remove('pac-dot')
      if (window.playCoinSound) window.playCoinSound();
    }
  }

  //what happens when you eat a power-pellet
  function powerPelletEaten() {
    if (squares[pacmanCurrentIndex].classList.contains('power-pellet')) {
      score += 10
      scoreDisplay.innerHTML = score
      if (window.playCoinSound) window.playCoinSound();
      ghosts.forEach(ghost => {
        ghost.isScared = true
        squares[ghost.currentIndex].classList.add('scared-ghost')
      })
      setTimeout(unScareGhosts, 10000)
      squares[pacmanCurrentIndex].classList.remove('power-pellet')
    }
  }

  function unScareGhosts() {
    ghosts.forEach(ghost => {
      ghost.isScared = false
      squares[ghost.currentIndex].classList.remove('scared-ghost')
    })
  }

  class Ghost {
    constructor(className, startIndex, speed) {
      this.className = className
      this.startIndex = startIndex
      this.speed = speed
      this.currentIndex = startIndex
      this.isScared = false
      this.timerId = NaN
    }
  }

  const ghosts = [
    new Ghost('blinky', 348, 250),
    new Ghost('pinky', 376, 400),
    new Ghost('inky', 351, 300),
    new Ghost('clyde', 379, 500)
  ]

  //draw my ghosts onto the grid
  ghosts.forEach(ghost => {
    squares[ghost.currentIndex].classList.add(ghost.className)
    squares[ghost.currentIndex].classList.add('ghost')
  })

  //move the Ghosts randomly
  ghosts.forEach(ghost => moveGhost(ghost))

  function moveGhost(ghost) {
    const directions = [-1, +1, width, -width]
    let direction = directions[Math.floor(Math.random() * directions.length)]

    ghost.timerId = setInterval(function() {
      let targetIndex = ghost.currentIndex + direction;
      let wrapped = false;

      // Wrap around support for ghosts
      if (direction === -1 && ghost.currentIndex === 364) {
        targetIndex = 391;
        wrapped = true;
      } else if (direction === 1 && ghost.currentIndex === 391) {
        targetIndex = 364;
        wrapped = true;
      }

      if (wrapped || (targetIndex >= 0 && targetIndex < width * width &&
          !squares[targetIndex].classList.contains('ghost') &&
          !squares[targetIndex].classList.contains('wall'))) {
        
        squares[ghost.currentIndex].classList.remove(ghost.className)
        squares[ghost.currentIndex].classList.remove('ghost', 'scared-ghost')
        
        ghost.currentIndex = targetIndex
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
      } else {
        direction = directions[Math.floor(Math.random() * directions.length)]
      }

      if (ghost.isScared) {
        squares[ghost.currentIndex].classList.add('scared-ghost')
      }

      if (ghost.isScared && squares[ghost.currentIndex].classList.contains('pac-man')) {
        squares[ghost.currentIndex].classList.remove(ghost.className, 'ghost', 'scared-ghost')
        ghost.currentIndex = ghost.startIndex
        score += 100
        scoreDisplay.innerHTML = score
        if (window.playCoinSound) window.playCoinSound();
        squares[ghost.currentIndex].classList.add(ghost.className, 'ghost')
      }
      checkForGameOver()
    }, ghost.speed)
  }

  //check for a game over
  function checkForGameOver() {
    if (squares[pacmanCurrentIndex].classList.contains('ghost') &&
      !squares[pacmanCurrentIndex].classList.contains('scared-ghost')) {
      ghosts.forEach(ghost => clearInterval(ghost.timerId))
      clearInterval(pacmanTimer)
      document.removeEventListener('keydown', handleKeyDown)
      
      setTimeout(function() { 
        if (window.showGameModal) {
          window.showGameModal("GAME OVER", score);
        } else {
          alert("Game Over: " + score);
        }
      }, 500)
    }
  }

  //check for a win - when all pac-dots and pellets are consumed
  function checkForWin() {
    if (document.querySelectorAll('.pac-dot').length === 0 &&
        document.querySelectorAll('.power-pellet').length === 0) {
      ghosts.forEach(ghost => clearInterval(ghost.timerId))
      clearInterval(pacmanTimer)
      document.removeEventListener('keydown', handleKeyDown)
      
      setTimeout(function() { 
        if (window.showGameModal) {
          window.showGameModal("YOU HAVE WON!", score);
        } else {
          alert("You have WON!: " + score);
        }
      }, 500)
    }
  }

  // Auto-scale grid layout responsively
  function scaleGrid() {
    const grid = document.querySelector('.grid')
    if (!grid) return
    const w = window.innerWidth
    const h = window.innerHeight - 140
    const size = 468 // Base size (448px grid + padding)
    const scale = Math.min(w / size, h / size, 1)
    grid.style.transform = `scale(${scale})`
    grid.style.transformOrigin = 'center top'
  }
  window.addEventListener('resize', scaleGrid)
  scaleGrid()
  setTimeout(scaleGrid, 100)

  window.restartGame = function() {
    window.location.reload();
  };
})