import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, ActivityIndicator, ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { HeaderBar } from "../components/game/board/HeaderBar";
import { OpponentSection } from "../components/game/board/OpponentSection";
import { PlayerSection } from "../components/game/board/PlayerSection";
import { TableSection } from "../components/game/board/TableSection";
import { CardFlyOverlay } from "../components/game/cards/CardFlyOverlay";
import { ControlCenterModal } from "../components/game/modals/ControlCenterModal";
import { ShapePickerModal } from "../components/game/modals/ShapePickerModal";
import { WinModal, type RoundResult } from "../components/game/modals/WinModal";
import { Font } from "../components/theme/fonts";
import { useAppTheme } from "../components/theme/ThemeContext";
import { Banner } from "../components/ui/Banner";
import { gameShapes, SHAPE_LABELS } from "@/src/game/gameStore";
import type { Card, Player } from "@/src/game/types";
import { clearLastRoom, setLastRoom } from "@/src/platform/storage/lastRoom";
import type { Seat } from "@/src/room/types";
import { useNetworkedGame } from "@/src/multiplayer/useNetworkedGame";

export default function MultiplayerGameScreen() {
  const params = useLocalSearchParams<{ code?: string; seat?: string }>();
  const code = typeof params.code === "string" ? params.code : null;
  const seat: Seat | null =
    params.seat === "host" || params.seat === "guest" ? params.seat : null;

  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const controlCenterRef = useRef<BottomSheetModal>(null);

  // Hooks must be unconditional. Guard inside.
  const guarded = code && seat ? { code, seat } : { code: "_invalid", seat: "host" as Seat };
  const game = useNetworkedGame(guarded);

  // Game-history rendering uses Player ('human'|'computer'), so map seats
  // through `me`/`opp` to stay compatible with the existing components.
  const me: Player = "human";
  const opp: Player = "computer";

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const handleEndGame = () => {
    Alert.alert(
      "End game?",
      "This will close the room for both players. You can't undo this.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End game",
          style: "destructive",
          onPress: () => {
            // Fire-and-forget; the room snapshot listener will flip
            // `roomStatus` to 'ended' on both clients and we'll route out.
            void game.endGame();
          },
        },
      ],
    );
  };

  // When the host deletes the room, both clients see `roomStatus === 'ended'`.
  // Host already pressed through the confirm dialog — just navigate.
  // Guest needs an explanation before being routed out.
  const endedNoticeShownRef = useRef(false);
  useEffect(() => {
    if (game.roomStatus !== "ended" || endedNoticeShownRef.current) return;
    endedNoticeShownRef.current = true;
    void clearLastRoom();
    const goBack = () => {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    };
    if (seat === "host") {
      goBack();
      return;
    }
    Alert.alert(
      "Game ended",
      "The host closed the room. You can start a new game from the lobby.",
      [{ text: "OK", onPress: goBack }],
    );
  }, [game.roomStatus, seat]);

  // Remember the active room so the lobby can offer a "Rejoin" tap after
  // a soft leave. Recorded once per (code, seat) combination.
  useEffect(() => {
    if (!code || !seat) return;
    void setLastRoom({ code, seat });
  }, [code, seat]);

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

  const handleRestart = () => {
    isFirstCardRef.current = true;
    prevTopCardIdRef.current = null;
    setFlyCard(null);
    roundCountRef.current += 1;
    game.startNewRound();
  };

  const opponentCount = game.opponentHandSize;

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
    const loadingLabel =
      game.roomStatus === "connecting"
        ? "Connecting to room…"
        : seat === "host"
          ? "Dealing cards…"
          : "Waiting for host to deal…";
    const statusChip =
      game.roomStatus === "connecting"
        ? "Connecting…"
        : seat === "host"
          ? "Setting up table…"
          : "Waiting for host…";

    return (
      <SafeAreaView
        edges={["top", "left", "right"]}
        style={{ flex: 1, backgroundColor: theme.appBg }}
      >
        <ConnectionBanner
          connectionError={game.connectionError}
          writeError={game.lastError}
          opponentAway={false}
        />
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 16 }}>
          <HeaderBar
            onRestart={handleRestart}
            onSettings={() => controlCenterRef.current?.present()}
            onBack={handleBack}
            onEndGame={seat === "host" ? handleEndGame : undefined}
          />
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              paddingHorizontal: 24,
            }}
          >
            <ActivityIndicator color={theme.textSecondary} />
            <Text
              style={{
                color: theme.textSecondary,
                fontFamily: Font.ui.regular,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {loadingLabel}
            </Text>
          </View>
        </View>
        <ControlCenterModal
          ref={controlCenterRef}
          history={history}
          opponentLabel="Opponent"
        />
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
  const renderedMessage = (state.message ?? "")
    .replace("{ACTOR}", state.lastActor === seat ? "You" : "Opponent")
    .replace("{WINNER}", state.winner === seat ? "You" : "Opponent");
  // Write errors are surfaced by <ConnectionBanner /> at the top of the
  // screen, so we leave the per-move message as engine-driven flavor text.
  const messageText = renderedMessage;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: theme.appBg }}
    >
      <ConnectionBanner
        connectionError={game.connectionError}
        writeError={game.lastError}
        opponentAway={
          game.opponentPresent === false && game.roomStatus === "live"
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: insets.bottom + 32,
          gap: 16,
        }}
      >
        <HeaderBar
          onRestart={handleRestart}
          onSettings={() => controlCenterRef.current?.present()}
          onBack={handleBack}
          onEndGame={seat === "host" ? handleEndGame : undefined}
        />

        <OpponentSection
          turn={turnForUi}
          count={opponentCount}
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

      <ControlCenterModal
        ref={controlCenterRef}
        history={history}
        opponentLabel="Opponent"
      />
    </SafeAreaView>
  );
}

/**
 * Top-of-screen banner that surfaces snapshot errors (network/permissions)
 * and the most recent rejected write. Renders nothing while the room is
 * healthy. We keep both messages in one strip so the layout doesn't reflow
 * as errors come and go.
 */
function ConnectionBanner({
  connectionError,
  writeError,
  opponentAway,
}: {
  connectionError: string | null;
  writeError: string | null;
  opponentAway: boolean;
}) {
  const [dismissedWriteError, setDismissedWriteError] = useState<string | null>(null);

  // A new writeError automatically shows itself because it won't match
  // the previously-dismissed value — no reset effect needed.
  const showWriteError = writeError && writeError !== dismissedWriteError;
  if (!connectionError && !showWriteError && !opponentAway) return null;

  return (
    <View className="gap-2 px-4 pt-2">
      {connectionError ? (
        <Banner tone="danger" message={connectionError} />
      ) : null}

      {opponentAway ? (
        <Banner
          tone="brand"
          message="Opponent stepped away — they can rejoin with the room code."
        />
      ) : null}

      {showWriteError ? (
        <Banner
          tone="neutral"
          message={writeError}
          showDot={false}
          action={{
            label: "OK",
            onPress: () => setDismissedWriteError(writeError),
          }}
        />
      ) : null}
    </View>
  );
}
