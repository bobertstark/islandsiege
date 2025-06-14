import type { CardType, ShipCard } from './Card'
import type { Effect } from './Effect'

export class Ship implements ShipCard {
  id: string
  type: CardType = 'ship'
  name: string
  description: string
  cost: number
  coins: number
  colonists: number = 0
  effect?: Effect

  constructor(data: ShipCard, effect?: Effect) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.cost = data.cost
    this.coins = data.coins
    this.effect = effect
  }
}
