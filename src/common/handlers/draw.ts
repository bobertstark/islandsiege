import IGameState from 'common/IGameState'
import { drawCards } from 'common/deck'
import { addCardsToHand } from 'common/player'

export function handleDraw(state: IGameState): IGameState {
  const deckState = {
    deck: state.deck,
    discard: state.discard,
    shuffleCount: state.shuffleCount,
  }
  const { cards, state: nextDeck } = drawCards(deckState, 3)
  const players = [...state.players]
  players[state.currentPlayerIndex] = addCardsToHand(
    players[state.currentPlayerIndex],
    cards,
  )
  return {
    ...state,
    players,
    deck: nextDeck.deck,
    discard: nextDeck.discard,
    shuffleCount: nextDeck.shuffleCount,
    phase: 'discard',
  }
}
