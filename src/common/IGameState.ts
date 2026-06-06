import IPlayer from './IPlayer'
import ICard from './ICard'
import { ShellReserve } from './colors'
import { DieValue } from './die'
import { Phase } from './phases'
import { rollCounts } from './attackRoll'
import { ILogEntry } from './ILog'

// Full game state: plain data, safe to store or send over the wire.
export default interface IGameState {
  players: IPlayer[]
  playerCount: number
  readyPlayers: number[] // lobby only — indices of players who have confirmed ready
  currentPlayerIndex: number

  // Draw and discard piles
  deck: ICard[]
  discard: ICard[]
  shuffleCount: number

  // Cards drawn this turn — shown separately from hand until player discards one
  drawnCards: ICard[]

  // Per-player cards held during initDraw — not yet in hand until phase resolves
  initDrawCards?: { [playerIdx: number]: ICard[] }

  phase: Phase

  // Wait for all player actions to synchronize (e.g. initial discard)
  pending?: { [playerIdx: number]: string }

  // Track player protection / ship placement, once attacked
  shipLocations: {
    [playerIndex: number]: {
      targetPlayerIndex?: number
      fortID?: string
    }
  }

  shellReserve: ShellReserve

  // Current attack only
  attackIsOpenWater: boolean
  attackRoll: DieValue[] | undefined
  attackRerollsRemaining: number
  diceBank: rollCounts

  winningPlayerIndex: number | undefined

  buildContext?: { cardID: string; fortID?: string }
  pendingBuildCardID?: string

  log: ILogEntry[]

  // Server-only - not sent to clients
  rngSeed: number
}
