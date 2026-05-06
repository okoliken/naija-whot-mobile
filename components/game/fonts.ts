/**
 * Inter: UI body, chips, controls.
 * Cinzel: game branding — titles, modals, section headers.
 * Cormorant: playing card faces (paper/ink).
 */
export const Font = {
  ui: {
    regular: "Inter_400Regular",
    semi: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  /** Roman display — board / card-table feel */
  display: {
    regular: "Cinzel_400Regular",
    bold: "Cinzel_700Bold",
  },
  card: {
    regular: "CormorantGaramond_400Regular",
    bold: "CormorantGaramond_700Bold",
    displayItalic: "CormorantGaramond_700Bold_Italic",
  },
} as const;
