import AsyncStorage from "@react-native-async-storage/async-storage";

const SEEN_INTRO_KEY = "naija-whot:seen-intro:v1";

export async function hasSeenIntro(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(SEEN_INTRO_KEY);
    return value === "1";
  } catch {
    return false;
  }
}

export async function markIntroSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_INTRO_KEY, "1");
  } catch {
    // best-effort; modal can re-prompt next launch
  }
}
