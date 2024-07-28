// Define constants for classes and winning combinations
const X_CLASS = 'x'
const O_CLASS = 'o'
const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

// Get DOM elements
const cellElements = document.querySelectorAll('[data-cell]')
const board = document.getElementById('board')
const winningMessageElement = document.getElementById('winningMessage')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')
const restartButton = document.getElementById('restartButton')
const twoPlayerButton = document.getElementById('twoPlayerButton')
const singlePlayerButton = document.getElementById('singlePlayerButton')
const difficultySelection = document.getElementById('difficultySelection')
const easyButton = document.getElementById('easyButton')
const mediumButton = document.getElementById('mediumButton')
const hardButton = document.getElementById('hardButton')

let oTurn
let isSinglePlayer = false
let difficulty = 'easy'

// Event listeners for mode selection
twoPlayerButton.addEventListener('click', () => startGame(false))
singlePlayerButton.addEventListener('click', () => {
  difficultySelection.style.display = 'block'
})
easyButton.addEventListener('click', () => startGame(true, 'easy'))
mediumButton.addEventListener('click', () => startGame(true, 'medium'))
hardButton.addEventListener('click', () => startGame(true, 'hard'))
restartButton.addEventListener('click', () => startGame(isSinglePlayer, difficulty))

// Initialize the game
function startGame(singlePlayer, level) {
  isSinglePlayer = singlePlayer
  difficulty = level
  oTurn = false
  cellElements.forEach(cell => {
    cell.classList.remove(X_CLASS)
    cell.classList.remove(O_CLASS)
    cell.innerHTML = ''
    cell.removeEventListener('click', handleClick)
    cell.addEventListener('click', handleClick, { once: true })
  })
  setBoardHoverClass()
  winningMessageElement.classList.remove('show')
  if (isSinglePlayer) difficultySelection.style.display = 'none'
}

// Handle cell click
function handleClick(e) {
  const cell = e.target
  const currentClass = oTurn ? O_CLASS : X_CLASS
  placeMark(cell, currentClass)
  if (checkWin(currentClass)) {
    endGame(false)
  } else if (isDraw()) {
    endGame(true)
  } else {
    swapTurns()
    setBoardHoverClass()
    if (isSinglePlayer && oTurn) {
      setTimeout(() => {
        const aiMove = getBestMove()
        placeMark(aiMove, O_CLASS)
        if (checkWin(O_CLASS)) {
          endGame(false)
        } else if (isDraw()) {
          endGame(true)
        } else {
          swapTurns()
          setBoardHoverClass()
        }
      }, 500)
    }
  }
}

// End the game and display the result
function endGame(draw) {
  if (draw) {
    winningMessageTextElement.innerText = 'Draw!'
  } else {
    winningMessageTextElement.innerText = `${oTurn ? "O's" : "X's"} Wins!`
  }
  winningMessageElement.classList.add('show')
}

// Check if the game is a draw
function isDraw() {
  return [...cellElements].every(cell => {
    return cell.classList.contains(X_CLASS) || cell.classList.contains(O_CLASS)
  })
}

// Place the mark on the cell
function placeMark(cell, currentClass) {
  cell.classList.add(currentClass)
  cell.innerHTML = currentClass.toUpperCase()
}

// Swap turns between players
function swapTurns() {
  oTurn = !oTurn
}

// Set the hover class on the board to indicate the current player's turn
function setBoardHoverClass() {
  board.classList.remove(X_CLASS)
  board.classList.remove(O_CLASS)
  if (oTurn) {
    board.classList.add(O_CLASS)
  } else {
    board.classList.add(X_CLASS)
  }
}

// Check if the current player has won
function checkWin(currentClass) {
  return WINNING_COMBINATIONS.some(combination => {
    return combination.every(index => {
      return cellElements[index].classList.contains(currentClass)
    })
  })
}

// Get the best move for the AI based on the selected difficulty
function getBestMove() {
  if (difficulty === 'easy') {
    return getRandomMove()
  } else if (difficulty === 'medium') {
    return getMediumMove()
  } else {
    return getHardMove()
  }
}

// Get a random move for easy difficulty
function getRandomMove() {
  const availableCells = [...cellElements].filter(cell => {
    return !cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)
  })
  return availableCells[Math.floor(Math.random() * availableCells.length)]
}

// Get a move for medium difficulty (block player or win if possible)
function getMediumMove() {
  // Try to win if possible
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination
    if (cellElements[a].classList.contains(O_CLASS) &&
        cellElements[b].classList.contains(O_CLASS) &&
        !cellElements[c].classList.contains(X_CLASS) && !cellElements[c].classList.contains(O_CLASS)) {
      return cellElements[c]
    }
    if (cellElements[a].classList.contains(O_CLASS) &&
        cellElements[c].classList.contains(O_CLASS) &&
        !cellElements[b].classList.contains(X_CLASS) && !cellElements[b].classList.contains(O_CLASS)) {
      return cellElements[b]
    }
    if (cellElements[b].classList.contains(O_CLASS) &&
        cellElements[c].classList.contains(O_CLASS) &&
        !cellElements[a].classList.contains(X_CLASS) && !cellElements[a].classList.contains(O_CLASS)) {
      return cellElements[a]
    }
  }
  // Block player from winning
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination
    if (cellElements[a].classList.contains(X_CLASS) &&
        cellElements[b].classList.contains(X_CLASS) &&
        !cellElements[c].classList.contains(X_CLASS) && !cellElements[c].classList.contains(O_CLASS)) {
      return cellElements[c]
    }
    if (cellElements[a].classList.contains(X_CLASS) &&
        cellElements[c].classList.contains(X_CLASS) &&
        !cellElements[b].classList.contains(X_CLASS) && !cellElements[b].classList.contains(O_CLASS)) {
      return cellElements[b]
    }
    if (cellElements[b].classList.contains(X_CLASS) &&
        cellElements[c].classList.contains(X_CLASS) &&
        !cellElements[a].classList.contains(X_CLASS) && !cellElements[a].classList.contains(O_CLASS)) {
      return cellElements[a]
    }
  }
  // Else make a random move
  return getRandomMove()
}

// Get the best move for hard difficulty using minimax algorithm
function getHardMove() {
  let bestScore = -Infinity
  let move
  for (const cell of cellElements) {
    if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
      cell.classList.add(O_CLASS)
      const score = minimax(false)
      cell.classList.remove(O_CLASS)
      if (score > bestScore) {
        bestScore = score
        move = cell
      }
    }
  }
  return move
}

// Minimax algorithm to determine the best move for hard difficulty
function minimax(isMaximizing) {
  if (checkWin(O_CLASS)) {
    return 1
  }
  if (checkWin(X_CLASS)) {
    return -1
  }
  if (isDraw()) {
    return 0
  }
  
  if (isMaximizing) {
    let bestScore = -Infinity
    for (const cell of cellElements) {
      if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
        cell.classList.add(O_CLASS)
        const score = minimax(false)
        cell.classList.remove(O_CLASS)
        bestScore = Math.max(score, bestScore)
      }
    }
    return bestScore
  } else {
    let bestScore = Infinity
    for (const cell of cellElements) {
      if (!cell.classList.contains(X_CLASS) && !cell.classList.contains(O_CLASS)) {
        cell.classList.add(X_CLASS)
        const score = minimax(true)
        cell.classList.remove(X_CLASS)
        bestScore = Math.min(score, bestScore)
      }
    }
    return bestScore
  }
}
