import { SHAPE_LABELS, gameShapes, useGameStore } from "@/src/game/gameStore";
import {
  hasSeenIntro,
  markIntroSeen,
} from "@/src/platform/storage/firstLaunch";
import { recordRound } from "@/src/platform/storage/stats";
import type { Seat } from "@/src/room/types";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useShallow } from "zustand/react/shallow";
import type { Card, Player } from "@/src/game/gameStore";

import { HeaderBar } from "../components/game/board/HeaderBar";
import { OpponentSection } from "../components/game/board/OpponentSection";
import { PlayerSection } from "../components/game/board/PlayerSection";
import { TableSection } from "../components/game/board/TableSection";
import { TableSurface } from "../components/game/board/TableSurface";
import { CardFlyOverlay } from "../components/game/cards/CardFlyOverlay";
import { ControlCenterModal } from "../components/game/modals/ControlCenterModal";
import { HowToPlayModal } from "../components/game/modals/HowToPlayModal";
import { MenuSheet } from "../components/game/modals/MenuSheet";
import { ShapePickerModal } from "../components/game/modals/ShapePickerModal";
import { WinModal, type RoundResult } from "../components/game/modals/WinModal";
import { MultiplayerBoard } from "../components/game/MultiplayerBoard";

/** What the one table screen is currently hosting. */
type Session =
  | { kind: "cpu" }
  | { kind: "net"; code: string; seat: Seat };

/**
 * The whole app is this one table. A CPU game is always dealt behind the
 * menu sheet; joining a room crossfades the board into the networked game
 * in place — no navigation, so screens can never stack.
 */
