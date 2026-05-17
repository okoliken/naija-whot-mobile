import { useEffect, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const COLORS = [
  "#34d399",
  "#fbbf24",
  "#60a5fa",
  "#f472b6",
  "#a78bfa",
  "#fb923c",
  "#2dd4bf",
  "#facc15",
];

const PIECE_COUNT = 40;

type PieceConfig = {
  id: number;
  left: number;
  startTop: number;
  color: string;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  w: number;
  h: number;
};

function buildPieces(width: number, height: number): PieceConfig[] {
  const out: PieceConfig[] = [];
  for (let i = 0; i < PIECE_COUNT; i += 1) {
    out.push({
      id: i,
      left: Math.random() * Math.max(8, width - 14),
      startTop: -height * 0.12 - Math.random() * 80,
      color: COLORS[i % COLORS.length]!,
      delay: Math.random() * 220,
      duration: 1600 + Math.random() * 700,
      drift: (Math.random() - 0.5) * Math.min(100, width * 0.2),
      spin: (Math.random() - 0.5) * 720,
      w: 6 + Math.floor(Math.random() * 6),
      h: 8 + Math.floor(Math.random() * 8),
    });
  }
  return out;
}

function ConfettiPiece({ height, cfg }: { height: number; cfg: PieceConfig }) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    translateY.value = withDelay(
      cfg.delay,
      withTiming(height + cfg.startTop + 48, {
        duration: cfg.duration,
        easing: Easing.bezier(0.22, 0.61, 0.36, 1),
      }),
    );
    translateX.value = withDelay(
      cfg.delay,
      withTiming(cfg.drift, {
        duration: cfg.duration,
        easing: Easing.out(Easing.quad),
      }),
    );
    rotate.value = withDelay(
      cfg.delay,
      withTiming(cfg.spin, { duration: cfg.duration, easing: Easing.linear }),
    );
    opacity.value = withDelay(
      cfg.delay + cfg.duration - 320,
      withTiming(0, { duration: 380, easing: Easing.out(Easing.quad) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot per piece mount
  }, []);

  const animated = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: cfg.left,
          top: cfg.startTop,
          width: cfg.w,
          height: cfg.h,
          backgroundColor: cfg.color,
          borderRadius: 2,
        },
        animated,
      ]}
    />
  );
}

type Props = {
  width: number;
  height: number;
};

/** In-sheet confetti overlay; parent should use `pointerEvents="none"` and stack above scroll content. Remount with `key` for a new burst. */
export function WinConfetti({ width, height }: Props) {
  const pieces = useMemo(
    () => (width >= 24 && height >= 24 ? buildPieces(width, height) : []),
    [width, height],
  );

  if (pieces.length === 0) return null;

  return (
    <View style={styles.root} pointerEvents="none">
      {pieces.map((cfg) => (
        <ConfettiPiece key={cfg.id} height={height} cfg={cfg} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
});
