import { Fort } from '../Fort'

export class GuardedFortress extends Fort {
  constructor() {
    super({
      id: 'guardedFortress',
      name: 'Guarded Fortress',
      type: 'fort',
      gridSpec: [
        [1, 1, 'B'],
        [2, 0, '.'],
        [2, 1, '.'],
        [2, 2, '.'],
      ],
      slots: 4,
      description:
        'During a Second Wave attack on this fort, you choose which cubes are destroyed.',
    })
  }
}
