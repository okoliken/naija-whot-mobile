import * as Haptics from "expo-haptics";

/** Card play, shape confirm, or other solid game action */
export function hapticsImpactMedium() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
}

/** Draw from market */
export function hapticsImpactLight() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** Illegal move or must-defend */
export function hapticsInvalidMove() {
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Warning,
  ).catch(() => {});
}

export function hapticsRoundWon() {
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Success,
  ).catch(() => {});
}

export function hapticsRoundLost() {
  void Haptics.notificationAsync(
    Haptics.NotificationFeedbackType.Warning,
  ).catch(() => {});
}

/** Turn handed back to the human after CPU action */
export function hapticsTurnHandoff() {
  void Haptics.selectionAsync().catch(() => {});
}
