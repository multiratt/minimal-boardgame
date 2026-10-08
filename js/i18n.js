// i18n.js - 100% Pure Bilingual Support (Thai / English)
// Supports: Thai Checkers, International Checkers, Thai Chess (Makruk), Western Chess

export const translations = {
  th: {
    // Header
    appTitle: "มินิมอลบอร์ดเกม",
    appSubtitle: "หมากฮอส • หมากรุก • โอเทลโล่ • UNO",
    soundOn: "เสียง: เปิด",
    soundOff: "เสียง: ปิด",
    langTh: "ไทย",
    langEn: "EN",

    // Game Category & Variant Selection
    gameCategoryLabel: "เลือกเกมที่ต้องการเล่น:",
    gameCheckersTab: "หมากฮอส",
    gameChessTab: "หมากรุก",
    gameOthelloTab: "โอเทลโล่",
    gameUnoTab: "UNO",
    rulesSelectorLabel: "เลือกกติกาการเล่น:",
    
    // Checkers Variants
    ruleThai: "กติกาไทย (8 ตัว • ฮอสบิน)",
    ruleInternational: "กติกาสากล (12 ตัว • ฮอส 1 ก้าว)",
    ruleThaiShort: "หมากฮอสไทย (ฮอสบิน)",
    ruleIntShort: "หมากฮอสสากล (12 ตัว)",

    // Chess Variants
    ruleMakruk: "หมากรุกไทย (ขุน, เม็ด, โคน, ม้า, เรือ, เบี้ย)",
    ruleWesternChess: "หมากรุกสากล (คิง, ควีน, เรือ, บิชอป, ม้า, เบี้ย)",
    ruleMakrukShort: "หมากรุกไทย",
    ruleWesternShort: "หมากรุกสากล",

    // Othello Variants
    ruleOthello: "กติกาสากล (8x8 • พลิกหนีบหมาก)",
    ruleOthelloShort: "โอเทลโล่",
    ruleOthelloDesc: "วางหมากประกบหัวท้ายเพื่อพลิกสี ฝ่ายมีหมากมากที่สุดชนะ",

    // UNO Variants
    ruleUnoStandard: "กติกามาตรฐาน (โดน +2 / +4 ต้องจั่ว)",
    ruleUnoStandardDesc: "กติกามาตรฐานสากล โดน +2 หรือ +4 ต้องจั่วทันที ห้ามลงทบ",
    ruleUnoStacking: "กติกาลงทบแต้ม (+2 / +4 ซ้อนทบได้)",
    ruleUnoStackingDesc: "สามารถลง +2 หรือ +4 ซ้อนทบเพื่อส่งต่อยอดการจั่วให้คนถัดไปได้",
    ruleUnoShort: "UNO",
    ruleUnoStandardBadge: "UNO (มาตรฐาน)",
    ruleUnoStackingBadge: "UNO (ทบแต้ม)",

    currentRuleTitle: "กติกาปัจจุบัน:",
    rulesHeader: "กติกาการเล่น",

    // Lobby
    enterNamePrompt: "ตั้งชื่อผู้เล่นของคุณ",
    namePlaceholder: "พิมพ์ชื่อของคุณที่นี่...",
    saveName: "บันทึกชื่อ",
    anonymous: "ผู้เล่นนิรนาม",
    defaultPlayerName: "ผู้เล่น",
    singleplayerSection: "เล่นกับบอท",
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
    unoRoomWaiting: "รอผู้เล่น",
    roomPlaying: "กำลังแข่งขัน",
    spectatorsCount: "คน",
    spectatorLabel: "ผู้ชม:",
    joinPlayBtn: "เข้าร่วมเล่น",
    spectateBtn: "เข้าชมสด",
    noSlots: "ห้องเต็มแล้ว",

    // Network Diagnostic Status & Warnings
    netStatusConnecting: "กำลังตรวจสอบเครือข่าย...",
    netStatusConnected: "เชื่อมต่อแล้ว",
    netStatusRestricted: "เครือข่ายไม่รองรับ",
    netStatusOffline: "ออฟไลน์",
    netWarningTitle: "⚠️ เครือข่ายนี้ไม่รองรับระบบห้องออนไลน์",
    netWarningDesc: "Wi-Fi หรือเครือข่ายที่คุณใช้งานอยู่ (เช่น เครือข่ายองค์กรหรือสถานศึกษา) มีการบล็อกพอร์ต WebSockets ภายนอก ทำให้ไม่สามารถเชื่อมต่อห้องออนไลน์ได้",
    netWarningHint: "💡 คำแนะนำ: ลองเปลี่ยนไปใช้เน็ตมือถือ (4G/5G Hotspot) หรือเล่นโหมดกับบอทแทนในระหว่างนี้",
    netWarningOfflineTitle: "⚠️ ไม่มีการเชื่อมต่ออินเทอร์เน็ต",
    netWarningOfflineDesc: "อุปกรณ์ของคุณไม่ได้เชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบสัญญาณเน็ต",
    netRetryBtn: "🔄 ทดสอบใหม่",
    netBlockedAlert: "เครือข่ายของคุณบล็อกพอร์ต WebSockets ไม่สามารถเข้าห้องออนไลน์ได้ กรุณาลองใช้เน็ตมือถือ",

    // Game Arena Sidebar
    matchVsBot: "แข่งกับบอท",
    spectatingBadge: "โหมดผู้ชมสด",
    playersHeader: "ผู้เล่น & ตาเดิน",
    playerWhite: "ฝ่ายสีขาว",
    playerBlack: "ฝ่ายสีดำ",
    botName: "บอท",
    turnWhite: "ตาเดิน: สีขาว",
    turnBlack: "ตาเดิน: สีดำ",
    turnYour: "ตาของคุณ",
    turnOpponent: "ตาของคู่ต่อสู้",
    turnStatusPrefix: "ตาเดิน:",
    
    timerCardTitle: "เวลานับถอยหลังต่อตา",
    timerLabel: "เวลาที่เหลือ:",
    seconds: "วิ",
    mandatoryJumpNotice: "มีจังหวะกิน! ต้องกินตามกติกา",
    checkNotice: "รุก!",

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
    ruleThaiDesc4: "• มีจังหวะกินต้องกิน (บังคับกิน)",
    ruleThaiDesc5: "• นับถอยหลังต่อตา หากหมดเวลาปรับแพ้ทันที",

    ruleIntDesc1: "• กระดาน 8x8 ฝ่ายละ 12 ตัว (ขาวเริ่มก่อน)",
    ruleIntDesc2: "• เบี้ยเดินและกินทแยงหน้า ก้าวละ 1 ช่อง",
    ruleIntDesc3: "• ฮอส: เดินและกินทแยงได้ทั้งหน้าและหลัง ก้าวละ 1 ช่อง",
    ruleIntDesc4: "• มีจังหวะกินต้องกิน และกินต่อเนื่องได้",
    ruleIntDesc5: "• นับถอยหลังต่อตา หากหมดเวลาปรับแพ้ทันที",

    // Rules Details: Makruk (Thai Chess)
    ruleMakrukDesc1: "• ฝ่ายละ 16 ตัว: ขุน, เม็ด, โคน(2), ม้า(2), เรือ(2), เบี้ย(8)",
    ruleMakrukDesc2: "• ขุนเดิน 8 ทิศ, เม็ดเดินทแยง 1 ช่อง, โคนเดินหน้า 1 หรือทแยง 1",
    ruleMakrukDesc3: "• ม้าเดินรูปตัว L, เรือเดินตรงยาว, เบี้ยเดินหน้า กินทแยงหน้า",
    ruleMakrukDesc4: "• เบี้ยถึงแถว 6 เลื่อนขั้นเป็นเบี้ยหงาย (เดินเหมือนเม็ด)",
    ruleMakrukDesc5: "• ชนะเมื่อรุกฆาต หรือฝ่ายตรงข้ามหมดเวลา",

    // Rules Details: Western Chess
    ruleWesternDesc1: "• ฝ่ายละ 16 ตัว: คิง, ควีน, เรือ(2), บิชอป(2), ม้า(2), เบี้ย(8)",
    ruleWesternDesc2: "• ควีนเดินได้ 8 ทิศไม่จำกัด, เรือเดินตรง, บิชอปเดินทแยง",
    ruleWesternDesc3: "• ม้าเดินรูปตัว L กระโดดข้ามตัวอื่นได้, คิงเดิน 1 ช่อง",
    ruleWesternDesc4: "• เบี้ยเดินหน้า 1 ช่อง (ตาแรกเดินได้ 2) กินทแยงหน้า เลื่อนขั้นแถวสุดท้าย",
    ruleWesternDesc5: "• ชนะเมื่อรุกฆาต หรือฝ่ายตรงข้ามหมดเวลา",

    // Rules Details: Othello (Reversi)
    ruleOthelloDesc1: "• กระดาน 8x8 เริ่มต้น 4 ตัวตรงกลาง (ฝ่ายสีดำเริ่มก่อน)",
    ruleOthelloDesc2: "• วางหมากในช่องว่างที่สามารถประกบหมากฝ่ายตรงข้ามในแนวตรงหรือแนวทแยง",
    ruleOthelloDesc3: "• หมากฝ่ายตรงข้ามที่ถูกประกบทั้งหมดจะถูกพลิกกลับเป็นสีของเรา",
    ruleOthelloDesc4: "• หากไม่มีตาเดินที่พลิกหมากได้ จะถูกข้ามตาเดินไปยังฝ่ายตรงข้ามอัตโนมัติ",
    ruleOthelloDesc5: "• จบเกมเมื่อกระดานเต็มหรือทั้งสองฝ่ายไม่มีตาเดิน ฝ่ายที่มีหมากมากกว่าชนะ",
    othelloPassNotice: "ไม่มีตาเดิน! ข้ามตาเดินไปยังฝ่ายตรงข้าม",

    // Rules Details: UNO
    ruleUnoDesc1: "• แจกไพ่คนละ 7 ใบ ไพ่รวม 108 ใบ (◯ ◻ △ ◇ และ ★)",
    ruleUnoDesc2: "• ลงไพ่ที่สัญลักษณ์หรือตัวเลขตรงกับไพ่ใบบนสุดของกองทิ้ง",
    ruleUnoDesc3: "• ไพ่พิเศษ: ข้ามตา(🚫), กลับทิศ(🔄), จั่วสอง(+2), เปลี่ยนสัญลักษณ์(★)",
    ruleUnoDesc4: "• เมื่อเหลือไพ่ 1 ใบ ต้องกดปุ่ม 'UNO!' ก่อนเริ่มตาถัดไป",
    ruleUnoDesc5: "• ผู้ที่ไพ่หมดมือคนแรกเป็นผู้ชนะ!",
    botCountLabel: "จำนวนบอท:",
    unoBotCountFmt: "{n} บอท (รวม {total} คน)",
    unoWaitingTitle: "ห้องพักคอย UNO",
    unoWaitingSub: "ผู้เล่นในห้อง (สูงสุด 8 คน)",
    unoStartBtn: "🎮 เริ่มเกม",
    unoAddBotBtn: "+ เพิ่มบอท",
    unoRemoveBotBtn: "- ลดบอท",
    unoWaitingHostMsg: "กำลังรอหัวหน้าห้องกดเริ่มเกม...",
    unoShoutBtn: "⚡ UNO!",
    unoShoutedMsg: "{name} ร้อง UNO!",
    unoCaughtPenalty: "{name} ลืมร้อง UNO! โดนปรับจั่ว 2 ใบ",
    chooseNextSuit: "เลือกสัญลักษณ์ถัดไป:",
    circleSuit: "◯ วงกลม",
    squareSuit: "◻ สี่เหลี่ยม",
    triangleSuit: "△ สามเหลี่ยม",
    diamondSuit: "◇ ข้าวหลามตัด",
    unoDrawBtn: "จั่วไพ่",
    unoPassBtn: "ผ่าน",
    pileCountText: "กองจั่ว: {n} ใบ",
    unoDrawPileLabel: "กองจั่ว",
    unoDiscardPileLabel: "กองทิ้ง",
    unoDrawPileTitle: "จั่วไพ่",
    unoDirectionTitle: "ทิศทางการเล่น",
    unoMinPlayersAlert: "ต้องการผู้เล่นอย่างน้อย 2 คน (กด + เพิ่มบอท ได้)",

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
    reasonCheckmate: "รุกฆาต!",
    reasonStalemate: "อับ! เสมอกัน",
    reasonTimeout: "หมดเวลาในตาเดิน",
    reasonResign: "ฝ่ายตรงข้ามขอยอมแพ้",
    reasonDiscsCount: "นับจำนวนหมากเมื่อจบเกม (ฝ่ายมีหมากมากกว่า ชนะ!)",
    reasonTurnLimitWhite: "หมดกำหนดตาเดิน (ฝ่ายสีขาวมีหมากมากกว่า ชนะ!)",
    reasonTurnLimitBlack: "หมดกำหนดตาเดิน (ฝ่ายสีดำมีหมากมากกว่า ชนะ!)",
    reasonTurnLimitDraw: "หมดกำหนดตาเดิน (ทั้งสองฝ่ายมีหมากเท่ากัน เสมอ!)",
    reasonDisconnectTimeout: "ฝ่ายตรงข้ามขาดการเชื่อมต่อนานเกิน 60 วินาที ชนะ!",
    opponentDisconnectCountdown: "⚠️ คู่ต่อสู้ขาดการเชื่อมต่อ... จะชนะในอีก {n} วินาที",
    opponentReconnectedMsg: "คู่ต่อสู้กลับมาเชื่อมต่อแล้ว!",
    opponentName: "คู่ต่อสู้",
    opponentDisconnected: "ฝ่ายตรงข้ามออกจากห้อง",
    playAgainBtn: "เล่นอีกครั้ง",
    lobbyReturnBtn: "กลับสู่ล็อบบี้",
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
    winnerPrefix: "ผู้ชนะ:",
    unoWinnerReason: "ไพ่หมดมือคนแรก ชนะการแข่งขัน!",
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
    pauseRequestPrompt: "คู่ต่อสู้ขอพักเกม 3 นาที ยินยอมหรือไม่?",
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
    cancelExitBtn: "เล่นต่อ",

    // Miscellaneous UI & Document
    docTitle: "มินิมอลบอร์ดเกม - หมากฮอส หมากรุก โอเทลโล่ และ UNO",
    hostBadge: "หัวหน้าห้อง",
    playerPrefix: "ผู้เล่น ",
    playBotVsBotBtn: "🤖 vs 🤖 ดูบอทแข่งกัน",
    matchBotVsBot: "บอทแข่งกันเอง (โหมดดูการเล่น)",
    spectatorsHeader: "ผู้ชม"
  },
  en: {
    // Header
    appTitle: "MINIMAL BOARD GAMES",
    appSubtitle: "Checkers • Chess • Othello • UNO",
    soundOn: "Sound: ON",
    soundOff: "Sound: OFF",
    langTh: "ไทย",
    langEn: "EN",

    // Game Category & Variant Selection
    gameCategoryLabel: "Select Game Type:",
    gameCheckersTab: "Checkers",
    gameChessTab: "Chess",
    gameOthelloTab: "Othello",
    gameUnoTab: "UNO",
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

    // Othello Variants
    ruleOthello: "Standard (8x8 • Reversi Flips)",
    ruleOthelloShort: "Othello",
    ruleOthelloDesc: "Trap opponent discs between your pieces to flip them. Most discs wins.",

    // UNO Variants
    ruleUnoStandard: "Standard Rules (Draw on +2/+4)",
    ruleUnoStandardDesc: "Official UNO rules: Draw 2 and Wild Draw 4 must be drawn immediately without stacking.",
    ruleUnoStacking: "Stacking Rules (+2 / +4 Chain)",
    ruleUnoStackingDesc: "Players can counter Draw 2 or Draw 4 with matching cards to stack penalty on next player.",
    ruleUnoShort: "UNO",
    ruleUnoStandardBadge: "UNO (Standard)",
    ruleUnoStackingBadge: "UNO (Stacking)",

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
    unoRoomWaiting: "Waiting",
    roomPlaying: "In Progress",
    spectatorsCount: "spectators",
    spectatorLabel: "Spectators:",
    joinPlayBtn: "Join Match",
    spectateBtn: "Spectate",
    noSlots: "Room Full",

    // Network Diagnostic Status & Warnings
    netStatusConnecting: "Checking network...",
    netStatusConnected: "Connected",
    netStatusRestricted: "Network Restricted",
    netStatusOffline: "Offline",
    netWarningTitle: "⚠️ Network Does Not Support Online Rooms",
    netWarningDesc: "Your current Wi-Fi or cellular network (such as corporate or school firewalls) is blocking outbound WebSockets, preventing connection to online rooms.",
    netWarningHint: "💡 Tip: Try switching to mobile data (Hotspot) or play against the Bot in the meantime.",
    netWarningOfflineTitle: "⚠️ No Internet Connection",
    netWarningOfflineDesc: "Your device is currently offline. Please check your internet connection.",
    netRetryBtn: "🔄 Retry",
    netBlockedAlert: "Your network is blocking WebSockets. Online multiplayer is unavailable. Please try mobile data.",

    // Game Arena Sidebar
    matchVsBot: "Match vs BOT",
    spectatingBadge: "Spectator Mode (Live)",
    playersHeader: "Players & Turn",
    playerWhite: "White Player",
    playerBlack: "Black Player",
    botName: "BOT",
    turnWhite: "Turn: White",
    turnBlack: "Turn: Black",
    turnYour: "Your turn",
    turnOpponent: "Opponent's turn",
    turnStatusPrefix: "Turn:",

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

    // Rules Details: Othello (Reversi)
    ruleOthelloDesc1: "• 8x8 board with 4 center discs (Black moves first)",
    ruleOthelloDesc2: "• Place a disc on an empty square that outflanks enemy discs horizontally, vertically or diagonally",
    ruleOthelloDesc3: "• All outflanked opponent discs are flipped to your color",
    ruleOthelloDesc4: "• If no legal moves available, your turn is automatically passed",
    ruleOthelloDesc5: "• Game ends when board is full or neither can move. Most discs wins",
    othelloPassNotice: "No legal moves! Turn passed to opponent",

    // Rules Details: UNO
    ruleUnoDesc1: "• 7 cards dealt to each player. 108 total cards (◯ ◻ △ ◇ and ★)",
    ruleUnoDesc2: "• Play cards matching the top discard card by symbol or number",
    ruleUnoDesc3: "• Action cards: Skip(🚫), Reverse(🔄), Draw 2(+2), Wild(★)",
    ruleUnoDesc4: "• When down to 1 card, shout 'UNO!' before your next turn",
    ruleUnoDesc5: "• First player to discard all cards wins the match!",
    botCountLabel: "Bot Count:",
    unoBotCountFmt: "{n} Bots ({total} players total)",
    unoWaitingTitle: "UNO Match Lobby",
    unoWaitingSub: "Players in Room (up to 8 players)",
    unoStartBtn: "🎮 Start Game",
    unoAddBotBtn: "+ Add Bot",
    unoRemoveBotBtn: "- Remove Bot",
    unoWaitingHostMsg: "Waiting for Room Host to start...",
    unoShoutBtn: "⚡ UNO!",
    unoShoutedMsg: "{name} shouted UNO!",
    unoCaughtPenalty: "{name} forgot to shout UNO! 2-card draw penalty",
    chooseNextSuit: "Choose next symbol:",
    circleSuit: "◯ Circle",
    squareSuit: "◻ Square",
    triangleSuit: "△ Triangle",
    diamondSuit: "◇ Diamond",
    unoDrawBtn: "Draw Card",
    unoPassBtn: "Pass Turn",
    pileCountText: "Draw Pile: {n}",
    unoDrawPileLabel: "Draw Pile",
    unoDiscardPileLabel: "Discard Pile",
    unoDrawPileTitle: "Draw Card",
    unoDirectionTitle: "Play Direction",
    unoMinPlayersAlert: "At least 2 players required (Click + Add Bot to play)",

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
    reasonDiscsCount: "Endgame disc count comparison (Most discs wins!)",
    reasonTurnLimitWhite: "Turn limit reached (White has more pieces, Wins!)",
    reasonTurnLimitBlack: "Turn limit reached (Black has more pieces, Wins!)",
    reasonTurnLimitDraw: "Turn limit reached (Equal pieces, Draw!)",
    reasonDisconnectTimeout: "Opponent disconnected for over 60s, Win!",
    opponentDisconnectCountdown: "⚠️ Opponent disconnected... Win in {n}s",
    opponentReconnectedMsg: "Opponent reconnected!",
    opponentName: "Opponent",
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
    winnerPrefix: "Winner:",
    unoWinnerReason: "First to play all cards, UNO victory!",
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
    pauseRequestPrompt: "Opponent requested a 3-minute pause. Do you accept?",
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
    cancelExitBtn: "Stay & Play",

    // Miscellaneous UI & Document
    docTitle: "Minimal Board Games - Checkers, Chess, Othello & UNO",
    hostBadge: "Host",
    playerPrefix: "P",
    playBotVsBotBtn: "🤖 vs 🤖 Watch Bot vs Bot",
    matchBotVsBot: "Bot vs Bot (Spectator Mode)",
    spectatorsHeader: "Spectators"
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
  document.documentElement.lang = currentLang;

  if (translations[currentLang].docTitle) {
    document.title = translations[currentLang].docTitle;
  }

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
