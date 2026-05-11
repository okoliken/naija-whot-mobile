import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback, useLayoutEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { BRAND } from "../../theme/theme";
import { useAppTheme } from "../../theme/ThemeContext";
import { FontStyle } from "../../theme/fonts";

export type RoundResult = {
  round: number;
  winner: "human" | "computer";
  humanCards: number;
  computerCards: number;
};

type Props = {
  winner: "human" | "computer";
  history: RoundResult[];
  onRestart: () => void;
};

/** Mounted only while `winner` is set so BottomSheetModal presents reliably on CPU wins. */
export function WinModal({ winner, history, onRestart }: Props) {
  const theme = useAppTheme();
  const sheetRef = useRef<BottomSheetModal>(null);

  useLayoutEffect(() => {
    const t = setTimeout(() => sheetRef.current?.present(), 50);
    return () => {
      clearTimeout(t);
      sheetRef.current?.dismiss();
    };
  }, []);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.75} />
    ),
    [],
  );

  const isWin = winner === "human";

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["55%", "90%"]}
      enablePanDownToClose={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.border, width: 36, height: 3 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 8 }}
      >
        {/* Result headline */}
        <Text
          style={[
            FontStyle.display.bold,
            {
              marginBottom: 24,
              textAlign: "center",
              fontSize: 34,
              lineHeight: 40,
              letterSpacing: 0.6,
              color: isWin ? "#34d399" : theme.textSecondary,
            },
          ]}
        >
          {isWin ? "You won." : "You lost."}
        </Text>

        {/* Current round stats */}
        {history.length > 0 && (
          <View
            className="mb-6 flex-row items-center justify-around rounded-2xl py-4"
            style={{ backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border }}
          >
            <View className="items-center gap-1">
              <Text style={[FontStyle.ui.bold, { fontSize: 24, color: theme.textPrimary }]}>
                {history[history.length - 1]?.humanCards ?? 0}
              </Text>
              <Text style={[FontStyle.ui.regular, { fontSize: 11, color: theme.textMuted }]}>
                Your cards
              </Text>
            </View>
            <View
              className="h-8 w-px"
              style={{ backgroundColor: theme.border }}
            />
            <View className="items-center gap-1">
              <Text style={[FontStyle.ui.bold, { fontSize: 24, color: theme.textPrimary }]}>
                {history[history.length - 1]?.computerCards ?? 0}
              </Text>
              <Text style={[FontStyle.ui.regular, { fontSize: 11, color: theme.textMuted }]}>
                CPU cards
              </Text>
            </View>
          </View>
        )}

        {/* Play again */}
        <Pressable
          onPress={onRestart}
          className="mb-6 items-center rounded-2xl py-4 active:opacity-80"
          style={{ backgroundColor: BRAND }}
        >
          <Text style={[FontStyle.ui.bold, { fontSize: 14, letterSpacing: 2.8, color: "#fafafa" }]}>PLAY AGAIN</Text>
        </Pressable>

        {/* History */}
        {history.length > 1 && (
          <>
            <Text style={[FontStyle.ui.semi, { marginBottom: 12, fontSize: 13, color: theme.textSecondary }]}>
              Round history
            </Text>
            <View className="gap-2">
              {[...history].reverse().map((r) => (
                <View
                  key={r.round}
                  className="flex-row items-center justify-between rounded-xl px-4 py-3"
                  style={{ backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={[FontStyle.ui.semi, { fontSize: 12, color: theme.textSecondary }]}>Round {r.round}</Text>
                  <Text
                    style={[
                      FontStyle.ui.bold,
                      { fontSize: 12, color: r.winner === "human" ? "#34d399" : theme.textMuted },
                    ]}
                  >
                    {r.winner === "human" ? "You won" : "CPU won"}
                  </Text>
                  <Text style={[FontStyle.ui.regular, { fontSize: 12, color: theme.textMuted }]}>
                    {r.humanCards} – {r.computerCards}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
