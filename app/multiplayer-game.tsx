import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { HeaderBar } from "../components/game/board/HeaderBar";
import { OpponentSection } from "../components/game/board/OpponentSection";
import { PlayerSection } from "../components/game/board/PlayerSection";
import { TableSection } from "../components/game/board/TableSection";
import { CardFlyOverlay } from "../components/game/cards/CardFlyOverlay";
import { ShapePickerModal } from "../components/game/modals/ShapePickerModal";
import { WinModal, type RoundResult } from "../components/game/modals/WinModal";
import { Font } from "../components/theme/fonts";
import { useAppTheme } from "../components/theme/ThemeContext";
import { gameShapes, SHAPE_LABELS } from "@/src/store/gameStore";
import type { Card, Player } from "@/src/store/game/types";
import type { Seat } from "@/src/lib/roomTypes";
import { useNetworkedGame } from "@/src/multiplayer/useNetworkedGame";

export default function MultiplayerGameScreen() {
  const params = useLocalSearchParams<{ code?: string; seat?: string }>();
  const code = typeof params.code === "string" ? params.code : null;
  const seat: Seat | null =
    params.seat === "host" || params.seat === "guest" ? params.seat : null;

  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  // Hooks must be unconditional. Guard inside.
  const guarded = code && seat ? { code, seat } : { code: "_invalid", seat: "host" as Seat };
  const game = useNetworkedGame(guarded);

  // Game-history rendering uses Player ('human'|'computer'), so map seats
  // through `me`/`opp` to stay compatible with the existing components.
  const me: Player = "human";
  const opp: Player = "computer";

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, []);

  // History (per-device, ephemeral). Resets on screen unmount.
  const roundCountRef = useRef(1);
  const [history, setHistory] = useState<RoundResult[]>([]);
  const prevWinnerRef = useRef<Seat | null>(null);

  useEffect(() => {
    if (!game.state) return;
    const winnerSeat = game.state.winner;
    if (winnerSeat && winnerSeat !== prevWinnerRef.current) {
      prevWinnerRef.current = winnerSeat;
      const myCount = game.myHand.length;
      const oppCount = game.opponentHandSize;
      setHistory((h) => [
        ...h,
        {
          round: roundCountRef.current,
          winner: winnerSeat === seat ? "human" : "computer",
          humanCards: myCount,
          computerCards: oppCount,
        },
      ]);
    }
    if (!winnerSeat) prevWinnerRef.current = null;
  }, [game.state, game.myHand.length, game.opponentHandSize, seat]);

  // Card-fly animation on top-card change. Compute flyOrigin from lastActor.
  const isFirstCardRef = useRef(true);
  const prevTopCardIdRef = useRef<string | null>(null);
  const [flyCard, setFlyCard] = useState<Card | null>(null);
  const [flyOrigin, setFlyOrigin] = useState<"human" | "computer">("human");

  useEffect(() => {
    const topCard = game.state?.topCard ?? null;
    if (!topCard || topCard.id === prevTopCardIdRef.current) return;
    prevTopCardIdRef.current = topCard.id;
    if (isFirstCardRef.current) {
      isFirstCardRef.current = false;
      return;
    }
    setFlyOrigin(game.state?.lastActor === seat ? "human" : "computer");
    setFlyCard(topCard);
  }, [game.state, seat]);

  const handleRestart = useCallback(() => {
    isFirstCardRef.current = true;
    prevTopCardIdRef.current = null;
    setFlyCard(null);
    roundCountRef.current += 1;
    game.startNewRound();
  }, [game]);

  const opponentCount = game.opponentHandSize;
  const opponentHandPlaceholders = useMemo<Card[]>(
    () =>
      Array.from({ length: opponentCount }, (_, i) => ({
        id: `opp-${i}`,
        shape: "whot",
        value: 0,
      })),
    [opponentCount],
  );

  // Bail early if route params are missing.
  if (!code || !seat) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{ flex: 1, backgroundColor: theme.appBg, padding: 24 }}
      >
        <Text style={{ color: theme.textPrimary, fontFamily: Font.ui.semi }}>
          Missing room parameters. Go back to the lobby.
        </Text>
      </SafeAreaView>
    );
  }

  if (!game.state) {
    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{
          flex: 1,
          backgroundColor: theme.appBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            color: theme.textSecondary,
            fontFamily: Font.ui.regular,
            fontSize: 14,
          }}
        >
          {seat === "host" ? "Dealing cards..." : "Waiting for host to deal..."}
        </Text>
      </SafeAreaView>
    );
  }

  const state = game.state;
  const winnerForUi: Player | null = state.winner
    ? state.winner === seat
      ? me
      : opp
    : null;
  const turnForUi: Player = state.turn === seat ? me : opp;
  const needLabel = state.requestedShape ? SHAPE_LABELS[state.requestedShape] : "Any";
  const isMyTurnUi = game.isMyTurn;
  // Engine writes subject-less messages with {ACTOR} / {WINNER} tokens so the
  // same Firestore doc renders correctly for both seats. Substitute here.
  const renderedMessage = state.message
    .replace("{ACTOR}", state.lastActor === seat ? "You" : "Opponent")
    .replace("{WINNER}", state.winner === seat ? "You" : "Opponent");
  const messageText = game.lastError ?? renderedMessage;

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
          winner={winnerForUi}
          turn={turnForUi}
          pendingPick={state.pendingPick}
          requestedShape={state.requestedShape ? SHAPE_LABELS[state.requestedShape] : null}
          onRestart={handleRestart}
          onSettings={() => {}}
          onBack={handleBack}
          opponentLabel="Opponent"
        />

        <OpponentSection
          turn={turnForUi}
          count={opponentHandPlaceholders.length}
          label="Opponent"
        />

        <TableSection
          deckCount={state.deck.length}
          topCard={state.topCard}
          isHumanTurn={isMyTurnUi}
          needLabel={needLabel}
          pendingPick={state.pendingPick}
          skipsLabel="0"
          onDraw={game.drawCard}
        />

        <PlayerSection
          humanHand={game.myHand}
          topCard={state.topCard}
          requestedShape={state.requestedShape}
          pendingPick={state.pendingPick}
          isHumanTurn={isMyTurnUi}
          message={state.awaitingShapeChoice ? "" : messageText}
          onPlayCard={game.playCard}
        />
      </ScrollView>

      <CardFlyOverlay card={flyCard} origin={flyOrigin} />

      {state.awaitingShapeChoice && state.turn === seat ? (
        <ShapePickerModal shapes={gameShapes} onChoose={game.chooseShape} />
      ) : null}

      {winnerForUi ? (
        <WinModal winner={winnerForUi} history={history} onRestart={handleRestart} />
      ) : null}
    </SafeAreaView>
  );
}
