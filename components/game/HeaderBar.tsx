import { type Player } from "@/src/store/gameStore";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { IconButton } from "./IconButton";
import { useAppTheme } from "./ThemeContext";

type HeaderBarProps = {
  winner: Player | null;
  turn: Player;
  pendingPick: number;
  requestedShape: string | null;
  onRestart: () => void;
  onSettings: () => void;
};

type ChipVariant = "your-turn" | "penalty" | "shape" | "cpu" | "game-win" | "game-loss";

function getChip(
  winner: Player | null,
  turn: Player,
  pendingPick: number,
  requestedShape: string | null,
): { variant: ChipVariant; label: string } {
  if (winner === "human") return { variant: "game-win", label: "You won this round" };
  if (winner === "computer") return { variant: "game-loss", label: "CPU won this round" };
  if (turn === "computer") return { variant: "cpu", label: "CPU thinking..." };
  if (pendingPick > 0)
    return { variant: "penalty", label: `Draw ${pendingPick} card${pendingPick !== 1 ? "s" : ""}` };
  if (requestedShape)
    return { variant: "shape", label: `Shape: ${requestedShape}` };
  return { variant: "your-turn", label: "✓ Your turn" };
}

export function HeaderBar({ winner, turn, pendingPick, requestedShape, onRestart, onSettings }: HeaderBarProps) {
  const theme = useAppTheme();
  const titleFont = { fontFamily: "Inter_700Bold" } as const;
  const labelFont = { fontFamily: "Inter_600SemiBold" } as const;

  const { variant, label } = getChip(winner, turn, pendingPick, requestedShape);
  const chipStyles: Record<ChipVariant, { bg: string; border: string; text: string }> = {
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
      className="rounded-2xl border px-4 py-3.5"
      style={{ borderColor: theme.border, backgroundColor: theme.headerSurface }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Animated.Text
            style={[titleFont, { fontSize: 20, fontWeight: "bold", color: theme.textPrimary, letterSpacing: -0.5 }]}
          >
            Naija Whot
          </Animated.Text>

          <Animated.View
            style={[
              chipAnim,
              {
                marginTop: 8,
                alignSelf: "flex-start",
                borderRadius: 8,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: colors.bg,
                borderColor: colors.border,
              },
            ]}
          >
            <Animated.Text style={[labelFont, { fontSize: 12, color: colors.text }]}>
              {label}
            </Animated.Text>
          </Animated.View>
        </View>

        <View className="flex-row gap-2">
          <IconButton icon="⚙" onPress={onSettings} />
          <IconButton icon="↻" onPress={onRestart} />
        </View>
      </View>
    </View>
  );
}
