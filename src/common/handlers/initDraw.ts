import IGameState from 'common/IGameState'
import { removeCardInHand, addCardsToHand } from 'common/player'

export function handleInitDraw(
  state: IGameState,
  payload: { playerIdx: number; cardID: string },
): IGameState {
  const pending = { ...state.pending, [payload.playerIdx]: payload.cardID }

  if (Object.keys(pending).length < state.players.length) {
    return { ...state, phase: 'initDraw', pending }
  }

  // All players have submitted — apply distribution now
  let players = [...state.players]
  Object.entries(pending).forEach(([idxStr, cardID]) => {
    const idx = parseInt(idxStr, 10)
    const nextIdx = (idx + 1) % players.length
    const { player: fromPlayer, card } = removeCardInHand(players[idx], cardID)
    players[idx] = fromPlayer
    players[nextIdx] = addCardsToHand(players[nextIdx], [card])
  })

  return { ...state, players, pending: {}, phase: 'action' }
}
