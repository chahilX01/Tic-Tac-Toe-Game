let boxes = [];
let reset = document.querySelector('#reset');

let turn0 = true;
let gameActive = true;
let boardSize = 3;
let winCondition = 3; // Number in a row needed to win
let scores = {
    playerO: 0,
    playerX: 0,
    draws: 0
};

let winningpatterns = [];

function updateScoreboard() {
    document.getElementById('wins').textContent = scores.playerO;
    document.getElementById('losses').textContent = scores.playerX;
    document.getElementById('draws').textContent = scores.draws;
}

function checkDraw() {
    // For larger boards, check if there are no more winning possibilities
    if (boardSize > 3) {
        return checkNoWinningPossible();
    }
    // For 3x3, traditional draw check (all filled)
    return [...boxes].every(box => box.innerText !== "");
}

function checkNoWinningPossible() {
    // Check if all boxes are filled (traditional draw)
    const allFilled = [...boxes].every(box => box.innerText !== "");
    if (allFilled) return true;
    
    // For larger boards, also check if there are enough moves left for a win
    const emptyCount = [...boxes].filter(box => box.innerText === "").length;
    const minMovesNeeded = Math.ceil(winCondition / 2);
    
    if (emptyCount < minMovesNeeded) {
        // Check if either player can still win with remaining moves
        return !canPlayerWin("O") && !canPlayerWin("X");
    }
    
    return false;
}

function canPlayerWin(player) {
    // Check if a player can still achieve winCondition in a row
    for (let pattern of winningpatterns) {
        let playerCount = 0;
        let emptyCount = 0;
        let opponentCount = 0;
        
        for (let index of pattern) {
            const cellValue = boxes[index].innerText;
            if (cellValue === player) {
                playerCount++;
            } else if (cellValue === "") {
                emptyCount++;
            } else {
                opponentCount++;
            }
        }
        
        // If player can still win this pattern (no opponent pieces blocking)
        if (opponentCount === 0 && playerCount + emptyCount === winCondition) {
            return true;
        }
    }
    return false;
}

function checkWinner() {
    for (let pattern of winningpatterns) {
        const [a, b, c, ...rest] = pattern;
        const firstValue = boxes[a].innerText;
        
        if (firstValue && pattern.every(index => boxes[index].innerText === firstValue)) {
            gameActive = false;
            boxes.forEach(box => box.disabled = true);
            
            // Highlight winning pattern
            pattern.forEach(index => {
                boxes[index].style.backgroundColor = firstValue === "O" ? "#27ae60" : "#e74c3c";
                boxes[index].style.color = "white";
            });
            
            // Play win sound
            generateWinSound();
            
            const winner = firstValue;
            if (winner === "O") {
                scores.playerO++;
                updateGameStatus("Player O wins!");
                setTimeout(() => alert(`🎉 Congratulations! Player O wins with ${winCondition} in a row! 🎉`), 100);
            } else {
                scores.playerX++;
                updateGameStatus("Player X wins!");
                setTimeout(() => alert(`🎉 Congratulations! Player X wins with ${winCondition} in a row! 🎉`), 100);
            }
            updateScoreboard();
            return true;
        }
    }
    
    if (checkDraw()) {
        gameActive = false;
        scores.draws++;
        updateGameStatus("It's a draw!");
        updateScoreboard();
        
        // Play draw sound
        generateDrawSound();
        
        let drawMessage = boardSize === 3 ? 
            "🤝 It's a draw! 🤝" : 
            `🤝 It's a draw! No more winning moves possible! 🤝`;
        
        setTimeout(() => alert(drawMessage), 100);
        return true;
    }
    
    return false;
}

let currentFocus = 0;

function updateGameStatus(message) {
    document.getElementById('game-status').textContent = message;
}

function updateFocus() {
    boxes.forEach((box, index) => {
        box.tabIndex = index === currentFocus ? 0 : -1;
    });
    boxes[currentFocus].focus();
}

