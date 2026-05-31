import type { Seat } from "@/src/room/types";
import { SHAPE_LABELS } from "@/src/game/constants";
import type { Card, Shape } from "@/src/game/types";

import type { NetGameState, RequestedShape } from "./netTypes";

/* ---------- deck composition (Naija Whot, 54 cards) ---------- */

const NUMBERED_BY_SHAPE: Record<Exclude<Shape, "whot">, number[]> = {
  circle: [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14],
  triangle: [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14],
  cross: [1, 2, 3, 5, 7, 10, 11, 13, 14],
  square: [1, 2, 3, 5, 7, 10, 11, 13, 14],
  star: [1, 2, 3, 4, 5, 7, 8],
};
const WHOT_COUNT = 5;
const STARTING_HAND_SIZE = 5;

function buildDeck(): Card[] {
  const deck: Card[] = [];
  (Object.keys(NUMBERED_BY_SHAPE) as (keyof typeof NUMBERED_BY_SHAPE)[]).forEach((shape) => {
    NUMBERED_BY_SHAPE[shape].forEach((value) => {
      deck.push({ id: `${shape}-${value}-${deck.length}`, shape, value });
    });
  });
  for (let i = 0; i < WHOT_COUNT; i += 1) {
    deck.push({ id: `whot-20-${deck.length}`, shape: "whot", value: 20 });
  }
  return deck;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Whot, Pick chain, Hold On, Suspension, General Market shouldn't be the
 *  flipped start card — re-flip until the top is a plain number. */
function isPlainStartCard(card: Card): boolean {
  if (card.shape === "whot") return false;
  return ![1, 2, 5, 8, 14, 20].includes(card.value);
}

export function createInitialNetState(): NetGameState {
  const deck = shuffleInPlace(buildDeck());
  const hostHand = deck.splice(0, STARTING_HAND_SIZE);
  const guestHand = deck.splice(0, STARTING_HAND_SIZE);

  let topCard = deck.shift()!;
  // Re-flip if the start card is special. Place it deeper in the deck.
  let safety = 50;
  while (!isPlainStartCard(topCard) && safety > 0 && deck.length > 0) {
    deck.push(topCard);
    topCard = deck.shift()!;
    safety -= 1;
  }

  return {
    deck,
    topCard,
    hostHand,
    guestHand,
    turn: "host",
    pendingPick: 0,
    pendingPenalty: null,
    requestedShape: null,
    awaitingShapeChoice: false,
    // Messages use {ACTOR} / {WINNER} placeholders. The client substitutes
    // "You" / "Opponent" based on the viewer's seat — so the same Firestore
    // doc renders correctly for both players.
    message: "Round started.",
    winner: null,
    tick: 0,
    lastActor: null,
  };
}

/* ---------- pure transitions ---------- */

type TransitionResult = NetGameState | { error: string };

function isError(result: TransitionResult): result is { error: string } {
  return "error" in result;
}

function opponent(seat: Seat): Seat {
  return seat === "host" ? "guest" : "host";
}

function handOf(state: NetGameState, seat: Seat): Card[] {
  return seat === "host" ? state.hostHand : state.guestHand;
}

function withHand(state: NetGameState, seat: Seat, hand: Card[]): NetGameState {
  return seat === "host"
    ? { ...state, hostHand: hand }
    : { ...state, guestHand: hand };
}

function isLegalPlay(card: Card, top: Card, requested: RequestedShape): boolean {
  if (card.value === 20) return true; // Crown is always legal
  if (requested) return card.shape === requested;
  return card.shape === top.shape || card.value === top.value;
}

function cardLabel(card: Card): string {
  if (card.shape === "whot") return "Crown";
  return `${SHAPE_LABELS[card.shape]} ${card.value}`;
}

function checkExhaustionWinner(state: NetGameState): Seat {
  const hostCount = state.hostHand.length;
  const guestCount = state.guestHand.length;
  if (hostCount === guestCount) {
    const hostPoints = state.hostHand.reduce((s, c) => s + c.value, 0);
    const guestPoints = state.guestHand.reduce((s, c) => s + c.value, 0);
    return hostPoints <= guestPoints ? "host" : "guest";
  }
  return hostCount < guestCount ? "host" : "guest";
}

function bumpTick(state: NetGameState, actor: Seat): NetGameState {
  return { ...state, tick: state.tick + 1, lastActor: actor };
}

export function applyPlay(
  state: NetGameState,
  actor: Seat,
  cardIndex: number,
  requestedShape?: RequestedShape,
): TransitionResult {
  if (state.winner) return { error: "Round is already over." };
  if (state.awaitingShapeChoice) return { error: "Waiting on shape choice." };
  if (state.turn !== actor) return { error: "Not your turn." };
  if (!state.topCard) return { error: "Top card is missing." };

  const hand = handOf(state, actor);
  const card = hand[cardIndex];
  if (!card) return { error: "Invalid card index." };

  // Penalty defense
  if (state.pendingPenalty != null && state.pendingPick > 0) {
    if (card.value !== state.pendingPenalty) {
      return {
        error: `You must defend with a ${state.pendingPenalty} or draw.`,
      };
    }
  }

  if (!isLegalPlay(card, state.topCard, state.requestedShape)) {
    return { error: "That card cannot follow the top card." };
  }

  // Crown without a shape choice -> enter awaiting-shape mode (no card moves yet)
  if (card.value === 20 && !requestedShape) {
    return bumpTick(
      {
        ...state,
        awaitingShapeChoice: true,
        message: `{ACTOR} is choosing a shape...`,
      },
      actor,
    );
  }

  // Resolve a Crown-with-shape OR a normal play
  const newHand = hand.filter((_, i) => i !== cardIndex);
  let next: NetGameState = withHand(state, actor, newHand);

  let nextTurn: Seat = opponent(actor);
  let pendingPick = state.pendingPick;
  let pendingPenalty = state.pendingPenalty;
  let nextRequestedShape: RequestedShape = null;
  let message = `{ACTOR} played ${cardLabel(card)}.`;

  if (card.value === 20) {
    nextRequestedShape = requestedShape ?? null;
    pendingPick = 0;
    pendingPenalty = null;
    message = `{ACTOR} played Crown — needs ${
      requestedShape ? SHAPE_LABELS[requestedShape] : "any"
    }.`;
  } else if (card.value === 1) {
    nextTurn = actor; // Hold On: play again
    pendingPick = 0;
    pendingPenalty = null;
    message = `{ACTOR} played Hold On.`;
  } else if (card.value === 2) {
    pendingPick += 2;
    pendingPenalty = 2;
    message = `{ACTOR} played Pick Two.`;
  } else if (card.value === 5) {
    pendingPick += 3;
    pendingPenalty = 5;
    message = `{ACTOR} played Pick Three.`;
  } else if (card.value === 8) {
    nextTurn = actor; // Suspension in 2-player == play again
    pendingPick = 0;
    pendingPenalty = null;
    message = `{ACTOR} played Suspension.`;
  } else if (card.value === 14) {
    pendingPick += 1;
    pendingPenalty = 14;
    message = `{ACTOR} played General Market.`;
  } else {
    pendingPick = 0;
    pendingPenalty = null;
  }

  const winner = newHand.length === 0 ? actor : null;

  next = {
    ...next,
    topCard: card,
    requestedShape: nextRequestedShape,
    awaitingShapeChoice: false,
    turn: winner ? state.turn : nextTurn,
    pendingPick,
    pendingPenalty,
    message: winner ? `{WINNER} won the round.` : message,
    winner,
  };

  return bumpTick(next, actor);
}

export function applyDraw(state: NetGameState, actor: Seat): TransitionResult {
  if (state.winner) return { error: "Round is already over." };
  if (state.awaitingShapeChoice) return { error: "Waiting on shape choice." };
  if (state.turn !== actor) return { error: "Not your turn." };

  const drawCount = state.pendingPick > 0 ? state.pendingPick : 1;

  if (state.deck.length < drawCount) {
    // Market dry — settle by hand count.
    const winner = checkExhaustionWinner(state);
    return bumpTick(
      {
        ...state,
        winner,
        message: `Market is dry — {WINNER} wins.`,
      },
      actor,
    );
  }

  const drawn = state.deck.slice(0, drawCount);
  const remainingDeck = state.deck.slice(drawCount);
  const newHand = handOf(state, actor).concat(drawn);

  const next = withHand(state, actor, newHand);

  return bumpTick(
    {
      ...next,
      deck: remainingDeck,
      pendingPick: 0,
      pendingPenalty: null,
      turn: opponent(actor),
      message:
        drawCount > 1
          ? `{ACTOR} picked ${drawCount} cards.`
          : `{ACTOR} drew from market.`,
    },
    actor,
  );
}

export function applyShapeChoice(
  state: NetGameState,
  actor: Seat,
  shape: Exclude<Shape, "whot">,
): TransitionResult {
  if (state.winner) return { error: "Round is already over." };
  if (!state.awaitingShapeChoice) return { error: "No shape choice pending." };
  if (state.turn !== actor) return { error: "Not your turn." };

  const hand = handOf(state, actor);
  const whotIndex = hand.findIndex((c) => c.value === 20);
  if (whotIndex < 0) return { error: "No Crown card in hand." };

  // Clear the awaiting flag before delegating; otherwise applyPlay's own
  // guard would reject this very write as "Waiting on shape choice."
  return applyPlay(
    { ...state, awaitingShapeChoice: false },
    actor,
    whotIndex,
    shape,
  );
}

export { isError };
