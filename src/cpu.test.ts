// ABOUTME: Unit tests for CPU AI logic
// ABOUTME: Tests move selection, win/block detection, and board evaluation

import { describe, it, expect } from 'vitest';
import { getCpuMove, getValidMoves, evaluateBoard, cloneBoard } from './cpu';
import { type Board, createBoard, placePiece } from './game';

describe('cloneBoard', () => {
  it('creates a deep copy of the board', () => {
    const board = createBoard();
    placePiece(board, 3, 1);

    const cloned = cloneBoard(board);

    // Verify it's a copy
    expect(cloned).toEqual(board);

    // Verify it's a deep copy (modifying clone doesn't affect original)
    placePiece(cloned, 0, 2);
    expect(board[0][0]).toBe(0);
    expect(cloned[0][0]).toBe(2);
  });
});

describe('getValidMoves', () => {
  it('returns all columns for an empty board', () => {
    const board = createBoard();
    const moves = getValidMoves(board);

    expect(moves).toHaveLength(7);
    // Should be in center-first order
    expect(moves).toEqual([3, 2, 4, 1, 5, 0, 6]);
  });

  it('excludes full columns', () => {
    const board = createBoard();

    // Fill column 3 completely
    for (let i = 0; i < 6; i++) {
      placePiece(board, 3, (i % 2) + 1 as 1 | 2);
    }

    const moves = getValidMoves(board);

    expect(moves).not.toContain(3);
    expect(moves).toHaveLength(6);
  });

  it('returns empty array when board is full', () => {
    const board = createBoard();

    // Fill entire board
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 6; row++) {
        placePiece(board, col, ((col + row) % 2) + 1 as 1 | 2);
      }
    }

    const moves = getValidMoves(board);
    expect(moves).toHaveLength(0);
  });
});

describe('evaluateBoard', () => {
  it('returns 0 for empty board', () => {
    const board = createBoard();
    const score = evaluateBoard(board);
    expect(score).toBe(0);
  });

  it('prefers center column control for CPU', () => {
    const board = createBoard();
    placePiece(board, 3, 2); // CPU in center

    const score = evaluateBoard(board);
    expect(score).toBeGreaterThan(0);
  });

  it('penalizes center column control by human', () => {
    const board = createBoard();
    placePiece(board, 3, 1); // Human in center

    const score = evaluateBoard(board);
    expect(score).toBeLessThan(0);
  });

  it('scores 3-in-a-row patterns higher than 2-in-a-row', () => {
    const boardWith2 = createBoard();
    placePiece(boardWith2, 0, 2);
    placePiece(boardWith2, 1, 2);

    const boardWith3 = createBoard();
    placePiece(boardWith3, 0, 2);
    placePiece(boardWith3, 1, 2);
    placePiece(boardWith3, 2, 2);

    const score2 = evaluateBoard(boardWith2);
    const score3 = evaluateBoard(boardWith3);

    expect(score3).toBeGreaterThan(score2);
  });
});

describe('getCpuMove', () => {
  it('takes winning move when available', () => {
    const board = createBoard();
    // Set up CPU (player 2) with 3 in a row horizontally
    placePiece(board, 0, 2);
    placePiece(board, 1, 2);
    placePiece(board, 2, 2);
    // Column 3 would be the winning move

    const move = getCpuMove(board);
    expect(move).toBe(3);
  });

  it('blocks opponent winning move', () => {
    const board = createBoard();
    // Set up human (player 1) with 3 in a row horizontally
    placePiece(board, 0, 1);
    placePiece(board, 1, 1);
    placePiece(board, 2, 1);
    // CPU must block at column 3

    const move = getCpuMove(board);
    expect(move).toBe(3);
  });

  it('prefers winning over blocking', () => {
    const board = createBoard();
    // Human has 3 in bottom row
    placePiece(board, 0, 1);
    placePiece(board, 1, 1);
    placePiece(board, 2, 1);

    // CPU has 3 in second row (needs to play column 3 to win)
    placePiece(board, 0, 2);
    placePiece(board, 1, 2);
    placePiece(board, 2, 2);

    // Both players need column 3, but CPU should take it to win
    const move = getCpuMove(board);
    expect(move).toBe(3);
  });

  it('prefers center on empty board', () => {
    const board = createBoard();
    const move = getCpuMove(board);

    // Should prefer center column (3) or adjacent (2, 4)
    expect([2, 3, 4]).toContain(move);
  });

  it('blocks vertical winning threat', () => {
    const board = createBoard();
    // Human has 3 stacked in column 0
    placePiece(board, 0, 1);
    placePiece(board, 0, 1);
    placePiece(board, 0, 1);

    const move = getCpuMove(board);
    expect(move).toBe(0);
  });

  it('takes vertical winning move', () => {
    const board = createBoard();
    // CPU has 3 stacked in column 2
    placePiece(board, 2, 2);
    placePiece(board, 2, 2);
    placePiece(board, 2, 2);

    const move = getCpuMove(board);
    expect(move).toBe(2);
  });

  it('blocks diagonal winning threat', () => {
    const board = createBoard();
    // Create a diagonal threat for player 1
    // Player 1 at (0,0), (1,1), (2,2) - needs (3,3) to win

    // Fill supporting pieces
    placePiece(board, 0, 1); // (0, 0)
    placePiece(board, 1, 2); // (1, 0) - filler
    placePiece(board, 1, 1); // (1, 1)
    placePiece(board, 2, 2); // (2, 0) - filler
    placePiece(board, 2, 2); // (2, 1) - filler
    placePiece(board, 2, 1); // (2, 2)

    // Need to build up to (3, 3)
    placePiece(board, 3, 2); // (3, 0) - filler
    placePiece(board, 3, 2); // (3, 1) - filler
    placePiece(board, 3, 2); // (3, 2) - filler

    const move = getCpuMove(board);
    expect(move).toBe(3);
  });
});
