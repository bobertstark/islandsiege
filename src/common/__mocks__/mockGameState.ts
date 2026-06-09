import IGameState from '../IGameState'
import { ILogEntry } from '../ILog'
import { createPlayer } from '../player'
import { createDeck } from '../deck'

export const mockGameState = (
  overrides: Partial<IGameState> = {},
): IGameState => {
  const deckState = createDeck()
  return {
    players: [
      createPlayer('player-0', 'Francis Drake'),
      createPlayer('player-1', 'Barbarossa'),
    ],
    playerCount: 2,
    waitingPlayers: [],
    creatorId: 'player-0',
    readyPlayers: [],
    currentPlayerIndex: 0,
    deck: deckState.deck,
    discard: deckState.discard,
    shuffleCount: deckState.shuffleCount,
    drawnCards: [],
    phase: 'initGame',
    winningPlayerIndex: undefined,
    pending: {},
    shipLocations: {},
    shellReserve: { black: 5, white: 5, gray: 5 },
    attackIsOpenWater: false,
    attackRoll: ['B', 'B', 'B'],
    attackRerollsRemaining: 1,
    diceBank: { B: 3, W: 0, G: 0, T: 0, L: 0 },
    rngSeed: 0,
    log: [] as ILogEntry[],
    ...overrides,
  }
}
