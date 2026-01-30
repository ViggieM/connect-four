// ABOUTME: Entry point for the application
// ABOUTME: Imports font and styles, handles pellet drop animation

import '@fontsource-variable/space-grotesk';
import './style.css';

// Track which player's turn it is (1 or 2)
let currentPlayer: 1 | 2 = 1;

/**
 * Set up pellet drop animation for each column zone.
 * When a zone is clicked, a pellet is created and animated to fall
 * from above the board to the target row. Alternates between players.
 */
function setupPelletDrop(): void {
  const zones = document.querySelectorAll<HTMLElement>('.game-board__zone');
  const board = document.querySelector<HTMLElement>('.game-board');

  if (!board) return;

  zones.forEach((zone) => {
    zone.addEventListener('click', (event) => {
      const col = zone.dataset.col;
      if (!col) return;

      // Calculate which row was clicked based on Y position within the zone
      const rect = zone.getBoundingClientRect();
      const relativeY = event.clientY - rect.top;
      const row = Math.min(6, Math.floor((relativeY / rect.height) * 6) + 1);

      // Create a new pellet
      const pellet = document.createElement('div');
      pellet.className = 'pellet';
      pellet.dataset.col = col;
      pellet.dataset.row = String(row);
      pellet.dataset.player = String(currentPlayer);

      // Add to board
      board.appendChild(pellet);

      // Trigger animation (requestAnimationFrame ensures CSS is applied first)
      requestAnimationFrame(() => {
        pellet.classList.add('pellet--dropping');
      });

      // Switch to other player
      currentPlayer = currentPlayer === 1 ? 2 : 1;
    });
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', setupPelletDrop);
