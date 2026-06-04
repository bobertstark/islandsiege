import IGameState from 'common/IGameState'
import { DieValue } from 'common/die'
import { findFort } from 'common/player'
import { attackAt } from 'common/fortGrid'

export function handleAttackWave1(
  state: IGameState,
  payload: { attackColor: DieValue; attackLoc: [number, number] },
): IGameState {
  const { targetPlayerIndex, fortID } =
    state.shipLocations[state.currentPlayerIndex]!
  const players = [...state.players]
  const target = players[targetPlayerIndex!]
  const fort = findFort(target, fortID!)
  const strength = state.diceBank[payload.attackColor] ?? 0
  const diceBank = { ...state.diceBank }
  delete diceBank[payload.attackColor]

  const { grid: updatedGrid } = attackAt(fort.grid, payload.attackLoc, strength)
  const updatedFort = { ...fort, grid: updatedGrid }
  players[targetPlayerIndex!] = {
    ...target,
    forts: target.forts.map(f => (f.id === fortID ? updatedFort : f)),
  }

  return {
    ...state,
    players,
    diceBank,
    phase: 'attackReinforceOrWave2',
  }
}
