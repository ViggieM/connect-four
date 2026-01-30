// ABOUTME: Entry point for the Connect Four game application
// ABOUTME: Handles UI interactions and DOM manipulation, delegates game logic to game.ts

import '@fontsource-variable/space-grotesk';
import './styles/index.css';
import {
  type Board,
  type Player,
  createBoard,
  placePiece,
  checkWin,
  checkDraw,
  internalRowToCssRow,
} from './game';

// Game state
let boardState: Board;
let currentPlayer: Player = 1;
let gameOver = false;
let player1Score = 0;
let player2Score = 0;
let isPaused = false;

// Timer state
let turnTimer: number | null = null;
let timeRemaining = 30;
const TURN_TIME_LIMIT = 30;

/**
 * Update the turn indicator to show the current player.
 */
function updateTurnIndicator(): void {
  const indicator = document.getElementById('turn-indicator');
  if (!indicator) return;

  const label = indicator.querySelector('.turn-indicator__label');
  if (label) {
    label.textContent = `Player ${currentPlayer}'s Turn`;
  }

  // Update styling classes - remove winner state when updating turn
  indicator.classList.remove('turn-indicator--p1', 'turn-indicator--p2', 'turn-indicator--winner');
  indicator.classList.add(`turn-indicator--p${currentPlayer}`);
}

/**
 * Show the winner indicator with the rectangular box style.
 */
function showWinnerIndicator(winner: Player): void {
  const indicator = document.getElementById('turn-indicator');
  if (!indicator) return;

  const label = indicator.querySelector('.turn-indicator__label');
  if (label) {
    label.textContent = `Player ${winner}`;
  }

  // Add winner class for rectangular box style
  indicator.classList.remove('turn-indicator--p1', 'turn-indicator--p2');
  indicator.classList.add('turn-indicator--winner');
}

/**
 * Update the score display for both players.
 */
function updateScoreDisplay(): void {
  const p1ScoreEl = document.getElementById('p1-score');
  const p2ScoreEl = document.getElementById('p2-score');

  if (p1ScoreEl) p1ScoreEl.textContent = String(player1Score);
  if (p2ScoreEl) p2ScoreEl.textContent = String(player2Score);
}

/**
 * Update the timer display element.
 */
function updateTimerDisplay(): void {
  const timerEl = document.getElementById('turn-timer');
  if (!timerEl) return;

  timerEl.textContent = `${timeRemaining}s`;

  // Add warning class when 5 seconds or less
  if (timeRemaining <= 5) {
    timerEl.classList.add('turn-indicator__timer--warning');
  } else {
    timerEl.classList.remove('turn-indicator__timer--warning');
  }
}

/**
 * Stop the turn timer.
 */
function stopTurnTimer(): void {
  if (turnTimer !== null) {
    clearInterval(turnTimer);
    turnTimer = null;
  }
}

/**
 * Handle timeout win - opponent wins when time expires.
 */
function handleTimeoutWin(winner: Player): void {
  stopTurnTimer();
  gameOver = true;

  // Update winner's score
  if (winner === 1) {
    player1Score++;
  } else {
    player2Score++;
  }
  updateScoreDisplay();

  // Show winner indicator box
  showWinnerIndicator(winner);

  // Set winner color CSS variable on game wrapper
  const gameWrapper = document.querySelector<HTMLElement>('.game-wrapper');
  const winnerColor = winner === 1 ? 'var(--color-rose-400)' : 'var(--color-amber-300)';
  gameWrapper?.style.setProperty('--winner-color', winnerColor);
}

/**
 * Resume the turn timer without resetting time.
 */
function resumeTurnTimer(): void {
  // Don't resume if timer is already running or game is over
  if (turnTimer !== null || gameOver) return;

  // Start countdown from current time
  turnTimer = window.setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      // Time expired - opponent wins
      const winner: Player = currentPlayer === 1 ? 2 : 1;
      handleTimeoutWin(winner);
    }
  }, 1000);
}

/**
 * Start the turn timer for the current player.
 */
function startTurnTimer(): void {
  // Clear any existing timer
  stopTurnTimer();

  // Reset time
  timeRemaining = TURN_TIME_LIMIT;
  updateTimerDisplay();

  // Start countdown
  turnTimer = window.setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();

    if (timeRemaining <= 0) {
      // Time expired - opponent wins
      const winner: Player = currentPlayer === 1 ? 2 : 1;
      handleTimeoutWin(winner);
    }
  }, 1000);
}

/**
 * Clear all pellets from the board.
 */
function clearBoard(): void {
  const board = document.querySelector<HTMLElement>('.game-board');
  if (!board) return;

  const pellets = board.querySelectorAll('.pellet');
  pellets.forEach((pellet) => pellet.remove());
}

/**
 * Restart the game - clear board and reset state.
 * Scores are preserved between rounds.
 */
function restartGame(): void {
  clearBoard();
  boardState = createBoard();
  currentPlayer = 1;
  gameOver = false;
  isPaused = false;
  // Clear winner color
  const gameWrapper = document.querySelector<HTMLElement>('.game-wrapper');
  gameWrapper?.style.removeProperty('--winner-color');
  updateTurnIndicator();
  startTurnTimer();
}

