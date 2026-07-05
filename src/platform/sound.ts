import { createAudioPlayer, type AudioPlayer } from "expo-audio";

/**
 * Fire-and-forget table sounds. Players are created lazily and reused;
 * every call is best-effort — a missing native module or interrupted
 * session should never take the game down.
 */

const SOURCES = {
  /** Card landing on the discard pile. */
  play: require("../../assets/sounds/card-play.wav"),
  /** Drawing from the market / a card arriving in hand. */
  draw: require("../../assets/sounds/card-draw.wav"),
  /** Round won. */
  win: require("../../assets/sounds/win.wav"),
  /** Round lost. */
  lose: require("../../assets/sounds/lose.wav"),
} as const;

export type SoundName = keyof typeof SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};

export function playSound(name: SoundName): void {
  try {
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]);
      players[name] = p;
    }
    p.seekTo(0);
    p.play();
  } catch {
    // Sound is garnish — never let it break a turn.
  }
}
