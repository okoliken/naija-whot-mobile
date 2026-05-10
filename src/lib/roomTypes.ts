export type Seat = "host" | "guest";

export type RoomDoc = {
  code: string;
  createdAt: number;
  hostId: string | null;
  guestId: string | null;
};

export type RoomState =
  | { kind: "idle" }
  | { kind: "connecting" }
  | { kind: "waiting"; seat: Seat }
  | { kind: "ready"; seat: Seat }
  | { kind: "full" }
  | { kind: "error"; hint?: string }
  | { kind: "left" };
