/** Brand / card-back red — same in both modes */
export const BRAND = "#6e1018";

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
  messageShadow: string;
  messageShadowOpacity: number;
  panelLift: PanelLift;
  panelLiftSubtle: PanelLift;
};

export const darkTheme: AppTheme = {
  appBg: "#0b0e14",
  surface: "#121722",
  surfaceAlt: "#181f2b",
  border: "#2a3345",
  sectionSurface: "#111620",
  headerSurface: "#0d1118",
  brandTint: "rgba(110, 16, 24, 0.22)",
  textPrimary: "#fafafa",
  textSecondary: "#a1a1aa",
  textMuted: "#71717a",
  textSubtle: "#52525b",
  iconGlyph: "#e4e4e7",
  bannerText: "#f7f2e9",
  chipYourTurn: { bg: "#0c2a14", border: "#166534", text: "#86efac" },
  chipPenalty: { bg: "#3d0a0e", border: "#7f1d1d", text: "#fca5a5" },
  chipShape: { bg: "#0f1f35", border: "#1d3a5c", text: "#93c5fd" },
  chipCpu: { bg: "#181f2b", border: "#252d3b", text: "#a1a1aa" },
  messageShadow: "#000",
  messageShadowOpacity: 0.4,
  panelLift: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },
  panelLiftSubtle: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
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
