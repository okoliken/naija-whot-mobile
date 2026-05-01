import { SHAPE_LABELS, gameShapes, useGameStore } from "@/src/store/gameStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { CardFlyOverlay } from "../components/game/CardFlyOverlay";
import { ControlCenterModal } from "../components/game/ControlCenterModal";
import { HeaderBar } from "../components/game/HeaderBar";
import { OpponentSection } from "../components/game/OpponentSection";
import { PlayerSection } from "../components/game/PlayerSection";
import { ShapePickerModal } from "../components/game/ShapePickerModal";
import { TableSection } from "../components/game/TableSection";
import { WinModal, type RoundResult } from "../components/game/WinModal";
import { APP_BG, BORDER, SURFACE_ALT } from "../components/game/theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Card } from "@/src/store/gameStore";

export default function Index() {
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

  const shapePickerRef = useRef<BottomSheetModal>(null);
  const controlCenterRef = useRef<BottomSheetModal>(null);

  // Game history
  const roundCountRef = useRef(1);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const prevWinner = useRef<typeof winner>(null);

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
    if (isFirstCard.current) { isFirstCard.current = false; return; }
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
    if (turn !== "computer" || !gameStarted || winner || awaitingShapeChoice) return;
    const timer = setTimeout(runComputerTurn, 700);
    return () => clearTimeout(timer);
  }, [aiTurnTick, awaitingShapeChoice, gameStarted, runComputerTurn, turn, winner]);

  const needLabel = requestedShape ? SHAPE_LABELS[requestedShape] : "Any";
  const skipsLabel = skipNextPlayer ? "1" : "0";
  const isHumanTurn = turn === "human" && !winner && !awaitingShapeChoice;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: APP_BG }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingVertical: 14,
          paddingBottom: 28,
          gap: 14,
        }}
      >
        <HeaderBar
          turn={turn}
          onRestart={handleRestart}
          onSettings={() => controlCenterRef.current?.present()}
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
          message={message}
          onPlayCard={playHumanCard}
        />
      </ScrollView>

      <CardFlyOverlay card={flyCard} origin={flyOrigin} />

      {/* Shape picker trigger — shown whenever a Crown card is waiting for a shape */}
      {awaitingShapeChoice ? (
        <Pressable
          onPress={() => shapePickerRef.current?.present()}
          style={{
            position: "absolute",
            bottom: 32,
            alignSelf: "center",
            left: 24,
            right: 24,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: BORDER,
            backgroundColor: SURFACE_ALT,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ fontFamily: "CormorantGaramond_700Bold_Italic", fontSize: 20, color: "#f7f2e9" }}>
            Choose a shape ♛
          </Text>
        </Pressable>
      ) : null}

      <ShapePickerModal
        ref={shapePickerRef}
        shapes={gameShapes}
        onChoose={chooseShape}
      />

      <WinModal
        visible={!!winner}
        winner={winner ?? "human"}
        history={history}
        onRestart={handleRestart}
      />

      <ControlCenterModal
        ref={controlCenterRef}
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        history={history}
      />
    </SafeAreaView>
  );
}
