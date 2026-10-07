// i18n.js - Bilingual support (Thai / English)

export const translations = {
  th: {
    // App Header
    appTitle: "MINIMAL CHECKERS",
    appSubtitle: "หมากฮอสสากลมินิมอล ขาว-ดำ",
    soundOn: "เสียง: เปิด",
    soundOff: "เสียง: ปิด",
    langTh: "ไทย",
    langEn: "EN",
    
    // Lobby
    enterNamePrompt: "ตั้งชื่อผู้เล่นของคุณ",
    namePlaceholder: "พิมพ์ชื่อของคุณที่นี่...",
    saveName: "บันทึกชื่อ",
    anonymous: "ผู้เล่นนิรนาม",
    singleplayerSection: "เล่นกับ BOT (AI)",
    difficultyLabel: "ระดับความยาก:",
    diffEasy: "ง่าย (Easy)",
    diffMedium: "ปานกลาง (Medium)",
    diffHard: "ยาก (Hard)",
    playBotBtn: "เริ่มเล่นกับ BOT",
    
    multiplayerSection: "ห้องเล่นออนไลน์สด (6 ห้อง)",
    refreshRooms: "รีเฟรชสถานะ",
    room: "ห้อง",
    roomEmpty: "ห้องว่าง",
    roomWaiting: "รอผู้เล่นคนที่ 2",
    roomPlaying: "กำลังแข่งขัน",
    spectatorsCount: "ผู้ชม",
    joinPlayBtn: "เข้าร่วมเล่น",
    spectateBtn: "เข้าชมการแข่งขัน",
    noSlots: "ห้องเต็มแล้ว",
    
    // In-Game
    backToLobby: "← กลับสู่ล็อบบี้",
    restartBtn: "เริ่มใหม่",
    resignBtn: "ยอมแพ้",
    turnWhite: "ตาเดิน: สีขาว (White)",
    turnBlack: "ตาเดิน: สีดำ (Black)",
    turnYour: "ตาของคุณ!",
    turnOpponent: "ตาศัตรู...",
    playerWhite: "ผู้เล่นสีขาว",
    playerBlack: "ผู้เล่นสีดำ",
    botName: "BOT",
    spectatingBadge: "โหมดผู้ชม (Live)",
    timeRemaining: "เวลาที่เหลือ:",
    seconds: "วิ",
    mandatoryJumpNotice: "มีจังหวะกิน! ต้องกินตามกติกาสากล",
    
    // Promotion & Captures
    kingPromotionMsg: "กลายเป็นฮอส! (Crowned King)",
    capturedWhite: "กินหมากขาวได้:",
    capturedBlack: "กินหมากดำได้:",
    
    // Game Over Dialog
    gameOverTitle: "จบเกม!",
    winnerWhite: "ฝ่ายสีขาวชนะ!",
    winnerBlack: "ฝ่ายสีดำชนะ!",
    drawGame: "เสมอ!",
    reasonElimination: "หมากของฝ่ายตรงข้ามหมดกระดาน",
    reasonBlocked: "ฝ่ายตรงข้ามไม่มีตาเดินเหลือ",
    reasonTimeout: "หมดเวลาในตาเดิน (Timeout)",
    reasonResign: "ฝ่ายตรงข้ามขอยอมแพ้",
    playAgainBtn: "เล่นใหม่อีกครั้ง",
    lobbyReturnBtn: "กลับหน้าล็อบบี้",
    
    // Connection / Room Status
    connectingNetwork: "กำลังเชื่อมต่อระบบออนไลน์...",
    connectedNetwork: "เชื่อมต่อออนไลน์สำเร็จ",
    disconnectedNetwork: "ขาดการเชื่อมต่อ กำลังต่อใหม่...",
    waitingOpponentJoin: "กำลังรอผู้เล่นคนที่ 2 เข้าร่วมห้อง...",
    opponentConnected: "ผู้เล่นคนที่ 2 เข้าร่วมแล้ว!",
    opponentDisconnected: "ฝ่ายตรงข้ามออกจากห้อง",
    roomClosed: "ห้องถูกปิดแล้ว",
    
    // Rules
    rulesTitle: "กติกาสากลโดยย่อ",
    rule1: "กระดาน 8x8 ฝ่ายละ 12 ตัว (สีขาวเดินก่อน)",
    rule2: "เบี้ยเดินทแยงหน้า 1 ช่อง, กินทแยงหน้าข้ามตัวคู่ต่อสู้",
    rule3: "มีจังหวะกินต้องกิน และสามารถกินต่อเนื่องได้ (Multi-jump)",
    rule4: "เมื่อเบี้ยถึงแถวหลังสุดจะกลายเป็น 'ฮอส (King)' สามารถเดินและกินทแยงได้ทั้งหน้าและหลัง",
    rule5: "มีเวลานับถอยหลังต่อตา หากหมดเวลาจะถูกปรับแพ้ทันที"
  },
  en: {
    // App Header
    appTitle: "MINIMAL CHECKERS",
    appSubtitle: "Monochrome Standard Draughts",
    soundOn: "Sound: ON",
    soundOff: "Sound: OFF",
    langTh: "ไทย",
    langEn: "EN",
    
    // Lobby
    enterNamePrompt: "Enter your nickname",
    namePlaceholder: "Type your name here...",
    saveName: "Save Name",
    anonymous: "Anonymous",
    singleplayerSection: "PLAY VS BOT (AI)",
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
    spectatorsCount: "Spectators",
    joinPlayBtn: "Join Match",
    spectateBtn: "Spectate",
    noSlots: "Room Full",
    
    // In-Game
    backToLobby: "← Exit to Lobby",
    restartBtn: "Restart",
    resignBtn: "Resign",
    turnWhite: "Turn: White",
    turnBlack: "Turn: Black",
    turnYour: "Your turn!",
    turnOpponent: "Opponent's turn...",
    playerWhite: "White Player",
    playerBlack: "Black Player",
    botName: "BOT",
    spectatingBadge: "Spectator Mode (Live)",
    timeRemaining: "Time left:",
    seconds: "s",
    mandatoryJumpNotice: "Capture available! Mandatory jump rule in effect.",
    
    // Promotion & Captures
    kingPromotionMsg: "Crowned King! (Horse)",
    capturedWhite: "White captured:",
    capturedBlack: "Black captured:",
    
    // Game Over Dialog
    gameOverTitle: "GAME OVER",
    winnerWhite: "White Wins!",
    winnerBlack: "Black Wins!",
    drawGame: "Draw Game!",
    reasonElimination: "All opponent pieces eliminated",
    reasonBlocked: "Opponent has no legal moves",
    reasonTimeout: "Turn timer expired (Timeout)",
    reasonResign: "Opponent resigned",
    playAgainBtn: "Play Again",
    lobbyReturnBtn: "Back to Lobby",
    
    // Connection / Room Status
    connectingNetwork: "Connecting to realtime network...",
    connectedNetwork: "Connected to network",
    disconnectedNetwork: "Disconnected. Reconnecting...",
    waitingOpponentJoin: "Waiting for Player 2 to join...",
    opponentConnected: "Player 2 joined the match!",
    opponentDisconnected: "Opponent left the room",
    roomClosed: "Room has been closed",
    
    // Rules
    rulesTitle: "Standard Checkers Rules",
    rule1: "8x8 board, 12 pieces per player (White moves first)",
    rule2: "Men move diagonally forward 1 step, jump diagonally forward over opponents",
    rule3: "Captures are mandatory; continuous multi-jumps must be completed",
    rule4: "Reaching the opposite back rank promotes the piece to a King (Horse), moving & jumping both forward and backward",
    rule5: "Turn countdown timer enforced; reaching 0 results in timeout loss"
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

  // Update language toggle buttons active state
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
