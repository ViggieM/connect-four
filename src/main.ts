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

  // Update styling classes
  indicator.classList.remove('turn-indicator--p1', 'turn-indicator--p2');
  indicator.classList.add(`turn-indicator--p${currentPlayer}`);
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
  updateTurnIndicator();
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
      // Ignore clicks if game is over
      if (gameOver) return;

      const colAttr = zone.dataset.col;
      if (!colAttr) return;

      // Convert 1-indexed HTML column to 0-indexed internal column
      const col = parseInt(colAttr, 10) - 1;

      // Find the lowest empty row and place the piece
      const row = placePiece(boardState, col, currentPlayer);
      if (row === -1) return; // Column is full, ignore click

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
            gameOver = true;
            // Update score
            if (placedPlayer === 1) {
              player1Score++;
            } else {
              player2Score++;
            }
            updateScoreDisplay();
            // Update indicator to show winner
            const indicator = document.getElementById('turn-indicator');
            const label = indicator?.querySelector('.turn-indicator__label');
            if (label) {
              label.textContent = `Player ${placedPlayer} Wins!`;
            }
          } else if (checkDraw(boardState)) {
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
    });
  });
}

/**
 * Set up event handlers for buttons.
 */
function setupButtons(): void {
  const restartBtn = document.getElementById('restart-btn');
  const menuBtn = document.getElementById('menu-btn');

  if (restartBtn) {
    restartBtn.addEventListener('click', restartGame);
  }

  if (menuBtn) {
    // Menu button - for now just restart (menu screen not implemented yet)
    menuBtn.addEventListener('click', () => {
      // TODO: Show menu modal when implemented
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
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);
