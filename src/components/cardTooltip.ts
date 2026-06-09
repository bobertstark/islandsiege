import IFort from 'common/IFort'
import IShip from 'common/IShip'
import IBuilding from 'common/IBuilding'
import { totalColonists } from 'common/fort'

function colonists(n: number): string {
  return `${n} colonist${n === 1 ? '' : 's'}`
}

export function fortTooltip(fort: IFort): string {
  const buildings = fort.buildings.length
    ? `Buildings: ${fort.buildings.map(b => b.name).join(', ')}`
    : 'No buildings'
  return `Fort\nTotal colonists: ${totalColonists(fort)}\n${buildings}`
}

export function shipTooltip(ship: IShip): string {
  return `Ship\n${colonists(ship.colonists)}`
}

export function buildingTooltip(building: IBuilding): string {
  return `Building\n${colonists(building.colonists)}`
}
