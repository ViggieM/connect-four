// ABOUTME: Entry point for the Connect Four game application
// ABOUTME: Handles UI interactions and DOM manipulation, delegates game logic to game.ts

import '@fontsource-variable/space-grotesk';
import './style.css';
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
            alert(`Player ${placedPlayer} wins!`);
          } else if (checkDraw(boardState)) {
            gameOver = true;
            alert("It's a draw!");
          }
        },
        { once: true }
      );

      // Switch to other player
      currentPlayer = currentPlayer === 1 ? 2 : 1;
    });
  });
}

/**
 * Initialize the game.
 */
function initGame(): void {
  boardState = createBoard();
  currentPlayer = 1;
  gameOver = false;
  setupPelletDrop();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGame);
