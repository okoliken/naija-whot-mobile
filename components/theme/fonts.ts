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

/**
 * Pre-built `{ fontFamily }` style objects keyed off `Font`. Use these in
 * `style={[FontStyle.ui.bold, { fontSize: 14 }]}` to avoid re-declaring the
 * same `{ fontFamily: ... } as const` boilerplate in every component.
 */
export const FontStyle = {
  ui: {
    regular: { fontFamily: Font.ui.regular },
    semi: { fontFamily: Font.ui.semi },
    bold: { fontFamily: Font.ui.bold },
  },
  display: {
    regular: { fontFamily: Font.display.regular },
    bold: { fontFamily: Font.display.bold },
  },
  card: {
    regular: { fontFamily: Font.card.regular },
    bold: { fontFamily: Font.card.bold },
    displayItalic: { fontFamily: Font.card.displayItalic },
  },
} as const;
