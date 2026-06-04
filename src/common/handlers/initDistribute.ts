import IGameState from 'common/IGameState'
import { removeCardInHand, addCardsToHand } from 'common/player'

export function handleInitDistribute(state: IGameState): IGameState {
  const pending = state.pending || {}
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
