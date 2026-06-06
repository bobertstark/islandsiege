import IShip from './IShip'
import ICard from './ICard'

export interface ShipData {
  id: string
  name: string
  description: string
  cost: number
  coins: number
}

export function createShip(data: ShipData): IShip {
  return {
    id: data.id,
    name: data.name,
    type: 'ship',
    description: data.description,
    cost: data.cost,
    coins: data.coins,
    colonists: 0,
  }
}

export function addColonists(ship: IShip, count: number): IShip {
  return { ...ship, colonists: ship.colonists + count }
}

export function removeColonists(ship: IShip, count: number): IShip {
  return { ...ship, colonists: ship.colonists - count }
}

export function shipCard(ship: IShip): ICard {
  return {
    id: ship.id,
    name: ship.name,
    type: ship.type,
    description: ship.description,
    cost: ship.cost,
    coins: ship.coins,
  }
}
