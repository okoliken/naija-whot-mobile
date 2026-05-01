import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { BORDER, BRAND, SURFACE, SURFACE_ALT } from "./theme";

export type RoundResult = {
  round: number;
  winner: "human" | "computer";
  humanCards: number;
  computerCards: number;
};

type Props = {
  visible: boolean;
  winner: "human" | "computer" | null;
  history: RoundResult[];
  onRestart: () => void;
};

export function WinModal({ visible, winner, history, onRestart }: Props) {
  const sheetRef = useRef<BottomSheetModal>(null);

  const fontScript = { fontFamily: "CormorantGaramond_700Bold_Italic" } as const;
  const fontBold = { fontFamily: "Inter_700Bold" } as const;
  const fontMed = { fontFamily: "Inter_500Medium" } as const;
  const fontReg = { fontFamily: "Inter_400Regular" } as const;

  useEffect(() => {
    if (visible) {
      // defer one frame so the ref is fully mounted
      const t = setTimeout(() => sheetRef.current?.present(), 50);
      return () => clearTimeout(t);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [visible]);

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
      backgroundStyle={{ backgroundColor: SURFACE }}
      handleIndicatorStyle={{ backgroundColor: BORDER, width: 36, height: 3 }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 8 }}
      >
        {/* Result headline */}
        <Text
          style={fontScript}
          className={`mb-1 text-center text-[52px] leading-none ${isWin ? "text-emerald-400" : "text-zinc-400"}`}
        >
          {isWin ? "You won!" : "You lost."}
        </Text>

        <Text style={fontMed} className="mb-6 text-center text-xs tracking-widest text-zinc-500">
          {isWin ? "WELL PLAYED" : "BETTER LUCK NEXT TIME"}
        </Text>

        {/* Current round stats */}
        {history.length > 0 && (
          <View
            className="mb-6 flex-row items-center justify-around rounded-2xl py-4"
            style={{ backgroundColor: SURFACE_ALT, borderWidth: 1, borderColor: BORDER }}
          >
            <View className="items-center gap-1">
              <Text style={fontBold} className="text-2xl text-zinc-50">
                {history[history.length - 1]?.humanCards ?? 0}
              </Text>
              <Text style={fontReg} className="text-[10px] tracking-widest text-zinc-500">
                YOUR CARDS
              </Text>
            </View>
            <View
              className="h-8 w-px"
              style={{ backgroundColor: BORDER }}
            />
            <View className="items-center gap-1">
              <Text style={fontBold} className="text-2xl text-zinc-50">
                {history[history.length - 1]?.computerCards ?? 0}
              </Text>
              <Text style={fontReg} className="text-[10px] tracking-widest text-zinc-500">
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
          <Text style={fontBold} className="text-sm tracking-widest text-zinc-50">
            PLAY AGAIN
          </Text>
        </Pressable>

        {/* History */}
        {history.length > 1 && (
          <>
            <Text style={fontMed} className="mb-3 text-xs tracking-widest text-zinc-500">
              ROUND HISTORY
            </Text>
            <View className="gap-2">
              {[...history].reverse().map((r) => (
                <View
                  key={r.round}
                  className="flex-row items-center justify-between rounded-xl px-4 py-3"
                  style={{ backgroundColor: SURFACE_ALT, borderWidth: 1, borderColor: BORDER }}
                >
                  <Text style={fontMed} className="text-xs text-zinc-400">
                    Round {r.round}
                  </Text>
                  <Text
                    style={fontBold}
                    className={`text-xs ${r.winner === "human" ? "text-emerald-400" : "text-zinc-500"}`}
                  >
                    {r.winner === "human" ? "You won" : "CPU won"}
                  </Text>
                  <Text style={fontReg} className="text-xs text-zinc-500">
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
