import IGameState from 'common/IGameState'
import { addCardsToHand } from 'common/player'

export function handleInitDraw(
  state: IGameState,
  payload: { playerIdx: number; cardID: string },
): IGameState {
  const pending = { ...state.pending, [payload.playerIdx]: payload.cardID }

  if (Object.keys(pending).length < state.players.length) {
    return { ...state, phase: 'initDraw', pending }
  }

  // All players have submitted — move kept cards to hand, pass chosen card to next player
  const initDrawCards = state.initDrawCards ?? {}
  let players = [...state.players]

  Object.entries(pending).forEach(([idxStr, cardID]) => {
    const idx = parseInt(idxStr, 10)
    const nextIdx = (idx + 1) % players.length
    const cards = initDrawCards[idx] ?? []
    const given = cards.find(c => c.id === cardID)
    const kept = cards.filter(c => c.id !== cardID)
    if (given) players[nextIdx] = addCardsToHand(players[nextIdx], [given])
    players[idx] = addCardsToHand(players[idx], kept)
  })

  return { ...state, players, pending: {}, initDrawCards: {}, phase: 'action' }
}
