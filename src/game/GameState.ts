import { Player } from './Player'
import { Deck } from './Deck'
import { DieValue } from './Die'
import { Phase } from '../common/phases'
import type { rollCounts } from './AttackRoll'
import { ShellReserve } from './Game'
import { stateMapping } from 'common/stateMachine'

export type GameState = {
  players: Player[]
  currentPlayerIndex: number
  deck: Deck
  phase: Phase

  pending?: { [playerIdx: number]: string } // wait for all player actions to synchronize
  shipLocations: {
    // Track player protection, once attacked
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

export function createInitialGameState(): GameState {
  return {
    players: [],
    currentPlayerIndex: 0,
    deck: new Deck(),
    phase: GamePhases.initGame,
    pending: {},
    shipLocations: {},
    shellReserve: {} as ShellReserve,
    attackIsOpenWater: false,
    attackRoll: undefined,
    attackRerollsRemaining: 0,
    attackValueCounts: {},
    winningPlayerIndex: undefined,
  }
}
