# Naija Whot Mobile Patterns

This project follows mobile-first architecture patterns so gameplay stays correct while UI evolves.

## 1) Layer separation

- `domain`: pure game rules, AI decisions, and shared models.
- `game`: controller/state transitions and side effects.
- `ui`: screens/components that render state and emit intents.

UI must never own game rules.

## 2) Engine adapter boundary

Use one adapter module for any third-party Whot engine integration.

- Keep app-facing types normalized (`CardModel`, `Shape`, `Difficulty`).
- Prevent library-specific objects from leaking into UI or controller code.

## 3) Explicit turn phases

Use a finite phase model:

- `idle`
- `playerTurn`
- `resolvingAction`
- `aiTurn`
- `roundEnd`

All player actions are guarded by phase checks.

## 4) Intent-based controller API

Screens call high-level intents only:

- `startGame()`
- `playHumanCard(index)`
- `drawHumanCard()`
- `chooseShape(shape)`
- `runComputerTurn()`

No direct state mutation from UI components.

## 5) Event-first feedback

Controller emits game events that drive:

- status messages
- haptics/sound
- transitions/animations

This keeps visuals replaceable without changing rule logic.

## 6) Animation ownership

- Reanimated handles card and table motion.
- Gesture handlers map user interaction into intents.
- Animation timing should remain short and interruptible.

Animations decorate state changes; they do not decide outcomes.

## 7) Persistence gateway

Keep persistence in dedicated modules (for example, stats/history service).

- Controller depends on an interface.
- Storage implementation can evolve from local to cloud without rewriting gameplay.

## 8) AI contract

AI modules should stay deterministic for a given input seed/context and expose a small surface:

- input: legal moves + game context
- output: selected move or draw decision

Difficulty tuning should remain data-driven where possible.

## 9) Testing priorities

Prioritize tests in this order:

1. Rule parity and legality checks.
2. Action-card chain flows (`2`, `5`, `8`, `14`, `20`).
3. Controller turn transitions and round end logic.
4. AI tendency checks by difficulty.

## 10) Multiplayer readiness

Design controller interfaces so AI can be swapped for a remote player transport later.

- Same intent API.
- Same event output contracts.
