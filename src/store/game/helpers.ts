import { WhotEngine } from "@/services/whotEngine";
import type { CardModel, CardShape } from "@/types/game";
import { SHAPES, SHAPE_LABELS } from "./constants";
import { gameRuntime } from "./runtime";
import type { Card, GameState, Player, RoundSnapshot, Shape } from "./types";

const SHAPE_TO_UI: Record<CardShape, Exclude<Shape, "whot">> = {
  Circle: "circle",
  Triangle: "triangle",
  Square: "square",
  Cross: "cross",
  Star: "star",
};

export const SHAPE_TO_ENGINE: Record<Exclude<Shape, "whot">, CardShape> = {
  circle: "Circle",
  triangle: "Triangle",
  square: "Square",
  cross: "Cross",
  star: "Star",
};

export function toUiCard(card: CardModel): Card {
  if (card.value === 20 || card.move === "Whot") {
    return { id: card.id, value: card.value, shape: "whot" };
  }
  return {
    id: card.id,
    value: card.value,
    shape: SHAPE_TO_UI[card.shape],
  };
}

export function fromEngineShape(shape: CardShape): Exclude<Shape, "whot"> {
  return SHAPE_TO_UI[shape];
}

export function toUiCards(cards: CardModel[]): Card[] {
  return cards.map(toUiCard);
}

function mapMove(value: number): CardModel["move"] {
  if (value === 20) return "Whot";
  if (value === 1) return "Hold On";
  if (value === 2) return "Pick Two";
  if (value === 5) return "Pick Three";
  if (value === 8) return "Suspension";
  if (value === 14) return "General Market";
  return "None";
}

export function toAiCard(card: Card): CardModel {
  return {
    id: card.id,
    value: card.value,
    shape: card.shape === "whot" ? "Star" : SHAPE_TO_ENGINE[card.shape],
    move: mapMove(card.value),
  };
}

export function canPlayByEngineRules(card: Card, topCard: Card, requestedShape: Shape | null): boolean {
  if (card.value === 20) return true;
  if (requestedShape) return card.shape === requestedShape;
  return card.shape === topCard.shape || card.value === topCard.value;
}

export function canPlayAi(candidate: CardModel, top: CardModel, needed: CardShape | null) {
  if (candidate.value === 20) return true;
  if (needed) return candidate.shape === needed;
  return candidate.shape === top.shape || candidate.value === top.value;
}

export function cardLabel(card: Card): string {
  return card.shape === "whot" ? "Whot 20" : `${SHAPE_LABELS[card.shape]} ${card.value}`;
}

function makeDeckCountCards(count: number): Card[] {
  return Array.from({ length: count }, (_, i) => ({ id: `deck-${i}`, value: 0, shape: "whot" }));
}

export function buildStatusLine(state: Pick<GameState, "turn" | "pendingPick" | "requestedShape">): string {
  const turnLabel = state.turn === "human" ? "Your turn" : "Computer turn";
  const pickLabel = state.pendingPick > 0 ? ` | Pick chain: ${state.pendingPick}` : "";
  const shapeLabel = state.requestedShape ? ` | Need: ${SHAPE_LABELS[state.requestedShape]}` : "";
  return `${turnLabel}${pickLabel}${shapeLabel}`;
}

export function syncHands(): Pick<GameState, "humanHand" | "computerHand" | "deck"> {
  if (!gameRuntime.engine) {
    return { humanHand: [], computerHand: [], deck: [] };
  }
  return {
    humanHand: toUiCards(gameRuntime.engine.getHand(0)),
    computerHand: toUiCards(gameRuntime.engine.getHand(1)),
    deck: makeDeckCountCards(gameRuntime.engine.getMarketCount()),
  };
}

export function checkWinner(state: Pick<GameState, "humanHand" | "computerHand">): Player | null {
  if (state.humanHand.length === 0) return "human";
  if (state.computerHand.length === 0) return "computer";
  return null;
}

export function resolveByExhaustion(
  state: Pick<GameState, "humanHand" | "computerHand">,
): Pick<GameState, "winner" | "message" | "gameStarted"> {
  const humanCount = state.humanHand.length;
  const computerCount = state.computerHand.length;

  let roundWinner: Player;
  if (humanCount === computerCount) {
    const humanPoints = state.humanHand.reduce((sum, c) => sum + c.value, 0);
    const computerPoints = state.computerHand.reduce((sum, c) => sum + c.value, 0);
    roundWinner = humanPoints <= computerPoints ? "human" : "computer";
  } else {
    roundWinner = humanCount < computerCount ? "human" : "computer";
  }

  return {
    winner: roundWinner,
    message:
      roundWinner === "human"
        ? `Market dry - you win with ${humanCount} vs ${computerCount} cards.`
        : `Market dry - CPU wins with ${computerCount} vs ${humanCount} cards.`,
    gameStarted: false,
  };
}

export function runGeneralMarketDraw(target: Player): { ok: true } | { ok: false } {
  if (!gameRuntime.engine) return { ok: false };
  const result = gameRuntime.engine.draw(target === "human" ? 0 : 1);
  return result.ok ? { ok: true } : { ok: false };
}

export function createInitialRoundState(): RoundSnapshot {
  gameRuntime.engine = new WhotEngine();
  gameRuntime.pendingPenalty = null;
  gameRuntime.pendingSkipCount = 0;
  gameRuntime.pendingWhotIndex = null;

  const { humanHand, computerHand, deck } = syncHands();
  const topCard = gameRuntime.engine ? toUiCard(gameRuntime.engine.getTopCard()) : null;

  const snapshot: RoundSnapshot = {
    deck,
    topCard,
    humanHand,
    computerHand,
    turn: "human",
    pendingPick: 0,
    skipNextPlayer: null,
    requestedShape: null,
    awaitingShapeChoice: false,
    message: "Game started. Your turn.",
    gameStarted: true,
    winner: null,
    statusLine: "",
    aiTurnTick: 0,
  };
  snapshot.statusLine = buildStatusLine(snapshot);
  return snapshot;
}

export { SHAPES, SHAPE_LABELS };
