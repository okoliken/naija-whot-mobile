import { canPlay, type Card } from "@/src/store/gameStore";

export function isPlayableCard(
  card: Card,
  topCard: Card | null,
  requestedShape: Card["shape"] | null,
  pendingPick: number,
) {
  if (!topCard) return false;
  const legal = canPlay(card, topCard, requestedShape);
  const blockedByPick = pendingPick > 0 && card.value !== 2 && card.value !== 5;
  return legal && !blockedByPick;
}
