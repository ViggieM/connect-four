# Connect Four Game

A Connect Four game implementation with a design system based on Figma specifications.

## Project Structure

- `src/main.ts` - Entry point, UI interactions, DOM manipulation
- `src/game.ts` - Core game logic (board state, piece placement, win detection)
- `src/cpu.ts` - CPU AI using minimax with alpha-beta pruning
- `src/game.test.ts` - Unit tests for game logic (run with `pnpm test`)
- `src/cpu.test.ts` - Unit tests for CPU AI logic
- `src/styles/` - CSS organized by component
  - `index.css` - Main entry point, imports all others
  - `tokens.css` - Design tokens (colors, typography, spacing)
  - `base.css` - Reset and typography utility classes
  - `buttons.css` - Button components
  - `main-menu.css` - Main menu card styling
  - `layout.css` - Game container and grid layout
  - `game-board.css` - Board SVG layers and hover zones
  - `player-card.css` - Player score cards
  - `turn-indicator.css` - Turn indicator component
  - `pellet.css` - Game pieces and drop animation
  - `responsive.css` - Tablet/mobile breakpoints
- `index.html` - Main menu with game mode selection
- `game.html` - Game board UI
- `game-rules.html` - Game rules page
- `netlify.toml` - Netlify deployment configuration
- `vite.config.ts` - Vite build configuration (multi-page entry points)
- `tsconfig.json` - TypeScript compiler configuration

## Game Modes

- **Player vs Player (PvP)**: Two human players, names shown as "Player 1" and "Player 2"
- **Player vs CPU**: Human vs computer, names shown as "You" and "CPU"
- Game mode stored in `sessionStorage` under key `gameMode` ('pvp' or 'cpu')

## CPU AI

- Uses minimax algorithm with alpha-beta pruning (depth 6)
- CPU plays as Player 2 with 500ms delay for natural feel
- Evaluates positions based on: center control, 2/3-in-a-row patterns
- Immediately takes winning moves and blocks opponent wins
- Hover zones disabled during CPU turn via `.game-board__zones--disabled`

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

### Game Screen Layout
- **Structure**: `.game` > `.game-header` + `.game-main` (contains player cards, board with turn indicator)
- **Header**: Menu/Restart buttons with logo centered, 632px width
- **Player Cards**: Desktop vertical (sides), tablet/mobile horizontal (above board)
- **Turn Indicator**: Absolutely positioned inside `.game-board`, overlaps board bottom

### Game Board Component
- **Dimensions**: 632×631px container, 7×6 grid
- **Structure**: `.game-board` with SVG layers + `.game-board__zones` for click handling
- **Hover**: Pure CSS using `:has()` selector to show column markers
- **Pellets**: Animated drop with `.pellet--dropping` class


## Deployment

- **Build**: `pnpm build` outputs static files to `dist/`
- **Hosting**: Configured for Netlify via `netlify.toml`
- **Deploy options**:
  - Git-based: Connect repo to Netlify dashboard for auto-deploy on push
  - CLI: `npx netlify deploy --prod` (requires `netlify-cli`)

## MCP Server instructions

### Puppeteer

- Dev server is probably already running, check first. use pnpm to start it
- On Linux, use `launchOptions: {"headless": true, "args": ["--no-sandbox"]}` with `allowDangerous: true` to avoid sandbox errors
