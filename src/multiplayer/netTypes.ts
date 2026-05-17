import type { Seat } from "@/src/lib/roomTypes";
import type { Card, Shape } from "@/src/store/game/types";

export type RequestedShape = Exclude<Shape, "whot"> | null;

/**
 * Authoritative game state stored at `rooms/{code}/state/current`. Both
 * clients read it via `onSnapshot`; whoever's `turn` it is may write the
 * next state. Hidden hands are intentionally NOT enforced — we trust the
 * peer for v1. See AGENT.md for the cheating posture.
 */
export type NetGameState = {
  /** Remaining draw pile, ordered. Index 0 is the next card to draw. */
  deck: Card[];
  /** Top of the discard pile. Null only between rounds. */
  topCard: Card | null;
  hostHand: Card[];
  guestHand: Card[];
  turn: Seat;
  /** Accumulated draw count from a Pick chain. */
  pendingPick: number;
  /** Which value started the chain (so we know what defends it). */
  pendingPenalty: 2 | 5 | 14 | null;
  requestedShape: RequestedShape;
  /** True between Crown being tapped and the shape being chosen. */
  awaitingShapeChoice: boolean;
  /** UI message for the most recent move. */
  message: string;
  winner: Seat | null;
  /** Monotonic; bumped on every write. Used to detect stale local optimism. */
  tick: number;
  /** Last seat to write, for UI hints. Not authoritative. */
  lastActor: Seat | null;
};

export type MoveLog = {
  seq: number;
  actor: string; // uid
  kind: "play" | "draw" | "choose" | "start";
  payload?: { cardIndex?: number; shape?: RequestedShape };
  ts: number;
};
