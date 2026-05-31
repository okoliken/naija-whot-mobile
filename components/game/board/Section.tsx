import { type ReactNode } from "react";
import { View } from "react-native";

import { useAppTheme } from "../../theme/ThemeContext";

type SectionProps = {
  children: ReactNode;
  /** When true, the section reads as the "live" surface — crimson hairline
   *  border replaces the neutral one. Used to mark whose turn it is. */
  active?: boolean;
};

export function Section({ children, active = false }: SectionProps) {
  const theme = useAppTheme();
  return (
    <View
      className="rounded-3xl border p-4"
      style={{
        borderColor: active ? theme.activeBorder : theme.border,
        backgroundColor: theme.sectionSurface,
        ...theme.panelLift,
      }}
    >
      {children}
    </View>
  );
}
