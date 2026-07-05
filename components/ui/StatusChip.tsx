import { useEffect, useRef } from "react";
import Animated, {
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Font } from "../theme/fonts";
import { useAppTheme } from "../theme/ThemeContext";

type StatusChipProps = {
  label: string;
  accent?: "default" | "warning";
};

/** Quiet table-marker pill for game state (shape request, pick chain).
 *  Uses the theme's table palette so it follows light/dark mode. */
export function StatusChip({ label, accent = "default" }: StatusChipProps) {
  const { table } = useAppTheme();
  const isWarning = accent === "warning";

  // Label crossfade so in-place text swaps don't pop.
  const textOpacity = useSharedValue(1);
  const prevLabel = useRef(label);
  useEffect(() => {
    if (label === prevLabel.current) return;
    prevLabel.current = label;
    textOpacity.value = 0;
    textOpacity.value = withTiming(1, { duration: 200 });
  }, [label, textOpacity]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeInDown.duration(220)}
      exiting={FadeOutUp.duration(160)}
      style={{
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 5,
        backgroundColor: table.chipBg,
        borderColor: isWarning ? table.chipWarnBorder : table.chipBorder,
      }}
    >
      <Animated.Text
        style={[
          textStyle,
          {
            fontSize: 11,
            fontFamily: Font.ui.semi,
            color: isWarning ? table.chipWarnText : table.textDim,
            letterSpacing: 0.4,
          },
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
}
