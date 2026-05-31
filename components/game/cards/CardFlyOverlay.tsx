import { useEffect, useRef, useState } from "react";
import { 
  StyleSheet, 
  useWindowDimensions,
  View } 
  from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { CardFront } from "./CardFront";
import type { Card } from "@/src/game/gameStore";

type Props = {
  card: Card | null;
  origin: "human" | "computer";
};

// Aligns the fly card with the table top card's landing spot.
// TableSection container is max 320px wide, centered. The top card sits
// `right-5` (20px) inside it, is 116px wide, and is rotated 3deg.
const TABLE_CARD_WIDTH = 116;
const TABLE_CARD_RIGHT_INSET = 20;
const TABLE_CONTAINER_MAX = 320;
const TABLE_CONTAINER_HORIZONTAL_PADDING = 32;
const TABLE_CARD_ROTATION = 3;

export function CardFlyOverlay({ card, origin }: Props) {
  const { height, width } = useWindowDimensions();
  const [displayCard, setDisplayCard] = useState<Card | null>(null);
  const prevId = useRef<string | null>(null);

  const ty = useSharedValue(0);
  const tx = useSharedValue(0);
  const rot = useSharedValue(0);
  const sc = useSharedValue(1);
  const op = useSharedValue(0);

  useEffect(() => {
    if (!card || card.id === prevId.current) return;
    prevId.current = card.id;

    // Compute the landing translateX so the overlay aligns with the
    // table card, which is offset right of screen-center.
    const containerWidth = Math.min(
      TABLE_CONTAINER_MAX,
      width - TABLE_CONTAINER_HORIZONTAL_PADDING,
    );
    const finalX =
      containerWidth / 2 -
      (TABLE_CARD_RIGHT_INSET + TABLE_CARD_WIDTH / 2);

    // Starting position: hand area (human) or opponent area (computer)
    const fromY = origin === "human" ? height * 0.33 : -height * 0.23;
    const fromX = finalX + (Math.random() * 2 - 1) * 38;
    const fromRot = (Math.random() * 2 - 1) * 30;

    ty.value = fromY;
    tx.value = fromX;
    rot.value = fromRot;
    sc.value = 0.88;
    op.value = 0;

    setDisplayCard(card);

    // Springs deliberately overlap with the fade-out tail (~450ms) so
    // the card still has a touch of residual motion as it dissolves.
    ty.value = withSpring(0, { stiffness: 195, damping: 21, mass: 0.75 });
    tx.value = withSpring(finalX, { stiffness: 215, damping: 25 });
    rot.value = withSpring(TABLE_CARD_ROTATION, {
      stiffness: 145,
      damping: 17,
    });
    sc.value = withSpring(1, { stiffness: 240, damping: 22 });

    // Fade in -> hold -> fade out, fully sequenced on the UI thread so
    // the hide is immune to JS-thread stalls (e.g. AI turn compute).
    op.value = withSequence(
      withTiming(1, { duration: 80 }),
      withDelay(
        370,
        withTiming(0, { duration: 180 }, (finished) => {
          if (finished) scheduleOnRN(setDisplayCard, null);
        }),
      ),
    );
  }, [card, origin, height, width, ty, tx, rot, sc, op]);

  useEffect(() => {
    return () => {
      cancelAnimation(ty);
      cancelAnimation(tx);
      cancelAnimation(rot);
      cancelAnimation(sc);
      cancelAnimation(op);
    };
  }, [ty, tx, rot, sc, op]);

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
