import type { FortCard } from '../Card'

export const createMockFortCard = (
  overrides: Partial<FortCard> = {},
): FortCard => {
  return {
    id: 'testFort',
    type: 'fort',
    name: 'Test Fort',
    description: 'Testing',
    gridSpec: [
      [0, 0, 'B'],
      [0, 1, '.'],
      [2, 2, 'W'],
      [3, 3, 'G'],
    ],
    slots: 3,
    ...overrides,
  }
}
