import type { NetGameState } from "./netTypes";

/** Guard against partial/corrupt Firestore payloads before rendering the board. */
export function parseNetGameState(raw: unknown): NetGameState | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<NetGameState>;
  if (
    !Array.isArray(data.deck) ||
    !Array.isArray(data.hostHand) ||
    !Array.isArray(data.guestHand) ||
    (data.turn !== "host" && data.turn !== "guest") ||
    typeof data.pendingPick !== "number" ||
    typeof data.message !== "string"
  ) {
    return null;
  }
  return {
    deck: data.deck,
    topCard: data.topCard ?? null,
    hostHand: data.hostHand,
    guestHand: data.guestHand,
    turn: data.turn,
    pendingPick: data.pendingPick,
    pendingPenalty: data.pendingPenalty ?? null,
    requestedShape: data.requestedShape ?? null,
    awaitingShapeChoice: data.awaitingShapeChoice ?? false,
    message: data.message,
    winner: data.winner ?? null,
    tick: data.tick ?? 0,
    lastActor: data.lastActor ?? null,
  };
}
