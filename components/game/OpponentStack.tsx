import { Text, View } from "react-native";
import { cn } from "@/src/lib/cn";
import { CardBack } from "./CardBack";
import { BORDER, SURFACE_ALT } from "./theme";

type OpponentStackProps = {
  count: number;
};

export function OpponentStack({ count }: OpponentStackProps) {
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
        style={{ borderColor: BORDER, backgroundColor: SURFACE_ALT }}
      >
        <Text className="text-xs text-zinc-300">{count} cards</Text>
      </View>
    </View>
  );
}
