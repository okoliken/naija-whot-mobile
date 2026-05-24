import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Seat } from "./roomTypes";

const LAST_ROOM_KEY = "naija-whot:last-room:v1";

export type LastRoom = { code: string; seat: Seat };

/**
 * Remembers the room the user was last in so the lobby can offer a
 * one-tap "Rejoin" path after a soft leave. Cleared when the room ends
 * or is found to be missing.
 */
export async function getLastRoom(): Promise<LastRoom | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_ROOM_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastRoom>;
    if (
      typeof parsed.code !== "string" ||
      (parsed.seat !== "host" && parsed.seat !== "guest")
    ) {
      return null;
    }
    return { code: parsed.code, seat: parsed.seat };
  } catch {
    return null;
  }
}

export async function setLastRoom(room: LastRoom): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_ROOM_KEY, JSON.stringify(room));
  } catch {
    // best-effort
  }
}

export async function clearLastRoom(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LAST_ROOM_KEY);
  } catch {
    // best-effort
  }
}
