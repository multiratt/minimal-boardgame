// app.js - Main Application Orchestrator for Minimal Checkers

import {
  BOARD_SIZE,
  WHITE,
  BLACK,
  createInitialBoard,
  cloneBoard,
  getLegalMoves,
  getMovesForPiece,
  applyMove,
  checkGameOver,
  countPieces
} from "./rules.js";

import { getAIMove } from "./ai.js";
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

// Crown SVG markup for Kings (Horses)
const CROWN_SVG = `
<svg class="king-crown" viewBox="0 0 24 24">
  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>
</svg>`;

class CheckersApp {
  constructor() {
    this.network = new NetworkManager();

    // Game state
    this.mode = "bot"; // "bot" | "online"
    this.botDifficulty = "medium";
    this.board = createInitialBoard();
    this.turn = WHITE;
    this.myColor = WHITE;
    this.role = "player1"; // "player1" | "player2" | "spectator"
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.multiJumpFrom = null; // Locked piece during multi-jump
    this.isAnimating = false;
    this.isGameOver = false;

    // Timer state
    this.turnTimeLimit = 30; // seconds
    this.timeRemaining = 30;
    this.timerInterval = null;

    // Captured counts
    this.capturedWhite = 0;
    this.capturedBlack = 0;

    // AI Worker
    this.aiWorker = null;
    this.initWorker();

    // DOM references
    this.dom = {
      lobbyView: document.getElementById("lobby-view"),
      gameView: document.getElementById("game-view"),
      nicknameInput: document.getElementById("nickname-input"),
      saveNameBtn: document.getElementById("save-name-btn"),
      startBotBtn: document.getElementById("start-bot-btn"),
      diffBtns: document.querySelectorAll(".diff-btn"),
      roomsGrid: document.getElementById("rooms-grid"),
      refreshRoomsBtn: document.getElementById("refresh-rooms-btn"),
      exitLobbyBtn: document.getElementById("exit-lobby-btn"),
      resignGameBtn: document.getElementById("resign-game-btn"),
      matchInfoTitle: document.getElementById("match-info-title"),
      whitePlayerName: document.getElementById("white-player-name"),
      blackPlayerName: document.getElementById("black-player-name"),
      turnBadge: document.getElementById("turn-badge"),
      timerSeconds: document.getElementById("timer-seconds"),
      timerBarFill: document.getElementById("timer-bar-fill"),
      capturedWhiteCount: document.getElementById("captured-white-count"),
      capturedBlackCount: document.getElementById("captured-black-count"),
      mandatoryNotice: document.getElementById("mandatory-notice"),
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

    this.initEvents();
    this.initBoardDOM();
    this.renderLobbyRooms(this.network.roomsState);
    updateDOMTranslations();
    this.updateSoundButtonUI();

    // Restore saved nickname
    if (this.network.getNickname()) {
      this.dom.nicknameInput.value = this.network.getNickname();
    }
  }

  initWorker() {
    try {
      this.aiWorker = new Worker(new URL("./ai-worker.js", import.meta.url), { type: "module" });
      this.aiWorker.onmessage = (e) => {
        const { bestMove } = e.data;
        if (bestMove && !this.isGameOver && this.turn === BLACK && this.mode === "bot") {
          this.executeMoveWithAnimation(bestMove);
        }
      };
    } catch (e) {
      console.warn("Web Worker fallback to direct execution:", e);
      this.aiWorker = null;
    }
  }

  initEvents() {
    // Language Switcher
    this.dom.langThBtn.addEventListener("click", () => {
      setLang("th");
      this.updateHeaderTexts();
      this.updateTurnUI();
      this.renderLobbyRooms(this.network.roomsState);
    });

    this.dom.langEnBtn.addEventListener("click", () => {
      setLang("en");
      this.updateHeaderTexts();
      this.updateTurnUI();
      this.renderLobbyRooms(this.network.roomsState);
    });

    // Sound toggle
    this.dom.soundBtn.addEventListener("click", () => {
      toggleSound();
      this.updateSoundButtonUI();
    });

    // Nickname save
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

    // Bot difficulty selection
    this.dom.diffBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.dom.diffBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.botDifficulty = btn.getAttribute("data-diff");
      });
    });

    // Start Bot Game
    this.dom.startBotBtn.addEventListener("click", () => {
      this.startBotGame();
    });

    // Refresh Rooms
    this.dom.refreshRoomsBtn.addEventListener("click", () => {
      this.renderLobbyRooms(this.network.roomsState);
    });

    // Exit to Lobby
    this.dom.exitLobbyBtn.addEventListener("click", () => {
      this.exitToLobby();
    });

    // Resign
    this.dom.resignGameBtn.addEventListener("click", () => {
      if (this.isGameOver || this.role === "spectator") return;
      this.handleResign(this.myColor);
    });

    // Game Over Modal buttons
    this.dom.modalReplayBtn.addEventListener("click", () => {
      this.dom.gameOverModal.classList.add("view-hidden");
      if (this.mode === "bot") {
        this.startBotGame();
      } else {
        this.network.sendRestart();
        this.resetGameRound();
      }
    });

    this.dom.modalLobbyBtn.addEventListener("click", () => {
      this.dom.gameOverModal.classList.add("view-hidden");
      this.exitToLobby();
    });

    // Network callbacks
    this.network.onLobbyUpdated = (roomsState) => {
      this.renderLobbyRooms(roomsState);
    };

    this.network.onRoomStateChanged = (room, action, meta) => {
      if (this.mode === "online") {
        this.handleOnlineRoomUpdate(room, action, meta);
      }
    };

    this.network.onMoveReceived = (msg) => {
      if (this.mode === "online" && !this.isGameOver) {
        this.executeMoveWithAnimation(msg.move, true);
      }
    };

    this.network.onGameResigned = (resigningColor) => {
      if (this.mode === "online" && !this.isGameOver) {
        const winner = resigningColor === WHITE ? BLACK : WHITE;
        this.endGame(winner, "resign");
      }
    };

    this.network.onGameRestarted = () => {
      if (this.mode === "online") {
        this.dom.gameOverModal.classList.add("view-hidden");
        this.resetGameRound();
      }
    };

    this.network.onOpponentLeft = (opponentName) => {
      if (this.mode === "online" && !this.isGameOver) {
        const winner = this.myColor;
        this.endGame(winner, "opponent_left");
      }
    };
  }

  updateSoundButtonUI() {
    const on = isSoundEnabled();
    this.dom.soundIcon.textContent = on ? "🔊" : "🔇";
    this.dom.soundText.textContent = on ? t("soundOn") : t("soundOff");
  }

  updateHeaderTexts() {
    updateDOMTranslations();
    this.updateSoundButtonUI();
  }

  // --- LOBBY RENDERING ---
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
          <span class="room-title">${t("room")} #${r}</span>
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
          <span class="spectator-count">👁️ ${room.spectators || 0} ${t("spectatorsCount")}</span>
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

    // Attach button handlers
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

  // --- START MODES ---
  startBotGame() {
    this.mode = "bot";
    this.myColor = WHITE;
    this.role = "player1";
    this.dom.matchInfoTitle.textContent = `VS BOT [${t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`)}]`;
    this.dom.whitePlayerName.textContent = this.network.getNickname();
    this.dom.blackPlayerName.textContent = `BOT (${t(`diff${this.botDifficulty.charAt(0).toUpperCase() + this.botDifficulty.slice(1)}`)})`;

    this.showGameView();
    this.resetGameRound();
  }

  joinOnlineRoom(roomId, asSpectator = false) {
    this.mode = "online";
    const res = this.network.joinRoom(roomId, asSpectator);
    this.role = res.role;

    if (this.role === "player1") {
      this.myColor = WHITE;
    } else if (this.role === "player2") {
      this.myColor = BLACK;
    } else {
      this.role = "spectator";
      this.myColor = null;
    }

    this.dom.matchInfoTitle.textContent = `${t("room")} #${roomId} ${this.role === "spectator" ? `• ${t("spectatingBadge")}` : ""}`;
    this.updateOnlinePlayerNames(res.roomState);

    this.showGameView();
    this.resetGameRound();

    // If joined as player 1 and alone, show waiting status
    if (this.role === "player1" && !res.roomState.p2) {
      this.dom.mandatoryNotice.textContent = t("waitingOpponentJoin");
      this.dom.mandatoryNotice.classList.remove("view-hidden");
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

    if (action === "join" && meta.role === "player2") {
      this.dom.mandatoryNotice.classList.add("view-hidden");
      // If we are Host (Player 1), sync our initial board to Player 2
      if (this.role === "player1") {
        this.network.sendSyncState(this.board, this.turn, this.timeRemaining);
      }
    } else if (action === "sync" && meta.board) {
      this.board = cloneBoard(meta.board);
      this.turn = meta.turn;
      this.timeRemaining = meta.timeRemaining || 30;
      this.renderBoard();
      this.updateTurnUI();
    }
  }

  showGameView() {
    this.dom.lobbyView.classList.add("view-hidden");
    this.dom.gameView.classList.remove("view-hidden");
  }

  exitToLobby() {
    this.stopTurnTimer();
    if (this.mode === "online") {
      this.network.leaveCurrentRoom();
    }
    this.dom.gameView.classList.add("view-hidden");
    this.dom.lobbyView.classList.remove("view-hidden");
    this.renderLobbyRooms(this.network.roomsState);
  }

  resetGameRound() {
    this.board = createInitialBoard();
    this.turn = WHITE;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.multiJumpFrom = null;
    this.isAnimating = false;
    this.isGameOver = false;
    this.capturedWhite = 0;
    this.capturedBlack = 0;
    this.updateCapturedUI();

    this.renderBoard();
    this.updateTurnUI();
    this.startTurnTimer();
  }

  // --- BOARD RENDERING & INTERACTION ---
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
      const piece = this.board[r][c];

      // Reset markers
      sq.classList.remove("selected");
      sq.innerHTML = "";

      if (piece) {
        const pieceEl = document.createElement("div");
        pieceEl.className = `piece ${piece.color === WHITE ? "piece-white" : "piece-black"}`;
        pieceEl.dataset.id = piece.id;

        if (piece.isKing) {
          pieceEl.innerHTML = CROWN_SVG;
        }

        sq.appendChild(pieceEl);
      }
    }

    // Highlight selected square & legal destinations
    if (this.selectedSquare) {
      const idx = this.selectedSquare.r * BOARD_SIZE + this.selectedSquare.c;
      if (squares[idx]) {
        squares[idx].classList.add("selected");
      }

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

    // Check mandatory notice
    const allLegal = getLegalMoves(this.board, this.turn);
    if (allLegal.isJump && !this.isGameOver) {
      this.dom.mandatoryNotice.textContent = t("mandatoryJumpNotice");
      this.dom.mandatoryNotice.classList.remove("view-hidden");
    } else {
      this.dom.mandatoryNotice.classList.add("view-hidden");
    }
  }

  handleSquareClick(r, c) {
    if (this.isAnimating || this.isGameOver) return;
    if (this.role === "spectator") return;

    // Check turn ownership
    if (this.turn !== this.myColor) return;

    // If locked in multi-jump sequence
    if (this.multiJumpFrom) {
      if (r !== this.multiJumpFrom.r || c !== this.multiJumpFrom.c) {
        const move = this.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
        if (move) {
          this.executeMoveWithAnimation(move);
        }
        return;
      }
    }

    const clickedPiece = this.board[r][c];

    // If clicking own piece
    if (clickedPiece && clickedPiece.color === this.turn) {
      const legalMoves = getMovesForPiece(this.board, r, c, this.turn);
      if (legalMoves.length > 0) {
        this.selectedSquare = { r, c };
        this.legalMovesForSelected = legalMoves;
        this.renderBoard();
        return;
      }
    }

    // If clicking target square
    if (this.selectedSquare) {
      const move = this.legalMovesForSelected.find(m => m.to.r === r && m.to.c === c);
      if (move) {
        this.executeMoveWithAnimation(move);
      } else {
        // Deselect if clicking non-valid empty square
        if (!this.multiJumpFrom) {
          this.selectedSquare = null;
          this.legalMovesForSelected = [];
          this.renderBoard();
        }
      }
    }
  }

  // --- KINETIC ANIMATIONS & MOVE EXECUTION ---
  async executeMoveWithAnimation(move, fromRemote = false) {
    this.isAnimating = true;

    const fromIdx = move.from.r * BOARD_SIZE + move.from.c;
    const toIdx = move.to.r * BOARD_SIZE + move.to.c;
    const squares = this.dom.boardContainer.children;
    const fromSq = squares[fromIdx];
    const toSq = squares[toIdx];
    const pieceEl = fromSq.querySelector(".piece");

    // 1. Piece Movement Animation (ตอนเดิน)
    if (pieceEl && fromSq && toSq) {
      const fromRect = fromSq.getBoundingClientRect();
      const toRect = toSq.getBoundingClientRect();
      const deltaX = toRect.left - fromRect.left;
      const deltaY = toRect.top - fromRect.top;

      pieceEl.classList.add("piece-moving");
      playMove();

      // Smooth translation
      pieceEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      await new Promise(res => setTimeout(res, 280));
    }

    // 2. Destruction Animation (ตอนโดนทำลาย)
    if (move.captured) {
      const capIdx = move.captured.r * BOARD_SIZE + move.captured.c;
      const capSq = squares[capIdx];
      const capPieceEl = capSq ? capSq.querySelector(".piece") : null;

      if (capPieceEl) {
        capPieceEl.classList.add("piece-destroyed");

        // Shockwave ripple
        const shockwave = document.createElement("div");
        shockwave.className = "capture-shockwave";
        capSq.appendChild(shockwave);

        playCapture();
        await new Promise(res => setTimeout(res, 220));
      }
    }

    // Apply move in game rules engine
    const outcome = applyMove(this.board, move);
    this.board = outcome.board;

    // Track captured pieces count
    if (move.captured) {
      if (move.captured.piece.color === WHITE) {
        this.capturedWhite++;
      } else {
        this.capturedBlack++;
      }
      this.updateCapturedUI();
    }

    // 3. King Promotion Animation (การแปลงเป็น horse / ฮอส)
    if (outcome.promoted) {
      playKing();
      // Render board so piece is at new cell
      this.renderBoard();
      const newPieceEl = toSq.querySelector(".piece");
      if (newPieceEl) {
        newPieceEl.classList.add("piece-promoting");

        // Ripple badge
        const promoRing = document.createElement("div");
        promoRing.className = "promotion-ripple";
        toSq.appendChild(promoRing);

        const crown = newPieceEl.querySelector(".king-crown");
        if (crown) crown.classList.add("crown-animating");

        await new Promise(res => setTimeout(res, 450));
      }
    }

    // Multi-jump check
    if (outcome.furtherJumps.length > 0) {
      this.multiJumpFrom = { r: move.to.r, c: move.to.c };
      this.selectedSquare = this.multiJumpFrom;
      this.legalMovesForSelected = outcome.furtherJumps;
      this.renderBoard();
      this.isAnimating = false;

      // If Bot has further jump, chain immediately after slight pause
      if (this.mode === "bot" && this.turn === BLACK) {
        setTimeout(() => {
          const nextAIMove = outcome.furtherJumps[0];
          this.executeMoveWithAnimation(nextAIMove);
        }, 350);
      }
      return;
    }

    // Turn complete
    this.multiJumpFrom = null;
    this.selectedSquare = null;
    this.legalMovesForSelected = [];
    this.turn = outcome.nextTurn;

    this.renderBoard();
    this.updateTurnUI();
    this.isAnimating = false;

    // Broadcast move to network if online and move was local
    if (this.mode === "online" && !fromRemote) {
      this.network.sendMove(move, this.board, this.turn, this.timeRemaining);
    }

    // Reset turn timer
    this.startTurnTimer();

    // Check game over
    const gameOverStatus = checkGameOver(this.board, this.turn);
    if (gameOverStatus.isOver) {
      this.endGame(gameOverStatus.winner, gameOverStatus.reason);
      return;
    }

    // If vs BOT and it is now BOT's turn
    if (this.mode === "bot" && this.turn === BLACK && !this.isGameOver) {
      this.triggerBotTurn();
    }
  }

  triggerBotTurn() {
    const delay = Math.random() * 250 + 400; // Human-like reaction time
    setTimeout(() => {
      if (this.aiWorker) {
        this.aiWorker.postMessage({
          board: this.board,
          botColor: BLACK,
          difficulty: this.botDifficulty,
          requestId: Date.now()
        });
      } else {
        const bestMove = getAIMove(this.board, BLACK, this.botDifficulty);
        if (bestMove && !this.isGameOver) {
          this.executeMoveWithAnimation(bestMove);
        }
      }
    }, delay);
  }

  // --- TURN & TIMER ---
  updateTurnUI() {
    const isWhite = this.turn === WHITE;
    this.dom.turnBadge.textContent = isWhite ? t("turnWhite") : t("turnBlack");

    const whiteCard = document.getElementById("white-player-info");
    const blackCard = document.getElementById("black-player-info");
    if (whiteCard && blackCard) {
      if (isWhite) {
        whiteCard.classList.add("active-turn-ring");
        blackCard.classList.remove("active-turn-ring");
      } else {
        whiteCard.classList.remove("active-turn-ring");
        blackCard.classList.add("active-turn-ring");
      }
    }
  }

  updateCapturedUI() {
    this.dom.capturedWhiteCount.textContent = this.capturedWhite;
    this.dom.capturedBlackCount.textContent = this.capturedBlack;
  }

  startTurnTimer() {
    this.stopTurnTimer();
    this.timeRemaining = this.turnTimeLimit;
    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
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
    if (this.isGameOver) return;
    const losingPlayer = this.turn;
    const winningPlayer = losingPlayer === WHITE ? BLACK : WHITE;
    this.endGame(winningPlayer, "timeout");
  }

  handleResign(resigningColor) {
    if (this.isGameOver) return;
    const winningColor = resigningColor === WHITE ? BLACK : WHITE;
    if (this.mode === "online") {
      this.network.sendResign(resigningColor);
    }
    this.endGame(winningColor, "resign");
  }

  endGame(winner, reason) {
    this.isGameOver = true;
    this.stopTurnTimer();
    playVictory();

    let winnerText = winner === WHITE ? t("winnerWhite") : t("winnerBlack");
    let reasonText = "";

    switch (reason) {
      case "elimination":
        reasonText = t("reasonElimination");
        break;
      case "blocked":
        reasonText = t("reasonBlocked");
        break;
      case "timeout":
        reasonText = t("reasonTimeout");
        break;
      case "resign":
        reasonText = t("reasonResign");
        break;
      case "opponent_left":
        reasonText = t("opponentDisconnected");
        break;
      default:
        reasonText = "";
    }

    this.dom.modalWinnerTitle.textContent = winnerText;
    this.dom.modalWinnerReason.textContent = reasonText;
    this.dom.gameOverModal.classList.remove("view-hidden");
  }
}

// Bootstrap application on DOM ready
window.addEventListener("DOMContentLoaded", () => {
  window.app = new CheckersApp();
});