function handleKeyboardNavigation(e) {
    const row = Math.floor(currentFocus / boardSize);
    const col = currentFocus % boardSize;
    
    switch(e.key) {
        case 'ArrowUp':
            e.preventDefault();
            if (row > 0) {
                currentFocus = (row - 1) * boardSize + col;
                updateFocus();
            }
            break;
        case 'ArrowDown':
            e.preventDefault();
            if (row < boardSize - 1) {
                currentFocus = (row + 1) * boardSize + col;
                updateFocus();
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (col > 0) {
                currentFocus = row * boardSize + (col - 1);
                updateFocus();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (col < boardSize - 1) {
                currentFocus = row * boardSize + (col + 1);
                updateFocus();
            }
            break;
        case 'Enter':
        case ' ':
            e.preventDefault();
            boxes[currentFocus].click();
            break;
    }
}

let gameMode = null;
let difficulty = 'medium';
let isComputerTurn = false;

// Game setup elements
const gameSetup = document.getElementById('game-setup');
const gameArea = document.getElementById('game-area');
const vsComputerBtn = document.getElementById('vs-computer');
const passPlayBtn = document.getElementById('pass-play');
const difficultySelection = document.getElementById('difficulty-selection');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');
const startGameBtn = document.getElementById('start-game');
const newGameBtn = document.getElementById('new-game');
const currentPlayerDiv = document.getElementById('current-player');
const sizeBtns = document.querySelectorAll('.size-btn');

// Game setup event listeners
vsComputerBtn.addEventListener('click', () => {
    gameMode = 'computer';
    vsComputerBtn.classList.add('selected');
    passPlayBtn.classList.remove('selected');
    difficultySelection.style.display = 'block';
    checkStartReady();
});

passPlayBtn.addEventListener('click', () => {
    gameMode = 'passplay';
    passPlayBtn.classList.add('selected');
    vsComputerBtn.classList.remove('selected');
    difficultySelection.style.display = 'none';
    checkStartReady();
});

difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficulty = btn.dataset.difficulty;
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        checkStartReady();
    });
});

sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        boardSize = parseInt(btn.dataset.size);
        sizeBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        // Set win condition based on board size
        switch(boardSize) {
            case 3:
                winCondition = 3; // Need 3 in a row
                break;
            case 5:
                winCondition = 4; // Need 4 in a row
                break;
            case 7:
                winCondition = 5; // Need 5 in a row
                break;
            case 9:
                winCondition = 6; // Need 6 in a row
                break;
            default:
                winCondition = 3;
        }
        
        checkStartReady();
    });
});

function checkStartReady() {
    if (gameMode && (gameMode === 'passplay' || difficulty)) {
        startGameBtn.style.display = 'block';
    }
}

startGameBtn.addEventListener('click', () => {
    gameSetup.style.display = 'none';
    gameArea.style.display = 'block';
    initializeGame();
});

newGameBtn.addEventListener('click', () => {
    gameArea.style.display = 'none';
    gameSetup.style.display = 'block';
    resetGame();
});

function generateWinningPatterns(size, winLength) {
    const patterns = [];
    
    // Horizontal patterns
    for (let row = 0; row < size; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            const pattern = [];
            for (let i = 0; i < winLength; i++) {
                pattern.push(row * size + col + i);
            }
            patterns.push(pattern);
        }
    }
    
    // Vertical patterns
    for (let col = 0; col < size; col++) {
        for (let row = 0; row <= size - winLength; row++) {
            const pattern = [];
            for (let i = 0; i < winLength; i++) {
                pattern.push((row + i) * size + col);
            }
            patterns.push(pattern);
        }
    }
    
    // Diagonal patterns (top-left to bottom-right)
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = 0; col <= size - winLength; col++) {
            const pattern = [];
            for (let i = 0; i < winLength; i++) {
                pattern.push((row + i) * size + col + i);
            }
            patterns.push(pattern);
        }
    }
    
    // Diagonal patterns (top-right to bottom-left)
    for (let row = 0; row <= size - winLength; row++) {
        for (let col = winLength - 1; col < size; col++) {
            const pattern = [];
            for (let i = 0; i < winLength; i++) {
                pattern.push((row + i) * size + col - i);
            }
            patterns.push(pattern);
        }
    }
    
    return patterns;
}

function createGameBoard(size) {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    gameBoard.className = `game size-${size}`;
    
    for (let i = 0; i < size * size; i++) {
        const box = document.createElement('button');
        box.className = 'box';
        box.role = 'gridcell';
        const row = Math.floor(i / size) + 1;
        const col = (i % size) + 1;
        box.setAttribute('aria-label', `Row ${row}, Column ${col}`);
        box.tabIndex = i === 0 ? 0 : -1;
        box.dataset.row = Math.floor(i / size);
        box.dataset.col = i % size;
        gameBoard.appendChild(box);
    }
    
    boxes = document.querySelectorAll('.box');
    winningpatterns = generateWinningPatterns(size, winCondition);
    
    // Re-attach event listeners
    attachBoxEventListeners();
}

