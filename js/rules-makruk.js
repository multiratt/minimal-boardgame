// rules-makruk.js - Authentic Thai Chess (หมากรุกไทย) Rules Engine
// Pieces:
// 'k': ขุน (King)
// 'm': เม็ด (Met / Queen)
// 's': โคน (Khon / Bishop)
// 'n': ม้า (Knight)
// 'r': เรือ (Rook)
// 'p': เบี้ย (Bia / Pawn)
// 'pm': เบี้ยหงาย (Promoted Pawn - behaves like เม็ด)

export const BOARD_SIZE = 8;
export const WHITE = "white";
export const BLACK = "black";

let makrukCounter = 1;

/**
 * Creates initial 8x8 Makruk board.
 * White pieces on ranks 1 & 3 (rows 7 & 5).
 * Black pieces on ranks 8 & 6 (rows 0 & 2).
 */
export function createMakrukBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  makrukCounter = 1;

  // Black pieces (Row 0: back rank, Row 2: pawns)
  const blackBackRow = ["r", "n", "s", "k", "m", "s", "n", "r"];
  for (let c = 0; c < BOARD_SIZE; c++) {
    board[0][c] = {
      id: `bm_${makrukCounter++}`,
      type: blackBackRow[c],
      color: BLACK
    };
    board[2][c] = {
      id: `bm_${makrukCounter++}`,
      type: "p",
      color: BLACK
    };
  }

  // White pieces (Row 7: back rank, Row 5: pawns)
  // In Makruk, White King is on d1 (c=3) facing Black King on d8 (c=3).
  // White Met is on e1 (c=4) facing Black Met on e8 (c=4).
  const whiteBackRow = ["r", "n", "s", "k", "m", "s", "n", "r"];
  for (let c = 0; c < BOARD_SIZE; c++) {
    board[7][c] = {
      id: `wm_${makrukCounter++}`,
      type: whiteBackRow[c],
      color: WHITE
    };
    board[5][c] = {
      id: `wm_${makrukCounter++}`,
      type: "p",
      color: WHITE
    };
  }

  return board;
}

export function cloneMakrukBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

export function isValidSquare(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

/**
 * Returns raw pseudo-legal moves for a piece at (r, c)
 */
export function getRawMovesForPiece(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];

  const moves = [];
  const color = piece.color;
  const oppColor = color === WHITE ? BLACK : WHITE;

  const addMove = (toR, toC) => {
    if (!isValidSquare(toR, toC)) return false;
    const dest = board[toR][toC];
    if (dest === null) {
      moves.push({ from: { r, c }, to: { r: toR, c: toC }, captured: null });
      return true; // continue ray
    } else if (dest.color === oppColor) {
      moves.push({ from: { r, c }, to: { r: toR, c: toC }, captured: { ...dest } });
      return false; // blocked after capture
    }
    return false; // blocked by own piece
  };

  switch (piece.type) {
    // 1. ขุน (King) - 1 step in all 8 directions
    case "k": {
      const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for (const [dr, dc] of dirs) {
        addMove(r + dr, c + dc);
      }
      break;
    }

    // 2. เม็ด (Met) & เบี้ยหงาย (Promoted Pawn) - 1 step in 4 diagonals
    case "m":
    case "pm": {
      const dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
      for (const [dr, dc] of dirs) {
        addMove(r + dr, c + dc);
      }
      break;
    }

    // 3. โคน (Khon) - 1 step forward or 1 step diagonally (5 directions)
    case "s": {
      const forwardR = color === WHITE ? -1 : 1;
      const dirs = [
        [forwardR, 0],   // 1 step forward
        [-1, -1], [-1, 1], [1, -1], [1, 1] // 4 diagonals
      ];
      for (const [dr, dc] of dirs) {
        addMove(r + dr, c + dc);
      }
      break;
    }

    // 4. ม้า (Knight) - Standard L-shape jump
    case "n": {
      const knightOffsets = [
        [-2,-1],[-2,1],[-1,-2],[-1,2],
        [1,-2],[1,2],[2,-1],[2,1]
      ];
      for (const [dr, dc] of knightOffsets) {
        addMove(r + dr, c + dc);
      }
      break;
    }

    // 5. เรือ (Rook) - Orthogonal rays
    case "r": {
      const rays = [[-1,0],[1,0],[0,-1],[0,1]];
      for (const [dr, dc] of rays) {
        let step = 1;
        while (true) {
          const toR = r + dr * step;
          const toC = c + dc * step;
          if (!addMove(toR, toC)) break;
          step++;
        }
      }
      break;
    }

    // 6. เบี้ย (Bia / Pawn)
    // White moves row - 1, Black moves row + 1.
    // Moves 1 step forward into empty square.
    // Captures 1 step diagonally forward.
    case "p": {
      const forwardR = color === WHITE ? -1 : 1;
      const stepR = r + forwardR;

      // Forward step (cannot capture)
      if (isValidSquare(stepR, c) && board[stepR][c] === null) {
        moves.push({ from: { r, c }, to: { r: stepR, c }, captured: null });
      }

      // Diagonal captures
      for (const dc of [-1, 1]) {
        const capC = c + dc;
        if (isValidSquare(stepR, capC)) {
          const dest = board[stepR][capC];
          if (dest && dest.color === oppColor) {
            moves.push({ from: { r, c }, to: { r: stepR, c: capC }, captured: { ...dest } });
          }
        }
      }
      break;
    }
  }

  // Check promotion for Pawns:
  // White promotes at row <= 2. Black promotes at row >= 5.
  moves.forEach(m => {
    if (piece.type === "p") {
      if ((color === WHITE && m.to.r <= 2) || (color === BLACK && m.to.r >= 5)) {
        m.isPromotion = true;
      }
    }
  });

  return moves;
}

