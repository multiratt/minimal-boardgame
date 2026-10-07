// app.js - Universal Minimal Board Games Controller
// Supports: Thai Checkers, International Checkers, Thai Chess (Makruk), Western Chess
// With Online waiting state pause & Stalling / Endgame 20-move countdown rule

import {
  BOARD_SIZE,
  WHITE,
  BLACK,
  RULE_THAI,
  RULE_INTERNATIONAL,
  createInitialBoard as createCheckersBoard,
  cloneBoard,
  getLegalMoves as getLegalCheckersMoves,
  getMovesForPiece as getCheckersMovesForPiece,
  applyMove as applyCheckersMove,
  checkGameOver as checkCheckersGameOver
} from "./rules.js";

import { getAIMove as getAICheckersMove } from "./ai.js";

import {
  createMakrukBoard,
  getLegalMakrukMoves,
  applyMakrukMove,
  checkMakrukGameOver,
  getAIMakrukMove,
  isKingInCheck as isMakrukKingInCheck
} from "./rules-makruk.js";

import {
  setChessConstructor,
  createInitialChess,
  getLegalChessMoves,
  applyChessMove,
  getAIChessMove
} from "./rules-chess.js";

import { NetworkManager } from "./network.js";
import {
  t,
  getLang,
  setLang,
  updateDOMTranslations
} from "./i18n.js";

import {
  isSoundEnabled,
  toggleSound,
  playMove,
  playCapture,
  playKing,
  playTimerTick,
  playVictory
} from "./sfx.js";

import { getPieceSVG } from "./pieces-svg.js";

class BoardGameApp {
  constructor() {
    this.network = new NetworkManager();

    // Mode: "checkers_thai" | "checkers_international" | "chess_makruk" | "chess_western"
    this.activeMode = localStorage.getItem("board_game_mode") || "checkers_thai";
    this.activeCategory = this.activeMode.startsWith("chess") ? "chess" : "checkers";
    this.botDifficulty = "medium";

    // Board state
    this.board = null;
    this.chessFen = null;
    this.turn = WHITE;
    this.myColor = WHITE;
    this.role = "player1";
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.multiJumpFrom = null;
    this.isAnimating = false;
    this.isGameOver = false;

    // Timer state
    this.turnTimeLimit = 30;
    this.timeRemaining = 30;
    this.timerInterval = null;

    // Online disconnect countdown state (60s grace period)
    this.disconnectCountdownTimer = null;
    this.disconnectSecondsLeft = 60;

    // Captured counts
    this.capturedWhite = 0;
    this.capturedBlack = 0;

    // Stalling / Repetition 20-move countdown rule
    this.nonCaptureTurns = 0;
    this.isEndgameCountdownActive = false;
    this.endgameMovesRemaining = 20;

    // Worker for Checkers
    this.aiWorker = null;
    this.initWorker();

    if (typeof window !== "undefined" && window.Chess) {
      setChessConstructor(window.Chess);
    }

    this.cacheDOM();
    this.initEvents();
    this.initBoardDOM();
    this.updateCategoryTabsUI();
    this.updateModeButtonsUI();
    this.renderLobbyRooms(this.network.roomsState);
    updateDOMTranslations();
    this.updateSoundButtonUI();

    if (this.network.getNickname()) {
      this.dom.nicknameInput.value = this.network.getNickname();
    }
  }

  initWorker() {
    try {
      this.aiWorker = new Worker(new URL("./ai-worker.js", import.meta.url), { type: "module" });
      this.aiWorker.onmessage = (e) => {
        const { bestMove } = e.data;
        if (bestMove && !this.isGameOver && this.turn === BLACK && this.modeIsCheckers()) {
          this.executeMoveWithAnimation(bestMove);
        }
      };
    } catch (e) {
      console.warn("Web Worker fallback:", e);
      this.aiWorker = null;
    }
  }

