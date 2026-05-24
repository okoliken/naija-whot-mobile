export type Seat = "host" | "guest";

import type { Timestamp } from "firebase/firestore";

export type RoomDoc = {
  code: string;
  createdAt: number;
  /** Firestore Timestamp; the TTL policy on this field auto-deletes the room. */
  expiresAt: Timestamp;
  hostId: string | null;
  guestId: string | null;
  /**
   * Whether each seat currently has the in-game screen mounted/foregrounded.
   * Soft-leave (navigate back / app background) flips these to false so the
   * other client can render an "Opponent stepped away" banner.
   * Hard-leave (app killed mid-game) won't flip the flag — that's a known
   * limitation; the value will sit at `true` until they return or the room
   * expires via TTL.
   */
  hostPresent?: boolean;
  guestPresent?: boolean;
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
