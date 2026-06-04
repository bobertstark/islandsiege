import IGameState from 'common/IGameState'
import { removeCardInHand, addCardsToHand } from 'common/player'

export function handleDiscard(
  state: IGameState,
  payload: { targetPlayerIndex: number; cardID: string },
): IGameState {
  const players = [...state.players]
  const { player: fromPlayer, card } = removeCardInHand(
    players[state.currentPlayerIndex],
    payload.cardID,
  )
  players[state.currentPlayerIndex] = fromPlayer
  players[payload.targetPlayerIndex] = addCardsToHand(
    players[payload.targetPlayerIndex],
    [card],
  )
  return { ...state, players, phase: 'endTurn' }
}
