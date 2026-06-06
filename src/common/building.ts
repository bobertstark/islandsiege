import IBuilding from './IBuilding'
import ICard from './ICard'
import { ShellColor } from './colors'

export interface BuildingData {
  id: string
  name: string
  description: string
  cost: number
  coins: number
  repair: ShellColor[]
}

export function createBuilding(data: BuildingData): IBuilding {
  return {
    id: data.id,
    name: data.name,
    type: 'building',
    description: data.description,
    cost: data.cost,
    coins: data.coins,
    repair: data.repair,
    colonists: 0,
  }
}

export function placeColonists(
  building: IBuilding,
  count: number = 1,
): IBuilding {
  return { ...building, colonists: building.colonists + count }
}

export function buildingCard(building: IBuilding): ICard {
  return {
    id: building.id,
    name: building.name,
    type: building.type,
    description: building.description,
    cost: building.cost,
    coins: building.coins,
    repair: building.repair,
  }
}

// Remove colonists, reporting how many left; over-removal returns 0.
export function removeColonists(
  building: IBuilding,
  count: number = 1,
): { building: IBuilding; removed: number } {
  if (count > building.colonists) {
    return { building, removed: 0 }
  }
  return {
    building: { ...building, colonists: building.colonists - count },
    removed: count,
  }
}
