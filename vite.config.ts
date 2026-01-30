// ABOUTME: Vite configuration for multi-page app
// ABOUTME: Defines entry points for all HTML pages (index, game, game-rules, design-system)

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        game: resolve(__dirname, 'game.html'),
        'game-rules': resolve(__dirname, 'game-rules.html'),
        'design-system': resolve(__dirname, 'design-system.html'),
      },
    },
  },
});
