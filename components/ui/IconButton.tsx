import Feather from "@expo/vector-icons/Feather";
import type { ComponentProps } from "react";
import { Pressable } from "react-native";

import { hapticsImpactLight } from "@/src/platform/haptics";
import { useAppTheme } from "../theme/ThemeContext";

type FeatherName = ComponentProps<typeof Feather>["name"];

type IconButtonProps = {
  name: FeatherName;
  onPress?: () => void;
  /** "panel" (default) sits on themed surfaces; "felt" is a quiet ghost
   *  control for the card-table screens. */
  tone?: "panel" | "felt";
};

export function IconButton({ name, onPress, tone = "panel" }: IconButtonProps) {
  const theme = useAppTheme();
  const onFelt = tone === "felt";
  return (
    <Pressable
      onPress={() => {
        if (onPress) hapticsImpactLight();
        onPress?.();
      }}
      hitSlop={6}
      className="size-10 items-center justify-center rounded-full active:opacity-70"
      style={
        onFelt
          ? { backgroundColor: theme.table.ghostBg }
          : {
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surfaceAlt,
              ...theme.panelLiftSubtle,
            }
      }
    >
      <Feather
        name={name}
        size={17}
        color={onFelt ? theme.table.textDim : theme.iconGlyph}
      />
    </Pressable>
  );
}
