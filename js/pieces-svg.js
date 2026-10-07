// pieces-svg.js - International Standard Vector Pieces (No text)
// High-contrast Staunton SVGs for Chess & Makruk, plus Crown for Checkers

export const SVG_PIECES = {
  // Checkers King Crown
  crown: `
    <svg class="piece-svg crown-svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
    </svg>`,

  // King (ขุน / King)
  k: `
    <svg class="piece-svg chess-svg" viewBox="0 0 45 45" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22.5 11.63V6M20 8h5" stroke-width="2"/>
      <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="currentColor" fill-opacity="0.3"/>
      <path d="M11.5 37c5.5 3.5 16.5 3.5 22 0 0-4-3-4-3-8.5s3.5-3.5 3.5-6.5c0-4-6.5-6-11.5-6s-11.5 2-11.5 6c0 3 3.5 2 3.5 6.5s-3 4.5-3 8.5z" fill="currentColor" fill-opacity="0.2"/>
      <path d="M11.5 30c5.5-2 16.5-2 22 0M11.5 33.5c5.5-2 16.5-2 22 0M11.5 37c5.5-2 16.5-2 22 0"/>
      <path d="M10 40c6 2.5 19 2.5 25 0v-2H10v2z" fill="currentColor"/>
    </svg>`,

  // Queen / Met (เม็ด / เบี้ยหงาย / Queen)
  q: `
    <svg class="piece-svg chess-svg" viewBox="0 0 45 45" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15L14 11v14L7 14l2 12z" fill="currentColor" fill-opacity="0.25"/>
      <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 17.5 1 23 0 0 0 2-1 .5-2.5 0 0 0-1.5-1.5-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/>
      <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/>
      <circle cx="6" cy="12" r="2" fill="currentColor"/>
      <circle cx="14" cy="9" r="2" fill="currentColor"/>
      <circle cx="22.5" cy="8" r="2" fill="currentColor"/>
      <circle cx="31" cy="9" r="2" fill="currentColor"/>
      <circle cx="39" cy="12" r="2" fill="currentColor"/>
    </svg>`,

  // Rook / Ruea (เรือ / Rook)
  r: `
    <svg class="piece-svg chess-svg" viewBox="0 0 45 45" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM14 29.5v-13h17v13H14z" fill="currentColor" fill-opacity="0.25"/>
      <path d="M14 16.5L11 14V9h4v4h3V9h4v4h3V9h4v4h3V9h4v5l-3 2.5H14z"/>
      <path d="M11 14h23M12 35.5h21M13 31.5h19M14 29.5h17"/>
      <path d="M9 39c6 2 21 2 27 0v-3H9v3z" fill="currentColor"/>
    </svg>`,

  // Bishop / Khon (โคน / Bishop)
  b: `
    <svg class="piece-svg chess-svg" viewBox="0 0 45 45" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2zM15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z" fill="currentColor" fill-opacity="0.25"/>
      <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z" fill="currentColor"/>
      <path d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5"/>
    </svg>`,

  // Knight / Ma (ม้า / Knight)
  n: `
    <svg class="piece-svg chess-svg" viewBox="0 0 45 45" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21" fill="currentColor" fill-opacity="0.25"/>
      <path d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0-.06 1.23-1 1-1 0-4.908-1.53-2-5 2.908-3.47 5.12-4.51 9-8 4.23-3.81 1-6 2-10 1.5 2.5 4 5 5 12z" fill="currentColor" fill-opacity="0.25"/>
      <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0z" fill="currentColor"/>
      <path d="M15 15.5c2.5.5 4 3 4 5"/>
      <path d="M9.5 39.5c6 2 20 2 26 0v-2H9.5v2z" fill="currentColor"/>
    </svg>`,

  // Pawn / Bia (เบี้ย / Pawn)
  p: `
    <svg class="piece-svg chess-svg" viewBox="0 0 45 45" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-2.78-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" fill="currentColor" fill-opacity="0.3"/>
      <path d="M11 39.5c6 2 17 2 23 0v-2H11v2z" fill="currentColor"/>
    </svg>`
};

/**
 * Returns SVG markup for a given piece representation without ANY text
 */
export function getPieceSVG(gameMode, piece) {
  if (!piece) return "";

  // 1. Checkers: regular pieces have no icon (pure minimal stone), King has crown icon
  if (gameMode.startsWith("checkers")) {
    return piece.isKing ? SVG_PIECES.crown : "";
  }

  // 2. Makruk (Thai Chess): Map piece type to standard international Staunton icons
  // 'k' -> King, 'm' / 'pm' -> Queen/Met, 's' -> Bishop/Khon, 'n' -> Knight, 'r' -> Rook, 'p' -> Pawn
  if (gameMode === "chess_makruk") {
    switch (piece.type) {
      case "k": return SVG_PIECES.k;
      case "m":
      case "pm": return SVG_PIECES.q;
      case "s": return SVG_PIECES.b;
      case "n": return SVG_PIECES.n;
      case "r": return SVG_PIECES.r;
      case "p": return SVG_PIECES.p;
      default: return "";
    }
  }

  // 3. Western Chess
  if (gameMode === "chess_western") {
    const key = (piece.type || "").toLowerCase();
    return SVG_PIECES[key] || "";
  }

  // 4. Othello / Reversi: Pure minimal discs (zero inner icons)
  if (gameMode === "othello") {
    return "";
  }

  return "";
}
