import IFort from './IFort'
import IBuilding from './IBuilding'
import ICard from './ICard'
import {
  createFortGrid,
  buildSpec,
  shellsRemaining as gridShellsRemaining,
  FortGridSpec,
} from './fortGrid'
import {
  placeColonists as buildingPlaceColonists,
  buildingCard,
} from './building'
import { colorToSymbol } from './colors'

export interface FortData {
  id: string
  name: string
  description: string
  gridSpec: FortGridSpec
  slots: number
}

export function createFort(data: FortData): IFort {
  return {
    id: data.id,
    name: data.name,
    type: 'fort',
    description: data.description,
    gridSpec: data.gridSpec,
    grid: createFortGrid(data.gridSpec),
    slots: data.slots,
    openSlots: data.slots,
    usedSlots: 0,
    buildings: [],
  }
}

// Colonists in the fort's slots plus those in its buildings.
export function totalColonists(fort: IFort): number {
  return (
    fort.buildings.reduce((sum, b) => sum + b.colonists, 0) + fort.usedSlots
  )
}

export function fortShellsRemaining(fort: IFort): number {
  return gridShellsRemaining(fort.grid)
}

// Occupy slots; fails (no change) if the fort lacks the room.
export function placeColonists(
  fort: IFort,
  count: number = 1,
): { fort: IFort; placed: boolean } {
  if (count > fort.openSlots || fort.usedSlots + count > fort.slots) {
    return { fort, placed: false }
  }
  return {
    fort: {
      ...fort,
      usedSlots: fort.usedSlots + count,
      openSlots: fort.openSlots - count,
    },
    placed: true,
  }
}

// Free slots; fails (no change) if that many aren't occupied.
export function removeColonists(
  fort: IFort,
  count: number = 1,
): { fort: IFort; removed: boolean } {
  if (count > fort.usedSlots) {
    return { fort, removed: false }
  }
  return {
    fort: {
      ...fort,
      usedSlots: fort.usedSlots - count,
      openSlots: fort.openSlots + count,
    },
    removed: true,
  }
}

export function buildCubes(fort: IFort, spec: FortGridSpec): IFort {
  return { ...fort, grid: buildSpec(fort.grid, spec).grid }
}

// Attach a building, moving its cost in colonists from the fort's slots into the
// building, optionally laying a repair shell at repairAt. Throws if the fort
// hasn't enough occupied slots to staff it.
export function addBuilding(
  fort: IFort,
  building: IBuilding,
  repairAt?: [number, number],
): IFort {
  if (fort.usedSlots < building.cost) {
    throw new Error(
      `Attempting to build ${building.id} (requires ${building.cost}) but ${fort.id} only has ${fort.usedSlots}`,
    )
  }

  const staffed = buildingPlaceColonists(building, building.cost)
  let next: IFort = { ...fort, buildings: [...fort.buildings, staffed] }
  next = removeColonists(next, building.cost).fort

  if (repairAt) {
    const symbol = colorToSymbol(building.repair[0])
    next = buildCubes(next, [[repairAt[0], repairAt[1], symbol]])
  }

  return next
}

// Remove a building, reporting its colonists as freed for return to supply.
// Throws if the building isn't on this fort.
export function removeBuilding(
  fort: IFort,
  buildingID: string,
): { fort: IFort; freed: number } {
  const idx = fort.buildings.findIndex(b => b.id === buildingID)
  if (idx === -1) {
    throw new Error(`Building not found in fort ${fort.id}`)
  }
  const freed = fort.buildings[idx].colonists
  return {
    fort: {
      ...fort,
      buildings: [
        ...fort.buildings.slice(0, idx),
        ...fort.buildings.slice(idx + 1),
      ],
    },
    freed,
  }
}

// Destroy a building: detach it, return colonists to supply, and yield its card
// for the discard pile.
export function destroyBuilding(
  fort: IFort,
  buildingID: string,
): { fort: IFort; freed: number; card: ICard } {
  const idx = fort.buildings.findIndex(b => b.id === buildingID)
  if (idx === -1) {
    throw new Error(`Building not found in fort ${fort.id}`)
  }
  const building = fort.buildings[idx]
  return {
    fort: {
      ...fort,
      buildings: [
        ...fort.buildings.slice(0, idx),
        ...fort.buildings.slice(idx + 1),
      ],
    },
    freed: building.colonists,
    card: buildingCard(building),
  }
}

export function fortCard(fort: IFort): ICard {
  return {
    id: fort.id,
    name: fort.name,
    type: fort.type,
    description: fort.description,
    gridSpec: fort.gridSpec,
    slots: fort.slots,
  }
}

// All cards on a fort (the fort itself plus any buildings) as plain ICard values.
export function fortCards(fort: IFort): ICard[] {
  return [fortCard(fort), ...fort.buildings.map(buildingCard)]
}

// High-level destroy: freed colonists for the supply + cards for the discard pile.
export function destroyFort(fort: IFort): { freed: number; cards: ICard[] } {
  return { freed: totalColonists(fort), cards: fortCards(fort) }
}
