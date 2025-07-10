console.log('JavaScript file is linked correctly.');

const startBtn = document.getElementById('startBtn');
const difficultySelect = document.getElementById('difficulty');
const gameArea = document.querySelector('.game-area');
const bucketFill = document.querySelector('.fill');
const statusText = document.getElementById('status');

// Get pause menu elements
const pauseIcon = document.getElementById('pauseIcon');
const pauseMenu = document.getElementById('pauseMenu');
const resumeBtn = document.getElementById('resumeBtn');
const resetBtn = document.getElementById('resetBtn');
const pauseDifficulty = document.getElementById('pauseDifficulty');
const exitBtn = document.getElementById('exitBtn'); // Get the exit button

const winScreen = document.getElementById('winScreen');
const playAgainBtn = document.getElementById('playAgainBtn');
const confetti = document.getElementById('confetti');

const lanes = ['w', 'a', 's', 'd'];
let gameInterval;
let fallSpeed = 2; // Move this here so we can change it per game
let fillPercent = 0;
let beatInterval;

let isPaused = false;
let gameRunning = false; // Track if a game is running

startBtn.addEventListener('click', startGame);

let dropsPerSpawn = 1;
let animationFrameId; // Store the animation frame ID

function startGame() {
  isPaused = false;
  gameRunning = true; // Game is now running
  startBtn.style.display = 'none';
  difficultySelect.style.display = 'none';
  statusText.textContent = '';
  fillPercent = 0;
  updateBucketFill();

  // Remove any old beats from previous games
  const oldBeats = document.querySelectorAll('.beat');
  oldBeats.forEach(beat => beat.remove());

  const difficulty = difficultySelect.value;

  if (difficulty === 'medium') {
    dropsPerSpawn = 2;
    fallSpeed = 2; // Medium speed
  } else if (difficulty === 'hard') {
    dropsPerSpawn = 2;
    fallSpeed = 3; // Hard speed
  } else {
    dropsPerSpawn = 1;
    fallSpeed = 2; // Easy speed
  }

  // Clear any previous animation frame
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  beatInterval = setInterval(spawnBeat, 1000);
  animationFrameId = requestAnimationFrame(updateBeats);
}

function spawnBeat() {
  for (let i = 0; i < dropsPerSpawn; i++) {
    const laneKey = lanes[Math.floor(Math.random() * lanes.length)];
    const lane = document.querySelector(`.lane[data-key="${laneKey}"]`);

    const beat = document.createElement('div');
    beat.classList.add('beat');
    beat.dataset.key = laneKey;
    beat.style.top = '0px';

    lane.appendChild(beat);
  }
}

function updateBeats() {
  const beats = document.querySelectorAll('.beat');
  beats.forEach(beat => {
    let top = parseFloat(beat.style.top);
    beat.style.top = `${top + fallSpeed}px`;

    // If the beat goes past the bottom, remove it and subtract water as a penalty
    if (top > 300) {
      beat.remove();
      loseWater(); // Call the penalty function
      statusText.textContent = 'Missed!';
    }
  });

  // Save the animation frame ID so we can cancel it later
  animationFrameId = requestAnimationFrame(updateBeats);
}

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  const lane = document.querySelector(`.lane[data-key="${key}"]`);
  if (!lane) return;

  let hit = false; // Track if a beat was hit

  const beats = lane.querySelectorAll('.beat');
  beats.forEach(beat => {
    const beatTop = parseFloat(beat.style.top);
    // Check if the beat is in the hit zone
    if (beatTop >= 240 && beatTop <= 280) {
      beat.remove();
      addWater();
      statusText.textContent = 'Good!';
      hit = true;
    }
  });

  // If no beat was hit, apply penalty
  if (!hit) {
    loseWater();
    statusText.textContent = 'Wrong timing!';
  }
});

// Function to add water when player hits correctly
function addWater() {
  fillPercent += 5;
  if (fillPercent > 100) {
    fillPercent = 100;
  }
  updateBucketFill();

  if (fillPercent >= 100) {
    statusText.textContent = 'Bucket Full! You Win!';
    endGame();
    showWinScreen(); // Show the celebration and play again screen
  }
}

