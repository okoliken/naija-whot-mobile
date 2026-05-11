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
import { IconButton } from "../../ui/IconButton";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";
import { getChipState, type ChipVariant } from "./headerChip";

type HeaderBarProps = {
  winner: Player | null;
  turn: Player;
  pendingPick: number;
  requestedShape: string | null;
  onRestart: () => void;
  onSettings: () => void;
  onBack: () => void;
};

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
  const wordmarkFont = { fontFamily: Font.display.bold } as const;
  const subtitleFont = { fontFamily: Font.ui.regular } as const;

  const { variant, label, pulse } = getChipState({
    winner,
    turn,
    pendingPick,
    requestedShape,
  });
  const chipStyles: Record<
    ChipVariant,
    { bg: string; border: string; text: string }
  > = {
    "your-turn": theme.chipYourTurn,
    penalty: theme.chipPenalty,
    shape: theme.chipShape,
    cpu: theme.chipCpu,
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

  // Pulse scale when a pending penalty is active
  const scale = useSharedValue(1);
  useEffect(() => {
    if (pulse) {
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
  }, [pulse, scale]);

  const chipAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      className="rounded-3xl border px-4 py-3.5"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.headerSurface,
        ...theme.panelLift,
      }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 pr-2">
          <Text
            style={[
              wordmarkFont,
              { fontSize: 18, color: theme.textPrimary, letterSpacing: 1.2 },
            ]}
            numberOfLines={1}
          >
            Naija Whot
          </Text>
          <Text
            style={[
              subtitleFont,
              {
                marginTop: 2,
                fontSize: 10,
                color: theme.textMuted,
                letterSpacing: 0.6,
              },
            ]}
            numberOfLines={1}
          >
            Single deck · no stress
          </Text>
        </View>

        <View className="flex-row gap-2">
          <IconButton name="arrow-left" onPress={onBack} />
          <IconButton name="settings" onPress={onSettings} />
          <IconButton name="rotate-cw" onPress={onRestart} />
        </View>
      </View>

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
  );
}
