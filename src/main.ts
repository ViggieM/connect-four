// ABOUTME: Entry point for the application
// ABOUTME: Imports font and styles, handles pellet drop animation

import '@fontsource-variable/space-grotesk';
import './style.css';

/**
 * Set up pellet drop animation for each column zone.
 * When a zone is clicked, a pellet is created and animated to fall
 * from above the board to the bottom row.
 */
function setupPelletDrop(): void {
  const zones = document.querySelectorAll<HTMLElement>('.game-board__zone');
  const board = document.querySelector<HTMLElement>('.game-board');

  if (!board) return;

  zones.forEach((zone) => {
    zone.addEventListener('click', () => {
      const col = zone.dataset.col;
      if (!col) return;

      // Create a new pellet
      const pellet = document.createElement('div');
      pellet.className = 'pellet';
      pellet.dataset.col = col;

      // Add to board
      board.appendChild(pellet);

      // Trigger animation (requestAnimationFrame ensures CSS is applied first)
      requestAnimationFrame(() => {
        pellet.classList.add('pellet--dropping');
      });
    });
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', setupPelletDrop);
