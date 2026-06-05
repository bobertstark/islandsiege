import IGameState from 'common/IGameState'
import { createDeck, drawCards } from 'common/deck'
import { addFort, addCardsToHand } from 'common/player'
import { createFortById } from 'common/cardRegistry'
import { createRng } from 'common/rng'

export function handleStartGame(
  state: IGameState,
  payload?: { playerIdx: number },
): IGameState {
  if (payload !== undefined) {
    // Lobby not full yet — readying is not allowed
    if (state.players.length < state.playerCount) {
      return state
    }

    const readyPlayers = state.readyPlayers.includes(payload.playerIdx)
      ? state.readyPlayers
      : [...state.readyPlayers, payload.playerIdx]

    if (readyPlayers.length < state.players.length) {
      return { ...state, readyPlayers }
    }

    return dealAndStart({ ...state, readyPlayers })
  }

  return dealAndStart(state)
}

function dealAndStart(state: IGameState): IGameState {
  const rng = createRng(state.rngSeed)
  let deckState = createDeck(undefined, rng.next)
  const currentPlayerIndex = Math.floor(rng.next() * state.players.length)

  const players = state.players.map(player => {
    const fort = createFortById('startingFort')
    const withFort = addFort(
      { ...player, shells: { black: 1, white: 1 } },
      fort,
    )
    const { cards, state: next } = drawCards(deckState, 3, rng.next)
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
    readyPlayers: [],
    phase: 'initDraw',
    rngSeed: rng.seed(),
  }
}
