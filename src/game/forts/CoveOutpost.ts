import { Fort } from '../Fort'

export class CoveOutpost extends Fort {
  constructor() {
    super({
      id: 'coveOutpost',
      name: 'Cove Outpost',
      type: 'fort',
      gridSpec: [
        [0, 0, '.'],
        [0, 1, '.'],
        [1, 0, 'W'],
        [2, 0, '.'],
      ],
      slots: 4,
      description:
        'Whenever an opponent attacks this fort, return 1 colonist from 1 of his ships.',
    })
  }
}
