import { createPlayer, addFort, populateForts } from '../player'
import { createFortById } from '../cardRegistry'
import { fortColonists } from '../fort'

describe('player', () => {
  it('creates a player with default values', () => {
    const p = createPlayer('p1', 'Jack Sparrow')
    expect(p.id).toBe('p1')
    expect(p.name).toBe('Jack Sparrow')
    expect(p.coins).toBe(0)
    expect(p.hand).toEqual([])
    expect(p.forts).toEqual([])
    expect(p.ships).toEqual([])
    expect(p.colonists).toBe(9)
    expect(p.shells).toEqual({ black: 0, gray: 0, white: 0 })
    expect(p.attackDice).toBe(3)
    expect(p.diceRerolls).toBe(1)
  })

  it('respects overrides', () => {
    const p = createPlayer('p2', 'Blackbeard', {
      coins: 3,
      shells: { black: 2 },
    })
    expect(p.id).toBe('p2')
    expect(p.coins).toBe(3)
    expect(p.shells).toEqual({ black: 2, gray: 0, white: 0 })
  })

  it('contains forts and populates them', () => {
    let p = createPlayer('p1', 'Jack Sparrow')
    p = addFort(p, createFortById('spyOutpost'))
    p = addFort(p, createFortById('coveOutpost'))
    expect(p.colonists).toBe(9)

    p = populateForts(p)
    expect(p.colonists).toBe(7)

    p = { ...p, colonists: 1 }
    expect(fortColonists(p.forts[0])).toBe(1)
    expect(fortColonists(p.forts[1])).toBe(1)

    p = populateForts(p)
    expect(p.colonists).toBe(0)
    expect(fortColonists(p.forts[0])).toBe(2)
    expect(fortColonists(p.forts[1])).toBe(1)
  })
})
