import { IBase } from './IBase'
import type { FortGridSpec } from './IFort'

export default interface ICard extends IBase {
  type: string
  description: string
  cost?: number // ships and buildings require colonists on fort
  grid?: FortGridSpec // convey current shell layout
  slots?: number
  coins?: number
}
