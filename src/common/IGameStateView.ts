import { Phase } from './phases'
import ICard from './ICard'
import IPlayer from './IPlayer'
import { ShellReserve } from './colors'
import { DieValue } from './die'
import { rollCounts } from './attackRoll'

// Per-player view: hidden information removed.
// deck → deckCount; opponents' hands → count; own hand + discard in full.
export interface IPlayerView extends Omit<IPlayer, 'hand'> {
  hand: ICard[] | number
}

export default interface IGameStateView {
  players: IPlayerView[]
  playerCount?: number // lobby only
  readyPlayers: number[]
  currentPlayerIndex: number
  deckCount: number
  discard: ICard[]
  shuffleCount: number
  phase: Phase
  pending?: { [playerIdx: number]: string }
  shipLocations: {
    [playerIndex: number]: {
      targetPlayerIndex?: number
      fortID?: string
    }
  }
  shellReserve: ShellReserve
  attackIsOpenWater: boolean
  attackRoll: DieValue[] | undefined
  attackRerollsRemaining: number
  attackValueCounts: rollCounts
  winningPlayerIndex: number | undefined
}
