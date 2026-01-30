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
import { getCpuMove, CPU_DELAY_MS } from './cpu';

// Game mode type
type GameMode = 'pvp' | 'cpu';

// Get game mode from sessionStorage
function getGameMode(): GameMode {
  return (sessionStorage.getItem('gameMode') as GameMode) || 'pvp';
}

// Player name helpers
function getPlayer1Name(): string {
  return getGameMode() === 'cpu' ? 'You' : 'Player 1';
}

function getPlayer2Name(): string {
  return getGameMode() === 'cpu' ? 'CPU' : 'Player 2';
}

// Game state
let boardState: Board;
let currentPlayer: Player = 1;
let gameOver = false;
let player1Score = 0;
let player2Score = 0;
let isPaused = false;
let isDropping = false;
let roundStartingPlayer: Player = 1;

// Timer state
let turnTimer: number | null = null;
let timeRemaining = 30;
const TURN_TIME_LIMIT = 30;

// CPU move state
let cpuMoveTimeout: number | null = null;

/**
 * Cancel any pending CPU move.
 */
function cancelCpuMove(): void {
  if (cpuMoveTimeout !== null) {
    clearTimeout(cpuMoveTimeout);
    cpuMoveTimeout = null;
  }
}

/**
 * Check if it's currently the CPU's turn.
 */
function isCpuTurn(): boolean {
  return getGameMode() === 'cpu' && currentPlayer === 2;
}

/**
 * Enable or disable hover zones on the game board.
 * Disabled during CPU turn to prevent visual feedback for unclickable columns.
 */
function setHoverEnabled(enabled: boolean): void {
  const zones = document.querySelector<HTMLElement>('.game-board__zones');
  if (!zones) return;

  if (enabled) {
    zones.classList.remove('game-board__zones--disabled');
  } else {
    zones.classList.add('game-board__zones--disabled');
  }
}

/**
 * Update the turn indicator to show the current player.
 */
function updateTurnIndicator(): void {
  const indicator = document.getElementById('turn-indicator');
  if (!indicator) return;

  const label = indicator.querySelector('.turn-indicator__label');
  if (label) {
    const name = currentPlayer === 1 ? getPlayer1Name() : getPlayer2Name();
    if (name === 'You') {
      label.textContent = 'Your Turn';
    } else {
      label.textContent = `${name}'s Turn`;
    }
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
    const name = winner === 1 ? getPlayer1Name() : getPlayer2Name();
    label.textContent = name;
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
  // Cancel any pending CPU move
  cancelCpuMove();

  clearBoard();
  boardState = createBoard();
  // Only alternate starting player if the previous game ended
  if (gameOver) {
    roundStartingPlayer = roundStartingPlayer === 1 ? 2 : 1;
  }
  currentPlayer = roundStartingPlayer;
  gameOver = false;
  isPaused = false;
  isDropping = false;
  // Clear winner color
  const gameWrapper = document.querySelector<HTMLElement>('.game-wrapper');
  gameWrapper?.style.removeProperty('--winner-color');
  updateTurnIndicator();

  // Check if CPU starts this round
  if (isCpuTurn()) {
    setHoverEnabled(false);
    triggerCpuMove();
  } else {
    setHoverEnabled(true);
    startTurnTimer();
  }
}

/**
 * Open the pause dialog and stop the timer.
 */
function openPauseDialog(): void {
  const overlay = document.getElementById('pause-overlay');
  const dialog = document.getElementById('pause-dialog') as HTMLDialogElement | null;
  if (!overlay || !dialog) return;

  isPaused = true;
  stopTurnTimer();
  cancelCpuMove();
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

  // Resume appropriate action based on whose turn it is
  if (isCpuTurn()) {
    triggerCpuMove();
  } else {
    resumeTurnTimer();
  }
}

/**
 * Make a move in the specified column.
 * Handles pellet creation, animation, win/draw detection, and turn switching.
 */
function makeMove(col: number): void {
  const board = document.querySelector<HTMLElement>('.game-board');
  if (!board) return;

  // Find the lowest empty row and place the piece
  const row = placePiece(boardState, col, currentPlayer);
  if (row === -1) return; // Column is full, ignore

  // Stop timer while processing the move
  stopTurnTimer();

  // Convert internal row to CSS row for positioning
  const cssRow = internalRowToCssRow(row);

  // Convert 0-indexed column to 1-indexed HTML column
  const colAttr = String(col + 1);

  // Create a new pellet
  const pellet = document.createElement('div');
  pellet.className = 'pellet';
  pellet.dataset.col = colAttr;
  pellet.dataset.row = String(cssRow);
  pellet.dataset.player = String(currentPlayer);

  // Add to board
  board.appendChild(pellet);

  // Block further clicks while animation is in progress
  isDropping = true;

  // Trigger animation (requestAnimationFrame ensures CSS is applied first)
  requestAnimationFrame(() => {
    pellet.classList.add('pellet--dropping');
  });

  // Capture state for async callback
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
        // Re-enable hover for next game
        setHoverEnabled(true);
      } else if (checkDraw(boardState)) {
        stopTurnTimer();
        gameOver = true;
        const indicator = document.getElementById('turn-indicator');
        const label = indicator?.querySelector('.turn-indicator__label');
        if (label) {
          label.textContent = "It's a Draw!";
        }
        // Re-enable hover for next game
        setHoverEnabled(true);
      } else {
        // Switch to other player and update indicator
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateTurnIndicator();

        // Check if it's CPU's turn
        if (isCpuTurn()) {
          setHoverEnabled(false);
          triggerCpuMove();
        } else {
          setHoverEnabled(true);
          startTurnTimer();
        }
      }
      // Allow next move after animation completes
      isDropping = false;
    },
    { once: true }
  );
}

