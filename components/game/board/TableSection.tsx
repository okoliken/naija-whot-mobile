import { type Card } from "@/src/store/gameStore";
import { Pressable, View } from "react-native";
import { CardBack } from "../cards/CardBack";
import { CardFront } from "../cards/CardFront";
import { Section } from "./Section";
import { StatusChip } from "../../ui/StatusChip";

type TableSectionProps = {
  deckCount: number;
  topCard: Card | null;
  isHumanTurn: boolean;
  needLabel: string;
  pendingPick: number;
  skipsLabel: string;
  onDraw: () => void;
};

export function TableSection({
  deckCount,
  topCard,
  isHumanTurn,
  needLabel,
  pendingPick,
  skipsLabel,
  onDraw,
}: TableSectionProps) {
  const drawHint = pendingPick > 0 ? `Draw ${pendingPick}` : "Draw";

  return (
    <Section>
      <View className="items-center py-2">
        <View className="relative h-40 w-full max-w-80">
          <Pressable
            className="absolute left-5 top-4 -rotate-6"
            onPress={onDraw}
            disabled={!isHumanTurn}
            style={({ pressed }) => ({
              opacity: isHumanTurn ? (pressed ? 0.85 : 1) : 0.48,
              transform: [{ scale: isHumanTurn && pressed ? 0.96 : 1 }],
            })}
          >
            <CardBack count={deckCount} hint={isHumanTurn ? drawHint : "Market"} />
          </Pressable>
          <View className="absolute right-5 top-1 rotate-3">{topCard ? <CardFront card={topCard} /> : <CardBack />}</View>
        </View>
      </View>

      <View className="mt-2 flex-row flex-wrap items-center justify-center gap-2">
        <StatusChip label={`Need: ${needLabel}`} />
        {pendingPick > 0 ? <StatusChip label={`Pick chain: ${pendingPick}`} accent="warning" /> : null}
        {skipsLabel !== "0" ? <StatusChip label={`Skips: ${skipsLabel}`} /> : null}
      </View>
    </Section>
  );
}
