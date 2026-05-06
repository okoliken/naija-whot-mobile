import { type ReactNode } from "react";
import { View } from "react-native";

import { useAppTheme } from "./ThemeContext";

type SectionProps = {
  children: ReactNode;
};

export function Section({ children }: SectionProps) {
  const theme = useAppTheme();
  return (
    <View
      className="rounded-3xl border px-4 py-4"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.sectionSurface,
        ...theme.panelLift,
      }}
    >
      {children}
    </View>
  );
}
