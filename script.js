// Game Configuration
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 8;
const BALL_SPEED_INITIAL = 4;

// Healthcare Q&A Questions by Level
const QUESTIONS_DATABASE = {
    level1: [
        {
            question: "What does HMO stand for?",
            options: ["Health Maintenance Organization", "Home Medical Office", "Health Management Option", "Hospital Managed Offering"],
            correct: 0
        },
        {
            question: "Which is typically a lower cost insurance plan?",
            options: ["PPO", "HMO", "High Deductible Plan", "Catastrophic Plan"],
            correct: 1
        },
        {
            question: "What is a deductible?",
            options: ["Premium payment", "Amount you pay before insurance covers", "Monthly fee", "Co-insurance amount"],
            correct: 1
        },
        {
            question: "What does PPO stand for?",
            options: ["Preferred Provider Organization", "Primary Patient Organization", "Public Provider Office", "Pharmacy Partner Organization"],
            correct: 0
        },
        {
            question: "When should you file a claim?",
            options: ["Immediately after treatment", "Within 30-90 days of service", "At end of year", "Only if amount exceeds deductible"],
            correct: 1
        }
    ],
    level2: [
        {
            question: "What is an out-of-pocket maximum?",
            options: ["Maximum deductible", "Maximum you pay before insurance covers 100%", "Maximum monthly payment", "Maximum network benefit"],
            correct: 1
        },
        {
            question: "Which plan requires a referral to see a specialist?",
            options: ["PPO", "HMO", "EPO", "POS with out-of-network use"],
            correct: 1
        },
        {
            question: "What is co-insurance?",
            options: ["Premium payment", "Percentage of cost you pay after deductible", "Visit copay", "Network fee"],
            correct: 1
        },
        {
            question: "What does COBRA allow?",
            options: ["Free healthcare", "Temporary health coverage continuation", "Insurance discount", "Medicaid benefits"],
            correct: 1
        },
        {
            question: "What is a pre-authorization?",
            options: ["Initial appointment", "Approval before receiving service", "Insurance denial", "Payment method"],
            correct: 1
        }
    ],
    level3: [
        {
            question: "What is the difference between in-network and out-of-network?",
            options: ["No difference in cost", "Network providers have agreements with insurance", "Out-of-network is always free", "In-network covers only prescriptions"],
            correct: 1
        },
        {
            question: "What is an EOB?",
            options: ["Employee Organization Benefit", "Explanation of Benefits", "End of Benefits", "Emergency Only Benefit"],
            correct: 1
        },
        {
            question: "How long do you typically have to appeal a claim denial?",
            options: ["7 days", "30-60 days", "1 year", "30 days from coverage denial"],
            correct: 1
        },
        {
            question: "What is preventive care coverage?",
            options: ["Emergency room visits", "Screenings and vaccines often covered at 100%", "Prescription medications", "Mental health only"],
            correct: 1
        },
        {
            question: "What happens if you miss open enrollment?",
            options: ["You can still enroll anytime", "You may wait until next enrollment", "Automatic enrollment in basic plan", "Coverage lapses immediately"],
            correct: 1
        }
    ]
};

// Game Objects - Initialize after DOM is ready
let canvas;
let ctx;

let gameState = {
    gameRunning: false,
    gamePaused: false,
    level: 1,
    playerScore: 0,
    computerScore: 0,
    pointsPerLevel: 5,
    ballSpeed: BALL_SPEED_INITIAL,
    currentQuestionIndex: 0,
    selectedAnswer: null,
    answerCorrect: null
};

// Paddle Object
const playerPaddle = {
    x: 10,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0
};

const computerPaddle = {
    x: CANVAS_WIDTH - PADDLE_WIDTH - 10,
    y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 3
};

// Ball Object
const ball = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    dx: gameState.ballSpeed,
    dy: gameState.ballSpeed,
    size: BALL_SIZE,
    speed: gameState.ballSpeed
};

// Mouse tracking
let mouseY = 0;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set canvas to correct size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Event Listeners
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseY = e.clientY - rect.top;
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') playerPaddle.dy = -6;
        if (e.key === 'ArrowDown') playerPaddle.dy = 6;
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') playerPaddle.dy = 0;
    });

    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('pauseBtn').addEventListener('click', togglePause);
    document.getElementById('resetBtn').addEventListener('click', resetGame);
    document.getElementById('nextLevelBtn').addEventListener('click', nextLevel);

    // Draw initial canvas
    draw();
});

// Initialize Questions
function loadQuestion() {
    const levelQuestions = QUESTIONS_DATABASE[`level${gameState.level}`];
    const question = levelQuestions[gameState.currentQuestionIndex % levelQuestions.length];
    
    document.getElementById('question').textContent = question.question;
    
    const answerOptions = document.getElementById('answerOptions');
    answerOptions.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.textContent = option;
        btn.className = 'answer-btn';
        btn.addEventListener('click', () => handleAnswer(index, question.correct));
        answerOptions.appendChild(btn);
    });
    
    gameState.selectedAnswer = null;
    gameState.answerCorrect = null;
}

function handleAnswer(selectedIndex, correctIndex) {
    gameState.selectedAnswer = selectedIndex;
    gameState.answerCorrect = selectedIndex === correctIndex;
    
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach((btn, index) => {
        btn.disabled = true;
        if (index === correctIndex) {
            btn.classList.add('correct');
        } else if (index === selectedIndex && !gameState.answerCorrect) {
            btn.classList.add('incorrect');
        }
    });
    
    if (gameState.answerCorrect) {
        gameState.playerScore++;
        document.getElementById('playerScore').textContent = gameState.playerScore;
        checkLevelUp();
    } else {
        gameState.computerScore++;
        document.getElementById('computerScore').textContent = gameState.computerScore;
    }
    
    setTimeout(() => {
        gameState.currentQuestionIndex++;
        loadQuestion();
    }, 1500);
}

