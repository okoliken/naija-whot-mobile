export type CardShape = "Circle" | "Triangle" | "Square" | "Cross" | "Star";

export type CardMove = "None" | "Hold On" | "Pick Two" | "Pick Three" | "Suspension" | "General Market" | "Whot";

export type CardModel = {
  id: string;
  value: number;
  shape: CardShape;
  move: CardMove;
};

export type Difficulty = "easy" | "medium" | "hard";

export type TurnOwner = "human" | "computer";

export type GameSfx = "play" | "draw" | "win" | "lose";

export type StatsSnapshot = {
  played: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
};
