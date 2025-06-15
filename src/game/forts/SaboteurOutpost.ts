import { Fort } from '../Fort'

export class SaboteurOutpost extends Fort {
  constructor() {
    super({
      id: 'saboteurOutpost',
      name: 'Saboteur Outpost',
      type: 'fort',
      gridSpec: [
        [0, 2, '.'],
        [0, 3, 'W'],
        [1, 0, '.'],
        [2, 0, '.'],
      ],
      slots: 3,
      description:
        'Whenever an opponent attacks this fort, destroy 1 cube from his supply.',
    })
  }
}
