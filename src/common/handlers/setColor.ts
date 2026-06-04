import IGameState from 'common/IGameState'

export function handleSetColor(
  state: IGameState,
  payload: { playerIdx: number; color: string },
): IGameState {
  if (state.phase !== 'lobby') return state
  if (payload.playerIdx < 0 || payload.playerIdx >= state.players.length) {
    return state
  }
  const players = state.players.map((p, i) =>
    i === payload.playerIdx ? { ...p, color: payload.color } : p,
  )
  return { ...state, players }
}
