// ABOUTME: Vite configuration for multi-page app
// ABOUTME: Defines entry points for index.html and design-system.html

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'design-system': resolve(__dirname, 'design-system.html'),
      },
    },
  },
});
