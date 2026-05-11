import { Text, View } from "react-native";
import { cn } from "@/src/lib/cn";
import { Font } from "../../theme/fonts";
import { CARD_SIZE, CARD_SIZE_COMPACT } from "./cardTokens";

type CardBackProps = {
  count?: number;
  hint?: string;
  rotated?: string;
  compact?: boolean;
};

export function CardBack({
  count,
  hint,
  rotated,
  compact = false,
}: CardBackProps) {
  const fontRegular = { fontFamily: Font.card.regular } as const;
  const fontBold = { fontFamily: Font.card.bold } as const;
  const fontMark = { fontFamily: Font.display.bold } as const;

  return (
    <View
      className={cn(
        compact ? CARD_SIZE_COMPACT : CARD_SIZE,
        "rounded-lg border border-[#ffffff24] bg-[#6e1018] p-1.5",
        rotated,
      )}
    >
      <View className="flex-1 items-center justify-center rounded-xl border border-dashed border-white/45">
        <Text
          style={[
            fontMark,
            { fontSize: 15, letterSpacing: 2.2, color: "#fafaf9" },
          ]}
          numberOfLines={1}
        >
          WHOT
        </Text>
        {typeof count === "number" ? (
          <>
            <Text
              style={fontBold}
              className="mt-1.5 text-3xl leading-none text-zinc-100"
            >
              {count}
            </Text>
            <Text
              style={fontRegular}
              className="mt-1 text-center text-[9px] uppercase tracking-[1px] text-zinc-100/80"
            >
              {hint ?? "Market"}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}
