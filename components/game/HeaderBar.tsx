import { type Player } from "@/src/store/gameStore";
import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { IconButton } from "./IconButton";
import { useAppTheme } from "./ThemeContext";
import { Font } from "./fonts";

type HeaderBarProps = {
  winner: Player | null;
  turn: Player;
  pendingPick: number;
  requestedShape: string | null;
  onRestart: () => void;
  onSettings: () => void;
  onHowToPlay: () => void;
};

type ChipVariant =
  | "your-turn"
  | "penalty"
  | "shape"
  | "cpu"
  | "game-win"
  | "game-loss";

function getChip(
  winner: Player | null,
  turn: Player,
  pendingPick: number,
  requestedShape: string | null,
): { variant: ChipVariant; label: string } {
  if (winner === "human")
    return { variant: "game-win", label: "You won this round" };
  if (winner === "computer")
    return { variant: "game-loss", label: "CPU won this round" };
  if (turn === "computer") return { variant: "cpu", label: "CPU thinking..." };
  if (pendingPick > 0)
    return {
      variant: "penalty",
      label: `Draw ${pendingPick} card${pendingPick !== 1 ? "s" : ""}`,
    };
  if (requestedShape)
    return { variant: "shape", label: `Shape: ${requestedShape}` };
  return { variant: "your-turn", label: "✓ Your turn" };
}

export function HeaderBar({
  winner,
  turn,
  pendingPick,
  requestedShape,
  onRestart,
  onSettings,
  onHowToPlay,
}: HeaderBarProps) {
  const theme = useAppTheme();
  const titleFont = { fontFamily: Font.display.bold } as const;
  const labelFont = { fontFamily: Font.ui.semi } as const;
  const subtitleFont = { fontFamily: Font.ui.regular } as const;

  const { variant, label } = getChip(winner, turn, pendingPick, requestedShape);
  const chipStyles: Record<
    ChipVariant,
    { bg: string; border: string; text: string }
  > = {
    "your-turn": theme.chipYourTurn,
    penalty: theme.chipPenalty,
    shape: theme.chipShape,
    cpu: theme.chipCpu,
    "game-win": theme.chipYourTurn,
    "game-loss": theme.chipPenalty,
  };
  const colors = chipStyles[variant];
  const prevLabel = useRef(label);

  // Fade on label change
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (label === prevLabel.current) return;
    prevLabel.current = label;
    opacity.value = 0;
    opacity.value = withTiming(1, { duration: 220 });
  }, [label, opacity]);

  // Pulse scale when penalty is active
  const scale = useSharedValue(1);
  useEffect(() => {
    if (variant === "penalty") {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 420 }),
          withTiming(1.0, { duration: 420 }),
        ),
        -1,
        false,
      );
    } else {
      scale.value = withTiming(1, { duration: 180 });
    }
  }, [variant, scale]);

  const chipAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      className="rounded-3xl border px-4 py-4"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.headerSurface,
        ...theme.panelLift,
      }}
    >
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 pr-2">
          <Animated.Text
            style={[
              titleFont,
              { fontSize: 23, color: theme.textPrimary, letterSpacing: 0.8 },
            ]}
          >
            Naija Whot
          </Animated.Text>
          <Text
            style={[
              subtitleFont,
              {
                marginTop: 3,
                fontSize: 11,
                color: theme.textMuted,
                letterSpacing: 0.4,
              },
            ]}
            numberOfLines={1}
          >
            Classic tabletop · one deck
          </Text>

          <Animated.View
            style={[
              chipAnim,
              {
                marginTop: 10,
                alignSelf: "flex-start",
                borderRadius: 999,
                borderWidth: 1,
                paddingHorizontal: 13,
                paddingVertical: 7,
                backgroundColor: colors.bg,
                borderColor: colors.border,
              },
            ]}
          >
            <Animated.Text
              style={[labelFont, { fontSize: 12, color: colors.text }]}
            >
              {label}
            </Animated.Text>
          </Animated.View>
        </View>

        <View className="flex-row gap-2.5 pt-0.5">
          <IconButton icon="?" onPress={onHowToPlay} />
          <IconButton icon="⚙" onPress={onSettings} />
          <IconButton icon="↻" onPress={onRestart} />
        </View>
      </View>
    </View>
  );
}
