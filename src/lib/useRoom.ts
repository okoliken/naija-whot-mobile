import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { getClientId } from "./clientId";
import { db } from "./firebase";
import type { RoomDoc, RoomState, Seat } from "./roomTypes";

type Args = {
  mode: "create" | "join" | null;
  code: string | null;
};

export function useRoom({ mode, code }: Args): RoomState {
  const [state, setState] = useState<RoomState>({ kind: "idle" });

  useEffect(() => {
    if (!mode || !code) {
      setState({ kind: "idle" });
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    setState({ kind: "connecting" });

    (async () => {
      const myId = await getClientId();
      if (cancelled) return;

      const ref = doc(db, "rooms", code);

      try {
        if (mode === "create") {
          const snap = await getDoc(ref);
          if (cancelled) return;
          if (!snap.exists()) {
            await setDoc(ref, {
              code,
              createdAt: Date.now(),
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
      } catch {
        if (!cancelled) {
          setState({
            kind: "error",
            hint: "Couldn't reach Firestore. Check your connection.",
          });
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
              ? { kind: "ready", seat }
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
  }, [mode, code]);

  return state;
}
