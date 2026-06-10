import IShip from './IShip'
import ICard from './ICard'
import type ILeadershipAbility from './ILeadershipAbility'

export interface ShipData {
  id: string
  name: string
  description: string
  cost: number
  coins: number
  leadershipAbility?: ILeadershipAbility
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
    leadershipAbility: data.leadershipAbility,
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
