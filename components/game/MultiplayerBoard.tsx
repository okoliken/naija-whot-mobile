import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { gameShapes, SHAPE_LABELS } from "@/src/game/gameStore";
import type { Card, Player } from "@/src/game/types";
import { useNetworkedGame } from "@/src/multiplayer/useNetworkedGame";
import { clearLastRoom, setLastRoom } from "@/src/platform/storage/lastRoom";
import { recordRound } from "@/src/platform/storage/stats";
import type { Seat } from "@/src/room/types";
import { HeaderBar } from "./board/HeaderBar";
import { OpponentSection } from "./board/OpponentSection";
import { PlayerSection } from "./board/PlayerSection";
import { TableSection } from "./board/TableSection";
import { CardFlyOverlay } from "./cards/CardFlyOverlay";
import { ControlCenterModal } from "./modals/ControlCenterModal";
import { HowToPlayModal } from "./modals/HowToPlayModal";
import { ShapePickerModal } from "./modals/ShapePickerModal";
import { WinModal, type RoundResult } from "./modals/WinModal";
import { Font } from "../theme/fonts";
import { useAppTheme } from "../theme/ThemeContext";
import { Banner } from "../ui/Banner";

type Props = {
  code: string;
  seat: Seat;
  /** Called when the player leaves the room (back, or the room ends). The
   *  parent swaps the table back to the local game — no navigation. */
  onLeave: () => void;
};

/**
 * The networked game, rendered in place on the one table screen. The room
 * lifecycle stays inside this component; leaving hands control back to the
 * parent instead of pushing/popping routes.
 */
export function MultiplayerBoard({ code, seat, onLeave }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const controlCenterRef = useRef<BottomSheetModal>(null);
  const howToPlayRef = useRef<BottomSheetModal>(null);

  const game = useNetworkedGame({ code, seat });

  // Game-history rendering uses Player ('human'|'computer'), so map seats
  // through `me`/`opp` to stay compatible with the existing components.
  const me: Player = "human";
  const opp: Player = "computer";

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
            // `roomStatus` to 'ended' on both clients and we'll leave.
            void game.endGame();
          },
        },
      ],
    );
  };

  // When the host deletes the room, both clients see `roomStatus === 'ended'`.
  // Host already pressed through the confirm dialog — just leave.
  // Guest needs an explanation before being handed back to the table.
  const endedNoticeShownRef = useRef(false);
  useEffect(() => {
    if (game.roomStatus !== "ended" || endedNoticeShownRef.current) return;
    endedNoticeShownRef.current = true;
    void clearLastRoom();
    if (seat === "host") {
      onLeave();
      return;
    }
    Alert.alert(
      "Game ended",
      "The host closed the room. You can start a new game from the menu.",
      [{ text: "OK", onPress: onLeave }],
    );
  }, [game.roomStatus, seat, onLeave]);

  // Remember the active room so the menu can offer a "Rejoin" tap after
  // a soft leave. Recorded once per (code, seat) combination.
  useEffect(() => {
    void setLastRoom({ code, seat });
  }, [code, seat]);

  // History (per-device, ephemeral). Resets on unmount.
  const roundCountRef = useRef(1);
  const [history, setHistory] = useState<RoundResult[]>([]);
  // Track the round we've already recorded so a flickering synced winner
  // (clear -> re-set within the same round) can't append a duplicate entry.
  const recordedRoundRef = useRef<number | null>(null);

  useEffect(() => {
    if (!game.state) return;
    const winnerSeat = game.state.winner;
    if (winnerSeat && recordedRoundRef.current !== roundCountRef.current) {
      recordedRoundRef.current = roundCountRef.current;
      void recordRound(winnerSeat === seat ? "win" : "loss");
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

  if (!game.state) {
    const loadingLabel =
      game.roomStatus === "connecting"
        ? "Connecting to room…"
        : seat === "host"
          ? "Dealing cards…"
          : "Waiting for host to deal…";

    return (
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
        <ConnectionBanner
          connectionError={game.connectionError}
          writeError={game.lastError}
          opponentAway={false}
        />
        <View style={{ flex: 1 }}>
          <HeaderBar
            onRestart={handleRestart}
            onSettings={() => controlCenterRef.current?.present()}
            onBack={onLeave}
            onHelp={() => howToPlayRef.current?.present()}
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
            <ActivityIndicator color={theme.table.textDim} />
            <Text
              style={{
                color: theme.table.textDim,
                fontFamily: Font.ui.regular,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {loadingLabel}
            </Text>
          </View>
        </View>
        <HowToPlayModal ref={howToPlayRef} />
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
  const needLabel = state.requestedShape
    ? SHAPE_LABELS[state.requestedShape]
    : "Any";
  const isMyTurnUi = game.isMyTurn;
  // Engine writes subject-less messages with {ACTOR} / {WINNER} tokens so the
  // same Firestore doc renders correctly for both seats. Substitute here.
  const messageText = (state.message ?? "")
    .replace("{ACTOR}", state.lastActor === seat ? "You" : "Opponent")
    .replace("{WINNER}", state.winner === seat ? "You" : "Opponent");

  return (
    <>
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
        <ConnectionBanner
          connectionError={game.connectionError}
          writeError={game.lastError}
          opponentAway={
            game.opponentPresent === false && game.roomStatus === "live"
          }
        />
        <View style={{ flex: 1, paddingBottom: insets.bottom + 4 }}>
          <HeaderBar
            onRestart={handleRestart}
            onSettings={() => controlCenterRef.current?.present()}
            onBack={onLeave}
            onHelp={() => howToPlayRef.current?.present()}
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
        </View>
      </SafeAreaView>

      <CardFlyOverlay card={flyCard} origin={flyOrigin} />

      {state.awaitingShapeChoice && state.turn === seat ? (
        <ShapePickerModal shapes={gameShapes} onChoose={game.chooseShape} />
      ) : null}

      {winnerForUi ? (
        <WinModal
          winner={winnerForUi}
          history={history}
          onRestart={handleRestart}
          opponentLabel="Opponent"
          canRestart={seat === "host"}
        />
      ) : null}

      <HowToPlayModal ref={howToPlayRef} />

      <ControlCenterModal
        ref={controlCenterRef}
        history={history}
        opponentLabel="Opponent"
      />
    </>
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
  const [dismissedWriteError, setDismissedWriteError] = useState<string | null>(
    null,
  );

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
