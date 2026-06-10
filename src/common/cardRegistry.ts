import cardData from '../assets/cards.json'
import ICard from './ICard'
import IFort from './IFort'
import IBuilding from './IBuilding'
import IShip from './IShip'
import { createFort, FortData } from './fort'
import { createBuilding, BuildingData } from './building'
import { createShip, ShipData } from './ship'
import { CARD_EFFECTS } from './cardEffects'

// cards.json is the single source of truth
// The cast is only needed because TS infers the grid tuples too loosely to match FortGridSpec.
export const ALL_CARDS = cardData.cards as unknown as ICard[]

const byId: Record<string, ICard> = ALL_CARDS.reduce(
  (acc, card) => {
    acc[card.id] = card
    return acc
  },
  {} as Record<string, ICard>,
)

function card(id: string): ICard {
  const c = byId[id]
  if (!c) throw new Error(`Unknown card id: ${id}`)
  return c
}

export function createFortById(id: string): IFort {
  const c = card(id)
  const data: FortData = {
    id: c.id,
    name: c.name,
    description: c.description,
    gridSpec: c.gridSpec!,
    slots: c.slots!,
  }
  return createFort(data)
}

export function createBuildingById(id: string): IBuilding {
  const c = card(id)
  const data: BuildingData = {
    id: c.id,
    name: c.name,
    description: c.description,
    cost: c.cost!,
    coins: c.coins!,
    repair: c.repair!,
  }
  return createBuilding(data)
}

export function createShipById(id: string): IShip {
  const c = card(id)
  const data: ShipData = {
    id: c.id,
    name: c.name,
    description: c.description,
    cost: c.cost!,
    coins: c.coins!,
    leadershipAbility: CARD_EFFECTS[id]?.shipAbility,
  }
  return createShip(data)
}
