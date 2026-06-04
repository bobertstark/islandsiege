import IGameState from 'common/IGameState'
import { createDeck, drawCards } from 'common/deck'
import { createPlayer, addFort, addCardsToHand } from 'common/player'
import { createFortById } from 'common/cardRegistry'
import { createRng, generateSeed } from 'common/rng'

export function handleInitGame(
  state: IGameState,
  payload: { playerNames: string[]; playerColors: string[]; seed?: number },
): IGameState {
  const { playerNames, playerColors } = payload
  const rng = createRng(payload.seed ?? generateSeed())
  let deckState = createDeck(undefined, rng.next.bind(rng))
  const currentPlayerIndex = Math.floor(rng.next() * playerNames.length)

  const players = playerNames.map((name, idx) => {
    const base = createPlayer(name, idx + 1, { color: playerColors[idx] })
    const fort = createFortById('startingFort')
    const withFort = addFort({ ...base, shells: { black: 1, white: 1 } }, fort)
    const { cards, state: next } = drawCards(deckState, 3, rng.next.bind(rng))
    deckState = next
    return addCardsToHand(withFort, cards)
  })

  return {
    ...state,
    players,
    deck: deckState.deck,
    discard: deckState.discard,
    shuffleCount: deckState.shuffleCount,
    currentPlayerIndex,
    shellReserve: { black: 5, white: 5, gray: 5 },
    phase: 'initDiscard',
    rngSeed: rng.seed(),
  }
}
