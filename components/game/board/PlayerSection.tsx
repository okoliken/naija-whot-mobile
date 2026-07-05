import { type Card } from "@/src/game/gameStore";
import { useEffect, useRef } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import Reanimated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { CardFront } from "../cards/CardFront";
import { isPlayableCard } from "../cards/isPlayableCard";
import { hapticsInvalidMove } from "@/src/platform/haptics";
import { playSound } from "@/src/platform/sound";
import { Font } from "../../theme/fonts";
import { useAppTheme } from "../../theme/ThemeContext";
import { type TableTheme } from "../../theme/theme";

type PlayerSectionProps = {
  humanHand: Card[];
  topCard: Card | null;
  requestedShape: Card["shape"] | null;
  pendingPick: number;
  isHumanTurn: boolean;
  message: string;
  onPlayCard: (index: number) => void;
};

/** The player's seat at the bottom edge of the table: engine message,
 *  a one-line status row, and the hand fanned along the bottom. */
export function PlayerSection({
  humanHand,
  topCard,
  requestedShape,
  pendingPick,
  isHumanTurn,
  message,
  onPlayCard,
}: PlayerSectionProps) {
  const { table } = useAppTheme();

  // A "fresh deal" is a hand that shares no cards with the previous commit —
  // those get the staggered dealing animation. A single drawn card (new id
  // among familiar ones) just fades in.
  const prevIdsRef = useRef<Set<string>>(new Set());
  const freshDeal =
    humanHand.length > 0 &&
    humanHand.every((c) => !prevIdsRef.current.has(c.id));
  useEffect(() => {
    const prev = prevIdsRef.current;
    const grew = humanHand.some((c) => !prev.has(c.id));
    // Sound for cards arriving in hand — one tick covers both a single
    // draw and the whole deal. Skip the very first commit (app open).
    if (grew && prev.size > 0) playSound("draw");
    prevIdsRef.current = new Set(humanHand.map((c) => c.id));
  });

  return (
    <View>
      <View className="min-h-[38px] justify-center px-8">
        {message ? (
          <Text
            numberOfLines={2}
            style={{
              textAlign: "center",
              fontFamily: Font.card.displayItalic,
              fontSize: 16,
              lineHeight: 19,
              color: table.textDim,
            }}
          >
            {message}
          </Text>
        ) : null}
      </View>

      <View className="mt-1 flex-row items-baseline justify-between px-5">
        <Text
          style={{
            fontFamily: Font.ui.semi,
            fontSize: 11,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            color: isHumanTurn ? table.turnAccent : table.textFaint,
          }}
        >
          {isHumanTurn ? "Your turn" : "Your hand"}
        </Text>
        <Text
          style={{
            fontFamily: Font.ui.regular,
            fontSize: 11,
            color: table.textFaint,
          }}
        >
          {humanHand.length} {humanHand.length === 1 ? "card" : "cards"}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          minHeight: 178,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
          gap: 10,
          alignItems: "flex-end",
          justifyContent: humanHand.length <= 3 ? "center" : "flex-start",
          flexGrow: 1,
        }}
      >
        {humanHand.length === 0 ? (
          <View className="flex-1 items-center justify-center pb-8">
            <Text
              style={{
                fontFamily: Font.ui.semi,
                fontSize: 12,
                letterSpacing: 1.2,
                color: table.textFaint,
              }}
            >
              No cards in hand
            </Text>
          </View>
        ) : (
          humanHand.map((card, index) => {
            const legal = isPlayableCard(
              card,
              topCard,
              requestedShape,
              pendingPick,
            );
            return (
              <HandCard
                key={card.id}
                card={card}
                table={table}
                dealDelay={freshDeal ? index * 90 : null}
                interactive={isHumanTurn && legal}
                onPlay={() => onPlayCard(index)}
              />
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

type HandCardProps = {
  card: Card;
  table: TableTheme;
  /** Stagger offset (ms) when this card is part of a fresh deal; null for
   *  cards that appear mid-round (draws), which get a plain fade. */
  dealDelay: number | null;
  interactive: boolean;
  onPlay: () => void;
};

/**
 * A single card in the player's hand. Every card looks the same and stays
 * tappable — we deliberately don't hint at which are legal. Tapping a card
 * that can't be played nudges with a quick shake + warning haptic instead
 * of silently doing nothing.
 */
function HandCard({ card, table, dealDelay, interactive, onPlay }: HandCardProps) {
  const shake = useRef(new Animated.Value(0)).current;

  const nudge = () => {
    hapticsInvalidMove();
    shake.stopAnimation(() => {
      shake.setValue(0);
      Animated.sequence(
        [1, -1, 0.6, -0.6, 0].map((toValue) =>
          Animated.timing(shake, {
            toValue,
            duration: 48,
            useNativeDriver: true,
          }),
        ),
      ).start();
    });
  };

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-9, 9],
  });

  return (
    <Reanimated.View
      entering={
        dealDelay != null
          ? FadeInDown.duration(320).delay(dealDelay).springify().damping(16)
          : FadeIn.duration(220)
      }
    >
      <Animated.View style={{ transform: [{ translateX }] }}>
      <Pressable
        onPress={() => (interactive ? onPlay() : nudge())}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.96 : 1 }],
          opacity: pressed ? 0.9 : 1,
          boxShadow: table.cardShadow,
          borderRadius: 8,
        })}
      >
        <CardFront card={card} />
      </Pressable>
      </Animated.View>
    </Reanimated.View>
  );
}
