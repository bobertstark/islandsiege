import { IBase } from './IBase'
import type { FortGridSpec } from './fortGrid'
import type { ShellColor } from './colors'

// The full card-data shape (mirrors a cards.json row). Type-specific fields are
// optional: forts use gridSpec/slots, buildings/ships use cost/coins, buildings
// also use repair.
export default interface ICard extends IBase {
  type: string
  description: string
  cost?: number
  gridSpec?: FortGridSpec
  slots?: number
  coins?: number
  repair?: ShellColor[]
}
