/** Whot brand red — the dominant red from the cards and box.
 *  Drives CTAs, active states, suit icons, and key UI moments. */
export const BRAND = "#610700";

/** Trophy gold — pulled from the box's star and border detailing.
 *  Reserve for rewards, badges, scores, and celebratory states only. */
export const ACCENT_GOLD = "#F5C518";

/* ---------- Mode-invariant tokens ----------
 * These sit either on top of BRAND or on the card paper, so they don't
 * shift between light/dark.
 */
/** Primary text/glyph on a BRAND surface (CTA buttons, card back). */
export const ON_BRAND = "#FFFFFF";
/** Secondary text on a BRAND surface (CTA subtitles). */
export const ON_BRAND_DIM = "rgba(255,255,255,0.75)";
/** Card face background ("paper") — clean white card stock. */
export const CARD_PAPER = "#FFFFFF";
/** Card face background, pressed state. */
export const CARD_PAPER_PRESSED = "#FAF7F4";
/** Ink on the card paper — values, glyphs, titles. */
export const CARD_INK = BRAND;
/** Hairline edge on a paper card. */
export const CARD_EDGE_PAPER = "#1A1A1A1F";
/** Hairline edge on a red card back. */
export const CARD_EDGE_RED = "#FFFFFF24";

/** Tonal ink for decorative type on the card face. Single helper so the
 *  brand RGB stays defined once; callers pick the alpha they need. */
export function inkAlpha(alpha: number): string {
  return `rgba(97, 7, 0, ${alpha})`;
}

/* ---------- Card-table tokens ----------
 * The in-game playing surface. Follows the app theme: deep oxblood felt
 * in dark mode, warm parchment in light mode, with matching ink/accents
 * so the Light/Dark toggle restyles the whole app consistently.
 */
export type TableTheme = {
  /** Table surface. */
  bg: string;
  /** Edge-vignette colour (used by an inset shadow). */
  vignette: string;
  /** Primary text on the table. */
  text: string;
  /** Secondary text on the table. */
  textDim: string;
  /** Tertiary text on the table. */
  textFaint: string;
  /** Ghost control fill (icon buttons) on the table. */
  ghostBg: string;
  /** Quiet status-chip fill. */
  chipBg: string;
  /** Quiet status-chip border. */
  chipBorder: string;
  /** Warning-chip border. */
  chipWarnBorder: string;
  /** Warning-chip text. */
  chipWarnText: string;
  /** "Your turn" label + active-seat dot. */
  turnAccent: string;
  /** Drop shadow for cards resting on the table. */
  cardShadow: string;
};

export const darkTable: TableTheme = {
  bg: "#360C07",
  vignette: "rgba(0,0,0,0.55)",
  text: "#F2E5D4",
  textDim: "rgba(242,229,212,0.62)",
  textFaint: "rgba(242,229,212,0.38)",
  ghostBg: "rgba(255,255,255,0.07)",
  chipBg: "rgba(0,0,0,0.30)",
  chipBorder: "rgba(242,229,212,0.18)",
  chipWarnBorder: "rgba(245,197,24,0.55)",
  chipWarnText: ACCENT_GOLD,
  turnAccent: ACCENT_GOLD,
  cardShadow: "0 6px 14px rgba(0,0,0,0.42)",
};

export const lightTable: TableTheme = {
  bg: "#EFE3D3",
  vignette: "rgba(97,7,0,0.10)",
  text: "#43201A",
  textDim: "rgba(67,32,26,0.68)",
  textFaint: "rgba(67,32,26,0.45)",
  ghostBg: "rgba(97,7,0,0.07)",
  chipBg: "rgba(255,255,255,0.55)",
  chipBorder: "rgba(97,7,0,0.25)",
  chipWarnBorder: "rgba(138,100,0,0.55)",
  chipWarnText: "#8A6400",
  turnAccent: "#8A6400",
  cardShadow: "0 5px 12px rgba(60,20,10,0.25)",
};

export type ChipColors = { bg: string; border: string; text: string };

/** iOS shadow + Android elevation for lifted panels */
export type PanelLift = {
  shadowColor: string;
  shadowOffset: Readonly<{ width: number; height: number }>;
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export type AppTheme = {
  appBg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  /** Raised panels (section cards) */
  sectionSurface: string;
  headerSurface: string;
  /** Soft brand wash for primary CTAs (e.g. shape picker) */
  brandTint: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textSubtle: string;
  iconGlyph: string;
  bannerText: string;
  chipYourTurn: ChipColors;
  chipPenalty: ChipColors;
  chipShape: ChipColors;
  chipCpu: ChipColors;
  /** Positive accent (round won, "connected" dot). Mode-aware. */
  success: string;
  /** Negative accent (errors, disconnect). Mode-aware. */
  danger: string;
  /** Border colour for the "live" section (whose turn it is). Mode-aware
   *  because deep BRAND vanishes against dark surfaces. */
  activeBorder: string;
  /** Label colour for the "live" section. Decoupled from activeBorder so
   *  dark mode can lift the border without dimming the label text. */
  activeLabel: string;
  messageBoxShadow: string;
  panelLift: PanelLift;
  panelLiftSubtle: PanelLift;
  /** In-game playing-surface palette. */
  table: TableTheme;
};

export const darkTheme: AppTheme = {
  appBg: "#120705",
  surface: "#1D130F",
  surfaceAlt: "#271B16",
  border: "#3B2C25",
  sectionSurface: "#170D0A",
  headerSurface: "#140906",
  brandTint: "rgba(97, 7, 0, 0.28)",
  textPrimary: "#F6EFE8",
  textSecondary: "#B7A89E",
  textMuted: "#7E6F66",
  textSubtle: "#55473F",
  iconGlyph: "#DED3C9",
  bannerText: "#F6EFE8",
  chipYourTurn: { bg: "#0a2210", border: "#14532d", text: "#86efac" },
  chipPenalty: { bg: "#2A0905", border: "#7A1F12", text: "#F5A8A0" },
  chipShape: { bg: "#0c1828", border: "#1e3a5f", text: "#93c5fd" },
  chipCpu: { bg: "#271B16", border: "#3B2C25", text: "#B7A89E" },
  success: "#34d399",
  danger: "#F87171",
  activeBorder: "#5C5C68",
  activeLabel: "#FAFAFA",
  messageBoxShadow: "0 -2px 8px rgba(0,0,0,0.5)",
  panelLift: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  panelLiftSubtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  table: darkTable,
};

export const lightTheme: AppTheme = {
  appBg: "#FAF5EE",
  surface: "#FFFFFF",
  surfaceAlt: "#EFE7DC",
  border: "#E2D7C8",
  sectionSurface: "#FFFFFF",
  headerSurface: "#FFFFFF",
  brandTint: "rgba(97, 7, 0, 0.08)",
  textPrimary: "#241611",
  textSecondary: "#5C4C43",
  textMuted: "#7E6E64",
  textSubtle: "#AC9C8F",
  iconGlyph: "#4A392F",
  bannerText: "#1A1A1A",
  chipYourTurn: { bg: "#ecfdf5", border: "#6ee7b7", text: "#047857" },
  chipPenalty: { bg: "#FBE9E6", border: "#D9978F", text: "#610700" },
  chipShape: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
  chipCpu: { bg: "#EDEBE8", border: "#D4CFC6", text: "#71717A" },
  success: "#047857",
  danger: "#610700",
  activeBorder: BRAND,
  activeLabel: BRAND,
  messageBoxShadow: "0 -2px 8px rgba(26,26,26,0.10)",
  panelLift: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  panelLiftSubtle: {
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  table: lightTable,
};
