import type { Difficulty } from "@/src/game/types";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { BRAND, ON_BRAND, ON_BRAND_DIM } from "../../theme/theme";
import { useAppTheme, useThemeMode } from "../../theme/ThemeContext";
import { FontStyle } from "../../theme/fonts";
import type { RoundResult } from "./WinModal";
import { DIFFICULTIES, DIFFICULTY_DESC } from "@/src/game/constants";
import { loadStats, type AllTimeStats } from "@/src/platform/storage/stats";

type Props = {
  /** Omit in multiplayer — the difficulty selector hides when no value is passed. */
  difficulty?: Difficulty;
  onDifficultyChange?: (d: Difficulty) => void;
  history: RoundResult[];
  /** Label for the opponent in stats/history. Defaults to "CPU" for single-player. */
  opponentLabel?: string;
  ref?: RefObject<BottomSheetModal | null>;
};

export function ControlCenterModal({
  difficulty,
  onDifficultyChange,
  history,
  opponentLabel = "CPU",
  ref,
}: Props) {
  const theme = useAppTheme();
  const { mode, setMode } = useThemeMode();
  const internalRef = useRef<BottomSheetModal>(null);
  const sheetRef = ref ?? internalRef;

  // All-time tallies. Reload when the session history grows so the sheet
  // stays fresh after each round without a focus listener.
  const [allTime, setAllTime] = useState<AllTimeStats | null>(null);
  useEffect(() => {
    let cancelled = false;
    loadStats().then((s) => {
      if (!cancelled) setAllTime(s);
    });
    return () => {
      cancelled = true;
    };
  }, [history.length]);

  const renderBackdrop = (
    props: React.ComponentProps<typeof BottomSheetBackdrop>,
  ) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.75}
    />
  );

  const wins = history.filter((r) => r.winner === "human").length;
  const losses = history.filter((r) => r.winner === "computer").length;

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["52%", "88%"]}
      enableDynamicSizing={false}
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
            FontStyle.display.bold,
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

        {/* Session win/loss summary */}
        {history.length > 0 && (
          <Text
            style={[
              FontStyle.ui.semi,
              { marginBottom: 12, fontSize: 13, color: theme.textSecondary },
            ]}
          >
            This session
          </Text>
        )}
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
              <Text style={[FontStyle.ui.bold, { fontSize: 24, color: theme.success }]}>
                {wins}
              </Text>
              <Text
                style={[FontStyle.ui.regular, { fontSize: 11, color: theme.textMuted }]}
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
                style={[FontStyle.ui.bold, { fontSize: 24, color: theme.textPrimary }]}
              >
                {history.length}
              </Text>
              <Text
                style={[FontStyle.ui.regular, { fontSize: 11, color: theme.textMuted }]}
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
                style={[FontStyle.ui.bold, { fontSize: 24, color: theme.textSecondary }]}
              >
                {losses}
              </Text>
              <Text
                style={[FontStyle.ui.regular, { fontSize: 11, color: theme.textMuted }]}
              >
                Losses
              </Text>
            </View>
          </View>
        )}

        {/* All-time record */}
        {allTime && allTime.wins + allTime.losses > 0 ? (
          <>
            <Text
              style={[
                FontStyle.ui.semi,
                { marginBottom: 12, fontSize: 13, color: theme.textSecondary },
              ]}
            >
              All time
            </Text>
            <View
              className="mb-8 flex-row items-center justify-around rounded-2xl py-4"
              style={{
                backgroundColor: theme.surfaceAlt,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View className="items-center gap-1">
                <Text
                  style={[FontStyle.ui.bold, { fontSize: 24, color: theme.success }]}
                >
                  {allTime.wins}
                </Text>
                <Text
                  style={[FontStyle.ui.regular, { fontSize: 11, color: theme.textMuted }]}
                >
                  Wins
                </Text>
              </View>
              <View className="h-8 w-px" style={{ backgroundColor: theme.border }} />
              <View className="items-center gap-1">
                <Text
                  style={[FontStyle.ui.bold, { fontSize: 24, color: theme.textPrimary }]}
                >
                  {allTime.wins + allTime.losses}
                </Text>
                <Text
                  style={[FontStyle.ui.regular, { fontSize: 11, color: theme.textMuted }]}
                >
                  Rounds
                </Text>
              </View>
              <View className="h-8 w-px" style={{ backgroundColor: theme.border }} />
              <View className="items-center gap-1">
                <Text
                  style={[FontStyle.ui.bold, { fontSize: 24, color: theme.textSecondary }]}
                >
                  {allTime.losses}
                </Text>
                <Text
                  style={[FontStyle.ui.regular, { fontSize: 11, color: theme.textMuted }]}
                >
                  Losses
                </Text>
              </View>
            </View>
          </>
        ) : null}

        {/* Appearance */}
        <Text
          style={[
            FontStyle.ui.semi,
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
          className="mb-8 flex-row items-center justify-between rounded-xl px-4 py-3.5"
          style={{
            backgroundColor: theme.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <View style={{ flexShrink: 1, paddingRight: 12 }}>
            <Text
              style={[
                FontStyle.ui.semi,
                { fontSize: 14, color: theme.textPrimary },
              ]}
            >
              Dark mode
            </Text>
            <Text
              style={[
                FontStyle.ui.regular,
                { marginTop: 3, fontSize: 12, color: theme.textMuted },
              ]}
            >
              Deep felt table and warm dark surfaces
            </Text>
          </View>
          <Switch
            value={mode === "dark"}
            onValueChange={(on) => setMode(on ? "dark" : "light")}
            trackColor={{ true: BRAND }}
            ios_backgroundColor={theme.border}
          />
        </View>

        {/* Difficulty (single-player only) */}
        {difficulty && onDifficultyChange ? (
          <>
            <Text
              style={[
                FontStyle.ui.semi,
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
                        FontStyle.ui.bold,
                        {
                          fontSize: 12,
                          letterSpacing: 2.4,
                          color: active ? ON_BRAND : theme.textSecondary,
                        },
                      ]}
                    >
                      {d.toUpperCase()}
                    </Text>
                    <Text
                      style={[
                        FontStyle.ui.regular,
                        {
                          marginTop: 4,
                          fontSize: 9,
                          color: active ? ON_BRAND_DIM : theme.textSubtle,
                        },
                      ]}
                    >
                      {DIFFICULTY_DESC[d]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}

        {/* History */}
        <Text
          style={[
            FontStyle.ui.semi,
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
            <Text style={[FontStyle.ui.regular, { fontSize: 14, color: theme.textSubtle }]}>
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
                    FontStyle.ui.semi,
                    { fontSize: 12, color: theme.textSecondary },
                  ]}
                >
                  Round {r.round}
                </Text>
                <Text
                  style={[
                    FontStyle.ui.bold,
                    {
                      fontSize: 12,
                      color: r.winner === "human" ? theme.success : theme.textMuted,
                    },
                  ]}
                >
                  {r.winner === "human" ? "You won" : `${opponentLabel} won`}
                </Text>
                <Text
                  style={[FontStyle.ui.regular, { fontSize: 12, color: theme.textMuted }]}
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
