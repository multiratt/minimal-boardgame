// ai.js - Checkers AI Bot with 3 Difficulty Levels
import {
  BOARD_SIZE,
  WHITE,
  BLACK,
  cloneBoard,
  getLegalMoves,
  applyMove,
  checkGameOver
} from "./rules.js";

// Piece-square table for positional awareness on 8x8 checkers board
const POSITIONAL_WEIGHTS = [
  [0, 5, 0, 5, 0, 5, 0, 5],
  [4, 0, 3, 0, 3, 0, 3, 0],
  [0, 3, 0, 4, 0, 4, 0, 4],
  [3, 0, 5, 0, 5, 0, 3, 0],
  [0, 3, 0, 5, 0, 5, 0, 3],
  [4, 0, 4, 0, 4, 0, 3, 0],
  [0, 3, 0, 3, 0, 3, 0, 4],
  [5, 0, 5, 0, 5, 0, 5, 0]
];

/**
 * Heuristic static evaluation function from the perspective of botColor.
 */
function evaluateBoard(board, botColor) {
  let score = 0;
  const oppColor = botColor === WHITE ? BLACK : WHITE;

  let botPieces = 0;
  let oppPieces = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isBot = piece.color === botColor;
      const baseValue = piece.isKing ? 260 : 100;
      let posBonus = POSITIONAL_WEIGHTS[r][c];

      // Advancement bonus for men
      if (!piece.isKing) {
        if (piece.color === WHITE) {
          posBonus += (7 - r) * 6; // Closer to row 0
        } else {
          posBonus += r * 6;       // Closer to row 7
        }

        // Back rank protection bonus (protect against opposing kings)
        if (piece.color === WHITE && r === 7) posBonus += 20;
        if (piece.color === BLACK && r === 0) posBonus += 20;
      } else {
        // King center mobility
        posBonus += 15;
      }

      if (isBot) {
        score += (baseValue + posBonus);
        botPieces++;
      } else {
        score -= (baseValue + posBonus);
        oppPieces++;
      }
    }
  }

  // Bonus if opponent is close to wiped out
  if (oppPieces === 0) score += 10000;
  if (botPieces === 0) score -= 10000;

  return score;
}

/**
 * Minimax with Alpha-Beta pruning
 */
function minimax(board, depth, alpha, beta, isMaximizing, botColor, currentTurn) {
  const gameOver = checkGameOver(board, currentTurn);
  if (gameOver.isOver) {
    if (gameOver.winner === botColor) return 9999 + depth;
    if (gameOver.winner !== null) return -9999 - depth;
    return 0;
  }

  if (depth === 0) {
    return evaluateBoard(board, botColor);
  }

  const legal = getLegalMoves(board, currentTurn);
  if (legal.moves.length === 0) {
    return isMaximizing ? -9999 : 9999;
  }

  const nextTurn = currentTurn === WHITE ? BLACK : WHITE;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legal.moves) {
      const outcome = applyMove(board, move);
      // Handle multi-jump continuation
      const turnAfterMove = outcome.furtherJumps.length > 0 ? currentTurn : nextTurn;
      const keepMaximizing = outcome.furtherJumps.length > 0;

      const evaluation = minimax(
        outcome.board,
        keepMaximizing ? depth : depth - 1,
        alpha,
        beta,
        keepMaximizing,
        botColor,
        turnAfterMove
      );

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legal.moves) {
      const outcome = applyMove(board, move);
      const turnAfterMove = outcome.furtherJumps.length > 0 ? currentTurn : nextTurn;
      const keepMinimizing = outcome.furtherJumps.length > 0;

      const evaluation = minimax(
        outcome.board,
        keepMinimizing ? depth : depth - 1,
        alpha,
        beta,
        !keepMinimizing,
        botColor,
        turnAfterMove
      );

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

/**
 * Main AI function: selects best move given board, botColor, and difficulty.
 * @param {Array} board
 * @param {string} botColor ("white" | "black")
 * @param {string} difficulty ("easy" | "medium" | "hard")
 */
export function getAIMove(board, botColor, difficulty = "medium") {
  const legal = getLegalMoves(board, botColor);
  if (legal.moves.length === 0) return null;

  // Single choice: play it immediately
  if (legal.moves.length === 1) {
    return legal.moves[0];
  }

  // --- 1. EASY ---
  if (difficulty === "easy") {
    // 70% random, 30% capture preference, sometimes blunders
    const captures = legal.moves.filter(m => m.captured !== null);
    if (captures.length > 0 && Math.random() < 0.6) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legal.moves[Math.floor(Math.random() * legal.moves.length)];
  }

  // --- 2. MEDIUM ---
  if (difficulty === "medium") {
    const depth = 3;
    let bestMoves = [];
    let bestScore = -Infinity;

    for (const move of legal.moves) {
      const outcome = applyMove(board, move);
      const nextTurn = outcome.furtherJumps.length > 0
        ? botColor
        : (botColor === WHITE ? BLACK : WHITE);

      const score = minimax(
        outcome.board,
        depth - 1,
        -Infinity,
        Infinity,
        outcome.furtherJumps.length > 0,
        botColor,
        nextTurn
      );

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  // --- 3. HARD ---
  // Depth 5 with alpha-beta search and positional evaluation
  const searchDepth = 5;
  let bestMoves = [];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  // Prioritize captures first for move ordering efficiency
  const sortedMoves = [...legal.moves].sort((a, b) => {
    const aCap = a.captured ? 10 : 0;
    const bCap = b.captured ? 10 : 0;
    return bCap - aCap;
  });

  for (const move of sortedMoves) {
    const outcome = applyMove(board, move);
    const nextTurn = outcome.furtherJumps.length > 0
      ? botColor
      : (botColor === WHITE ? BLACK : WHITE);

    const score = minimax(
      outcome.board,
      searchDepth - 1,
      alpha,
      beta,
      outcome.furtherJumps.length > 0,
      botColor,
      nextTurn
    );

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
    alpha = Math.max(alpha, bestScore);
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
