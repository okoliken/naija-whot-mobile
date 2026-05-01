import { Text, View } from "react-native";
import { OpponentStack } from "./OpponentStack";
import { Section } from "./Section";
import { type Player } from "@/src/store/gameStore";

type OpponentSectionProps = {
  turn: Player;
  count: number;
};

export function OpponentSection({ turn, count }: OpponentSectionProps) {
  return (
    <Section>
      <View className="mb-2 flex-row items-baseline justify-between gap-3">
        <Text className="text-xl font-bold text-zinc-50">CPU</Text>
        <Text className="text-xs font-medium text-zinc-500">{turn === "computer" ? "Thinking..." : "Waiting"}</Text>
      </View>
      <OpponentStack count={count} />
    </Section>
  );
}
