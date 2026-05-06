import { Pressable, Text } from "react-native";

import { useAppTheme } from "./ThemeContext";
import { Font } from "./fonts";

type IconButtonProps = {
  icon: string;
  onPress?: () => void;
};

export function IconButton({ icon, onPress }: IconButtonProps) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-2xl border active:opacity-90"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.surfaceAlt,
        ...theme.panelLiftSubtle,
      }}
    >
      <Text style={{ fontFamily: Font.ui.semi, fontSize: 17, color: theme.iconGlyph }}>{icon}</Text>
    </Pressable>
  );
}
