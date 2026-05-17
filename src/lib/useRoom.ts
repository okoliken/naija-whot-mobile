import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "./firebase";
import type { RoomDoc, RoomState, Seat } from "./roomTypes";
import { useAuthUid } from "./useAuthUid";

type Args = {
  mode: "create" | "join" | null;
  code: string | null;
};

const ROOM_TTL_MS = 24 * 60 * 60 * 1000;

export function useRoom({ mode, code }: Args): RoomState {
  const myId = useAuthUid();
  const [state, setState] = useState<RoomState>({ kind: "idle" });

  useEffect(() => {
    if (!mode || !code) {
      setState({ kind: "idle" });
      return;
    }
    if (!myId) {
      // Anonymous sign-in hasn't landed yet. Stay in `connecting`; this
      // effect re-runs when `myId` resolves.
      setState({ kind: "connecting" });
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    setState({ kind: "connecting" });

    (async () => {
      const ref = doc(db, "rooms", code);

      try {
        if (mode === "create") {
          const snap = await getDoc(ref);
          if (cancelled) return;
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
          } else {
            const data = snap.data() as RoomDoc;
            if (data.hostId !== myId && data.guestId !== myId) {
              setState({
                kind: "error",
                hint: "Code already in use — try again.",
              });
              return;
            }
          }
        } else {
          const snap = await getDoc(ref);
          if (cancelled) return;
          if (!snap.exists()) {
            setState({ kind: "error", hint: "No room with that code." });
            return;
          }
          const data = snap.data() as RoomDoc;
          if (data.guestId && data.guestId !== myId) {
            setState({ kind: "full" });
            return;
          }
          if (data.guestId !== myId) {
            await updateDoc(ref, { guestId: myId });
          }
        }
      } catch (err) {
        // Surface the Firebase error code so rule denials and offline
        // states are distinguishable instead of all collapsing to a
        // generic "couldn't reach" message.
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: unknown }).code)
            : "unknown";
        console.warn("[useRoom] write failed", code, err);
        if (!cancelled) {
          const hint =
            code === "permission-denied"
              ? "Firestore rules rejected the write. Deploy firestore.rules."
              : code === "unavailable"
                ? "Firestore is unreachable. Check your connection."
                : `Couldn't reach Firestore (${code}).`;
          setState({ kind: "error", hint });
        }
        return;
      }

      if (cancelled) return;

      unsubscribe = onSnapshot(
        ref,
        (snap) => {
          if (cancelled) return;
          if (!snap.exists()) {
            setState({ kind: "left" });
            return;
          }
          const data = snap.data() as RoomDoc;
          const seat: Seat = data.hostId === myId ? "host" : "guest";
          const both = data.hostId && data.guestId;
          setState(
            both
              ? { kind: "ready", seat, code, hostId: data.hostId!, guestId: data.guestId! }
              : { kind: "waiting", seat },
          );
        },
        () => {
          if (!cancelled) {
            setState({ kind: "error", hint: "Lost connection to room." });
          }
        },
      );
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [mode, code, myId]);

  return state;
}
