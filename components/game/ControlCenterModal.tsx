import type { Difficulty } from "@/types/game";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { BORDER, BRAND, SURFACE, SURFACE_ALT } from "./theme";
import type { RoundResult } from "./WinModal";

type Props = {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  history: RoundResult[];
};

const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

const DIFFICULTY_DESC: Record<Difficulty, string> = {
  easy: "CPU plays randomly",
  medium: "CPU plays smart",
  hard: "CPU plays to win",
};

export const ControlCenterModal = forwardRef<BottomSheetModal, Props>(
  function ControlCenterModal({ difficulty, onDifficultyChange, history }, ref) {
    const internalRef = useRef<BottomSheetModal>(null);
    const sheetRef = (ref as React.RefObject<BottomSheetModal>) ?? internalRef;

    const fontScript = { fontFamily: "CormorantGaramond_700Bold_Italic" } as const;
    const fontBold = { fontFamily: "Inter_700Bold" } as const;
    const fontMed = { fontFamily: "Inter_500Medium" } as const;
    const fontReg = { fontFamily: "Inter_400Regular" } as const;

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.75} />
      ),
      [],
    );

    const wins = history.filter((r) => r.winner === "human").length;
    const losses = history.filter((r) => r.winner === "computer").length;

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["52%", "88%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: SURFACE }}
        handleIndicatorStyle={{ backgroundColor: BORDER, width: 36, height: 3 }}
      >
        <BottomSheetScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 8 }}
        >
          <Text style={fontScript} className="mb-6 text-center text-[36px] leading-none text-zinc-100">
            Control Centre
          </Text>

          {/* Win/loss summary */}
          {history.length > 0 && (
            <View
              className="mb-6 flex-row items-center justify-around rounded-2xl py-4"
              style={{ backgroundColor: SURFACE_ALT, borderWidth: 1, borderColor: BORDER }}
            >
              <View className="items-center gap-1">
                <Text style={fontBold} className="text-2xl text-emerald-400">
                  {wins}
                </Text>
                <Text style={fontReg} className="text-[10px] tracking-widest text-zinc-500">
                  WINS
                </Text>
              </View>
              <View className="h-8 w-px" style={{ backgroundColor: BORDER }} />
              <View className="items-center gap-1">
                <Text style={fontBold} className="text-2xl text-zinc-50">
                  {history.length}
                </Text>
                <Text style={fontReg} className="text-[10px] tracking-widest text-zinc-500">
                  ROUNDS
                </Text>
              </View>
              <View className="h-8 w-px" style={{ backgroundColor: BORDER }} />
              <View className="items-center gap-1">
                <Text style={fontBold} className="text-2xl text-zinc-400">
                  {losses}
                </Text>
                <Text style={fontReg} className="text-[10px] tracking-widest text-zinc-500">
                  LOSSES
                </Text>
              </View>
            </View>
          )}

          {/* Difficulty */}
          <Text style={fontMed} className="mb-3 text-xs tracking-widest text-zinc-500">
            AI DIFFICULTY
          </Text>
          <View className="mb-8 flex-row gap-2">
            {DIFFICULTIES.map((d) => {
              const active = d === difficulty;
              return (
                <Pressable
                  key={d}
                  onPress={() => onDifficultyChange(d)}
                  className="flex-1 items-center rounded-xl py-3"
                  style={{
                    backgroundColor: active ? BRAND : SURFACE_ALT,
                    borderWidth: 1,
                    borderColor: active ? BRAND : BORDER,
                  }}
                >
                  <Text
                    style={fontBold}
                    className={`text-xs tracking-widest ${active ? "text-zinc-50" : "text-zinc-400"}`}
                  >
                    {d.toUpperCase()}
                  </Text>
                  <Text
                    style={fontReg}
                    className={`mt-1 text-[9px] ${active ? "text-zinc-300" : "text-zinc-600"}`}
                  >
                    {DIFFICULTY_DESC[d]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* History */}
          <Text style={fontMed} className="mb-3 text-xs tracking-widest text-zinc-500">
            GAME HISTORY
          </Text>
          {history.length === 0 ? (
            <View className="items-center py-8">
              <Text style={fontReg} className="text-sm text-zinc-600">
                No games played yet.
              </Text>
            </View>
          ) : (
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
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);
