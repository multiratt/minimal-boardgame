// rules-chess.js - Western Chess (หมากรุกสากล) Rules Engine
// Uses window.Chess (chess.js) in browser or embedded runner

export const BOARD_SIZE = 8;
export const WHITE = "white";
export const BLACK = "black";

let ChessEngine = null;

export function setChessConstructor(fn) {
  ChessEngine = fn;
}

function getChessInstance(fen) {
  const Constructor = ChessEngine || (typeof window !== "undefined" ? window.Chess : null);
  if (!Constructor) {
    throw new Error("Chess engine constructor not found");
  }
  return fen ? new Constructor(fen) : new Constructor();
}

/**
 * Converts chess.js board to 8x8 matrix compatible with our renderer
 */
export function fenToBoard(fen) {
  const game = getChessInstance(fen);
  const raw = game.board(); // 8x8 array of { type, color } | null
  const board = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    const row = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = raw[r][c];
      if (cell) {
        row.push({
          id: `wc_${r}_${c}_${cell.type}`,
          type: cell.type, // 'p', 'n', 'b', 'r', 'q', 'k'
          color: cell.color === "w" ? WHITE : BLACK
        });
      } else {
        row.push(null);
      }
    }
    board.push(row);
  }
  return board;
}

export function createInitialChess() {
  const game = getChessInstance();
  return {
    fen: game.fen(),
    board: fenToBoard(game.fen()),
    turn: WHITE
  };
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];

export function rcToSquare(r, c) {
  return `${FILES[c]}${8 - r}`;
}

export function squareToRc(sq) {
  const c = sq.charCodeAt(0) - 97;
  const r = 8 - parseInt(sq[1], 10);
  return { r, c };
}

/**
 * Returns legal moves formatted for our UI
 */
export function getLegalChessMoves(fen, r = null, c = null) {
  const game = getChessInstance(fen);
  const options = { verbose: true };
  if (r !== null && c !== null) {
    options.square = rcToSquare(r, c);
  }

  const moves = game.moves(options);
  return moves.map(m => {
    const fromRc = squareToRc(m.from);
    const toRc = squareToRc(m.to);
    return {
      from: fromRc,
      to: toRc,
      captured: m.captured ? { type: m.captured } : null,
      promotion: m.promotion || null,
      san: m.san,
      flags: m.flags
    };
  });
}

/**
 * Applies move in Western Chess
 */
export function applyChessMove(fen, move) {
  const game = getChessInstance(fen);
  const fromSquare = rcToSquare(move.from.r, move.from.c);
  const toSquare = rcToSquare(move.to.r, move.to.c);

  const moveRes = game.move({
    from: fromSquare,
    to: toSquare,
    promotion: move.promotion || "q"
  });

  if (!moveRes) return null;

  const nextFen = game.fen();
  const nextBoard = fenToBoard(nextFen);
  const nextTurn = game.turn() === "w" ? WHITE : BLACK;
  const isOver = game.game_over();

  let winner = null;
  let reason = null;
  if (isOver) {
    if (game.in_checkmate()) {
      winner = game.turn() === "w" ? BLACK : WHITE;
      reason = "checkmate";
    } else if (game.in_draw() || game.in_stalemate()) {
      winner = null;
      reason = "draw";
    }
  }

  return {
    fen: nextFen,
    board: nextBoard,
    nextTurn,
    promoted: !!moveRes.promotion,
    captured: moveRes.captured ? { type: moveRes.captured } : null,
    inCheck: game.in_check(),
    isOver,
    winner,
    reason
  };
}

// Chess piece evaluation weights
const CHESS_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

export function getAIChessMove(fen, botColor, difficulty = "medium") {
  const game = getChessInstance(fen);
  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return null;
  if (moves.length === 1) {
    const m = moves[0];
    return { from: squareToRc(m.from), to: squareToRc(m.to), promotion: m.promotion };
  }

  // Easy: random or basic capture
  if (difficulty === "easy") {
    const captures = moves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.6) {
      const m = captures[Math.floor(Math.random() * captures.length)];
      return { from: squareToRc(m.from), to: squareToRc(m.to), promotion: m.promotion };
    }
    const m = moves[Math.floor(Math.random() * moves.length)];
    return { from: squareToRc(m.from), to: squareToRc(m.to), promotion: m.promotion };
  }

  // Medium / Hard: evaluate captures & center control
  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const m of moves) {
    let score = 0;
    if (m.captured) {
      score += (CHESS_VALUES[m.captured] || 100) * 10 - (CHESS_VALUES[m.piece] || 100);
    }
    if (m.san.includes("+")) score += 50; // Check bonus
    if (m.san.includes("#")) score += 10000; // Checkmate bonus
    if (m.to === "d4" || m.to === "e4" || m.to === "d5" || m.to === "e5") score += 25; // Center control

    // Random jitter for variety
    score += Math.random() * 20;

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return { from: squareToRc(bestMove.from), to: squareToRc(bestMove.to), promotion: bestMove.promotion };
}
