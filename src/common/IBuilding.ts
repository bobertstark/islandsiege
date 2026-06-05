import { IBaseContainer } from './IBase'
import type { ShellColor } from './colors'

// A building attached to a fort. Its colonists return to the player's supply if
// the fort is destroyed; repair is the shell laid when first placed.
export default interface IBuilding extends IBaseContainer {
  type: 'building'
  description: string
  cost: number
  coins: number
  repair: ShellColor[]
}
