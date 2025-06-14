import type { CardType, BuildingCard } from './Card'
import { Fort } from './Fort'
import type { CubeColor } from '../common/colors'
import type { Player } from './Player'
import type { Effect } from './Effect'

export class Building implements BuildingCard {
  id: string
  type: CardType = 'building'
  name: string
  description: string
  cost: number
  coins: number
  repairColor: CubeColor

  colonists: number = 0
  effect?: Effect
  fort?: Fort

  constructor(data: BuildingCard, effect?: Effect) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.cost = data.cost
    this.coins = data.coins
    this.repairColor = data.repairColor
    this.effect = effect
  }

  placeColonists(count: number = 1): boolean {
    this.colonists += count
    return true // no max for buildings
  }

  removeColonists(count: number = 1, player?: Player): boolean {
    if (count > this.colonists) {
      return false
    }
    this.colonists -= count
    // Perhaps we should pass in a callback function instead
    if (player) {
      player.returnColonists(count)
    }
    return true
  }

  destroy(player?: Player): void {
    this.fort = undefined
    if (player) {
      player.returnColonists(this.colonists)
    }
  }
}
