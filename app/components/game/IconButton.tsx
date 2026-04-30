import { Pressable, Text } from "react-native";
import { BORDER, SURFACE_ALT } from "./theme";

type IconButtonProps = {
  icon: string;
  onPress?: () => void;
};

export function IconButton({ icon, onPress }: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-xl border active:opacity-80"
      style={{ borderColor: BORDER, backgroundColor: SURFACE_ALT }}
    >
      <Text className="text-base text-zinc-200">{icon}</Text>
    </Pressable>
  );
}
