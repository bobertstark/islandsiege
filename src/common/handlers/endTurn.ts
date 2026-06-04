import IGameState from 'common/IGameState'

export function handleEndTurn(state: IGameState): IGameState {
  const next = (state.currentPlayerIndex + 1) % state.players.length
  return { ...state, currentPlayerIndex: next, phase: 'victory' }
}
