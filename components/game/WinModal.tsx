import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback, useLayoutEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { BRAND } from "./theme";
import { useAppTheme } from "./ThemeContext";

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

  const fontScript = { fontFamily: "CormorantGaramond_700Bold_Italic" } as const;
  const fontBold = { fontFamily: "Inter_700Bold" } as const;
  const fontMed = { fontFamily: "Inter_500Medium" } as const;
  const fontReg = { fontFamily: "Inter_400Regular" } as const;

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
            fontScript,
            {
              marginBottom: 4,
              textAlign: "center",
              fontSize: 52,
              lineHeight: 52,
              color: isWin ? "#34d399" : theme.textSecondary,
            },
          ]}
        >
          {isWin ? "You won!" : "You lost."}
        </Text>

        <Text style={[fontMed, { marginBottom: 24, textAlign: "center", fontSize: 12, letterSpacing: 2.4, color: theme.textMuted }]}>
          {isWin ? "WELL PLAYED" : "BETTER LUCK NEXT TIME"}
        </Text>

        {/* Current round stats */}
        {history.length > 0 && (
          <View
            className="mb-6 flex-row items-center justify-around rounded-2xl py-4"
            style={{ backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border }}
          >
            <View className="items-center gap-1">
              <Text style={[fontBold, { fontSize: 24, color: theme.textPrimary }]}>
                {history[history.length - 1]?.humanCards ?? 0}
              </Text>
              <Text style={[fontReg, { fontSize: 10, letterSpacing: 3.2, color: theme.textMuted }]}>
                YOUR CARDS
              </Text>
            </View>
            <View
              className="h-8 w-px"
              style={{ backgroundColor: theme.border }}
            />
            <View className="items-center gap-1">
              <Text style={[fontBold, { fontSize: 24, color: theme.textPrimary }]}>
                {history[history.length - 1]?.computerCards ?? 0}
              </Text>
              <Text style={[fontReg, { fontSize: 10, letterSpacing: 3.2, color: theme.textMuted }]}>
                CPU CARDS
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
          <Text style={[fontBold, { fontSize: 14, letterSpacing: 2.8, color: "#fafafa" }]}>PLAY AGAIN</Text>
        </Pressable>

        {/* History */}
        {history.length > 1 && (
          <>
            <Text style={[fontMed, { marginBottom: 12, fontSize: 12, letterSpacing: 2.4, color: theme.textMuted }]}>
              ROUND HISTORY
            </Text>
            <View className="gap-2">
              {[...history].reverse().map((r) => (
                <View
                  key={r.round}
                  className="flex-row items-center justify-between rounded-xl px-4 py-3"
                  style={{ backgroundColor: theme.surfaceAlt, borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={[fontMed, { fontSize: 12, color: theme.textSecondary }]}>Round {r.round}</Text>
                  <Text
                    style={[
                      fontBold,
                      { fontSize: 12, color: r.winner === "human" ? "#34d399" : theme.textMuted },
                    ]}
                  >
                    {r.winner === "human" ? "You won" : "CPU won"}
                  </Text>
                  <Text style={[fontReg, { fontSize: 12, color: theme.textMuted }]}>
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
