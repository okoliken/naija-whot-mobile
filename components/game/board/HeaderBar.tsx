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
import { IconButton } from "../../ui/IconButton";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";

type HeaderBarProps = {
  winner: Player | null;
  turn: Player;
  pendingPick: number;
  requestedShape: string | null;
  onRestart: () => void;
  onSettings: () => void;
  onBack: () => void;
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
  onBack,
}: HeaderBarProps) {
  const theme = useAppTheme();
  const labelFont = { fontFamily: Font.ui.semi } as const;

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
    <View className="flex-row items-center justify-between gap-3 px-1 pt-1">
      <Animated.View
        style={[
          chipAnim,
          {
            alignSelf: "flex-start",
            borderRadius: 999,
            borderWidth: 1,
            paddingHorizontal: 14,
            paddingVertical: 8,
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

      <View className="flex-row gap-2.5">
        <IconButton name="arrow-left" onPress={onBack} />
        <IconButton name="settings" onPress={onSettings} />
        <IconButton name="rotate-cw" onPress={onRestart} />
      </View>
    </View>
  );
}
