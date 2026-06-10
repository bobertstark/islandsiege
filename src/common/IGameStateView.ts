import { Phase } from './phases'
import ICard from './ICard'
import IPlayer from './IPlayer'
import { ShellReserve } from './colors'
import { DieValue } from './die'
import { rollCounts } from './attackRoll'
import { ILogEntry } from './ILog'
import { AttackFlags } from './cardEffects'

// Per-player view: hidden information removed.
// deck → deckCount; opponents' hands → count; own hand + discard in full.
export interface IPlayerView extends Omit<IPlayer, 'hand' | 'id'> {
  hand: ICard[] | number
}

export default interface IGameStateView {
  myPlayerIndex: number
  players: IPlayerView[]
  playerCount?: number // lobby only
  waitingPlayers: IPlayerView[] // lobby only
  isSeated: boolean // lobby only
  isCreator: boolean // lobby only
  queuePosition?: number // lobby only — 1-based position in waitingPlayers
  readyPlayers: number[]
  currentPlayerIndex: number
  deckCount: number
  discard: ICard[]
  shuffleCount: number
  drawnCards: ICard[]
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
  diceBank: rollCounts
  winningPlayerIndex: number | undefined
  pendingBuildCardID?: string
  attackFlags?: AttackFlags
  log: ILogEntry[]
}
