import type { Difficulty } from "@/types/game";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef, type RefObject } from "react";
import { Pressable, Text, View } from "react-native";
import { BRAND } from "../../theme/theme";
import { useAppTheme, useThemeMode } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";
import type { RoundResult } from "./WinModal";
import { DIFFICULTIES, DIFFICULTY_DESC } from "@/src/store/game/constants";
import type { ThemeMode } from "@/src/lib/themePreference";

const THEME_OPTIONS: { value: ThemeMode; label: string; glyph: string }[] = [
  { value: "light", label: "Light", glyph: "☀" },
  { value: "dark", label: "Dark", glyph: "☾" },
];

type Props = {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  history: RoundResult[];
  ref?: RefObject<BottomSheetModal | null>;
};

export function ControlCenterModal({
  difficulty,
  onDifficultyChange,
  history,
  ref,
}: Props) {
  const theme = useAppTheme();
  const { mode, setMode } = useThemeMode();
  const internalRef = useRef<BottomSheetModal>(null);
  const sheetRef = ref ?? internalRef;

  const fontDisplay = { fontFamily: Font.display.bold } as const;
  const fontBold = { fontFamily: Font.ui.bold } as const;
  const fontSemi = { fontFamily: Font.ui.semi } as const;
  const fontReg = { fontFamily: Font.ui.regular } as const;

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.75}
      />
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
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{
        backgroundColor: theme.border,
        width: 36,
        height: 3,
      }}
    >
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 48,
          paddingTop: 8,
        }}
      >
        <Text
          style={[
            fontDisplay,
            {
              marginBottom: 24,
              textAlign: "center",
              fontSize: 26,
              lineHeight: 30,
              letterSpacing: 1.4,
              color: theme.textPrimary,
            },
          ]}
        >
          Control Centre
        </Text>

        {/* Win/loss summary */}
        {history.length > 0 && (
          <View
            className="mb-6 flex-row items-center justify-around rounded-2xl py-4"
            style={{
              backgroundColor: theme.surfaceAlt,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <View className="items-center gap-1">
              <Text style={[fontBold, { fontSize: 24, color: "#34d399" }]}>
                {wins}
              </Text>
              <Text
                style={[fontReg, { fontSize: 11, color: theme.textMuted }]}
              >
                Wins
              </Text>
            </View>
            <View
              className="h-8 w-px"
              style={{ backgroundColor: theme.border }}
            />
            <View className="items-center gap-1">
              <Text
                style={[fontBold, { fontSize: 24, color: theme.textPrimary }]}
              >
                {history.length}
              </Text>
              <Text
                style={[fontReg, { fontSize: 11, color: theme.textMuted }]}
              >
                Rounds
              </Text>
            </View>
            <View
              className="h-8 w-px"
              style={{ backgroundColor: theme.border }}
            />
            <View className="items-center gap-1">
              <Text
                style={[fontBold, { fontSize: 24, color: theme.textSecondary }]}
              >
                {losses}
              </Text>
              <Text
                style={[fontReg, { fontSize: 11, color: theme.textMuted }]}
              >
                Losses
              </Text>
            </View>
          </View>
        )}

        {/* Appearance */}
        <Text
          style={[
            fontSemi,
            {
              marginBottom: 12,
              fontSize: 13,
              color: theme.textSecondary,
            },
          ]}
        >
          Appearance
        </Text>
        <View
          className="mb-8 flex-row rounded-xl p-1"
          style={{
            backgroundColor: theme.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          {THEME_OPTIONS.map((opt) => {
            const active = opt.value === mode;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setMode(opt.value)}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-lg py-2.5"
                style={{
                  backgroundColor: active ? theme.surface : "transparent",
                  ...(active ? theme.panelLiftSubtle : null),
                }}
              >
                <Text
                  style={{
                    fontFamily: Font.ui.semi,
                    fontSize: 14,
                    color: active ? theme.textPrimary : theme.textMuted,
                  }}
                >
                  {opt.glyph}
                </Text>
                <Text
                  style={[
                    fontSemi,
                    {
                      fontSize: 12,
                      letterSpacing: 1.2,
                      color: active ? theme.textPrimary : theme.textMuted,
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Difficulty */}
        <Text
          style={[
            fontSemi,
            {
              marginBottom: 12,
              fontSize: 13,
              color: theme.textSecondary,
            },
          ]}
        >
          Difficulty
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
                  backgroundColor: active ? BRAND : theme.surfaceAlt,
                  borderWidth: 1,
                  borderColor: active ? BRAND : theme.border,
                }}
              >
                <Text
                  style={[
                    fontBold,
                    {
                      fontSize: 12,
                      letterSpacing: 2.4,
                      color: active ? "#fafafa" : theme.textSecondary,
                    },
                  ]}
                >
                  {d.toUpperCase()}
                </Text>
                <Text
                  style={[
                    fontReg,
                    {
                      marginTop: 4,
                      fontSize: 9,
                      color: active ? "#d4d4d8" : theme.textSubtle,
                    },
                  ]}
                >
                  {DIFFICULTY_DESC[d]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* History */}
        <Text
          style={[
            fontSemi,
            {
              marginBottom: 12,
              fontSize: 13,
              color: theme.textSecondary,
            },
          ]}
        >
          History
        </Text>
        {history.length === 0 ? (
          <View className="items-center py-8">
            <Text style={[fontReg, { fontSize: 14, color: theme.textSubtle }]}>
              No games played yet.
            </Text>
          </View>
        ) : (
          <View className="gap-2">
            {[...history].reverse().map((r) => (
              <View
                key={r.round}
                className="flex-row items-center justify-between rounded-xl px-4 py-3"
                style={{
                  backgroundColor: theme.surfaceAlt,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text
                  style={[
                    fontSemi,
                    { fontSize: 12, color: theme.textSecondary },
                  ]}
                >
                  Round {r.round}
                </Text>
                <Text
                  style={[
                    fontBold,
                    {
                      fontSize: 12,
                      color: r.winner === "human" ? "#34d399" : theme.textMuted,
                    },
                  ]}
                >
                  {r.winner === "human" ? "You won" : "CPU won"}
                </Text>
                <Text
                  style={[fontReg, { fontSize: 12, color: theme.textMuted }]}
                >
                  {r.humanCards} – {r.computerCards}
                </Text>
              </View>
            ))}
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
