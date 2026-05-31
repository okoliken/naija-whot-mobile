import type { WhotEngine } from "./engine/whotEngine";
import type { PendingPenalty } from "./types";

export const gameRuntime: {
  engine: WhotEngine | null;
  pendingPenalty: PendingPenalty;
  pendingSkipCount: number;
  pendingWhotIndex: number | null;
} = {
  engine: null,
  pendingPenalty: null,
  pendingSkipCount: 0,
  pendingWhotIndex: null,
};
