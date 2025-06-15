import { Deck } from '../Deck'
import { Card } from '../../types'

describe('Deck', () => {
  let deck: Deck

  beforeEach(() => {
    deck = new Deck()
  })

  it('initializes', () => {
    expect(deck.remaining).toBe(36)
    // by default excludes 'startingFort'
    expect(deck.includes('startingFort')).toBe(false)

    deck = new Deck([]) // no excluding this time
    expect(deck.includes('startingFort')).toBe(true)
  })

  it('draws the expected number of cards', () => {
    const hand = deck.draw(3)
    expect(hand).toHaveLength(3)
    expect(deck.remaining).toBe(33)
  })

  it('adds cards to discard pile', () => {
    const hand = deck.draw(2)
    deck.discard(hand)
    const discards = deck.getDiscardPile()
    expect(discards).toEqual(expect.arrayContaining(hand))
  })

  it('reshuffles discard pile into draw pile', () => {
    const hand = deck.draw(4)
    deck.discard(hand)

    expect(deck.getDiscardPile()).toHaveLength(4)
    const drawBefore = deck.remaining

    deck.reshuffleDiscards()

    expect(deck.getDiscardPile()).toHaveLength(0)
    expect(deck.remaining).toBe(drawBefore + 4)
  })

  it('automatically reshuffles when not enough to draw', () => {
    expect(deck.shuffles).toBe(1)
    const hand = deck.draw(30)
    deck.discard(hand)
    deck.draw(7)
    expect(deck.remaining).toBe(29)
    expect(deck.shuffles).toBe(2)
  })

  it('throws error if attempting to draw more cards than exist', () => {
    expect(() => deck.draw(37)).toThrow('No cards left to draw')
  })

  it('searches and extracts cards', () => {
    expect(deck.includes('victory')).toBe(true)
    let card = deck.extract('victory')
    expect(card).toHaveProperty('name', 'Victory')
    // once extract is called, the card is removed
    deck.discard([card])
    expect(deck.includes('victory')).toBe(false)
    expect(deck.includes('victory', true)).toBe(true)

    expect(deck.includes('argg matey')).toBe(false)
    expect(() => deck.extract('argg matey')).toThrow(
      'Card with id "argg matey" not found',
    )
  })
})
