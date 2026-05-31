import Feather from "@expo/vector-icons/Feather";
import type { ComponentProps } from "react";
import { Pressable } from "react-native";

import { hapticsImpactLight } from "@/src/platform/haptics";
import { useAppTheme } from "../theme/ThemeContext";

type FeatherName = ComponentProps<typeof Feather>["name"];

type IconButtonProps = {
  name: FeatherName;
  onPress?: () => void;
};

export function IconButton({ name, onPress }: IconButtonProps) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={() => {
        if (onPress) hapticsImpactLight();
        onPress?.();
      }}
      className="size-11 items-center justify-center rounded-2xl border active:opacity-90"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.surfaceAlt,
        ...theme.panelLiftSubtle,
      }}
    >
      <Feather name={name} size={18} color={theme.iconGlyph} />
    </Pressable>
  );
}
