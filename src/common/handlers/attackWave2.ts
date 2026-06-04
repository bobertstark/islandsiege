import IGameState from 'common/IGameState'
import { findFort } from 'common/player'
import { destroyAt } from 'common/fortGrid'

export function handleAttackWave2(
  state: IGameState,
  payload: { attackLocs: [number, number][] },
): IGameState {
  const numT = state.attackValueCounts['T'] ?? 0
  if (payload.attackLocs.length !== numT) {
    throw new Error(
      `Expected ${numT} locations, got ${payload.attackLocs.length}`,
    )
  }

  const { targetPlayerIndex, fortID } =
    state.shipLocations[state.currentPlayerIndex]!
  const players = [...state.players]
  const target = players[targetPlayerIndex!]
  const fort = findFort(target, fortID!)

  let grid = fort.grid
  for (const loc of payload.attackLocs) {
    grid = destroyAt(grid, loc)
  }

  const updatedFort = { ...fort, grid }
  players[targetPlayerIndex!] = {
    ...target,
    forts: target.forts.map(f => (f.id === fortID ? updatedFort : f)),
  }

  return { ...state, players, phase: 'attackDestroy' }
}
