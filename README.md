# ♟️ Minimal Board Games & UNO

A high-performance, responsive web application featuring classic board games and a multiplayer card game, designed with a luxury **Monochrome Minimalist** dark aesthetic and a **100% Viewport-Fit** layout (no page scrolling required on desktop). 

Built purely with vanilla modern web technologies (ES Modules, Web Audio API, Web Workers, HTML5 Canvas/SVG, BroadcastChannel, and MQTT over WebSockets) with zero backend build steps, deploying seamlessly to GitHub Pages.

🔗 **Play Live on GitHub Pages:** [https://multiratt.github.io/minimal-boardgame/](https://multiratt.github.io/minimal-boardgame/)

---

## 📑 Table of Contents / สารบัญ

- [Part 1: English](#part-1-english)
  - [1. Technical & Coding Architecture](#1-technical--coding-architecture)
    - [Project Structure](#project-structure)
    - [Dual-Layer Online Multiplayer Architecture](#dual-layer-online-multiplayer-architecture)
    - [Network Diagnostic Engine & Firewall Watchdog](#network-diagnostic-engine--firewall-watchdog)
    - [Multiplayer Protocol & State Synchronization](#multiplayer-protocol--state-synchronization)
    - [UNO Room Setup & Waiting Room Engine](#uno-room-setup--waiting-room-engine)
    - [Game Rule Engines & Domain Logic](#game-rule-engines--domain-logic)
    - [AI Computation via Web Workers](#ai-computation-via-web-workers)
    - [Procedural Audio Engine (Web Audio API)](#procedural-audio-engine-web-audio-api)
    - [Responsive Viewport-Fit & Mobile Minimalist Layout](#responsive-viewport-fit--mobile-minimalist-layout)
  - [2. How to Play (Rules & User Guide)](#2-how-to-play-rules--user-guide)
    - [Game Modes](#game-modes)
    - [Checkers (Thai vs International)](#checkers-thai-vs-international)
    - [Chess (Thai Makruk vs Western Chess)](#chess-thai-makruk-vs-western-chess)
    - [Othello / Reversi](#othello--reversi)
    - [UNO (Standard vs Stacking) & Bot Hand Inspection](#uno-standard-vs-stacking--bot-hand-inspection)
    - [In-Game Controls & Features](#in-game-controls--features)
  - [3. Local Development](#3-local-development)
- [Part 2: ภาษาไทย (คู่มือฉบับภาษาไทย)](#part-2-ภาษาไทย)
  - [1. สถาปัตยกรรมทางเทคนิคและการเขียนโค้ด (Technical Coding Architecture)](#1-สถาปัตยกรรมทางเทคนิคและการเขียนโค้ด-technical-coding-architecture)
    - [โครงสร้างไฟล์และโมดูล (Project Structure)](#โครงสร้างไฟล์และโมดูล-project-structure)
    - [สถาปัตยกรรมระบบออนไลน์แบบ Dual-Layer](#สถาปัตยกรรมระบบออนไลน์แบบ-dual-layer)
    - [ระบบวินิจฉัยเครือข่ายและการตรวจจับไฟร์วอลล์ (Network Diagnostics)](#ระบบวินิจฉัยเครือข่ายและการตรวจจับไฟร์วอลล์-network-diagnostics)
    - [โปรโตคอลการสื่อสารและการซิงค์ข้อมูล (State Synchronization)](#โปรโตคอลการสื่อสารและการซิงค์ข้อมูล-state-synchronization)
    - [ระบบตั้งค่าห้องออนไลน์และห้องพักคอย UNO (Room Setup & Waiting Room)](#ระบบตั้งค่าห้องออนไลน์และห้องพักคอย-uno-room-setup--waiting-room)
    - [โมดูลกฎและระบบตัดสินผลเกม (Rule Engines)](#โมดูลกฎและระบบตัดสินผลเกม-rule-engines)
    - [ระบบประมวลผล AI ด้วย Web Worker](#ระบบประมวลผล-ai-ด้วย-web-worker)
    - [ระบบเสียงสังเคราะห์ Procedural SFX](#ระบบเสียงสังเคราะห์-procedural-sfx)
    - [ระบบแสดงผล Responsive 100% Viewport-Fit และ UI มือถือ](#ระบบแสดงผล-responsive-100-viewport-fit-และ-ui-มือถือ)
  - [2. วิธีการเล่นและคู่มือกติกา (How to Play)](#2-วิธีการเล่นและคู่มือกติกา-how-to-play)
    - [โหมดการแข่งขัน](#โหมดการแข่งขัน)
    - [หมากฮอส (หมากฮอสไทย และ หมากฮอสสากล)](#หมากฮอส-หมากฮอสไทย-และ-หมากฮอสสากล)
    - [หมากรุก (หมากรุกไทย และ หมากรุกสากล)](#หมากรุก-หมากรุกไทย-และ-หมากรุกสากล)
    - [โอเทลโล่ (Othello / Reversi)](#โอเทลโล่-othello--reversi)
    - [UNO (Standard และ Stacking) พร้อมระบบส่องไพ่บอท](#uno-standard-และ-stacking-พร้อมระบบส่องไพ่บอท)
    - [เมนูและฟังก์ชันช่วยเหลือระหว่างเล่น](#เมนูและฟังก์ชันช่วยเหลือระหว่างเล่น)
  - [3. การติดตั้งและทดสอบในเครื่อง (Local Setup)](#3-การติดตั้งและทดสอบในเครื่อง-local-setup)

---

# Part 1: English

## 1. Technical & Coding Architecture

### Project Structure

The project strictly follows a vanilla, decoupled architecture without heavy frameworks or build toolchains:

```
minimal-boardgame/
├── index.html              # Single Page Application entry point & modal definitions
├── css/
│   └── style.css           # 100% Viewport-fit styling, CSS Grid/Flexbox, kinetic animations, responsive media queries
└── js/
    ├── app.js              # Central application controller, UI event mediator, DOM cache, game loop
    ├── network.js          # Networking manager (MQTT client + BroadcastChannel dual transport)
    ├── rules-checkers.js   # Thai & International Checkers rules, move generation, multi-jump tree
    ├── rules-makruk.js     # Thai Makruk rules, piece moves, promotion row, board geometry
    ├── rules-chess.js      # Western Chess FEN generation, piece movement, check/checkmate logic
    ├── rules-othello.js    # Othello 8-directional flank checking, tile flipping, pass evaluation
    ├── rules-uno.js        # 108-card monochrome UNO deck, draw/discard piles, turn direction, action effects
    ├── ai-worker.js        # Dedicated Web Worker for Minimax and heuristic bot evaluation
    ├── pieces-svg.js       # Procedural SVG vector generation for board pieces
    ├── sfx.js              # Web Audio API audio synthesis (zero external audio files)
    └── i18n.js             # Real-time dictionary-based bilingual translation engine (TH / EN)
```

---

### Dual-Layer Online Multiplayer Architecture

To deliver zero-latency local testing while providing seamless cross-device multiplayer across the internet, `network.js` employs a **Dual-Layer Transport Strategy**:

```
                       ┌────────────────────────────┐
                       │       NetworkManager       │
                       │     (js/network.js)        │
                       └──────────────┬─────────────┘
                                      │
            ┌─────────────────────────┴─────────────────────────┐
            ▼                                                   ▼
┌──────────────────────────────┐              ┌──────────────────────────────────┐
│   BroadcastChannel API       │              │     MQTT over WebSockets         │
│   (Local Same-Browser Tabs)  │              │    (Remote Cross-Device / WAN)   │
│   Topic: board_games_bc      │              │    Broker: wss://broker.emqx.io  │
│   Latency: ~0ms              │              │    Port: 8084/mqtt               │
└──────────────────────────────┘              └──────────────────────────────────┘
```

1. **Local Channel (`BroadcastChannel`):**
   - Transmits messages across tabs and windows within the same browser session without internet round-trips.
   - Ideal for instant side-by-side local testing or split-screen play.
2. **Global Channel (`MQTT over WebSockets`):**
   - Connects to an external public broker (`wss://broker.emqx.io:8084/mqtt`).
   - Uses unique client IDs generated from timestamps and randomized hashes (`client_${Date.now()}_${Math.random()}`).
   - Subscribes dynamically to:
     - Lobby Topic: `board_game_lobby_v2` (Lobby discovery, room state broadcasts).
     - Room Topic: `board_game_room_v2_<roomId>` (Isolated match commands, move sync, timers, chat/UNO shouts).
3. **Deduplication & Loop Prevention:**
   - Every outgoing packet tags the `senderId`. Incoming packets matching the local `clientId` are instantly dropped to prevent echo reflection loops.

---

### Network Diagnostic Engine & Firewall Watchdog

Certain enterprise, corporate, or university Wi-Fi networks block outgoing WebSocket ports (e.g. port `8084`). Rather than leaving users on an infinite loading state or experiencing silent connection failures:

1. **Diagnostic Timeout Watchdog:**
   - Upon connection initialization, a 6-second timer is armed.
   - If the MQTT client has not established a socket handshake (`isConnected === false`) and the browser reports internet access (`navigator.onLine === true`), the system flags the connection as `"restricted"`.
2. **Visual Warning Banner:**
   - Informs the user immediately with actionable suggestions (e.g., switch to mobile hotspot 4G/5G or play against Bots).
   - Provides a "🔄 Retry Connection" (`netRetryBtn`) trigger that cleans up dangling listeners and attempts a fresh handshake.

---

### Multiplayer Protocol & State Synchronization

1. **Lobby Discovery & Room Heartbeat:**
   - The lobby displays 4 fixed rooms (`MAX_ROOMS = 4`).
   - Active rooms periodically emit `LOBBY_HEARTBEAT` messages.
   - Stale rooms that receive no heartbeat for over 15 seconds are automatically recycled to `"empty"` state locally.
2. **Room Handshake & Role Assignment:**
   - Joining an open room assigns `"player1"` (Host / White) or `"player2"` (Challenger / Black). Additional participants are automatically assigned as `"spectator"`.
3. **Turn & Move Synchronization:**
   - Moves are broadcast via `ROOM_MOVE` payloads containing move coordinates, updated board matrix, active turn, and remaining turn timer.
4. **Heartbeat, Ping-Pong & Disconnection Resilience:**
   - During active matches, players send `ROOM_PING` every 1.8 seconds.
   - If an opponent drops packets for >4.5 seconds, the UI enters a 60-second countdown alert.
   - If the opponent reconnects before 0, state sync resumes seamlessly; if the timer expires, the connected player is awarded victory by disconnect.
5. **Pause Request Protocol:**
   - Online matches allow requesting a 3-minute pause (`ROOM_PAUSE_REQ`). The opponent receives a consent prompt modal (`ROOM_PAUSE_RES`). If accepted, both sides synchronize a shared countdown bar.

---

### UNO Room Setup & Waiting Room Engine

Multiplayer card games require dynamic participant sizing (2–8 players). The online UNO subsystem implements an interactive room configuration lifecycle:

```
[Host clicks empty room] 
         │
         ▼
[UNO Room Setup Modal] ──► Host chooses human slots (1–8) & bots (0–7) [Total: 2–8]
         │
         ▼
[createUnoRoom()] ───────► Room enters status: "waiting", pre-populates bots
         │
         ▼
[UNO Waiting Room Modal] ─► Other humans join waiting room; host can add/remove bots
         │
         ▼
[Host clicks "Start Game"] (Can start at any time once players >= 2)
         │
         ▼
[UNO_START Broadcast] ───► All connected clients transition to Game Arena simultaneously
```

- **Room Setup Modal:** Built with atomic steppers (`uno-setup-stepper`) validating minimum 2 total players and maximum 8.
- **Pre-populated Bots:** Bots are assigned distinct IDs (`bot_<hash>`), card counts, and seat numbers.
- **Host Starting Privilege:** The host does not have to wait for human slots to fill up completely; clicking "🎮 Start Game" instantly initiates the round with the current roster.

---

### Game Rule Engines & Domain Logic

All game rule modules are fully decoupled from DOM operations and run purely on mathematical coordinates:

- **`rules-checkers.js`:**
  - Board representation: 8x8 2D matrix (`WHITE`, `BLACK`, `EMPTY`, `KING`).
  - Thai rules: Kings fly unhindered across diagonal paths; men capture only forward.
  - International rules: Men can capture backwards; mandatory capture applies (highest capture priority path).
  - Multi-jump tree generator: Recursively traverses and compiles continuous jumping trajectories.
  - Stalling rule: Tracks 10 turns without captures, initiating a 20-move countdown to decide by piece advantage.
- **`rules-makruk.js`:**
  - Authentic Thai Chess: Khun (King), Met (Queen, 1 square diagonally), Khon (Bishop, 1 forward or 1 diagonally), Ma (Knight), Ruea (Rook), Bia (Pawn, start row 3, promotes at row 6 to Bia-Ngai).
- **`rules-chess.js`:**
  - Standard Western Chess with legal move validation, Castling, En Passant, and FEN (Forsyth–Edwards Notation) synchronization.
- **`rules-othello.js`:**
  - Checks 8 directional raycasts (`dx`, `dy`) for trapped opposite discs. Automatically triggers turn pass (`othelloPassNotice`) if no legal placements exist.
- **`rules-uno.js`:**
  - 108 cards across 4 suits: `circle` (◯), `square` (◻), `triangle` (△), `diamond` (◇), and `wild` (★).
  - Supports Standard Variant (strict 1-card draw on penalty) and Stacking Variant (`+2` stacks onto `+2`, `+4` onto `+4`).
  - UNO shout challenge mechanics with 2-card draw penalty for failure to shout before turn ends.

---

### AI Computation via Web Workers

To prevent UI thread frame drops during deep decision trees:
- Board game AI runs inside `js/ai-worker.js`.
- Uses Minimax algorithm with **Alpha-Beta Pruning** and board-evaluation heuristic tables (positional weighting, mobility, king safety).
- Three difficulty tiers adjust search depth and randomness thresholds.

---

### Procedural Audio Engine (Web Audio API)

`js/sfx.js` generates all sound effects synthetically using the browser's native `AudioContext`:
- **Move click:** High-frequency pulse ramp (`800Hz -> 400Hz`).
- **Capture:** Double-burst low-frequency transient (`220Hz -> 80Hz`).
- **King / Promotion:** Ascending arpeggio harmonics (`523Hz -> 659Hz -> 784Hz`).
- **Timer tick:** Clean sinusoidal blip (`880Hz`).
- **Victory:** Major triad fanfare.
- Benefits: **Zero network requests**, instant playback, zero asset load latency.

---

### Responsive Viewport-Fit & Mobile Minimalist Layout

1. **Desktop Viewport-Fit (100vh):**
   - The game board, player cards, timers, and rules sidebar sit in a unified CSS Grid/Flexbox container designed to fit 100% of the screen height without scrollbars.
2. **Mobile Minimalist UNO Table (`@media (max-width: 768px)`):**
   - On compact screens, opponent seats automatically toggle from full names (e.g. `BOT 1`, `BOT 2`) to ultra-compact badges (`🤖 1`, `🤖 2`).
   - The inspection badge shortens from `👁️ Inspecting` to `👁️`.
   - Compact seat padding (`0.15rem 0.35rem`) and smaller card footprints prevent seats from crowding or overlapping the center draw/discard table.

---

## 2. How to Play (Rules & User Guide)

### Game Modes

Select your preferred game category from the Lobby header tabs:
1. **Checkers (หมากฮอส)**
2. **Chess (หมากรุก)**
3. **Othello (โอเทลโล่)**
4. **UNO (อูโน่)**

Choose your match type:
- **Play with Bot (เล่นกับบอท):** Play solo against AI (choose Easy, Medium, or Hard).
- **Bot vs Bot (บอทแข่งกันเอง):** Sit back as spectator watching AI battle AI. In UNO, click on any bot seat to inspect their live hand cards in real-time!
- **Online Rooms (ห้องออนไลน์ 1–4):** Host or join real-time multiplayer rooms.

---

### Checkers (Thai vs International)

- **Thai Checkers (หมากฮอสไทย):**
  - Played with 8 men per side on dark squares.
  - Normal pieces move and capture diagonally forward 1 square.
  - Reaching the opponent's back row promotes the piece to a **Flying King (ฮอสบิน)**. Kings can slide and capture diagonally across any distance of unoccupied squares.
- **International Checkers (หมากฮอสสากล):**
  - Played with 12 men per side.
  - Normal pieces move forward but can capture both forward and backward.
  - Reaching the back row promotes the piece to a King that moves 1 square diagonally in any direction.
  - **Mandatory Jump Rule:** If an opportunity to capture exists, the player *must* capture. If multiple jump paths exist, taking the longest sequence is mandatory.
- **Stalling Rule (กติกาเดินหนี):**
  - If 10 consecutive turns pass without any captures, a 20-move countdown begins. If the match remains unresolved, victory is awarded to the player with the most remaining pieces.

---

### Chess (Thai Makruk vs Western Chess)

- **Thai Chess (หมากรุกไทย - Makruk):**
  - **Khun (ขุน - King):** Moves 1 step in any direction.
  - **Met (เม็ด - Queen):** Moves 1 step diagonally.
  - **Khon (โคน - Bishop):** Moves 1 step diagonally in any direction, or 1 step directly forward.
  - **Ma (ม้า - Knight):** Moves in the classic L-shape (2 steps forward, 1 perpendicular).
  - **Ruea (เรือ - Rook):** Moves orthogonally across any number of unoccupied squares.
  - **Bia (เบี้ย - Pawn):** Starts on the 3rd rank. Moves 1 step forward, captures diagonally forward. Upon reaching rank 6, promotes to **Bia-Ngai (เบี้ยหงาย)**, which moves like a Met.
- **Western Chess (หมากรุกสากล):**
  - Standard international FIDE rules featuring King, Queen, Rook, Bishop, Knight, and Pawn.
  - Pawns move 1 square forward (or 2 squares from their starting square) and promote upon reaching the opposite back rank.

---

### Othello / Reversi

- Played on an 8x8 grid starting with 4 discs in the center (2 Black, 2 White).
- Black moves first.
- A player must place a disc such that at least one opponent's disc is trapped in a straight line (horizontally, vertically, or diagonally) between the newly placed disc and another disc of the current player's color.
- All trapped opponent discs are flipped to the current player's color.
- If a player has no legal moves, their turn is automatically passed.
- The game ends when the board is full or neither player can make a legal move. The player with the most discs wins!

---

### UNO (Standard vs Stacking) & Bot Hand Inspection

- **Setup & Dealing:** Each player starts with 7 cards. The draw pile contains 108 cards across 4 geometric suits (◯, ◻, △, ◇) and Wild (★) cards.
- **Playing Cards:** On your turn, play a card matching either the **symbol/suit** or the **number/action** of the top card on the discard pile.
- **Action Cards:**
  - **Skip (🚫):** Skips the next player's turn.
  - **Reverse (🔄):** Reverses the direction of play.
  - **Draw Two (+2):** Next player draws 2 cards and forfeits their turn.
  - **Wild (★):** Play on any card and declare the active suit.
  - **Wild Draw Four (★ +4):** Play on any card, declare active suit, and next player draws 4 cards.
- **Variants:**
  - **Standard UNO:** Stacking is disabled. When hit with `+2` or `+4`, the penalty must be drawn immediately.
  - **Stacking UNO:** Players can stack `+2` on `+2` or `+4` on `+4` to pass the cumulative penalty to the next player!
- **Shouting UNO:** When down to 1 card in hand, you must click the **"⚡ UNO!"** button before playing or ending your turn. If challenged by opponents, you draw 2 penalty cards.
- **Bot vs Bot Spectator Hand Inspector:**
  - In Bot vs Bot mode, click directly on any bot's seat around the table to inspect their hand.
  - Toggle **"🔄 Auto-Follow"** to automatically follow the active bot taking their turn.
  - Observe elevated card animations as bots make strategic decisions.

---

### In-Game Controls & Features

- **⏸️ Pause Game:** Request a 3-minute pause session.
- **🏳️ Resign (ยอมแพ้):** Concede the match gracefully.
- **🔊 SFX Toggle:** Instant procedural sound effects on/off.
- **🌐 Language Switcher:** Switch between Thai (TH) and English (EN) dynamically.
- **📊 Post-Match Analytics:** Displays total match time, average time per turn, total moves, capture count, and promotion frequency.

---

## 3. Local Development

Run the app locally with any static web server:

```bash
# Clone the repository
git clone https://github.com/multiratt/minimal-boardgame.git
cd minimal-boardgame

# Run with Python 3 built-in HTTP server
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.

---

# Part 2: ภาษาไทย

## 1. สถาปัตยกรรมทางเทคนิคและการเขียนโค้ด (Technical Coding Architecture)

### โครงสร้างไฟล์และโมดูล (Project Structure)

โปรเจกต์นี้พัฒนาด้วย Vanilla JavaScript สมัยใหม่ (ES Modules) โดยไม่มีการพึ่งพา Framework หรือ Build Tool ใดๆ ทำให้มีความเร็วสูงสุดและโหลดทำงานได้ทันที:

```
minimal-boardgame/
├── index.html              # หน้าเว็บหลัก Single Page Application และ Modals ทั้งหมด
├── css/
│   └── style.css           # สไตล์ 100% Viewport-fit, Grid/Flexbox, แอนิเมชัน และ Responsive มือถือ
└── js/
    ├── app.js              # คอนโทรลเลอร์หลัก เชื่อมโยง UI, State, DOM Cache และ Game Loop
    ├── network.js          # ระบบเครือข่ายออนไลน์ (MQTT Client + BroadcastChannel)
    ├── rules-checkers.js   # กฎหมากฮอสไทย และ หมากฮอสสากล พร้อมระบบคำนวณการกินต่อเนื่อง
    ├── rules-makruk.js     # กฎหมากรุกไทยแท้ การเดินของขุน เม็ด โคน ม้า เรือ เบี้ย และการหงาย
    ├── rules-chess.js      # กฎหมากรุกสากล ระบบ FEN, การรุก และการรุกฆาต
    ├── rules-othello.js    # กฎโอเทลโล่ การตรวจสอบการหนีบ 8 ทิศทาง และระบบข้ามตาเดิน (Pass)
    ├── rules-uno.js        # สำรับไพ่ UNO มินิมอล 108 ใบ กฎ Standard/Stacking และการลงไพ่
    ├── ai-worker.js        # Web Worker แยกเธรดประมวลผล Minimax สำหรับบอท AI
    ├── pieces-svg.js       # ฟังก์ชันสร้างเวกเตอร์ SVG สำหรับตัวหมาก
    ├── sfx.js              # ระบบสังเคราะห์เสียงจำลองผ่าน Web Audio API (ไม่ต้องโหลดไฟล์เสียงภายนอก)
    └── i18n.js             # ระบบสลับ 2 ภาษา Real-time (ไทย / อังกฤษ)
```

---

### สถาปัตยกรรมระบบออนไลน์แบบ Dual-Layer

`js/network.js` ออกแบบระบบรับส่งข้อมูลแบบ **2 ชั้น (Dual-Layer Transport Strategy)** เพื่อรองรับทั้งการทดสอบในเครื่องและการเล่นข้ามอุปกรณ์ผ่านอินเทอร์เน็ต:

1. **Local Channel (`BroadcastChannel`):**
   - รับส่งข้อมูลระหว่างแท็บหรือหน้าต่างเบราว์เซอร์เดียวกันด้วย Latency ระดับ ~0ms โดยไม่ต้องพึ่งพาระบบอินเทอร์เน็ต
2. **Global Channel (`MQTT over WebSockets`):**
   - เชื่อมต่อไปยัง Broker สาธารณะ (`wss://broker.emqx.io:8084/mqtt`)
   - ใช้ `clientId` สุ่มเฉพาะตัว เพื่อระบุตัวตนของผู้เล่นแต่ละคน
   - แยกช่องทางการสื่อสารออกเป็น:
     - `board_game_lobby_v2`: ประกาศสถานะห้องว่าง/ห้องรอ/ห้องที่กำลังแข่งขันให้ล็อบบี้ทราบ
     - `board_game_room_v2_<roomId>`: รับส่งข้อมูลเฉพาะภายในห้องนั้นๆ (ตาเดิน, เวลานับถอยหลัง, คำขอพักเกม, การลงไพ่ UNO)
3. **การป้องกัน Loop ข้อความสะท้อนกลับ:**
   - ทุกแพ็กเก็ตที่ส่งจะมี `senderId` แนบไปด้วย เมื่อได้รับแพ็กเก็ตที่มี `senderId` ตรงกับตัวเอง ระบบจะละทิ้งทันทีเพื่อป้องกันการประมวลผลซ้ำ

---

### ระบบวินิจฉัยเครือข่ายและการตรวจจับไฟร์วอลล์ (Network Diagnostics)

บนเครือข่ายองค์กรหรือสถานศึกษาบางแห่ง พอร์ต WebSockets ภายนอก (พอร์ต 8084) มักจะถูกบล็อก ระบบจึงมี Watchdog ในตัว:
- เมื่อเริ่มเชื่อมต่อ ระบบจะตั้งเวลานับถอยหลัง 6 วินาที
- หากเบราว์เซอร์ต่อเน็ตอยู่ (`navigator.onLine === true`) แต่ไม่สามารถจับมือกับ Broker ได้ ระบบจะเปลี่ยนสถานะเป็น `"restricted"` ทันที
- แสดงแถบเตือนสีส้มแนะนำให้เปลี่ยนไปใช้ Hotspot มือถือ หรือเลือกเล่นโหมดบอท พร้อมปุ่มกดทดสอบการเชื่อมต่อใหม่ (`netRetryBtn`)

---

### โปรโตคอลการสื่อสารและการซิงค์ข้อมูล (State Synchronization)

1. **Heartbeat & Room TTL:**
   - ห้องที่เปิดอยู่จะส่งสัญญาณ Heartbeat เป็นระยะ หากห้องใดขาดหายไปเกิน 15 วินาที ระบบล็อบบี้จะรีเซ็ตห้องนั้นเป็นสถานะว่าง (`empty`) โดยอัตโนมัติ
2. **การป้องกันปัญหาหลุดจากการเชื่อมต่อ (Disconnect Resilience):**
   - ระหว่างแข่ง ผู้เล่นจะส่ง `ROOM_PING` ทุก 1.8 วินาที
   - หากคู่ต่อสู้เงียบหายไปเกิน 4.5 วินาที จะมีแถบเตือนนับถอยหลัง 60 วินาทีปรากฏขึ้น หากไม่กลับมาใน 60 วินาที ผู้เล่นที่ยังอยู่จะชนะบายทันที
3. **ระบบขอพักเกม (Pause Negotiation):**
   - ส่งคำขอ `ROOM_PAUSE_REQ` ให้อีกฝ่ายกดยินยอม เมื่อยินยอม เกมจะหยุดเวลาและเปิดหน้าต่างพัก 3 นาทีพร้อมกันทั้งสองฝั่ง

---

### ระบบตั้งค่าห้องออนไลน์และห้องพักคอย UNO (Room Setup & Waiting Room)

เมื่อผู้เล่นกดเปิดห้องว่างในหมวด UNO:
1. **หน้าต่างตั้งค่าห้อง (Room Setup Modal):**
   - กำหนดจำนวนผู้เล่นจริง (1–8 คน)
   - กำหนดจำนวนบอทที่จะลงแข่ง (0–7 ตัว)
   - ตรวจสอบผลรวมต้องอยู่ระหว่าง 2 ถึง 8 คน
2. **ห้องพักคอย (Waiting Room):**
   - ห้องถูกสร้างในสถานะ `waiting` พร้อมใส่บอทตามจำนวนที่ตั้งค่าไว้ล่วงหน้า
   - ผู้เล่นอื่นสามารถกดเข้าร่วมห้องพักคอยได้
3. **หัวหน้าห้องกดเริ่มเกมได้ทันที (Host Start Control):**
   - หัวหน้าห้องไม่จำเป็นต้องรอให้คนเต็มโควตา สามารถกดปุ่ม **"🎮 เริ่มเกม"** ได้ทันทีเมื่อพร้อม (ตราบใดที่มีผู้เล่นรวมตั้งแต่ 2 คนขึ้นไป)

---

### โมดูลกฎและระบบตัดสินผลเกม (Rule Engines)

- **`rules-checkers.js`:** คำนวณตรรกะกระดานหมากฮอส 8x8 รองรับทั้งกฎไทย (ฮอสบินข้ามแถวยาว) และกฎสากล (เบี้ยกินถอยหลังได้, บังคับกินเส้นทางที่กินได้มากที่สุด) พร้อมระบบนับตาเดินหนี (Stalling Rule) 10 ตาไม่กิน เริ่มนับถอยหลัง 20 ตา
- **`rules-makruk.js`:** คำนวณการเดินของหมากรุกไทยแท้ เบี้ยหงายแถว 6 การรุกฆาต และการอับ
- **`rules-chess.js`:** ตรวจจับการเดินหมากรุกสากล การ Castling, En Passant และการแปลงสถานะ FEN
- **`rules-othello.js`:** ตรวจจับการหนีบหมาก 8 ทิศทาง และสลับเทิร์นอัตโนมัติเมื่อฝ่ายใดฝ่ายหนึ่งไม่มีตาเดิน
- **`rules-uno.js`:** ไพ่ 108 ใบ แบ่ง 4 สัญลักษณ์ ตรวจสอบความถูกต้องของการลงไพ่ กองจั่ว กองทิ้ง ทิศทางการเล่น และการร้อง UNO

---

### ระบบประมวลผล AI ด้วย Web Worker

- บอทสำหรับหมากฮอสและหมากรุกทำงานแยกเธรดใน `js/ai-worker.js`
- ใช้อัลกอริทึม **Minimax ร่วมกับ Alpha-Beta Pruning** ทำให้หน้าจอ UI ไม่กระตุกแม้บอทกำลังคิดตาเดินลึก

---

### ระบบเสียงสังเคราะห์ Procedural SFX

`js/sfx.js` ทำงานผ่าน Web Audio API โดยสร้างสัญญาณความถี่ (Oscillators) ขึ้นมาเอง:
- เสียงวางหมาก, เสียงกินหมาก, เสียงเลื่อนขั้น, เสียงนับเวลาถอยหลัง และเสียงประกาศชัยชนะ
- **ไม่ต้องดาวน์โหลดไฟล์เสียง mp3/wav เพิ่มเติมแม้แต่ไบต์เดียว**

---

### ระบบแสดงผล Responsive 100% Viewport-Fit และ UI มือถือ

1. **บนจอคอมพิวเตอร์ / จอใหญ่ (100% Viewport-Fit):**
   - แดชบอร์ดคำนวณพอดีความสูงหน้าจอแบบเต็มตา กระดานใหญ่ ชัดเจน ไม่ต้องเลื่อนเมาส์ Scroll หน้าจอ
2. **บนจอมือถือ (Minimal Layout สำหรับ UNO):**
   - ปรับชื่อที่นั่งคู่ต่อสู้ให้เหลือเฉพาะอีโมจิกับตัวเลข เช่น `🤖 1`, `🤖 2`, `🤖 3` (ตัดคำว่า BOT ออก)
   - ปรับป้ายส่องไพ่ให้สั้นเหลือเพียง `👁️`
   - ปรับลดขนาดและ Padding เพื่อให้ที่นั่งคู่แข่ง 3–4 ตัวสามารถเรียงแถวเดียวได้โดยไม่ตกลงมาเบียดหรือทับกองการ์ดตรงกลาง

---

## 2. วิธีการเล่นและคู่มือกติกา (How to Play)

### โหมดการแข่งขัน

เลือกหมวดเกมที่ต้องการเล่นจากแถบด้านบนของล็อบบี้:
1. **หมากฮอส (Checkers)**
2. **หมากรุก (Chess)**
3. **โอเทลโล่ (Othello)**
4. **อูโน่ (UNO)**

จากนั้นเลือกรูปแบบการแข่งขัน:
- **เล่นกับบอท:** แข่งคนเดียวกับ AI (เลือกระดับ ง่าย, ปานกลาง, ยาก)
- **บอทแข่งกันเอง:** ชม AI แข่งขันกันเอง สำหรับเกม UNO สามารถคลิกที่ตัวบอทเพื่อส่องดูไพ่ในมือของบอทได้แบบ Real-time
- **ห้องออนไลน์ (1–4):** แข่งขันกับผู้เล่นจริงผ่านระบบออนไลน์

---

### หมากฮอส (หมากฮอสไทย และ หมากฮอสสากล)

- **หมากฮอสไทย:**
  - หมากฝ่ายละ 8 ตัว เดินบนช่องสีเข้ม
  - เบี้ยธรรมดาเดินหน้าและกินเฉียงไปข้างหน้า 1 ช่อง
  - เมื่อเบี้ยไปถึงแถวหลังสุดของฝั่งตรงข้ามจะกลายเป็น **ฮอสบิน** ซึ่งสามารถบินข้ามแถวทแยงได้ไม่จำกัดระยะ
- **หมากฮอสสากล:**
  - หมากฝ่ายละ 12 ตัว
  - เบี้ยธรรมดาเดินหน้า แต่สามารถกินถอยหลังได้
  - เมื่อเข้าฮอส ฮอสจะเดินและกินได้รอบทิศทางระยะ 1 ก้าว
  - **กฎบังคับกิน:** หากมีจังหวะกิน ต้องกินตามกติกา และต้องเลือกเส้นทางที่กินได้จำนวนตัวมากที่สุด
- **กติกาเดินหนี (Stalling Rule):**
  - หากไม่มีการกินติดต่อกัน 10 ตาเดิน ระบบจะเริ่มนับถอยหลัง 20 ตาเดิน หากยังไม่จบจะตัดสินให้ฝ่ายที่มีหมากมากกว่าชนะทันที

---

### หมากรุก (หมากรุกไทย และ หมากรุกสากล)

- **หมากรุกไทย (Makruk):**
  - **ขุน:** เดินได้ 8 ทิศทางรอบตัว ทิศละ 1 ก้าว
  - **เม็ด:** เดินทแยง 4 มุม มุมละ 1 ก้าว
  - **โคน:** เดินทแยง 4 มุม หรือเดินตรงไปข้างหน้า 1 ก้าว
  - **ม้า:** เดินรูปตัว L
  - **เรือ:** เดินตรงแนวนอนและแนวตั้งได้ตลอดแนว
  - **เบี้ย:** วางที่แถว 3 เดินตรงไปข้างหน้า 1 ก้าว กินเฉียงไปข้างหน้า เมื่อถึงแถว 6 จะคว่ำเป็น **เบี้ยหงาย** (เดินเหมือนเม็ด)
- **หมากรุกสากล (Western Chess):**
  - กติกามาตรฐานสากล ประกอบด้วย King, Queen, Rook, Bishop, Knight และ Pawn พร้อมระบบเลื่อนขั้นและรุกฆาต

---

### โอเทลโล่ (Othello / Reversi)

- เล่นบนกระดาน 8x8 เริ่มต้นด้วยหมาก 4 ตัวตรงกลาง (ขาว 2 ดำ 2) ฝ่ายสีดำเริ่มก่อน
- วางหมากเพื่อหนีบหมากของฝ่ายตรงข้ามในแนวตั้ง แนวนอน หรือแนวทแยง
- หมากฝ่ายตรงข้ามที่ถูกหนีบทั้งหมดจะถูกพลิกกลับเป็นสีของเรา
- หากฝ่ายใดไม่มีตาเดินที่สามารถกินพลิกหมากได้ ระบบจะข้ามตาเดิน (Pass) ให้อัตโนมัติ
- เกมสิ้นสุดเมื่อกระดานเต็มหรือทั้งสองฝ่ายไม่มีตาเดิน ฝ่ายที่มีหมากมากกว่าเป็นผู้ชนะ

---

### UNO (Standard และ Stacking) พร้อมระบบส่องไพ่บอท

- **เป้าหมาย:** ทิ้งไพ่ในมือให้หมดเป็นคนแรก
- **การทิ้งไพ่:** ทิ้งไพ่ที่มีสัญลักษณ์ตรงกัน หรือตัวเลข/ฟังก์ชันตรงกับไพ่ใบบนสุดของกองทิ้ง
- **ไพ่พิเศษ:**
  - **ข้ามตา (🚫):** ข้ามผู้เล่นคนถัดไป
  - **กลับทิศ (🔄):** สลับทิศทางการวนรอบโต๊ะ
  - **จั่วสอง (+2):** ผู้เล่นคนถัดไปต้องจั่ว 2 ใบและเสียตาเดิน
  - **เปลี่ยนสัญลักษณ์ (★):** เลือกลงบนไพ่ใดก็ได้และเลือกสัญลักษณ์ใหม่
  - **จั่วสี่เปลี่ยนสัญลักษณ์ (★ +4):** เลือกสัญลักษณ์ใหม่และผู้เล่นคนถัดไปต้องจั่ว 4 ใบ
- **กติกา Stacking:** ในโหมด Stacking หากโดน `+2` หรือ `+4` สามารถวาง `+2` หรือ `+4` ทับต่อเพื่อส่งผลรวมการจั่วไปให้คนถัดไปได้
- **การร้อง UNO:** เมื่อเหลือไพ่ 1 ใบในมือ ต้องกดปุ่ม **"⚡ UNO!"** ก่อนทิ้งไพ่ใบรองสุดท้าย หากลืมและถูกจับได้ จะโดนปรับจั่ว 2 ใบ
- **ระบบส่องไพ่บอท (Bot Hand Inspection):** ในโหมดบอทแข่งกันเอง สามารถกดคลิกที่ตัวบอทเพื่อดูไพ่จริงในมือบอท พร้อมแอนิเมชันยกไพ่ขึ้นก่อนวางลงกองทิ้ง

---

### เมนูและฟังก์ชันช่วยเหลือระหว่างเล่น

- **⏸️ พักเกม (Pause):** ขอพักเกมได้ 3 นาที
- **🏳️ ยอมแพ้ (Resign):** กดยอมจำนนเพื่อจบเกม
- **🔊 เสียงประกอบ:** ปุ่มเปิด/ปิดเสียงสังเคราะห์
- **🌐 สลับภาษา:** สลับภาษาไทยหรือภาษาอังกฤษได้ทันที
- **📊 สรุปสถิติหลังจบเกม:** รายงานเวลาเฉลี่ยต่อตาเดิน, จำนวนตาเดินทั้งหมด, หมากที่ถูกกิน, และการเลื่อนขั้น

---

## 3. การติดตั้งและทดสอบในเครื่อง (Local Setup)

```bash
# Clone repository
git clone https://github.com/multiratt/minimal-boardgame.git
cd minimal-boardgame

# รันเว็บเซิร์ฟเวอร์แบบง่ายด้วย Python 3
python3 -m http.server 8080
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:8080` เพื่อเข้าเล่นได้ทันที
