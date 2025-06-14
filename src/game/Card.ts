import type { CubeColor } from '../lib/colors'
import type { FortGridSpec } from './FortGrid'

export type CardType = 'building' | 'fort' | 'ship'

export interface Card {
  id: string
  type: CardType
  name: string
  description: string
}

export interface FortCard extends Card {
  gridSpec: FortGridSpec
  slots: number // number of colonist slots
}

export interface BuildingCard extends Card {
  cost: number // colonists required on fort
  coins: number // coins awarded when played
  repairColor: CubeColor // cube color to use for repair when played - AFAIK, always singular.
}

export interface ShipCard extends Card {
  cost: number // colonists required on fort
  coins: number // coins awarded when played
}
