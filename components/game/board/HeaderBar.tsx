import { Text, View, useWindowDimensions } from "react-native";
import { IconButton } from "../../ui/IconButton";
import { Font } from "../../theme/fonts";
import { useAppTheme } from "../../theme/ThemeContext";

type HeaderBarProps = {
  onRestart: () => void;
  onSettings: () => void;
  /** Stacked screens (multiplayer): shows a back arrow. */
  onBack?: () => void;
  /** Root game screen: shows a menu icon instead of back. */
  onMenu?: () => void;
  /** Opens the how-to-play rules. */
  onHelp?: () => void;
  /** Multiplayer/host only: closes the room for both players. */
  onEndGame?: () => void;
};

/** Room the true-centered wordmark needs (text ~85pt + breathing space). */
const WORDMARK_CLEARANCE = 116;

/** Slim, transparent control strip along the top of the table. */
export function HeaderBar({
  onRestart,
  onSettings,
  onBack,
  onMenu,
  onHelp,
  onEndGame,
}: HeaderBarProps) {
  const { table } = useAppTheme();
  const { width } = useWindowDimensions();

  // The wordmark sits at the true screen centre, so it collides with the
  // wider icon cluster on narrow phones (e.g. multiplayer host: 4 icons).
  // Show it only when the middle is actually clear.
  const rightCount = 2 + (onHelp ? 1 : 0) + (onEndGame ? 1 : 0);
  const rightWidth = rightCount * 40 + (rightCount - 1) * 10 + 16;
  const clusterWidth = Math.max(56, rightWidth);
  const showWordmark = width - 2 * clusterWidth >= WORDMARK_CLEARANCE;

  return (
    <View className="flex-row items-center justify-between px-4 pt-1">
      {showWordmark ? (
        <View
          pointerEvents="none"
          className="absolute inset-x-0 items-center justify-center"
          style={{ top: 0, bottom: 0 }}
        >
          <Text
            style={{
              fontFamily: Font.display.bold,
              fontSize: 17,
              letterSpacing: 3.5,
              color: table.textDim,
            }}
          >
            WHOT
          </Text>
        </View>
      ) : null}

      {onMenu ? (
        <IconButton name="menu" onPress={onMenu} tone="felt" />
      ) : (
        <IconButton name="arrow-left" onPress={onBack} tone="felt" />
      )}

      <View className="flex-row gap-2.5">
        {onHelp ? (
          <IconButton name="help-circle" onPress={onHelp} tone="felt" />
        ) : null}
        <IconButton name="settings" onPress={onSettings} tone="felt" />
        <IconButton name="rotate-cw" onPress={onRestart} tone="felt" />
        {onEndGame ? (
          <IconButton name="x-circle" onPress={onEndGame} tone="felt" />
        ) : null}
      </View>
    </View>
  );
}
