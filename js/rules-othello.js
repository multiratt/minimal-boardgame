// rules-othello.js - Othello / Reversi Rules Engine & AI
// Official 8x8 standard rules with 8-direction bracket flips, passing, and endgame disc count

export const BOARD_SIZE = 8;
export const WHITE = "white";
export const BLACK = "black";

const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1]
];

// Classic Positional Evaluation Matrix for Othello
const OTHELLO_WEIGHTS = [
  [ 100, -20,  10,   5,   5,  10, -20,  100],
  [ -20, -50,  -2,  -2,  -2,  -2, -50,  -20],
  [  10,  -2,  -1,  -1,  -1,  -1,  -2,   10],
  [   5,  -2,  -1,   0,   0,  -1,  -2,    5],
  [   5,  -2,  -1,   0,   0,  -1,  -2,    5],
  [  10,  -2,  -1,  -1,  -1,  -1,  -2,   10],
  [ -20, -50,  -2,  -2,  -2,  -2, -50,  -20],
  [ 100, -20,  10,   5,   5,  10, -20,  100]
];

let othelloCounter = 1;

/**
 * Creates initial 8x8 Othello board with 4 center discs:
 * d4 (row 3, col 3): White
 * e4 (row 3, col 4): Black
 * d5 (row 4, col 3): Black
 * e5 (row 4, col 4): White
 */
export function createOthelloBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  othelloCounter = 1;

  board[3][3] = { id: `wo_${othelloCounter++}`, color: WHITE };
  board[3][4] = { id: `bo_${othelloCounter++}`, color: BLACK };
  board[4][3] = { id: `bo_${othelloCounter++}`, color: BLACK };
  board[4][4] = { id: `wo_${othelloCounter++}`, color: WHITE };

  return board;
}

export function isValidSquare(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

/**
 * Returns an array of coordinates [{r, c}, ...] that will be flipped
 * if playerColor places a disc at (r, c).
 * Returns empty array if move is invalid.
 */
export function getFlipsForMove(board, r, c, playerColor) {
  if (!isValidSquare(r, c) || board[r][c] !== null) {
    return [];
  }

  const oppColor = playerColor === WHITE ? BLACK : WHITE;
  const flips = [];

  for (const [dr, dc] of DIRECTIONS) {
    let nr = r + dr;
    let nc = c + dc;
    const path = [];

    while (isValidSquare(nr, nc) && board[nr][nc] && board[nr][nc].color === oppColor) {
      path.push({ r: nr, c: nc });
      nr += dr;
      nc += dc;
    }

    // Must be bounded by friendly piece
    if (path.length > 0 && isValidSquare(nr, nc) && board[nr][nc] && board[nr][nc].color === playerColor) {
      for (const p of path) {
        flips.push(p);
      }
    }
  }

  return flips;
}

/**
 * Returns all legal moves for playerColor.
 * Each move is { to: { r, c }, flipped: [{ r, c }, ...] }
 */
export function getLegalOthelloMoves(board, playerColor) {
  const moves = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) {
        const flips = getFlipsForMove(board, r, c, playerColor);
        if (flips.length > 0) {
          moves.push({
            to: { r, c },
            flipped: flips
          });
        }
      }
    }
  }
  return moves;
}

/**
 * Applies move to board and returns updated state:
 * { board, nextTurn, passed: boolean, flippedCount: number }
 */
export function applyOthelloMove(board, move, playerColor) {
  const newBoard = board.map(row => row.map(cell => cell ? { ...cell } : null));

  // 1. Place disc
  newBoard[move.to.r][move.to.c] = {
    id: `oth_${playerColor === WHITE ? "w" : "b"}_${Date.now()}_${move.to.r}_${move.to.c}`,
    color: playerColor
  };

  // 2. Flip bracketed discs
  for (const f of move.flipped) {
    newBoard[f.r][f.c] = {
      ...newBoard[f.r][f.c],
      color: playerColor
    };
  }

  // 3. Determine next turn (check passing)
  const oppColor = playerColor === WHITE ? BLACK : WHITE;
  const oppMoves = getLegalOthelloMoves(newBoard, oppColor);

  let nextTurn = null;
  let passed = false;

  if (oppMoves.length > 0) {
    nextTurn = oppColor;
  } else {
    // Opponent has no moves! Check if current player can move again (PASS)
    const myMoves = getLegalOthelloMoves(newBoard, playerColor);
    if (myMoves.length > 0) {
      nextTurn = playerColor;
      passed = true;
    } else {
      // Neither can move -> Game Over
      nextTurn = null;
    }
  }

  return {
    board: newBoard,
    nextTurn,
    passed,
    flippedCount: move.flipped.length
  };
}

/**
 * Counts pieces on board { white, black, empty }
 */
export function countOthelloPieces(board) {
  let white = 0;
  let black = 0;
  let empty = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (!p) empty++;
      else if (p.color === WHITE) white++;
      else black++;
    }
  }

  return { white, black, empty };
}

/**
 * Checks if Othello game is over.
 * Returns { isOver: boolean, winner: "white" | "black" | null, reason: string | null }
 */
