import { Text, View } from "react-native";
import { OpponentStack } from "./OpponentStack";
import { Section } from "./Section";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";
import { type Player } from "@/src/game/gameStore";

type OpponentSectionProps = {
  turn: Player;
  count: number;
  /** Display name for the opponent slot. Defaults to "CPU" for single-player. */
  label?: string;
};

export function OpponentSection({ turn, count, label = "CPU" }: OpponentSectionProps) {
  const theme = useAppTheme();
  const isOpponentTurn = turn === "computer";
  return (
    <Section active={isOpponentTurn}>
      <View className="mb-3 flex-row items-baseline justify-between gap-3">
        <Text
          style={{
            fontFamily: Font.display.bold,
            fontSize: 17,
            color: isOpponentTurn ? theme.activeLabel : theme.textPrimary,
            letterSpacing: 0.4,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: Font.ui.regular,
            fontSize: 12,
            color: theme.textMuted,
          }}
        >
          {isOpponentTurn ? "Thinking..." : "Waiting"}
        </Text>
      </View>
      <OpponentStack count={count} />
    </Section>
  );
}
