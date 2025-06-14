import type { CubeColor } from '../../common/colors'
import type { BuildingCard } from '../Card'

export const createMockBuildingCard = (
  overrides: Partial<BuildingCard> = {},
): BuildingCard => {
  return {
    id: 'testBuilding',
    name: 'Test Building',
    type: 'building',
    description: 'Testing',
    cost: 2,
    coins: 3,
    repairColor: 'black' as CubeColor,
    ...overrides,
  }
}