/**
 * Trigger the CPU to make a move after a delay.
 */
function triggerCpuMove(): void {
  cpuMoveTimeout = window.setTimeout(() => {
    cpuMoveTimeout = null;
    if (gameOver || isPaused) return;

    const cpuCol = getCpuMove(boardState);
    makeMove(cpuCol);
  }, CPU_DELAY_MS);
}

/**
 * Set up pellet drop animation for each column zone.
 * When a zone is clicked, a pellet is created and animated to fall
 * from above the board to the lowest empty cell. Alternates between players.
 */
function setupPelletDrop(): void {
  const zones = document.querySelectorAll<HTMLElement>('.game-board__zone');

  zones.forEach((zone) => {
    zone.addEventListener('click', () => {
      // Ignore clicks if game is over, paused, dropping, or CPU's turn
      if (gameOver || isPaused || isDropping || isCpuTurn()) return;

      const colAttr = zone.dataset.col;
      if (!colAttr) return;

      // Convert 1-indexed HTML column to 0-indexed internal column
      const col = parseInt(colAttr, 10) - 1;

      makeMove(col);
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
    quitBtn.addEventListener('click', () => {
      closePauseDialog();
      sessionStorage.removeItem('gameMode');
      window.location.href = '/';
    });
  }
}

/**
 * Set player card names based on game mode.
 */
function updatePlayerNames(): void {
  const p1Name = document.getElementById('p1-name');
  const p2Name = document.getElementById('p2-name');
  if (p1Name) p1Name.textContent = getPlayer1Name();
  if (p2Name) p2Name.textContent = getPlayer2Name();
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
  updatePlayerNames();
  updateTurnIndicator();
  updateScoreDisplay();
  startTurnTimer();
}

/**
 * Set up event handlers for main menu buttons.
 */
function setupMainMenu(): void {
  const btnVsCpu = document.getElementById('btn-vs-cpu');
  const btnVsPlayer = document.getElementById('btn-vs-player');
  const btnRules = document.getElementById('btn-rules');

  btnVsCpu?.addEventListener('click', () => {
    sessionStorage.setItem('gameMode', 'cpu');
    window.location.href = '/game.html';
  });

  btnVsPlayer?.addEventListener('click', () => {
    sessionStorage.setItem('gameMode', 'pvp');
    window.location.href = '/game.html';
  });

  btnRules?.addEventListener('click', () => {
    window.location.href = '/game-rules.html';
  });
}

/**
 * Set up event handlers for rules page.
 */
function setupRulesPage(): void {
  const btnRulesOk = document.getElementById('btn-rules-ok');

  btnRulesOk?.addEventListener('click', () => {
    window.location.href = '/';
  });
}

// Initialize when DOM is ready - detect which page we're on
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.main-menu')) {
    setupMainMenu();
  } else if (document.querySelector('.game-wrapper')) {
    initGame();
  } else if (document.querySelector('.rules-card')) {
    setupRulesPage();
  }
});
