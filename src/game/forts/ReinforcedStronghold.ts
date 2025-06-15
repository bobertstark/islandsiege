import { Fort } from '../Fort'

export class ReinforcedStronghold extends Fort {
  constructor() {
    super({
      id: 'reinforcedStronghold',
      name: 'Reinforced Stronghold',
      type: 'fort',
      gridSpec: [
        [1, 0, '.'],
        [1, 1, 'G'],
        [1, 2, '.'],
        [2, 1, '.'],
      ],
      slots: 4,
      description:
        'Whenever an opponent attacks this fort, he cannot reroll [S] results.',
    })
  }
}
