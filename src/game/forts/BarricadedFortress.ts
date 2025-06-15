import { Fort } from '../Fort'

export class BarricadedFortress extends Fort {
  constructor() {
    super({
      id: 'barricadedFortress',
      name: 'Starting Fort',
      type: 'fort',
      gridSpec: [
        [1, 1, 'B'],
        [1, 2, '.'],
        [3, 0, '.'],
        [3, 3, '.'],
      ],
      slots: 3,
      description:
        'Whenever an opponent attacks this fort and is done rolling, you may reroll 1 of the dice.',
    })
  }
}
