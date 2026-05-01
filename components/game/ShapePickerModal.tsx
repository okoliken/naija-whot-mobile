import { SHAPE_LABELS, type GameState } from "@/src/store/gameStore";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { forwardRef, useCallback, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { BORDER, SURFACE } from "./theme";

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

export const ShapePickerModal = forwardRef<BottomSheetModal, Props>(
  function ShapePickerModal({ shapes, onChoose }, ref) {
    const internalRef = useRef<BottomSheetModal>(null);
    const sheetRef = (ref as React.RefObject<BottomSheetModal>) ?? internalRef;

    const fontScript = { fontFamily: "CormorantGaramond_700Bold_Italic" } as const;
    const fontLabel = { fontFamily: "Inter_600SemiBold" } as const;

    const renderBackdrop = useCallback(
      (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.7} />
      ),
      [],
    );

    return (
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={["32%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: SURFACE }}
        handleIndicatorStyle={{ backgroundColor: BORDER, width: 36, height: 3 }}
      >
        <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: 44, paddingTop: 8 }}>
          <Text
            style={fontScript}
            className="mb-6 text-center text-[28px] leading-none text-zinc-100"
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
                    fontSize: GLYPH_SIZE[shape],
                    lineHeight: GLYPH_SIZE[shape] + 6,
                    color: "#6e1018",
                  }}
                >
                  {SHAPE_GLYPH[shape]}
                </Text>
                <Text
                  style={[
                    fontLabel,
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
  },
);
