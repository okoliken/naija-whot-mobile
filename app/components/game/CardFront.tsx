import { Text, View } from "react-native";
import { SHAPE_LABELS, type Card } from "@/src/store/gameStore";
import { cn } from "@/src/lib/cn";
import { CARD_SIZE } from "./cardTokens";

const SHAPE_GLYPH: Record<string, string> = {
  circle: "●",
  triangle: "▲",
  cross: "✚",
  star: "★",
  square: "■",
  whot: "W",
};

const CENTER_GLYPH_CLASS: Record<Card["shape"], string> = {
  circle: "text-[44px]",
  triangle: "text-[50px]",
  cross: "text-[42px]",
  star: "text-[46px]",
  square: "text-[42px]",
  whot: "text-[40px]",
};

const CORNER_GLYPH_CLASS: Record<Card["shape"], string> = {
  circle: "text-[12px]",
  triangle: "text-[12px]",
  cross: "text-[11px]",
  star: "text-[12px]",
  square: "text-[11px]",
  whot: "text-[10px]",
};

function renderCardTitle(card: Card): string {
  if (card.value === 20) return "Whot";
  if (card.value === 14) return "General Market";
  if (card.value === 8) return "Suspension";
  if (card.value === 5) return "Pick Three";
  if (card.value === 2) return "Pick Two";
  if (card.value === 1) return "Hold On";
  return SHAPE_LABELS[card.shape];
}

type CardFrontProps = {
  card: Card;
  rotated?: string;
};

export function CardFront({ card, rotated }: CardFrontProps) {
  const glyph = SHAPE_GLYPH[card.shape] ?? "•";
  const title = renderCardTitle(card).toUpperCase();
  const isWhot = card.value === 20;
  const cornerValueClass = isWhot ? "text-[26px]" : "text-[24px]";
  const fontRegular = { fontFamily: "Inter_400Regular" } as const;
  const fontSemiBold = { fontFamily: "Inter_600SemiBold" } as const;
  const fontBold = { fontFamily: "Inter_700Bold" } as const;

  return (
    <View
      className={cn(
        `${CARD_SIZE} overflow-hidden rounded-lg border border-[#00000022] bg-[#f7f2e9] px-2.5 py-2`,
        card.value === 14 && "border-[#6e1018]",
        rotated,
      )}
    >
      <View className="flex-1">
        <View className="absolute left-1 top-1">
          <Text style={fontBold} className={cn("font-serif leading-none text-[#6e1018]", cornerValueClass)}>
            {card.value}
          </Text>
          <Text
            style={fontSemiBold}
            className={cn("font-serif leading-none text-[#6e1018]", CORNER_GLYPH_CLASS[card.shape])}
          >
            {glyph}
          </Text>
        </View>

        <View className="absolute bottom-1 right-1 items-end" style={{ transform: [{ rotate: "180deg" }] }}>
          <Text style={fontBold} className={cn("font-serif leading-none text-[#6e1018]", cornerValueClass)}>
            {card.value}
          </Text>
          <Text
            style={fontSemiBold}
            className={cn("font-serif leading-none text-[#6e1018]", CORNER_GLYPH_CLASS[card.shape])}
          >
            {glyph}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          {isWhot ? (
            <View className="items-center">
              <Text style={fontSemiBold} className="font-serif text-[10px] tracking-[1px] text-[#6e1018]">
                WHOT
              </Text>
              <Text style={fontBold} className="font-serif text-[32px] leading-none text-[#6e1018]">
                Whot
              </Text>
              <Text style={fontRegular} className="mt-0.5 font-serif text-[7px] tracking-[0.4px] text-[#6e1018]/85">
                A GAME FOR
              </Text>
              <Text style={fontRegular} className="font-serif text-[7px] tracking-[0.4px] text-[#6e1018]/85">
                EVERYONE
              </Text>
            </View>
          ) : (
            <Text
              style={fontBold}
              className={cn("font-serif leading-none text-[#6e1018]", CENTER_GLYPH_CLASS[card.shape])}
            >
              {glyph}
            </Text>
          )}
        </View>

        {!isWhot ? (
          <View className="absolute bottom-1 left-0">
            <Text style={fontRegular} className="text-[8px] font-serif tracking-wide text-[#6e1018]/80">
              {title}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
