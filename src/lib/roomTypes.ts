export type Seat = "host" | "guest";

import type { Timestamp } from "firebase/firestore";

export type RoomDoc = {
  code: string;
  createdAt: number;
  /** Firestore Timestamp; the TTL policy on this field auto-deletes the room. */
  expiresAt: Timestamp;
  hostId: string | null;
  guestId: string | null;
};

export type RoomState =
  | { kind: "idle" }
  | { kind: "connecting" }
  | { kind: "waiting"; seat: Seat }
  | {
      kind: "ready";
      seat: Seat;
      code: string;
      hostId: string;
      guestId: string;
    }
  | { kind: "full" }
  | { kind: "error"; hint?: string }
  | { kind: "left" };