// Function to subtract water as a penalty
function loseWater() {
  fillPercent -= 5;
  if (fillPercent < 0) {
    fillPercent = 0;
  }
  updateBucketFill();
}

function updateBucketFill() {
  bucketFill.style.height = `${fillPercent}%`;
}

function endGame() {
  clearInterval(beatInterval);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  isPaused = false;
  gameRunning = false; // Game is no longer running
  startBtn.style.display = 'inline-block';
  difficultySelect.style.display = 'inline-block';
}

// Show pause menu only if game is running
function showPauseMenu() {
  // Remove the check for gameRunning so pause menu always opens
  isPaused = true;
  pauseMenu.style.display = 'flex';
  // Set the dropdown to current difficulty
  pauseDifficulty.value = difficultySelect.value;
  // Stop the animation and beat spawning if running
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  clearInterval(beatInterval);
}

// Hide pause menu and resume game
function resumeGame() {
  // Always allow resume to close the pause menu, even if game isn't running
  isPaused = false;
  pauseMenu.style.display = 'none';

  // Update the main difficulty to match the pause menu
  difficultySelect.value = pauseDifficulty.value;

  // Only resume animation and beat spawning if the game is running
  if (gameRunning) {
    // Update dropsPerSpawn and fallSpeed to match the new difficulty
    const difficulty = difficultySelect.value;
    if (difficulty === 'medium') {
      dropsPerSpawn = 2;
      fallSpeed = 2;
    } else if (difficulty === 'hard') {
      dropsPerSpawn = 2;
      fallSpeed = 3;
    } else {
      dropsPerSpawn = 1;
      fallSpeed = 2;
    }

    animationFrameId = requestAnimationFrame(updateBeats);
    beatInterval = setInterval(spawnBeat, 1000);
  }
}

// Reset game from pause menu
function resetGame() {
  pauseMenu.style.display = 'none';
  // Set difficulty to selected value
  difficultySelect.value = pauseDifficulty.value;
  startGame();
}

// Exit button event listener
exitBtn.addEventListener('click', () => {
  // Hide the pause menu
  pauseMenu.style.display = 'none';
  // Stop the game
  clearInterval(beatInterval);
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  isPaused = false;
  gameRunning = false;
  // Remove all beats from the game area
  const oldBeats = document.querySelectorAll('.beat');
  oldBeats.forEach(beat => beat.remove());
  // Reset bucket fill and status
  fillPercent = 0;
  updateBucketFill();
  statusText.textContent = '';
  // Show the start button and difficulty select
  startBtn.style.display = 'inline-block';
  difficultySelect.style.display = 'inline-block';
});

// Show the win screen and confetti
function showWinScreen() {
  winScreen.style.display = 'flex';
  // Simple confetti animation using emojis
  let confettiInterval = setInterval(() => {
    confetti.textContent = Math.random() > 0.5 ? '🎉🎊🎉' : '🎊🎉🎊';
  }, 300);

  // Stop confetti animation when win screen is hidden
  playAgainBtn.onclick = () => {
    clearInterval(confettiInterval);
    winScreen.style.display = 'none';
    // Reset the game to the original state (like exit)
    clearInterval(beatInterval);
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    isPaused = false;
    gameRunning = false;
    // Remove all beats
    const oldBeats = document.querySelectorAll('.beat');
    oldBeats.forEach(beat => beat.remove());
    // Reset bucket fill and status
    fillPercent = 0;
    updateBucketFill();
    statusText.textContent = '';
    // Show the start button and difficulty select
    startBtn.style.display = 'inline-block';
    difficultySelect.style.display = 'inline-block';
  };
}

// Pause when Escape key is pressed
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !isPaused) {
    showPauseMenu();
  }
});

// Pause when icon is clicked
pauseIcon.addEventListener('click', () => {
  showPauseMenu();
});

// Resume button
resumeBtn.addEventListener('click', () => {
  resumeGame();
});

// Reset button
resetBtn.addEventListener('click', () => {
  resetGame();
});

// Change difficulty in pause menu
pauseDifficulty.addEventListener('change', () => {
  difficultySelect.value = pauseDifficulty.value;
});
