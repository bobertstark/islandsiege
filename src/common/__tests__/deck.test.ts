import {
  createDeck,
  drawCards,
  discardCards,
  reshuffleDiscards,
  deckIncludes,
  extractCard,
  shuffle,
  DeckState,
} from '../deck'
import { createRng } from '../rng'

describe('deck', () => {
  let deck: DeckState

  beforeEach(() => {
    deck = createDeck()
  })

  it('initializes', () => {
    expect(deck.deck).toHaveLength(36)
    // by default excludes 'startingFort'
    expect(deckIncludes(deck, 'startingFort')).toBe(false)

    const full = createDeck([]) // no excluding this time
    expect(deckIncludes(full, 'startingFort')).toBe(true)
  })

  it('draws the expected number of cards', () => {
    const { cards, state } = drawCards(deck, 3)
    expect(cards).toHaveLength(3)
    expect(state.deck).toHaveLength(33)
  })

  it('adds cards to discard pile', () => {
    const { cards, state } = drawCards(deck, 2)
    const next = discardCards(state, cards)
    expect(next.discard).toEqual(expect.arrayContaining(cards))
  })

  it('reshuffles discard pile into draw pile', () => {
    const drawn = drawCards(deck, 4)
    const discarded = discardCards(drawn.state, drawn.cards)

    expect(discarded.discard).toHaveLength(4)
    const drawBefore = discarded.deck.length

    const reshuffled = reshuffleDiscards(discarded)

    expect(reshuffled.discard).toHaveLength(0)
    expect(reshuffled.deck).toHaveLength(drawBefore + 4)
  })

  it('automatically reshuffles when not enough to draw', () => {
    expect(deck.shuffleCount).toBe(1)
    const drawn = drawCards(deck, 30)
    const discarded = discardCards(drawn.state, drawn.cards)
    const { state } = drawCards(discarded, 7)
    expect(state.deck).toHaveLength(29)
    expect(state.shuffleCount).toBe(2)
  })

  it('throws when drawing more than exist', () => {
    expect(() => drawCards(deck, 37)).toThrow('No cards left to draw')
  })

  it('shuffle with fixed rng produces deterministic order', () => {
    const cards = [1, 2, 3, 4, 5]
    const a = shuffle(cards, createRng(7).next)
    const b = shuffle(cards, createRng(7).next)
    expect(a).toEqual(b)
  })

  it('createDeck with fixed rng produces deterministic deck order', () => {
    const rngA = createRng(123)
    const rngB = createRng(123)
    const a = createDeck(undefined, rngA.next.bind(rngA))
    const b = createDeck(undefined, rngB.next.bind(rngB))
    expect(a.deck.map(c => c.id)).toEqual(b.deck.map(c => c.id))
  })

  it('searches and extracts cards', () => {
    expect(deckIncludes(deck, 'victory')).toBe(true)
    const extracted = extractCard(deck, 'victory')
    expect(extracted.card).toHaveProperty('name', 'Victory')
    // once extract is called, the card is removed
    const afterDiscard = discardCards(extracted.state, [extracted.card])
    expect(deckIncludes(afterDiscard, 'victory')).toBe(false)
    expect(deckIncludes(afterDiscard, 'victory', true)).toBe(true)

    expect(deckIncludes(deck, 'argg matey')).toBe(false)
    expect(() => extractCard(deck, 'argg matey')).toThrow(
      'Card with id "argg matey" not found',
    )
  })
})
