import {
  createFort,
  placeColonists,
  removeColonists,
  addBuilding,
  buildCubes,
  fortColonists,
  FortData,
} from '../fort'
import { createBuilding, BuildingData } from '../building'
import { cellAt, shellInfo, FortGridShell } from '../fortGrid'

const fortData: FortData = {
  id: 'testFort',
  name: 'Test Fort',
  description: 'Testing',
  gridSpec: [
    [0, 0, 'B'],
    [0, 1, '.'],
    [2, 2, 'W'],
    [3, 3, 'G'],
  ],
  slots: 3,
}

const buildingData: BuildingData = {
  id: 'testBuilding',
  name: 'Test Building',
  description: 'Testing',
  cost: 2,
  coins: 3,
  repairColor: 'black',
}

describe('fort', () => {
  it('initializes', () => {
    const fort = createFort(fortData)
    expect(fort.id).toBe('testFort')
    expect(fort.type).toBe('fort')
    expect(fort.name).toBe('Test Fort')
    expect(fort.description).toBe('Testing')
    expect(shellInfo(fort.grid)).toHaveLength(4)
    const cell = cellAt(fort.grid, [0, 0])
    expect(cell.type).toBe('shell')
    expect((cell as FortGridShell).color).toBe('black')
    expect(fort.slots).toBe(3)
    expect(fort.openSlots).toBe(3)
    expect(fort.usedSlots).toBe(0)
    expect(fort.buildings).toHaveLength(0)
  })

  it('builds on empty cells', () => {
    let fort = createFort(fortData)
    expect((cellAt(fort.grid, [0, 1]) as FortGridShell).color).toBeNull()
    fort = buildCubes(fort, [[0, 1, 'B']])
    expect((cellAt(fort.grid, [0, 1]) as FortGridShell).color).toBe('black')
  })

  it('places and removes colonists', () => {
    let fort = createFort(fortData)
    let placed = placeColonists(fort)
    expect(placed.placed).toBe(true)
    fort = placed.fort
    expect(fort.usedSlots).toBe(1)
    expect(fort.openSlots).toBe(2)

    const removed = removeColonists(fort)
    expect(removed.removed).toBe(true)
    fort = removed.fort
    expect(fort.usedSlots).toBe(0)
    expect(fort.openSlots).toBe(3)
  })

  it('does not place or remove colonists beyond slot limit', () => {
    let fort = createFort(fortData)
    fort = placeColonists(fort, 3).fort
    expect(fort.usedSlots).toBe(3)
    expect(placeColonists(fort).placed).toBe(false)
    expect(fort.usedSlots).toBe(3)
    expect(fort.openSlots).toBe(0)

    expect(removeColonists(fort, 4).removed).toBe(false)
    expect(fort.usedSlots).toBe(3)
  })

  it('adds and repairs a building', () => {
    let fort = createFort(fortData)
    const building = createBuilding(buildingData)
    expect(building.repairColor).toBe('black')
    expect((cellAt(fort.grid, [0, 1]) as FortGridShell).color).toBeNull()

    fort = placeColonists(fort, 2).fort
    fort = addBuilding(fort, building, [0, 1])
    expect(fort.buildings.map(b => b.id)).toContain(building.id)
    expect((cellAt(fort.grid, [0, 1]) as FortGridShell).color).toBe('black')
  })

  it('contains multiple buildings, if it can staff them', () => {
    let fort = createFort(fortData)
    fort = placeColonists(fort, 2).fort
    fort = addBuilding(fort, createBuilding(buildingData))
    // colonists moved from slots into the building
    expect(fortColonists(fort)).toBe(2)
    expect(fort.usedSlots).toBe(0)
    expect(fort.openSlots).toBe(3)

    const b2 = createBuilding({ ...buildingData, id: 'test2', cost: 1 })
    // not enough staffed slots → complain
    expect(() => addBuilding(fort, b2)).toThrow('Attempting to build')
    expect(fort.buildings).toHaveLength(1)

    fort = placeColonists(fort, 2).fort
    fort = addBuilding(fort, b2)
    expect(fort.buildings).toHaveLength(2)
    expect(fort.usedSlots).toBe(1)
    expect(fortColonists(fort)).toBe(4)
  })
})
