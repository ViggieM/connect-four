// ABOUTME: Unit tests for Connect Four game logic
// ABOUTME: Tests board creation, piece placement, stacking, and all win conditions

import { describe, it, expect, beforeEach } from 'vitest';
import {
  type Board,
  type Player,
  COLS,
  ROWS,
  createBoard,
  getLowestEmptyRow,
  placePiece,
  checkWin,
  checkDraw,
  countPieces,
  internalRowToCssRow,
} from './game';

describe('createBoard', () => {
  it('creates a board with correct dimensions', () => {
    const board = createBoard();
    expect(board).toHaveLength(COLS);
    board.forEach((col) => {
      expect(col).toHaveLength(ROWS);
    });
  });

  it('creates an empty board (all cells are 0)', () => {
    const board = createBoard();
    board.forEach((col) => {
      col.forEach((cell) => {
        expect(cell).toBe(0);
      });
    });
  });
});

describe('getLowestEmptyRow', () => {
  let board: Board;

  beforeEach(() => {
    board = createBoard();
  });

  it('returns 0 for an empty column', () => {
    expect(getLowestEmptyRow(board, 0)).toBe(0);
    expect(getLowestEmptyRow(board, 3)).toBe(0);
    expect(getLowestEmptyRow(board, 6)).toBe(0);
  });

  it('returns next empty row after placing pieces', () => {
    board[3][0] = 1; // Place piece at bottom
    expect(getLowestEmptyRow(board, 3)).toBe(1);

    board[3][1] = 2;
    board[3][2] = 1;
    expect(getLowestEmptyRow(board, 3)).toBe(3);
  });

  it('returns -1 for a full column', () => {
    for (let row = 0; row < ROWS; row++) {
      board[0][row] = 1;
    }
    expect(getLowestEmptyRow(board, 0)).toBe(-1);
  });
});

describe('placePiece', () => {
  let board: Board;

  beforeEach(() => {
    board = createBoard();
  });

  it('places piece at bottom of empty column', () => {
    const row = placePiece(board, 3, 1);
    expect(row).toBe(0);
    expect(board[3][0]).toBe(1);
  });

  it('stacks pieces correctly', () => {
    placePiece(board, 3, 1);
    const row = placePiece(board, 3, 2);
    expect(row).toBe(1);
    expect(board[3][0]).toBe(1);
    expect(board[3][1]).toBe(2);
  });

  it('returns -1 when column is full', () => {
    for (let i = 0; i < ROWS; i++) {
      placePiece(board, 0, 1);
    }
    const row = placePiece(board, 0, 2);
    expect(row).toBe(-1);
  });
});

