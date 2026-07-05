import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "naija-whot:stats:v1";

/** All-time round tallies across CPU and multiplayer games. */
export type AllTimeStats = {
  wins: number;
  losses: number;
};

const EMPTY: AllTimeStats = { wins: 0, losses: 0 };

export async function loadStats(): Promise<AllTimeStats> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<AllTimeStats>;
    return {
      wins: typeof parsed.wins === "number" ? parsed.wins : 0,
      losses: typeof parsed.losses === "number" ? parsed.losses : 0,
    };
  } catch {
    return EMPTY;
  }
}

/** Increment a tally and return the new totals. Best-effort persistence. */
export async function recordRound(
  result: "win" | "loss",
): Promise<AllTimeStats> {
  const stats = await loadStats();
  const next: AllTimeStats = {
    wins: stats.wins + (result === "win" ? 1 : 0),
    losses: stats.losses + (result === "loss" ? 1 : 0),
  };
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Next round's write retries from the same baseline.
  }
  return next;
}
