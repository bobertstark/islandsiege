import IPlayer from './IPlayer'
import ICard from './ICard'
import IShip from './IShip'
import IFort from './IFort'
import { ShellColor } from './colors'
import {
  placeColonists as fortPlaceColonists,
  removeColonists as fortRemoveColonists,
  destroyFort as fortDestroy,
} from './fort'
import { addColonists as shipAddColonists } from './ship'

export const MAX_COLONISTS = 9

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
    diceRerolls: 1,
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

// Remove a fort, returning its colonists (slots + buildings) to the supply.
export function destroyFort(player: IPlayer, fortID: string): IPlayer {
  const fort = findFort(player, fortID)
  const { freed } = fortDestroy(fort)
  return {
    ...player,
    colonists: player.colonists + freed,
    forts: player.forts.filter(f => f.id !== fortID),
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