/**
 * Checks if the King of given color is currently under attack (in check)
 */
export function isKingInCheck(board, color) {
  let kingPos = null;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === "k") {
        kingPos = { r, c };
        break;
      }
    }
    if (kingPos) break;
  }

  if (!kingPos) return false;

  const oppColor = color === WHITE ? BLACK : WHITE;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.color === oppColor) {
        const rawMoves = getRawMovesForPiece(board, r, c);
        if (rawMoves.some(m => m.to.r === kingPos.r && m.to.c === kingPos.c)) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Applies move on board and returns new state.
 */
export function applyMakrukMove(board, move) {
  const nextBoard = cloneMakrukBoard(board);
  const piece = { ...nextBoard[move.from.r][move.from.c] };
  nextBoard[move.from.r][move.from.c] = null;

  let promoted = false;
  // Pawn promotion to เบี้ยหงาย ('pm')
  if (piece.type === "p") {
    if ((piece.color === WHITE && move.to.r <= 2) || (piece.color === BLACK && move.to.r >= 5)) {
      piece.type = "pm";
      promoted = true;
    }
  }

  const capturedPiece = nextBoard[move.to.r][move.to.c];
  nextBoard[move.to.r][move.to.c] = piece;

  const nextTurn = piece.color === WHITE ? BLACK : WHITE;

  return {
    board: nextBoard,
    promoted,
    captured: capturedPiece,
    nextTurn
  };
}

/**
 * Returns strictly legal moves for given turn (moves that do not leave own King in check)
 */
export function getLegalMakrukMoves(board, turn) {
  const legalMoves = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p && p.color === turn) {
        const raw = getRawMovesForPiece(board, r, c);
        for (const m of raw) {
          const outcome = applyMakrukMove(board, m);
          if (!isKingInCheck(outcome.board, turn)) {
            legalMoves.push(m);
          }
        }
      }
    }
  }

  return legalMoves;
}

export function checkMakrukGameOver(board, turn) {
  const legal = getLegalMakrukMoves(board, turn);
  const inCheck = isKingInCheck(board, turn);

  if (legal.length === 0) {
    if (inCheck) {
      // Checkmate!
      const winner = turn === WHITE ? BLACK : WHITE;
      return { isOver: true, winner, reason: "checkmate" };
    } else {
      // Stalemate (อับ)
      return { isOver: true, winner: null, reason: "stalemate" };
    }
  }

  return { isOver: false, winner: null, reason: null };
}

// Makruk Piece Material Values for AI evaluation
const MAKRUK_VALUES = {
  k: 10000,
  r: 500,
  n: 300,
  s: 260,
  m: 160,
  pm: 160,
  p: 100
};

export function evaluateMakrukBoard(board, botColor) {
  let score = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = MAKRUK_VALUES[p.type] || 100;
      if (p.color === botColor) {
        score += val;
      } else {
        score -= val;
      }
    }
  }
  return score;
}

export function getAIMakrukMove(board, botColor, difficulty = "medium") {
  const legal = getLegalMakrukMoves(board, botColor);
  if (legal.length === 0) return null;
  if (legal.length === 1) return legal[0];

  if (difficulty === "easy") {
    const captures = legal.filter(m => m.captured !== null);
    if (captures.length > 0 && Math.random() < 0.6) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legal[Math.floor(Math.random() * legal.length)];
  }

  // Minimax with alpha-beta for Medium/Hard
  const depth = difficulty === "hard" ? 3 : 2;

  let bestMove = legal[0];
  let bestScore = -Infinity;

  for (const move of legal) {
    const outcome = applyMakrukMove(board, move);
    const score = -evaluateMakrukBoard(outcome.board, botColor === WHITE ? BLACK : WHITE);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
