import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useAppTheme } from "../../theme/ThemeContext";

/**
 * Full-bleed card-table surface for the in-game screens. A deep felt in
 * dark mode, warm parchment in light mode, with a soft edge vignette so
 * the board reads as a physical table rather than a panel.
 */
export function TableSurface({ children }: { children: ReactNode }) {
  const { table } = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: table.bg }}>
      {/* Vignette sits under the content so it never intercepts touches. */}
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          { boxShadow: `inset 0 0 160px ${table.vignette}` },
        ]}
      />
      {children}
    </View>
  );
}
