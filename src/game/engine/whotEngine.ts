import { Game } from 'whot'
import type { CardModel, CardShape } from "../types";

type EngineCard = {
  value: number
  shape: CardShape
  move: string
  iNeed?: CardShape
  matches?: (card: EngineCard) => boolean
}

type EnginePlayer = {
  id: number | string
  hand: () => EngineCard[]
  play: (index: number, iNeed?: CardShape) => EngineCard
  pick: () => EngineCard[]
  toPick: number
}

type EngineGame = {
  players: EnginePlayer[]
  pile: { top: () => EngineCard; cards: EngineCard[] }
  market: { cards: EngineCard[] }
  turn: { switch: (skip?: number) => void }
}

export type DrawResult =
  | { ok: true; cards: CardModel[] }
  | { ok: false; reason: 'depleted' }

export function isMarketDepletedError(err: unknown): boolean {
  return err instanceof Error && err.name === 'OutOfRangeError'
}

function isOutOfTurnError(err: unknown): boolean {
  return err instanceof Error && err.name === 'OutOfTurnError'
}

export class WhotEngine {
  private engine: EngineGame

  constructor(noOfDecks = 1, noOfPlayers = 2) {
    this.engine = new Game({ noOfDecks, noOfPlayers }) as unknown as EngineGame
    this.resetPendingPicks()
  }

  private resetPendingPicks() {
    this.engine.players.forEach((p) => {
      p.toPick = 0
    })
  }

  getTopCard(): CardModel {
    return this.toCardModel(this.engine.pile.top())
  }

  getMarketCount(): number {
    return this.engine.market.cards.length
  }

  getHand(index: number): CardModel[] {
    return this.engine.players[index].hand().map((card, cardIndex) => this.toCardModel(card, cardIndex))
  }

  play(index: number, handIndex: number, iNeed?: CardShape): CardModel {
    this.engine.players[index].toPick = 0
    try {
      const card = this.engine.players[index].play(handIndex, iNeed)
      return this.toCardModel(card)
    } catch (err) {
      // Defensive recovery: if store/engine turn pointers drift, realign once and retry.
      if (isOutOfTurnError(err)) {
        this.switchTurn()
        const card = this.engine.players[index].play(handIndex, iNeed)
        return this.toCardModel(card)
      }
      throw err
    }
  }

  draw(index: number): DrawResult {
    try {
      const cards = this.engine.players[index]
        .pick()
        .map((card, cardIndex) => this.toCardModel(card, cardIndex))
      return { ok: true, cards }
    } catch (err) {
      if (err instanceof Error && err.name === 'OutOfRangeError') {
        return { ok: false, reason: 'depleted' }
      }
      throw err
    }
  }

  switchTurn(skip = 0) {
    this.engine.turn.switch(skip)
  }

  private toCardModel(card: EngineCard, handIndex?: number): CardModel {
    return {
      id: `${card.shape}-${card.value}-${handIndex ?? 'p'}-${Math.random().toString(16).slice(2, 8)}`,
      value: card.value,
      shape: card.shape,
      move: this.mapMove(card),
    }
  }

  private mapMove(card: EngineCard): CardModel['move'] {
    if (card.value === 20) return 'Whot'
    switch (card.value) {
      case 1:
        return 'Hold On'
      case 2:
        return 'Pick Two'
      case 5:
        return 'Pick Three'
      case 8:
        return 'Suspension'
      case 14:
        return 'General Market'
      default:
        return 'None'
    }
  }
}
