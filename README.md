# Naija Whot Mobile (Expo)

Mobile-first Nigerian Whot app built with React Native, Expo, and Expo Router.

## What this app is now

- Native mobile project scaffolded with Expo.
- Routing powered by Expo Router (`app/` directory).
- Ready for gameplay logic + UI implementation.
- Single-player direction (human vs AI), with multiplayer-ready architecture.

## Stack

- Expo SDK 54
- React Native + React 19
- Expo Router
- React Native Reanimated
- React Native Gesture Handler
- TypeScript + ESLint

## Run locally

```bash
npm install
npm run start
```

Then launch on a target device:

- `npm run android`
- `npm run ios`
- `npm run web` (optional preview)

## Lint

```bash
npm run lint
```

## Mobile game scope

- Human vs computer gameplay.
- Nigerian Whot action cards:
  - `1` Hold On
  - `2` Pick Two
  - `5` Pick Three
  - `8` Suspension
  - `14` General Market
  - `20` Crown (wild shape request)
- Turn events, basic sound/haptics, and card transitions.

## Immediate next build steps

1. Add domain modules (`engine`, `ai`, shared `types`).
2. Build `useGameController` for turn orchestration.
3. Implement core UI screens in `app/`.
4. Add Reanimated interactions and haptics.
5. Add rule parity tests and AI behavior tests.

## References

- Rules overview: [Pagat Whot rules](https://www.pagat.com/com/whot.html)
- Engine/API reference: [mykeels/whot](https://github.com/mykeels/whot)
