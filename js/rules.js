// rules.js - Checkers Engine supporting both Thai & International Rules
// Thai Checkers: 8 pieces per player, Flying King (ฮอสบิน)
// International Checkers: 12 pieces per player, 1-step King (ฮอส 1 ก้าว)

export const BOARD_SIZE = 8;
export const WHITE = "white";
export const BLACK = "black";

export const RULE_THAI = "thai";
export const RULE_INTERNATIONAL = "international";

let pieceCounter = 1;

/**
 * Creates initial 8x8 board based on selected rule variant.
 * - Thai: 8 pieces per player (rows 0,1 for Black; rows 6,7 for White)
 * - International: 12 pieces per player (rows 0,1,2 for Black; rows 5,6,7 for White)
 */
export function createInitialBoard(ruleVariant = RULE_THAI) {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  pieceCounter = 1;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) {
        if (ruleVariant === RULE_THAI) {
          // Thai: 8 pieces (rows 0,1 and rows 6,7)
          if (r < 2) {
            board[r][c] = { id: `b_${pieceCounter++}`, color: BLACK, isKing: false };
          } else if (r > 5) {
            board[r][c] = { id: `w_${pieceCounter++}`, color: WHITE, isKing: false };
          }
        } else {
          // International: 12 pieces (rows 0,1,2 and rows 5,6,7)
          if (r < 3) {
            board[r][c] = { id: `b_${pieceCounter++}`, color: BLACK, isKing: false };
          } else if (r > 4) {
            board[r][c] = { id: `w_${pieceCounter++}`, color: WHITE, isKing: false };
          }
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
 * Regular non-jump moves for a piece.
 */
export function getRegularMovesForPiece(board, r, c, ruleVariant = RULE_THAI) {
  const piece = board[r][c];
  if (!piece) return [];

  const moves = [];

  // THAI FLYING KING: can slide along any of 4 diagonals as far as unblocked
  if (piece.isKing && ruleVariant === RULE_THAI) {
    const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of dirs) {
      let step = 1;
      while (true) {
        const destR = r + dr * step;
        const destC = c + dc * step;
        if (!isValidSquare(destR, destC) || board[destR][destC] !== null) {
          break; // Blocked or edge
        }
        moves.push({
          from: { r, c },
          to: { r: destR, c: destC },
          captured: null,
          isPromotion: false
        });
        step++;
      }
    }
    return moves;
  }

  // STANDARD REGULAR PIECE OR 1-STEP INTERNATIONAL KING
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
 * Capture jumps for a piece.
 */
export function getSingleJumpsForPiece(board, r, c, ruleVariant = RULE_THAI) {
  const piece = board[r][c];
  if (!piece) return [];

  const jumps = [];

  // THAI FLYING KING CAPTURE:
  // Can fly along diagonal, find first opposing piece, and land on ANY open square behind it!
  if (piece.isKing && ruleVariant === RULE_THAI) {
    const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of dirs) {
      let enemyFound = null;
      let step = 1;

      while (true) {
        const checkR = r + dr * step;
        const checkC = c + dc * step;
        if (!isValidSquare(checkR, checkC)) break;

        const cell = board[checkR][checkC];
        if (cell !== null) {
          if (enemyFound !== null) {
            // Second piece encountered: cannot jump over two pieces
            break;
          }
          if (cell.color === piece.color) {
            // Own piece blocks path
            break;
          }
          // Found opponent piece to jump
          enemyFound = { r: checkR, c: checkC, piece: { ...cell } };
        } else {
          // Empty square
          if (enemyFound !== null) {
            // Valid landing square behind the jumped piece!
            jumps.push({
              from: { r, c },
              to: { r: checkR, c: checkC },
              captured: enemyFound,
              isPromotion: false
            });
          }
        }
        step++;
      }
    }
    return jumps;
  }

  // STANDARD REGULAR PIECE OR 1-STEP INTERNATIONAL KING JUMP
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
 * Returns legal moves for current turn.
 * If any jump is available on the board, ONLY jumps are returned (mandatory capture).
 */
export function getLegalMoves(board, turn, ruleVariant = RULE_THAI) {
  const allJumps = [];
  const allRegular = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const piece = board[r][c];
      if (piece && piece.color === turn) {
        const jumps = getSingleJumpsForPiece(board, r, c, ruleVariant);
        if (jumps.length > 0) {
          allJumps.push(...jumps);
        } else {
          allRegular.push(...getRegularMovesForPiece(board, r, c, ruleVariant));
        }
      }
    }
  }

  // Mandatory capture rule
  if (allJumps.length > 0) {
    return { moves: allJumps, isJump: true };
  }
  return { moves: allRegular, isJump: false };
}

export function getMovesForPiece(board, r, c, turn, ruleVariant = RULE_THAI) {
  const piece = board[r][c];
  if (!piece || piece.color !== turn) return [];

  const allLegal = getLegalMoves(board, turn, ruleVariant);
  return allLegal.moves.filter(m => m.from.r === r && m.from.c === c);
}

/**
 * Applies a move and checks for multi-jump sequences.
 */
export function applyMove(board, move, ruleVariant = RULE_THAI) {
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

  // Place on destination
  nextBoard[move.to.r][move.to.c] = piece;

  // Remove captured piece
  let capturedPiece = null;
  if (move.captured) {
    capturedPiece = nextBoard[move.captured.r][move.captured.c];
    nextBoard[move.captured.r][move.captured.c] = null;
  }

  // Multi-jump check:
  // If a piece just jumped and did NOT promote on this turn, check if it has further jumps
  let furtherJumps = [];
  if (move.captured && !promoted) {
    furtherJumps = getSingleJumpsForPiece(nextBoard, move.to.r, move.to.c, ruleVariant);
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

export function checkGameOver(board, turn, ruleVariant = RULE_THAI) {
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

  const legal = getLegalMoves(board, turn, ruleVariant);
  if (legal.moves.length === 0) {
    const winner = turn === WHITE ? BLACK : WHITE;
    return { isOver: true, winner, reason: "blocked" };
  }

  return { isOver: false, winner: null, reason: null };
}

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
