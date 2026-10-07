// i18n.js - 100% Pure Bilingual Support (Thai / English)

export const translations = {
  th: {
    // Header
    appTitle: "MINIMAL CHECKERS",
    appSubtitle: "หมากฮอสขาว-ดำ มินิมอล",
    soundOn: "เสียง: เปิด",
    soundOff: "เสียง: ปิด",
    langTh: "ไทย",
    langEn: "EN",

    // Rule Selection
    rulesSelectorLabel: "เลือกกติกาการเล่น:",
    ruleThai: "กติกาไทย (8 ตัว • ฮอสบิน)",
    ruleInternational: "กติกาสากล (12 ตัว • ฮอส 1 ก้าว)",
    ruleThaiShort: "กติกาไทย (ฮอสบิน)",
    ruleIntShort: "กติกาสากล (12 ตัว)",
    currentRuleTitle: "กติกาปัจจุบัน:",
    rulesHeader: "สรุปกติกาการเล่น",

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

    multiplayerSection: "ห้องเล่นออนไลน์สด (6 ห้อง)",
    refreshRooms: "รีเฟรชสถานะ",
    room: "ห้อง",
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
    playersHeader: "ผู้เล่นและการแข่งขัน",
    playerWhite: "ฝ่ายสีขาว",
    playerBlack: "ฝ่ายสีดำ",
    botName: "บอท",
    turnWhite: "ตาเดิน: สีขาว",
    turnBlack: "ตาเดิน: สีดำ",
    turnYour: "ตาของคุณ!",
    turnOpponent: "ตาของคู่ต่อสู้...",
    
    timerCardTitle: "เวลานับถอยหลังต่อตา",
    timerLabel: "เวลาที่เหลือ:",
    seconds: "วินาที",
    mandatoryJumpNotice: "มีจังหวะกิน! ต้องกินตามกติกา",

    capturedHeader: "หมากที่ถูกกิน",
    capturedWhite: "หมากขาวถูกกิน:",
    capturedBlack: "หมากดำถูกกิน:",

    controlsHeader: "ปุ่มควบคุม",
    resignBtn: "ยอมแพ้",
    restartBtn: "เริ่มเกมใหม่",
    backToLobby: "← ออกสู่ล็อบบี้",

    // Rules Details
    ruleThaiDesc1: "• กระดาน 8x8 ฝ่ายละ 8 ตัว (สีขาวเดินก่อน)",
    ruleThaiDesc2: "• เบี้ยเดินและกินทแยงหน้า ก้าวละ 1 ช่อง",
    ruleThaiDesc3: "• ฮอสบิน: เดินและกินได้ยาวตลอดแนวทแยงที่ไม่มีตัวขวาง และลงช่องว่างใดก็ได้หลังตัวที่กิน",
    ruleThaiDesc4: "• มีจังหวะกินต้องกิน (Mandatory Jump) และกินต่อเนื่องได้",
    ruleThaiDesc5: "• มีเวลานับถอยหลังต่อตา หากหมดเวลาปรับแพ้ทันที",

    ruleIntDesc1: "• กระดาน 8x8 ฝ่ายละ 12 ตัว (สีขาวเดินก่อน)",
    ruleIntDesc2: "• เบี้ยเดินและกินทแยงหน้า ก้าวละ 1 ช่อง",
    ruleIntDesc3: "• ฮอส: เดินและกินทแยงได้ทั้งหน้าและหลัง ก้าวละ 1 ช่อง",
    ruleIntDesc4: "• มีจังหวะกินต้องกิน (Mandatory Jump) และกินต่อเนื่องได้",
    ruleIntDesc5: "• มีเวลานับถอยหลังต่อตา หากหมดเวลาปรับแพ้ทันที",

    // Game Over & Dialogs
    gameOverTitle: "จบเกม!",
    winnerWhite: "ฝ่ายสีขาวชนะ!",
    winnerBlack: "ฝ่ายสีดำชนะ!",
    drawGame: "เสมอ!",
    reasonElimination: "หมากฝ่ายตรงข้ามหมดกระดาน",
    reasonBlocked: "ฝ่ายตรงข้ามไม่มีตาเดินเหลือ",
    reasonTimeout: "หมดเวลาในตาเดิน",
    reasonResign: "ฝ่ายตรงข้ามขอยอมแพ้",
    opponentDisconnected: "ฝ่ายตรงข้ามออกจากห้อง",
    playAgainBtn: "เล่นใหม่อีกครั้ง",
    lobbyReturnBtn: "กลับหน้าล็อบบี้",
    waitingOpponentJoin: "กำลังรอผู้เล่นคนที่ 2 เข้าร่วมห้อง..."
  },
  en: {
    // Header
    appTitle: "MINIMAL CHECKERS",
    appSubtitle: "Monochrome Checkers",
    soundOn: "Sound: ON",
    soundOff: "Sound: OFF",
    langTh: "ไทย",
    langEn: "EN",

    // Rule Selection
    rulesSelectorLabel: "Select Rules Mode:",
    ruleThai: "Thai Rules (8 pieces • Flying King)",
    ruleInternational: "International (12 pieces • 1-step King)",
    ruleThaiShort: "Thai Rules (Flying King)",
    ruleIntShort: "International (12 pieces)",
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

    multiplayerSection: "ONLINE LIVE ROOMS (6 ROOMS)",
    refreshRooms: "Refresh Rooms",
    room: "Room",
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
    playersHeader: "Players & Match",
    playerWhite: "White Player",
    playerBlack: "Black Player",
    botName: "BOT",
    turnWhite: "Turn: White",
    turnBlack: "Turn: Black",
    turnYour: "Your turn!",
    turnOpponent: "Opponent's turn...",

    timerCardTitle: "Turn Countdown",
    timerLabel: "Time left:",
    seconds: "sec",
    mandatoryJumpNotice: "Capture available! Mandatory jump in effect",

    capturedHeader: "Captured Pieces",
    capturedWhite: "White captured:",
    capturedBlack: "Black captured:",

    controlsHeader: "Game Controls",
    resignBtn: "Resign",
    restartBtn: "Restart",
    backToLobby: "← Exit to Lobby",

    // Rules Details
    ruleThaiDesc1: "• 8x8 board, 8 pieces each (White moves first)",
    ruleThaiDesc2: "• Men move & capture forward 1 diagonal step",
    ruleThaiDesc3: "• Flying King: moves & captures any distance along diagonals, landing anywhere behind jumped piece",
    ruleThaiDesc4: "• Captures are mandatory with continuous multi-jumps",
    ruleThaiDesc5: "• Turn countdown enforced; expires to forfeit loss",

    ruleIntDesc1: "• 8x8 board, 12 pieces each (White moves first)",
    ruleIntDesc2: "• Men move & capture forward 1 diagonal step",
    ruleIntDesc3: "• King: moves & captures 1 step forward and backward",
    ruleIntDesc4: "• Captures are mandatory with continuous multi-jumps",
    ruleIntDesc5: "• Turn countdown enforced; expires to forfeit loss",

    // Game Over & Dialogs
    gameOverTitle: "GAME OVER",
    winnerWhite: "White Wins!",
    winnerBlack: "Black Wins!",
    drawGame: "Draw Game!",
    reasonElimination: "All opponent pieces eliminated",
    reasonBlocked: "Opponent has no legal moves",
    reasonTimeout: "Turn timer expired",
    reasonResign: "Opponent resigned",
    opponentDisconnected: "Opponent left the room",
    playAgainBtn: "Play Again",
    lobbyReturnBtn: "Back to Lobby",
    waitingOpponentJoin: "Waiting for Player 2 to join..."
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
