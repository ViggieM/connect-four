// ABOUTME: CPU opponent AI using minimax algorithm with alpha-beta pruning
// ABOUTME: Provides getCpuMove() function to determine optimal move for CPU player

import {
  type Board,
  type Player,
  type Cell,
  COLS,
  ROWS,
  getLowestEmptyRow,
  checkWin,
} from './game';

// Delay before CPU plays (milliseconds) - feels more natural
export const CPU_DELAY_MS = 500;

// Search depth for minimax - 6 is fast enough for client-side (~50ms)
const SEARCH_DEPTH = 6;

// Scores for minimax evaluation
const WIN_SCORE = 100000;
const LOSE_SCORE = -100000;

/**
 * Create a deep copy of the board for simulation.
 */
function cloneBoard(board: Board): Board {
  return board.map((col) => [...col]);
}

/**
 * Get all valid (non-full) columns, ordered from center outward for better pruning.
 */
function getValidMoves(board: Board): number[] {
  const moves: number[] = [];
  // Check columns in center-first order: 3, 2, 4, 1, 5, 0, 6
  const columnOrder = [3, 2, 4, 1, 5, 0, 6];

  for (const col of columnOrder) {
    if (getLowestEmptyRow(board, col) !== -1) {
      moves.push(col);
    }
  }
  return moves;
}

/**
 * Place a piece on a cloned board and return the row.
 * Does not mutate the original board.
 */
function simulateMove(board: Board, col: number, player: Player): { newBoard: Board; row: number } {
  const newBoard = cloneBoard(board);
  const row = getLowestEmptyRow(newBoard, col);
  if (row !== -1) {
    newBoard[col][row] = player;
  }
  return { newBoard, row };
}

/**
 * Count connected pieces in a line for evaluation.
 * Returns counts of 2-in-a-row, 3-in-a-row patterns.
 */
function countPatterns(board: Board, player: Player): { twos: number; threes: number } {
  let twos = 0;
  let threes = 0;

  // Direction vectors: horizontal, vertical, diagonal up-right, diagonal down-right
  const directions: [number, number][] = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      for (const [dc, dr] of directions) {
        // Check 4-cell window starting from (col, row)
        const cells: Cell[] = [];
        for (let i = 0; i < 4; i++) {
          const c = col + i * dc;
          const r = row + i * dr;
          if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
            cells.push(board[c][r]);
          }
        }

        if (cells.length !== 4) continue;

        // Count player pieces and empty cells
        let playerCount = 0;
        let emptyCount = 0;
        for (const cell of cells) {
          if (cell === player) playerCount++;
          else if (cell === 0) emptyCount++;
        }

        // Only count if no opponent pieces block this line
        if (playerCount + emptyCount === 4) {
          if (playerCount === 3 && emptyCount === 1) threes++;
          if (playerCount === 2 && emptyCount === 2) twos++;
        }
      }
    }
  }

  return { twos, threes };
}

/**
 * Evaluate board position from CPU's perspective (player 2).
 * Positive scores favor CPU, negative scores favor human.
 */
function evaluateBoard(board: Board): number {
  let score = 0;

  // Center column control - pieces in center are more valuable
  for (let row = 0; row < ROWS; row++) {
    if (board[3][row] === 2) score += 3;
    else if (board[3][row] === 1) score -= 3;
  }

  // Adjacent center columns
  for (let row = 0; row < ROWS; row++) {
    if (board[2][row] === 2) score += 2;
    else if (board[2][row] === 1) score -= 2;
    if (board[4][row] === 2) score += 2;
    else if (board[4][row] === 1) score -= 2;
  }

  // Pattern-based evaluation
  const cpuPatterns = countPatterns(board, 2);
  const humanPatterns = countPatterns(board, 1);

  score += cpuPatterns.threes * 50;
  score += cpuPatterns.twos * 10;
  score -= humanPatterns.threes * 50;
  score -= humanPatterns.twos * 10;

  return score;
}

/**
 * Check if placing a piece at (col) would result in a win for the player.
 */
function wouldWin(board: Board, col: number, player: Player): boolean {
  const row = getLowestEmptyRow(board, col);
  if (row === -1) return false;

  const { newBoard } = simulateMove(board, col, player);
  return checkWin(newBoard, col, row, player);
}

/**
 * Minimax algorithm with alpha-beta pruning.
 * Returns the score of the best move from the current position.
 */
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  const validMoves = getValidMoves(board);

  // Terminal conditions
  if (validMoves.length === 0) {
    return 0; // Draw
  }

  if (depth === 0) {
    return evaluateBoard(board);
  }

  if (isMaximizing) {
    // CPU's turn (player 2) - maximize score
    let maxScore = -Infinity;

    for (const col of validMoves) {
      const { newBoard, row } = simulateMove(board, col, 2);

      // Check for immediate win
      if (checkWin(newBoard, col, row, 2)) {
        return WIN_SCORE + depth; // Prefer faster wins
      }

      const score = minimax(newBoard, depth - 1, alpha, beta, false);
      maxScore = Math.max(maxScore, score);
      alpha = Math.max(alpha, score);

      if (beta <= alpha) break; // Beta cutoff
    }

    return maxScore;
  } else {
    // Human's turn (player 1) - minimize score
    let minScore = Infinity;

    for (const col of validMoves) {
      const { newBoard, row } = simulateMove(board, col, 1);

      // Check for immediate win by opponent
      if (checkWin(newBoard, col, row, 1)) {
        return LOSE_SCORE - depth; // Opponent wins (bad for CPU)
      }

      const score = minimax(newBoard, depth - 1, alpha, beta, true);
      minScore = Math.min(minScore, score);
      beta = Math.min(beta, score);

      if (beta <= alpha) break; // Alpha cutoff
    }

    return minScore;
  }
}

/**
 * Get the best move for the CPU player.
 * Returns the column index (0-6) to play.
 */
export function getCpuMove(board: Board): number {
  const validMoves = getValidMoves(board);

  if (validMoves.length === 0) {
    throw new Error('No valid moves available');
  }

  // Quick check: can CPU win immediately?
  for (const col of validMoves) {
    if (wouldWin(board, col, 2)) {
      return col;
    }
  }

  // Quick check: must CPU block opponent's immediate win?
  for (const col of validMoves) {
    if (wouldWin(board, col, 1)) {
      return col;
    }
  }

  // Run minimax to find the best move
  let bestCol = validMoves[0];
  let bestScore = -Infinity;

  for (const col of validMoves) {
    const { newBoard, row } = simulateMove(board, col, 2);

    // Already checked for immediate wins above
    const score = minimax(newBoard, SEARCH_DEPTH - 1, -Infinity, Infinity, false);

    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return bestCol;
}

// Export for testing
export { getValidMoves, evaluateBoard, cloneBoard };
