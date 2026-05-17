import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";

import { db } from "@/src/lib/firebase";
import type { Seat } from "@/src/lib/roomTypes";
import { useAuthUid } from "@/src/lib/useAuthUid";
import type { Card, Shape } from "@/src/store/game/types";

import {
  applyDraw,
  applyPlay,
  applyShapeChoice,
  createInitialNetState,
  isError,
} from "./netEngine";
import type { NetGameState } from "./netTypes";

type Args = {
  code: string;
  seat: Seat;
};

export type NetworkedGameView = {
  state: NetGameState | null;
  mySeat: Seat;
  /** Hand to render as the local player's hand. */
  myHand: Card[];
  /** Hand size of the opponent — opponent's actual cards stay hidden in UI. */
  opponentHandSize: number;
  /** Whether it's my turn (and the board is in a playable state). */
  isMyTurn: boolean;
  /** Last write error from a rejected intent — show as a toast or banner. */
  lastError: string | null;
  /** Intent: play `cardIndex` from my hand. */
  playCard: (cardIndex: number) => Promise<void>;
  /** Intent: draw from market. */
  drawCard: () => Promise<void>;
  /** Intent: pick a shape after Crown was tapped. */
  chooseShape: (shape: Exclude<Shape, "whot">) => Promise<void>;
  /** Host-only: deal a new round. No-op for the guest seat. */
  startNewRound: () => Promise<void>;
};

export function useNetworkedGame({ code, seat }: Args): NetworkedGameView {
  const uid = useAuthUid();
  const [state, setState] = useState<NetGameState | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Subscribe to authoritative state. Both clients listen; only the writer
  // for the current turn is permitted by security rules to update.
  useEffect(() => {
    if (!uid) return;
    const stateRef = doc(db, "rooms", code, "state", "current");
    return onSnapshot(
      stateRef,
      (snap) => {
        if (!snap.exists()) {
          setState(null);
          return;
        }
        setState(snap.data() as NetGameState);
      },
      (err) => {
        console.warn("[useNetworkedGame] snapshot error", err);
      },
    );
  }, [code, uid]);

  // Host writes the initial state on first ready. We treat absence of the
  // state doc as "no game has started yet" — guest waits, host creates.
  useEffect(() => {
    if (!uid || seat !== "host" || state !== null) return;
    // `state === null` covers both "still loading" and "doc doesn't exist".
    // To distinguish, defer one tick: if after a beat the snapshot listener
    // still hasn't filled in state, we treat this as a missing doc and
    // bootstrap. The snapshot listener will then immediately set state.
    const t = setTimeout(() => {
      const stateRef = doc(db, "rooms", code, "state", "current");
      setDoc(stateRef, {
        ...createInitialNetState(),
        createdAt: serverTimestamp(),
      }).catch((err) => {
        console.warn("[useNetworkedGame] initial deal failed", err);
      });
    }, 400);
    return () => clearTimeout(t);
  }, [uid, seat, state, code]);

  const writeTransition = useCallback(
    async (compute: (current: NetGameState) => NetGameState | { error: string }) => {
      if (!uid) return;
      setLastError(null);

      // Optimistic update: apply the transition to our current local view
      // immediately so the UI moves in sync with the tap. If the server-side
      // transaction fails, the snapshot listener will overwrite us with the
      // authoritative state on the next tick — so no manual rollback needed.
      setState((prev) => {
        if (!prev) return prev;
        const local = compute(prev);
        return isError(local) ? prev : local;
      });

      const stateRef = doc(db, "rooms", code, "state", "current");
      try {
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(stateRef);
          if (!snap.exists()) throw new Error("Game state not initialized.");
          const current = snap.data() as NetGameState;
          const result = compute(current);
          if (isError(result)) throw new Error(result.error);
          tx.set(stateRef, result);
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Move failed.";
        setLastError(message);
      }
    },
    [code, uid],
  );

  const playCard = useCallback(
    (cardIndex: number) =>
      writeTransition((current) => applyPlay(current, seat, cardIndex)),
    [seat, writeTransition],
  );

  const drawCard = useCallback(
    () => writeTransition((current) => applyDraw(current, seat)),
    [seat, writeTransition],
  );

  const chooseShape = useCallback(
    (shape: Exclude<Shape, "whot">) =>
      writeTransition((current) => applyShapeChoice(current, seat, shape)),
    [seat, writeTransition],
  );

  const startNewRound = useCallback(async () => {
    if (seat !== "host") return;
    setLastError(null);
    const stateRef = doc(db, "rooms", code, "state", "current");
    try {
      await setDoc(stateRef, createInitialNetState());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Restart failed.";
      setLastError(message);
    }
  }, [code, seat]);

  const myHand = state ? (seat === "host" ? state.hostHand : state.guestHand) : [];
  const opponentHandSize = state
    ? (seat === "host" ? state.guestHand.length : state.hostHand.length)
    : 0;
  const isMyTurn = !!state && state.turn === seat && !state.winner && !state.awaitingShapeChoice;

  return {
    state,
    mySeat: seat,
    myHand,
    opponentHandSize,
    isMyTurn,
    lastError,
    playCard,
    drawCard,
    chooseShape,
    startNewRound,
  };
}
