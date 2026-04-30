import type { StatsSnapshot, TurnOwner } from '../types/game'

const KEY = 'naija-whot.stats.v1'

const defaultStats: StatsSnapshot = {
  played: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
}

export function loadStats(): StatsSnapshot {
  const raw = localStorage.getItem(KEY)
  if (!raw) return defaultStats
  try {
    return { ...defaultStats, ...JSON.parse(raw) }
  } catch {
    return defaultStats
  }
}

export function recordResult(stats: StatsSnapshot, winner: TurnOwner): StatsSnapshot {
  const next = { ...stats, played: stats.played + 1 }
  if (winner === 'human') {
    next.wins += 1
    next.currentStreak += 1
    next.bestStreak = Math.max(next.bestStreak, next.currentStreak)
  } else {
    next.losses += 1
    next.currentStreak = 0
  }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
