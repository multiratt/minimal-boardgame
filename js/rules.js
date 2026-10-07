// rules.js - Standard 8x8 Checkers Engine (Draughts)
// Implements standard rules: mandatory jumps, multi-jumps, king promotion & movements

export const BOARD_SIZE = 8;
export const WHITE = "white";
export const BLACK = "black";

let pieceCounter = 1;

export function createInitialBoard() {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  pieceCounter = 1;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (r < 3) {
          board[r][c] = {
            id: `b_${pieceCounter++}`,
            color: BLACK,
            isKing: false
          };
        } else if (r > 4) {
          board[r][c] = {
            id: `w_${pieceCounter++}`,
            color: WHITE,
            isKing: false
          };
        }
      }
    }
  }
  return board;
}

export function cloneBoard(board) {
  return board.map(row => row.map(cell => cell ? { ...cell } : null));
}

export function isValidSquare(r, c) {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE;
}

/**
 * Gets all single-step capture jumps available for a piece at (r, c).
 * Returns array of jump descriptors:
 * { from: {r, c}, to: {r, c}, captured: {r, c, piece}, isPromotion: boolean }
 */
export function getSingleJumpsForPiece(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];

  const jumps = [];
  const dirs = piece.isKing
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : piece.color === WHITE
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

  for (const [dr, dc] of dirs) {
    const midR = r + dr;
    const midC = c + dc;
    const destR = r + dr * 2;
    const destC = c + dc * 2;

    if (isValidSquare(destR, destC)) {
      const midPiece = board[midR][midC];
      const destPiece = board[destR][destC];

      if (midPiece && midPiece.color !== piece.color && destPiece === null) {
        const promotes = !piece.isKing && (
          (piece.color === WHITE && destR === 0) ||
          (piece.color === BLACK && destR === BOARD_SIZE - 1)
        );

        jumps.push({
          from: { r, c },
          to: { r: destR, c: destC },
          captured: { r: midR, c: midC, piece: { ...midPiece } },
          isPromotion: promotes
        });
      }
    }
  }

  return jumps;
}

/**
 * Gets regular (non-jump) steps for a piece.
 */
export function getRegularMovesForPiece(board, r, c) {
  const piece = board[r][c];
  if (!piece) return [];

  const moves = [];
  const dirs = piece.isKing
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : piece.color === WHITE
      ? [[-1, -1], [-1, 1]]
      : [[1, -1], [1, 1]];

  for (const [dr, dc] of dirs) {
    const destR = r + dr;
    const destC = c + dc;

    if (isValidSquare(destR, destC) && board[destR][destC] === null) {
      const promotes = !piece.isKing && (
        (piece.color === WHITE && destR === 0) ||
        (piece.color === BLACK && destR === BOARD_SIZE - 1)
      );

      moves.push({
        from: { r, c },
        to: { r: destR, c: destC },
        captured: null,
        isPromotion: promotes
      });
    }
  }

  return moves;
}

/**
 * Returns all legal moves for current turn.
 * If any jump is available on the board, ONLY jumps are returned (mandatory capture).
 */
export function getLegalMoves(board, turn) {
  const allJumps = [];
  const allRegular = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.color === turn) {
        const jumps = getSingleJumpsForPiece(board, r, c);
        if (jumps.length > 0) {
          allJumps.push(...jumps);
        } else {
          allRegular.push(...getRegularMovesForPiece(board, r, c));
        }
      }
    }
  }

  // Mandatory Jump rule
  if (allJumps.length > 0) {
    return { moves: allJumps, isJump: true };
  }
  return { moves: allRegular, isJump: false };
}

/**
 * Returns legal moves for a specific piece, respecting mandatory jump rule.
 */
export function getMovesForPiece(board, r, c, turn) {
  const piece = board[r][c];
  if (!piece || piece.color !== turn) return [];

  const allLegal = getLegalMoves(board, turn);
  return allLegal.moves.filter(m => m.from.r === r && m.from.c === c);
}

/**
 * Applies a move on the board and returns result state:
 * {
 *   newBoard,
 *   promoted: boolean,
 *   capturedPiece: piece | null,
 *   furtherJumps: jumpMoves[] (for multi-jump sequence),
 *   nextTurn: WHITE | BLACK
 * }
 */
export function applyMove(board, move) {
  const nextBoard = cloneBoard(board);
  const piece = { ...nextBoard[move.from.r][move.from.c] };

  // Clear source square
  nextBoard[move.from.r][move.from.c] = null;

  // Check promotion
  let promoted = false;
  if (!piece.isKing) {
    if (piece.color === WHITE && move.to.r === 0) {
      piece.isKing = true;
      promoted = true;
    } else if (piece.color === BLACK && move.to.r === BOARD_SIZE - 1) {
      piece.isKing = true;
      promoted = true;
    }
  }

  // Place on target square
  nextBoard[move.to.r][move.to.c] = piece;

  // Handle capture
  let capturedPiece = null;
  if (move.captured) {
    capturedPiece = nextBoard[move.captured.r][move.captured.c];
    nextBoard[move.captured.r][move.captured.c] = null;
  }

  // Multi-jump check:
  // If a piece just made a jump and did NOT promote on this step (standard rules: promotion ends the turn),
  // check if further jumps exist for this piece.
  let furtherJumps = [];
  if (move.captured && !promoted) {
    furtherJumps = getSingleJumpsForPiece(nextBoard, move.to.r, move.to.c);
  }

  const nextTurn = furtherJumps.length > 0
    ? piece.color
    : (piece.color === WHITE ? BLACK : WHITE);

  return {
    board: nextBoard,
    promoted,
    captured: capturedPiece,
    furtherJumps,
    nextTurn
  };
}

/**
 * Checks if game is over.
 * Returns { isOver: boolean, winner: WHITE | BLACK | null, reason: string | null }
 */
export function checkGameOver(board, turn) {
  let whiteCount = 0;
  let blackCount = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece) {
        if (piece.color === WHITE) whiteCount++;
        else blackCount++;
      }
    }
  }

  if (whiteCount === 0) {
    return { isOver: true, winner: BLACK, reason: "elimination" };
  }
  if (blackCount === 0) {
    return { isOver: true, winner: WHITE, reason: "elimination" };
  }

  const legal = getLegalMoves(board, turn);
  if (legal.moves.length === 0) {
    const winner = turn === WHITE ? BLACK : WHITE;
    return { isOver: true, winner, reason: "blocked" };
  }

  return { isOver: false, winner: null, reason: null };
}

/**
 * Counts pieces on board.
 */
export function countPieces(board) {
  let whiteMen = 0, whiteKings = 0;
  let blackMen = 0, blackKings = 0;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const p = board[r][c];
      if (p) {
        if (p.color === WHITE) {
          if (p.isKing) whiteKings++; else whiteMen++;
        } else {
          if (p.isKing) blackKings++; else blackMen++;
        }
      }
    }
  }

  return {
    white: { men: whiteMen, kings: whiteKings, total: whiteMen + whiteKings },
    black: { men: blackMen, kings: blackKings, total: blackMen + blackKings }
  };
}
