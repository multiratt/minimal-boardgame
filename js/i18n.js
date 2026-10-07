// i18n.js - 100% Pure Bilingual Support (Thai / English)
// Supports: Thai Checkers, International Checkers, Thai Chess (Makruk), Western Chess

export const translations = {
  th: {
    // Header
    appTitle: "MINIMAL BOARD GAMES",
    appSubtitle: "หมากฮอส & หมากรุก มินิมอลขาว-ดำ",
    soundOn: "เสียง: เปิด",
    soundOff: "เสียง: ปิด",
    langTh: "ไทย",
    langEn: "EN",

    // Game Category & Variant Selection
    gameCategoryLabel: "เลือกเกมที่ต้องการเล่น:",
    gameCheckersTab: "หมากฮอส",
    gameChessTab: "หมากรุก",
    rulesSelectorLabel: "เลือกกติกาการเล่น:",
    
    // Checkers Variants
    ruleThai: "กติกาไทย (8 ตัว • ฮอสบิน)",
    ruleInternational: "กติกาสากล (12 ตัว • ฮอส 1 ก้าว)",
    ruleThaiShort: "หมากฮอสไทย (ฮอสบิน)",
    ruleIntShort: "หมากฮอสสากล (12 ตัว)",

    // Chess Variants
    ruleMakruk: "หมากรุกไทย (ขุน, เม็ด, โคน, ม้า, เรือ, เบี้ย)",
    ruleWesternChess: "หมากรุกสากล (King, Queen, Rook, Bishop, Knight, Pawn)",
    ruleMakrukShort: "หมากรุกไทย",
    ruleWesternShort: "หมากรุกสากล",

    currentRuleTitle: "กติกาปัจจุบัน:",
    rulesHeader: "กติกาการเล่น",

    // Lobby
    enterNamePrompt: "ตั้งชื่อผู้เล่นของคุณ",
    namePlaceholder: "พิมพ์ชื่อของคุณที่นี่...",
    saveName: "บันทึกชื่อ",
    anonymous: "ผู้เล่นนิรนาม",
    defaultPlayerName: "ผู้เล่น",
    singleplayerSection: "เล่นกับบอท (BOT)",
    difficultyLabel: "ระดับความยาก:",
    diffEasy: "ง่าย",
    diffMedium: "ปานกลาง",
    diffHard: "ยาก",
    playBotBtn: "เริ่มเล่นกับบอท",

    multiplayerSection: "ห้องเล่นออนไลน์สด (4 ห้อง)",
    refreshRooms: "รีเฟรชสถานะ",
    room: "ห้อง",
    roomModeOpen: "รอเลือกกติกา (ตามผู้สร้าง)",
    roomEmpty: "ห้องว่าง",
    roomWaiting: "รอผู้เล่นคนที่ 2",
    roomPlaying: "กำลังแข่งขัน",
    spectatorsCount: "คน",
    spectatorLabel: "ผู้ชม:",
    joinPlayBtn: "เข้าร่วมเล่น",
    spectateBtn: "เข้าชมสด",
    noSlots: "ห้องเต็มแล้ว",

    // Game Arena Sidebar
    matchVsBot: "แข่งกับบอท",
    spectatingBadge: "โหมดผู้ชมสด",
    playersHeader: "ผู้เล่น & ตาเดิน",
    playerWhite: "ฝ่ายสีขาว",
    playerBlack: "ฝ่ายสีดำ",
    botName: "บอท",
    turnWhite: "ตาเดิน: สีขาว",
    turnBlack: "ตาเดิน: สีดำ",
    turnYour: "ตาของคุณ!",
    turnOpponent: "ตาของคู่ต่อสู้...",
    
    timerCardTitle: "เวลานับถอยหลังต่อตา",
    timerLabel: "เวลาที่เหลือ:",
    seconds: "วิ",
    mandatoryJumpNotice: "มีจังหวะกิน! ต้องกินตามกติกา",
    checkNotice: "รุก! (Check)",

    capturedHeader: "หมากที่ถูกกิน",
    capturedWhite: "หมากขาวถูกกิน:",
    capturedBlack: "หมากดำถูกกิน:",

    controlsHeader: "ปุ่มควบคุม",
    resignBtn: "ยอมแพ้",
    pauseBtn: "⏸️ พักเกม",
    resumeBtn: "▶️ เล่นต่อ",
    backToLobby: "← กลับสู่ล็อบบี้",

    // Rules Details: Checkers
    ruleThaiDesc1: "• กระดาน 8x8 ฝ่ายละ 8 ตัว (ขาวเริ่มก่อน)",
    ruleThaiDesc2: "• เบี้ยเดินและกินทแยงหน้า ก้าวละ 1 ช่อง",
    ruleThaiDesc3: "• ฮอสบิน: เดินและบินกินได้ยาวตลอดแนวทแยงที่ไม่มีตัวขวาง",
    ruleThaiDesc4: "• มีจังหวะกินต้องกิน (Mandatory Jump)",
    ruleThaiDesc5: "• นับถอยหลังต่อตา หากหมดเวลาปรับแพ้ทันที",

    ruleIntDesc1: "• กระดาน 8x8 ฝ่ายละ 12 ตัว (ขาวเริ่มก่อน)",
    ruleIntDesc2: "• เบี้ยเดินและกินทแยงหน้า ก้าวละ 1 ช่อง",
    ruleIntDesc3: "• ฮอส: เดินและกินทแยงได้ทั้งหน้าและหลัง ก้าวละ 1 ช่อง",
    ruleIntDesc4: "• มีจังหวะกินต้องกิน และกินต่อเนื่องได้",
    ruleIntDesc5: "• นับถอยหลังต่อตา หากหมดเวลาปรับแพ้ทันที",

    // Rules Details: Makruk (Thai Chess)
    ruleMakrukDesc1: "• ฝ่ายละ 16 ตัว: ขุน, เม็ด, โคน(2), ม้า(2), เรือ(2), เบี้ย(8)",
    ruleMakrukDesc2: "• ขุนเดิน 8 ทิศ, เม็ดเดินทแยง 1 ช่อง, โคนเดินหน้า 1 หรือทแยง 1",
    ruleMakrukDesc3: "• ม้าเดินรูป L, เรือเดินตรงยาว, เบี้ยเดินหน้า กินทแยงหน้า",
    ruleMakrukDesc4: "• เบี้ยถึงแถว 6 เลื่อนขั้นเป็นเบี้ยหงาย (เดินเหมือนเม็ด)",
    ruleMakrukDesc5: "• ชนะเมื่อรุกฆาตขุน หรือฝ่ายตรงข้ามหมดเวลา",

    // Rules Details: Western Chess
    ruleWesternDesc1: "• ฝ่ายละ 16 ตัว: King, Queen, Rook(2), Bishop(2), Knight(2), Pawn(8)",
    ruleWesternDesc2: "• Queen เดินได้ 8 ทิศไม่จำกัด, Rook เดินตรง, Bishop เดินทแยง",
    ruleWesternDesc3: "• Knight เดินรูป L กระโดดข้ามตัวอื่นได้, King เดิน 1 ช่อง",
    ruleWesternDesc4: "• Pawn เดินหน้า 1 ช่อง (ตาแรกเดินได้ 2) กินทแยงหน้า เลื่อนขั้นแถวสุดท้าย",
    ruleWesternDesc5: "• ชนะเมื่อรุกฆาต (Checkmate) หรือฝ่ายตรงข้ามหมดเวลา",

    // Stalling / Repetition Endgame Rule
    endgameRuleDesc: "• กติกาเดินหนี: หากไม่มีการกินติดต่อกัน 10 ตาเดิน จะเริ่มนับถอยหลังอีก 20 ตาเดิน หากครบแล้วยังไม่จบจะตัดสินให้ฝ่ายที่มีหมากมากกว่าชนะทันที",
    endgameCountdownBadge: "⚡ กติกาเดินหนี: บังคับจบเกมในอีก {n} ตาเดิน (ใครหมากเยอะกว่าชนะ)",

    // Game Over & Dialogs
    gameOverTitle: "จบเกม!",
    winnerWhite: "ฝ่ายสีขาวชนะ!",
    winnerBlack: "ฝ่ายสีดำชนะ!",
    drawGame: "เสมอ!",
    reasonElimination: "หมากฝ่ายตรงข้ามหมดกระดาน",
    reasonBlocked: "ฝ่ายตรงข้ามไม่มีตาเดินเหลือ",
    reasonCheckmate: "รุกฆาต! (Checkmate)",
    reasonStalemate: "อับ! เสมอกัน (Stalemate)",
    reasonTimeout: "หมดเวลาในตาเดิน",
    reasonResign: "ฝ่ายตรงข้ามขอยอมแพ้",
    reasonTurnLimitWhite: "หมดกำหนดตาเดิน (ฝ่ายสีขาวมีหมากมากกว่า ชนะ!)",
    reasonTurnLimitBlack: "หมดกำหนดตาเดิน (ฝ่ายสีดำมีหมากมากกว่า ชนะ!)",
    reasonTurnLimitDraw: "หมดกำหนดตาเดิน (ทั้งสองฝ่ายมีหมากเท่ากัน เสมอ!)",
    reasonDisconnectTimeout: "ฝ่ายตรงข้ามขาดการเชื่อมต่อนานเกิน 60 วินาที ชนะ!",
    opponentDisconnectCountdown: "⚠️ คู่ต่อสู้ขาดการเชื่อมต่อ... จะชนะในอีก {n} วินาที",
    opponentReconnectedMsg: "คู่ต่อสู้กลับมาเชื่อมต่อแล้ว!",
    opponentDisconnected: "ฝ่ายตรงข้ามออกจากห้อง",
    playAgainBtn: "เล่นใหม่อีกครั้ง",
    lobbyReturnBtn: "กลับหน้าล็อบบี้",
    waitingOpponentJoin: "กำลังรอผู้เล่นคนที่ 2 เข้าร่วมห้อง...",

    // Match Statistics Modal
    matchStatsTitle: "📊 สรุปสถิติการแข่งขัน",
    statTotalTime: "เวลาทั้งเกม",
    statAvgTime: "เฉลี่ยต่อตา",
    statTotalMoves: "เดินทั้งหมด",
    statMovesUnit: "ตา",
    statCaptures: "หมากที่ถูกกิน",
    statPromotions: "เลื่อนขั้น/หงาย",
    statPromotionsUnit: "ครั้ง",
    statResultDetail: "ผลการตัดสิน",
    statWhiteShort: "ขาว",
    statBlackShort: "ดำ",
    minuteShort: "นาที",
    secondShort: "วิ",

    // Pause Feature
    pauseModalTitle: "⏸️ พักเกมชั่วคราว",
    pauseModalDesc: "เกมหยุดชั่วคราวเป็นเวลา 3 นาที",
    pauseRemainingLabel: "เวลาพักที่เหลือ",
    pauseRequestTitle: "⏸️ คำขอพักเกม",
    pauseRequestText: "{name} ขอพักเกม 3 นาที ยินยอมหรือไม่?",
    pauseWaitingTitle: "⏳ กำลังรอการยินยอม",
    pauseWaitingDesc: "ส่งคำขอพักเกม 3 นาทีแล้ว รอคู่ต่อสู้ตอบรับ...",
    acceptBtn: "ยินยอม",
    declineBtn: "ปฏิเสธ",
    cancelBtn: "ยกเลิกคำขอ",
    pauseAutoResumeNotice: "หมดเวลาพัก 3 นาที เริ่มเล่นต่ออัตโนมัติ!",
    pauseDeclinedNotice: "คู่ต่อสู้ปฏิเสธการขอพักเกม",

    // You indicator & Confirm Exit
    youLabel: "คุณ",
    confirmExitTitle: "⚠️ ออกจากห้องเล่นเกม",
    confirmExitDesc: "การออกจากห้องระหว่างแข่งขัน จะถือว่าคุณยอมแพ้ในเกมนี้",
    confirmExitForfeitBtn: "ยอมแพ้และกลับล็อบบี้",
    cancelExitBtn: "เล่นต่อ"
  },
  en: {
    // Header
    appTitle: "MINIMAL BOARD GAMES",
    appSubtitle: "Monochrome Checkers & Chess",
    soundOn: "Sound: ON",
    soundOff: "Sound: OFF",
    langTh: "ไทย",
    langEn: "EN",

    // Game Category & Variant Selection
    gameCategoryLabel: "Select Game Type:",
    gameCheckersTab: "Checkers",
    gameChessTab: "Chess",
    rulesSelectorLabel: "Select Rules Mode:",

    // Checkers Variants
    ruleThai: "Thai Checkers (8 pieces • Flying King)",
    ruleInternational: "International (12 pieces • 1-step King)",
    ruleThaiShort: "Thai Checkers",
    ruleIntShort: "International Checkers",

    // Chess Variants
    ruleMakruk: "Thai Chess / Makruk (Khon, Met, Ma, Ruea, Bia)",
    ruleWesternChess: "Western Chess (Standard International)",
    ruleMakrukShort: "Thai Chess (Makruk)",
    ruleWesternShort: "Western Chess",

    currentRuleTitle: "Current Rules:",
    rulesHeader: "Rules Overview",

    // Lobby
    enterNamePrompt: "Enter your nickname",
    namePlaceholder: "Type your name here...",
    saveName: "Save Name",
    anonymous: "Anonymous",
    defaultPlayerName: "Player",
    singleplayerSection: "PLAY VS BOT",
    difficultyLabel: "Difficulty:",
    diffEasy: "Easy",
    diffMedium: "Medium",
    diffHard: "Hard",
    playBotBtn: "Start Match vs BOT",

    multiplayerSection: "ONLINE LIVE ROOMS (4 ROOMS)",
    refreshRooms: "Refresh Rooms",
    room: "Room",
    roomModeOpen: "Open (Host chooses)",
    roomEmpty: "Empty",
    roomWaiting: "Waiting for Player 2",
    roomPlaying: "In Progress",
    spectatorsCount: "spectators",
    spectatorLabel: "Spectators:",
    joinPlayBtn: "Join Match",
    spectateBtn: "Spectate",
    noSlots: "Room Full",

    // Game Arena Sidebar
    matchVsBot: "Match vs BOT",
    spectatingBadge: "Spectator Mode (Live)",
    playersHeader: "Players & Turn",
    playerWhite: "White Player",
    playerBlack: "Black Player",
    botName: "BOT",
    turnWhite: "Turn: White",
    turnBlack: "Turn: Black",
    turnYour: "Your turn!",
    turnOpponent: "Opponent's turn...",

    timerCardTitle: "Turn Countdown",
    timerLabel: "Time left:",
    seconds: "s",
    mandatoryJumpNotice: "Capture available! Mandatory jump in effect",
    checkNotice: "Check!",

    capturedHeader: "Captured Pieces",
    capturedWhite: "White captured:",
    capturedBlack: "Black captured:",

    controlsHeader: "Game Controls",
    resignBtn: "Resign",
    pauseBtn: "⏸️ Pause",
    resumeBtn: "▶️ Resume",
    backToLobby: "← Exit to Lobby",

    // Rules Details: Checkers
    ruleThaiDesc1: "• 8x8 board, 8 pieces each (White moves first)",
    ruleThaiDesc2: "• Men move & capture forward 1 diagonal step",
    ruleThaiDesc3: "• Flying King: moves & captures any distance along diagonals",
    ruleThaiDesc4: "• Captures are mandatory with multi-jumps",
    ruleThaiDesc5: "• Turn timer enforced; expires to forfeit loss",

    ruleIntDesc1: "• 8x8 board, 12 pieces each (White moves first)",
    ruleIntDesc2: "• Men move & capture forward 1 diagonal step",
    ruleIntDesc3: "• King: moves & captures 1 step forward and backward",
    ruleIntDesc4: "• Captures are mandatory with multi-jumps",
    ruleIntDesc5: "• Turn timer enforced; expires to forfeit loss",

    // Rules Details: Makruk (Thai Chess)
    ruleMakrukDesc1: "• 16 pieces each: King, Met, Khon(2), Knight(2), Rook(2), Bia(8)",
    ruleMakrukDesc2: "• King: 8 dirs, Met: 1 diagonal, Khon: 1 forward or 1 diagonal",
    ruleMakrukDesc3: "• Knight: L-shape, Rook: straight rays, Bia: moves fwd, takes diag",
    ruleMakrukDesc4: "• Bia promotes to Bia-gai (like Met) at rank 6",
    ruleMakrukDesc5: "• Win by checkmate or opponent timeout",

    // Rules Details: Western Chess
    ruleWesternDesc1: "• 16 pieces each: King, Queen, Rook(2), Bishop(2), Knight(2), Pawn(8)",
    ruleWesternDesc2: "• Queen: 8 directions unlimited, Rook: orthogonals, Bishop: diagonals",
    ruleWesternDesc3: "• Knight: L-shape leaps, King: 1 step any direction",
    ruleWesternDesc4: "• Pawn: forward 1 (2 on 1st move), captures diag, promotes at back rank",
    ruleWesternDesc5: "• Win by checkmate or opponent timeout",

    // Stalling / Repetition Endgame Rule
    endgameRuleDesc: "• Stalling Rule: If 10 consecutive turns pass without any capture, a 20-turn countdown begins. If game doesn't end, player with most pieces wins.",
    endgameCountdownBadge: "⚡ Stalling Rule: Match ends in {n} moves (Most pieces wins)",

    // Game Over & Dialogs
    gameOverTitle: "GAME OVER",
    winnerWhite: "White Wins!",
    winnerBlack: "Black Wins!",
    drawGame: "Draw Game!",
    reasonElimination: "All opponent pieces eliminated",
    reasonBlocked: "Opponent has no legal moves",
    reasonCheckmate: "Checkmate!",
    reasonStalemate: "Stalemate (Draw)",
    reasonTimeout: "Turn timer expired",
    reasonResign: "Opponent resigned",
    reasonTurnLimitWhite: "Turn limit reached (White has more pieces, Wins!)",
    reasonTurnLimitBlack: "Turn limit reached (Black has more pieces, Wins!)",
    reasonTurnLimitDraw: "Turn limit reached (Equal pieces, Draw!)",
    reasonDisconnectTimeout: "Opponent disconnected for over 60s, Win!",
    opponentDisconnectCountdown: "⚠️ Opponent disconnected... Win in {n}s",
    opponentReconnectedMsg: "Opponent reconnected!",
    opponentDisconnected: "Opponent left the room",
    playAgainBtn: "Play Again",
    lobbyReturnBtn: "Back to Lobby",
    waitingOpponentJoin: "Waiting for Player 2 to join...",

    // Match Statistics Modal
    matchStatsTitle: "📊 Match Statistics",
    statTotalTime: "Total Match Time",
    statAvgTime: "Avg Time / Turn",
    statTotalMoves: "Total Moves",
    statMovesUnit: "moves",
    statCaptures: "Captured Pieces",
    statPromotions: "Promotions",
    statPromotionsUnit: "times",
    statResultDetail: "Match Result",
    statWhiteShort: "White",
    statBlackShort: "Black",
    minuteShort: "m",
    secondShort: "s",

    // Pause Feature
    pauseModalTitle: "⏸️ Game Paused",
    pauseModalDesc: "Game is temporarily paused for 3 minutes",
    pauseRemainingLabel: "Pause Time Remaining",
    pauseRequestTitle: "⏸️ Pause Request",
    pauseRequestText: "{name} requested a 3-minute pause. Do you accept?",
    pauseWaitingTitle: "⏳ Awaiting Consent",
    pauseWaitingDesc: "Pause request sent. Waiting for opponent...",
    acceptBtn: "Accept",
    declineBtn: "Decline",
    cancelBtn: "Cancel",
    pauseAutoResumeNotice: "3-minute pause expired. Resuming game automatically!",
    pauseDeclinedNotice: "Opponent declined pause request",

    // You indicator & Confirm Exit
    youLabel: "You",
    confirmExitTitle: "⚠️ Exit to Lobby",
    confirmExitDesc: "Exiting during an active match will count as a forfeit (Resign).",
    confirmExitForfeitBtn: "Resign & Exit",
    cancelExitBtn: "Stay & Play"
  }
};

let currentLang = localStorage.getItem("checkers_lang") || "th";

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem("checkers_lang", lang);
    updateDOMTranslations();
  }
}

export function t(key) {
  return translations[currentLang][key] || key;
}

export function updateDOMTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (translations[currentLang][key]) {
      el.placeholder = translations[currentLang][key];
    }
  });

  document.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if (translations[currentLang][key]) {
      el.title = translations[currentLang][key];
    }
  });

  const btnTh = document.getElementById("lang-th-btn");
  const btnEn = document.getElementById("lang-en-btn");
  if (btnTh && btnEn) {
    if (currentLang === "th") {
      btnTh.classList.add("active");
      btnEn.classList.remove("active");
    } else {
      btnTh.classList.remove("active");
      btnEn.classList.add("active");
    }
  }
}
