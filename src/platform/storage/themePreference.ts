import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "naija-whot:theme-mode:v1";

export type ThemeMode = "light" | "dark";

export async function loadThemeMode(): Promise<ThemeMode | null> {
  try {
    const v = await AsyncStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, mode);
  } catch {
    // best-effort; falls back to system on next launch
  }
}
