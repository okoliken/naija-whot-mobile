import { Text, View } from "react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";

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
        boxShadow: theme.messageBoxShadow,
      }}
    >
      <Text
        numberOfLines={2}
        style={{ textAlign: "center", fontFamily: Font.ui.semi, fontSize: 14, color: theme.textPrimary }}
      >
        {message}
      </Text>
    </View>
  );
}
