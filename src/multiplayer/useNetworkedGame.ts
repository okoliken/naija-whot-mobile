import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { AppState } from "react-native";

import { db } from "@/src/lib/firebase";
import {
  getFirestoreErrorHint,
  setRoomPresence,
} from "@/src/lib/roomConnection";
import type { RoomDoc, Seat } from "@/src/lib/roomTypes";
import { useAuthUid } from "@/src/lib/useAuthUid";
import type { Card, Shape } from "@/src/store/game/types";

import {
  applyDraw,
  applyPlay,
  applyShapeChoice,
  createInitialNetState,
  isError,
} from "./netEngine";
import { parseNetGameState } from "./parseNetGameState";
import type { NetGameState } from "./netTypes";

type Args = {
  code: string;
  seat: Seat;
};

/**
 * High-level lifecycle of the room as observed from the game screen.
 * - `connecting`: waiting for first snapshot
 * - `live`: room doc + state doc both present
 * - `ended`: room doc was deleted (host pressed End Game)
 * - `lost`: snapshot listener errored (network/permissions/etc.)
 */
export type RoomStatus = "connecting" | "live" | "ended" | "lost";

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
  /** Listener-level error (room or state snapshot failed). */
  connectionError: string | null;
  /** Coarse room lifecycle for the screen to route on. */
  roomStatus: RoomStatus;
  /**
   * Whether the opponent currently has the game screen mounted and in the
   * foreground. `null` while we haven't observed a value yet (e.g., on a
   * legacy room doc written before the presence fields existed) — render
   * UI as if they're present in that case.
   */
  opponentPresent: boolean | null;
  /** Intent: play `cardIndex` from my hand. */
  playCard: (cardIndex: number) => Promise<void>;
  /** Intent: draw from market. */
  drawCard: () => Promise<void>;
  /** Intent: pick a shape after Crown was tapped. */
  chooseShape: (shape: Exclude<Shape, "whot">) => Promise<void>;
  /** Host-only: deal a new round. No-op for the guest seat. */
  startNewRound: () => Promise<void>;
  /** Host-only: delete the room. Both clients will see `roomStatus === 'ended'`. */
  endGame: () => Promise<void>;
};

