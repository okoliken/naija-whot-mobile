import { type Card } from "@/src/store/gameStore";
import { View } from "react-native";
import { CardBack } from "./CardBack";
import { CardFront } from "./CardFront";
import { Section } from "./Section";
import { StatusChip } from "./StatusChip";

type TableSectionProps = {
  deckCount: number;
  topCard: Card | null;
  isHumanTurn: boolean;
  needLabel: string;
  pendingPick: number;
  skipsLabel: string;
  isGeneralMarketMoment: boolean;
};

export function TableSection({
  deckCount,
  topCard,
  isHumanTurn,
  needLabel,
  pendingPick,
  skipsLabel,
  isGeneralMarketMoment,
}: TableSectionProps) {
  return (
    <Section>
      <View className="items-center py-2">
        <View className="relative h-[160px] w-full max-w-[270px]">
          <View className="absolute left-5 top-4 -rotate-6">
            <CardBack count={deckCount} hint={isHumanTurn ? "Draw" : "Market"} />
          </View>
          <View className="absolute right-5 top-1 rotate-3">{topCard ? <CardFront card={topCard} /> : <CardBack />}</View>
        </View>
      </View>

      <View className="mt-2 flex-row flex-wrap items-center justify-center gap-2">
        {isGeneralMarketMoment ? <StatusChip label="General Market" accent="warning" /> : null}
        <StatusChip label={`Need: ${needLabel}`} />
        {pendingPick > 0 ? <StatusChip label={`Pick chain: ${pendingPick}`} accent="warning" /> : null}
        {skipsLabel !== "0" ? <StatusChip label={`Skips: ${skipsLabel}`} /> : null}
      </View>
    </Section>
  );
}
