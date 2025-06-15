import { Fort } from '../Fort'
import type { FortGridCube } from '../FortGrid'
import { createMockFortCard, createMockBuildingCard } from '../__mocks__'
import { Building } from '../Building'

const mockFortCard = createMockFortCard()

describe('Fort', () => {
  let fort: Fort

  beforeEach(() => {
    fort = new Fort(mockFortCard)
  })

  it('initializes correctly', () => {
    expect(fort.id).toBe('testFort')
    expect(fort.type).toBe('fort')
    expect(fort.name).toBe('Test Fort')
    expect(fort.description).toBe('Testing')
    expect(fort.grid.cubeInfo).toHaveLength(4)
    let cell = fort.grid.cellAt(0, 0)
    expect(cell.type).toBe('cube')
    expect((cell as FortGridCube).color).toBe('black')
    expect(fort.slots).toBe(3)
    expect(fort.openSlots).toBe(3)
    expect(fort.usedSlots).toBe(0)
    expect(fort.buildings).toHaveLength(0)
  })

  it('builds on empty cells', () => {
    let cell = fort.grid.cellAt(0, 1)
    expect((cell as FortGridCube).color).toBeNull()
    fort.grid.buildSpec([[0, 1, 'B']])
    cell = fort.grid.cellAt(0, 1)
    expect((cell as FortGridCube).color).toBe('black')
  })

  it('places and removes colonists correctly', () => {
    expect(fort.placeColonists()).toBe(true)
    expect(fort.usedSlots).toBe(1)
    expect(fort.openSlots).toBe(2)

    expect(fort.removeColonists()).toBe(true)
    expect(fort.usedSlots).toBe(0)
    expect(fort.openSlots).toBe(3)
  })

  it('does not place or remove colonists beyond slot limit', () => {
    expect(fort.placeColonists(3)).toBe(true)
    expect(fort.usedSlots).toBe(3)
    expect(fort.placeColonists()).toBe(false)
    expect(fort.usedSlots).toBe(3)
    expect(fort.openSlots).toBe(0)

    expect(fort.removeColonists(4)).toBe(false)
    expect(fort.usedSlots).toBe(3)
  })

  it('adds and repairs building', () => {
    const fort = new Fort(mockFortCard)
    const building = new Building(createMockBuildingCard())
    expect(building.repairColor).toBe('black')
    let cell = fort.grid.cellAt(0, 1)
    expect((cell as FortGridCube).color).toBeNull()

    fort.placeColonists(2)
    fort.addBuilding(building, [0, 1])
    expect(fort.buildings).toContain(building)
    cell = fort.grid.cellAt(0, 1)
    expect((cell as FortGridCube).color).toBe('black')
  })

  it('contains multiple buildings, if can build', () => {
    fort.placeColonists(2)
    const b1 = new Building(createMockBuildingCard())
    fort.addBuilding(b1)
    // ensure colonists have moved to building
    expect(fort.colonists).toBe(2)
    expect(fort.usedSlots).toBe(0)
    expect(fort.openSlots).toBe(3)
    const b2 = new Building(createMockBuildingCard({ id: 'test2', cost: 1 }))
    // if not enough colonists are present, complain
    expect(() => fort.addBuilding(b2)).toThrow('Attempting to build')
    expect(fort.buildings).toHaveLength(1)
    fort.placeColonists(2)
    fort.addBuilding(b2)
    expect(fort.buildings).toHaveLength(2)
    expect(fort.usedSlots).toBe(1)
    expect(fort.colonists).toBe(4)
  })
})
