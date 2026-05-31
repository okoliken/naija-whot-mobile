import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import {
  loadThemeMode,
  saveThemeMode,
  type ThemeMode,
} from "@/src/platform/storage/themePreference";
import { darkTheme, lightTheme, type AppTheme } from "./theme";

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: darkTheme,
  mode: "dark",
  setMode: () => {},
  toggleMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(
    scheme === "light" ? "light" : "dark",
  );

  useEffect(() => {
    let cancelled = false;
    loadThemeMode().then((stored) => {
      if (!cancelled && stored) setModeState(stored);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    saveThemeMode(next);
  };

  const toggleMode = () => {
    setModeState((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      saveThemeMode(next);
      return next;
    });
  };

  const value: ThemeContextValue = {
    theme: mode === "light" ? lightTheme : darkTheme,
    mode,
    setMode,
    toggleMode,
  };

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useAppTheme(): AppTheme {
  return use(ThemeContext).theme;
}

export function useThemeMode() {
  const { mode, setMode, toggleMode } = use(ThemeContext);
  return { mode, setMode, toggleMode };
}
