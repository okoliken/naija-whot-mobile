import { Text, View } from "react-native";
import { IconButton } from "./IconButton";
import { BORDER, SURFACE_ALT } from "./theme";
import { type Player } from "@/src/store/gameStore";

type HeaderBarProps = {
  turn: Player;
  onRestart: () => void;
};

export function HeaderBar({ turn, onRestart }: HeaderBarProps) {
  const titleFont = { fontFamily: "Inter_700Bold" } as const;

  return (
    <View
      className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-4 py-3.5"
      style={{ borderColor: BORDER }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text style={titleFont} className="text-xl font-bold tracking-tight text-zinc-50">
            Naija Whot
          </Text>
          <View
            className="mt-2 self-start rounded-lg border px-3 py-1.5"
            style={{ borderColor: BORDER, backgroundColor: SURFACE_ALT }}
          >
            <Text className="text-xs font-medium text-zinc-400">
              {turn === "human" ? "✓ Your turn" : "CPU thinking..."}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <IconButton icon="☾" />
          <IconButton icon="↻" onPress={onRestart} />
        </View>
      </View>
    </View>
  );
}
