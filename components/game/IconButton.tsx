import { Pressable, Text } from "react-native";

import { useAppTheme } from "./ThemeContext";

type IconButtonProps = {
  icon: string;
  onPress?: () => void;
};

export function IconButton({ icon, onPress }: IconButtonProps) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      className="h-10 w-10 items-center justify-center rounded-xl border active:opacity-80"
      style={{ borderColor: theme.border, backgroundColor: theme.surfaceAlt }}
    >
      <Text style={{ fontSize: 16, color: theme.iconGlyph }}>{icon}</Text>
    </Pressable>
  );
}
