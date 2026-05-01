import { type Card } from "@/src/store/gameStore";
import { Pressable, ScrollView, View, Text} from "react-native";
import { CardFront } from "./CardFront";
import { Section } from "./Section";
import { isPlayableCard } from "./isPlayableCard";
import { SURFACE_ALT } from "./theme";

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
  return (
    <Section>
      <View className="mb-3 flex-row items-baseline justify-between gap-3">
        <Text className="text-xl font-bold text-zinc-50">Your Hand</Text>
        <Text className="text-xs font-medium text-zinc-500">{humanHand.length} {humanHand.length === 1 ? "card" : "cards"}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8, gap: 12, paddingVertical: 8 }}
      >
        {humanHand.map((card, index) => {
          const legal = isPlayableCard(card, topCard, requestedShape, pendingPick);
          const interactive = isHumanTurn && legal;
          return (
            <Pressable
              key={card.id}
              onPress={() => onPlayCard(index)}
              disabled={!interactive}
              className={!interactive ? "opacity-40" : "active:opacity-75"}
              style={{ transform: [{ perspective: 1000 }] }}
            >
              <CardFront card={card} rotated={index % 2 === 0 ? "-rotate-[2deg]" : "rotate-[2deg]"} />
            </Pressable>
          );
        })}
      </ScrollView>

      {message ? (
        <Text numberOfLines={2} className="mt-2 text-center text-xs text-zinc-400">
          {message}
        </Text>
      ) : null}
    </Section>
  );
}
