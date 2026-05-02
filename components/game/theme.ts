/** Brand / card-back red — same in both modes */
export const BRAND = "#6e1018";

export type ChipColors = { bg: string; border: string; text: string };

export type AppTheme = {
  appBg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  /** Raised panels (section cards) */
  sectionSurface: string;
  headerSurface: string;
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
};

export const darkTheme: AppTheme = {
  appBg: "#0b0e14",
  surface: "#121722",
  surfaceAlt: "#181f2b",
  border: "#252d3b",
  sectionSurface: "#10151e",
  headerSurface: "#0b0e14",
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
};

export const lightTheme: AppTheme = {
  appBg: "#f2efe8",
  surface: "#fffcf7",
  surfaceAlt: "#ebe6dc",
  border: "#d4cec3",
  sectionSurface: "#fffcf8",
  headerSurface: "#faf7f2",
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
};
