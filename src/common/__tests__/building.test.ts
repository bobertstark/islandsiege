import {
  createBuilding,
  placeColonists,
  removeColonists,
  BuildingData,
} from '../building'

const buildingData: BuildingData = {
  id: 'testBuilding',
  name: 'Test Building',
  description: 'Testing',
  cost: 2,
  coins: 3,
  repair: ['black'],
}

describe('building', () => {
  it('removes colonists and reports how many left', () => {
    let building = placeColonists(createBuilding(buildingData), 3)
    expect(building.colonists).toBe(3)

    let result = removeColonists(building, 2)
    expect(result.removed).toBe(2)
    building = result.building
    expect(building.colonists).toBe(1)

    // over-removal is a no-op
    result = removeColonists(building, 2)
    expect(result.removed).toBe(0)
    expect(result.building.colonists).toBe(1)
  })
})