/**
 * Open the pause dialog and stop the timer.
 */
function openPauseDialog(): void {
  const overlay = document.getElementById('pause-overlay');
  const dialog = document.getElementById('pause-dialog') as HTMLDialogElement | null;
  if (!overlay || !dialog || gameOver) return;

  isPaused = true;
  stopTurnTimer();
  overlay.hidden = false;
  dialog.show();
  // Remove focus from auto-focused button
  (document.activeElement as HTMLElement | null)?.blur();
}

/**
 * Close the pause dialog and resume the timer.
 */
function closePauseDialog(): void {
  const overlay = document.getElementById('pause-overlay');
  const dialog = document.getElementById('pause-dialog') as HTMLDialogElement | null;
  if (!overlay || !dialog) return;

  isPaused = false;
  overlay.hidden = true;
  dialog.close();
  resumeTurnTimer();
}

/**
 * Set up pellet drop animation for each column zone.
 * When a zone is clicked, a pellet is created and animated to fall
 * from above the board to the lowest empty cell. Alternates between players.
 */
function setupPelletDrop(): void {
  const zones = document.querySelectorAll<HTMLElement>('.game-board__zone');
  const board = document.querySelector<HTMLElement>('.game-board');

  if (!board) return;

  zones.forEach((zone) => {
    zone.addEventListener('click', () => {
      // Ignore clicks if game is over or paused
      if (gameOver || isPaused) return;

      const colAttr = zone.dataset.col;
      if (!colAttr) return;

      // Convert 1-indexed HTML column to 0-indexed internal column
      const col = parseInt(colAttr, 10) - 1;

      // Find the lowest empty row and place the piece
      const row = placePiece(boardState, col, currentPlayer);
      if (row === -1) return; // Column is full, ignore click

      // Stop timer while processing the move
      stopTurnTimer();

      // Convert internal row to CSS row for positioning
      const cssRow = internalRowToCssRow(row);

      // Create a new pellet
      const pellet = document.createElement('div');
      pellet.className = 'pellet';
      pellet.dataset.col = colAttr;
      pellet.dataset.row = String(cssRow);
      pellet.dataset.player = String(currentPlayer);

      // Add to board
      board.appendChild(pellet);

      // Trigger animation (requestAnimationFrame ensures CSS is applied first)
      requestAnimationFrame(() => {
        pellet.classList.add('pellet--dropping');
      });

      // Check for win or draw after animation completes
      const placedPlayer = currentPlayer;
      const placedCol = col;
      const placedRow = row;

      pellet.addEventListener(
        'animationend',
        () => {
          if (checkWin(boardState, placedCol, placedRow, placedPlayer)) {
            stopTurnTimer();
            gameOver = true;
            // Update score
            if (placedPlayer === 1) {
              player1Score++;
            } else {
              player2Score++;
            }
            updateScoreDisplay();
            // Show winner indicator box
            showWinnerIndicator(placedPlayer);
            // Set winner color CSS variable on game wrapper
            const gameWrapper = document.querySelector<HTMLElement>('.game-wrapper');
            const winnerColor = placedPlayer === 1 ? 'var(--color-rose-400)' : 'var(--color-amber-300)';
            gameWrapper?.style.setProperty('--winner-color', winnerColor);
          } else if (checkDraw(boardState)) {
            stopTurnTimer();
            gameOver = true;
            const indicator = document.getElementById('turn-indicator');
            const label = indicator?.querySelector('.turn-indicator__label');
            if (label) {
              label.textContent = "It's a Draw!";
            }
          }
        },
        { once: true }
      );

      // Switch to other player and update indicator
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      updateTurnIndicator();
      startTurnTimer();
    });
  });
}

/**
 * Set up event handlers for buttons.
 */
function setupButtons(): void {
  const restartBtn = document.getElementById('restart-btn');
  const menuBtn = document.getElementById('menu-btn');
  const playAgainBtn = document.getElementById('play-again-btn');
  const continueBtn = document.getElementById('continue-btn');
  const dialogRestartBtn = document.getElementById('dialog-restart-btn');
  const quitBtn = document.getElementById('quit-btn');

  if (restartBtn) {
    restartBtn.addEventListener('click', restartGame);
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', openPauseDialog);
  }

  if (playAgainBtn) {
    playAgainBtn.addEventListener('click', restartGame);
  }

  // Dialog buttons
  if (continueBtn) {
    continueBtn.addEventListener('click', closePauseDialog);
  }

  if (dialogRestartBtn) {
    dialogRestartBtn.addEventListener('click', () => {
      closePauseDialog();
      restartGame();
    });
  }

  if (quitBtn) {
    // Quit button - restart game (main menu not implemented)
    quitBtn.addEventListener('click', () => {
      closePauseDialog();
      restartGame();
    });
  }
}

/**
 * Initialize the game.
 */
function initGame(): void {
  boardState = createBoard();
  currentPlayer = 1;
  gameOver = false;
  setupPelletDrop();
  setupButtons();
  updateTurnIndicator();
  updateScoreDisplay();
  startTurnTimer();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);
