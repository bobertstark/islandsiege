import ICard from './ICard'
import { ALL_CARDS } from './cardRegistry'

// All deck operations are pure. Shuffling is non-deterministic for now;
// TODO: add a seeded RNG.
interface DeckFields {
  deck: ICard[] // draw pile
  discard: ICard[]
  shuffleCount: number
}

export type DeckState = Pick<DeckFields, 'deck' | 'discard' | 'shuffleCount'>

const DEFAULT_EXCLUDE = ['startingFort']

// Drops excluded ids (the starting fort by default).
export function loadCards(exclude: string[] = DEFAULT_EXCLUDE): ICard[] {
  return ALL_CARDS.filter(card => !exclude.includes(card.id))
}

// Fisher–Yates
export function shuffle<T>(cards: T[]): T[] {
  const out = [...cards]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function createDeck(exclude: string[] = DEFAULT_EXCLUDE): DeckState {
  return {
    deck: shuffle(loadCards(exclude)),
    discard: [],
    shuffleCount: 1,
  }
}

export function reshuffleDiscards(state: DeckState): DeckState {
  return {
    deck: [...state.deck, ...shuffle(state.discard)],
    discard: [],
    shuffleCount: state.shuffleCount + 1,
  }
}

// Auto-reshuffles the discard pile in if the draw pile empties mid-draw.
export function drawCards(
  state: DeckState,
  count: number = 1,
): { cards: ICard[]; state: DeckState } {
  let current = state
  const drawn: ICard[] = []

  for (let i = 0; i < count; i++) {
    if (current.deck.length <= 0) {
      current = reshuffleDiscards(current)
    }
    const [card, ...rest] = current.deck
    if (!card) {
      throw new Error('No cards left to draw')
    }
    current = { ...current, deck: rest }
    drawn.push(card)
  }

  return { cards: drawn, state: current }
}

export function discardCards(state: DeckState, cards: ICard[]): DeckState {
  return { ...state, discard: [...state.discard, ...cards] }
}

// optionally also checks the discard pile
export function deckIncludes(
  state: DeckState,
  cardId: string,
  includeDiscards: boolean = false,
): boolean {
  return (
    state.deck.some(card => card.id === cardId) ||
    (includeDiscards && state.discard.some(card => card.id === cardId))
  )
}

// Searches the draw pile, then the discard pile if includeDiscards. Throws if
// not found.
export function extractCard(
  state: DeckState,
  cardID: string,
  includeDiscards: boolean = false,
): { card: ICard; state: DeckState } {
  const drawIdx = state.deck.findIndex(card => card.id === cardID)
  if (drawIdx !== -1) {
    return {
      card: state.deck[drawIdx],
      state: {
        ...state,
        deck: [
          ...state.deck.slice(0, drawIdx),
          ...state.deck.slice(drawIdx + 1),
        ],
      },
    }
  }

  if (includeDiscards) {
    const discardIdx = state.discard.findIndex(card => card.id === cardID)
    if (discardIdx !== -1) {
      return {
        card: state.discard[discardIdx],
        state: {
          ...state,
          discard: [
            ...state.discard.slice(0, discardIdx),
            ...state.discard.slice(discardIdx + 1),
          ],
        },
      }
    }
  }

  throw new Error(
    `Card with id "${cardID}" not found${includeDiscards ? '' : ' in draw pile'}`,
  )
}
