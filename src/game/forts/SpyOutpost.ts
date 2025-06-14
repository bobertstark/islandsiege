import { Fort } from '../Fort'

export class SpyOutpost extends Fort {
  constructor() {
    super({
      id: 'spyOutpost',
      name: 'Spy Outpost',
      type: 'fort',
      gridSpec: [
        [0, 3, '.'],
        [1, 3, '.'],
        [2, 0, '.'],
        [2, 1, 'W'],
      ],
      slots: 3,
      description:
        'Whenever an opponent attacks this fort and re-rolls, he must re-roll all the dice.',
    })
  }
}
