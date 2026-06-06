import IPlayer from './IPlayer'
import ICard from './ICard'
import IShip from './IShip'
import IFort from './IFort'
import { ShellColor } from './colors'
import ILeadershipAbility from './ILeadershipAbility'
import {
  placeColonists as fortPlaceColonists,
  removeColonists as fortRemoveColonists,
  destroyFort as fortDestroy,
  destroyBuilding as fortDestroyBuilding,
} from './fort'
import { addColonists as shipAddColonists, shipCard } from './ship'

export const MAX_COLONISTS = 9

const INNATE_LEADERSHIP: ILeadershipAbility[] = [
  { cost: 2, effect: 'destroyShip' },
]

export function createPlayer(
  id: string,
  name: string,
  overrides: Partial<IPlayer> = {},
): IPlayer {
  const { shells, ...rest } = overrides
  return {
    id,
    name,
    colonists: MAX_COLONISTS,
    coins: 0,
    attackDice: 3,
    diceRerolls: 2,
    leadershipAbilities: INNATE_LEADERSHIP,
    hand: [],
    forts: [],
    ships: [],
    ...rest,
    // deep-merge the shell reserve so partial overrides keep the other colours
    shells: { black: 0, gray: 0, white: 0, ...(shells || {}) },
  }
}

export function addCardsToHand(player: IPlayer, cards: ICard[]): IPlayer {
  return { ...player, hand: [...player.hand, ...cards] }
}

export function removeCardInHand(
  player: IPlayer,
  cardID: string,
): { player: IPlayer; card: ICard } {
  const idx = player.hand.findIndex(c => c.id === cardID)
  if (idx === -1) {
    throw new Error(`${player.id}: Card ${cardID} not in hand`)
  }
  return {
    player: {
      ...player,
      hand: [...player.hand.slice(0, idx), ...player.hand.slice(idx + 1)],
    },
    card: player.hand[idx],
  }
}

export function findFort(player: IPlayer, fortID: string): IFort {
  const fort = player.forts.find(f => f.id === fortID)
  if (!fort) {
    throw new Error(`Player ${player.id} has no fort ${fortID}`)
  }
  return fort
}

// All leadership abilities available to the player: innate + those granted by
// ships and buildings currently in play. Abilities on destroyed cards are gone.
export function allLeadershipAbilities(player: IPlayer): ILeadershipAbility[] {
  const fromShips = player.ships
    .filter(s => s.leadershipAbility)
    .map(s => s.leadershipAbility!)
  const fromBuildings = player.forts
    .flatMap(f => f.buildings)
    .filter(b => b.leadershipAbility)
    .map(b => b.leadershipAbility!)
  return [...player.leadershipAbilities, ...fromShips, ...fromBuildings]
}

export function addFort(player: IPlayer, fort: IFort): IPlayer {
  return { ...player, forts: [...player.forts, fort] }
}

// Place 1 colonist on each fort with room, drawing from the player's supply.
export function populateForts(player: IPlayer): IPlayer {
  let colonists = player.colonists
  const forts = player.forts.map(fort => {
    if (colonists <= 0) return fort
    const { fort: next, placed } = fortPlaceColonists(fort)
    if (placed) colonists -= 1
    return next
  })
  return { ...player, forts, colonists }
}

// Staff a ship from the fort's slots. The colonists already left the supply when
// placed on the fort, so the player's pool is unchanged here.
export function addShip(player: IPlayer, ship: IShip, fortID: string): IPlayer {
  const fort = findFort(player, fortID)
  if (fort.usedSlots < ship.cost) {
    throw new Error(
      `Ship requires ${ship.cost} colonists but only ${fort.usedSlots} available in ${fort.id}`,
    )
  }
  const { fort: updatedFort } = fortRemoveColonists(fort, ship.cost)
  return {
    ...player,
    forts: player.forts.map(f => (f.id === fortID ? updatedFort : f)),
    ships: [...player.ships, shipAddColonists(ship, ship.cost)],
  }
}

// Remove a fort, returning its colonists to the supply and its cards for discard.
export function destroyFort(
  player: IPlayer,
  fortID: string,
): { player: IPlayer; cards: ICard[] } {
  const fort = findFort(player, fortID)
  const { freed, cards } = fortDestroy(fort)
  return {
    player: {
      ...player,
      colonists: player.colonists + freed,
      forts: player.forts.filter(f => f.id !== fortID),
    },
    cards,
  }
}

// Destroy a building on one of the player's forts, returning its colonists to
// the supply and its card for the discard pile.
export function destroyBuilding(
  player: IPlayer,
  fortID: string,
  buildingID: string,
): { player: IPlayer; card: ICard } {
  const fort = findFort(player, fortID)
  const {
    fort: updatedFort,
    freed,
    card,
  } = fortDestroyBuilding(fort, buildingID)
  return {
    player: {
      ...player,
      colonists: player.colonists + freed,
      forts: player.forts.map(f => (f.id === fortID ? updatedFort : f)),
    },
    card,
  }
}

export function updateShells(
  player: IPlayer,
  color: ShellColor,
  count: number,
): IPlayer {
  const newCount = Math.max(0, (player.shells[color] ?? 0) + count)
  return { ...player, shells: { ...player.shells, [color]: newCount } }
}

export function destroyShip(
  player: IPlayer,
  shipID: string,
): { player: IPlayer; card: ICard } {
  const ship = player.ships.find(s => s.id === shipID)
  if (!ship) {
    throw new Error(`Player ${player.id} has no ship ${shipID}`)
  }
  return {
    player: {
      ...player,
      colonists: player.colonists + ship.colonists,
      ships: player.ships.filter(s => s.id !== shipID),
    },
    card: shipCard(ship),
  }
}
