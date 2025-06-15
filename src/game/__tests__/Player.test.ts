import { Player } from '../Player'
import { Fort } from '../Fort'
import { createMockFortCard } from 'game/__mocks__'

describe('createPlayer', () => {
  let p1: Player
  beforeEach(() => {
    p1 = new Player('Jack Sparrow', 1)
  })
  it('creates a player with default values', () => {
    expect(p1.id).toBe('p1')
    expect(p1.name).toBe('Jack Sparrow')
    expect(p1.coins).toBe(0)
    expect(p1.hand).toEqual([])
    expect(p1.buildings).toEqual([])
    expect(p1.forts).toEqual([])
    expect(p1.ships).toEqual([])
    expect(p1.colonists).toBe(9)
    expect(p1.cubes).toEqual({ black: 0, gray: 0, white: 0 })
    expect(p1.attack_dice).toBe(2)
    expect(p1.rerolls).toBe(1)
  })
  it('respects overrides', () => {
    const p2 = new Player('Blackbeard', 2, {
      coins: 3,
      cubes: { black: 2 },
    })
    expect(p2.id).toBe('p2')
    expect(p2.coins).toBe(3)
    expect(p2.cubes).toEqual({ black: 2, gray: 0, white: 0 })
  })
  it('contains forts and populates them', () => {
    const fort1 = new Fort(createMockFortCard())
    const fort2 = new Fort(createMockFortCard({ id: 'fort2' }))
    p1.addFort(fort1)
    p1.addFort(fort2)
    expect(p1.colonists).toBe(9)
    p1.populateForts()
    expect(p1.colonists).toBe(7)
    p1.colonists = 1
    expect(fort1.colonists).toBe(1)
    expect(fort2.colonists).toBe(1)
    p1.populateForts()
    expect(p1.colonists).toBe(0)
    expect(fort1.colonists).toBe(2)
    expect(fort2.colonists).toBe(1)
  })
  // it('stores cards in hand and can remove them', () => {
  // })
})
