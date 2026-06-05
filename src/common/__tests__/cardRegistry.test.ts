import {
  ALL_CARDS,
  createFortById,
  createBuildingById,
  createShipById,
} from '../cardRegistry'

describe('cardRegistry', () => {
  it('normalizes a fort from card data', () => {
    const fort = createFortById('spyOutpost')
    expect(fort.type).toBe('fort')
    expect(fort.name).toBe('Spy Outpost')
    expect(fort.slots).toBe(4)
    expect(fort.grid).toHaveLength(4)
  })

  it('normalizes a building', () => {
    const building = createBuildingById('academy')
    expect(building.type).toBe('building')
    expect(building.cost).toBe(2)
    expect(building.coins).toBe(2)
    expect(building.repair).toEqual(['black'])
  })

  it('normalizes a ship', () => {
    const ship = createShipById('dominica')
    expect(ship.type).toBe('ship')
    expect(ship.cost).toBe(4)
    expect(ship.coins).toBe(5)
  })

  it('can build every card in the data set', () => {
    for (const card of ALL_CARDS) {
      if (card.type === 'fort')
        expect(() => createFortById(card.id)).not.toThrow()
      if (card.type === 'building')
        expect(() => createBuildingById(card.id)).not.toThrow()
      if (card.type === 'ship')
        expect(() => createShipById(card.id)).not.toThrow()
    }
  })

  it('throws on an unknown id', () => {
    expect(() => createFortById('nope')).toThrow('Unknown card id')
  })
})
