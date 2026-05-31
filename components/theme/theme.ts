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
};

export const darkTheme: AppTheme = {
  appBg: "#0A0A0C",
  surface: "#141418",
  surfaceAlt: "#1C1C21",
  border: "#2A2A31",
  sectionSurface: "#101014",
  headerSurface: "#0A0A0C",
  brandTint: "rgba(97, 7, 0, 0.28)",
  textPrimary: "#FAFAFA",
  textSecondary: "#A8A8B0",
  textMuted: "#6E6E78",
  textSubtle: "#4A4A52",
  iconGlyph: "#D4D4D8",
  bannerText: "#FAFAFA",
  chipYourTurn: { bg: "#0a2210", border: "#14532d", text: "#86efac" },
  chipPenalty: { bg: "#2A0905", border: "#7A1F12", text: "#F5A8A0" },
  chipShape: { bg: "#0c1828", border: "#1e3a5f", text: "#93c5fd" },
  chipCpu: { bg: "#1C1C21", border: "#2A2A31", text: "#A8A8B0" },
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
};

export const lightTheme: AppTheme = {
  appBg: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceAlt: "#EDEBE8",
  border: "#E0DCD5",
  sectionSurface: "#FFFFFF",
  headerSurface: "#FFFFFF",
  brandTint: "rgba(97, 7, 0, 0.08)",
  textPrimary: "#1A1A1A",
  textSecondary: "#52525B",
  textMuted: "#71717A",
  textSubtle: "#A8A29E",
  iconGlyph: "#3F3F46",
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
};
