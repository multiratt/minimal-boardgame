// network.js - Realtime 6-Room Multiplayer & Spectator System
// Supports both internet-wide MQTT (over Secure WebSockets) and local multi-tab BroadcastChannel

const LOBBY_TOPIC = "minimal_board_games_v3/lobby";
const ROOM_TOPIC_PREFIX = "minimal_board_games_v3/room/";
const BROADCAST_CHANNEL_NAME = "minimal_board_games_v3_bc";

const BROKERS = [
  "wss://broker.emqx.io:8084/mqtt",
  "wss://broker.hivemq.com:8884/mqtt"
];

export class NetworkManager {
  constructor() {
    this.clientId = "user_" + Math.random().toString(36).substring(2, 9);
    this.nickname = localStorage.getItem("checkers_nickname") || "";
    this.currentRoomId = null;
    this.role = null; // "player1" | "player2" | "spectator"
    this.mqttClient = null;
    this.broadcastChannel = null;
    this.isConnected = false;
    this.currentBrokerIndex = 0;

    // Room registry (Rooms 1 to 6)
    this.roomsState = {};
    for (let i = 1; i <= 6; i++) {
      this.roomsState[i] = {
        roomId: i,
        status: "empty", // "empty", "waiting", "playing"
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

    const brokerUrl = BROKERS[this.currentBrokerIndex];
    try {
      this.mqttClient = mqttObj.connect(brokerUrl, {
        clientId: this.clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 4000
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
        // Switch broker on error
        this.currentBrokerIndex = (this.currentBrokerIndex + 1) % BROKERS.length;
      });

      this.mqttClient.on("close", () => {
        this.isConnected = false;
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
    if (this.mqttClient && this.isConnected) {
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
        if (this.currentRoomId && (this.role === "player1" || this.role === "player2")) {
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
    if (roomId >= 1 && roomId <= 6 && roomState) {
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

      // 1. Clean stale rooms that haven't sent a heartbeat for 7 seconds
      for (let r = 1; r <= 6; r++) {
        if (r !== this.currentRoomId && this.roomsState[r].status !== "empty") {
          if (now - this.roomsState[r].lastHeartbeat > 7000) {
            this.roomsState[r] = {
              roomId: r,
              status: "empty",
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

      // 2. If sitting in a room as a player, send periodic heartbeat
      if (this.currentRoomId && (this.role === "player1" || this.role === "player2")) {
        this.sendRoomHeartbeat();
      }

      // 3. If in lobby, query occasionally
      if (!this.currentRoomId) {
        this.queryLobby();
      }
    }, 1800);
  }

  joinRoom(roomId, asSpectator = false) {
    this.currentRoomId = roomId;
    const room = this.roomsState[roomId];

    if (this.mqttClient && this.isConnected) {
      this.mqttClient.subscribe(ROOM_TOPIC_PREFIX + roomId);
    }

    if (asSpectator) {
      this.role = "spectator";
      if (!room.spectatorList.includes(this.clientId)) {
        room.spectatorList.push(this.clientId);
        room.spectators = room.spectatorList.length;
      }
    } else {
      if (!room.p1) {
        this.role = "player1";
        room.p1 = { id: this.clientId, name: this.getNickname() };
        room.status = "waiting";
      } else if (!room.p2 && room.p1.id !== this.clientId) {
        this.role = "player2";
        room.p2 = { id: this.clientId, name: this.getNickname() };
        room.status = "playing";
      } else {
        this.role = "spectator";
        if (!room.spectatorList.includes(this.clientId)) {
          room.spectatorList.push(this.clientId);
          room.spectators = room.spectatorList.length;
        }
      }
    }

    // Broadcast JOIN event inside the room
    this.broadcast(ROOM_TOPIC_PREFIX + roomId, {
      type: "ROOM_JOIN",
      senderId: this.clientId,
      senderName: this.getNickname(),
      roomId,
      role: this.role
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

    this.broadcast(ROOM_TOPIC_PREFIX + roomId, {
      type: "ROOM_LEAVE",
      senderId: this.clientId,
      senderName: this.getNickname(),
      roomId,
      role: this.role
    });

    if (this.role === "player1") {
      if (room.p2) {
        room.p1 = room.p2;
        room.p2 = null;
        room.status = "waiting";
      } else {
        room.p1 = null;
        room.status = "empty";
      }
    } else if (this.role === "player2") {
      room.p2 = null;
      room.status = room.p1 ? "waiting" : "empty";
    } else if (this.role === "spectator") {
      room.spectatorList = room.spectatorList.filter(id => id !== this.clientId);
      room.spectators = room.spectatorList.length;
    }

    // Broadcast updated state to lobby immediately!
    this.broadcast(LOBBY_TOPIC, {
      type: "LOBBY_HEARTBEAT",
      senderId: this.clientId,
      roomId,
      roomState: room
    });

    if (this.mqttClient && this.isConnected) {
      this.mqttClient.unsubscribe(ROOM_TOPIC_PREFIX + roomId);
    }

    this.currentRoomId = null;
    this.role = null;

    if (this.onLobbyUpdated) {
      this.onLobbyUpdated(this.roomsState);
    }
  }

  sendMove(move, newBoard, nextTurn, timeRemaining) {
    if (!this.currentRoomId) return;

    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_MOVE",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      move,
      board: newBoard,
      nextTurn,
      timeRemaining
    });
  }

  sendSyncState(board, turn, timeRemaining) {
    if (!this.currentRoomId) return;
    this.broadcast(ROOM_TOPIC_PREFIX + this.currentRoomId, {
      type: "ROOM_SYNC",
      senderId: this.clientId,
      roomId: this.currentRoomId,
      roomState: this.roomsState[this.currentRoomId],
      board,
      turn,
      timeRemaining
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

  handleRoomMessage(msg) {
    const { type, roomId, senderId, senderName } = msg;
    if (roomId !== this.currentRoomId) return;

    const room = this.roomsState[roomId];

    switch (type) {
      case "ROOM_JOIN":
        if (msg.role === "player2" || (!room.p2 && msg.role !== "spectator")) {
          room.p2 = { id: senderId, name: senderName };
          room.status = "playing";
        } else if (msg.role === "spectator") {
          if (!room.spectatorList.includes(senderId)) {
            room.spectatorList.push(senderId);
            room.spectators = room.spectatorList.length;
          }
        }
        this.sendRoomHeartbeat();
        if (this.onRoomStateChanged) {
          this.onRoomStateChanged(room, "join", { senderId, senderName, role: msg.role });
        }
        break;

      case "ROOM_SYNC":
        if (msg.roomState) {
          this.roomsState[roomId] = { ...this.roomsState[roomId], ...msg.roomState };
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

      case "ROOM_LEAVE":
        if (room.p1 && room.p1.id === senderId) {
          room.p1 = room.p2;
          room.p2 = null;
          room.status = room.p1 ? "waiting" : "empty";
        } else if (room.p2 && room.p2.id === senderId) {
          room.p2 = null;
          room.status = room.p1 ? "waiting" : "empty";
        } else {
          room.spectatorList = room.spectatorList.filter(id => id !== senderId);
          room.spectators = room.spectatorList.length;
        }

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
