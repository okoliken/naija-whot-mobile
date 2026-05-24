import { useEffect, useRef } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { View } from "react-native";

import { Font } from "../theme/fonts";
import { useAppTheme } from "../theme/ThemeContext";

type StatusChipProps = {
  label: string;
  accent?: "default" | "warning";
};

export function StatusChip({ label, accent = "default" }: StatusChipProps) {
  const theme = useAppTheme();
  const isWarning = accent === "warning";
  const palette = isWarning ? theme.chipPenalty : theme.chipShape;
  // The chip's outer glow rides the same hue as its border so it stays
  // coherent across themes without a separate glow token.
  const glowColor = palette.border;

  // Primary shimmer sweep
  const shimmer1 = useSharedValue(-90);
  // Secondary shimmer, staggered
  const shimmer2 = useSharedValue(-90);
  useEffect(() => {
    shimmer1.value = withRepeat(
      withTiming(200, { duration: 1600, easing: Easing.linear }),
      -1,
      false,
    );
    shimmer2.value = withDelay(
      800,
      withRepeat(
        withTiming(200, { duration: 1600, easing: Easing.linear }),
        -1,
        false,
      ),
    );
    return () => {
      cancelAnimation(shimmer1);
      cancelAnimation(shimmer2);
    };
  }, [shimmer1, shimmer2]);

  // Glow pulse — strong
  const glow = useSharedValue(0.3);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.95, { duration: 800 }),
        withTiming(0.3,  { duration: 800 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(glow);
  }, [glow]);

  // Scale pulse for warning urgency
  const scale = useSharedValue(1);
  useEffect(() => {
    if (isWarning) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 380 }),
          withTiming(1.0,  { duration: 380 }),
        ),
        -1,
        false,
      );
      return () => cancelAnimation(scale);
    }
    scale.value = withTiming(1, { duration: 180 });
  }, [isWarning, scale]);

  // Label crossfade
  const textOpacity = useSharedValue(1);
  const prevLabel = useRef(label);
  useEffect(() => {
    if (label === prevLabel.current) return;
    prevLabel.current = label;
    textOpacity.value = 0;
    textOpacity.value = withTiming(1, { duration: 200 });
  }, [label, textOpacity]);

  const chipStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
    shadowRadius: glow.value * 22,
  }));

  const s1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer1.value }, { rotate: "28deg" }],
  }));

  const s2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer2.value }, { rotate: "28deg" }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(260).springify().damping(14)}
      exiting={FadeOutUp.duration(180)}
      style={[
        chipStyle,
        {
          borderRadius: 999,
          borderWidth: 1,
          paddingHorizontal: 12,
          paddingVertical: 5,
          backgroundColor: palette.bg,
          borderColor: palette.border,
          overflow: "hidden",
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          elevation: 14,
        },
      ]}
    >
      {/* Top glass highlight */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          borderTopLeftRadius: 999,
          borderTopRightRadius: 999,
          backgroundColor: "rgba(255,255,255,0.07)",
        }}
      />

      {/* Primary shimmer */}
      <Animated.View
        style={[
          s1Style,
          {
            position: "absolute",
            top: -24,
            bottom: -24,
            width: 50,
            backgroundColor: "rgba(255,255,255,0.32)",
          },
        ]}
      />

      {/* Secondary shimmer */}
      <Animated.View
        style={[
          s2Style,
          {
            position: "absolute",
            top: -24,
            bottom: -24,
            width: 24,
            backgroundColor: "rgba(255,255,255,0.18)",
          },
        ]}
      />

      <Animated.Text
        style={[
          textStyle,
          {
            fontSize: 11,
            fontFamily: Font.ui.semi,
            color: palette.text,
            letterSpacing: 0.3,
          },
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
}
