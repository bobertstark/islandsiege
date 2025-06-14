import cardData from '../assets/cards.json'
import { Card, FortCard, BuildingCard, ShipCard } from './Card'

export class Deck {
  private drawPile: Card[]
  private discardPile: Card[] = []
  private shuffleCount: number = 0

  constructor(exclude: string[] = ['startingFort']) {
    const filtered = cardData.cards
      .filter(card => !exclude.includes(card.id))
      .map(this.assignCardType)
    this.drawPile = this.shuffle(filtered)
  }

  private assignCardType(card: any): Card {
    switch (card.type) {
      case 'fort':
        return card as FortCard
      case 'building':
        return card as BuildingCard
      case 'ship':
        return card as ShipCard
      default:
        throw new Error(`Unknown card type: ${card.type}`)
    }
  }

  private shuffle(cardData: Card[]): Card[] {
    const cards = [...cardData]
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[cards[i], cards[j]] = [cards[j], cards[i]]
    }
    this.shuffleCount++
    return cards
  }

  private drawOne(): Card {
    if (this.remaining <= 0) {
      this.reshuffleDiscards()
    }
    const card = this.drawPile.shift()
    // if no cards in drawPile or discardPile
    if (!card) {
      throw new Error('No cards left to draw')
    }
    return card
  }

  draw(count: number = 1): Card[] {
    return Array.from({ length: count }, () => this.drawOne())
  }

  discard(cards: Card[]): void {
    this.discardPile.push(...cards)
  }

  includes(cardId: string, includeDiscards: boolean = false): boolean {
    return (
      this.drawPile.some(card => card.id === cardId) ||
      (includeDiscards && this.discardPile.some(card => card.id === cardId))
    )
  }

  extract(cardID: string, includeDiscards: boolean = false): Card {
    let index = this.drawPile.findIndex(c => c.id === cardID)

    if (index !== -1) {
      return this.drawPile.splice(index, 1)[0]
    }

    if (includeDiscards) {
      index = this.discardPile.findIndex(c => c.id === cardID)
      if (index !== -1) {
        return this.discardPile.splice(index, 1)[0]
      }
    }

    throw new Error(
      `Card with id "${cardID}" not found${includeDiscards ? '' : ' in draw pile'}`,
    )
  }

  get remaining(): number {
    return this.drawPile.length
  }

  get shuffles(): number {
    return this.shuffleCount
  }

  getDiscardPile(): Card[] {
    return [...this.discardPile]
  }

  reshuffleDiscards(): void {
    this.drawPile.push(...this.shuffle(this.discardPile))
    this.discardPile = []
  }
}
