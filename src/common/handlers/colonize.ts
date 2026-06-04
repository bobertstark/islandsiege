import IGameState from 'common/IGameState'
import { populateForts } from 'common/player'

export function handleColonize(state: IGameState): IGameState {
  const players = [...state.players]
  players[state.currentPlayerIndex] = populateForts(
    players[state.currentPlayerIndex],
  )
  return { ...state, players, phase: 'action' }
}
