import { Building } from '../Building'

import { Fort } from '../Fort'
import { createMockBuildingCard, createMockFortCard } from '../__mocks__'

const mockBuildingCard = createMockBuildingCard()
// Test suite for Building class
describe('Building Class', () => {
  let building: Building

  beforeEach(() => {
    building = new Building(mockBuildingCard)
  })

  test('should initialize correctly', () => {
    expect(building.id).toBe(mockBuildingCard.id)
    expect(building.name).toBe(mockBuildingCard.name)
    expect(building.description).toBe(mockBuildingCard.description)
    expect(building.cost).toBe(mockBuildingCard.cost)
    expect(building.coins).toBe(mockBuildingCard.coins)
    expect(building.colonists).toBe(0)
    expect(building.repairColor).toBe(mockBuildingCard.repairColor)
    expect(building.effect).toBeUndefined()
  })

  test('should remove colonists correctly', () => {
    building.placeColonists(3)
    expect(building.colonists).toBe(3)
    expect(building.removeColonists(2)).toBe(true)
    expect(building.colonists).toBe(1)

    expect(building.removeColonists(2)).toBe(false)
    expect(building.colonists).toBe(1)
  })
  test('should destroy the building correctly', () => {
    const fort = new Fort(createMockFortCard())
    building.fort = fort
    expect(building.fort).toBe(fort)
    building.destroy()
    expect(building.fort).toBeUndefined()
  })
})