function attachBoxEventListeners() {
    boxes.forEach((box, index) => {
        // Remove existing listeners by cloning the element
        const newBox = box.cloneNode(true);
        box.parentNode.replaceChild(newBox, box);
    });
    
    // Update boxes array after cloning
    boxes = document.querySelectorAll('.box');
    
    boxes.forEach((box, index) => {
        box.addEventListener('click', () => {
            if (!gameActive || box.innerText !== "") return;
            if (gameMode === 'computer' && isComputerTurn) return;
            
            // Play move sound
            generateMoveSound();
            
            currentFocus = index;
            
            if (turn0) {
                box.innerText = "O";
                box.classList.add('o');
                box.setAttribute('aria-label', `${box.getAttribute('aria-label').split(',')[0]}, ${box.getAttribute('aria-label').split(',')[1]}, O`);
                turn0 = false;
                if (gameMode === 'computer') {
                    isComputerTurn = true;
                }
            } else {
                box.innerText = "X";
                box.classList.add('x');
                box.setAttribute('aria-label', `${box.getAttribute('aria-label').split(',')[0]}, ${box.getAttribute('aria-label').split(',')[1]}, X`);
                turn0 = true;
                isComputerTurn = false;
            }
            
            updateCurrentPlayer();
            
            const gameEnded = checkWinner();
            if (!gameEnded && gameMode === 'computer' && isComputerTurn) {
                makeComputerMove();
            }
        });
        
        box.addEventListener('keydown', handleKeyboardNavigation);
    });
}

