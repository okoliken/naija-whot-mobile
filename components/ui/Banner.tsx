import { Pressable, Text, View } from "react-native";

import { Font } from "../theme/fonts";
import { BRAND, ON_BRAND } from "../theme/theme";
import { useAppTheme } from "../theme/ThemeContext";

export type BannerTone = "danger" | "brand" | "neutral";

type BannerAction = {
  label: string;
  onPress: () => void;
};

type BannerProps = {
  tone: BannerTone;
  message: string;
  /** Show a colored leading dot. Defaults to true. */
  showDot?: boolean;
  /** Optional trailing action button (e.g. dismiss). */
  action?: BannerAction;
};

export function Banner({
  tone,
  message,
  showDot = true,
  action,
}: BannerProps) {
  const theme = useAppTheme();

  const tokens =
    tone === "danger"
      ? {
          bg: theme.danger + "22",
          border: theme.danger + "55",
          text: theme.danger,
          dot: theme.danger,
          fontFamily: Font.ui.semi,
        }
      : tone === "brand"
        ? {
            bg: theme.brandTint,
            border: BRAND + "55",
            text: theme.bannerText,
            dot: theme.bannerText,
            fontFamily: Font.ui.semi,
          }
        : {
            bg: theme.surfaceAlt,
            border: theme.border,
            text: theme.textSecondary,
            dot: theme.textMuted,
            fontFamily: Font.ui.regular,
          };

  return (
    <View
      className="flex-row items-center gap-2.5 rounded-xl border px-3.5 py-2.5"
      style={{ backgroundColor: tokens.bg, borderColor: tokens.border }}
    >
      {showDot ? (
        <View
          className="size-2 rounded-full"
          style={{ backgroundColor: tokens.dot }}
        />
      ) : null}
      <Text
        className="flex-1 text-[12.5px] leading-[17px]"
        style={{ fontFamily: tokens.fontFamily, color: tokens.text }}
      >
        {message}
      </Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          hitSlop={10}
          className="rounded-lg px-2.5 py-1 active:opacity-85"
          style={{ backgroundColor: BRAND }}
        >
          <Text
            className="text-[11px] tracking-[1.2px]"
            style={{ fontFamily: Font.ui.bold, color: ON_BRAND }}
          >
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
