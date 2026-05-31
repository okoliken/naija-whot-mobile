import type { CardModel, CardShape, Difficulty } from "../types";

export interface AiDecision {
  type: 'play' | 'draw'
  cardIndex?: number
  requestedShape?: CardShape
}

export interface AiContext {
  hand: CardModel[]
  topCard: CardModel
  requestedShape: CardShape | null
  opponentHandSize: number
  pendingPickCount: number
  difficulty?: Difficulty
}

type Playable = { card: CardModel; index: number }
type CanPlayFn = (
  card: CardModel,
  top: CardModel,
  needed: CardShape | null,
) => boolean

const SHAPES: CardShape[] = ['Circle', 'Triangle', 'Square', 'Cross', 'Star']

/**
 * Top-level entry point — routes to a difficulty-specific brain.
 *
 * - easy: mostly random legal play with light bias away from aggressive actions.
 * - medium: balanced weighted play with occasional pressure (not constant blocking).
 * - hard: full tactical play (threat response, endgame setup, penalty stacking).
 */
export function pickComputerMove(ctx: AiContext, canPlay: CanPlayFn): AiDecision {
  const playable = collectPlayable(ctx, canPlay)
  if (!playable.length) return { type: 'draw' }
  // Always take a direct win if available (1 card left and playable).
  if (ctx.hand.length === 1) return play(playable[0], ctx.hand)

  const difficulty = ctx.difficulty ?? 'hard'
  if (difficulty === 'easy') return easyBrain(ctx, playable)
  if (difficulty === 'medium') return mediumBrain(ctx, playable)
  return hardBrain(ctx, playable)
}

function collectPlayable(ctx: AiContext, canPlay: CanPlayFn): Playable[] {
  const out: Playable[] = []
  for (let index = 0; index < ctx.hand.length; index++) {
    const card = ctx.hand[index]
    if (canPlay(card, ctx.topCard, ctx.requestedShape)) {
      out.push({ card, index })
    }
  }
  return out
}

/* ---------- Easy ---------- */
function easyBrain(ctx: AiContext, playable: Playable[]): AiDecision {
  // Human-like easy mode:
  // - prefer normal cards
  // - avoid always throwing pressure cards
  // - keep some randomness so outcomes feel fair
  const nonWhot = playable.filter(({ card }) => card.value !== 20)
  const pool = nonWhot.length > 0 ? nonWhot : playable
  const shapeCounts = countShapes(ctx.hand)
  const safeOpponent = ctx.opponentHandSize > 2

  const weighted = pool.map((entry) => {
    const { card } = entry
    let score = 10 + Math.random() * 8

    if (card.move === 'None') score += 8
    if (card.value === 20) score -= 8

    // On easy, pressure moves are toned down unless player is close.
    if (safeOpponent && isPressureMove(card)) score -= 6
    if (!safeOpponent && isPressureMove(card)) score += 3

    // Mild hand-shape hygiene.
    score += shapeRarityBonus(card.shape, shapeCounts, 2)
    return { entry, score }
  })

  const choice = pickByScore(weighted)
  return play(choice, ctx.hand, true)
}

/* ---------- Medium ---------- */
function mediumBrain(ctx: AiContext, playable: Playable[]): AiDecision {
  const { hand, opponentHandSize, pendingPickCount } = ctx
  const shapeCounts = countShapes(hand)
  const inPenaltyChain = pendingPickCount > 0
  const opponentClose = opponentHandSize <= 2
  const meCloseToWin = hand.length <= 2

  // Medium should feel strategic but not oppressive: weighted choice + randomness.
  const weighted = playable.map((entry) => {
    const { card } = entry
    let score = 18 + Math.random() * 10

    // Prefer non-Whot unless it helps shape control.
    if (card.value === 20) score -= 8

    // Keep hand balanced: drop rarer shape cards first.
    score += shapeRarityBonus(card.shape, shapeCounts, 4)

    // Pressure only when it makes sense.
    if (isPressureMove(card)) {
      if (opponentClose) score += 9
      else score -= 3
    }

    // In active pick chain, prefer stacking.
    if (inPenaltyChain) {
      if (card.value === 5) score += 12
      if (card.value === 2) score += 9
    }

    // Hold On is useful but shouldn't dominate every turn.
    if (card.move === 'Hold On') score += hand.length > 2 ? 4 : 1

    // General Market is situational; avoid spamming when no pressure.
    if (card.move === 'General Market') score += opponentClose ? 4 : -2

    // Endgame: prefer cleaner cards unless pressure is needed.
    if (meCloseToWin) {
      if (card.move === 'None') score += 5
      if (card.move === 'Hold On') score += 2
      if (isPressureMove(card) && !opponentClose) score -= 3
    }

    return { entry, score }
  })

  const choice = pickByScore(weighted)
  return play(choice, hand)
}

