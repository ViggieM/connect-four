// ABOUTME: Core Connect Four game logic (board state, piece placement, win detection)
// ABOUTME: Exports pure functions for testing, used by main.ts for UI integration

// Board state types
export type Cell = 0 | 1 | 2; // 0 = empty, 1 = player 1, 2 = player 2
export type Player = 1 | 2;
export type Board = Cell[][];

export const COLS = 7;
export const ROWS = 6;

/**
 * Create an empty game board (7 columns × 6 rows).
 * Each column is an array where index 0 is the bottom row.
 */
export function createBoard(): Board {
  return Array.from({ length: COLS }, () =>
    Array.from({ length: ROWS }, () => 0 as Cell)
  );
}

/**
 * Find the lowest empty row in a column.
 * Returns -1 if the column is full.
 */
export function getLowestEmptyRow(board: Board, col: number): number {
  for (let row = 0; row < ROWS; row++) {
    if (board[col][row] === 0) {
      return row;
    }
  }
  return -1; // Column is full
}

/**
 * Place a piece in the board state.
 * Returns the row where the piece landed, or -1 if column is full.
 * Note: This mutates the board in place.
 */
export function placePiece(board: Board, col: number, player: Player): number {
  const row = getLowestEmptyRow(board, col);
  if (row === -1) return -1;

  board[col][row] = player;
  return row;
}

/**
 * Check if the last placed piece results in a win.
 * Checks all 4 directions from the placed piece.
 */
export function checkWin(
  board: Board,
  col: number,
  row: number,
  player: Player
): boolean {
  // Direction vectors: [colDelta, rowDelta]
  const directions: [number, number][] = [
    [1, 0], // Horizontal →
    [0, 1], // Vertical ↑
    [1, 1], // Diagonal ↗
    [1, -1], // Diagonal ↘
  ];

  for (const [dc, dr] of directions) {
    let count = 1; // Count the piece just placed

    // Count in positive direction
    let c = col + dc;
    let r = row + dr;
    while (
      c >= 0 &&
      c < COLS &&
      r >= 0 &&
      r < ROWS &&
      board[c][r] === player
    ) {
      count++;
      c += dc;
      r += dr;
    }

    // Count in negative direction
    c = col - dc;
    r = row - dr;
    while (
      c >= 0 &&
      c < COLS &&
      r >= 0 &&
      r < ROWS &&
      board[c][r] === player
    ) {
      count++;
      c -= dc;
      r -= dr;
    }

    if (count >= 4) return true;
  }

  return false;
}

/**
 * Count total pieces on the board.
 */
export function countPieces(board: Board): number {
  let count = 0;
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      if (board[col][row] !== 0) {
        count++;
      }
    }
  }
  return count;
}

/**
 * Check if the board is completely full (draw condition).
 */
export function checkDraw(board: Board): boolean {
  return countPieces(board) >= COLS * ROWS;
}

/**
 * Convert internal row (0 = bottom) to CSS data-row (6 = bottom, 1 = top).
 */
export function internalRowToCssRow(internalRow: number): number {
  return ROWS - internalRow;
}
