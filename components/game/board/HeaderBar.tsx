import { Text, View } from "react-native";
import { IconButton } from "../../ui/IconButton";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";

type HeaderBarProps = {
  onRestart: () => void;
  onSettings: () => void;
  onBack: () => void;
  /** Multiplayer/host only: closes the room for both players. */
  onEndGame?: () => void;
};

export function HeaderBar({
  onRestart,
  onSettings,
  onBack,
  onEndGame,
}: HeaderBarProps) {
  const theme = useAppTheme();
  const wordmarkFont = { fontFamily: Font.display.bold } as const;
  const subtitleFont = { fontFamily: Font.ui.regular } as const;

  return (
    <View
      className="rounded-3xl border px-4 py-3.5"
      style={{
        borderColor: theme.border,
        backgroundColor: theme.headerSurface,
        ...theme.panelLift,
      }}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View className="min-w-0 flex-1 pr-2">
          <Text
            style={[
              wordmarkFont,
              { fontSize: 18, color: theme.textPrimary, letterSpacing: 1.2 },
            ]}
            numberOfLines={1}
          >
            Naija Whot
          </Text>
          <Text
            style={[
              subtitleFont,
              {
                marginTop: 2,
                fontSize: 10,
                color: theme.textMuted,
                letterSpacing: 0.6,
              },
            ]}
            numberOfLines={1}
          >
            Single deck · no stress
          </Text>
        </View>

        <View className="flex-row gap-2">
          <IconButton name="arrow-left" onPress={onBack} />
          <IconButton name="settings" onPress={onSettings} />
          <IconButton name="rotate-cw" onPress={onRestart} />
          {onEndGame ? <IconButton name="x-circle" onPress={onEndGame} /> : null}
        </View>
      </View>
    </View>
  );
}
