import { Text, View } from "react-native";
import { OpponentStack } from "./OpponentStack";
import { Section } from "./Section";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";
import { type Player } from "@/src/store/gameStore";

type OpponentSectionProps = {
  turn: Player;
  count: number;
};

export function OpponentSection({ turn, count }: OpponentSectionProps) {
  const theme = useAppTheme();
  return (
    <Section>
      <View className="mb-3 flex-row items-baseline justify-between gap-3">
        <Text
          style={{
            fontFamily: Font.display.bold,
            fontSize: 17,
            color: theme.textPrimary,
            letterSpacing: 1,
          }}
        >
          CPU
        </Text>
        <Text
          style={{
            fontFamily: Font.ui.regular,
            fontSize: 12,
            color: theme.textMuted,
          }}
        >
          {turn === "computer" ? "Thinking..." : "Waiting"}
        </Text>
      </View>
      <OpponentStack count={count} />
    </Section>
  );
}
