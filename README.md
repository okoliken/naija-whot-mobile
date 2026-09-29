# Naija Whot

The classic Nigerian card game, on your phone. Play solo against the CPU or challenge friends in real-time multiplayer.

<a href="https://play.google.com/store/apps/details?id=com.okolijeff.whot">
  <img alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" height="80">
</a>

## Features

- **Play vs CPU** with three difficulty levels: easy, medium and hard
- **Real-time multiplayer**: create a room and share the code with friends to join
- **Full Naija rules**: Hold On, Pick Two, Pick Three, Suspension, General Market and the Whot wild card
- **Light and dark themes**
- **Sounds and haptics** for draws, plays, wins and losses
- **All-time stats** that track your wins and losses
- **Built-in How to Play guide**

## Card rules

| Card | Name           | Effect                                                   |
| ---- | -------------- | -------------------------------------------------------- |
| 1    | Hold On        | You play again, and your opponent loses their turn.      |
| 2    | Pick Two       | Next player draws 2, unless they answer with a 2.        |
| 5    | Pick Three     | Next player draws 3, unless they answer with a 5.        |
| 8    | Suspension     | Skip the next player's turn.                             |
| 14   | General Market | Everyone else draws 1, unless they answer with a 14.     |
| 20   | Whot           | Wild card. Request any shape for the next play.          |

Match the top card by **shape** or **number**. The first player to empty their hand wins.

## Tech stack

- [Expo](https://expo.dev) (SDK 54) + React Native 0.81 with the New Architecture
- [Expo Router](https://docs.expo.dev/router/introduction/) for navigation
- [Zustand](https://github.com/pmndrs/zustand) for game state
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) + Gesture Handler for card animations
- [Uniwind](https://github.com/uni-stack/uniwind) (Tailwind CSS v4) for styling
- [Firebase Firestore](https://firebase.google.com/docs/firestore) for multiplayer rooms
- TypeScript + React Compiler

## Project structure

```
app/                 Routes (home, game)
components/
  game/              Board, cards, modals, effects
  theme/             Theme context, fonts, tokens
  ui/                Shared UI primitives
src/
  game/              Whot engine, CPU player, game store
  multiplayer/       Networked game engine and sync
  room/              Firestore room creation and joining
  platform/          Firebase, sound, haptics, local storage
```

## Getting started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io)
- A Firebase project with Firestore enabled (for multiplayer)
- Android Studio or Xcode for running on a device or simulator

### Setup

```bash
git clone https://github.com/okoliken/naija-whot-mobile.git
cd naija-whot-mobile
pnpm install
cp .env.example .env   # fill in your Firebase web app config
```

Deploy the Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

### Run

```bash
pnpm start          # Expo dev server
pnpm android        # build and run on Android
pnpm ios            # build and run on iOS
```

### Build

Builds use [EAS](https://docs.expo.dev/build/introduction/):

```bash
eas build --profile preview --platform android      # installable APK
eas build --profile production --platform android   # Play Store bundle
```
