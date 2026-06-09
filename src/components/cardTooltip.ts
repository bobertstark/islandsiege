import IFort from 'common/IFort'
import IShip from 'common/IShip'
import IBuilding from 'common/IBuilding'

function colonists(n: number): string {
  return `${n} colonist${n === 1 ? '' : 's'}`
}

// Native hover-tooltip text for the in-play cards: type, colonists, and (for a
// fort) its attached buildings.
export function fortTooltip(fort: IFort): string {
  const buildings = fort.buildings.length
    ? `Buildings: ${fort.buildings.map(b => b.name).join(', ')}`
    : 'No buildings'
  return `Fort\n${colonists(fort.usedSlots)}\n${buildings}`
}

export function shipTooltip(ship: IShip): string {
  return `Ship\n${colonists(ship.colonists)}`
}

export function buildingTooltip(building: IBuilding): string {
  return `Building\n${colonists(building.colonists)}`
}
