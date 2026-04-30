import { Text, View } from "react-native";
import { BORDER, SURFACE_ALT } from "./theme";

type StatusChipProps = {
  label: string;
  accent?: "default" | "warning";
};

export function StatusChip({ label, accent = "default" }: StatusChipProps) {
  const isWarning = accent === "warning";
  return (
    <View
      className="rounded-full border px-3 py-1.5"
      style={{
        borderColor: isWarning ? "#7a5a1f" : BORDER,
        backgroundColor: SURFACE_ALT,
      }}
    >
      <Text className={`text-xs font-medium ${isWarning ? "text-amber-300" : "text-zinc-300"}`}>{label}</Text>
    </View>
  );
}