function getRandomMove() {
    const availableMoves = [...boxes].map((box, index) => box.innerText === "" ? index : null).filter(val => val !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}

function getBestMove() {
    // For larger boards, use a simplified strategy instead of full minimax
    if (boardSize > 5) {
        return getStrategicMove() || getRandomMove();
    }
    
    let bestScore = -Infinity;
    let bestMove;
    
    for (let i = 0; i < boardSize * boardSize; i++) {
        if (boxes[i].innerText === "") {
            boxes[i].innerText = "X";
            let score = minimax(boxes, 0, false, 3); // Limit depth for performance
            boxes[i].innerText = "";
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    return bestMove;
}

function getStrategicMove() {
    // Simple strategy for larger boards: try to win, block opponent, or play center/corners
    
    // Try to win
    for (let pattern of winningpatterns) {
        let xCount = 0, emptyIndex = -1;
        for (let index of pattern) {
            if (boxes[index].innerText === "X") xCount++;
            else if (boxes[index].innerText === "") emptyIndex = index;
        }
        if (xCount === winCondition - 1 && emptyIndex !== -1) {
            return emptyIndex;
        }
    }
    
    // Block opponent
    for (let pattern of winningpatterns) {
        let oCount = 0, emptyIndex = -1;
        for (let index of pattern) {
            if (boxes[index].innerText === "O") oCount++;
            else if (boxes[index].innerText === "") emptyIndex = index;
        }
        if (oCount === winCondition - 1 && emptyIndex !== -1) {
            return emptyIndex;
        }
    }
    
    // Play center if available
    const center = Math.floor((boardSize * boardSize) / 2);
    if (boxes[center] && boxes[center].innerText === "") {
        return center;
    }
    
    return null;
}

function minimax(board, depth, isMaximizing, maxDepth = 6) {
    let result = checkGameState();
    if (result !== null || depth >= maxDepth) {
        return result === "X" ? 1 : result === "O" ? -1 : 0;
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < boardSize * boardSize; i++) {
            if (boxes[i].innerText === "") {
                boxes[i].innerText = "X";
                let score = minimax(boxes, depth + 1, false, maxDepth);
                boxes[i].innerText = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < boardSize * boardSize; i++) {
            if (boxes[i].innerText === "") {
                boxes[i].innerText = "O";
                let score = minimax(boxes, depth + 1, true, maxDepth);
                boxes[i].innerText = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function checkGameState() {
    // Check for wins using the current winning patterns
    for (let pattern of winningpatterns) {
        if (pattern.length < winCondition) continue;
        
        const firstValue = boxes[pattern[0]].innerText;
        if (firstValue && pattern.every(index => boxes[index].innerText === firstValue)) {
            return firstValue;
        }
    }
    
    // Check for draw
    if ([...boxes].every(box => box.innerText !== "")) {
        return "tie";
    }
    return null;
}

function getComputerMove() {
    switch(difficulty) {
        case 'easy':
            return getRandomMove();
        case 'medium':
            return Math.random() < 0.5 ? getRandomMove() : getBestMove();
        case 'hard':
            return getBestMove();
        default:
            return getRandomMove();
    }
}

function makeComputerMove() {
    if (!gameActive || !isComputerTurn) return;
    
    setTimeout(() => {
        const move = getComputerMove();
        if (move !== undefined && move !== null && boxes[move] && boxes[move].innerText === "") {
            // Play move sound for computer
            generateMoveSound();
            
            // Make computer move directly without triggering click event
            boxes[move].innerText = "X";
            boxes[move].classList.add('x');
            
            // Update aria label
            const currentLabel = boxes[move].getAttribute('aria-label');
            const parts = currentLabel.split(',');
            if (parts.length >= 2) {
                boxes[move].setAttribute('aria-label', `${parts[0]}, ${parts[1]}, X`);
            }
            
            // Update game state
            turn0 = true;
            isComputerTurn = false;
            updateCurrentPlayer();
            
            // Check for winner after computer move
            checkWinner();
        }
    }, 500); // Reduced delay for better responsiveness
}

function updateCurrentPlayer() {
    if (!currentPlayerDiv) return;
    
    if (gameMode === 'computer') {
        if (isComputerTurn) {
            currentPlayerDiv.textContent = "Computer's Turn (X)";
        } else {
            currentPlayerDiv.textContent = "Your Turn (O)";
        }
    } else {
        currentPlayerDiv.textContent = turn0 ? "Player O's Turn" : "Player X's Turn";
    }
}

function initializeGame() {
    createGameBoard(boardSize);
    turn0 = true;
    gameActive = true;
    isComputerTurn = false;
    currentFocus = 0;
    updateCurrentPlayer();
    updateGameStatus("Game started!");
    if (boxes.length > 0) {
        updateFocus();
    }
    
    // Initialize audio context on first user interaction
    createAudioContext();
}

// Sound system
let soundEnabled = true;
const soundToggleBtn = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');

// Create audio contexts for better browser compatibility
function createAudioContext() {
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Generate simple sound effects using Web Audio API
function generateMoveSound() {
    if (!soundEnabled) return;
    
    try {
        createAudioContext();
        if (!window.audioContext) return;
        
        const ctx = window.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
        console.log('Audio error:', e);
    }
}

function generateWinSound() {
    if (!soundEnabled) return;
    
    try {
        createAudioContext();
        if (!window.audioContext) return;
        
        const ctx = window.audioContext;
        const notes = [523.25, 587.33, 659.25, 783.99]; // C5, D5, E5, G5
        
        notes.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
            
            gainNode.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
            gainNode.gain.linearRampToValueAtTime(0.4, ctx.currentTime + index * 0.15 + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.15 + 0.3);
            
            oscillator.start(ctx.currentTime + index * 0.15);
            oscillator.stop(ctx.currentTime + index * 0.15 + 0.3);
        });
    } catch (e) {
        console.log('Audio error:', e);
    }
}

function generateDrawSound() {
    if (!soundEnabled) return;
    
    try {
        createAudioContext();
        if (!window.audioContext) return;
        
        const ctx = window.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(300, ctx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(250, ctx.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.log('Audio error:', e);
    }
}

// Sound toggle functionality
if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        if (soundIcon) {
            soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
        }
        soundToggleBtn.classList.toggle('muted', !soundEnabled);
        soundToggleBtn.setAttribute('aria-label', soundEnabled ? 'Mute sound effects' : 'Unmute sound effects');
        
        // Play a test sound when enabling
        if (soundEnabled) {
            createAudioContext();
            generateMoveSound();
        }
    });
}

// Remove the duplicate initializeGame function and keep only this one:
function initializeGame() {
    createGameBoard(boardSize);
    turn0 = true;
    gameActive = true;
    isComputerTurn = false;
    currentFocus = 0;
    updateCurrentPlayer();
    updateGameStatus("Game started!");
    if (boxes.length > 0) {
        updateFocus();
    }
    
    // Initialize audio context on first user interaction
    createAudioContext();
}

// Remove the duplicate attachResetListener function and fix the reset functionality
reset.addEventListener('click', () => {
    if (boxes.length === 0) return;
    
    boxes.forEach((box, index) => {
        box.innerText = "";
        box.disabled = false;
        box.classList.remove('x', 'o');
        // Reset highlighting
        box.style.backgroundColor = "";
        box.style.color = "";
        const row = Math.floor(index / boardSize) + 1;
        const col = (index % boardSize) + 1;
        box.setAttribute('aria-label', `Row ${row}, Column ${col}`);
    });
    turn0 = true;
    gameActive = true;
    isComputerTurn = false;
    currentFocus = 0;
    if (boxes.length > 0) {
        updateFocus();
    }
    updateCurrentPlayer();
    updateGameStatus("Game reset!");
});

function resetGame() {
    boardSize = 3;
    winCondition = 3;
    turn0 = true;
    gameActive = true;
    currentFocus = 0;
    isComputerTurn = false;
    gameMode = null;
    difficulty = 'medium';
    
    // Reset UI
    vsComputerBtn.classList.remove('selected');
    passPlayBtn.classList.remove('selected');
    sizeBtns.forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.size === '3') btn.classList.add('selected');
    });
    difficultyBtns.forEach(btn => btn.classList.remove('selected'));
    difficultySelection.style.display = 'none';
    startGameBtn.style.display = 'none';
    
    updateGameStatus("Choose game mode to start.");
}

// Initialize with default 3x3 board
createGameBoard(3);
// Initialize scoreboard
updateScoreboard();
updateGameStatus("Game started. Player O's turn.");