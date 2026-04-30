import { Player, type Card } from "@/src/store/gameStore";
import { Pressable, ScrollView, Text, View } from "react-native";
import { CardFront } from "./CardFront";
import { Section } from "./Section";
import { isPlayableCard } from "./isPlayableCard";
import { BORDER, BRAND, SURFACE_ALT } from "./theme";

type PlayerSectionProps = {
  humanHand: Card[];
  topCard: Card | null;
  requestedShape: Card["shape"] | null;
  pendingPick: number;
  isHumanTurn: boolean;
  message: string;
  winner: Player | null;
  onPlayCard: (index: number) => void;
  onDraw: () => void;
  onRestart: () => void;
};

export function PlayerSection({
  humanHand,
  topCard,
  requestedShape,
  pendingPick,
  isHumanTurn,
  message,
  winner,
  onPlayCard,
  onDraw,
  onRestart,
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

      <View className="mt-3 gap-3">
        <View className="rounded-lg border px-4 py-2" style={{ borderColor: BORDER, backgroundColor: SURFACE_ALT }}>
          <Text numberOfLines={2} className="text-xs font-medium text-zinc-300">
            {message || "Waiting for your move"}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 rounded-lg border px-4 py-3 active:opacity-80"
            style={{ borderColor: BORDER, backgroundColor: isHumanTurn ? SURFACE_ALT : SURFACE_ALT + "80" }}
            onPress={onDraw}
            disabled={!isHumanTurn}
          >
            <Text className="text-center text-sm font-semibold text-zinc-100">
              Draw {pendingPick > 0 ? pendingPick : 1}
            </Text>
          </Pressable>

          <Pressable
            className="rounded-lg px-4 py-3 active:opacity-80"
            style={{ backgroundColor: BRAND }}
            onPress={onRestart}
          >
            <Text className="text-sm font-semibold text-zinc-50">{winner ? "Again" : "Reset"}</Text>
          </Pressable>
        </View>
      </View>
    </Section>
  );
}
