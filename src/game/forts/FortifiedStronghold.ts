import { Fort } from '../Fort'

export class FortifiedStronghold extends Fort {
  constructor() {
    super({
      id: 'fortifiedStronghold',
      name: 'Fortified Stronghold',
      type: 'fort',
      gridSpec: [
        [1, 0, 'G'],
        [1, 1, '.'],
        [1, 2, '.'],
        [2, 0, '.'],
      ],
      slots: 3,
      description:
        'Whenever an opponent attacks this fort, he cannot reroll [B] results.',
    })
  }
}
