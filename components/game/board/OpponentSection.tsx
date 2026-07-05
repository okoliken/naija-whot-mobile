import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@/src/platform/cn";
import { type Player } from "@/src/game/gameStore";
import { CardBack } from "../cards/CardBack";
import { Font } from "../../theme/fonts";
import { useAppTheme } from "../../theme/ThemeContext";

type OpponentSectionProps = {
  turn: Player;
  count: number;
  /** Display name for the opponent slot. Defaults to "CPU" for single-player. */
  label?: string;
};

const MAX_SHOWN = 5;

/** The opponent's seat at the top of the table: a small fan of face-down
 *  cards with a one-line label underneath. */
export function OpponentSection({
  turn,
  count,
  label = "CPU",
}: OpponentSectionProps) {
  const { table } = useAppTheme();
  const isOpponentTurn = turn === "computer";
  const shown = Math.min(count, MAX_SHOWN);

  return (
    <View className="items-center pt-3">
      <View className="h-[102px] flex-row items-center justify-center">
        {shown === 0 ? (
          <Text
            style={{
              fontFamily: Font.ui.regular,
              fontSize: 12,
              color: table.textFaint,
            }}
          >
            No cards
          </Text>
        ) : (
          Array.from({ length: shown }).map((_, i) => (
            <View
              key={`opp-${i}`}
              className={cn(i > 0 && "-ml-8")}
              style={{
                transform: [{ rotate: `${(i - (shown - 1) / 2) * 4}deg` }],
                boxShadow: table.cardShadow,
                borderRadius: 8,
              }}
            >
              <CardBack size="mini" />
            </View>
          ))
        )}
      </View>

      <View className="mt-2 flex-row items-center gap-2">
        {isOpponentTurn ? <TurnDot color={table.turnAccent} /> : null}
        <Text
          style={{
            fontFamily: Font.ui.semi,
            fontSize: 11,
            letterSpacing: 1.8,
            textTransform: "uppercase",
            color: isOpponentTurn ? table.textDim : table.textFaint,
          }}
        >
          {label} cards
        </Text>
      </View>
    </View>
  );
}

/** Soft pulse marking the active seat. */
function TurnDot({ color }: { color: string }) {
  const pulse = useSharedValue(0.35);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.35, { duration: 700 }),
      ),
      -1,
      false,
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      style={[
        style,
        {
          width: 7,
          height: 7,
          borderRadius: 999,
          backgroundColor: color,
        },
      ]}
    />
  );
}
