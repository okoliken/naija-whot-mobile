/** Solo (vs CPU) game — store, rules bridge, AI. */
export {
  useGameStore,
  gameShapes,
  canPlay,
  SHAPE_LABELS,
  type Card,
  type GameState,
  type Player,
  type Shape,
} from "./gameStore";
export { DIFFICULTIES, DIFFICULTY_DESC, SHAPES } from "./constants";
export type { CardModel, CardShape, Difficulty } from "./types";
