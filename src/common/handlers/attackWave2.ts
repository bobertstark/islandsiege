import IGameState from 'common/IGameState'
import { findFort } from 'common/player'
import { destroyAt } from 'common/fortGrid'
import { ILogEntry } from 'common/ILog'

export function handleAttackWave2(
  state: IGameState,
  payload: { attackLocs: [number, number][] },
): IGameState {
  const numT = state.diceBank['T'] ?? 0
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

  const logEntry: ILogEntry = {
    phase: 'attackWave2',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: {
      targetPlayerIndex: targetPlayerIndex!,
      fortID: fortID!,
      attackLocs: payload.attackLocs,
      tDiceUsed: state.diceBank['T'] ?? 0,
    },
  }
  const diceBank = { ...state.diceBank }
  delete diceBank['T']

  return {
    ...state,
    players,
    diceBank,
    phase: 'attackDestroy',
    log: [...state.log, logEntry],
  }
}
