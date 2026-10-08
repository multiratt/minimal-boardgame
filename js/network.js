// network.js - Realtime 4-Room Multiplayer & Spectator System
// Supports both internet-wide MQTT (over Secure WebSockets) and local multi-tab BroadcastChannel

export const MAX_ROOMS = 4;
const LOBBY_TOPIC = "minimal_board_games_v4/lobby";
const ROOM_TOPIC_PREFIX = "minimal_board_games_v4/room/";
const BROADCAST_CHANNEL_NAME = "minimal_board_games_v4_bc";

const BROKERS = [
  "wss://broker.hivemq.com:8884/mqtt"
];

export class NetworkManager {
  constructor() {
    let storedId = null;
    try {
      storedId = sessionStorage.getItem("board_game_client_id");
      if (!storedId) {
        storedId = "user_" + Math.random().toString(36).substring(2, 9);
        sessionStorage.setItem("board_game_client_id", storedId);
      }
    } catch (e) {
      storedId = "user_" + Math.random().toString(36).substring(2, 9);
    }
    this.clientId = storedId;
    this.nickname = localStorage.getItem("checkers_nickname") || "";
    this.currentRoomId = null;
    this.role = null; // "player1" | "player2" | "spectator"
    this.mqttClient = null;
    this.broadcastChannel = null;
    this.isConnected = false;
    this.currentBrokerIndex = 0;

    // Room registry (Rooms 1 to 4)
    this.roomsState = {};
    for (let i = 1; i <= MAX_ROOMS; i++) {
      this.roomsState[i] = {
        roomId: i,
        status: "empty", // "empty", "waiting", "playing"
        mode: null,      // "checkers_thai" | "checkers_international" | "chess_makruk" | "chess_western"
        p1: null,        // { id, name }
        p2: null,        // { id, name }
        spectators: 0,
        spectatorList: [],
        lastHeartbeat: 0
      };
    }

    // Callbacks
    this.onLobbyUpdated = null;
    this.onRoomStateChanged = null;
    this.onMoveReceived = null;
    this.onGameResigned = null;
    this.onGameRestarted = null;
    this.onOpponentLeft = null;
    this.onOpponentConnectionChanged = null; // (isConnected: boolean) => void

    // UNO Multiplayer Callbacks
    this.onUnoStart = null;
    this.onUnoMove = null;
    this.onUnoDraw = null;
    this.onUnoPass = null;
    this.onUnoShout = null;
    this.onUnoSync = null;
    this.onUnoWaitingUpdate = null;

    this.lastOpponentPing = 0;
    this.isOpponentConnected = true;

    this.heartbeatInterval = null;
    this.initBroadcastChannel();
    this.connectMQTT();
    this.startHeartbeatTimer();
  }

  setNickname(name) {
    this.nickname = name.trim();
    localStorage.setItem("checkers_nickname", this.nickname);
  }

  getNickname() {
    return this.nickname || "Player_" + this.clientId.substring(5, 8);
  }

  addSpectator(room, id, name) {
    if (!room) return;
    if (!room.spectatorList) room.spectatorList = [];
    room.spectatorList = room.spectatorList.filter(s => (typeof s === "string" ? s !== id : s.id !== id));
    room.spectatorList.push({ id, name: name || "Guest" });
    room.spectators = room.spectatorList.length;
  }

  removeSpectator(room, id) {
    if (!room) return;
    if (!room.spectatorList) room.spectatorList = [];
    room.spectatorList = room.spectatorList.filter(s => (typeof s === "string" ? s !== id : s.id !== id));
    room.spectators = room.spectatorList.length;
  }

  getSpectatorNames(room) {
    if (!room || !room.spectatorList) return [];
    return room.spectatorList.map(s => (typeof s === "string" ? s : (s.name || s.id))).filter(Boolean);
  }

