import { type Card } from "@/src/store/gameStore";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CardFront } from "../cards/CardFront";
import { Section } from "./Section";
import { isPlayableCard } from "../cards/isPlayableCard";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";

type PlayerSectionProps = {
  humanHand: Card[];
  topCard: Card | null;
  requestedShape: Card["shape"] | null;
  pendingPick: number;
  isHumanTurn: boolean;
  message: string;
  onPlayCard: (index: number) => void;
};

export function PlayerSection({
  humanHand,
  topCard,
  requestedShape,
  pendingPick,
  isHumanTurn,
  message,
  onPlayCard,
}: PlayerSectionProps) {
  const theme = useAppTheme();
  return (
    <Section>
      <View className="mb-3 flex-row items-baseline justify-between gap-3">
        <Text
          style={{
            fontFamily: Font.display.bold,
            fontSize: 17,
            color: theme.textPrimary,
            letterSpacing: 0.9,
          }}
        >
          Your hand
        </Text>
        <Text
          style={{
            fontFamily: Font.ui.regular,
            fontSize: 12,
            color: theme.textMuted,
          }}
        >
          {humanHand.length} {humanHand.length === 1 ? "card" : "cards"}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="min-h-[170px]"
        contentContainerStyle={{
          minHeight: 170,
          paddingHorizontal: 8,
          paddingVertical: 8,
          gap: 12,
          alignItems: "center",
          justifyContent: humanHand.length === 0 ? "center" : "flex-start",
          flexGrow: humanHand.length === 0 ? 1 : 0,
        }}
      >
        {humanHand.length === 0 ? (
          <View
            className="min-w-[240px] items-center justify-center rounded-2xl border border-dashed px-6 py-7"
            style={{ borderColor: theme.border }}
          >
            <Text
              className="text-center text-[13px]"
              style={{
                fontFamily: Font.ui.semi,
                letterSpacing: 0.4,
                color: theme.textSecondary,
              }}
            >
              No cards in hand
            </Text>
            <Text
              className="mt-1 text-center text-[11px]"
              style={{ fontFamily: Font.ui.regular, color: theme.textMuted }}
            >
              Round complete.
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
            const interactive = isHumanTurn && legal;
            return (
              <Pressable
                key={card.id}
                onPress={() => onPlayCard(index)}
                disabled={!interactive}
                style={({ pressed }) => ({
                  transform: [
                    { perspective: 1000 },
                    { scale: interactive && pressed ? 0.96 : 1 },
                  ],
                  opacity: interactive ? (pressed ? 0.88 : 1) : 0.38,
                })}
              >
                <CardFront
                  card={card}
                  rotated={index % 2 === 0 ? "-rotate-[2deg]" : "rotate-[2deg]"}
                />
              </Pressable>
            );
          })
        )}
      </ScrollView>

      {message ? (
        <View
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Text
            numberOfLines={2}
            style={{
              textAlign: "center",
              fontFamily: Font.ui.regular,
              fontSize: 12.5,
              lineHeight: 18,
              color: theme.textSecondary,
            }}
          >
            {message}
          </Text>
        </View>
      ) : null}
    </Section>
  );
}