export function useNetworkedGame({ code, seat }: Args): NetworkedGameView {
  const uid = useAuthUid();
  const [state, setState] = useState<NetGameState | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [roomExists, setRoomExists] = useState<boolean | null>(null);
  const [opponentPresent, setOpponentPresent] = useState<boolean | null>(null);

  // Subscribe to the parent room doc. We need this to detect when the
  // host deletes the room (End Game) — the game-state subdoc lingers as
  // an orphan in Firestore, so we can't infer end-game from that listener.
  // We also read the opponent's presence flag here.
  useEffect(() => {
    if (!uid) return;
    const roomRef = doc(db, "rooms", code);
    return onSnapshot(
      roomRef,
      (snap) => {
        setConnectionError(null);
        setRoomExists(snap.exists());
        if (!snap.exists()) {
          setOpponentPresent(null);
          return;
        }
        const data = snap.data() as RoomDoc;
        const oppFlag = seat === "host" ? data.guestPresent : data.hostPresent;
        // `undefined` on legacy docs — treat as present so we don't show a
        // false-positive "away" banner against rooms written before this
        // field existed.
        setOpponentPresent(oppFlag === undefined ? null : oppFlag);
      },
      (err) => {
        const { hint } = getFirestoreErrorHint(err);
        console.warn("[useNetworkedGame] room snapshot error", err);
        setConnectionError(hint);
      },
    );
  }, [code, uid, seat]);

  // Write my own presence flag to the room doc.
  // - On mount: mark present.
  // - On unmount (navigate back): mark away.
  // - On AppState change: foreground -> present, background -> away.
  // Hard-leave (process killed without unmount) won't fire either of the
  // last two — the flag stays `true` until the room's TTL kicks in or the
  // host ends the game. That's the documented limitation.
  useEffect(() => {
    if (!uid) return;
    const roomRef = doc(db, "rooms", code);
    void setRoomPresence(roomRef, seat, true);

    const sub = AppState.addEventListener("change", (next) => {
      void setRoomPresence(roomRef, seat, next === "active");
    });

    return () => {
      sub.remove();
      void setRoomPresence(roomRef, seat, false);
    };
  }, [code, uid, seat]);

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
        const parsed = parseNetGameState(snap.data());
        if (parsed) {
          setConnectionError(null);
          setState(parsed);
        } else {
          setState(null);
        }
      },
      (err) => {
        const { hint } = getFirestoreErrorHint(err);
        console.warn("[useNetworkedGame] state snapshot error", err);
        setConnectionError(hint);
      },
    );
  }, [code, uid]);

  // Host deals once the room exists and the state doc is still missing.
  // Retries on failure instead of a one-shot timeout so a slow join or
  // transient rules/network blip doesn't strand both players on a blank board.
  useEffect(() => {
    if (!uid || seat !== "host" || roomExists !== true) return;

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function dealIfNeeded() {
      const stateRef = doc(db, "rooms", code, "state", "current");
      try {
        const snap = await getDoc(stateRef);
        if (cancelled) return;
        if (snap.exists()) return;

        await setDoc(stateRef, {
          ...createInitialNetState(),
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        if (cancelled) return;
        const { hint } = getFirestoreErrorHint(err);
        console.warn("[useNetworkedGame] initial deal failed", err);
        setConnectionError(hint);
        retryTimer = setTimeout(() => {
          void dealIfNeeded();
        }, 1500);
      }
    }

    void dealIfNeeded();

    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [uid, seat, code, roomExists]);

  const writeTransition = async (
    compute: (current: NetGameState) => NetGameState | { error: string },
  ) => {
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
  };

  const playCard = (cardIndex: number) =>
    writeTransition((current) => applyPlay(current, seat, cardIndex));

  const drawCard = () => writeTransition((current) => applyDraw(current, seat));

  const chooseShape = (shape: Exclude<Shape, "whot">) =>
    writeTransition((current) => applyShapeChoice(current, seat, shape));

  const startNewRound = async () => {
    if (seat !== "host") return;
    setLastError(null);
    const stateRef = doc(db, "rooms", code, "state", "current");
    try {
      await setDoc(stateRef, createInitialNetState());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Restart failed.";
      setLastError(message);
    }
  };

  // Host-only End Game. Firestore rules only allow the host to delete the
  // room doc. Both clients see the deletion via the room snapshot listener
  // and surface `roomStatus === 'ended'` so the screen can route out.
  const endGame = async () => {
    if (seat !== "host") return;
    setLastError(null);
    try {
      await deleteDoc(doc(db, "rooms", code));
    } catch (err) {
      const { hint } = getFirestoreErrorHint(err);
      setLastError(hint);
    }
  };

  const myHand = state ? (seat === "host" ? state.hostHand : state.guestHand) : [];
  const opponentHandSize = state
    ? (seat === "host" ? state.guestHand.length : state.hostHand.length)
    : 0;
  const isMyTurn = !!state && state.turn === seat && !state.winner && !state.awaitingShapeChoice;

  // `connecting` while we haven't seen the room snapshot yet. After that,
  // the room either exists (`live`) or has been deleted (`ended`). A
  // listener error overrides everything as `lost`.
  let roomStatus: RoomStatus;
  if (connectionError) roomStatus = "lost";
  else if (roomExists === null) roomStatus = "connecting";
  else if (roomExists === false) roomStatus = "ended";
  else roomStatus = "live";

  return {
    state,
    mySeat: seat,
    myHand,
    opponentHandSize,
    isMyTurn,
    lastError,
    connectionError,
    roomStatus,
    opponentPresent,
    playCard,
    drawCard,
    chooseShape,
    startNewRound,
    endGame,
  };
}