  cacheDOM() {
    this.dom = {
      lobbyView: document.getElementById("lobby-view"),
      gameView: document.getElementById("game-view"),
      nicknameInput: document.getElementById("nickname-input"),
      saveNameBtn: document.getElementById("save-name-btn"),

      tabCheckers: document.getElementById("tab-checkers"),
      tabChess: document.getElementById("tab-chess"),
      checkersOptions: document.getElementById("checkers-options"),
      chessOptions: document.getElementById("chess-options"),
      ruleThaiBtn: document.getElementById("rule-thai-btn"),
      ruleIntBtn: document.getElementById("rule-int-btn"),
      ruleMakrukBtn: document.getElementById("rule-makruk-btn"),
      ruleWesternBtn: document.getElementById("rule-western-btn"),

      startBotBtn: document.getElementById("start-bot-btn"),
      diffBtns: document.querySelectorAll(".diff-btn"),

      roomsGrid: document.getElementById("rooms-grid"),
      refreshRoomsBtn: document.getElementById("refresh-rooms-btn"),

      exitLobbyBtn: document.getElementById("exit-lobby-btn"),
      resignGameBtn: document.getElementById("resign-game-btn"),
      restartGameBtn: document.getElementById("restart-game-btn"),
      matchInfoTitle: document.getElementById("match-info-title"),
      endgameTurnBadge: document.getElementById("endgame-turn-badge"),
      whitePlayerBox: document.getElementById("white-player-box"),
      blackPlayerBox: document.getElementById("black-player-box"),
      whitePlayerName: document.getElementById("white-player-name"),
      blackPlayerName: document.getElementById("black-player-name"),
      whitePiecesCount: document.getElementById("white-pieces-count"),
      blackPiecesCount: document.getElementById("black-pieces-count"),
      turnBadge: document.getElementById("turn-badge"),
      timerSeconds: document.getElementById("timer-seconds"),
      timerBarFill: document.getElementById("timer-bar-fill"),
      capturedWhiteCount: document.getElementById("captured-white-count"),
      capturedBlackCount: document.getElementById("captured-black-count"),
      mandatoryNotice: document.getElementById("mandatory-notice"),
      currentRuleBadge: document.getElementById("current-rule-badge"),
      sidebarRulesList: document.getElementById("sidebar-rules-list"),

      boardContainer: document.getElementById("board-container"),
      gameOverModal: document.getElementById("game-over-modal"),
      modalWinnerTitle: document.getElementById("modal-winner-title"),
      modalWinnerReason: document.getElementById("modal-winner-reason"),
      modalReplayBtn: document.getElementById("modal-replay-btn"),
      modalLobbyBtn: document.getElementById("modal-lobby-btn"),

      langThBtn: document.getElementById("lang-th-btn"),
      langEnBtn: document.getElementById("lang-en-btn"),
      soundBtn: document.getElementById("sound-btn"),
      soundIcon: document.getElementById("sound-icon"),
      soundText: document.getElementById("sound-text")
    };
  }

  modeIsCheckers() {
    return this.activeMode.startsWith("checkers");
  }

  isMatchActive() {
    if (this.mode === "bot") return true;
    if (this.mode === "online") {
      if (this.disconnectCountdownTimer) return true;
      const room = this.network.roomsState[this.network.currentRoomId];
      return !!(room && (room.status === "playing" || (room.p1 && room.p2)));
    }
    return true;
  }

