import IGameState from 'common/IGameState'
import { findFort, destroyFort } from 'common/player'
import { fortShellsRemaining } from 'common/fort'

export function handleAttackDestroy(state: IGameState): IGameState {
  const { targetPlayerIndex, fortID } =
    state.shipLocations[state.currentPlayerIndex]!
  const players = [...state.players]
  const target = players[targetPlayerIndex!]
  const fort = findFort(target, fortID!)

  if (fortShellsRemaining(fort) > 0) {
    return { ...state, phase: 'endTurn' }
  }

  players[targetPlayerIndex!] = destroyFort(target, fortID!)
  return { ...state, players, phase: 'endTurn' }
}