  initBroadcastChannel() {
    if (typeof BroadcastChannel !== "undefined") {
      try {
        this.broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingRawMessage("bc", event.data);
        };
      } catch (e) {
        console.warn("BroadcastChannel unavailable:", e);
      }
    }
  }

  connectMQTT() {
    const mqttObj = typeof window !== "undefined" ? window.mqtt : (typeof globalThis !== "undefined" ? globalThis.mqtt : null);
    if (!mqttObj || typeof mqttObj.connect !== "function") {
      console.warn("MQTT library not ready; waiting before connect.");
      setTimeout(() => this.connectMQTT(), 500);
      return;
    }

    if (this.mqttClient) {
      try {
        this.mqttClient.removeAllListeners();
        this.mqttClient.end(true);
      } catch (e) {}
      this.mqttClient = null;
    }

    const brokerUrl = BROKERS[0];
    const mqttClientId = (this.clientId || "user") + "_" + Math.random().toString(36).substring(2, 7);

    try {
      this.mqttClient = mqttObj.connect(brokerUrl, {
        clientId: mqttClientId,
        clean: true,
        connectTimeout: 30000,
        reconnectPeriod: 3000
      });

      this.mqttClient.on("connect", () => {
        this.isConnected = true;
        // Subscribe to lobby topic
        this.mqttClient.subscribe(LOBBY_TOPIC);
        if (this.currentRoomId) {
          this.mqttClient.subscribe(ROOM_TOPIC_PREFIX + this.currentRoomId);
        }

        // Immediately request active room states from other clients
        this.queryLobby();
        if (this.currentRoomId) {
          this.sendRoomHeartbeat();
        }
      });

      this.mqttClient.on("message", (topic, payload) => {
        try {
          const msg = JSON.parse(payload.toString());
          this.handleIncomingRawMessage(topic, msg);
        } catch (e) {
          // ignore malformed message
        }
      });

      this.mqttClient.on("error", (err) => {
        console.warn("MQTT connection error on", brokerUrl, err.message);
      });

      this.mqttClient.on("close", () => {
        this.isConnected = false;
      });

      this.mqttClient.on("offline", () => {
        this.isConnected = false;
      });

      this.mqttClient.on("reconnect", () => {
        console.log("MQTT reconnecting to", brokerUrl);
      });
    } catch (e) {
      console.warn("MQTT init error:", e);
    }
  }

  broadcast(topic, payload) {
    // 1. BroadcastChannel (local tabs on same browser)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({ topic, payload });
      } catch (e) {}
    }
    // 2. Internet MQTT WebSocket (across different machines)
    if (this.mqttClient) {
      try {
        this.mqttClient.publish(topic, JSON.stringify(payload));
      } catch (e) {}
    }
  }

  queryLobby() {
    this.broadcast(LOBBY_TOPIC, {
      type: "LOBBY_QUERY",
      senderId: this.clientId
    });
  }

  handleIncomingRawMessage(source, data) {
    let topic = source;
    let payload = data;
    if (source === "bc") {
      topic = data.topic;
      payload = data.payload;
    }

    if (!payload || payload.senderId === this.clientId) {
      return; // Ignore self echo
    }

    // Lobby events
    if (topic === LOBBY_TOPIC) {
      if (payload.type === "LOBBY_HEARTBEAT") {
        this.handleLobbyHeartbeat(payload);
        return;
      }
      if (payload.type === "LOBBY_QUERY") {
        // Someone entered the lobby: if we are occupying a room, reply immediately!
        if (this.currentRoomId && (this.role === "player1" || this.role === "player2" || (this.roomsState[this.currentRoomId] && this.roomsState[this.currentRoomId].status !== "empty"))) {
          this.sendRoomHeartbeat();
        }
        return;
      }
    }

    // Room events
    if (topic === ROOM_TOPIC_PREFIX + this.currentRoomId) {
      this.handleRoomMessage(payload);
    }
  }

  handleLobbyHeartbeat(data) {
    const { roomId, roomState } = data;
    if (roomId >= 1 && roomId <= MAX_ROOMS && roomState) {
      this.roomsState[roomId] = {
        ...this.roomsState[roomId],
        ...roomState,
        lastHeartbeat: Date.now()
      };
      if (this.onLobbyUpdated) {
        this.onLobbyUpdated(this.roomsState);
      }
    }
  }

  sendRoomHeartbeat() {
    if (!this.currentRoomId) return;
    const state = this.roomsState[this.currentRoomId];
    this.broadcast(LOBBY_TOPIC, {
      type: "LOBBY_HEARTBEAT",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      roomState: state
    });
  }

  startHeartbeatTimer() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      let changed = false;

      // 1. Clean stale rooms that haven't sent a heartbeat for 15 seconds
      for (let r = 1; r <= MAX_ROOMS; r++) {
        if (r !== this.currentRoomId && this.roomsState[r].status !== "empty") {
          if (now - this.roomsState[r].lastHeartbeat > 15000) {
            this.roomsState[r] = {
              roomId: r,
              status: "empty",
              mode: null,
              p1: null,
              p2: null,
              spectators: 0,
              spectatorList: [],
              lastHeartbeat: 0
            };
            changed = true;
          }
        }
      }

      if (changed && this.onLobbyUpdated) {
        this.onLobbyUpdated(this.roomsState);
      }

      // 2. If sitting in a room as a player, send periodic heartbeat to lobby & ping in room
      if (this.currentRoomId && (this.role && this.role.startsWith("player"))) {
        this.sendRoomHeartbeat();
        
        // Send ping within the room to keep live connection alive
        this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
          type: "ROOM_PING",
          senderId: this.clientId,
          roomId: this.currentRoomId
        });

        const currentRoom = this.roomsState[this.currentRoomId];
        // If match is active, check if opponent stopped responding
        if (currentRoom && currentRoom.status === "playing" && this.lastOpponentPing > 0) {
          if (now - this.lastOpponentPing > 4500) {
            if (this.isOpponentConnected) {
              this.isOpponentConnected = false;
              if (this.onOpponentConnectionChanged) {
                this.onOpponentConnectionChanged(false);
              }
            }
          }
        }
      }

      // 3. If in lobby, query occasionally
      if (!this.currentRoomId) {
        this.queryLobby();
      }
    }, 1800);
  }

  joinRoom(roomId, asSpectator = false, gameMode = null) {
    this.currentRoomId = roomId;
    const room = this.roomsState[roomId];

    if (this.mqttClient) {
      try {
        this.mqttClient.subscribe(ROOM_TOPIC_PREFIX + roomId);
      } catch (e) {}
    }

    if (!room.mode && gameMode) {
      room.mode = gameMode;
    }

    const isUno = (room.mode && room.mode.startsWith("uno")) || (gameMode && gameMode.startsWith("uno"));

    if (isUno) {
      if (!room.players) room.players = [];
      if (asSpectator) {
        this.role = "spectator";
        this.addSpectator(room, this.clientId, this.getNickname());
      } else {
        const existingIdx = room.players.findIndex(p => p.id === this.clientId);
        if (existingIdx !== -1) {
          room.players[existingIdx].name = this.getNickname();
          this.role = room.players[existingIdx].isHost ? "player1" : ("player" + (existingIdx + 1));
        } else if (room.status !== "playing" && room.players.length < 8) {
          const isHost = room.players.length === 0;
          const pObj = { id: this.clientId, name: this.getNickname(), isHost, cardCount: 7 };
          room.players.push(pObj);
          this.role = isHost ? "player1" : ("player" + room.players.length);
          room.p1 = room.players[0];
          room.p2 = room.players[1] || null;
          room.status = "waiting";
        } else {
          this.role = "spectator";
          this.addSpectator(room, this.clientId, this.getNickname());
        }
      }
    } else {
      if (asSpectator) {
        this.role = "spectator";
        this.addSpectator(room, this.clientId, this.getNickname());
      } else {
        if (room.p1 && room.p1.id === this.clientId) {
          this.role = "player1";
          room.p1.name = this.getNickname();
          if (gameMode && !room.mode) room.mode = gameMode;
        } else if (room.p2 && room.p2.id === this.clientId) {
          this.role = "player2";
          room.p2.name = this.getNickname();
        } else if (!room.p1) {
          this.role = "player1";
          room.p1 = { id: this.clientId, name: this.getNickname() };
          room.status = room.p2 ? "playing" : "waiting";
          if (gameMode) room.mode = gameMode;
        } else if (!room.p2 && room.p1.id !== this.clientId) {
          this.role = "player2";
          room.p2 = { id: this.clientId, name: this.getNickname() };
          room.status = "playing";
        } else {
          this.role = "spectator";
          this.addSpectator(room, this.clientId, this.getNickname());
        }
      }
    }

    if (room.status === "playing" || (room.p1 && room.p2)) {
      this.lastOpponentPing = Date.now();
      this.isOpponentConnected = true;
    }

    // Broadcast JOIN event inside the room
    this.broadcast(ROOM_TOPIC_PREFIX + roomId, {
      type: "ROOM_JOIN",
      senderId: this.clientId,
      senderName: this.getNickname(),
      roomId,
      role: this.role,
      mode: room.mode || gameMode,
      players: room.players || null
    });

    // IMMEDIATELY broadcast updated room state to Lobby so other machines see it in 0ms!
    this.sendRoomHeartbeat();

    return {
      roomId,
      role: this.role,
      roomState: this.roomsState[roomId]
    };
  }

  leaveCurrentRoom() {
    if (!this.currentRoomId) return;

    const roomId = this.currentRoomId;
    const room = this.roomsState[roomId];

    this.lastOpponentPing = 0;
    this.isOpponentConnected = true;

    this.broadcast(ROOM_TOPIC_PREFIX + roomId, {
      type: "ROOM_LEAVE",
      senderId: this.clientId,
      senderName: this.getNickname(),
      roomId,
      role: this.role
    });

    const isUno = room.mode && room.mode.startsWith("uno");

    if (isUno && room.players) {
      const pIdx = room.players.findIndex(p => p.id === this.clientId);
      if (pIdx !== -1) {
        const wasHost = room.players[pIdx].isHost;
        room.players.splice(pIdx, 1);
        if (room.players.length > 0) {
          const remainingHumans = room.players.filter(p => !p.isBot);
          if (remainingHumans.length > 0) {
            if (wasHost) {
              const nextHost = remainingHumans[0];
              if (nextHost) nextHost.isHost = true;
            }
            room.p1 = room.players[0];
            room.p2 = room.players[1] || null;
          } else {
            // Only bots were left; clear room completely
            room.status = "empty";
            room.mode = null;
            room.p1 = null;
            room.p2 = null;
            room.players = [];
          }
        } else {
          room.status = "empty";
          room.mode = null;
          room.p1 = null;
          room.p2 = null;
          room.players = [];
        }
      }
    } else {
      if (this.role === "player1") {
        if (room.p2) {
          room.p1 = room.p2;
          room.p2 = null;
          room.status = "waiting";
        } else {
          room.p1 = null;
          room.status = "empty";
          room.mode = null;
        }
      } else if (this.role === "player2") {
        room.p2 = null;
        room.status = room.p1 ? "waiting" : "empty";
        if (!room.p1) room.mode = null;
      }
    }

    if (this.role === "spectator") {
      this.removeSpectator(room, this.clientId);
    }

    // Broadcast updated state to lobby immediately!
    this.broadcast(LOBBY_TOPIC, {
      type: "LOBBY_HEARTBEAT",
      senderId: this.clientId,
      roomId,
      roomState: room
    });

    if (this.mqttClient) {
      try {
        this.mqttClient.unsubscribe(ROOM_TOPIC_PREFIX + roomId);
      } catch (e) {}
    }

    this.currentRoomId = null;
    this.role = null;

    if (this.onLobbyUpdated) {
      this.onLobbyUpdated(this.roomsState);
    }
  }

  sendMove(move, newBoard, nextTurn, timeRemaining, chessFen = null) {
    if (!this.currentRoomId) return;

    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_MOVE",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      move,
      board: newBoard,
      nextTurn,
      timeRemaining,
      chessFen
    });
  }

  sendSyncState(board, turn, timeRemaining, mode = null, chessFen = null) {
    if (!this.currentRoomId) return;
    const currentMode = mode || (this.roomsState[this.currentRoomId] ? this.roomsState[this.currentRoomId].mode : null);
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_SYNC",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      roomState: this.roomsState[this.currentRoomId],
      board,
      turn,
      timeRemaining,
      mode: currentMode,
      chessFen
    });
  }

  sendResign(playerColor) {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_RESIGN",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      playerColor
    });
  }

  sendRestart() {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_RESTART",
      senderId: this.clientId,
      roomId: this.currentRoomId
    });
  }

  sendPauseRequest() {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_PAUSE_REQUEST",
      senderId: this.clientId,
      senderName: this.getNickname(),
      roomId: this.currentRoomId
    });
  }

  sendPauseResponse(accepted) {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_PAUSE_RESPONSE",
      senderId: this.clientId,
      senderName: this.getNickname(),
      roomId: this.currentRoomId,
      accepted
    });
  }

  sendPauseResume() {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_PAUSE_RESUME",
      senderId: this.clientId,
      senderName: this.getNickname(),
      roomId: this.currentRoomId
    });
  }

  // --- UNO Multiplayer Methods ---
  sendUnoWaitingUpdate(players) {
    if (!this.currentRoomId) return;
    const room = this.roomsState[this.currentRoomId];
    if (room) {
      room.players = players;
      room.p1 = players[0] || null;
      room.p2 = players[1] || null;
    }
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "UNO_WAITING_UPDATE",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      players
    });
    this.sendRoomHeartbeat();
    if (this.onUnoWaitingUpdate) {
      this.onUnoWaitingUpdate(players);
    }
  }

  sendUnoStart(gameState) {
    if (!this.currentRoomId) return;
    const room = this.roomsState[this.currentRoomId];
    if (room) {
      room.status = "playing";
    }
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "UNO_START",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      gameState
    });
    this.sendRoomHeartbeat();
  }

  sendUnoMove(data) {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "UNO_MOVE",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      ...data
    });
  }

  sendUnoDraw(data) {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "UNO_DRAW",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      ...data
    });
  }

  sendUnoPass(data) {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "UNO_PASS",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      ...data
    });
  }

  sendUnoShout(playerId, playerName) {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "UNO_SHOUT",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      playerId,
      playerName
    });
  }

  sendUnoSync(gameState) {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "UNO_SYNC",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      gameState
    });
  }

  handleRoomMessage(msg) {
    const { type, roomId, senderId, senderName } = msg;
    if (roomId !== this.currentRoomId) return;

    const room = this.roomsState[roomId];

    if (senderId && senderId !== this.clientId) {
      this.lastOpponentPing = Date.now();
      if (!this.isOpponentConnected) {
        this.isOpponentConnected = true;
        if (this.onOpponentConnectionChanged) {
          this.onOpponentConnectionChanged(true);
        }
      }
    }

    switch (type) {
      case "ROOM_PING":
        break;

      case "ROOM_JOIN":
        if (msg.mode && !room.mode) {
          room.mode = msg.mode;
        }
        if (room.mode && room.mode.startsWith("uno")) {
          if (!room.players) room.players = [];
          if (msg.role !== "spectator") {
            const exists = room.players.find(p => p.id === senderId);
            if (!exists) {
              room.players.push({
                id: senderId,
                name: senderName,
                isHost: room.players.length === 0,
                cardCount: 7
              });
            }
            room.p1 = room.players[0] || null;
            room.p2 = room.players[1] || null;
            // If I am host, respond with latest full player list
            if (this.role === "player1" && room.players[0]?.id === this.clientId) {
              this.sendUnoWaitingUpdate(room.players);
            }
          }
        } else {
          if (msg.role === "player1") {
            room.p1 = { id: senderId, name: senderName };
            if (room.p2) room.status = "playing";
          } else if (msg.role === "player2" || (!room.p2 && msg.role !== "spectator")) {
            room.p2 = { id: senderId, name: senderName };
            room.status = "playing";
          }
        }
        if (msg.role === "spectator") {
          this.addSpectator(room, senderId, senderName);
        }
        this.sendRoomHeartbeat();
        if (this.onRoomStateChanged) {
          this.onRoomStateChanged(room, "join", { senderId, senderName, role: msg.role, mode: msg.mode || room.mode });
        }
        break;

      case "UNO_WAITING_UPDATE":
        if (msg.players) {
          room.players = msg.players;
          room.p1 = room.players[0] || null;
          room.p2 = room.players[1] || null;
        }
        if (this.onUnoWaitingUpdate) {
          this.onUnoWaitingUpdate(msg.players);
        }
        break;

      case "UNO_START":
        room.status = "playing";
        if (this.onUnoStart) {
          this.onUnoStart(msg.gameState);
        }
        break;

      case "UNO_MOVE":
        if (this.onUnoMove) {
          this.onUnoMove(msg);
        }
        break;

      case "UNO_DRAW":
        if (this.onUnoDraw) {
          this.onUnoDraw(msg);
        }
        break;

      case "UNO_PASS":
        if (this.onUnoPass) {
          this.onUnoPass(msg);
        }
        break;

      case "UNO_SHOUT":
        if (this.onUnoShout) {
          this.onUnoShout(msg);
        }
        break;

      case "UNO_SYNC":
        if (this.onUnoSync) {
          this.onUnoSync(msg.gameState);
        }
        break;

      case "ROOM_SYNC":
        if (msg.roomState) {
          this.roomsState[roomId] = { ...this.roomsState[roomId], ...msg.roomState };
        }
        if (msg.mode) {
          this.roomsState[roomId].mode = msg.mode;
        }
        if (this.onRoomStateChanged) {
          this.onRoomStateChanged(this.roomsState[roomId], "sync", msg);
        }
        break;

      case "ROOM_MOVE":
        if (this.onMoveReceived) {
          this.onMoveReceived(msg);
        }
        break;

      case "ROOM_RESIGN":
        if (this.onGameResigned) {
          this.onGameResigned(msg.playerColor);
        }
        break;

      case "ROOM_RESTART":
        if (this.onGameRestarted) {
          this.onGameRestarted();
        }
        break;

      case "ROOM_PAUSE_REQUEST":
        if (senderId !== this.clientId && this.onPauseRequested) {
          this.onPauseRequested(msg);
        }
        break;

      case "ROOM_PAUSE_RESPONSE":
        if (senderId !== this.clientId && this.onPauseResponded) {
          this.onPauseResponded(msg);
        }
        break;

      case "ROOM_PAUSE_RESUME":
        if (senderId !== this.clientId && this.onPauseResumed) {
          this.onPauseResumed(msg);
        }
        break;

      case "ROOM_LEAVE":
        if (senderId !== this.clientId) {
          this.isOpponentConnected = false;
          if (this.onOpponentConnectionChanged) {
            this.onOpponentConnectionChanged(false);
          }
        }

        if (room.status !== "playing") {
          if (room.p1 && room.p1.id === senderId) {
            room.p1 = room.p2;
            room.p2 = null;
            room.status = room.p1 ? "waiting" : "empty";
          } else if (room.p2 && room.p2.id === senderId) {
            room.p2 = null;
            room.status = room.p1 ? "waiting" : "empty";
          }
        }

        this.removeSpectator(room, senderId);

        this.sendRoomHeartbeat();

        if (this.onOpponentLeft) {
          this.onOpponentLeft(senderName);
        }
        if (this.onRoomStateChanged) {
          this.onRoomStateChanged(room, "leave", { senderId, senderName });
        }
        break;
    }
  }
}
