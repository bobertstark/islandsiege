import { Fort } from '../Fort'

export class BracedStronghold extends Fort {
  constructor() {
    super({
      id: 'bracedStronghold',
      name: 'Braced Outpost',
      type: 'fort',
      gridSpec: [
        [1, 0, 'G'],
        [1, 2, '.'],
        [2, 0, '.'],
        [2, 2, '.'],
      ],
      slots: 4,
      description:
        'Whenever an opponent attacks this fort, he cannot reroll [L] results.',
    })
  }
}
