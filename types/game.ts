export type CardShape = "Circle" | "Triangle" | "Square" | "Cross" | "Star";

export type CardMove = "None" | "Hold On" | "Pick Two" | "Pick Three" | "Suspension" | "General Market" | "Whot";

export type CardModel = {
  id: string;
  value: number;
  shape: CardShape;
  move: CardMove;
};

export type Difficulty = "easy" | "medium" | "hard";
