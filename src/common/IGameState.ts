import IPlayer from './IPlayer'
import ICard from './ICard'
import { ShellReserve } from 'game/Game'
import { DieValue } from 'game/Die'
import { Phase } from './phases'
import { rollCounts } from 'game/AttackRoll'

export default interface IGameState {
  players: IPlayer[]
  activePlayerIdx: number
  turn: number
  phase: Phase

  deck: ICard[]
  discard: ICard[]
  shellReserve: ShellReserve

  attack: IAttackState
  winningPlayerID: string | undefined
}

interface IAttackState {
  // Track who is eligible for attacks
  attackedPlayerIDs: Set<string>

  // Current attack only
  isOpenWaters: boolean
  attackingPlayerID: string
  attackedPlayerID: string | undefined
  rollValues: DieValue[]
  rollCounts: rollCounts
}
