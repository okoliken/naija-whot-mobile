import { Text, View } from "react-native";
import { useAppTheme } from "./ThemeContext";

type Props = {
  message: string;
};

export function MessageBar({ message }: Props) {
  const theme = useAppTheme();
  if (!message) return null;
  return (
    <View
      className="mx-3 mb-3 rounded-2xl border px-4 py-3"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.surface,
        shadowColor: theme.messageShadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: theme.messageShadowOpacity,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Text numberOfLines={2} style={{ textAlign: "center", fontSize: 14, fontWeight: "500", color: theme.textPrimary }}>
        {message}
      </Text>
    </View>
  );
}
