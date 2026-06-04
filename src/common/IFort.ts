import type { FortGridSpec, FortGridState } from './fortGrid'
import IBuilding from './IBuilding'

// A fort in play: card identity, live shell grid, colonist-slot accounting,
// and attached buildings. Total colonists are derived (fortColonists), not
// stored. Buildings live here with no back-reference, keeping state acyclic.
export default interface IFort {
  id: string
  name: string
  type: 'fort'
  description: string
  gridSpec: FortGridSpec
  grid: FortGridState
  slots: number
  openSlots: number
  usedSlots: number
  buildings: IBuilding[]
}
