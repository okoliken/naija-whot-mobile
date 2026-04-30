import type { Difficulty } from "@/types/game";
import type { Shape } from "./types";

export const SHAPES: Exclude<Shape, "whot">[] = ["circle", "triangle", "cross", "star", "square"];
export const AI_DIFFICULTY: Difficulty = "hard";

export const SHAPE_LABELS: Record<Shape, string> = {
  circle: "Circle",
  triangle: "Triangle",
  cross: "Cross",
  star: "Star",
  square: "Square",
  whot: "Whot",
};
