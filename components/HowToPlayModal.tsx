import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { useCallback, useRef, type RefObject } from "react";
import { Pressable, Text, View } from "react-native";

import { BRAND } from "./theme/theme";
import { Font } from "./theme/fonts";
import { useAppTheme } from "./theme/ThemeContext";

type Props = {
  onDismiss?: () => void;
  ref?: RefObject<BottomSheetModal | null>;
};

type SpecialCard = {
  value: string;
  name: string;
  effect: string;
};

const SPECIAL_CARDS: SpecialCard[] = [
  {
    value: "1",
    name: "Hold On",
    effect: "You play again — opponent loses their turn.",
  },
  {
    value: "2",
    name: "Pick Two",
    effect: "Next player draws 2 cards, unless they answer with a 2.",
  },
  {
    value: "5",
    name: "Pick Three",
    effect: "Next player draws 3 cards, unless they answer with a 5.",
  },
  { value: "8", name: "Suspension", effect: "Skip the next player's turn." },
  {
    value: "14",
    name: "General Market",
    effect: "Everyone else draws 1 card, unless they answer with a 14.",
  },
  {
    value: "20",
    name: "Whot (Crown)",
    effect: "Wild card — request any shape for the next play.",
  },
];

export function HowToPlayModal({ onDismiss, ref }: Props) {
  const theme = useAppTheme();
  const internalRef = useRef<BottomSheetModal>(null);
  const sheetRef = ref ?? internalRef;

  const fontDisplay = { fontFamily: Font.display.bold } as const;
  const fontBold = { fontFamily: Font.ui.bold } as const;
  const fontSemi = { fontFamily: Font.ui.semi } as const;
  const fontReg = { fontFamily: Font.ui.regular } as const;

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.75}
      />
    ),
    [],
  );

  const handleClose = useCallback(() => {
    sheetRef.current?.dismiss();
    onDismiss?.();
  }, [onDismiss, sheetRef]);

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["88%"]}
      enableDynamicSizing={false}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{
        backgroundColor: theme.border,
        width: 36,
        height: 3,
      }}
      onDismiss={onDismiss}
    >
      <View
        style={{
          backgroundColor: theme.surface,
          paddingHorizontal: 24,
          paddingTop: 4,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Text
          style={[
            fontDisplay,
            {
              textAlign: "center",
              fontSize: 26,
              lineHeight: 30,
              letterSpacing: 0.8,
              color: theme.textPrimary,
            },
          ]}
        >
          How to play
        </Text>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: 32,
          paddingTop: 20,
          paddingHorizontal: 24,
        }}
      >
        {/* Goal */}
        <Text
          style={[
            fontSemi,
            { marginBottom: 8, fontSize: 13, color: theme.textSecondary },
          ]}
        >
          The goal
        </Text>
        <View
          className="mb-6 rounded-2xl px-4 py-4"
          style={{
            backgroundColor: theme.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text
            style={[
              fontReg,
              { fontSize: 14, lineHeight: 21, color: theme.textSecondary },
            ]}
          >
            Be the first to empty your hand. Each turn, play one card that
            matches the top card by{" "}
            <Text style={[fontBold, { color: theme.textPrimary }]}>shape</Text>{" "}
            or{" "}
            <Text style={[fontBold, { color: theme.textPrimary }]}>number</Text>
            . Can't play? Draw from the market.
          </Text>
        </View>

        {/* Shapes */}
        <Text
          style={[
            fontSemi,
            { marginBottom: 8, fontSize: 13, color: theme.textSecondary },
          ]}
        >
          The five shapes
        </Text>
        <View
          className="mb-6 rounded-2xl px-4 py-4"
          style={{
            backgroundColor: theme.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text
            style={[
              fontReg,
              { fontSize: 14, lineHeight: 21, color: theme.textSecondary },
            ]}
          >
            Circle · Triangle · Cross · Square · Star.{"\n"}
            The{" "}
            <Text style={[fontBold, { color: theme.textPrimary }]}>
              Whot
            </Text>{" "}
            card is a sixth, special suit — it's a wild.
          </Text>
        </View>

        {/* Special cards */}
        <Text
          style={[
            fontSemi,
            { marginBottom: 12, fontSize: 13, color: theme.textSecondary },
          ]}
        >
          Special cards
        </Text>
        <View className="mb-6 gap-2">
          {SPECIAL_CARDS.map((card) => (
            <View
              key={card.value}
              className="flex-row items-center gap-3 rounded-2xl px-3 py-3"
              style={{
                backgroundColor: theme.surfaceAlt,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <View
                className="h-12 w-10 items-center justify-center rounded-lg"
                style={{ backgroundColor: BRAND }}
              >
                <Text
                  style={[
                    fontBold,
                    { fontSize: 18, color: "#fafafa", letterSpacing: 0.4 },
                  ]}
                >
                  {card.value}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  style={[
                    fontBold,
                    {
                      fontSize: 13,
                      color: theme.textPrimary,
                      letterSpacing: 0.6,
                    },
                  ]}
                >
                  {card.name}
                </Text>
                <Text
                  style={[
                    fontReg,
                    {
                      marginTop: 2,
                      fontSize: 12,
                      lineHeight: 17,
                      color: theme.textSecondary,
                    },
                  ]}
                >
                  {card.effect}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Tip */}
        <Text
          style={[
            fontSemi,
            { marginBottom: 8, fontSize: 13, color: theme.textSecondary },
          ]}
        >
          Tip
        </Text>
        <View
          className="mb-8 rounded-2xl px-4 py-4"
          style={{
            backgroundColor: theme.brandTint,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <Text
            style={[
              fontReg,
              { fontSize: 13, lineHeight: 19, color: theme.textSecondary },
            ]}
          >
            Defend penalty cards by stacking the same value — answer a 2 with a
            2, a 5 with a 5, a 14 with a 14. Otherwise you draw.
          </Text>
        </View>

        <Pressable
          onPress={handleClose}
          className="items-center rounded-2xl py-4"
          style={{
            backgroundColor: BRAND,
            ...theme.panelLiftSubtle,
          }}
        >
          <Text
            style={[
              fontBold,
              { fontSize: 13, letterSpacing: 2.4, color: "#fafafa" },
            ]}
          >
            GOT IT
          </Text>
        </Pressable>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
