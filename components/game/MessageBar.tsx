import { Text, View } from "react-native";
import { BORDER, SURFACE } from "./theme";

type Props = {
  message: string;
};

export function MessageBar({ message }: Props) {
  if (!message) return null;
  return (
    <View
      className="mx-3 mb-3 rounded-2xl border px-4 py-3"
      style={{
        borderColor: BORDER,
        backgroundColor: SURFACE,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Text numberOfLines={2} className="text-center text-sm font-medium text-zinc-200">
        {message}
      </Text>
    </View>
  );
}
