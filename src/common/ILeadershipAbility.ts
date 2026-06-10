import type { DieValue } from './die'

export type LeadershipEffect =
  | 'destroyShip'
  | 'addDie'
  | 'gainCoin'
  | 'returnFortColonist'

export default interface ILeadershipAbility {
  cost: number
  effect: LeadershipEffect
  face?: DieValue // only for addDie
}
