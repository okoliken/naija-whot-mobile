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
      className="rounded-2xl border px-4 py-3.5"
      style={{ borderColor: theme.border, backgroundColor: theme.sectionSurface }}
    >
      {children}
    </View>
  );
}
