import type { CubeReserve } from '../types'
import type { Fort } from './Fort'
import type { Ship } from './Ship'
import type { Building } from './Building'
import type { Card } from './Card'

export class Player {
  static MAX_COLONISTS = 9
  readonly id: string
  readonly name: string

  coins: number = 0
  hand: Card[] = []
  buildings: Building[] = []
  forts: Fort[] = []
  ships: Ship[] = []

  colonists: number = Player.MAX_COLONISTS
  cubes: CubeReserve = { black: 0, gray: 0, white: 0 }
  attack_dice: number = 2
  rerolls: number = 1

  constructor(name: string, idx: number, overrides: Partial<Player> = {}) {
    this.id = `p${idx}`
    this.name = name
    Object.assign(this, overrides)

    // Deep merge cube reserve
    this.cubes = {
      black: 0,
      gray: 0,
      white: 0,
      ...(overrides.cubes || {}),
    }
  }

  removeCardInHand(cardID: string): Card | undefined {
    const cardIdx = this.hand.findIndex((c: Card) => c.id === cardID)
    if (cardIdx === -1) return undefined
    const [card] = this.hand.splice(cardIdx, 1)
    return card
  }

  returnColonists(count: number) {
    this.colonists += count
  }

  populateForts(): void {
    this.forts.forEach((f: Fort) => {
      if (this.colonists <= 0) {
        return
      }
      const placed = f.placeColonists()
      if (placed) {
        this.colonists -= 1
      }
    })
  }

  removeColonists(count: number) {
    if (this.colonists < count) {
      throw new Error(
        `Not enough colonists: has ${this.colonists}, needs ${count}`,
      )
    }
    this.colonists -= count
  }

  addFort(fort: Fort) {
    this.forts.push(fort)
  }

  findFort(fortID: string): Fort {
    const fort = this.forts.find(fort => fort.id === fortID)
    if (!fort) {
      throw new Error(`Player ${this.id} has no fort ${fortID}`)
    }
    return fort
  }

  addShip(ship: Ship, fortID: string): void {
    const fort = this.findFort(fortID)
    if (fort.usedSlots < ship.cost) {
      throw new Error(
        `Ship requires ${ship.cost} colonists but only ${fort.usedSlots} available in ${fort.id}`,
      )
    }
    fort.removeColonists(ship.cost)
    ship.addColonists(ship.cost)
    this.removeColonists(ship.cost)
    this.ships.push(ship)
  }

  addBuilding(building: Building) {
    this.buildings.push(building)
  }

  totalColonists(): number {
    const fortColonists = this.forts.reduce((sum, f) => sum + f.colonists, 0)
    const buildingColonists = this.buildings.reduce(
      (sum, b) => sum + b.colonists,
      0,
    )
    const shipColonists = this.ships.reduce((sum, s) => sum + s.colonists, 0)
    return this.colonists + fortColonists + buildingColonists + shipColonists
  }
}
