// rules-uno.js - Monochrome Minimalist UNO Rules Engine & AI (2 to 8 Players)
// Symbols: ◯ (Circle), ◻ (Square), △ (Triangle), ◇ (Diamond), ★ (Wild Star)
// Supports: Standard Rules & Stacking (+2 / +4) Rules

export const SUITS = ["circle", "square", "triangle", "diamond"];
export const SUIT_SYMBOLS = {
  circle: "◯",
  square: "◻",
  triangle: "△",
  diamond: "◇",
  wild: "★"
};

export const ACTION_SYMBOLS = {
  skip: "🚫",
  reverse: "🔄",
  draw2: "+2",
  wild: "★",
  wild4: "★+4"
};

export const RULE_UNO_STANDARD = "uno_standard";
export const RULE_UNO_STACKING = "uno_stacking";

let cardIdCounter = 1;

/**
 * Creates standard 108-card deck with 4 monochrome suits and Wilds
 */
export function createUnoDeck() {
  const deck = [];
  cardIdCounter = 1;

  for (const suit of SUITS) {
    // One 0 card
    deck.push({
      id: `c_${cardIdCounter++}`,
      suit,
      value: "0",
      type: "number"
    });

    // Two cards each from 1 to 9
    for (let n = 1; n <= 9; n++) {
      const val = String(n);
      deck.push({ id: `c_${cardIdCounter++}`, suit, value: val, type: "number" });
      deck.push({ id: `c_${cardIdCounter++}`, suit, value: val, type: "number" });
    }

    // Two cards each of Skip, Reverse, Draw 2
    for (let i = 0; i < 2; i++) {
      deck.push({ id: `c_${cardIdCounter++}`, suit, value: "skip", type: "action" });
      deck.push({ id: `c_${cardIdCounter++}`, suit, value: "reverse", type: "action" });
      deck.push({ id: `c_${cardIdCounter++}`, suit, value: "draw2", type: "action" });
    }
  }

  // 4 Wild cards and 4 Wild Draw 4 cards
  for (let i = 0; i < 4; i++) {
    deck.push({ id: `c_${cardIdCounter++}`, suit: "wild", value: "wild", type: "wild" });
    deck.push({ id: `c_${cardIdCounter++}`, suit: "wild", value: "wild4", type: "wild" });
  }

  return shuffleDeck(deck);
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Deals 7 cards to each player and establishes initial discard pile
 */
export function setupUnoGame(playerCount = 4, ruleVariant = RULE_UNO_STANDARD) {
  const deck = createUnoDeck();
  const hands = {};

  for (let p = 0; p < playerCount; p++) {
    hands[p] = deck.splice(0, 7);
  }

  // Draw first card for discard pile (must not be Wild Draw 4 for clean start)
  let firstCardIndex = deck.findIndex(c => c.value !== "wild4");
  if (firstCardIndex === -1) firstCardIndex = 0;
  const firstCard = deck.splice(firstCardIndex, 1)[0];

  const discardPile = [firstCard];
  let activeSuit = firstCard.suit === "wild" ? SUITS[Math.floor(Math.random() * SUITS.length)] : firstCard.suit;

  let currentTurn = 0;
  let direction = 1; // 1: clockwise, -1: counter-clockwise
  let pendingDrawCount = 0;

  // Apply initial card effect if action
  if (firstCard.value === "skip") {
    currentTurn = (currentTurn + direction + playerCount) % playerCount;
  } else if (firstCard.value === "reverse") {
    direction = -1;
    if (playerCount === 2) {
      currentTurn = (currentTurn + direction + playerCount) % playerCount;
    } else {
      currentTurn = (playerCount - 1);
    }
  } else if (firstCard.value === "draw2") {
    if (ruleVariant === RULE_UNO_STACKING) {
      pendingDrawCount = 2;
    } else {
      hands[0].push(...deck.splice(0, 2));
      currentTurn = (currentTurn + direction + playerCount) % playerCount;
    }
  }

  return {
    drawPile: deck,
    discardPile,
    hands,
    activeSuit,
    currentTurn,
    direction,
    pendingDrawCount,
    ruleVariant,
    playerCount,
    unoShouted: {}, // { [playerId]: boolean }
    winner: null
  };
}

/**
 * Checks if a card in hand can be played
 */
export function isCardPlayable(card, topCard, activeSuit, pendingDrawCount = 0, ruleVariant = RULE_UNO_STANDARD) {
  if (!card) return false;

  // If there's an active stacking penalty
  if (pendingDrawCount > 0 && ruleVariant === RULE_UNO_STACKING) {
    if (topCard.value === "draw2") {
      return card.value === "draw2";
    }
    if (topCard.value === "wild4") {
      return card.value === "wild4";
    }
  }

  // Wild cards can always be played
  if (card.suit === "wild") {
    return true;
  }

  // Match active suit
  if (card.suit === activeSuit) {
    return true;
  }

  // Match value
  if (card.value === topCard.value) {
    return true;
  }

  return false;
}

/**
 * Returns all playable cards from hand
 */
export function getPlayableCards(hand, topCard, activeSuit, pendingDrawCount = 0, ruleVariant = RULE_UNO_STANDARD) {
  return hand.filter(card => isCardPlayable(card, topCard, activeSuit, pendingDrawCount, ruleVariant));
}

/**
 * Applies card play to game state
 */
export function playUnoCard(state, playerIndex, cardId, chosenSuit = null) {
  const hand = state.hands[playerIndex];
  const cardIndex = hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return { success: false, reason: "card_not_in_hand" };

  const card = hand[cardIndex];
  const topCard = state.discardPile[state.discardPile.length - 1];

  if (!isCardPlayable(card, topCard, state.activeSuit, state.pendingDrawCount, state.ruleVariant)) {
    return { success: false, reason: "illegal_card" };
  }

  // Remove card from hand and push to discard pile
  hand.splice(cardIndex, 1);
  state.discardPile.push(card);

  // Set active suit
  if (card.suit === "wild") {
    state.activeSuit = chosenSuit || SUITS[0];
  } else {
    state.activeSuit = card.suit;
  }

  // Reset UNO shout for this player if more than 1 card left
  if (hand.length !== 1) {
    delete state.unoShouted[playerIndex];
  }

  // Check victory
  if (hand.length === 0) {
    state.winner = playerIndex;
    return { success: true, state, isGameOver: true, winner: playerIndex };
  }

  // Apply card action effects
  const pCount = state.playerCount;
  let nextStep = 1;

  if (card.value === "reverse") {
    state.direction *= -1;
    if (pCount === 2) {
      nextStep = 2; // In 2-player UNO, Reverse acts as Skip
    }
  } else if (card.value === "skip") {
    nextStep = 2;
  } else if (card.value === "draw2") {
    if (state.ruleVariant === RULE_UNO_STACKING) {
      state.pendingDrawCount += 2;
      nextStep = 1;
    } else {
      const victim = (playerIndex + state.direction + pCount) % pCount;
      drawCardsToPlayer(state, victim, 2);
      nextStep = 2; // Victim skips turn
    }
  } else if (card.value === "wild4") {
    if (state.ruleVariant === RULE_UNO_STACKING) {
      state.pendingDrawCount += 4;
      nextStep = 1;
    } else {
      const victim = (playerIndex + state.direction + pCount) % pCount;
      drawCardsToPlayer(state, victim, 4);
      nextStep = 2; // Victim skips turn
    }
  }

  state.currentTurn = (playerIndex + state.direction * nextStep + pCount * 10) % pCount;
  return { success: true, state, isGameOver: false };
}

/**
 * Draws N cards for a player from draw pile (reshuffles discard pile if needed)
 */
export function drawCardsToPlayer(state, playerIndex, count = 1) {
  const drawn = [];
  for (let i = 0; i < count; i++) {
    if (state.drawPile.length === 0) {
      if (state.discardPile.length <= 1) break;
      const top = state.discardPile.pop();
      state.drawPile = shuffleDeck(state.discardPile);
      state.discardPile = [top];
    }
    if (state.drawPile.length > 0) {
      const card = state.drawPile.pop();
      drawn.push(card);
      state.hands[playerIndex].push(card);
    }
  }
  return drawn;
}

/**
 * Player passes their turn after drawing or drawing penalty
 */
export function passUnoTurn(state, playerIndex) {
  // If there was a pending stacking penalty, apply it
  if (state.pendingDrawCount > 0) {
    drawCardsToPlayer(state, playerIndex, state.pendingDrawCount);
    state.pendingDrawCount = 0;
  }

  state.currentTurn = (playerIndex + state.direction + state.playerCount) % state.playerCount;
  return state;
}

/**
 * Challenges a player who didn't shout UNO when having 1 card
 */
export function challengeUno(state, targetPlayerIndex) {
  if (state.hands[targetPlayerIndex].length === 1 && !state.unoShouted[targetPlayerIndex]) {
    drawCardsToPlayer(state, targetPlayerIndex, 2);
    return { success: true, penalized: true };
  }
  return { success: false, penalized: false };
}

/**
 * Marks player as having shouted UNO!
 */
export function shoutUno(state, playerIndex) {
  if (state.hands[playerIndex].length <= 2) {
    state.unoShouted[playerIndex] = true;
    return true;
  }
  return false;
}

// --- BOT AI FOR UNO ---

export function getAIUnoAction(state, botIndex, difficulty = "medium") {
  const hand = state.hands[botIndex];
  const topCard = state.discardPile[state.discardPile.length - 1];
  const playable = getPlayableCards(hand, topCard, state.activeSuit, state.pendingDrawCount, state.ruleVariant);

  // Auto-shout UNO if reaching 1 card or already at 1 card
  if (hand.length === 2 && playable.length > 0) {
    shoutUno(state, botIndex);
  }

  // If no playable card, must draw
  if (playable.length === 0) {
    return { action: "draw" };
  }

  // Easy AI: Pick random playable card
  if (difficulty === "easy") {
    const card = playable[Math.floor(Math.random() * playable.length)];
    const chosenSuit = card.suit === "wild" ? chooseBestSuit(hand) : null;
    return { action: "play", cardId: card.id, chosenSuit };
  }

  // Medium / Hard AI: Strategic card selection
  // Prioritize +2 / +4 if pending draw exists
  if (state.pendingDrawCount > 0) {
    const stackCard = playable.find(c => c.value === topCard.value);
    if (stackCard) {
      return {
        action: "play",
        cardId: stackCard.id,
        chosenSuit: stackCard.suit === "wild" ? chooseBestSuit(hand) : null
      };
    }
  }

  // Strategy weights:
  // 1. Action cards (+2, Skip, Reverse) when next player has low cards
  const nextPlayer = (botIndex + state.direction + state.playerCount) % state.playerCount;
  const nextPlayerCardCount = state.hands[nextPlayer].length;

  let bestCard = playable[0];
  let bestScore = -Infinity;

  for (const card of playable) {
    let score = 0;

    // Save Wild cards for when we don't have matching color
    if (card.suit === "wild") {
      score = playable.length === 1 ? 50 : 5;
      if (nextPlayerCardCount <= 2 && card.value === "wild4") score += 80;
    } else {
      score = 20;
      if (card.suit === state.activeSuit) score += 10;
      if (card.value === "draw2" && nextPlayerCardCount <= 3) score += 40;
      if (card.value === "skip" && nextPlayerCardCount <= 3) score += 35;
      if (card.value === "reverse") score += 15;
    }

    if (score > bestScore) {
      bestScore = score;
      bestCard = card;
    }
  }

  const chosenSuit = bestCard.suit === "wild" ? chooseBestSuit(hand) : null;
  return { action: "play", cardId: bestCard.id, chosenSuit };
}

function chooseBestSuit(hand) {
  const counts = { circle: 0, square: 0, triangle: 0, diamond: 0 };
  for (const c of hand) {
    if (c.suit !== "wild") {
      counts[c.suit] = (counts[c.suit] || 0) + 1;
    }
  }
  let bestSuit = SUITS[0];
  let maxCount = -1;
  for (const s of SUITS) {
    if (counts[s] > maxCount) {
      maxCount = counts[s];
      bestSuit = s;
    }
  }
  return bestSuit;
}
