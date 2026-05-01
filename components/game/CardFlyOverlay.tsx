import { useEffect, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { CardFront } from "./CardFront";
import type { Card } from "@/src/store/gameStore";

type Props = {
  card: Card | null;
  origin: "human" | "computer";
};

export function CardFlyOverlay({ card, origin }: Props) {
  const { height } = useWindowDimensions();
  const [displayCard, setDisplayCard] = useState<Card | null>(null);
  const prevId = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  const rot = useSharedValue(0);
  const sc = useSharedValue(1);
  const op = useSharedValue(0);

  useEffect(() => {
    if (!card || card.id === prevId.current) return;
    prevId.current = card.id;

    if (timerRef.current) clearTimeout(timerRef.current);

    // Starting position: hand area (human) or opponent area (computer)
    const fromY = origin === "human" ? height * 0.33 : -height * 0.23;
    const fromX = (Math.random() * 2 - 1) * 38;
    const fromRot = (Math.random() * 2 - 1) * 30;
    const finalRot = (Math.random() * 2 - 1) * 6;

    ty.value = fromY;
    tx.value = fromX;
    rot.value = fromRot;
    sc.value = 0.88;
    op.value = 0;

    setDisplayCard(card);

    op.value = withTiming(1, { duration: 80 });
    ty.value = withSpring(0, { stiffness: 195, damping: 21, mass: 0.75 });
    tx.value = withSpring(0, { stiffness: 215, damping: 25 });
    rot.value = withSpring(finalRot, { stiffness: 145, damping: 17 });
    sc.value = withSpring(1, { stiffness: 240, damping: 22 });

    timerRef.current = setTimeout(() => {
      op.value = withTiming(0, { duration: 180 }, (finished) => {
        if (finished) runOnJS(setDisplayCard)(null);
      });
    }, 450);
  }, [card, origin, height]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${rot.value}deg` },
      { scale: sc.value },
    ],
    opacity: op.value,
  }));

  if (!displayCard) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: height * 0.37,
          alignItems: "center",
        }}
      >
        <Animated.View style={animStyle}>
          <CardFront card={displayCard} />
        </Animated.View>
      </View>
    </View>
  );
}
