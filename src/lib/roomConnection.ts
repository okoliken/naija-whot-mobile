import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
  type DocumentReference,
} from "firebase/firestore";

import { db } from "./firebase";
import type { RoomDoc, RoomState, Seat } from "./roomTypes";

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

export type RoomSetupResult =
  | { ok: true }
  | { ok: false; state: RoomState };

export function roomDocRef(code: string): DocumentReference {
  return doc(db, "rooms", code);
}

export function getFirestoreErrorHint(err: unknown): { code: string; hint: string } {
  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : "unknown";

  const hint =
    code === "permission-denied"
      ? "Firestore rules rejected the write. Deploy firestore.rules."
      : code === "unavailable"
        ? "Firestore is unreachable. Check your connection."
        : `Couldn't reach Firestore (${code}).`;

  return { code, hint };
}

export async function setupCreateRoom(
  ref: DocumentReference,
  code: string,
  myId: string,
): Promise<RoomSetupResult> {
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const now = Date.now();
    await setDoc(ref, {
      code,
      createdAt: now,
      // Firestore TTL only triggers on Timestamp fields, not raw numbers.
      expiresAt: Timestamp.fromMillis(now + ROOM_TTL_MS),
      hostId: myId,
      guestId: null,
    } satisfies RoomDoc);
    return { ok: true };
  }

  const data = snap.data() as RoomDoc;
  if (data.hostId !== myId && data.guestId !== myId) {
    return {
      ok: false,
      state: { kind: "error", hint: "Code already in use — try again." },
    };
  }

  return { ok: true };
}

export async function setupJoinRoom(
  ref: DocumentReference,
  myId: string,
): Promise<RoomSetupResult> {
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { ok: false, state: { kind: "error", hint: "No room with that code." } };
  }

  const data = snap.data() as RoomDoc;

  // Original host rejoining their own room — let them back in without
  // touching guestId so the existing guest stays seated.
  if (data.hostId === myId) {
    return { ok: true };
  }

  if (data.guestId && data.guestId !== myId) {
    return { ok: false, state: { kind: "full" } };
  }

  if (data.guestId !== myId) {
    await updateDoc(ref, { guestId: myId });
  }

  return { ok: true };
}

/**
 * Mark a seat as present/away in the room doc. Called when the in-game
 * screen mounts/unmounts and on AppState changes. Best-effort — failures
 * are swallowed because the room doc may have just been deleted (host
 * ended the game) and we don't want to spam errors during teardown.
 */
export async function setRoomPresence(
  ref: DocumentReference,
  seat: Seat,
  present: boolean,
): Promise<void> {
  const field = seat === "host" ? "hostPresent" : "guestPresent";
  try {
    await updateDoc(ref, { [field]: present });
  } catch {
    // intentionally silent — room may not exist or rules may have changed
  }
}

export function roomStateFromDoc(
  data: RoomDoc,
  myId: string,
  code: string,
): RoomState {
  const seat = data.hostId === myId ? "host" : "guest";
  const both = data.hostId && data.guestId;
  if (both) {
    return {
      kind: "ready",
      seat,
      code,
      hostId: data.hostId!,
      guestId: data.guestId!,
    };
  }
  return { kind: "waiting", seat };
}
