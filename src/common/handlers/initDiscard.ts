import IGameState from 'common/IGameState'

export function handleInitDiscard(
  state: IGameState,
  payload: { playerIdx: number; cardID: string },
): IGameState {
  const pending = { ...state.pending, [payload.playerIdx]: payload.cardID }

  if (Object.keys(pending).length < state.players.length) {
    return { ...state, phase: 'initDiscard', pending }
  }
  return { ...state, phase: 'initDistribute', pending }
}
