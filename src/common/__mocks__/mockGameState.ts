import IGameState from 'common/IGameState'
import { createPlayer } from 'common/player'
import { createDeck } from 'common/deck'

export const mockGameState = (
  overrides: Partial<IGameState> = {},
): IGameState => {
  const deckState = createDeck()
  return {
    players: [
      createPlayer('0', 'Francis Drake'),
      createPlayer('1', 'Barbarossa'),
    ],
    playerCount: 2,
    currentPlayerIndex: 0,
    deck: deckState.deck,
    discard: deckState.discard,
    shuffleCount: deckState.shuffleCount,
    phase: 'initGame',
    winningPlayerIndex: undefined,
    pending: {},
    shipLocations: {},
    shellReserve: { black: 5, white: 5, gray: 5 },
    attackIsOpenWater: false,
    attackRoll: ['B', 'B', 'B'],
    attackRerollsRemaining: 1,
    attackValueCounts: { B: 3, W: 0, G: 0, T: 0, L: 0 },
    rngSeed: 0,
    ...overrides,
  }
}
