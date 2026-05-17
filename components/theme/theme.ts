/** Brand / card-back red — same in both modes */
export const BRAND = "#6e1018";

/* ---------- Mode-invariant tokens ----------
 * These sit either on top of BRAND or on the card paper, so they don't
 * shift between light/dark.
 */
/** Primary text/glyph on a BRAND surface (CTA buttons, card back). */
export const ON_BRAND = "#fafafa";
/** Secondary text on a BRAND surface (CTA subtitles). */
export const ON_BRAND_DIM = "rgba(250,250,250,0.7)";
/** Card face background ("paper"). */
export const CARD_PAPER = "#f7f2e9";
/** Card face background, pressed state. */
export const CARD_PAPER_PRESSED = "#e8e2d8";
/** Ink on the card paper — values, glyphs, titles. */
export const CARD_INK = BRAND;
/** Hairline edge on a paper card. */
export const CARD_EDGE_PAPER = "#00000022";
/** Hairline edge on a red card back. */
export const CARD_EDGE_RED = "#ffffff24";

/** Tonal ink for decorative type on the card face. Single helper so the
 *  brand RGB stays defined once; callers pick the alpha they need. */
export function inkAlpha(alpha: number): string {
  return `rgba(110, 16, 24, ${alpha})`;
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
  messageShadow: string;
  messageShadowOpacity: number;
  panelLift: PanelLift;
  panelLiftSubtle: PanelLift;
};

export const darkTheme: AppTheme = {
  appBg: "#050507",
  surface: "#0c0c10",
  surfaceAlt: "#131319",
  border: "#222229",
  sectionSurface: "#0a0a0e",
  headerSurface: "#070709",
  brandTint: "rgba(110, 16, 24, 0.20)",
  textPrimary: "#f4f4f5",
  textSecondary: "#9b9ba3",
  textMuted: "#65656d",
  textSubtle: "#48484f",
  iconGlyph: "#d4d4d8",
  bannerText: "#f7f2e9",
  chipYourTurn: { bg: "#0a2210", border: "#14532d", text: "#86efac" },
  chipPenalty: { bg: "#2d080c", border: "#7f1d1d", text: "#fca5a5" },
  chipShape: { bg: "#0c1828", border: "#1e3a5f", text: "#93c5fd" },
  chipCpu: { bg: "#131319", border: "#22222a", text: "#9b9ba3" },
  success: "#34d399",
  danger: "#f87171",
  messageShadow: "#000",
  messageShadowOpacity: 0.5,
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
  appBg: "#ede9e0",
  surface: "#fffcf7",
  surfaceAlt: "#e8e3d8",
  border: "#c9c2b5",
  sectionSurface: "#fffefb",
  headerSurface: "#faf6ef",
  brandTint: "rgba(110, 16, 24, 0.09)",
  textPrimary: "#18181b",
  textSecondary: "#52525b",
  textMuted: "#71717a",
  textSubtle: "#a1a1aa",
  iconGlyph: "#3f3f46",
  bannerText: "#3f2929",
  chipYourTurn: { bg: "#ecfdf5", border: "#6ee7b7", text: "#047857" },
  chipPenalty: { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c" },
  chipShape: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },
  chipCpu: { bg: "#ebe6dc", border: "#d4cec3", text: "#71717a" },
  success: "#047857",
  danger: "#b91c1c",
  messageShadow: "#18181b",
  messageShadowOpacity: 0.12,
  panelLift: {
    shadowColor: "#292524",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  panelLiftSubtle: {
    shadowColor: "#292524",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};
