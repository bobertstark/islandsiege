import IPlayer from './IPlayer'
import ICard from './ICard'
import { ShellReserve } from './colors'
import { DieValue } from './die'
import { Phase } from './phases'
import { rollCounts } from './attackRoll'

// Full game state: plain data, safe to store or send over the wire.
export default interface IGameState {
  players: IPlayer[]
  currentPlayerIndex: number

  // Draw and discard piles
  deck: ICard[]
  discard: ICard[]
  shuffleCount: number

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
  attackValueCounts: rollCounts

  winningPlayerIndex: number | undefined
}
