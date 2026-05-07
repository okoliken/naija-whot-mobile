import { SHAPE_LABELS, type GameState } from "@/src/store/gameStore";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useLayoutEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useAppTheme } from "../../theme/ThemeContext";
import { Font } from "../../theme/fonts";

type Shape = Exclude<GameState["requestedShape"], null>;

type Props = {
  shapes: Shape[];
  onChoose: (shape: Shape) => void;
};

const SHAPE_GLYPH: Record<Shape, string> = {
  circle: "●",
  triangle: "▲",
  square: "■",
  cross: "✚",
  star: "★",
};

const GLYPH_SIZE: Record<Shape, number> = {
  circle: 26,
  triangle: 28,
  square: 24,
  cross: 22,
  star: 26,
};

/** Mount only while crown shape is required — `present()` runs on mount (reliable with @gorhom/bottom-sheet). */
export function ShapePickerModal({ shapes, onChoose }: Props) {
  const theme = useAppTheme();
  const sheetRef = useRef<BottomSheetModal>(null);

  useLayoutEffect(() => {
    const t = setTimeout(() => sheetRef.current?.present(), 80);
    return () => {
      clearTimeout(t);
      const sheet = sheetRef.current;
      sheet?.dismiss();
    };
  }, []);

  const fontTitle = { fontFamily: Font.display.bold } as const;
  const fontSemi = { fontFamily: Font.ui.semi } as const;

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.7}
        pressBehavior="none"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={["32%"]}
      enablePanDownToClose={false}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{ backgroundColor: theme.border, width: 36, height: 3 }}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: 44, paddingTop: 8 }}>
        <Text
            style={[fontTitle, { marginBottom: 24, textAlign: "center", fontSize: 21, lineHeight: 26, letterSpacing: 1.2, color: theme.textPrimary }]}
          >
            Choose a shape
          </Text>

        <View className="flex-row items-end justify-around">
          {shapes.map((shape) => (
            <Pressable
              key={shape}
              onPress={() => onChoose(shape)}
              style={({ pressed }) => ({
                width: 58,
                height: 72,
                backgroundColor: pressed ? "#e8e2d8" : "#f7f2e9",
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#6e101833",
                alignItems: "center",
                justifyContent: "center",
                transform: [{ scale: pressed ? 0.92 : 1 }],
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: pressed ? 0.08 : 0.2,
                shadowRadius: pressed ? 2 : 6,
                elevation: pressed ? 2 : 5,
              })}
            >
              <Text
                style={{
                  fontFamily: Font.ui.bold,
                  fontSize: GLYPH_SIZE[shape],
                  lineHeight: GLYPH_SIZE[shape] + 6,
                  color: "#6e1018",
                }}
              >
                {SHAPE_GLYPH[shape]}
              </Text>
              <Text
                style={[
                  fontSemi,
                  { fontSize: 7, color: "#6e1018aa", letterSpacing: 0.6, marginTop: 4 },
                ]}
              >
                {SHAPE_LABELS[shape].toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