  initEvents() {
    this.dom.langThBtn.addEventListener("click", () => {
      setLang("th");
      this.onLanguageChanged();
    });
    this.dom.langEnBtn.addEventListener("click", () => {
      setLang("en");
      this.onLanguageChanged();
    });

    this.dom.soundBtn.addEventListener("click", () => {
      toggleSound();
      this.updateSoundButtonUI();
    });

    this.dom.tabCheckers.addEventListener("click", () => this.setCategory("checkers"));
    this.dom.tabChess.addEventListener("click", () => this.setCategory("chess"));

    this.dom.ruleThaiBtn.addEventListener("click", () => this.setMode("checkers_thai"));
    this.dom.ruleIntBtn.addEventListener("click", () => this.setMode("checkers_international"));
    this.dom.ruleMakrukBtn.addEventListener("click", () => this.setMode("chess_makruk"));
    this.dom.ruleWesternBtn.addEventListener("click", () => this.setMode("chess_western"));

    this.dom.saveNameBtn.addEventListener("click", () => {
      const name = this.dom.nicknameInput.value.trim();
      if (name) {
        this.network.setNickname(name);
        this.dom.saveNameBtn.textContent = "✓";
        setTimeout(() => {
          this.dom.saveNameBtn.textContent = t("saveName");
        }, 1200);
      }
    });

    this.dom.diffBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.dom.diffBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.botDifficulty = btn.getAttribute("data-diff");
      });
    });

    this.dom.startBotBtn.addEventListener("click", () => this.startBotGame());
    this.dom.refreshRoomsBtn.addEventListener("click", () => {
      this.network.queryLobby();
      this.renderLobbyRooms(this.network.roomsState);
    });

    this.dom.exitLobbyBtn.addEventListener("click", () => this.exitToLobby());
    this.dom.resignGameBtn.addEventListener("click", () => {
      if (this.isGameOver || this.role === "spectator" || !this.isMatchActive()) return;
      this.handleResign(this.myColor);
    });
    this.dom.restartGameBtn.addEventListener("click", () => {
      this.resetGameRound();
    });

    this.dom.modalReplayBtn.addEventListener("click", () => {
      this.dom.gameOverModal.classList.add("view-hidden");
      this.resetGameRound();
    });
    this.dom.modalLobbyBtn.addEventListener("click", () => {
      this.dom.gameOverModal.classList.add("view-hidden");
      this.exitToLobby();
    });

    // Multiplayer callbacks
    this.network.onLobbyUpdated = (roomsState) => this.renderLobbyRooms(roomsState);
    this.network.onRoomStateChanged = (room, action, meta) => this.handleOnlineRoomUpdate(room, action, meta);
    this.network.onMoveReceived = (msg) => {
      if (!this.isGameOver) this.executeMoveWithAnimation(msg.move, true);
    };
    this.network.onGameResigned = (resigningColor) => {
      if (!this.isGameOver) {
        const winner = resigningColor === WHITE ? BLACK : WHITE;
        this.endGame(winner, "resign");
      }
    };
    this.network.onGameRestarted = () => {
      this.dom.gameOverModal.classList.add("view-hidden");
      this.resetGameRound();
    };
    this.network.onOpponentLeft = () => {
      if (!this.isGameOver && this.isMatchActive()) {
        this.handleOpponentDisconnected();
      }
    };
    this.network.onOpponentConnectionChanged = (isConnected) => {
      if (this.mode !== "online" || this.isGameOver || this.role === "spectator") return;
      if (!isConnected) {
        if (this.isMatchActive()) {
          this.handleOpponentDisconnected();
        }
      } else {
        this.handleOpponentReconnected();
      }
    };
  }

  setCategory(category) {
    this.activeCategory = category;
    if (category === "checkers") {
      this.dom.tabCheckers.classList.add("active");
      this.dom.tabChess.classList.remove("active");
      this.dom.checkersOptions.classList.remove("view-hidden");
      this.dom.chessOptions.classList.add("view-hidden");
      if (!this.activeMode.startsWith("checkers")) {
        this.setMode("checkers_thai");
      }
    } else {
      this.dom.tabCheckers.classList.remove("active");
      this.dom.tabChess.classList.add("active");
      this.dom.checkersOptions.classList.add("view-hidden");
      this.dom.chessOptions.classList.remove("view-hidden");
      if (!this.activeMode.startsWith("chess")) {
        this.setMode("chess_makruk");
      }
    }
  }

  updateCategoryTabsUI() {
    this.setCategory(this.activeCategory);
  }

  setMode(mode) {
    this.activeMode = mode;
    localStorage.setItem("board_game_mode", mode);
    this.updateModeButtonsUI();
  }

  updateModeButtonsUI() {
    [this.dom.ruleThaiBtn, this.dom.ruleIntBtn, this.dom.ruleMakrukBtn, this.dom.ruleWesternBtn].forEach(b => {
      if (b) b.classList.remove("active");
    });

    if (this.activeMode === "checkers_thai") this.dom.ruleThaiBtn.classList.add("active");
    else if (this.activeMode === "checkers_international") this.dom.ruleIntBtn.classList.add("active");
    else if (this.activeMode === "chess_makruk") this.dom.ruleMakrukBtn.classList.add("active");
    else if (this.activeMode === "chess_western") this.dom.ruleWesternBtn.classList.add("active");

    this.renderSidebarRules();
  }

  renderSidebarRules() {
    let badgeText = "";
    let rules = [];

    switch (this.activeMode) {
      case "checkers_thai":
        badgeText = t("ruleThaiShort");
        rules = [t("ruleThaiDesc1"), t("ruleThaiDesc2"), t("ruleThaiDesc3"), t("ruleThaiDesc4"), t("ruleThaiDesc5")];
        break;
      case "checkers_international":
        badgeText = t("ruleIntShort");
        rules = [t("ruleIntDesc1"), t("ruleIntDesc2"), t("ruleIntDesc3"), t("ruleIntDesc4"), t("ruleIntDesc5")];
        break;
      case "chess_makruk":
        badgeText = t("ruleMakrukShort");
        rules = [t("ruleMakrukDesc1"), t("ruleMakrukDesc2"), t("ruleMakrukDesc3"), t("ruleMakrukDesc4"), t("ruleMakrukDesc5")];
        break;
      case "chess_western":
        badgeText = t("ruleWesternShort");
        rules = [t("ruleWesternDesc1"), t("ruleWesternDesc2"), t("ruleWesternDesc3"), t("ruleWesternDesc4"), t("ruleWesternDesc5")];
        break;
    }

    // Add Stalling rule to every game mode
    rules.push(t("endgameRuleDesc"));

    this.dom.currentRuleBadge.textContent = badgeText;
    this.dom.sidebarRulesList.innerHTML = rules.map(r => `<div>${r}</div>`).join("");
  }

  onLanguageChanged() {
    updateDOMTranslations();
    this.updateSoundButtonUI();
    this.updateMatchTitle();
    this.updateTurnUI();
    this.updatePieceCounts();
    this.renderSidebarRules();
    this.renderLobbyRooms(this.network.roomsState);
    if (this.isEndgameCountdownActive) {
      this.dom.endgameTurnBadge.textContent = t("endgameCountdownBadge").replace("{n}", this.endgameMovesRemaining);
    }
    if (this.disconnectCountdownTimer) {
      this.updateDisconnectNotice();
    }
  }

  updateSoundButtonUI() {
    const on = isSoundEnabled();
    this.dom.soundIcon.textContent = on ? "🔊" : "🔇";
    this.dom.soundText.textContent = on ? t("soundOn") : t("soundOff");
  }

  // --- LOBBY ROOMS ---
  renderLobbyRooms(roomsState) {
    this.dom.roomsGrid.innerHTML = "";
    for (let r = 1; r <= 6; r++) {
      const room = roomsState[r];
      const card = document.createElement("div");
      card.className = "room-card";

      let statusBadgeClass = "badge-empty";
      let statusText = t("roomEmpty");
      if (room.status === "waiting") {
        statusBadgeClass = "badge-waiting";
        statusText = t("roomWaiting");
      } else if (room.status === "playing") {
        statusBadgeClass = "badge-playing";
        statusText = t("roomPlaying");
      }

      const p1Name = room.p1 ? room.p1.name : "—";
      const p2Name = room.p2 ? room.p2.name : (room.status === "waiting" ? `(${t("roomWaiting")})` : "—");

      card.innerHTML = `
        <div class="room-header">
          <span class="room-title">${t("room")} ${r}</span>
          <span class="room-badge ${statusBadgeClass}">${statusText}</span>
        </div>
        <div class="room-players">
          <div class="player-slot">
            <span class="player-dot dot-white"></span>
            <span>${p1Name}</span>
          </div>
          <div class="player-slot">
            <span class="player-dot dot-black"></span>
            <span>${p2Name}</span>
          </div>
        </div>
        <div class="room-footer">
          <span class="spectator-count">${t("spectatorLabel")} ${room.spectators || 0} ${t("spectatorsCount")}</span>
          <div class="room-actions">
            ${room.status !== "playing"
              ? `<button class="btn-action join-room-btn" data-room="${r}">${t("joinPlayBtn")}</button>`
              : `<button class="btn-secondary spectate-room-btn" data-room="${r}">${t("spectateBtn")}</button>`
            }
          </div>
        </div>
      `;

      this.dom.roomsGrid.appendChild(card);
    }

    this.dom.roomsGrid.querySelectorAll(".join-room-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const roomId = parseInt(btn.getAttribute("data-room"), 10);
        this.joinOnlineRoom(roomId, false);
      });
    });

    this.dom.roomsGrid.querySelectorAll(".spectate-room-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const roomId = parseInt(btn.getAttribute("data-room"), 10);
        this.joinOnlineRoom(roomId, true);
      });
    });
  }

  // --- START GAME ---
  startBotGame() {
    this.mode = "bot";
    this.myColor = WHITE;
    this.role = "player1";
    this.updateMatchTitle();

    const playerName = this.network.getNickname() || t("defaultPlayerName");
    this.dom.whitePlayerName.textContent = playerName;
    this.dom.blackPlayerName.textContent = `${t("botName")} (${t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`)})`;

    this.showGameView();
    this.resetGameRound();
  }

  joinOnlineRoom(roomId, asSpectator = false) {
    this.mode = "online";
    const res = this.network.joinRoom(roomId, asSpectator);
    this.role = res.role;

    if (this.role === "player1") this.myColor = WHITE;
    else if (this.role === "player2") this.myColor = BLACK;
    else {
      this.role = "spectator";
      this.myColor = null;
    }

    this.updateMatchTitle(roomId);
    this.updateOnlinePlayerNames(res.roomState);

    this.showGameView();
    this.resetGameRound();

    // If joined as Player 1 and alone, pause timer & show waiting status!
    if (this.role === "player1" && !res.roomState.p2) {
      this.dom.mandatoryNotice.textContent = t("waitingOpponentJoin");
      this.dom.mandatoryNotice.classList.remove("view-hidden");
      this.stopTurnTimer();
      this.dom.timerSeconds.textContent = "--";
      this.dom.timerBarFill.style.width = "100%";
      this.dom.timerBarFill.classList.remove("timer-danger");
    }
  }

  updateMatchTitle(roomId) {
    let modeLabel = "";
    switch (this.activeMode) {
      case "checkers_thai": modeLabel = t("ruleThaiShort"); break;
      case "checkers_international": modeLabel = t("ruleIntShort"); break;
      case "chess_makruk": modeLabel = t("ruleMakrukShort"); break;
      case "chess_western": modeLabel = t("ruleWesternShort"); break;
    }

    if (this.mode === "bot") {
      const diffLabel = t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`);
      this.dom.matchInfoTitle.textContent = `${t("matchVsBot")} [${diffLabel}] • ${modeLabel}`;
    } else {
      const id = roomId || this.network.currentRoomId || 1;
      const spectateText = this.role === "spectator" ? ` • ${t("spectatingBadge")}` : "";
      this.dom.matchInfoTitle.textContent = `${t("room")} ${id}${spectateText} • ${modeLabel}`;
    }
  }

  updateOnlinePlayerNames(room) {
    const p1 = room && room.p1 ? room.p1.name : t("playerWhite");
    const p2 = room && room.p2 ? room.p2.name : (this.role === "spectator" ? t("playerBlack") : t("waitingOpponentJoin"));
    this.dom.whitePlayerName.textContent = p1;
    this.dom.blackPlayerName.textContent = p2;
  }

  handleOnlineRoomUpdate(room, action, meta) {
    this.updateOnlinePlayerNames(room);

    // Player 2 joined: Start the match!
    if (action === "join" && meta.role === "player2") {
      this.dom.mandatoryNotice.classList.add("view-hidden");
      if (this.role === "player1") {
        this.network.sendSyncState(this.board, this.turn, this.timeRemaining);
      }
      // Start the turn timer now that both players are present!
      this.startTurnTimer();
    } else if (action === "sync" && meta.board) {
      this.board = cloneBoard(meta.board);
      this.turn = meta.turn;
      this.timeRemaining = meta.timeRemaining || 30;
      this.renderBoard();
      this.updateTurnUI();
      this.updatePieceCounts();
      if (this.isMatchActive()) {
        this.startTurnTimer();
      }
    }
  }

  showGameView() {
    this.dom.lobbyView.classList.add("view-hidden");
    this.dom.gameView.classList.remove("view-hidden");
    this.renderSidebarRules();
  }

  exitToLobby() {
    this.stopTurnTimer();
    this.clearDisconnectCountdown();
    if (this.mode === "online") {
      this.network.leaveCurrentRoom();
    }
    this.dom.gameView.classList.add("view-hidden");
    this.dom.lobbyView.classList.remove("view-hidden");
    this.renderLobbyRooms(this.network.roomsState);
  }

  resetGameRound() {
    this.clearDisconnectCountdown();
    this.turn = WHITE;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.multiJumpFrom = null;
    this.isAnimating = false;
    this.isGameOver = false;
    this.capturedWhite = 0;
    this.capturedBlack = 0;

    // Reset stalling rule counters
    this.nonCaptureTurns = 0;
    this.isEndgameCountdownActive = false;
    this.endgameMovesRemaining = 20;
    this.dom.endgameTurnBadge.classList.add("view-hidden");

    switch (this.activeMode) {
      case "checkers_thai":
        this.board = createCheckersBoard(RULE_THAI);
        break;
      case "checkers_international":
        this.board = createCheckersBoard(RULE_INTERNATIONAL);
        break;
      case "chess_makruk":
        this.board = createMakrukBoard();
        break;
      case "chess_western": {
        const chessInit = createInitialChess();
        this.chessFen = chessInit.fen;
        this.board = chessInit.board;
        break;
      }
    }

    this.updateCapturedUI();
    this.renderBoard();
    this.updateTurnUI();
    this.updatePieceCounts();

    // Only start timer if game is active
    if (this.isMatchActive()) {
      this.startTurnTimer();
    } else {
      this.stopTurnTimer();
      this.dom.timerSeconds.textContent = "--";
      this.dom.timerBarFill.style.width = "100%";
      this.dom.timerBarFill.classList.remove("timer-danger");
    }
  }

  // --- BOARD RENDERING ---
  initBoardDOM() {
    this.dom.boardContainer.innerHTML = "";
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const sq = document.createElement("div");
        sq.className = `square ${(r + c) % 2 === 1 ? "square-dark" : "square-light"}`;
        sq.dataset.row = r;
        sq.dataset.col = c;
        sq.addEventListener("click", () => this.handleSquareClick(r, c));
        this.dom.boardContainer.appendChild(sq);
      }
    }
  }

  renderBoard() {
    const squares = this.dom.boardContainer.children;
    for (let i = 0; i < squares.length; i++) {
      const sq = squares[i];
      const r = parseInt(sq.dataset.row, 10);
      const c = parseInt(sq.dataset.col, 10);
      const piece = this.board ? this.board[r][c] : null;

      sq.classList.remove("selected");
      sq.innerHTML = "";

      if (piece) {
        const pieceEl = document.createElement("div");
        pieceEl.className = `piece ${piece.color === WHITE ? "piece-white" : "piece-black"}`;
        pieceEl.dataset.id = piece.id;

        pieceEl.innerHTML = getPieceSVG(this.activeMode, piece);
        sq.appendChild(pieceEl);
      }
    }

    if (this.selectedSquare) {
      const idx = this.selectedSquare.r * BOARD_SIZE + this.selectedSquare.c;
      if (squares[idx]) squares[idx].classList.add("selected");

      this.legalMovesForSelected.forEach(m => {
        const targetIdx = m.to.r * BOARD_SIZE + m.to.c;
        const targetSq = squares[targetIdx];
        if (targetSq) {
          const indicator = document.createElement("div");
          indicator.className = m.captured ? "jump-indicator" : "move-indicator";
          targetSq.appendChild(indicator);
        }
      });
    }

    // Notices
    if (this.modeIsCheckers()) {
      const allLegal = getLegalCheckersMoves(this.board, this.turn, this.activeMode === "checkers_thai" ? RULE_THAI : RULE_INTERNATIONAL);
      if (allLegal.isJump && !this.isGameOver) {
        this.dom.mandatoryNotice.textContent = t("mandatoryJumpNotice");
        this.dom.mandatoryNotice.classList.remove("view-hidden");
      } else {
        this.dom.mandatoryNotice.classList.add("view-hidden");
      }
    } else if (this.activeMode === "chess_makruk") {
      const inCheck = isMakrukKingInCheck(this.board, this.turn);
      if (inCheck && !this.isGameOver) {
        this.dom.mandatoryNotice.textContent = t("checkNotice");
        this.dom.mandatoryNotice.classList.remove("view-hidden");
      } else {
        this.dom.mandatoryNotice.classList.add("view-hidden");
      }
    } else {
      this.dom.mandatoryNotice.classList.add("view-hidden");
    }
  }

  handleSquareClick(r, c) {
    if (this.isAnimating || this.isGameOver || this.role === "spectator") return;
    if (!this.isMatchActive()) return;
    if (this.turn !== this.myColor) return;

    if (this.multiJumpFrom) {
      if (r !== this.multiJumpFrom.r || c !== this.multiJumpFrom.c) {
        const move = this.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
        if (move) this.executeMoveWithAnimation(move);
        return;
      }
    }

    const clickedPiece = this.board[r][c];

    if (clickedPiece && clickedPiece.color === this.turn) {
      let legalMoves = [];
      if (this.modeIsCheckers()) {
        const ruleVar = this.activeMode === "checkers_thai" ? RULE_THAI : RULE_INTERNATIONAL;
        legalMoves = getCheckersMovesForPiece(this.board, r, c, this.turn, ruleVar);
      } else if (this.activeMode === "chess_makruk") {
        const allLegal = getLegalMakrukMoves(this.board, this.turn);
        legalMoves = allLegal.filter(m => m.from.r === r && m.from.c === c);
      } else if (this.activeMode === "chess_western") {
        legalMoves = getLegalChessMoves(this.chessFen, r, c);
      }

      if (legalMoves.length > 0) {
        this.selectedSquare = { r, c };
        this.legalMovesForSelected = legalMoves;
        this.renderBoard();
        return;
      }
    }

    if (this.selectedSquare) {
      const move = this.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
      if (move) {
        this.executeMoveWithAnimation(move);
      } else {
        if (!this.multiJumpFrom) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.renderBoard();
        }
      }
    }
  }

  // --- MOVE EXECUTION & STALLING COUNTDOWN ---
  async executeMoveWithAnimation(move, fromRemote = false) {
    this.isAnimating = true;

    const fromIdx = move.from.r * BOARD_SIZE + move.from.c;
    const toIdx = move.to.r * BOARD_SIZE + move.to.c;
    const squares = this.dom.boardContainer.children;
    const fromSq = squares[fromIdx];
    const toSq = squares[toIdx];
    const pieceEl = fromSq ? fromSq.querySelector(".piece") : null;

    // 1. Move animation
    if (pieceEl && fromSq && toSq) {
      const fromRect = fromSq.getBoundingClientRect();
      const toRect = toSq.getBoundingClientRect();
      const deltaX = toRect.left - fromRect.left;
      const deltaY = toRect.top - fromRect.top;

      pieceEl.classList.add("piece-moving");
      playMove();

      pieceEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      await new Promise(res => setTimeout(res, 270));
    }

    // 2. Capture Shockwave animation
    const hasCapture = !!move.captured;
    if (hasCapture) {
      const capR = move.captured.r !== undefined ? move.captured.r : move.to.r;
      const capC = move.captured.c !== undefined ? move.captured.c : move.to.c;
      const capIdx = capR * BOARD_SIZE + capC;
      const capSq = squares[capIdx];
      const capPieceEl = capSq ? capSq.querySelector(".piece") : null;

      if (capPieceEl) {
        capPieceEl.classList.add("piece-destroyed");
        const shockwave = document.createElement("div");
        shockwave.className = "capture-shockwave";
        capSq.appendChild(shockwave);

        playCapture();
        await new Promise(res => setTimeout(res, 220));
      }

      if (this.turn === WHITE) this.capturedBlack++;
      else this.capturedWhite++;
      this.updateCapturedUI();

      // PROGRESS MADE: Reset stalling countdown!
      this.nonCaptureTurns = 0;
      this.isEndgameCountdownActive = false;
      this.endgameMovesRemaining = 20;
      this.dom.endgameTurnBadge.classList.add("view-hidden");
    } else {
      // No capture on this move: Increment stalling counter
      this.nonCaptureTurns++;
      if (this.nonCaptureTurns >= 10) {
        this.isEndgameCountdownActive = true;
        this.endgameMovesRemaining--;
        this.dom.endgameTurnBadge.textContent = t("endgameCountdownBadge").replace("{n}", Math.max(0, this.endgameMovesRemaining));
        this.dom.endgameTurnBadge.classList.remove("view-hidden");

        // 20-move limit reached: FINISH GAME AND COUNT PIECES!
        if (this.endgameMovesRemaining <= 0) {
          const counts = this.getPieceCounts();
          let winner = null;
          let reason = "turn_limit_draw";
          if (counts.white > counts.black) {
            winner = WHITE;
            reason = "turn_limit_white";
          } else if (counts.black > counts.white) {
            winner = BLACK;
            reason = "turn_limit_black";
          }
          this.endGame(winner, reason);
          this.isAnimating = false;
          return;
        }
      }
    }

    // 3. Engine Application
    let nextTurn = null;
    let promoted = false;
    let furtherJumps = [];

    if (this.modeIsCheckers()) {
      const ruleVar = this.activeMode === "checkers_thai" ? RULE_THAI : RULE_INTERNATIONAL;
      const outcome = applyCheckersMove(this.board, move, ruleVar);
      this.board = outcome.board;
      promoted = outcome.promoted;
      furtherJumps = outcome.furtherJumps;
      nextTurn = outcome.nextTurn;
    } else if (this.activeMode === "chess_makruk") {
      const outcome = applyMakrukMove(this.board, move);
      this.board = outcome.board;
      promoted = outcome.promoted;
      nextTurn = outcome.nextTurn;
    } else if (this.activeMode === "chess_western") {
      const outcome = applyChessMove(this.chessFen, move);
      if (outcome) {
        this.chessFen = outcome.fen;
        this.board = outcome.board;
        promoted = outcome.promoted;
        nextTurn = outcome.nextTurn;
      }
    }

    // Promotion Animation
    if (promoted) {
      playKing();
      this.renderBoard();
      const newPieceEl = toSq ? toSq.querySelector(".piece") : null;
      if (newPieceEl) {
        newPieceEl.classList.add("piece-promoting");
        const promoRing = document.createElement("div");
        promoRing.className = "promotion-ripple";
        toSq.appendChild(promoRing);
        await new Promise(res => setTimeout(res, 400));
      }
    }

    // Multi-jump check (Checkers)
    if (furtherJumps.length > 0) {
      this.multiJumpFrom = { r: move.to.r, c: move.to.c };
      this.selectedSquare = this.multiJumpFrom;
      this.legalMovesForSelected = furtherJumps;
      this.renderBoard();
      this.updatePieceCounts();
      this.isAnimating = false;

      if (this.mode === "bot" && this.turn === BLACK) {
        setTimeout(() => {
          this.executeMoveWithAnimation(furtherJumps[0]);
        }, 350);
      }
      return;
    }

    // Turn complete
    this.multiJumpFrom = null;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.turn = nextTurn;

    this.renderBoard();
    this.updateTurnUI();
    this.updatePieceCounts();
    this.isAnimating = false;

    if (this.mode === "online" && !fromRemote) {
      this.network.sendMove(move, this.board, this.turn, this.timeRemaining);
    }

    if (this.isMatchActive()) {
      this.startTurnTimer();
    }

    this.checkCurrentGameOver();

    if (this.mode === "bot" && this.turn === BLACK && !this.isGameOver) {
      this.triggerBotTurn();
    }
  }

  getPieceCounts() {
    if (!this.board) return { white: 0, black: 0 };
    let white = 0, black = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const p = this.board[r][c];
        if (p) {
          if (p.color === WHITE) white++;
          else black++;
        }
      }
    }
    return { white, black };
  }

  checkCurrentGameOver() {
    let status = { isOver: false, winner: null, reason: null };

    if (this.modeIsCheckers()) {
      const ruleVar = this.activeMode === "checkers_thai" ? RULE_THAI : RULE_INTERNATIONAL;
      status = checkCheckersGameOver(this.board, this.turn, ruleVar);
    } else if (this.activeMode === "chess_makruk") {
      status = checkMakrukGameOver(this.board, this.turn);
    } else if (this.activeMode === "chess_western") {
      const legal = getLegalChessMoves(this.chessFen);
      if (legal.length === 0) {
        status = { isOver: true, winner: this.turn === WHITE ? BLACK : WHITE, reason: "checkmate" };
      }
    }

    if (status.isOver) {
      this.endGame(status.winner, status.reason);
    }
  }

  triggerBotTurn() {
    const delay = Math.random() * 250 + 380;
    setTimeout(() => {
      if (this.isGameOver) return;

      if (this.modeIsCheckers()) {
        const ruleVar = this.activeMode === "checkers_thai" ? RULE_THAI : RULE_INTERNATIONAL;
        if (this.aiWorker) {
          this.aiWorker.postMessage({
            board: this.board,
            botColor: BLACK,
            difficulty: this.botDifficulty,
            ruleVariant: ruleVar,
            requestId: Date.now()
          });
        } else {
          const best = getAICheckersMove(this.board, BLACK, this.botDifficulty, ruleVar);
          if (best) this.executeMoveWithAnimation(best);
        }
      } else if (this.activeMode === "chess_makruk") {
        const best = getAIMakrukMove(this.board, BLACK, this.botDifficulty);
        if (best) this.executeMoveWithAnimation(best);
      } else if (this.activeMode === "chess_western") {
        const best = getAIChessMove(this.chessFen, BLACK, this.botDifficulty);
        if (best) this.executeMoveWithAnimation(best);
      }
    }, delay);
  }

  // --- TURN, PIECES & TIMER ---
  updateTurnUI() {
    const isWhite = this.turn === WHITE;
    if (this.role === "spectator") {
      this.dom.turnBadge.textContent = isWhite ? t("turnWhite") : t("turnBlack");
    } else {
      const isMyTurn = this.turn === this.myColor;
      this.dom.turnBadge.textContent = isMyTurn ? t("turnYour") : t("turnOpponent");
    }

    if (isWhite) {
      this.dom.whitePlayerBox.classList.add("active-turn-ring");
      this.dom.blackPlayerBox.classList.remove("active-turn-ring");
    } else {
      this.dom.whitePlayerBox.classList.remove("active-turn-ring");
      this.dom.blackPlayerBox.classList.add("active-turn-ring");
    }
  }

  updatePieceCounts() {
    const counts = this.getPieceCounts();
    this.dom.whitePiecesCount.textContent = counts.white;
    this.dom.blackPiecesCount.textContent = counts.black;
  }

  updateCapturedUI() {
    this.dom.capturedWhiteCount.textContent = this.capturedWhite;
    this.dom.capturedBlackCount.textContent = this.capturedBlack;
  }

  startTurnTimer() {
    this.stopTurnTimer();
    if (!this.isMatchActive()) {
      this.dom.timerSeconds.textContent = "--";
      this.dom.timerBarFill.style.width = "100%";
      this.dom.timerBarFill.classList.remove("timer-danger");
      return;
    }

    this.timeRemaining = this.turnTimeLimit;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      if (!this.isMatchActive()) {
        this.stopTurnTimer();
        return;
      }

      this.timeRemaining--;
      this.updateTimerDisplay();

      if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
        playTimerTick();
      }

      if (this.timeRemaining <= 0) {
        this.stopTurnTimer();
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTurnTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimerDisplay() {
    this.dom.timerSeconds.textContent = Math.max(0, this.timeRemaining);
    const pct = Math.max(0, (this.timeRemaining / this.turnTimeLimit) * 100);
    this.dom.timerBarFill.style.width = `${pct}%`;

    if (this.timeRemaining <= 5) {
      this.dom.timerBarFill.classList.add("timer-danger");
    } else {
      this.dom.timerBarFill.classList.remove("timer-danger");
    }
  }

  handleTimeout() {
    if (this.isGameOver || !this.isMatchActive()) return;
    const losingPlayer = this.turn;
    const winningPlayer = losingPlayer === WHITE ? BLACK : WHITE;
    this.endGame(winningPlayer, "timeout");
  }

  handleResign(resigningColor) {
    if (this.isGameOver || !this.isMatchActive()) return;
    const winningColor = resigningColor === WHITE ? BLACK : WHITE;
    if (this.mode === "online") this.network.sendResign(resigningColor);
    this.endGame(winningColor, "resign");
  }

  handleOpponentDisconnected() {
    if (this.isGameOver || this.mode !== "online" || this.role === "spectator") return;
    if (this.disconnectCountdownTimer) return;

    this.stopTurnTimer();
    this.disconnectSecondsLeft = 60;
    this.updateDisconnectNotice();

    this.disconnectCountdownTimer = setInterval(() => {
      this.disconnectSecondsLeft--;
      this.updateDisconnectNotice();

      if (this.disconnectSecondsLeft <= 0) {
        this.clearDisconnectCountdown();
        this.endGame(this.myColor, "disconnect_timeout");
      }
    }, 1000);
  }

  updateDisconnectNotice() {
    const msg = t("opponentDisconnectCountdown").replace("{n}", Math.max(0, this.disconnectSecondsLeft));
    this.dom.mandatoryNotice.textContent = msg;
    this.dom.mandatoryNotice.classList.remove("view-hidden");
    this.dom.mandatoryNotice.classList.add("notice-danger");
  }

  clearDisconnectCountdown() {
    if (this.disconnectCountdownTimer) {
      clearInterval(this.disconnectCountdownTimer);
      this.disconnectCountdownTimer = null;
    }
    this.dom.mandatoryNotice.classList.remove("notice-danger");
  }

  handleOpponentReconnected() {
    if (this.disconnectCountdownTimer) {
      this.clearDisconnectCountdown();
      this.dom.mandatoryNotice.textContent = t("opponentReconnectedMsg");
      this.dom.mandatoryNotice.classList.remove("view-hidden");
      setTimeout(() => {
        if (!this.disconnectCountdownTimer) {
          this.dom.mandatoryNotice.classList.add("view-hidden");
        }
      }, 2500);

      if (this.role === "player1") {
        this.network.sendSyncState(this.board, this.turn, this.timeRemaining);
      }

      if (this.isMatchActive() && !this.isGameOver) {
        this.startTurnTimer();
      }
    }
  }

  endGame(winner, reason) {
    this.isGameOver = true;
    this.stopTurnTimer();
    this.clearDisconnectCountdown();
    playVictory();

    let winnerText = winner === WHITE ? t("winnerWhite") : t("winnerBlack");
    if (!winner) winnerText = t("drawGame");

    let reasonText = "";
    switch (reason) {
      case "elimination": reasonText = t("reasonElimination"); break;
      case "blocked": reasonText = t("reasonBlocked"); break;
      case "checkmate": reasonText = t("reasonCheckmate"); break;
      case "stalemate":
      case "draw": reasonText = t("reasonStalemate"); break;
      case "timeout": reasonText = t("reasonTimeout"); break;
      case "resign": reasonText = t("reasonResign"); break;
      case "turn_limit_white": reasonText = t("reasonTurnLimitWhite"); break;
      case "turn_limit_black": reasonText = t("reasonTurnLimitBlack"); break;
      case "turn_limit_draw": reasonText = t("reasonTurnLimitDraw"); break;
      case "disconnect_timeout": reasonText = t("reasonDisconnectTimeout"); break;
      case "opponent_left": reasonText = t("opponentDisconnected"); break;
      default: reasonText = "";
    }

    this.dom.modalWinnerTitle.textContent = winnerText;
    this.dom.modalWinnerReason.textContent = reasonText;
    this.dom.gameOverModal.classList.remove("view-hidden");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new BoardGameApp();
});