function checkLevelUp() {
    if (gameState.playerScore >= gameState.pointsPerLevel) {
        gameState.gameRunning = false;
        document.getElementById('levelComplete').style.display = 'flex';
        document.getElementById('levelCompleteText').textContent = 
            `Congratulations! You've reached level ${gameState.level}! Next level will have tougher questions.`;
        document.getElementById('pauseBtn').disabled = true;
    }
}

function nextLevel() {
    gameState.level++;
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.ballSpeed = BALL_SPEED_INITIAL + (gameState.level - 1) * 0.5;
    ball.speed = gameState.ballSpeed;
    gameState.currentQuestionIndex = 0;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    document.getElementById('nextLevel').textContent = gameState.pointsPerLevel;
    document.getElementById('levelComplete').style.display = 'none';
    loadQuestion();
    gameState.gameRunning = true;
    document.getElementById('pauseBtn').disabled = false;
    gameLoop();
}

function startGame() {
    gameState.gameRunning = true;
    gameState.gamePaused = false;
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    gameState.currentQuestionIndex = 0;
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    resetBallPosition();
    loadQuestion();
    gameLoop();
}

function togglePause() {
    gameState.gamePaused = !gameState.gamePaused;
    document.getElementById('pauseBtn').textContent = gameState.gamePaused ? 'Resume' : 'Pause';
    if (!gameState.gamePaused) {
        gameLoop();
    }
}

function resetGame() {
    gameState.gameRunning = false;
    gameState.gamePaused = false;
    gameState.level = 1;
    gameState.playerScore = 0;
    gameState.computerScore = 0;
    gameState.ballSpeed = BALL_SPEED_INITIAL;
    ball.speed = gameState.ballSpeed;
    gameState.currentQuestionIndex = 0;
    
    document.getElementById('level').textContent = '1';
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    document.getElementById('nextLevel').textContent = gameState.pointsPerLevel;
    document.getElementById('question').textContent = 'Click "Start Game" to begin!';
    document.getElementById('answerOptions').innerHTML = '';
    document.getElementById('levelComplete').style.display = 'none';
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    
    resetBallPosition();
    draw();
}

function resetBallPosition() {
    ball.x = CANVAS_WIDTH / 2;
    ball.y = CANVAS_HEIGHT / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed;
}

function updatePlayerPaddle() {
    // Mouse control
    playerPaddle.y = mouseY - PADDLE_HEIGHT / 2;
    
    // Keyboard control (arrow keys)
    playerPaddle.y += playerPaddle.dy;
    
    // Boundary checking
    if (playerPaddle.y < 0) playerPaddle.y = 0;
    if (playerPaddle.y + PADDLE_HEIGHT > CANVAS_HEIGHT) {
        playerPaddle.y = CANVAS_HEIGHT - PADDLE_HEIGHT;
    }
}

function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + PADDLE_HEIGHT / 2;
    
    if (computerCenter < ball.y - 35) {
        computerPaddle.y += computerPaddle.speed;
    } else if (computerCenter > ball.y + 35) {
        computerPaddle.y -= computerPaddle.speed;
    }
    
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y + PADDLE_HEIGHT > CANVAS_HEIGHT) {
        computerPaddle.y = CANVAS_HEIGHT - PADDLE_HEIGHT;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > CANVAS_HEIGHT) {
        ball.dy = -ball.dy;
    }
    
    // Player paddle collision
    if (ball.x - ball.size < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height) {
        ball.dx = Math.abs(ball.dx);
        ball.x = playerPaddle.x + playerPaddle.width + ball.size;
        
        const deltaY = ball.y - (playerPaddle.y + PADDLE_HEIGHT / 2);
        ball.dy = (deltaY / (PADDLE_HEIGHT / 2)) * ball.speed;
    }
    
    // Computer paddle collision
    if (ball.x + ball.size > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computerPaddle.x - ball.size;
        
        const deltaY = ball.y - (computerPaddle.y + PADDLE_HEIGHT / 2);
        ball.dy = (deltaY / (PADDLE_HEIGHT / 2)) * ball.speed;
    }
    
    // Left side (player loses)
    if (ball.x - ball.size < 0) {
        gameState.computerScore++;
        document.getElementById('computerScore').textContent = gameState.computerScore;
        resetBallPosition();
    }
    
    // Right side (computer loses - player wins)
    if (ball.x + ball.size > CANVAS_WIDTH) {
        gameState.playerScore++;
        document.getElementById('playerScore').textContent = gameState.playerScore;
        checkLevelUp();
        resetBallPosition();
    }
}

function draw() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Center line
    ctx.strokeStyle = '#667eea';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, 0);
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Player paddle (left) - Green
    ctx.fillStyle = '#10b981';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    
    // Computer paddle (right) - Red
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);
    
    // Ball - Yellow
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect on ball
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size + 3, 0, Math.PI * 2);
    ctx.stroke();
}

function gameLoop() {
    if (!gameState.gameRunning || gameState.gamePaused) {
        draw();
        return;
    }
    
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    
    requestAnimationFrame(gameLoop);
}
