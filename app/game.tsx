import { SHAPE_LABELS, gameShapes, useGameStore } from "@/src/store/gameStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { CardFlyOverlay } from "../components/game/cards/CardFlyOverlay";
import { ControlCenterModal } from "../components/game/modals/ControlCenterModal";
import { HeaderBar } from "../components/game/board/HeaderBar";
import { OpponentSection } from "../components/game/board/OpponentSection";
import { PlayerSection } from "../components/game/board/PlayerSection";
import { ShapePickerModal } from "../components/game/modals/ShapePickerModal";
import { TableSection } from "../components/game/board/TableSection";
import { WinModal, type RoundResult } from "../components/game/modals/WinModal";
import { useAppTheme } from "../components/theme/ThemeContext";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { Card, Player } from "@/src/store/gameStore";

export default function GameScreen() {
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
    startGame,
    drawHumanCard,
    playHumanCard,
    chooseShape,
    runComputerTurn,
    setDifficulty,
  } = useGameStore();

  const controlCenterRef = useRef<BottomSheetModal>(null);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  }

  // Game history
  const roundCountRef = useRef(1);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const prevWinner = useRef<Player | null>(null);

  useEffect(() => {
    if (winner && winner !== prevWinner.current) {
      prevWinner.current = winner;
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
    setFlyOrigin(turn === "computer" ? "human" : "computer");
    setFlyCard(topCard);
  }, [topCard, turn]);

  const handleRestart = useCallback(() => {
    isFirstCard.current = true;
    prevTopCardId.current = null;
    setFlyCard(null);
    roundCountRef.current += 1;
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (turn !== "computer" || !gameStarted || winner || awaitingShapeChoice)
      return;
    const timer = setTimeout(runComputerTurn, 700);
    return () => clearTimeout(timer);
  }, [
    aiTurnTick,
    awaitingShapeChoice,
    gameStarted,
    runComputerTurn,
    turn,
    winner,
  ]);

  const needLabel = requestedShape ? SHAPE_LABELS[requestedShape] : "Any";
  const skipsLabel = skipNextPlayer ? "1" : "0";
  const isHumanTurn = turn === "human" && !winner && !awaitingShapeChoice;
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1"
      style={{ backgroundColor: theme.appBg }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
          gap: 16,
        }}
      >
        <HeaderBar
          winner={winner}
          turn={turn}
          pendingPick={pendingPick}
          requestedShape={requestedShape ? SHAPE_LABELS[requestedShape] : null}
          onRestart={handleRestart}
          onSettings={() => controlCenterRef.current?.present()}
          onBack={handleBack}
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
      </ScrollView>

      <CardFlyOverlay card={flyCard} origin={flyOrigin} />

      {awaitingShapeChoice ? (
        <ShapePickerModal shapes={gameShapes} onChoose={chooseShape} />
      ) : null}

      {winner ? (
        <WinModal winner={winner} history={history} onRestart={handleRestart} />
      ) : null}

      <ControlCenterModal
        ref={controlCenterRef}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        history={history}
      />
    </SafeAreaView>
  );
}
