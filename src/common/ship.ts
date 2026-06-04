import IShip from './IShip'

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
