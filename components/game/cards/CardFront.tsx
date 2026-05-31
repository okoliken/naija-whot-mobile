import { Text, View } from "react-native";
import { type Card } from "@/src/game/gameStore";
import { cn } from "@/src/platform/cn";
import { Font } from "../../theme/fonts";
import {
  CARD_EDGE_PAPER,
  CARD_INK,
  CARD_PAPER,
  inkAlpha,
} from "../../theme/theme";
import { CARD_SIZE } from "./cardTokens";
import {
  CENTER_GLYPH_CLASS,
  CORNER_GLYPH_CLASS,
  renderCardTitle,
  SHAPE_GLYPH,
} from "./cardGlyphs";

type CardFrontProps = {
  card: Card;
  rotated?: string;
};

export function CardFront({ card, rotated }: CardFrontProps) {
  const glyph = SHAPE_GLYPH[card.shape] ?? "•";
  const title = renderCardTitle(card).toUpperCase();
  const isWhot = card.value === 20;
  const cornerValueClass = isWhot ? "text-[26px]" : "text-[24px]";
  const fontReg = { fontFamily: Font.card.regular } as const;
  const fontBold = { fontFamily: Font.card.bold } as const;
  const fontDisplay = { fontFamily: Font.card.displayItalic } as const;

  const inkStyle = { color: CARD_INK } as const;
  // Faux-heavier weight for corner values — Cormorant tops out at 700 in
  // the loaded font set, so we thicken the strokes with a half-pixel
  // same-color text shadow.
  const cornerValueStyle = {
    color: CARD_INK,
    textShadowColor: CARD_INK,
    textShadowOffset: { width: 0.6, height: 0 },
    textShadowRadius: 0.6,
  } as const;

  return (
    <View
      className={cn(`${CARD_SIZE} overflow-hidden rounded-lg px-2.5 py-2`, rotated)}
      style={{
        backgroundColor: CARD_PAPER,
        borderWidth: 1,
        borderColor: card.value === 14 ? CARD_INK : CARD_EDGE_PAPER,
      }}
    >
      <View className="flex-1">
        <View className="absolute left-1 top-1">
          <Text style={[fontBold, cornerValueStyle]} className={cn("leading-none", cornerValueClass)}>
            {card.value}
          </Text>
          <Text
            style={[fontBold, inkStyle]}
            className={cn("leading-none", CORNER_GLYPH_CLASS[card.shape])}
          >
            {glyph}
          </Text>
        </View>

        <View className="absolute bottom-1 right-1 items-end" style={{ transform: [{ rotate: "180deg" }] }}>
          <Text style={[fontBold, cornerValueStyle]} className={cn("leading-none", cornerValueClass)}>
            {card.value}
          </Text>
          <Text
            style={[fontBold, inkStyle]}
            className={cn("leading-none", CORNER_GLYPH_CLASS[card.shape])}
          >
            {glyph}
          </Text>
        </View>

        <View className="flex-1 items-center justify-center">
          {isWhot ? (
            <View className="items-center gap-0.5">
              <View className="flex-row gap-1">
                {["●", "▲", "■", "✚", "★"].map((g) => (
                  <Text key={g} style={[fontBold, { color: inkAlpha(0.35) }]} className="text-[8px]">
                    {g}
                  </Text>
                ))}
              </View>
              <Text style={[fontDisplay, inkStyle]} className="text-[46px] leading-none">
                Whot
              </Text>
              <Text style={[fontBold, { color: inkAlpha(0.55) }]} className="text-[7px] tracking-[2px]">
                W H O T
              </Text>
              <Text style={[fontReg, { color: inkAlpha(0.45) }]} className="mt-0.5 text-center text-[6px] tracking-[0.5px]">
                A GAME FOR EVERYONE
              </Text>
            </View>
          ) : (
            <Text
              style={[fontBold, inkStyle]}
              className={cn("leading-none", CENTER_GLYPH_CLASS[card.shape])}
            >
              {glyph}
            </Text>
          )}
        </View>

        {!isWhot ? (
          <View className="absolute bottom-1 left-0">
            <Text style={[fontReg, { color: inkAlpha(0.8) }]} className="text-[8px] tracking-wide">
              {title}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
