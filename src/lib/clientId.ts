import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "naija-whot:client-id:v1";

let cached: string | null = null;

export async function getClientId(): Promise<string> {
  if (cached) return cached;

  try {
    const stored = await AsyncStorage.getItem(KEY);
    if (stored) {
      cached = stored;
      return stored;
    }
  } catch {
    // fall through and generate
  }

  const id = `c-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  cached = id;
  AsyncStorage.setItem(KEY, id).catch(() => {});
  return id;
}
