import { Fort } from '../Fort'

export class SteepWalledStronghold extends Fort {
  constructor() {
    super({
      id: 'steepWalledStronghold',
      name: 'Steep-Walled Stronghold',
      type: 'fort',
      gridSpec: [
        [1, 0, '.'],
        [1, 1, 'G'],
        [1, 2, '.'],
        [1, 3, '.'],
      ],
      slots: 3,
      description:
        'Whenever an opponent attacks this fort and re-rolls, he must re-roll all the dice.',
    })
  }
}
