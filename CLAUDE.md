# Connect Four Game

A Connect Four game implementation with a design system based on Figma specifications.

## Project Structure

- `src/main.ts` - Entry point, UI interactions, DOM manipulation
- `src/game.ts` - Core game logic (board state, piece placement, win detection)
- `src/game.test.ts` - Unit tests for game logic (run with `pnpm test`)
- `src/style.css` - Design system CSS with custom properties
- `index.html` - Game board UI

## Game Logic

- Board is 7 columns × 6 rows, stored as `Board[col][row]`
- Row 0 is the bottom, row 5 is the top
- CSS uses inverted row numbers: `cssRow = 6 - internalRow`
- Win detection checks 4 directions: horizontal, vertical, diagonal (↗ and ↘)

## Design System

### Colors
- **Neutral**: 950 (#000000), 0 (#FFFFFF)
- **Indigo**: 700 (#5C2DD5), 500 (#7945FF)
- **Rose**: 400 (#FD6687)
- **Amber**: 300 (#FFCE67)
- **BG Dark**: #21214D

### Typography
Font: Space Grotesk (Variable)
- Text Preset 1: 56px/125% bold (32px/130% on mobile)
- Text Preset 2: 24px/130% bold
- Text Preset 3: 20px/130% bold
- Text Preset 4: 16px/125% bold/medium

### Spacing Scale
0, 2px, 12px, 16px, 18px, 20px, 30px, 32px, 40px, 48px, 64px, 72px, 80px

### Border Radius
0, 4px, 6px, 20px, 40px, 60px, 999px (full)

### Button Components
- Main Menu Buttons (Player vs CPU, Player vs Player, Game Rules)
- In-Game Menu Buttons (Continue, Restart, Quit)
- Navigation Bar Buttons (Menu, Restart, Play Again)
- Rules Button (circular)

### Game Board Component
- **Dimensions**: 632×618px container, 7×6 grid of 64px cells with 88px spacing
- **Structure**: `.game-board` > `.game-board__indicators` + `.game-board__container`
- **Layers**: Black rear shadow (::before), pieces grid, white overlay with SVG mask holes
- **Classes**: `.game-board__cell--player1` (rose), `.game-board__cell--player2` (amber)
- **Technique**: CSS mask-image with inline SVG for transparent circular holes


## MCP Server instructions

### Puppeteer

- Dev server is probably already running, check first. use pnpm to start it
- On Linux, use `launchOptions: {"headless": true, "args": ["--no-sandbox"]}` with `allowDangerous: true` to avoid sandbox errors
