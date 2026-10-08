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

import {
  createOthelloBoard,
  getLegalOthelloMoves,
  applyOthelloMove,
  checkOthelloGameOver,
  getAIOthelloMove,
  countOthelloPieces
} from "./rules-othello.js";

import {
  SUITS,
  SUIT_SYMBOLS,
  ACTION_SYMBOLS,
  RULE_UNO_STANDARD,
  RULE_UNO_STACKING,
  setupUnoGame,
  isCardPlayable,
  getPlayableCards,
  playUnoCard,
  drawCardsToPlayer,
  passUnoTurn,
  challengeUno,
  shoutUno,
  getAIUnoAction
} from "./rules-uno.js?v=2.7";

import { NetworkManager, MAX_ROOMS } from "./network.js?v=2.7";
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

    // Mode: "checkers_thai" | "checkers_international" | "chess_makruk" | "chess_western" | "othello" | "uno_standard" | "uno_stacking"
    this.activeMode = localStorage.getItem("board_game_mode") || "checkers_thai";
    if (this.activeMode.startsWith("chess")) {
      this.activeCategory = "chess";
    } else if (this.activeMode === "othello") {
      this.activeCategory = "othello";
    } else if (this.activeMode.startsWith("uno")) {
      this.activeCategory = "uno";
    } else {
      this.activeCategory = "checkers";
    }
    this.botDifficulty = "medium";
    this.botColor = BLACK;

    // UNO Game State
    this.unoBotCount = 3; // 1 to 7 bots (total 2 to 8 players)
    this.unoState = null;
    this.unoPlayers = [];
    this.myUnoIndex = 0;
    this.pendingWildCardId = null;
    this.hasDrawnThisTurn = false;
    this.unoWaitingRoomId = null;
    this.unoInspectedBotIdx = 0;
    this.unoAutoFollow = true;

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
    this.turnTimeLimit = 60;
    this.timeRemaining = 60;
    this.timerInterval = null;

    // Game statistics state
    this.gameStats = {
      startTime: null,
      endTime: null,
      totalMoves: 0,
      whiteMoves: 0,
      blackMoves: 0,
      turnDurations: [],
      promotions: 0
    };
    this.turnStartTime = null;

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

    // Pause state (3 minutes = 180s per pause)
    this.isPaused = false;
    this.pauseSecondsLeft = 180;
    this.pauseInterval = null;
    this.pauseWaiting = false;
    this.botTimeout = null;

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
        const { bestMove, botColor } = e.data;
        const colorToPlay = botColor || BLACK;
        if (bestMove && !this.isGameOver && !this.isPaused && this.turn === colorToPlay && this.modeIsCheckers()) {
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
      tabOthello: document.getElementById("tab-othello"),
      tabUno: document.getElementById("tab-uno"),
      checkersOptions: document.getElementById("checkers-options"),
      chessOptions: document.getElementById("chess-options"),
      othelloOptions: document.getElementById("othello-options"),
      unoOptions: document.getElementById("uno-options"),
      ruleThaiBtn: document.getElementById("rule-thai-btn"),
      ruleIntBtn: document.getElementById("rule-int-btn"),
      ruleMakrukBtn: document.getElementById("rule-makruk-btn"),
      ruleWesternBtn: document.getElementById("rule-western-btn"),
      ruleOthelloBtn: document.getElementById("rule-othello-btn"),
      ruleUnoStandardBtn: document.getElementById("rule-uno-standard-btn"),
      ruleUnoStackingBtn: document.getElementById("rule-uno-stacking-btn"),
      unoBotCountSelector: document.getElementById("uno-bot-count-selector"),
      unoBotMinusBtn: document.getElementById("uno-bot-minus-btn"),
      unoBotPlusBtn: document.getElementById("uno-bot-plus-btn"),
      unoBotCountDisplay: document.getElementById("uno-bot-count-display"),
      capturedCard: document.querySelector(".captured-card"),

      // UNO Table Layout DOM elements
      unoTableContainer: document.getElementById("uno-table-container"),
      unoOpponentsArea: document.getElementById("uno-opponents-area"),
      unoDrawPile: document.getElementById("uno-draw-pile"),
      unoDrawCountLabel: document.getElementById("uno-draw-count-label"),
      unoDirectionBadge: document.getElementById("uno-direction-badge"),
      unoActiveSuitPill: document.getElementById("uno-active-suit-pill"),
      unoActiveSuitSym: document.getElementById("uno-active-suit-sym"),
      unoActiveSuitName: document.getElementById("uno-active-suit-name"),
      unoStackPill: document.getElementById("uno-stack-pill"),
      unoDiscardPile: document.getElementById("uno-discard-pile"),
      unoHandContainer: document.getElementById("uno-hand-container"),
      unoActionDrawBtn: document.getElementById("uno-action-draw-btn"),
      unoActionPassBtn: document.getElementById("uno-action-pass-btn"),
      unoShoutBtn: document.getElementById("uno-shout-btn"),
      unoPlayerControls: document.getElementById("uno-player-controls"),
      unoSpectatorBar: document.getElementById("uno-spectator-bar"),
      unoSpectatorTitle: document.getElementById("uno-spectator-title"),
      unoSpectatorHint: document.getElementById("uno-spectator-hint"),
      unoAutoFollowBtn: document.getElementById("uno-auto-follow-btn"),

      // UNO Modals
      unoSuitModal: document.getElementById("uno-suit-modal"),
      unoWaitingModal: document.getElementById("uno-waiting-modal"),
      unoWaitingPlayersList: document.getElementById("uno-waiting-players-list"),
      unoHostControls: document.getElementById("uno-host-controls"),
      unoStartMatchBtn: document.getElementById("uno-start-match-btn"),
      unoAddBotRoomBtn: document.getElementById("uno-add-bot-room-btn"),
      unoRemoveBotRoomBtn: document.getElementById("uno-remove-bot-room-btn"),
      unoWaitingNotice: document.getElementById("uno-waiting-notice"),
      unoLeaveWaitingBtn: document.getElementById("uno-leave-waiting-btn"),

      startBotBtn: document.getElementById("start-bot-btn"),
      startBotVsBotBtn: document.getElementById("start-bot-vs-bot-btn"),
      diffBtns: document.querySelectorAll(".diff-btn"),

      roomsGrid: document.getElementById("rooms-grid"),
      refreshRoomsBtn: document.getElementById("refresh-rooms-btn"),
      networkStatusBadge: document.getElementById("network-status-badge"),
      networkStatusText: document.getElementById("network-status-text"),
      networkWarningBanner: document.getElementById("network-warning-banner"),
      netWarningTitle: document.getElementById("net-warning-title"),
      netWarningDesc: document.getElementById("net-warning-desc"),
      netWarningHint: document.getElementById("net-warning-hint"),
      netRetryBtn: document.getElementById("net-retry-btn"),

      exitLobbyBtn: document.getElementById("exit-lobby-btn"),
      resignGameBtn: document.getElementById("resign-game-btn"),
      pauseGameBtn: document.getElementById("pause-game-btn"),
      matchInfoTitle: document.getElementById("match-info-title"),
      spectatorsBanner: document.getElementById("spectators-banner"),
      endgameTurnBadge: document.getElementById("endgame-turn-badge"),
      playersList: document.getElementById("players-list"),
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

      // Match Stats DOM elements
      modalStatMode: document.getElementById("modal-stat-mode"),
      statTotalTime: document.getElementById("stat-total-time"),
      statAvgTime: document.getElementById("stat-avg-time"),
      statTotalMoves: document.getElementById("stat-total-moves"),
      statCaptures: document.getElementById("stat-captures"),
      statPromotions: document.getElementById("stat-promotions"),
      statResultDetail: document.getElementById("stat-result-detail"),

      // Pause DOM elements
      pauseModal: document.getElementById("pause-modal"),
      pauseCountdown: document.getElementById("pause-countdown"),
      pauseBarFill: document.getElementById("pause-bar-fill"),
      resumeGameBtn: document.getElementById("resume-game-btn"),
      pauseRequestModal: document.getElementById("pause-request-modal"),
      pauseRequestMsg: document.getElementById("pause-request-msg"),
      acceptPauseBtn: document.getElementById("accept-pause-btn"),
      declinePauseBtn: document.getElementById("decline-pause-btn"),
      pauseWaitingModal: document.getElementById("pause-waiting-modal"),
      cancelPauseBtn: document.getElementById("cancel-pause-btn"),

      // Confirm Exit DOM elements
      confirmExitModal: document.getElementById("confirm-exit-modal"),
      confirmExitBtn: document.getElementById("confirm-exit-btn"),
      cancelExitBtn: document.getElementById("cancel-exit-btn"),

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

  modeIsUno() {
    return this.activeMode.startsWith("uno");
  }

  isMatchActive() {
    if (this.mode === "bot" || this.mode === "bot_vs_bot") return true;
    if (this.mode === "online") {
      if (this.disconnectCountdownTimer) return true;
      const room = this.network.roomsState[this.network.currentRoomId];
      if (!room) return false;
      if (this.modeIsUno()) {
        return room.status === "playing";
      }
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
    if (this.dom.tabOthello) {
      this.dom.tabOthello.addEventListener("click", () => this.setCategory("othello"));
    }

    if (this.dom.tabUno) {
      this.dom.tabUno.addEventListener("click", () => this.setCategory("uno"));
    }

    this.dom.ruleThaiBtn.addEventListener("click", () => this.setMode("checkers_thai"));
    this.dom.ruleIntBtn.addEventListener("click", () => this.setMode("checkers_international"));
    this.dom.ruleMakrukBtn.addEventListener("click", () => this.setMode("chess_makruk"));
    this.dom.ruleWesternBtn.addEventListener("click", () => this.setMode("chess_western"));
    if (this.dom.ruleOthelloBtn) {
      this.dom.ruleOthelloBtn.addEventListener("click", () => this.setMode("othello"));
    }

    if (this.dom.ruleUnoStandardBtn) {
      this.dom.ruleUnoStandardBtn.addEventListener("click", () => this.setMode("uno_standard"));
    }
    if (this.dom.ruleUnoStackingBtn) {
      this.dom.ruleUnoStackingBtn.addEventListener("click", () => this.setMode("uno_stacking"));
    }

    if (this.dom.unoBotMinusBtn) {
      this.dom.unoBotMinusBtn.addEventListener("click", () => this.changeUnoBotCount(-1));
    }
    if (this.dom.unoBotPlusBtn) {
      this.dom.unoBotPlusBtn.addEventListener("click", () => this.changeUnoBotCount(1));
    }

    if (this.dom.unoDrawPile) {
      this.dom.unoDrawPile.addEventListener("click", () => this.handlePlayerDrawUnoCard());
    }
    if (this.dom.unoActionDrawBtn) {
      this.dom.unoActionDrawBtn.addEventListener("click", () => this.handlePlayerDrawUnoCard());
    }
    if (this.dom.unoActionPassBtn) {
      this.dom.unoActionPassBtn.addEventListener("click", () => this.handlePlayerPassUnoTurn());
    }
    if (this.dom.unoShoutBtn) {
      this.dom.unoShoutBtn.addEventListener("click", () => this.handlePlayerShoutUno());
    }
    if (this.dom.unoAutoFollowBtn) {
      this.dom.unoAutoFollowBtn.addEventListener("click", () => this.toggleUnoAutoFollow());
    }

    if (this.dom.unoSuitModal) {
      this.dom.unoSuitModal.querySelectorAll(".uno-suit-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const suit = btn.getAttribute("data-suit");
          this.handleSelectWildSuit(suit);
        });
      });
    }

    if (this.dom.unoStartMatchBtn) {
      this.dom.unoStartMatchBtn.addEventListener("click", () => this.handleHostStartUnoMatch());
    }
    if (this.dom.unoAddBotRoomBtn) {
      this.dom.unoAddBotRoomBtn.addEventListener("click", () => this.handleHostAddUnoBot());
    }
    if (this.dom.unoRemoveBotRoomBtn) {
      this.dom.unoRemoveBotRoomBtn.addEventListener("click", () => this.handleHostRemoveUnoBot());
    }
    if (this.dom.unoLeaveWaitingBtn) {
      this.dom.unoLeaveWaitingBtn.addEventListener("click", () => this.handleLeaveUnoWaitingRoom());
    }

    // UNO Network Callbacks
    this.network.onUnoWaitingUpdate = (players) => this.handleUnoWaitingUpdate(players);
    this.network.onUnoStart = (gameState) => this.handleUnoStartReceived(gameState);
    this.network.onUnoMove = (data) => this.handleUnoMoveReceived(data);
    this.network.onUnoDraw = (data) => this.handleUnoDrawReceived(data);
    this.network.onUnoPass = (data) => this.handleUnoPassReceived(data);
    this.network.onUnoShout = (data) => this.handleUnoShoutReceived(data);

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
    if (this.dom.startBotVsBotBtn) {
      this.dom.startBotVsBotBtn.addEventListener("click", () => this.startBotVsBotGame());
    }
    this.dom.refreshRoomsBtn.addEventListener("click", () => {
      this.network.queryLobby();
      this.renderLobbyRooms(this.network.roomsState);
    });

    this.dom.exitLobbyBtn.addEventListener("click", () => this.handleExitLobbyClick());
    if (this.dom.confirmExitBtn) {
      this.dom.confirmExitBtn.addEventListener("click", () => this.handleConfirmExit());
    }
    if (this.dom.cancelExitBtn) {
      this.dom.cancelExitBtn.addEventListener("click", () => this.handleCancelExit());
    }
    if (this.dom.confirmExitModal) {
      this.dom.confirmExitModal.addEventListener("click", (e) => {
        if (e.target === this.dom.confirmExitModal) {
          this.handleCancelExit();
        }
      });
    }

    this.dom.resignGameBtn.addEventListener("click", () => {
      if (this.isGameOver || this.role === "spectator" || !this.isMatchActive()) return;
      this.handleResign(this.myColor);
    });

    if (this.dom.pauseGameBtn) {
      this.dom.pauseGameBtn.addEventListener("click", () => this.handlePauseClick());
    }
    if (this.dom.resumeGameBtn) {
      this.dom.resumeGameBtn.addEventListener("click", () => this.handleResumeClick());
    }
    if (this.dom.acceptPauseBtn) {
      this.dom.acceptPauseBtn.addEventListener("click", () => this.respondToPauseRequest(true));
    }
    if (this.dom.declinePauseBtn) {
      this.dom.declinePauseBtn.addEventListener("click", () => this.respondToPauseRequest(false));
    }
    if (this.dom.cancelPauseBtn) {
      this.dom.cancelPauseBtn.addEventListener("click", () => this.cancelOnlinePauseRequest());
    }

    this.dom.modalReplayBtn.addEventListener("click", () => {
      this.dom.gameOverModal.classList.add("view-hidden");
      if (this.mode === "online") {
        this.network.sendRestart();
      }
      if (this.modeIsUno()) {
        if (this.mode === "bot_vs_bot") {
          this.startBotVsBotGame();
        } else if (this.mode === "bot") {
          this.startBotGame();
        }
      } else {
        this.resetGameRound();
      }
    });
    this.dom.modalLobbyBtn.addEventListener("click", () => {
      this.dom.gameOverModal.classList.add("view-hidden");
      this.exitToLobby();
    });

    // Multiplayer callbacks
    this.network.onLobbyUpdated = (roomsState) => this.renderLobbyRooms(roomsState);
    this.network.onRoomStateChanged = (room, action, meta) => this.handleOnlineRoomUpdate(room, action, meta);
    this.network.onMoveReceived = (msg) => {
      if (!this.isGameOver) {
        if (msg.chessFen && this.activeMode === "chess_western") {
          this.chessFen = msg.chessFen;
        }
        this.executeMoveWithAnimation(msg.move, true);
      }
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
    this.network.onPauseRequested = (msg) => this.handleOpponentPauseRequest(msg);
    this.network.onPauseResponded = (msg) => this.handlePauseResponse(msg);
    this.network.onPauseResumed = () => this.handleOpponentPauseResume();
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

    // Network Diagnostics & Status Callbacks
    this.network.onConnectionStatusChanged = (status) => this.handleConnectionStatusChanged(status);
    if (this.dom.netRetryBtn) {
      this.dom.netRetryBtn.addEventListener("click", () => {
        this.network.retryConnection();
      });
    }
    this.handleConnectionStatusChanged(this.network.connectionStatus);
  }

  handleConnectionStatusChanged(status) {
    if (!this.dom.networkStatusBadge) return;

    this.dom.networkStatusBadge.classList.remove("status-connecting", "status-connected", "status-restricted", "status-offline");
    this.dom.networkStatusBadge.classList.add(`status-${status}`);

    if (this.dom.networkStatusText) {
      if (status === "connecting") {
        this.dom.networkStatusText.textContent = t("netStatusConnecting");
      } else if (status === "connected") {
        this.dom.networkStatusText.textContent = t("netStatusConnected");
      } else if (status === "restricted") {
        this.dom.networkStatusText.textContent = t("netStatusRestricted");
      } else if (status === "offline") {
        this.dom.networkStatusText.textContent = t("netStatusOffline");
      }
    }

    if (this.dom.networkWarningBanner) {
      if (status === "restricted") {
        this.dom.networkWarningBanner.classList.remove("view-hidden");
        if (this.dom.netWarningTitle) this.dom.netWarningTitle.textContent = t("netWarningTitle");
        if (this.dom.netWarningDesc) this.dom.netWarningDesc.textContent = t("netWarningDesc");
        if (this.dom.netWarningHint) this.dom.netWarningHint.textContent = t("netWarningHint");
      } else if (status === "offline") {
        this.dom.networkWarningBanner.classList.remove("view-hidden");
        if (this.dom.netWarningTitle) this.dom.netWarningTitle.textContent = t("netWarningOfflineTitle");
        if (this.dom.netWarningDesc) this.dom.netWarningDesc.textContent = t("netWarningOfflineDesc");
        if (this.dom.netWarningHint) this.dom.netWarningHint.textContent = t("netWarningHint");
      } else {
        this.dom.networkWarningBanner.classList.add("view-hidden");
      }
    }
  }

  setCategory(category) {
    this.activeCategory = category;
    [this.dom.tabCheckers, this.dom.tabChess, this.dom.tabOthello, this.dom.tabUno].forEach(t => t && t.classList.remove("active"));
    [this.dom.checkersOptions, this.dom.chessOptions, this.dom.othelloOptions, this.dom.unoOptions].forEach(o => o && o.classList.add("view-hidden"));

    if (category === "checkers") {
      if (this.dom.tabCheckers) this.dom.tabCheckers.classList.add("active");
      if (this.dom.checkersOptions) this.dom.checkersOptions.classList.remove("view-hidden");
      if (this.dom.unoBotCountSelector) this.dom.unoBotCountSelector.classList.add("view-hidden");
      if (!this.activeMode.startsWith("checkers")) {
        this.setMode("checkers_thai");
      }
    } else if (category === "chess") {
      if (this.dom.tabChess) this.dom.tabChess.classList.add("active");
      if (this.dom.chessOptions) this.dom.chessOptions.classList.remove("view-hidden");
      if (this.dom.unoBotCountSelector) this.dom.unoBotCountSelector.classList.add("view-hidden");
      if (!this.activeMode.startsWith("chess")) {
        this.setMode("chess_makruk");
      }
    } else if (category === "othello") {
      if (this.dom.tabOthello) this.dom.tabOthello.classList.add("active");
      if (this.dom.othelloOptions) this.dom.othelloOptions.classList.remove("view-hidden");
      if (this.dom.unoBotCountSelector) this.dom.unoBotCountSelector.classList.add("view-hidden");
      if (this.activeMode !== "othello") {
        this.setMode("othello");
      }
    } else if (category === "uno") {
      if (this.dom.tabUno) this.dom.tabUno.classList.add("active");
      if (this.dom.unoOptions) this.dom.unoOptions.classList.remove("view-hidden");
      if (this.dom.unoBotCountSelector) {
        this.dom.unoBotCountSelector.classList.remove("view-hidden");
        this.updateUnoBotCountDisplay();
      }
      if (!this.activeMode.startsWith("uno")) {
        this.setMode("uno_standard");
      }
    }
    this.network.queryLobby();
    this.renderLobbyRooms(this.network.roomsState);
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
    [this.dom.ruleThaiBtn, this.dom.ruleIntBtn, this.dom.ruleMakrukBtn, this.dom.ruleWesternBtn, this.dom.ruleOthelloBtn, this.dom.ruleUnoStandardBtn, this.dom.ruleUnoStackingBtn].forEach(b => {
      if (b) b.classList.remove("active");
    });

    if (this.activeMode === "checkers_thai") this.dom.ruleThaiBtn.classList.add("active");
    else if (this.activeMode === "checkers_international") this.dom.ruleIntBtn.classList.add("active");
    else if (this.activeMode === "chess_makruk") this.dom.ruleMakrukBtn.classList.add("active");
    else if (this.activeMode === "chess_western") this.dom.ruleWesternBtn.classList.add("active");
    else if (this.activeMode === "othello" && this.dom.ruleOthelloBtn) this.dom.ruleOthelloBtn.classList.add("active");
    else if (this.activeMode === "uno_standard" && this.dom.ruleUnoStandardBtn) this.dom.ruleUnoStandardBtn.classList.add("active");
    else if (this.activeMode === "uno_stacking" && this.dom.ruleUnoStackingBtn) this.dom.ruleUnoStackingBtn.classList.add("active");

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
      case "othello":
        badgeText = t("ruleOthelloShort");
        rules = [t("ruleOthelloDesc1"), t("ruleOthelloDesc2"), t("ruleOthelloDesc3"), t("ruleOthelloDesc4"), t("ruleOthelloDesc5")];
        break;
      case "uno_standard":
        badgeText = t("ruleUnoStandardBadge");
        rules = [t("ruleUnoDesc1"), t("ruleUnoDesc2"), t("ruleUnoStandardDesc"), t("ruleUnoDesc3"), t("ruleUnoDesc4"), t("ruleUnoDesc5")];
        break;
      case "uno_stacking":
        badgeText = t("ruleUnoStackingBadge");
        rules = [t("ruleUnoDesc1"), t("ruleUnoDesc2"), t("ruleUnoStackingDesc"), t("ruleUnoDesc3"), t("ruleUnoDesc4"), t("ruleUnoDesc5")];
        break;
    }

    // Add Stalling rule only to piece capture games (not Othello or UNO)
    if (this.activeMode !== "othello" && !this.modeIsUno()) {
      rules.push(t("endgameRuleDesc"));
    }

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
    this.updateUnoBotCountDisplay();
    this.handleConnectionStatusChanged(this.network.connectionStatus);
    if (this.modeIsUno()) {
      this.renderUnoTable();
    }
    if (this.mode === "bot") {
      this.updateBotPlayerNames();
    } else if (this.mode === "bot_vs_bot") {
      const diffTitle = t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`);
      if (this.dom.whitePlayerName) this.dom.whitePlayerName.textContent = `⚪ ${t("playerWhite")}: 🤖 ${t("botName")} 1 (${diffTitle})`;
      if (this.dom.blackPlayerName) this.dom.blackPlayerName.textContent = `⚫ ${t("playerBlack")}: 🤖 ${t("botName")} 2 (${diffTitle})`;
    } else if (this.mode === "online") {
      this.updateOnlinePlayerNames(this.network.roomsState[this.network.currentRoomId]);
    }
    this.renderPlayersList();
    if (this.isEndgameCountdownActive) {
      this.dom.endgameTurnBadge.textContent = t("endgameCountdownBadge").replace("{n}", this.endgameMovesRemaining);
    }
    if (this.disconnectCountdownTimer) {
      this.updateDisconnectNotice();
    }
    if (this.dom.unoWaitingModal && !this.dom.unoWaitingModal.classList.contains("view-hidden")) {
      const room = this.network.roomsState[this.network.currentRoomId];
      if (room && room.players) {
        this.renderUnoWaitingRoom(room);
      }
    }
    if (this.isGameOver && this.dom.gameOverModal && !this.dom.gameOverModal.classList.contains("view-hidden")) {
      if (this.modeIsUno()) {
        this.endUnoGame(this.unoWinnerIndex ?? 0, true);
      } else {
        this.endGame(this.gameWinner, this.gameReason, true);
      }
    }
  }

  updateSoundButtonUI() {
    const on = isSoundEnabled();
    this.dom.soundIcon.textContent = on ? "🔊" : "🔇";
    this.dom.soundText.textContent = on ? t("soundOn") : t("soundOff");
  }

  getRoomModeDisplay(mode) {
    if (!mode) {
      return {
        icon: "🎲",
        name: t("roomModeOpen"),
        isEmpty: true
      };
    }
    switch (mode) {
      case "checkers_thai":
        return { icon: "⚪", name: t("ruleThaiShort"), isEmpty: false };
      case "checkers_international":
        return { icon: "🌐", name: t("ruleIntShort"), isEmpty: false };
      case "chess_makruk":
        return { icon: "♟️", name: t("ruleMakrukShort"), isEmpty: false };
      case "chess_western":
        return { icon: "👑", name: t("ruleWesternShort"), isEmpty: false };
      case "othello":
        return { icon: "🔘", name: t("ruleOthelloShort"), isEmpty: false };
      case "uno_standard":
        return { icon: "🎴", name: t("ruleUnoStandard"), isEmpty: false };
      case "uno_stacking":
        return { icon: "⚡", name: t("ruleUnoStacking"), isEmpty: false };
      default:
        return { icon: "🎲", name: mode, isEmpty: false };
    }
  }

  // --- LOBBY ROOMS ---
  renderLobbyRooms(roomsState) {
    this.dom.roomsGrid.innerHTML = "";
    for (let r = 1; r <= MAX_ROOMS; r++) {
      const room = roomsState[r];
      if (!room) continue;
      const card = document.createElement("div");
      card.className = "room-card";

      let statusBadgeClass = "badge-empty";
      let statusText = t("roomEmpty");
      if (room.status === "waiting") {
        statusBadgeClass = "badge-waiting";
        const pCount = (room.players && room.players.length > 0) ? room.players.length : (room.p1 ? 1 : 0);
        if (room.mode && room.mode.startsWith("uno")) {
          statusText = `${t("unoRoomWaiting")} (${pCount}/8)`;
        } else {
          statusText = t("roomWaiting");
        }
      } else if (room.status === "playing") {
        statusBadgeClass = "badge-playing";
        statusText = t("roomPlaying");
      }

      const p1Name = room.p1 ? room.p1.name : "—";
      const p2Name = room.p2 ? room.p2.name : (room.status === "waiting" ? `(${t("roomWaiting")})` : "—");
      const modeInfo = this.getRoomModeDisplay(room.mode);

      card.innerHTML = `
        <div class="room-header">
          <span class="room-title">${t("room")} ${r}</span>
          <span class="room-badge ${statusBadgeClass}">${statusText}</span>
        </div>
        <div class="room-mode-banner ${modeInfo.isEmpty ? 'mode-empty' : ''}">
          <span class="mode-icon">${modeInfo.icon}</span>
          <span class="mode-label">${modeInfo.name}</span>
        </div>
        <div class="room-players">
          ${room.mode && room.mode.startsWith("uno") && room.players && room.players.length > 0 ? `
            <div class="player-slot" style="grid-column: 1 / -1; font-size: 0.76rem;">
              <span class="player-dot dot-white"></span>
              <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${room.players.map(p => `${p.isHost ? '👑' : (p.isBot ? '🤖' : '👤')} ${p.isBot ? `${t("botName")} ${p.botNum || ''}`.trim() : p.name}`).join(' • ')}
              </span>
            </div>
          ` : `
            <div class="player-slot">
              <span class="player-dot dot-white"></span>
              <span>${p1Name}</span>
            </div>
            <div class="player-slot">
              <span class="player-dot dot-black"></span>
              <span>${p2Name}</span>
            </div>
          `}
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
    this.turnTimeLimit = 60;
    this.timeRemaining = 60;
    this.updateSpectatorsUI(null);
    if (this.modeIsUno()) {
      this.mode = "bot";
      this.role = "player1";
      const totalPlayers = 1 + this.unoBotCount;
      const myName = this.network.getNickname() || t("defaultPlayerName");
      this.unoPlayers = [
        { id: this.network.clientId, name: `${myName}`, isBot: false, isHost: true }
      ];
      for (let i = 1; i <= this.unoBotCount; i++) {
        this.unoPlayers.push({
          id: `bot_${i}`,
          botNum: i,
          name: `${t("botName")} ${i}`,
          isBot: true,
          isHost: false
        });
      }
      this.myUnoIndex = 0;
      const unoState = setupUnoGame(totalPlayers, this.activeMode);
      this.startUnoGameWithState({ unoState, unoPlayers: this.unoPlayers });
      return;
    }

    this.mode = "bot";
    if (this.activeMode === "othello") {
      this.myColor = BLACK;
      this.botColor = WHITE;
    } else {
      this.myColor = WHITE;
      this.botColor = BLACK;
    }
    this.role = "player1";
    this.updateMatchTitle();

    this.updateBotPlayerNames();

    this.showGameView();
    this.resetGameRound();
  }

  startBotVsBotGame() {
    this.turnTimeLimit = 60;
    this.timeRemaining = 60;
    this.updateSpectatorsUI(null);
    this.mode = "bot_vs_bot";
    this.role = "spectator";
    this.myColor = null;

    if (this.modeIsUno()) {
      const count = Math.max(2, this.unoBotCount);
      this.unoPlayers = [];
      for (let i = 1; i <= count; i++) {
        this.unoPlayers.push({
          id: `bot_${i}`,
          botNum: i,
          name: `${t("botName")} ${i}`,
          isBot: true,
          isHost: (i === 1)
        });
      }
      this.myUnoIndex = -1;
      this.unoInspectedBotIdx = 0;
      this.unoAutoFollow = true;
      const unoState = setupUnoGame(count, this.activeMode);
      this.startUnoGameWithState({ unoState, unoPlayers: this.unoPlayers });
      return;
    }

    this.botColor = null;
    this.updateMatchTitle();

    const diffTitle = t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`);
    if (this.dom.whitePlayerName) this.dom.whitePlayerName.textContent = `⚪ ${t("playerWhite")}: 🤖 ${t("botName")} 1 (${diffTitle})`;
    if (this.dom.blackPlayerName) this.dom.blackPlayerName.textContent = `⚫ ${t("playerBlack")}: 🤖 ${t("botName")} 2 (${diffTitle})`;

    this.showGameView();
    this.resetGameRound();
  }

  updateBotPlayerNames() {
    const playerName = this.network.getNickname() || t("defaultPlayerName");
    const botTitle = `🤖 ${t("botName")} (${t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`)})`;
    if (this.myColor === BLACK) {
      if (this.dom.blackPlayerName) this.dom.blackPlayerName.textContent = `⚫ ${t("playerBlack")}: ${playerName} (${t("youLabel")})`;
      if (this.dom.whitePlayerName) this.dom.whitePlayerName.textContent = `⚪ ${t("playerWhite")}: ${botTitle}`;
    } else {
      if (this.dom.whitePlayerName) this.dom.whitePlayerName.textContent = `⚪ ${t("playerWhite")}: ${playerName} (${t("youLabel")})`;
      if (this.dom.blackPlayerName) this.dom.blackPlayerName.textContent = `⚫ ${t("playerBlack")}: ${botTitle}`;
    }
  }

  joinOnlineRoom(roomId, asSpectator = false) {
    if (this.network.connectionStatus === "restricted" || this.network.connectionStatus === "offline") {
      alert(t("netBlockedAlert"));
      return;
    }

    this.turnTimeLimit = 60;
    this.timeRemaining = 60;
    this.mode = "online";
    const existingRoom = this.network.roomsState[roomId];

    // If room already has a host and established mode, adopt the room's mode!
    if (existingRoom && existingRoom.mode) {
      this.activeMode = existingRoom.mode;
      localStorage.setItem("board_game_mode", this.activeMode);
      if (this.activeMode.startsWith("chess")) {
        this.activeCategory = "chess";
      } else if (this.activeMode === "othello") {
        this.activeCategory = "othello";
      } else if (this.activeMode.startsWith("uno")) {
        this.activeCategory = "uno";
      } else {
        this.activeCategory = "checkers";
      }
      this.updateCategoryTabsUI();
      this.updateModeButtonsUI();
    }

    const res = this.network.joinRoom(roomId, asSpectator, this.activeMode);
    this.role = res.role;

    if (this.modeIsUno()) {
      if (res.roomState.status === "playing") {
        this.unoPlayers = res.roomState.players || [];
        this.myUnoIndex = this.unoPlayers.findIndex(p => p.id === this.network.clientId);
        if (this.myUnoIndex === -1) this.myUnoIndex = this.role === "spectator" ? -1 : 0;
        this.showGameView();
        this.updateMatchTitle(roomId);
        return;
      }

      this.unoWaitingRoomId = roomId;
      this.showUnoWaitingModal(res.roomState);
      return;
    }

    if (this.activeMode === "othello") {
      if (this.role === "player1") this.myColor = BLACK;
      else if (this.role === "player2") this.myColor = WHITE;
      else {
        this.role = "spectator";
        this.myColor = null;
      }
    } else {
      if (this.role === "player1") this.myColor = WHITE;
      else if (this.role === "player2") this.myColor = BLACK;
      else {
        this.role = "spectator";
        this.myColor = null;
      }
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
      case "othello": modeLabel = t("ruleOthelloShort"); break;
      case "uno_standard": modeLabel = t("ruleUnoShort") + " (Standard)"; break;
      case "uno_stacking": modeLabel = t("ruleUnoShort") + " (Stacking)"; break;
    }

    if (this.mode === "bot") {
      const diffLabel = t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`);
      this.dom.matchInfoTitle.textContent = `${t("matchVsBot")} [${diffLabel}] • ${modeLabel}`;
    } else if (this.mode === "bot_vs_bot") {
      const diffLabel = t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`);
      this.dom.matchInfoTitle.textContent = `${t("matchBotVsBot")} [${diffLabel}] • ${modeLabel}`;
    } else {
      const id = roomId || this.network.currentRoomId || 1;
      const spectateText = this.role === "spectator" ? ` • ${t("spectatingBadge")}` : "";
      this.dom.matchInfoTitle.textContent = `${t("room")} ${id}${spectateText} • ${modeLabel}`;
    }
  }

  updateSpectatorsUI(room) {
    if (!this.dom.spectatorsBanner) return;
    if (this.mode !== "online" || !room) {
      this.dom.spectatorsBanner.classList.add("view-hidden");
      this.dom.spectatorsBanner.textContent = "";
      return;
    }
    const specNames = this.network.getSpectatorNames(room);
    if (!specNames || specNames.length === 0) {
      this.dom.spectatorsBanner.classList.add("view-hidden");
      this.dom.spectatorsBanner.textContent = "";
      return;
    }
    const count = specNames.length;
    const namesList = specNames.join(", ");
    this.dom.spectatorsBanner.textContent = `👀 ${t("spectatorsHeader")} (${count}): ${namesList}`;
    this.dom.spectatorsBanner.classList.remove("view-hidden");
  }

  updateOnlinePlayerNames(room) {
    if (this.activeMode === "othello") {
      let pBlack = room && room.p1 ? room.p1.name : t("playerBlack");
      let pWhite = room && room.p2 ? room.p2.name : (this.role === "spectator" ? t("playerWhite") : t("waitingOpponentJoin"));

      if (this.role === "player1") {
        pBlack = `${pBlack} (${t("youLabel")})`;
      } else if (this.role === "player2") {
        if (room && room.p2) {
          pWhite = `${pWhite} (${t("youLabel")})`;
        }
      }
      if (this.dom.blackPlayerName) this.dom.blackPlayerName.textContent = `⚫ ${t("playerBlack")}: ${pBlack}`;
      if (this.dom.whitePlayerName) this.dom.whitePlayerName.textContent = `⚪ ${t("playerWhite")}: ${pWhite}`;
    } else {
      let p1 = room && room.p1 ? room.p1.name : t("playerWhite");
      let p2 = room && room.p2 ? room.p2.name : (this.role === "spectator" ? t("playerBlack") : t("waitingOpponentJoin"));

      if (this.role === "player1") {
        p1 = `${p1} (${t("youLabel")})`;
      } else if (this.role === "player2") {
        if (room && room.p2) {
          p2 = `${p2} (${t("youLabel")})`;
        }
      }
      if (this.dom.whitePlayerName) this.dom.whitePlayerName.textContent = `⚪ ${t("playerWhite")}: ${p1}`;
      if (this.dom.blackPlayerName) this.dom.blackPlayerName.textContent = `⚫ ${t("playerBlack")}: ${p2}`;
    }
    this.updateSpectatorsUI(room);
  }

  handleOnlineRoomUpdate(room, action, meta) {
    this.updateOnlinePlayerNames(room);

    if (this.modeIsUno()) {
      if (this.dom.unoWaitingModal && !this.dom.unoWaitingModal.classList.contains("view-hidden")) {
        this.renderUnoWaitingRoom(room);
      }
    }

    // If spectator or player 2 joins and we are player 1, send full sync state
    if (action === "join") {
      if (this.role === "player1") {
        this.network.sendSyncState(this.board, this.turn, this.timeRemaining, this.activeMode, this.chessFen);
      }
      if (meta.role === "player2") {
        this.dom.mandatoryNotice.classList.add("view-hidden");
        if (!this.gameStats.startTime) this.gameStats.startTime = Date.now();
        this.turnStartTime = Date.now();
        this.startTurnTimer();
      }
    } else if (action === "sync" && meta.board) {
      if (meta.mode && meta.mode !== this.activeMode) {
        this.activeMode = meta.mode;
        localStorage.setItem("board_game_mode", this.activeMode);
        this.activeCategory = this.activeMode.startsWith("chess") ? "chess" : "checkers";
        this.updateCategoryTabsUI();
        this.updateModeButtonsUI();
      }
      if (meta.chessFen) {
        this.chessFen = meta.chessFen;
      }
      this.board = cloneBoard(meta.board);
      this.turn = meta.turn;
      this.timeRemaining = meta.timeRemaining || 30;
      this.updateMatchTitle(this.network.currentRoomId);
      this.renderBoard();
      this.updateTurnUI();
      this.updatePieceCounts();
      if (!this.gameStats.startTime) this.gameStats.startTime = Date.now();
      this.turnStartTime = Date.now();
      if (this.isMatchActive()) {
        this.startTurnTimer();
      }
    }
  }

  showGameView() {
    this.dom.lobbyView.classList.add("view-hidden");
    this.dom.gameView.classList.remove("view-hidden");

    if (this.modeIsUno()) {
      if (this.dom.boardContainer) this.dom.boardContainer.classList.add("view-hidden");
      if (this.dom.unoTableContainer) this.dom.unoTableContainer.classList.remove("view-hidden");
      if (this.dom.capturedCard) this.dom.capturedCard.classList.add("view-hidden");
      if (this.dom.mandatoryNotice) this.dom.mandatoryNotice.classList.add("view-hidden");
    } else {
      if (this.dom.boardContainer) this.dom.boardContainer.classList.remove("view-hidden");
      if (this.dom.unoTableContainer) this.dom.unoTableContainer.classList.add("view-hidden");
      if (this.dom.capturedCard) {
        if (this.activeMode === "othello") this.dom.capturedCard.classList.add("view-hidden");
        else this.dom.capturedCard.classList.remove("view-hidden");
      }
    }

    this.renderPlayersList();
    this.renderSidebarRules();
  }

  handleExitLobbyClick() {
    if (!this.isGameOver && this.isMatchActive() && this.role !== "spectator") {
      if (this.dom.confirmExitModal) {
        this.dom.confirmExitModal.classList.remove("view-hidden");
      }
      return;
    }
    this.exitToLobby();
  }

  handleConfirmExit() {
    if (this.dom.confirmExitModal) {
      this.dom.confirmExitModal.classList.add("view-hidden");
    }

    if (!this.isGameOver && this.isMatchActive() && this.role !== "spectator") {
      const winningColor = this.myColor === WHITE ? BLACK : WHITE;
      if (this.mode === "online") {
        this.network.sendResign(this.myColor);
      }
      this.endGame(winningColor, "resign");
    }

    this.exitToLobby();
  }

  handleCancelExit() {
    if (this.dom.confirmExitModal) {
      this.dom.confirmExitModal.classList.add("view-hidden");
    }
  }

  exitToLobby() {
    this.turnTimeLimit = 60;
    this.timeRemaining = 60;
    this.stopTurnTimer();
    this.clearDisconnectCountdown();
    this.clearPauseSession();
    this.updateSpectatorsUI(null);
    if (this.botTimeout) {
      clearTimeout(this.botTimeout);
      this.botTimeout = null;
    }
    if (this.dom.confirmExitModal) {
      this.dom.confirmExitModal.classList.add("view-hidden");
    }
    if (this.dom.gameOverModal) {
      this.dom.gameOverModal.classList.add("view-hidden");
    }
    if (this.dom.unoWaitingModal) {
      this.dom.unoWaitingModal.classList.add("view-hidden");
    }
    if (this.dom.unoSuitModal) {
      this.dom.unoSuitModal.classList.add("view-hidden");
    }
    if (this.mode === "online") {
      this.network.leaveCurrentRoom();
    }
    this.dom.gameView.classList.add("view-hidden");
    this.dom.lobbyView.classList.remove("view-hidden");
    this.network.queryLobby();
    this.renderLobbyRooms(this.network.roomsState);
  }

  resetGameRound() {
    this.clearDisconnectCountdown();
    this.clearPauseSession();
    this.turn = this.activeMode === "othello" ? BLACK : WHITE;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.multiJumpFrom = null;
    this.isAnimating = false;
    this.isGameOver = false;
    this.capturedWhite = 0;
    this.capturedBlack = 0;

    // Reset statistics
    this.gameStats = {
      startTime: this.isMatchActive() ? Date.now() : null,
      endTime: null,
      totalMoves: 0,
      whiteMoves: 0,
      blackMoves: 0,
      turnDurations: [],
      promotions: 0
    };
    this.turnStartTime = this.isMatchActive() ? Date.now() : null;

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
      case "othello":
        this.board = createOthelloBoard();
        break;
    }

    if (this.dom.capturedCard) {
      if (this.activeMode === "othello") {
        this.dom.capturedCard.classList.add("view-hidden");
      } else {
        this.dom.capturedCard.classList.remove("view-hidden");
      }
    }

    this.updateCapturedUI();
    this.renderBoard();
    this.renderPlayersList();
    this.updateTurnUI();
    this.updatePieceCounts();

    if (this.mode === "online" && this.role === "player1") {
      this.network.sendSyncState(this.board, this.turn, this.timeRemaining, this.activeMode, this.chessFen);
    }

    // Only start timer if game is active
    if (this.isMatchActive()) {
      this.startTurnTimer();
    } else {
      this.stopTurnTimer();
      this.dom.timerSeconds.textContent = "--";
      this.dom.timerBarFill.style.width = "100%";
      this.dom.timerBarFill.classList.remove("timer-danger");
    }

    if (((this.mode === "bot" && this.turn === this.botColor) || this.mode === "bot_vs_bot") && !this.isGameOver) {
      this.triggerBotTurn();
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

    if (this.activeMode === "othello") {
      this.dom.mandatoryNotice.classList.add("view-hidden");
      if (!this.isGameOver && !this.isPaused && (this.role === "spectator" || this.turn === this.myColor)) {
        const legalMoves = getLegalOthelloMoves(this.board, this.turn);
        legalMoves.forEach(m => {
          const targetIdx = m.to.r * BOARD_SIZE + m.to.c;
          const targetSq = squares[targetIdx];
          if (targetSq) {
            const dot = document.createElement("div");
            dot.className = "othello-dot";
            targetSq.appendChild(dot);
          }
        });
      }
      return;
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
    if (this.isAnimating || this.isGameOver || this.role === "spectator" || this.isPaused) return;
    if (!this.isMatchActive()) return;
    if (this.turn !== this.myColor) return;

    if (this.activeMode === "othello") {
      if (this.board[r][c] !== null) return;
      const legalMoves = getLegalOthelloMoves(this.board, this.turn);
      const move = legalMoves.find(m => m.to.r === r && m.to.c === c);
      if (move) {
        this.executeMoveWithAnimation(move);
      }
      return;
    }

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

    // Track statistics
    if (!this.gameStats.startTime) {
      this.gameStats.startTime = Date.now();
    }
    if (this.turnStartTime) {
      const duration = Math.max(0.5, (Date.now() - this.turnStartTime) / 1000);
      this.gameStats.turnDurations.push(duration);
    }
    this.turnStartTime = Date.now();

    this.gameStats.totalMoves++;
    if (this.turn === WHITE) {
      this.gameStats.whiteMoves++;
    } else {
      this.gameStats.blackMoves++;
    }

    if (this.activeMode === "othello") {
      const toIdx = move.to.r * BOARD_SIZE + move.to.c;
      const squares = this.dom.boardContainer.children;
      const toSq = squares[toIdx];

      // 1. Place disc
      if (toSq) {
        toSq.innerHTML = "";
        const newPieceEl = document.createElement("div");
        newPieceEl.className = `piece ${this.turn === WHITE ? "piece-white" : "piece-black"} piece-just-landed`;
        toSq.appendChild(newPieceEl);
        playMove();
      }

      // 2. Animate flips
      if (move.flipped && move.flipped.length > 0) {
        const flipElements = [];
        for (const f of move.flipped) {
          const fIdx = f.r * BOARD_SIZE + f.c;
          const fSq = squares[fIdx];
          const fPiece = fSq ? fSq.querySelector(".piece") : null;
          if (fPiece) {
            fPiece.classList.add("disc-flipping");
            flipElements.push(fPiece);
          }
        }

        await new Promise(res => setTimeout(res, 175));
        for (const el of flipElements) {
          if (this.turn === WHITE) {
            el.classList.remove("piece-black");
            el.classList.add("piece-white");
          } else {
            el.classList.remove("piece-white");
            el.classList.add("piece-black");
          }
        }
        playCapture();
        await new Promise(res => setTimeout(res, 175));
      }

      // 3. Engine Application
      const outcome = applyOthelloMove(this.board, move, this.turn);
      this.board = outcome.board;
      this.turn = outcome.nextTurn;

      // Notice for Pass
      if (outcome.passed) {
        this.dom.mandatoryNotice.textContent = t("othelloPassNotice");
        this.dom.mandatoryNotice.classList.remove("view-hidden");
        setTimeout(() => {
          if (!this.isGameOver && this.dom.mandatoryNotice.textContent === t("othelloPassNotice")) {
            this.dom.mandatoryNotice.classList.add("view-hidden");
          }
        }, 2500);
      } else {
        this.dom.mandatoryNotice.classList.add("view-hidden");
      }

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

      if (((this.mode === "bot" && this.turn === this.botColor) || this.mode === "bot_vs_bot") && !this.isGameOver) {
        this.triggerBotTurn();
      }
      return;
    }

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
      this.gameStats.promotions++;
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

      if (((this.mode === "bot" && this.turn === this.botColor) || this.mode === "bot_vs_bot") && !this.isGameOver) {
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
      this.network.sendMove(move, this.board, this.turn, this.timeRemaining, this.chessFen);
    }

    if (this.isMatchActive()) {
      this.startTurnTimer();
    }

    this.checkCurrentGameOver();

    if (((this.mode === "bot" && this.turn === this.botColor) || this.mode === "bot_vs_bot") && !this.isGameOver) {
      this.triggerBotTurn();
    }
  }

  getPieceCounts() {
    if (!this.board) return { white: 0, black: 0 };
    if (this.activeMode === "othello") {
      const counts = countOthelloPieces(this.board);
      return { white: counts.white, black: counts.black };
    }
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
    } else if (this.activeMode === "othello") {
      status = checkOthelloGameOver(this.board, this.turn);
    }

    if (status.isOver) {
      this.endGame(status.winner, status.reason);
    }
  }

  getBotVsBotThinkDelay() {
    const r = Math.random();
    let seconds;
    if (r < 0.40) {
      // 40% quick response: 2.0s - 7.0s
      seconds = 2.0 + Math.random() * 5.0;
    } else if (r < 0.80) {
      // 40% thoughtful move: 7.0s - 18.0s
      seconds = 7.0 + Math.random() * 11.0;
    } else {
      // 20% deep think: 18.0s - 29.5s (strictly <= 30s)
      seconds = 18.0 + Math.random() * 11.5;
    }
    const maxAllowedMs = Math.max(1000, (this.timeRemaining - 1) * 1000);
    const chosenMs = Math.round(seconds * 1000);
    return Math.min(29800, Math.min(chosenMs, maxAllowedMs));
  }

  triggerBotTurn() {
    if (this.botTimeout) clearTimeout(this.botTimeout);
    const isMultiJump = !!this.multiJumpFrom;
    const delay = isMultiJump
      ? 450
      : (this.mode === "bot_vs_bot" ? this.getBotVsBotThinkDelay() : (Math.random() * 250 + 380));
    this.botTimeout = setTimeout(() => {
      this.botTimeout = null;
      if (this.isGameOver || this.isPaused) return;

      const botPlayingColor = (this.mode === "bot_vs_bot") ? this.turn : (this.botColor || this.turn);

      if (this.modeIsCheckers()) {
        const ruleVar = this.activeMode === "checkers_thai" ? RULE_THAI : RULE_INTERNATIONAL;
        if (this.aiWorker) {
          this.aiWorker.postMessage({
            board: this.board,
            botColor: botPlayingColor,
            difficulty: this.botDifficulty,
            ruleVariant: ruleVar,
            requestId: Date.now()
          });
        } else {
          const best = getAICheckersMove(this.board, botPlayingColor, this.botDifficulty, ruleVar);
          if (best && !this.isPaused) this.executeMoveWithAnimation(best);
        }
      } else if (this.activeMode === "chess_makruk") {
        const best = getAIMakrukMove(this.board, botPlayingColor, this.botDifficulty);
        if (best && !this.isPaused) this.executeMoveWithAnimation(best);
      } else if (this.activeMode === "chess_western") {
        const best = getAIChessMove(this.chessFen, botPlayingColor, this.botDifficulty);
        if (best && !this.isPaused) this.executeMoveWithAnimation(best);
      } else if (this.activeMode === "othello") {
        const best = getAIOthelloMove(this.board, botPlayingColor, this.botDifficulty);
        if (best && !this.isPaused) this.executeMoveWithAnimation(best);
      }
    }, delay);
  }

  // --- TURN, PIECES & TIMER ---
  updateTurnUI() {
    const isWhite = this.turn === WHITE;
    const colorLabel = isWhite ? t("playerWhite") : t("playerBlack");
    const colorIcon = isWhite ? "⚪" : "⚫";

    if (this.role === "spectator" || this.mode === "bot_vs_bot") {
      let currentName = "";
      if (this.mode === "bot_vs_bot") {
        currentName = isWhite ? `🤖 ${t("botName")} 1` : `🤖 ${t("botName")} 2`;
      } else if (this.mode === "online") {
        const room = this.network.roomsState[this.network.currentRoomId];
        if (this.activeMode === "othello") {
          currentName = isWhite ? (room?.p2?.name || t("playerWhite")) : (room?.p1?.name || t("playerBlack"));
        } else {
          currentName = isWhite ? (room?.p1?.name || t("playerWhite")) : (room?.p2?.name || t("playerBlack"));
        }
      } else {
        currentName = colorLabel;
      }
      this.dom.turnBadge.textContent = `${t("turnStatusPrefix")} ${colorIcon} ${colorLabel} (${currentName})`;
    } else {
      const isMyTurn = this.turn === this.myColor;
      this.dom.turnBadge.textContent = isMyTurn 
        ? `${t("turnYour")} (${colorIcon} ${colorLabel})` 
        : `${t("turnOpponent")} (${colorIcon} ${colorLabel})`;
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

    if (!this.turnStartTime) {
      this.turnStartTime = Date.now();
    }
    if (!this.gameStats.startTime) {
      this.gameStats.startTime = Date.now();
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
    if (this.modeIsUno()) {
      if (this.unoState && this.unoState.currentTurn === this.myUnoIndex) {
        this.handlePlayerDrawUnoCard();
        this.handlePlayerPassUnoTurn();
      }
      return;
    }
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
        this.network.sendSyncState(this.board, this.turn, this.timeRemaining, this.activeMode, this.chessFen);
      }

      if (this.isMatchActive() && !this.isGameOver) {
        this.startTurnTimer();
      }
    }
  }

  endGame(winner, reason, isLanguageUpdate = false) {
    this.isGameOver = true;
    this.gameWinner = winner;
    this.gameReason = reason;
    this.stopTurnTimer();
    this.clearDisconnectCountdown();
    this.clearPauseSession();
    if (!isLanguageUpdate) {
      playVictory();
    }

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
      case "discs_count": reasonText = t("reasonDiscsCount"); break;
      default: reasonText = "";
    }

    this.dom.modalWinnerTitle.textContent = winnerText;
    this.dom.modalWinnerReason.textContent = reasonText;

    // Calculate & Display Match Statistics
    if (!isLanguageUpdate) {
      this.gameStats.endTime = Date.now();
    }
    const start = this.gameStats.startTime || this.gameStats.endTime;
    const totalSecs = Math.max(1, Math.round((this.gameStats.endTime - start) / 1000));
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const formattedTotalTime = mins > 0 
      ? `${mins} ${t("minuteShort")} ${secs} ${t("secondShort")}` 
      : `${secs} ${t("secondShort")}`;

    const durations = this.gameStats.turnDurations;
    const avgSecs = durations.length > 0 
      ? (durations.reduce((sum, d) => sum + d, 0) / durations.length).toFixed(1)
      : (totalSecs / Math.max(1, this.gameStats.totalMoves)).toFixed(1);

    const formattedTotalMoves = `${this.gameStats.totalMoves} ${t("statMovesUnit")}` +
      (this.gameStats.totalMoves > 0 ? ` (${t("statWhiteShort")} ${this.gameStats.whiteMoves} / ${t("statBlackShort")} ${this.gameStats.blackMoves})` : "");

    const counts = this.getPieceCounts();
    const formattedCaptures = this.activeMode === "othello"
      ? `${t("statWhiteShort")} ${counts.white} / ${t("statBlackShort")} ${counts.black}`
      : `${t("statWhiteShort")} ${this.capturedBlack} / ${t("statBlackShort")} ${this.capturedWhite}`;
    const formattedPromotions = this.activeMode === "othello"
      ? "—"
      : `${this.gameStats.promotions} ${t("statPromotionsUnit")}`;

    let modeName = "";
    switch (this.activeMode) {
      case "checkers_thai": modeName = t("ruleThaiShort"); break;
      case "checkers_international": modeName = t("ruleIntShort"); break;
      case "chess_makruk": modeName = t("ruleMakrukShort"); break;
      case "chess_western": modeName = t("ruleWesternShort"); break;
      case "othello": modeName = t("ruleOthelloShort"); break;
    }

    if (this.dom.modalStatMode) this.dom.modalStatMode.textContent = modeName;
    if (this.dom.statTotalTime) this.dom.statTotalTime.textContent = formattedTotalTime;
    if (this.dom.statAvgTime) this.dom.statAvgTime.textContent = `${avgSecs} ${t("secondShort")}`;
    if (this.dom.statTotalMoves) this.dom.statTotalMoves.textContent = formattedTotalMoves;
    if (this.dom.statCaptures) this.dom.statCaptures.textContent = formattedCaptures;
    if (this.dom.statPromotions) this.dom.statPromotions.textContent = formattedPromotions;
    if (this.dom.statResultDetail) this.dom.statResultDetail.textContent = winnerText;

    this.dom.gameOverModal.classList.remove("view-hidden");
  }

  resumeTurnTimer() {
    this.stopTurnTimer();
    if (!this.isMatchActive()) {
      this.dom.timerSeconds.textContent = "--";
      this.dom.timerBarFill.style.width = "100%";
      this.dom.timerBarFill.classList.remove("timer-danger");
      return;
    }

    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      if (!this.isMatchActive() || this.isPaused) {
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

  clearPauseSession() {
    if (this.pauseInterval) {
      clearInterval(this.pauseInterval);
      this.pauseInterval = null;
    }
    this.isPaused = false;
    this.pauseWaiting = false;
    if (this.dom.pauseModal) this.dom.pauseModal.classList.add("view-hidden");
    if (this.dom.pauseWaitingModal) this.dom.pauseWaitingModal.classList.add("view-hidden");
    if (this.dom.pauseRequestModal) this.dom.pauseRequestModal.classList.add("view-hidden");
    if (this.dom.confirmExitModal) this.dom.confirmExitModal.classList.add("view-hidden");
  }

  handlePauseClick() {
    if (this.isGameOver || !this.isMatchActive()) return;
    if (this.role === "spectator" && this.mode !== "bot_vs_bot") return;
    if (this.isPaused) {
      this.handleResumeClick();
      return;
    }

    if (this.mode === "bot" || this.mode === "bot_vs_bot") {
      // เล่นกับบอท หรือดูบอทแข่งกัน กดพักได้ทันที
      this.startPauseSession();
    } else if (this.mode === "online") {
      // เล่นออนไลน์ ต้องให้อีกฝั่งยินยอมก่อน
      this.requestOnlinePause();
    }
  }

  startPauseSession() {
    this.isPaused = true;
    this.stopTurnTimer();
    if (this.botTimeout) {
      clearTimeout(this.botTimeout);
      this.botTimeout = null;
    }

    this.pauseSecondsLeft = 180; // พักได้ครั้งละ 3 นาที
    this.updatePauseDisplay();
    if (this.dom.pauseModal) {
      this.dom.pauseModal.classList.remove("view-hidden");
    }

    if (this.pauseInterval) clearInterval(this.pauseInterval);
    this.pauseInterval = setInterval(() => {
      this.pauseSecondsLeft--;
      this.updatePauseDisplay();

      if (this.pauseSecondsLeft <= 0) {
        clearInterval(this.pauseInterval);
        this.pauseInterval = null;
        this.resumeGame(true); // กลับมานับเวลาเล่นต่ออัตโนมัติ
      }
    }, 1000);
  }

  updatePauseDisplay() {
    const mins = Math.floor(Math.max(0, this.pauseSecondsLeft) / 60);
    const secs = Math.max(0, this.pauseSecondsLeft) % 60;
    if (this.dom.pauseCountdown) {
      this.dom.pauseCountdown.textContent = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    if (this.dom.pauseBarFill) {
      const pct = (Math.max(0, this.pauseSecondsLeft) / 180) * 100;
      this.dom.pauseBarFill.style.width = `${pct}%`;
    }
  }

  requestOnlinePause() {
    if (this.pauseWaiting || this.isPaused) return;
    this.pauseWaiting = true;
    if (this.dom.pauseWaitingModal) {
      this.dom.pauseWaitingModal.classList.remove("view-hidden");
    }
    this.network.sendPauseRequest();
  }

  cancelOnlinePauseRequest() {
    this.pauseWaiting = false;
    if (this.dom.pauseWaitingModal) {
      this.dom.pauseWaitingModal.classList.add("view-hidden");
    }
  }

  handleOpponentPauseRequest(msg) {
    if (this.isGameOver || !this.isMatchActive() || this.isPaused) return;
    const opponentName = msg.senderName || t("opponentName");
    if (this.dom.pauseRequestMsg) {
      this.dom.pauseRequestMsg.textContent = t("pauseRequestText").replace("{name}", opponentName);
    }
    if (this.dom.pauseRequestModal) {
      this.dom.pauseRequestModal.classList.remove("view-hidden");
    }
  }

  respondToPauseRequest(accept) {
    if (this.dom.pauseRequestModal) {
      this.dom.pauseRequestModal.classList.add("view-hidden");
    }
    this.network.sendPauseResponse(accept);
    if (accept) {
      this.startPauseSession();
    }
  }

  handlePauseResponse(msg) {
    this.pauseWaiting = false;
    if (this.dom.pauseWaitingModal) {
      this.dom.pauseWaitingModal.classList.add("view-hidden");
    }

    if (msg.accepted) {
      this.startPauseSession();
    } else {
      if (this.dom.mandatoryNotice) {
        this.dom.mandatoryNotice.textContent = t("pauseDeclinedNotice");
        this.dom.mandatoryNotice.classList.remove("view-hidden");
        setTimeout(() => {
          if (!this.disconnectCountdownTimer && !this.isPaused && this.dom.mandatoryNotice) {
            this.dom.mandatoryNotice.classList.add("view-hidden");
          }
        }, 3000);
      }
    }
  }

  handleResumeClick() {
    if (this.mode === "online") {
      this.network.sendPauseResume();
    }
    this.resumeGame(false);
  }

  handleOpponentPauseResume() {
    this.resumeGame(false);
  }

  resumeGame(isAutoResume = false) {
    if (!this.isPaused) return;
    this.isPaused = false;
    if (this.pauseInterval) {
      clearInterval(this.pauseInterval);
      this.pauseInterval = null;
    }

    if (this.dom.pauseModal) this.dom.pauseModal.classList.add("view-hidden");
    if (this.dom.pauseWaitingModal) this.dom.pauseWaitingModal.classList.add("view-hidden");
    if (this.dom.pauseRequestModal) this.dom.pauseRequestModal.classList.add("view-hidden");

    if (isAutoResume && this.dom.mandatoryNotice) {
      this.dom.mandatoryNotice.textContent = t("pauseAutoResumeNotice");
      this.dom.mandatoryNotice.classList.remove("view-hidden");
      setTimeout(() => {
        if (!this.disconnectCountdownTimer && !this.isPaused && this.dom.mandatoryNotice) {
          this.dom.mandatoryNotice.classList.add("view-hidden");
        }
      }, 3000);
    }

    if (this.isMatchActive() && !this.isGameOver) {
      this.resumeTurnTimer();
    }

    if (((this.mode === "bot" && this.turn === this.botColor) || this.mode === "bot_vs_bot") && !this.isGameOver) {
      this.triggerBotTurn();
    }
    if (this.modeIsUno() && !this.isGameOver) {
      this.checkNextUnoTurn();
    }
  }

  // ==========================================
  // --- UNO GAMEPLAY & MULTIPLAYER METHODS ---
  // ==========================================

  changeUnoBotCount(delta) {
    this.unoBotCount = Math.max(1, Math.min(7, this.unoBotCount + delta));
    this.updateUnoBotCountDisplay();
  }

  updateUnoBotCountDisplay() {
    if (this.dom.unoBotCountDisplay) {
      this.dom.unoBotCountDisplay.textContent = t("unoBotCountFmt")
        .replace("{n}", this.unoBotCount)
        .replace("{total}", this.unoBotCount + 1);
    }
  }

  showUnoWaitingModal(room) {
    if (this.dom.unoWaitingModal) {
      this.dom.unoWaitingModal.classList.remove("view-hidden");
      this.renderUnoWaitingRoom(room);
    }
  }

  renderUnoWaitingRoom(room) {
    const players = (room && room.players) ? room.players : (this.network.roomsState[this.network.currentRoomId]?.players || []);
    if (!this.dom.unoWaitingPlayersList) return;

    this.dom.unoWaitingPlayersList.innerHTML = "";
    const isHost = players.length > 0 && players[0].id === this.network.clientId;

    if (isHost) {
      if (this.dom.unoHostControls) this.dom.unoHostControls.classList.remove("view-hidden");
      if (this.dom.unoWaitingNotice) this.dom.unoWaitingNotice.classList.add("view-hidden");
    } else {
      if (this.dom.unoHostControls) this.dom.unoHostControls.classList.add("view-hidden");
      if (this.dom.unoWaitingNotice) this.dom.unoWaitingNotice.classList.remove("view-hidden");
    }

    players.forEach((p, idx) => {
      const row = document.createElement("div");
      row.className = `uno-waiting-player-row ${p.isHost ? 'is-host' : ''}`;
      const isYou = p.id === this.network.clientId;
      const pName = p.isBot ? `${t("botName")} ${p.botNum || (idx + 1)}` : p.name;
      row.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span>${p.isBot ? '🤖' : '👤'}</span>
          <strong>${pName}</strong>
          ${isYou ? `<span style="font-size: 0.72rem; color: var(--accent-white); font-weight: 700;">(${t("youLabel")})</span>` : ''}
        </div>
        <div>
          ${p.isHost ? `<span style="font-size: 0.72rem; background: rgba(255,255,255,0.15); padding: 0.15rem 0.45rem; border-radius: 6px;">👑 ${t("hostBadge")}</span>` : `<span style="font-size: 0.72rem; color: var(--text-muted);">${t("playerPrefix")}${idx + 1}</span>`}
        </div>
      `;
      this.dom.unoWaitingPlayersList.appendChild(row);
    });
  }

  handleHostStartUnoMatch() {
    const room = this.network.roomsState[this.network.currentRoomId];
    if (!room || !room.players || room.players.length < 2) {
      alert(t("unoMinPlayersAlert"));
      return;
    }

    const unoState = setupUnoGame(room.players.length, room.mode || this.activeMode);
    const gameState = {
      unoState,
      unoPlayers: room.players
    };

    this.network.sendUnoStart(gameState);
    if (this.dom.unoWaitingModal) this.dom.unoWaitingModal.classList.add("view-hidden");
    this.startUnoGameWithState(gameState);
  }

  handleHostAddUnoBot() {
    const room = this.network.roomsState[this.network.currentRoomId];
    if (!room) return;
    if (!room.players) room.players = [];
    if (room.players.length >= 8) return;

    const botNum = room.players.filter(p => p.isBot).length + 1;
    const botObj = {
      id: "bot_" + Math.random().toString(36).substring(2, 7),
      botNum,
      name: `${t("botName")} ${botNum}`,
      isBot: true,
      isHost: false,
      cardCount: 7
    };
    room.players.push(botObj);
    this.network.sendUnoWaitingUpdate(room.players);
    this.renderUnoWaitingRoom(room);
  }

  handleHostRemoveUnoBot() {
    const room = this.network.roomsState[this.network.currentRoomId];
    if (!room || !room.players) return;
    const lastBotIdx = room.players.map(p => p.isBot).lastIndexOf(true);
    if (lastBotIdx !== -1) {
      room.players.splice(lastBotIdx, 1);
      this.network.sendUnoWaitingUpdate(room.players);
      this.renderUnoWaitingRoom(room);
    }
  }

  handleLeaveUnoWaitingRoom() {
    if (this.dom.unoWaitingModal) this.dom.unoWaitingModal.classList.add("view-hidden");
    this.network.leaveCurrentRoom();
    this.exitToLobby();
  }

  startUnoGameWithState(gameState) {
    this.unoState = gameState.unoState;
    this.unoPlayers = gameState.unoPlayers;
    this.myUnoIndex = this.unoPlayers.findIndex(p => p.id === this.network.clientId);
    if (this.myUnoIndex === -1) {
      this.myUnoIndex = this.role === "spectator" ? -1 : 0;
    }

    this.isGameOver = false;
    this.isPaused = false;
    this.hasDrawnThisTurn = false;
    this.pendingWildCardId = null;

    this.gameStats = {
      startTime: Date.now(),
      endTime: null,
      totalMoves: 0,
      whiteMoves: 0,
      blackMoves: 0,
      turnDurations: [],
      promotions: 0
    };
    this.turnStartTime = Date.now();

    this.showGameView();
    this.updateMatchTitle();
    this.renderUnoTable();
    this.startTurnTimer();

    this.checkNextUnoTurn();
  }

  createUnoCardElement(card, isPlayable) {
    const div = document.createElement("div");
    const sym = SUIT_SYMBOLS[card.suit] || "★";
    const valDisplay = ACTION_SYMBOLS[card.value] || card.value;
    const isAction = isNaN(Number(card.value));
    const isWildWord = card.value === "wild";
    div.className = `uno-card ${isPlayable ? 'playable' : 'unplayable'}`;
    div.setAttribute("data-card-id", card.id);
    div.innerHTML = `
      <div class="card-inner">
        <span class="card-sym">${sym}</span>
        <span class="card-val ${isWildWord ? 'is-wild' : (isAction ? 'is-action' : '')}">${valDisplay}</span>
      </div>
    `;
    return div;
  }

  renderUnoDiscardTopCard(card) {
    if (!card || !this.dom.unoDiscardPile) return;
    const sym = SUIT_SYMBOLS[card.suit] || "★";
    const valDisplay = ACTION_SYMBOLS[card.value] || card.value;
    const isAction = isNaN(Number(card.value));
    const isWildWord = card.value === "wild";
    this.dom.unoDiscardPile.className = "uno-card card-just-played";
    this.dom.unoDiscardPile.innerHTML = `
      <div class="card-inner">
        <span class="card-sym">${sym}</span>
        <span class="card-val ${isWildWord ? 'is-wild' : (isAction ? 'is-action' : '')}">${valDisplay}</span>
      </div>
    `;
    setTimeout(() => {
      if (this.dom.unoDiscardPile) {
        this.dom.unoDiscardPile.classList.remove("card-just-played");
      }
    }, 400);
  }

  isUnoSpectatorMode() {
    return this.modeIsUno() && (this.mode === "bot_vs_bot" || this.role === "spectator" || this.myUnoIndex === -1);
  }

  getUnoInspectedBotIdx() {
    if (!this.unoState) return 0;
    if (this.unoAutoFollow) {
      return this.unoState.currentTurn;
    }
    if (this.unoInspectedBotIdx !== null && this.unoInspectedBotIdx !== undefined && this.unoInspectedBotIdx >= 0 && this.unoInspectedBotIdx < this.unoPlayers.length) {
      return this.unoInspectedBotIdx;
    }
    return this.unoState.currentTurn;
  }

  setUnoInspectedBot(idx) {
    if (!this.isUnoSpectatorMode() || !this.unoState) return;
    if (idx < 0 || idx >= this.unoPlayers.length) return;
    this.unoInspectedBotIdx = idx;
    this.unoAutoFollow = false;
    this.renderUnoTable();
    this.renderPlayersList();
  }

  toggleUnoAutoFollow() {
    this.unoAutoFollow = !this.unoAutoFollow;
    if (this.unoAutoFollow && this.unoState) {
      this.unoInspectedBotIdx = this.unoState.currentTurn;
    }
    this.renderUnoTable();
    this.renderPlayersList();
  }

  renderUnoTable() {
    if (!this.unoState) return;

    const isSpectator = this.isUnoSpectatorMode();
    const inspectedIdx = isSpectator ? this.getUnoInspectedBotIdx() : this.myUnoIndex;

    // 1. Opponent Seats
    if (this.dom.unoOpponentsArea) {
      this.dom.unoOpponentsArea.innerHTML = "";
      this.unoPlayers.forEach((player, idx) => {
        if (!isSpectator && idx === this.myUnoIndex) return;
        const seat = document.createElement("div");
        const isTurn = this.unoState.currentTurn === idx;
        const isInspected = isSpectator && inspectedIdx === idx;
        seat.className = `uno-seat ${isTurn ? 'active-turn' : ''} ${isInspected ? 'is-inspected' : ''} ${isSpectator ? 'clickable-seat' : ''}`;
        const count = this.unoState.hands[idx] ? this.unoState.hands[idx].length : 0;
        const isUno = count === 1;
        const pName = player.isBot ? `${t("botName")} ${player.botNum || (idx + 1)}` : player.name;

        seat.innerHTML = `
          <span class="seat-avatar">${player.isBot ? '🤖' : '👤'}</span>
          <div class="seat-info">
            <span class="seat-name">${pName}</span>
            <span class="seat-cards-badge">🎴 ${count}</span>
          </div>
          ${isInspected ? `<span class="seat-inspect-pill">👁️ ${t("inspectingBadge")}</span>` : ''}
          ${isUno ? `<span class="seat-uno-pill">UNO!</span>` : ''}
        `;

        if (isSpectator) {
          seat.addEventListener("click", () => this.setUnoInspectedBot(idx));
          seat.title = t("unoSpectatorHint");
        }

        this.dom.unoOpponentsArea.appendChild(seat);
      });
    }

    // 2. Discard Pile Top Card
    const topCard = this.unoState.discardPile[this.unoState.discardPile.length - 1];
    this.renderUnoDiscardTopCard(topCard);

    // 3. Center Draw Pile & Status
    if (this.dom.unoDrawCountLabel) {
      this.dom.unoDrawCountLabel.textContent = t("pileCountText").replace("{n}", this.unoState.drawPile.length);
    }
    if (this.dom.unoDirectionBadge) {
      this.dom.unoDirectionBadge.textContent = this.unoState.direction === 1 ? "↻" : "↺";
    }
    if (this.dom.unoActiveSuitSym && this.dom.unoActiveSuitName) {
      this.dom.unoActiveSuitSym.textContent = SUIT_SYMBOLS[this.unoState.activeSuit] || "◯";
      this.dom.unoActiveSuitName.textContent = t(this.unoState.activeSuit + "Suit");
    }

    if (this.dom.unoStackPill) {
      if (this.unoState.pendingDrawCount > 0) {
        this.dom.unoStackPill.textContent = `+${this.unoState.pendingDrawCount}`;
        this.dom.unoStackPill.classList.remove("view-hidden");
      } else {
        this.dom.unoStackPill.classList.add("view-hidden");
      }
    }

    // 4. Controls & Spectator Hand Inspector Bar
    if (isSpectator) {
      if (this.dom.unoPlayerControls) this.dom.unoPlayerControls.classList.add("view-hidden");
      if (this.dom.unoActionDrawBtn) this.dom.unoActionDrawBtn.classList.add("view-hidden");
      if (this.dom.unoActionPassBtn) this.dom.unoActionPassBtn.classList.add("view-hidden");
      if (this.dom.unoShoutBtn) this.dom.unoShoutBtn.classList.add("view-hidden");

      if (this.dom.unoSpectatorBar) {
        this.dom.unoSpectatorBar.classList.remove("view-hidden");
        const inspectedPlayer = this.unoPlayers[inspectedIdx];
        const pName = inspectedPlayer ? (inspectedPlayer.isBot ? `${t("botName")} ${inspectedPlayer.botNum || (inspectedIdx + 1)}` : inspectedPlayer.name) : `${t("botName")} 1`;
        const isThinking = this.unoState.currentTurn === inspectedIdx;
        const statusNote = isThinking ? ` (${t("botThinkingStatus")})` : "";
        if (this.dom.unoSpectatorTitle) {
          this.dom.unoSpectatorTitle.innerHTML = `${t("unoSpectatorHandLabel")}: <strong>${pName}</strong>${statusNote}`;
        }
        if (this.dom.unoAutoFollowBtn) {
          this.dom.unoAutoFollowBtn.classList.toggle("active", this.unoAutoFollow);
          this.dom.unoAutoFollowBtn.textContent = this.unoAutoFollow ? t("unoAutoFollowOn") : t("unoAutoFollowOff");
        }
      }
    } else {
      if (this.dom.unoSpectatorBar) this.dom.unoSpectatorBar.classList.add("view-hidden");
      if (this.dom.unoPlayerControls) this.dom.unoPlayerControls.classList.remove("view-hidden");
    }

    // 5. Hand Cards
    if (this.dom.unoHandContainer) {
      this.dom.unoHandContainer.innerHTML = "";
      const isMyTurn = !isSpectator && (this.unoState.currentTurn === this.myUnoIndex);
      const isBotTurn = isSpectator && (this.unoState.currentTurn === inspectedIdx);
      const displayHand = this.unoState.hands[inspectedIdx] || [];

      displayHand.forEach(card => {
        const isPlayable = (isMyTurn || isBotTurn) && isCardPlayable(card, topCard, this.unoState.activeSuit, this.unoState.pendingDrawCount, this.unoState.ruleVariant);
        const cardEl = this.createUnoCardElement(card, isPlayable);
        if (isSpectator) {
          cardEl.classList.add("view-only");
        } else if (isPlayable) {
          cardEl.addEventListener("click", () => this.handlePlayerPlayUnoCard(card.id));
        }
        this.dom.unoHandContainer.appendChild(cardEl);
      });

      // Human Action Buttons
      if (!isSpectator) {
        if (this.dom.unoActionDrawBtn) {
          this.dom.unoActionDrawBtn.classList.toggle("view-hidden", !isMyTurn);
        }
        if (this.dom.unoActionPassBtn) {
          this.dom.unoActionPassBtn.classList.toggle("view-hidden", !(isMyTurn && this.hasDrawnThisTurn));
        }
        if (this.dom.unoShoutBtn) {
          const myHand = this.unoState.hands[this.myUnoIndex] || [];
          const canShout = myHand.length <= 2 && !this.unoState.unoShouted[this.myUnoIndex];
          this.dom.unoShoutBtn.classList.toggle("view-hidden", !canShout);
        }
      }
    }

    // 6. Turn Status Indicator
    this.updateUnoTurnStatusUI();
  }

  renderPlayersList() {
    if (!this.dom.playersList) return;

    if (this.modeIsUno()) {
      if (!this.unoPlayers || this.unoPlayers.length === 0) return;
      this.dom.playersList.innerHTML = "";

      this.unoPlayers.forEach((player, idx) => {
        const isTurn = this.unoState && this.unoState.currentTurn === idx;
        const isSelf = (idx === this.myUnoIndex && this.role !== "spectator");
        const count = this.unoState && this.unoState.hands && this.unoState.hands[idx] ? this.unoState.hands[idx].length : 0;
        const hasUno = this.unoState && this.unoState.calledUno && this.unoState.calledUno[idx];

        let displayName = "";
        let avatarIcon = "👤";

        if (player.isBot) {
          avatarIcon = "🤖";
          displayName = player.name || `${t("botName")} ${player.botNum || (idx + 1)}`;
        } else if (isSelf) {
          avatarIcon = player.isHost ? "👑" : "👤";
          const nick = this.network.getNickname() || player.name || t("defaultPlayerName");
          displayName = `${nick} (${t("youLabel")})`;
        } else {
          avatarIcon = player.isHost ? "👑" : "👤";
          displayName = player.name || `${t("defaultPlayerName")} ${idx + 1}`;
        }

        const isInspected = this.isUnoSpectatorMode() && this.getUnoInspectedBotIdx() === idx;
        const box = document.createElement("div");
        box.className = `player-box ${isTurn ? "active-turn-ring" : ""} ${isSelf ? "is-me" : ""} ${isInspected ? "is-inspected-player" : ""} ${this.isUnoSpectatorMode() ? "clickable-player" : ""}`;
        if (this.isUnoSpectatorMode()) {
          box.addEventListener("click", () => this.setUnoInspectedBot(idx));
          box.title = t("unoSpectatorHint");
        }
        box.innerHTML = `
          <div class="player-tag">
            <span class="player-avatar" style="font-size: 0.95rem; line-height: 1;">${avatarIcon}</span>
            <span class="player-name-text">${displayName}</span>
          </div>
          <div class="player-right-info" style="display: flex; align-items: center; gap: 0.35rem;">
            ${isInspected ? `<span class="seat-inspect-pill" style="font-size: 0.6rem; padding: 2px 5px;">👁️</span>` : ""}
            ${hasUno ? `<span class="uno-shout-pill" style="font-size: 0.65rem; padding: 2px 6px; background: #e02424; color: #fff; border-radius: 999px; font-weight: 700;">UNO!</span>` : ""}
            <span class="piece-count-badge">${count}</span>
          </div>
        `;
        this.dom.playersList.appendChild(box);
      });
      return;
    }

    // For 2-player board games (Checkers, Chess, Makruk, Othello)
    if (!document.getElementById("white-player-box") || !document.getElementById("black-player-box")) {
      this.dom.playersList.innerHTML = `
        <div id="white-player-box" class="player-box active-turn-ring">
          <div class="player-tag">
            <span class="player-dot dot-white"></span>
            <span id="white-player-name" class="player-name-text">⚪ ${t("playerWhite")}</span>
          </div>
          <span id="white-pieces-count" class="piece-count-badge">0</span>
        </div>
        <div id="black-player-box" class="player-box">
          <div class="player-tag">
            <span class="player-dot dot-black"></span>
            <span id="black-player-name" class="player-name-text">⚫ ${t("playerBlack")}</span>
          </div>
          <span id="black-pieces-count" class="piece-count-badge">0</span>
        </div>
      `;
      this.dom.whitePlayerBox = document.getElementById("white-player-box");
      this.dom.blackPlayerBox = document.getElementById("black-player-box");
      this.dom.whitePlayerName = document.getElementById("white-player-name");
      this.dom.blackPlayerName = document.getElementById("black-player-name");
      this.dom.whitePiecesCount = document.getElementById("white-pieces-count");
      this.dom.blackPiecesCount = document.getElementById("black-pieces-count");
    }

    if (this.mode === "bot_vs_bot") {
      const diffTitle = t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`);
      if (this.dom.whitePlayerName) this.dom.whitePlayerName.textContent = `⚪ ${t("playerWhite")}: 🤖 ${t("botName")} 1 (${diffTitle})`;
      if (this.dom.blackPlayerName) this.dom.blackPlayerName.textContent = `⚫ ${t("playerBlack")}: 🤖 ${t("botName")} 2 (${diffTitle})`;
    } else if (this.mode === "bot") {
      this.updateBotPlayerNames();
    } else if (this.mode === "online") {
      this.updateOnlinePlayerNames(this.network.roomsState[this.network.currentRoomId]);
    }

    this.updateTurnUI();
    this.updatePieceCounts();
  }

  updateUnoTurnStatusUI() {
    if (!this.unoState) return;
    const currentIdx = this.unoState.currentTurn;
    const currentPlayer = this.unoPlayers[currentIdx];
    const isMe = currentIdx === this.myUnoIndex && this.role !== "spectator";
    const name = isMe 
      ? `${this.network.getNickname()} (${t("youLabel")})` 
      : (currentPlayer ? (currentPlayer.isBot ? `${t("botName")} ${currentPlayer.botNum || (currentIdx + 1)}` : currentPlayer.name) : `${t("defaultPlayerName")} ${currentIdx + 1}`);

    if (this.dom.turnBadge) {
      if (isMe) {
        this.dom.turnBadge.textContent = t("turnYour");
      } else {
        this.dom.turnBadge.textContent = `${t("turnStatusPrefix")} ${name}`;
      }
    }

    this.renderPlayersList();
  }

  handlePlayerPlayUnoCard(cardId) {
    if (this.isGameOver || this.isPaused) return;
    if (this.unoState.currentTurn !== this.myUnoIndex) return;

    const myHand = this.unoState.hands[this.myUnoIndex];
    const card = myHand.find(c => c.id === cardId);
    if (!card) return;

    if (card.suit === "wild") {
      this.pendingWildCardId = cardId;
      if (this.dom.unoSuitModal) this.dom.unoSuitModal.classList.remove("view-hidden");
      return;
    }

    this.executePlayUnoCard(this.myUnoIndex, cardId, null);
  }

  handleSelectWildSuit(suit) {
    if (this.dom.unoSuitModal) this.dom.unoSuitModal.classList.add("view-hidden");
    if (!this.pendingWildCardId) return;
    const cardId = this.pendingWildCardId;
    this.pendingWildCardId = null;
    this.executePlayUnoCard(this.myUnoIndex, cardId, suit);
  }

  executePlayUnoCard(playerIdx, cardId, chosenSuit) {
    const res = playUnoCard(this.unoState, playerIdx, cardId, chosenSuit);
    if (!res.success) return;

    this.hasDrawnThisTurn = false;
    this.gameStats.totalMoves++;
    playMove();

    if (this.mode === "online") {
      this.network.sendUnoMove({
        playerIdx,
        cardId,
        chosenSuit,
        unoState: this.unoState
      });
    }

    if (res.isGameOver) {
      this.endUnoGame(res.winner);
      return;
    }

    this.renderUnoTable();
    this.startTurnTimer();
    this.checkNextUnoTurn();
  }

  handlePlayerDrawUnoCard() {
    if (this.isGameOver || this.isPaused) return;
    if (this.unoState.currentTurn !== this.myUnoIndex) return;

    if (this.unoState.pendingDrawCount > 0) {
      drawCardsToPlayer(this.unoState, this.myUnoIndex, this.unoState.pendingDrawCount);
      this.unoState.pendingDrawCount = 0;
      this.unoState.currentTurn = (this.myUnoIndex + this.unoState.direction + this.unoState.playerCount) % this.unoState.playerCount;
      playMove();
      if (this.mode === "online") {
        this.network.sendUnoDraw({
          playerIdx: this.myUnoIndex,
          unoState: this.unoState
        });
      }
      this.renderUnoTable();
      this.startTurnTimer();
      this.checkNextUnoTurn();
      return;
    }

    if (this.hasDrawnThisTurn) return;

    drawCardsToPlayer(this.unoState, this.myUnoIndex, 1);
    this.hasDrawnThisTurn = true;
    playMove();

    if (this.mode === "online") {
      this.network.sendUnoDraw({
        playerIdx: this.myUnoIndex,
        unoState: this.unoState
      });
    }

    this.renderUnoTable();
  }

  handlePlayerPassUnoTurn() {
    if (this.isGameOver || this.isPaused) return;
    if (this.unoState.currentTurn !== this.myUnoIndex) return;
    if (!this.hasDrawnThisTurn) return;

    passUnoTurn(this.unoState, this.myUnoIndex);
    this.hasDrawnThisTurn = false;

    if (this.mode === "online") {
      this.network.sendUnoPass({
        playerIdx: this.myUnoIndex,
        unoState: this.unoState
      });
    }

    this.renderUnoTable();
    this.startTurnTimer();
    this.checkNextUnoTurn();
  }

  handlePlayerShoutUno() {
    if (this.isGameOver || !this.unoState) return;
    shoutUno(this.unoState, this.myUnoIndex);
    playKing();
    if (this.mode === "online") {
      this.network.sendUnoShout(this.network.clientId, this.network.getNickname());
    }
    if (this.dom.unoShoutBtn) this.dom.unoShoutBtn.classList.add("view-hidden");
  }

  checkNextUnoTurn() {
    if (this.isGameOver || this.isPaused || !this.unoState) return;

    const currentIdx = this.unoState.currentTurn;
    const player = this.unoPlayers[currentIdx];

    if (player && player.isBot) {
      if (this.mode === "bot" || this.mode === "bot_vs_bot" || (this.mode === "online" && this.role === "player1")) {
        clearTimeout(this.botTimeout);
        const delay = this.mode === "bot_vs_bot" ? this.getBotVsBotThinkDelay() : 900;
        this.botTimeout = setTimeout(() => {
          if (this.isGameOver || this.isPaused) return;
          this.executeBotUnoTurn(currentIdx);
        }, delay);
      }
    }
  }

  executeBotUnoTurn(botIdx) {
    if (this.isGameOver || this.isPaused || !this.unoState) return;
    if (this.unoState.currentTurn !== botIdx) return;

    const action = getAIUnoAction(this.unoState, botIdx, this.botDifficulty);

    if (action.action === "draw") {
      if (this.unoState.pendingDrawCount > 0) {
        drawCardsToPlayer(this.unoState, botIdx, this.unoState.pendingDrawCount);
        this.unoState.pendingDrawCount = 0;
        this.unoState.currentTurn = (botIdx + this.unoState.direction + this.unoState.playerCount) % this.unoState.playerCount;
        playMove();
        if (this.mode === "online") {
          this.network.sendUnoDraw({ playerIdx: botIdx, unoState: this.unoState });
        }
        this.gameStats.totalMoves++;
        this.renderUnoTable();
        this.startTurnTimer();
        this.checkNextUnoTurn();
      } else {
        const drawn = drawCardsToPlayer(this.unoState, botIdx, 1);
        const topCard = this.unoState.discardPile[this.unoState.discardPile.length - 1];
        if (drawn[0] && isCardPlayable(drawn[0], topCard, this.unoState.activeSuit, 0, this.unoState.ruleVariant)) {
          const chosenSuit = drawn[0].suit === "wild" ? "circle" : null;
          if (this.isUnoSpectatorMode() && this.getUnoInspectedBotIdx() === botIdx) {
            this.renderUnoTable();
            const drawnEl = this.dom.unoHandContainer ? this.dom.unoHandContainer.querySelector(`[data-card-id="${drawn[0].id}"]`) : null;
            if (drawnEl) drawnEl.classList.add("bot-card-selected");
            if (this.dom.unoSpectatorTitle) {
              const pName = this.unoPlayers[botIdx] ? this.unoPlayers[botIdx].name : "";
              this.dom.unoSpectatorTitle.innerHTML = `${t("unoSpectatorHandLabel")}: <strong>${pName}</strong> (${t("botPlayingStatus")})`;
            }
            setTimeout(() => {
              this.finishBotUnoPlay(botIdx, { action: "play", cardId: drawn[0].id, chosenSuit });
            }, 450);
            return;
          }
          this.finishBotUnoPlay(botIdx, { action: "play", cardId: drawn[0].id, chosenSuit });
          return;
        } else {
          passUnoTurn(this.unoState, botIdx);
          playMove();
          if (this.mode === "online") {
            this.network.sendUnoDraw({ playerIdx: botIdx, unoState: this.unoState });
          }
          this.gameStats.totalMoves++;
          this.renderUnoTable();
          this.startTurnTimer();
          this.checkNextUnoTurn();
        }
      }
    } else if (action.action === "play") {
      if (this.isUnoSpectatorMode() && this.getUnoInspectedBotIdx() === botIdx) {
        const cardEl = this.dom.unoHandContainer ? this.dom.unoHandContainer.querySelector(`[data-card-id="${action.cardId}"]`) : null;
        if (cardEl) {
          cardEl.classList.add("bot-card-selected");
          if (this.dom.unoSpectatorTitle) {
            const pName = this.unoPlayers[botIdx] ? this.unoPlayers[botIdx].name : "";
            this.dom.unoSpectatorTitle.innerHTML = `${t("unoSpectatorHandLabel")}: <strong>${pName}</strong> (${t("botPlayingStatus")})`;
          }
          setTimeout(() => {
            this.finishBotUnoPlay(botIdx, action);
          }, 450);
          return;
        }
      }
      this.finishBotUnoPlay(botIdx, action);
    }
  }

  finishBotUnoPlay(botIdx, action) {
    if (this.isGameOver || this.isPaused || !this.unoState) return;
    const res = playUnoCard(this.unoState, botIdx, action.cardId, action.chosenSuit);
    playMove();
    if (this.mode === "online") {
      this.network.sendUnoMove({ playerIdx: botIdx, cardId: action.cardId, chosenSuit: action.chosenSuit, unoState: this.unoState });
    }
    if (res.isGameOver) {
      this.endUnoGame(res.winner);
      return;
    }

    this.gameStats.totalMoves++;
    this.renderUnoTable();
    this.startTurnTimer();
    this.checkNextUnoTurn();
  }

  handleUnoWaitingUpdate(players) {
    if (this.network.roomsState[this.network.currentRoomId]) {
      this.network.roomsState[this.network.currentRoomId].players = players;
    }
    this.renderUnoWaitingRoom({ players });
  }

  handleUnoStartReceived(gameState) {
    if (this.dom.unoWaitingModal) this.dom.unoWaitingModal.classList.add("view-hidden");
    this.startUnoGameWithState(gameState);
  }

  handleUnoMoveReceived(data) {
    if (this.isGameOver) return;
    this.unoState = data.unoState;
    this.gameStats.totalMoves++;
    playMove();
    this.renderUnoTable();
    this.startTurnTimer();
    this.checkNextUnoTurn();
  }

  handleUnoDrawReceived(data) {
    if (this.isGameOver) return;
    this.unoState = data.unoState;
    playMove();
    this.renderUnoTable();
    this.startTurnTimer();
    this.checkNextUnoTurn();
  }

  handleUnoPassReceived(data) {
    if (this.isGameOver) return;
    this.unoState = data.unoState;
    this.renderUnoTable();
    this.startTurnTimer();
    this.checkNextUnoTurn();
  }

  handleUnoShoutReceived(data) {
    playKing();
    if (data.playerName && this.dom.mandatoryNotice) {
      this.dom.mandatoryNotice.textContent = t("unoShoutedMsg").replace("{name}", data.playerName);
      this.dom.mandatoryNotice.classList.remove("view-hidden");
      setTimeout(() => {
        if (this.dom.mandatoryNotice) this.dom.mandatoryNotice.classList.add("view-hidden");
      }, 2500);
    }
    this.renderUnoTable();
  }

  endUnoGame(winnerIndex, isLanguageUpdate = false) {
    this.isGameOver = true;
    this.unoWinnerIndex = winnerIndex;
    this.stopTurnTimer();
    this.clearDisconnectCountdown();
    this.clearPauseSession();
    if (!isLanguageUpdate) {
      this.gameStats.endTime = Date.now();
      playVictory();
    }

    const winnerObj = this.unoPlayers[winnerIndex];
    const isMe = (winnerIndex === this.myUnoIndex && this.role !== "spectator");
    const winnerName = isMe 
      ? `${this.network.getNickname()} (${t("youLabel")})` 
      : (winnerObj ? (winnerObj.isBot ? `${t("botName")} ${winnerObj.botNum || (winnerIndex + 1)}` : winnerObj.name) : `${t("defaultPlayerName")} ${winnerIndex + 1}`);

    this.dom.modalWinnerTitle.textContent = isMe ? `🎉 ${t("gameOverTitle")}` : t("gameOverTitle");
    this.dom.modalWinnerReason.textContent = `${winnerName}: ${t("unoWinnerReason")}`;

    this.dom.modalStatMode.textContent = this.activeMode === "uno_stacking" ? t("ruleUnoStackingBadge") : t("ruleUnoStandardBadge");
    const totalSec = Math.max(1, Math.floor((this.gameStats.endTime - this.gameStats.startTime) / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    this.dom.statTotalTime.textContent = m > 0 ? `${m} ${t("minuteShort")} ${s} ${t("secondShort")}` : `${s} ${t("secondShort")}`;
    this.dom.statTotalMoves.textContent = `${this.gameStats.totalMoves} ${t("statMovesUnit")}`;

    const avgSec = this.gameStats.totalMoves > 0 ? (totalSec / this.gameStats.totalMoves).toFixed(1) : "0";
    this.dom.statAvgTime.textContent = `${avgSec} ${t("secondShort")}`;
    this.dom.statCaptures.textContent = "—";
    this.dom.statPromotions.textContent = "—";
    this.dom.statResultDetail.textContent = `${t("winnerPrefix")} ${winnerName}`;

    this.dom.gameOverModal.classList.remove("view-hidden");
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.app = new BoardGameApp();
});

