import IGameState from 'common/IGameState'
import { addCardsToHand } from 'common/player'

export function handleDrawPick(
  state: IGameState,
  payload: { cardID: string; targetPlayerIndex?: number },
): IGameState {
  const discarded = state.drawnCards.find(c => c.id === payload.cardID)
  if (!discarded) throw new Error(`Card ${payload.cardID} not in drawnCards`)

  const kept = state.drawnCards.filter(c => c.id !== payload.cardID)
  let players = [...state.players]

  players[state.currentPlayerIndex] = addCardsToHand(
    players[state.currentPlayerIndex],
    kept,
  )

  let discard = state.discard
  if (payload.targetPlayerIndex !== undefined) {
    players[payload.targetPlayerIndex] = addCardsToHand(
      players[payload.targetPlayerIndex],
      [discarded],
    )
  } else {
    discard = [...state.discard, discarded]
  }

  return { ...state, players, discard, drawnCards: [], phase: 'endTurn' }
}
