import IGameState from 'common/IGameState'
import { DieValue } from 'common/die'
import { findFort } from 'common/player'
import { attackAt } from 'common/fortGrid'
import { ILogEntry } from 'common/ILog'
import { resolvePostWave1Phase } from './attackReinforceOrWave2'

export function handleAttackWave1(
  state: IGameState,
  payload: { attackColor: DieValue; attackLoc?: [number, number] },
): IGameState {
  const { targetPlayerIndex, fortID } =
    state.shipLocations[state.currentPlayerIndex]!
  const players = [...state.players]
  const target = players[targetPlayerIndex!]
  const fort = findFort(target, fortID!)
  const strength = state.diceBank[payload.attackColor] ?? 0
  const diceBank = { ...state.diceBank }
  delete diceBank[payload.attackColor]

  if (payload.attackLoc) {
    const { grid: updatedGrid } = attackAt(
      fort.grid,
      payload.attackLoc,
      strength,
    )
    const updatedFort = { ...fort, grid: updatedGrid }
    players[targetPlayerIndex!] = {
      ...target,
      forts: target.forts.map(f => (f.id === fortID ? updatedFort : f)),
    }
  }

  const logEntry: ILogEntry = {
    phase: 'attackWave1',
    playerIndex: state.currentPlayerIndex,
    turn: state.currentPlayerIndex,
    timestamp: new Date().toISOString(),
    data: {
      targetPlayerIndex: targetPlayerIndex!,
      fortID: fortID!,
      attackColor: payload.attackColor,
      strength,
      attackLoc: payload.attackLoc,
    },
  }
  const next = resolvePostWave1Phase({ ...state, diceBank, players })
  return {
    ...state,
    players,
    diceBank,
    phase: next ?? 'attackReinforceOrWave2',
    log: [...state.log, logEntry],
  }
}
