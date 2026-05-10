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

export const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

export const DIFFICULTY_DESC: Record<Difficulty, string> = {
  easy: "CPU plays randomly",
  medium: "CPU plays smart",
  hard: "CPU plays to win",
};