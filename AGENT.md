# Naija Whot Mobile Agent Guide (Expo)

This is the working guide for building and shipping the mobile app.

## 1) Current direction

The repo is now an Expo project with Expo Router.  
Focus all implementation on native mobile gameplay, not web migration strategy.

## 2) Delivery target

Build a polished single-player Naija Whot app (human vs AI) with:

- full action-card behavior (`1`, `2`, `5`, `8`, `14`, `20`)
- smooth card animations (Reanimated)
- mobile haptics/audio feedback
- stable turn-controller logic that is easy to test

## 3) Canonical architecture

Use this split consistently:

1. `src/domain/`
   - engine adapter
   - AI move selection
   - shared types and pure helpers
2. `src/game/`
   - `useGameController` and turn orchestration
   - phase transitions and action resolution
3. `app/` and `src/ui/`
   - screens, components, and interaction wiring

Rule: UI emits intents; controller mutates state; domain computes outcomes.

## 4) Immediate implementation plan

1. Create shared models in `src/domain/types`.
2. Implement engine adapter in `src/domain/engine`.
3. Implement AI contract in `src/domain/ai`.
4. Build `useGameController` in `src/game`.
5. Wire `app/index.tsx` to controller state and intents.
6. Add shape prompt and round-end modals.
7. Add card/stack transitions and haptics.

## 5) Mobile UX standards

- Minimum touch target: `44x44`.
- No hover-dependent affordances.
- Key actions should remain in thumb-friendly zones.
- Animation duration target: `220ms` to `340ms`.
- All animations should be interruptible and low-jank.

## 6) Controller API contract

The controller should expose a compact intent API:

- `startGame()`
- `playHumanCard(index)`
- `drawHumanCard()`
- `chooseShape(shape)`
- `runComputerTurn()`

And surface:

- current phase
- hands + market + top card
- pending prompts (shape request, round end)
- event message stream

## 7) AI difficulty baseline

- `easy`: mostly random legal play, low pressure-card usage
- `medium`: weighted legal play with occasional pressure
- `hard`: tactical pressure and endgame-aware decisions

Keep AI deterministic for a fixed test context.

## 8) Test checklist

Prioritize tests in this order:

1. rule legality parity
2. action-card chain handling
3. controller phase transition safety
4. AI behavior tendencies by difficulty
5. long-run simulation for deadlocks

## 9) Definition of done (mobile MVP)

MVP is done when:

- a full round can be played start-to-finish on device
- all action cards behave correctly
- no invalid UI actions are possible outside phase constraints
- animations and haptics are integrated without blocking turns
- lint passes and core tests pass