/* ---------- Hard ---------- */
function hardBrain(ctx: AiContext, playable: Playable[]): AiDecision {
  const { hand, pendingPickCount, opponentHandSize } = ctx

  const findMove = (move: CardModel['move']) =>
    playable.find(({ card }) => card.move === move)
  const findValue = (value: number) =>
    playable.find(({ card }) => card.value === value)
  const nonWhot = playable.filter(({ card }) => card.value !== 20)

  const inPenaltyChain = pendingPickCount > 0
  const opponentClose = opponentHandSize <= 1
  const opponentNear = opponentHandSize <= 2
  const meCloseToWin = hand.length <= 2
  const meNearWin = hand.length <= 3

  // 1. Penalty chain — extend it back at the human.
  if (inPenaltyChain) {
    const stack = findValue(5) ?? findValue(2)
    if (stack) return play(stack, hand)
  }

  // 2. Threat: opponent at 1 card — go aggressive.
  if (opponentClose) {
    const disruptor =
      findMove('Pick Three') ??
      findMove('Pick Two') ??
      findMove('Suspension') ??
      findMove('Hold On') ??
      findMove('General Market')
    if (disruptor) return play(disruptor, hand)
    const whotPivot = findValue(20)
    if (whotPivot) return play(whotPivot, hand)
  }

  // 3. We're at 2 cards — burn an action card to keep a clean finisher.
  if (meCloseToWin) {
    const safeLast = pickSafeFinisher(hand, playable)
    if (safeLast) return play(safeLast, hand)
  }

  // 4. Hold On keeps turn, but avoid overusing it in neutral spots.
  const holdOn = findMove('Hold On')
  if (holdOn && hand.length > 2 && opponentNear) return play(holdOn, hand)

  // 5. Pre-emptive pressure when opponent is near.
  if (opponentNear) {
    const pressure =
      findMove('Pick Three') ??
      findMove('Pick Two') ??
      findMove('Suspension') ??
      findMove('General Market')
    if (pressure) return play(pressure, hand)
  }

  // 6. Hand management — drop rarest shape first, save Whot for emergencies.
  const shapeCounts = countShapes(hand)
  let pool = nonWhot.length > 0 ? nonWhot : playable
  // When we're near win and opponent is not, reduce "deny forever" loops.
  if (meNearWin && !opponentNear) {
    const calmer = pool.filter(({ card }) => card.move === 'None' || card.move === 'Hold On')
    if (calmer.length > 0) pool = calmer
  }
  const sorted = [...pool].sort((a, b) => {
    const aRarity = shapeCounts[a.card.shape] ?? 0
    const bRarity = shapeCounts[b.card.shape] ?? 0
    if (aRarity !== bRarity) return aRarity - bRarity
    return b.card.value - a.card.value
  })

  // Slight noise so hard is strong but not perfectly robotic every turn.
  const top = sorted[0] ?? playable[0]
  const next = sorted[1] ?? top
  const choice = !inPenaltyChain && !opponentClose && Math.random() < 0.14 ? next : top
  return play(choice, hand)
}

/* ---------- Shared helpers ---------- */
function play(entry: Playable, hand: CardModel[], preferRandomShapeOnWhot = false): AiDecision {
  return {
    type: 'play',
    cardIndex: entry.index,
    requestedShape:
      entry.card.value === 20
        ? (preferRandomShapeOnWhot && Math.random() < 0.65 ? randomShape() : chooseBestShape(hand))
        : undefined,
  }
}

function pickSafeFinisher(hand: CardModel[], playable: Playable[]): Playable | null {
  if (hand.length !== 2) return null
  const actionable = playable.find(({ card }) => card.move !== 'None' && card.value !== 20)
  if (!actionable) return null
  const remaining = hand.filter((_, i) => i !== actionable.index)
  const otherIsSafe = remaining.every((card) => card.move === 'None' && card.value !== 20)
  return otherIsSafe ? actionable : null
}

function countShapes(hand: CardModel[]): Record<CardShape, number> {
  const seed: Record<CardShape, number> = {
    Circle: 0,
    Triangle: 0,
    Square: 0,
    Cross: 0,
    Star: 0,
  }
  return hand.reduce((acc, card) => {
    if (card.value !== 20 && SHAPES.includes(card.shape)) acc[card.shape] += 1
    return acc
  }, seed)
}

function chooseBestShape(hand: CardModel[]): CardShape {
  const counts = countShapes(hand)
  const ranked = SHAPES.map((shape) => ({ shape, count: counts[shape] })).sort(
    (a, b) => b.count - a.count,
  )
  return ranked[0]?.count ? ranked[0].shape : 'Circle'
}

function randomShape(): CardShape {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)]
}

function isPressureMove(card: CardModel): boolean {
  return (
    card.move === 'Pick Three' ||
    card.move === 'Pick Two' ||
    card.move === 'Suspension' ||
    card.move === 'General Market'
  )
}

function shapeRarityBonus(
  shape: CardShape,
  counts: Record<CardShape, number>,
  multiplier: number,
): number {
  const count = counts[shape] ?? 0
  if (count <= 0) return 0
  // Lower count = rarer shape, so prefer dropping it.
  return (6 - Math.min(count, 5)) * multiplier * 0.2
}

function pickByScore(weighted: Array<{ entry: Playable; score: number }>): Playable {
  const sorted = [...weighted].sort((a, b) => b.score - a.score)
  const topBand = sorted.slice(0, Math.min(3, sorted.length))
  const sum = topBand.reduce((acc, item) => acc + Math.max(0.1, item.score), 0)
  let roll = Math.random() * sum
  for (const item of topBand) {
    roll -= Math.max(0.1, item.score)
    if (roll <= 0) return item.entry
  }
  return topBand[0].entry
}