export function checkOthelloGameOver(board, currentTurn) {
  const counts = countOthelloPieces(board);

  if (counts.white === 0) {
    return { isOver: true, winner: BLACK, reason: "elimination" };
  }
  if (counts.black === 0) {
    return { isOver: true, winner: WHITE, reason: "elimination" };
  }
  if (counts.empty === 0) {
    let winner = null;
    if (counts.white > counts.black) winner = WHITE;
    else if (counts.black > counts.white) winner = BLACK;
    return { isOver: true, winner, reason: "discs_count" };
  }

  // Check if both players have no moves left
  const legalCurrent = currentTurn ? getLegalOthelloMoves(board, currentTurn) : [];
  const otherColor = (currentTurn === WHITE ? BLACK : WHITE);
  const legalOther = getLegalOthelloMoves(board, otherColor);

  if (legalCurrent.length === 0 && legalOther.length === 0) {
    let winner = null;
    if (counts.white > counts.black) winner = WHITE;
    else if (counts.black > counts.white) winner = BLACK;
    return { isOver: true, winner, reason: "discs_count" };
  }

  return { isOver: false, winner: null, reason: null };
}

// --- BOT AI FOR OTHELLO ---

function evaluateOthelloBoard(board, botColor) {
  const oppColor = botColor === WHITE ? BLACK : WHITE;
  let score = 0;
  let botCount = 0;
  let oppCount = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (!p) continue;

      let weight = OTHELLO_WEIGHTS[r][c];

      // Dynamic corner adjustment:
      // If corner is already held, adjacent squares become secure/good instead of hazardous
      if ((r === 0 && c === 1) || (r === 1 && c === 0) || (r === 1 && c === 1)) {
        if (board[0][0] && board[0][0].color === p.color) weight = 15;
      }
      if ((r === 0 && c === 6) || (r === 1 && c === 7) || (r === 1 && c === 6)) {
        if (board[0][7] && board[0][7].color === p.color) weight = 15;
      }
      if ((r === 6 && c === 0) || (r === 7 && c === 1) || (r === 6 && c === 1)) {
        if (board[7][0] && board[7][0].color === p.color) weight = 15;
      }
      if ((r === 6 && c === 7) || (r === 7 && c === 6) || (r === 6 && c === 6)) {
        if (board[7][7] && board[7][7].color === p.color) weight = 15;
      }

      if (p.color === botColor) {
        score += weight;
        botCount++;
      } else {
        score -= weight;
        oppCount++;
      }
    }
  }

  // Mobility bonus (number of legal moves)
  const botMobility = getLegalOthelloMoves(board, botColor).length;
  const oppMobility = getLegalOthelloMoves(board, oppColor).length;
  score += (botMobility - oppMobility) * 8;

  // Endgame disc parity dominant
  const totalPieces = botCount + oppCount;
  if (totalPieces >= 54) {
    score += (botCount - oppCount) * 12;
  }

  return score;
}

function minimaxOthello(board, depth, alpha, beta, isMaximizing, botColor, currentTurn) {
  const gameOver = checkOthelloGameOver(board, currentTurn);
  if (gameOver.isOver) {
    if (gameOver.winner === botColor) return 10000 + depth;
    if (gameOver.winner !== null) return -10000 - depth;
    return 0;
  }

  if (depth === 0) {
    return evaluateOthelloBoard(board, botColor);
  }

  const moves = getLegalOthelloMoves(board, currentTurn);
  if (moves.length === 0) {
    // Current turn passes, evaluate opponent's response
    const oppColor = currentTurn === WHITE ? BLACK : WHITE;
    return minimaxOthello(board, depth - 1, alpha, beta, !isMaximizing, botColor, oppColor);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const outcome = applyOthelloMove(board, move, currentTurn);
      const evalScore = minimaxOthello(outcome.board, depth - 1, alpha, beta, false, botColor, outcome.nextTurn || currentTurn);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const outcome = applyOthelloMove(board, move, currentTurn);
      const evalScore = minimaxOthello(outcome.board, depth - 1, alpha, beta, true, botColor, outcome.nextTurn || currentTurn);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Returns best move for Bot in Othello
 */
export function getAIOthelloMove(board, botColor, difficulty = "medium") {
  const legalMoves = getLegalOthelloMoves(board, botColor);
  if (legalMoves.length === 0) return null;

  // Easy: Random move, or slight preference for corners
  if (difficulty === "easy") {
    if (Math.random() < 0.35) {
      const cornerMove = legalMoves.find(m =>
        (m.to.r === 0 || m.to.r === 7) && (m.to.c === 0 || m.to.c === 7)
      );
      if (cornerMove) return cornerMove;
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Medium: Positional weighting heuristic with corner priority
  if (difficulty === "medium") {
    let bestScore = -Infinity;
    let bestMoves = [];

    for (const move of legalMoves) {
      let score = OTHELLO_WEIGHTS[move.to.r][move.to.c];
      score += move.flipped.length * 3;

      // Prioritize corners
      if ((move.to.r === 0 || move.to.r === 7) && (move.to.c === 0 || move.to.c === 7)) {
        score += 300;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }

  // Hard: Minimax depth 3-4 with alpha-beta pruning
  const counts = countOthelloPieces(board);
  const depth = counts.empty <= 12 ? 4 : 3;

  let bestMove = legalMoves[0];
  let maxEval = -Infinity;

  for (const move of legalMoves) {
    const outcome = applyOthelloMove(board, move, botColor);
    const score = minimaxOthello(
      outcome.board,
      depth,
      -Infinity,
      Infinity,
      false,
      botColor,
      outcome.nextTurn || botColor
    );

    if (score > maxEval) {
      maxEval = score;
      bestMove = move;
    }
  }

  return bestMove;
}
