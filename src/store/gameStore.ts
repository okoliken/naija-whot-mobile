import { pickComputerMove } from "@/services/aiPlayer";
import { isMarketDepletedError } from "@/services/whotEngine";
import { create } from "zustand";
import { AI_DIFFICULTY } from "./game/constants";
import {
  SHAPES,
  SHAPE_LABELS,
  SHAPE_TO_ENGINE,
  buildStatusLine,
  canPlayAi,
  canPlayByEngineRules,
  cardLabel,
  checkWinner,
  createInitialRoundState,
  fromEngineShape,
  resolveByExhaustion,
  runGeneralMarketDraw,
  syncHands,
  toAiCard,
  toUiCard,
} from "./game/helpers";
import { gameRuntime } from "./game/runtime";
import type { GameState, Player } from "./game/types";

export type { Card, GameState, Player, Shape } from "./game/types";

export const useGameStore = create<GameState>((set, get) => ({
  ...createInitialRoundState(),

  startGame: () => set(createInitialRoundState()),

  drawHumanCard: () => {
    const state = get();
    if (!gameRuntime.engine || state.turn !== "human" || state.winner || state.awaitingShapeChoice) return;

    const drawCount = state.pendingPick > 0 ? state.pendingPick : 1;
    for (let i = 0; i < drawCount; i += 1) {
      const result = gameRuntime.engine.draw(0);
      if (!result.ok) {
        const synced = syncHands();
        const exhaustion = resolveByExhaustion({ ...state, ...synced });
        set({
          ...state,
          ...synced,
          ...exhaustion,
          turn: "human",
          pendingPick: 0,
          statusLine: buildStatusLine({
            turn: "human",
            pendingPick: 0,
            requestedShape: state.requestedShape,
          }),
        });
        return;
      }
    }

    gameRuntime.pendingPenalty = null;
    gameRuntime.engine.switchTurn();
    const synced = syncHands();
    set({
      ...state,
      ...synced,
      turn: "computer",
      aiTurnTick: state.aiTurnTick + 1,
      pendingPick: 0,
      skipNextPlayer: gameRuntime.pendingSkipCount > 0 ? "computer" : null,
      message: drawCount > 1 ? `You picked ${drawCount} cards.` : "You picked from market.",
      statusLine: buildStatusLine({
        turn: "computer",
        pendingPick: 0,
        requestedShape: state.requestedShape,
      }),
    });
  },

  playHumanCard: (index) => {
    const state = get();
    if (!gameRuntime.engine || !state.topCard || state.turn !== "human" || state.awaitingShapeChoice || state.winner) return;

    const selectedCard = state.humanHand[index];
    if (!selectedCard) return;

    if (gameRuntime.pendingPenalty === 2 && state.pendingPick > 0 && selectedCard.value !== 2) {
      set({ ...state, message: "You must defend with Pick Two or draw." });
      return;
    }
    if (gameRuntime.pendingPenalty === 5 && state.pendingPick > 0 && selectedCard.value !== 5) {
      set({ ...state, message: "You must defend with Pick Three or draw." });
      return;
    }
    if (!canPlayByEngineRules(selectedCard, state.topCard, state.requestedShape)) {
      set({ ...state, message: "You cannot play that card." });
      return;
    }

    if (selectedCard.value === 20) {
      gameRuntime.pendingWhotIndex = index;
      set({ ...state, awaitingShapeChoice: true, message: "Choose a shape for Crown (20)." });
      return;
    }

    let played;
    try {
      played = gameRuntime.engine.play(0, index);
    } catch (err) {
      if (isMarketDepletedError(err)) {
        const synced = syncHands();
        const exhaustion = resolveByExhaustion({ ...state, ...synced });
        set({ ...state, ...synced, ...exhaustion });
        return;
      }
      throw err;
    }

    const synced = syncHands();
    const playedUi = toUiCard(played);
    let pendingPick = state.pendingPick;
    let message = `You played ${cardLabel(playedUi)}.`;
    let requestedShape = state.requestedShape;
    let turn: Player = "computer";
    let skipNextPlayer: Player | null = gameRuntime.pendingSkipCount > 0 ? "computer" : null;

    if (played.value === 1) {
      turn = "human";
      message = "You played Hold On.";
    } else if (played.value === 2) {
      pendingPick += 2;
      gameRuntime.pendingPenalty = 2;
      message = "You played Pick Two.";
    } else if (played.value === 5) {
      pendingPick += 3;
      gameRuntime.pendingPenalty = 5;
      message = "You played Pick Three.";
    } else if (played.value === 8) {
      gameRuntime.pendingSkipCount += 1;
      skipNextPlayer = "computer";
      message = "You played Suspension.";
    } else if (played.value === 14) {
      const marketResult = runGeneralMarketDraw("computer");
      const reSynced = syncHands();
      if (!marketResult.ok) {
        const exhaustion = resolveByExhaustion({ ...state, ...reSynced });
        set({ ...state, ...reSynced, ...exhaustion });
        return;
      }
      message = "You played General Market. Computer picked 1 from market.";
      Object.assign(synced, reSynced);
      requestedShape = null;
    } else {
      requestedShape = null;
    }

    const winner = checkWinner(synced);
    if (!winner && turn !== "human") {
      gameRuntime.engine.switchTurn();
    }
    set({
      ...state,
      ...synced,
      topCard: playedUi,
      pendingPick,
      skipNextPlayer,
      requestedShape,
      awaitingShapeChoice: false,
      turn,
      aiTurnTick: turn === "computer" ? state.aiTurnTick + 1 : state.aiTurnTick,
      winner,
      gameStarted: winner === null,
      message: winner ? (winner === "human" ? "You won this round." : "Computer won this round.") : message,
      statusLine: buildStatusLine({ turn, pendingPick, requestedShape }),
    });
  },

  chooseShape: (shape) => {
    const state = get();
    if (!gameRuntime.engine || !state.awaitingShapeChoice || state.winner || gameRuntime.pendingWhotIndex === null) return;

    let played;
    try {
      played = gameRuntime.engine.play(0, gameRuntime.pendingWhotIndex, SHAPE_TO_ENGINE[shape]);
    } catch (err) {
      if (isMarketDepletedError(err)) {
        const synced = syncHands();
        const exhaustion = resolveByExhaustion({ ...state, ...synced });
        set({ ...state, ...synced, ...exhaustion });
        return;
      }
      throw err;
    }

    gameRuntime.pendingWhotIndex = null;
    gameRuntime.engine.switchTurn();
    const synced = syncHands();
    const winner = checkWinner(synced);
    set({
      ...state,
      ...synced,
      topCard: toUiCard(played),
      requestedShape: shape,
      awaitingShapeChoice: false,
      turn: "computer",
      aiTurnTick: winner ? state.aiTurnTick : state.aiTurnTick + 1,
      winner,
      gameStarted: winner === null,
      message: winner ? "You won this round." : `You played Crown and requested ${SHAPE_LABELS[shape]}.`,
      statusLine: buildStatusLine({ turn: "computer", pendingPick: state.pendingPick, requestedShape: shape }),
    });
  },

  runComputerTurn: () => {
    const state = get();
    if (!gameRuntime.engine || !state.topCard || state.turn !== "computer" || state.awaitingShapeChoice || state.winner) return;

    if (gameRuntime.pendingSkipCount > 0) {
      gameRuntime.pendingSkipCount -= 1;
      gameRuntime.engine.switchTurn();
      set({
        ...state,
        skipNextPlayer: gameRuntime.pendingSkipCount > 0 ? "computer" : null,
        turn: "human",
        message: "Computer was suspended.",
        statusLine: buildStatusLine({
          turn: "human",
          pendingPick: state.pendingPick,
          requestedShape: state.requestedShape,
        }),
      });
      return;
    }

    const aiDecision = pickComputerMove(
      {
        hand: state.computerHand.map(toAiCard),
        topCard: toAiCard(state.topCard),
        requestedShape: state.requestedShape ? SHAPE_TO_ENGINE[state.requestedShape] : null,
        opponentHandSize: state.humanHand.length,
        pendingPickCount: state.pendingPick,
        difficulty: AI_DIFFICULTY,
      },
      (candidate, top, needed) => {
        if (gameRuntime.pendingPenalty === 2 && state.pendingPick > 0) return candidate.value === 2;
        if (gameRuntime.pendingPenalty === 5 && state.pendingPick > 0) return candidate.value === 5;
        return canPlayAi(candidate, top, needed);
      },
    );

    if (aiDecision.type === "draw" || aiDecision.cardIndex === undefined) {
      const drawCount = state.pendingPick > 0 ? state.pendingPick : 1;
      for (let i = 0; i < drawCount; i += 1) {
        const result = gameRuntime.engine.draw(1);
        if (!result.ok) {
          const synced = syncHands();
          const exhaustion = resolveByExhaustion({ ...state, ...synced });
          set({ ...state, ...synced, ...exhaustion });
          return;
        }
      }

      gameRuntime.pendingPenalty = null;
      gameRuntime.engine.switchTurn();
      const synced = syncHands();
      set({
        ...state,
        ...synced,
        pendingPick: 0,
        turn: "human",
        message: drawCount > 1 ? `Computer picked ${drawCount} cards.` : "Computer picked from market.",
        statusLine: buildStatusLine({
          turn: "human",
          pendingPick: 0,
          requestedShape: state.requestedShape,
        }),
      });
      return;
    }

    let played;
    try {
      played = gameRuntime.engine.play(1, aiDecision.cardIndex, aiDecision.requestedShape);
    } catch (err) {
      if (isMarketDepletedError(err)) {
        const synced = syncHands();
        const exhaustion = resolveByExhaustion({ ...state, ...synced });
        set({ ...state, ...synced, ...exhaustion });
        return;
      }
      throw err;
    }

    const synced = syncHands();
    const playedUi = toUiCard(played);
    let pendingPick = state.pendingPick;
    let requestedShape = aiDecision.requestedShape ? fromEngineShape(aiDecision.requestedShape) : null;
    let turn: Player = "human";
    let skipNextPlayer: Player | null = gameRuntime.pendingSkipCount > 0 ? "human" : null;
    let message = `Computer played ${cardLabel(playedUi)}.`;

    if (played.value === 1) {
      turn = "computer";
      message = "Computer played Hold On.";
    } else if (played.value === 2) {
      pendingPick += 2;
      gameRuntime.pendingPenalty = 2;
      message = "Computer played Pick Two.";
    } else if (played.value === 5) {
      pendingPick += 3;
      gameRuntime.pendingPenalty = 5;
      message = "Computer played Pick Three.";
    } else if (played.value === 8) {
      gameRuntime.pendingSkipCount += 1;
      skipNextPlayer = "human";
      message = "Computer played Suspension.";
    } else if (played.value === 14) {
      const marketResult = runGeneralMarketDraw("human");
      const reSynced = syncHands();
      if (!marketResult.ok) {
        const exhaustion = resolveByExhaustion({ ...state, ...reSynced });
        set({ ...state, ...reSynced, ...exhaustion });
        return;
      }
      message = "Computer played General Market. You picked 1 from market.";
      Object.assign(synced, reSynced);
      requestedShape = null;
    } else if (played.value !== 20) {
      requestedShape = null;
    }

    const winner = checkWinner(synced);
    if (!winner && turn !== "computer") {
      gameRuntime.engine.switchTurn();
    }
    set({
      ...state,
      ...synced,
      topCard: playedUi,
      pendingPick,
      skipNextPlayer,
      requestedShape,
      turn,
      aiTurnTick: turn === "computer" && !winner ? state.aiTurnTick + 1 : state.aiTurnTick,
      winner,
      gameStarted: winner === null,
      message: winner ? (winner === "human" ? "You won this round." : "Computer won this round.") : message,
      statusLine: buildStatusLine({ turn, pendingPick, requestedShape }),
    });

    // CPU continuation is scheduled from app-level effect to avoid duplicated timers.
  },
}));

export const gameShapes = SHAPES;
export const canPlay = canPlayByEngineRules;
export { SHAPE_LABELS };
