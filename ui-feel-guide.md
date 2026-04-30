# UI & Feel Guide (Naija Whot)

This guide defines the product feel already achieved in the current game so it can be reproduced consistently (especially in mobile builds).

## 1) Design Intent

The target feel is:
- minimal and focused (not noisy)
- tabletop-card energy (physical card vibe)
- responsive and playful, but not chaotic
- readable first, effects second

Core principle:
> Motion should support game state clarity, not distract from decisions.

---

## 2) Visual Identity

### Color System

- Primary brand/card-back color: `#6e1018`
- Card front paper tone: warm off-white
- Ink tone: deep wine/red for card symbols/text
- Dark mode surfaces: neutral zinc/stone ranges
- Accent colors:
  - success/highlight: emerald
  - caution/status pressure: amber

Rule:
- Keep accent colors for state cues only (pending effects, active hints).
- Do not add decorative multi-color gradients to core cards.

### Typography

- Display/card typography: classic serif look (vintage card flavor)
- Body/supporting UI text: clean sans for readability

Usage split:
- serif for card values, titles, identity text (`Whot`)
- sans for utility copy (buttons, feed lines, labels)

---

## 3) Layout Language

### Spatial Hierarchy

1. Opponent hand (top)
2. Table center (market + top played card)
3. Player hand (bottom)

This order must remain visually obvious at a glance.

### Card Positioning

Table cards should feel physically placed:
- market card slightly offset/back
- top card slightly offset/front
- small rotation offsets for realism

Do not align table cards in a sterile perfect grid.

### Density Rules

- Keep header compact (essential controls only).
- Keep game controls near play context, not spread around.
- Prefer fewer chips/buttons with stronger meaning.

---

## 4) Motion & Transition Style

### Motion Characteristics

- short-to-medium duration (roughly 220–340ms for transitions)
- spring easing for card placement
- low amplitude looping motion (subtle float, not bounce-heavy)

### Implemented Patterns

- hand card entrance: stagger + slight fan
- opponent cards: stacked/fanned entrance
- top played card: proper exit/enter swap (not abrupt pop)
- tap/press feedback: quick scale response

### Motion Boundaries

Avoid:
- multiple simultaneous attention-grabbing loops
- bright shimmer effects on primary game objects
- large rotations during routine turns

Use pulse/highlight only for meaningful state urgency.

---

## 5) Card Component Rules

### Back of Card

- solid `#6e1018` base
- white label text
- subtle inner dashed border on opponent backs
- no extra ornamental colors

### Special Cards

- `General (14)` has distinct but restrained styling
- Whot (20) remains visually premium but readable

### Scale

Cards should be slightly oversized vs default web card dimensions for tap comfort and legibility.

---

## 6) Interaction Feel

### Feedback Priority

1. legality feedback (can/cannot play)
2. action consequence feedback (pick/skip/general)
3. turn ownership clarity

### Tone of Prompts

- keep helper text short and calm
- avoid loud CTA language in normal turns
- use explicit wording for effects:
  - "Pick chain: X"
  - "Skips: X"
  - "Need: Shape"

---

## 7) Difficulty Perception Through UX

Even before logic, perceived fairness is affected by feel:

- AI turns should not feel instant or mechanical.
- Easy/Medium should not visually telegraph "always punishing."
- Keep think delay and transitions consistent with difficulty tone.

If AI is softened but UI remains overly aggressive, game still feels unfair.

---

## 8) Mobile Translation Notes

For React Native Expo:

- preserve layout hierarchy (opponent / table / player)
- preserve card offsets and subtle rotations
- replace hover cues with press/haptic cues
- keep animation budget low enough for smooth 60fps on mid devices

Recommended stack:
- Reanimated + Gesture Handler
- optional Moti for faster declarative transitions

---

## 9) UI Acceptance Checklist

Use this before release:

- [ ] Header feels compact and uncluttered
- [ ] Table cards look physically placed, not rigid
- [ ] Card back uses only `#6e1018` with restrained detail
- [ ] Card text remains readable in both themes
- [ ] Motion is smooth and subtle, not flashy
- [ ] Status cues are obvious without being noisy
- [ ] Game remains understandable in under 3 seconds glance

---

## 10) Non-Negotiables

1. Gameplay readability over decoration.
2. Consistent card language across all screens.
3. Minimal UI chrome around core card actions.
4. Motion always tied to state meaning.
