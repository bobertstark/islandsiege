import { createShip, addColonists, removeColonists, ShipData } from '../ship'

const shipData: ShipData = {
  id: 'testShip',
  name: 'Test Ship',
  description: 'Testing',
  cost: 2,
  coins: 1,
}

describe('ship', () => {
  it('adds and removes colonists', () => {
    let ship = addColonists(createShip(shipData), 2)
    expect(ship.colonists).toBe(2)
    ship = removeColonists(ship, 1)
    expect(ship.colonists).toBe(1)
  })
})
