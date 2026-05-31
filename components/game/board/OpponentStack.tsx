import { Text, View } from "react-native";
import { cn } from "@/src/platform/cn";
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
      <View className="min-h-[140px] flex-row items-end justify-center">
        {shown === 0 ? (
          <View
            className="min-w-[180px] items-center justify-center rounded-2xl border border-dashed px-5 py-6"
            style={{ borderColor: theme.border }}
          >
            <Text
              className="text-center text-[12px]"
              style={{ fontFamily: Font.ui.semi, color: theme.textSecondary }}
            >
              No cards
            </Text>
          </View>
        ) : (
          Array.from({ length: shown }).map((_, i) => (
            <View
              key={`opp-${i}`}
              className={cn(i > 0 && "-ml-9", i % 2 === 0 ? "-rotate-3" : "rotate-3")}
            >
              <CardBack compact />
            </View>
          ))
        )}
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
