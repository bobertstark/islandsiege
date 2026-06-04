import IGameState from 'common/IGameState'
import { drawCards } from 'common/deck'
import { createRng } from 'common/rng'

export function handleDraw(state: IGameState): IGameState {
  const deckState = {
    deck: state.deck,
    discard: state.discard,
    shuffleCount: state.shuffleCount,
  }
  const rng = createRng(state.rngSeed)
  const { cards, state: nextDeck } = drawCards(deckState, 3, rng.next.bind(rng))
  return {
    ...state,
    drawnCards: cards,
    deck: nextDeck.deck,
    discard: nextDeck.discard,
    shuffleCount: nextDeck.shuffleCount,
    phase: 'discard',
    rngSeed: rng.seed(),
  }
}
