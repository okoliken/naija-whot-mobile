import { type Card } from "@/src/game/gameStore";
import { Pressable, View } from "react-native";
import { CardBack } from "../cards/CardBack";
import { CardFront } from "../cards/CardFront";
import { StatusChip } from "../../ui/StatusChip";
import { useAppTheme } from "../../theme/ThemeContext";
import { BRAND, CARD_EDGE_RED } from "../../theme/theme";

type TableSectionProps = {
  deckCount: number;
  topCard: Card | null;
  isHumanTurn: boolean;
  needLabel: string;
  pendingPick: number;
  skipsLabel: string;
  onDraw: () => void;
};

/** The middle of the table: draw pile and discard pile resting on the felt,
 *  with quiet state markers underneath only when there's something to say. */
export function TableSection({
  deckCount,
  topCard,
  isHumanTurn,
  needLabel,
  pendingPick,
  skipsLabel,
  onDraw,
}: TableSectionProps) {
  const { table } = useAppTheme();
  const drawHint = pendingPick > 0 ? `Draw ${pendingPick}` : "Draw";

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View className="flex-row items-center gap-8">
        {/* Draw pile — a couple of offset edges under the top back sell the
            stack without any texture work. */}
        <Pressable
          onPress={onDraw}
          disabled={!isHumanTurn}
          style={({ pressed }) => ({
            opacity: isHumanTurn ? (pressed ? 0.85 : 1) : 0.7,
            transform: [
              { rotate: "-4deg" },
              { scale: isHumanTurn && pressed ? 0.96 : 1 },
            ],
          })}
        >
          <View>
            {[6, 3].map((offset) => (
              <View
                key={offset}
                className="absolute h-full w-full rounded-lg"
                style={{
                  top: offset,
                  left: offset / 2,
                  backgroundColor: BRAND,
                  borderWidth: 1,
                  borderColor: CARD_EDGE_RED,
                }}
              />
            ))}
            <View
              style={{ boxShadow: table.cardShadow, borderRadius: 8 }}
            >
              <CardBack
                count={deckCount}
                hint={isHumanTurn ? drawHint : "Market"}
              />
            </View>
          </View>
        </Pressable>

        {/* Discard pile */}
        <View
          className="rotate-3"
          style={{ boxShadow: table.cardShadow, borderRadius: 8 }}
        >
          {topCard ? <CardFront card={topCard} /> : <CardBack />}
        </View>
      </View>

      <View className="mt-6 h-8 flex-row flex-wrap items-center justify-center gap-2">
        {needLabel !== "Any" ? <StatusChip label={`Need ${needLabel}`} /> : null}
        {pendingPick > 0 ? (
          <StatusChip label={`Pick ${pendingPick} pending`} accent="warning" />
        ) : null}
        {skipsLabel !== "0" ? <StatusChip label="Next turn skipped" /> : null}
      </View>
    </View>
  );
}
