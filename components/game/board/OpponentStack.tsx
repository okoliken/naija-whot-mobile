import { Text, View } from "react-native";
import { cn } from "@/src/lib/cn";
import { CardBack } from "../cards/CardBack";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";

type OpponentStackProps = {
  count: number;
};

export function OpponentStack({ count }: OpponentStackProps) {
  const theme = useAppTheme();
  const shown = Math.min(count, 4);

  return (
    <View className="items-center pt-1">
      <View className="flex-row items-end justify-center">
        {Array.from({ length: shown }).map((_, i) => (
          <View
            key={`opp-${i}`}
            className={cn(i > 0 && "-ml-9", i % 2 === 0 ? "-rotate-3" : "rotate-3")}
          >
            <CardBack compact />
          </View>
        ))}
      </View>
      <View
        className="mt-2 rounded-full border px-3 py-1"
        style={{ borderColor: theme.border, backgroundColor: theme.surfaceAlt }}
      >
        <Text style={{ fontFamily: Font.ui.regular, fontSize: 12, color: theme.textSecondary }}>
          {count} cards
        </Text>
      </View>
    </View>
  );
}
