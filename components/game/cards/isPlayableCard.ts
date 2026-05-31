import { canPlay, type Card } from "@/src/game/gameStore";

export function isPlayableCard(
  card: Card,
  topCard: Card | null,
  requestedShape: Card["shape"] | null,
  pendingPick: number,
) {
  if (!topCard) return false;
  const legal = canPlay(card, topCard, requestedShape);
  const blockedByPick =
    pendingPick > 0 &&
    (topCard.value === 14 ? card.value !== 14 : card.value !== 2 && card.value !== 5);
  return legal && !blockedByPick;
}
