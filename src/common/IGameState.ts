import IPlayer from './IPlayer'
import ICard from './ICard'
import { ShellReserve } from './colors'
import { DieValue } from './die'
import { Phase } from './phases'
import { rollCounts } from './attackRoll'
import { ILogEntry } from './ILog'
import { AttackFlags } from './cardEffects'

// Describes a choice the non-active (defender) player must make before the
// attacker's turn continues. Add new variants here as more cards need it.
export type DefenderChoiceSpec =
  | { type: 'saboteurShell' }
  | { type: 'coveShip' }
  | { type: 'barricadedReroll'; rerolledIndex?: number }
  | { type: 'guardedWave2' }

// Full game state: plain data, safe to store or send over the wire.
export default interface IGameState {
  players: IPlayer[]
  playerCount?: number // lobby only
  waitingPlayers: IPlayer[] // lobby only — players beyond the seat count, in arrival order
  creatorId?: string // lobby only — authorises kick and setPlayerCount
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

  // Defender passive dice/reroll modifiers for the current attack; set when the
  // target fort is locked, cleared at end of turn.
  attackFlags?: AttackFlags

  // Pending choice the non-active (defender) player must make; cleared when
  // handleNonActiveChoice resolves it.
  defenderChoice?: DefenderChoiceSpec

  winningPlayerIndex: number | undefined

  pendingBuildCardID?: string

  log: ILogEntry[]

  // Server-only - not sent to clients
  rngSeed: number
}
