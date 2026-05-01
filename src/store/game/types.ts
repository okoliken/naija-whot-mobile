import type { Difficulty } from "@/types/game";

export type Shape = "circle" | "triangle" | "cross" | "star" | "square" | "whot";
export type Player = "human" | "computer";
export type PendingPenalty = 2 | 5 | 14 | null;

export type Card = {
  id: string;
  shape: Shape;
  value: number;
};

export type GameState = {
  deck: Card[];
  topCard: Card | null;
  humanHand: Card[];
  computerHand: Card[];
  turn: Player;
  pendingPick: number;
  skipNextPlayer: Player | null;
  requestedShape: Exclude<Shape, "whot"> | null;
  awaitingShapeChoice: boolean;
  message: string;
  gameStarted: boolean;
  winner: Player | null;
  statusLine: string;
  aiTurnTick: number;
  difficulty: Difficulty;
  startGame: () => void;
  drawHumanCard: () => void;
  playHumanCard: (index: number) => void;
  chooseShape: (shape: Exclude<Shape, "whot">) => void;
  runComputerTurn: () => void;
  setDifficulty: (d: Difficulty) => void;
};

export type RoundSnapshot = Pick<
  GameState,
  | "deck"
  | "topCard"
  | "humanHand"
  | "computerHand"
  | "turn"
  | "pendingPick"
  | "skipNextPlayer"
  | "requestedShape"
  | "awaitingShapeChoice"
  | "message"
  | "gameStarted"
  | "winner"
  | "statusLine"
  | "aiTurnTick"
>;
