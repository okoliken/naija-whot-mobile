import type { Player } from "@/src/store/gameStore";

export type ChipVariant = "your-turn" | "penalty" | "shape" | "cpu";

export type ChipState = {
  variant: ChipVariant;
  label: string;
  pulse: boolean;
};

type ChipInputs = {
  winner: Player | null;
  turn: Player;
  pendingPick: number;
  requestedShape: string | null;
  /** Display name for the opposing player. Default "CPU". */
  opponentLabel?: string;
};

export function getChipState({
  winner,
  turn,
  pendingPick,
  requestedShape,
  opponentLabel = "CPU",
}: ChipInputs): ChipState {
  if (winner === "human") {
    return { variant: "your-turn", label: "You won this round", pulse: false };
  }
  if (winner === "computer") {
    return { variant: "penalty", label: `${opponentLabel} won this round`, pulse: false };
  }
  if (turn === "computer") {
    return { variant: "cpu", label: `${opponentLabel} thinking...`, pulse: false };
  }
  if (pendingPick > 0) {
    const noun = pendingPick === 1 ? "card" : "cards";
    return {
      variant: "penalty",
      label: `Draw ${pendingPick} ${noun}`,
      pulse: true,
    };
  }
  if (requestedShape) {
    return {
      variant: "shape",
      label: `Shape: ${requestedShape}`,
      pulse: false,
    };
  }
  return { variant: "your-turn", label: "✓ Your turn", pulse: false };
}
