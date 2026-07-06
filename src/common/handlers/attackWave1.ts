import IGameState from 'common/IGameState'
import { DieValue } from 'common/die'
import { findFort } from 'common/player'
import { attackAt } from 'common/fortGrid'
import { ILogEntry } from 'common/ILog'
import { resolvePostWave1Phase } from './attackReinforceOrWave2'
import { transitionToWave2 } from './attackWave2'

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
  const intermediate = {
    ...state,
    players,
    diceBank,
    log: [...state.log, logEntry],
  }
  const next = resolvePostWave1Phase(intermediate)
  if (next === 'attackWave2') return transitionToWave2(intermediate)
  return { ...intermediate, phase: next ?? 'attackReinforceOrWave2' }
}
