import { onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import {
  getFirestoreErrorHint,
  roomDocRef,
  roomStateFromDoc,
  setupCreateRoom,
  setupJoinRoom,
} from "./roomConnection";
import type { RoomDoc, RoomState } from "./roomTypes";
import { useAuthUid } from "./useAuthUid";

type Args = {
  mode: "create" | "join" | null;
  code: string | null;
};

export function useRoom({ mode, code }: Args): RoomState {
  const myId = useAuthUid();
  const [state, setState] = useState<RoomState>({ kind: "idle" });

  useEffect(() => {
    if (!mode || !code) {
      setState({ kind: "idle" });
      return;
    }
    if (!myId) {
      setState({ kind: "connecting" });
      return;
    }

    const roomCode = code;
    const uid = myId;

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    setState({ kind: "connecting" });

    const subscribeToRoom = (roomCode: string) => {
      const ref = roomDocRef(roomCode);
      unsubscribe = onSnapshot(
        ref,
        (snap) => {
          if (cancelled) return;
          if (!snap.exists()) {
            setState({ kind: "left" });
            return;
          }
          setState(roomStateFromDoc(snap.data() as RoomDoc, uid, roomCode));
        },
        () => {
          if (!cancelled) {
            setState({ kind: "error", hint: "Lost connection to room." });
          }
        },
      );
    };

    async function connect() {
      const ref = roomDocRef(roomCode);

      try {
        const result =
          mode === "create"
            ? await setupCreateRoom(ref, roomCode, uid)
            : await setupJoinRoom(ref, uid);

        if (cancelled) return;
        if (!result.ok) {
          setState(result.state);
          return;
        }
      } catch (err) {
        const { code: errCode, hint } = getFirestoreErrorHint(err);
        console.warn("[useRoom] write failed", errCode, err);
        if (!cancelled) {
          setState({ kind: "error", hint });
        }
        return;
      }

      if (cancelled) return;
      subscribeToRoom(roomCode);
    }

    connect();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [mode, code, myId]);

  return state;
}
