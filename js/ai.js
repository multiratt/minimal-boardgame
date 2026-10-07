// ai.js - Checkers AI Bot supporting both Thai and International rules
import {
  BOARD_SIZE,
  WHITE,
  BLACK,
  RULE_THAI,
  getLegalMoves,
  applyMove,
  checkGameOver
} from "./rules.js";

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

function evaluateBoard(board, botColor, ruleVariant) {
  let score = 0;
  let botPieces = 0;
  let oppPieces = 0;

  // Thai kings (flying kings) have significantly higher strategic weight
  const kingBaseValue = ruleVariant === RULE_THAI ? 380 : 260;
  const manBaseValue = 100;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isBot = piece.color === botColor;
      const baseValue = piece.isKing ? kingBaseValue : manBaseValue;
      let posBonus = POSITIONAL_WEIGHTS[r][c];

      if (!piece.isKing) {
        if (piece.color === WHITE) {
          posBonus += (7 - r) * 7;
        } else {
          posBonus += r * 7;
        }

        // Back rank protection
        if (piece.color === WHITE && r === 7) posBonus += 25;
        if (piece.color === BLACK && r === 0) posBonus += 25;
      } else {
        // King mobility bonus
        posBonus += ruleVariant === RULE_THAI ? 25 : 15;
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

  if (oppPieces === 0) score += 10000;
  if (botPieces === 0) score -= 10000;

  return score;
}

function minimax(board, depth, alpha, beta, isMaximizing, botColor, currentTurn, ruleVariant) {
  const gameOver = checkGameOver(board, currentTurn, ruleVariant);
  if (gameOver.isOver) {
    if (gameOver.winner === botColor) return 9999 + depth;
    if (gameOver.winner !== null) return -9999 - depth;
    return 0;
  }

  if (depth === 0) {
    return evaluateBoard(board, botColor, ruleVariant);
  }

  const legal = getLegalMoves(board, currentTurn, ruleVariant);
  if (legal.moves.length === 0) {
    return isMaximizing ? -9999 : 9999;
  }

  const nextTurn = currentTurn === WHITE ? BLACK : WHITE;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legal.moves) {
      const outcome = applyMove(board, move, ruleVariant);
      const turnAfterMove = outcome.furtherJumps.length > 0 ? currentTurn : nextTurn;
      const keepMaximizing = outcome.furtherJumps.length > 0;

      const evaluation = minimax(
        outcome.board,
        keepMaximizing ? depth : depth - 1,
        alpha,
        beta,
        keepMaximizing,
        botColor,
        turnAfterMove,
        ruleVariant
      );

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legal.moves) {
      const outcome = applyMove(board, move, ruleVariant);
      const turnAfterMove = outcome.furtherJumps.length > 0 ? currentTurn : nextTurn;
      const keepMinimizing = outcome.furtherJumps.length > 0;

      const evaluation = minimax(
        outcome.board,
        keepMinimizing ? depth : depth - 1,
        alpha,
        beta,
        !keepMinimizing,
        botColor,
        turnAfterMove,
        ruleVariant
      );

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getAIMove(board, botColor, difficulty = "medium", ruleVariant = RULE_THAI) {
  const legal = getLegalMoves(board, botColor, ruleVariant);
  if (legal.moves.length === 0) return null;

  if (legal.moves.length === 1) {
    return legal.moves[0];
  }

  // 1. EASY
  if (difficulty === "easy") {
    const captures = legal.moves.filter(m => m.captured !== null);
    if (captures.length > 0 && Math.random() < 0.6) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legal.moves[Math.floor(Math.random() * legal.moves.length)];
  }

  // 2. MEDIUM
  if (difficulty === "medium") {
    const depth = 3;
    let bestMoves = [];
    let bestScore = -Infinity;

    for (const move of legal.moves) {
      const outcome = applyMove(board, move, ruleVariant);
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
        nextTurn,
        ruleVariant
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

  // 3. HARD
  const searchDepth = 5;
  let bestMoves = [];
  let bestScore = -Infinity;
  let alpha = -Infinity;
  const beta = Infinity;

  const sortedMoves = [...legal.moves].sort((a, b) => {
    const aCap = a.captured ? 10 : 0;
    const bCap = b.captured ? 10 : 0;
    return bCap - aCap;
  });

  for (const move of sortedMoves) {
    const outcome = applyMove(board, move, ruleVariant);
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
      nextTurn,
      ruleVariant
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