export default function HomeScreen() {
  const {
    deck,
    topCard,
    humanHand,
    computerHand,
    turn,
    pendingPick,
    skipNextPlayer,
    requestedShape,
    awaitingShapeChoice,
    aiTurnTick,
    message,
    gameStarted,
    winner,
    difficulty,
  } = useGameStore(
    useShallow((s) => ({
      deck: s.deck,
      topCard: s.topCard,
      humanHand: s.humanHand,
      computerHand: s.computerHand,
      turn: s.turn,
      pendingPick: s.pendingPick,
      skipNextPlayer: s.skipNextPlayer,
      requestedShape: s.requestedShape,
      awaitingShapeChoice: s.awaitingShapeChoice,
      aiTurnTick: s.aiTurnTick,
      message: s.message,
      gameStarted: s.gameStarted,
      winner: s.winner,
      difficulty: s.difficulty,
    })),
  );
  const startGame = useGameStore((s) => s.startGame);
  const drawHumanCard = useGameStore((s) => s.drawHumanCard);
  const playHumanCard = useGameStore((s) => s.playHumanCard);
  const chooseShape = useGameStore((s) => s.chooseShape);
  const runComputerTurn = useGameStore((s) => s.runComputerTurn);
  const setDifficulty = useGameStore((s) => s.setDifficulty);

  const [session, setSession] = useState<Session>({ kind: "cpu" });
  const isCpu = session.kind === "cpu";

  const controlCenterRef = useRef<BottomSheetModal>(null);
  const menuRef = useRef<BottomSheetModal>(null);
  const howToPlayRef = useRef<BottomSheetModal>(null);
  // True while the how-to-play sheet is playing its first-launch role, so
  // its dismissal can hand over to the menu. Help taps don't set it.
  const introFlowRef = useRef(false);

  // Deal a game immediately so the table behind the menu is real.
  useEffect(() => {
    if (!useGameStore.getState().gameStarted) startGame();
  }, [startGame]);

  // Front door: first launch leads with the rules, then the menu.
  // Every later launch goes straight to the menu.
  useEffect(() => {
    let cancelled = false;
    hasSeenIntro().then((seen) => {
      if (cancelled) return;
      if (seen) {
        menuRef.current?.present();
      } else {
        introFlowRef.current = true;
        howToPlayRef.current?.present();
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleHowToPlayDismiss = () => {
    markIntroSeen();
    if (introFlowRef.current) {
      introFlowRef.current = false;
      menuRef.current?.present();
    }
  };

  const handleStartMultiplayer = (code: string, seat: Seat) => {
    setSession({ kind: "net", code, seat });
  };

  // Game history
  const roundCountRef = useRef(1);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const prevWinner = useRef<Player | null>(null);

  useEffect(() => {
    if (winner && winner !== prevWinner.current) {
      prevWinner.current = winner;
      void recordRound(winner === "human" ? "win" : "loss");
      setHistory((h) => [
        ...h,
        {
          round: roundCountRef.current,
          winner,
          humanCards: humanHand.length,
          computerCards: computerHand.length,
        },
      ]);
    }
    if (!winner) prevWinner.current = null;
  }, [winner, humanHand.length, computerHand.length]);

  // Card fly animation
  const isFirstCard = useRef(true);
  const prevTopCardId = useRef<string | null>(null);
  const [flyCard, setFlyCard] = useState<Card | null>(null);
  const [flyOrigin, setFlyOrigin] = useState<"human" | "computer">("human");

  useEffect(() => {
    if (!topCard || topCard.id === prevTopCardId.current) return;
    prevTopCardId.current = topCard.id;
    if (isFirstCard.current) {
      isFirstCard.current = false;
      return;
    }
    // Use the recorded actor, not `turn` — Hold On (1) keeps the turn with
    // whoever played, so inferring from the next turn flips the direction.
    setFlyOrigin(useGameStore.getState().lastActor ?? "human");
    setFlyCard(topCard);
  }, [topCard]);

  const handleRestart = () => {
    isFirstCard.current = true;
    prevTopCardId.current = null;
    setFlyCard(null);
    roundCountRef.current += 1;
    startGame();
  };

  const handleLeaveMultiplayer = () => {
    setSession({ kind: "cpu" });
    // The solo table resumes behind the menu. If its last round had ended,
    // the winner flag would pop the solo win sheet over the menu the moment
    // we land — a stale result from before multiplayer. Deal fresh instead.
    if (useGameStore.getState().winner) handleRestart();
    menuRef.current?.present();
  };

  // The CPU pauses while the table hosts a networked game.
  useEffect(() => {
    if (
      !isCpu ||
      turn !== "computer" ||
      !gameStarted ||
      winner ||
      awaitingShapeChoice
    )
      return;
    const timer = setTimeout(runComputerTurn, 700);
    return () => clearTimeout(timer);
  }, [
    aiTurnTick,
    awaitingShapeChoice,
    gameStarted,
    isCpu,
    runComputerTurn,
    turn,
    winner,
  ]);

  const needLabel = requestedShape ? SHAPE_LABELS[requestedShape] : "Any";
  const skipsLabel = skipNextPlayer ? "1" : "0";
  const isHumanTurn = turn === "human" && !winner && !awaitingShapeChoice;
  const insets = useSafeAreaInsets();

  return (
    <TableSurface>
      {isCpu ? (
        <Animated.View
          key="cpu"
          entering={FadeIn.duration(450)}
          exiting={FadeOut.duration(250)}
          style={{ flex: 1 }}
        >
          <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
            <View style={{ flex: 1, paddingBottom: insets.bottom + 4 }}>
              <HeaderBar
                onRestart={handleRestart}
                onSettings={() => controlCenterRef.current?.present()}
                onMenu={() => menuRef.current?.present()}
                onHelp={() => howToPlayRef.current?.present()}
              />

              <OpponentSection turn={turn} count={computerHand.length} />

              <TableSection
                deckCount={deck.length}
                topCard={topCard}
                isHumanTurn={isHumanTurn}
                needLabel={needLabel}
                pendingPick={pendingPick}
                skipsLabel={skipsLabel}
                onDraw={drawHumanCard}
              />

              <PlayerSection
                humanHand={humanHand}
                topCard={topCard}
                requestedShape={requestedShape}
                pendingPick={pendingPick}
                isHumanTurn={isHumanTurn}
                message={awaitingShapeChoice ? "" : message}
                onPlayCard={playHumanCard}
              />
            </View>
          </SafeAreaView>

          <CardFlyOverlay card={flyCard} origin={flyOrigin} />
        </Animated.View>
      ) : (
        <Animated.View
          key={`net-${session.code}`}
          entering={FadeIn.duration(450)}
          exiting={FadeOut.duration(250)}
          style={{ flex: 1 }}
        >
          <MultiplayerBoard
            code={session.code}
            seat={session.seat}
            onLeave={handleLeaveMultiplayer}
          />
        </Animated.View>
      )}

      {isCpu && awaitingShapeChoice ? (
        <ShapePickerModal shapes={gameShapes} onChoose={chooseShape} />
      ) : null}

      {isCpu && winner ? (
        <WinModal winner={winner} history={history} onRestart={handleRestart} />
      ) : null}

      <MenuSheet
        ref={menuRef}
        onPlayCpu={() => {}}
        onStartMultiplayer={handleStartMultiplayer}
        onHowToPlay={() => howToPlayRef.current?.present()}
      />

      <HowToPlayModal ref={howToPlayRef} onDismiss={handleHowToPlayDismiss} />

      <ControlCenterModal
        ref={controlCenterRef}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        history={history}
      />
    </TableSurface>
  );
}
