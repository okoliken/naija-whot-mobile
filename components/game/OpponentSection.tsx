import { Text, View } from "react-native";
import { OpponentStack } from "./OpponentStack";
import { Section } from "./Section";
import { useAppTheme } from "./ThemeContext";
import { type Player } from "@/src/store/gameStore";

type OpponentSectionProps = {
  turn: Player;
  count: number;
};

export function OpponentSection({ turn, count }: OpponentSectionProps) {
  const theme = useAppTheme();
  return (
    <Section>
      <View className="mb-2 flex-row items-baseline justify-between gap-3">
        <Text style={{ fontSize: 20, fontWeight: "700", color: theme.textPrimary }}>CPU</Text>
        <Text style={{ fontSize: 12, fontWeight: "500", color: theme.textMuted }}>
          {turn === "computer" ? "Thinking..." : "Waiting"}
        </Text>
      </View>
      <OpponentStack count={count} />
    </Section>
  );
}
