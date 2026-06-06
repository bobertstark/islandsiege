import { IBaseContainer } from './IBase'
import type ILeadershipAbility from './ILeadershipAbility'

// A ship in play. Holds colonists independently of any fort, so they are not
// returned to supply when a fort is destroyed.
export default interface IShip extends IBaseContainer {
  type: 'ship'
  description: string
  cost: number
  coins: number
  leadershipAbility?: ILeadershipAbility
}