describe('checkWin', () => {
  let board: Board;

  beforeEach(() => {
    board = createBoard();
  });

  describe('horizontal wins', () => {
    it('detects 4 in a row horizontally at bottom', () => {
      // Place 4 pieces in a row: columns 0-3, row 0
      board[0][0] = 1;
      board[1][0] = 1;
      board[2][0] = 1;
      board[3][0] = 1;

      expect(checkWin(board, 3, 0, 1)).toBe(true);
      expect(checkWin(board, 0, 0, 1)).toBe(true);
      expect(checkWin(board, 1, 0, 1)).toBe(true);
    });

    it('detects horizontal win in the middle of the board', () => {
      board[2][3] = 2;
      board[3][3] = 2;
      board[4][3] = 2;
      board[5][3] = 2;

      expect(checkWin(board, 4, 3, 2)).toBe(true);
    });

    it('does not false positive with only 3 in a row', () => {
      board[0][0] = 1;
      board[1][0] = 1;
      board[2][0] = 1;

      expect(checkWin(board, 2, 0, 1)).toBe(false);
    });

    it('detects win from middle piece check', () => {
      board[1][0] = 1;
      board[2][0] = 1;
      board[3][0] = 1;
      board[4][0] = 1;

      // Check from a middle piece
      expect(checkWin(board, 2, 0, 1)).toBe(true);
    });
  });

  describe('vertical wins', () => {
    it('detects 4 in a column vertically', () => {
      board[3][0] = 1;
      board[3][1] = 1;
      board[3][2] = 1;
      board[3][3] = 1;

      expect(checkWin(board, 3, 3, 1)).toBe(true);
      expect(checkWin(board, 3, 0, 1)).toBe(true);
    });

    it('detects vertical win at top of column', () => {
      board[0][2] = 2;
      board[0][3] = 2;
      board[0][4] = 2;
      board[0][5] = 2;

      expect(checkWin(board, 0, 5, 2)).toBe(true);
    });

    it('does not false positive with only 3 stacked', () => {
      board[3][0] = 1;
      board[3][1] = 1;
      board[3][2] = 1;

      expect(checkWin(board, 3, 2, 1)).toBe(false);
    });
  });

  describe('diagonal wins (ascending ↗)', () => {
    it('detects ascending diagonal win', () => {
      // Diagonal from (0,0) to (3,3)
      board[0][0] = 1;
      board[1][1] = 1;
      board[2][2] = 1;
      board[3][3] = 1;

      expect(checkWin(board, 3, 3, 1)).toBe(true);
      expect(checkWin(board, 0, 0, 1)).toBe(true);
      expect(checkWin(board, 1, 1, 1)).toBe(true);
    });

    it('detects ascending diagonal in upper right', () => {
      board[3][2] = 2;
      board[4][3] = 2;
      board[5][4] = 2;
      board[6][5] = 2;

      expect(checkWin(board, 6, 5, 2)).toBe(true);
    });

    it('does not false positive with broken diagonal', () => {
      board[0][0] = 1;
      board[1][1] = 1;
      board[2][2] = 2; // Different player breaks the line
      board[3][3] = 1;

      expect(checkWin(board, 3, 3, 1)).toBe(false);
    });
  });

  describe('diagonal wins (descending ↘)', () => {
    it('detects descending diagonal win', () => {
      // Diagonal from (0,3) to (3,0)
      board[0][3] = 1;
      board[1][2] = 1;
      board[2][1] = 1;
      board[3][0] = 1;

      expect(checkWin(board, 3, 0, 1)).toBe(true);
      expect(checkWin(board, 0, 3, 1)).toBe(true);
    });

    it('detects descending diagonal from top right', () => {
      board[3][5] = 2;
      board[4][4] = 2;
      board[5][3] = 2;
      board[6][2] = 2;

      expect(checkWin(board, 5, 3, 2)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('does not count opponent pieces', () => {
      board[0][0] = 1;
      board[1][0] = 1;
      board[2][0] = 2; // Opponent
      board[3][0] = 1;
      board[4][0] = 1;

      expect(checkWin(board, 4, 0, 1)).toBe(false);
    });

    it('handles more than 4 in a row', () => {
      board[0][0] = 1;
      board[1][0] = 1;
      board[2][0] = 1;
      board[3][0] = 1;
      board[4][0] = 1;

      expect(checkWin(board, 2, 0, 1)).toBe(true);
    });

    it('correctly identifies winner among mixed pieces', () => {
      // Complex board state
      board[0][0] = 1;
      board[1][0] = 2;
      board[2][0] = 1;
      board[3][0] = 1;
      board[0][1] = 2;
      board[1][1] = 1;
      board[2][1] = 2;
      board[3][1] = 2;
      board[0][2] = 1;
      board[1][2] = 2;
      board[2][2] = 1;
      board[0][3] = 2;
      board[1][3] = 1;

      // Player 1 has diagonal from (0,0) to (3,3)? No, let's check
      // Actually checking specific positions
      expect(checkWin(board, 2, 2, 1)).toBe(false);
    });
  });
});

describe('countPieces', () => {
  it('returns 0 for empty board', () => {
    const board = createBoard();
    expect(countPieces(board)).toBe(0);
  });

  it('counts pieces correctly', () => {
    const board = createBoard();
    placePiece(board, 0, 1);
    placePiece(board, 1, 2);
    placePiece(board, 0, 1);
    expect(countPieces(board)).toBe(3);
  });
});

describe('checkDraw', () => {
  it('returns false for non-full board', () => {
    const board = createBoard();
    expect(checkDraw(board)).toBe(false);

    placePiece(board, 0, 1);
    expect(checkDraw(board)).toBe(false);
  });

  it('returns true when board is completely full', () => {
    const board = createBoard();
    // Fill entire board
    for (let col = 0; col < COLS; col++) {
      for (let row = 0; row < ROWS; row++) {
        board[col][row] = ((col + row) % 2 + 1) as 1 | 2;
      }
    }
    expect(checkDraw(board)).toBe(true);
  });
});

describe('internalRowToCssRow', () => {
  it('converts bottom row (0) to CSS row 6', () => {
    expect(internalRowToCssRow(0)).toBe(6);
  });

  it('converts top row (5) to CSS row 1', () => {
    expect(internalRowToCssRow(5)).toBe(1);
  });

  it('converts middle rows correctly', () => {
    expect(internalRowToCssRow(1)).toBe(5);
    expect(internalRowToCssRow(2)).toBe(4);
    expect(internalRowToCssRow(3)).toBe(3);
    expect(internalRowToCssRow(4)).toBe(2);
  });
});

describe('integration: full game scenarios', () => {
  it('simulates a horizontal win game', () => {
    const board = createBoard();

    // Player 1: col 0, Player 2: col 0
    // Player 1: col 1, Player 2: col 1
    // Player 1: col 2, Player 2: col 2
    // Player 1: col 3 -> wins

    placePiece(board, 0, 1);
    placePiece(board, 0, 2);
    placePiece(board, 1, 1);
    placePiece(board, 1, 2);
    placePiece(board, 2, 1);
    placePiece(board, 2, 2);
    const winRow = placePiece(board, 3, 1);

    expect(checkWin(board, 3, winRow, 1)).toBe(true);
  });

  it('simulates a vertical win game', () => {
    const board = createBoard();

    // Alternating columns but player 1 stacks in col 0
    placePiece(board, 0, 1); // P1
    placePiece(board, 1, 2); // P2
    placePiece(board, 0, 1); // P1
    placePiece(board, 1, 2); // P2
    placePiece(board, 0, 1); // P1
    placePiece(board, 1, 2); // P2
    const winRow = placePiece(board, 0, 1); // P1 wins

    expect(checkWin(board, 0, winRow, 1)).toBe(true);
  });

  it('simulates a diagonal win game', () => {
    const board = createBoard();

    // Set up for diagonal win
    // Col 0: P1
    // Col 1: P2, P1
    // Col 2: P2, P2, P1
    // Col 3: P2, P2, P2, P1

    placePiece(board, 0, 1); // P1 at (0,0)

    placePiece(board, 1, 2);
    placePiece(board, 1, 1); // P1 at (1,1)

    placePiece(board, 2, 2);
    placePiece(board, 2, 2);
    placePiece(board, 2, 1); // P1 at (2,2)

    placePiece(board, 3, 2);
    placePiece(board, 3, 2);
    placePiece(board, 3, 2);
    const winRow = placePiece(board, 3, 1); // P1 at (3,3) wins

    expect(checkWin(board, 3, winRow, 1)).toBe(true);
  });

  it('rejects placement in full column', () => {
    const board = createBoard();

    // Fill column 0
    for (let i = 0; i < ROWS; i++) {
      const row = placePiece(board, 0, 1);
      expect(row).toBe(i);
    }

    // Try to place one more
    const result = placePiece(board, 0, 2);
    expect(result).toBe(-1);
  });
});
