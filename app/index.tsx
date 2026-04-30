import { SHAPE_LABELS, gameShapes, useGameStore } from "@/src/store/gameStore";
import { HeaderBar } from "@/app/components/game/HeaderBar";
import { OpponentSection } from "@/app/components/game/OpponentSection";
import { PlayerSection } from "@/app/components/game/PlayerSection";
import { TableSection } from "@/app/components/game/TableSection";
import { APP_BG, BORDER, SURFACE, SURFACE_ALT } from "@/app/components/game/theme";
import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
    startGame,
    drawHumanCard,
    playHumanCard,
    chooseShape,
    runComputerTurn,
  } = useGameStore();

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
        <HeaderBar turn={turn} onRestart={startGame} />

        <OpponentSection turn={turn} count={computerHand.length} />

        <TableSection
          deckCount={deck.length}
          topCard={topCard}
          isHumanTurn={isHumanTurn}
          needLabel={needLabel}
          pendingPick={pendingPick}
          skipsLabel={skipsLabel}
        />

        <PlayerSection
          humanHand={humanHand}
          topCard={topCard}
          requestedShape={requestedShape}
          pendingPick={pendingPick}
          isHumanTurn={isHumanTurn}
          message={message}
          winner={winner}
          onPlayCard={playHumanCard}
          onDraw={drawHumanCard}
          onRestart={startGame}
        />

        {awaitingShapeChoice ? (
          <View className="gap-2 rounded-2xl border px-4 py-3" style={{ borderColor: "#7a5a1f", backgroundColor: SURFACE }}>
            <Text className="text-sm text-amber-300">Choose shape</Text>
            <View className="flex-row flex-wrap gap-2">
              {gameShapes.map((shape) => (
                <Pressable
                  key={shape}
                  className="rounded-lg border px-3 py-2 active:opacity-85"
                  style={{ borderColor: BORDER, backgroundColor: SURFACE_ALT }}
                  onPress={() => chooseShape(shape)}
                >
                  <Text className="text-xs text-zinc-100">{SHAPE_LABELS[shape]}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {winner ? (
          <Text className="text-center text-base font-semibold text-emerald-400">
            {winner === "human" ? "You won this round." : "Computer won this round."}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
