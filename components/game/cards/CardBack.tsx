import { Text, View } from "react-native";
import { cn } from "@/src/platform/cn";
import { Font } from "../../theme/fonts";
import {
  BRAND,
  CARD_EDGE_RED,
  ON_BRAND,
  ON_BRAND_DIM,
} from "../../theme/theme";
import { CARD_SIZE, CARD_SIZE_COMPACT, CARD_SIZE_MINI } from "./cardTokens";

type CardBackProps = {
  count?: number;
  hint?: string;
  rotated?: string;
  size?: "full" | "compact" | "mini";
};

const SIZE_CLASS = {
  full: CARD_SIZE,
  compact: CARD_SIZE_COMPACT,
  mini: CARD_SIZE_MINI,
} as const;

export function CardBack({ count, hint, rotated, size = "full" }: CardBackProps) {
  const fontRegular = { fontFamily: Font.card.regular } as const;
  const fontBold = { fontFamily: Font.card.bold } as const;
  const fontMark = { fontFamily: Font.display.bold } as const;
  const mini = size === "mini";

  return (
    <View
      className={cn(SIZE_CLASS[size], "rounded-lg", mini ? "p-1" : "p-1.5", rotated)}
      style={{
        backgroundColor: BRAND,
        borderWidth: 1,
        borderColor: CARD_EDGE_RED,
      }}
    >
      <View
        className={cn(
          "flex-1 items-center justify-center rounded-md border",
        )}
        style={{ borderColor: CARD_EDGE_RED }}
      >
        {mini ? (
          <Text
            style={[fontMark, { fontSize: 10, letterSpacing: 1.6, color: ON_BRAND }]}
            numberOfLines={1}
          >
            WHOT
          </Text>
        ) : (
          <>
            <Text
              style={[
                fontMark,
                { fontSize: 15, letterSpacing: 2.2, color: ON_BRAND },
              ]}
              numberOfLines={1}
            >
              WHOT
            </Text>
            {typeof count === "number" ? (
              <>
                <Text
                  style={[fontBold, { color: ON_BRAND }]}
                  className="mt-1.5 text-3xl leading-none"
                >
                  {count}
                </Text>
                <Text
                  style={[fontRegular, { color: ON_BRAND_DIM }]}
                  className="mt-1 text-center text-[9px] uppercase tracking-[1px]"
                >
                  {hint ?? "Market"}
                </Text>
              </>
            ) : (
              <Text style={[fontBold, { fontSize: 12, color: ON_BRAND_DIM, marginTop: 4 }]}>
                ★
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}
