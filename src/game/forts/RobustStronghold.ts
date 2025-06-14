import { Fort } from '../Fort'

export class RobustStronghold extends Fort {
  constructor() {
    super({
      id: 'robustStronghold',
      name: 'Robust Stronghold',
      type: 'fort',
      gridSpec: [
        [1, 1, 'G'],
        [1, 2, '.'],
        [2, 1, '.'],
        [2, 2, '.'],
      ],
      slots: 4,
      description: 'Whenever you build a building here, gain 1 gold.',
    })
  }
}
