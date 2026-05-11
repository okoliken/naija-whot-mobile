import { SHAPE_LABELS, type Card } from "@/src/store/gameStore";

export const SHAPE_GLYPH: Record<string, string> = {
  circle: "●",
  triangle: "▲",
  cross: "✚",
  star: "★",
  square: "■",
  whot: "♛",
};

export const CENTER_GLYPH_CLASS: Record<Card["shape"], string> = {
  circle: "text-[44px]",
  triangle: "text-[50px]",
  cross: "text-[42px]",
  star: "text-[46px]",
  square: "text-[54px]",
  whot: "text-[40px]",
};

export const CORNER_GLYPH_CLASS: Record<Card["shape"], string> = {
  circle: "text-[12px]",
  triangle: "text-[12px]",
  cross: "text-[11px]",
  star: "text-[12px]",
  square: "text-[16px]",
  whot: "text-[11px]",
};

export function renderCardTitle(card: Card): string {
  if (card.value === 20) return "Whot";
  if (card.value === 14) return "General Market";
  if (card.value === 8) return "Suspension";
  if (card.value === 5) return "Pick Three";
  if (card.value === 2) return "Pick Two";
  if (card.value === 1) return "Hold On";
  return SHAPE_LABELS[card.shape];
}
